-- ==============================================================================
-- StaySuite: Hotel Booking & Guest Operations Portal
-- Comprehensive Production Seed Data for Supabase PostgreSQL (Project 15)
-- ==============================================================================

-- ==============================================================================
-- 1. USERS (Application User Accounts & Project 15 Roles)
-- ==============================================================================
-- Note: auth_user_id is left NULL for development seed data to avoid foreign-key
-- violations with auth.users before actual user signups occur.
INSERT INTO public.users (id, email, full_name, phone, role, avatar_url)
VALUES
    -- Management
    ('10000000-0000-0000-0000-000000000001', 'manager@staysuite.com', 'Claire Dupont', '+41 22 900 1000', 'MANAGER', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'),
    
    -- Front Desk Operations
    ('20000000-0000-0000-0000-000000000001', 'frontdesk.alpine@staysuite.com', 'Jean-Luc Dubois', '+41 22 900 1020', 'FRONT_DESK', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'),
    
    -- Registered Guests (Guest Accounts)
    ('30000000-0000-0000-0000-000000000001', 'elena.rostova@example.com', 'Elena Rostova', '+41 79 123 4567', 'GUEST', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'),
    ('30000000-0000-0000-0000-000000000002', 'marcus.vance@example.com', 'Marcus Vance', '+1 415 555 2671', 'GUEST', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'),
    ('30000000-0000-0000-0000-000000000003', 'sophia.chen@example.com', 'Sophia Chen', '+65 9123 4567', 'GUEST', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80'),
    ('30000000-0000-0000-0000-000000000004', 'alexander.wright@example.com', 'Lord Alexander Wright', '+44 20 7946 0912', 'GUEST', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80')
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

-- ==============================================================================
-- 2. GUESTS (Guest Master Records linked to User Accounts)
-- ==============================================================================
INSERT INTO public.guests (id, user_id, full_name, email, phone, address, city, country, nationality, identification_number, vip_status, preferences, notes)
VALUES
    ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Elena Rostova', 'elena.rostova@example.com', '+41 79 123 4567', 'Via Nassa 12', 'Lugano', 'Switzerland', 'Switzerland', 'CH-P8942109', true, '{"pillow_type": "feather", "room_floor": "high", "temperature_c": 21}', 'Prefers quiet rooms facing Lake Geneva.'),
    ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'Marcus Vance', 'marcus.vance@example.com', '+1 415 555 2671', '450 Sutter St', 'San Francisco', 'United States', 'United States', 'US-P4819203', false, '{"bed_type": "king", "welcome_drink": "champagne"}', 'Anniversary stay.'),
    ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 'Sophia Chen', 'sophia.chen@example.com', '+65 9123 4567', '18 Marina Gardens Dr', 'Singapore', 'Singapore', 'Singapore', 'SG-P3918241', true, '{"tea_selection": "green_tea", "newspaper": "Financial Times"}', 'Frequent business traveler.'),
    ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', 'Lord Alexander Wright', 'alexander.wright@example.com', '+44 20 7946 0912', 'Kensington Palace Gardens', 'London', 'United Kingdom', 'United Kingdom', 'GB-P9182049', true, '{"butler_service": true, "private_dining": true}', 'Diplomatic VIP guest. Requires utmost privacy.')
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;

-- ==============================================================================
-- 3. DESTINATIONS (Destination Context & Live Weather Coordinates)
-- ==============================================================================
INSERT INTO public.destinations (id, city, country, country_code, latitude, longitude, timezone, description, hero_image_url)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'Geneva', 'Switzerland', 'CHE', 46.2044, 6.1432, 'Europe/Zurich', 'Framed by the snow-capped Alps and serene Lake Geneva, a sanctuary of Swiss luxury hospitality.', 'https://images.unsplash.com/photo-1574701148212-8518049c7b2c?auto=format&fit=crop&w=1200&q=80'),
    ('d0000000-0000-0000-0000-000000000002', 'Kyoto', 'Japan', 'JPN', 35.0116, 135.7681, 'Asia/Tokyo', 'The cultural heartbeat of Japan, boasting Zen gardens, geisha districts, and cedar temples.', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80'),
    ('d0000000-0000-0000-0000-000000000003', 'Santorini', 'Greece', 'GRC', 36.3932, 25.4615, 'Europe/Athens', 'Iconic whitewashed caldera cliffs suspended above the cobalt Aegean sea.', 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80'),
    ('d0000000-0000-0000-0000-000000000004', 'New York', 'United States', 'USA', 40.7128, -74.0060, 'America/New_York', 'Manhattan elegance overlooking Central Park and the electric city skyline.', 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 4. HOTELS
-- ==============================================================================
INSERT INTO public.hotels (id, destination_id, name, slug, tagline, description, address, city, country, latitude, longitude, phone, email, star_rating, check_in_time, check_out_time, cover_image_url)
VALUES
    ('50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 
     'The Grand Alpine StaySuite', 'grand-alpine-geneva', 
     'Alpine Splendor Meets Lake Geneva Serenity',
     'Perched along the crystalline embankment of Lake Geneva with commanding vistas of Mont Blanc, featuring thermal wellness and Michelin-starred dining.',
     'Quai du Mont-Blanc 19', 'Geneva', 'Switzerland', 46.2095, 6.1502, '+41 22 900 1000', 'alpine@staysuite.com', 5.0, '15:00:00', '12:00:00',
     'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'),

    ('50000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 
     'StaySuite Kyoto Sanctuary', 'staysuite-kyoto-sanctuary', 
     'Timeless Zen & Traditional Ryokan Luxury',
     'Tranquil sanctuary pairing minimalist Japanese architecture with private hot spring onsens.',
     'Gion Shirakawa-suji 34', 'Kyoto', 'Japan', 35.0037, 135.7772, '+81 75 531 8800', 'kyoto@staysuite.com', 5.0, '15:00:00', '11:00:00',
     'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80'),

    ('50000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 
     'StaySuite Azure Caldera', 'staysuite-azure-caldera', 
     'Cliffside Infinity Views Above The Aegean Sea',
     'Private suites sculpted into volcanic cliffs with private heated infinity plunge pools.',
     'Oia Cliff Walkway 12', 'Santorini', 'Greece', 36.4618, 25.3753, '+30 22860 71200', 'caldera@staysuite.com', 5.0, '14:00:00', '11:00:00',
     'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80'),

    ('50000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', 
     'StaySuite Manhattan Reserve', 'staysuite-manhattan-reserve', 
     'Bespoke Metropolis Luxury on Fifth Avenue',
     'Soaring high above Central Park, featuring rooftop observatory lounge and butler service.',
     '721 Fifth Avenue', 'New York', 'United States', 40.7624, -73.9738, '+1 212 555 9400', 'manhattan@staysuite.com', 5.0, '16:00:00', '12:00:00',
     'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 5. AMENITIES
-- ==============================================================================
INSERT INTO public.amenities (id, name, category, icon_name, description)
VALUES
    ('60000000-0000-0000-0000-000000000001', 'Infinity Heated Pool', 'Wellness', 'waves', 'Climate-controlled swimming pool with poolside attendant.'),
    ('60000000-0000-0000-0000-000000000002', 'Alpine Thermal Spa', 'Wellness', 'sparkles', 'Holistic thermal baths and Finnish saunas.'),
    ('60000000-0000-0000-0000-000000000003', 'Michelin-Starred Dining', 'Dining', 'utensils', 'Award-winning farm-to-table culinary experiences.'),
    ('60000000-0000-0000-0000-000000000004', 'Ultra-High-Speed WiFi', 'Connectivity', 'wifi', 'Enterprise gigabit Starlink internet.'),
    ('60000000-0000-0000-0000-000000000005', '24/7 Dedicated Concierge', 'Services', 'bell', 'Personalized reservation and excursion management.')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 6. ROOM TYPES
-- ==============================================================================
INSERT INTO public.room_types (id, hotel_id, name, slug, description, capacity, base_price_per_night, weekend_multiplier, bed_type, room_size_sqm, view_type, amenities, cover_image_url, total_inventory)
VALUES
    -- The Grand Alpine (Geneva)
    ('70000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 
     'Superior Alpine King', 'superior-alpine-king', 
     'Swiss stone pine interiors, marble soaking bathtub, and floor-to-ceiling windows overlooking Lake Geneva.', 
     2, 380.00, 1.15, '1 California King Bed', 48, 'Lake & Mont Blanc View',
     '["Marble Bathroom", "Espresso Bar", "Balcony", "Rain Shower"]'::jsonb,
     'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80', 6),

    ('70000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 
     'Mont Blanc Junior Suite', 'mont-blanc-junior-suite', 
     'Separated living parlor, private outdoor cedar loggia, bespoke walk-in dressing room, and fireplace.', 
     3, 650.00, 1.20, '1 Grand King & 1 Daybed', 72, 'Panoramic Mont Blanc & Jet d''Eau',
     '["Private Fireplace", "Cedar Loggia", "Deep Soaking Tub", "Butler Service"]'::jsonb,
     'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80', 4),

    ('70000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001', 
     'The Presidential Chalet Penthouse', 'presidential-chalet-penthouse', 
     'Top-floor sanctuary featuring a private rooftop thermal jacuzzi, personal chef dining room, and dedicated 24/7 butler.', 
     4, 1650.00, 1.25, '2 Master King Suites', 160, '360° Alpine & Lake Horizon',
     '["Rooftop Jacuzzi", "Private Chef Kitchen", "Sauna", "24/7 Dedicated Butler"]'::jsonb,
     'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80', 2)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price_per_night = EXCLUDED.base_price_per_night;

-- ==============================================================================
-- 7. PHYSICAL ROOMS
-- ==============================================================================
INSERT INTO public.rooms (id, hotel_id, room_type_id, room_number, floor, status, is_smoking, keycard_code, notes)
VALUES
    ('80000000-0000-0000-0000-000000000101', '50000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', '101', 1, 'occupied', false, 'KC-ALP-101', 'Assigned to Elena Rostova (Checked In).'),
    ('80000000-0000-0000-0000-000000000102', '50000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', '102', 1, 'available', false, 'KC-ALP-102', 'Turnover complete. Sanitized and inspected.'),
    ('80000000-0000-0000-0000-000000000103', '50000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', '103', 1, 'cleaning', false, 'KC-ALP-103', 'Guest checked out. Housekeeping turnover in progress.'),
    ('80000000-0000-0000-0000-000000000201', '50000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000002', '201', 2, 'reserved', false, 'KC-ALP-201', 'Reserved for Marcus Vance arrival.'),
    ('80000000-0000-0000-0000-000000000202', '50000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000002', '202', 2, 'available', false, 'KC-ALP-202', 'Ready for guest booking.'),
    ('80000000-0000-0000-0000-000000000501', '50000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000003', '501', 5, 'occupied', false, 'KC-ALP-501', 'Presidential Penthouse reserved for Lord Alexander Wright.')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 8. BOOKINGS (Referencing Guests & Rooms)
-- ==============================================================================
INSERT INTO public.bookings (id, booking_reference, guest_id, room_id, room_type_id, hotel_id, check_in_date, check_out_date, number_of_guests, nightly_rate, total_nights, total_amount, tax_amount, booking_status, payment_status, special_requests)
VALUES
    -- Active Checked-in Stay (Room 101)
    ('90000000-0000-0000-0000-000000000001', 'STAY-829104', 
     '40000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000101',
     '70000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001',
     CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '3 days',
     2, 380.00, 4, 1672.00, 152.00, 'checked_in', 'paid', 
     'High floor quiet room with Lake Geneva view. Extra goose feather pillows requested.'),

    -- Upcoming Confirmed Stay (Room 201)
    ('90000000-0000-0000-0000-000000000002', 'STAY-948210', 
     '40000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000201',
     '70000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001',
     CURRENT_DATE, CURRENT_DATE + INTERVAL '5 days',
     2, 650.00, 5, 3575.00, 325.00, 'confirmed', 'paid', 
     'Wedding anniversary. Chilled champagne requested upon arrival.'),

    -- VIP Presidential Stay (Room 501)
    ('90000000-0000-0000-0000-000000000003', 'STAY-519284', 
     '40000000-0000-0000-0000-000000000004', '80000000-0000-0000-0000-000000000501',
     '70000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001',
     CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '4 days',
     2, 1650.00, 6, 10890.00, 990.00, 'checked_in', 'paid', 
     'Diplomatic security protocol. Private chauffeur transfer.'),

    -- Historical Completed Stay (Room 103)
    ('90000000-0000-0000-0000-000000000004', 'STAY-382910', 
     '40000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000103',
     '70000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001',
     CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '6 days',
     1, 380.00, 4, 1672.00, 152.00, 'checked_out', 'paid', 
     'Business trip stay.'),

    -- Cancelled Booking (Room 101) - Demonstrating that cancelled bookings DO NOT block room availability
    ('90000000-0000-0000-0000-000000000005', 'STAY-112233', 
     '40000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000101',
     '70000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001',
     CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '3 days',
     1, 380.00, 4, 1672.00, 152.00, 'cancelled', 'refunded', 
     'Guest cancelled travel plans.')
ON CONFLICT (id) DO UPDATE SET
    booking_status = EXCLUDED.booking_status;

-- ==============================================================================
-- 9. STAY_EVENTS (Booking & Front-Desk Operational Lifecycle)
-- ==============================================================================
INSERT INTO public.stay_events (id, booking_id, event_type, event_time, performed_by, notes, metadata)
VALUES
    ('a0000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', 
     'ROOM_ASSIGNED', NOW() - INTERVAL '1 day 2 hours', 
     '20000000-0000-0000-0000-000000000001', 'Room 101 assigned matching guest preference for Lake Geneva view.', 
     '{"room_number": "101", "floor": 1}'::jsonb),

    ('a0000000-0000-0000-0000-000000000002', '90000000-0000-0000-0000-000000000001', 
     'CHECK_IN', NOW() - INTERVAL '1 day', 
     '20000000-0000-0000-0000-000000000001', 'Guest arrived at front desk. Passport verified.', 
     '{"guest_name": "Elena Rostova", "id_verified": true}'::jsonb),

    ('a0000000-0000-0000-0000-000000000003', '90000000-0000-0000-0000-000000000001', 
     'KEY_ISSUED', NOW() - INTERVAL '1 day', 
     '20000000-0000-0000-0000-000000000001', '2 RFID keycards issued for Room 101.', 
     '{"keycard_code": "KC-ALP-101", "cards_issued": 2}'::jsonb),

    ('a0000000-0000-0000-0000-000000000004', '90000000-0000-0000-0000-000000000004', 
     'CHECK_OUT', NOW() - INTERVAL '6 days', 
     '20000000-0000-0000-0000-000000000001', 'Regular checkout completed. Folio settled.', 
     '{"room_number": "103", "settled_amount": 1672.00}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 10. AUDIT_LOGS (System Observable Actions)
-- ==============================================================================
INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address)
VALUES
    ('b0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 
     'INSERT', 'booking', '90000000-0000-0000-0000-000000000001', 
     NULL, '{"booking_reference": "STAY-829104", "guest_id": "40000000-0000-0000-0000-000000000001", "room_id": "80000000-0000-0000-0000-000000000101", "status": "confirmed"}'::jsonb, 
     '192.168.1.101'),

    ('b0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 
     'UPDATE', 'rooms', '80000000-0000-0000-0000-000000000101', 
     '{"status": "available"}'::jsonb, '{"status": "occupied"}'::jsonb, 
     '192.168.1.101'),

    ('b0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 
     'UPDATE', 'room_types', '70000000-0000-0000-0000-000000000001', 
     '{"base_price_per_night": 360.00}'::jsonb, '{"base_price_per_night": 380.00}'::jsonb, 
     '192.168.1.100')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 11. PAYMENTS
-- ==============================================================================
INSERT INTO public.payments (id, booking_id, guest_id, amount, currency, payment_method, payment_status, transaction_reference, paid_at, metadata)
VALUES
    ('c0000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 1672.00, 'USD', 'stripe', 'paid', 'ch_stripe_mock_83910283419028', NOW() - INTERVAL '1 day', '{"card_brand": "Visa", "last4": "4242"}'::jsonb),
    ('c0000000-0000-0000-0000-000000000002', '90000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 3575.00, 'USD', 'credit_card', 'paid', 'ch_stripe_mock_72819284729103', NOW() - INTERVAL '2 days', '{"card_brand": "Mastercard", "last4": "8812"}'::jsonb),
    ('c0000000-0000-0000-0000-000000000003', '90000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000004', 10890.00, 'USD', 'apple_pay', 'paid', 'ch_stripe_mock_91827401928471', NOW() - INTERVAL '3 days', '{"card_brand": "Amex", "last4": "1004"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 12. SERVICE REQUESTS (Optional)
-- ==============================================================================
INSERT INTO public.service_requests (id, booking_id, room_id, guest_id, assigned_staff_id, request_type, priority, status, title, description, resolution_notes, requested_time)
VALUES
    ('e0000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', 
     '80000000-0000-0000-0000-000000000101', '40000000-0000-0000-0000-000000000001',
     '20000000-0000-0000-0000-000000000001', 'room_service', 'medium', 'in_progress', 
     'Artisanal Breakfast in Bed', '2 Swiss organic breakfasts delivered at 08:30 AM.', 
     'Order placed with pastry kitchen.', NOW() - INTERVAL '45 minutes')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 13. REVIEWS (Optional)
-- ==============================================================================
INSERT INTO public.reviews (id, booking_id, room_type_id, guest_id, rating, cleanliness_rating, staff_rating, location_rating, facilities_rating, review_title, review_text, staff_response, staff_response_at, is_verified_stay)
VALUES
    ('f0000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000004', 
     '70000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003', 
     5, 5, 5, 5, 5, 
     'An Unrivaled Sanctuary on Lake Geneva', 
     'The Superior Alpine King had breathtaking vistas of Mont Blanc, and the acoustic glass meant total silence at night. The thermal spa is world class.', 
     'Dear Sophia, it was an absolute pleasure welcoming you to The Grand Alpine. We look forward to hosting you again!', 
     NOW() - INTERVAL '4 days', true)
ON CONFLICT (id) DO NOTHING;
