import { supabase } from '../config/supabase.js';

export const getAllBookings = async () => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      rooms (
        room_number,
        floor,
        status
      ),
      guests (
        full_name,
        email,
        phone
      )
    `)
    .order('check_in_date', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch bookings: ${error.message}`);
  }

  return data;
};

export const getBookingById = async (bookingId) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      rooms (
        room_number,
        floor,
        status
      ),
      guests (
        full_name,
        email,
        phone
      )
    `)
    .eq('id', bookingId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch booking: ${error.message}`);
  }

  return data;
};

export const createBooking = async (bookingData) => {
  const {
    guest_id,
    room_id,
    room_type_id,
    hotel_id,
    check_in_date,
    check_out_date,
    number_of_guests,
    nightly_rate,
    total_nights,
    total_amount,
    tax_amount,
    booking_status = 'confirmed',
    payment_status = 'pending',
    special_requests = null
  } = bookingData;

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      guest_id,
      room_id,
      room_type_id,
      hotel_id,
      check_in_date,
      check_out_date,
      number_of_guests,
      nightly_rate,
      total_nights,
      total_amount,
      tax_amount,
      booking_status,
      payment_status,
      special_requests
    })
    .select(`
      *,
      rooms (
        room_number,
        floor,
        status
      ),
      guests (
        full_name,
        email,
        phone
      )
    `)
    .single();

  if (error) {
    throw new Error(`Failed to create booking: ${error.message}`);
  }

  return data;
};

export const cancelBooking = async (bookingId) => {
  // Check whether the booking exists
  const { data: existingData, error: fetchError } = await supabase
    .from('bookings')
    .select('booking_status')
    .eq('id', bookingId)
    .single();

  if (fetchError) {
    return null;
  }

  // If already cancelled, return the booking
  if (existingData.booking_status === 'cancelled') {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms (
          room_number,
          floor,
          status
        ),
        guests (
          full_name,
          email,
          phone
        )
      `)
      .eq('id', bookingId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch cancelled booking: ${error.message}`);
    }

    return {
      ...data,
      alreadyCancelled: true
    };
  }

  // Cancel the booking
  const { data, error } = await supabase
    .from('bookings')
    .update({ booking_status: 'cancelled' })
    .eq('id', bookingId)
    .select(`
      *,
      rooms (
        room_number,
        floor,
        status
      ),
      guests (
        full_name,
        email,
        phone
      )
    `)
    .single();

  if (error) {
    throw new Error(`Failed to cancel booking: ${error.message}`);
  }

  return {
    ...data,
    alreadyCancelled: false
  };
};


// =========================================================
// CHECK-IN
// =========================================================

export const checkInBooking = async (bookingId) => {
  // Get current booking status
  const { data: existingBooking, error: fetchError } = await supabase
    .from('bookings')
    .select('id, booking_status, room_id')
    .eq('id', bookingId)
    .single();

  if (fetchError) {
    return null;
  }

  // Booking must be confirmed before check-in
  if (existingBooking.booking_status !== 'confirmed') {
    return {
      invalidStatus: true,
      currentStatus: existingBooking.booking_status
    };
  }

  // Update booking status
  const { data: updatedBooking, error: updateError } = await supabase
    .from('bookings')
    .update({
      booking_status: 'checked_in'
    })
    .eq('id', bookingId)
    .select(`
      *,
      rooms (
        room_number,
        floor,
        status
      ),
      guests (
        full_name,
        email,
        phone
      )
    `)
    .single();

  if (updateError) {
    throw new Error(`Failed to check in booking: ${updateError.message}`);
  }

  // Mark room as occupied
  if (existingBooking.room_id) {
    const { error: roomError } = await supabase
      .from('rooms')
      .update({
        status: 'occupied'
      })
      .eq('id', existingBooking.room_id);

    if (roomError) {
      throw new Error(`Failed to update room status: ${roomError.message}`);
    }
  }

  // Create stay event
  const { error: eventError } = await supabase
    .from('stay_events')
    .insert({
      booking_id: bookingId,
      event_type: 'CHECK_IN',
      notes: 'Guest checked in'
    });

  if (eventError) {
    throw new Error(`Failed to create check-in event: ${eventError.message}`);
  }

  return updatedBooking;
};


// =========================================================
// CHECK-OUT
// =========================================================

export const checkOutBooking = async (bookingId) => {
  // Get current booking status
  const { data: existingBooking, error: fetchError } = await supabase
    .from('bookings')
    .select('id, booking_status, room_id')
    .eq('id', bookingId)
    .single();

  if (fetchError) {
    return null;
  }

  // Booking must be checked in before check-out
  if (existingBooking.booking_status !== 'checked_in') {
    return {
      invalidStatus: true,
      currentStatus: existingBooking.booking_status
    };
  }

  // Update booking status
  const { data: updatedBooking, error: updateError } = await supabase
    .from('bookings')
    .update({
      booking_status: 'checked_out'
    })
    .eq('id', bookingId)
    .select(`
      *,
      rooms (
        room_number,
        floor,
        status
      ),
      guests (
        full_name,
        email,
        phone
      )
    `)
    .single();

  if (updateError) {
    throw new Error(`Failed to check out booking: ${updateError.message}`);
  }

  // Mark room as available
  if (existingBooking.room_id) {
    const { error: roomError } = await supabase
      .from('rooms')
      .update({
        status: 'available'
      })
      .eq('id', existingBooking.room_id);

    if (roomError) {
      throw new Error(`Failed to update room status: ${roomError.message}`);
    }
  }

  // Create stay event
  const { error: eventError } = await supabase
    .from('stay_events')
    .insert({
      booking_id: bookingId,
      event_type: 'CHECK_OUT',
      notes: 'Guest checked out'
    });

  if (eventError) {
    throw new Error(`Failed to create check-out event: ${eventError.message}`);
  }

  return updatedBooking;
};