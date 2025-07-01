from sqlmodel import Session, create_engine, select
from main import User, Service, Appointment, Review, Availability
from datetime import datetime, timedelta
from passlib.context import CryptContext
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DB_URL", "sqlite:///barber_ease.db")
print(DATABASE_URL)

engine = create_engine(DATABASE_URL, echo=True)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password):
    return pwd_context.hash(password)


def seed_db():
    with Session(engine) as session:
        # Clear existing data
        for model in [Review, Appointment, Availability, Service, User]:
            session.exec(model.__table__.delete())
        session.commit()

        now = datetime.now()

        # --- Users ---
        users = [
            # Barbers
            User(
                email="john.doe@example.com",
                hashed_password=get_password_hash("password123"),
                full_name="John Doe",
                is_barber=True,
                bio="Experienced barber specializing in classic cuts.",
            ),
            User(
                email="jane.smith@example.com",
                hashed_password=get_password_hash("password123"),
                full_name="Jane Smith",
                is_barber=True,
                bio="Modern barber with a passion for creative styles.",
            ),
            User(
                email="john.kamau@example.com",
                hashed_password=get_password_hash("password123"),
                full_name="John Kamau",
                is_barber=True,
                bio="Gen Z barber in Town",
            ),
            # Clients
            User(
                email="alice@example.com",
                hashed_password=get_password_hash("password123"),
                full_name="Alice Johnson",
                is_barber=False,
            ),
            User(
                email="bob@example.com",
                hashed_password=get_password_hash("password123"),
                full_name="Bob Wilson",
                is_barber=False,
            ),
            User(
                email="carol@example.com",
                hashed_password=get_password_hash("password123"),
                full_name="Carol Brown",
                is_barber=False,
            ),
        ]
        session.add_all(users)
        session.commit()
        for user in users:
            session.refresh(user)

        # --- Services ---
        services = [
            Service(
                barber_id=users[0].id,  # John Doe
                name="Classic Haircut",
                description="Traditional men's haircut",
                price=25.0,
                duration=30,
            ),
            Service(
                barber_id=users[0].id,
                name="Beard Trim",
                description="Precision beard shaping",
                price=15.0,
                duration=15,
            ),
            Service(
                barber_id=users[1].id,  # Jane Smith
                name="Fade Cut",
                description="Modern fade with clean lines",
                price=30.0,
                duration=40,
            ),
            Service(
                barber_id=users[1].id,
                name="Hot Shave",
                description="Luxury hot towel shave",
                price=20.0,
                duration=20,
            ),
            Service(
                barber_id=users[2].id,  # John Kamau
                name="Kids Cut",
                description="Quick and clean cuts for kids under 12",
                price=18.0,
                duration=20,
            ),
        ]
        session.add_all(services)
        session.commit()
        for service in services:
            session.refresh(service)

        # --- Appointments ---
        appointments = [
            Appointment(
                client_id=users[3].id,  # Alice
                barber_id=users[0].id,
                service_id=services[0].id,
                appointment_time=now + timedelta(days=1, hours=10),
                status="confirmed",
            ),
            Appointment(
                client_id=users[4].id,  # Bob
                barber_id=users[0].id,
                service_id=services[1].id,
                appointment_time=now + timedelta(days=1, hours=11),
                status="pending",
            ),
            Appointment(
                client_id=users[5].id,  # Carol
                barber_id=users[1].id,
                service_id=services[2].id,
                appointment_time=now - timedelta(days=1, hours=2),
                status="completed",
            ),
            Appointment(
                client_id=users[4].id,
                barber_id=users[2].id,
                service_id=services[4].id,
                appointment_time=now - timedelta(days=3),
                status="completed",
            ),
        ]
        session.add_all(appointments)
        session.commit()
        for appt in appointments:
            session.refresh(appt)

        # --- Reviews ---
        reviews = [
            Review(
                appointment_id=appointments[2].id,  # Carol → Jane Smith
                client_id=users[5].id,
                barber_id=users[1].id,
                rating=5,
                comment="Jane gave me the sharpest fade ever!",
                created_at=now,
            ),
            Review(
                appointment_id=appointments[3].id,  # Bob → John Kamau
                client_id=users[4].id,
                barber_id=users[2].id,
                rating=4,
                comment="Great with kids. Fast and professional.",
                created_at=now,
            ),
        ]
        session.add_all(reviews)
        session.commit()

        # --- Availability ---
        availability = [
            Availability(
                barber_id=users[0].id,
                start_time=now + timedelta(days=1, hours=9),
                end_time=now + timedelta(days=1, hours=17),
            ),
            Availability(
                barber_id=users[1].id,
                start_time=now + timedelta(days=1, hours=10),
                end_time=now + timedelta(days=1, hours=18),
            ),
            Availability(
                barber_id=users[2].id,
                start_time=now + timedelta(days=2, hours=8),
                end_time=now + timedelta(days=2, hours=16),
            ),
        ]
        session.add_all(availability)
        session.commit()

        print("✅ Database seeded successfully!")


if __name__ == "__main__":
    seed_db()
