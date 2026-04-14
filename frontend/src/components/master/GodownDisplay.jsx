import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import MasterTableLayout from './MasterTableLayout';

const GodownDisplay = () => {
  const [godowns, setGodowns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGodowns = async () => {
    try {
      const result = await api.getMasters("godowns");
      setGodowns(result.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGodowns();
  }, []);

  const deleteGodown = async (id) => {
    if (confirm('Delete this godown?')) {
      try {
        await api.deleteMaster('godown_master', id);
        fetchGodowns();
      } catch (err) {
        alert('Error deleting godown');
      }
    }
  };

  const columns = [
    { key: 'sno', title: 'S.No', width: '60px', render: (_,__,index) => index+1 },
    { key: 'godown_name', title: 'Name' },
    { key: 'contact_person', title: 'Contact person' },
    { key: 'mobile', title: 'Mobile' },
    { key: 'area', title: 'Area' },
    { key: 'gst_no', title: 'GST NO' },
  ];

  return (
    <MasterTableLayout title="Godown Master - Display" onRefresh={fetchGodowns} loading={loading}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            {columns.map(col => (
              <th key={col.key} style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd', fontWeight: 'bold' }}>
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {godowns.map((godown, index) => (
            <tr key={godown.id || index}>
              {columns.map(col => (
                <td key={col.key} style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {godown[col.key] || '-'}
                </td>
              ))}
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                <button onClick={() => deleteGodown(godown.id)} style={{ color: 'red' }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {godowns.length === 0 && !loading && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>No godowns found. Create one first.</p>
      )}
    </MasterTableLayout>
  );
};

export default GodownDisplay;
