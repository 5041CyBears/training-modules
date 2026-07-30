Reveal.initialize({
  hash: true,
  slideNumber: true,
  transition: "slide",
  backgroundTransition: "fade",
  width: 1280,
  height: 720,
  margin: 0.04,
  minScale: 0.2,
  maxScale: 1.7
});

const webCorrectAnswers = {
  q1: "a",
  q2: "b",
  q3: "c",
  q4: "b",
  q5: "a",
  q6: "b",
  q7: "c",
  q8: "b",
  q9: "a",
  q10: "b",
  q11: "a",
  q12: "a",
  q13: "a",
  q14: "a",
  q15: "b",
  q16: "a",
  q17: "b",
  q18: "a",
  q19: "a",
  q20: "b"
};

const passingScore = 18;
let quizPassed = false;
let participantName = "";

function getParticipantName() {
  const input = document.getElementById("participantName");
  return input ? input.value.trim() : "";
}

function updateCertificateName() {
  participantName = getParticipantName();
  const certificateName = document.getElementById("certificateName");

  if (certificateName) {
    certificateName.textContent = participantName || "Student Name";
  }
}

function setCertificateDownloadEnabled(enabled) {
  const button = document.getElementById("downloadCertificate");
  if (button) button.disabled = !enabled;
}

function getSafeFileName(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "certificate";
}

async function downloadCertificatePdf() {
  if (!quizPassed) {
    alert("Complete and pass the quiz before downloading the certificate.");
    return;
  }

  updateCertificateName();

  const certificate = document.querySelector("#complete .certificate-card");
  if (!certificate) {
    alert("Certificate could not be found.");
    return;
  }

  const canvas = await html2canvas(certificate, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true
  });

  const imageData = canvas.toDataURL("image/png");
  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "letter"
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 36;
  const availableWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - margin * 2;
  const imageRatio = Math.min(availableWidth / canvas.width, availableHeight / canvas.height);
  const imageWidth = canvas.width * imageRatio;
  const imageHeight = canvas.height * imageRatio;
  const x = (pageWidth - imageWidth) / 2;
  const y = (pageHeight - imageHeight) / 2;

  pdf.addImage(imageData, "PNG", x, y, imageWidth, imageHeight);

  const name = getSafeFileName(getParticipantName() || "student");
  pdf.save(`${name}-web-design-basics-certificate.pdf`);
}

function gradeQuiz() {
  const result = document.getElementById("quizResult");
  const hint = document.getElementById("quizHint");
  const complete = document.getElementById("complete");
  const note = document.getElementById("completionNote");
  const totalQuestions = Object.keys(webCorrectAnswers).length;

  if (!result || !hint || !complete || !note) return;

  participantName = getParticipantName();

  if (!participantName) {
    quizPassed = false;
    complete.classList.add("locked");
    setCertificateDownloadEnabled(false);
    result.textContent = "Please enter your name before grading the quiz.";
    result.className = "result";
    hint.textContent = "Go back to the name entry slide, enter your name, then grade again.";
    note.textContent = "Complete after passing the required quiz.";
    return;
  }

  let score = 0;
  const unanswered = [];

  Object.entries(webCorrectAnswers).forEach(([question, answer]) => {
    const selected = document.querySelector(`input[name="${question}"]:checked`);

    if (!selected) {
      unanswered.push(question);
      return;
    }

    if (selected.value === answer) score++;
  });

  if (unanswered.length > 0) {
    quizPassed = false;
    complete.classList.add("locked");
    setCertificateDownloadEnabled(false);
    result.textContent = `Answer all questions before grading. Missing: ${unanswered.length}.`;
    result.className = "result";
    hint.textContent = `Passing score: ${passingScore}/${totalQuestions}.`;
    note.textContent = "Complete after passing the required quiz.";
    return;
  }

  if (score >= passingScore) {
    quizPassed = true;
    complete.classList.remove("locked");
    updateCertificateName();
    setCertificateDownloadEnabled(true);
    result.textContent = `Passed: ${score}/${totalQuestions}. Completion certificate unlocked.`;
    result.className = "result success";
    hint.textContent = "You passed. Advance to the completion certificate.";
    note.textContent = `Certificate earned by ${participantName}. Quiz score: ${score}/${totalQuestions}.`;
  } else {
    quizPassed = false;
    complete.classList.add("locked");
    setCertificateDownloadEnabled(false);
    result.textContent = `Not yet: ${score}/${totalQuestions}. Review the module and try again.`;
    result.className = "result warning";
    hint.textContent = `Passing score: ${passingScore}/${totalQuestions}.`;
    note.textContent = "Complete after passing the required quiz.";
  }
}

function resetQuiz() {
  document.querySelectorAll("input[type='radio']").forEach((input) => {
    input.checked = false;
  });

  quizPassed = false;
  setCertificateDownloadEnabled(false);

  const complete = document.getElementById("complete");
  const result = document.getElementById("quizResult");
  const hint = document.getElementById("quizHint");
  const note = document.getElementById("completionNote");

  if (complete) complete.classList.add("locked");
  if (result) {
    result.textContent = "Not submitted.";
    result.className = "result";
  }
  if (hint) hint.textContent = "After passing, advance to the final completion certificate.";
  if (note) note.textContent = "Complete after passing the required quiz.";
}

function stopRevealKeys(textarea) {
  ["keydown", "keyup", "keypress"].forEach((eventName) => {
    textarea.addEventListener(eventName, (event) => {
      event.stopPropagation();
    });
  });

  textarea.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = "  ";
      textarea.value = textarea.value.substring(0, start) + spaces + textarea.value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
    }
  });
}

function initHtmlPlaygrounds() {
  document.querySelectorAll(".html-playground-slide").forEach((slide) => {
    const editor = slide.querySelector(".html-editor");
    const preview = slide.querySelector(".html-preview");
    const runButton = slide.querySelector(".run-html-button");
    const resetButton = slide.querySelector(".reset-html-button");

    if (!editor || !preview || !runButton || !resetButton) return;

    const startingCode = editor.value;

    function updatePreview() {
      preview.srcdoc = editor.value;
    }

    runButton.addEventListener("click", updatePreview);
    resetButton.addEventListener("click", () => {
      editor.value = startingCode;
      updatePreview();
    });

    editor.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        updatePreview();
      }
    });

    stopRevealKeys(editor);
    updatePreview();
  });
}

function initLayoutPlayground() {
  const flexCode = document.getElementById("flex-demo-code");
  const gridCode = document.getElementById("grid-demo-code");
  const flexPreview = document.getElementById("flex-demo-preview");
  const gridPreview = document.getElementById("grid-demo-preview");
  const run = document.getElementById("runLayoutDemos");
  const reset = document.getElementById("resetLayoutDemos");

  if (!flexCode || !gridCode || !flexPreview || !gridPreview || !run || !reset) return;

  const flexStart = flexCode.value;
  const gridStart = gridCode.value;

  function runDemos() {
    flexPreview.srcdoc = flexCode.value;
    gridPreview.srcdoc = gridCode.value;
  }

  run.addEventListener("click", runDemos);
  reset.addEventListener("click", () => {
    flexCode.value = flexStart;
    gridCode.value = gridStart;
    runDemos();
  });

  [flexCode, gridCode].forEach((textarea) => {
    stopRevealKeys(textarea);
    textarea.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        runDemos();
      }
    });
  });

  runDemos();
}

function initCopyButtons() {
  document.querySelectorAll(".copy-code-block").forEach((block) => {
    const button = block.querySelector(".copy-code-button");
    const code = block.querySelector("code");

    if (!button || !code) return;

    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(code.textContent);
        button.textContent = "Copied";
        window.setTimeout(() => {
          button.textContent = "Copy";
        }, 1500);
      } catch (error) {
        button.textContent = "Select + Copy";
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const gradeButton = document.getElementById("gradeQuiz");
  const resetButton = document.getElementById("resetQuiz");
  const nameInput = document.getElementById("participantName");
  const downloadButton = document.getElementById("downloadCertificate");

  if (gradeButton) gradeButton.addEventListener("click", gradeQuiz);
  if (resetButton) resetButton.addEventListener("click", resetQuiz);
  if (nameInput) nameInput.addEventListener("input", updateCertificateName);
  if (downloadButton) {
    downloadButton.disabled = true;
    downloadButton.addEventListener("click", downloadCertificatePdf);
  }

  document.querySelectorAll('a[href^="http"]').forEach((link) => {
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });

  updateCertificateName();
  initHtmlPlaygrounds();
  initLayoutPlayground();
  initCopyButtons();
});

Reveal.on("slidechanged", (event) => {
  if (event.currentSlide && event.currentSlide.id === "complete" && !quizPassed) {
    const resultsSlide = document.getElementById("quiz-results");
    const resultsIndex = Reveal.getIndices(resultsSlide);

    setTimeout(() => {
      Reveal.slide(resultsIndex.h, resultsIndex.v || 0);
      const result = document.getElementById("quizResult");
      const hint = document.getElementById("quizHint");

      if (result) {
        result.textContent = "Complete and pass the quiz before opening the completion certificate.";
      }
      if (hint) {
        hint.textContent = `Passing score: ${passingScore}/${Object.keys(webCorrectAnswers).length}.`;
      }
    }, 0);
  }
});
