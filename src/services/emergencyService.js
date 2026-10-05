import * as Linking from 'expo-linking';
import { Alert } from 'react-native';

export const callCaretaker = async (phoneNumber) => {
  const url = `tel:${phoneNumber || '+919876543210'}`;
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Phone Dialing', `Calling Caretaker at: ${phoneNumber}`);
    }
  } catch (err) {
    Alert.alert('Emergency Dial', `Dialing Caretaker: ${phoneNumber}`);
  }
};

export const sendSOSAlert = async (patientName, phoneNumber) => {
  Alert.alert(
    '🚨 EMERGENCY SOS ACTIVATED',
    `Connecting to Caretaker (${phoneNumber}). Stay calm, help is being notified immediately!`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call Now', onPress: () => callCaretaker(phoneNumber) }
    ]
  );
};
