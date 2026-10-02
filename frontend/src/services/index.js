const API_BASE_URL = '/api';

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

        // Only parse JSON if the response actually contains something
        if (text) {
            try {
                data = JSON.parse(text);
            } catch (error) {
                throw new Error(
                    `Invalid response from server: ${text}`
                );
            }
        }

        // Handle backend errors
        if (!response.ok) {
            throw new Error(
                data?.message ||
                `Failed to cancel booking: HTTP ${response.status}`
            );
        }

        // Successful response
        return (
            data || {
                success: true,
                message: 'Booking cancelled successfully'
            }
        );
    }
};