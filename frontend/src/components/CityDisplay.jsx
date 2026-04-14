import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api.js'
import MasterTableLayout from './master/MasterTableLayout'
import './CityDisplay.css'


const CityDisplay = () => {
  const [cities, setCities] = useState([])
  const hasFetched = useRef(false);
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadCities()
  }, [])

  const loadCities = async () => {
    setLoading(true)
    try {
      const result = await api.getMasters("cities")
      setCities(result.data || [])
    } catch (error) {
      console.error('Error loading cities:', error)
      setCities([])
    } finally {
      setLoading(false)
    }
  }


  const handleDelete = async (city) => {
    if (!window.confirm('Are you sure you want to delete this city?')) return
    try {
      await api.deleteMaster("city_master", city.id)
      loadCities()
    } catch (error) {
      console.error('Error deleting city:', error)
    }
  }


  const handleUpdate = (city) => {
    navigate(`/city-update?id=${city.id}`)
  }

  const handlePrint = (city) => {
    const printWindow = window.open('', '_blank', 'width=600,height=400')
    printWindow.document.write(`
      <html>
        <head>
          <title>City Details - ${city.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { color: #333; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            label { font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>City Details</h2>
          <table>
            <tr><td><label>City:</label></td><td>${city.name}</td></tr>
            <tr><td><label>Print Name:</label></td><td>${city.print_name || ''}</td></tr>
            <tr><td><label>Status:</label></td><td>${city.status}</td></tr>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const columns = [
    { key: 'sno', title: 'S.No', width: '60px', render: (_, __, index) => index + 1 },
    { key: 'name', title: 'City Name' },
    { key: 'print_name', title: 'Print Name' },
    { key: 'status', title: 'Status', width: '100px' },
  ]

  return (
    <MasterTableLayout
      title="CITY MASTER"
      columns={columns}
      data={cities}
      onEdit={handleUpdate}
      onDelete={handleDelete}
      showActions={true}
    />
  )
}

export default CityDisplay
