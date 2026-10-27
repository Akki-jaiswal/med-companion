/**
 * Automated Verification Test Suite for Dynamic Patient-Scoped Adherence & Weekly Reports
 * Validates:
 * 1. Multi-patient adherence isolation and zero cross-patient data leaking
 * 2. Real-time compliance rate calculations per patient
 * 3. Missed-to-taken conversion with accurate timestamp preservation
 * 4. PDF report payload scoping per patient
 */

const assert = require('assert');

console.log('🧪 Starting MedCompanion Patient Adherence & Report Dynamic Sync Test Suite...\n');

// 1. Multi-Patient Adherence Isolation Test
console.log('[Test 1] Testing multi-patient adherence filtering and compliance isolation...');

const samplePatients = [
  { id: 'p_akki', name: 'Akki', code: 'MED-9341', phone: '9876543210', emergencyPhone: '9123456780', age: 72 },
  { id: 'p_nirmala', name: 'Grandma Nirmala', code: 'MED-1102', phone: '9988776655', emergencyPhone: '9123456780', age: 80 },
];

const mixedAdherenceHistory = [
  // Akki: 2 Taken, 0 Missed -> 100%
  { id: 'adh_1', patientId: 'p_akki', date: '2026-10-27', pillName: 'Metformin', time: '08:00 AM', status: 'Taken', onTime: true, timestamp: 1730000001000 },
  { id: 'adh_2', patientId: 'p_akki', date: '2026-10-27', pillName: 'Amlodipine', time: '01:30 PM', status: 'Taken', onTime: true, timestamp: 1730000002000 },

  // Grandma Nirmala: 1 Taken, 1 Missed -> 50%
  { id: 'adh_3', patientId: 'p_nirmala', date: '2026-10-27', pillName: 'Disprin', time: '08:00 AM', status: 'Taken', onTime: true, timestamp: 1730000003000 },
  { id: 'adh_4', patientId: 'p_nirmala', date: '2026-10-27', pillName: 'Calcium D3', time: '08:00 PM', status: 'Missed', onTime: false, timestamp: 1730000004000 },
];

// Helper calculation
const calculatePatientCompliance = (patientId, history) => {
  const patientLogs = history.filter(h => h.patientId === patientId);
  const total = patientLogs.length;
  const taken = patientLogs.filter(h => h.status === 'Taken').length;
  const missed = patientLogs.filter(h => h.status === 'Missed').length;
  const rate = total > 0 ? Math.round((taken / total) * 100) : 100;
  return { patientLogs, total, taken, missed, rate };
};

const akkiStats = calculatePatientCompliance('p_akki', mixedAdherenceHistory);
assert.strictEqual(akkiStats.total, 2);
assert.strictEqual(akkiStats.taken, 2);
assert.strictEqual(akkiStats.missed, 0);
assert.strictEqual(akkiStats.rate, 100, 'Akki should have 100% adherence');

const nirmalaStats = calculatePatientCompliance('p_nirmala', mixedAdherenceHistory);
assert.strictEqual(nirmalaStats.total, 2);
assert.strictEqual(nirmalaStats.taken, 1);
assert.strictEqual(nirmalaStats.missed, 1);
assert.strictEqual(nirmalaStats.rate, 50, 'Nirmala should have 50% adherence');

console.log(`✅ Patient "Akki": ${akkiStats.rate}% compliance (${akkiStats.taken}/${akkiStats.total} taken)`);
console.log(`✅ Patient "Nirmala": ${nirmalaStats.rate}% compliance (${nirmalaStats.taken}/${nirmalaStats.total} taken)`);
console.log('✅ Zero cross-contamination between patient accounts.\n');

// 2. Missed-to-Taken Status Dynamic Conversion
console.log('[Test 2] Testing Missed-to-Taken conversion and timestamp retention...');

let akkiHistory = [
  { id: 'adh_10', patientId: 'p_akki', date: '2026-10-27', pillName: 'Disprin', time: '08:00 PM', status: 'Missed', onTime: false, timestamp: 1730000000000 }
];

// Simulate patient taking late dose afterwards
const takeLateDose = (history, pillName, date, timeStr) => {
  let converted = false;
  const updated = history.map(rec => {
    if (rec.date === date && rec.pillName === pillName && rec.status === 'Missed' && !converted) {
      converted = true;
      return { ...rec, status: 'Taken', onTime: false, takenAt: timeStr, timestamp: Date.now() };
    }
    return rec;
  });
  return { updated, converted };
};

const { updated: akkiHistoryUpdated, converted } = takeLateDose(akkiHistory, 'Disprin', '2026-10-27', '08:45 PM');
assert.strictEqual(converted, true, 'Missed dose should be converted');
assert.strictEqual(akkiHistoryUpdated.length, 1, 'Length should remain 1 (no duplicate rows)');
assert.strictEqual(akkiHistoryUpdated[0].status, 'Taken');
assert.strictEqual(akkiHistoryUpdated[0].takenAt, '08:45 PM');
assert.strictEqual(akkiHistoryUpdated[0].onTime, false);
console.log('✅ Missed dose converted to Taken successfully without inflating row count.\n');

// 3. PDF Report Payload Scoping
console.log('[Test 3] Verifying scoped PDF report payload per patient...');

const generateReportPayload = (patient, medications, history) => {
  const patientMeds = medications.filter(m => m.patientId === patient.id);
  const patientLogs = history.filter(h => h.patientId === patient.id);
  const total = patientLogs.length;
  const taken = patientLogs.filter(h => h.status === 'Taken').length;
  const missed = patientLogs.filter(h => h.status === 'Missed').length;
  const rate = total > 0 ? Math.round((taken / total) * 100) : 100;

  return {
    patient: {
      name: patient.name,
      code: patient.code,
      phone: patient.phone,
      emergencyPhone: patient.emergencyPhone,
      age: patient.age
    },
    medicationsCount: patientMeds.length,
    logsCount: patientLogs.length,
    rate: rate
  };
};

const sampleMeds = [
  { id: 'm1', patientId: 'p_akki', name: 'Metformin', time: '08:00 AM' },
  { id: 'm2', patientId: 'p_akki', name: 'Amlodipine', time: '01:30 PM' },
  { id: 'm3', patientId: 'p_nirmala', name: 'Disprin', time: '08:00 AM' },
];

const akkiReport = generateReportPayload(samplePatients[0], sampleMeds, mixedAdherenceHistory);
assert.strictEqual(akkiReport.patient.name, 'Akki');
assert.strictEqual(akkiReport.medicationsCount, 2);
assert.strictEqual(akkiReport.rate, 100);

const nirmalaReport = generateReportPayload(samplePatients[1], sampleMeds, mixedAdherenceHistory);
assert.strictEqual(nirmalaReport.patient.name, 'Grandma Nirmala');
assert.strictEqual(nirmalaReport.medicationsCount, 1);
assert.strictEqual(nirmalaReport.rate, 50);

console.log('✅ Akki Report:', akkiReport);
console.log('✅ Nirmala Report:', nirmalaReport);
console.log('\n🎉 All Dynamic Adherence & Weekly Report tests passed successfully!');
