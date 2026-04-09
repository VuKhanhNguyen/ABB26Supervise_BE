import { Request, Response } from 'express';
import Alert from '../models/Alert';

export const getAlerts = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    // Fetch user's alerts, sort by newest first
    const alerts = await Alert.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(alerts);
  } catch (error) {
    console.error('Lỗi khi lấy thông báo:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const alert = await Alert.findOneAndUpdate(
      { _id: id, userId },
      { hasRead: true },
      { new: true }
    );
    if (!alert) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }
    res.status(200).json(alert);
  } catch (error) {
    console.error('Lỗi khi cập nhật thông báo:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
