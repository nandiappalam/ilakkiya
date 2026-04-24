import React, { useState, useEffect } from 'react'
import { api } from '../utils/api.js'
import './WeightConversionDisplay.css'

const WeightConversionDisplay = () => {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [editDialog, setEditDialog] = useState({ open: false, data: null })
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null })
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    loadWeightConversions()
  }, [])

  const loadWeightConversions = async () => {
    try {
      setLoading(true)
      const result = await api('db/query', { method: 'POST', body: { sql: 'SELECT * FROM weight_conversion ORDER BY id DESC', params: [] } })
      
      if (result.success) {
        setRecords(result.data || [])
      } else {
        console.error('Error loading weight conversions:', result.message)
        setRecords([])
      }
    } catch (error) {
      console.error('Error loading weight conversions:', error)
      setRecords([])
      setSnackbar({ open: true, message: 'Error loading weight conversions: ' + error.message, severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleEdit = (record) => {
    setEditDialog({ open: true, data: { ...record } })
  }

  const handleUpdate = async () => {
    try {
      const { id, date, remarks, type } = editDialog.data
      const result = await api('db/execute', { method: 'POST', body: { sql: 'UPDATE weight_conversion SET date = ?, remarks = ?, type = ? WHERE id = ?', params: [date, remarks, type, id] } })
      if (result.success) {
        setSnackbar({ open: true, message: 'Weight conversion updated successfully!', severity: 'success' })
        setEditDialog({ open: false, data: null })
        loadWeightConversions()
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Error updating weight conversion', severity: 'error' })
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this weight conversion?')) return

    try {
      const result = await api('db/execute', { method: 'POST', body: { sql: 'DELETE FROM weight_conversion WHERE id = ?', params: [id] } })
      if (result.success) {
        setSnackbar({ open: true, message: 'Weight conversion deleted successfully!', severity: 'success' })
        loadWeightConversions()
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting weight conversion', severity: 'error' })
    }
  }

  const handleEditChange = (field, value) => {
    setEditDialog(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value }
    }))
  }

  return (
    <div className="weight-conversion-display">
      <div className="window">
        <div className="title">
          <div>Weight Conversion Display</div>
          <div>
            <div className="filter-bar">
              <label>Date :</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>S.No</th>
              <th style={{ width: '80px' }}>Date</th>
              <th style={{ width: '120px' }}>Item Name</th>
              <th style={{ width: '50px' }}>Lot No</th>
              <th style={{ width: '60px' }}>Weight</th>
              <th style={{ width: '60px' }}>Qty</th>
              <th style={{ width: '80px' }}>Tot Wt</th>
              <th style={{ width: '100px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>No records found</td>
              </tr>
            ) : (
              records.map((record, index) => (
                <tr key={record.id || index}>
                  <td>{record.s_no || index + 1}</td>
                  <td>{record.date}</td>
                  <td>{record.item_name}</td>
                  <td>{record.lot_no}</td>
                  <td>{record.weight}</td>
                  <td>{record.qty}</td>
                  <td>{record.total_wt}</td>
                  <td>
                    <button onClick={() => handleEdit(record)}>Edit</button>
                    <button onClick={() => handleDelete(record.id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="footer">
          <div>
            <button onClick={handlePrint}>Print</button>
          </div>
          <div>
            Row(s): {records.length} &nbsp;&nbsp; Total: <b></b>
          </div>
        </div>
      </div>

      {editDialog.open && editDialog.data && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Weight Conversion</h3>
            <div className="modal-body">
              <label>Date:</label>
              <input type="date" value={editDialog.data.date} onChange={(e) => handleEditChange('date', e.target.value)} />
              <label>Remarks:</label>
              <input type="text" value={editDialog.data.remarks} onChange={(e) => handleEditChange('remarks', e.target.value)} />
              <label>Type:</label>
              <input type="text" value={editDialog.data.type} onChange={(e) => handleEditChange('type', e.target.value)} />
            </div>
            <div className="modal-actions">
              <button onClick={handleUpdate}>Save</button>
              <button onClick={() => setEditDialog({ open: false, data: null })}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {snackbar.open && (
        <div className={`snackbar ${snackbar.severity}`}>
          {snackbar.message}
          <button onClick={() => setSnackbar({ ...snackbar, open: false })}>×</button>
        </div>
      )}
    </div>
  )
}

export default WeightConversionDisplay
