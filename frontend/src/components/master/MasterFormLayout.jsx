import React from 'react';
import './master.css';

/**
 * MasterFormLayout - Reusable layout for ALL master create pages
 * Centered 1100px container with 2-column grid
 * Title + sections + actions footer
 */
export const MasterFormLayout = ({ children, title = '', moduleName = '', onSave, onCancel }) => {
  const displayTitle = title || (moduleName ? `${moduleName.toUpperCase()} CREATION` : '');

  return (
    <div className="standard-display">
      <div className="screen-title">{displayTitle}</div>
      
      <div className="master-grid">
        {children}
      </div>
      
      <div className="master-actions">
        <button className="btn btn-secondary" onClick={onCancel} type="button">
          Cancel
        </button>
        <button className="btn btn-primary" onClick={onSave} type="submit">
          Save
        </button>
      </div>
    </div>
  );
};

export default MasterFormLayout;
