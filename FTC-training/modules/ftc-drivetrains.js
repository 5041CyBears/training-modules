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
/* 5041 Training Hub script: FTC-training/modules/ftc-drivetrains.js
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
const drivetrainCorrectAnswers = {'q1': 'b', 'q2': 'a', 'q3': 'b', 'q4': 'b', 'q5': 'a', 'q6': 'b', 'q7': 'a', 'q8': 'a', 'q9': 'b', 'q10': 'a', 'q11': 'b', 'q12': 'a', 'q13': 'a', 'q14': 'a', 'q15': 'b', 'q16': 'a', 'q17': 'a', 'q18': 'b', 'q19': 'a', 'q20': 'b'};
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
  if (certificateName) certificateName.textContent = participantName || "Student Name";
}

// STUDENT NOTE: UI/state helper `setCertificateDownloadEnabled`. It updates page content or control state to match the current application data.
function setCertificateDownloadEnabled(enabled) {
  const button = document.getElementById("downloadCertificate");
  if (button) button.disabled = !enabled;
}

// STUDENT NOTE: Helper function `getSafeFileName`. It retrieves or derives a value so the rest of the code does not repeat the same logic.
function getSafeFileName(text) {
  return (text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "certificate");
}

// STUDENT NOTE: Download/export function `downloadCertificatePdf`. It converts page content into a downloadable artifact; external libraries used here must load before this function runs.
async function downloadCertificatePdf() {
  if (!quizPassed) {
    alert("Complete and pass the quiz before downloading the certificate.");
    return;
  }
  updateCertificateName();
  const certificate = document.querySelector("#complete .certificate-card");
  if (!certificate || !window.html2canvas || !window.jspdf) {
    alert("Certificate tools could not be loaded.");
    return;
  }
  const canvas = await html2canvas(certificate, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
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
  const name = getSafeFileName(getParticipantName() || "student");
  pdf.save(`${name}-ftc-drivetrain-design-certificate.pdf`);
}

// STUDENT NOTE: Answer-checking function `gradeQuiz`. It reads the user state, compares it with the expected answer/data attributes, and updates feedback classes/text.
function gradeQuiz() {
  const result = document.getElementById("quizResult");
  const hint = document.getElementById("quizHint");
  const complete = document.getElementById("complete");
  const note = document.getElementById("completionNote");
  const totalQuestions = Object.keys(drivetrainCorrectAnswers).length;
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
  Object.entries(drivetrainCorrectAnswers).forEach(([question, answer]) => {
    const selected = document.querySelector(`input[name="${question}"]:checked`);
    if (!selected) unanswered.push(question);
    else if (selected.value === answer) score++;
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
  document.querySelectorAll("input[type='radio']").forEach((input) => { input.checked = false; });
  quizPassed = false;
  setCertificateDownloadEnabled(false);
  const complete = document.getElementById("complete");
  const result = document.getElementById("quizResult");
  const hint = document.getElementById("quizHint");
  const note = document.getElementById("completionNote");
  if (complete) complete.classList.add("locked");
  if (result) { result.textContent = "Not submitted."; result.className = "result"; }
  if (hint) hint.textContent = "After passing, advance to the final completion certificate.";
  if (note) note.textContent = "Complete after passing the required quiz.";
}

// STUDENT NOTE: Answer-checking function `checkDtChoice`. It reads the user state, compares it with the expected answer/data attributes, and updates feedback classes/text.
function checkDtChoice(button) {
  const slide = button.closest(".dt-scenario-slide");
  if (!slide) return;
  const buttons = slide.querySelectorAll(".dt-choice-options button");
  const feedback = slide.querySelector(".dt-choice-feedback");
  const isCorrect = button.dataset.correct === "true";
  buttons.forEach((item) => item.classList.remove("correct", "incorrect"));
  button.classList.add(isCorrect ? "correct" : "incorrect");
  if (feedback) feedback.textContent = isCorrect ? "Correct. Build the reliable foundation first." : "Not the best first choice. Match the drivebase to time, experience, and strategy.";
}
// STUDENT NOTE: Exposes `checkDtChoice` globally so inline HTML such as onclick="checkDtChoice(...)" can call it.
window.checkDtChoice = checkDtChoice;

// STUDENT NOTE: Initialization function `initDtSort`. It finds the needed HTML elements and attaches behavior/listeners. Call it after the page DOM exists.
function initDtSort() {
  document.querySelectorAll(".drivetrain-sort-slide").forEach((slide) => {
    if (slide.dataset.sortReady === "true") return;
    slide.dataset.sortReady = "true";
    const bank = slide.querySelector(".dt-sort-bank");
    const chips = Array.from(slide.querySelectorAll(".dt-sort-chip"));
    const zones = Array.from(slide.querySelectorAll(".dt-sort-zone"));
    const checkButton = slide.querySelector(".check-dt-sort");
    const resetButton = slide.querySelector(".reset-dt-sort");
    const feedback = slide.querySelector(".dt-sort-feedback");
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
        dragged.classList.remove("correct", "incorrect");
        if (area.classList.contains("dt-sort-zone")) area.querySelector(".dt-sort-list").appendChild(dragged);
        else bank.appendChild(dragged);
      });
    });
    // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
    if (checkButton) checkButton.addEventListener("click", () => {
      let correct = 0, placed = 0;
      chips.forEach((chip) => chip.classList.remove("correct", "incorrect"));
      zones.forEach((zone) => {
        const zoneName = zone.dataset.zone;
        zone.querySelectorAll(".dt-sort-chip").forEach((chip) => {
          placed++;
          if (chip.dataset.answer === zoneName) { chip.classList.add("correct"); correct++; }
          else chip.classList.add("incorrect");
        });
      });
      if (feedback) {
        if (placed < chips.length) feedback.textContent = `Place all ${chips.length} cards before checking.`;
        else if (correct === chips.length) feedback.textContent = "Correct. You matched each clue to the drivetrain type.";
        else feedback.textContent = `${correct}/${chips.length} correct. Move the red cards and try again.`;
      }
    });
    // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
    if (resetButton) resetButton.addEventListener("click", () => {
      chips.sort((a,b) => Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex)).forEach((chip) => { chip.classList.remove("correct", "incorrect"); bank.appendChild(chip); });
      if (feedback) feedback.textContent = "";
    });
  });
}

// STUDENT NOTE: Click interaction `revealDtCard`. It changes classes/text so an element can reveal, hide, or select information without leaving the slide.
function revealDtCard(card) {
  const slide = card.closest(".dt-wheel-reveal-slide");
  const hiddenText = card.dataset.title || card.textContent.trim();
  if (!card.dataset.title) card.dataset.title = hiddenText;
  const willReveal = !card.classList.contains("revealed");
  card.classList.remove("role-flipping");
  void card.offsetWidth;
  card.classList.add("role-flipping");
  window.setTimeout(() => {
    card.classList.toggle("revealed", willReveal);
    card.textContent = willReveal ? card.dataset.role : card.dataset.title;
    card.setAttribute("aria-pressed", willReveal ? "true" : "false");
    if (slide) {
      const total = slide.querySelectorAll(".dt-reveal-card").length;
      const count = slide.querySelectorAll(".dt-reveal-card.revealed").length;
      const feedback = slide.querySelector(".dt-reveal-feedback");
      if (feedback) feedback.textContent = `${count} of ${total} revealed.`;
    }
  }, 170);
  window.setTimeout(() => card.classList.remove("role-flipping"), 420);
}
// STUDENT NOTE: Exposes `revealDtCard` globally so inline HTML such as onclick="revealDtCard(...)" can call it.
window.revealDtCard = revealDtCard;

// STUDENT NOTE: Calculator function `calculateDriveSpeed`. It reads numeric inputs, performs the calculation, then writes a student-readable result back into the page.
function calculateDriveSpeed() {
  const diameter = Number(document.getElementById("wheelDiameter")?.value || 0);
  const rpm = Number(document.getElementById("wheelRpm")?.value || 0);
  const result = document.getElementById("driveSpeedResult");
  if (!result) return;
  if (diameter <= 0 || rpm <= 0) { result.textContent = "Enter positive wheel diameter and RPM values."; return; }
  const inchesPerMinute = Math.PI * diameter * rpm;
  const feetPerSecond = inchesPerMinute / 12 / 60;
  result.textContent = `Estimated free speed: ${feetPerSecond.toFixed(1)} ft/s. Real speed will be lower under load.`;
}
// STUDENT NOTE: Exposes `calculateDriveSpeed` globally so inline HTML such as onclick="calculateDriveSpeed(...)" can call it.
window.calculateDriveSpeed = calculateDriveSpeed;

// STUDENT NOTE: Click interaction `toggleDtCheckCard`. It changes classes/text so an element can reveal, hide, or select information without leaving the slide.
function toggleDtCheckCard(card) {
  card.classList.toggle("selected");
  card.setAttribute("aria-pressed", card.classList.contains("selected") ? "true" : "false");
  card.classList.remove("correct", "incorrect", "missed");
}
// STUDENT NOTE: Exposes `toggleDtCheckCard` globally so inline HTML such as onclick="toggleDtCheckCard(...)" can call it.
window.toggleDtCheckCard = toggleDtCheckCard;

// STUDENT NOTE: Answer-checking function `checkDtCheckCards`. It reads the user state, compares it with the expected answer/data attributes, and updates feedback classes/text.
function checkDtCheckCards(button) {
  const slide = button.closest(".dt-balance-check-slide");
  if (!slide) return;
  const cards = Array.from(slide.querySelectorAll(".dt-check-card"));
  const feedback = slide.querySelector(".dt-check-feedback");
  let correct = 0;
  cards.forEach((card) => {
    const isGood = card.dataset.good === "true";
    const selected = card.classList.contains("selected");
    card.classList.remove("correct", "incorrect", "missed");
    if (isGood && selected) { card.classList.add("correct"); correct++; }
    else if (!isGood && !selected) { card.classList.add("correct"); correct++; }
    else if (isGood && !selected) card.classList.add("missed");
    else card.classList.add("incorrect");
  });
  if (feedback) feedback.textContent = correct === cards.length ? "Correct. Those choices improve repeatability." : `${correct}/${cards.length} correct. Green is correct, red should not be selected, yellow means a helpful choice was missed.`;
}
// STUDENT NOTE: Exposes `checkDtCheckCards` globally so inline HTML such as onclick="checkDtCheckCards(...)" can call it.
window.checkDtCheckCards = checkDtCheckCards;

// STUDENT NOTE: Reset function `resetDtCheckCards`. It should return this activity to its original state by clearing classes, values, and feedback created during interaction.
function resetDtCheckCards(button) {
  const slide = button.closest(".dt-balance-check-slide");
  if (!slide) return;
  slide.querySelectorAll(".dt-check-card").forEach((card) => { card.classList.remove("selected", "correct", "incorrect", "missed"); card.setAttribute("aria-pressed", "false"); });
  const feedback = slide.querySelector(".dt-check-feedback");
  if (feedback) feedback.textContent = "Select the helpful design choices.";
}
// STUDENT NOTE: Exposes `resetDtCheckCards` globally so inline HTML such as onclick="resetDtCheckCards(...)" can call it.
window.resetDtCheckCards = resetDtCheckCards;

// STUDENT NOTE: Selection handler `selectDtOrderCard`. It records what the student selected and usually adds a CSS class so the choice is visible.
function selectDtOrderCard(card) {
  const slide = card.closest(".dt-test-sequence-slide");
  if (!slide || card.classList.contains("selected")) return;
  const selectedCount = slide.querySelectorAll(".dt-order-card.selected").length + 1;
  card.classList.add("selected");
  card.dataset.selectedOrder = selectedCount;
  card.classList.remove("correct", "incorrect", "missed");
}
// STUDENT NOTE: Exposes `selectDtOrderCard` globally so inline HTML such as onclick="selectDtOrderCard(...)" can call it.
window.selectDtOrderCard = selectDtOrderCard;

// STUDENT NOTE: Answer-checking function `checkDtOrder`. It reads the user state, compares it with the expected answer/data attributes, and updates feedback classes/text.
function checkDtOrder(button) {
  const slide = button.closest(".dt-test-sequence-slide");
  if (!slide) return;
  const cards = Array.from(slide.querySelectorAll(".dt-order-card"));
  const feedback = slide.querySelector(".dt-order-feedback");
  let correct = 0;
  cards.forEach((card) => {
    const selectedOrder = Number(card.dataset.selectedOrder || 0);
    const expectedOrder = Number(card.dataset.order || 0);
    card.classList.remove("correct", "incorrect", "missed");
    if (!selectedOrder) card.classList.add("missed");
    else if (selectedOrder === expectedOrder) { card.classList.add("correct"); correct++; }
    else card.classList.add("incorrect");
  });
  if (feedback) feedback.textContent = correct === cards.length ? "Correct order. Start safe and simple, then add complexity and stress." : `${correct}/${cards.length} in the correct order. Reset and try again.`;
}
// STUDENT NOTE: Exposes `checkDtOrder` globally so inline HTML such as onclick="checkDtOrder(...)" can call it.
window.checkDtOrder = checkDtOrder;

// STUDENT NOTE: Reset function `resetDtOrder`. It should return this activity to its original state by clearing classes, values, and feedback created during interaction.
function resetDtOrder(button) {
  const slide = button.closest(".dt-test-sequence-slide");
  if (!slide) return;
  slide.querySelectorAll(".dt-order-card").forEach((card) => { card.classList.remove("selected", "correct", "incorrect", "missed"); delete card.dataset.selectedOrder; });
  const feedback = slide.querySelector(".dt-order-feedback");
  if (feedback) feedback.textContent = "Click the cards in the order you would test them.";
}
// STUDENT NOTE: Exposes `resetDtOrder` globally so inline HTML such as onclick="resetDtOrder(...)" can call it.
window.resetDtOrder = resetDtOrder;

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
  initDtSort();
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
      if (result) result.textContent = "Complete and pass the quiz before opening the completion certificate.";
      if (hint) hint.textContent = `Passing score: ${passingScore}/${Object.keys(drivetrainCorrectAnswers).length}.`;
    }, 0);
  }
});
