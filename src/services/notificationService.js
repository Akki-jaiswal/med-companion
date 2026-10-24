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
      }),
    });
  }
} catch (e) {
  console.log('Notification handler note:', e.message);
}

// Android fallback constants to prevent undefined property crashes in Expo
const ANDROID_IMPORTANCE_MAX = 5;
const ANDROID_IMPORTANCE_HIGH = 4;
const ANDROID_VISIBILITY_PUBLIC = 1;

// Request notification permissions & set high priority channel
export const registerForPushNotificationsAsync = async () => {
  try {
    if (!Notifications?.getPermissionsAsync) return false;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted' && Notifications?.requestPermissionsAsync) {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (Platform.OS === 'android' && Notifications?.setNotificationChannelAsync) {
      const maxImp = Notifications?.AndroidImportance?.MAX ?? ANDROID_IMPORTANCE_MAX;
      const highImp = Notifications?.AndroidImportance?.HIGH ?? ANDROID_IMPORTANCE_HIGH;
      const visPublic = Notifications?.AndroidNotificationVisibility?.PUBLIC ?? ANDROID_VISIBILITY_PUBLIC;

      // 1. Android System Urgent Alarm Channel (High priority + Sound + Strong Vibration)
      await Notifications.setNotificationChannelAsync('medication-alarms', {
        name: 'Urgent Medication Alarms',
        importance: maxImp,
        vibrationPattern: [0, 600, 400, 600, 400, 600],
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
        lockscreenVisibility: visPublic,
        lightColor: '#DC2626',
      });

      // 2. Upcoming 10-Minute Pre-Alarm Channel (Notifies before pill time)
      await Notifications.setNotificationChannelAsync('medication-reminders', {
        name: 'Upcoming Pill Reminders (10m Prior)',
        importance: highImp,
        vibrationPattern: [0, 300, 200, 300],
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
        lockscreenVisibility: visPublic,
        lightColor: '#0D9488',
      });
    }

    return true;
  } catch (error) {
    console.log('Permission register note:', error.message);
    return false;
  }
};

// Fire an immediate heads-up alarm notification on the device (Supports single or multiple pills)
export const fireInstantMedicationNotification = async (medOrMeds) => {
  try {
    if (!Notifications?.scheduleNotificationAsync) return null;
    const medsArray = Array.isArray(medOrMeds) ? medOrMeds : [medOrMeds];
    if (medsArray.length === 0) return null;

    const names = medsArray.map(m => m.name).join(', ');
    const title = medsArray.length === 1 
      ? `⏰ TIME FOR MEDICATION: ${medsArray[0].name}`
      : `⏰ TIME FOR MEDICATIONS (${medsArray.length} Pills)`;
    const body = medsArray.length === 1
      ? `Dosage: ${medsArray[0].dosage} (${medsArray[0].mealCondition || 'As prescribed'}). Please take it now!`
      : `Prescriptions: ` + medsArray.map(m => `${m.name} (${m.dosage} • ${m.mealCondition || 'As prescribed'})`).join(', ') + `. Please take with water!`;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        priority: 'max',
        channelId: 'medication-alarms',
        data: { medIds: medsArray.map(m => m.id), type: 'medication_alarm' },
      },
      trigger: null, // Fires immediately!
    });
    return id;
  } catch (error) {
    console.log('fireInstantMedicationNotification note:', error.message);
    return null;
  }
};

// Schedule 5-10 Minute Pre-Alarm in Notification Tray
export const schedulePreAlarmNotification = async (medOrMeds, delaySeconds = 300) => {
  try {
    if (!Notifications?.scheduleNotificationAsync || delaySeconds <= 0) return null;
    const medsArray = Array.isArray(medOrMeds) ? medOrMeds : [medOrMeds];
    if (medsArray.length === 0) return null;

    const names = medsArray.map(m => m.name).join(', ');
    const first = medsArray[0];
    const safeSeconds = Math.max(1, Math.round(delaySeconds));

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ Upcoming in 10 mins: ${names}`,
        body: `Scheduled for ${first.time} (${first.mealCondition || 'As prescribed'}). Keep your water ready!`,
        sound: 'default',
        priority: 'high',
        channelId: 'medication-reminders',
        data: { medIds: medsArray.map(m => m.id), type: 'pre_alarm' },
      },
      trigger: {
        type: 'timeInterval',
        seconds: safeSeconds,
        repeats: false,
        channelId: 'medication-reminders',
      },
    });
    return id;
  } catch (error) {
    console.log('schedulePreAlarmNotification note:', error.message);
    return null;
  }
};

// Schedule background alarm for future seconds (Supports single or multiple pills)
export const scheduleMedicationAlarm = async (medOrMeds, delaySeconds = 60) => {
  try {
    if (!Notifications?.scheduleNotificationAsync) return null;
    const medsArray = Array.isArray(medOrMeds) ? medOrMeds : [medOrMeds];
    if (medsArray.length === 0) return null;

    const names = medsArray.map(m => m.name).join(', ');
    const first = medsArray[0];
    const safeSeconds = Math.max(1, Math.round(delaySeconds));

    const title = medsArray.length === 1 
      ? `⏰ TIME FOR MEDICATION: ${first.name}`
      : `⏰ TIME FOR MEDICATIONS (${medsArray.length} Pills)`;
    const body = medsArray.length === 1
      ? `Dosage: ${first.dosage} (${first.mealCondition || 'As prescribed'}). Please take it now!`
      : `Prescriptions: ` + medsArray.map(m => `${m.name} (${m.dosage} • ${m.mealCondition || 'As prescribed'})`).join(', ') + `. Please take with water!`;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        priority: 'max',
        channelId: 'medication-alarms',
        data: { medIds: medsArray.map(m => m.id), type: 'medication_alarm' },
      },
      trigger: {
        type: 'timeInterval',
        seconds: safeSeconds,
        repeats: false,
        channelId: 'medication-alarms',
      },
    });
    return id;
  } catch (error) {
    console.log('scheduleMedicationAlarm note:', error.message);
    return null;
  }
};

// Test notification helper for user to verify system notifications in background within 5s
export const scheduleTestAlarmNotification = async (seconds = 5) => {
  try {
    if (!Notifications?.scheduleNotificationAsync) {
      return { success: false, error: 'Notifications module not available' };
    }

    // Ensure permissions and channel are registered
    await registerForPushNotificationsAsync();

    const safeSec = Math.max(1, Math.round(seconds));
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ MEDCOMPANION ALARM TEST',
        body: `Test alarm notification fired in ${safeSec}s! Tap here to return to MedCompanion.`,
        sound: 'default',
        priority: 'max',
        channelId: 'medication-alarms',
        data: { type: 'test_alarm' },
      },
      trigger: {
        type: 'timeInterval',
        seconds: safeSec,
        repeats: false,
        channelId: 'medication-alarms',
      },
    });
    return { success: true, id };
  } catch (e) {
    console.log('scheduleTestAlarmNotification timed error, attempting immediate fallback:', e?.message);
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ MEDCOMPANION ALARM TEST',
          body: 'Test alarm notification fired immediately! Notification permissions verified.',
          sound: 'default',
          priority: 'max',
          channelId: 'medication-alarms',
          data: { type: 'test_alarm' },
        },
        trigger: null,
      });
      return { success: true, id, fallback: true };
    } catch (fallbackErr) {
      console.log('scheduleTestAlarmNotification fallback error:', fallbackErr?.message);
      return { success: false, error: e?.message || fallbackErr?.message };
    }
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

// Listener for when patient taps on the system notification in the notification bar
export const addNotificationResponseListener = (callback) => {
  try {
    if (Notifications?.addNotificationResponseReceivedListener) {
      return Notifications.addNotificationResponseReceivedListener(callback);
    }
  } catch (e) {
    console.log('addNotificationResponseListener note:', e.message);
  }
  return { remove: () => {} };
};

// Listener for when a notification is received in foreground/background
export const addNotificationReceivedListener = (callback) => {
  try {
    if (Notifications?.addNotificationReceivedListener) {
      return Notifications.addNotificationReceivedListener(callback);
    }
  } catch (e) {
    console.log('addNotificationReceivedListener note:', e.message);
  }
  return { remove: () => {} };
};
