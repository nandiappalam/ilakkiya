import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, TextField, Select, MenuItem, Button, Table, TableBody, TableRow, TableCell, TableHead,
  Box, Alert, IconButton, FormControlLabel, Checkbox, Switch
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, Link } from 'react-router-dom';
import voucherAPI from './voucherService.js';
import { safeArray } from '../../utils/safeArray.js';

const VOUCHER_TYPES = ['Payment', 'Receipt', 'Contra', 'Journal'];

const VoucherCreate = ({ voucherId = null, isEdit = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    voucher_type: 'Payment',
    voucher_no: '',
    auto_voucher_no: true,
    date: new Date().toISOString().split('T')[0],
    reference_no: '',
    narration: ''
  });
  const [entries, setEntries] = useState([
    { type: 'Dr', ledger_id: '', ledger_name: '', debit: '', credit: '', remarks: '' }
  ]);
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totals, setTotals] = useState({ debit: 0, credit: 0 });

  useEffect(() => {
    voucherAPI.getLedgers().then(res => setLedgers(safeArray(res)));
    if (isEdit && voucherId) {
      loadVoucher(voucherId);
    }
  }, []);

  const updatePreviewNo = async () => {
    if (formData.auto_voucher_no && formData.voucher_type) {
      try {
        const res = await voucherAPI.previewVoucherNo({ voucher_type: formData.voucher_type });
        setFormData(f => ({...f, voucher_no: res.voucher_no }));
      } catch (err) {
        console.error('Preview failed:', err);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(updatePreviewNo, 300);
    return () => clearTimeout(timer);
  }, [formData.voucher_type]);

  const loadVoucher = async (id) => {
    try {
      const data = await voucherAPI.get(id);
      setFormData({
        voucher_type: data.voucher_type,
        voucher_no: data.voucher_no,
        auto_voucher_no: false,
        date: data.date,
        reference_no: data.reference_no || '',
        narration: data.narration || ''
      });
      setEntries(data.entries.map(e => ({
        type: e.type,
        ledger_id: e.ledger_id,
        ledger_name: e.ledger_name,
        debit: e.debit,
        credit: e.credit,
        remarks: e.remarks || ''
      })));
    } catch (err) {
      setError('Failed to load voucher');
    }
  };

  const updateEntry = (index, field, value) => {
    const newEntries = [...entries];
    if (field === 'type') {
      // Clear amounts when changing type
      newEntries[index].debit = '';
      newEntries[index].credit = '';
    } else if (field === 'debit' || field === 'credit') {
      // Clear the other amount
      newEntries[index][field === 'debit' ? 'credit' : 'debit'] = '';
    } else if (field === 'ledger_id') {
      const ledger = ledgers.find(l => l.id == value);
      newEntries[index].ledger_name = ledger ? ledger.name : '';
    }
    newEntries[index][field] = value;
    setEntries(newEntries);
    calculateTotals(newEntries);
  };

  const addEntry = () => {
    setEntries([...entries, { type: 'Dr', ledger_id: '', ledger_name: '', debit: '', credit: '', remarks: '' }]);
  };

  const deleteEntry = (index) => {
    if (entries.length > 2) {
      setEntries(entries.filter((_, i) => i !== index));
    } else {
      setError('Minimum 2 entries required');
    }
  };

  const calculateTotals = (ents = entries) => {
    const debit = ents.reduce((sum, e) => sum + Number(e.debit || 0), 0);
    const credit = ents.reduce((sum, e) => sum + Number(e.credit || 0), 0);
    setTotals({ debit, credit });
  };

  const validateForm = () => {
    if (entries.length < 2) return 'Minimum 2 entries required';
    if (Math.abs(totals.debit - totals.credit) > 0.01) return 'Debit and Credit must balance';
    if (formData.auto_voucher_no && !formData.voucher_type) return 'Voucher type required for auto numbering';
    for (const e of entries) {
      if (!e.ledger_id) return 'Ledger required for all entries';
      if ((Number(e.debit) || 0) > 0 && (Number(e.credit) || 0) > 0) return 'Only one of debit or credit per entry';
      if ((Number(e.debit) || 0) === 0 && (Number(e.credit) || 0) === 0) return 'Entry must have amount';
    }
    return '';
  };

  const handleSubmit = async () => {
    const valErr = validateForm();
    if (valErr) {
      setError(valErr);
      return;
    }

    const submitData = {
      ...formData,
      entries: entries.map(e => ({
        type: e.type,
        ledger_id: parseInt(e.ledger_id),
        debit: Number(e.debit) || 0,
        credit: Number(e.credit) || 0,
        remarks: e.remarks
      }))
    };
    if (submitData.auto_voucher_no) delete submitData.voucher_no;

    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await voucherAPI.update(voucherId, submitData);
      } else {
        await voucherAPI.create(submitData);
      }
      alert(isEdit ? 'Voucher updated!' : 'Voucher created!');
      navigate('/entry/voucher-list');
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            {isEdit ? 'Edit Voucher' : 'Voucher Creation'}
          </Typography>
          <Typography>
            <Link to="/entry/voucher-list">← Back to List</Link>
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Top Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom> Voucher Info </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControlLabel
              control={<Switch checked={formData.auto_voucher_no} onChange={(e) => {
                setFormData({...formData, auto_voucher_no: e.target.checked});
                if (e.target.checked) setFormData(f => ({...f, voucher_no: ''}));
              }} />}
              label="Auto Voucher No"
            />
            <Select
              value={formData.voucher_type}
              onChange={(e) => setFormData({...formData, voucher_type: e.target.value})}
              sx={{ minWidth: 120 }}
              disabled={isEdit}
            >
              {VOUCHER_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>
            <TextField
              label="Voucher No"
              value={formData.voucher_no}
              onChange={(e) => setFormData({...formData, voucher_no: e.target.value})}
              disabled={formData.auto_voucher_no}
              sx={{ minWidth: 120 }}
            />
            <TextField
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              sx={{ minWidth: 140 }}
              inputProps={{ min: '2020-01-01' }}
            />
            <TextField
              label="Reference No"
              value={formData.reference_no}
              onChange={(e) => setFormData({...formData, reference_no: e.target.value})}
              sx={{ minWidth: 140 }}
            />
          </Box>
        </Box>

        {/* Entries Table */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Entries</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Particulars (Ledger)</TableCell>
                <TableCell>Debit</TableCell>
                <TableCell>Credit</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Select value={entry.type} onChange={(e) => updateEntry(index, 'type', e.target.value)} size="small">
                      <MenuItem value="Dr">Dr</MenuItem>
                      <MenuItem value="Cr">Cr</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={entry.ledger_id}
                      onChange={(e) => updateEntry(index, 'ledger_id', e.target.value)}
                      size="small"
                      sx={{ minWidth: 200 }}
                    >
                      <MenuItem value="">Select Ledger</MenuItem>
                      {ledgers.map(ledger => (
                        <MenuItem key={ledger.id} value={ledger.id}>{ledger.name}</MenuItem>
                      ))}
                    </Select>
                    {entry.ledger_name && <Typography variant="caption">({entry.ledger_name})</Typography>}
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={entry.debit}
                      onChange={(e) => updateEntry(index, 'debit', e.target.value)}
                      type="number"
                      size="small"
                      sx={{ minWidth: 100 }}
                      inputProps={{ step: '0.01' }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={entry.credit}
                      onChange={(e) => updateEntry(index, 'credit', e.target.value)}
                      type="number"
                      size="small"
                      sx={{ minWidth: 100 }}
                      inputProps={{ step: '0.01' }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField value={entry.remarks} onChange={(e) => updateEntry(index, 'remarks', e.target.value)} size="small" />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => deleteEntry(index)} size="small" disabled={entries.length <= 2}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button startIcon={<AddIcon />} onClick={addEntry} sx={{ mt: 1 }}>
            Add Row
          </Button>
        </Box>

        {/* Totals */}
        <Box sx={{ textAlign: 'right', mb: 3 }}>
          <Typography variant="h6">
            Total Debit: ₹{totals.debit.toLocaleString()} | Total Credit: ₹{totals.credit.toLocaleString()}
          </Typography>
          {Math.abs(totals.debit - totals.credit) > 0.01 && (
            <Alert severity="warning" sx={{ mt: 1, display: 'inline-block' }}>
              Not Balanced!
            </Alert>
          )}
        </Box>

        {/* Narration */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>Narration</Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={formData.narration}
            onChange={(e) => setFormData({...formData, narration: e.target.value})}
            placeholder="Optional narration..."
          />
        </Box>

        {/* Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={() => navigate('/entry/voucher-list')}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || Math.abs(totals.debit - totals.credit) > 0.01 || entries.length < 2}
          >
            {loading ? 'Saving...' : (isEdit ? 'Update' : 'Save Voucher')}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default VoucherCreate;
