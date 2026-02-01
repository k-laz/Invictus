import React from 'react';
import './CompanyList.css';

function CompanyList({ companies, selectedCompany, onSelectCompany, onEditCompany, onDeleteCompany }) {
  if (companies.length === 0) {
    return (
      <div className="empty-state">
        <p>No companies yet. Create your first company!</p>
      </div>
    );
  }

  return (
    <div className="company-list">
      {companies.map(company => (
        <div
          key={company.id}
          className={`company-item ${selectedCompany?.id === company.id ? 'selected' : ''}`}
          onClick={() => onSelectCompany(company)}
        >
          <div className="company-item-content">
            <h3>{company.name}</h3>
            <p className="company-meta">{company.city}, {company.state}</p>
          </div>
          <div className="company-item-actions" onClick={(e) => e.stopPropagation()}>
            <button
              className="btn-icon"
              onClick={() => onEditCompany(company)}
              title="Edit"
            >
              ✏️
            </button>
            <button
              className="btn-icon btn-icon-danger"
              onClick={() => onDeleteCompany(company.id)}
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CompanyList;
