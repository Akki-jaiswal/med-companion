/**
 * Offline verification script for MedCompanion notification service module loading
 */
const fs = require('fs');
const path = require('path');

console.log('--- Verifying Notification Submodules ---');

const modulesToCheck = [
  'node_modules/expo-notifications/build/scheduleNotificationAsync.js',
  'node_modules/expo-notifications/build/NotificationsHandler.js',
  'node_modules/expo-notifications/build/NotificationPermissions.js',
  'node_modules/expo-notifications/build/setNotificationChannelAsync.js',
  'node_modules/expo-notifications/build/cancelScheduledNotificationAsync.js',
];

let allOk = true;
for (const mod of modulesToCheck) {
  const p = path.resolve(__dirname, '..', mod);
  if (fs.existsSync(p)) {
    console.log(`[PASS] ${mod} exists`);
  } else {
    console.error(`[FAIL] ${mod} missing`);
    allOk = false;
  }
}

if (allOk) {
  console.log('✅ All notification submodules verified successfully.');
} else {
  process.exit(1);
}
