import cron from 'node-cron';
import User from '../models/User';
import * as alertService from '../services/alertService';

export const start = () => {
  // Run everyday at 8:00 AM UTC+7 (1:00 AM UTC => 0 1 * * *)
  // For easy testing locally, you can change to '* * * * *' (every minute)
  cron.schedule('0 1 * * *', async () => {
    console.log('Running daily ODO update & Alert generation cron job...');
    try {
      const users = await User.find();
      for (let user of users) {
        // Update ODO
        user.current_odo += user.daily_avg_km;
        await user.save();

        console.log(`Daily update: user ${user._id} ODO incremented to ${user.current_odo}`);

        // Run maintenance check and send notifications
        await alertService.checkMaintenanceAndNotify(user._id.toString());
      }
    } catch (error) {
      console.error('Cron job error:', error);
    }
  });
};

