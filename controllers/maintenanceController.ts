import multer from 'multer';
import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import MaintenanceLog from '../models/MaintenanceLog';
import MaintenanceRule from '../models/MaintenanceRule';
import User from '../models/User';


// Multer memory storage
const storage = multer.memoryStorage();
export const uploadMiddleware = multer({ storage }).single('receiptImage');

export const addMaintenanceRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { part_name, current_odo, cost, notes } = req.body;
    let receiptUrl = '';

    // Upload to Cloudinary if image provided
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const uploadResult = await cloudinary.uploader.upload(dataURI, { folder: "ab26supervise" });
      receiptUrl = uploadResult.secure_url;
    }

    // Find rule to get the interval
    const rule = await MaintenanceRule.findOne({ name: part_name });
    if (!rule) {
      res.status(400).json({ message: 'Invalid maintenance part' });
      return;
    }

    const next_service_odo = Number(current_odo) + rule.interval_km;

    const log = new MaintenanceLog({
      userId,
      part_name,
      odo_at_service: Number(current_odo),
      next_service_odo,
      cost: cost ? Number(cost) : undefined,
      notes,
      receipt_image_url: receiptUrl
    });

    await log.save();

    // Optionally update user current_odo if it was changed
    await User.findByIdAndUpdate(userId, { current_odo: Number(current_odo) });

    res.status(201).json({ message: 'Maintenance record added successfully', log });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMaintenanceHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const logs = await MaintenanceLog.find({ userId }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
