import React, { useState, useEffect } from 'react';
import './App.css';
import CompanyList from './components/CompanyList';
import CompanyForm from './components/CompanyForm';
import DynamicInputForm from './components/DynamicInputForm';
import { getCompanies, createCompany, updateCompany, deleteCompany, generateOutput } from './services/api';

function App() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDynamicForm, setShowDynamicForm] = useState(false);
  const [outputData, setOutputData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await getCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Error loading companies:', error);
      alert('Failed to load companies. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (companyData) => {
    try {
      const newCompany = await createCompany(companyData);
      setCompanies([...companies, newCompany]);
      setShowForm(false);
      alert('Company created successfully!');
    } catch (error) {
      console.error('Error creating company:', error);
      alert('Failed to create company. Please check the form data.');
    }
  };

  const handleUpdateCompany = async (id, companyData) => {
    try {
      const updatedCompany = await updateCompany(id, companyData);
      setCompanies(companies.map(c => c.id === id ? updatedCompany : c));
      setSelectedCompany(updatedCompany);
      setShowForm(false);
      alert('Company updated successfully!');
    } catch (error) {
      console.error('Error updating company:', error);
      alert('Failed to update company. Please check the form data.');
    }
  };

  const handleDeleteCompany = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company?')) {
      return;
    }
    try {
      await deleteCompany(id);
      setCompanies(companies.filter(c => c.id !== id));
      if (selectedCompany?.id === id) {
        setSelectedCompany(null);
      }
      alert('Company deleted successfully!');
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Failed to delete company.');
    }
  };

  const handleGenerateOutput = async (dynamicInputs) => {
    if (!selectedCompany) {
      alert('Please select a company first.');
      return;
    }
    try {
      const output = await generateOutput(selectedCompany.id, dynamicInputs);
      setOutputData(output);
      setShowDynamicForm(false);
    } catch (error) {
      console.error('Error generating output:', error);
      alert('Failed to generate output. Please check your inputs.');
    }
  };

  const handleDownloadJSON = () => {
    if (!outputData) return;
    
    const dataStr = JSON.stringify(outputData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `company_output_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Company Profile Manager</h1>
        <p>Manage company profiles and generate structured outputs for document processing</p>
      </header>

      <main className="App-main">
        <div className="container">
          <div className="sidebar">
            <div className="sidebar-header">
              <h2>Companies</h2>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setSelectedCompany(null);
                  setShowForm(true);
                  setShowDynamicForm(false);
                }}
              >
                + New Company
              </button>
            </div>

            {loading ? (
              <div className="loading">Loading companies...</div>
            ) : (
              <CompanyList
                companies={companies}
                selectedCompany={selectedCompany}
                onSelectCompany={(company) => {
                  setSelectedCompany(company);
                  setShowForm(false);
                  setShowDynamicForm(false);
                  setOutputData(null);
                }}
                onEditCompany={(company) => {
                  setSelectedCompany(company);
                  setShowForm(true);
                  setShowDynamicForm(false);
                }}
                onDeleteCompany={handleDeleteCompany}
              />
            )}
          </div>

          <div className="content">
            {showForm ? (
              <CompanyForm
                company={selectedCompany}
                onSubmit={selectedCompany 
                  ? (data) => handleUpdateCompany(selectedCompany.id, data)
                  : handleCreateCompany
                }
                onCancel={() => {
                  setShowForm(false);
                  setSelectedCompany(null);
                }}
              />
            ) : showDynamicForm ? (
              <DynamicInputForm
                company={selectedCompany}
                onSubmit={handleGenerateOutput}
                onCancel={() => setShowDynamicForm(false)}
              />
            ) : selectedCompany ? (
              <div className="company-details">
                <div className="details-header">
                  <h2>{selectedCompany.name}</h2>
                  <div className="action-buttons">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowForm(true)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowDynamicForm(true)}
                    >
                      Generate Output
                    </button>
                  </div>
                </div>

                <div className="details-content">
                  <div className="detail-row">
                    <span className="detail-label">Year End:</span>
                    <span className="detail-value">{selectedCompany.year_end}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Address:</span>
                    <span className="detail-value">
                      {selectedCompany.address}, {selectedCompany.city}, {selectedCompany.state} {selectedCompany.zip_code}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Country:</span>
                    <span className="detail-value">{selectedCompany.country}</span>
                  </div>
                  {selectedCompany.legal_structure && (
                    <div className="detail-row">
                      <span className="detail-label">Legal Structure:</span>
                      <span className="detail-value">{selectedCompany.legal_structure}</span>
                    </div>
                  )}
                </div>

                {outputData && (
                  <div className="output-section">
                    <div className="output-header">
                      <h3>Generated Output</h3>
                      <button
                        className="btn btn-primary"
                        onClick={handleDownloadJSON}
                      >
                        Download JSON
                      </button>
                    </div>
                    <pre className="output-preview">
                      {JSON.stringify(outputData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="welcome-message">
                <h2>Welcome to Company Profile Manager</h2>
                <p>Select a company from the list or create a new one to get started.</p>
                <p>Use the "Generate Output" feature to combine company data with dynamic inputs for downstream processing.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
