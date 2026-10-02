import { supabase } from '../config/supabase.js';

export const getAllGuests = async () => {
    const { data, error } = await supabase
        .from('guests')
        .select(`
      *,
      bookings (
        id,
        booking_reference,
        check_in_date,
        check_out_date,
        number_of_guests,
        total_amount,
        booking_status,
        payment_status,
        rooms (
          room_number,
          floor,
          status
        )
      )
    `)
        .order('full_name', { ascending: true });

    if (error) {
        throw new Error(`Failed to fetch guests: ${error.message}`);
    }

    return data;
};

export const getGuestById = async (guestId) => {
    const { data, error } = await supabase
        .from('guests')
        .select(`
      *,
      bookings (
        id,
        booking_reference,
        check_in_date,
        check_out_date,
        number_of_guests,
        nightly_rate,
        total_nights,
        total_amount,
        tax_amount,
        booking_status,
        payment_status,
        special_requests,
        rooms (
          room_number,
          floor,
          status
        )
      )
    `)
        .eq('id', guestId)
        .single();

    if (error) {
        throw new Error(`Failed to fetch guest: ${error.message}`);
    }

    return data;
};