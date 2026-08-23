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
/* 5041 Training Hub script: FTC-training/modules/inclusion.js
   Organized during cleanup; functionality preserved. */

// STUDENT NOTE: Reveal.js presentation settings. Width/height define the design canvas; Reveal scales that canvas to the browser window.
Reveal.initialize({
  hash: true,
  slideNumber: true,
  transition: "slide",
  backgroundTransition: "fade",
  width: 1280,
  height: 720,
  margin: 0.04,
  minScale: 0.2,
  maxScale: 1.7,
});

// STUDENT NOTE: Quiz answer key. The object keys must match the name/id convention used by the quiz inputs in the HTML.
const inclusionCorrectAnswers = {
  q1: "b",
  q2: "a",
  q3: "c",
  q4: "b",
  q5: "c",
  q6: "c",
  q7: "a",
  q8: "b",
  q9: "c",
  q10: "c",
  q11: "a",
  q12: "a",
  q13: "b",
  q14: "b",
  q15: "c",
  q16: "a",
  q17: "b",
  q18: "b",
  q19: "a",
  q20: "b",
};

// STUDENT NOTE: Minimum number of correct answers required to unlock completion/certificate behavior.
const passingScore = 18;
let quizPassed = false;
let participantName = "";

// STUDENT NOTE: Helper function `getParticipantName`. It retrieves or derives a value so the rest of the code does not repeat the same logic.
function getParticipantName() {
  const input = document.getElementById("participantName");
  return input ? input.value.trim() : "";
}

// STUDENT NOTE: UI/state helper `updateCertificateName`. It updates page content or control state to match the current application data.
function updateCertificateName() {
  participantName = getParticipantName();
  const certificateName = document.getElementById("certificateName");

  if (certificateName) {
    certificateName.textContent = participantName || "Student Name";
  }
}

// STUDENT NOTE: UI/state helper `setCertificateDownloadEnabled`. It updates page content or control state to match the current application data.
function setCertificateDownloadEnabled(enabled) {
  const button = document.getElementById("downloadCertificate");

  if (button) {
    button.disabled = !enabled;
  }
}

// STUDENT NOTE: Helper function `getSafeFileName`. It retrieves or derives a value so the rest of the code does not repeat the same logic.
function getSafeFileName(text) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "certificate"
  );
}

// STUDENT NOTE: Download/export function `downloadCertificatePdf`. It converts page content into a downloadable artifact; external libraries used here must load before this function runs.
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

  if (typeof html2canvas === "undefined" || !window.jspdf) {
    alert("PDF tools did not load. Check your internet connection and try again.");
    return;
  }

  const canvas = await html2canvas(certificate, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
  });

  const imageData = canvas.toDataURL("image/png");
  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "letter",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 36;
  const availableWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - margin * 2;

  const imageRatio = Math.min(
    availableWidth / canvas.width,
    availableHeight / canvas.height,
  );

  const imageWidth = canvas.width * imageRatio;
  const imageHeight = canvas.height * imageRatio;
  const x = (pageWidth - imageWidth) / 2;
  const y = (pageHeight - imageHeight) / 2;

  pdf.addImage(imageData, "PNG", x, y, imageWidth, imageHeight);

  const name = getSafeFileName(getParticipantName() || "student");
  pdf.save(`${name}-inclusive-safe-team-culture-certificate.pdf`);
}

// STUDENT NOTE: Answer-checking function `gradeQuiz`. It reads the user state, compares it with the expected answer/data attributes, and updates feedback classes/text.
function gradeQuiz() {
  let score = 0;
  let unanswered = 0;

  for (const [name, correct] of Object.entries(inclusionCorrectAnswers)) {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    if (!checked) unanswered++;
    else if (checked.value === correct) score++;
  }

  const totalQuestions = Object.keys(inclusionCorrectAnswers).length;
  const result = document.getElementById("quizResult");
  const hint = document.getElementById("quizHint");
  const complete = document.getElementById("complete");
  const note = document.getElementById("completionNote");

  if (!result || !hint || !complete || !note) return;

  updateCertificateName();
  participantName = getParticipantName();

  if (!participantName) {
    quizPassed = false;
    setCertificateDownloadEnabled(false);
    complete.classList.add("locked");
    result.textContent = "Please enter your name before grading the quiz.";
    result.className = "result";
    hint.textContent =
      "Go back to the name entry slide, enter your name, then grade again.";
    note.textContent = "Complete after passing the required quiz.";
    return;
  }

  if (unanswered > 0) {
    quizPassed = false;
    setCertificateDownloadEnabled(false);
    complete.classList.add("locked");
    result.textContent = `You still need to answer ${unanswered} question(s).`;
    result.className = "result";
    hint.textContent = "Go back, answer every question, then grade the quiz again.";
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
    setCertificateDownloadEnabled(false);
    complete.classList.add("locked");
    result.textContent = `Not yet: ${score}/${totalQuestions}. Review and try again.`;
    result.className = "result";
    hint.textContent = `You need at least ${passingScore}/${totalQuestions} to unlock the completion certificate.`;
    note.textContent = "Complete after passing the required quiz.";
  }
}

// STUDENT NOTE: Reset function `resetQuiz`. It should return this activity to its original state by clearing classes, values, and feedback created during interaction.
function resetQuiz() {
  Object.keys(inclusionCorrectAnswers).forEach((questionName) => {
    document
      .querySelectorAll(`input[name="${questionName}"]`)
      .forEach((input) => {
        input.checked = false;
      });
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
  if (hint) {
    hint.textContent = "After passing, advance to the final completion certificate.";
  }
  if (note) note.textContent = "Complete after passing the required quiz.";
}

// STUDENT NOTE: Initialization function `initCategorySort`. It finds the needed HTML elements and attaches behavior/listeners. Call it after the page DOM exists.
function initCategorySort(slideSelector) {
  document.querySelectorAll(slideSelector).forEach((slide) => {
    if (slide.dataset.sortInit === "true") return;
    slide.dataset.sortInit = "true";

    const bank = slide.querySelector(".sort-bank");
    const chips = [...slide.querySelectorAll(".sort-chip")];
    const dropAreas = slide.querySelectorAll(".sort-bank, .sort-zone");
    const checkButton = slide.querySelector(".check-sort");
    const resetButton = slide.querySelector(".reset-sort");
    const feedback = slide.querySelector(".activity-feedback");
    let draggedChip = null;

    chips.forEach((chip, index) => {
      chip.dataset.originalIndex = index;
      // STUDENT NOTE: Event listener for `dragstart`. The callback below runs whenever that user/browser event occurs.
      chip.addEventListener("dragstart", () => {
        draggedChip = chip;
        chip.classList.add("dragging");
      });
      // STUDENT NOTE: Event listener for `dragend`. The callback below runs whenever that user/browser event occurs.
      chip.addEventListener("dragend", () => {
        chip.classList.remove("dragging");
        draggedChip = null;
      });
    });

    dropAreas.forEach((area) => {
      // STUDENT NOTE: Event listener for `dragover`. The callback below runs whenever that user/browser event occurs.
      area.addEventListener("dragover", (event) => {
        event.preventDefault();
        area.classList.add("drag-over");
      });
      // STUDENT NOTE: Event listener for `dragleave`. The callback below runs whenever that user/browser event occurs.
      area.addEventListener("dragleave", () => area.classList.remove("drag-over"));
      // STUDENT NOTE: Event listener for `drop`. The callback below runs whenever that user/browser event occurs.
      area.addEventListener("drop", (event) => {
        event.preventDefault();
        area.classList.remove("drag-over");
        if (!draggedChip) return;
        draggedChip.classList.remove("correct", "incorrect");
        if (area.classList.contains("sort-zone")) {
          area.querySelector(".sort-list").appendChild(draggedChip);
        } else {
          area.appendChild(draggedChip);
        }
        if (feedback) feedback.textContent = "";
      });
    });

    if (checkButton) {
      // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
      checkButton.addEventListener("click", () => {
        let placed = 0;
        let correct = 0;

        slide.querySelectorAll(".sort-zone").forEach((zone) => {
          const zoneName = zone.dataset.zone;
          zone.querySelectorAll(".sort-chip").forEach((chip) => {
            placed++;
            chip.classList.remove("correct", "incorrect");
            if (chip.dataset.answer === zoneName) {
              chip.classList.add("correct");
              correct++;
            } else {
              chip.classList.add("incorrect");
            }
          });
        });

        if (!feedback) return;
        if (placed < chips.length) feedback.textContent = `Place all ${chips.length} cards before checking.`;
        else if (correct === chips.length) feedback.textContent = "Correct. Nice work.";
        else feedback.textContent = `${correct}/${chips.length} correct. Adjust the red cards and try again.`;
      });
    }

    if (resetButton) {
      // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
      resetButton.addEventListener("click", () => {
        chips
          .sort((a, b) => Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex))
          .forEach((chip) => {
            chip.classList.remove("correct", "incorrect");
            bank.appendChild(chip);
          });
        if (feedback) feedback.textContent = "";
      });
    }
  });
}

// STUDENT NOTE: Initialization function `initScenario`. It finds the needed HTML elements and attaches behavior/listeners. Call it after the page DOM exists.
function initScenario() {
  document.querySelectorAll(".scenario-slide").forEach((slide) => {
    const buttons = slide.querySelectorAll(".scenario-options button");
    const feedback = slide.querySelector(".scenario-feedback");

    buttons.forEach((button) => {
      // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
      button.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("correct", "incorrect"));
        const correct = button.dataset.correct === "true";
        button.classList.add(correct ? "correct" : "incorrect");
        if (feedback) {
          feedback.textContent = correct
            ? "Correct. Inclusion often starts with a direct invitation, explanation, and supported real work."
            : "Not the best choice. Waiting, excluding, or only assigning cleanup does not create belonging.";
        }
      });
    });
  });
}

// STUDENT NOTE: Initialization function `initReviewChecklist`. It finds the needed HTML elements and attaches behavior/listeners. Call it after the page DOM exists.
function initReviewChecklist() {
  document.querySelectorAll(".review-slide").forEach((slide) => {
    const items = slide.querySelectorAll(".review-item");
    const feedback = slide.querySelector(".review-feedback");

    // STUDENT NOTE: UI/state helper `updateCount`. It updates page content or control state to match the current application data.
    function updateCount() {
      const count = slide.querySelectorAll(".review-item.reviewed").length;
      if (feedback) feedback.textContent = `${count} of ${items.length} reviewed.`;
    }

    items.forEach((item) => {
      // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
      item.addEventListener("click", () => {
        item.classList.toggle("reviewed");
        updateCount();
      });
    });

    updateCount();
  });
}

// STUDENT NOTE: Event listener for `DOMContentLoaded`. The callback below runs whenever that user/browser event occurs.
document.addEventListener("DOMContentLoaded", () => {
  const gradeButton = document.getElementById("gradeQuiz");
  const resetButton = document.getElementById("resetQuiz");
  const nameInput = document.getElementById("participantName");
  const downloadButton = document.getElementById("downloadCertificate");

  // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
  if (gradeButton) gradeButton.addEventListener("click", gradeQuiz);
  // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
  if (resetButton) resetButton.addEventListener("click", resetQuiz);
  // STUDENT NOTE: Event listener for `input`. The callback below runs whenever that user/browser event occurs.
  if (nameInput) nameInput.addEventListener("input", updateCertificateName);
  if (downloadButton) {
    downloadButton.disabled = true;
    // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
    downloadButton.addEventListener("click", downloadCertificatePdf);
  }

  updateCertificateName();
  initCategorySort(".inclusion-sort-slide");
  initScenario();
  initReviewChecklist();
  initGPCheck();

});

// STUDENT NOTE: Reveal.js `slidechanged` hook. Use these hooks when behavior should run as slides open or change.
Reveal.on("slidechanged", (event) => {
  if (event.currentSlide && event.currentSlide.id === "complete" && !quizPassed) {
    const resultsSlide = document.getElementById("quiz-results");
    const resultsIndex = Reveal.getIndices(resultsSlide);

    setTimeout(() => {
      Reveal.slide(resultsIndex.h, resultsIndex.v || 0);
      const result = document.getElementById("quizResult");
      const hint = document.getElementById("quizHint");

      if (result) {
        result.textContent =
          "Complete and pass the quiz before opening the completion certificate.";
      }
      if (hint) {
        hint.textContent = `Passing score: ${passingScore}/${Object.keys(inclusionCorrectAnswers).length}.`;
      }
    }, 0);
  }
});

// STUDENT NOTE: Initialization function `initGPCheck`. It finds the needed HTML elements and attaches behavior/listeners. Call it after the page DOM exists.
function initGPCheck() {
  document.querySelectorAll(".gp-check-slide").forEach((slide) => {
    const buttons = slide.querySelectorAll(".gp-check-option");
    const feedback = slide.querySelector(".gp-check-feedback");

    buttons.forEach((button) => {
      // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
      button.addEventListener("click", () => {
        buttons.forEach((item) => {
          item.classList.remove("correct", "incorrect");
        });

        const isCorrect = button.dataset.correct === "true";

        if (isCorrect) {
          button.classList.add("correct");
          feedback.textContent =
            "Correct. Gracious Professionalism means doing good work while helping others grow.";
        } else {
          button.classList.add("incorrect");
          feedback.textContent =
            "Not quite. Choose the response that teaches, respects the teammate, and keeps the work safe.";
        }
      });
    });
  });
}