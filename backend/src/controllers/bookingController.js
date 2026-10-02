import {
  getAllBookings,
  getBookingById,
  createBooking,
  cancelBooking
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

export const createNewBooking = async (req, res, next) => {
  try {
    const booking = await createBooking(req.body);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBookingHandler = async (req, res, next) => {
  try {
    const result = await cancelBooking(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const message = result.alreadyCancelled
      ? 'Booking already cancelled'
      : 'Booking cancelled successfully';

    return res.status(200).json({
      success: true,
      message,
      data: result
    });
  } catch (error) {
    next(error);
  }
};