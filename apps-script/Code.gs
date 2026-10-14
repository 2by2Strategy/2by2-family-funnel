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
  if (d.type === 'quiz') return quiz_(d);
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

/* ---------- Matchmaking questionnaire (tab "Matchmaking Quiz") ---------- */
var QUIZ_HEAD = ['First seen','Last update','Status','Clicked "Choose a time"','Role','First name','Last name','Email','Phone','Parent name','Parent email',
  'Readiness (1-10)','Biggest concerns','Grade','GPA','Colleges','What they want in a counselor','Consent',
  'utm_source','utm_medium','utm_campaign','utm_content','fbclid','gclid','Page','Session'];
function quizSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName('Matchmaking Quiz');
  if (!sh) { sh = ss.insertSheet('Matchmaking Quiz'); sh.appendRow(QUIZ_HEAD); sh.setFrozenRows(1); sh.getRange(1, 1, 1, QUIZ_HEAD.length).setFontWeight('bold'); }
  return sh;
}
function list_(v) { return Array.isArray(v) ? v.join(', ') : (v == null ? '' : v); }
function quiz_(d) {
  var a = d.answers || {}, u = d.utm || {}, sid = clean_(d.sid, 60);
  if (!sid) return json_({ ok: false, error: 'no session' });
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var sh = quizSheet_(), last = sh.getLastRow(), row = 0;
    if (last > 1) {
      var ids = sh.getRange(2, QUIZ_HEAD.length, last - 1, 1).getValues();
      for (var i = ids.length - 1; i >= 0; i--) { if (ids[i][0] === sid) { row = i + 2; break; } }
    }
    var prev = row ? sh.getRange(row, 1, 1, QUIZ_HEAD.length).getValues()[0] : null;
    var status = { partial: 'Started (left email)', complete: 'Completed', book: 'Completed' }[d.stage] || 'Started';
    if (prev && prev[2] === 'Completed' && d.stage === 'partial') status = 'Completed';
    var values = [prev ? prev[0] : new Date(), new Date(), status, d.stage === 'book' ? 'Yes' : (prev ? prev[3] : 'No'),
      clean_(a.role), clean_(a.firstName, 80), clean_(a.lastName, 80), clean_(a.email, 160), clean_((a.cc || '') + ' ' + (a.phone || ''), 40),
      clean_(a.parentName, 120), clean_(a.parentEmail, 160), clean_(a.ready, 5), clean_(list_(a.concern), 300), clean_(a.grade, 20),
      clean_(a.gpa, 20), clean_(list_(a.colleges), 300), clean_(a.describe, 2000), a.consent ? 'Yes' : (prev ? prev[17] : 'No'),
      clean_(u.utm_source, 100), clean_(u.utm_medium, 100), clean_(u.utm_campaign, 150), clean_(u.utm_content, 150), clean_(u.fbclid, 200), clean_(u.gclid, 200),
      clean_(d.page, 300), sid];
    if (row) sh.getRange(row, 1, 1, values.length).setValues([values]); else sh.appendRow(values);
  } finally { lock.releaseLock(); }
  return json_({ ok: true });
}
