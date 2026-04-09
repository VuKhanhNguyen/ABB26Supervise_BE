import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import dashboardRoutes from './routes/dashboardRoutes';
import maintenanceRoutes from './routes/maintenanceRoutes';
import authRoutes from './routes/authRoutes';
import alertRoutes from './routes/alertRoutes';
import { start as startOdoUpdater } from './cron/odoUpdater';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ab26supervise';
mongoose.connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
    startOdoUpdater();
  })
  .catch((err: Error) => {
    console.error('MongoDB connection error:', err);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/alerts', alertRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
