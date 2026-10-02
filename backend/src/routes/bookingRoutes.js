import express from 'express';

import {
  getBookings,
  getBooking,
  createNewBooking,
  cancelBookingHandler,
  checkInBookingHandler,
  checkOutBookingHandler
} from '../controllers/bookingController.js';

const router = express.Router();

router.get('/', getBookings);

router.get('/:id', getBooking);

router.post('/', createNewBooking);

router.patch('/:id/cancel', cancelBookingHandler);

router.patch('/:id/check-in', checkInBookingHandler);

router.patch('/:id/check-out', checkOutBookingHandler);

export default router;