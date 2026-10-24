import * as Speech from 'expo-speech';

export const speakMedicationReminder = (medOrMeds, patientName = 'Patient') => {
  if (!medOrMeds) return;
  const name = patientName || 'Patient';
  const medsArray = Array.isArray(medOrMeds) ? medOrMeds : [medOrMeds];
  if (medsArray.length === 0) return;

  let message = '';
  if (medsArray.length === 1) {
    const med = medsArray[0];
    const timing = med.mealCondition ? med.mealCondition.toLowerCase() : 'as prescribed';
    message = `Attention ${name}. It is time for your medication: ${med.name}. Dosage is ${med.dosage}. Please take it ${timing}.`;
  } else {
    // Dynamic per-tablet timing conditions (no static 'after meal')
    const medInstructions = medsArray.map(m => {
      const timing = m.mealCondition ? m.mealCondition.toLowerCase() : 'as prescribed';
      return `${m.name}, ${m.dosage}, ${timing}`;
    }).join('. ');
    message = `Attention ${name}. It is time for your combined medications: ${medInstructions}. Please take them with a full glass of water.`;
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
