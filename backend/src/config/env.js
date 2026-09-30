import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  },
  externalApis: {
    openMeteo: process.env.OPEN_METEO_BASE_URL || 'https://api.open-meteo.com/v1',
    restCountries: process.env.REST_COUNTRIES_BASE_URL || 'https://restcountries.com/v3.1'
  }
};

export default config;
