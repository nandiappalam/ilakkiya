import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Box
} from '@mui/material';
import { Link } from 'react-router-dom';
import voucherAPI from './voucherService.js';
import VoucherRow from './VoucherRow';

const VoucherList = () => {
  const [vouchers, setVouchers] = useState([]);
  const [openRow, setOpenRow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      const data = await voucherAPI.getAll();
      setVouchers(data);
    } catch (err) {
      console.error('Load vouchers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (id) => {
    setOpenRow(openRow === id ? null : id);
  };

  if (loading) {
    return <Typography>Loading vouchers...</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">Voucher List</Typography>
          <Button
            component={Link}
            to="/entry/voucher-create"
            variant="contained"
            color="primary"
            size="large"
          >
            + New Voucher
          </Button>
        </Box>

        {vouchers.length === 0 ? (
          <Typography>No vouchers found. <Link to="/entry/voucher-create">Create one</Link></Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vouchers.map((voucher) => (
                  <VoucherRow
                    key={voucher.id}
                    voucher={voucher}
                    openRow={openRow}
                    toggleRow={toggleRow}
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

