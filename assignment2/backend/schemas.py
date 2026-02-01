from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime


class CompanyProfileBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    year_end: str = Field(..., description="Year end date, e.g., '12/31' or 'December 31'")
    address: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1)
    state: str = Field(..., min_length=2, max_length=2)
    zip_code: str = Field(..., min_length=5, max_length=10)
    country: str = Field(default="USA")
    legal_structure: Optional[str] = None

    @validator('state')
    def validate_state(cls, v):
        if len(v) != 2:
            raise ValueError('State must be 2 characters (e.g., CA, NY)')
        return v.upper()

    @validator('zip_code')
    def validate_zip_code(cls, v):
        if not v.replace('-', '').isdigit():
            raise ValueError('Zip code must be numeric')
        return v


class CompanyProfileCreate(CompanyProfileBase):
    pass


class CompanyProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    year_end: Optional[str] = None
    address: Optional[str] = Field(None, min_length=1)
    city: Optional[str] = Field(None, min_length=1)
    state: Optional[str] = Field(None, min_length=2, max_length=2)
    zip_code: Optional[str] = Field(None, min_length=5, max_length=10)
    country: Optional[str] = None
    legal_structure: Optional[str] = None

    @validator('state')
    def validate_state(cls, v):
        if v and len(v) != 2:
            raise ValueError('State must be 2 characters (e.g., CA, NY)')
        return v.upper() if v else v


class CompanyProfileResponse(CompanyProfileBase):
    id: int

    class Config:
        from_attributes = True


class DynamicInputs(BaseModel):
    """Dynamic inputs that can be provided by the user"""
    company_name: Optional[str] = None
    quarter: Optional[str] = Field(None, description="Q1, Q2, Q3, Q4, or FY")
    reporting_period: Optional[str] = None
    fiscal_year: Optional[int] = None
    additional_notes: Optional[str] = None

    @validator('quarter')
    def validate_quarter(cls, v):
        if v and v.upper() not in ['Q1', 'Q2', 'Q3', 'Q4', 'FY']:
            raise ValueError('Quarter must be Q1, Q2, Q3, Q4, or FY')
        return v.upper() if v else v

    @validator('fiscal_year')
    def validate_fiscal_year(cls, v):
        if v and (v < 1900 or v > 2100):
            raise ValueError('Fiscal year must be between 1900 and 2100')
        return v
