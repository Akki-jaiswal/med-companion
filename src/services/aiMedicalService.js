/**
 * AI Medical Companion Knowledge Base & Clinical Intelligence Engine
 * Provides patient-contextual medical advice, disease mapping, and drug insights.
 */

export const MEDICAL_KNOWLEDGE_BASE = [
  // DIABETES & METABOLIC
  {
    canonicalName: 'Metformin',
    aliases: ['metformin', 'glycomet', 'glucophage', 'riomet', 'gluformin', 'obimet'],
    category: 'Oral Antidiabetic (Biguanide)',
    diseases: ['Type 2 Diabetes Mellitus', 'Insulin Resistance', 'Prediabetes', 'PCOS (Polycystic Ovary Syndrome)'],
    mechanism: 'Lowers blood glucose levels by decreasing glucose production in the liver, increasing muscle sensitivity to insulin, and reducing sugar absorption from intestines.',
    mealAdvice: 'Must be taken WITH or IMMEDIATELY AFTER meals with a full glass of water. Taking it on an empty stomach commonly causes nausea, stomach cramps, and diarrhea.',
    precautions: 'Stay well-hydrated. Avoid heavy alcohol intake as it increases the risk of lactic acidosis. Report persistent severe stomach discomfort.',
    missedDose: 'Take as soon as you remember with a meal. If it is close to your next scheduled meal, skip the missed dose. Never take extra tablets.',
  },
  {
    canonicalName: 'Glimepiride',
    aliases: ['glimepiride', 'amaryl', 'zoryl', 'glimy', 'diapride'],
    category: 'Oral Antidiabetic (Sulfonylurea)',
    diseases: ['Type 2 Diabetes Mellitus (High Blood Sugar)'],
    mechanism: 'Stimulates the beta cells of your pancreas to release more natural insulin into your bloodstream, quickly reducing blood sugar spikes.',
    mealAdvice: 'Take once daily immediately BEFORE breakfast or your first main meal. Do not delay eating after taking this pill.',
    precautions: 'Carry quick-acting sugar (candy, glucose tablets) in case of hypoglycemia (dizziness, shakiness, sudden sweating).',
    missedDose: 'Take before your next meal. Never take a double dose to catch up.',
  },
  {
    canonicalName: 'Dapagliflozin / Empagliflozin',
    aliases: ['dapagliflozin', 'empagliflozin', 'forxiga', 'jardiance', 'dapa', 'empa'],
    category: 'SGLT2 Inhibitor',
    diseases: ['Type 2 Diabetes Mellitus', 'Heart Failure (Cardiovascular Protection)', 'Chronic Kidney Disease (CKD)'],
    mechanism: 'Filters excess glucose through your kidneys into urine, lowering blood sugar and reducing fluid workload on the heart.',
    mealAdvice: 'Can be taken with or without food, preferably in the morning with a full glass of water.',
    precautions: 'Drink plenty of water throughout the day to avoid dehydration and urinary tract infections.',
    missedDose: 'Take as soon as remembered on the same day; resume regular timing tomorrow.',
  },

  // HYPERTENSION & CARDIOVASCULAR
  {
    canonicalName: 'Telmisartan',
    aliases: ['telmisartan', 'telma', 'micardis', 'telmikind', 'telsartan', 'telista'],
    category: 'Antihypertensive (Angiotensin II Receptor Blocker - ARB)',
    diseases: ['High Blood Pressure (Essential Hypertension)', 'Cardiovascular Disease Prevention', 'Stroke & Heart Attack Risk Reduction', 'Diabetic Kidney Protection'],
    mechanism: 'Blocks angiotensin II receptors, causing blood vessels to relax and widen. This lowers blood pressure and makes it easier for the heart to pump blood.',
    mealAdvice: 'Can be taken with or without food. Take at the same time each day (often morning).',
    precautions: 'Avoid taking potassium supplements or salt substitutes containing potassium without consulting your doctor. Stand up slowly from sitting or lying down to prevent dizziness.',
    missedDose: 'Take as soon as remembered today. If less than 8 hours before next dose, skip and keep regular schedule.',
  },
  {
    canonicalName: 'Losartan',
    aliases: ['losartan', 'cozaar', 'losar', 'losakind', 'repace'],
    category: 'Antihypertensive (ARB)',
    diseases: ['High Blood Pressure (Hypertension)', 'Stroke Risk Reduction in Heart Disease', 'Diabetic Nephropathy'],
    mechanism: 'Relaxes blood vessels by preventing angiotensin II from narrowing arteries, ensuring smooth blood flow throughout the body.',
    mealAdvice: 'Can be taken with or without meals. Drink with plenty of water.',
    precautions: 'Avoid excessive alcohol which can drop blood pressure too low. Stay hydrated.',
    missedDose: 'Take as soon as remembered. Never double up.',
  },
  {
    canonicalName: 'Amlodipine',
    aliases: ['amlodipine', 'norvasc', 'amlong', 'stamlo', 'amlovas', 'amlocip'],
    category: 'Antihypertensive (Calcium Channel Blocker)',
    diseases: ['High Blood Pressure (Hypertension)', 'Coronary Artery Disease', 'Angina (Chest Pain)'],
    mechanism: 'Inhibits calcium ions from entering heart and arterial muscle cells, allowing peripheral arteries to dilate and lowering arterial resistance.',
    mealAdvice: 'Can be taken before or after meals, consistently at the same time every day.',
    precautions: 'AVOID eating grapefruit or drinking grapefruit juice, as it can dangerously elevate amlodipine levels in your blood. Elevate feet if mild ankle swelling occurs.',
    missedDose: 'Take if remembered within 12 hours of scheduled time; otherwise skip.',
  },
  {
    canonicalName: 'Atenolol / Metoprolol',
    aliases: ['atenolol', 'metoprolol', 'tenormin', 'betaloc', 'metolar', 'seloken', 'lopressor'],
    category: 'Beta Blocker',
    diseases: ['High Blood Pressure (Hypertension)', 'Angina Pectoris', 'Arrhythmia (Irregular Heartbeat)', 'Post-Heart Attack Management'],
    mechanism: 'Slows down heart rate and reduces the force of heart muscle contraction, lowering blood pressure and relieving cardiac stress.',
    mealAdvice: 'Take with or immediately after food for consistent absorption.',
    precautions: 'DO NOT abruptly stop taking beta-blockers without physician supervision, as doing so can trigger rebound high blood pressure or rapid heart rate.',
    missedDose: 'Take if remembered within 4-6 hours. Never take two doses together.',
  },

  // CHOLESTEROL & LIPIDS
  {
    canonicalName: 'Atorvastatin',
    aliases: ['atorvastatin', 'lipitor', 'atorva', 'atocor', 'tonact', 'storvas'],
    category: 'Lipid-Lowering Agent (HMG-CoA Reductase Inhibitor / Statin)',
    diseases: ['High Blood Cholesterol (Hypercholesterolemia)', 'Atherosclerosis (Arterial Plaque Prevention)', 'Heart Attack & Stroke Prevention'],
    mechanism: 'Blocks the liver enzyme responsible for producing cholesterol, significantly reducing bad LDL cholesterol and triglycerides while raising good HDL.',
    mealAdvice: 'Can be taken with or without food. Many doctors recommend taking statins in the evening or at bedtime, but consistency matters most.',
    precautions: 'Avoid excessive grapefruit juice and heavy alcohol. Notify your doctor if you experience unexplained muscle pain, tenderness, or weakness.',
    missedDose: 'Take as soon as remembered on the same day. If next dose is due within 12 hours, skip.',
  },
  {
    canonicalName: 'Rosuvastatin',
    aliases: ['rosuvastatin', 'crestor', 'rosuvas', 'rosave', 'razel'],
    category: 'High-Intensity Statin',
    diseases: ['Severe Hypercholesterolemia', 'Coronary Artery Plaque Stabilization', 'Prevention of Stroke & Cardiovascular Events'],
    mechanism: 'Potently suppresses hepatic cholesterol synthesis, rapidly reducing circulating LDL cholesterol and clearing arterial walls.',
    mealAdvice: 'Can be taken at any time of day, with or without meals.',
    precautions: 'Report severe muscle cramping or dark-colored urine immediately to your physician.',
    missedDose: 'Take as soon as remembered, but do not take more than one dose in 24 hours.',
  },

  // GASTROINTESTINAL & ACIDITY
  {
    canonicalName: 'Pantoprazole',
    aliases: ['pantoprazole', 'pan', 'pantocid', 'pantosec', 'protonix', 'pan-d', 'pantop'],
    category: 'Proton Pump Inhibitor (PPI)',
    diseases: ['GERD (Gastroesophageal Reflux Disease)', 'Heartburn & Acid Indigestion', 'Gastric & Peptic Ulcers', 'Gastritis Prevention'],
    mechanism: 'Shuts down the gastric proton pumps in your stomach lining, dramatically reducing stomach acid secretion and allowing ulcers and esophagus to heal.',
    mealAdvice: 'STRICTLY take 30 to 60 MINUTES BEFORE BREAKFAST on an empty stomach with a glass of plain water for maximum effectiveness.',
    precautions: 'Do not crush or chew delayed-release tablets; swallow whole. Avoid late-night spicy food.',
    missedDose: 'Take before your next meal if missed in the morning, otherwise resume tomorrow before breakfast.',
  },
  {
    canonicalName: 'Omeprazole / Rabeprazole / Esomeprazole',
    aliases: ['omeprazole', 'rabeprazole', 'esomeprazole', 'prilosec', 'nexium', 'rabicip', 'razo', 'omez'],
    category: 'Proton Pump Inhibitor (Acid Reducer)',
    diseases: ['Acid Reflux (GERD)', 'Stomach Ulcers', 'Heartburn', 'Protection against NSAID stomach damage'],
    mechanism: 'Blocks acid-producing proton pumps in gastric parietal cells, neutralizing excessive acidity.',
    mealAdvice: 'Take once daily in the morning, 30 to 45 minutes before food with water.',
    precautions: 'Swallow whole with water. Avoid caffeine, chocolate, and carbonated beverages which trigger acid reflux.',
    missedDose: 'Take before your next meal, or skip if already bedtime.',
  },

  // PAIN, FEVER & INFLAMMATION
  {
    canonicalName: 'Paracetamol (Acetaminophen)',
    aliases: ['paracetamol', 'acetaminophen', 'dolo', 'crocin', 'calpol', 'tylenol', 'panadol', 'pacimol'],
    category: 'Analgesic & Antipyretic (Pain Reliever & Fever Reducer)',
    diseases: ['Fever (Pyrexia)', 'Headache', 'Body Aches & Muscle Pain', 'Post-Vaccination Discomfort', 'Mild-to-Moderate Arthritis Pain'],
    mechanism: 'Inhibits prostaglandin synthesis in the central nervous system, resetting the body temperature regulator in the hypothalamus and blunting pain signals.',
    mealAdvice: 'Can be safely taken on an empty stomach or after meals with water. It is very gentle on the stomach lining.',
    precautions: 'Do not exceed 3,000mg to 4,000mg per 24 hours. Avoid alcohol, which compounds liver toxicity risk. Keep at least 4-6 hours between doses.',
    missedDose: 'Take only when needed for pain or fever. Do not double doses.',
  },
  {
    canonicalName: 'Ibuprofen / Diclofenac / Aceclofenac',
    aliases: ['ibuprofen', 'diclofenac', 'aceclofenac', 'advil', 'motrin', 'voveran', 'zerodol', 'hifenac'],
    category: 'NSAID (Non-Steroidal Anti-Inflammatory Drug)',
    diseases: ['Joint & Arthritis Inflammation', 'Severe Body & Dental Pain', 'Post-Traumatic Swelling', 'Sprains & Strains'],
    mechanism: 'Inhibits COX-1 and COX-2 enzymes, stopping the production of inflammatory prostaglandins that cause swelling, redness, and pain.',
    mealAdvice: 'MUST BE TAKEN WITH OR AFTER A FULL MEAL with a full glass of water. Never take NSAIDs on an empty stomach as they can irritate gastric mucosa.',
    precautions: 'Avoid prolonged continuous use without doctor advice. Patients with kidney disease, heart failure, or active ulcers should avoid NSAIDs.',
    missedDose: 'Take with food as needed. Never take double pills.',
  },

  // ANTIBIOTICS & INFECTIONS
  {
    canonicalName: 'Amoxicillin / Augmentin',
    aliases: ['amoxicillin', 'augmentin', 'amoxil', 'moxikind', 'novamox', 'clavulin'],
    category: 'Penicillin-Class Antibiotic',
    diseases: ['Bacterial Throat & Ear Infections', 'Bronchitis & Chest Infections', 'Dental Abscesses', 'Urinary Tract Infections (UTI)', 'Sinusitis'],
    mechanism: 'Destroys bacterial cell wall formation, leading to lysis and death of the offending bacteria.',
    mealAdvice: 'Take at the start of a light meal or snack to minimize gastrointestinal upset and maximize absorption.',
    precautions: 'COMPLETE THE ENTIRE PRESCRIBED COURSE even if symptoms disappear within 2 days! Stopping early creates antibiotic resistance.',
    missedDose: 'Take as soon as remembered. Space out remaining doses evenly through the day.',
  },
  {
    canonicalName: 'Azithromycin',
    aliases: ['azithromycin', 'zithromax', 'azee', 'azithral', 'z-pak'],
    category: 'Macrolide Antibiotic',
    diseases: ['Bacterial Respiratory Infections', 'Tonsillitis & Pharyngitis', 'Pneumonia', 'Skin & Soft Tissue Infections'],
    mechanism: 'Binds to the 50S ribosomal subunit of bacteria, shutting down protein synthesis and preventing bacteria from replicating.',
    mealAdvice: 'Can be taken with or without meals, but consistent timing once daily is crucial. Swallow whole with water.',
    precautions: 'Complete all 3 or 5 days of prescribed therapy. Do not take antacids containing aluminum or magnesium at the same time.',
    missedDose: 'Take as soon as remembered, but do not double up next day.',
  },

  // ALLERGY & RESPIRATORY
  {
    canonicalName: 'Cetirizine / Levocetirizine',
    aliases: ['cetirizine', 'levocetirizine', 'zyrtec', 'cetzine', 'alerid', 'xyzal', 'teczine'],
    category: 'Second-Generation Antihistamine',
    diseases: ['Allergic Rhinitis (Runny/Itchy Nose)', 'Sneezing & Watery Eyes', 'Urticaria (Skin Hives & Rashes)', 'Dust & Pollen Allergies'],
    mechanism: 'Competitively blocks peripheral H1 histamine receptors, suppressing allergic responses and itching.',
    mealAdvice: 'Can be taken with or without food. Best taken in the evening or before bed as it can cause mild drowsiness.',
    precautions: 'Avoid driving or operating machinery if feeling sleepy. Limit alcohol intake.',
    missedDose: 'Take before bed if remembered; otherwise wait until the following evening.',
  },
  {
    canonicalName: 'Montelukast',
    aliases: ['montelukast', 'singulair', 'montek', 'montair', 'telekast'],
    category: 'Leukotriene Receptor Antagonist',
    diseases: ['Asthma Prevention', 'Exercise-Induced Bronchospasm', 'Chronic Allergic Rhinitis'],
    mechanism: 'Blocks leukotrienes, inflammatory substances that cause airway constriction, mucus buildup, and breathing difficulty.',
    mealAdvice: 'Take once daily in the evening, with or without food.',
    precautions: 'This is a long-term preventive tablet; it is NOT a rescue inhaler for sudden acute asthma attacks.',
    missedDose: 'Take tomorrow evening as scheduled. Do not double dose.',
  },

  // THYROID
  {
    canonicalName: 'Levothyroxine',
    aliases: ['levothyroxine', 'thyronorm', 'eltroxin', 'synthroid', 'levoxyl'],
    category: 'Thyroid Hormone Replacement',
    diseases: ['Hypothyroidism (Underactive Thyroid)', 'Goiter Management', 'Post-Thyroidectomy Support'],
    mechanism: 'Replenishes synthetic T4 thyroid hormone, restoring metabolic rate, energy levels, and hormonal equilibrium.',
    mealAdvice: 'STRICTEST RULE: Take FIRST THING in the morning on an empty stomach with plain water. Wait AT LEAST 45 to 60 MINUTES before drinking tea, coffee, milk, or eating breakfast.',
    precautions: 'Keep at least 4 hours between this pill and Calcium, Iron, or Antacids, as they severely block thyroid absorption.',
    missedDose: 'Take as soon as remembered if still on an empty stomach, otherwise take first thing tomorrow morning.',
  },

  // VITAMINS & MINERALS
  {
    canonicalName: 'Vitamin D3 (Cholecalciferol)',
    aliases: ['vitamin d3', 'cholecalciferol', 'd-rise', 'uprise', 'calciferol', 'calcirol'],
    category: 'Fat-Soluble Vitamin',
    diseases: ['Vitamin D Deficiency', 'Osteoporosis & Bone Weakness', 'Calcium Malabsorption', 'Immune System Support'],
    mechanism: 'Facilitates intestinal absorption of calcium and phosphorus, crucial for maintaining bone density and neuromuscular function.',
    mealAdvice: 'MUST BE TAKEN WITH A MEAL THAT CONTAINS HEALTHY FAT (such as milk, yogurt, eggs, or nuts) because Vitamin D is fat-soluble and will not absorb well on an empty stomach.',
    precautions: 'If prescribed a 60,000 IU capsule, take only ONCE WEEKLY as instructed by your doctor.',
    missedDose: 'Take with your next heavy meal on the same week.',
  },
  {
    canonicalName: 'Vitamin B12 / Methylcobalamin',
    aliases: ['vitamin b12', 'methylcobalamin', 'neurobion', 'mecobalamin', 'methycobal', 'renerve'],
    category: 'Water-Soluble Vitamin & Neuro-Nutrient',
    diseases: ['Peripheral Neuropathy (Nerve Numbness & Tingling)', 'Megaloblastic Anemia', 'Fatigue & Low Energy', 'Diabetic Nerve Support'],
    mechanism: 'Crucial for myelin sheath nerve protection, red blood cell synthesis, and cellular DNA repair.',
    mealAdvice: 'Can be taken with or after morning meals with water.',
    precautions: 'Harmless yellowing of urine is normal with B-complex vitamins.',
    missedDose: 'Take with next meal.',
  },
  {
    canonicalName: 'Iron (Ferrous Ascorbate / Sulfate)',
    aliases: ['iron', 'ferrous ascorbate', 'autrin', 'orofer', 'feronia', 'livogen'],
    category: 'Hematopoietic Mineral',
    diseases: ['Iron-Deficiency Anemia', 'Low Hemoglobin', 'Chronic Fatigue'],
    mechanism: 'Provides elemental iron required to build hemoglobin in red blood cells to transport oxygen throughout tissues.',
    mealAdvice: 'Absorbs best on an empty stomach or with Vitamin C (orange juice/lemon). If it causes stomach upset, take with light meals. AVOID tea, coffee, and milk within 2 hours.',
    precautions: 'Stools may turn dark green or black; this is completely harmless. Drink water to prevent constipation.',
    missedDose: 'Take with next meal. Do not double.',
  },

  // BLOOD THINNERS
  {
    canonicalName: 'Aspirin (Low Dose 75mg / 150mg)',
    aliases: ['aspirin', 'ecospirin', 'disprin', 'ecosprin', 'bayer'],
    category: 'Antiplatelet Agent (Blood Thinner)',
    diseases: ['Secondary Prevention of Heart Attack', 'Ischemic Stroke Prevention', 'Coronary Stent Protection'],
    mechanism: 'Irreversibly inhibits platelet aggregation by blocking thromboxane A2, preventing blood clots from clogging narrow arteries.',
    mealAdvice: 'Always take WITH or AFTER FOOD with a full glass of water to protect against stomach ulcers.',
    precautions: 'Inform your doctor/dentist before surgeries. Report unusual bruising, dark stools, or nosebleeds.',
    missedDose: 'Take as soon as remembered with food. If near tomorrow, skip.',
  },
  {
    canonicalName: 'Clopidogrel',
    aliases: ['clopidogrel', 'plavix', 'clopilet', 'ceruvit', 'deplatt'],
    category: 'P2Y12 Platelet Inhibitor',
    diseases: ['Acute Coronary Syndrome', 'Stent Thrombosis Prevention', 'Peripheral Vascular Disease'],
    mechanism: 'Blocks ADP receptors on platelets, keeping blood smooth and preventing dangerous blood clots in coronary arteries.',
    mealAdvice: 'Can be taken with or without food at the same time daily.',
    precautions: 'Do not discontinue without consulting your cardiologist, especially if you have a stent.',
    missedDose: 'Take if remembered within 12 hours.',
  }
];

/**
 * Match a medicine name string against our medical knowledge base.
 */
export const findMedicationDetails = (medName) => {
  if (!medName) return null;
  const clean = medName.toLowerCase().trim();

  for (const entry of MEDICAL_KNOWLEDGE_BASE) {
    if (entry.canonicalName.toLowerCase() === clean) return entry;
    for (const alias of entry.aliases) {
      if (clean.includes(alias) || alias.includes(clean)) {
        return entry;
      }
    }
  }

  // Word token matching fallback
  const tokens = clean.split(/[\s\-_,\.\/]+/);
  for (const token of tokens) {
    if (token.length < 3) continue;
    for (const entry of MEDICAL_KNOWLEDGE_BASE) {
      for (const alias of entry.aliases) {
        if (alias.startsWith(token) || token.startsWith(alias)) {
          return entry;
        }
      }
    }
  }

  return null;
};

/**
 * Generate comprehensive AI response incorporating the patient's active prescriptions.
 */
export const generateAiHealthResponse = (userQuery, activeMedications = [], userName = 'Friend') => {
  const q = (userQuery || '').toLowerCase().trim();
  const safeName = userName || 'Friend';
  const meds = Array.isArray(activeMedications) ? activeMedications : [];

  // 1. QUERY: WHAT DISEASES DO MY MEDICINES SOLVE / WHY AM I TAKING THESE?
  if (
    q.includes('what diseases') ||
    q.includes('what disease') ||
    q.includes('which disease') ||
    q.includes('diseases do my') ||
    q.includes('why am i taking') ||
    q.includes('what are my medicines for') ||
    q.includes('what are my pills for') ||
    q.includes('what do my medicines solve') ||
    q.includes('what do my medicines treat') ||
    q.includes('what do my pills solve')
  ) {
    if (meds.length === 0) {
      return `Hello ${safeName}! 👋 You currently do not have any active medications added to your MedCompanion profile.\n\nOnce you or your caretaker tap the "+" button in the Prescriptions tab to add your medicines, I will provide you with a customized clinical breakdown of the exact diseases and conditions they treat!`;
    }

    let response = `📋 **Clinical Disease Breakdown for ${safeName}'s Prescriptions:**\n\n`;
    response += `Here is how each of your ${meds.length} scheduled medications works to protect your health:\n\n`;

    meds.forEach((m, idx) => {
      const match = findMedicationDetails(m.name);
      response += `**${idx + 1}. 💊 ${m.name}** (${m.dosage || 'Prescribed Dose'})\n`;
      if (match) {
        response += `• **Diseases & Conditions Solved:** ${match.diseases.join(', ')}\n`;
        response += `• **Class:** ${match.category}\n`;
        response += `• **How It Helps You:** ${match.mechanism}\n`;
        response += `• **Diet Instruction:** ${m.mealCondition || match.mealAdvice}\n`;
      } else {
        response += `• **Prescription Status:** Active in your regimen scheduled for ${m.time} (${m.mealCondition || 'As prescribed'}).\n`;
        response += `• **Clinical Tip:** Please consult your doctor or prescription slip for the exact target diagnosis for ${m.name}.\n`;
      }
      response += '\n';
    });

    response += `💧 **General Rule:** Always swallow your tablets with a full glass of water, and try to keep your timing consistent every day!`;
    return response;
  }

  // 2. QUERY: LIST MY ACTIVE MEDICATIONS / WHAT MEDICINES AM I TAKING?
  if (
    q.includes('what medicines am i taking') ||
    q.includes('what pills do i have') ||
    q.includes('list my medicines') ||
    q.includes('my prescriptions') ||
    q.includes('my medications') ||
    q.includes('my medicine schedule')
  ) {
    if (meds.length === 0) {
      return `Hello ${safeName}! You haven't added any prescriptions yet. Tap the Prescriptions tab and click "Add New Prescription" to set your dosage and alarms!`;
    }

    let response = `💊 **Your Current MedCompanion Schedule (${meds.length} Active):**\n\n`;
    meds.forEach((m, idx) => {
      response += `**${idx + 1}. ${m.name}**\n`;
      response += `• Dosage: ${m.dosage || 'Standard'}\n`;
      response += `• Scheduled Time: ⏰ ${m.time}\n`;
      response += `• Meal Condition: 🍽️ ${m.mealCondition || 'As prescribed'}\n`;
      response += `• Frequency: 📅 ${m.frequency || 'Daily'}\n`;
      response += `• Status Today: ${m.statusToday === 'taken' ? '✓ Taken' : '⏳ Pending'}\n\n`;
    });
    return response;
  }

  // 3. QUERY: SPECIFIC DISEASE LOOKUP (e.g., "Which medicine is for my diabetes / BP / fever / cholesterol / pain?")
  const conditionKeywords = [
    { key: 'diabetes', title: 'Diabetes / Blood Sugar', filter: ['diabetes', 'sugar', 'glucose', 'insulin'] },
    { key: 'blood pressure', title: 'High Blood Pressure (Hypertension)', filter: ['blood pressure', 'hypertension', 'bp'] },
    { key: 'cholesterol', title: 'Cholesterol & Heart Health', filter: ['cholesterol', 'lipid', 'statin', 'triglyceride'] },
    { key: 'pain', title: 'Pain & Inflammation', filter: ['pain', 'ache', 'headache', 'joint', 'arthritis'] },
    { key: 'fever', title: 'Fever (Pyrexia)', filter: ['fever', 'temperature', 'pyrexia'] },
    { key: 'acidity', title: 'Acidity, GERD & Stomach Ulcers', filter: ['acidity', 'acid', 'gerd', 'reflux', 'heartburn', 'ulcer'] },
    { key: 'infection', title: 'Bacterial Infection', filter: ['infection', 'bacterial', 'antibiotic'] },
    { key: 'thyroid', title: 'Thyroid Health', filter: ['thyroid', 'hypothyroid', 'goiter'] },
    { key: 'allergy', title: 'Allergies & Sneezing', filter: ['allergy', 'allergic', 'sneezing', 'runny nose', 'rash'] },
  ];

  for (const c of conditionKeywords) {
    if (c.filter.some(f => q.includes(f))) {
      const matchingMeds = [];
      for (const m of meds) {
        const details = findMedicationDetails(m.name);
        if (details) {
          const matchDisease = details.diseases.some(d => c.filter.some(f => d.toLowerCase().includes(f)));
          const matchCategory = c.filter.some(f => details.category.toLowerCase().includes(f));
          if (matchDisease || matchCategory) {
            matchingMeds.push({ med: m, details });
          }
        }
      }

      if (matchingMeds.length > 0) {
        let resp = `🩺 **Medicines for ${c.title} in your schedule:**\n\n`;
        matchingMeds.forEach(({ med, details }) => {
          resp += `• **${med.name}** (${med.dosage || 'Prescribed Dose'})\n`;
          resp += `  - ⏰ Scheduled at: ${med.time} (${med.mealCondition || 'As prescribed'})\n`;
          resp += `  - 💡 How it works: ${details.mechanism}\n`;
          resp += `  - 🍽️ Diet: ${details.mealAdvice}\n\n`;
        });
        resp += `Make sure to take them consistently on time for optimal control!`;
        return resp;
      } else {
        return `🩺 Regarding **${c.title}**: None of your currently added prescriptions are recognized for this specific condition.\n\nIf you have been prescribed a medicine for ${c.title}, you can add it to your profile, or verify with your physician to make sure your treatment plan is up to date!`;
      }
    }
  }

  // 4. QUERY: SPECIFIC PILL NAME IN USER'S PRESCRIPTIONS OR GENERAL LOOKUP
  for (const m of meds) {
    const medNameLower = m.name.toLowerCase();
    const tokens = medNameLower.split(/[\s\-_]+/);
    const userMentionedThisMed = tokens.some(t => t.length > 2 && q.includes(t)) || q.includes(medNameLower);

    if (userMentionedThisMed) {
      const details = findMedicationDetails(m.name);
      let reply = `💊 **Information for ${m.name} (In Your Prescriptions):**\n\n`;
      reply += `• **Your Schedule:** ⏰ ${m.time} • ${m.dosage || 'Prescribed'} • ${m.mealCondition || 'As prescribed'}\n`;

      if (details) {
        reply += `• **Primary Diseases Solved:** ${details.diseases.join(', ')}\n`;
        reply += `• **Drug Class:** ${details.category}\n`;
        reply += `• **Mechanism:** ${details.mechanism}\n`;
        reply += `• **Diet & Food Timing:** ${details.mealAdvice}\n`;
        reply += `• **Important Precautions:** ${details.precautions}\n`;
        reply += `• **If Dose Is Missed:** ${details.missedDose}\n`;
      } else {
        reply += `• **Clinical Guidance:** Always take this medicine as prescribed by your doctor. If you feel dizziness or unusual discomfort, notify your caretaker via the SOS button.`;
      }
      return reply;
    }
  }

  // 5. QUERY: GENERAL MEDICINE LOOKUP (Medicine not necessarily in user's list, e.g. "What is Metformin?")
  for (const item of MEDICAL_KNOWLEDGE_BASE) {
    if (q.includes(item.canonicalName.toLowerCase()) || item.aliases.some(a => q.includes(a))) {
      let reply = `💊 **Clinical Overview for ${item.canonicalName}:**\n\n`;
      reply += `• **Therapeutic Class:** ${item.category}\n`;
      reply += `• **Diseases & Conditions Solved:** ${item.diseases.join(', ')}\n`;
      reply += `• **How It Works:** ${item.mechanism}\n`;
      reply += `• **Dietary Timing:** ${item.mealAdvice}\n`;
      reply += `• **Precautions:** ${item.precautions}\n`;
      reply += `• **What To Do If Missed:** ${item.missedDose}\n`;
      return reply;
    }
  }

  // 6. QUERY: CAN I TAKE MEDICINES TOGETHER / COMBINATION INTERACTIONS
  if (q.includes('together') || q.includes('combine') || q.includes('same time') || q.includes('interaction')) {
    if (meds.length <= 1) {
      return `💡 Taking Medications Together: Generally, routine morning or evening pills can be taken together with water unless your doctor specifies otherwise. However, special drugs like Thyroid (Levothyroxine) or PPIs (Pantoprazole) must always be taken on an empty stomach at least 30-45 minutes before other medicines or food!`;
    }

    let reply = `🩺 **Taking Your Prescriptions Together:**\n\nYou currently have ${meds.length} medications scheduled:\n`;
    meds.forEach(m => {
      reply += `• ${m.name} (${m.time} • ${m.mealCondition})\n`;
    });
    reply += `\n**Key Spacing Rules to Remember:**\n`;
    reply += `1. **Empty Stomach First:** If you take thyroid or acid reflux pills (Pantoprazole, Omeprazole, Levothyroxine), take them first thing with water and wait 30-45 minutes before other medicines.\n`;
    reply += `2. **With Food:** Diabetes and pain medicines (Metformin, Ibuprofen) should be taken during or after food to avoid stomach irritation.\n`;
    reply += `3. **Water:** Always use plain room-temperature water. Never take medicines with alcohol, soda, or citrus fruit juice.`;
    return reply;
  }

  // 7. QUERY: FOOD, EMPTY STOMACH OR MEALS
  if (q.includes('empty stomach') || q.includes('food') || q.includes('meal') || q.includes('before or after')) {
    let reply = `🍽️ **Dietary Guidance for Medications:**\n\n`;
    if (meds.length > 0) {
      reply += `Based on your added prescriptions:\n`;
      meds.forEach(m => {
        reply += `• **${m.name}**: ${m.mealCondition || 'As prescribed'}\n`;
      });
      reply += `\n`;
    }
    reply += `• **After Food:** Diabetes pills (Metformin) and pain relievers (Ibuprofen, Diclofenac) MUST be taken after meals to protect the stomach.\n`;
    reply += `• **Before Food:** Antacids, PPIs (Pantoprazole), and Thyroid tablets must be taken 30-60 minutes BEFORE breakfast on an empty stomach.\n`;
    reply += `• **Blood Pressure & Statins:** Can usually be taken before or after meals, but keep the timing consistent every day.`;
    return reply;
  }

  // 8. QUERY: MISSED DOSE RULES
  if (q.includes('miss') || q.includes('forgot') || q.includes('late') || q.includes('delayed')) {
    return `⏰ **Universal Missed Dose Protocol:**\n\n1. **Take As Soon As You Remember:** If you just missed the scheduled hour, take your tablet with water now.\n2. **The Golden Rule - Never Double Up:** If it is almost time for your NEXT scheduled dose, completely SKIP the missed tablet and resume your regular timing. Taking a double dose can cause dangerous drops in blood pressure or blood sugar.\n3. **Caretaker Alert:** MedCompanion automatically notifies your registered caretaker if a scheduled dose is missed for more than 2 minutes, ensuring continuous family support.`;
  }

  // 9. QUERY: TAKING WITH WATER
  if (q.includes('water') || q.includes('drink') || q.includes('milk') || q.includes('juice')) {
    return `💧 **Why Plain Water Is Best:**\n\n• Always swallow tablets with a full 250ml glass of plain room-temperature water.\n• This prevents tablets from lodging in your throat or esophagus, which can cause severe mucosal burns.\n• Avoid taking tablets with grapefruit juice (it interferes with BP drugs and statins) or milk/tea (calcium and tannins block iron and antibiotic absorption).`;
  }

  // 10. DEFAULT CONTEXT-AWARE FALLBACK
  let fallback = `💡 **MedCompanion Health Advice regarding "${userQuery}":**\n\n`;
  if (meds.length > 0) {
    fallback += `You currently have ${meds.length} scheduled medication(s) (${meds.map(m => m.name).join(', ')}). `;
  }
  fallback += `Always store your prescriptions in a dry place away from direct sunlight, follow the exact meal timings indicated on your cards, and feel free to ask me:\n`;
  fallback += `• "What diseases do my medicines solve?"\n`;
  fallback += `• "What is [Medicine Name] for?"\n`;
  fallback += `• "Can I take my pills together?"`;
  return fallback;
};

/**
 * Generate dynamic suggestion chips based on the patient's active prescriptions.
 */
export const generateDynamicSuggestions = (activeMedications = []) => {
  const meds = Array.isArray(activeMedications) ? activeMedications : [];

  if (meds.length === 0) {
    return [
      'What are common rules for taking medicines?',
      'What should I do if I miss a dose?',
      'Why should I take tablets with water?',
      'How to add my first prescription?'
    ];
  }

  const suggestions = [
    'What diseases do my medicines solve?',
    'What is my full medication schedule?',
  ];

  if (meds[0]) {
    suggestions.push(`What is ${meds[0].name} for?`);
    suggestions.push(`Diet advice for ${meds[0].name}`);
  }

  if (meds.length > 1) {
    suggestions.push('Can I take my medicines together?');
  }

  return suggestions;
};
