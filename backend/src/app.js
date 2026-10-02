import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env.js';
import healthRoutes from './routes/healthRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';

const app = express();

// Global Middlewares
app.use(cors({
  origin: config.clientUrl,
  credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api', healthRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'StaySuite API',
    description: 'Hotel Booking & Guest Operations Portal Backend',
    version: '0.1.0',
    status: 'online',
    endpoints: {
      health: '/api/health',
      rooms: '/api/rooms',
      bookings: '/api/bookings'
    }
  });
});

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(
      `[StaySuite API] Server running in ${config.nodeEnv} mode on http://localhost:${config.port}`
    );

    console.log(
      `[StaySuite API] Health check available at http://localhost:${config.port}/api/health`
    );
  });
}

export default app;