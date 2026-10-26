import { Platform } from 'react-native';

// Robust loader for expo-notifications with direct submodule fallbacks for Expo Go SDK 53
let Notifications = null;
let scheduleNotificationAsync = null;
let setNotificationHandler = null;
let setNotificationChannelAsync = null;
let getPermissionsAsync = null;
let requestPermissionsAsync = null;
let cancelScheduledNotificationAsync = null;
let addNotificationResponseReceivedListener = null;
let addNotificationReceivedListenerFn = null;

try {
  Notifications = require('expo-notifications');
  if (Notifications) {
    scheduleNotificationAsync = Notifications.scheduleNotificationAsync;
    setNotificationHandler = Notifications.setNotificationHandler;
    setNotificationChannelAsync = Notifications.setNotificationChannelAsync;
    getPermissionsAsync = Notifications.getPermissionsAsync;
    requestPermissionsAsync = Notifications.requestPermissionsAsync;
    cancelScheduledNotificationAsync = Notifications.cancelScheduledNotificationAsync;
    addNotificationResponseReceivedListener = Notifications.addNotificationResponseReceivedListener;
    addNotificationReceivedListenerFn = Notifications.addNotificationReceivedListener;
  }
} catch (e) {
  console.log('Top-level expo-notifications note:', e.message);
}

// Submodule fallbacks: in Expo Go SDK 53 on Android, top-level index may fail due to push topic module removal,
// but local notification modules are 100% available via direct build submodules!
if (!scheduleNotificationAsync) {
  try {
    const m = require('expo-notifications/build/scheduleNotificationAsync');
    scheduleNotificationAsync = m.scheduleNotificationAsync;
  } catch (e) {}
}
if (!setNotificationHandler) {
  try {
    const m = require('expo-notifications/build/NotificationsHandler');
    setNotificationHandler = m.setNotificationHandler;
  } catch (e) {}
}
if (!setNotificationChannelAsync) {
  try {
    const m = require('expo-notifications/build/setNotificationChannelAsync');
    setNotificationChannelAsync = m.setNotificationChannelAsync;
  } catch (e) {}
}
if (!getPermissionsAsync || !requestPermissionsAsync) {
  try {
    const m = require('expo-notifications/build/NotificationPermissions');
    getPermissionsAsync = m.getPermissionsAsync;
    requestPermissionsAsync = m.requestPermissionsAsync;
  } catch (e) {}
}
if (!cancelScheduledNotificationAsync) {
  try {
    const m = require('expo-notifications/build/cancelScheduledNotificationAsync');
    cancelScheduledNotificationAsync = m.cancelScheduledNotificationAsync;
  } catch (e) {}
}
if (!addNotificationResponseReceivedListener || !addNotificationReceivedListenerFn) {
  try {
    const m = require('expo-notifications/build/NotificationsEmitter');
    if (m) {
      addNotificationResponseReceivedListener = addNotificationResponseReceivedListener || m.addNotificationResponseReceivedListener;
      addNotificationReceivedListenerFn = addNotificationReceivedListenerFn || m.addNotificationReceivedListener;
    }
  } catch (e) {}
}

// Configure notification handler so foreground notifications pop up and chime
if (setNotificationHandler) {
  try {
    setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (e) {
    console.log('setNotificationHandler note:', e.message);
  }
}

// Android fallback constants to prevent undefined property crashes in Expo
const ANDROID_IMPORTANCE_MAX = 5;
const ANDROID_IMPORTANCE_HIGH = 4;
const ANDROID_VISIBILITY_PUBLIC = 1;

// Request notification permissions & set high priority channel
export const registerForPushNotificationsAsync = async () => {
  try {
    if (!getPermissionsAsync) return false;

    const { status: existingStatus } = await getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted' && requestPermissionsAsync) {
      const { status } = await requestPermissionsAsync();
      finalStatus = status;
    }

    if (Platform.OS === 'android' && setNotificationChannelAsync) {
      const maxImp = Notifications?.AndroidImportance?.MAX ?? ANDROID_IMPORTANCE_MAX;
      const highImp = Notifications?.AndroidImportance?.HIGH ?? ANDROID_IMPORTANCE_HIGH;
      const visPublic = Notifications?.AndroidNotificationVisibility?.PUBLIC ?? ANDROID_VISIBILITY_PUBLIC;

      // 1. Android System Urgent Alarm Channel (High priority + Sound + Strong Vibration)
      await setNotificationChannelAsync('medication-alarms', {
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
      await setNotificationChannelAsync('medication-reminders', {
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
    if (!scheduleNotificationAsync) return null;
    const medsArray = Array.isArray(medOrMeds) ? medOrMeds : [medOrMeds];
    if (medsArray.length === 0) return null;

    const names = medsArray.map(m => m.name).join(', ');
    const title = medsArray.length === 1 
      ? `⏰ TIME FOR MEDICATION: ${medsArray[0].name}`
      : `⏰ TIME FOR MEDICATIONS (${medsArray.length} Pills)`;
    const body = medsArray.length === 1
      ? `Dosage: ${medsArray[0].dosage} (${medsArray[0].mealCondition || 'As prescribed'}). Please take it now!`
      : `Prescriptions: ` + medsArray.map(m => `${m.name} (${m.dosage} • ${m.mealCondition || 'As prescribed'})`).join(', ') + `. Please take with water!`;

    const id = await scheduleNotificationAsync({
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
    if (!scheduleNotificationAsync || delaySeconds <= 0) return null;
    const medsArray = Array.isArray(medOrMeds) ? medOrMeds : [medOrMeds];
    if (medsArray.length === 0) return null;

    const names = medsArray.map(m => m.name).join(', ');
    const first = medsArray[0];
    const safeSeconds = Math.max(1, Math.round(delaySeconds));

    const id = await scheduleNotificationAsync({
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
    if (!scheduleNotificationAsync) return null;
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

    const id = await scheduleNotificationAsync({
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
    if (!scheduleNotificationAsync) {
      return { success: false, error: 'Notifications module not available' };
    }

    // Ensure permissions and channel are registered
    await registerForPushNotificationsAsync();

    const safeSec = Math.max(1, Math.round(seconds));
    const id = await scheduleNotificationAsync({
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
      if (!scheduleNotificationAsync) {
        return { success: false, error: 'Notifications scheduler unavailable' };
      }
      const id = await scheduleNotificationAsync({
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
    if (!scheduleNotificationAsync) return null;

    const safeSeconds = Math.max(1, Math.round(delaySeconds));
    const id = await scheduleNotificationAsync({
      content: {
        title: `🚨 CARETAKER ALERT: ${patientName} Missed Pill!`,
        body: `${patientName} did not acknowledge ${pillName} scheduled at ${scheduledTime}. Action required!`,
        sound: 'default',
        priority: 'max',
        channelId: 'medication-alarms',
        data: { type: 'escalation_alert', pillName },
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
    console.log('scheduleCaretakerEscalationNotification note:', error.message);
    return null;
  }
};

// Cancel a scheduled notification (e.g. when patient marks pill as Taken)
export const cancelScheduledNotification = async (notificationId) => {
  try {
    if (!notificationId || !cancelScheduledNotificationAsync) return;
    await cancelScheduledNotificationAsync(notificationId);
  } catch (e) {
    console.log('cancelScheduledNotification note:', e.message);
  }
};

// Trigger REAL Android System Notification in the phone's top tray for Caretaker!
export const triggerCaretakerPushAlert = async (patientName, pillName, scheduledTime) => {
  try {
    if (!scheduleNotificationAsync) return false;

    // Fire directly into the Android Status Bar tray
    await scheduleNotificationAsync({
      content: {
        title: `🚨 CARETAKER ALERT: ${patientName}`,
        body: `${patientName} missed ${pillName} scheduled at ${scheduledTime}. Tap to call immediately!`,
        sound: 'default',
        priority: 'max',
        channelId: 'medication-alarms',
        data: { type: 'caretaker_escalation', patientName, pillName },
      },
      trigger: null, // Immediate!
    });
    return true;
  } catch (e) {
    console.log('triggerCaretakerPushAlert note:', e.message);
    return false;
  }
};

// Listener for when patient taps on the system notification in the notification bar
export const addNotificationResponseListener = (callback) => {
  try {
    if (typeof addNotificationResponseReceivedListener === 'function') {
      return addNotificationResponseReceivedListener(callback);
    }
  } catch (e) {
    console.log('addNotificationResponseListener note:', e.message);
  }
  return { remove: () => {} };
};

// Listener for when a notification is received in foreground/background
export const addNotificationReceivedListener = (callback) => {
  try {
    if (typeof addNotificationReceivedListenerFn === 'function') {
      return addNotificationReceivedListenerFn(callback);
    }
  } catch (e) {
    console.log('addNotificationReceivedListener note:', e.message);
  }
  return { remove: () => {} };
};
