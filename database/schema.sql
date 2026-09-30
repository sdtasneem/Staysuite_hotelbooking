-- ==============================================================================
-- StaySuite: Hotel Booking & Guest Operations Portal
-- Production Database Schema for Supabase PostgreSQL (Project 15 Specification)
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- Mandatory for Exclusion Constraint overlap checks

-- ==============================================================================
-- 2. ENUMS & DOMAIN TYPES
-- ==============================================================================

-- Standardized Project 15 Roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('GUEST', 'FRONT_DESK', 'MANAGER');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE room_status AS ENUM ('available', 'occupied', 'maintenance', 'cleaning', 'reserved');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('credit_card', 'debit_card', 'stripe', 'paypal', 'apple_pay', 'cash');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE stay_event_type AS ENUM (
        'CHECK_IN',
        'CHECK_OUT',
        'ROOM_ASSIGNED',
        'ROOM_TRANSFERRED',
        'KEY_ISSUED',
        'KEY_REVOKED',
        'LATE_CHECKOUT_APPROVED',
        'MAINTENANCE_LOGGED'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Optional service request types
DO $$ BEGIN
    CREATE TYPE service_request_type AS ENUM (
        'housekeeping',
        'room_service',
        'maintenance',
        'concierge',
        'luggage_assistance',
        'extra_amenities'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE service_request_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE service_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ==============================================================================
-- 3. CORE PROJECT 15 TABLES
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 3.1 USERS (Application User Accounts & Authentication Bridge)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- Linked to Supabase auth.users(id) when auth is connected
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role user_role DEFAULT 'GUEST'::user_role NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3.2 GUESTS (Guest Profiles & Operational Master Record)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Optional link to registered user account
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    nationality VARCHAR(100),
    identification_number VARCHAR(100), -- Passport or National ID
    vip_status BOOLEAN DEFAULT FALSE NOT NULL,
    preferences JSONB DEFAULT '{}'::jsonb NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 4. SUPPORTING TABLES (Properties, Destinations & Amenities)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 4.1 DESTINATIONS (Destination Context - REST Countries & Open-Meteo Integration)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    country_code VARCHAR(10) NOT NULL, -- ISO Alpha-2/Alpha-3 code for REST Countries
    latitude DECIMAL(9, 6) NOT NULL,   -- For Open-Meteo Weather API
    longitude DECIMAL(9, 6) NOT NULL,  -- For Open-Meteo Weather API
    timezone VARCHAR(50) DEFAULT 'UTC' NOT NULL,
    description TEXT,
    hero_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 4.2 HOTELS (Properties)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    tagline VARCHAR(255),
    description TEXT NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    star_rating DECIMAL(2, 1) DEFAULT 5.0 NOT NULL,
    check_in_time TIME DEFAULT '15:00:00' NOT NULL,
    check_out_time TIME DEFAULT '11:00:00' NOT NULL,
    cover_image_url TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 4.3 AMENITIES & HOTEL_AMENITIES (Facility catalogs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Wellness', 'Dining', 'Connectivity', 'Comfort', 'Services'
    icon_name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.hotel_amenities (
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    amenity_id UUID NOT NULL REFERENCES public.amenities(id) ON DELETE CASCADE,
    is_complimentary BOOLEAN DEFAULT TRUE NOT NULL,
    details VARCHAR(255),
    PRIMARY KEY (hotel_id, amenity_id)
);

-- ==============================================================================
-- 5. CORE INVENTORY: ROOM TYPES & ROOMS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 5.1 ROOM_TYPES (Categories & Base Pricing)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.room_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    capacity INT DEFAULT 2 NOT NULL CHECK (capacity > 0),
    base_price_per_night NUMERIC(10, 2) NOT NULL CHECK (base_price_per_night >= 0),
    weekend_multiplier NUMERIC(3, 2) DEFAULT 1.20 NOT NULL,
    bed_type VARCHAR(100) NOT NULL,
    room_size_sqm INT NOT NULL CHECK (room_size_sqm > 0),
    view_type VARCHAR(100) NOT NULL,
    amenities JSONB DEFAULT '[]'::jsonb NOT NULL,
    cover_image_url TEXT NOT NULL,
    gallery_images TEXT[] DEFAULT '{}',
    total_inventory INT DEFAULT 5 NOT NULL CHECK (total_inventory > 0),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 5.2 ROOMS (Physical Room Units)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE,
    room_type_id UUID NOT NULL REFERENCES public.room_types(id) ON DELETE CASCADE,
    room_number VARCHAR(20) NOT NULL,
    floor INT DEFAULT 1 NOT NULL,
    status room_status DEFAULT 'available'::room_status NOT NULL,
    is_smoking BOOLEAN DEFAULT FALSE NOT NULL,
    keycard_code VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT uq_rooms_number UNIQUE (hotel_id, room_number)
);

-- ==============================================================================
-- 6. CORE RESERVATION ENGINE: BOOKINGS & OVERLAP PROTECTION
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 6.1 BOOKINGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference VARCHAR(30) UNIQUE NOT NULL, -- e.g. 'STAY-984210'
    guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
    room_type_id UUID REFERENCES public.room_types(id) ON DELETE RESTRICT,
    hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_guests INT DEFAULT 1 NOT NULL CHECK (number_of_guests > 0),
    nightly_rate NUMERIC(10, 2) NOT NULL CHECK (nightly_rate >= 0),
    total_nights INT NOT NULL CHECK (total_nights > 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    tax_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (tax_amount >= 0),
    booking_status booking_status DEFAULT 'confirmed'::booking_status NOT NULL,
    payment_status payment_status DEFAULT 'paid'::payment_status NOT NULL,
    special_requests TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Date Sanity Validation
    CONSTRAINT check_booking_dates CHECK (check_out_date > check_in_date)
);

-- ------------------------------------------------------------------------------
-- 6.2 CRITICAL: DATABASE-LEVEL BOOKING OVERLAP PROTECTION
-- ------------------------------------------------------------------------------
-- Using PostgreSQL btree_gist and daterange half-open interval '[)'
-- [ = inclusive check-in date (arrival)
-- ) = exclusive check-out date (departure)
-- Only active bookings participate; cancelled reservations are excluded.
ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS prevent_overlapping_room_bookings;

ALTER TABLE public.bookings
ADD CONSTRAINT prevent_overlapping_room_bookings
EXCLUDE USING gist (
    room_id WITH =,
    daterange(check_in_date, check_out_date, '[)') WITH &&
)
WHERE (booking_status NOT IN ('cancelled'));

-- ==============================================================================
-- 7. CORE LIFECYCLE & AUDITING: STAY EVENTS & AUDIT LOGS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 7.1 STAY_EVENTS (Booking Lifecycle Events)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stay_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    event_type stay_event_type NOT NULL,
    event_time TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Staff/Manager who performed the action
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 7.2 AUDIT_LOGS (Observable System & Administrative Audit Trail)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- User who initiated change
    action VARCHAR(50) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE', 'CHECK_IN', 'RATE_OVERRIDE', 'ROOM_MOVE'
    entity_type VARCHAR(100) NOT NULL, -- 'booking', 'room', 'room_type', 'guest', 'user', 'payment'
    entity_id UUID,
    old_values JSONB DEFAULT NULL,
    new_values JSONB DEFAULT NULL,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 8. SUPPORTING FINANCIAL & OPERATIONS TABLES
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 8.1 PAYMENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES public.guests(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(10) DEFAULT 'USD' NOT NULL,
    payment_method payment_method NOT NULL,
    payment_status payment_status DEFAULT 'paid'::payment_status NOT NULL,
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    paid_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 8.2 SERVICE_REQUESTS (Optional Guest Requests)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
    guest_id UUID REFERENCES public.guests(id) ON DELETE CASCADE,
    assigned_staff_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    request_type service_request_type NOT NULL,
    priority service_priority DEFAULT 'medium'::service_priority NOT NULL,
    status service_request_status DEFAULT 'pending'::service_request_status NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    resolution_notes TEXT,
    requested_time TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    completed_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 8.3 HOUSEKEEPING_LOGS (Optional Room Status Logs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.housekeeping_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    assigned_staff_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    task_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'in_progress' NOT NULL,
    notes TEXT,
    started_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 8.4 REVIEWS (Optional Verified Guest Feedback)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID UNIQUE REFERENCES public.bookings(id) ON DELETE SET NULL,
    room_type_id UUID REFERENCES public.room_types(id) ON DELETE SET NULL,
    guest_id UUID REFERENCES public.guests(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    cleanliness_rating INT CHECK (cleanliness_rating BETWEEN 1 AND 5),
    staff_rating INT CHECK (staff_rating BETWEEN 1 AND 5),
    location_rating INT CHECK (location_rating BETWEEN 1 AND 5),
    facilities_rating INT CHECK (facilities_rating BETWEEN 1 AND 5),
    review_title VARCHAR(200) NOT NULL,
    review_text TEXT NOT NULL,
    staff_response TEXT,
    staff_response_at TIMESTAMPTZ,
    is_verified_stay BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 9. PERFORMANCE INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_guests_user_id ON public.guests(user_id);
CREATE INDEX IF NOT EXISTS idx_guests_email ON public.guests(email);
CREATE INDEX IF NOT EXISTS idx_room_types_pricing ON public.room_types(base_price_per_night, capacity);
CREATE INDEX IF NOT EXISTS idx_rooms_type_status ON public.rooms(room_type_id, status);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);
CREATE INDEX IF NOT EXISTS idx_bookings_guest ON public.bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room ON public.bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON public.bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_stay_events_booking ON public.stay_events(booking_id);
CREATE INDEX IF NOT EXISTS idx_stay_events_type ON public.stay_events(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- ==============================================================================
-- 10. TRIGGERS & AUTOMATION
-- ==============================================================================

-- Timestamp updater function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger across all editable entities
DO $$ 
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'users', 'guests', 'destinations', 'hotels', 'room_types', 
        'rooms', 'bookings', 'service_requests', 'reviews'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trigger_set_%I_updated_at ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trigger_set_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();', tbl, tbl);
    END LOOP;
END $$;

-- Automated Booking Reference Generator (STAY-XXXXXX)
CREATE OR REPLACE FUNCTION public.set_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_reference IS NULL OR NEW.booking_reference = '' THEN
        NEW.booking_reference := 'STAY-' || LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_booking_reference ON public.bookings;
CREATE TRIGGER trigger_set_booking_reference
BEFORE INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.set_booking_reference();

-- ==============================================================================
-- 11. ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stay_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housekeeping_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Helper Authorization Functions
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
DECLARE
    r user_role;
BEGIN
    SELECT role INTO r FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
    RETURN r;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (public.current_user_role() = 'MANAGER'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_front_desk_or_manager()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (public.current_user_role() IN ('FRONT_DESK'::user_role, 'MANAGER'::user_role));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ------------------------------------------------------------------------------
-- Public Catalogs Read Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read destinations" ON public.destinations;
CREATE POLICY "Public read destinations" ON public.destinations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read hotels" ON public.hotels;
CREATE POLICY "Public read hotels" ON public.hotels FOR SELECT USING (is_active = true OR public.is_front_desk_or_manager());

DROP POLICY IF EXISTS "Public read amenities" ON public.amenities;
CREATE POLICY "Public read amenities" ON public.amenities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read hotel amenities" ON public.hotel_amenities;
CREATE POLICY "Public read hotel amenities" ON public.hotel_amenities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read room types" ON public.room_types;
CREATE POLICY "Public read room types" ON public.room_types FOR SELECT USING (is_active = true OR public.is_front_desk_or_manager());

DROP POLICY IF EXISTS "Public read rooms" ON public.rooms;
CREATE POLICY "Public read rooms" ON public.rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);

-- ------------------------------------------------------------------------------
-- RLS: USERS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own record" ON public.users;
CREATE POLICY "Users can read own record" ON public.users
FOR SELECT USING (auth_user_id = auth.uid() OR public.is_front_desk_or_manager());

DROP POLICY IF EXISTS "Users can update own record" ON public.users;
CREATE POLICY "Users can update own record" ON public.users
FOR UPDATE USING (auth_user_id = auth.uid() OR public.is_manager());

DROP POLICY IF EXISTS "Manager full access to users" ON public.users;
CREATE POLICY "Manager full access to users" ON public.users
FOR ALL USING (public.is_manager());

-- ------------------------------------------------------------------------------
-- RLS: GUESTS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Guests can read own guest profile" ON public.guests;
CREATE POLICY "Guests can read own guest profile" ON public.guests
FOR SELECT USING (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    OR public.is_front_desk_or_manager()
);

DROP POLICY IF EXISTS "Guests can update own guest profile" ON public.guests;
CREATE POLICY "Guests can update own guest profile" ON public.guests
FOR UPDATE USING (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    OR public.is_front_desk_or_manager()
);

DROP POLICY IF EXISTS "Front desk and Manager full access to guests" ON public.guests;
CREATE POLICY "Front desk and Manager full access to guests" ON public.guests
FOR ALL USING (public.is_front_desk_or_manager());

-- ------------------------------------------------------------------------------
-- RLS: BOOKINGS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Guests can view own bookings" ON public.bookings;
CREATE POLICY "Guests can view own bookings" ON public.bookings
FOR SELECT USING (
    guest_id IN (
        SELECT id FROM public.guests 
        WHERE user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    ) 
    OR public.is_front_desk_or_manager()
);

DROP POLICY IF EXISTS "Guests can create bookings" ON public.bookings;
CREATE POLICY "Guests can create bookings" ON public.bookings
FOR INSERT WITH CHECK (
    guest_id IN (
        SELECT id FROM public.guests 
        WHERE user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    ) 
    OR public.is_front_desk_or_manager()
);

DROP POLICY IF EXISTS "Front desk and Manager can update bookings" ON public.bookings;
CREATE POLICY "Front desk and Manager can update bookings" ON public.bookings
FOR UPDATE USING (public.is_front_desk_or_manager());

-- ------------------------------------------------------------------------------
-- RLS: STAY_EVENTS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Guests can view stay events for their bookings" ON public.stay_events;
CREATE POLICY "Guests can view stay events for their bookings" ON public.stay_events
FOR SELECT USING (
    booking_id IN (
        SELECT b.id FROM public.bookings b
        JOIN public.guests g ON b.guest_id = g.id
        JOIN public.users u ON g.user_id = u.id
        WHERE u.auth_user_id = auth.uid()
    )
    OR public.is_front_desk_or_manager()
);

DROP POLICY IF EXISTS "Front desk and Manager can manage stay events" ON public.stay_events;
CREATE POLICY "Front desk and Manager can manage stay events" ON public.stay_events
FOR ALL USING (public.is_front_desk_or_manager());

-- ------------------------------------------------------------------------------
-- RLS: AUDIT_LOGS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Manager only view audit logs" ON public.audit_logs;
CREATE POLICY "Manager only view audit logs" ON public.audit_logs
FOR SELECT USING (public.is_manager());

DROP POLICY IF EXISTS "System append audit logs" ON public.audit_logs;
CREATE POLICY "System append audit logs" ON public.audit_logs
FOR INSERT WITH CHECK (true); -- Authenticated services & triggers can insert audit logs

-- ------------------------------------------------------------------------------
-- RLS: PAYMENTS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Guests can view own payments" ON public.payments;
CREATE POLICY "Guests can view own payments" ON public.payments
FOR SELECT USING (
    guest_id IN (
        SELECT id FROM public.guests 
        WHERE user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    )
    OR public.is_front_desk_or_manager()
);

DROP POLICY IF EXISTS "Front desk and Manager can manage payments" ON public.payments;
CREATE POLICY "Front desk and Manager can manage payments" ON public.payments
FOR ALL USING (public.is_front_desk_or_manager());
