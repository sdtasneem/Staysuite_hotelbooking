# Staysuite_hotelbooking

## StaySuite: Hotel Booking & Guest Operations Portal

StaySuite is a full-stack hotel reservation and guest operations management platform built with React, Vite, Node.js, Express, and Supabase PostgreSQL.

---

### Project Architecture & Folder Structure

```text
Staysuite_hotelbooking/
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── env.js
│   │   ├── controllers/
│   │   │   └── healthController.js
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   └── notFoundHandler.js
│   │   ├── routes/
│   │   │   └── healthRoutes.js
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.js
│   ├── .env.example
│   └── package.json
│
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── README.md
│
├── docs/
│   └── architecture.md
│
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

---

### Getting Started

#### 1. Install Dependencies
Run from the root directory:
```bash
npm run install:all
```
Or install in each directory individually:
```bash
# Root
npm install

# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

#### 2. Environment Configuration
Copy `.env.example` to `.env` in both `backend/` and `frontend/`:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

#### 3. Running the Application

##### Run Both Concurrently (from Root)
```bash
npm run dev
```

##### Run Backend Only
```bash
npm run backend
# or: cd backend && npm run dev
```
Health endpoint: `http://localhost:5000/api/health`

##### Run Frontend Only
```bash
npm run frontend
# or: cd frontend && npm run dev
```
Access in browser: `http://localhost:5173`

---

### Technology Stack
- **Frontend:** React 18, Vite, Lucide Icons, Vanilla CSS Design System
- **Backend:** Node.js, Express.js, CORS, Morgan, Dotenv
- **Database:** Supabase PostgreSQL
- **External APIs:** Open-Meteo Weather API, REST Countries API