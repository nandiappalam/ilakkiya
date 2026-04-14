import React from 'react';
import './StockAdjustDisplay.css';

const StockAdjustDisplay = () => {
  return (
    <div>
      
      
      <div className="screen-title">Stock Adjust Display</div>
      {/* WINDOW */}
      <div className="window">
        <div className="form-title">Stock Adjust Display</div>

        {/* FILTER */}
        <div className="filter-bar">
          <label>Date :</label>
          <input type="Date" />
          <input type="Date" />
        </div>

        {/* GRID */}
        <div className="grid">
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Date</th>
                <th>Remarks</th>
                <th>Item Name</th>
                <th>Lot No</th>
                <th>Weight</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Tot Wt</th>
              </tr>
            </thead>
            <tbody>
              {/* EMPTY ROWS (NO DATA) */}
              <tr><td colSpan="9">&nbsp;</td></tr>
              <tr><td colSpan="9">&nbsp;</td></tr>
              <tr><td colSpan="9">&nbsp;</td></tr>
              <tr><td colSpan="9">&nbsp;</td></tr>
            </tbody>
          </table>
        </div>

        {/* BOTTOM BAR */}
        <div className="bottom-bar">
          <div className="btn-group">
            <button>Print</button>
            <button>Edit</button>
            <button>Update</button>
            <button>Cancel</button>
          </div>
          <div className="status">Rows : 0</div>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustDisplay;
