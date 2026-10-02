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