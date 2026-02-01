import React, { useState } from 'react';
import './DynamicInputForm.css';

function DynamicInputForm({ company, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    company_name: '',
    quarter: '',
    reporting_period: '',
    fiscal_year: '',
    additional_notes: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (formData.quarter && !['Q1', 'Q2', 'Q3', 'Q4', 'FY'].includes(formData.quarter.toUpperCase())) {
      newErrors.quarter = 'Quarter must be Q1, Q2, Q3, Q4, or FY';
    }

    if (formData.fiscal_year) {
      const year = parseInt(formData.fiscal_year);
      if (isNaN(year) || year < 1900 || year > 2100) {
        newErrors.fiscal_year = 'Fiscal year must be between 1900 and 2100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quarter' ? value.toUpperCase() : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Clean up empty strings
      const cleanedData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          key,
          typeof value === 'string' ? value.trim() || null : value
        ])
      );
      onSubmit(cleanedData);
    }
  };

  return (
    <div className="dynamic-input-form">
      <div className="form-header">
        <h2>Generate Output</h2>
        <p className="form-subtitle">
          Combine <strong>{company?.name}</strong> profile with dynamic inputs for downstream processing
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="company_name">Company Name (Override)</label>
          <input
            type="text"
            id="company_name"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            placeholder={company?.name || 'Enter company name'}
          />
          <small>Leave empty to use profile name</small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="quarter">Quarter</label>
            <select
              id="quarter"
              name="quarter"
              value={formData.quarter}
              onChange={handleChange}
              className={errors.quarter ? 'error' : ''}
            >
              <option value="">Select...</option>
              <option value="Q1">Q1</option>
              <option value="Q2">Q2</option>
              <option value="Q3">Q3</option>
              <option value="Q4">Q4</option>
              <option value="FY">FY (Full Year)</option>
            </select>
            {errors.quarter && <span className="error-message">{errors.quarter}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="fiscal_year">Fiscal Year</label>
            <input
              type="number"
              id="fiscal_year"
              name="fiscal_year"
              value={formData.fiscal_year}
              onChange={handleChange}
              placeholder="2024"
              min="1900"
              max="2100"
              className={errors.fiscal_year ? 'error' : ''}
            />
            {errors.fiscal_year && <span className="error-message">{errors.fiscal_year}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="reporting_period">Reporting Period</label>
          <input
            type="text"
            id="reporting_period"
            name="reporting_period"
            value={formData.reporting_period}
            onChange={handleChange}
            placeholder="e.g., Q1 2024, FY 2023"
          />
        </div>

        <div className="form-group">
          <label htmlFor="additional_notes">Additional Notes</label>
          <textarea
            id="additional_notes"
            name="additional_notes"
            value={formData.additional_notes}
            onChange={handleChange}
            rows="4"
            placeholder="Any additional information for downstream processing..."
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Generate Output
          </button>
        </div>
      </form>
    </div>
  );
}

export default DynamicInputForm;
