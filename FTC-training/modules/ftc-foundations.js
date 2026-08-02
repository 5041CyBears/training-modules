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

const ftcIntroCorrectAnswers = {
  q1: "b",
  q2: "b",
  q3: "a",
  q4: "a",
  q5: "a",
  q6: "b",
  q7: "a",
  q8: "b",
  q9: "a",
  q10: "b",
  q11: "a",
  q12: "a",
  q13: "a",
  q14: "a",
  q15: "b",
};

const passingScore = 13;
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
  const imageRatio = Math.min(availableWidth / canvas.width, availableHeight / canvas.height);
  const imageWidth = canvas.width * imageRatio;
  const imageHeight = canvas.height * imageRatio;
  const x = (pageWidth - imageWidth) / 2;
  const y = (pageHeight - imageHeight) / 2;

  pdf.addImage(imageData, "PNG", x, y, imageWidth, imageHeight);

  const name = getSafeFileName(getParticipantName() || "student");
  pdf.save(`${name}-ftc-introduction-certificate.pdf`);
}

function gradeQuiz() {
  const result = document.getElementById("quizResult");
  const hint = document.getElementById("quizHint");
  const complete = document.getElementById("complete");
  const note = document.getElementById("completionNote");
  const totalQuestions = Object.keys(ftcIntroCorrectAnswers).length;

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

  Object.entries(ftcIntroCorrectAnswers).forEach(([question, answer]) => {
    const selected = document.querySelector(`input[name="${question}"]:checked`);

    if (!selected) {
      unanswered.push(question);
      return;
    }

    if (selected.value === answer) {
      score++;
    }
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


function revealFtcRole(card) {
  const slide = card.closest(".ftcintro-role-slide");
  const hiddenText = "Reveal a value";
  const willReveal = !card.classList.contains("revealed");

  card.classList.remove("flipping");
  void card.offsetWidth;
  card.classList.add("flipping");

  window.setTimeout(() => {
    card.classList.toggle("revealed", willReveal);
    card.textContent = willReveal ? card.dataset.role : hiddenText;
    card.setAttribute("aria-pressed", willReveal ? "true" : "false");

    if (slide) {
      const cards = slide.querySelectorAll(".ftcintro-role-card");
      const revealed = slide.querySelectorAll(".ftcintro-role-card.revealed");
      const feedback = slide.querySelector(".ftcintro-role-feedback");

      if (feedback) {
        feedback.textContent = `${revealed.length} of ${cards.length} cards revealed.`;
      }
    }
  }, 170);

  window.setTimeout(() => {
    card.classList.remove("flipping");
  }, 420);
}
window.revealFtcRole = revealFtcRole;

function checkFtcScenario(button) {
  const slide = button.closest(".ftcintro-scenario-slide");
  if (!slide) return;

  const buttons = slide.querySelectorAll(".ftcintro-scenario-options button");
  const feedback = slide.querySelector(".ftcintro-scenario-feedback");
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
      ? "Correct. This shows Coopertition while still keeping your own team prepared."
      : "Not the best choice. FIRST teams compete hard while still treating others with respect and support.";
  }
}
window.checkFtcScenario = checkFtcScenario;

function initFtcIntroSortSlides() {
  document.querySelectorAll(".ftcintro-sort-slide").forEach((slide) => {
    if (slide.dataset.ftcintroSortReady === "true") return;
    slide.dataset.ftcintroSortReady = "true";

    const bank = slide.querySelector(".ftcintro-sort-bank");
    const chips = Array.from(slide.querySelectorAll(".ftcintro-sort-chip"));
    const zones = Array.from(slide.querySelectorAll(".ftcintro-sort-zone"));
    let dragged = null;

    chips.forEach((chip, index) => {
      chip.dataset.originalIndex = index;

      chip.addEventListener("dragstart", () => {
        dragged = chip;
        chip.classList.add("dragging");
      });

      chip.addEventListener("dragend", () => {
        dragged = null;
        chip.classList.remove("dragging");
      });
    });

    [...zones, bank].forEach((area) => {
      area.addEventListener("dragover", (event) => event.preventDefault());

      area.addEventListener("drop", (event) => {
        event.preventDefault();
        if (!dragged) return;

        dragged.classList.remove("correct", "incorrect", "unplaced");

        if (area.classList.contains("ftcintro-sort-zone")) {
          area.querySelector(".ftcintro-sort-list").appendChild(dragged);
        } else {
          bank.appendChild(dragged);
        }
      });
    });
  });
}

function checkFtcIntroSort(button) {
  const slide = button.closest(".ftcintro-sort-slide");
  if (!slide) return;

  const bank = slide.querySelector(".ftcintro-sort-bank");
  const chips = Array.from(slide.querySelectorAll(".ftcintro-sort-chip"));
  const zones = Array.from(slide.querySelectorAll(".ftcintro-sort-zone"));
  const feedback = slide.querySelector(".ftcintro-sort-feedback");

  let correct = 0;
  let placed = 0;

  chips.forEach((chip) => chip.classList.remove("correct", "incorrect", "unplaced"));

  zones.forEach((zone) => {
    const zoneName = zone.dataset.zone;

    zone.querySelectorAll(".ftcintro-sort-chip").forEach((chip) => {
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
      feedback.textContent = "Correct. You understand this part of the FTC experience.";
    } else {
      feedback.textContent = `${correct}/${chips.length} correct. Move the red cards and try again.`;
    }
  }
}
window.checkFtcIntroSort = checkFtcIntroSort;

function resetFtcIntroSort(button) {
  const slide = button.closest(".ftcintro-sort-slide");
  if (!slide) return;

  const bank = slide.querySelector(".ftcintro-sort-bank");
  const chips = Array.from(slide.querySelectorAll(".ftcintro-sort-chip"));
  const feedback = slide.querySelector(".ftcintro-sort-feedback");

  chips
    .sort((a, b) => Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex))
    .forEach((chip) => {
      chip.classList.remove("correct", "incorrect", "unplaced", "dragging");
      bank.appendChild(chip);
    });

  if (feedback) {
    feedback.textContent = "";
  }
}
window.resetFtcIntroSort = resetFtcIntroSort;

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
  initFtcIntroSortSlides();
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
        result.textContent = "Complete and pass the quiz before opening the completion certificate.";
      }
      if (hint) {
        hint.textContent = `Passing score: ${passingScore}/${Object.keys(ftcIntroCorrectAnswers).length}.`;
      }
    }, 0);
  }
});
