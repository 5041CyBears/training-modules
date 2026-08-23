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
/* 5041 Training Hub script: FRC-trainings/modules/motors.js
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
const motorCorrectAnswers = {
  q1: "b",
  q2: "c",
  q3: "b",
  q4: "c",
  q5: "a",
  q6: "b",
  q7: "c",
  q8: "a",
  q9: "c",
  q10: "b",
  q11: "a",
  q12: "c",
  q13: "b",
  q14: "a",
  q15: "c",
  q16: "b",
  q17: "a",
  q18: "c",
  q19: "b",
  q20: "a",
};

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

  if (certificateName) {
    certificateName.textContent = participantName || "Student Name";
  }
}

// STUDENT NOTE: Answer-checking function `gradeQuiz`. It reads the user state, compares it with the expected answer/data attributes, and updates feedback classes/text.
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

// STUDENT NOTE: Reset function `resetQuiz`. It should return this activity to its original state by clearing classes, values, and feedback created during interaction.
function resetQuiz() {
  Object.keys(motorCorrectAnswers).forEach((questionName) => {
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
  if (hint)
    hint.textContent =
      "After passing, advance to the final completion certificate.";
  if (note) note.textContent = "Complete after passing the required quiz.";
}


// STUDENT NOTE: Reveal.js `slidechanged` hook. Use these hooks when behavior should run as slides open or change.
Reveal.on("slidechanged", (event) => {
  if (
    event.currentSlide &&
    event.currentSlide.id === "complete" &&
    !quizPassed
  ) {
    const resultsSlide = document.getElementById("quiz-results");
    const resultsIndex = Reveal.getIndices(resultsSlide);
    setTimeout(() => {
      Reveal.slide(resultsIndex.h, resultsIndex.v || 0);
      const result = document.getElementById("quizResult");
      const hint = document.getElementById("quizHint");
      if (result)
        result.textContent =
          "Complete and pass the quiz before opening the completion certificate.";
      if (hint)
        hint.textContent = `Passing score: ${passingScore}/${Object.keys(motorCorrectAnswers).length}.`;
    }, 0);
  }
});

// STUDENT NOTE: Initialization function `initCategorySort`. It finds the needed HTML elements and attaches behavior/listeners. Call it after the page DOM exists.
function initCategorySort(slideSelector) {
  document.querySelectorAll(slideSelector).forEach((slide) => {
    if (slide.dataset.sortInit === "true") return;
    slide.dataset.sortInit = "true";
    const bank = slide.querySelector(".sort-bank");
    const chips = [...slide.querySelectorAll(".sort-chip")];
    const dropAreas = slide.querySelectorAll(".sort-bank, .sort-zone");
    const checkButton = slide.querySelector(".check-sort");
    const resetButton = slide.querySelector(".reset-sort");
    const feedback = slide.querySelector(".activity-feedback");
    let draggedChip = null;
    chips.forEach((chip) => {
      // STUDENT NOTE: Event listener for `dragstart`. The callback below runs whenever that user/browser event occurs.
      chip.addEventListener("dragstart", () => {
        draggedChip = chip;
        chip.classList.add("dragging");
      });
      // STUDENT NOTE: Event listener for `dragend`. The callback below runs whenever that user/browser event occurs.
      chip.addEventListener("dragend", () => {
        chip.classList.remove("dragging");
        draggedChip = null;
      });
    });
    dropAreas.forEach((area) => {
      // STUDENT NOTE: Event listener for `dragover`. The callback below runs whenever that user/browser event occurs.
      area.addEventListener("dragover", (event) => {
        event.preventDefault();
        area.classList.add("drag-over");
      });
      // STUDENT NOTE: Event listener for `dragleave`. The callback below runs whenever that user/browser event occurs.
      area.addEventListener("dragleave", () =>
        area.classList.remove("drag-over"),
      );
      // STUDENT NOTE: Event listener for `drop`. The callback below runs whenever that user/browser event occurs.
      area.addEventListener("drop", (event) => {
        event.preventDefault();
        area.classList.remove("drag-over");
        if (!draggedChip) return;
        draggedChip.classList.remove("correct", "incorrect");
        if (area.classList.contains("sort-zone"))
          area.querySelector(".sort-list").appendChild(draggedChip);
        else area.appendChild(draggedChip);
        if (feedback) feedback.textContent = "";
      });
    });
    if (checkButton) {
      // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
      checkButton.addEventListener("click", () => {
        let placed = 0;
        let correct = 0;
        slide.querySelectorAll(".sort-zone").forEach((zone) => {
          const zoneName = zone.dataset.zone;
          zone.querySelectorAll(".sort-chip").forEach((chip) => {
            placed++;
            chip.classList.remove("correct", "incorrect");
            if (chip.dataset.answer === zoneName) {
              chip.classList.add("correct");
              correct++;
            } else chip.classList.add("incorrect");
          });
        });
        if (!feedback) return;
        if (placed < chips.length)
          feedback.textContent = `Place all ${chips.length} cards before checking.`;
        else if (correct === chips.length)
          feedback.textContent = "Correct. Nice work.";
        else
          feedback.textContent = `${correct}/${chips.length} correct. Adjust the red cards and try again.`;
      });
    }
    if (resetButton) {
      // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
      resetButton.addEventListener("click", () => {
        chips
          .sort(
            (a, b) =>
              Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex),
          )
          .forEach((chip) => {
            chip.classList.remove("correct", "incorrect");
            bank.appendChild(chip);
          });
        if (feedback) feedback.textContent = "";
      });
    }
    chips.forEach((chip, index) => (chip.dataset.originalIndex = index));
  });
}

// STUDENT NOTE: Initialization function `initMotorCards`. It finds the needed HTML elements and attaches behavior/listeners. Call it after the page DOM exists.
function initMotorCards() {
  const motorInfo = {
    cim: {
      title: "CIM",
      image: "../../shared/assets/motors/cim.png",
      alt: "CIM motor",
      description:
        "A classic brushed FRC workhorse historically used for drivetrains and heavy mechanisms.",
      checks: [
        "About 5310 RPM free speed.",
        "About 2.425 Nm stall torque.",
        "About 133A stall current.",
        "Good for older drivetrains and robust practice mechanisms.",
        "Heavy compared with many modern brushless options.",
      ],
    },

    neo: {
      title: "REV NEO",
      image: "../../shared/assets/motors/neo.png",
      alt: "REV NEO brushless motor",
      description:
        "A common CIM-style brushless motor optimized for SPARK MAX and general FRC mechanisms.",
      checks: [
        "5676 RPM free speed.",
        "2.6 Nm stall torque.",
        "105A stall current.",
        "406W peak power.",
        "Integrated relative encoder feedback.",
      ],
    },

    neo2: {
      title: "REV NEO 2.0",
      image: "../../shared/assets/motors/neo-2.png",
      alt: "REV NEO 2.0 brushless motor",
      description:
        "A compact brushless FRC motor that builds on the original REV NEO with a refined package for easier mounting, integration, and service.",
      checks: [
        "Useful for drivetrains, swerve drive motors, arms, elevators, intakes, climbers, and general mechanisms.",
        "Designed as an updated NEO-style brushless motor for FRC use.",
        "Requires a compatible REV brushless motor controller.",
        "Includes sensor feedback through the NEO 2.0 sensor cable connection.",
        "Still needs proper gearing, current limits, and thermal management.",
      ],
    },

    vortex: {
      title: "REV NEO Vortex",
      image: "../../shared/assets/motors/neo-vortex.png",
      alt: "REV NEO Vortex brushless motor",
      description:
        "A high-power REV brushless motor with high-resolution encoder options and strong performance.",
      checks: [
        "6784 RPM free speed.",
        "3.6 Nm stall torque.",
        "211A stall current.",
        "640W peak power.",
        "Current limits and thermal management matter.",
      ],
    },

    krakenX60: {
      title: "WCP Kraken X60",
      image: "../../shared/assets/motors/kraken-x60.jpg",
      alt: "WCP Kraken X60 brushless motor",
      description:
        "A modern high-power brushless motor from West Coast Products in the CTRE Talon FX ecosystem.",
      checks: [
        "Designed specifically for FRC.",
        "Used for drivetrains, swerve, shooters, climbers, elevators, and heavy arms.",
        "High power requires strong mechanical design.",
        "CAN wiring, current limits, and configuration matter.",
      ],
    },

    krakenX44: {
      title: "WCP Kraken X44",
      image: "../../shared/assets/motors/kraken-x44.png",
      alt: "WCP Kraken X44 brushless motor",
      description:
        "A compact brushless motor option in the Kraken/Talon FX ecosystem.",
      checks: [
        "Useful where space and weight matter.",
        "Common for steering motors, intakes, small arms, and compact manipulators.",
        "Lower power than X60.",
        "Still requires correct CTRE configuration and CAN setup.",
      ],
    },

    falcon: {
      title: "Falcon 500",
      image: "../../shared/assets/motors/falcon-500.png",
      alt: "Falcon 500 brushless motor",
      description:
        "A brushless motor with integrated Talon FX controller and encoder.",
      checks: [
        "Used on legacy high-performance robots.",
        "Common on drivetrains, swerve, shooters, and arms.",
        "Check current legality and vendor support.",
        "Controller replacement differs from separate motor/controller systems.",
      ],
    },

    small: {
      title: "Small High-Speed Motors",
      image: "../../shared/assets/motors/neo-550.png",
      alt: "Examples of small high-speed FRC motors",
      description:
        "Motors such as NEO 550, 775pro, RedLine, and BAG are fast and lightweight but need careful load management.",
      checks: [
        "Good for intakes, rollers, conveyors, and small shooters.",
        "Often need reductions.",
        "Can overheat quickly if overloaded.",
        "Not ideal for holding heavy arms or stalled loads.",
      ],
    },
  };

  const modal = document.getElementById("motorModal");
  const title = document.getElementById("motorModalTitle");
  const description = document.getElementById("motorModalDescription");
  const checks = document.getElementById("motorModalChecks");
  const image = document.getElementById("motorModalImage");
  const close = document.querySelector(".motor-modal-close");

  if (!modal || !title || !description || !checks || !image) return;

  document.querySelectorAll(".motor-click-card[data-motor]").forEach((card) => {
    // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
    card.addEventListener("click", () => {
      const info = motorInfo[card.dataset.motor];
      if (!info) return;

      card.classList.add("viewed");

      title.textContent = info.title;
      description.textContent = info.description;

      image.src = info.image;
      image.alt = info.alt;

      checks.innerHTML = "";
      info.checks.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        checks.appendChild(li);
      });

      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
    });
  });

  // STUDENT NOTE: Function `closeModal` groups one reusable behavior. Keep one clear responsibility per function so future students can test and modify it safely.
  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
  if (close) close.addEventListener("click", closeModal);

  // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  // STUDENT NOTE: Event listener for `keydown`. The callback below runs whenever that user/browser event occurs.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
}

// STUDENT NOTE: Initialization function `initScenario`. It finds the needed HTML elements and attaches behavior/listeners. Call it after the page DOM exists.
function initScenario() {
  document.querySelectorAll(".scenario-slide").forEach((slide) => {
    const buttons = slide.querySelectorAll(".scenario-options button");
    const feedback = slide.querySelector(".scenario-feedback");
    buttons.forEach((button) => {
      // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
      button.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("correct", "incorrect"));
        const correct = button.dataset.correct === "true";
        button.classList.add(correct ? "correct" : "incorrect");
        if (feedback)
          feedback.textContent = correct
            ? "Correct. The safest response combines software limits, current limits, mechanical review, and gearing checks."
            : "Not the best choice. Avoid continuing to stall the motor or removing safety limits.";
      });
    });
  });
}

// STUDENT NOTE: Event listener for `DOMContentLoaded`. The callback below runs whenever that user/browser event occurs.
document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("participantName");

  if (nameInput) {
    // STUDENT NOTE: Event listener for `input`. The callback below runs whenever that user/browser event occurs.
    nameInput.addEventListener("input", updateCertificateName);
  }

  updateCertificateName();

  const downloadCertificateButton = document.getElementById("downloadCertificate");

  if (downloadCertificateButton) {
    downloadCertificateButton.disabled = true;
    // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
    downloadCertificateButton.addEventListener("click", downloadCertificatePdf);
}
  const gradeButton = document.getElementById("gradeQuiz");
  const resetButton = document.getElementById("resetQuiz");
  // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
  if (gradeButton) gradeButton.addEventListener("click", gradeQuiz);
  // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
  if (resetButton) resetButton.addEventListener("click", resetQuiz);
  initCategorySort(".motor-sort-slide, .application-sort-slide");
  initMotorCards();
  initScenario();
});

// STUDENT NOTE: Helper function `getSafeFileName`. It retrieves or derives a value so the rest of the code does not repeat the same logic.
function getSafeFileName(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "certificate";
}

// STUDENT NOTE: UI/state helper `setCertificateDownloadEnabled`. It updates page content or control state to match the current application data.
function setCertificateDownloadEnabled(enabled) {
  const button = document.getElementById("downloadCertificate");

  if (button) {
    button.disabled = !enabled;
  }
}

// STUDENT NOTE: Download/export function `downloadCertificatePdf`. It converts page content into a downloadable artifact; external libraries used here must load before this function runs.
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