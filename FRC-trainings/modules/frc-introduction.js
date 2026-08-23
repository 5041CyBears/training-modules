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
/* 5041 Training Hub script: FRC-trainings/modules/frc-introduction.js
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
const frcintroCorrectAnswers = {
  q1: "a",
  q2: "b",
  q3: "b",
  q4: "b",
  q5: "a",
  q6: "a",
  q7: "a",
  q8: "a",
  q9: "b",
  q10: "b",
  q11: "b",
  q12: "a",
  q13: "b",
  q14: "b",
  q15: "a",
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
  if (certificateName) certificateName.textContent = participantName || "Student Name";
}

// STUDENT NOTE: UI/state helper `setCertificateDownloadEnabled`. It updates page content or control state to match the current application data.
function setCertificateDownloadEnabled(enabled) {
  const button = document.getElementById("downloadCertificate");
  if (button) button.disabled = !enabled;
}

// STUDENT NOTE: Helper function `getSafeFileName`. It retrieves or derives a value so the rest of the code does not repeat the same logic.
function getSafeFileName(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "certificate";
}

// STUDENT NOTE: Download/export function `downloadCertificatePdf`. It converts page content into a downloadable artifact; external libraries used here must load before this function runs.
async function downloadCertificatePdf() {
  if (!quizPassed) {
    alert("Complete and pass the quiz before downloading the certificate.");
    return;
  }

  updateCertificateName();
  const certificate = document.querySelector("#complete .certificate-card");
  if (!certificate) return;

  const canvas = await html2canvas(certificate, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
  });

  const imageData = canvas.toDataURL("image/png");
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "letter" });
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
  pdf.save(`${getSafeFileName(getParticipantName() || "student")}-frc-introduction-certificate.pdf`);
}

// STUDENT NOTE: Answer-checking function `gradeQuiz`. It reads the user state, compares it with the expected answer/data attributes, and updates feedback classes/text.
function gradeQuiz() {
  const result = document.getElementById("quizResult");
  const hint = document.getElementById("quizHint");
  const complete = document.getElementById("complete");
  const note = document.getElementById("completionNote");
  const totalQuestions = Object.keys(frcintroCorrectAnswers).length;
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
  Object.entries(frcintroCorrectAnswers).forEach(([question, answer]) => {
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

// STUDENT NOTE: Click interaction `revealFrcRole`. It changes classes/text so an element can reveal, hide, or select information without leaving the slide.
function revealFrcRole(card) {
  const slide = card.closest(".frcintro-role-slide");
  const hiddenText = "Click to reveal a role";
  const willReveal = !card.classList.contains("revealed");
  card.classList.remove("role-flipping");
  void card.offsetWidth;
  card.classList.add("role-flipping");
  window.setTimeout(() => {
    card.classList.toggle("revealed", willReveal);
    card.textContent = willReveal ? card.dataset.role : hiddenText;
    card.setAttribute("aria-pressed", willReveal ? "true" : "false");
    if (slide) {
      const cards = slide.querySelectorAll(".frcintro-role-card");
      const revealed = slide.querySelectorAll(".frcintro-role-card.revealed");
      const feedback = slide.querySelector(".frcintro-role-feedback");
      if (feedback) feedback.textContent = `${revealed.length} of ${cards.length} roles revealed.`;
    }
  }, 170);
  window.setTimeout(() => card.classList.remove("role-flipping"), 420);
}
// STUDENT NOTE: Exposes `revealFrcRole` globally so inline HTML such as onclick="revealFrcRole(...)" can call it.
window.revealFrcRole = revealFrcRole;

// STUDENT NOTE: Initialization function `initSeasonSort`. It finds the needed HTML elements and attaches behavior/listeners. Call it after the page DOM exists.
function initSeasonSort() {
  document.querySelectorAll(".season-sort-slide").forEach((slide) => {
    const bank = slide.querySelector(".season-sort-bank");
    const chips = Array.from(slide.querySelectorAll(".season-sort-chip"));
    const zones = Array.from(slide.querySelectorAll(".season-sort-zone"));
    const checkButton = slide.querySelector(".check-season-sort");
    const resetButton = slide.querySelector(".reset-season-sort");
    const feedback = slide.querySelector(".season-sort-feedback");
    let dragged = null;

    chips.forEach((chip, index) => {
      chip.dataset.originalIndex = index;
      // STUDENT NOTE: Event listener for `dragstart`. The callback below runs whenever that user/browser event occurs.
      chip.addEventListener("dragstart", () => { dragged = chip; chip.classList.add("dragging"); });
      // STUDENT NOTE: Event listener for `dragend`. The callback below runs whenever that user/browser event occurs.
      chip.addEventListener("dragend", () => { dragged = null; chip.classList.remove("dragging"); });
    });

    [...zones, bank].forEach((area) => {
      // STUDENT NOTE: Event listener for `dragover`. The callback below runs whenever that user/browser event occurs.
      area.addEventListener("dragover", (event) => event.preventDefault());
      // STUDENT NOTE: Event listener for `drop`. The callback below runs whenever that user/browser event occurs.
      area.addEventListener("drop", (event) => {
        event.preventDefault();
        if (!dragged) return;
        dragged.classList.remove("correct", "incorrect", "unplaced");
        if (area.classList.contains("season-sort-zone")) {
          area.querySelector(".season-sort-list").appendChild(dragged);
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
        chips.forEach((chip) => chip.classList.remove("correct", "incorrect", "unplaced"));
        zones.forEach((zone) => {
          const zoneName = zone.dataset.zone;
          zone.querySelectorAll(".season-sort-chip").forEach((chip) => {
            placed++;
            if (chip.dataset.answer === zoneName) { chip.classList.add("correct"); correct++; }
            else chip.classList.add("incorrect");
          });
        });
        chips.forEach((chip) => { if (chip.parentElement === bank) chip.classList.add("unplaced"); });
        if (feedback) {
          if (placed < chips.length) feedback.textContent = `Place all ${chips.length} items before checking. ${correct}/${chips.length} are currently correct.`;
          else if (correct === chips.length) feedback.textContent = "Correct. The season stages are in the right order.";
          else feedback.textContent = `${correct}/${chips.length} correct. Move the red items and try again.`;
        }
      });
    }

    if (resetButton) {
      // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
      resetButton.addEventListener("click", () => {
        chips.sort((a, b) => Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex)).forEach((chip) => {
          chip.classList.remove("correct", "incorrect", "unplaced", "dragging");
          bank.appendChild(chip);
        });
        if (feedback) feedback.textContent = "";
      });
    }
  });
}

// STUDENT NOTE: Answer-checking function `checkValuesChoice`. It reads the user state, compares it with the expected answer/data attributes, and updates feedback classes/text.
function checkValuesChoice(button) {
  const slide = button.closest(".values-choice-slide");
  if (!slide) return;
  const buttons = slide.querySelectorAll(".values-choice-options button");
  const feedback = slide.querySelector(".values-choice-feedback");
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
      ? "Correct. FRC teams can compete hard and still support each other when it is reasonable and safe."
      : "Not the best choice. FRC values call for respect, honesty, safety, and helping others when possible.";
  }
}
// STUDENT NOTE: Exposes `checkValuesChoice` globally so inline HTML such as onclick="checkValuesChoice(...)" can call it.
window.checkValuesChoice = checkValuesChoice;

// STUDENT NOTE: Initialization function `initRegionalMatch`. It finds the needed HTML elements and attaches behavior/listeners. Call it after the page DOM exists.
function initRegionalMatch() {
  // Use delegated events so the activity works even if Reveal initializes,
  // re-renders, or changes slides after this file first loads.
  document.querySelectorAll(".regional-match-slide").forEach((slide) => {
    slide.querySelectorAll(".regional-match-chip").forEach((chip, index) => {
      if (!chip.dataset.originalIndex) chip.dataset.originalIndex = String(index);
      chip.setAttribute("tabindex", "0");
      chip.setAttribute("role", "button");
      if (!chip.hasAttribute("aria-pressed")) chip.setAttribute("aria-pressed", "false");
    });

    slide.querySelectorAll(".regional-match-zone").forEach((zone) => {
      zone.setAttribute("tabindex", "0");
      zone.setAttribute("role", "button");
    });
  });

  if (window.__regionalMatchEventsInstalled) return;
  // STUDENT NOTE: Exposes `__regionalMatchEventsInstalled` globally so inline HTML such as onclick="__regionalMatchEventsInstalled(...)" can call it.
  window.__regionalMatchEventsInstalled = true;

  let draggedChip = null;

  // STUDENT NOTE: Helper function `getSlide`. It retrieves or derives a value so the rest of the code does not repeat the same logic.
  function getSlide(element) {
    return element ? element.closest(".regional-match-slide") : null;
  }

  // STUDENT NOTE: Helper function `getBank`. It retrieves or derives a value so the rest of the code does not repeat the same logic.
  function getBank(slide) {
    return slide ? slide.querySelector(".regional-match-bank") : null;
  }

  // STUDENT NOTE: Helper function `getFeedback`. It retrieves or derives a value so the rest of the code does not repeat the same logic.
  function getFeedback(slide) {
    return slide ? slide.querySelector(".regional-match-feedback") : null;
  }

  // STUDENT NOTE: Function `clearResultState` groups one reusable behavior. Keep one clear responsibility per function so future students can test and modify it safely.
  function clearResultState(chip) {
    if (chip) chip.classList.remove("correct", "incorrect", "unplaced");
  }

  // STUDENT NOTE: Function `clearSelections` groups one reusable behavior. Keep one clear responsibility per function so future students can test and modify it safely.
  function clearSelections(slide, except = null) {
    if (!slide) return;
    slide.querySelectorAll(".regional-match-chip.selected").forEach((chip) => {
      if (chip !== except) {
        chip.classList.remove("selected");
        chip.setAttribute("aria-pressed", "false");
      }
    });
  }

  // STUDENT NOTE: Selection handler `selectedChipFor`. It records what the student selected and usually adds a CSS class so the choice is visible.
  function selectedChipFor(slide) {
    return slide ? slide.querySelector(".regional-match-chip.selected") : null;
  }

  // STUDENT NOTE: Function `moveChipToZone` groups one reusable behavior. Keep one clear responsibility per function so future students can test and modify it safely.
  function moveChipToZone(chip, zone) {
    const slide = getSlide(zone);
    const bank = getBank(slide);
    const drop = zone ? zone.querySelector(".regional-match-drop") : null;
    if (!slide || !bank || !chip || !drop) return;

    const existing = drop.querySelector(".regional-match-chip");
    if (existing && existing !== chip) {
      clearResultState(existing);
      existing.classList.remove("selected");
      existing.setAttribute("aria-pressed", "false");
      bank.appendChild(existing);
    }

    clearResultState(chip);
    chip.classList.remove("selected", "dragging");
    chip.setAttribute("aria-pressed", "false");
    drop.appendChild(chip);

    const feedback = getFeedback(slide);
    if (feedback) feedback.textContent = "";
  }

  // STUDENT NOTE: Function `moveChipToBank` groups one reusable behavior. Keep one clear responsibility per function so future students can test and modify it safely.
  function moveChipToBank(chip, bank) {
    const slide = getSlide(bank);
    if (!slide || !bank || !chip) return;

    clearResultState(chip);
    chip.classList.remove("selected", "dragging");
    chip.setAttribute("aria-pressed", "false");
    bank.appendChild(chip);

    const feedback = getFeedback(slide);
    if (feedback) feedback.textContent = "";
  }

  // STUDENT NOTE: Answer-checking function `checkRegionalMatch`. It reads the user state, compares it with the expected answer/data attributes, and updates feedback classes/text.
  function checkRegionalMatch(slide) {
    if (!slide) return;
    const bank = getBank(slide);
    const chips = Array.from(slide.querySelectorAll(".regional-match-chip"));
    const zones = Array.from(slide.querySelectorAll(".regional-match-zone"));
    const feedback = getFeedback(slide);
    if (!bank) return;

    clearSelections(slide);
    let correct = 0;
    let placed = 0;

    chips.forEach(clearResultState);

    zones.forEach((zone) => {
      const chip = zone.querySelector(".regional-match-chip");
      if (!chip) return;
      placed += 1;

      if (chip.dataset.match === zone.dataset.zone) {
        chip.classList.add("correct");
        correct += 1;
      } else {
        chip.classList.add("incorrect");
      }
    });

    chips.forEach((chip) => {
      if (chip.parentElement === bank) chip.classList.add("unplaced");
    });

    if (!feedback) return;
    if (placed < chips.length) {
      feedback.textContent = `Place all ${chips.length} cards before checking. ${correct}/${chips.length} are currently correct.`;
    } else if (correct === chips.length) {
      feedback.textContent = "Correct. You matched the regional areas.";
    } else {
      feedback.textContent = `${correct}/${chips.length} correct. Move the red cards and try again.`;
    }
  }

  // STUDENT NOTE: Reset function `resetRegionalMatch`. It should return this activity to its original state by clearing classes, values, and feedback created during interaction.
  function resetRegionalMatch(slide) {
    if (!slide) return;
    const bank = getBank(slide);
    const feedback = getFeedback(slide);
    if (!bank) return;

    Array.from(slide.querySelectorAll(".regional-match-chip"))
      .sort((a, b) => Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex))
      .forEach((chip) => {
        chip.classList.remove("selected", "correct", "incorrect", "unplaced", "dragging");
        chip.setAttribute("aria-pressed", "false");
        bank.appendChild(chip);
      });

    slide.querySelectorAll(".regional-match-zone, .regional-match-bank").forEach((area) => {
      area.classList.remove("drag-over");
    });

    draggedChip = null;
    if (feedback) feedback.textContent = "";
  }

  // Capture clicks before Reveal can interpret them as navigation gestures.
  // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const chip = target.closest(".regional-match-chip");
    if (chip) {
      const slide = getSlide(chip);
      if (!slide) return;
      event.preventDefault();
      event.stopPropagation();

      const alreadySelected = chip.classList.contains("selected");
      clearSelections(slide, alreadySelected ? null : chip);
      clearResultState(chip);
      chip.classList.toggle("selected", !alreadySelected);
      chip.setAttribute("aria-pressed", alreadySelected ? "false" : "true");

      const feedback = getFeedback(slide);
      if (feedback) feedback.textContent = alreadySelected ? "" : "Now click the matching regional area.";
      return;
    }

    const checkButton = target.closest(".check-regional-match");
    if (checkButton) {
      event.preventDefault();
      event.stopPropagation();
      checkRegionalMatch(getSlide(checkButton));
      return;
    }

    const resetButton = target.closest(".reset-regional-match");
    if (resetButton) {
      event.preventDefault();
      event.stopPropagation();
      resetRegionalMatch(getSlide(resetButton));
      return;
    }

    const zone = target.closest(".regional-match-zone");
    if (zone) {
      const slide = getSlide(zone);
      const selected = selectedChipFor(slide);
      if (!selected) return;
      event.preventDefault();
      event.stopPropagation();
      moveChipToZone(selected, zone);
      return;
    }

    const bank = target.closest(".regional-match-bank");
    if (bank && target === bank) {
      const slide = getSlide(bank);
      const selected = selectedChipFor(slide);
      if (selected && !bank.contains(selected)) {
        event.preventDefault();
        event.stopPropagation();
        moveChipToBank(selected, bank);
      }
    }
  }, true);

  // STUDENT NOTE: Event listener for `keydown`. The callback below runs whenever that user/browser event occurs.
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const chip = target.closest(".regional-match-chip");
    const zone = target.closest(".regional-match-zone");
    if (chip) {
      event.preventDefault();
      chip.click();
    } else if (zone) {
      const selected = selectedChipFor(getSlide(zone));
      if (selected) {
        event.preventDefault();
        moveChipToZone(selected, zone);
      }
    }
  }, true);

  // STUDENT NOTE: Event listener for `dragstart`. The callback below runs whenever that user/browser event occurs.
  document.addEventListener("dragstart", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const chip = target ? target.closest(".regional-match-chip") : null;
    if (!chip) return;

    draggedChip = chip;
    clearSelections(getSlide(chip));
    clearResultState(chip);
    chip.classList.add("dragging");

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", chip.dataset.match || "regional-match-chip");
    }
  }, true);

  // STUDENT NOTE: Event listener for `dragover`. The callback below runs whenever that user/browser event occurs.
  document.addEventListener("dragover", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const area = target ? target.closest(".regional-match-zone, .regional-match-bank") : null;
    if (!area || !draggedChip) return;
    event.preventDefault();
    area.classList.add("drag-over");
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
  }, true);

  // STUDENT NOTE: Event listener for `dragleave`. The callback below runs whenever that user/browser event occurs.
  document.addEventListener("dragleave", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const area = target ? target.closest(".regional-match-zone, .regional-match-bank") : null;
    if (!area) return;
    const related = event.relatedTarget instanceof Node ? event.relatedTarget : null;
    if (!related || !area.contains(related)) area.classList.remove("drag-over");
  }, true);

  // STUDENT NOTE: Event listener for `drop`. The callback below runs whenever that user/browser event occurs.
  document.addEventListener("drop", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const zone = target ? target.closest(".regional-match-zone") : null;
    const bank = target ? target.closest(".regional-match-bank") : null;
    if (!draggedChip || (!zone && !bank)) return;

    event.preventDefault();
    event.stopPropagation();

    if (zone) {
      zone.classList.remove("drag-over");
      moveChipToZone(draggedChip, zone);
    } else if (bank) {
      bank.classList.remove("drag-over");
      moveChipToBank(draggedChip, bank);
    }

    draggedChip = null;
  }, true);

  // STUDENT NOTE: Event listener for `dragend`. The callback below runs whenever that user/browser event occurs.
  document.addEventListener("dragend", () => {
    if (draggedChip) draggedChip.classList.remove("dragging");
    document.querySelectorAll(".regional-match-zone.drag-over, .regional-match-bank.drag-over").forEach((area) => {
      area.classList.remove("drag-over");
    });
    draggedChip = null;
  }, true);
}

// STUDENT NOTE: Click interaction `toggleBehaviorCard`. It changes classes/text so an element can reveal, hide, or select information without leaving the slide.
function toggleBehaviorCard(card) {
  card.classList.toggle("selected");
  card.setAttribute("aria-pressed", card.classList.contains("selected") ? "true" : "false");
  card.classList.remove("correct", "incorrect", "missed");
}
// STUDENT NOTE: Exposes `toggleBehaviorCard` globally so inline HTML such as onclick="toggleBehaviorCard(...)" can call it.
window.toggleBehaviorCard = toggleBehaviorCard;

// STUDENT NOTE: Answer-checking function `checkBehaviorCards`. It reads the user state, compares it with the expected answer/data attributes, and updates feedback classes/text.
function checkBehaviorCards(button) {
  const slide = button.closest(".behavior-check-slide");
  if (!slide) return;
  const cards = slide.querySelectorAll(".behavior-card");
  const feedback = slide.querySelector(".behavior-feedback");
  let correct = 0;
  cards.forEach((card) => {
    const isGood = card.dataset.good === "true";
    const isSelected = card.classList.contains("selected");
    card.classList.remove("correct", "incorrect", "missed");
    if (isGood && isSelected) { card.classList.add("correct"); correct++; }
    else if (!isGood && !isSelected) { card.classList.add("correct"); correct++; }
    else if (isGood && !isSelected) card.classList.add("missed");
    else card.classList.add("incorrect");
  });
  if (feedback) {
    if (correct === cards.length) feedback.textContent = "Correct. These habits build a strong regional experience.";
    else feedback.textContent = `${correct}/${cards.length} correct. Green is correct, red is incorrect, and yellow means a good behavior was missed.`;
  }
}
// STUDENT NOTE: Exposes `checkBehaviorCards` globally so inline HTML such as onclick="checkBehaviorCards(...)" can call it.
window.checkBehaviorCards = checkBehaviorCards;

// STUDENT NOTE: Reset function `resetBehaviorCards`. It should return this activity to its original state by clearing classes, values, and feedback created during interaction.
function resetBehaviorCards(button) {
  const slide = button.closest(".behavior-check-slide");
  if (!slide) return;
  const cards = slide.querySelectorAll(".behavior-card");
  const feedback = slide.querySelector(".behavior-feedback");
  cards.forEach((card) => {
    card.classList.remove("selected", "correct", "incorrect", "missed");
    card.setAttribute("aria-pressed", "false");
  });
  if (feedback) feedback.textContent = "Select the strongest regional behaviors.";
}
// STUDENT NOTE: Exposes `resetBehaviorCards` globally so inline HTML such as onclick="resetBehaviorCards(...)" can call it.
window.resetBehaviorCards = resetBehaviorCards;

// STUDENT NOTE: Initialization function `initBehaviorCards`. It finds the needed HTML elements and attaches behavior/listeners. Call it after the page DOM exists.
function initBehaviorCards() {
  document.querySelectorAll(".behavior-card").forEach((card) => {
    card.setAttribute("aria-pressed", "false");
  });
}

// STUDENT NOTE: Initialization function `initFrcRoleCards`. It finds the needed HTML elements and attaches behavior/listeners. Call it after the page DOM exists.
function initFrcRoleCards() {
  document.querySelectorAll(".frcintro-role-card").forEach((card) => {
    card.setAttribute("aria-pressed", "false");
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
  initFrcRoleCards();
  initSeasonSort();
  initRegionalMatch();
  initBehaviorCards();
});

// Initialize the regional activity immediately when possible and again when Reveal is ready.
if (document.readyState === "loading") {
  // STUDENT NOTE: Event listener for `DOMContentLoaded`. The callback below runs whenever that user/browser event occurs.
  document.addEventListener("DOMContentLoaded", initRegionalMatch, { once: true });
} else {
  initRegionalMatch();
}

if (window.Reveal) {
  // STUDENT NOTE: Reveal.js `ready` hook. Use these hooks when behavior should run as slides open or change.
  Reveal.on("ready", initRegionalMatch);
}

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
        if (result) result.textContent = "Complete and pass the quiz before opening the completion certificate.";
        if (hint) hint.textContent = `Passing score: ${passingScore}/${Object.keys(frcintroCorrectAnswers).length}.`;
      }, 0);
    }
  });
}
