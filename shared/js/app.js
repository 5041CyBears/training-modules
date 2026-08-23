/* ============================================================================
   STUDENT DEVELOPER GUIDE — 5041 TRAINING HUB JAVASCRIPT

   This file controls behavior and interactivity. HTML creates the elements and CSS
   styles them; JavaScript finds those elements and changes them in response to the
   user.

   IMPORTANT IDEAS FOR STUDENTS
   - document.querySelector(...) finds the first matching HTML element.
   - document.querySelectorAll(...) finds all matching elements.
   - element.closest(...) searches upward for a parent element. This is useful for
     keeping an interaction limited to the current Reveal.js slide.
   - element.dataset.name reads data-name="..." from HTML.
   - classList.add/remove/toggle changes CSS classes so the appearance can respond
     to clicks, correct answers, selected cards, etc.
   - addEventListener(...) runs code when an event occurs, such as click, input,
     dragstart, drop, or DOMContentLoaded.
   - Reveal.on("slidechanged", ...) runs code when the presentation changes slides.
   - Functions assigned to window (for example window.checkAnswer = checkAnswer)
     are intentionally made global so HTML onclick="checkAnswer(this)" can call them.

   WHEN BUILDING A NEW INTERACTION
   1. Give the slide a unique class such as .my-activity-slide.
   2. Give interactive elements useful classes and data-* attributes in the HTML.
   3. In JavaScript, start from the clicked element and use closest(...) so one
      activity does not accidentally change another slide.
   4. Add/remove CSS state classes such as selected, correct, incorrect, or missed.
   5. Reset every state your activity creates.
   6. Test clicks, reset, repeated attempts, slide navigation, and browser refresh.
   7. Check the Developer Tools Console for errors if nothing happens.
============================================================================ */
/* 5041 Training Hub script: shared/js/app.js
   Organized during cleanup; functionality preserved. */

const config = window.ROAR_APP_CONFIG || {};
const SCRIPT_URL = config.SCRIPT_URL;
const APP_TOKEN = config.APP_TOKEN || "";

const form = document.querySelector("#roarForm");
const formMessage = document.querySelector("#formMessage");
const clearBtn = document.querySelector("#clearBtn");

const fields = {
  reportDate: document.querySelector("#reportDate"),
  reportTime: document.querySelector("#reportTime"),
  reporter: document.querySelector("#reporter"),
  reportingStudents: document.querySelector("#reportingStudents"),
  harassmentToggle: document.querySelector("#harassmentToggle"),
  otherToggle: document.querySelector("#otherToggle"),
  otherReportType: document.querySelector("#otherReportType"),
  individualsInvolved: document.querySelector("#individualsInvolved"),
  incidentDates: document.querySelector("#incidentDates"),
  incidentDescription: document.querySelector("#incidentDescription")
};

// STUDENT NOTE: UI/state helper `setMessage`. It updates page content or control state to match the current application data.
function setMessage(text, type = "") {
  formMessage.textContent = text;
  formMessage.className = `message ${type}`.trim();
}

// STUDENT NOTE: Function `ensureConfigured` groups one reusable behavior. Keep one clear responsibility per function so future students can test and modify it safely.
function ensureConfigured() {
  if (!SCRIPT_URL || SCRIPT_URL.includes("PASTE_YOUR")) {
    setMessage("Add your Google Apps Script web app URL to config.js first.", "error");
    return false;
  }
  return true;
}

// STUDENT NOTE: UI/state helper `setToday`. It updates page content or control state to match the current application data.
function setToday() {
  if (fields.reportDate && !fields.reportDate.value) {
    fields.reportDate.valueAsDate = new Date();
  }
}

// STUDENT NOTE: UI/state helper `updateOtherRequired`. It updates page content or control state to match the current application data.
function updateOtherRequired() {
  if (!fields.otherToggle || !fields.otherReportType) return;
  fields.otherReportType.required = fields.otherToggle.checked;
}

// STUDENT NOTE: UI/state helper `updateHarassmentToggle`. It updates page content or control state to match the current application data.
function updateHarassmentToggle() {
  const subChecks = document.querySelectorAll(".sub-checks input");
  const anyChecked = Array.from(subChecks).some((input) => input.checked);
  if (anyChecked && fields.harassmentToggle) fields.harassmentToggle.checked = true;
}

// STUDENT NOTE: Function `reportTypeSelected` groups one reusable behavior. Keep one clear responsibility per function so future students can test and modify it safely.
function reportTypeSelected() {
  return Boolean(
    form.reportTypeBullying.checked ||
    form.reportTypeHarassment.checked ||
    form.reportTypeSexualHarassment.checked ||
    form.reportTypeMisconduct.checked ||
    form.reportTypeRetaliation.checked ||
    form.reportTypeOther.checked
  );
}

// STUDENT NOTE: Function `validateForm` groups one reusable behavior. Keep one clear responsibility per function so future students can test and modify it safely.
function validateForm() {
  if (!ensureConfigured()) return false;

  if (!fields.reporter.value.trim()) {
    setMessage("Mentor/Student Reporter is required.", "error");
    return false;
  }

  if (!fields.reportDate.value) {
    setMessage("Date is required.", "error");
    return false;
  }

  if (!reportTypeSelected()) {
    setMessage("Select at least one report type.", "error");
    return false;
  }

  if (fields.otherToggle.checked && !fields.otherReportType.value.trim()) {
    setMessage("Describe the Other report type.", "error");
    return false;
  }

  if (!fields.individualsInvolved.value.trim()) {
    setMessage("Individual(s) involved is required.", "error");
    return false;
  }

  if (!fields.incidentDates.value.trim()) {
    setMessage("Incident Date(s) is required.", "error");
    return false;
  }

  if (!fields.incidentDescription.value.trim()) {
    setMessage("Description of Incident(s) is required.", "error");
    return false;
  }

  return true;
}

// STUDENT NOTE: Function `buildHiddenPostForm` groups one reusable behavior. Keep one clear responsibility per function so future students can test and modify it safely.
function buildHiddenPostForm(data) {
  const hiddenForm = document.createElement("form");
  hiddenForm.method = "POST";
  hiddenForm.action = SCRIPT_URL;
  hiddenForm.target = "hiddenSubmitFrame";
  hiddenForm.style.display = "none";

  Object.entries(data).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value ?? "";
    hiddenForm.appendChild(input);
  });

  document.body.appendChild(hiddenForm);
  return hiddenForm;
}

// STUDENT NOTE: Helper function `getCheckbox`. It retrieves or derives a value so the rest of the code does not repeat the same logic.
function getCheckbox(name) {
  const input = form.elements[name];
  return input && input.checked ? "true" : "false";
}

// STUDENT NOTE: Function `submitReport` groups one reusable behavior. Keep one clear responsibility per function so future students can test and modify it safely.
function submitReport() {
  if (!validateForm()) return;

  const data = {
    action: "save",
    token: APP_TOKEN,
    createdAt: new Date().toISOString(),
    reportingStudents: fields.reportingStudents.value.trim(),
    reporter: fields.reporter.value.trim(),
    reportDate: fields.reportDate.value,
    reportTime: fields.reportTime.value,
    reportTypeBullying: getCheckbox("reportTypeBullying"),
    reportTypeHarassment: getCheckbox("reportTypeHarassment"),
    harassmentVerbal: getCheckbox("harassmentVerbal"),
    harassmentPhysical: getCheckbox("harassmentPhysical"),
    harassmentDigital: getCheckbox("harassmentDigital"),
    reportTypeSexualHarassment: getCheckbox("reportTypeSexualHarassment"),
    reportTypeMisconduct: getCheckbox("reportTypeMisconduct"),
    reportTypeRetaliation: getCheckbox("reportTypeRetaliation"),
    reportTypeOther: getCheckbox("reportTypeOther"),
    otherReportType: fields.otherReportType.value.trim(),
    individualsInvolved: fields.individualsInvolved.value.trim(),
    incidentDates: fields.incidentDates.value.trim(),
    incidentDescription: fields.incidentDescription.value.trim()
  };

  try {
    setMessage("Submitting report...", "");
    const hiddenForm = buildHiddenPostForm(data);
    hiddenForm.submit();
    hiddenForm.remove();

    window.setTimeout(() => {
      setMessage("Report submitted to the connected Google Sheet.", "success");
      window.alert("Report submitted.");
      form.reset();
      setToday();
      updateOtherRequired();
    }, 750);
  } catch (error) {
    setMessage("Could not submit the report. Check your Apps Script URL and deployment permissions.", "error");
  }
}

// STUDENT NOTE: Event listener for `submit`. The callback below runs whenever that user/browser event occurs.
form.addEventListener("submit", (event) => {
  event.preventDefault();
  submitReport();
});

// STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
clearBtn.addEventListener("click", () => {
  form.reset();
  setToday();
  updateOtherRequired();
  setMessage("", "");
});

// STUDENT NOTE: Event listener for `change`. The callback below runs whenever that user/browser event occurs.
fields.otherToggle.addEventListener("change", updateOtherRequired);
document.querySelectorAll(".sub-checks input").forEach((input) => {
  // STUDENT NOTE: Event listener for `change`. The callback below runs whenever that user/browser event occurs.
  input.addEventListener("change", updateHarassmentToggle);
});

setToday();
updateOtherRequired();
