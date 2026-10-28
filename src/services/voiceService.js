import * as Speech from 'expo-speech';

export const speakMedicationReminder = (medOrMeds, patientName = 'Patient') => {
  if (!medOrMeds) return;
  const name = patientName || 'Patient';
  const medsArray = Array.isArray(medOrMeds) ? medOrMeds : [medOrMeds];
  if (medsArray.length === 0) return;

  let message = '';
  if (medsArray.length === 1) {
    const med = medsArray[0];
    message = `Attention ${name}. It is time for your medication: ${med.name}. Dosage is ${med.dosage}. Please take it ${med.mealCondition}.`;
  } else {
    // Multi-pill combination speech (Disprin, Aspirin, Ranitidine, etc.)
    const medNamesList = medsArray.map(m => `${m.name} (${m.dosage})`).join(', ');
    const mealCond = medsArray[0]?.mealCondition || 'as prescribed';
    message = `Attention ${name}. It is time for your combined medications: ${medNamesList}. Please take them ${mealCond} with a full glass of water.`;
  }
  
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
