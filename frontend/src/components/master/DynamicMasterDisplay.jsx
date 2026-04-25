import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MASTER_CONFIG } from "../../utils/masterConfig.js";
import { safeArray } from "../../utils/safeArray.js";
import { getAllMasters, deleteMaster } from "../../services/masterservice.js";
import MasterTableLayout from "./MasterTableLayout";
import "./master.css";

export const DynamicMasterDisplay = ({ configKey }) => {
  const navigate = useNavigate();
  const config = MASTER_CONFIG[configKey] || {};
  const title = config.title || configKey.replace(/_/g, " ").toUpperCase();
  const tableName = config.table || configKey;

  // Auto-generate columns from first section fields (up to 6) + status
  const columns = React.useMemo(() => {
    const cols = [{ key: "sno", title: "S.No", width: "50px", render: (_, __, index) => index + 1 }];

    const allFields = [];
    safeArray(config.sections).forEach((section) => {
      safeArray(section.fields).forEach((field) => {
        allFields.push(field);
      });
    });

    // Take first 6 visible fields
    const displayFields = allFields.filter((f) => !f.hidden).slice(0, 6);
    displayFields.forEach((field) => {
      cols.push({
        key: field.name,
        title: field.label || field.name,
      });
    });

    // Add status if present in fields AND not already in displayFields
    const hasStatusInDisplay = displayFields.some((f) => f.name === "status");
    if (!hasStatusInDisplay && allFields.some((f) => f.name === "status")) {
      cols.push({ key: "status", title: "Status", width: "80px" });
    }

    return cols;
  }, [config]);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getAllMasters(tableName);
      setData(safeArray(result));
    } catch (error) {
      console.error(`Error loading ${title}:`, error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadData();
  }, [tableName]);

  const handleDelete = async (row) => {
    if (!window.confirm(`Are you sure you want to delete this ${title.toLowerCase()}?`)) return;

    try {
      const result = await deleteMaster(config.table, row.id);
      if (result && result.success) {
        alert(`${title} deleted successfully`);
        loadData();
      } else {
        alert("Error deleting: " + (result?.message || "Unknown error"));
      }
    } catch (error) {
      alert("Error deleting");
      console.error("Delete error:", error);
    }
  };

  const handleEdit = (row) => {
    navigate(`/master/${configKey}/create?edit=${row.id}`);
  };

  return (
    <MasterTableLayout
      title={`${title} MASTER`}
      columns={columns}
      data={data}
      onEdit={handleEdit}
      onDelete={handleDelete}
      showActions={true}
    />
  );
};

export default DynamicMasterDisplay;
