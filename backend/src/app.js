import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { config } from './config/env.js';

import healthRoutes from './routes/healthRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import guestRoutes from './routes/guestRoutes.js';

import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';

const app = express();


// =========================================================
// GLOBAL MIDDLEWARES
// =========================================================

app.use(cors({
  origin: config.clientUrl,
  credentials: true
}));

app.use(express.json());

app.use(morgan('dev'));


// =========================================================
// API ROUTES
// =========================================================

app.use('/api/health', healthRoutes);

app.use('/api/rooms', roomRoutes);

app.use('/api/bookings', bookingRoutes);

app.use('/api/guests', guestRoutes);


// =========================================================
// ERROR HANDLING
// =========================================================

app.use(notFoundHandler);

app.use(errorHandler);


// =========================================================
// START SERVER
// =========================================================

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, '0.0.0.0', () => {
    console.log(
      `[StaySuite API] Server running in ${config.nodeEnv} mode on http://localhost:${config.port}`
    );

    console.log(
      `[StaySuite API] Health check available at http://localhost:${config.port}/api/health`
    );
  });
}


export default app;