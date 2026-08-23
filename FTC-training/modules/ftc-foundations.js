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
/* 5041 Training Hub script: FTC-training/modules/ftc-foundations.js
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
const ftcIntroCorrectAnswers = {
  q1: "b",
  q2: "b",
  q3: "a",
  q4: "a",
  q5: "a",
  q6: "b",
  q7: "a",
  q8: "b",
  q9: "a",
  q10: "b",
  q11: "a",
  q12: "a",
  q13: "a",
  q14: "a",
  q15: "b",
};

// STUDENT NOTE: Minimum number of correct answers required to unlock completion/certificate behavior.
const passingScore = 13;
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
  pdf.save(`${name}-ftc-introduction-certificate.pdf`);
}

// STUDENT NOTE: Answer-checking function `gradeQuiz`. It reads the user state, compares it with the expected answer/data attributes, and updates feedback classes/text.
function gradeQuiz() {
  const result = document.getElementById("quizResult");
  const hint = document.getElementById("quizHint");
  const complete = document.getElementById("complete");
  const note = document.getElementById("completionNote");
  const totalQuestions = Object.keys(ftcIntroCorrectAnswers).length;

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

  Object.entries(ftcIntroCorrectAnswers).forEach(([question, answer]) => {
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


// STUDENT NOTE: Click interaction `revealFtcRole`. It changes classes/text so an element can reveal, hide, or select information without leaving the slide.
function revealFtcRole(card) {
  const slide = card.closest(".ftcintro-role-slide");
  const hiddenText = "Reveal a value";
  const willReveal = !card.classList.contains("revealed");

  card.classList.remove("flipping");
  void card.offsetWidth;
  card.classList.add("flipping");

  window.setTimeout(() => {
    card.classList.toggle("revealed", willReveal);
    card.textContent = willReveal ? card.dataset.role : hiddenText;
    card.setAttribute("aria-pressed", willReveal ? "true" : "false");

    if (slide) {
      const cards = slide.querySelectorAll(".ftcintro-role-card");
      const revealed = slide.querySelectorAll(".ftcintro-role-card.revealed");
      const feedback = slide.querySelector(".ftcintro-role-feedback");

      if (feedback) {
        feedback.textContent = `${revealed.length} of ${cards.length} cards revealed.`;
      }
    }
  }, 170);

  window.setTimeout(() => {
    card.classList.remove("flipping");
  }, 420);
}
// STUDENT NOTE: Exposes `revealFtcRole` globally so inline HTML such as onclick="revealFtcRole(...)" can call it.
window.revealFtcRole = revealFtcRole;

// STUDENT NOTE: Answer-checking function `checkFtcScenario`. It reads the user state, compares it with the expected answer/data attributes, and updates feedback classes/text.
function checkFtcScenario(button) {
  const slide = button.closest(".ftcintro-scenario-slide");
  if (!slide) return;

  const buttons = slide.querySelectorAll(".ftcintro-scenario-options button");
  const feedback = slide.querySelector(".ftcintro-scenario-feedback");
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
      ? "Correct. This shows Coopertition while still keeping your own team prepared."
      : "Not the best choice. FIRST teams compete hard while still treating others with respect and support.";
  }
}
// STUDENT NOTE: Exposes `checkFtcScenario` globally so inline HTML such as onclick="checkFtcScenario(...)" can call it.
window.checkFtcScenario = checkFtcScenario;

// STUDENT NOTE: Initialization function `initFtcIntroSortSlides`. It finds the needed HTML elements and attaches behavior/listeners. Call it after the page DOM exists.
function initFtcIntroSortSlides() {
  document.querySelectorAll(".ftcintro-sort-slide").forEach((slide) => {
    if (slide.dataset.ftcintroSortReady === "true") return;
    slide.dataset.ftcintroSortReady = "true";

    const bank = slide.querySelector(".ftcintro-sort-bank");
    const chips = Array.from(slide.querySelectorAll(".ftcintro-sort-chip"));
    const zones = Array.from(slide.querySelectorAll(".ftcintro-sort-zone"));
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
        dragged = null;
        chip.classList.remove("dragging");
      });
    });

    [...zones, bank].forEach((area) => {
      // STUDENT NOTE: Event listener for `dragover`. The callback below runs whenever that user/browser event occurs.
      area.addEventListener("dragover", (event) => event.preventDefault());

      // STUDENT NOTE: Event listener for `drop`. The callback below runs whenever that user/browser event occurs.
      area.addEventListener("drop", (event) => {
        event.preventDefault();
        if (!dragged) return;

        dragged.classList.remove("correct", "incorrect", "unplaced");

        if (area.classList.contains("ftcintro-sort-zone")) {
          area.querySelector(".ftcintro-sort-list").appendChild(dragged);
        } else {
          bank.appendChild(dragged);
        }
      });
    });
  });
}

// STUDENT NOTE: Answer-checking function `checkFtcIntroSort`. It reads the user state, compares it with the expected answer/data attributes, and updates feedback classes/text.
function checkFtcIntroSort(button) {
  const slide = button.closest(".ftcintro-sort-slide");
  if (!slide) return;

  const bank = slide.querySelector(".ftcintro-sort-bank");
  const chips = Array.from(slide.querySelectorAll(".ftcintro-sort-chip"));
  const zones = Array.from(slide.querySelectorAll(".ftcintro-sort-zone"));
  const feedback = slide.querySelector(".ftcintro-sort-feedback");

  let correct = 0;
  let placed = 0;

  chips.forEach((chip) => chip.classList.remove("correct", "incorrect", "unplaced"));

  zones.forEach((zone) => {
    const zoneName = zone.dataset.zone;

    zone.querySelectorAll(".ftcintro-sort-chip").forEach((chip) => {
      placed++;

      if (chip.dataset.answer === zoneName) {
        chip.classList.add("correct");
        correct++;
      } else {
        chip.classList.add("incorrect");
      }
    });
  });

  chips.forEach((chip) => {
    if (chip.parentElement === bank) {
      chip.classList.add("unplaced");
    }
  });

  if (feedback) {
    if (placed < chips.length) {
      feedback.textContent = `Place all ${chips.length} items before checking. ${correct}/${chips.length} are currently correct.`;
    } else if (correct === chips.length) {
      feedback.textContent = "Correct. You understand this part of the FTC experience.";
    } else {
      feedback.textContent = `${correct}/${chips.length} correct. Move the red cards and try again.`;
    }
  }
}
// STUDENT NOTE: Exposes `checkFtcIntroSort` globally so inline HTML such as onclick="checkFtcIntroSort(...)" can call it.
window.checkFtcIntroSort = checkFtcIntroSort;

// STUDENT NOTE: Reset function `resetFtcIntroSort`. It should return this activity to its original state by clearing classes, values, and feedback created during interaction.
function resetFtcIntroSort(button) {
  const slide = button.closest(".ftcintro-sort-slide");
  if (!slide) return;

  const bank = slide.querySelector(".ftcintro-sort-bank");
  const chips = Array.from(slide.querySelectorAll(".ftcintro-sort-chip"));
  const feedback = slide.querySelector(".ftcintro-sort-feedback");

  chips
    .sort((a, b) => Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex))
    .forEach((chip) => {
      chip.classList.remove("correct", "incorrect", "unplaced", "dragging");
      bank.appendChild(chip);
    });

  if (feedback) {
    feedback.textContent = "";
  }
}
// STUDENT NOTE: Exposes `resetFtcIntroSort` globally so inline HTML such as onclick="resetFtcIntroSort(...)" can call it.
window.resetFtcIntroSort = resetFtcIntroSort;

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
  initFtcIntroSortSlides();
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
        result.textContent = "Complete and pass the quiz before opening the completion certificate.";
      }
      if (hint) {
        hint.textContent = `Passing score: ${passingScore}/${Object.keys(ftcIntroCorrectAnswers).length}.`;
      }
    }, 0);
  }
});
