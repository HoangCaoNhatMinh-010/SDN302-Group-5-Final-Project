import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import User, { USER_ROLES } from './models/User.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import petRoutes from './routes/petRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import groomerRoutes from './routes/groomerRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Load config
dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // hoặc cấu hình domain frontend
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check route
app.get('/api/health', (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? 'online' : 'degraded',
    database: databaseConnected ? 'connected' : 'disconnected',
    message: databaseConnected
      ? 'PawCare Studio API and database are ready'
      : 'PawCare Studio database connection is unavailable',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/pet-owner/pets', petRoutes);
app.use('/api/v1/pet-owner/family-members', petRoutes);
app.use('/api/v1/pet-owner/appointments', appointmentRoutes);
app.use('/api/v1/groomer', groomerRoutes);
app.use('/api/v1/family-members', petRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/doctors', groomerRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Không tìm thấy tài nguyên: ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use((err, req, res, _next) => {
  console.error('[Internal Error]:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Lỗi hệ thống máy chủ',
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters before starting the API.');
  }
  await connectDB();
  const unsupportedRoles = await User.distinct('role', { role: { $nin: USER_ROLES } });
  if (unsupportedRoles.length) {
    throw new Error(
      `Unsupported user role(s) found: ${unsupportedRoles.join(', ')}. Back up the database and manually update the affected users.role values to the six supported roles: ${USER_ROLES.join(', ')}.`
    );
  }
  app.listen(PORT, () => {
    console.log(`PawCare Studio API is running on http://localhost:${PORT}`);
  });
};

startServer().catch(async (error) => {
  console.error(`[Server Startup Error]: ${error.message}`);
  await mongoose.disconnect();
  process.exitCode = 1;
});
