import { Request, Response } from 'express';
import User from '../models/User';
import MaintenanceRule from '../models/MaintenanceRule';
import MaintenanceLog from '../models/MaintenanceLog';

const DEFAULT_RULES = [
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

export const getDashboardData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    let rules = await MaintenanceRule.find();
    
    // Auto-seed if rules are empty
    if (rules.length === 0) {
      console.log('Rules collection is empty. Auto-seeding default rules...');
      rules = await MaintenanceRule.insertMany(DEFAULT_RULES);
    }

    // [CLEANUP] Remove old hardcoded mock logs if they exist
    const MOCK_NAMES = ["Engine Oil & Filter", "Tire Replacement (Rear)", "Brake Fluid Flush"];
    await MaintenanceLog.deleteMany({ userId, part_name: { $in: MOCK_NAMES } });
    
    const maintenanceItems = await Promise.all(rules.map(async (rule) => {
      const latestLog = await MaintenanceLog.findOne({ userId, part_name: rule.name }).sort({ createdAt: -1 });
      
      let nextServiceOdo: number;
      let currentUsage: number;
      
      if (latestLog) {
        nextServiceOdo = latestLog.next_service_odo;
        currentUsage = user.current_odo - latestLog.odo_at_service;
      } else {
        // Smart calculation for new users with no logs
        const isOil = rule.category?.includes('OIL');
        const startOdo = isOil ? 500 : 0; // Manual specifies first service at 500km for oil
        
        if (user.current_odo < startOdo) {
          nextServiceOdo = startOdo;
        } else {
          const cycles = Math.ceil((user.current_odo - startOdo) / rule.interval_km);
          nextServiceOdo = startOdo + cycles * rule.interval_km;
        }
        
        currentUsage = user.current_odo - (nextServiceOdo - rule.interval_km);
      }

      const nextServiceRemaining = nextServiceOdo - user.current_odo;
      
      // Status levels
      let status = 'safe';
      if (nextServiceRemaining <= 100) {
        status = 'danger';
      } else if (nextServiceRemaining <= 400) {
        status = 'warning';
      } else if (nextServiceRemaining <= 1000) {
        status = 'normal';
      }

      return {
        id: rule._id,
        tag: rule.category || 'MAINTENANCE',
        title: rule.name,
        status,
        distanceLeft: Math.max(0, nextServiceRemaining),
        nextDistance: nextServiceOdo,
        progressCurrent: Math.max(0, currentUsage),
        progressTotal: rule.interval_km
      };
    }));

    res.json({
      currentOdo: user.current_odo,
      dailyAvgKm: user.daily_avg_km,
      maintenanceItems
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOdo = async (req: Request, res: Response): Promise<void> => {
// ... existing updateOdo function ...
  try {
    const userId = req.user?.id;
    const { odo } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (odo === undefined || isNaN(Number(odo))) {
      res.status(400).json({ message: 'Valid ODO value is required' });
      return;
    }

    await User.findByIdAndUpdate(userId, { current_odo: Number(odo) });

    res.json({ message: 'ODO updated successfully', currentOdo: Number(odo) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
