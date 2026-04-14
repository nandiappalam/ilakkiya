import React, { useState, useEffect } from 'react'
import api from '../utils/api'

/**
 * MasterDropdown - Reusable component for dynamic master data in Entry forms
 * Fetches from /api/masters/:type endpoint
 * 
 * Props:
 * - label: Display label for the dropdown
 * - masterType: Type of master data (items, suppliers, customers, etc.)
 * - value: Current selected value (id)
 * - onChange: Callback when value changes
 * - required: Whether field is required
 * - name: Field name for onChange
 */
const MasterDropdown = ({ 
  label = 'Select', 
  masterType, 
  value, 
  onChange, 
  required = false,
  name 
}) => {
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      if (!masterType) return
      
      setLoading(true)
      setError('')
      
      try {
        const result = await api.getMasters(masterType);
        setOptions(result.data || []);

      } catch (err) {
        console.error(`Error fetching ${masterType}:`, err)
        setError(`Failed to load ${label}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [masterType, label])

  const handleChange = (e) => {
    const selectedValue = e.target.value
    // Call onChange with the synthetic event or just the value
    if (onChange) {
      onChange({
        target: {
          name: name || masterType,
          value: selectedValue
        }
      })
    }
  }

  if (loading) {
    return (
      <div className="form-group">
        <label>{label}{required && ' *'}</label>
        <select className="uniform-input" disabled>
          <option>Loading...</option>
        </select>
      </div>
    )
  }

  if (error) {
    return (
      <div className="form-group">
        <label>{label}{required && ' *'}</label>
        <select className="uniform-input" disabled>
          <option>{error}</option>
        </select>
      </div>
    )
  }

  return (
    <div className="form-group">
      <label>{label}{required && ' *'}</label>
      <select
        className="uniform-input"
        value={value || ''}
        onChange={handleChange}
        name={name || masterType}
        required={required}
      >
        <option value="">{`Select ${label}`}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default MasterDropdown
