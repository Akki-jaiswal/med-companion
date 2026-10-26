import * as Speech from 'expo-speech';

let speechLoopTimeout = null;
let isSpeakingActive = false;

export const speakMedicationReminder = (medOrMeds, patientName = 'Patient', shouldLoop = false) => {
  if (!medOrMeds) return;
  const name = patientName || 'Patient';
  const medsArray = Array.isArray(medOrMeds) ? medOrMeds : [medOrMeds];
  if (medsArray.length === 0) return;

  stopSpeech();
  isSpeakingActive = true;

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

  const speakNow = () => {
    if (!isSpeakingActive) return;
    Speech.speak(message, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.88, // Clear, deliberate pace
      onDone: () => {
        if (shouldLoop && isSpeakingActive) {
          speechLoopTimeout = setTimeout(() => {
            speakNow();
          }, 2000);
        }
      },
      onError: () => {
        if (shouldLoop && isSpeakingActive) {
          speechLoopTimeout = setTimeout(() => {
            speakNow();
          }, 3000);
        }
      }
    });
  };

  speakNow();
};

export const stopSpeech = () => {
  isSpeakingActive = false;
  if (speechLoopTimeout) {
    clearTimeout(speechLoopTimeout);
    speechLoopTimeout = null;
  }
  try {
    Speech.stop();
  } catch (e) {}
};
