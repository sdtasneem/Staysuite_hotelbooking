const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const guestService = {
    // Get all guests
    getAllGuests: async () => {
        const response = await fetch(`${API_BASE_URL}/guests`);

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
                `Failed to fetch guests: HTTP ${response.status}`
            );
        }

        return data;
    },

    // Get a single guest by ID
    getGuestById: async (guestId) => {
        const response = await fetch(
            `${API_BASE_URL}/guests/${guestId}`
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
                `Failed to fetch guest: HTTP ${response.status}`
            );
        }

        return data;
    }
};