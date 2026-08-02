const config = window.ROAR_APP_CONFIG || {};
const SCRIPT_URL = config.SCRIPT_URL;
const APP_TOKEN = config.APP_TOKEN || "";

const reportForm = document.querySelector("#reportForm");
const reportMessage = document.querySelector("#reportMessage");
const refreshReportBtn = document.querySelector("#refreshReportBtn");
const adminPinEl = document.querySelector("#adminPin");
const startDateEl = document.querySelector("#startDate");
const endDateEl = document.querySelector("#endDate");
const selectedRangeLabel = document.querySelector("#selectedRangeLabel");
const totalReportsEl = document.querySelector("#totalReports");
const bullyingCountEl = document.querySelector("#bullyingCount");
const harassmentCountEl = document.querySelector("#harassmentCount");
const otherCountEl = document.querySelector("#otherCount");
const reportsList = document.querySelector("#reportsList");

function setReportMessage(text, type = "") {
  reportMessage.textContent = text;
  reportMessage.className = `message ${type}`.trim();
}

function ensureConfigured() {
  if (!SCRIPT_URL || SCRIPT_URL.includes("PASTE_YOUR")) {
    setReportMessage("Add your Google Apps Script web app URL to config.js first.", "error");
    return false;
  }
  return true;
}

function loadJsonp(url) {
  return new Promise((resolve, reject) => {
    const callbackName = `roarReportsCallback_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const script = document.createElement("script");
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("The request timed out."));
    }, 10000);

    function cleanup() {
      clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("Could not load reports from the spreadsheet."));
    };

    const separator = url.includes("?") ? "&" : "?";
    script.src = `${url}${separator}callback=${encodeURIComponent(callbackName)}`;
    document.body.appendChild(script);
  });
}

function toDateInputValue(date) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offsetDate = new Date(copy.getTime() - copy.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
}

function setDefaultDates() {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 90);
  startDateEl.value = toDateInputValue(start);
  endDateEl.value = toDateInputValue(today);
}

async function loadReports() {
  if (!ensureConfigured()) return;

  const adminPin = adminPinEl.value.trim();
  if (!adminPin) {
    setReportMessage("Enter the admin PIN.", "error");
    return;
  }

  const params = new URLSearchParams({
    action: "list",
    token: APP_TOKEN,
    adminPin,
    startDate: startDateEl.value,
    endDate: endDateEl.value
  });

  try {
    setReportMessage("Loading reports...", "");
    reportsList.innerHTML = `<p class="empty">Loading...</p>`;

    const data = await loadJsonp(`${SCRIPT_URL}?${params.toString()}`);

    if (!data.ok) {
      throw new Error(data.error || "Unknown error");
    }

    renderReports(data);
    setReportMessage("Reports loaded.", "success");
  } catch (error) {
    setReportMessage(error.message, "error");
    reportsList.innerHTML = `<p class="empty">${escapeHtml(error.message)}</p>`;
  }
}

function renderReports(data) {
  const reports = data.reports || [];
  selectedRangeLabel.textContent = `${formatDisplayDate(data.startDate)} – ${formatDisplayDate(data.endDate)}`;
  totalReportsEl.textContent = reports.length;
  bullyingCountEl.textContent = reports.filter((report) => report.reportTypes.includes("Bullying")).length;
  harassmentCountEl.textContent = reports.filter((report) => report.reportTypes.includes("Harassment")).length;
  otherCountEl.textContent = reports.filter((report) => {
    return report.reportTypes.includes("Sexual Harassment") ||
      report.reportTypes.includes("Misconduct") ||
      report.reportTypes.includes("Retaliation") ||
      report.reportTypes.includes("Other");
  }).length;

  if (!reports.length) {
    reportsList.innerHTML = `<p class="empty">No reports found for this date range.</p>`;
    return;
  }

  reportsList.innerHTML = reports.map((report) => `
    <article class="report-card">
      <header>
        <div>
          <p class="eyebrow small-eyebrow">Report #${escapeHtml(report.id)}</p>
          <h2>${escapeHtml(report.reportDate || "No date")} ${escapeHtml(report.reportTime || "")}</h2>
        </div>
        <span class="report-pill">${escapeHtml(report.reportTypes || "Uncategorized")}</span>
      </header>

      <dl>
        <dt>Created</dt>
        <dd>${escapeHtml(report.createdAt)}</dd>

        <dt>Reporter</dt>
        <dd>${escapeHtml(report.reporter)}</dd>

        <dt>Reporting Student(s)</dt>
        <dd>${escapeHtml(report.reportingStudents)}</dd>

        <dt>Harassment Type</dt>
        <dd>${escapeHtml(report.harassmentTypes || "—")}</dd>

        <dt>Individual(s) Involved</dt>
        <dd>${escapeHtml(report.individualsInvolved)}</dd>

        <dt>Incident Date(s)</dt>
        <dd>${escapeHtml(report.incidentDates)}</dd>

        <dt>Description</dt>
        <dd>${escapeHtml(report.incidentDescription)}</dd>
      </dl>
    </article>
  `).join("");
}

function formatDisplayDate(value) {
  if (!value) return "";
  const parts = String(value).split("-");
  if (parts.length !== 3) return value;
  return `${parts[1]}/${parts[2]}/${parts[0]}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

reportForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loadReports();
});

refreshReportBtn.addEventListener("click", loadReports);

setDefaultDates();
