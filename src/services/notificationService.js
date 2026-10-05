import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications appear when app is in foreground or background
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});

// Request notification permissions
export const registerForPushNotificationsAsync = async () => {
  let token;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permission not granted');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('medication-alarms', {
      name: 'Medication Alarms',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 500, 500],
      sound: 'default',
      enableVibrate: true,
      lightColor: '#DC2626',
    });
  }

  return true;
};

// Schedule a local notification even if app is closed / minimized
export const scheduleMedicationAlarm = async (med, delaySeconds = 60) => {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ Medicine Time: ${med.name}`,
        body: `Please take ${med.dosage} (${med.mealCondition}). Tap to open and mark taken.`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: { medId: med.id, type: 'medication_alarm' },
      },
      trigger: {
        seconds: delaySeconds, // Fires in X seconds
        channelId: 'medication-alarms',
      },
    });
    console.log(`Scheduled background notification ID: ${id}`);
    return id;
  } catch (error) {
    console.log('Error scheduling notification:', error);
    return null;
  }
};

// Trigger instant Caretaker Escalation Notification
export const triggerCaretakerPushAlert = async (patientName, pillName, scheduledTime) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🚨 MISSED DOSE ALERT: ${patientName}`,
        body: `${patientName} did not take ${pillName} scheduled at ${scheduledTime}. Tap to call immediately!`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: { type: 'escalation_alert' },
      },
      trigger: null, // Triggers immediately
    });
  } catch (error) {
    console.log('Error triggering caretaker alert:', error);
  }
};
