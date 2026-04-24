import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getMasters } from '../services/api.js';

const themeColors = {
  primary: '#1f4fb2',
  secondary: '#2a5ea0',
  lightBlue: '#dbe7fb',
  lighterBlue: '#eaf2fb',
  white: '#ffffff',
  textPrimary: '#333333',
};

const UserDisplay = () => {
  const navigate = useNavigate();
  const { isAdmin, permissions, selectedCompany, hasPermission } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canManageUsers = isAdmin || hasPermission('User', 'Display', 'can_view') || hasPermission('User', 'Display', 'can_edit') || hasPermission('User', 'Display', 'can_delete');

  useEffect(() => {
    if (selectedCompany?.id) {
      fetchUsers();
    }
  }, [selectedCompany]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await api.getMasters("users");
      if (Array.isArray(result)) {
        setUsers(result);
      } else if (result.success !== false) {
        setUsers(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to fetch users');
      }
    } catch (error) {
      setError(error.message || 'Error connecting to server');
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (userId) => {
    navigate(`/master/user-update/${userId}`);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const result = await api('companies/${userId}', { method: 'DELETE' });

      if (result.success !== false) {
        setUsers(users.filter(u => u.id !== userId));
        setError('User deleted successfully');
      } else {
        throw new Error(result.message || 'Failed to delete user');
      }
    } catch (error) {
      setError(error.message || 'Error connecting to server');
      console.error('Error deleting user:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ mr: 2, color: themeColors.textPrimary }}
          >
            Back
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: themeColors.primary }}>
            User Management
          </Typography>
        </Box>
        
        {canManageUsers && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/master/user-create')}
            sx={{
              backgroundColor: themeColors.primary,
              '&:hover': { backgroundColor: themeColors.secondary }
            }}
          >
            Create User
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity={error.includes('successfully') ? 'success' : 'error'} sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: themeColors.lightBlue }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Company</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Created At</TableCell>
                  {canManageUsers && <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canManageUsers ? 6 : 5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="textSecondary">
                        No users found. {canManageUsers && 'Create a user to get started.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user, index) => (
                    <TableRow key={user.id || `user-${index}`} hover>
                      <TableCell>{user.username || user.user_name || '-'}</TableCell>
                      <TableCell>{user.company_name || selectedCompany?.name || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role || 'User'}
                          color={user.role === 'Admin' ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.status || 'Active'}
                          color={user.status === 'Active' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                      </TableCell>
                      {canManageUsers && (
                        <TableCell align="center">
                          <IconButton
                            onClick={() => handleEdit(user.id)}
                            sx={{ color: themeColors.primary, mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(user.id)}
                            sx={{ color: '#f44336' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      )}
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

export default UserDisplay;
