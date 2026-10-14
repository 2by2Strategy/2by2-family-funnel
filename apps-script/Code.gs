/**
 * 2by2 Family Sign-ups – Google Apps Script web app.
 * Paste into the sheet's Extensions > Apps Script editor, then Deploy > New deployment > Web app
 * (Execute as: Me, Who has access: Anyone). The website sends sign-ups here and reads the map counts.
 * Only per-state counts are ever returned publicly; names, emails, phones and schools stay in the sheet.
 */
var STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

function sheet_() { return SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]; }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function clean_(v, max) { v = (v == null ? '' : String(v)).trim().slice(0, max || 200); return /^[=+\-@]/.test(v) ? "'" + v : v; }

function doPost(e) {
  var d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'bad json' }); }
  if (d.website) return json_({ ok: true }); // honeypot field: bots fill it, people don't
  var name = clean_(d.name, 120), email = clean_(d.email, 160);
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json_({ ok: false, error: 'missing fields' });
  var state = String(d.state || '').toUpperCase();
  if (STATES.indexOf(state) < 0) state = '';
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    sheet_().appendRow([new Date(), name, email, clean_(d.phone, 40), clean_(d.school, 200), clean_(d.zip, 10), state, d.newsletter ? 'Yes' : 'No', clean_(d.source || 'website', 60)]);
  } finally { lock.releaseLock(); }
  CacheService.getScriptCache().remove('counts');
  return json_({ ok: true });
}

function doGet() {
  var cache = CacheService.getScriptCache(), hit = cache.get('counts');
  if (hit) return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON);
  var rows = sheet_().getDataRange().getValues().slice(1), states = {}, total = 0;
  rows.forEach(function (r) {
    if (r[7] !== 'Yes') return;           // only families who chose to be counted on the map
    var s = String(r[6] || '');
    if (STATES.indexOf(s) < 0) return;
    states[s] = (states[s] || 0) + 1; total++;
  });
  var out = JSON.stringify({ total: total, states: states });
  cache.put('counts', out, 60);
  return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
}
