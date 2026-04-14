const express = require('express')
const router = express.Router()
const db = require('../config/database')

// GET all sales export orders
router.get('/', async (req, res) => {
  try {
    // First get all sales export orders
    const result = await db.query(`
      SELECT * FROM sales_export_orders ORDER BY id DESC
    `)
    
    // Then get items for each order
    const exportOrders = []
    for (const order of result.rows) {
      const itemsResult = await db.query(
        'SELECT * FROM sales_export_order_items WHERE sales_export_order_id = ?',
        [order.id]
      )
      exportOrders.push({
        ...order,
        items: itemsResult.rows
      })
    }
    
    res.json(exportOrders)
  } catch (error) {
    console.error('Error fetching sales export orders:', error)
    res.status(500).json({ message: 'Error fetching sales export orders', error: error.message })
  }
})

// GET sales export order by ID
router.get('/:id', async (req, res) => {
  try {
    const exportOrderResult = await db.query('SELECT * FROM sales_export_orders WHERE id = ?', [req.params.id])
    if (exportOrderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Sales export order not found' })
    }

    const itemsResult = await db.query('SELECT * FROM sales_export_order_items WHERE sales_export_order_id = ?', [req.params.id])

    const exportOrder = {
      ...exportOrderResult.rows[0],
      items: itemsResult.rows
    }

    res.json(exportOrder)
  } catch (error) {
    console.error('Error fetching sales export order:', error)
    res.status(500).json({ message: 'Error fetching sales export order record' })
  }
})

// POST create new sales export order
router.post('/', async (req, res) => {
  try {
    const { formData, items } = req.body

    // Validation
    if (!formData.date || !formData.billNo || !items || items.length === 0) {
      return res.status(400).json({ message: 'Date, bill number, and at least one item are required' })
    }

    if (items.some(item => !item.container_no || item.qty <= 0)) {
      return res.status(400).json({ message: 'All items must have container number and positive quantity' })
    }

    // Calculate totals
    const totalQty = items.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0)
    const totalUsdAmt = items.reduce((sum, item) => sum + (parseFloat(item.usd_amt) || 0), 0)
    const totalInrAmt = items.reduce((sum, item) => sum + (parseFloat(item.inr_amt) || 0), 0)

    // Insert sales export order
    const exportOrderResult = await db.run(`
      INSERT INTO sales_export_orders (bill_no, date, order_no_dt, dis_port, dest_country, final_destin, sender,
                                      net_wt, advance, exporter, consignee, buyer_other, other_ref, pre_carriage,
                                      vessel_flt_no, consigned_to, gross_wt, sign, place_of_rcpt, loading_port,
                                      origin_country, delivery_terms, payment_terms, pur_transport, driver,
                                      lorry_no, remarks, total_qty, total_usd_amt, total_inr_amt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [formData.billNo, formData.date, formData.orderNoDt, formData.disPort, formData.destCountry,
         formData.finalDestin, formData.sender, formData.netWt, formData.advance, formData.exporter,
         formData.consignee, formData.buyerOther, formData.otherRef, formData.preCarriage,
         formData.vesselFltNo, formData.consignedTo, formData.grossWt, formData.sign,
         formData.placeOfRcpt, formData.loadingPort, formData.originCountry, formData.deliveryTerms,
         formData.paymentTerms, formData.purTransport, formData.driver, formData.lorryNo,
         formData.remarks, totalQty, totalUsdAmt, totalInrAmt])

    const exportOrderId = exportOrderResult.lastID

    // Insert sales export order items
    for (const item of items) {
      await db.run(`
        INSERT INTO sales_export_order_items (sales_export_order_id, container_no, kind_of_package, description,
                                             qty_in_kg, mfd_exp_dt, lot_no, qty, usd_rate, conv_rate, usd_amt, inr_amt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [exportOrderId, item.containerNo, item.kindOfPackage, item.description, item.qtyInKg,
           item.mfdExpDt, item.lotNo, item.qty, item.usdRate, item.convRate, item.usdAmt, item.inrAmt])
    }

    res.status(201).json({
      message: 'Sales export order saved successfully!',
      id: exportOrderId
    })
  } catch (error) {
    console.error('Error saving sales export order:', error)
    res.status(500).json({ message: 'Error saving sales export order', error: error.message })
  }
})

// PUT update sales export order
router.put('/:id', async (req, res) => {
  try {
    const { formData, items } = req.body
    const exportOrderId = req.params.id

    // Calculate totals
    const totalQty = items.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0)
    const totalUsdAmt = items.reduce((sum, item) => sum + (parseFloat(item.usd_amt) || 0), 0)
    const totalInrAmt = items.reduce((sum, item) => sum + (parseFloat(item.inr_amt) || 0), 0)

    // Update sales export order
    await db.run(`
      UPDATE sales_export_orders SET bill_no = ?, date = ?, order_no_dt = ?, dis_port = ?, dest_country = ?,
                                     final_destin = ?, sender = ?, net_wt = ?, advance = ?, exporter = ?,
                                     consignee = ?, buyer_other = ?, other_ref = ?, pre_carriage = ?,
                                     vessel_flt_no = ?, consigned_to = ?, gross_wt = ?, sign = ?,
                                     place_of_rcpt = ?, loading_port = ?, origin_country = ?,
                                     delivery_terms = ?, payment_terms = ?, pur_transport = ?, driver = ?,
                                     lorry_no = ?, remarks = ?, total_qty = ?, total_usd_amt = ?, total_inr_amt = ?,
                                     updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [formData.billNo, formData.date, formData.orderNoDt, formData.disPort, formData.destCountry,
         formData.finalDestin, formData.sender, formData.netWt, formData.advance, formData.exporter,
         formData.consignee, formData.buyerOther, formData.otherRef, formData.preCarriage,
         formData.vesselFltNo, formData.consignedTo, formData.grossWt, formData.sign,
         formData.placeOfRcpt, formData.loadingPort, formData.originCountry, formData.deliveryTerms,
         formData.paymentTerms, formData.purTransport, formData.driver, formData.lorryNo,
         formData.remarks, totalQty, totalUsdAmt, totalInrAmt, exportOrderId])

    // Delete existing items
    await db.run('DELETE FROM sales_export_order_items WHERE sales_export_order_id = ?', [exportOrderId])

    // Insert updated items
    for (const item of items) {
      await db.run(`
        INSERT INTO sales_export_order_items (sales_export_order_id, container_no, kind_of_package, description,
                                             qty_in_kg, mfd_exp_dt, lot_no, qty, usd_rate, conv_rate, usd_amt, inr_amt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [exportOrderId, item.containerNo, item.kindOfPackage, item.description, item.qtyInKg,
           item.mfdExpDt, item.lotNo, item.qty, item.usdRate, item.convRate, item.usdAmt, item.inrAmt])
    }

    res.json({ message: 'Sales export order updated successfully!' })
  } catch (error) {
    console.error('Error updating sales export order:', error)
    res.status(500).json({ message: 'Error updating sales export order' })
  }
})

// DELETE sales export order
router.delete('/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM sales_export_orders WHERE id = ?', [req.params.id])
    res.json({ message: 'Sales export order deleted successfully' })
  } catch (error) {
    console.error('Error deleting sales export order:', error)
    res.status(500).json({ message: 'Error deleting sales export order' })
  }
})

module.exports = router
