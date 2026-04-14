import React from 'react';
import './PackingDisplay.css';
const PackingDisplay = () => {
  return (
    <div>
      

      
      <div className="screen-title">Packing Display</div>

      <div className="window">
        <div className="title">
          <div>Packing Display</div>
          <div>
            <div className="filter-bar">
              <label>Date :</label>
              <input type="Date" />
              <input type="Date" />
            </div>
          </div>
        </div>

        <div className="table-area">
          <table>
            <thead>
              <tr>
                <th style={{width: '30px'}}>S.No</th>
                <th style={{width: '40px'}}>Date</th>
                <th style={{width: '100px'}}>Item Name</th>
                <th style={{width: '40px'}}>Lot No</th>
                <th style={{width: '60px'}}>Kg</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td><td></td><td></td><td></td><td></td></tr>
              <tr><td></td><td></td><td></td><td></td><td></td></tr>
              <tr><td></td><td></td><td></td><td></td><td></td></tr>
            </tbody>
          </table>
        </div>

        <div className="footer">
          <div>Rows : 0</div>
          <div className="buttons">
            <button>Print</button>
            <button>Edit</button>
            <button>Update</button>
            <button>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackingDisplay;
