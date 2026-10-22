/**
 * AI Medical Companion Knowledge Base & Clinical Intelligence Engine
 * Provides patient-contextual medical advice, disease mapping, dosage guidance,
 * side-effect analysis, and app navigation support.
 */

export const MEDICAL_KNOWLEDGE_BASE = [
  // DIABETES & METABOLIC
  {
    canonicalName: 'Metformin',
    aliases: ['metformin', 'glycomet', 'glucophage', 'riomet', 'gluformin', 'obimet'],
    category: 'Oral Antidiabetic (Biguanide)',
    diseases: ['Type 2 Diabetes Mellitus', 'Insulin Resistance', 'Prediabetes', 'PCOS (Polycystic Ovary Syndrome)'],
    mechanism: 'Lowers blood glucose levels by decreasing glucose production in the liver, increasing muscle sensitivity to insulin, and reducing sugar absorption from intestines.',
    dosageRange: 'Starting: 500mg once or twice daily with meals. Maintenance: 500mg to 1000mg twice daily with breakfast and dinner. Maximum: 2550mg daily.',
    mealAdvice: 'Must be taken WITH or IMMEDIATELY AFTER meals with a full glass of water. Taking it on an empty stomach commonly causes nausea, stomach cramps, and diarrhea.',
    bestTime: 'With your largest meals (typically breakfast and dinner).',
    sideEffects: 'Common: Mild nausea, diarrhea, abdominal discomfort, metallic taste in mouth. Serious (Rare): Lactic acidosis (deep rapid breathing, severe muscle aches, extreme drowsiness - seek emergency care).',
    precautions: 'Stay well-hydrated. Avoid heavy alcohol intake as it increases the risk of lactic acidosis. Report persistent severe stomach discomfort.',
    missedDose: 'Take as soon as you remember with a meal. If it is close to your next scheduled meal, skip the missed dose. Never take extra tablets.',
  },
  {
    canonicalName: 'Glimepiride',
    aliases: ['glimepiride', 'amaryl', 'zoryl', 'glimy', 'diapride'],
    category: 'Oral Antidiabetic (Sulfonylurea)',
    diseases: ['Type 2 Diabetes Mellitus (High Blood Sugar)'],
    mechanism: 'Stimulates the beta cells of your pancreas to release more natural insulin into your bloodstream, quickly reducing blood sugar spikes.',
    dosageRange: 'Starting: 1mg to 2mg once daily. Maintenance: 1mg to 4mg daily. Maximum: 8mg daily.',
    mealAdvice: 'Take once daily immediately BEFORE breakfast or your first main meal. Do not delay eating after taking this pill.',
    bestTime: 'Morning, immediately before breakfast.',
    sideEffects: 'Common: Hypoglycemia (shakiness, sweating, dizziness, rapid heartbeat), mild weight gain, nausea.',
    precautions: 'Carry quick-acting sugar (candy, glucose tablets) in case of hypoglycemia (dizziness, shakiness, sudden sweating).',
    missedDose: 'Take before your next meal. Never take a double dose to catch up.',
  },
  {
    canonicalName: 'Dapagliflozin / Empagliflozin',
    aliases: ['dapagliflozin', 'empagliflozin', 'forxiga', 'jardiance', 'dapa', 'empa'],
    category: 'SGLT2 Inhibitor',
    diseases: ['Type 2 Diabetes Mellitus', 'Heart Failure (Cardiovascular Protection)', 'Chronic Kidney Disease (CKD)'],
    mechanism: 'Filters excess glucose through your kidneys into urine, lowering blood sugar and reducing fluid workload on the heart.',
    dosageRange: 'Dapagliflozin: 5mg to 10mg once daily. Empagliflozin: 10mg to 25mg once daily.',
    mealAdvice: 'Can be taken with or without food, preferably in the morning with a full glass of water.',
    bestTime: 'Morning with water to avoid frequent urination at night.',
    sideEffects: 'Common: Increased urination, mild thirst, genital fungal/yeast infections. Serious: Dehydration, low blood pressure.',
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
    dosageRange: 'Starting: 40mg once daily. Maintenance: 40mg to 80mg once daily.',
    mealAdvice: 'Can be taken with or without food. Take at the same time each day (often morning).',
    bestTime: 'Morning, consistently at the same hour.',
    sideEffects: 'Common: Mild dizziness when standing, fatigue, sinus congestion. Serious (Rare): Hyperkalemia (high potassium), allergic swelling.',
    precautions: 'Avoid taking potassium supplements or salt substitutes containing potassium without consulting your doctor. Stand up slowly from sitting or lying down to prevent dizziness.',
    missedDose: 'Take as soon as remembered today. If less than 8 hours before next dose, skip and keep regular schedule.',
  },
  {
    canonicalName: 'Losartan',
    aliases: ['losartan', 'cozaar', 'losar', 'losakind', 'repace'],
    category: 'Antihypertensive (ARB)',
    diseases: ['High Blood Pressure (Hypertension)', 'Stroke Risk Reduction in Heart Disease', 'Diabetic Nephropathy'],
    mechanism: 'Relaxes blood vessels by preventing angiotensin II from narrowing arteries, ensuring smooth blood flow throughout the body.',
    dosageRange: 'Starting: 50mg once daily. Range: 25mg to 100mg once daily (or split twice daily).',
    mealAdvice: 'Can be taken with or without meals. Drink with plenty of water.',
    bestTime: 'Morning or at a fixed hour every day.',
    sideEffects: 'Common: Lightheadedness, nasal congestion, back pain.',
    precautions: 'Avoid excessive alcohol which can drop blood pressure too low. Stay hydrated.',
    missedDose: 'Take as soon as remembered. Never double up.',
  },
  {
    canonicalName: 'Amlodipine',
    aliases: ['amlodipine', 'norvasc', 'amlong', 'stamlo', 'amlovas', 'amlocip'],
    category: 'Antihypertensive (Calcium Channel Blocker)',
    diseases: ['High Blood Pressure (Hypertension)', 'Coronary Artery Disease', 'Angina (Chest Pain)'],
    mechanism: 'Inhibits calcium ions from entering heart and arterial muscle cells, allowing peripheral arteries to dilate and lowering arterial resistance.',
    dosageRange: 'Starting: 2.5mg to 5mg once daily. Maximum: 10mg once daily.',
    mealAdvice: 'Can be taken before or after meals, consistently at the same time every day.',
    bestTime: 'Morning or evening, but keep the timing uniform.',
    sideEffects: 'Common: Swelling in ankles or lower legs (peripheral edema), facial flushing, dizziness, fatigue.',
    precautions: 'AVOID eating grapefruit or drinking grapefruit juice, as it can dangerously elevate amlodipine levels in your blood. Elevate feet if mild ankle swelling occurs.',
    missedDose: 'Take if remembered within 12 hours of scheduled time; otherwise skip.',
  },
  {
    canonicalName: 'Atenolol / Metoprolol',
    aliases: ['atenolol', 'metoprolol', 'tenormin', 'betaloc', 'metolar', 'seloken', 'lopressor'],
    category: 'Beta Blocker',
    diseases: ['High Blood Pressure (Hypertension)', 'Angina Pectoris', 'Arrhythmia (Irregular Heartbeat)', 'Post-Heart Attack Management'],
    mechanism: 'Slows down heart rate and reduces the force of heart muscle contraction, lowering blood pressure and relieving cardiac stress.',
    dosageRange: 'Atenolol: 25mg to 50mg once daily (Max: 100mg). Metoprolol: 25mg to 100mg once or twice daily.',
    mealAdvice: 'Take with or immediately after food for consistent absorption.',
    bestTime: 'Morning with breakfast.',
    sideEffects: 'Common: Cold hands/feet, tiredness, slower heart rate, dizziness. Serious: Shortness of breath, wheezing.',
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
    dosageRange: 'Standard: 10mg to 20mg once daily. High-Intensity: 40mg to 80mg once daily.',
    mealAdvice: 'Can be taken with or without food. Best taken in the evening or at bedtime with water.',
    bestTime: 'Evening or at bedtime (cholesterol synthesis peaks overnight).',
    sideEffects: 'Common: Mild headache, joint discomfort, constipation. Serious: Unexplained muscle pain or weakness (myopathy), dark urine.',
    precautions: 'Avoid excessive grapefruit juice and heavy alcohol. Notify your doctor if you experience unexplained muscle pain, tenderness, or weakness.',
    missedDose: 'Take as soon as remembered on the same day. If next dose is due within 12 hours, skip.',
  },
  {
    canonicalName: 'Rosuvastatin',
    aliases: ['rosuvastatin', 'crestor', 'rosuvas', 'rosave', 'razel'],
    category: 'High-Intensity Statin',
    diseases: ['Severe Hypercholesterolemia', 'Coronary Artery Plaque Stabilization', 'Prevention of Stroke & Cardiovascular Events'],
    mechanism: 'Potently suppresses hepatic cholesterol synthesis, rapidly reducing circulating LDL cholesterol and clearing arterial walls.',
    dosageRange: 'Standard: 5mg to 10mg once daily. Maximum: 20mg to 40mg once daily.',
    mealAdvice: 'Can be taken at any time of day, with or without meals.',
    bestTime: 'Morning or evening consistently.',
    sideEffects: 'Common: Muscle aches, headache, dizziness, abdominal pain.',
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
    dosageRange: 'Standard: 40mg once daily. Severe GERD: 40mg twice daily.',
    mealAdvice: 'STRICTLY take 30 to 60 MINUTES BEFORE BREAKFAST on an empty stomach with a glass of plain water for maximum effectiveness.',
    bestTime: 'Early morning on an empty stomach, 45 minutes before breakfast.',
    sideEffects: 'Common: Mild headache, diarrhea, abdominal gas. Long-term: May reduce Vitamin B12 and Magnesium absorption.',
    precautions: 'Do not crush or chew delayed-release tablets; swallow whole. Avoid late-night spicy food.',
    missedDose: 'Take before your next meal if missed in the morning, otherwise resume tomorrow before breakfast.',
  },
  {
    canonicalName: 'Omeprazole / Rabeprazole / Esomeprazole',
    aliases: ['omeprazole', 'rabeprazole', 'esomeprazole', 'prilosec', 'nexium', 'rabicip', 'razo', 'omez'],
    category: 'Proton Pump Inhibitor (Acid Reducer)',
    diseases: ['Acid Reflux (GERD)', 'Stomach Ulcers', 'Heartburn', 'Protection against NSAID stomach damage'],
    mechanism: 'Blocks acid-producing proton pumps in gastric parietal cells, neutralizing excessive acidity.',
    dosageRange: 'Omeprazole: 20mg to 40mg daily. Rabeprazole: 20mg daily. Esomeprazole: 20mg to 40mg daily.',
    mealAdvice: 'Take once daily in the morning, 30 to 45 minutes before food with water.',
    bestTime: 'Morning before food.',
    sideEffects: 'Common: Nausea, flatulence, headache.',
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
    dosageRange: 'Adults: 500mg to 650mg every 4 to 6 hours as needed. Maximum: 4000mg per 24 hours (or 3000mg in frail individuals).',
    mealAdvice: 'Can be safely taken on an empty stomach or after meals with water. It is very gentle on the stomach lining.',
    bestTime: 'Whenever pain or fever occurs (minimum 4-6 hours between doses).',
    sideEffects: 'Generally very well tolerated. Excessive doses can cause acute liver failure.',
    precautions: 'Do not exceed 3,000mg to 4,000mg per 24 hours. Avoid alcohol, which compounds liver toxicity risk. Keep at least 4-6 hours between doses.',
    missedDose: 'Take only when needed for pain or fever. Do not double doses.',
  },
  {
    canonicalName: 'Ibuprofen / Diclofenac / Aceclofenac',
    aliases: ['ibuprofen', 'diclofenac', 'aceclofenac', 'advil', 'motrin', 'voveran', 'zerodol', 'hifenac'],
    category: 'NSAID (Non-Steroidal Anti-Inflammatory Drug)',
    diseases: ['Joint & Arthritis Inflammation', 'Severe Body & Dental Pain', 'Post-Traumatic Swelling', 'Sprains & Strains'],
    mechanism: 'Inhibits COX-1 and COX-2 enzymes, stopping the production of inflammatory prostaglandins that cause swelling, redness, and pain.',
    dosageRange: 'Ibuprofen: 200mg to 400mg every 6 to 8 hours (Max: 1200mg OTC, 2400mg prescribed). Diclofenac: 50mg twice daily.',
    mealAdvice: 'MUST BE TAKEN WITH OR AFTER A FULL MEAL with a full glass of water. Never take NSAIDs on an empty stomach as they can irritate gastric mucosa.',
    bestTime: 'After meals.',
    sideEffects: 'Common: Gastric irritation, heartburn, nausea. Serious: Peptic ulcer, stomach bleeding, kidney strain.',
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
    dosageRange: 'Amoxicillin: 250mg to 500mg every 8 hours, or 875mg every 12 hours. Augmentin: 625mg twice daily.',
    mealAdvice: 'Take at the start of a light meal or snack to minimize gastrointestinal upset and maximize absorption.',
    bestTime: 'Evenly spaced throughout the day (e.g. 8 AM and 8 PM).',
    sideEffects: 'Common: Mild diarrhea, nausea, rash. Serious: Severe watery diarrhea, allergic anaphylaxis.',
    precautions: 'COMPLETE THE ENTIRE PRESCRIBED COURSE even if symptoms disappear within 2 days! Stopping early creates antibiotic resistance.',
    missedDose: 'Take as soon as remembered. Space out remaining doses evenly through the day.',
  },
  {
    canonicalName: 'Azithromycin',
    aliases: ['azithromycin', 'zithromax', 'azee', 'azithral', 'z-pak'],
    category: 'Macrolide Antibiotic',
    diseases: ['Bacterial Respiratory Infections', 'Tonsillitis & Pharyngitis', 'Pneumonia', 'Skin & Soft Tissue Infections'],
    mechanism: 'Binds to the 50S ribosomal subunit of bacteria, shutting down protein synthesis and preventing bacteria from replicating.',
    dosageRange: 'Standard: 500mg on Day 1, followed by 250mg daily on Days 2-5, or 500mg once daily for 3 days.',
    mealAdvice: 'Can be taken with or without meals, but consistent timing once daily is crucial. Swallow whole with water.',
    bestTime: 'Same time each day.',
    sideEffects: 'Common: Nausea, diarrhea, abdominal cramping.',
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
    dosageRange: 'Cetirizine: 5mg to 10mg once daily. Levocetirizine: 5mg once daily.',
    mealAdvice: 'Can be taken with or without food. Best taken in the evening or before bed as it can cause mild drowsiness.',
    bestTime: 'Night / bedtime.',
    sideEffects: 'Common: Mild drowsiness, dry mouth, headache.',
    precautions: 'Avoid driving or operating machinery if feeling sleepy. Limit alcohol intake.',
    missedDose: 'Take before bed if remembered; otherwise wait until the following evening.',
  },
  {
    canonicalName: 'Montelukast',
    aliases: ['montelukast', 'singulair', 'montek', 'montair', 'telekast'],
    category: 'Leukotriene Receptor Antagonist',
    diseases: ['Asthma Prevention', 'Exercise-Induced Bronchospasm', 'Chronic Allergic Rhinitis'],
    mechanism: 'Blocks leukotrienes, inflammatory substances that cause airway constriction, mucus buildup, and breathing difficulty.',
    dosageRange: 'Adults: 10mg once daily at bedtime.',
    mealAdvice: 'Take once daily in the evening, with or without food.',
    bestTime: 'Evening / bedtime.',
    sideEffects: 'Common: Headache, upper respiratory infection, abdominal pain.',
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
    dosageRange: 'Individualized based on TSH lab tests: commonly 25mcg, 50mcg, 75mcg, 88mcg, 100mcg, or 125mcg once daily.',
    mealAdvice: 'STRICTEST RULE: Take FIRST THING in the morning on an empty stomach with plain water. Wait AT LEAST 45 to 60 MINUTES before drinking tea, coffee, milk, or eating breakfast.',
    bestTime: 'At dawn / early morning, 45-60 mins before any food or drink.',
    sideEffects: 'If overdosed: Palpitations, weight loss, tremors, sweating, insomnia.',
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
    dosageRange: 'Deficiency: 60,000 IU once weekly for 8 weeks. Maintenance: 1,000 to 2,000 IU daily.',
    mealAdvice: 'MUST BE TAKEN WITH A MEAL THAT CONTAINS HEALTHY FAT (such as milk, yogurt, eggs, or nuts) because Vitamin D is fat-soluble and will not absorb well on an empty stomach.',
    bestTime: 'With your heaviest meal or lunch.',
    sideEffects: 'Rare when taken as prescribed. Excessive long-term overdose causes hypercalcemia (calcium toxicity).',
    precautions: 'If prescribed a 60,000 IU capsule, take only ONCE WEEKLY as instructed by your doctor.',
    missedDose: 'Take with your next heavy meal on the same week.',
  },
  {
    canonicalName: 'Vitamin B12 / Methylcobalamin',
    aliases: ['vitamin b12', 'methylcobalamin', 'neurobion', 'mecobalamin', 'methycobal', 'renerve'],
    category: 'Water-Soluble Vitamin & Neuro-Nutrient',
    diseases: ['Peripheral Neuropathy (Nerve Numbness & Tingling)', 'Megaloblastic Anemia', 'Fatigue & Low Energy', 'Diabetic Nerve Support'],
    mechanism: 'Crucial for myelin sheath nerve protection, red blood cell synthesis, and cellular DNA repair.',
    dosageRange: 'Daily supplement: 500mcg to 1500mcg once daily.',
    mealAdvice: 'Can be taken with or after morning meals with water.',
    bestTime: 'Morning with breakfast.',
    sideEffects: 'Virtually non-toxic; excess is safely eliminated via kidneys. May cause harmless bright yellow urine.',
    precautions: 'Harmless yellowing of urine is normal with B-complex vitamins.',
    missedDose: 'Take with next meal.',
  },
  {
    canonicalName: 'Iron (Ferrous Ascorbate / Sulfate)',
    aliases: ['iron', 'ferrous ascorbate', 'autrin', 'orofer', 'feronia', 'livogen'],
    category: 'Hematopoietic Mineral',
    diseases: ['Iron-Deficiency Anemia', 'Low Hemoglobin', 'Chronic Fatigue'],
    mechanism: 'Provides elemental iron required to build hemoglobin in red blood cells to transport oxygen throughout tissues.',
    dosageRange: 'Standard: 50mg to 100mg elemental iron once or twice daily.',
    mealAdvice: 'Absorbs best on an empty stomach or with Vitamin C (orange juice/lemon). If it causes stomach upset, take with light meals. AVOID tea, coffee, and milk within 2 hours.',
    bestTime: 'Morning or between meals with lemon water.',
    sideEffects: 'Common: Dark green or black stools (harmless), constipation, mild nausea.',
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
    dosageRange: 'Cardiovascular Prevention: 75mg to 150mg once daily.',
    mealAdvice: 'Always take WITH or AFTER FOOD with a full glass of water to protect against stomach ulcers.',
    bestTime: 'After lunch or dinner.',
    sideEffects: 'Common: Heartburn, mild stomach irritation, easy bruising. Serious: Bleeding ulcers, black tarry stools.',
    precautions: 'Inform your doctor/dentist before surgeries. Report unusual bruising, dark stools, or nosebleeds.',
    missedDose: 'Take as soon as remembered with food. If near tomorrow, skip.',
  },
  {
    canonicalName: 'Clopidogrel',
    aliases: ['clopidogrel', 'plavix', 'clopilet', 'ceruvit', 'deplatt'],
    category: 'P2Y12 Platelet Inhibitor',
    diseases: ['Acute Coronary Syndrome', 'Stent Thrombosis Prevention', 'Peripheral Vascular Disease'],
    mechanism: 'Blocks ADP receptors on platelets, keeping blood smooth and preventing dangerous blood clots in coronary arteries.',
    dosageRange: 'Standard: 75mg once daily.',
    mealAdvice: 'Can be taken with or without food at the same time daily.',
    bestTime: 'Same time each day.',
    sideEffects: 'Common: Minor bleeding (bruising, cuts bleed longer), diarrhea.',
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

  // 1. QUERY: HOW TO ADD MY FIRST PRESCRIPTION / HOW TO USE MEDCOMPANION
  if (
    q.includes('how to add') ||
    q.includes('add my first') ||
    q.includes('add prescription') ||
    q.includes('add a medicine') ||
    q.includes('how do i add') ||
    q.includes('schedule pills') ||
    q.includes('how to schedule')
  ) {
    return `📲 **How to Add Your First Prescription in MedCompanion:**

Adding a medicine takes less than 30 seconds:

**1. Open Prescriptions Tab:**
• Tap the **Prescriptions (💊)** icon on the bottom navigation bar.

**2. Tap Add Button:**
• Tap the teal **"+ Add New Prescription"** button at the top of the screen.

**3. Enter Pill Details:**
• **Medicine Name & Dosage:** e.g., *Metformin 500mg* or *Telmisartan 40mg*.
• **Schedule Time:** Choose your exact alarm time (or pick *"In 1 Minute"* to quickly test the live alarm!).
• **Meal Condition:** Select *After Food*, *Before Food*, or *With Meals*.
• **Frequency:** Choose *Daily*, *Weekly*, or *Specific Days*.

**4. Save & Activate:**
• Tap **"Save Prescription"**.

✨ **What MedCompanion does automatically:**
• Queues your high-priority phone alarm.
• Automatically schedules a **10-minute heads-up notification** before the scheduled time.
• If you ever miss taking a pill, your registered caretaker receives an instant cloud escalation and SMS alert!`;
  }

  // 2. QUERY: COMMON RULES FOR TAKING MEDICINES
  if (
    q.includes('common rules') ||
    q.includes('rules for taking') ||
    q.includes('general rules') ||
    q.includes('medicine rules')
  ) {
    return `📋 **5 Golden Rules for Taking Medications Safely:**

**1. Water is Non-Negotiable:**
• Always swallow tablets with a full 250ml glass of plain water. Never take pills dry or with hot tea, coffee, milk, or soda.

**2. Respect Empty Stomach vs. After Meals:**
• **Before Food (30-60m prior):** Thyroid (Levothyroxine) and Antacids/PPIs (Pantoprazole) need an empty stomach to absorb.
• **After Food:** Diabetes pills (Metformin) and pain relievers (Ibuprofen, Diclofenac) MUST be taken after meals to protect your stomach lining.

**3. The Golden Missed Dose Rule:**
• Take as soon as you remember, but **NEVER double up** if your next scheduled dose is near.

**4. Avoid Dangerous Food Clashes:**
• Avoid grapefruit juice with blood pressure pills (Amlodipine) or cholesterol statins (Atorvastatin).
• Avoid milk/calcium within 2 hours of Iron or Thyroid tablets.

**5. Consistent Daily Timing:**
• Taking your blood pressure or diabetes medicine at the exact same hour every day prevents dangerous fluctuations in your readings.`;
  }

  // 3. QUERY: WHAT DISEASES DO MY MEDICINES SOLVE / WHY AM I TAKING THESE?
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

  // 4. QUERY: LIST MY ACTIVE MEDICATIONS / WHAT MEDICINES AM I TAKING?
  if (
    q.includes('what medicines am i taking') ||
    q.includes('what pills do i have') ||
    q.includes('list my medicines') ||
    q.includes('my prescriptions') ||
    q.includes('my medications') ||
    q.includes('my medicine schedule') ||
    q.includes('full medication schedule')
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

  // 5. QUERY: DOSAGE QUESTIONS (e.g. "What is dosage for Metformin?", "How much should I take?")
  if (q.includes('dosage') || q.includes('how much') || q.includes('how many mg') || q.includes('max dose')) {
    // Check if user is asking about an active medicine in their regimen
    for (const m of meds) {
      if (q.includes(m.name.toLowerCase()) || findMedicationDetails(m.name)?.canonicalName.toLowerCase().split(' ')[0] && q.includes(findMedicationDetails(m.name).canonicalName.toLowerCase().split(' ')[0])) {
        const details = findMedicationDetails(m.name);
        let resp = `💊 **Dosage Analysis for ${m.name}:**\n\n`;
        resp += `• **Your Prescribed Dose:** ${m.dosage || 'As indicated'} (Scheduled at ${m.time})\n`;
        if (details?.dosageRange) {
          resp += `• **Standard Clinical Dosage Range:** ${details.dosageRange}\n`;
          resp += `• **Timing & Meals:** ${details.mealAdvice}\n`;
        }
        resp += `\n⚠️ **Important:** Never alter your prescribed dosage without consulting your physician. MedCompanion tracks your doctor's exact prescribed intake.`;
        return resp;
      }
    }

    // General medicine dosage check
    for (const item of MEDICAL_KNOWLEDGE_BASE) {
      if (q.includes(item.canonicalName.toLowerCase()) || item.aliases.some(a => q.includes(a))) {
        let resp = `💊 **Standard Dosage Guide for ${item.canonicalName}:**\n\n`;
        resp += `• **Standard Adult Dosage:** ${item.dosageRange || 'As determined by physician'}\n`;
        resp += `• **How to Take:** ${item.mealAdvice}\n`;
        resp += `• **Best Timing:** ${item.bestTime || 'Consistent daily hour'}\n\n`;
        resp += `Always follow your physician's exact prescription slip.`;
        return resp;
      }
    }
  }

  // 6. QUERY: SIDE EFFECTS & ADVERSE REACTIONS
  if (q.includes('side effect') || q.includes('side effects') || q.includes('adverse') || q.includes('reaction') || q.includes('dizzy') || q.includes('nausea')) {
    for (const m of meds) {
      const details = findMedicationDetails(m.name);
      if (q.includes(m.name.toLowerCase()) || (details && q.includes(details.canonicalName.toLowerCase()))) {
        let resp = `⚠️ **Side Effect Profile for ${m.name}:**\n\n`;
        if (details?.sideEffects) {
          resp += `• **Reported Symptoms:** ${details.sideEffects}\n`;
          resp += `• **How to Minimize:** ${details.mealAdvice}\n`;
        } else {
          resp += `• Common mild reactions can include mild headache, nausea, or dizziness.\n`;
        }
        resp += `\n🚨 **Red Flags:** If you experience severe lightheadedness, chest pain, or swelling of the face/throat, tap the SOS button to alert your caretaker and call emergency services immediately.`;
        return resp;
      }
    }

    for (const item of MEDICAL_KNOWLEDGE_BASE) {
      if (q.includes(item.canonicalName.toLowerCase()) || item.aliases.some(a => q.includes(a))) {
        let resp = `⚠️ **Side Effect Profile for ${item.canonicalName}:**\n\n`;
        resp += `• **Known Reactions:** ${item.sideEffects || 'Consult your prescribing doctor'}\n`;
        resp += `• **Precautions:** ${item.precautions}\n`;
        return resp;
      }
    }
  }

  // 7. QUERY: BEST TIME OF DAY (Morning vs. Night)
  if (q.includes('morning or night') || q.includes('best time') || q.includes('when should i take') || q.includes('at bedtime')) {
    for (const m of meds) {
      if (q.includes(m.name.toLowerCase())) {
        const details = findMedicationDetails(m.name);
        let resp = `⏰ **Optimal Timing for ${m.name}:**\n\n`;
        resp += `• **Your Scheduled Time:** ${m.time} (${m.mealCondition || 'As prescribed'})\n`;
        if (details?.bestTime) {
          resp += `• **Clinical Recommendation:** ${details.bestTime}\n`;
          resp += `• **Meal Guideline:** ${details.mealAdvice}\n`;
        }
        return resp;
      }
    }
  }

  // 8. QUERY: SPECIFIC DISEASE LOOKUP (e.g., "Which medicine is for my diabetes / BP / fever / cholesterol / pain?")
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

  // 9. QUERY: SPECIFIC PILL NAME IN USER'S PRESCRIPTIONS
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
        reply += `• **Standard Adult Dosage:** ${details.dosageRange || 'Per doctor prescription'}\n`;
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

  // 10. QUERY: GENERAL MEDICINE LOOKUP (Not necessarily in user's list, e.g. "What is Metformin?")
  for (const item of MEDICAL_KNOWLEDGE_BASE) {
    if (q.includes(item.canonicalName.toLowerCase()) || item.aliases.some(a => q.includes(a))) {
      let reply = `💊 **Clinical Overview for ${item.canonicalName}:**\n\n`;
      reply += `• **Therapeutic Class:** ${item.category}\n`;
      reply += `• **Diseases & Conditions Solved:** ${item.diseases.join(', ')}\n`;
      reply += `• **Typical Adult Dosage:** ${item.dosageRange || 'As prescribed'}\n`;
      reply += `• **How It Works:** ${item.mechanism}\n`;
      reply += `• **Dietary Timing:** ${item.mealAdvice}\n`;
      reply += `• **Precautions:** ${item.precautions}\n`;
      reply += `• **What To Do If Missed:** ${item.missedDose}\n`;
      return reply;
    }
  }

  // 11. QUERY: CAN I TAKE MEDICINES TOGETHER / COMBINATION INTERACTIONS
  if (q.includes('together') || q.includes('combine') || q.includes('same time') || q.includes('interaction')) {
    if (meds.length <= 1) {
      return `💡 **Taking Medications Together:** Generally, routine morning or evening pills can be taken together with water unless your doctor specifies otherwise. However, special drugs like Thyroid (Levothyroxine) or PPIs (Pantoprazole) must always be taken on an empty stomach at least 30-45 minutes before other medicines or food!`;
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

  // 12. QUERY: FOOD, EMPTY STOMACH OR MEALS
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

  // 13. QUERY: MISSED DOSE RULES
  if (q.includes('miss') || q.includes('forgot') || q.includes('late') || q.includes('delayed')) {
    return `⏰ **Universal Missed Dose Protocol:**\n\n1. **Take As Soon As You Remember:** If you just missed the scheduled hour, take your tablet with water now.\n2. **The Golden Rule - Never Double Up:** If it is almost time for your NEXT scheduled dose, completely SKIP the missed tablet and resume your regular timing. Taking a double dose can cause dangerous drops in blood pressure or blood sugar.\n3. **Caretaker Alert:** MedCompanion automatically notifies your registered caretaker if a scheduled dose is missed for more than 2 minutes, ensuring continuous family support.`;
  }

  // 14. QUERY: TAKING WITH WATER
  if (q.includes('water') || q.includes('drink') || q.includes('milk') || q.includes('juice')) {
    return `💧 **Why Plain Water Is Best:**\n\n• Always swallow tablets with a full 250ml glass of plain room-temperature water.\n• This prevents tablets from lodging in your throat or esophagus, which can cause severe mucosal burns.\n• Avoid taking tablets with grapefruit juice (it interferes with BP drugs and statins) or milk/tea (calcium and tannins block iron and antibiotic absorption).`;
  }

  // 15. DEFAULT CONTEXT-AWARE FALLBACK
  let fallback = `💡 **MedCompanion Clinical Assistant Advice:**\n\n`;
  if (meds.length > 0) {
    fallback += `You currently have ${meds.length} scheduled medication(s): ${meds.map(m => m.name).join(', ')}.\n\n`;
  }
  fallback += `You can ask me questions such as:\n`;
  fallback += `• "How to add my first prescription?"\n`;
  fallback += `• "What diseases do my medicines solve?"\n`;
  fallback += `• "What are the side effects of [Medicine]?"\n`;
  fallback += `• "What is the normal dosage for [Medicine]?"\n`;
  fallback += `• "Can I take my medicines together?"`;
  return fallback;
};

/**
 * Generate dynamic suggestion chips based on the patient's active prescriptions.
 */
export const generateDynamicSuggestions = (activeMedications = []) => {
  const meds = Array.isArray(activeMedications) ? activeMedications : [];

  if (meds.length === 0) {
    return [
      'How to add my first prescription?',
      'What are common rules for taking medicines?',
      'What should I do if I miss a dose?',
      'Why should I take tablets with water?'
    ];
  }

  const suggestions = [
    'What diseases do my medicines solve?',
    'What is my full medication schedule?',
  ];

  if (meds[0]) {
    suggestions.push(`What is ${meds[0].name} for?`);
    suggestions.push(`Diet & dosage for ${meds[0].name}`);
  }

  if (meds.length > 1) {
    suggestions.push('Can I take my medicines together?');
  }

  return suggestions;
};
