import express from 'express';

import {
  getBookings,
  getBooking,
  createNewBooking
} from '../controllers/bookingController.js';

const router = express.Router();

router.get('/', getBookings);
router.get('/:id', getBooking);
router.post('/', createNewBooking);

export default router;