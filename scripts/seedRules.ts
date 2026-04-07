import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MaintenanceRule from '../models/MaintenanceRule';

dotenv.config();

const rules = [
  { name: 'Dầu nhớt máy', interval_km: 1500, category: 'ENGINE OIL' },
  { name: 'Dầu láp (Nhớt hộp số)', interval_km: 4500, category: 'GEAR OIL' },
  { name: 'Vệ sinh nồi (Côn)', interval_km: 5000, category: 'CLUTCH' },
  { name: 'Lọc gió', interval_km: 10000, category: 'AIR FILTER' },
  { name: 'Bugi', interval_km: 10000, category: 'SPARK PLUG' },
  { name: 'Nước làm mát', interval_km: 20000, category: 'COOLANT' },
  { name: 'Dây curoa', interval_km: 20000, category: 'DRIVE BELT' },
  { name: 'Bố thắng (Má phanh)', interval_km: 15000, category: 'BRAKE PADS' },
  { name: 'Lốp xe (Vỏ xe)', interval_km: 15000, category: 'TIRES' },
];

const seedRules = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ab26supervise';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing rules to avoid duplicates
    await MaintenanceRule.deleteMany({});
    console.log('Cleared existing rules');

    // Insert new rules
    await MaintenanceRule.insertMany(rules);
    console.log('Inserted 9 maintenance rules successfully');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding rules:', error);
    process.exit(1);
  }
};

seedRules();
