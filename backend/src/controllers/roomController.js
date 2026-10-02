import { getAllRooms } from '../services/roomService.js';

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