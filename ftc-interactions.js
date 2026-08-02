/* Shared interactions for 5041 FTC Training Hub */
if (window.Reveal) {
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

function revealRole(card) {
  const slide = card.closest("section");
  const hiddenText = card.dataset.prompt || "Click to reveal a role";
  const willReveal = !card.classList.contains("revealed");
  card.classList.remove("flipping");
  void card.offsetWidth;
  card.classList.add("flipping");
  window.setTimeout(() => {
    card.classList.toggle("revealed", willReveal);
    card.textContent = willReveal ? card.dataset.role : hiddenText;
    card.setAttribute("aria-pressed", willReveal ? "true" : "false");
    const feedback = slide ? slide.querySelector(".role-feedback") : null;
    if (feedback && slide) {
      const cards = slide.querySelectorAll(".role-card");
      const revealed = slide.querySelectorAll(".role-card.revealed");
      feedback.textContent = `${revealed.length} of ${cards.length} cards revealed.`;
    }
  }, 170);
  window.setTimeout(() => card.classList.remove("flipping"), 420);
}
window.revealRole = revealRole;

function checkScenario(button) {
  const slide = button.closest(".scenario-slide");
  if (!slide) return;
  const buttons = slide.querySelectorAll(".scenario-options button");
  const feedback = slide.querySelector(".scenario-feedback");
  const correct = button.dataset.correct === "true";
  buttons.forEach((btn) => {
    btn.classList.remove("correct", "incorrect");
    btn.setAttribute("aria-pressed", "false");
  });
  button.classList.add(correct ? "correct" : "incorrect");
  button.setAttribute("aria-pressed", "true");
  if (feedback) feedback.textContent = correct ? button.dataset.correctFeedback || "Correct." : button.dataset.incorrectFeedback || "Not the best choice. Try again.";
}
window.checkScenario = checkScenario;

function initSortSlides() {
  document.querySelectorAll(".sort-slide").forEach((slide) => {
    if (slide.dataset.sortReady === "true") return;
    slide.dataset.sortReady = "true";
    const bank = slide.querySelector(".sort-bank");
    const chips = Array.from(slide.querySelectorAll(".sort-chip"));
    const zones = Array.from(slide.querySelectorAll(".sort-zone"));
    const checkButton = slide.querySelector(".check-sort");
    const resetButton = slide.querySelector(".reset-sort");
    const feedback = slide.querySelector(".sort-feedback");
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
        dragged.classList.remove("correct", "incorrect", "unplaced");
        if (area.classList.contains("sort-zone")) area.querySelector(".sort-list").appendChild(dragged);
        else bank.appendChild(dragged);
      });
    });
    if (checkButton) checkButton.addEventListener("click", () => {
      let correct = 0;
      let placed = 0;
      chips.forEach((chip) => chip.classList.remove("correct", "incorrect", "unplaced"));
      zones.forEach((zone) => {
        const zoneName = zone.dataset.zone;
        zone.querySelectorAll(".sort-chip").forEach((chip) => {
          placed++;
          if (chip.dataset.answer === zoneName) { chip.classList.add("correct"); correct++; }
          else chip.classList.add("incorrect");
        });
      });
      chips.forEach((chip) => { if (chip.parentElement === bank) chip.classList.add("unplaced"); });
      if (feedback) {
        if (placed < chips.length) feedback.textContent = `Place all ${chips.length} items before checking. ${correct}/${chips.length} are currently correct.`;
        else if (correct === chips.length) feedback.textContent = "Correct. Great job.";
        else feedback.textContent = `${correct}/${chips.length} correct. Move the red cards and try again.`;
      }
    });
    if (resetButton) resetButton.addEventListener("click", () => {
      chips.sort((a,b) => Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex)).forEach((chip) => {
        chip.classList.remove("correct", "incorrect", "unplaced", "dragging");
        bank.appendChild(chip);
      });
      if (feedback) feedback.textContent = "";
    });
  });
}

function selectRating(card) {
  const slide = card.closest(".rating-slide");
  if (!slide) return;
  slide.querySelectorAll(".rating-card").forEach((item) => item.classList.remove("selected"));
  card.classList.add("selected");
  const out = slide.querySelector(".rating-output");
  if (out) out.textContent = card.dataset.message || "Use this rating to set your next goal with a mentor.";
}
window.selectRating = selectRating;

document.addEventListener("DOMContentLoaded", initSortSlides);
