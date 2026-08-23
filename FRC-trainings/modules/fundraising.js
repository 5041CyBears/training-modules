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
/* 5041 Training Hub script: FRC-trainings/modules/fundraising.js
   Organized during cleanup; functionality preserved. */

if (window.Reveal) {
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
}

// STUDENT NOTE: Quiz answer key. The object keys must match the name/id convention used by the quiz inputs in the HTML.
const fundraisingCorrectAnswers = {
  q1: "b",
  q2: "a",
  q3: "c",
  q4: "a",
  q5: "b",
  q6: "b",
  q7: "a",
  q8: "a",
  q9: "b",
  q10: "b",
  q11: "a",
  q12: "a",
  q13: "a",
  q14: "a",
  q15: "b",
  q16: "a",
  q17: "a",
  q18: "a",
  q19: "b",
  q20: "a",
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
  const imageRatio = Math.min(availableWidth / canvas.width, availableHeight / canvas.height);
  const imageWidth = canvas.width * imageRatio;
  const imageHeight = canvas.height * imageRatio;
  const x = (pageWidth - imageWidth) / 2;
  const y = (pageHeight - imageHeight) / 2;

  pdf.addImage(imageData, "PNG", x, y, imageWidth, imageHeight);

  const name = getSafeFileName(getParticipantName() || "student");
  pdf.save(`${name}-fundraising-sponsor-engagement-certificate.pdf`);
}

// STUDENT NOTE: Answer-checking function `gradeQuiz`. It reads the user state, compares it with the expected answer/data attributes, and updates feedback classes/text.
function gradeQuiz() {
  const result = document.getElementById("quizResult");
  const hint = document.getElementById("quizHint");
  const complete = document.getElementById("complete");
  const note = document.getElementById("completionNote");
  const totalQuestions = Object.keys(fundraisingCorrectAnswers).length;

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

  Object.entries(fundraisingCorrectAnswers).forEach(([question, answer]) => {
    const selected = document.querySelector(`input[name="${question}"]:checked`);

    if (!selected) {
      unanswered.push(question);
      return;
    }

    if (selected.value === answer) {
      score++;
    }
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

// STUDENT NOTE: Reset function `resetQuiz`. It should return this activity to its original state by clearing classes, values, and feedback created during interaction.
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

// STUDENT NOTE: Initialization function `initSponsorSort`. It finds the needed HTML elements and attaches behavior/listeners. Call it after the page DOM exists.
function initSponsorSort() {
  document.querySelectorAll(".sponsor-sort-slide").forEach((slide) => {
    const bank = slide.querySelector(".sponsor-sort-bank");
    const chips = Array.from(slide.querySelectorAll(".sponsor-sort-chip"));
    const zones = Array.from(slide.querySelectorAll(".sponsor-sort-zone"));
    const checkButton = slide.querySelector(".check-sponsor-sort");
    const resetButton = slide.querySelector(".reset-sponsor-sort");
    const feedback = slide.querySelector(".sponsor-sort-feedback");
    let dragged = null;

    chips.forEach((chip, index) => {
      chip.dataset.originalIndex = index;
      // STUDENT NOTE: Event listener for `dragstart`. The callback below runs whenever that user/browser event occurs.
      chip.addEventListener("dragstart", () => {
        dragged = chip;
        chip.classList.add("dragging");
      });
      // STUDENT NOTE: Event listener for `dragend`. The callback below runs whenever that user/browser event occurs.
      chip.addEventListener("dragend", () => {
        chip.classList.remove("dragging");
        dragged = null;
      });
    });

    [...zones, bank].forEach((area) => {
      // STUDENT NOTE: Event listener for `dragover`. The callback below runs whenever that user/browser event occurs.
      area.addEventListener("dragover", (event) => event.preventDefault());
      // STUDENT NOTE: Event listener for `drop`. The callback below runs whenever that user/browser event occurs.
      area.addEventListener("drop", (event) => {
        event.preventDefault();
        if (!dragged) return;
        dragged.classList.remove("correct", "incorrect");

        if (area.classList.contains("sponsor-sort-zone")) {
          area.querySelector(".sponsor-sort-list").appendChild(dragged);
        } else {
          bank.appendChild(dragged);
        }
      });
    });

    if (checkButton) {
      // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
      checkButton.addEventListener("click", () => {
        let correct = 0;
        let placed = 0;

        chips.forEach((chip) => chip.classList.remove("correct", "incorrect"));

        zones.forEach((zone) => {
          const zoneName = zone.dataset.zone;
          zone.querySelectorAll(".sponsor-sort-chip").forEach((chip) => {
            placed++;
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
        else if (correct === chips.length) feedback.textContent = "Correct. Great sponsor judgment.";
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

// STUDENT NOTE: Initialization function `initSalesScenario`. It finds the needed HTML elements and attaches behavior/listeners. Call it after the page DOM exists.
function initSalesScenario() {
  document.querySelectorAll(".sales-scenario-slide").forEach((slide) => {
    const buttons = slide.querySelectorAll(".sales-scenario-options button");
    const feedback = slide.querySelector(".sales-scenario-feedback");

    buttons.forEach((button) => {
      // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
      button.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("correct", "incorrect"));
        const correct = button.dataset.correct === "true";
        button.classList.add(correct ? "correct" : "incorrect");
        if (feedback) {
          feedback.textContent = correct
            ? "Correct. Respect the no, offer another option, and keep the interaction positive."
            : "Not the best choice. Fundraising should be respectful, clear, and pressure-free.";
        }
      });
    });
  });
}

// STUDENT NOTE: UI/state helper `updateFundraisingRoleCount`. It updates page content or control state to match the current application data.
function updateFundraisingRoleCount(slide) {
  const cards = Array.from(slide.querySelectorAll(".role-reveal-card"));
  const feedback = slide.querySelector(".fundraising-review-feedback");
  const count = cards.filter((card) => card.classList.contains("revealed")).length;

  if (feedback) {
    feedback.textContent = `${count} of ${cards.length} roles revealed.`;
  }
}

// STUDENT NOTE: Click interaction `revealFundraisingRole`. It changes classes/text so an element can reveal, hide, or select information without leaving the slide.
function revealFundraisingRole(card) {
  if (!card) return;

  const slide = card.closest(".role-review-slide");
  const hiddenText = "Click to reveal a role";
  const willReveal = !card.classList.contains("revealed");

  card.classList.remove("role-flipping");
  void card.offsetWidth;
  card.classList.add("role-flipping");

  window.setTimeout(() => {
    card.classList.toggle("revealed", willReveal);
    card.textContent = willReveal ? card.dataset.role : hiddenText;
    card.setAttribute("aria-pressed", willReveal ? "true" : "false");

    if (slide) updateFundraisingRoleCount(slide);
  }, 160);

  window.setTimeout(() => {
    card.classList.remove("role-flipping");
  }, 420);
}

// STUDENT NOTE: Initialization function `initRoleChecklist`. It finds the needed HTML elements and attaches behavior/listeners. Call it after the page DOM exists.
function initRoleChecklist() {
  document.querySelectorAll(".role-review-slide").forEach((slide) => {
    const cards = Array.from(slide.querySelectorAll(".role-reveal-card"));
    const hiddenText = "Click to reveal a role";

    cards.forEach((card) => {
      if (!card.dataset.role) {
        card.dataset.role = card.textContent.trim();
      }

      card.classList.remove("revealed", "reviewed", "selected", "flipped");
      card.textContent = hiddenText;
      card.setAttribute("aria-pressed", "false");
    });

    updateFundraisingRoleCount(slide);
  });
}

// STUDENT NOTE: Exposes `revealFundraisingRole` globally so inline HTML such as onclick="revealFundraisingRole(...)" can call it.
window.revealFundraisingRole = revealFundraisingRole;

// STUDENT NOTE: Answer-checking function `checkSalesScenarioAnswer`. It reads the user state, compares it with the expected answer/data attributes, and updates feedback classes/text.
function checkSalesScenarioAnswer(button) {
  const slide = button.closest(".sales-scenario-slide");
  if (!slide) return;

  const buttons = slide.querySelectorAll(".sales-scenario-options button");
  const feedback = slide.querySelector(".sales-scenario-feedback");
  const isCorrect = button.dataset.correct === "true";

  buttons.forEach((item) => {
    item.classList.remove("correct", "incorrect", "selected");
    item.setAttribute("aria-pressed", "false");
  });

  button.classList.add(isCorrect ? "correct" : "incorrect");
  button.classList.add("selected");
  button.setAttribute("aria-pressed", "true");

  if (feedback) {
    feedback.textContent = isCorrect
      ? "Correct. Respect the no, offer another option, and keep the interaction positive."
      : "Not the best choice. Fundraising should be respectful, clear, and pressure-free.";
  }
}

// STUDENT NOTE: Exposes `checkSalesScenarioAnswer` globally so inline HTML such as onclick="checkSalesScenarioAnswer(...)" can call it.
window.checkSalesScenarioAnswer = checkSalesScenarioAnswer;

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
  initSponsorSort();
  initSalesScenario();
  initRoleChecklist();
});

if (window.Reveal) {
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
        result.textContent = "Complete and pass the quiz before opening the completion certificate.";
      }
      if (hint) {
        hint.textContent = `Passing score: ${passingScore}/${Object.keys(fundraisingCorrectAnswers).length}.`;
      }
    }, 0);
  }
});
}
