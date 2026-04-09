import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import { Expo } from 'expo-server-sdk';

dotenv.config();

const expo = new Expo();

async function sendTestNotification() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ab26supervise';
  await mongoose.connect(mongoUri);

  // Tìm user cuối cùng có pushToken (giả định là user anh vừa test)
  const user = await User.findOne({ pushToken: { $exists: true, $ne: '' } }).sort({ updatedAt: -1 });

  if (!user || !user.pushToken) {
    console.log('❌ Không tìm thấy user nào có Push Token trong Database.');
    process.exit(0);
  }

  console.log(`🚀 Đang gửi thông báo tới User: ${user.name}`);
  console.log(`🔑 Token: ${user.pushToken}`);

  const messages = [{
    to: user.pushToken,
    sound: 'default',
    title: '🔔 THÔNG BÁO BẢO TRÌ (DEMO)',
    body: 'Linh kiện "Dầu máy" còn 50km nữa là đến hạn bảo trì. Hãy đăng ký lịch hẹn ngay!',
    data: { route: '/alerts' },
    priority: 'high' as const,
  }];

  try {
    let chunks = expo.chunkPushNotifications(messages);
    for (let chunk of chunks) {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      console.log('✅ Đã gửi thành công!', tickets);
    }
  } catch (error) {
    console.error('Lỗi khi gửi:', error);
  } finally {
    process.exit(0);
  }
}

sendTestNotification();
