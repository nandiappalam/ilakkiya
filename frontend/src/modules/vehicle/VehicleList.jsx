import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Button, Chip, IconButton 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import { getVehicleMovements, updateVehicleMovement } from './vehicleService';
import VehiclePrint from './VehiclePrint';

const statusColors = {
  'IN': 'default',
  'LOADED': 'primary', 
  'UNLOADED': 'secondary',
  'OUT': 'success'
};

const VehicleList = () => {
  const navigate = useNavigate();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [openPrint, setOpenPrint] = useState(false);

  useEffect(() => {
    loadMovements();
  }, []);

  const loadMovements = async () => {
    try {
  const data = await getVehicleMovements();
      setMovements(data);
    } catch (err) {
      console.error('Load movements failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/entry/vehicle-movement-create?id=${id}`);
  };

  const handlePrint = (id) => {
    setSelectedId(id);
    setOpenPrint(true);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateVehicleMovement(id, { status: newStatus });
      loadMovements(); // Reload
    } catch (err) {
      alert('Update failed: ' + err.message);
    }
  };

  const statusButtons = (currentStatus) => [
    { label: 'IN', onClick: () => handleStatusUpdate(row.id, 'IN'), disabled: currentStatus === 'IN' },
    { label: 'LOADED', onClick: () => handleStatusUpdate(row.id, 'LOADED'), disabled: currentStatus === 'LOADED' },
    { label: 'UNLOADED', onClick: () => handleStatusUpdate(row.id, 'UNLOADED'), disabled: currentStatus === 'UNLOADED' },
    { label: 'OUT', onClick: () => handleStatusUpdate(row.id, 'OUT'), disabled: currentStatus === 'OUT' }
  ];

  if (loading) return <div>Loading...</div>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Vehicle Movements</Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/entry/vehicle-movement-create')}
        >
          + New Movement
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell>Movement Type</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell>Driver</TableCell>
              <TableCell>Transporter</TableCell>
              <TableCell>Gross/Tare/Net</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movements.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.reference_type} #{row.reference_id}</TableCell>
                <TableCell>{row.movement_type} / {row.operation_type}</TableCell>
                <TableCell>{row.vehicle_no}</TableCell>
                <TableCell>{row.driver_name}</TableCell>
                <TableCell>{row.transporter_name || '-'}</TableCell>
                <TableCell>{row.gross_weight}/{row.tare_weight}/{row.net_weight}</TableCell>
                <TableCell>
                  <Chip 
                    label={row.status} 
                    color={statusColors[row.status]} 
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(row.id)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handlePrint(row.id)}>
                    <PrintIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {openPrint && selectedId && (
        <VehiclePrint 
          movementId={selectedId} 
          onClose={() => setOpenPrint(false)} 
        />
      )}
    </Box>
  );
};

export default VehicleList;

