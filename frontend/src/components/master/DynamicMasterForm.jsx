import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MASTER_CONFIG } from "../../utils/masterConfig.js";
import { safeArray } from "../../utils/safeArray.js";
import { createMaster, updateMaster, api } from "../../services/masterservice.js";
import MasterFormLayout from "./MasterFormLayout";
import SmartField from "./SmartField";
import "./master.css";

// Map config keys to API plural names used by getMasters
const API_NAME_MAP = {
  sender: "senders",
  consignee: "consignees",
  area: "areas",
  city: "cities",
  transport: "transports",
  p_trans: "ptrans",
  godown: "godowns",
  customer: "customers",
  supplier: "suppliers",
  flour_mill: "flour_mills",
  papad_company: "papad_companies",
  weight: "weights",
  ledger_group: "ledger_groups",
  ledger: "ledgers",
  item: "items",
  item_group: "item_groups",
  deduction_sales: "deduction_sales",
  deduction_purchase: "deduction_purchase",
};

export const DynamicMasterForm = ({ configKey }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const config = MASTER_CONFIG[configKey] || {};
  const title = config.title || configKey.replace(/_/g, " ").toUpperCase();

  // Flatten all fields from all sections
  const allFields = React.useMemo(() => {
    const fields = [];
    safeArray(config.sections).forEach((section) => {
      safeArray(section.fields).forEach((field) => {
        fields.push(field);
      });
    });
    return fields;
  }, [config]);

  const getInitialData = () => {
    const data = {};
    allFields.forEach((field) => {
      data[field.name] = field.defaultValue !== undefined ? field.defaultValue : "";
    });
    return data;
  };

  const [formData, setFormData] = useState(getInitialData);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Load existing record for edit mode
  useEffect(() => {
    if (!editId || !config.table) return;

    const loadRecord = async () => {
      try {
        const res = await api(`/masters/record/${config.table}/${editId}`);
        if (res && !res.message) {
          // res is the record object directly
          setFormData((prev) => ({ ...prev, ...res }));
        }
      } catch (err) {
        console.error("Failed to load record:", err);
      }
    };

    loadRecord();
  }, [editId, config.table]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    for (const field of allFields) {
      if (field.required && !formData[field.name]?.toString().trim()) {
        setMessage(`${field.label || field.name} is required`);
        setMessageType("error");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validate()) return;

    setLoading(true);

    try {
      let result;
      if (editId) {
        result = await updateMaster(config.table, editId, formData);
      } else {
        result = await createMaster(config.table, formData);
      }

      if (result && result.success) {
        setMessage(`${title} ${editId ? "updated" : "saved"} successfully!`);
        setMessageType("success");
        if (!editId) {
          setFormData(getInitialData());
        }
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Error: " + (result?.message || "Unknown error"));
        setMessageType("error");
      }
    } catch (error) {
      console.error("Save error:", error);
      setMessage(`Error ${editId ? "updating" : "saving"} ${title.toLowerCase()}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(getInitialData());
    setMessage("");
    navigate(`/master/${configKey}/display`);
  };

  return (
    <MasterFormLayout
      title={`${title} ${editId ? "Update" : "Create"}`}
      onSave={handleSubmit}
      onCancel={handleCancel}
    >
      {message && (
        <div className={`message ${messageType}`} style={{ gridColumn: "span 2", marginBottom: 12 }}>
          {message}
        </div>
      )}

      {allFields.map((field, idx) => (
        <SmartField
          key={`${field.name}_${idx}`}
          field={field}
          value={formData[field.name]}
          onChange={handleChange}
        />
      ))}

      {loading && (
        <div style={{ gridColumn: "span 2", textAlign: "center", padding: 12 }}>
          Saving...
        </div>
      )}
    </MasterFormLayout>
  );
};

export default DynamicMasterForm;

