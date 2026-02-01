import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Company endpoints
export const getCompanies = async () => {
  const response = await api.get('/api/companies');
  return response.data;
};

export const getCompany = async (id) => {
  const response = await api.get(`/api/companies/${id}`);
  return response.data;
};

export const createCompany = async (companyData) => {
  const response = await api.post('/api/companies', companyData);
  return response.data;
};

export const updateCompany = async (id, companyData) => {
  const response = await api.put(`/api/companies/${id}`, companyData);
  return response.data;
};

export const deleteCompany = async (id) => {
  const response = await api.delete(`/api/companies/${id}`);
  return response.data;
};

// Output generation
export const generateOutput = async (companyId, dynamicInputs) => {
  const response = await api.post(`/api/companies/${companyId}/generate-output`, dynamicInputs);
  return response.data;
};

export const downloadCompanyJSON = async (companyId) => {
  const response = await api.get(`/api/companies/${companyId}/download-json`, {
    responseType: 'blob',
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `company_${companyId}_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export default api;
