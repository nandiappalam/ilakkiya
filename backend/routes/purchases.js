const express = require('express')
const router = express.Router()
const db = require('../config/database')
const { createPurchaseLedgerEntries, deleteLedgerEntries } = require('../utils/ledgerHelper')

// GET all purchases
router.get('/', async (req, res) => {
  try {
    console.log('Fetching purchases...')
    const result = await db.query(`
      SELECT * FROM purchases ORDER BY created_at DESC
    `)
    console.log('Purchases fetched:', result.rows.length)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching purchases:', error.message)
    console.error('Error stack:', error.stack)
    res.status(500).json({ message: 'Error fetching purchases', error: error.message })
  }
})

// GET purchase by ID
router.get('/:id', async (req, res) => {
  try {
    const purchaseResult = await db.query('SELECT * FROM purchases WHERE id = ?', [req.params.id])
    if (purchaseResult.rows.length === 0) {
      return res.status(404).json({ message: 'Purchase not found' })
    }

    const itemsResult = await db.query('SELECT * FROM purchase_items WHERE purchase_id = ?', [req.params.id])

    const purchase = {
      ...purchaseResult.rows[0],
      items: itemsResult.rows
    }

    res.json(purchase)
  } catch (error) {
    console.error('Error fetching purchase:', error)
    res.status(500).json({ message: 'Error fetching purchase' })
  }
})

// POST create new purchase
router.post('/', async (req, res) => {
  try {
    const { formData, items, totals } = req.body

    // Validation
    if (!formData.date || !formData.supplier || !items || items.length === 0) {
      return res.status(400).json({ message: 'Date, supplier, and at least one item are required' })
    }

    if (items.some(item => !item.itemName || item.qty <= 0 || item.rate <= 0)) {
      return res.status(400).json({ message: 'All items must have a name, positive quantity, and positive rate' })
    }

    // Insert purchase
    console.log('Inserting purchase with data:', {
      s_no: formData.sno || 1,
      date: formData.date,
      supplier: formData.supplier,
      totalQty: totals.totalQty || 0
    })

    const insertValues = [
      parseInt(formData.sno) || 1, formData.date || new Date().toISOString().slice(0, 10), formData.invNo || '', formData.supplier || '', formData.payType || 'Credit',
      formData.invDate || null, formData.type || 'Urad', formData.address || '', formData.taxType || 'Exclusive',
      formData.godown || '', formData.remarks || '', parseFloat(totals.totalQty) || 0, parseFloat(totals.totalWeight) || 0,
      parseFloat(totals.totalAmount) || 0, parseFloat(totals.baseAmount) || 0, parseFloat(totals.discAmount) || 0, parseFloat(totals.taxAmount) || 0,
      parseFloat(totals.netAmount) || 0, parseFloat(totals.deductions?.autoWages) || 0, parseFloat(totals.deductions?.vatPercent) || 0,
      parseFloat(totals.deductions?.vat) || 0, parseFloat(totals.grandTotal) || 0
    ]
    console.log('Insert values:', insertValues)
    console.log('Insert values types:', insertValues.map(v => typeof v))

    const purchaseResult = await db.run(`
      INSERT INTO purchases (
        s_no, date, inv_no, supplier, pay_type, inv_date, type, address,
        tax_type, godown, remarks, total_qty, total_weight, total_amount,
        base_amount, disc_amount, tax_amount, net_amount, auto_wages,
        vat_percent, vat, grand_total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, insertValues)

    const purchaseId = purchaseResult.lastID
    console.log('Purchase inserted with ID:', purchaseId, 'Result:', purchaseResult)

    // Insert purchase items and create stock lots
    for (const item of items) {
      // Insert purchase item
      await db.run(`
        INSERT INTO purchase_items (
          purchase_id, item_name, lot_no, weight, qty, total_wt, rate, disc_percent, tax_percent, amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        purchaseId, item.itemName, item.lotNo || '', item.weight || 0, item.qty, item.totalWt || 0,
        item.rate, item.disc || 0, item.tax || 0, item.amount || 0
      ])
      
      // Auto-generate lot number if not provided
      let lotNo = item.lotNo
      if (!lotNo || lotNo === '') {
        // Generate lot number: ITEMCODE-YYYYMMDD-SEQ
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
        const itemCode = (item.itemName || 'ITEM').substring(0, 3).toUpperCase()
        
        // Get max lot number for this item
        const maxLotResult = await db.query(`
          SELECT lot_no FROM stock_lots 
          WHERE item_name = ? AND lot_no LIKE ?
          ORDER BY id DESC LIMIT 1
        `, [item.itemName, `${itemCode}-${today}%`])
        
        let seq = 1
        if (maxLotResult.rows.length > 0) {
          const lastLot = maxLotResult.rows[0].lot_no
          const lastSeq = parseInt(lastLot.split('-')[2] || '0')
          seq = lastSeq + 1
        }
        
        lotNo = `${itemCode}-${today}-${String(seq).padStart(4, '0')}`
      }
      
      // Get item_id from item_master
      let itemId = null
      try {
        const itemResult = await db.query('SELECT id FROM item_master WHERE item_name = ?', [item.itemName])
        if (itemResult.rows.length > 0) {
          itemId = itemResult.rows[0].id
        }
      } catch (e) {
        console.log('Item not found in master:', item.itemName)
      }
      
      // Insert into stock_lots table
      await db.run(`
        INSERT INTO stock_lots (item_id, item_name, lot_no, purchase_id, quantity, remaining_quantity, rate)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [itemId, item.itemName, lotNo, purchaseId, item.qty || 0, item.qty || 0, item.rate || 0])
      
    // Also insert into stock table for tracking
      await db.run(`
        INSERT INTO stock (item_name, lot_no, qty, weight, rate, amount, date, type, reference_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Purchase', ?)
      `, [item.itemName, lotNo, item.qty || 0, item.weight || 0, item.rate || 0, item.amount || 0, formData.date, purchaseId])
    }

    // Create ledger entries for the purchase
    try {
      await createPurchaseLedgerEntries({
        supplier: formData.supplier,
        date: formData.date,
        invNo: formData.invNo || '',
        purchaseId: purchaseId,
        baseAmount: parseFloat(totals.baseAmount) || 0,
        taxAmount: parseFloat(totals.taxAmount) || 0,
        discAmount: parseFloat(totals.discAmount) || 0,
        netAmount: parseFloat(totals.grandTotal) || 0
      })
      console.log('Ledger entries created for purchase:', purchaseId)
    } catch (ledgerError) {
      console.error('Error creating ledger entries:', ledgerError)
    }

    res.status(201).json({
      message: 'Purchase saved successfully!',
      id: purchaseId
    })
  } catch (error) {
    console.error('Error saving purchase:', error)
    res.status(500).json({ message: 'Error saving purchase', error: error.message })
  }
})

// PUT update purchase
router.put('/:id', async (req, res) => {
  try {
    const { formData, items, totals } = req.body
    const purchaseId = req.params.id

    // Update purchase
    await db.run(`
      UPDATE purchases SET
        s_no = ?, date = ?, inv_no = ?, supplier = ?, pay_type = ?,
        inv_date = ?, type = ?, address = ?, tax_type = ?, godown = ?,
        remarks = ?, total_qty = ?, total_weight = ?, total_amount = ?,
        base_amount = ?, disc_amount = ?, tax_amount = ?, net_amount = ?,
        auto_wages = ?, vat_percent = ?, vat = ?, grand_total = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      formData.sno, formData.date, formData.invNo, formData.supplier, formData.payType,
      formData.invDate, formData.type, formData.address, formData.taxType, formData.godown,
      formData.remarks, totals.totalQty, totals.totalWeight, totals.totalAmount,
      totals.baseAmount, totals.discAmount, totals.taxAmount, totals.netAmount,
      totals.deductions.autoWages, totals.deductions.vatPercent, totals.deductions.vat,
      totals.grandTotal, purchaseId
    ])

    // Delete existing items
    await db.run('DELETE FROM purchase_items WHERE purchase_id = ?', [purchaseId])

    // Insert updated items
    for (const item of items) {
      await db.run(`
        INSERT INTO purchase_items (
          purchase_id, item_name, lot_no, weight, qty, total_wt, rate, disc_percent, tax_percent, amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        purchaseId, item.itemName, item.lotNo || '', item.weight, item.qty, item.totalWt,
        item.rate, item.disc, item.tax, item.amount
      ])
    }

    res.json({ message: 'Purchase updated successfully!' })
  } catch (error) {
    console.error('Error updating purchase:', error)
    res.status(500).json({ message: 'Error updating purchase', error: error.message })
  }
})

// DELETE purchase
router.delete('/:id', async (req, res) => {
  try {
    const purchaseId = req.params.id
    
    // Check if any stock lots from this purchase have been used
    const lotCheck = await db.query(`
      SELECT * FROM stock_lots 
      WHERE purchase_id = ? AND remaining_quantity < quantity
    `, [purchaseId])
    
    if (lotCheck.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete purchase - stock from this lot has been used in sales or grinding. Please reverse those transactions first.' 
      })
    }
    
    // Also check if any flour_out items use lots from this purchase
    const flourCheck = await db.query(`
      SELECT fo.id, fo.s_no, fo.date, fo.papad_company
      FROM flour_out fo
      JOIN flour_out_items foi ON fo.id = foi.flour_out_id
      JOIN stock_lots sl ON foi.lot_no = sl.lot_no
      WHERE sl.purchase_id = ?
    `, [purchaseId])
    
    if (flourCheck.rows.length > 0) {
      return res.status(400).json({ 
        message: `Cannot delete purchase - lots have been used in Grind (Flour Out) records. Please delete Grind records first. Reference: ${flourCheck.rows[0]?.s_no || 'Multiple'}` 
      })
    }
    
    // Delete stock_lots entries first
    await db.run('DELETE FROM stock_lots WHERE purchase_id = ?', [purchaseId])
    
    // Delete ledger entries
    try {
      await deleteLedgerEntries(purchaseId)
    } catch (ledgerError) {
      console.error('Error deleting purchase ledger entries:', ledgerError)
    }
    
    // Delete purchase items
    await db.run('DELETE FROM purchase_items WHERE purchase_id = ?', [purchaseId])
    
    // Delete purchase
    await db.run('DELETE FROM purchases WHERE id = ?', [purchaseId])
    
    res.json({ message: 'Purchase deleted successfully' })
  } catch (error) {
    console.error('Error deleting purchase:', error)
    res.status(500).json({ message: 'Error deleting purchase', error: error.message })
  }
})

module.exports = router
