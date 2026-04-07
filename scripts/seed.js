const mongoose = require('mongoose');
require('dotenv').config();

const maintenanceRuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  interval_km: { type: Number, required: true },
  category: { type: String },
});

const MaintenanceRule = mongoose.model('MaintenanceRule', maintenanceRuleSchema);

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

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ab26supervise';
    console.log('Connecting to MongoDB:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected!');

    await MaintenanceRule.deleteMany({});
    console.log('Deleted existing rules.');

    await MaintenanceRule.insertMany(rules);
    console.log('Successfully inserted 9 maintenance rules!');

    await mongoose.disconnect();
    console.log('Disconnected.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seed();
