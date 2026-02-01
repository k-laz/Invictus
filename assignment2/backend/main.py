from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import os
from datetime import datetime

from database import SessionLocal, engine, Base
from models import CompanyProfile
from schemas import CompanyProfileCreate, CompanyProfileUpdate, CompanyProfileResponse, DynamicInputs

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Company Profile Manager API", version="1.0.0")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Company Profile Manager API"}


@app.get("/api/companies", response_model=List[CompanyProfileResponse])
def get_companies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all company profiles"""
    companies = db.query(CompanyProfile).offset(skip).limit(limit).all()
    return companies


@app.get("/api/companies/{company_id}", response_model=CompanyProfileResponse)
def get_company(company_id: int, db: Session = Depends(get_db)):
    """Get a specific company profile by ID"""
    company = db.query(CompanyProfile).filter(CompanyProfile.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@app.post("/api/companies", response_model=CompanyProfileResponse)
def create_company(company: CompanyProfileCreate, db: Session = Depends(get_db)):
    """Create a new company profile"""
    db_company = CompanyProfile(**company.dict())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company


@app.put("/api/companies/{company_id}", response_model=CompanyProfileResponse)
def update_company(
    company_id: int, 
    company_update: CompanyProfileUpdate, 
    db: Session = Depends(get_db)
):
    """Update an existing company profile"""
    db_company = db.query(CompanyProfile).filter(CompanyProfile.id == company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    update_data = company_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_company, field, value)
    
    db.commit()
    db.refresh(db_company)
    return db_company


@app.delete("/api/companies/{company_id}")
def delete_company(company_id: int, db: Session = Depends(get_db)):
    """Delete a company profile"""
    db_company = db.query(CompanyProfile).filter(CompanyProfile.id == company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    db.delete(db_company)
    db.commit()
    return {"message": "Company deleted successfully"}


@app.post("/api/companies/{company_id}/generate-output")
def generate_output(company_id: int, dynamic_inputs: DynamicInputs, db: Session = Depends(get_db)):
    """Generate structured JSON output combining company profile with dynamic inputs"""
    company = db.query(CompanyProfile).filter(CompanyProfile.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Combine static company data with dynamic inputs
    output = {
        "company_profile": {
            "id": company.id,
            "name": company.name,
            "year_end": company.year_end,
            "address": company.address,
            "city": company.city,
            "state": company.state,
            "zip_code": company.zip_code,
            "country": company.country,
            "legal_structure": company.legal_structure,
        },
        "dynamic_inputs": dynamic_inputs.dict(),
        "generated_at": datetime.now().isoformat(),
        "metadata": {
            "version": "1.0",
            "pipeline_ready": True
        }
    }
    
    return output


@app.get("/api/companies/{company_id}/download-json")
def download_json(company_id: int, db: Session = Depends(get_db)):
    """Download company profile as JSON file"""
    company = db.query(CompanyProfile).filter(CompanyProfile.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    output = {
        "company_profile": {
            "id": company.id,
            "name": company.name,
            "year_end": company.year_end,
            "address": company.address,
            "city": company.city,
            "state": company.state,
            "zip_code": company.zip_code,
            "country": company.country,
            "legal_structure": company.legal_structure,
        },
        "exported_at": datetime.now().isoformat()
    }
    
    # Create temporary file
    filename = f"company_{company_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    filepath = f"/tmp/{filename}"
    
    with open(filepath, 'w') as f:
        json.dump(output, f, indent=2)
    
    return FileResponse(
        filepath,
        media_type="application/json",
        filename=filename
    )
