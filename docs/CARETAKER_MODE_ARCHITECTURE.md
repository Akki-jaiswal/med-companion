# Caretaker Mode Architecture & Technical Specification

## 1. Overview & Vision
The **Caretaker Mode** in MedCompanion empowers family members, guardians, and medical supervisors (e.g., Dr. Sharma) to remotely supervise, monitor, and safeguard their elderly or chronic-care patients without manual back-and-forth.

---

## 2. Core Functional Pillars

### Pillar A: Multi-Patient Management & Context Switching
* **Patient Selector Ribbon**:
  * Displays horizontal pill cards of all paired patients:
    * Patient Avatar / Initials
    * Name (e.g., `Akki`, `Grandma Nirmala`)
    * Relationship (`Self`, `Parent`, `Child`, `Patient`)
    * Today's Real-Time Adherence Badge (`85% Taken`, `1 Missed`, `2 Pending`)
* **Single Tap Switching**:
  * Tapping any patient instantly switches the entire dashboard context (active prescriptions, adherence history, contact information, and pending alarms) to that patient.
* **Unlink & Delete Patient**:
  * Caretakers can unlink a patient from their record list with two confirmation steps.
  * Ensures safe de-linking without destroying the patient's personal records or Firebase account.

---

### Pillar B: Real-Time Bidirectional Prescription Management
* **Remote Schedule Creation (CRUD)**:
  * Caretakers can remotely create, update, and delete prescriptions for their paired patients:
    * Medicine Name & Dosage
    * Schedule Frequency (Every Day, Specific Days, Weekly, Alternate Days)
    * Alarm Time (synchronizes to the patient device's alarm scheduler)
    * Meal Timing (Before Meal, After Meal, With Food, Empty Stomach)
    * Pill Shape & Color tags
* **Instant Cloud Synchronization**:
  * Prescriptions created by the Caretaker write directly to `patients/{patientId}/medications` in Cloud Firestore and sync within milliseconds to the patient's phone.

---

### Pillar C: Dynamic Alarm & Escalation Pipeline (Zero Hardcoding)
```
[Patient Alarm Fires: 7:56 PM]
          │
          ▼
   15-Minute Grace Period
   (Patient takes or snoozes)
          │
    ┌─────┴────────────────┐
    ▼                      ▼
Taken                Not Taken (Timeout)
(Syncs Green)              │
                           ▼
             🚨 AUTOMATED ESCALATION ALERT
             - Notification sent to Caretaker's phone tray:
               "🚨 CARETAKER ALERT: Akki did not take Disprin scheduled at 7:56 PM. Action required!"
             - Full screen Escalation Modal appears on Caretaker app
             - Action buttons: "Direct Call", "WhatsApp Nudge", "Mark Taken Manually"
```

* **Strict Name & Pill Interpolation**:
  * No generic placeholders. The notification text strictly interpolates:
    * `${patient.name}` (e.g., `Akki`)
    * `${medication.name}` (e.g., `Disprin`)
    * `${medication.time}` (e.g., `7:56 PM`)
    * `${medication.dosage}` (e.g., `1 Tablet, after meal`)

---

### Pillar D: Doctor-Ready Adherence Auditing & Dynamic PDF Generation
* **Real-Time Adherence History Streaming**:
  * Adherence events (`Taken` or `Missed`) are written directly to `adherenceHistory` in Cloud Firestore and local storage `@adherence_history_${patientId}`.
  * Caretaker devices listen via `subscribeToPatientAdherence(patientId)`, automatically updating the dashboard and report screens in real time.
* **Dynamic Patient Isolation**:
  * Compliance rates and logs are strictly scoped: switching patients immediately re-computes stats and updates the 7-day adherence audit log.
* **7-Day Compliance Audit**:
  * Calculates exact adherence percentage:
    $$\text{Adherence Rate} = \left(\frac{\text{Taken Doses}}{\text{Total Scheduled Doses}}\right) \times 100\%$$
* **Patient-Specific Export**:
  * Generates branded PDF with:
    * Patient Contact (Patient's phone)
    * Emergency Contact (Caretaker's phone)
    * Prescriptions Table
    * Comprehensive Timestamped Log
    * Automatic multi-page pagination with clean headers and footers.

---

## 3. Data Flow & Security
* **User Authentication**: Strict email/password authentication via Firebase Auth and local isolation keys (`@patients_${caretakerId}`).
* **Scoped Permissions**: Caretakers only receive escalation alerts and prescription access for patients that explicitly shared their 6-character pairing code.
