const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/* =========================================================
   BOOKING SERVICE
   ========================================================= */

export const bookingService = {
    // Get all bookings
    getAllBookings: async () => {
        const response = await fetch(`${API_BASE_URL}/bookings`);

        const text = await response.text();

        let data;

        try {
            data = text ? JSON.parse(text) : null;
        } catch (error) {
            throw new Error(
                `Invalid response from server: ${text || 'Empty response'}`
            );
        }

        if (!response.ok) {
            throw new Error(
                data?.message ||
                `Failed to fetch bookings: HTTP ${response.status}`
            );
        }

        return data;
    },

    // Create a new booking
    createBooking: async (bookingData) => {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });

        const text = await response.text();

        let data = null;

        if (text) {
            try {
                data = JSON.parse(text);
            } catch (error) {
                throw new Error(
                    `Invalid response from server: ${text}`
                );
            }
        }

        if (!response.ok) {
            throw new Error(
                data?.message ||
                `Failed to create booking: HTTP ${response.status}`
            );
        }

        return data;
    },

    // Cancel a booking
    cancelBooking: async (bookingId) => {
        const response = await fetch(
            `${API_BASE_URL}/bookings/${bookingId}/cancel`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        const text = await response.text();

        let data = null;

        if (text) {
            try {
                data = JSON.parse(text);
            } catch (error) {
                throw new Error(
                    `Invalid response from server: ${text}`
                );
            }
        }

        if (!response.ok) {
            throw new Error(
                data?.message ||
                `Failed to cancel booking: HTTP ${response.status}`
            );
        }

        return (
            data || {
                success: true,
                message: 'Booking cancelled successfully'
            }
        );
    },

    // Check-in a booking
    checkInBooking: async (bookingId) => {
        const response = await fetch(
            `${API_BASE_URL}/bookings/${bookingId}/check-in`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        const text = await response.text();

        let data = null;

        if (text) {
            try {
                data = JSON.parse(text);
            } catch (error) {
                throw new Error(
                    `Invalid response from server: ${text}`
                );
            }
        }

        if (!response.ok) {
            throw new Error(
                data?.message ||
                `Failed to check in booking: HTTP ${response.status}`
            );
        }

        return data;
    },

    // Check-out a booking
    checkOutBooking: async (bookingId) => {
        const response = await fetch(
            `${API_BASE_URL}/bookings/${bookingId}/check-out`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        const text = await response.text();

        let data = null;

        if (text) {
            try {
                data = JSON.parse(text);
            } catch (error) {
                throw new Error(
                    `Invalid response from server: ${text}`
                );
            }
        }

        if (!response.ok) {
            throw new Error(
                data?.message ||
                `Failed to check out booking: HTTP ${response.status}`
            );
        }

        return data;
    }
};


/* =========================================================
   ROOM SERVICE
   ========================================================= */

export const roomService = {
    // Get all rooms
    getAllRooms: async () => {
        const response = await fetch(`${API_BASE_URL}/rooms`);

        const text = await response.text();

        let data;

        try {
            data = text ? JSON.parse(text) : null;
        } catch (error) {
            throw new Error(
                `Invalid response from server: ${text || 'Empty response'}`
            );
        }

        if (!response.ok) {
            throw new Error(
                data?.message ||
                `Failed to fetch rooms: HTTP ${response.status}`
            );
        }

        return data;
    },

    // Get available rooms for a date range
    getAvailableRooms: async (checkInDate, checkOutDate) => {
        const params = new URLSearchParams({
            check_in_date: checkInDate,
            check_out_date: checkOutDate
        });

        const response = await fetch(
            `${API_BASE_URL}/rooms/available?${params.toString()}`
        );

        const text = await response.text();

        let data;

        try {
            data = text ? JSON.parse(text) : null;
        } catch (error) {
            throw new Error(
                `Invalid response from server: ${text || 'Empty response'}`
            );
        }

        if (!response.ok) {
            throw new Error(
                data?.message ||
                `Failed to fetch available rooms: HTTP ${response.status}`
            );
        }

        return data;
    }
};