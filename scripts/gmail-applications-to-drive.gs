/**
 * Graduate applications: Gmail + Sanity → Google Drive + Google Sheet
 * -------------------------------------------------------------------
 * Two sources, one sheet:
 *   - importApplications: older applications whose files are in Gmail.
 *   - syncFromSanity (+ setUpHourlySync): newer applications whose files
 *     are stored in Sanity. See the Sanity section below for setup.
 *
 * Paste this into Google Apps Script (script.google.com) while signed in as
 * the CAIRLab Gmail account, then click Run (function: importApplications).
 *
 * For every "Graduate application: …" email the website sent, it:
 *   - saves the CV and transcript into Drive (one subfolder per applicant)
 *   - adds a row to the "Graduate Applications" Google Sheet with the
 *     applicant's details, links to both files, and empty columns for
 *     reviewers (Score, Decision, Reviewer notes).
 *
 * It skips emails it has already done, so it's safe to run again. Google
 * stops scripts after ~6 minutes; if it says "Not finished", click Run
 * again until it says "All done".
 */

const FOLDER_NAME = 'Graduate Applications';
const SHEET_NAME = 'Graduate Applications (review)';
const SEARCH = 'subject:"Graduate application:" has:attachment';
const TIME_LIMIT_MS = 5 * 60 * 1000; // stop safely before Google's 6-minute limit

const HEADERS = [
  'Date applied', 'Full name', 'Email', 'Phone', 'Institution', 'Highest qualification',
  'Programme of study', 'Year graduated', 'Current status', 'Track', 'Why they want to join',
  'CV', 'Transcript', 'Score (1–5)', 'Decision', 'Reviewer notes', 'Applicant folder', 'Source ID',
];
const QUALIFICATIONS = ['Diploma', 'HND', "Bachelor's degree", "Master's degree", 'PhD', 'Other'];
const DECISIONS = ['Not reviewed', 'Shortlist', 'Maybe', 'Reject'];

function importApplications() {
  const started = Date.now();
  const folder = getOrCreateFolder_(DriveApp.getRootFolder(), FOLDER_NAME);
  const sheet = getOrCreateSheet_(folder);
  const done = alreadyImported_(sheet);

  let added = 0;
  let start = 0;
  let finished = true;

  outer: while (true) {
    const threads = GmailApp.search(SEARCH, start, 50);
    if (threads.length === 0) break;
    for (const thread of threads) {
      for (const msg of thread.getMessages()) {
        if (Date.now() - started > TIME_LIMIT_MS) { finished = false; break outer; }
        const id = msg.getId();
        if (done.has(id)) continue;
        if (!/^Graduate application:/i.test(msg.getSubject())) continue;
        const attachments = msg.getAttachments();
        if (attachments.length === 0) continue;

        const info = parseEmail_(msg);
        const applicantFolder = getOrCreateFolder_(folder, `${info.name || 'Unknown'} - ${info.email || id}`);
        let cvUrl = '';
        let transcriptUrl = '';
        for (const att of attachments) {
          const file = applicantFolder.createFile(att.copyBlob());
          const name = att.getName().toLowerCase();
          if (name.startsWith('cv')) cvUrl = file.getUrl();
          else if (name.startsWith('transcript')) transcriptUrl = file.getUrl();
          else if (!cvUrl) cvUrl = file.getUrl();
        }

        sheet.appendRow([
          msg.getDate(), info.name, info.email, info.phone, info.organisation, info.qualification,
          info.programme, info.year, info.status, info.track, info.motivation,
          cvUrl ? link_(cvUrl, 'Open CV') : '', transcriptUrl ? link_(transcriptUrl, 'Open transcript') : '',
          '', 'Not reviewed', info.parsed ? '' : 'Details could not be read automatically — check the email.',
          link_(applicantFolder.getUrl(), 'Folder'), id,
        ]);
        done.add(id);
        added++;
      }
    }
    start += threads.length;
  }

  const msg = finished
    ? `All done. Added ${added} application(s). Total in the sheet: ${sheet.getLastRow() - 1}.`
    : `Not finished yet: added ${added} this run. Click Run again to continue.`;
  Logger.log(msg);
  Logger.log('Sheet: ' + sheet.getParent().getUrl());
}

// ---------------- Sanity (applications made on the website since files are stored there) ----------------
//
// Setup once: Project Settings (⚙) → Script properties → add SANITY_TOKEN
// (a Viewer token from sanity.io/manage → project → API → Tokens).
// Then run syncFromSanity once, and setUpHourlySync once to keep it updated.
//
// Only applications that have their CV/transcript stored in Sanity are added
// here; older ones (files only in email) come in through importApplications,
// so nobody appears twice.

const SANITY_PROJECT_ID = 'ouyo1vwi';
const SANITY_DATASET = 'production';

function syncFromSanity() {
  const token = PropertiesService.getScriptProperties().getProperty('SANITY_TOKEN');
  if (!token) throw new Error('Add SANITY_TOKEN under Project Settings → Script properties first.');

  const started = Date.now();
  const folder = getOrCreateFolder_(DriveApp.getRootFolder(), FOLDER_NAME);
  const sheet = getOrCreateSheet_(folder);
  const done = alreadyImported_(sheet);

  const query = `*[_type == "aiProRegistration" && role == "graduate" && !(_id in path("drafts.**"))
    && (defined(cv) || defined(transcript))] | order(submittedAt asc){
      _id, fullName, email, phone, organisation, qualification, programmeOfStudy, completionYear,
      studyStatus, track, motivation, submittedAt, cvFileName, transcriptFileName,
      "cvUrl": cv.asset->url, "transcriptUrl": transcript.asset->url }`;
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2025-01-01/data/query/${SANITY_DATASET}?query=${encodeURIComponent(query)}`;
  const res = UrlFetchApp.fetch(url, { headers: { Authorization: `Bearer ${token}` }, muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) throw new Error('Sanity said: ' + res.getContentText().slice(0, 300));
  const apps = JSON.parse(res.getContentText()).result || [];

  let added = 0;
  let finished = true;
  for (const a of apps) {
    const sourceId = 'sanity:' + a._id;
    if (done.has(sourceId)) continue;
    if (Date.now() - started > TIME_LIMIT_MS) { finished = false; break; }

    const applicantFolder = getOrCreateFolder_(folder, `${a.fullName || 'Unknown'} - ${a.email || a._id}`);
    const save = (fileUrl, label, originalName) => {
      if (!fileUrl) return '';
      const ext = ((originalName || fileUrl).match(/\.[a-z0-9]+$/i) || [''])[0];
      const blob = UrlFetchApp.fetch(fileUrl).getBlob().setName(`${label} - ${a.fullName || 'applicant'}${ext}`);
      return applicantFolder.createFile(blob).getUrl();
    };
    const cvUrl = save(a.cvUrl, 'CV', a.cvFileName);
    const transcriptUrl = save(a.transcriptUrl, 'Transcript', a.transcriptFileName);

    sheet.appendRow([
      a.submittedAt ? new Date(a.submittedAt) : '', a.fullName || '', a.email || '', a.phone || '',
      a.organisation || '', a.qualification || '', a.programmeOfStudy || '', a.completionYear || '',
      a.studyStatus || '', a.track || '', a.motivation || '',
      cvUrl ? link_(cvUrl, 'Open CV') : '', transcriptUrl ? link_(transcriptUrl, 'Open transcript') : '',
      '', 'Not reviewed', '', link_(applicantFolder.getUrl(), 'Folder'), sourceId,
    ]);
    done.add(sourceId);
    added++;
  }

  Logger.log(finished
    ? `All done. Added ${added} new application(s) from Sanity.`
    : `Not finished yet: added ${added} this run. Click Run again to continue.`);
}

// Run once: checks Sanity for new applications every hour, automatically.
function setUpHourlySync() {
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === 'syncFromSanity')
    .forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('syncFromSanity').timeBased().everyHours(1).create();
  Logger.log('Done: syncFromSanity will now run every hour.');
}

// ---------------- helpers ----------------

function parseEmail_(msg) {
  const html = msg.getBody();
  const subjectName = (msg.getSubject().match(/^Graduate application:\s*(.*?)\s*\(/i) || [])[1] || '';
  const replyTo = (msg.getReplyTo() || '').replace(/.*<|>.*/g, '').trim();
  const info = {
    parsed: false, name: subjectName, email: replyTo, phone: '', organisation: '', qualification: '',
    programme: '', year: '', status: '', track: '', motivation: '',
  };

  // <strong>Name</strong> &lt;email&gt; · phone<br/> Qualification, Programme — Institution (Year)<br/> Status: X · Track: Y
  const block = html.match(/<strong>([^<]*)<\/strong>\s*&lt;([^&]*)&gt;\s*·\s*([^<]*)<br\s*\/?>\s*([^<]*)<br\s*\/?>\s*Status:\s*([^<]*?)\s*·\s*Track:\s*([^<]*)<\/p>/i);
  if (block) {
    info.name = decode_(block[1]) || info.name;
    info.email = decode_(block[2]) || info.email;
    info.phone = decode_(block[3]);
    info.status = decode_(block[5]);
    info.track = decode_(block[6]);
    let line = decode_(block[4]);
    const qual = QUALIFICATIONS.find((q) => line.startsWith(q + ','));
    if (qual) { info.qualification = qual; line = line.slice(qual.length + 1).trim(); }
    const m = line.match(/^(.*?) — (.*) \((\d{4})\)$/);
    if (m) { info.programme = m[1]; info.organisation = m[2]; info.year = m[3]; info.parsed = true; }
    else info.programme = line;
  }
  const why = html.match(/Why they want to join:<\/strong>\s*<br\s*\/?>([\s\S]*?)<\/p>/i);
  if (why) info.motivation = decode_(why[1].replace(/<br\s*\/?>/gi, '\n'));
  return info;
}

function decode_(s) {
  return String(s || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&amp;/g, '&')
    .trim();
}

function link_(url, label) {
  return `=HYPERLINK("${url}", "${label}")`;
}

function getOrCreateFolder_(parent, name) {
  const it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

function getOrCreateSheet_(folder) {
  const files = folder.getFilesByName(SHEET_NAME);
  if (files.hasNext()) return SpreadsheetApp.open(files.next()).getSheets()[0];

  const ss = SpreadsheetApp.create(SHEET_NAME);
  DriveApp.getFileById(ss.getId()).moveTo(folder);
  const sheet = ss.getSheets()[0];
  sheet.setName('Applications');
  sheet.appendRow(HEADERS);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#DBEAFE');
  sheet.hideColumns(HEADERS.length); // Email ID: only used to skip repeats
  const decision = HEADERS.indexOf('Decision') + 1;
  sheet.getRange(2, decision, 2000, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(DECISIONS, true).build()
  );
  const score = HEADERS.indexOf('Score (1–5)') + 1;
  sheet.getRange(2, score, 2000, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireNumberBetween(1, 5).setAllowInvalid(false).build()
  );
  sheet.getRange(1, 1, sheet.getMaxRows(), HEADERS.length).createFilter();
  return sheet;
}

function alreadyImported_(sheet) {
  const last = sheet.getLastRow();
  if (last < 2) return new Set();
  const ids = sheet.getRange(2, HEADERS.length, last - 1, 1).getValues().map((r) => String(r[0]));
  return new Set(ids);
}
