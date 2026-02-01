import React, { useState, useEffect } from 'react';
import './CompanyForm.css';

function CompanyForm({ company, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    year_end: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'USA',
    legal_structure: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        year_end: company.year_end || '',
        address: company.address || '',
        city: company.city || '',
        state: company.state || '',
        zip_code: company.zip_code || '',
        country: company.country || 'USA',
        legal_structure: company.legal_structure || ''
      });
    }
  }, [company]);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }

    if (!formData.year_end.trim()) {
      newErrors.year_end = 'Year end is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    } else if (formData.state.length !== 2) {
      newErrors.state = 'State must be 2 characters (e.g., CA, NY)';
    }

    if (!formData.zip_code.trim()) {
      newErrors.zip_code = 'Zip code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zip_code)) {
      newErrors.zip_code = 'Invalid zip code format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'state' ? value.toUpperCase() : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="company-form">
      <h2>{company ? 'Edit Company' : 'Create New Company'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Company Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="year_end">Year End *</label>
          <input
            type="text"
            id="year_end"
            name="year_end"
            value={formData.year_end}
            onChange={handleChange}
            placeholder="e.g., 12/31 or December 31"
            className={errors.year_end ? 'error' : ''}
          />
          {errors.year_end && <span className="error-message">{errors.year_end}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="address">Address *</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={errors.address ? 'error' : ''}
          />
          {errors.address && <span className="error-message">{errors.address}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city">City *</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={errors.city ? 'error' : ''}
            />
            {errors.city && <span className="error-message">{errors.city}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="state">State *</label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              maxLength="2"
              placeholder="e.g., CA"
              className={errors.state ? 'error' : ''}
            />
            {errors.state && <span className="error-message">{errors.state}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="zip_code">Zip Code *</label>
            <input
              type="text"
              id="zip_code"
              name="zip_code"
              value={formData.zip_code}
              onChange={handleChange}
              placeholder="12345"
              className={errors.zip_code ? 'error' : ''}
            />
            {errors.zip_code && <span className="error-message">{errors.zip_code}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="country">Country</label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="legal_structure">Legal Structure</label>
            <select
              id="legal_structure"
              name="legal_structure"
              value={formData.legal_structure}
              onChange={handleChange}
            >
              <option value="">Select...</option>
              <option value="Corporation">Corporation</option>
              <option value="LLC">LLC</option>
              <option value="Partnership">Partnership</option>
              <option value="Sole Proprietorship">Sole Proprietorship</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {company ? 'Update' : 'Create'} Company
          </button>
        </div>
      </form>
    </div>
  );
}

export default CompanyForm;
