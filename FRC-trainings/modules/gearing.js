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
/* 5041 Training Hub script: FRC-trainings/modules/gearing.js
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
const gearingCorrectAnswers = {
  q1: "b",
  q2: "b",
  q3: "a",
  q4: "a",
  q5: "b",
  q6: "b",
  q7: "c",
  q8: "a",
  q9: "a",
  q10: "c",
  q11: "a",
  q12: "b",
  q13: "a",
  q14: "c",
  q15: "a",
  q16: "a",
  q17: "a",
  q18: "b",
  q19: "a",
  q20: "b",
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

// STUDENT NOTE: Helper function `getSafeFileName`. It retrieves or derives a value so the rest of the code does not repeat the same logic.
function getSafeFileName(text) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "certificate"
  );
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

// STUDENT NOTE: Answer-checking function `gradeQuiz`. It reads the user state, compares it with the expected answer/data attributes, and updates feedback classes/text.
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

// STUDENT NOTE: Reset function `resetQuiz`. It should return this activity to its original state by clearing classes, values, and feedback created during interaction.
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

// STUDENT NOTE: Initialization function `initCategorySort`. It finds the needed HTML elements and attaches behavior/listeners. Call it after the page DOM exists.
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
      area.addEventListener("dragleave", () => {
        area.classList.remove("drag-over");
      });

      // STUDENT NOTE: Event listener for `drop`. The callback below runs whenever that user/browser event occurs.
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
      // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
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
      // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
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

// STUDENT NOTE: Initialization function `initRatioPractice`. It finds the needed HTML elements and attaches behavior/listeners. Call it after the page DOM exists.
function initRatioPractice() {
  const showButton = document.getElementById("showRatioAnswer");
  const hideButton = document.getElementById("hideRatioAnswer");
  const answer = document.getElementById("ratioAnswer");

  if (showButton && answer) {
    // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
    showButton.addEventListener("click", () => answer.classList.remove("hidden-answer"));
  }

  if (hideButton && answer) {
    // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
    hideButton.addEventListener("click", () => answer.classList.add("hidden-answer"));
  }
}

// STUDENT NOTE: Initialization function `initScenarios`. It finds the needed HTML elements and attaches behavior/listeners. Call it after the page DOM exists.
function initScenarios() {
  document.querySelectorAll(".scenario-choice").forEach((button) => {
    // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
    button.addEventListener("click", () => {
      const slide = button.closest(".scenario-slide");
      const feedback = slide?.querySelector(".scenario-feedback");
      if (feedback) {
        feedback.textContent = button.dataset.feedback || "Think about torque, speed, current, and control.";
      }
    });
  });
}

// STUDENT NOTE: Reveal.js `slidechanged` hook. Use these hooks when behavior should run as slides open or change.
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

// STUDENT NOTE: Event listener for `DOMContentLoaded`. The callback below runs whenever that user/browser event occurs.
document.addEventListener("DOMContentLoaded", () => {
  const gradeQuizButton = document.getElementById("gradeQuiz");
  const resetQuizButton = document.getElementById("resetQuiz");
  const nameInput = document.getElementById("participantName");
  const downloadCertificateButton = document.getElementById("downloadCertificate");

  // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
  if (gradeQuizButton) gradeQuizButton.addEventListener("click", gradeQuiz);
  // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
  if (resetQuizButton) resetQuizButton.addEventListener("click", resetQuiz);
  // STUDENT NOTE: Event listener for `input`. The callback below runs whenever that user/browser event occurs.
  if (nameInput) nameInput.addEventListener("input", updateCertificateName);
  if (downloadCertificateButton) {
    downloadCertificateButton.disabled = true;
    // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
    downloadCertificateButton.addEventListener("click", downloadCertificatePdf);
  }

  updateCertificateName();
  initCategorySort(".gear-sort-slide");
  initRatioPractice();
  initScenarios();
  initGearLab();
  initCustomGearboxTermMatch();
});

// STUDENT NOTE: Initialization function `initGearLab`. It finds the needed HTML elements and attaches behavior/listeners. Call it after the page DOM exists.
function initGearLab() {
  const bank = document.getElementById("gearBank");
  const slots = [...document.querySelectorAll(".gear-lab-slide .axle-slot")];
  const rpmInput = document.getElementById("gearInputRpm");
  const torqueInput = document.getElementById("gearInputTorque");
  const result = document.getElementById("gearTrainResult");
  const reset = document.getElementById("resetGearLab");

  if (!bank || !slots.length || !rpmInput || !torqueInput || !result) return;

  let dragged = null;
  const angles = new Map();

  // STUDENT NOTE: Function `makeDraggable` groups one reusable behavior. Keep one clear responsibility per function so future students can test and modify it safely.
  function makeDraggable(gear) {
    // STUDENT NOTE: Event listener for `dragstart`. The callback below runs whenever that user/browser event occurs.
    gear.addEventListener("dragstart", () => {
      dragged = gear;
      gear.classList.add("dragging");
    });

    // STUDENT NOTE: Event listener for `dragend`. The callback below runs whenever that user/browser event occurs.
    gear.addEventListener("dragend", () => {
      gear.classList.remove("dragging");
      dragged = null;
    });
  }

  document.querySelectorAll(".gear-token").forEach(makeDraggable);

  [...slots, bank].forEach((target) => {
    // STUDENT NOTE: Event listener for `dragover`. The callback below runs whenever that user/browser event occurs.
    target.addEventListener("dragover", (event) => {
      event.preventDefault();
      target.classList.add("drag-over");
    });

    // STUDENT NOTE: Event listener for `dragleave`. The callback below runs whenever that user/browser event occurs.
    target.addEventListener("dragleave", () => {
      target.classList.remove("drag-over");
    });

    // STUDENT NOTE: Event listener for `drop`. The callback below runs whenever that user/browser event occurs.
    target.addEventListener("drop", (event) => {
      event.preventDefault();
      target.classList.remove("drag-over");

      if (!dragged) return;

      if (target.classList.contains("axle-slot")) {
        const dropZone = target.querySelector(".axle-drop-zone");
        const existing = dropZone.querySelector(".gear-token");

        if (existing && existing !== dragged) {
          bank.appendChild(existing);
        }

        dropZone.appendChild(dragged);
      } else {
        bank.appendChild(dragged);
      }

      updateGearMath();
    });
  });

  // STUDENT NOTE: Helper function `getGearInSlot`. It retrieves or derives a value so the rest of the code does not repeat the same logic.
  function getGearInSlot(index) {
    return slots[index].querySelector(".gear-token");
  }

  // STUDENT NOTE: UI/state helper `updateGearMath`. It updates page content or control state to match the current application data.
  function updateGearMath() {
    const inputRpm = Number(rpmInput.value) || 0;
    const inputTorque = Number(torqueInput.value) || 0;
    const gears = slots.map((_, index) => getGearInSlot(index));

    const values = gears.map(() => null);

    if (gears[0]) {
      values[0] = {
        rpm: inputRpm,
        torque: inputTorque,
        direction: 1
      };
    }

    for (let i = 1; i < gears.length; i++) {
      if (!gears[i - 1] || !gears[i] || !values[i - 1]) break;

      const driverTeeth = Number(gears[i - 1].dataset.teeth);
      const drivenTeeth = Number(gears[i].dataset.teeth);

      values[i] = {
        rpm: -values[i - 1].rpm * (driverTeeth / drivenTeeth),
        torque: values[i - 1].torque * (drivenTeeth / driverTeeth),
        direction: -values[i - 1].direction
      };
    }

    slots.forEach((slot, index) => {
      const readout = slot.querySelector(".axle-readout");
      const gear = gears[index];

      if (!gear) {
        readout.textContent = "Drop gear here";
        return;
      }

      if (!values[index]) {
        readout.textContent = `${gear.dataset.teeth} teeth | not connected`;
        return;
      }

      const direction = values[index].rpm >= 0 ? "CW" : "CCW";

      readout.textContent =
        `${gear.dataset.teeth} teeth | ${Math.abs(values[index].rpm).toFixed(1)} RPM | ${values[index].torque.toFixed(2)} N·m | ${direction}`;
    });

    if (values[2]) {
      result.textContent =
        `Output: ${Math.abs(values[2].rpm).toFixed(1)} RPM and ${values[2].torque.toFixed(2)} N·m. Larger output gears increase torque and reduce speed; smaller output gears increase speed and reduce torque.`;
    } else {
      result.textContent =
        "Add connected gears from the input axle to the output axle to see the final speed and torque.";
    }

    return values;
  }

  // STUDENT NOTE: Function `animateGears` groups one reusable behavior. Keep one clear responsibility per function so future students can test and modify it safely.
  function animateGears(timeNow) {
    if (!animateGears.lastTime) animateGears.lastTime = timeNow;

    const dt = (timeNow - animateGears.lastTime) / 1000;
    animateGears.lastTime = timeNow;

    const values = updateGearMath();

    slots.forEach((slot, index) => {
      const gear = getGearInSlot(index);
      if (!gear || !values[index]) return;

      const current = angles.get(gear) || 0;
      const next = current + values[index].rpm * 6 * dt;

      angles.set(gear, next);
      gear.style.transform = `rotate(${next}deg)`;
    });

    requestAnimationFrame(animateGears);
  }

  // STUDENT NOTE: Event listener for `input`. The callback below runs whenever that user/browser event occurs.
  rpmInput.addEventListener("input", updateGearMath);
  // STUDENT NOTE: Event listener for `input`. The callback below runs whenever that user/browser event occurs.
  torqueInput.addEventListener("input", updateGearMath);

  if (reset) {
    // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
    reset.addEventListener("click", () => {
      document.querySelectorAll(".gear-token").forEach((gear) => {
        gear.style.transform = "";
        bank.appendChild(gear);
      });

      updateGearMath();
    });
  }

  updateGearMath();
  requestAnimationFrame(animateGears);
}

// STUDENT NOTE: Initialization function `initGearboxSort`. It finds the needed HTML elements and attaches behavior/listeners. Call it after the page DOM exists.
function initGearboxSort() {
  const slide = document.querySelector(".gearbox-sort-slide");
  if (!slide) return;

  const bank = slide.querySelector(".gearbox-sort-bank");
  const chips = slide.querySelectorAll(".gearbox-sort-chip");
  const zones = slide.querySelectorAll(".gearbox-sort-zone");
  const check = slide.querySelector(".check-gearbox-sort");
  const reset = slide.querySelector(".reset-gearbox-sort");
  const feedback = slide.querySelector(".gearbox-sort-feedback");
  let dragged = null;

  chips.forEach((chip) => {
    // STUDENT NOTE: Event listener for `dragstart`. The callback below runs whenever that user/browser event occurs.
    chip.addEventListener("dragstart", () => dragged = chip);
    // STUDENT NOTE: Event listener for `dragend`. The callback below runs whenever that user/browser event occurs.
    chip.addEventListener("dragend", () => dragged = null);
  });

  [...zones, bank].forEach((area) => {
    // STUDENT NOTE: Event listener for `dragover`. The callback below runs whenever that user/browser event occurs.
    area.addEventListener("dragover", (e) => e.preventDefault());
    // STUDENT NOTE: Event listener for `drop`. The callback below runs whenever that user/browser event occurs.
    area.addEventListener("drop", (e) => {
      e.preventDefault();
      if (!dragged) return;

      if (area.classList.contains("gearbox-sort-zone")) {
        area.querySelector(".gearbox-sort-list").appendChild(dragged);
      } else {
        bank.appendChild(dragged);
      }
    });
  });

  // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
  check.addEventListener("click", () => {
    let correct = 0;
    let total = chips.length;

    zones.forEach((zone) => {
      const zoneName = zone.dataset.zone;
      zone.querySelectorAll(".gearbox-sort-chip").forEach((chip) => {
        if (chip.dataset.answer === zoneName) correct++;
      });
    });

    feedback.textContent = `${correct}/${total} correct.`;
  });

  // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
  reset.addEventListener("click", () => {
    chips.forEach((chip) => bank.appendChild(chip));
    feedback.textContent = "";
  });
}

// STUDENT NOTE: Event listener for `DOMContentLoaded`. The callback below runs whenever that user/browser event occurs.
document.addEventListener("DOMContentLoaded", () => {
  initGearboxSort();
});

// STUDENT NOTE: Initialization function `initCustomGearboxTermMatch`. It finds the needed HTML elements and attaches behavior/listeners. Call it after the page DOM exists.
function initCustomGearboxTermMatch() {
  const slide = document.querySelector(".custom-gear-match-slide");
  if (!slide) return;

  const bank = slide.querySelector(".custom-gear-match-bank");
  const chips = slide.querySelectorAll(".custom-gear-match-chip");
  const zones = slide.querySelectorAll(".custom-gear-match-zone");
  const check = slide.querySelector(".check-custom-gear-match");
  const reset = slide.querySelector(".reset-custom-gear-match");
  const feedback = slide.querySelector(".custom-gear-match-feedback");
  let dragged = null;

  chips.forEach((chip) => {
    // STUDENT NOTE: Event listener for `dragstart`. The callback below runs whenever that user/browser event occurs.
    chip.addEventListener("dragstart", () => dragged = chip);
    // STUDENT NOTE: Event listener for `dragend`. The callback below runs whenever that user/browser event occurs.
    chip.addEventListener("dragend", () => dragged = null);
  });

  [...zones, bank].forEach((area) => {
    // STUDENT NOTE: Event listener for `dragover`. The callback below runs whenever that user/browser event occurs.
    area.addEventListener("dragover", (event) => event.preventDefault());

    // STUDENT NOTE: Event listener for `drop`. The callback below runs whenever that user/browser event occurs.
    area.addEventListener("drop", (event) => {
      event.preventDefault();
      if (!dragged) return;

      if (area.classList.contains("custom-gear-match-zone")) {
        const drop = area.querySelector(".custom-gear-match-drop");
        const existing = drop.querySelector(".custom-gear-match-chip");

        if (existing && existing !== dragged) {
          bank.appendChild(existing);
        }

        drop.appendChild(dragged);
      } else {
        bank.appendChild(dragged);
      }
    });
  });

  // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
  check.addEventListener("click", () => {
    let correct = 0;

    zones.forEach((zone) => {
      const chip = zone.querySelector(".custom-gear-match-chip");

      if (chip && chip.dataset.match === zone.dataset.zone) {
        correct++;
      }
    });

    feedback.textContent = `${correct}/${chips.length} correct.`;
  });

  // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
  reset.addEventListener("click", () => {
    chips.forEach((chip) => bank.appendChild(chip));
    feedback.textContent = "";
  });
}