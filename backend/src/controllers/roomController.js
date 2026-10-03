import {
  getAllRooms,
  getAvailableRooms,
  createRoom,
  updateRoom,
  deleteRoom
} from '../services/roomService.js';

const VALID_ROOM_STATUSES = [
  'available',
  'occupied',
  'maintenance',
  'cleaning',
  'reserved'
];

export const getRooms = async (req, res, next) => {
  try {
    const rooms = await getAllRooms();

    res.status(200).json({
      success: true,
      data: rooms
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rooms/available?check_in_date=YYYY-MM-DD&check_out_date=YYYY-MM-DD
 *
 * Returns rooms that have no active (non-cancelled) booking overlapping
 * the requested date range.
 */
export const getAvailableRoomsHandler = async (req, res, next) => {
  try {
    const { check_in_date, check_out_date } = req.query;

    if (!check_in_date || !check_out_date) {
      return res.status(400).json({
        success: false,
        message:
          'Both check_in_date and check_out_date query parameters are required (YYYY-MM-DD).'
      });
    }

    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);

    if (
      isNaN(checkIn.getTime()) ||
      isNaN(checkOut.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid date format. Use YYYY-MM-DD for both check_in_date and check_out_date.'
      });
    }

    if (checkIn >= checkOut) {
      return res.status(400).json({
        success: false,
        message:
          'check_in_date must be before check_out_date.'
      });
    }

    const rooms = await getAvailableRooms(
      check_in_date,
      check_out_date
    );

    res.status(200).json({
      success: true,
      data: rooms,
      meta: {
        check_in_date,
        check_out_date,
        available_count: rooms.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/rooms
 * Create a new room.
 */
export const createRoomHandler = async (req, res, next) => {
  try {
    const {
      hotel_id,
      room_type_id,
      room_number,
      floor,
      status,
      is_smoking,
      keycard_code,
      notes
    } = req.body;

    if (!hotel_id || !room_type_id || !room_number) {
      return res.status(400).json({
        success: false,
        message:
          'hotel_id, room_type_id and room_number are required.'
      });
    }

    if (
      floor !== undefined &&
      (!Number.isInteger(floor) || floor < 1)
    ) {
      return res.status(400).json({
        success: false,
        message: 'floor must be a positive integer.'
      });
    }

    if (
      status !== undefined &&
      !VALID_ROOM_STATUSES.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Invalid room status. Allowed values: ${VALID_ROOM_STATUSES.join(', ')}.`
      });
    }

    const room = await createRoom({
      hotel_id,
      room_type_id,
      room_number,
      floor,
      status,
      is_smoking,
      keycard_code,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Room created successfully.',
      data: room
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/rooms/:id
 * Update an existing room.
 */
export const updateRoomHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Room ID is required.'
      });
    }

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

    const hasUpdate = allowedFields.some(
      (field) => req.body[field] !== undefined
    );

    if (!hasUpdate) {
      return res.status(400).json({
        success: false,
        message:
          'At least one valid room field is required for update.'
      });
    }

    if (
      req.body.floor !== undefined &&
      (!Number.isInteger(req.body.floor) || req.body.floor < 1)
    ) {
      return res.status(400).json({
        success: false,
        message: 'floor must be a positive integer.'
      });
    }

    if (
      req.body.status !== undefined &&
      !VALID_ROOM_STATUSES.includes(req.body.status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Invalid room status. Allowed values: ${VALID_ROOM_STATUSES.join(', ')}.`
      });
    }

    const room = await updateRoom(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Room updated successfully.',
      data: room
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/rooms/:id
 * Delete an existing room.
 */
export const deleteRoomHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Room ID is required.'
      });
    }

    const room = await deleteRoom(id);

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully.',
      data: room
    });
  } catch (error) {
    next(error);
  }
};