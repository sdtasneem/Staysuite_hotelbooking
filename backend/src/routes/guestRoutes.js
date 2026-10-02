import express from 'express';

import {
    getGuests,
    getGuest
} from '../controllers/guestController.js';

const router = express.Router();

router.get('/', getGuests);
router.get('/:id', getGuest);

export default router;