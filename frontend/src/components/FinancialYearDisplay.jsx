import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const themeColors = {
  primary: '#1f4fb2',
  secondary: '#2a5ea0',
  lightBlue: '#dbe7fb',
  lighterBlue: '#eaf2fb',
  white: '#ffffff',
  textPrimary: '#333333',
};

const FinancialYearDisplay = () => {
  const navigate = useNavigate();
  const { selectedCompany, isAdmin, hasPermission } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [financialYears, setFinancialYears] = useState([]);
  const [error, setError] = useState('');

  // Check permission
  const canView = isAdmin || hasPermission('Financial Year', 'Display', 'can_view');
  const canCreate = isAdmin || hasPermission('Financial Year', 'Create', 'can_create');

  useEffect(() => {
    if (canView && selectedCompany?.id) {
      fetchFinancialYears();
    }
  }, [selectedCompany?.id, canView]);

  const fetchFinancialYears = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/financial-years/${selectedCompany.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setFinancialYears(data);
      } else {
        setError(data.message || 'Failed to fetch financial years');
      }
    } catch (error) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSetActive = async (id) => {
    try {
      const response = await fetch(`/api/financial-years/${id}/activate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: selectedCompany.id })
      });
      
      if (response.ok) {
        fetchFinancialYears();
      }
    } catch (error) {
      console.error('Error activating financial year:', error);
    }
  };

  const handleToggleLock = async (year) => {
    try {
      const endpoint = year.is_locked 
        ? `/api/financial-years/${year.id}/unlock`
        : `/api/financial-years/${year.id}/lock`;
      
      const response = await fetch(endpoint, {
        method: 'PUT'
      });
      
      if (response.ok) {
        fetchFinancialYears();
      }
    } catch (error) {
      console.error('Error toggling lock:', error);
    }
  };

  if (!canView) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">You don't have permission to view Financial Years</Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: themeColors.primary }}>
            Financial Years
          </Typography>
        </Box>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/features/financial-year-create')}
            sx={{ backgroundColor: themeColors.primary }}
          >
            Add Financial Year
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {/* Financial Years Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: themeColors.lighterBlue }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Year Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Start Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>End Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Locked</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {financialYears.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No financial years found
                    </TableCell>
                  </TableRow>
                ) : (
                  financialYears.map((year) => (
                    <TableRow key={year.id} hover>
                      <TableCell sx={{ fontWeight: 'bold' }}>{year.year_name}</TableCell>
                      <TableCell>{year.start_date}</TableCell>
                      <TableCell>{year.end_date}</TableCell>
                      <TableCell>
                        {year.is_active ? (
                          <Chip 
                            icon={<CheckCircleIcon />} 
                            label="Active" 
                            color="success" 
                            size="small" 
                          />
                        ) : (
                          <Button 
                            size="small" 
                            variant="outlined"
                            onClick={() => handleSetActive(year.id)}
                            disabled={year.is_locked}
                          >
                            Set Active
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        {year.is_locked ? (
                          <Chip icon={<LockIcon />} label="Locked" color="error" size="small" />
                        ) : (
                          <Chip icon={<LockOpenIcon />} label="Open" color="success" variant="outlined" size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => handleToggleLock(year)}
                          disabled={year.is_active}
                          color={year.is_locked ? 'default' : 'warning'}
                        >
                          {year.is_locked ? <LockOpenIcon /> : <LockIcon />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FinancialYearDisplay;
