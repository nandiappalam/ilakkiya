import React, { useState } from 'react';
import './SalesExportOrderDisplay.css';

const SalesExportOrderDisplay = () => {
  const [data, setData] = useState([
    {
      containerNo: '',
      kindOfPackage: '',
      description: '',
      qty: '',
      usdRate: '',
      convRate: '',
      usdAmt: '',
      inrAmt: '',
      taxPercent: '',
      amount: '',
      billAmt: '',
      taxAmt: '',
      total: ''
    },
    {
      containerNo: '',
      kindOfPackage: '',
      description: '',
      qty: '',
      usdRate: '',
      convRate: '',
      usdAmt: '',
      inrAmt: '',
      taxPercent: '',
      amount: '',
      billAmt: '',
      taxAmt: '',
      total: ''
    },
    {
      containerNo: '',
      kindOfPackage: '',
      description: '',
      qty: '',
      usdRate: '',
      convRate: '',
      usdAmt: '',
      inrAmt: '',
      taxPercent: '',
      amount: '',
      billAmt: '',
      taxAmt: '',
      total: ''
    }
  ]);

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    // Handle edit functionality
    console.log('Edit clicked');
  };

  const handleUpdate = () => {
    // Handle update functionality
    console.log('Update clicked');
  };

  return (
    <div>
      

      
      <div className="screen-title">Sales Export Order Display</div>

      <div className="grid-frame">
          <table>
            <thead>
              <tr>
                <th>Container No</th>
                <th>Kind of Package</th>
                <th>Description</th>
                <th>Qty</th>
                <th>USD Rate</th>
                <th>Conv Rate</th>
                <th>USD Amt</th>
                <th>INR Amt</th>
                <th>Tax %</th>
                <th>Amount</th>
                <th>Bill Amt</th>
                <th>Tax Amt</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  <td>{row.containerNo}</td>
                  <td>{row.kindOfPackage}</td>
                  <td>{row.description}</td>
                  <td>{row.qty}</td>
                  <td>{row.usdRate}</td>
                  <td>{row.convRate}</td>
                  <td>{row.usdAmt}</td>
                  <td>{row.inrAmt}</td>
                  <td>{row.taxPercent}</td>
                  <td>{row.amount}</td>
                  <td>{row.billAmt}</td>
                  <td>{row.taxAmt}</td>
                  <td>{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>

      <div className="footer">
        <div></div>
        <div>
          <button onClick={handlePrint}>Print</button>
          <button onClick={handleEdit}>Edit</button>
          <button onClick={handleUpdate}>Update</button>
        </div>
      </div>
    </div>
  );
};

export default SalesExportOrderDisplay;
