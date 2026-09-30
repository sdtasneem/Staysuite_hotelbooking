# StaySuite: Architecture & Engineering Overview

## System Architecture

```text
+--------------------------------------------------------------+
|                    Client Layer (Vite + React)               |
|  - Booking Engine & Guest Operations UI                      |
|  - Real-time Destination Context (REST Countries API)        |
|  - Live Local Weather Widget (Open-Meteo API)                |
+------------------------------+-------------------------------+
                               |
                               | REST API Calls (CORS enabled)
                               v
+--------------------------------------------------------------+
|                    Backend Layer (Node.js + Express)         |
|  - Centralized Environment Config                            |
|  - Structured Error Handling & Logging                       |
|  - RESTful Controllers & Services Architecture               |
+------------------------------+-------------------------------+
                               |
                               | PostgreSQL Connections / Supabase Client
                               v
+--------------------------------------------------------------+
|                    Data Layer (Supabase PostgreSQL)          |
|  - Authentication & Row Level Security (RLS)                 |
|  - Normalized Hotel Operations & Booking Models              |
+--------------------------------------------------------------+
```

## Directory Structure

- **`frontend/`**: React 18 single-page application powered by Vite.
- **`backend/`**: Node.js REST API with Express.js.
- **`database/`**: SQL schemas, seeds, and migration scripts.
- **`docs/`**: Architecture and system design documentation.
