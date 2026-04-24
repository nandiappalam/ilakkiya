import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, TextField, Button, Select, MenuItem, FormControl, 
  InputLabel, Grid, Card, CardContent 
} from '@mui/material';
import { EntryTopFrame, EntryActions } from '../../components/entry';
import { createVehicleMovement, getMovementConfig } from './vehicleService';
import { useMasterData } from '../../hooks/useMasterData';

const VehicleCreate = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    referenceType: 'PURCHASE', // Default
    referenceId: '',
    vehicleNo: '',
    driverName: '',
    transporterId: '',
    gateInTime: '',
    gateOutTime: '',
    grossWeight: '',
    tareWeight: '',
    netWeight: '',
    status: 'IN'
  });

  const { data: transports, loading, error } = useMasterData('transports');

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReferenceTypeChange = (e) => {
    const refType = e.target.value;
    setFormData(prev => ({
      ...prev,
      referenceType: refType,
      referenceId: '', // Reset
      // Auto-fill movement types
      ...getMovementConfig(refType)
    }));
  };

  const handleSave = async () => {
    if (!formData.vehicleNo || !formData.referenceId) {
      alert('Vehicle No and Reference ID required');
      return;
    }

    try {
      const result = await createVehicleMovement(formData);
      alert('Vehicle Movement Saved! ID: ' + result.id);
      navigate('/entry/vehicle-movement-display');
    } catch (err) {
      alert('Save failed: ' + err.message);
    }
  };

  const topFields = [
    { name: 'referenceType', label: 'Reference Type', type: 'select', 
      options: [
        { value: 'PURCHASE', label: 'Purchase' },
        { value: 'SALES', label: 'Sales' },
        { value: 'PURCHASE_RETURN', label: 'Purchase Return' },
        { value: 'SALES_RETURN', label: 'Sales Return' }
      ]
    },
    { name: 'referenceId', label: 'Reference ID', type: 'number' },
    { name: 'vehicleNo', label: 'Vehicle No *', type: 'text' },
    { name: 'driverName', label: 'Driver Name', type: 'text' },
    { name: 'transporterId', label: 'Transporter', type: 'masterSelect', masterType: 'transports' },
    { name: 'status', label: 'Status', type: 'select',
      options: [
        { value: 'IN', label: 'IN' },
        { value: 'LOADED', label: 'LOADED' },
        { value: 'UNLOADED', label: 'UNLOADED' },
        { value: 'OUT', label: 'OUT' }
      ]
    }
  ];

  const weightFields = [
    { name: 'grossWeight', label: 'Gross Weight', type: 'number' },
    { name: 'tareWeight', label: 'Tare Weight', type: 'number' },
    { name: 'netWeight', label: 'Net Weight', type: 'number', readOnly: true }
  ];

  const timeFields = [
    { name: 'gateInTime', label: 'Gate In Time', type: 'datetime-local' },
    { name: 'gateOutTime', label: 'Gate Out Time', type: 'datetime-local' }
  ];

  return (
    <div className="window">
      <Typography variant="h4" gutterBottom>Vehicle Movement Create</Typography>
      
      {loading && <div>Loading transports...</div>}
      {error && <div>Error: {error}</div>}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <EntryTopFrame 
            fields={topFields} 
            data={formData} 
            onChange={handleFormChange}
            columns={2}
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Weights</Typography>
          <EntryTopFrame 
            fields={weightFields} 
            data={formData} 
            onChange={handleFormChange}
            columns={3}
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Gate Times</Typography>
          <EntryTopFrame 
            fields={timeFields} 
            data={formData} 
            onChange={handleFormChange}
            columns={2}
          />
        </CardContent>
      </Card>

      <EntryActions 
        onSave={handleSave}
        loading={loading}
        saveText="Save Vehicle Movement"
      />
    </div>
  );
};

export default VehicleCreate;

