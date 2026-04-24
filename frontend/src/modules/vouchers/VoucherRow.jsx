import React from 'react';
import {
  TableRow,
  TableCell,
  IconButton,
  Collapse,
  Box,
  Table,
  TableBody
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const VoucherRow = ({ voucher, openRow, toggleRow }) => {
  const total = voucher.entries.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton onClick={() => toggleRow(voucher.id)}>
            {openRow === voucher.id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{voucher.id}</TableCell>
        <TableCell>{voucher.date}</TableCell>
        <TableCell>{voucher.type.toUpperCase()}</TableCell>
        <TableCell>{voucher.company}</TableCell>
        <TableCell>₹{total.toLocaleString()}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ padding: 0 }} colSpan={6}>
          <Collapse in={openRow === voucher.id} timeout="auto" unmountOnExit>
            <Box sx={{ m: 1, p: 2, backgroundColor: '#f5f5f5' }}>
              <Typography variant="subtitle2" gutterBottom>
                Entries:
              </Typography>
              <Table size="small">
                <TableBody>
                  {voucher.entries.map((entry, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{entry.ledger}</TableCell>
                      <TableCell>{entry.type}</TableCell>
                      <TableCell>₹{Number(entry.amount).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default VoucherRow;

