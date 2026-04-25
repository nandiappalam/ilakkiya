import React, { useState } from 'react';
import './SalesExportCreate.css';

// Import modular entry components
import { EntryTopFrame, EntryItemsTable, EntryActions, EntrySection } from './entry'

const SalesExportCreate = () => {
  const [formData, setFormData] = useState({
    billNo: '',
    date: '',
    orderNoDt: '',
    disPort: '',
    destCountry: '',
    finalDestin: '',
    sender: '',
    netWt: '',
    advance: '',
    exporter: '',
    consignee: '',
    buyerOther: '',
    otherRef: '',
    preCarriage: '',
    vesselFltNo: '',
    consignedTo: '',
    grossWt: '',
    sign: '',
    placeOfRcpt: '',
    loadingPort: '',
    originCountry: '',
    deliveryTerms: '',
    paymentTerms: '',
    purTransport: '',
    driver: '',
    lorryNo: '',
    remarks: ''
  });

  const [items, setItems] = useState([
    {
      containerNo: '',
      kindOfPackage: '',
      description: '',
      qtyInKg: '',
      mfdExpDt: '',
      lotNo: '',
      qty: '',
      usdRate: '',
      convRate: '',
      usdAmt: '',
      inrAmt: ''
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    if (field === '__batch__' && typeof value === 'object') {
      updatedItems[index] = { ...updatedItems[index], ...value };
    } else {
      updatedItems[index] = { ...updatedItems[index], [field]: value };
    }
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, {
      containerNo: '',
      kindOfPackage: '',
      description: '',
      qtyInKg: '',
      mfdExpDt: '',
      lotNo: '',
      qty: '',
      usdRate: '',
      convRate: '',
      usdAmt: '',
      inrAmt: ''
    }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // API call would go here
      setMessage('Export Sales saved successfully!');
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving export sales');
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
    { name: 'finalDestin', label: 'Final Destin', value: formData.finalDestin },
    { name: 'sender', label: 'Sender', value: formData.sender },
    { name: 'netWt', label: 'Net Wt', value: formData.netWt },
    { name: 'advance', label: 'Advance', value: formData.advance },
    { name: 'exporter', label: 'Exporter', value: formData.exporter },
    { name: 'consignee', label: 'Consignee', value: formData.consignee },
    { name: 'buyerOther', label: 'Buyer (Other)', value: formData.buyerOther },
  ];

  const itemColumns = [
    { key: 'containerNo', title: 'Container No' },
    { key: 'kindOfPackage', title: 'Kind of Package' },
    { key: 'description', title: 'Description' },
    { key: 'qtyInKg', title: 'Qty in kg', type: 'number' },
    { key: 'mfdExpDt', title: 'MFD / Exp Dt', type: 'date' },
    { key: 'lotNo', title: 'Lot No' },
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
      <div className="screen-title">Export Sales Creation</div>

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

export default SalesExportCreate;
