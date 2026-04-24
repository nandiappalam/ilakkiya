import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMasters, deleteMaster } from '../../services/masterservice';
import MasterTableLayout from './MasterTableLayout';

const GodownDisplay = () => {
  const [godowns, setGodowns] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadGodowns();
  }, []);

  const loadGodowns = async () => {
    try {
      const result = await getMasters('godowns');
      setGodowns(result.data || []);
    } catch (error) {
      console.error('Error loading godowns:', error);
      setGodowns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (godown) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteMaster('godown_master', godown.id);
      loadGodowns();
    } catch (error) {
      alert('Delete error: ' + error.message);
    }
  };

  const handleUpdate = (godown) => {
    navigate(`/master/godown-update/${godown.id}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    { key: 'sno', title: 'S.No', width: '60px', render: (_,__,index) => index+1 },
    { key: 'godown_name', title: 'Godown Name' },
    { key: 'print_name', title: 'Print Name' },
    { key: 'status', title: 'Status', width: '80px' },
  ];

  return (
    <MasterTableLayout
      title="GODOWN MASTER"
      columns={columns}
      data={godowns}
      onEdit={handleUpdate}
      onDelete={handleDelete}
      onPrint={handlePrint}
      showActions={true}
    />
  );
};

export default GodownDisplay;

