import { config } from '../config/env.js';

export const getCurrentWeather = async (latitude, longitude) => {
    const url = new URL(`${config.externalApis.openMeteo}/forecast`);

    url.searchParams.set('latitude', latitude);
    url.searchParams.set('longitude', longitude);
    url.searchParams.set(
        'current',
        [
            'temperature_2m',
            'relative_humidity_2m',
            'apparent_temperature',
            'weather_code',
            'wind_speed_10m'
        ].join(',')
    );
    url.searchParams.set('timezone', 'auto');

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                `Open-Meteo returned HTTP ${response.status}`
            );
        }

        const data = await response.json();

        return {
            source: 'Open-Meteo',
            location: {
                latitude: data.latitude,
                longitude: data.longitude,
                timezone: data.timezone
            },
            current: {
                temperatureC: data.current?.temperature_2m ?? null,
                humidityPercent: data.current?.relative_humidity_2m ?? null,
                apparentTemperatureC:
                    data.current?.apparent_temperature ?? null,
                weatherCode: data.current?.weather_code ?? null,
                windSpeedKmh: data.current?.wind_speed_10m ?? null
            }
        };
    } catch (error) {
        throw new Error(`Weather service failed: ${error.message}`);
    }
};