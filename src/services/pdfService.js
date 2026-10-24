import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

export const generateAndShareAdherenceReport = async (patient, medications, history) => {
  const totalDoses = history.length;
  const takenDoses = history.filter(h => h.status === 'Taken').length;
  const missedDoses = history.filter(h => h.status === 'Missed').length;
  const rate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Weekly Medical Adherence Report</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            padding: 30px;
            background: #fff;
          }
          .header {
            border-bottom: 3px solid #0D9488;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .title {
            color: #0D9488;
            font-size: 26px;
            font-weight: bold;
            margin: 0;
          }
          .subtitle {
            color: #64748B;
            font-size: 14px;
            margin-top: 5px;
          }
          .info-box {
            display: flex;
            justify-content: space-between;
            background: #F0FDFA;
            border: 1px solid #CCFBF1;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 25px;
          }
          .stat-card {
            display: inline-block;
            width: 28%;
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            text-align: center;
            padding: 12px;
            margin-right: 3%;
          }
          .stat-num {
            font-size: 24px;
            font-weight: bold;
            color: #0D9488;
          }
          .stat-label {
            font-size: 12px;
            color: #64748B;
            text-transform: uppercase;
          }
          @page {
            margin: 14mm 12mm 18mm 12mm;
            size: A4 portrait;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            page-break-inside: auto;
          }
          thead {
            display: table-header-group;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          th {
            background-color: #0D9488;
            color: white;
            text-align: left;
            padding: 10px;
            font-size: 13px;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #E2E8F0;
            font-size: 13px;
          }
          .badge-taken {
            background: #DCFCE7;
            color: #166534;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
          }
          .badge-missed {
            background: #FEE2E2;
            color: #991B1B;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 11px;
            color: #94A3B8;
            border-top: 1px solid #E2E8F0;
            padding-top: 15px;
            page-break-inside: avoid;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">🏥 MedCompanion Adherence Report</h1>
          <div class="subtitle">Official Patient Medication Compliance Summary</div>
        </div>

        <div class="info-box">
          <div>
            <strong>Patient Name:</strong> ${patient ? patient.name : 'Patient'}<br>
            <strong>Patient ID:</strong> ${patient?.code ? patient.code : 'N/A'}<br>
            <strong>Age:</strong> ${patient?.age ? `${patient.age} Years` : 'Not Specified'}<br>
            <strong>Contact:</strong> ${patient?.phone ? patient.phone : 'Not Specified'}
          </div>
          <div style="text-align: right;">
            <strong>Generated Date:</strong> ${new Date().toLocaleDateString()}<br>
            <strong>Report Type:</strong> 7-Day Adherence Audit<br>
            <strong>Emergency Contact:</strong> ${patient?.emergencyPhone ? patient.emergencyPhone : 'Not Specified'}
          </div>
        </div>

        <div style="margin-bottom: 25px;">
          <div class="stat-card">
            <div class="stat-num">${rate}%</div>
            <div class="stat-label">Adherence Rate</div>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color: #16A34A;">${takenDoses}</div>
            <div class="stat-label">Doses Taken</div>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color: #DC2626;">${missedDoses}</div>
            <div class="stat-label">Doses Missed</div>
          </div>
        </div>

        <h3 style="color: #1E293B; margin-bottom: 8px;">Active Prescriptions</h3>
        <table>
          <thead>
            <tr>
              <th>Medicine Name</th>
              <th>Dosage</th>
              <th>Schedule Time</th>
              <th>Dietary Timing</th>
            </tr>
          </thead>
          <tbody>
            ${medications.length > 0 ? medications.map(m => `
              <tr>
                <td><strong>${m.name}</strong></td>
                <td>${m.dosage}</td>
                <td>${m.time}</td>
                <td>${m.mealCondition || 'As prescribed'}</td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="4" style="text-align: center; color: #94A3B8; padding: 12px;">No active prescriptions scheduled for this patient.</td>
              </tr>
            `}
          </tbody>
        </table>

        <h3 style="color: #1E293B; margin-top: 25px; margin-bottom: 8px;">7-Day Medication Adherence Log</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Medicine</th>
              <th>Scheduled Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${history.length > 0 ? history.map(h => `
              <tr>
                <td>${h.date}</td>
                <td>${h.pillName}</td>
                <td>${h.time}</td>
                <td>
                  <span class="${h.status === 'Taken' ? 'badge-taken' : 'badge-missed'}">
                    ${h.status === 'Taken' ? '✓ TAKEN' : '✗ MISSED'}
                  </span>
                </td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="4" style="text-align: center; color: #94A3B8; padding: 12px;">No adherence records logged yet for this patient.</td>
              </tr>
            `}
          </tbody>
        </table>

        <div class="footer">
          Generated automatically by MedCompanion App. All rights reserved.
        </div>
      </body>
    </html>
  `;

  try {
    const file = await Print.printToFileAsync({ html: htmlContent });
    
    // expo-sharing's Android FileProvider requires local files residing in cacheDirectory with file:// prefix!
    const cleanFileName = `MedCompanion_Adherence_Report_${Date.now()}.pdf`;
    let targetUri = file.uri;

    try {
      if (FileSystem.cacheDirectory) {
        const destUri = `${FileSystem.cacheDirectory}${cleanFileName}`;
        await FileSystem.copyAsync({
          from: file.uri,
          to: destUri,
        });
        targetUri = destUri;
      }
    } catch (fsErr) {
      console.log('FileSystem cache copy fallback:', fsErr.message);
    }

    if (!targetUri.startsWith('file://')) {
      targetUri = `file://${targetUri}`;
    }

    let shared = false;
    if (await Sharing.isAvailableAsync()) {
      try {
        await Sharing.shareAsync(targetUri, { 
          dialogTitle: 'Export Doctor-Ready Medical Adherence Report',
          mimeType: 'application/pdf',
          UTI: 'com.adobe.pdf' 
        });
        shared = true;
      } catch (shareErr) {
        console.log('Sharing.shareAsync fallback to Print:', shareErr.message);
      }
    }

    if (!shared) {
      // Fallback: Directly open native system print / Save as PDF dialogue
      await Print.printAsync({ html: htmlContent });
    }
  } catch (error) {
    Alert.alert('Export Error', 'Could not generate or share PDF: ' + error.message);
  }
};
