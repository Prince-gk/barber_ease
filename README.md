## BARBEREASE PROJECT

#### BarberEase is a web application designed to streamline the process of booking and managing barber appointments. It provides a user-friendly interface for both customers and barbers, allowing for easy scheduling, profile management, and appointment tracking

Backend -> <https://barber-ease.onrender.com/docs>

Frontend -> <https://barber-ease.vercel.app/>

## Setup Instructions

You need to have Python 3.10+ and Node.js >=22 installed on your machine.

### Backend Setup

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/Prince-gk/barber_ease && cd barber_ease
   ```

2. **Create a Virtual Environment**:

   ```bash
   virtualenv .venv
   # Activate the Virtual Environment
    source .venv/bin/activate
   # Install Dependencies
    pip install -r requirements.txt
    ```

3. **Setup the database and run the application**:

   ```bash
   alembic init alembic
   alembic stamp head
   alembic revision --autogenerate -m "Initial migration"
   alembic upgrade head

   uvicorn main:app --reload
   # or
   fastapi dev main.py
   ```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

Access the application at `http://localhost:8080` and `http://localhost:8000/docs` for the API documentation.
