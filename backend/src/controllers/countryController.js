import { getCountryByName } from '../services/countryService.js';

export const getCountry = async (req, res) => {
    try {
        const { name } = req.query;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Country name is required.'
            });
        }

        const country = await getCountryByName(name);

        return res.status(200).json({
            success: true,
            ...country
        });
    } catch (error) {
        console.error('Country API error:', error);

        if (error.message === 'Country not found.') {
            return res.status(404).json({
                success: false,
                message: 'Country not found.'
            });
        }

        return res.status(502).json({
            success: false,
            message: 'Unable to retrieve country information from the external service.'
        });
    }
};