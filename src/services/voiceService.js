import * as Speech from 'expo-speech';

export const speakMedicationReminder = (med, patientName = 'Robert') => {
  if (!med) return;
  const message = `Attention ${patientName}. It is time for your medication: ${med.name}. Dosage is ${med.dosage}. Please take it ${med.mealCondition}.`;
  
  Speech.stop();
  Speech.speak(message, {
    language: 'en-US',
    pitch: 1.0,
    rate: 0.85, // Slower, clear pace for elderly listeners
  });
};

export const stopSpeech = () => {
  Speech.stop();
};
