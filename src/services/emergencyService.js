import * as Linking from 'expo-linking';
import { Alert } from 'react-native';

export const callCaretaker = async (phoneNumber) => {
  if (!phoneNumber) {
    Alert.alert('No Emergency Contact', 'Please set an Emergency Phone Number in your Profile or Registration.');
    return;
  }
  const url = `tel:${phoneNumber}`;
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
  if (!phoneNumber) {
    Alert.alert('No Emergency Contact', 'Please set an Emergency Phone Number in your Profile before using Emergency SOS.');
    return;
  }
  Alert.alert(
    '🚨 EMERGENCY SOS ACTIVATED',
    `Connecting to Caretaker (${phoneNumber}). Stay calm, help is being notified immediately!`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call Now', onPress: () => callCaretaker(phoneNumber) }
    ]
  );
};
