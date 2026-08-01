/****************************************************
 * 5041 R.O.A.R Report Google Sheets Backend
 * Static front end + Google Apps Script backend
 *
 * Required Script Properties:
 * SPREADSHEET_ID = your Google Sheet ID
 * ADMIN_PIN = your admin PIN
 * NOTIFICATION_EMAIL = email address to notify
 *
 * Optional Script Property:
 * APP_TOKEN = 5041-roar-report-token
 ****************************************************/

const SHEET_NAME = "ROAR Reports";

const HEADERS = [
  "Timestamp",
  "Reporting Student(s)",
  "Mentor/Student Reporter",
  "Date",
  "Time",
  "Bullying",
  "Harassment",
  "Harassment - Verbal",
  "Harassment - Physical",
  "Harassment - Digital",
  "Sexual Harassment",
  "Misconduct",
  "Retaliation",
  "Other",
  "Other Report Type",
  "Individual(s) Involved",
  "Incident Date(s)",
  "Description of Incident(s)"
];

/****************************************************
 * POST handler: saves a form submission.
 ****************************************************/
function doPost(e) {
  try {
    const rawData = getRequestData(e);
    const data = normalizeReportData(rawData);

    validateToken(data.token);

    const sheet = getReportSheet();
    const row = buildReportRow(data);

    sheet.appendRow(row);
    const rowNumber = sheet.getLastRow();

    let emailSentTo = "";
    let emailError = "";

    try {
      emailSentTo = emailReportNotification(data, rowNumber);
    } catch (error) {
      emailError = error.message || String(error);
      console.error("Email notification failed:", error);
    }

    return jsonResponse({
      ok: true,
      message: "Report submitted.",
      row: rowNumber,
      emailSentTo,
      emailError
    }, rawData.callback);
  } catch (error) {
    console.error("doPost error:", error);

    return jsonResponse({
      ok: false,
      error: error.message || "Unknown server error."
    }, e && e.parameter ? e.parameter.callback : "");
  }
}

/****************************************************
 * GET handler: supports test + admin list requests.
 * Supports JSONP using ?callback=... for static pages.
 ****************************************************/
function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const callback = params.callback || "";

  try {
    const action = params.action || "reports";

    if (action === "test") {
      return jsonResponse({
        ok: true,
        message: "R.O.A.R Apps Script is running.",
        remainingEmailQuota: MailApp.getRemainingDailyQuota()
      }, callback);
    }

    validateToken(params.token);

    // report.js sends action=list and adminPin.
    // Older versions may send action=reports and pin.
    if (action === "list" || action === "reports") {
      const enteredPin = params.adminPin || params.pin || "";
      const adminPin = getScriptProperty("ADMIN_PIN");

      if (!adminPin || enteredPin !== adminPin) {
        return jsonResponse({ ok: false, error: "Unauthorized." }, callback);
      }

      return jsonResponse({
        ok: true,
        startDate: params.startDate || "",
        endDate: params.endDate || "",
        reports: getReportsForAdmin(params.startDate, params.endDate)
      }, callback);
    }

    return jsonResponse({ ok: false, error: "Unknown action." }, callback);
  } catch (error) {
    console.error("doGet error:", error);

    return jsonResponse({
      ok: false,
      error: error.message || "Unknown server error."
    }, callback);
  }
}

/****************************************************
 * Normalizes field names.
 * The web form sends camelCase names.
 * Earlier backend versions expected snake_case names.
 * This accepts both so data reaches Sheets and email.
 ****************************************************/
function normalizeReportData(data) {
  data = data || {};

  return {
    token: pick(data, "token", "APP_TOKEN"),
    callback: pick(data, "callback"),
    createdAt: pick(data, "createdAt", "created_at"),
    reportingStudents: pick(data, "reportingStudents", "reporting_students"),
    reporter: pick(data, "reporter"),
    reportDate: pick(data, "reportDate", "report_date"),
    reportTime: pick(data, "reportTime", "report_time"),
    reportTypeBullying: pick(data, "reportTypeBullying", "report_type_bullying"),
    reportTypeHarassment: pick(data, "reportTypeHarassment", "report_type_harassment"),
    harassmentVerbal: pick(data, "harassmentVerbal", "harassment_verbal"),
    harassmentPhysical: pick(data, "harassmentPhysical", "harassment_physical"),
    harassmentDigital: pick(data, "harassmentDigital", "harassment_digital"),
    reportTypeSexualHarassment: pick(data, "reportTypeSexualHarassment", "report_type_sexual_harassment"),
    reportTypeMisconduct: pick(data, "reportTypeMisconduct", "report_type_misconduct"),
    reportTypeRetaliation: pick(data, "reportTypeRetaliation", "report_type_retaliation"),
    reportTypeOther: pick(data, "reportTypeOther", "report_type_other"),
    otherReportType: pick(data, "otherReportType", "other_report_type"),
    individualsInvolved: pick(data, "individualsInvolved", "individuals_involved"),
    incidentDates: pick(data, "incidentDates", "incident_dates"),
    incidentDescription: pick(data, "incidentDescription", "incident_description")
  };
}

function pick(obj) {
  for (let i = 1; i < arguments.length; i++) {
    const key = arguments[i];
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return obj[key];
    }
  }
  return "";
}

/****************************************************
 * Optional token validation.
 ****************************************************/
function validateToken(token) {
  const expectedToken = getScriptProperty("APP_TOKEN");

  // If APP_TOKEN is not set in Script Properties, token checking is skipped.
  if (!expectedToken) return;

  if (String(token || "") !== expectedToken) {
    throw new Error("Invalid app token.");
  }
}

/****************************************************
 * Reads request data from JSON, form body, or URL params.
 ****************************************************/
function getRequestData(e) {
  if (!e) return {};

  if (e.postData && e.postData.contents) {
    const contents = e.postData.contents;
    const type = e.postData.type || "";

    if (type.indexOf("application/json") !== -1 || contents.trim().startsWith("{")) {
      return JSON.parse(contents);
    }

    return parseFormEncoded(contents);
  }

  return e.parameter || {};
}

function parseFormEncoded(contents) {
  const data = {};

  contents.split("&").forEach((pair) => {
    if (!pair) return;

    const parts = pair.split("=");
    const key = decodeURIComponent((parts[0] || "").replace(/\+/g, " "));
    const value = decodeURIComponent((parts.slice(1).join("=") || "").replace(/\+/g, " "));

    data[key] = value;
  });

  return data;
}

/****************************************************
 * Spreadsheet write helpers.
 ****************************************************/
function buildReportRow(data) {
  return [
    data.createdAt ? new Date(data.createdAt) : new Date(),
    cleanText(data.reportingStudents),
    cleanText(data.reporter),
    cleanText(data.reportDate),
    cleanText(data.reportTime),
    boolLabel(data.reportTypeBullying),
    boolLabel(data.reportTypeHarassment),
    boolLabel(data.harassmentVerbal),
    boolLabel(data.harassmentPhysical),
    boolLabel(data.harassmentDigital),
    boolLabel(data.reportTypeSexualHarassment),
    boolLabel(data.reportTypeMisconduct),
    boolLabel(data.reportTypeRetaliation),
    boolLabel(data.reportTypeOther),
    cleanText(data.otherReportType),
    cleanText(data.individualsInvolved),
    cleanText(data.incidentDates),
    cleanText(data.incidentDescription)
  ];
}

function getReportSheet() {
  const spreadsheet = getSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  ensureHeaders(sheet);
  return sheet;
}

function getSpreadsheet() {
  const spreadsheetId = getScriptProperty("SPREADSHEET_ID");

  if (!spreadsheetId) {
    throw new Error("Missing SPREADSHEET_ID in Script Properties.");
  }

  return SpreadsheetApp.openById(spreadsheetId);
}

function ensureHeaders(sheet) {
  const lastColumn = Math.max(sheet.getLastColumn(), HEADERS.length);
  const firstRow = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  const hasHeaders = firstRow.some((cell) => String(cell || "").trim() !== "");

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    return;
  }

  const existingHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const needsUpdate = HEADERS.some((header, index) => String(existingHeaders[index] || "").trim() !== header);

  if (needsUpdate) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
}

/****************************************************
 * Admin report list formatted for report.js.
 ****************************************************/
function getReportsForAdmin(startDate, endDate) {
  const sheet = getReportSheet();
  const values = sheet.getDataRange().getValues();

  if (values.length <= 1) return [];

  const reports = values.slice(1).map((row, index) => {
    const report = rowToAdminReport(row, index + 2);
    return report;
  });

  return reports
    .filter((report) => isWithinDateRange(report.reportDate, startDate, endDate))
    .reverse();
}

function rowToAdminReport(row, rowNumber) {
  const reportTypes = [];
  const harassmentTypes = [];

  if (isChecked(row[5])) reportTypes.push("Bullying");
  if (isChecked(row[6])) reportTypes.push("Harassment");
  if (isChecked(row[10])) reportTypes.push("Sexual Harassment");
  if (isChecked(row[11])) reportTypes.push("Misconduct");
  if (isChecked(row[12])) reportTypes.push("Retaliation");
  if (isChecked(row[13])) reportTypes.push("Other");

  if (isChecked(row[7])) harassmentTypes.push("Verbal");
  if (isChecked(row[8])) harassmentTypes.push("Physical");
  if (isChecked(row[9])) harassmentTypes.push("Digital");

  return {
    id: rowNumber,
    rowNumber,
    createdAt: formatCellDateTime(row[0]),
    reportingStudents: cleanText(row[1]),
    reporter: cleanText(row[2]),
    reportDate: formatCellDateOnly(row[3]),
    reportTime: cleanText(row[4]),
    reportTypes: reportTypes.join(", ") || "Uncategorized",
    harassmentTypes: harassmentTypes.join(", "),
    otherReportType: cleanText(row[14]),
    individualsInvolved: cleanText(row[15]),
    incidentDates: cleanText(row[16]),
    incidentDescription: cleanText(row[17])
  };
}

function isWithinDateRange(reportDate, startDate, endDate) {
  if (!reportDate) return true;

  const date = new Date(reportDate + "T00:00:00");

  if (startDate) {
    const start = new Date(startDate + "T00:00:00");
    if (date < start) return false;
  }

  if (endDate) {
    const end = new Date(endDate + "T23:59:59");
    if (date > end) return false;
  }

  return true;
}

/****************************************************
 * Email notification.
 ****************************************************/
function emailReportNotification(reportData, rowNumber) {
  const spreadsheet = getSpreadsheet();
  const spreadsheetId = getScriptProperty("SPREADSHEET_ID");

  let notificationEmail = getScriptProperty("NOTIFICATION_EMAIL");

  if (!notificationEmail) {
    try {
      notificationEmail = DriveApp.getFileById(spreadsheetId).getOwner().getEmail();
    } catch (error) {
      console.error("Could not determine sheet owner:", error);
    }
  }

  if (!notificationEmail) {
    throw new Error("No notification email found. Set NOTIFICATION_EMAIL in Script Properties.");
  }

  if (MailApp.getRemainingDailyQuota() <= 0) {
    throw new Error("MailApp daily email quota has been reached.");
  }

  const reportTypes = formatReportTypes(reportData);
  const submittedAt = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd h:mm a");

  const subject = `New R.O.A.R Report Submitted - Row ${rowNumber}`;

  const body = `
A new R.O.A.R Report has been submitted.

Report Row:
${rowNumber}

Submitted At:
${submittedAt}

Google Sheet:
${spreadsheet.getUrl()}

Mentor/Student Reporter:
${cleanText(reportData.reporter)}

Reporting Student(s):
${cleanText(reportData.reportingStudents)}

Date:
${cleanText(reportData.reportDate)}

Time:
${cleanText(reportData.reportTime)}

Report Type:
${reportTypes}

Individual(s) Involved:
${cleanText(reportData.individualsInvolved)}

Incident Date(s):
${cleanText(reportData.incidentDates)}

Description of Incident(s):
${cleanText(reportData.incidentDescription)}
`;

  MailApp.sendEmail({
    to: notificationEmail,
    subject,
    body
  });

  return notificationEmail;
}

function formatReportTypes(reportData) {
  const types = [];

  if (isChecked(reportData.reportTypeBullying)) types.push("Bullying");

  if (isChecked(reportData.reportTypeHarassment)) {
    const harassmentTypes = [];

    if (isChecked(reportData.harassmentVerbal)) harassmentTypes.push("Verbal");
    if (isChecked(reportData.harassmentPhysical)) harassmentTypes.push("Physical");
    if (isChecked(reportData.harassmentDigital)) harassmentTypes.push("Digital");

    types.push(harassmentTypes.length ? `Harassment (${harassmentTypes.join(", ")})` : "Harassment");
  }

  if (isChecked(reportData.reportTypeSexualHarassment)) types.push("Sexual Harassment");
  if (isChecked(reportData.reportTypeMisconduct)) types.push("Misconduct");
  if (isChecked(reportData.reportTypeRetaliation)) types.push("Retaliation");

  if (isChecked(reportData.reportTypeOther)) {
    const otherText = cleanText(reportData.otherReportType);
    types.push(otherText ? `Other: ${otherText}` : "Other");
  }

  return types.length ? types.join(", ") : "None selected";
}

/****************************************************
 * Manual tests. Run these inside Apps Script.
 ****************************************************/
function testRoarEmail() {
  const testData = normalizeReportData({
    reportingStudents: "Test Student",
    reporter: "Test Reporter",
    reportDate: "2026-07-31",
    reportTime: "10:00",
    reportTypeBullying: "true",
    individualsInvolved: "Test Person",
    incidentDates: "Test Date",
    incidentDescription: "This is a test email from the R.O.A.R report script."
  });

  const sentTo = emailReportNotification(testData, "TEST");
  Logger.log(`Test email sent to ${sentTo}`);
}

function testRoarSubmission() {
  const testData = normalizeReportData({
    token: getScriptProperty("APP_TOKEN") || "",
    reportingStudents: "Test Student",
    reporter: "Test Reporter",
    reportDate: "2026-07-31",
    reportTime: "10:00",
    reportTypeBullying: "true",
    reportTypeHarassment: "true",
    harassmentVerbal: "true",
    individualsInvolved: "Test Person",
    incidentDates: "Test Date",
    incidentDescription: "This is a test submission row from the R.O.A.R report script."
  });

  const sheet = getReportSheet();
  sheet.appendRow(buildReportRow(testData));

  const rowNumber = sheet.getLastRow();
  const sentTo = emailReportNotification(testData, rowNumber);

  Logger.log(`Test report saved on row ${rowNumber}. Email sent to ${sentTo}.`);
}

/****************************************************
 * Utilities.
 ****************************************************/
function cleanText(value) {
  return String(value || "").trim();
}

function isChecked(value) {
  if (value === true) return true;

  const text = String(value || "").toLowerCase().trim();

  return text === "true" || text === "on" || text === "yes" || text === "1" || text === "checked";
}

function boolLabel(value) {
  return isChecked(value) ? "Yes" : "";
}

function getScriptProperty(name) {
  return PropertiesService.getScriptProperties().getProperty(name);
}

function formatCellDateOnly(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return cleanText(value);
}

function formatCellDateTime(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd h:mm a");
  }
  return cleanText(value);
}

function jsonResponse(data, callback) {
  const json = JSON.stringify(data);

  if (callback) {
    return ContentService
      .createTextOutput(`${callback}(${json});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}
