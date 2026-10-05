import { Platform } from 'react-native';
let Notifications = null;

try {
  Notifications = require('expo-notifications');
  if (Notifications?.setNotificationHandler) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        priority: Notifications.AndroidNotificationPriority?.MAX,
      }),
    });
  }
} catch (e) {
  console.log('expo-notifications import guard:', e.message);
}

// Request notification permissions
export const registerForPushNotificationsAsync = async () => {
  try {
    if (!Notifications?.getPermissionsAsync) return false;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android' && Notifications.setNotificationChannelAsync) {
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
  } catch (error) {
    console.log('registerForPushNotificationsAsync note:', error.message);
    return false;
  }
};

// Schedule a local notification
export const scheduleMedicationAlarm = async (med, delaySeconds = 60) => {
  try {
    if (!Notifications?.scheduleNotificationAsync) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ Medicine Time: ${med.name}`,
        body: `Please take ${med.dosage} (${med.mealCondition}). Tap to open and mark taken.`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority?.MAX,
        data: { medId: med.id, type: 'medication_alarm' },
      },
      trigger: {
        seconds: delaySeconds,
        channelId: 'medication-alarms',
      },
    });
    return id;
  } catch (error) {
    console.log('scheduleMedicationAlarm note:', error.message);
    return null;
  }
};

// Trigger instant Caretaker Escalation Notification
export const triggerCaretakerPushAlert = async (patientName, pillName, scheduledTime) => {
  try {
    if (!Notifications?.scheduleNotificationAsync) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🚨 MISSED DOSE ALERT: ${patientName}`,
        body: `${patientName} did not take ${pillName} scheduled at ${scheduledTime}. Tap to call immediately!`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority?.MAX,
        data: { type: 'escalation_alert' },
      },
      trigger: null,
    });
  } catch (error) {
    console.log('triggerCaretakerPushAlert note:', error.message);
  }
};
