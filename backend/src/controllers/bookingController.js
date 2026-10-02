import {
  getAllBookings,
  getBookingById
} from '../services/bookingService.js';

export const getBookings = async (req, res, next) => {
  try {
    const bookings = await getAllBookings();

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

export const getBooking = async (req, res, next) => {
  try {
    const booking = await getBookingById(req.params.id);

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};