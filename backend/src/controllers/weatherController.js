import { getCurrentWeather } from '../services/weatherService.js';

export const getWeather = async (req, res, next) => {
    try {
        const { latitude, longitude } = req.query;

        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required.'
            });
        }

        const lat = Number(latitude);
        const lon = Number(longitude);

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lon) ||
            lat < -90 ||
            lat > 90 ||
            lon < -180 ||
            lon > 180
        ) {
            return res.status(400).json({
                success: false,
                message: 'Latitude must be between -90 and 90, and longitude must be between -180 and 180.'
            });
        }

        const weather = await getCurrentWeather(lat, lon);

        return res.status(200).json({
            success: true,
            ...weather
        });
    } catch (error) {
        console.error('Weather API error:', error);

        return res.status(502).json({
            success: false,
            message: 'Unable to retrieve weather data from the external weather service.'
        });
    }
};