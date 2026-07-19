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

const motorCorrectAnswers = {
  q1: "b", q2: "a", q3: "a", q4: "a", q5: "b",
  q6: "a", q7: "a", q8: "a", q9: "a", q10: "a",
  q11: "a", q12: "a", q13: "a", q14: "a", q15: "a",
  q16: "a", q17: "a", q18: "a", q19: "a", q20: "a"
};
const passingScore = 18;
let quizPassed = false;

function gradeQuiz() {
  let score = 0;
  let unanswered = 0;
  for (const [name, correct] of Object.entries(motorCorrectAnswers)) {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    if (!checked) unanswered++;
    else if (checked.value === correct) score++;
  }
  const totalQuestions = Object.keys(motorCorrectAnswers).length;
  const result = document.getElementById("quizResult");
  const hint = document.getElementById("quizHint");
  const complete = document.getElementById("complete");
  const note = document.getElementById("completionNote");
  if (!result || !hint || !complete || !note) return;
  if (unanswered > 0) {
    quizPassed = false;
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
    result.textContent = `Passed: ${score}/${totalQuestions}. Completion slide unlocked.`;
    result.className = "result success";
    hint.textContent = "You passed. Advance to the completion slide.";
    note.textContent = `Module complete. Quiz score: ${score}/${totalQuestions}.`;
  } else {
    quizPassed = false;
    complete.classList.add("locked");
    result.textContent = `Not yet: ${score}/${totalQuestions}. Review and try again.`;
    result.className = "result";
    hint.textContent = `You need at least ${passingScore}/${totalQuestions} to unlock completion.`;
    note.textContent = "Complete after passing the required quiz.";
  }
}

function resetQuiz() {
  Object.keys(motorCorrectAnswers).forEach(questionName => {
    document.querySelectorAll(`input[name="${questionName}"]`).forEach(input => { input.checked = false; });
  });
  quizPassed = false;
  const complete = document.getElementById("complete");
  const result = document.getElementById("quizResult");
  const hint = document.getElementById("quizHint");
  const note = document.getElementById("completionNote");
  if (complete) complete.classList.add("locked");
  if (result) { result.textContent = "Not submitted."; result.className = "result"; }
  if (hint) hint.textContent = "After passing, advance to the final completion slide.";
  if (note) note.textContent = "Complete after passing the required quiz.";
}

document.addEventListener("DOMContentLoaded", () => {
  const gradeButton = document.getElementById("gradeQuiz");
  const resetButton = document.getElementById("resetQuiz");
  if (gradeButton) gradeButton.addEventListener("click", gradeQuiz);
  if (resetButton) resetButton.addEventListener("click", resetQuiz);
  initCategorySort(".motor-sort-slide, .application-sort-slide");
  initMotorCards();
  initScenario();
});

Reveal.on("slidechanged", event => {
  if (event.currentSlide && event.currentSlide.id === "complete" && !quizPassed) {
    const resultsSlide = document.getElementById("quiz-results");
    const resultsIndex = Reveal.getIndices(resultsSlide);
    setTimeout(() => {
      Reveal.slide(resultsIndex.h, resultsIndex.v || 0);
      const result = document.getElementById("quizResult");
      const hint = document.getElementById("quizHint");
      if (result) result.textContent = "Complete and pass the quiz before opening the completion slide.";
      if (hint) hint.textContent = `Passing score: ${passingScore}/${Object.keys(motorCorrectAnswers).length}.`;
    }, 0);
  }
});

function initCategorySort(slideSelector) {
  document.querySelectorAll(slideSelector).forEach(slide => {
    if (slide.dataset.sortInit === "true") return;
    slide.dataset.sortInit = "true";
    const bank = slide.querySelector(".sort-bank");
    const chips = [...slide.querySelectorAll(".sort-chip")];
    const dropAreas = slide.querySelectorAll(".sort-bank, .sort-zone");
    const checkButton = slide.querySelector(".check-sort");
    const resetButton = slide.querySelector(".reset-sort");
    const feedback = slide.querySelector(".activity-feedback");
    let draggedChip = null;
    chips.forEach(chip => {
      chip.addEventListener("dragstart", () => { draggedChip = chip; chip.classList.add("dragging"); });
      chip.addEventListener("dragend", () => { chip.classList.remove("dragging"); draggedChip = null; });
    });
    dropAreas.forEach(area => {
      area.addEventListener("dragover", event => { event.preventDefault(); area.classList.add("drag-over"); });
      area.addEventListener("dragleave", () => area.classList.remove("drag-over"));
      area.addEventListener("drop", event => {
        event.preventDefault();
        area.classList.remove("drag-over");
        if (!draggedChip) return;
        draggedChip.classList.remove("correct", "incorrect");
        if (area.classList.contains("sort-zone")) area.querySelector(".sort-list").appendChild(draggedChip);
        else area.appendChild(draggedChip);
        if (feedback) feedback.textContent = "";
      });
    });
    if (checkButton) {
      checkButton.addEventListener("click", () => {
        let placed = 0;
        let correct = 0;
        slide.querySelectorAll(".sort-zone").forEach(zone => {
          const zoneName = zone.dataset.zone;
          zone.querySelectorAll(".sort-chip").forEach(chip => {
            placed++;
            chip.classList.remove("correct", "incorrect");
            if (chip.dataset.answer === zoneName) { chip.classList.add("correct"); correct++; }
            else chip.classList.add("incorrect");
          });
        });
        if (!feedback) return;
        if (placed < chips.length) feedback.textContent = `Place all ${chips.length} cards before checking.`;
        else if (correct === chips.length) feedback.textContent = "Correct. Nice work.";
        else feedback.textContent = `${correct}/${chips.length} correct. Adjust the red cards and try again.`;
      });
    }
    if (resetButton) {
      resetButton.addEventListener("click", () => {
        chips.sort((a,b) => Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex)).forEach(chip => {
          chip.classList.remove("correct", "incorrect");
          bank.appendChild(chip);
        });
        if (feedback) feedback.textContent = "";
      });
    }
    chips.forEach((chip, index) => chip.dataset.originalIndex = index);
  });
}

function initMotorCards() {
  const motorInfo = {
    cim: {
      title: "CIM",
      image: "assets/motors/cim.png",
      alt: "CIM motor",
      description: "A classic brushed FRC workhorse historically used for drivetrains and heavy mechanisms.",
      checks: [
        "About 5310 RPM free speed.",
        "About 2.425 Nm stall torque.",
        "About 133A stall current.",
        "Good for older drivetrains and robust practice mechanisms.",
        "Heavy compared with many modern brushless options."
      ]
    },

    neo: {
      title: "REV NEO",
      image: "assets/motors/neo.png",
      alt: "REV NEO brushless motor",
      description: "A common CIM-style brushless motor optimized for SPARK MAX and general FRC mechanisms.",
      checks: [
        "5676 RPM free speed.",
        "2.6 Nm stall torque.",
        "105A stall current.",
        "406W peak power.",
        "Integrated relative encoder feedback."
      ]
    },
    
    neo2: {
      title: "REV NEO 2.0",
      image: "assets/motors/neo-2.png",
      alt: "REV NEO 2.0 brushless motor",
      description: "A compact brushless FRC motor that builds on the original REV NEO with a refined package for easier mounting, integration, and service.",
      checks: [
        "Useful for drivetrains, swerve drive motors, arms, elevators, intakes, climbers, and general mechanisms.",
        "Designed as an updated NEO-style brushless motor for FRC use.",
       "Requires a compatible REV brushless motor controller.",
       "Includes sensor feedback through the NEO 2.0 sensor cable connection.",
       "Still needs proper gearing, current limits, and thermal management."
     ]
    },

    vortex: {
      title: "REV NEO Vortex",
      image: "assets/motors/neo-vortex.png",
      alt: "REV NEO Vortex brushless motor",
      description: "A high-power REV brushless motor with high-resolution encoder options and strong performance.",
      checks: [
        "6784 RPM free speed.",
        "3.6 Nm stall torque.",
        "211A stall current.",
        "640W peak power.",
        "Current limits and thermal management matter."
      ]
    },

    krakenX60: {
      title: "WCP Kraken X60",
      image: "assets/motors/kraken-x60.jpg",
      alt: "WCP Kraken X60 brushless motor",
      description: "A modern high-power brushless motor from West Coast Products in the CTRE Talon FX ecosystem.",
      checks: [
        "Designed specifically for FRC.",
        "Used for drivetrains, swerve, shooters, climbers, elevators, and heavy arms.",
        "High power requires strong mechanical design.",
        "CAN wiring, current limits, and configuration matter."
      ]
    },

    krakenX44: {
      title: "WCP Kraken X44",
      image: "assets/motors/kraken-x44.png",
      alt: "WCP Kraken X44 brushless motor",
      description: "A compact brushless motor option in the Kraken/Talon FX ecosystem.",
      checks: [
        "Useful where space and weight matter.",
        "Common for steering motors, intakes, small arms, and compact manipulators.",
        "Lower power than X60.",
        "Still requires correct CTRE configuration and CAN setup."
      ]
    },

    falcon: {
      title: "Falcon 500",
      image: "assets/motors/falcon-500.png",
      alt: "Falcon 500 brushless motor",
      description: "A brushless motor with integrated Talon FX controller and encoder.",
      checks: [
        "Used on legacy high-performance robots.",
        "Common on drivetrains, swerve, shooters, and arms.",
        "Check current legality and vendor support.",
        "Controller replacement differs from separate motor/controller systems."
      ]
    },

    small: {
      title: "Small High-Speed Motors",
      image: "assets/motors/neo-550.png",
      alt: "Examples of small high-speed FRC motors",
      description: "Motors such as NEO 550, 775pro, RedLine, and BAG are fast and lightweight but need careful load management.",
      checks: [
        "Good for intakes, rollers, conveyors, and small shooters.",
        "Often need reductions.",
        "Can overheat quickly if overloaded.",
        "Not ideal for holding heavy arms or stalled loads."
      ]
    }
  };

  const modal = document.getElementById("motorModal");
  const title = document.getElementById("motorModalTitle");
  const description = document.getElementById("motorModalDescription");
  const checks = document.getElementById("motorModalChecks");
  const image = document.getElementById("motorModalImage");
  const close = document.querySelector(".motor-modal-close");

  if (!modal || !title || !description || !checks || !image) return;

  document.querySelectorAll(".motor-click-card[data-motor]").forEach(card => {
    card.addEventListener("click", () => {
      const info = motorInfo[card.dataset.motor];
      if (!info) return;

      card.classList.add("viewed");

      title.textContent = info.title;
      description.textContent = info.description;

      image.src = info.image;
      image.alt = info.alt;

      checks.innerHTML = "";
      info.checks.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        checks.appendChild(li);
      });

      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
    });
  });

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  if (close) close.addEventListener("click", closeModal);

  modal.addEventListener("click", event => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeModal();
  });
}

function initScenario() {
  document.querySelectorAll(".scenario-slide").forEach(slide => {
    const buttons = slide.querySelectorAll(".scenario-options button");
    const feedback = slide.querySelector(".scenario-feedback");
    buttons.forEach(button => {
      button.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("correct", "incorrect"));
        const correct = button.dataset.correct === "true";
        button.classList.add(correct ? "correct" : "incorrect");
        if (feedback) feedback.textContent = correct ? "Correct. The safest response combines software limits, current limits, mechanical review, and gearing checks." : "Not the best choice. Avoid continuing to stall the motor or removing safety limits.";
      });
    });
  });
}
