import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Button, Box, TextField, Select, MenuItem
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import voucherAPI from './voucherService.js';
import VoucherRow from './VoucherRow';
import { safeArray } from '../../utils/safeArray.js';

const VOUCHER_TYPES = ['Payment', 'Receipt', 'Contra', 'Journal', ''];

const VoucherList = () => {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [filters, setFilters] = useState({
    from_date: '',
    to_date: '',
    voucher_type: '',
    search: ''
  });
  const [loading, setLoading] = useState(true);
  const [rowCount, setRowCount] = useState(0);
const [openRow, setOpenRow] = useState(null);
  const [expandedEntries, setExpandedEntries] = useState({});
  const toggleRow = async (id) => {
    if (openRow === id) {
      setOpenRow(null);
      setExpandedEntries({});
    } else {
      setOpenRow(id);
      try {
        const voucherData = await voucherAPI.get(id);
        setExpandedEntries({ [id]: voucherData.entries || [] });
      } catch (err) {
        console.error('Load entries error:', err);
      }
    }
  };

  useEffect(() => {
    loadVouchers();
  }, [filters]);

  const loadVouchers = async () => {
    setLoading(true);
    try {
      const data = await voucherAPI.getAll(filters);
      setVouchers(safeArray(data));
      setRowCount(data.length);
    } catch (err) {
      console.error('Load vouchers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const deleteVoucher = async (id) => {
    if (window.confirm('Delete this voucher?')) {
      try {
        await voucherAPI.delete(id);
        loadVouchers();
      } catch (err) {
        alert('Delete failed: ' + err.message);
      }
    }
  };

  const editVoucher = (id) => {
    navigate(`/entry/voucher-create/${id}`);
  };

  if (loading) {
    return <Typography>Loading vouchers...</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>Voucher List ({rowCount} rows)</Typography>
          <Button component={Link} to="/entry/voucher-create" variant="contained" sx={{ mb: 2 }}>
            + New Voucher
          </Button>
        </Box>

        {/* Filters */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="From Date"
            type="date"
            value={filters.from_date}
            onChange={(e) => handleFilterChange('from_date', e.target.value)}
            sx={{ minWidth: 140 }}
          />
          <TextField
            label="To Date"
            type="date"
            value={filters.to_date}
            onChange={(e) => handleFilterChange('to_date', e.target.value)}
            sx={{ minWidth: 140 }}
          />
          <Select
            value={filters.voucher_type}
            onChange={(e) => handleFilterChange('voucher_type', e.target.value)}
            sx={{ minWidth: 120 }}
            displayEmpty
          >
            <MenuItem value="">All Types</MenuItem>
            {VOUCHER_TYPES.slice(0,-1).map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </Select>
          <TextField
            label="Search (No/Narration)"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            sx={{ minWidth: 180 }}
          />
          <Button variant="outlined" onClick={loadVouchers} sx={{ alignSelf: 'flex-end' }}>
            Filter
          </Button>
          <Button variant="outlined" onClick={() => setFilters({from_date:'',to_date:'',voucher_type:'',search:''})}>
            Clear
          </Button>
        </Box>

        {vouchers.length === 0 ? (
          <Typography>No vouchers found. <Link to="/entry/voucher-create">Create one</Link></Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Expand</TableCell>
                  <TableCell>Vch No</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Particulars</TableCell>
                  <TableCell align="right">Debit</TableCell>
                  <TableCell align="right">Credit</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
{vouchers.map((voucher) => (
                  <VoucherRow
                    key={voucher.id}
                    voucher={voucher}
                    onEdit={editVoucher}
                    onDelete={deleteVoucher}
                    openRow={openRow}
                    toggleRow={toggleRow}
                    expandedEntries={expandedEntries}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default VoucherList;

