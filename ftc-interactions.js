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
/* Shared interactions for 5041 FTC Training Hub */
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

// STUDENT NOTE: Click interaction `revealRole`. It changes classes/text so an element can reveal, hide, or select information without leaving the slide.
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
// STUDENT NOTE: Exposes `revealRole` globally so inline HTML such as onclick="revealRole(...)" can call it.
window.revealRole = revealRole;

// STUDENT NOTE: Answer-checking function `checkScenario`. It reads the user state, compares it with the expected answer/data attributes, and updates feedback classes/text.
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
// STUDENT NOTE: Exposes `checkScenario` globally so inline HTML such as onclick="checkScenario(...)" can call it.
window.checkScenario = checkScenario;

// STUDENT NOTE: Initialization function `initSortSlides`. It finds the needed HTML elements and attaches behavior/listeners. Call it after the page DOM exists.
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
        if (area.classList.contains("sort-zone")) area.querySelector(".sort-list").appendChild(dragged);
        else bank.appendChild(dragged);
      });
    });
    // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
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
    // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
    if (resetButton) resetButton.addEventListener("click", () => {
      chips.sort((a,b) => Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex)).forEach((chip) => {
        chip.classList.remove("correct", "incorrect", "unplaced", "dragging");
        bank.appendChild(chip);
      });
      if (feedback) feedback.textContent = "";
    });
  });
}

// STUDENT NOTE: Selection handler `selectRating`. It records what the student selected and usually adds a CSS class so the choice is visible.
function selectRating(card) {
  const slide = card.closest(".rating-slide");
  if (!slide) return;
  slide.querySelectorAll(".rating-card").forEach((item) => item.classList.remove("selected"));
  card.classList.add("selected");
  const out = slide.querySelector(".rating-output");
  if (out) out.textContent = card.dataset.message || "Use this rating to set your next goal with a mentor.";
}
// STUDENT NOTE: Exposes `selectRating` globally so inline HTML such as onclick="selectRating(...)" can call it.
window.selectRating = selectRating;

// STUDENT NOTE: Event listener for `DOMContentLoaded`. The callback below runs whenever that user/browser event occurs.
document.addEventListener("DOMContentLoaded", initSortSlides);
