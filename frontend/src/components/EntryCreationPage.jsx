import React, { useState } from 'react'
import {
  Typography,
  Container,
  Paper,
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
} from '@mui/material'

const EntryCreationPage = ({ module }) => {
  const [formData, setFormData] = useState({})
  const [tableData, setTableData] = useState([
    { id: 1, itemName: '', weight: 0, qty: 0, totalWt: 0, papadKg: 0, cost: 0, wagesBag: 0, wages: 0 }
  ])

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Submitting:', formData)
    // TODO: Implement actual submit logic
  }

  const addRow = () => {
    const newRow = {
      id: tableData.length + 1,
      itemName: '',
      weight: 0,
      qty: 0,
      totalWt: 0,
      papadKg: 0,
      cost: 0,
      wagesBag: 0,
      wages: 0
    }
    setTableData([...tableData, newRow])
  }

  const deleteRow = (id) => {
    setTableData(tableData.filter(item => item.id !== id))
  }

  const renderTopSection = () => {
    if (module === 'Purchase') {
      return (
        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#66B4E3' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="S.No"
                name="sno"
                value={formData.sno || '1'}
                onChange={handleInputChange}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={formData.date || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Inv No"
                name="invNo"
                value={formData.invNo || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Supplier"
                name="supplier"
                value={formData.supplier || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Pay Type"
                name="payType"
                value={formData.payType || 'Credit'}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Inv Date"
                name="invDate"
                type="date"
                value={formData.invDate || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Type"
                name="type"
                value={formData.type || 'Urad'}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={2}
                value={formData.address || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Tax Type"
                name="taxType"
                value={formData.taxType || 'Exclusive'}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Godown"
                name="godown"
                value={formData.godown || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Remarks"
                name="remarks"
                value={formData.remarks || ''}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </Paper>
      )
    } else if (module === 'Grind') {
      return (
        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#66B4E3' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="S.No"
                name="sno"
                value={formData.sno || '1'}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Flour Mill"
                name="flourMill"
                value={formData.flourMill || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={formData.date || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Remarks"
                name="remarks"
                value={formData.remarks || ''}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </Paper>
      )
    } else {
      // Default for Flour Out Return, etc.
      return (
        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#ede9ff' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="S.No"
                name="sno"
                value={formData.sno || '1'}
                onChange={handleInputChange}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="datetime-local"
                value={formData.date || new Date().toISOString().slice(0, 16)}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Tax Type"
                name="taxType"
                value={formData.taxType || ''}
                onChange={handleInputChange}
                placeholder="Cash / Credit"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Remarks"
                name="remarks"
                value={formData.remarks || ''}
                onChange={handleInputChange}
                placeholder="Enter remarks"
              />
            </Grid>
          </Grid>
        </Paper>
      )
    }
  }

  const renderTable = () => {
    if (module === 'Purchase') {
      return (
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table>
