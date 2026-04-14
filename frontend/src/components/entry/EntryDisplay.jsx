import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { safeArray } from "../../utils/safeArray";

/**
 * EntryDisplay - Uniform display component for Entry pages
 * Provides standardized table display with actions (Update, Print, Delete)
 * Styled with Blue & White theme
 * 
 * @param {String} title - Page title
 * @param {String} apiEndpoint - API endpoint for data fetching
 * @param {String} tableName - Table name for Tauri API (alternative to apiEndpoint)
 * @param {Array} columns - Column definitions
 * @param {Function} onEdit - Edit handler
 * @param {Function} customActions - Custom action renderer
 * @param {Function} onAddNew - Add new handler
 * @param {String} addNewLink - Link to create new page
 */
const EntryDisplay = ({ 
  title = "Display",
  apiEndpoint,
  tableName,
  columns = [],
  onEdit,
  customActions,
  onAddNew,
  addNewLink
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    if (!apiEndpoint && !tableName) return;
    setLoading(true);
    setMessage("");
    try {
      let result;
      
      // Use Tauri API directly if tableName is provided
      if (tableName) {
        result = await api.getMasters(tableName);
      } else {
        // Fallback to fetch for apiEndpoint (for backward compatibility)
        const response = await fetch(apiEndpoint);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        if (!text) {
          setData([]);
          setLoading(false);
          return;
        }
        result = JSON.parse(text);
      }
      
      // Use safeArray utility to handle multiple response formats
      const rawData = safeArray(result);
      
      setData(rawData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage("Error loading data - " + (error.message || "API may not be available"));
      setMessageType("error");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiEndpoint, tableName]);

  const handleDelete = async (row) => {
    const id = row.id;
    if (!id) {
      setMessage("Cannot delete: missing record id");
      setMessageType("error");
      return;
    }
    if (!window.confirm("Delete this record?")) return;
    try {
      const res = await fetch(`${apiEndpoint}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage("Record deleted successfully");
        setMessageType("success");
        fetchData();
      } else {
        setMessage("Delete failed");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Network error while deleting");
      setMessageType("error");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const handlePrint = (row) => {
    const win = window.open("", "_blank");
    if (win) {
      let tableHtml = "<table style='border-collapse:collapse;width:100%'>";
      tableHtml += "<tr>";
      columns.forEach(col => {
        tableHtml += `<th style='border:1px solid #ccc;padding:8px;background:#1f4fb2;color:#fff'>${col.title}</th>`;
      });
      tableHtml += "</tr><tr>";
      columns.forEach(col => {
        tableHtml += `<td style='border:1px solid #ccc;padding:8px'>${row[col.key] || ""}</td>`;
      });
      tableHtml += "</tr></table>";
      
      win.document.write(`
        <html>
          <head><title>${title}</title>
          <style>body{font-family:Arial;padding:20px}</style>
          </head>
          <body>
            <h2>${title}</h2>
            ${tableHtml}
          </body>
        </html>
      `);
      win.document.close();
      win.focus();
      win.print();
    }
  };

  const handleEdit = (row) => {
    if (onEdit) {
      onEdit(row);
    }
  };

  const filteredData = data.filter(row => {
    if (!searchTerm) return true;
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div style={styles.container}>
      {/* Header - Blue Theme */}
      <div style={styles.header}>{title}</div>

      {/* Message */}
      {message && (
        <div style={messageType === 'success' ? styles.successMessage : styles.errorMessage}>
          {message}
        </div>
      )}

      {/* Filter Section - Blue Theme */}
      <div style={styles.filterSection}>
        <div style={styles.filterLeft}>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.filterRight}>
          <button style={styles.refreshBtn} onClick={fetchData}>Refresh</button>
          {onAddNew && (
            <button style={styles.addNewBtn} onClick={onAddNew}>
              Create New {title.replace(' Display', '')}
            </button>
          )}
          {addNewLink && (
            <button 
              style={styles.addNewBtn} 
              onClick={() => window.location.href = addNewLink}
            >
              Create New {title.replace(' Display', '')}
            </button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={styles.th}>{col.title}</th>
              ))}
              <th style={styles.th}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} style={styles.loading}>Loading...</td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} style={styles.noData}>No records found</td>
              </tr>
            ) : (
              filteredData.map((row, idx) => (
                <tr key={row.id || idx}>
                  {columns.map((col) => (
                    <td key={col.key} style={styles.td}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  <td style={styles.actionsCell}>
                    {customActions ? (
                      customActions(row, fetchData)
                    ) : (
                      <>
                        <button style={styles.actionBtn} onClick={() => handleEdit(row)}>Update</button>
                        <button style={styles.actionBtn} onClick={() => handlePrint(row)}>Print</button>
                        <button style={styles.deleteBtn} onClick={() => handleDelete(row)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with totals */}
      <div style={styles.footer}>
        <div style={styles.footerLeft}>
          Total Records: {filteredData.length}
        </div>
        <div style={styles.footerRight}>
          <button style={styles.printBtn} onClick={() => window.print()}>Print</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    background: '#f0f6ff',
    minHeight: '100vh',
    fontFamily: "'Segoe UI', 'Tahoma', Arial, sans-serif"
  },
  // Header - Blue Theme
  header: {
    background: 'linear-gradient(135deg, #1f4fb2 0%, #2a5ea0 100%)',
    color: 'white',
    padding: '12px 20px',
    fontSize: '20px',
    fontWeight: 'bold',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  successMessage: {
    padding: '12px 20px',
    background: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
    borderRadius: '4px',
    marginBottom: '15px'
  },
  errorMessage: {
    padding: '12px 20px',
    background: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
    borderRadius: '4px',
    marginBottom: '15px'
  },
  // Filter Section - Blue Theme
  filterSection: {
    background: '#e9eef7',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #9fb6dd',
    marginBottom: '15px'
  },
  filterLeft: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  filterRight: {
    display: 'flex',
    gap: '10px'
  },
  searchInput: {
    padding: '8px 12px',
    border: '1px solid #7fa1d6',
    borderRadius: '4px',
    fontSize: '14px',
    width: '200px',
    backgroundColor: '#ffffff',
  },
  refreshBtn: {
    padding: '8px 16px',
    background: '#1f4fb2',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  addNewBtn: {
    padding: '8px 16px',
    background: '#2a5ea0',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  // Table Section
  tableWrapper: {
    padding: '0 20px 20px',
    overflow: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
    fontSize: '14px',
  },
  // Blue Theme Table Header
  th: {
    background: '#1f4fb2',
    color: '#fff',
    padding: '10px',
    textAlign: 'left',
    fontWeight: 'bold',
    border: '1px solid #9fb6dd',
  },
  td: {
    padding: '8px',
    border: '1px solid #c0c8da',
  },
  actionsCell: {
    padding: '8px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },
  // Blue Theme Action Buttons
  actionBtn: {
    padding: '5px 12px',
    background: '#1f4fb2',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    marginRight: '5px'
  },
  deleteBtn: {
    padding: '5px 12px',
    background: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  printBtn: {
    padding: '8px 16px',
    background: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
    color: '#666',
  },
  noData: {
    textAlign: 'center',
    padding: '20px',
    color: '#999',
  },
  // Footer - Blue Theme
  footer: {
    background: '#dbe7fb',
    padding: '12px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '2px solid #9fb6dd',
    fontWeight: 'bold',
    color: '#1f3f67'
  },
  footerLeft: {
    fontSize: '14px'
  },
  footerRight: {
    display: 'flex',
    gap: '10px'
  }
};

export default EntryDisplay;

