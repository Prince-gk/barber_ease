from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import SQLModel, Field, Session, create_engine, select
from typing import Optional, List
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
import os
from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles
# from fastapi.responses import FileResponse
# from starlette.responses import FileResponse


# FastAPI app
app = FastAPI(title="BarberEase API")

origins = [
    "*",
    "*ngrok*",
    "http://localhost",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Database configuration
# DATABASE_URL = "postgresql://user:password@localhost:5432/barberease"

DATABASE_URL = "sqlite:///barber_ease.db"
engine = create_engine(DATABASE_URL, echo=True)
SQLModel.metadata.create_all(engine)

# JWT configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# Database Models
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    is_barber: bool = False
    date_created: datetime|None = None
    full_name: str
    bio: Optional[str] = None


class Appointment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    client_id: int = Field(foreign_key="user.id")
    barber_id: int = Field(foreign_key="user.id")
    service_id: int = Field(foreign_key="service.id")
    appointment_time: datetime
    status: str = "pending"  # pending, confirmed, declined, completed


class Service(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    barber_id: int = Field(foreign_key="user.id")
    name: str
    description: Optional[str] = None
    price: float
    duration: int  # in minutes


class Review(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    appointment_id: int = Field(foreign_key="appointment.id", unique=True)
    client_id: int = Field(foreign_key="user.id")
    barber_id: int = Field(foreign_key="user.id")
    rating: int  # 1-5
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Availability(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    barber_id: int = Field(foreign_key="user.id")
    start_time: datetime
    end_time: datetime


# Pydantic models for API
class Token(BaseModel):
    access_token: str
    token_type: str


class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    is_barber: bool = False
    bio: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    is_barber: bool
    bio: Optional[str] = None


class AppointmentCreate(BaseModel):
    barber_id: int
    service_id: int
    appointment_time: datetime


class AppointmentResponse(BaseModel):
    id: int
    client_id: int
    barber_id: int
    barber_name: str
    service_id: int
    service_name: str
    appointment_time: datetime
    status: str


class ServiceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    duration: int


class ReviewCreate(BaseModel):
    appointment_id: int
    rating: int
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    appointment_id: int
    client_id: int
    client_name: str
    barber_id: int
    rating: int
    comment: Optional[str]
    created_at: datetime


class AvailabilityCreate(BaseModel):
    start_time: datetime
    end_time: datetime


# Authentication functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == email)).first()
        if user is None:
            raise credentials_exception
        return user


# Database initialization
def init_db():
    SQLModel.metadata.create_all(engine)


@app.on_event("startup")
def on_startup():
    init_db()


# # Serve the static assets (JS/CSS/images) at /static
# app.mount("/static", StaticFiles(directory="client/dist", html=True), name="static")

# # Serve index.html at root
# @app.get("/")
# def read_index():
#     return FileResponse("client/dist/index.html")

# # Fallback route for client-side routing (SPA)
# @app.get("/{full_path:path}")
# async def spa_fallback(full_path: str):
#     file_path = os.path.join("client", "dist", full_path)
    
#     # If the file exists (e.g., /static/js/app.js), serve it directly
#     if os.path.exists(file_path) and not os.path.isdir(file_path):
#         return FileResponse(file_path)
    
#     # Otherwise, fallback to index.html (SPA route)
#     return FileResponse("client/dist/index.html")

# API Endpoints
@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    with Session(engine) as session:
        user = session.exec(
            select(User).where(User.email == form_data.username)
        ).first()
        if not user or not verify_password(form_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer"}


@app.post("/users/", response_model=UserResponse)
def create_user(user: UserCreate):
    with Session(engine) as session:
        db_user = User(
            email=user.email,
            hashed_password=get_password_hash(user.password),
            full_name=user.full_name,
            is_barber=user.is_barber,
            bio=user.bio,
        )
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return db_user


@app.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@app.post("/appointments/", response_model=Appointment)
async def create_appointment(
    appointment: AppointmentCreate, current_user: User = Depends(get_current_user)
):
    with Session(engine) as session:
        db_appointment = Appointment(
            client_id=current_user.id,
            barber_id=appointment.barber_id,
            service_id=appointment.service_id,
            appointment_time=appointment.appointment_time,
        )
        session.add(db_appointment)
        session.commit()
        session.refresh(db_appointment)
        return db_appointment


@app.get("/appointments/me", response_model=List[AppointmentResponse])
async def get_user_appointments(current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        appointments = session.exec(
            select(
                Appointment,
                User.full_name.label("barber_name"),
                Service.name.label("service_name"),
            )
            .join(User, User.id == Appointment.barber_id)
            .join(Service, Service.id == Appointment.service_id)
            .where(
                (Appointment.client_id == current_user.id)
                | (Appointment.barber_id == current_user.id)
            )
        ).all()
        return [
            AppointmentResponse(
                id=appointment.Appointment.id,
                client_id=appointment.Appointment.client_id,
                barber_id=appointment.Appointment.barber_id,
                barber_name=appointment.barber_name,
                service_id=appointment.Appointment.service_id,
                service_name=appointment.service_name,
                appointment_time=appointment.Appointment.appointment_time,
                status=appointment.Appointment.status,
            )
            for appointment in appointments
        ]


@app.post("/services/", response_model=Service)
async def create_service(
    service: ServiceCreate, current_user: User = Depends(get_current_user)
):
    if not current_user.is_barber:
        raise HTTPException(status_code=403, detail="Only barbers can create services")
    with Session(engine) as session:
        db_service = Service(
            barber_id=current_user.id,
            name=service.name,
            description=service.description,
            price=service.price,
            duration=service.duration,
        )
        session.add(db_service)
        session.commit()
        session.refresh(db_service)
        return db_service


@app.post("/reviews/", response_model=Review)
async def create_review(
    review: ReviewCreate, current_user: User = Depends(get_current_user)
):
    with Session(engine) as session:
        appointment = session.get(Appointment, review.appointment_id)
        if not appointment or appointment.client_id != current_user.id:
            raise HTTPException(status_code=403, detail="Invalid appointment")
        db_review = Review(
            appointment_id=review.appointment_id,
            client_id=current_user.id,
            barber_id=appointment.barber_id,
            rating=review.rating,
            comment=review.comment,
        )
        session.add(db_review)
        session.commit()
        session.refresh(db_review)
        return db_review


@app.get("/reviews/", response_model=List[ReviewResponse])
async def get_barber_reviews(barber_id: int):
    with Session(engine) as session:
        reviews = session.exec(
            select(Review, User.full_name.label("client_name"))
            .join(User, User.id == Review.client_id)
            .where(Review.barber_id == barber_id)
        ).all()
        return [
            ReviewResponse(
                id=review.Review.id,
                appointment_id=review.Review.appointment_id,
                client_id=review.Review.client_id,
                client_name=review.client_name,
                barber_id=review.Review.barber_id,
                rating=review.Review.rating,
                comment=review.Review.comment,
                created_at=review.Review.created_at,
            )
            for review in reviews
        ]


@app.get("/barbers/{barber_id}/rating")
def get_barber_rating(barber_id: int):
    with Session(engine) as session:
        reviews = session.exec(
            select(Review).where(Review.barber_id == barber_id)
        ).all()
        if not reviews:
            return {"average": 0.0, "count": 0}

        total = sum(review.rating for review in reviews)
        average = total / len(reviews)
        return {"average": round(average, 1), "count": len(reviews)}


@app.post("/availability/", response_model=Availability)
async def create_availability(
    availability: AvailabilityCreate, current_user: User = Depends(get_current_user)
):
    if not current_user.is_barber:
        raise HTTPException(status_code=403, detail="Only barbers can set availability")
    with Session(engine) as session:
        db_availability = Availability(
            barber_id=current_user.id,
            start_time=availability.start_time,
            end_time=availability.end_time,
        )
        session.add(db_availability)
        session.commit()
        session.refresh(db_availability)
        return db_availability


@app.get("/barbers/", response_model=List[UserResponse])
async def get_barbers():
    with Session(engine) as session:
        barbers = session.exec(select(User).where(User.is_barber == True)).all()
        return barbers


@app.get("/services/", response_model=List[Service])
async def get_services(barber_id: int):
    with Session(engine) as session:
        services = session.exec(
            select(Service).where(Service.barber_id == barber_id)
        ).all()
        return services
