const cron = require('node-cron');
const User = require('../models/User');
const MaintenanceLog = require('../models/MaintenanceLog');

exports.start = () => {
  // Run everyday at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily ODO update cron job...');
    try {
      const users = await User.find();
      for (let user of users) {
        user.current_odo += user.daily_avg_km;
        await user.save();

        // Check against logs for notifications
        // Getting distinct latest logs...
        // For simplicity, we just print a log
        console.log(`Updated user ${user._id} to ODO ${user.current_odo}`);
        
        // Notification logic:
        // Check if user.current_odo is within 100km of next_service_odo from their latest logs
        // This could trigger push notifications via Firebase or sending emails.
      }
    } catch (error) {
      console.error('Cron job error:', error);
    }
  });
};
