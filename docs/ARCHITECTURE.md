# System Architecture Overview

This document outlines the high-level architecture of the UTEP-EMR project.

## High-Level Diagram

```text
┌────────────────────────────────────────────────────────┐
│                   JavaScript Frontend                  │
│  - Supabase Auth (Login / Sign-up / Session)           │
│  - EMR Interface (Student, Instructor, Admin)          │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
        Direct Auth & RLS         FastAPI Requests
      (Supabase JS Client)        (Bearer Token)
                │                        │
                ▼                        ▼
┌────────────────────────┐      ┌────────────────────────┐
│     Supabase Cloud     │      │     FastAPI Backend    │
│  - PostgreSQL Database │◄────►│  - Business Logic      │
│  - Row Level Security  │      │  - EMR Endpoints       │
│  - Triggers & RPCs     │      │  - Supabase Python SDK │
└────────────────────────┘      └────────────────────────┘
```

## Core Components

### 1. Database & Authentication (`supabase/`)
- Powered by Supabase (PostgreSQL + GoTrue Auth).
- Database migrations manage schema evolution (`supabase/migrations/`).
- User authentication links `auth.users` to `public.profiles`.
- Row-Level Security (RLS) policies enforce authorization at the database level.
- Stored procedures (e.g. `grant_admin`, `remove_admin`) govern role transitions.

### 2. Backend API (`backend/`)
- Built with Python and FastAPI.
- Handles complex business logic, validation, data transformation, and external integrations.
- Connects to Supabase via `supabase-py`.

### 3. Frontend Client (`frontend/`)
- Client-side application using JavaScript.
- Uses `@supabase/supabase-js` for authentication and session management.
- Calls FastAPI for backend services.
