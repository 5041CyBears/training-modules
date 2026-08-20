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

const drivetrainCorrectAnswers = {'q1': 'b', 'q2': 'a', 'q3': 'b', 'q4': 'b', 'q5': 'a', 'q6': 'b', 'q7': 'a', 'q8': 'a', 'q9': 'b', 'q10': 'a', 'q11': 'b', 'q12': 'a', 'q13': 'a', 'q14': 'a', 'q15': 'b', 'q16': 'a', 'q17': 'a', 'q18': 'b', 'q19': 'a', 'q20': 'b'};
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
  if (certificateName) certificateName.textContent = participantName || "Student Name";
}

function setCertificateDownloadEnabled(enabled) {
  const button = document.getElementById("downloadCertificate");
  if (button) button.disabled = !enabled;
}

function getSafeFileName(text) {
  return (text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "certificate");
}

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
window.checkDtChoice = checkDtChoice;

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
      chip.addEventListener("dragstart", () => { dragged = chip; chip.classList.add("dragging"); });
      chip.addEventListener("dragend", () => { dragged = null; chip.classList.remove("dragging"); });
    });
    [...zones, bank].forEach((area) => {
      area.addEventListener("dragover", (event) => event.preventDefault());
      area.addEventListener("drop", (event) => {
        event.preventDefault();
        if (!dragged) return;
        dragged.classList.remove("correct", "incorrect");
        if (area.classList.contains("dt-sort-zone")) area.querySelector(".dt-sort-list").appendChild(dragged);
        else bank.appendChild(dragged);
      });
    });
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
    if (resetButton) resetButton.addEventListener("click", () => {
      chips.sort((a,b) => Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex)).forEach((chip) => { chip.classList.remove("correct", "incorrect"); bank.appendChild(chip); });
      if (feedback) feedback.textContent = "";
    });
  });
}

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
window.revealDtCard = revealDtCard;

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
window.calculateDriveSpeed = calculateDriveSpeed;

function toggleDtCheckCard(card) {
  card.classList.toggle("selected");
  card.setAttribute("aria-pressed", card.classList.contains("selected") ? "true" : "false");
  card.classList.remove("correct", "incorrect", "missed");
}
window.toggleDtCheckCard = toggleDtCheckCard;

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
window.checkDtCheckCards = checkDtCheckCards;

function resetDtCheckCards(button) {
  const slide = button.closest(".dt-balance-check-slide");
  if (!slide) return;
  slide.querySelectorAll(".dt-check-card").forEach((card) => { card.classList.remove("selected", "correct", "incorrect", "missed"); card.setAttribute("aria-pressed", "false"); });
  const feedback = slide.querySelector(".dt-check-feedback");
  if (feedback) feedback.textContent = "Select the helpful design choices.";
}
window.resetDtCheckCards = resetDtCheckCards;

function selectDtOrderCard(card) {
  const slide = card.closest(".dt-test-sequence-slide");
  if (!slide || card.classList.contains("selected")) return;
  const selectedCount = slide.querySelectorAll(".dt-order-card.selected").length + 1;
  card.classList.add("selected");
  card.dataset.selectedOrder = selectedCount;
  card.classList.remove("correct", "incorrect", "missed");
}
window.selectDtOrderCard = selectDtOrderCard;

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
window.checkDtOrder = checkDtOrder;

function resetDtOrder(button) {
  const slide = button.closest(".dt-test-sequence-slide");
  if (!slide) return;
  slide.querySelectorAll(".dt-order-card").forEach((card) => { card.classList.remove("selected", "correct", "incorrect", "missed"); delete card.dataset.selectedOrder; });
  const feedback = slide.querySelector(".dt-order-feedback");
  if (feedback) feedback.textContent = "Click the cards in the order you would test them.";
}
window.resetDtOrder = resetDtOrder;

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
  updateCertificateName();
  initDtSort();
});

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
