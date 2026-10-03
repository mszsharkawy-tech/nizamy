const SHEET_NAME = 'NizamyData';

function doGet() {
  return json({ok:true, message:'Nizamy API is running'});
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    if (body.action === 'save') {
      saveState(body.payload || {});
      return json({ok:true, savedAt:new Date().toISOString()});
    }
    if (body.action === 'load') {
      return json({ok:true, payload:loadState()});
    }
    return json({ok:false, error:'Unknown action'});
  } catch (err) {
    return json({ok:false, error:String(err)});
  }
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.getRange('A1:B1').setValues([['Key','JSON']]);
  }
  return sh;
}

function saveState(payload) {
  const sh = getSheet();
  const jsonText = JSON.stringify(payload);
  const finder = sh.createTextFinder('STATE').matchEntireCell(true).findNext();
  if (finder) {
    sh.getRange(finder.getRow(), 2).setValue(jsonText);
  } else {
    sh.appendRow(['STATE', jsonText]);
  }
  sh.getRange('D1:E6').setValues([
    ['Metric','Value'],
    ['Last Sync', new Date()],
    ['Habits', (payload.habits || []).length],
    ['Tasks', (payload.tasks || []).length],
    ['Goals', (payload.goals || []).length],
    ['Sleep Entries', Object.keys(payload.sleep || {}).length]
  ]);
}

function loadState() {
  const sh = getSheet();
  const finder = sh.createTextFinder('STATE').matchEntireCell(true).findNext();
  if (!finder) return null;
  const raw = sh.getRange(finder.getRow(), 2).getValue();
  return raw ? JSON.parse(raw) : null;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
