import {
    getAllGuests,
    getGuestById
} from '../services/guestService.js';

export const getGuests = async (req, res, next) => {
    try {
        const guests = await getAllGuests();

        res.status(200).json({
            success: true,
            data: guests
        });
    } catch (error) {
        next(error);
    }
};

export const getGuest = async (req, res, next) => {
    try {
        const { id } = req.params;

        const guest = await getGuestById(id);

        res.status(200).json({
            success: true,
            data: guest
        });
    } catch (error) {
        next(error);
    }
};