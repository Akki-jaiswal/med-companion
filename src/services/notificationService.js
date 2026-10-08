import { Platform } from 'react-native';
let Notifications = null;

try {
  Notifications = require('expo-notifications');
  if (Notifications?.setNotificationHandler) {
    // Show alert, play sound, vibrate even if app is open or closed!
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
  console.log('Notification handler note:', e.message);
}

// Request notification permissions & set high priority channel
export const registerForPushNotificationsAsync = async () => {
  try {
    if (!Notifications?.getPermissionsAsync) return false;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (Platform.OS === 'android' && Notifications.setNotificationChannelAsync) {
      // Android System Notification Channel with Alarm sound & strong vibration
      await Notifications.setNotificationChannelAsync('medication-alarms', {
        name: 'Urgent Medication Alarms',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 600, 400, 600, 400, 600],
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility?.PUBLIC,
        lightColor: '#DC2626',
      });
    }

    return true;
  } catch (error) {
    console.log('Permission register note:', error.message);
    return false;
  }
};

// Fire an immediate heads-up alarm notification on the device
export const fireInstantMedicationNotification = async (med) => {
  try {
    if (!Notifications?.scheduleNotificationAsync) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ TIME FOR MEDICATION: ${med.name}`,
        body: `Dosage: ${med.dosage} (${med.mealCondition}). Please take it now!`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority?.MAX,
        channelId: 'medication-alarms',
        data: { medId: med.id, type: 'medication_alarm' },
      },
      trigger: null, // Fires immediately!
    });
    return id;
  } catch (error) {
    console.log('fireInstantMedicationNotification note:', error.message);
    return null;
  }
};

// Schedule background alarm for future seconds
export const scheduleMedicationAlarm = async (med, delaySeconds = 60) => {
  try {
    if (!Notifications?.scheduleNotificationAsync) return null;

    const safeSeconds = Math.max(1, Math.round(delaySeconds));
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ TIME FOR MEDICATION: ${med.name}`,
        body: `Dosage: ${med.dosage} (${med.mealCondition}). Please take it now!`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority?.MAX,
        channelId: 'medication-alarms',
        data: { medId: med.id, type: 'medication_alarm' },
      },
      trigger: {
        seconds: safeSeconds,
      },
    });
    return id;
  } catch (error) {
    console.log('scheduleMedicationAlarm note:', error.message);
    return null;
  }
};

// Schedule Caretaker Escalation Alert to fire automatically at delaySeconds if not cancelled
export const scheduleCaretakerEscalationNotification = async (patientName, pillName, scheduledTime, delaySeconds = 60) => {
  try {
    if (!Notifications?.scheduleNotificationAsync) return null;

    const safeSeconds = Math.max(1, Math.round(delaySeconds));
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `🚨 CARETAKER ALERT: ${patientName} Missed Pill!`,
        body: `${patientName} did not acknowledge ${pillName} scheduled at ${scheduledTime}. Action required!`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority?.MAX,
        channelId: 'medication-alarms',
        data: { type: 'escalation_alert', pillName },
      },
      trigger: {
        seconds: safeSeconds,
      },
    });
    return id;
  } catch (error) {
    console.log('scheduleCaretakerEscalationNotification note:', error.message);
    return null;
  }
};

// Cancel a scheduled notification (e.g. when patient marks pill as Taken)
export const cancelScheduledNotification = async (notificationId) => {
  try {
    if (!notificationId || !Notifications?.cancelScheduledNotificationAsync) return;
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (e) {
    console.log('cancelScheduledNotification note:', e.message);
  }
};

// Trigger REAL Android System Notification in the phone's top tray for Caretaker!
export const triggerCaretakerPushAlert = async (patientName, pillName, scheduledTime) => {
  try {
    if (!Notifications?.scheduleNotificationAsync) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🚨 CARETAKER ALERT: ${patientName} Missed Pill!`,
        body: `${patientName} did not acknowledge ${pillName} scheduled at ${scheduledTime}. Action required!`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority?.MAX,
        channelId: 'medication-alarms',
        data: { type: 'escalation_alert' },
      },
      trigger: null, // Pops up immediately in device notification bar!
    });
  } catch (error) {
    console.log('triggerCaretakerPushAlert note:', error.message);
  }
};
