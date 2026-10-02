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