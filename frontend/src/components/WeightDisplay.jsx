import React, { useState, useEffect } from 'react';
import { getWeights, deleteWeight } from '../utils/tauriApi';
import MasterTableLayout from './master/MasterTableLayout';

const WeightDisplay = () => {
  const [weights, setWeights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeights();
  }, []);

  const fetchWeights = async () => {
    try {
      const result = await getWeights();
      if (result.success) {
        setWeights(result.data);
      } else {
        console.error('Error fetching weights:', result.message);
      }
    } catch (error) {
      console.error('Error fetching weights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (weight) => {
    if (!window.confirm('Are you sure you want to delete this weight?')) return;

    try {
      const result = await deleteWeight(weight.id);
      if (result.success) {
        alert('Deleted successfully');
        fetchWeights();
      } else {
        alert('Error deleting weight: ' + result.message);
      }
    } catch (error) {
      alert('Error deleting weight');
      console.error('Error deleting weight:', error);
    }
  };

  const handleUpdate = (weight) => {
    alert('Update functionality - Weight ID: ' + weight.id);
  };

  const handlePrint = (weight) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html><head><title>Weight</title></head><body>
      <h3>Weight Details</h3>
      <p><b>Weight Name:</b> ${weight.name}</p>
      <p><b>Print Name:</b> ${weight.printname}</p>
      <p><b>Weight (Kgs):</b> ${weight.weight}</p>
      <p><b>Status:</b> Active</p>
      </body></html>
    `);
    printWindow.print();
  };

  const columns = [
    { key: 'sno', title: 'S.No', width: '60px', render: (_, __, index) => index + 1 },
    { key: 'name', title: 'Weight Name' },
    { key: 'printname', title: 'Print Name' },
    { key: 'weight', title: 'Weight (Kgs)' },
    { key: 'status', title: 'Status', width: '100px', render: () => 'Active' },
  ];

  return (
    <MasterTableLayout
      title="WEIGHT MASTER"
      columns={columns}
      data={weights}
      onEdit={handleUpdate}
      onDelete={handleDelete}
      showActions={true}
    />
  );
};

export default WeightDisplay;
