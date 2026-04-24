import React, { useState, useEffect } from 'react';
import { getVehicleMovement } from './vehicleService';

const VehiclePrint = ({ movementId, onClose }) => {
  const [movement, setMovement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovement();
  }, [movementId]);

  const loadMovement = async () => {
    try {
      const data = await getVehicleMovement(movementId);
      setMovement(data);
    } catch (err) {
      console.error('Load movement failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !movement) {
    return <div>Loading print...</div>;
  }

  const handlePrint = () => {
    window.print();
  };

  const formatDateTime = (dt) => dt ? new Date(dt).toLocaleString() : '';

  return (
    <div className="print-container" style={{ 
      width: '80mm', 
      fontFamily: 'Arial, sans-serif', 
      fontSize: '12px',
      padding: '10mm',
      margin: '0 auto',
      border: '1px solid #ccc',
      '@media print': {
        width: '80mm'
      }
    }}>
      <style jsx>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 2mm;
          }
          .no-print { display: none !important; }
        }
        .header { text-align: center; font-weight: bold; margin-bottom: 5mm; }
        .row { display: flex; justify-content: space-between; margin: 1mm 0; }
        .label { font-weight: bold; min-width: 40%; }
        .value { text-align: right; flex: 1; }
        .items { margin: 3mm 0; }
        .item-row { display: flex; border-bottom: 1px solid #eee; padding: 1mm 0; }
        .sign { margin-top: 10mm; text-align: right; }
      `}</style>

      <div className="no-print">
        <Button onClick={onClose}>Close</Button>
        <Button onClick={handlePrint}>Print 4-inch Slip</Button>
      </div>

      {/* 4-INCH THERMAL PRINT LAYOUT */}
      <div className="header">
        <div>BVC EXPORTS PVT LTD</div>
        <div>GATE SLIP</div>
        <div>Movement ID: {movement.id}</div>
      </div>

      <div className="row">
        <span className="label">Date/Time:</span>
        <span className="value">{formatDateTime(movement.created_at)}</span>
      </div>

      <div className="row">
        <span className="label">Vehicle No:</span>
        <span className="value">{movement.vehicle_no}</span>
      </div>

      <div className="row">
        <span className="label">Driver:</span>
        <span className="value">{movement.driver_name || '-'}</span>
      </div>

      <div className="row">
        <span className="label">Transporter:</span>
        <span className="value">{movement.transporter_name || '-'}</span>
      </div>

      <div className="row">
        <span className="label">Type:</span>
        <span className="value">{movement.movement_type} / {movement.operation_type}</span>
      </div>

      <div className="row">
        <span className="label">Reference:</span>
        <span className="value">{movement.reference_type} #{movement.reference_id}</span>
      </div>

      <div className="row">
        <span className="label">Weights:</span>
        <span className="value">
          G:{movement.gross_weight} T:{movement.tare_weight} N:{movement.net_weight}
        </span>
      </div>

      <div className="row">
        <span className="label">Status:</span>
        <span className="value">{movement.status}</span>
      </div>

      <div className="sign">
        <div>Receiver Signature: ________________</div>
        <div>Date: ________________</div>
      </div>

      <div style={{ marginTop: '10mm', fontSize: '10px', textAlign: 'center' }}>
        Thank you for your business!
      </div>
    </div>
  );
};

export default VehiclePrint;

