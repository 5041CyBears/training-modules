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

const safetyCorrectAnswers = {
  q1: "c",
  q2: "b",
  q3: "a",
  q4: "a",
  q5: "c",
  q6: "a",
  q7: "b",
  q8: "a",
  q9: "b",
  q10: "b",
  q11: "a",
  q12: "c",
  q13: "b",
  q14: "a",
  q15: "a",
  q16: "b",
  q17: "b",
  q18: "a",
  q19: "c",
  q20: "a",
};
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

  if (certificateName) {
    certificateName.textContent = participantName || "Student Name";
  }
}

function gradeQuiz() {
  let score = 0;
  let unanswered = 0;
  for (const [name, correct] of Object.entries(safetyCorrectAnswers)) {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    if (!checked) unanswered++;
    else if (checked.value === correct) score++;
  }
  const totalQuestions = Object.keys(safetyCorrectAnswers).length;
  const result = document.getElementById("quizResult");
  const hint = document.getElementById("quizHint");
  const complete = document.getElementById("complete");
  const note = document.getElementById("completionNote");

  if (!result || !hint || !complete || !note) return;

  updateCertificateName();
  participantName = getParticipantName();

  if (!participantName) {
    quizPassed = false;
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
    complete.classList.add("locked");
    result.textContent = `You still need to answer ${unanswered} question(s).`;
    result.className = "result";
    hint.textContent =
      "Go back, answer every question, then grade the quiz again.";
    note.textContent = "Complete after passing the required quiz.";
    return;
  }
  if (score >= passingScore) {
    setCertificateDownloadEnabled(true);
    quizPassed = true;
    complete.classList.remove("locked");
    updateCertificateName();
    result.textContent = `Passed: ${score}/${totalQuestions}. Completion certificate unlocked.`;
    result.className = "result success";
    hint.textContent = "You passed. Advance to the completion certificate.";
    note.textContent = `Certificate earned by ${participantName}. Quiz score: ${score}/${totalQuestions}.`;
  } else {
    setCertificateDownloadEnabled(false);
    quizPassed = false;
    complete.classList.add("locked");
    result.textContent = `Not yet: ${score}/${totalQuestions}. Review and try again.`;
    result.className = "result";
    hint.textContent = `You need at least ${passingScore}/${totalQuestions} to unlock the completion certificate.`;
    note.textContent = "Complete after passing the required quiz.";
  }
}

function resetQuiz() {

  Object.keys(safetyCorrectAnswers).forEach((questionName) => {
    document
      .querySelectorAll(`input[name="${questionName}"]`)
      .forEach((input) => {
        input.checked = false;
      });
  });
  setCertificateDownloadEnabled(false);
  quizPassed = false;
  const complete = document.getElementById("complete");
  const result = document.getElementById("quizResult");
  const hint = document.getElementById("quizHint");
  const note = document.getElementById("completionNote");
  if (complete) complete.classList.add("locked");
  if (result) {
    result.textContent = "Not submitted.";
    result.className = "result";
  }
  if (hint) hint.textContent = "Passing score: 18 of 20.";
  if (note) note.textContent = "Complete after passing the required quiz.";
}

function initCategorySort(slideSelector) {
  document.querySelectorAll(slideSelector).forEach((slide) => {
    if (slide.dataset.sortInit === "true") return;
    slide.dataset.sortInit = "true";
    const bank = slide.querySelector(".sort-bank");
    const chips = Array.from(slide.querySelectorAll(".sort-chip"));
    const dropAreas = slide.querySelectorAll(".sort-bank, .sort-zone");
    const checkButton = slide.querySelector(".check-sort");
    const resetButton = slide.querySelector(".reset-sort");
    const feedback = slide.querySelector(".activity-feedback");
    if (!bank || chips.length === 0) return;
    let draggedChip = null;
    const startingOrder = chips.slice();

    chips.forEach((chip) => {
      chip.addEventListener("dragstart", () => {
        draggedChip = chip;
        chip.classList.add("dragging");
      });
      chip.addEventListener("dragend", () => {
        chip.classList.remove("dragging");
        draggedChip = null;
      });
    });

    dropAreas.forEach((area) => {
      area.addEventListener("dragover", (event) => {
        event.preventDefault();
        area.classList.add("drag-over");
      });
      area.addEventListener("dragleave", () =>
        area.classList.remove("drag-over"),
      );
      area.addEventListener("drop", (event) => {
        event.preventDefault();
        area.classList.remove("drag-over");
        if (!draggedChip) return;
        draggedChip.classList.remove("correct", "incorrect");
        if (area.classList.contains("sort-zone")) {
          const list = area.querySelector(".sort-list");
          if (list) list.appendChild(draggedChip);
        } else {
          area.appendChild(draggedChip);
        }
        if (feedback) feedback.textContent = "";
      });
    });

    if (checkButton) {
      checkButton.addEventListener("click", () => {
        let allPlaced = true;
        let allCorrect = true;
        chips.forEach((chip) => {
          chip.classList.remove("correct", "incorrect");
          const zone = chip.closest(".sort-zone");
          if (!zone) {
            allPlaced = false;
            allCorrect = false;
            chip.classList.add("incorrect");
            return;
          }
          if (zone.dataset.zone === chip.dataset.answer)
            chip.classList.add("correct");
          else {
            chip.classList.add("incorrect");
            allCorrect = false;
          }
        });
        if (feedback) {
          if (!allPlaced) {
            feedback.textContent = "Place every card before checking.";
            feedback.style.color = "#b00020";
          } else if (allCorrect) {
            feedback.textContent =
              "Correct. Safe choices reduce injuries and robot failures.";
            feedback.style.color = "#2e7d32";
          } else {
            feedback.textContent = "Some cards need to move. Try again.";
            feedback.style.color = "#b00020";
          }
        }
      });
    }

    if (resetButton) {
      resetButton.addEventListener("click", () => {
        startingOrder.forEach((chip) => {
          chip.classList.remove("correct", "incorrect");
          bank.appendChild(chip);
        });
        if (feedback) feedback.textContent = "";
      });
    }
  });
}

function initOrderSort() {
  document.querySelectorAll(".safety-order-slide").forEach((slide) => {
    if (slide.dataset.orderInit === "true") return;
    slide.dataset.orderInit = "true";
    const list = slide.querySelector(".order-list");
    const cards = Array.from(slide.querySelectorAll(".order-card"));
    const checkButton = slide.querySelector(".check-order");
    const resetButton = slide.querySelector(".reset-order");
    const feedback = slide.querySelector(".activity-feedback");
    if (!list || cards.length === 0) return;
    const startingOrder = cards.slice();
    let draggedCard = null;

    cards.forEach((card) => {
      card.addEventListener("dragstart", () => {
        draggedCard = card;
        card.classList.add("dragging");
      });
      card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
        draggedCard = null;
      });
    });

    list.addEventListener("dragover", (event) => {
      event.preventDefault();
      list.classList.add("drag-over");
      if (!draggedCard) return;
      const afterElement = getDragAfterElement(list, event.clientY);
      if (afterElement == null) list.appendChild(draggedCard);
      else list.insertBefore(draggedCard, afterElement);
    });
    list.addEventListener("dragleave", () =>
      list.classList.remove("drag-over"),
    );
    list.addEventListener("drop", () => list.classList.remove("drag-over"));

    function getDragAfterElement(container, y) {
      const draggableElements = Array.from(
        container.querySelectorAll(".order-card:not(.dragging)"),
      );
      return draggableElements.reduce(
        (closest, child) => {
          const box = child.getBoundingClientRect();
          const offset = y - box.top - box.height / 2;
          if (offset < 0 && offset > closest.offset)
            return { offset, element: child };
          return closest;
        },
        { offset: Number.NEGATIVE_INFINITY },
      ).element;
    }

    if (checkButton) {
      checkButton.addEventListener("click", () => {
        let correct = true;
        Array.from(list.querySelectorAll(".order-card")).forEach(
          (card, index) => {
            card.classList.remove("correct", "incorrect");
            if (Number(card.dataset.order) === index + 1)
              card.classList.add("correct");
            else {
              card.classList.add("incorrect");
              correct = false;
            }
          },
        );
        if (feedback) {
          if (correct) {
            feedback.textContent = "Correct. This is a safe sequence.";
            feedback.style.color = "#2e7d32";
          } else {
            feedback.textContent =
              "Not quite. Move the red cards and try again.";
            feedback.style.color = "#b00020";
          }
        }
      });
    }

    if (resetButton) {
      resetButton.addEventListener("click", () => {
        startingOrder.forEach((card) => {
          card.classList.remove("correct", "incorrect");
          list.appendChild(card);
        });
        if (feedback) feedback.textContent = "";
      });
    }
  });
}

function initReviewChecklist() {
  document.querySelectorAll(".review-grid").forEach((grid) => {
    const items = Array.from(grid.querySelectorAll(".review-item"));
    const feedback = grid.parentElement.querySelector(".review-feedback");
    function update() {
      const count = items.filter((item) =>
        item.classList.contains("reviewed"),
      ).length;
      if (feedback)
        feedback.textContent = `${count} of ${items.length} reviewed.`;
    }
    items.forEach((item) => {
      item.addEventListener("click", () => {
        item.classList.toggle("reviewed");
        update();
      });
    });
    update();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const gradeQuizButton = document.getElementById("gradeQuiz");
  const resetQuizButton = document.getElementById("resetQuiz");
  if (gradeQuizButton) gradeQuizButton.addEventListener("click", gradeQuiz);
  if (resetQuizButton) resetQuizButton.addEventListener("click", resetQuiz);
  initCategorySort(".safety-sort-slide");
  initOrderSort();
  initReviewChecklist();
    const nameInput = document.getElementById("participantName");

  if (nameInput) {
    nameInput.addEventListener("input", updateCertificateName);
  }

  updateCertificateName();
  const downloadCertificateButton = document.getElementById("downloadCertificate");

if (downloadCertificateButton) {
  downloadCertificateButton.disabled = true;
  downloadCertificateButton.addEventListener("click", downloadCertificatePdf);
}
});

Reveal.on("slidechanged", (event) => {
  if (
    event.currentSlide &&
    event.currentSlide.id === "complete" &&
    !quizPassed
  ) {
    const resultsSlide = document.getElementById("quiz-results");
    if (!resultsSlide) return;
    const resultsIndex = Reveal.getIndices(resultsSlide);
    setTimeout(() => {
      Reveal.slide(resultsIndex.h, resultsIndex.v || 0);
      const result = document.getElementById("quizResult");
      const hint = document.getElementById("quizHint");
      if (result)
        result.textContent =
          "Complete and pass the quiz before opening the completion certificate.";
      if (hint)
        hint.textContent = `Passing score: ${passingScore}/${Object.keys(safetyCorrectAnswers).length}.`;
    }, 0);
  }
});
function getSafeFileName(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "certificate";
}

function setCertificateDownloadEnabled(enabled) {
  const button = document.getElementById("downloadCertificate");

  if (button) {
    button.disabled = !enabled;
  }
}

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
    useCORS: true
  });

  const imageData = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "letter"
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const margin = 36;
  const availableWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - margin * 2;

  const imageRatio = Math.min(
    availableWidth / canvas.width,
    availableHeight / canvas.height
  );

  const imageWidth = canvas.width * imageRatio;
  const imageHeight = canvas.height * imageRatio;

  const x = (pageWidth - imageWidth) / 2;
  const y = (pageHeight - imageHeight) / 2;

  pdf.addImage(imageData, "PNG", x, y, imageWidth, imageHeight);

  const name = getSafeFileName(getParticipantName() || "student");
  const moduleTitle =
    document.querySelector("#complete h3")?.textContent || "training-module";

  const moduleName = getSafeFileName(moduleTitle);

  pdf.save(`${name}-${moduleName}-certificate.pdf`);
}