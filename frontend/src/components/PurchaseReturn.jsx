import React, { useState } from 'react';
import './PurchaseReturn.css';

// Import modular entry components
import { EntryTopFrame, EntryItemsTable, EntryTotalsRow, EntryBottomSummary, EntryActions, EntrySection } from './entry'

const PurchaseReturn = () => {
  const [formData, setFormData] = useState({
    sNo: 1,
    date: '',
    returnInvNo: '',
    supplier: '',
    payType: 'Credit',
    invDate: '',
    type: 'Urad',
    address: '',
    taxType: 'Exclusive',
    godown: '',
    remarks: ''
  })

  const [items, setItems] = useState([
    {
      id: 1,
      item_name: '',
      lot_no: '',
      weight: '',
      qty: '',
      total_wt: 0,
      rate: '',
      disc: '',
      tax: '',
      amount: 0
    }
  ])

  const [totals, setTotals] = useState({
    totalQty: 0,
    totalWeight: 0,
    totalAmount: 0,
    baseAmount: 0,
    discAmount: 0,
    taxAmount: 0,
    netAmount: 0,
    deductions: { autoWages: '', vat: '', vatPercent: '' },
    grandTotal: 0
  })

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleItemChange = (index, field, value) => {
    setItems(prevItems => {
      const updatedItems = [...prevItems];
      if (field === '__batch__' && typeof value === 'object') {
        updatedItems[index] = { ...updatedItems[index], ...value };
      } else {
        updatedItems[index] = { ...updatedItems[index], [field]: value };
      }
      
      // Auto-calculate
      const weight = parseFloat(updatedItems[index].weight) || 0;
      const qty = parseFloat(updatedItems[index].qty) || 0;
      const rate = parseFloat(updatedItems[index].rate) || 0;
      const disc = parseFloat(updatedItems[index].disc) || 0;
      const tax = parseFloat(updatedItems[index].tax) || 0;

      const totalwt = weight * qty;
      let amt = qty * rate;
      amt -= (amt * disc) / 100;
      amt += (amt * tax) / 100;

      updatedItems[index].totalWt = totalwt;
      updatedItems[index].amount = amt;

      return updatedItems;
    });
  }

  const calculateTotals = (currentItems) => {
    let totalQty = 0, totalWeight = 0, totalAmount = 0;

    currentItems.forEach(item => {
      totalQty += parseFloat(item.qty) || 0;
      totalWeight += item.totalWt || 0;
      totalAmount += item.amount || 0;
    });

    const baseAmount = totalAmount;
    const autoWages = parseFloat(totals.deductions.autoWages) || 0;
    const vatPercent = parseFloat(totals.deductions.vatPercent) || 0;
    const vat = (baseAmount * vatPercent) / 100;
    const netAmount = baseAmount + autoWages + vat;

    setTotals(prev => ({
      ...prev,
      totalQty,
      totalWeight,
      totalAmount,
      baseAmount,
      netAmount,
      grandTotal: netAmount
    }));
  }

  const addItem = () => {
    const newId = Math.max(...items.map(item => item.id), 0) + 1;
    setItems(prev => [...prev, {
      id: newId,
      item_name: '',
      lot_no: '',
      weight: '',
      qty: '',
      total_wt: 0,
      rate: '',
      disc: '',
      tax: '',
      amount: 0
    }]);
  }

  const deleteItem = (index) => {
    setItems(prev => {
      if (prev.length <= 1) return prev;
      const updatedItems = prev.filter((_, i) => i !== index);
      calculateTotals(updatedItems);
      return updatedItems;
    });
  }

  const handleDeductionChange = (field, value) => {
    setTotals(prev => ({
      ...prev,
      deductions: { ...prev.deductions, [field]: value }
    }));
    calculateTotals(items);
  }

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      const data = { formData, items, totals };
      const response = await fetch('/api/purchase-returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setMessage('Purchase return saved successfully!');
        setMessageType('success');
        setFormData({
          sNo: 1,
          date: '',
          returnInvNo: '',
          supplier: '',
          payType: 'Credit',
          invDate: '',
          type: 'Urad',
          address: '',
          taxType: 'Exclusive',
          godown: '',
          remarks: ''
        });
        setItems([{
          id: 1,
          itemName: '',
          lotNo: '',
          weight: '',
          qty: '',
          totalWt: 0,
          rate: '',
          disc: '',
          tax: '',
          amount: 0
        }]);
        setTotals({
          totalQty: 0,
          totalWeight: 0,
          totalAmount: 0,
          baseAmount: 0,
          discAmount: 0,
          taxAmount: 0,
          netAmount: 0,
          deductions: { autoWages: '', vat: '', vatPercent: '' },
          grandTotal: 0
        });
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error saving purchase return');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error saving purchase return');
      setMessageType('error');
    }
    setLoading(false);
  }

  const topFrameFields = [
    { name: 'sNo', label: 'S.No', value: formData.sNo },
    { name: 'date', label: 'Date', type: 'date', value: formData.date },
    { name: 'returnInvNo', label: 'Return Inv No', value: formData.returnInvNo },
    { name: 'supplier', label: 'Supplier', value: formData.supplier },
    { name: 'payType', label: 'Pay Type', value: formData.payType },
    { name: 'invDate', label: 'Inv Date', type: 'date', value: formData.invDate },
    { name: 'type', label: 'Type', value: formData.type },
    { name: 'address', label: 'Address', value: formData.address },
    { name: 'taxType', label: 'Tax Type', value: formData.taxType },
    { name: 'godown', label: 'Godown', value: formData.godown },
    { name: 'remarks', label: 'Remarks', value: formData.remarks },
  ];

  const itemColumns = [
    { key: 'item_name', title: 'Item Name', type: 'masterSelect', masterType: 'items' },
    { key: 'lot_no', title: 'Lot No', type: 'lotSelect' },
    { key: 'weight', title: 'Weight', type: 'number' },
    { key: 'qty', title: 'Qty', type: 'number' },
    { key: 'total_wt', title: 'Total Wt', readOnly: true },
    { key: 'rate', title: 'Rate', type: 'number' },
    { key: 'disc', title: 'Disc %', type: 'number' },
    { key: 'tax', title: 'Tax %', type: 'number' },
    { key: 'amount', title: 'Amount', readOnly: true },
  ];

  const totalsArr = [
    { name: 'totalQty', label: 'Total Qty', value: totals.totalQty.toFixed(3) },
    { name: 'totalWeight', label: 'Total Weight', value: totals.totalWeight.toFixed(3) },
    { name: 'totalAmount', label: 'Total Amount', value: totals.totalAmount.toFixed(2) },
    { name: 'grandTotal', label: 'Grand Total', value: totals.grandTotal.toFixed(2) },
  ];

  const summaryFields = [
    { name: 'baseAmount', label: 'Base Amount', value: totals.baseAmount.toFixed(2) },
    { name: 'discAmount', label: 'Disc Amount', value: totals.discAmount.toFixed(2) },
    { name: 'taxAmount', label: 'Tax Amount', value: totals.taxAmount.toFixed(2) },
    { name: 'netAmount', label: 'Net Amount', value: totals.netAmount.toFixed(2) },
  ];

  const handleRowChange = (rowIndex, key, value) => {
    handleItemChange(rowIndex, key, value);
  };

  return (
    <div className="window">
      <div className="screen-title">Purchase Return Creation</div>

      {message && <div className={`message ${messageType}`}>{message}</div>}

      <EntryTopFrame 
        fields={topFrameFields} 
        data={formData} 
        onChange={handleFormChange}
      />

      <EntrySection title="Items">
        <EntryItemsTable 
          columns={itemColumns}
          data={items}
          onRowChange={handleRowChange}
          onAddRow={addItem}
          onDeleteRow={deleteItem}
          showActions={true}
          lotMode="select"
        />
      </EntrySection>

      <EntryTotalsRow totals={totalsArr} />

      <EntryBottomSummary 
        summaryFields={summaryFields}
        formData={totals}
        onChange={(e) => handleDeductionChange(e.target.name, e.target.value)}
      />

      <EntryActions 
        onSave={handleSave}
        saving={loading}
        saveText="Save"
      />
    </div>
  );
};

export default PurchaseReturn;
