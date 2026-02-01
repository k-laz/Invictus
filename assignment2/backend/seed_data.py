"""
Seed script to populate the database with sample company data
"""
from database import SessionLocal
from models import CompanyProfile

# Sample company data
sample_companies = [
    {
        "name": "Acme Corporation",
        "year_end": "12/31",
        "address": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "zip_code": "10001",
        "country": "USA",
        "legal_structure": "Corporation"
    },
    {
        "name": "TechStart LLC",
        "year_end": "06/30",
        "address": "456 Innovation Drive",
        "city": "San Francisco",
        "state": "CA",
        "zip_code": "94102",
        "country": "USA",
        "legal_structure": "LLC"
    },
    {
        "name": "Global Manufacturing Inc.",
        "year_end": "09/30",
        "address": "789 Industrial Boulevard",
        "city": "Chicago",
        "state": "IL",
        "zip_code": "60601",
        "country": "USA",
        "legal_structure": "Corporation"
    }
]


def seed_database():
    db = SessionLocal()
    try:
        # Check if companies already exist
        existing_count = db.query(CompanyProfile).count()
        if existing_count > 0:
            print(f"Database already contains {existing_count} companies. Skipping seed.")
            return

        # Add sample companies
        for company_data in sample_companies:
            company = CompanyProfile(**company_data)
            db.add(company)
        
        db.commit()
        print(f"Successfully seeded {len(sample_companies)} companies into the database.")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
