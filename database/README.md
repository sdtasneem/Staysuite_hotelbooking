# StaySuite Database (Supabase PostgreSQL)

This directory defines the relational database architecture and seed datasets for the **StaySuite Hotel Booking & Guest Operations Portal**, strictly adhering to the **Project 15** specification.

---

## 1. Core Architecture (Project 15 Model)

The database schema is organized around 7 primary entities, fortified by database-level constraints and Row-Level Security (RLS).

### Core Tables
1. **`users`**: Application user/account records.
   - Roles: `GUEST`, `FRONT_DESK`, `MANAGER`.
   - Bridges to Supabase `auth.users(id)` via `auth_user_id`.
   - Contains no plaintext passwords or sensitive secrets.
2. **`guests`**: Guest master records containing guest details, contact info, passport/ID, VIP status, and preferences.
   - Connected to `users.id` via `user_id` foreign key.
3. **`room_types`**: Room categories defining name, description, capacity, base price per night, weekend multiplier, bed types, dimensions, and amenities.
4. **`rooms`**: Physical room inventory tracking room numbers, floor numbers, room types, and current operational statuses (`available`, `occupied`, `cleaning`, `maintenance`, `reserved`).
5. **`bookings`**: The central reservation engine.
   - References `guests.id` and `rooms.id`.
   - Stores check-in and check-out dates, guest counts, nightly rates, total amounts, and statuses (`pending`, `confirmed`, `checked_in`, `checked_out`, `cancelled`).
   - Enforces check constraint: `check_out_date > check_in_date`.
6. **`stay_events`**: Immutable timeline of reservation and stay lifecycle events:
   - Event types: `CHECK_IN`, `CHECK_OUT`, `ROOM_ASSIGNED`, `ROOM_TRANSFERRED`, `KEY_ISSUED`, `KEY_REVOKED`, `LATE_CHECKOUT_APPROVED`, `MAINTENANCE_LOGGED`.
   - Tracks timestamp and performing staff/manager user.
7. **`audit_logs`**: Observable administrative and system action ledger:
   - Tracks user ID, action (`INSERT`, `UPDATE`, `DELETE`, etc.), entity type, entity ID, previous state (`old_values` JSONB), and new state (`new_values` JSONB).

---

## 2. Supporting Tables (Preserved & Harmonized)

- **`destinations`**: City and country metadata with latitude/longitude for **Open-Meteo Weather API** and ISO country codes for **REST Countries**.
- **`hotels`**: Property definitions with check-in/out schedules and contact details.
- **`amenities` & `hotel_amenities`**: Master catalog of facilities with Lucide icon references.
- **`payments`**: Payment ledger capturing transaction references, amounts, and statuses.
- **`service_requests`** *(Optional)*: Guest in-stay requests (room service, extra pillows, concierge).
- **`housekeeping_logs`** *(Optional)*: Housekeeping turnover logs.
- **`reviews`** *(Optional)*: Verified stay guest feedback and ratings.

---

## 3. Critical: Database-Level Booking Overlap Protection

Double-bookings are prevented **at the PostgreSQL engine level** using the `btree_gist` extension and an exclusion constraint with half-open date ranges (`[)`):

```sql
CREATE EXTENSION IF NOT EXISTS "btree_gist";

ALTER TABLE public.bookings
ADD CONSTRAINT prevent_overlapping_room_bookings
EXCLUDE USING gist (
    room_id WITH =,
    daterange(check_in_date, check_out_date, '[)') WITH &&
)
WHERE (booking_status NOT IN ('cancelled'));
```

### How It Works:
- `[`: Inclusive check-in date (guest arrives afternoon of check-in).
- `)`: Exclusive check-out date (guest departs morning of check-out).
- **Scenario A (Allowed):** Booking Room 101 from `2026-10-15 → 2026-10-20` immediately following an existing booking of `2026-10-10 → 2026-10-15`. Upper bound `10-15` does not overlap lower bound `10-15`.
- **Scenario B (Rejected):** Booking Room 101 from `2026-10-14 → 2026-10-20` overlaps date `10-14` and is rejected by the database.
- **Scenario C (Rejected):** Booking Room 101 from `2026-10-12 → 2026-10-13` is contained inside `10-10 → 10-15` and is rejected.
- **Cancelled Bookings:** Excluded by `WHERE (booking_status NOT IN ('cancelled'))`, instantly releasing availability.

---

## 4. Role Authorization & Row-Level Security (RLS)

All tables enforce Row-Level Security:

1. **`GUEST`**:
   - Can read and update only their own profile in `users`.
   - Can read and update only their own guest record in `guests`.
   - Can create and view only their own bookings in `bookings`.
   - Can view stay events belonging to their own bookings.
   - **Cannot** view other guests' bookings or records.
2. **`FRONT_DESK`**:
   - Full read/write access to `bookings`, `guests`, `stay_events`, and room statuses for operational workflows (check-in, check-out, room assignment, key issuance).
   - Read access to `users`.
3. **`MANAGER`**:
   - Complete access across all tables including `room_types`, `rooms`, `users`, `bookings`, `guests`, `stay_events`, and `audit_logs`.
   - Exclusive access to read the system `audit_logs`.

---

## 5. Execution Instructions for Supabase

### Option 1: Supabase Web Dashboard SQL Editor
1. Open your project on [https://supabase.com](https://supabase.com).
2. Navigate to **SQL Editor > New Query**.
3. Copy the entire contents of [`database/schema.sql`](file:///c:/Users/tasne/OneDrive/Desktop/Staysuite_hotelbooking/Staysuite_hotelbooking/database/schema.sql) and click **Run**.
4. Open another query, copy the contents of [`database/seed.sql`](file:///c:/Users/tasne/OneDrive/Desktop/Staysuite_hotelbooking/Staysuite_hotelbooking/database/seed.sql) and click **Run**.

### Option 2: Supabase CLI
```bash
# Push schema migrations
supabase db push

# Run seed script
supabase db reset
```
