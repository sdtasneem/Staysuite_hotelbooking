import { config } from '../config/env.js';

export const getCountryByName = async (countryName) => {
    if (!countryName || !countryName.trim()) {
        throw new Error('Country name is required.');
    }

    const requestedName = countryName.trim();
    const encodedCountry = encodeURIComponent(requestedName);

    const response = await fetch(
        `${config.externalApis.restCountries}/name/${encodedCountry}`
    );

    if (!response.ok) {
        throw new Error(
            `Country API returned HTTP ${response.status}`
        );
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Country not found.');
    }

    const requestedLower = requestedName.toLowerCase();

    const country =
        data.find(
            (item) => item.name?.toLowerCase() === requestedLower
        ) || data[0];

    return {
        source: 'countries.dev',
        country: {
            name: country.name ?? null,
            officialName: country.name ?? null,
            capital: country.capital ?? null,
            region: country.region ?? null,
            subregion: country.subregion ?? null,
            population: country.population ?? null,
            currency: country.currencies?.[0]?.name ?? null,
            flag: country.flag ?? null
        }
    };
};