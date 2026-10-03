import { supabase } from '../config/supabase.js';

export const getAllRooms = async () => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('room_number', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch rooms: ${error.message}`);
  }

  return data;
};

/**
 * Returns rooms that are NOT blocked by an active (non-cancelled) booking
 * that overlaps the requested [checkInDate, checkOutDate) range.
 *
 * Overlap condition:
 *   existing.check_in_date  < requested.check_out_date
 *   existing.check_out_date > requested.check_in_date
 */
export const getAvailableRooms = async (checkInDate, checkOutDate) => {
  // Step 1 – Collect room_ids that are blocked during the requested period.
  const { data: blockedBookings, error: blockedError } = await supabase
    .from('bookings')
    .select('room_id')
    .neq('booking_status', 'cancelled')
    .lt('check_in_date', checkOutDate)   // existing starts before requested end
    .gt('check_out_date', checkInDate);  // existing ends   after  requested start

  if (blockedError) {
    throw new Error(`Failed to query blocked rooms: ${blockedError.message}`);
  }

  const blockedRoomIds = (blockedBookings ?? []).map((b) => b.room_id);

  // Step 2 – Fetch rooms that are NOT in the blocked set.
  let query = supabase
    .from('rooms')
    .select('id, room_number, floor, status, room_type_id, hotel_id')
    .order('room_number', { ascending: true });

  if (blockedRoomIds.length > 0) {
    query = query.not('id', 'in', `(${blockedRoomIds.join(',')})`);
  }

  const { data: availableRooms, error: availableError } = await query;

  if (availableError) {
    throw new Error(`Failed to fetch available rooms: ${availableError.message}`);
  }

  return availableRooms;
};
export const createRoom = async (roomData) => {
  const {
    hotel_id,
    room_type_id,
    room_number,
    floor = 1,
    status = 'available',
    is_smoking = false,
    keycard_code = null,
    notes = null
  } = roomData;

  const { data, error } = await supabase
    .from('rooms')
    .insert({
      hotel_id,
      room_type_id,
      room_number,
      floor,
      status,
      is_smoking,
      keycard_code,
      notes
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create room: ${error.message}`);
  }

  return data;
};

export const updateRoom = async (roomId, roomData) => {
  const allowedFields = [
    'hotel_id',
    'room_type_id',
    'room_number',
    'floor',
    'status',
    'is_smoking',
    'keycard_code',
    'notes'
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (roomData[field] !== undefined) {
      updates[field] = roomData[field];
    }
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('rooms')
    .update(updates)
    .eq('id', roomId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update room: ${error.message}`);
  }

  return data;
};

export const deleteRoom = async (roomId) => {
  const { data, error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', roomId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to delete room: ${error.message}`);
  }

  return data;
};