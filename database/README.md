# StaySuite Database (Supabase PostgreSQL)

This directory manages the relational database layer for the StaySuite Hotel Booking & Guest Operations Portal.

## Architecture

- **Engine:** PostgreSQL hosted via Supabase
- **Files:**
  - `schema.sql`: Table DDL, relational constraints, indices, and Row Level Security (RLS) policies.
  - `seed.sql`: Initial seed data (room types, standard amenities, sample bookings, test users).

## Setup Instructions

1. Create a Supabase project at [https://supabase.com](https://supabase.com).
2. Obtain your Project URL and Anon/Service Role API keys from **Project Settings > API**.
3. Place your credentials in `backend/.env` (refer to `.env.example`).
4. Schema migrations and seed scripts will be applied in Phase 2 via the Supabase SQL editor or CLI.
