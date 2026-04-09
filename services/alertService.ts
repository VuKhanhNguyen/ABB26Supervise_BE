import User from '../models/User';
import MaintenanceLog from '../models/MaintenanceLog';
import Alert from '../models/Alert';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import mongoose from 'mongoose';

const expo = new Expo();

export const checkMaintenanceAndNotify = async (userId: string | mongoose.Types.ObjectId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error(`AlertService: User ${userId} not found`);
      return;
    }

    console.log(`Checking maintenance for user ${user.name} (ODO: ${user.current_odo})`);

    // Fetch user's latest maintenance logs for each part
    const logs = await MaintenanceLog.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId as string) } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$part_name",
          latestLog: { $first: "$$ROOT" }
        }
      }
    ]);

    let pushedMessages: ExpoPushMessage[] = [];
    let hasAlerts = false;

    for (let group of logs) {
      const log = group.latestLog;
      const remainingKm = log.next_service_odo - user.current_odo;

      let category = 'Healthy';
      let variant = 'healthy';
      let icon = 'thermostat';
      let alertTitle = '';
      let alertDesc = '';
      let tag = '';
      
      if (remainingKm <= 20) {
        category = 'Critical';
        variant = 'critical';
        icon = 'warning';
        alertTitle = `${log.part_name} quá hạn hoặc sắp đến hạn!`;
        alertDesc = `Hãy kiểm tra và thay thế ${log.part_name} ngay lập tức để duy trì hiệu suất.`;
        tag = remainingKm < 0 ? `quá ${Math.abs(remainingKm)}km` : `còn ${remainingKm}km`;
        hasAlerts = true;
      } else if (remainingKm <= 100) {
        category = 'Reminder';
        variant = 'reminder';
        icon = 'opacity';
        alertTitle = `${log.part_name} sắp đến hạn sửa chữa`;
        alertDesc = `Lên lịch kiểm tra ${log.part_name} tại trung tâm dịch vụ gần nhất.`;
        tag = `còn ${remainingKm}km`;
        hasAlerts = true;
      }
      
      if (category !== 'Healthy') {
        // Check if a similar unread alert already exists to avoid flooding
        const existingAlert = await Alert.findOne({ 
          userId: user._id, 
          title: alertTitle,
          hasRead: false 
        });

        if (!existingAlert) {
          // Save to database
          const newAlert = new Alert({
            userId: user._id,
            title: alertTitle,
            description: alertDesc,
            tag,
            category,
            icon,
            variant
          });
          await newAlert.save();

          // Push notification logic
          if (user.pushToken && Expo.isExpoPushToken(user.pushToken)) {
            pushedMessages.push({
              to: user.pushToken,
              sound: 'default',
              title: alertTitle,
              body: alertDesc,
              data: { route: '/alerts' },
              priority: 'high'
            });
          }
        }
      }
    }
    
    // Push "Everything OK" if no alerts
    if (!hasAlerts) {
       // Check if "Everything OK" alert already exists
       const existingOk = await Alert.findOne({
         userId: user._id,
         category: 'Healthy',
         hasRead: false
       });

       if (!existingOk) {
         const newAlert = new Alert({
            userId: user._id,
            title: "Hệ thống hoạt động ổn định",
            description: "Không có lỗi linh kiện nào cần bảo trì lúc này.",
            tag: "System OK",
            category: "Healthy",
            icon: "thermostat",
            variant: "healthy"
          });
          await newAlert.save();
  
          if (user.pushToken && Expo.isExpoPushToken(user.pushToken)) {
             pushedMessages.push({
              to: user.pushToken,
              sound: 'default',
              title: "Hệ thống hoạt động ổn định",
              body: "Không có lỗi linh kiện nào cần bảo trì lúc này.",
              data: { route: '/alerts' },
              priority: 'default'
            });
          }
       }
    }

    // Send push notifications
    if (pushedMessages.length > 0) {
      let chunks = expo.chunkPushNotifications(pushedMessages);
      for (let chunk of chunks) {
        try {
          const tickets = await expo.sendPushNotificationsAsync(chunk);
          console.log(`Push notifications sent for user ${user.name}`, tickets);
        } catch (error) {
          console.error('Error sending push chunk:', error);
        }
      }
    }
  } catch (error) {
    console.error('AlertService Error:', error);
  }
};
