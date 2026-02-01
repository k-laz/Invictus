# Company Profile Manager & Input Validator

A full-stack web application for managing company profiles and generating structured outputs for document processing pipelines.

## Features

- **Company Profile Management**: Create, read, update, and delete company profiles
- **Input Validation**: Client-side and server-side validation for all inputs
- **Dynamic Input Form**: Capture user inputs (quarter, fiscal year, reporting period, etc.)
- **JSON Export**: Generate and download structured JSON files combining company profiles with dynamic inputs
- **Sample Data**: Pre-seeded with 3 sample companies

## Tech Stack

### Backend

- **FastAPI** - Modern Python web framework with automatic API documentation
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Lightweight database (no setup required)
- **Pydantic** - Data validation using Python type annotations

### Frontend

- **React** - UI library
- **Axios** - HTTP client for API calls
- **CSS3** - Modern styling with responsive design

## Setup Instructions

### Prerequisites

- **Python 3.11+** (Python 3.11, 3.12, or 3.13 recommended; check with `python3 --version`)
- **Node.js 16+** and **npm** (check with `node --version` and `npm --version`)

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Seed the database with sample companies:

   ```bash
   python seed_data.py
   ```

5. Start the FastAPI server:

   ```bash
   uvicorn main:app --reload --port 8000
   ```

   The API will be available at `http://localhost:8000`


### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the React development server:

   ```bash
   npm start
   ```

   The frontend will be available at `http://localhost:3000`

## Usage

### Managing Company Profiles

1. **View Companies**: All companies are listed in the left sidebar
2. **Create Company**: Click "+ New Company" button and fill in the form
3. **Edit Company**: Click the edit icon (✏️) next to a company or select it and click "Edit"
4. **Delete Company**: Click the delete icon (🗑️) next to a company
5. **View Details**: Click on a company to view its full profile

### API Endpoints

- `GET /api/companies` - Get all companies
- `GET /api/companies/{id}` - Get a specific company
- `POST /api/companies` - Create a new company
- `PUT /api/companies/{id}` - Update a company
- `DELETE /api/companies/{id}` - Delete a company
- `POST /api/companies/{id}/generate-output` - Generate output with dynamic inputs
- `GET /api/companies/{id}/download-json` - Download company JSON file

## Validation Rules

### Company Profile

- Company name: Required, 1-200 characters
- Year end: Required (e.g., "12/31" or "December 31")
- Address: Required
- City: Required
- State: Required, exactly 2 characters (e.g., "CA", "NY")
- Zip code: Required, 5-10 digits (supports format: 12345 or 12345-6789)
- Country: Optional, defaults to "USA"
- Legal structure: Optional

### Dynamic Inputs

- Quarter: Must be Q1, Q2, Q3, Q4, or FY (case-insensitive)
- Fiscal year: Must be between 1900 and 2100
- Other fields: Optional

## Output Format

The generated JSON output includes:

```json
{
  "company_profile": {
    "id": 1,
    "name": "Acme Corporation",
    "year_end": "12/31",
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "country": "USA",
    "legal_structure": "Corporation"
  },
  "dynamic_inputs": {
    "quarter": "Q1",
    "fiscal_year": 2024,
    "reporting_period": "Q1 2024",
    "additional_notes": "First quarter review"
  },
  "generated_at": "2024-01-15T10:30:00",
  "metadata": {
    "version": "1.0",
    "pipeline_ready": true
  }
}
```


