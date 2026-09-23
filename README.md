# UTEP-EMR

Educational Electronic Medical Record (EMR) prototype built with **Supabase**, **FastAPI (Python)**, and **React**.

---

## Repository Structure

```text
UTEP-EMR/
├── backend/            # FastAPI Python backend
│   ├── app/
│   │   ├── main.py     # Application entrypoint
│   │   └── __init__.py
│   └── requirements.txt
│
├── frontend/           # React frontend (Vite)
│   ├── src/
│   │   ├── pages/      # React components for pages (e.g., Login, Dashboard)
│   │   ├── services/   # Supabase auth and API services
│   │   ├── App.jsx     # App root component
│   │   ├── index.jsx   # Entrypoint
│   │   ├── supabase.js # Supabase client initialization
│   │   └── styles.css
│   ├── index.html
│   ├── vite.config.js  # Vite configuration
│   └── package.json
│
├── supabase/           # Supabase database configuration & migrations
│   ├── config.toml
│   ├── migrations/
│   └── tests/
│
├── docs/               # Project documentation
│   ├── ARCHITECTURE.md
│   └── DESIGN_DECISIONS.md
│
├── .env.example        # Root environment template
└── .gitignore
```

---

## Quickstart

### 1. Database (Supabase)
Requires Docker Desktop and Node.js.
```bash
# Start local Supabase services
npx supabase start

# Apply migrations & reset DB if needed
npx supabase db reset

# Stop services when done
npx supabase stop
```

### 2. Backend (FastAPI)
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Interactive API docs will be at `http://127.0.0.1:8000/docs`.

### 3. Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

---

## Branching Strategy

- **`main`**: Production / release branch.
- **`develop`**: Primary integration branch for active development.
- **`feature/<name>`**: Feature branches cut from `develop` and merged via Pull Request.
## Seeding Test Data
We have included a seed script to easily populate your local database with test users and sample patient data. 
See the **[Seeding Guide](frontend/SEEDING.md)** for instructions on how to run it and add your own test data.
