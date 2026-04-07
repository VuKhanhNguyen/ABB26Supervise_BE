const mongoose = require('mongoose');
require('dotenv').config();

const MOCK_NAMES = [
  "Engine Oil & Filter",
  "Tire Replacement (Rear)",
  "Brake Fluid Flush"
];

async function cleanup() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const result = await mongoose.connection.collection('maintenancelogs').deleteMany({
      part_name: { $in: MOCK_NAMES }
    });

    console.log(`Deleted ${result.deletedCount} mock maintenance records!`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error cleaning up:', err);
    process.exit(1);
  }
}

cleanup();
