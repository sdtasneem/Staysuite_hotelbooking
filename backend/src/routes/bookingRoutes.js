import express from 'express';
import {
  getBookings,
  getBooking
} from '../controllers/bookingController.js';

const router = express.Router();

router.get('/', getBookings);
router.get('/:id', getBooking);

export default router;