import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Box,
  Alert,
  IconButton,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate, Link } from 'react-router-dom';
import voucherAPI from './voucherService.js';
import { safeArray } from '../../utils/safeArray.js';

const VoucherCreate = () => {
  const navigate = useNavigate();
  const [type, setType] = useState('purchase');
  const [company, setCompany] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [ledgers, setLedgers] = useState([]);
  const [entries, setEntries] = useState([
    { ledger: '', type: 'Dr', amount: '' },
    //{ ledger: '', type: 'Cr', amount: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load ledgers
  useEffect(() => {
    voucherAPI.getLedgers().then((res) => setLedgers(safeArray(res))).catch(console.error);
  }, []);

  // Auto-fill logic
  useEffect(() => {
    if (type && company && amount) {
      const amt = Number(amount);
      if (type === 'purchase' && amt > 0) {
        setEntries([
          { ledger: 'Purchase A/c', type: 'Dr', amount: amt.toString() },
          { ledger: company, type: 'Cr', amount: amt.toString() }
        ]);
      } else if (type === 'sales' && amt > 0) {
        setEntries([
          { ledger: company, type: 'Dr', amount: amt.toString() },
          { ledger: 'Sales A/c', type: 'Cr', amount: amt.toString() }
        ]);
      }
    }
  }, [type, company, amount]);

  const updateRow = (index, field, value) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const addRow = () => {
    setEntries([...entries, { ledger: '', type: 'Dr', amount: '' }]);
  };

  const removeRow = (index) => {
    if (entries.length > 2) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const totalDr = entries
    .filter(e => e.type === 'Dr')
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const totalCr = entries
    .filter(e => e.type === 'Cr')
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const handleSubmit = async () => {
    if (Math.abs(totalDr - totalCr) > 0.01) {
      setError('Debit and Credit totals must balance');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await voucherAPI.create({ date, type, company, entries });
      alert('Voucher saved successfully!');
      navigate('/entry/voucher-display');
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Voucher Entry
          </Typography>
          <Typography variant="body1" color="textSecondary">
            <Link to="/entry/voucher-display">← Back to List</Link>
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <TextField
            label="Amount (for auto-fill)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            type="number"
            sx={{ mb: 2 }}
          />
          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            inputProps={{ min: new Date().toISOString().split('T')[0] }}
          />
          <TextField
            label="Company/Party"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Select
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="purchase">Purchase</MenuItem>
            <MenuItem value="sales">Sales</MenuItem>
            <MenuItem value="payment">Payment</MenuItem>
            <MenuItem value="receipt">Receipt</MenuItem>
          </Select>
        </Box>

        {/* Entries Table */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Entries</Typography>
          <Table size="small">
            <TableBody>
              {entries.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Select
                      value={row.ledger}
                      onChange={(e) => updateRow(index, 'ledger', e.target.value)}
                      size="small"
                      sx={{ minWidth: 200 }}
                    >
                      <MenuItem value="">Select Ledger</MenuItem>
                      {safeArray(ledgers).map((ledger) => (
                        <MenuItem key={ledger.id} value={ledger.name}>
                          {ledger.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={row.type}
                      onChange={(e) => updateRow(index, 'type', e.target.value)}
                      size="small"
                    >
                      <MenuItem value="Dr">Dr</MenuItem>
                      <MenuItem value="Cr">Cr</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={row.amount}
                      onChange={(e) => updateRow(index, 'amount', e.target.value)}
                      type="number"
                      size="small"
                      sx={{ minWidth: 100 }}
                    />
                  </TableCell>
                  {entries.length > 2 && (
                    <TableCell>
                      <IconButton onClick={() => removeRow(index)} size="small">
                        ✕
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button
            startIcon={<AddIcon />}
            onClick={addRow}
            size="small"
            sx={{ mt: 1 }}
          >
            Add Row
          </Button>
        </Box>

        {/* Totals */}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h6">
            Total Dr: ₹{totalDr.toLocaleString()} | Total Cr: ₹{totalCr.toLocaleString()}
          </Typography>
          {Math.abs(totalDr - totalCr) > 0.01 && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Not Balanced! Dr ≠ Cr
            </Alert>
          )}
        </Box>

        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/entry/voucher-display')}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || Math.abs(totalDr - totalCr) > 0.01}
          >
            {loading ? 'Saving...' : 'Save Voucher'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default VoucherCreate;
