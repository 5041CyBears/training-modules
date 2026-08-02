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

const mediaCorrectAnswers = {
  q1: "a",
  q2: "b",
  q3: "c",
  q4: "a",
  q5: "b",
  q6: "c",
  q7: "a",
  q8: "b",
  q9: "a",
  q10: "c",
  q11: "a",
  q12: "a",
  q13: "b",
  q14: "a",
  q15: "c",
  q16: "a",
  q17: "b",
  q18: "c",
  q19: "a",
  q20: "b",
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

function setCertificateDownloadEnabled(enabled) {
  const button = document.getElementById("downloadCertificate");

  if (button) {
    button.disabled = !enabled;
  }
}

function getSafeFileName(text) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "certificate"
  );
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

  if (typeof html2canvas === "undefined" || !window.jspdf) {
    alert("PDF tools did not load. Check your internet connection and try again.");
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

  const imageRatio = Math.min(
    availableWidth / canvas.width,
    availableHeight / canvas.height,
  );

  const imageWidth = canvas.width * imageRatio;
  const imageHeight = canvas.height * imageRatio;
  const x = (pageWidth - imageWidth) / 2;
  const y = (pageHeight - imageHeight) / 2;

  pdf.addImage(imageData, "PNG", x, y, imageWidth, imageHeight);

  const name = getSafeFileName(getParticipantName() || "student");
  pdf.save(`${name}-media-creation-certificate.pdf`);
}

function gradeQuiz() {
  let score = 0;
  let unanswered = 0;

  for (const [name, correct] of Object.entries(mediaCorrectAnswers)) {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    if (!checked) unanswered++;
    else if (checked.value === correct) score++;
  }

  const totalQuestions = Object.keys(mediaCorrectAnswers).length;
  const result = document.getElementById("quizResult");
  const hint = document.getElementById("quizHint");
  const complete = document.getElementById("complete");
  const note = document.getElementById("completionNote");

  if (!result || !hint || !complete || !note) return;

  updateCertificateName();
  participantName = getParticipantName();

  if (!participantName) {
    quizPassed = false;
    setCertificateDownloadEnabled(false);
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
    setCertificateDownloadEnabled(false);
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
    updateCertificateName();
    setCertificateDownloadEnabled(true);
    result.textContent = `Passed: ${score}/${totalQuestions}. Completion certificate unlocked.`;
    result.className = "result success";
    hint.textContent = "You passed. Advance to the completion certificate.";
    note.textContent = `Certificate earned by ${participantName}. Quiz score: ${score}/${totalQuestions}.`;
  } else {
    quizPassed = false;
    setCertificateDownloadEnabled(false);
    complete.classList.add("locked");
    result.textContent = `Not yet: ${score}/${totalQuestions}. Review and try again.`;
    result.className = "result";
    hint.textContent = `You need at least ${passingScore}/${totalQuestions} to unlock the completion certificate.`;
    note.textContent = "Complete after passing the required quiz.";
  }
}

function resetQuiz() {
  Object.keys(mediaCorrectAnswers).forEach((questionName) => {
    document
      .querySelectorAll(`input[name="${questionName}"]`)
      .forEach((input) => {
        input.checked = false;
      });
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
  if (hint) {
    hint.textContent = "After passing, advance to the final completion certificate.";
  }
  if (note) note.textContent = "Complete after passing the required quiz.";
}

function initReviewChecklist(selector = ".review-slide, .role-review-slide") {
  document.querySelectorAll(selector).forEach((slide) => {
    const grid = slide.querySelector(".media-review-grid");
    const items = Array.from(slide.querySelectorAll(".media-review-item"));
    const feedback = slide.querySelector(".media-review-feedback");

    if (!grid || items.length === 0) return;

    items.forEach((item) => {
      item.setAttribute(
        "aria-pressed",
        item.classList.contains("reviewed") ? "true" : "false",
      );
    });

    function updateCount() {
      const count = slide.querySelectorAll(".media-review-item.reviewed").length;

      if (feedback) {
        const noun = slide.classList.contains("role-review-slide") ? "roles selected" : "items reviewed";
        feedback.textContent = `${count} of ${items.length} ${noun}.`;
      }
    }

    grid.addEventListener("click", (event) => {
      const item = event.target.closest(".media-review-item");

      if (!item || !grid.contains(item)) return;

      event.preventDefault();
      item.classList.toggle("reviewed");
      item.setAttribute(
        "aria-pressed",
        item.classList.contains("reviewed") ? "true" : "false",
      );
      updateCount();
    });

    updateCount();
  });
}

function initMediaChoices() {
  document.querySelectorAll(".media-scenario-slide, .media-brand-check-slide").forEach((slide) => {
    const buttons = slide.querySelectorAll(".media-choice-option");
    const feedback = slide.querySelector(".media-choice-feedback");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((item) => {
          item.classList.remove("correct", "incorrect");
        });

        const isCorrect = button.dataset.correct === "true";
        button.classList.add(isCorrect ? "correct" : "incorrect");

        if (feedback) {
          feedback.textContent = isCorrect
            ? "Correct. Good media protects people, uses approved assets, and communicates clearly."
            : "Not quite. Choose the option that is accurate, approved, and safe for students.";
        }
      });
    });
  });
}

function initMediaSort() {
  document.querySelectorAll(".media-sort-slide").forEach((slide) => {
    const bank = slide.querySelector(".media-sort-bank");
    const chips = Array.from(slide.querySelectorAll(".media-sort-chip"));
    const zones = Array.from(slide.querySelectorAll(".media-sort-zone"));
    const checkButton = slide.querySelector(".check-media-sort");
    const resetButton = slide.querySelector(".reset-media-sort");
    const feedback = slide.querySelector(".media-sort-feedback");

    let draggedChip = null;

    chips.forEach((chip, index) => {
      chip.dataset.originalIndex = index;

      chip.addEventListener("dragstart", () => {
        draggedChip = chip;
        chip.classList.add("dragging");
      });

      chip.addEventListener("dragend", () => {
        draggedChip = null;
        chip.classList.remove("dragging");
      });
    });

    [...zones, bank].forEach((area) => {
      area.addEventListener("dragover", (event) => {
        event.preventDefault();
      });

      area.addEventListener("drop", (event) => {
        event.preventDefault();

        if (!draggedChip) return;

        draggedChip.classList.remove("correct", "incorrect", "unplaced");

        if (area.classList.contains("media-sort-zone")) {
          const list = area.querySelector(".media-sort-list");
          list.appendChild(draggedChip);
        } else {
          bank.appendChild(draggedChip);
        }
      });
    });

    if (checkButton) {
      checkButton.addEventListener("click", () => {
        let correct = 0;
        let placed = 0;

        chips.forEach((chip) => {
          chip.classList.remove("correct", "incorrect", "unplaced");
        });

        zones.forEach((zone) => {
          const zoneName = zone.dataset.zone;
          const placedChips = zone.querySelectorAll(".media-sort-chip");

          placedChips.forEach((chip) => {
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
            feedback.textContent = "Correct. The media workflow is in the right order.";
          } else {
            feedback.textContent = `${correct}/${chips.length} correct. Move the red items and try again.`;
          }
        }
      });
    }

    if (resetButton) {
      resetButton.addEventListener("click", () => {
        chips
          .sort((a, b) => Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex))
          .forEach((chip) => {
            chip.classList.remove("correct", "incorrect", "unplaced", "dragging");
            bank.appendChild(chip);
          });

        if (feedback) {
          feedback.textContent = "";
        }
      });
    }
  });
}

function revealMediaRole(card) {
  const slide = card.closest(".media-role-review-slide");
  const hiddenText = "Click to reveal a media role";
  const willReveal = !card.classList.contains("revealed");

  card.classList.remove("role-flipping");
  void card.offsetWidth;
  card.classList.add("role-flipping");

  window.setTimeout(() => {
    card.classList.toggle("revealed", willReveal);
    card.textContent = willReveal ? card.dataset.role : hiddenText;
    card.setAttribute("aria-pressed", willReveal ? "true" : "false");

    if (slide) {
      const cards = slide.querySelectorAll(".media-role-card");
      const revealed = slide.querySelectorAll(".media-role-card.revealed");
      const feedback = slide.querySelector(".media-role-feedback");

      if (feedback) {
        feedback.textContent = `${revealed.length} of ${cards.length} media roles revealed.`;
      }
    }
  }, 170);

  window.setTimeout(() => {
    card.classList.remove("role-flipping");
  }, 420);
}

window.revealMediaRole = revealMediaRole;

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
  initReviewChecklist();
  initMediaChoices();
  initMediaSort();
});

Reveal.on("slidechanged", (event) => {
  if (event.currentSlide && event.currentSlide.id === "complete" && !quizPassed) {
    const resultsSlide = document.getElementById("quiz-results");
    const resultsIndex = Reveal.getIndices(resultsSlide);

    setTimeout(() => {
      Reveal.slide(resultsIndex.h, resultsIndex.v || 0);
      const result = document.getElementById("quizResult");
      const hint = document.getElementById("quizHint");

      if (result) {
        result.textContent =
          "Complete and pass the quiz before opening the completion certificate.";
      }
      if (hint) {
        hint.textContent = `Passing score: ${passingScore}/${Object.keys(mediaCorrectAnswers).length}.`;
      }
    }, 0);
  }
});
