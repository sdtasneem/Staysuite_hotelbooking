import express from 'express';
import { getRooms, getAvailableRoomsHandler } from '../controllers/roomController.js';

const router = express.Router();

// GET /api/rooms/available?check_in_date=YYYY-MM-DD&check_out_date=YYYY-MM-DD
router.get('/available', getAvailableRoomsHandler);

// GET /api/rooms
router.get('/', getRooms);

export default router;