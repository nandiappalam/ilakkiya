import React from 'react';
import '../CityDisplay.css';

/**
 * MasterTableLayout - Display table layout for Master pages
 * Standardized layout for master display pages
 * Blue & White theme (#1976d2)
 */
export const MasterTableLayout = ({
  columns = [],
  data = [],
  onEdit = () => {},
  onDelete = () => {},
  onPrint = () => {},
  title = '',
  showActions = true,
}) => {
  return (
    <div className="standard-display">
      <div className="screen-title">
        {title || 'MASTER DISPLAY'}
      </div>
      
      <div className="container">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
{columns.map((col, index) => (
                  <th key={`${col.key}_${index}`} style={col.width ? { width: col.width } : {}}>
                    {col.title}
                  </th>
                ))}

                {showActions && (
                  <th className="actions-header" style={{ width: onPrint ? '240px' : '180px' }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (showActions ? 1 : 0)} style={{ textAlign: 'center', padding: '30px' }}>
                    No records found
                  </td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr key={index}>
                    {columns.map((col) => (
                      <td key={col.key}>
                        {col.render ? col.render(row[col.key], row, index) : row[col.key]}
                      </td>
                    ))}
                    {showActions && (
                      <td className="actions-cell">
                        {onPrint && <button onClick={() => onPrint(row)} className="action-btn print-btn">Print</button>}
                        <button onClick={() => onEdit(row)} className="action-btn update-btn">Update</button>
                        <button onClick={() => onDelete(row)} className="action-btn delete-btn">Delete</button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="footer-bar">
        Total Records: {data.length}
      </div>
    </div>
  );
};

export default MasterTableLayout;
