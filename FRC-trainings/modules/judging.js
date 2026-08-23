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
/* 5041 Training Hub script: FRC-trainings/modules/judging.js
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

const machineAwardInfo = {
  autonomous: {
    title: "Autonomous Award",
    bullets: [
      "Explain what the robot does without driver input.",
      "Describe sensing, positioning, and repeatability.",
      "Use match data or testing examples.",
      "Explain how auto helps alliance strategy.",
      "Mention what changed after tuning.",
    ],
    sample:
      "Our most reliable auto uses vision and gyro feedback to align before scoring. We tested it from multiple starting positions so it still works after a slightly imperfect setup.",
  },
  creativity: {
    title: "Creativity Award",
    bullets: [
      "Point out the unusual component, concept, or attribute.",
      "Explain why the team chose it intentionally.",
      "Connect the idea to strategy of play.",
      "Show prototypes or alternatives the team rejected.",
      "Explain tradeoffs and what students learned.",
    ],
    sample:
      "Most teams solved this with a straight arm, but we used a folding linkage so the mechanism stays protected inside the frame until needed.",
  },
  engineering: {
    title: "Excellence in Engineering Award",
    bullets: [
      "Explain how robot systems work together.",
      "Connect mechanical, electrical, and software decisions.",
      "Show CAD, prototypes, testing, and design constraints.",
      "Describe integration challenges students solved.",
      "Explain why the final design fits the strategy.",
    ],
    sample:
      "The shooter, indexing sensor, and driver feedback were designed together so the driver knows when the game piece is staged and the code can maintain a consistent firing sequence.",
  },
  industrial: {
    title: "Industrial Design Award",
    bullets: [
      "Discuss form, function, and aesthetics together.",
      "Show clean packaging and accessible maintenance points.",
      "Explain why parts are placed where they are.",
      "Point out wiring, panel access, bumpers, and repair paths.",
      "Describe how CAD helped make the robot organized.",
    ],
    sample:
      "We kept the electronics panel visible and serviceable, routed wires through protected paths, and placed high-repair parts where pit students can reach them quickly.",
  },
  control: {
    title: "Innovation in Control Award",
    bullets: [
      "Explain a unique control feature or driver assist.",
      "Name sensors, software logic, and operator inputs.",
      "Show how it makes the robot easier or faster to use.",
      "Describe how students tested and tuned it.",
      "Explain what happens when sensor readings are wrong.",
    ],
    sample:
      "Our driver presses one button and the robot uses vision plus gyro heading to align. The driver still controls final movement, but the assist reduces overcorrection.",
  },
  quality: {
    title: "Quality Award",
    bullets: [
      "Explain robot robustness and repairability.",
      "Show parts designed to survive impacts.",
      "Describe pre-match and post-match checklists.",
      "Show standardized fasteners, labels, spares, or modular parts.",
      "Give an example of a quick repair or improved reliability.",
    ],
    sample:
      "The intake takes the most hits, so we made it flexible, labeled replacement parts, and keep a spare preassembled. We can swap the front roller in a few minutes.",
  },
};

const teamAwardInfo = {
  ei: {
    title: "Engineering Inspiration Award",
    bullets: [
      "Describe how the team advances respect for engineering.",
      "Use school, community, FLL, FTC, or outreach examples.",
      "Mention measurable growth or repeated programs.",
      "Explain why the work matters to students or the community.",
      "Show that efforts are ongoing, not one-time only.",
    ],
    sample:
      "We support younger FIRST students through FLL and FTC mentoring, which creates a pathway from elementary robotics to high school engineering.",
  },
  gp: {
    title: "Gracious Professionalism Award",
    bullets: [
      "Share specific examples of helping other teams.",
      "Explain how students handle stress and conflict.",
      "Describe collaboration before or during events.",
      "Show respect for volunteers, opponents, and partners.",
      "Make clear that GP is a team habit, not a single act.",
    ],
    sample:
      "When another team had CAN issues, two students helped trace their bus and shared our checklist. We compete hard, but we want every team to get on the field.",
  },
  imagery: {
    title: "Imagery Award",
    bullets: [
      "Explain the team’s visual identity and theme.",
      "Connect robot, pit, shirts, buttons, handouts, and media.",
      "Show how students created the imagery.",
      "Explain how imagery supports team pride and recognition.",
      "Describe how aesthetics are integrated with engineering.",
    ],
    sample:
      "Our CyBear identity shows up in our pit, robot labels, team shirts, handouts, and web materials so students and visitors recognize us immediately.",
  },
  judges: {
    title: "Judges Award",
    bullets: [
      "Share a unique team story that does not fit another award.",
      "Focus on positive effort, growth, or dynamics.",
      "Avoid only telling a hard-luck story.",
      "Explain what students did in response to a challenge.",
      "Make the story memorable and student-centered.",
    ],
    sample:
      "Our unique story is how new students rebuilt team systems after turnover: training checklists, pit roles, and documentation made the team stronger for future years.",
  },
  rising: {
    title: "Rising / Rookie All-Star Awards",
    bullets: [
      "Explain what makes the team young, new, or rebuilding.",
      "Share challenges without making excuses.",
      "Show growth in skills, structure, and team culture.",
      "Describe mentorship and partnerships.",
      "Explain plans for next year and long-term continuity.",
    ],
    sample:
      "We had many new students, so we built training groups for CAD, fabrication, programming, and pit work. The goal was to make the team stronger next year, not just finish this robot.",
  },
  spirit: {
    title: "Team Spirit Award",
    bullets: [
      "Show enthusiasm that supports FIRST objectives.",
      "Explain how students encourage each other.",
      "Give examples from stands, pits, outreach, or alliance support.",
      "Describe how the team stays positive after problems.",
      "Connect spirit to teamwork and inclusion.",
    ],
    sample:
      "Our spirit is not only cheering. We use team roles so everyone has a match-day purpose, and we celebrate pit fixes, scouting, media, and drive team equally.",
  },
  sustainability: {
    title: "Team Sustainability Award",
    bullets: [
      "Explain People, Prosperity, and Planet initiatives.",
      "Describe recruiting, training, and retaining students and mentors.",
      "Explain fundraising, budgeting, and risk management.",
      "Show environmental choices such as reuse or waste reduction.",
      "Prove the team does not depend on one person.",
    ],
    sample:
      "For people, we train new students with modules. For prosperity, we track fundraising and sponsor communication. For planet, we reuse materials and plan purchases to reduce waste.",
  },
};

// STUDENT NOTE: Function `renderAward` groups one reusable behavior. Keep one clear responsibility per function so future students can test and modify it safely.
function renderAward(output, info) {
  if (!output || !info) return;
  output.innerHTML = `
    <h3>${info.title}</h3>
    <ul>${info.bullets.map((item) => `<li>${item}</li>`).join("")}</ul>
    <p><strong>Sample:</strong> ${info.sample}</p>
  `;
}

document.querySelectorAll(".machine-awards .award-chip").forEach((button) => {
  // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
  button.addEventListener("click", () => {
    document
      .querySelectorAll(".machine-awards .award-chip")
      .forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    renderAward(
      document.getElementById("machineAwardOutput"),
      machineAwardInfo[button.dataset.award],
    );
  });
});

document.querySelectorAll(".team-awards .award-chip").forEach((button) => {
  // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
  button.addEventListener("click", () => {
    document
      .querySelectorAll(".team-awards .award-chip")
      .forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    renderAward(
      document.getElementById("teamAwardOutput"),
      teamAwardInfo[button.dataset.award],
    );
  });
});

let draggedChip = null;
const sortBank = document.querySelector(".judge-sort-bank");
const sortZones = document.querySelectorAll(".judge-sort-zone");

document.querySelectorAll(".judge-sort-chip").forEach((chip) => {
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

// STUDENT NOTE: Function `allowDrop` groups one reusable behavior. Keep one clear responsibility per function so future students can test and modify it safely.
function allowDrop(area) {
  // STUDENT NOTE: Event listener for `dragover`. The callback below runs whenever that user/browser event occurs.
  area.addEventListener("dragover", (event) => {
    event.preventDefault();
    area.classList.add("drag-over");
  });
  // STUDENT NOTE: Event listener for `dragleave`. The callback below runs whenever that user/browser event occurs.
  area.addEventListener("dragleave", () => area.classList.remove("drag-over"));
  // STUDENT NOTE: Event listener for `drop`. The callback below runs whenever that user/browser event occurs.
  area.addEventListener("drop", (event) => {
    event.preventDefault();
    area.classList.remove("drag-over");
    if (!draggedChip) return;
    draggedChip.classList.remove("correct", "incorrect");
    if (area.classList.contains("judge-sort-bank"))
      area.appendChild(draggedChip);
    else {
      const list = area.querySelector(".judge-sort-list");
      if (list) list.appendChild(draggedChip);
    }
  });
}

if (sortBank) allowDrop(sortBank);
sortZones.forEach(allowDrop);

const checkSort = document.querySelector(".check-judge-sort");
const resetSort = document.querySelector(".reset-judge-sort");
const sortFeedback = document.querySelector(
  ".judge-sort-slide .activity-feedback",
);

if (checkSort) {
  // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
  checkSort.addEventListener("click", () => {
    let total = 0;
    let correct = 0;
    document.querySelectorAll(".judge-sort-zone").forEach((zone) => {
      const zoneAnswer = zone.dataset.zone;
      zone.querySelectorAll(".judge-sort-chip").forEach((chip) => {
        total++;
        chip.classList.remove("correct", "incorrect");
        if (chip.dataset.answer === zoneAnswer) {
          chip.classList.add("correct");
          correct++;
        } else chip.classList.add("incorrect");
      });
    });
    if (sortFeedback)
      sortFeedback.textContent = `${correct} of ${total} sorted correctly.`;
  });
}

if (resetSort && sortBank) {
  // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
  resetSort.addEventListener("click", () => {
    document.querySelectorAll(".judge-sort-chip").forEach((chip) => {
      chip.classList.remove("correct", "incorrect");
      sortBank.appendChild(chip);
    });
    if (sortFeedback) sortFeedback.textContent = "";
  });
}

document.querySelectorAll(".response-card").forEach((card) => {
  // STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
  card.addEventListener("click", () => {
    document
      .querySelectorAll(".response-card")
      .forEach((c) => c.classList.remove("correct", "incorrect"));
    const isCorrect = card.dataset.correct === "true";
    card.classList.add(isCorrect ? "correct" : "incorrect");
    const feedback = document.querySelector(".response-feedback");
    if (feedback)
      feedback.textContent = isCorrect
        ? "Correct. It is specific, evidence-based, and student-owned."
        : "Try again. Look for the answer with a clear example and result.";
  });
});

// STUDENT NOTE: Quiz answer key. The object keys must match the name/id convention used by the quiz inputs in the HTML.
const judgingCorrectAnswers = {
  q1: "b",
  q2: "a",
  q3: "c",
  q4: "a",
  q5: "b",
  q6: "c",
  q7: "b",
  q8: "a",
  q9: "b",
  q10: "b",
  q11: "a",
  q12: "b",
  q13: "a",
  q14: "a",
  q15: "a",
  q16: "a",
  q17: "a",
  q18: "a",
  q19: "a",
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
  for (const [name, correct] of Object.entries(judgingCorrectAnswers)) {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    if (!checked) unanswered++;
    else if (checked.value === correct) score++;
  }

  const totalQuestions = Object.keys(judgingCorrectAnswers).length;
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
  Object.keys(judgingCorrectAnswers).forEach((questionName) => {
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
  if (hint)
    hint.textContent =
      "After passing, advance to the final completion certificate.";
  if (note) note.textContent = "Complete after passing the required quiz.";
}

const gradeQuizButton = document.getElementById("gradeQuiz");
const resetQuizButton = document.getElementById("resetQuiz");
// STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
if (gradeQuizButton) gradeQuizButton.addEventListener("click", gradeQuiz);
// STUDENT NOTE: Event listener for `click`. The callback below runs whenever that user/browser event occurs.
if (resetQuizButton) resetQuizButton.addEventListener("click", resetQuiz);

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
        hint.textContent = `Passing score: ${passingScore}/${Object.keys(judgingCorrectAnswers).length}.`;
    }, 0);
  }
});

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