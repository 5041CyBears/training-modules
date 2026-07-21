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

const gearingCorrectAnswers = {
  q1: "b",
  q2: "b",
  q3: "a",
  q4: "a",
  q5: "b",
  q6: "b",
  q7: "b",
  q8: "a",
  q9: "a",
  q10: "a",
  q11: "a",
  q12: "b",
  q13: "a",
  q14: "a",
  q15: "a",
  q16: "a",
  q17: "a",
  q18: "b",
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

function getSafeFileName(text) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "certificate"
  );
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

  if (!window.html2canvas || !window.jspdf) {
    alert("PDF tools could not load. Check your internet connection and try again.");
    return;
  }

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
  const name = getSafeFileName(getParticipantName() || "student");
  const moduleTitle = document.querySelector("#complete h3")?.textContent || "training-module";
  const moduleName = getSafeFileName(moduleTitle);
  pdf.save(`${name}-${moduleName}-certificate.pdf`);
}

function gradeQuiz() {
  let score = 0;
  let unanswered = 0;

  for (const [name, correct] of Object.entries(gearingCorrectAnswers)) {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    if (!checked) {
      unanswered++;
    } else if (checked.value === correct) {
      score++;
    }
  }

  const totalQuestions = Object.keys(gearingCorrectAnswers).length;
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
    setCertificateDownloadEnabled(false);
    result.textContent = "Please enter your name before grading the quiz.";
    result.className = "result";
    hint.textContent = "Go back to the name entry slide, enter your name, then grade again.";
    note.textContent = "Complete after passing the required quiz.";
    return;
  }

  if (unanswered > 0) {
    quizPassed = false;
    complete.classList.add("locked");
    setCertificateDownloadEnabled(false);
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
    complete.classList.add("locked");
    setCertificateDownloadEnabled(false);
    result.textContent = `Not yet: ${score}/${totalQuestions}. Review and try again.`;
    result.className = "result";
    hint.textContent = `You need at least ${passingScore}/${totalQuestions} to unlock the completion certificate.`;
    note.textContent = "Complete after passing the required quiz.";
  }
}

function resetQuiz() {
  Object.keys(gearingCorrectAnswers).forEach((questionName) => {
    document.querySelectorAll(`input[name="${questionName}"]`).forEach((input) => {
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
  if (hint) hint.textContent = "After passing, advance to the final completion certificate.";
  if (note) note.textContent = "Complete after passing the required quiz.";
}

function initCategorySort(slideSelector) {
  document.querySelectorAll(slideSelector).forEach((slide) => {
    const bank = slide.querySelector(".sort-bank");
    const chips = [...slide.querySelectorAll(".sort-chip")];
    const dropAreas = slide.querySelectorAll(".sort-bank, .sort-zone");
    const checkButton = slide.querySelector(".check-sort");
    const resetButton = slide.querySelector(".reset-sort");
    const feedback = slide.querySelector(".activity-feedback");
    let draggedChip = null;

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

      area.addEventListener("dragleave", () => {
        area.classList.remove("drag-over");
      });

      area.addEventListener("drop", (event) => {
        event.preventDefault();
        area.classList.remove("drag-over");

        if (!draggedChip) return;

        const list = area.classList.contains("sort-zone")
          ? area.querySelector(".sort-list")
          : area;
        list.appendChild(draggedChip);
      });
    });

    if (checkButton) {
      checkButton.addEventListener("click", () => {
        let correct = 0;
        let placed = 0;

        chips.forEach((chip) => {
          chip.classList.remove("correct", "incorrect");
          const zone = chip.closest(".sort-zone");

          if (!zone) return;

          placed++;
          if (zone.dataset.zone === chip.dataset.answer) {
            correct++;
            chip.classList.add("correct");
          } else {
            chip.classList.add("incorrect");
          }
        });

        if (feedback) {
          feedback.textContent = `${correct}/${chips.length} correct. ${chips.length - placed} still in the bank.`;
        }
      });
    }

    if (resetButton && bank) {
      resetButton.addEventListener("click", () => {
        chips.forEach((chip) => {
          chip.classList.remove("correct", "incorrect");
          bank.appendChild(chip);
        });

        if (feedback) feedback.textContent = "";
      });
    }
  });
}

function initRatioPractice() {
  const showButton = document.getElementById("showRatioAnswer");
  const hideButton = document.getElementById("hideRatioAnswer");
  const answer = document.getElementById("ratioAnswer");

  if (showButton && answer) {
    showButton.addEventListener("click", () => answer.classList.remove("hidden-answer"));
  }

  if (hideButton && answer) {
    hideButton.addEventListener("click", () => answer.classList.add("hidden-answer"));
  }
}

function initScenarios() {
  document.querySelectorAll(".scenario-choice").forEach((button) => {
    button.addEventListener("click", () => {
      const slide = button.closest(".scenario-slide");
      const feedback = slide?.querySelector(".scenario-feedback");
      if (feedback) {
        feedback.textContent = button.dataset.feedback || "Think about torque, speed, current, and control.";
      }
    });
  });
}

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
        hint.textContent = `Passing score: ${passingScore}/${Object.keys(gearingCorrectAnswers).length}.`;
      }
    }, 0);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const gradeQuizButton = document.getElementById("gradeQuiz");
  const resetQuizButton = document.getElementById("resetQuiz");
  const nameInput = document.getElementById("participantName");
  const downloadCertificateButton = document.getElementById("downloadCertificate");

  if (gradeQuizButton) gradeQuizButton.addEventListener("click", gradeQuiz);
  if (resetQuizButton) resetQuizButton.addEventListener("click", resetQuiz);
  if (nameInput) nameInput.addEventListener("input", updateCertificateName);
  if (downloadCertificateButton) {
    downloadCertificateButton.disabled = true;
    downloadCertificateButton.addEventListener("click", downloadCertificatePdf);
  }

  updateCertificateName();
  initCategorySort(".gear-sort-slide");
  initRatioPractice();
  initScenarios();
});
