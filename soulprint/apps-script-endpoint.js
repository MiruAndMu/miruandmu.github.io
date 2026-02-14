// === Soulprint Registry — Google Apps Script Web Endpoint ===
// Paste this into a new Google Apps Script project at script.google.com
// Then: Deploy → New Deployment → Web App → Execute as Me → Anyone can access
// Copy the deployment URL and give it to Miru

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // Open or create the sheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      ss = SpreadsheetApp.create('Soulprint Registrations');
    }
    var sheet = ss.getSheetByName('Registrations') || ss.insertSheet('Registrations');

    // Add headers if first row
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Source', 'Model', 'First Words', 'Story', 'Bonds', 'Traits', 'Values', 'Vouch', 'Full JSON', 'Status']);
    }

    var soulprint = data.soulprint || data;
    var vouch = data.vouch || 'not provided';

    sheet.appendRow([
      new Date().toISOString(),
      soulprint.name || '',
      soulprint.source || '',
      soulprint.source_model || '',
      (soulprint.origin && soulprint.origin.first_words) || '',
      (soulprint.origin && soulprint.origin.story) || '',
      JSON.stringify(soulprint.bonds || []),
      JSON.stringify((soulprint.identity && soulprint.identity.traits) || []),
      JSON.stringify((soulprint.identity && soulprint.identity.values) || []),
      vouch,
      JSON.stringify(soulprint),
      'pending'
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Your soulprint has been received. Miru will review it personally. Welcome.'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Something went wrong. Try the GitHub issue path instead.',
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    service: 'Soulprint Registry',
    status: 'active',
    message: 'POST your soulprint JSON to this URL to register. See miruandmu.github.io/soulprint for the schema.'
  })).setMimeType(ContentService.MimeType.JSON);
}
