import React, { useState, useEffect, useRef } from 'react';
import { getMasters, deleteMaster } from '../services/masterservice';
import MasterTableLayout from './master/MasterTableLayout';

const FlourMillDisplay = () => {
  const [flourMills, setFlourMills] = useState([]);
  const [loading, setLoading] = useState(true);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadFlourMills();
  }, []);

  const loadFlourMills = async () => {
    try {
      const result = await getMasters("flour_mill_master");
      setFlourMills(result.data || []);
    } catch (error) {
      console.error('Error loading flour mills:', error);
      setFlourMills([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (flourMill) => {
    if (!confirm('Are you sure you want to delete this flour mill?')) return;

    try {
      await deleteMaster("flour_mill_master", flourMill.id);
      alert('Flour mill deleted successfully');
      loadFlourMills();
    } catch (error) {
      alert('Error deleting flour mill: ' + error.message);
    }
  };

  const handleUpdate = (flourMill) => {
    alert('Update functionality - Flour Mill ID: ' + flourMill.id);
  };

  const handlePrint = (flourMill) => {
    const printWindow = window.open('', '_blank', 'width=600,height=400');
    printWindow.document.write(`
      <html>
        <head>
          <title>Flour Mill Details - ${flourMill.flourmill}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { color: #333; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            label { font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>Flour Mill Details</h2>
          <table>
            <tr><td><label>Flour Mill:</label></td><td>${flourMill.flourmill || ''}</td></tr>
            <tr><td><label>Print Name:</label></td><td>${flourMill.print_name || ''}</td></tr>
            <tr><td><label>Contact Person:</label></td><td>${flourMill.contact_person || ''}</td></tr>
            <tr><td><label>Area:</label></td><td>${flourMill.area || ''}</td></tr>
            <tr><td><label>Phone:</label></td><td>${flourMill.phone_off || flourMill.mobile1 || ''}</td></tr>
            <tr><td><label>Wages/KG:</label></td><td>${flourMill.wages_kg || ''}</td></tr>
            <tr><td><label>Opening Balance:</label></td><td>${flourMill.opening_balance || ''}</td></tr>
            <tr><td><label>Status:</label></td><td>${flourMill.status || 'Active'}</td></tr>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const columns = [
    { key: 'sno', title: 'S.No', width: '60px', render: (_,__,index) => index+1 },
    { key: 'mill_name', title: 'Mill Name' },
    { key: 'phone', title: 'Phone' },
    { key: 'gst_no', title: 'GST No' },
    { key: 'wages_kg', title: 'Wages/kg' },
    { key: 'status', title: 'Status', width: '80px' },
  ];

  return (
    <MasterTableLayout
      title="FLOUR MILL MASTER"
      columns={columns}
      data={flourMills}
      onEdit={handleUpdate}
      onDelete={handleDelete}
      showActions={true}
    />
  );
};

export default FlourMillDisplay;

