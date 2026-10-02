import {
  getAllBookings,
  getBookingById,
  createBooking,
  cancelBooking,
  checkInBooking,
  checkOutBooking
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


// =========================================================
// CHECK-IN
// =========================================================

export const checkInBookingHandler = async (req, res, next) => {
  try {
    const result = await checkInBooking(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (result.invalidStatus) {
      return res.status(409).json({
        success: false,
        message: `Booking cannot be checked in because its current status is '${result.currentStatus}'.`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Guest checked in successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};


// =========================================================
// CHECK-OUT
// =========================================================

export const checkOutBookingHandler = async (req, res, next) => {
  try {
    const result = await checkOutBooking(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (result.invalidStatus) {
      return res.status(409).json({
        success: false,
        message: `Booking cannot be checked out because its current status is '${result.currentStatus}'.`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Guest checked out successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};