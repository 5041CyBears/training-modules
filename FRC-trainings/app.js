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

function setMessage(text, type = "") {
  formMessage.textContent = text;
  formMessage.className = `message ${type}`.trim();
}

function ensureConfigured() {
  if (!SCRIPT_URL || SCRIPT_URL.includes("PASTE_YOUR")) {
    setMessage("Add your Google Apps Script web app URL to config.js first.", "error");
    return false;
  }
  return true;
}

function setToday() {
  if (fields.reportDate && !fields.reportDate.value) {
    fields.reportDate.valueAsDate = new Date();
  }
}

function updateOtherRequired() {
  if (!fields.otherToggle || !fields.otherReportType) return;
  fields.otherReportType.required = fields.otherToggle.checked;
}

function updateHarassmentToggle() {
  const subChecks = document.querySelectorAll(".sub-checks input");
  const anyChecked = Array.from(subChecks).some((input) => input.checked);
  if (anyChecked && fields.harassmentToggle) fields.harassmentToggle.checked = true;
}

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

function getCheckbox(name) {
  const input = form.elements[name];
  return input && input.checked ? "true" : "false";
}

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

form.addEventListener("submit", (event) => {
  event.preventDefault();
  submitReport();
});

clearBtn.addEventListener("click", () => {
  form.reset();
  setToday();
  updateOtherRequired();
  setMessage("", "");
});

fields.otherToggle.addEventListener("change", updateOtherRequired);
document.querySelectorAll(".sub-checks input").forEach((input) => {
  input.addEventListener("change", updateHarassmentToggle);
});

setToday();
updateOtherRequired();
