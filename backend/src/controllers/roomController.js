import { getAllRooms, getAvailableRooms } from '../services/roomService.js';

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

    // --- Validation ---
    if (!check_in_date || !check_out_date) {
      return res.status(400).json({
        success: false,
        message: 'Both check_in_date and check_out_date query parameters are required (YYYY-MM-DD).'
      });
    }

    const checkIn  = new Date(check_in_date);
    const checkOut = new Date(check_out_date);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD for both check_in_date and check_out_date.'
      });
    }

    if (checkIn >= checkOut) {
      return res.status(400).json({
        success: false,
        message: 'check_in_date must be before check_out_date.'
      });
    }

    // --- Service call ---
    const rooms = await getAvailableRooms(check_in_date, check_out_date);

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