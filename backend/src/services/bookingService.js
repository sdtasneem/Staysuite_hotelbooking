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