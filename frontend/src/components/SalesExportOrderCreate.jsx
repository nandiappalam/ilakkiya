import React, { useState } from 'react';
import './SalesExportOrderCreate.css';

// Import modular entry components
import { EntryTopFrame, EntryItemsTable, EntryActions, EntrySection } from './entry'

const SalesExportOrderCreate = () => {
  const [formData, setFormData] = useState({
    billNo: '',
    date: '',
    orderNoDt: '',
    disPort: '',
    destCountry: '',
    exporter: '',
    consignee: '',
    buyerOther: '',
    vesselFltNo: '',
    grossWt: '',
    placeOfRcpt: '',
    loadingPort: '',
    deliveryTerms: '',
    advance: '',
    sign: ''
  })

  const [items, setItems] = useState([
    {
      containerNo: '',
      kindOfPackage: '',
      description: '',
      qty: '',
      usdRate: '',
      convRate: '',
      usdAmt: '',
      inrAmt: ''
    }
  ])

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items]
    updatedItems[index][field] = value

    if (field === 'qty' || field === 'usdRate' || field === 'convRate') {
      const qty = parseFloat(updatedItems[index].qty) || 0
      const usdRate = parseFloat(updatedItems[index].usdRate) || 0
      const convRate = parseFloat(updatedItems[index].convRate) || 0

      updatedItems[index].usdAmt = (qty * usdRate).toFixed(2)
      updatedItems[index].inrAmt = (qty * usdRate * convRate).toFixed(2)
    }

    setItems(updatedItems)
  }

  const addItem = () => {
    setItems([...items, {
      containerNo: '',
      kindOfPackage: '',
      description: '',
      qty: '',
      usdRate: '',
      convRate: '',
      usdAmt: '',
      inrAmt: ''
    }])
  }

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.billNo) {
      setMessage('Date and Bill No are required');
      setMessageType('error');
      return;
    }

    const validItems = items.filter(item => item.containerNo && item.qty > 0);
    if (validItems.length === 0) {
      setMessage('At least one item with container number and quantity is required');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const payload = { formData, items: validItems };
      const response = await fetch('/api/sales-export-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setMessage('Sales export order saved successfully!');
        setMessageType('success');
        setFormData({
          billNo: '',
          date: '',
          orderNoDt: '',
          disPort: '',
          destCountry: '',
          exporter: '',
          consignee: '',
          buyerOther: '',
          vesselFltNo: '',
          grossWt: '',
          placeOfRcpt: '',
          loadingPort: '',
          deliveryTerms: '',
          advance: '',
          sign: ''
        });
        setItems([{
          containerNo: '',
          kindOfPackage: '',
          description: '',
          qty: '',
          usdRate: '',
          convRate: '',
          usdAmt: '',
          inrAmt: ''
        }]);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error saving sales export order');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error saving sales export order');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const topFrameFields = [
    { name: 'billNo', label: 'Bill No', value: formData.billNo },
    { name: 'date', label: 'Date', type: 'date', value: formData.date },
    { name: 'orderNoDt', label: 'Order No/Dt', value: formData.orderNoDt },
    { name: 'disPort', label: 'Dis Port', value: formData.disPort },
    { name: 'destCountry', label: 'Dest Country', value: formData.destCountry },
    { name: 'exporter', label: 'Exporter', value: formData.exporter },
    { name: 'consignee', label: 'Consignee', value: formData.consignee },
    { name: 'buyerOther', label: 'Buyer (Other)', value: formData.buyerOther },
    { name: 'vesselFltNo', label: 'Vessel/Flt No', value: formData.vesselFltNo },
    { name: 'grossWt', label: 'Gross Wt', value: formData.grossWt },
    { name: 'placeOfRcpt', label: 'Place Of Rcpt', value: formData.placeOfRcpt },
    { name: 'loadingPort', label: 'Loading Port', value: formData.loadingPort },
    { name: 'deliveryTerms', label: 'Delivery Terms', value: formData.deliveryTerms },
    { name: 'advance', label: 'Advance', value: formData.advance },
    { name: 'sign', label: 'Sign', value: formData.sign },
  ];

  const itemColumns = [
    { key: 'containerNo', title: 'Container No' },
    { key: 'kindOfPackage', title: 'Kind of Package' },
    { key: 'description', title: 'Description' },
    { key: 'qty', title: 'Qty', type: 'number' },
    { key: 'usdRate', title: 'USD Rate', type: 'number' },
    { key: 'convRate', title: 'Conv Rate', type: 'number' },
    { key: 'usdAmt', title: 'USD Amt', type: 'number' },
    { key: 'inrAmt', title: 'INR Amt', type: 'number' },
  ];

  const handleRowChange = (rowIndex, key, value) => {
    handleItemChange(rowIndex, key, value);
  };

  return (
    <div className="window">
      <div className="screen-title">Export Sales Order Creation</div>

      {message && <div className={`message ${messageType}`}>{message}</div>}

      <EntryTopFrame 
        fields={topFrameFields} 
        data={formData} 
        onChange={handleInputChange}
      />

      <EntrySection title="Items">
        <EntryItemsTable 
          columns={itemColumns}
          data={items}
          onRowChange={handleRowChange}
          onAddRow={addItem}
          onDeleteRow={removeItem}
          showActions={true}
        />
      </EntrySection>

      <EntryActions 
        onSave={handleSubmit}
        saving={loading}
        saveText="Save"
      />
    </div>
  );
};

export default SalesExportOrderCreate;
