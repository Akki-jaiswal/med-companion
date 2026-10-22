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
let setNotificationCategoryAsync = null;
let getLastNotificationResponseAsync = null;

try {
  Notifications = require('expo-notifications');
  const nMod = Notifications?.default || Notifications;
  if (nMod) {
    scheduleNotificationAsync = nMod.scheduleNotificationAsync;
    setNotificationHandler = nMod.setNotificationHandler;
    setNotificationChannelAsync = nMod.setNotificationChannelAsync;
    getPermissionsAsync = nMod.getPermissionsAsync;
    requestPermissionsAsync = nMod.requestPermissionsAsync;
    cancelScheduledNotificationAsync = nMod.cancelScheduledNotificationAsync;
    addNotificationResponseReceivedListener = nMod.addNotificationResponseReceivedListener;
    addNotificationReceivedListenerFn = nMod.addNotificationReceivedListener;
    setNotificationCategoryAsync = nMod.setNotificationCategoryAsync;
    getLastNotificationResponseAsync = nMod.getLastNotificationResponseAsync;
  }
} catch (e) {
  console.log('Top-level expo-notifications note:', e.message);
}

// Submodule fallbacks: in Expo Go SDK 53 on Android, top-level index may fail due to push topic module removal,
// but local notification modules are 100% available via direct build submodules!
if (!scheduleNotificationAsync) {
  try {
    const m = require('expo-notifications/build/scheduleNotificationAsync');
    scheduleNotificationAsync = m?.default || m?.scheduleNotificationAsync || m;
  } catch (e) {}
}
if (!setNotificationHandler) {
  try {
    const m = require('expo-notifications/build/NotificationsHandler');
    setNotificationHandler = m?.setNotificationHandler || m?.default?.setNotificationHandler || m?.default || m;
  } catch (e) {}
}
if (!setNotificationChannelAsync) {
  try {
    const m = require('expo-notifications/build/setNotificationChannelAsync');
    setNotificationChannelAsync = m?.default || m?.setNotificationChannelAsync || m;
  } catch (e) {}
}
if (!getPermissionsAsync || !requestPermissionsAsync) {
  try {
    const m = require('expo-notifications/build/NotificationPermissions');
    const nPerm = m?.default || m;
    getPermissionsAsync = getPermissionsAsync || nPerm?.getPermissionsAsync;
    requestPermissionsAsync = requestPermissionsAsync || nPerm?.requestPermissionsAsync;
  } catch (e) {}
}
if (!cancelScheduledNotificationAsync) {
  try {
    const m = require('expo-notifications/build/cancelScheduledNotificationAsync');
    cancelScheduledNotificationAsync = m?.default || m?.cancelScheduledNotificationAsync || m;
  } catch (e) {}
}
if (!addNotificationResponseReceivedListener || !addNotificationReceivedListenerFn) {
  try {
    const m = require('expo-notifications/build/NotificationsEmitter');
    const nEmit = m?.default || m;
    if (nEmit) {
      addNotificationResponseReceivedListener = addNotificationResponseReceivedListener || nEmit.addNotificationResponseReceivedListener;
      addNotificationReceivedListenerFn = addNotificationReceivedListenerFn || nEmit.addNotificationReceivedListener;
    }
  } catch (e) {}
}
if (!setNotificationCategoryAsync) {
  try {
    const m = require('expo-notifications/build/setNotificationCategoryAsync');
    setNotificationCategoryAsync = m?.default || m?.setNotificationCategoryAsync || m;
  } catch (e) {}
}
if (!getLastNotificationResponseAsync) {
  try {
    const m = require('expo-notifications/build/getLastNotificationResponseAsync');
    getLastNotificationResponseAsync = m?.default || m?.getLastNotificationResponseAsync || m;
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

      // 1. Android System Urgent Alarm Channel (High priority + Sound + Strong Vibration + USAGE_ALARM stream)
      await setNotificationChannelAsync('medication-alarms', {
        name: 'Urgent Medication Alarms',
        importance: maxImp,
        vibrationPattern: [0, 800, 400, 800, 400, 800, 400, 1000],
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
        bypassDnd: true,
        lockscreenVisibility: visPublic,
        audioAttributes: {
          usage: 4, // Android AudioAttributes.USAGE_ALARM
          contentType: 4, // Android AudioAttributes.CONTENT_TYPE_SONIFICATION
          flags: { enforceAudibility: true }
        },
        lightColor: '#DC2626',
      });

      // Register interactive notification action buttons for alarm popups
      if (setNotificationCategoryAsync) {
        try {
          await setNotificationCategoryAsync('medication_alarm', [
            {
              identifier: 'TAKE_ACTION',
              buttonTitle: '✓ Take Medicine',
              options: { opensAppToForeground: true },
            },
            {
              identifier: 'SNOOZE_ACTION',
              buttonTitle: '⏰ Snooze 5 Min',
              options: { opensAppToForeground: true },
            },
            {
              identifier: 'OPEN_ACTION',
              buttonTitle: '🔔 Open Alarm',
              options: { opensAppToForeground: true },
            },
          ]);
        } catch (catErr) {
          console.log('Category setup note:', catErr.message);
        }
      }

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
        categoryIdentifier: 'medication_alarm',
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

// Schedule 10-Minute (or adaptive) Pre-Alarm in Notification Tray
export const schedulePreAlarmNotification = async (medOrMeds, delaySeconds = 300, minutesPrior = 10) => {
  try {
    if (!scheduleNotificationAsync || delaySeconds <= 0) return null;
    const medsArray = Array.isArray(medOrMeds) ? medOrMeds : [medOrMeds];
    if (medsArray.length === 0) return null;

    const names = medsArray.map(m => m.name).join(', ');
    const first = medsArray[0];
    const safeSeconds = Math.max(1, Math.round(delaySeconds));
    const label = minutesPrior <= 1 ? '1 min' : `${minutesPrior} mins`;

    const id = await scheduleNotificationAsync({
      content: {
        title: `⏰ Upcoming in ${label}: ${names}`,
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
        categoryIdentifier: 'medication_alarm',
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

// Check if app was cold-launched from user clicking a notification
export const getLastNotificationResponse = async () => {
  try {
    if (typeof getLastNotificationResponseAsync === 'function') {
      return await getLastNotificationResponseAsync();
    }
    return null;
  } catch (e) {
    console.log('getLastNotificationResponse note:', e.message);
    return null;
  }
};
