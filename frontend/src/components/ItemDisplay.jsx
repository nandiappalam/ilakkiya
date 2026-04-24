import React, { useState, useEffect, useRef } from 'react';
import { getMasters, createMaster, deleteMaster } from '../services/masterservice';
import MasterTableLayout from './master/MasterTableLayout';


const ItemDisplay = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const hasFetched = useRef(false);

  const fetchRows = async () => {
    setLoading(true);
    try {
const result = await getMasters("items");
      // console.log('Item masters loaded:', result);
      setRows(result.data || []);

      setMessage('');
    } catch (error) {
      console.error('Error loading items:', error);
      setRows([]);
      setMessage('Error loading items');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchRows();
  }, []);

  const handleUpdate = (row) => {
    setSelected(row);
    setShowModal(true);
  };

  const handleSaveUpdate = async (updatedData) => {
    try {
await createMaster("item_master", updatedData);  // Reuse create or add update
      setMessage('Updated successfully');
      setMessageType('success');
      setShowModal(false);
      fetchRows();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating');
      setMessageType('error');
      console.error('Error updating item:', error);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
await deleteMaster("item_master", row.id);
      setMessage('Deleted successfully');
      setMessageType('success');
      fetchRows();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error deleting');
      setMessageType('error');
      console.error('Error deleting item:', error);
    }
  };

  const handlePrint = (row) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html><head><title>Item</title></head><body>
      <h3>Item Details</h3>
      <p><b>Item Code:</b> ${row.item_code}</p>
      <p><b>Item Name:</b> ${row.item_name}</p>
      <p><b>Item Group:</b> ${row.item_group}</p>
      <p><b>Type:</b> ${row.type}</p>
      </body></html>
    `);
    printWindow.print();
  };

  const columns = [
    { key: 'sno', title: 'S.No', width: '60px', render: (_, __, index) => index + 1 },
    { key: 'item_code', title: 'Item Code' },
    { key: 'item_name', title: 'Item Name' },
    { key: 'item_group', title: 'Item Group' },
    { key: 'type', title: 'Type' },
    { key: 'hsn_code', title: 'HSN Code' },
    { key: 'tax', title: 'Tax %' },
    { key: 'status', title: 'Status', width: '80px' },
  ];

  return (
    <MasterTableLayout
      title="ITEM MASTER"
      columns={columns}
      data={rows}
      onEdit={handleUpdate}
      onDelete={handleDelete}
      showActions={true}
    />
  );
};

export default ItemDisplay;
