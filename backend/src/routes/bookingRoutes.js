import express from 'express';

import {
  getBookings,
  getBooking,
  createNewBooking,
  cancelBookingHandler
} from '../controllers/bookingController.js';

const router = express.Router();

router.get('/', getBookings);
router.get('/:id', getBooking);
router.post('/', createNewBooking);
router.patch('/:id/cancel', cancelBookingHandler);

export default router;