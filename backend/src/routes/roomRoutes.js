import express from 'express';

import {
  getRooms,
  getAvailableRoomsHandler,
  createRoomHandler,
  updateRoomHandler,
  deleteRoomHandler
} from '../controllers/roomController.js';

import {
  requireAuth,
  requireRole
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
// GET /api/rooms/available?check_in_date=YYYY-MM-DD&check_out_date=YYYY-MM-DD
router.get('/available', getAvailableRoomsHandler);

// GET /api/rooms
router.get('/', getRooms);

// Protected room management routes
// FRONT_DESK and MANAGER can manage rooms.

// POST /api/rooms
router.post(
  '/',
  requireAuth,
  requireRole('FRONT_DESK', 'MANAGER'),
  createRoomHandler
);

// PATCH /api/rooms/:id
router.patch(
  '/:id',
  requireAuth,
  requireRole('FRONT_DESK', 'MANAGER'),
  updateRoomHandler
);

// DELETE /api/rooms/:id
router.delete(
  '/:id',
  requireAuth,
  requireRole('FRONT_DESK', 'MANAGER'),
  deleteRoomHandler
);

export default router;