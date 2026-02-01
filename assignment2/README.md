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
  - Note: If using Python 3.13, ensure you have the latest package versions (already included in requirements.txt)
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

   - API Documentation: `http://localhost:8000/docs` (Swagger UI)
   - Alternative docs: `http://localhost:8000/redoc`

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

### Generating Output

1. Select a company from the list
2. Click "Generate Output" button
3. Fill in the dynamic inputs form:
   - **Company Name**: Optional override (defaults to profile name)
   - **Quarter**: Select Q1, Q2, Q3, Q4, or FY
   - **Fiscal Year**: Enter a year (1900-2100)
   - **Reporting Period**: Free text field
   - **Additional Notes**: Any extra information
4. Click "Generate Output" to create the structured JSON
5. Click "Download JSON" to save the file

### API Endpoints

- `GET /api/companies` - Get all companies
- `GET /api/companies/{id}` - Get a specific company
- `POST /api/companies` - Create a new company
- `PUT /api/companies/{id}` - Update a company
- `DELETE /api/companies/{id}` - Delete a company
- `POST /api/companies/{id}/generate-output` - Generate output with dynamic inputs
- `GET /api/companies/{id}/download-json` - Download company JSON file

## Sample Data

The database is pre-seeded with 3 sample companies:

- **Acme Corporation** (New York, NY)
- **TechStart LLC** (San Francisco, CA)
- **Global Manufacturing Inc.** (Chicago, IL)

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

## Troubleshooting

### Backend Issues

- **Port already in use**: Change the port in the uvicorn command: `--port 8001`
- **Database errors**: Delete `company_profiles.db` and run `seed_data.py` again
- **Import errors**: Make sure you're in the backend directory and virtual environment is activated

### Frontend Issues

- **Cannot connect to API**: Ensure the backend is running on port 8000
- **CORS errors**: Check that the backend CORS middleware includes your frontend URL
- **Build errors**: Delete `node_modules` and run `npm install` again

## Development Notes

- The backend uses SQLite for simplicity (no database server required)
- CORS is configured to allow requests from common React dev server ports
- All API endpoints include proper error handling and validation
- The frontend includes client-side validation for better UX
- JSON output is formatted for easy reading and downstream processing

## Next Steps

For production deployment, consider:

- Using PostgreSQL or another production database
- Adding authentication/authorization
- Implementing pagination for large company lists
- Adding unit and integration tests
- Setting up CI/CD pipeline
