Reveal.initialize({
    hash: true,
    slideNumber: true,
    transition: 'slide',
    backgroundTransition: 'fade',
    plugins: [ RevealMarkdown, RevealNotes ]
  });

  const correctAnswers = {
  q1: "b",
  q2: "a",
  q3: "b",
  q4: "a",
  q5: "c",
  q6: "c",
  q7: "a",
  q8: "a",
  q9: "b",
  q10: "a",
  q11: "b",
  q12: "c",
  q13: "a",
  q14: "c",
  q15: "a",
  q16: "a",
  q17: "b",
  q18: "b",
  q19: "c",
  q20: "c"
};
const passingScore = 18;
let quizPassed = false;

function gradeQuiz() {
  let score = 0;
  let unanswered = 0;

  for (const [name, correct] of Object.entries(correctAnswers)) {
    const checked = document.querySelector(`input[name="${name}"]:checked`);

    if (!checked) {
      unanswered++;
    } else if (checked.value === correct) {
      score++;
    }
  }

  const totalQuestions = Object.keys(correctAnswers).length;
  const result = document.getElementById("quizResult");
  const hint = document.getElementById("quizHint");
  const complete = document.getElementById("complete");
  const note = document.getElementById("completionNote");

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

document.getElementById("gradeQuiz").addEventListener("click", gradeQuiz);

document.getElementById("resetQuiz").addEventListener("click", () => {
  Object.keys(correctAnswers).forEach(questionName => {
    document.querySelectorAll(`input[name="${questionName}"]`).forEach(input => {
      input.checked = false;
    });
  });

  quizPassed = false;

  document.getElementById("complete").classList.add("locked");
  document.getElementById("quizResult").textContent = "Not submitted.";
  document.getElementById("quizResult").className = "result";
  document.getElementById("quizHint").textContent = "After passing, advance to the final completion slide.";
  document.getElementById("completionNote").textContent = "Complete after passing the required quiz.";
});

Reveal.on("slidechanged", event => {
  if (event.currentSlide && event.currentSlide.id === "complete" && !quizPassed) {
    const resultsSlide = document.getElementById("quiz-results");
    const resultsIndex = Reveal.getIndices(resultsSlide);

    setTimeout(() => {
      Reveal.slide(resultsIndex.h, resultsIndex.v || 0);

      document.getElementById("quizResult").textContent =
        "Complete and pass the quiz before opening the completion slide.";

      document.getElementById("quizHint").textContent =
        `Passing score: ${passingScore}/${Object.keys(correctAnswers).length}.`;
    }, 0);
  }
});


    const processList = document.getElementById("process-sort");
  const checkButton = document.getElementById("check-process-order");
  const feedback = document.getElementById("process-feedback");

  let draggedItem = null;

  processList.querySelectorAll(".process-card").forEach(card => {
    card.addEventListener("dragstart", () => {
      draggedItem = card;
      card.classList.add("dragging");
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      draggedItem = null;
    });
  });

  processList.addEventListener("dragover", event => {
    event.preventDefault();

    const afterElement = getDragAfterElement(processList, event.clientY);

    if (afterElement == null) {
      processList.appendChild(draggedItem);
    } else {
      processList.insertBefore(draggedItem, afterElement);
    }
  });

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".process-card:not(.dragging)")];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      }

      return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  checkButton.addEventListener("click", () => {
    const cards = [...processList.querySelectorAll(".process-card")];
    let correct = true;

    cards.forEach((card, index) => {
      card.classList.remove("correct", "incorrect");

      if (Number(card.dataset.order) === index + 1) {
        card.classList.add("correct");
      } else {
        card.classList.add("incorrect");
        correct = false;
      }
    });

    if (correct) {
      feedback.textContent = "Correct. This is the 5041 design process.";
      feedback.style.color = "#2e7d32";
    } else {
      feedback.textContent = "Not quite. Rearrange the red boxes and try again.";
      feedback.style.color = "#b00020";
    }
  });
    document.querySelectorAll(".frame-sort-slide").forEach(slide => {
    const bank = slide.querySelector(".frame-card-bank");
    const cards = [...slide.querySelectorAll(".frame-sort-card")];
    const dropAreas = slide.querySelectorAll(".frame-card-bank, .frame-drop-zone");
    const checkButton = slide.querySelector(".check-frame-sort");
    const resetButton = slide.querySelector(".reset-frame-sort");
    const feedback = slide.querySelector(".frame-sort-feedback");

    let draggedCard = null;

    cards.forEach(card => {
      card.dataset.originalText = card.textContent;

      card.addEventListener("dragstart", () => {
        draggedCard = card;
        card.classList.add("dragging");
      });

      card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
        draggedCard = null;
      });
    });

    dropAreas.forEach(area => {
      area.addEventListener("dragover", event => {
        event.preventDefault();
        area.classList.add("drag-over");
      });

      area.addEventListener("dragleave", () => {
        area.classList.remove("drag-over");
      });

      area.addEventListener("drop", event => {
        event.preventDefault();
        area.classList.remove("drag-over");

        if (!draggedCard) return;

        draggedCard.classList.remove("correct", "incorrect");

        if (area.classList.contains("frame-drop-zone")) {
          area.querySelector(".frame-drop-list").appendChild(draggedCard);
        } else {
          area.appendChild(draggedCard);
        }

        feedback.textContent = "";
      });
    });

    checkButton.addEventListener("click", () => {
      let allPlaced = true;
      let allCorrect = true;

      cards.forEach(card => {
        card.classList.remove("correct", "incorrect");

        const zone = card.closest(".frame-drop-zone");

        if (!zone) {
          allPlaced = false;
          allCorrect = false;
          card.classList.add("incorrect");
          return;
        }

        if (zone.dataset.zone === card.dataset.answer) {
          card.classList.add("correct");
        } else {
          card.classList.add("incorrect");
          allCorrect = false;
        }
      });

      if (!allPlaced) {
        feedback.textContent = "Place every card before checking.";
        feedback.style.color = "#b00020";
      } else if (allCorrect) {
        feedback.textContent = "Correct! These are strong frame design habits.";
        feedback.style.color = "#2e7d32";
      } else {
        feedback.textContent = "Some cards need to move. Try again.";
        feedback.style.color = "#b00020";
      }
    });

    resetButton.addEventListener("click", () => {
      cards.forEach(card => {
        card.classList.remove("correct", "incorrect");
        bank.appendChild(card);
      });

      feedback.textContent = "";
    });
  });
 
document.querySelectorAll(".wd-balance-slide").forEach(slide => {
  const board = slide.querySelector(".wd-board");
  const comMarker = slide.querySelector(".wd-com-marker");
  const totalMassEl = slide.querySelector(".wd-total-mass");
  const comOffsetEl = slide.querySelector(".wd-com-offset");
  const netTorqueEl = slide.querySelector(".wd-net-torque");
  const statusBox = slide.querySelector(".wd-status");
  const meterNeedle = slide.querySelector(".wd-meter-needle");
  const randomizeButton = slide.querySelector(".wd-randomize");
  const resetButton = slide.querySelector(".wd-reset");

  const baseRobotMass = 45;
  const robotLengthCm = 120;
  const balanceToleranceCm = 3;

  let activeMass = null;
  let offsetX = 0;
  let offsetY = 0;

  const startingMasses = [...slide.querySelectorAll(".wd-mass")].map(massEl => ({
    element: massEl,
    left: parseFloat(massEl.style.left),
    top: parseFloat(massEl.style.top)
  }));

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function attachDragEvents(el) {
    el.addEventListener("pointerdown", event => {
      activeMass = el;
      activeMass.classList.add("dragging");

      const rect = activeMass.getBoundingClientRect();
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;

      activeMass.setPointerCapture(event.pointerId);
    });

    el.addEventListener("pointermove", event => {
      if (!activeMass || activeMass !== el) return;

      const boardRect = board.getBoundingClientRect();
      const massRect = activeMass.getBoundingClientRect();

      let newLeft = event.clientX - boardRect.left - offsetX;
      let newTop = event.clientY - boardRect.top - offsetY;

      newLeft = clamp(newLeft, 0, board.clientWidth - massRect.width);
      newTop = clamp(newTop, 0, board.clientHeight - massRect.height);

      activeMass.style.left = `${newLeft}px`;
      activeMass.style.top = `${newTop}px`;

      updateBalance();
    });

    el.addEventListener("pointerup", () => {
      if (!activeMass) return;
      activeMass.classList.remove("dragging");
      activeMass = null;
      updateBalance();
    });
  }

  function updateBalance() {
    const masses = [...slide.querySelectorAll(".wd-mass")];
    const boardWidth = board.clientWidth;
    const pivotX = boardWidth / 2;
    const cmPerPixel = robotLengthCm / boardWidth;

    let totalMass = baseRobotMass;
    let moment = 0;

    masses.forEach(massEl => {
      const mass = Number(massEl.dataset.mass);
      const left = parseFloat(massEl.style.left);
      const centerX = left + massEl.offsetWidth / 2;
      const offsetPx = centerX - pivotX;
      const offsetCm = offsetPx * cmPerPixel;

      totalMass += mass;
      moment += mass * offsetCm;
    });

    const comOffsetCm = moment / totalMass;
    const netTorque = moment;

    const comMarkerX = pivotX + (comOffsetCm / cmPerPixel);
    comMarker.style.left = `${comMarkerX}px`;

    const maxOffset = robotLengthCm / 2;
    const normalized = clamp(comOffsetCm / maxOffset, -1, 1);
    const needlePercent = 50 + normalized * 45;

    meterNeedle.style.left = `${needlePercent}%`;

    totalMassEl.textContent = `${totalMass.toFixed(1)} kg`;
    comOffsetEl.textContent = `${comOffsetCm.toFixed(1)} cm`;
    netTorqueEl.textContent = `${netTorque.toFixed(1)} kg·cm`;

    statusBox.classList.remove("balanced", "unbalanced");

    if (Math.abs(comOffsetCm) <= balanceToleranceCm) {
      statusBox.textContent = "Balanced! The center of mass is close to the center line.";
      statusBox.classList.add("balanced");
    } else if (comOffsetCm < 0) {
      statusBox.textContent = "Left side is heavy. Move mass right or add mass to the right.";
      statusBox.classList.add("unbalanced");
    } else {
      statusBox.textContent = "Right side is heavy. Move mass left or add mass to the left.";
      statusBox.classList.add("unbalanced");
    }
  }

  function randomizeMasses() {
    slide.querySelectorAll(".wd-mass").forEach(massEl => {
      const maxLeft = board.clientWidth - massEl.offsetWidth;
      const maxTop = board.clientHeight - massEl.offsetHeight;

      massEl.style.left = `${Math.random() * maxLeft}px`;
      massEl.style.top = `${45 + Math.random() * (maxTop - 45)}px`;
    });

    updateBalance();
  }

  function resetMasses() {
    startingMasses.forEach(item => {
      item.element.style.left = `${item.left}px`;
      item.element.style.top = `${item.top}px`;
    });

    updateBalance();
  }

  slide.querySelectorAll(".wd-mass").forEach(attachDragEvents);
  randomizeButton.addEventListener("click", randomizeMasses);
  resetButton.addEventListener("click", resetMasses);

  updateBalance();
  window.addEventListener("resize", updateBalance);
});
