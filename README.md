# UTEP-EMR

Educational Electronic Medical Record (EMR) prototype built with **Supabase**, **FastAPI (Python)**, and **JavaScript**.

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
├── frontend/           # JavaScript frontend (Vite)
│   ├── src/
│   │   ├── App.js      # App root component
│   │   ├── index.js    # Entrypoint
│   │   └── styles.css
│   ├── index.html
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

### 3. Frontend (JavaScript)
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