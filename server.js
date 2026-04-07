require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const dashboardRoutes = require('./routes/dashboardRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const odoUpdaterCron = require('./cron/odoUpdater');

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ab26supervise', {
  // Use Mongoose 6+ default config (no longer need useNewUrlParser or useUnifiedTopology)
}).then(() => {
  console.log('Connected to MongoDB');
  
  // Start cron jobs after successful connection
  odoUpdaterCron.start();
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/maintenance', maintenanceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
