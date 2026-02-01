from sqlalchemy import Column, Integer, String, Date
from database import Base


class CompanyProfile(Base):
    __tablename__ = "company_profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    year_end = Column(String, nullable=False)  # e.g., "12/31" or "December 31"
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    zip_code = Column(String, nullable=False)
    country = Column(String, default="USA")
    legal_structure = Column(String)  # e.g., "Corporation", "LLC", "Partnership"
