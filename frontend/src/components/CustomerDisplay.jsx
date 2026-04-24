import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMasters, deleteMaster } from '../services/masterservice';
import MasterTableLayout from './master/MasterTableLayout';
import './customer-display.css';

const CustomerDisplay = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
const result = await getMasters('customers');
      setCustomers(result.data || []);
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (customer) => {
    if (!confirm('Are you sure?')) return;
    try {
await deleteMaster('customer_master', customer.id);
      loadCustomers();
    } catch (error) {
      alert('Delete error: ' + error.message);
    }
  };

  const handleUpdate = (customer) => {
    navigate(`/master/customer-update/${customer.id}`);
  };

  const handlePrint = (customer) => {
    // Simple print (can be enhanced)
    window.print();
  };

  const columns = [
    { key: 'sno', title: 'S.No', width: '60px', render: (_,__,index) => index+1 },
    { key: 'name', title: 'Customer' },
    { key: 'contact_person', title: 'Cont. Person' },
    { key: 'area', title: 'Area' },
    { key: 'mobile1', title: 'Mobile' },
    { key: 'opening_balance', title: 'Opening Balance' },
    { key: 'gst_number', title: 'Type', render: (row) => row.gst_number ? 'GST' : 'Non-GST' },
    { key: 'status', title: 'Status', width: '80px' },
  ];

  return (
    <MasterTableLayout
      title="CUSTOMER MASTER"
      columns={columns}
      data={customers}
      onEdit={handleUpdate}
      onDelete={handleDelete}
      onPrint={handlePrint}
      showActions={true}
    />
  );
};

export default CustomerDisplay;

