Reveal.initialize({
  hash: true,
  slideNumber: true,
  transition: 'slide',
  backgroundTransition: 'fade',
  plugins: [ RevealMarkdown, RevealNotes ]
});

const electronicsCorrectAnswers = {
  q1: 'b',
  q2: 'a',
  q3: 'c',
  q4: 'a',
  q5: 'b',
  q6: 'a',
  q7: 'b',
  q8: 'a',
  q9: 'c',
  q10: 'b',
  q11: 'a',
  q12: 'c',
  q13: 'a',
  q14: 'b',
  q15: 'a',
  q16: 'b',
  q17: 'a',
  q18: 'c',
  q19: 'b',
  q20: 'a'
};

const passingScore = 18;
let quizPassed = false;

function gradeQuiz() {
  let score = 0;
  let unanswered = 0;

  for (const [name, correct] of Object.entries(electronicsCorrectAnswers)) {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    if (!checked) unanswered++;
    else if (checked.value === correct) score++;
  }

  const totalQuestions = Object.keys(electronicsCorrectAnswers).length;
  const result = document.getElementById('quizResult');
  const hint = document.getElementById('quizHint');
  const complete = document.getElementById('complete');
  const note = document.getElementById('completionNote');

  if (unanswered > 0) {
    quizPassed = false;
    complete.classList.add('locked');
    result.textContent = `You still need to answer ${unanswered} question(s).`;
    result.className = 'result';
    hint.textContent = 'Go back, answer every question, then grade the quiz again.';
    note.textContent = 'Complete after passing the required quiz.';
    return;
  }

  if (score >= passingScore) {
    quizPassed = true;
    complete.classList.remove('locked');
    result.textContent = `Passed: ${score}/${totalQuestions}. Completion slide unlocked.`;
    result.className = 'result success';
    hint.textContent = 'You passed. Advance to the completion slide.';
    note.textContent = `Module complete. Quiz score: ${score}/${totalQuestions}.`;
  } else {
    quizPassed = false;
    complete.classList.add('locked');
    result.textContent = `Not yet: ${score}/${totalQuestions}. Review and try again.`;
    result.className = 'result';
    hint.textContent = `You need at least ${passingScore}/${totalQuestions} to unlock completion.`;
    note.textContent = 'Complete after passing the required quiz.';
  }
}

const gradeQuizButton = document.getElementById('gradeQuiz');
const resetQuizButton = document.getElementById('resetQuiz');

if (gradeQuizButton) gradeQuizButton.addEventListener('click', gradeQuiz);

if (resetQuizButton) {
  resetQuizButton.addEventListener('click', () => {
    Object.keys(electronicsCorrectAnswers).forEach(questionName => {
      document.querySelectorAll(`input[name="${questionName}"]`).forEach(input => {
        input.checked = false;
      });
    });

    quizPassed = false;
    document.getElementById('complete').classList.add('locked');
    document.getElementById('quizResult').textContent = 'Not submitted.';
    document.getElementById('quizResult').className = 'result';
    document.getElementById('quizHint').textContent = 'After passing, advance to the final completion slide.';
    document.getElementById('completionNote').textContent = 'Complete after passing the required quiz.';
  });
}

Reveal.on('slidechanged', event => {
  if (event.currentSlide && event.currentSlide.id === 'complete' && !quizPassed) {
    const resultsSlide = document.getElementById('quiz-results');
    const resultsIndex = Reveal.getIndices(resultsSlide);

    setTimeout(() => {
      Reveal.slide(resultsIndex.h, resultsIndex.v || 0);
      document.getElementById('quizResult').textContent = 'Complete and pass the quiz before opening the completion slide.';
      document.getElementById('quizHint').textContent = `Passing score: ${passingScore}/${Object.keys(electronicsCorrectAnswers).length}.`;
    }, 0);
  }
});

function initCategorySort(slideSelector) {
  document.querySelectorAll(slideSelector).forEach(slide => {
    const bank = slide.querySelector('.sort-bank');
    const chips = [...slide.querySelectorAll('.sort-chip')];
    const dropAreas = slide.querySelectorAll('.sort-bank, .sort-zone');
    const checkButton = slide.querySelector('.check-sort');
    const resetButton = slide.querySelector('.reset-sort');
    const feedback = slide.querySelector('.activity-feedback');
    let draggedChip = null;

    chips.forEach(chip => {
      chip.addEventListener('dragstart', () => {
        draggedChip = chip;
        chip.classList.add('dragging');
      });
      chip.addEventListener('dragend', () => {
        chip.classList.remove('dragging');
        draggedChip = null;
      });
    });

    dropAreas.forEach(area => {
      area.addEventListener('dragover', event => {
        event.preventDefault();
        area.classList.add('drag-over');
      });
      area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
      area.addEventListener('drop', event => {
        event.preventDefault();
        area.classList.remove('drag-over');
        if (!draggedChip) return;
        draggedChip.classList.remove('correct', 'incorrect');
        if (area.classList.contains('sort-zone')) area.querySelector('.sort-list').appendChild(draggedChip);
        else area.appendChild(draggedChip);
        feedback.textContent = '';
      });
    });

    if (checkButton) {
      checkButton.addEventListener('click', () => {
        let allPlaced = true;
        let allCorrect = true;
        chips.forEach(chip => {
          chip.classList.remove('correct', 'incorrect');
          const zone = chip.closest('.sort-zone');
          if (!zone) {
            allPlaced = false;
            allCorrect = false;
            chip.classList.add('incorrect');
            return;
          }
          if (zone.dataset.zone === chip.dataset.answer) chip.classList.add('correct');
          else {
            chip.classList.add('incorrect');
            allCorrect = false;
          }
        });
        if (!allPlaced) {
          feedback.textContent = 'Place every card before checking.';
          feedback.style.color = '#b00020';
        } else if (allCorrect) {
          feedback.textContent = 'Correct. Good wiring choices reduce failures.';
          feedback.style.color = '#2e7d32';
        } else {
          feedback.textContent = 'Some cards need to move. Try again.';
          feedback.style.color = '#b00020';
        }
      });
    }

    if (resetButton) {
      resetButton.addEventListener('click', () => {
        chips.forEach(chip => {
          chip.classList.remove('correct', 'incorrect');
          bank.appendChild(chip);
        });
        feedback.textContent = '';
      });
    }
  });
}

function initOrderSort() {
  document.querySelectorAll('.trouble-order-slide').forEach(slide => {
    const list = slide.querySelector('.troubleshooting-sort');
    const cards = [...slide.querySelectorAll('.trouble-card')];
    const checkButton = slide.querySelector('.check-order');
    const resetButton = slide.querySelector('.reset-order');
    const feedback = slide.querySelector('.activity-feedback');
    const startingOrder = cards.map(card => card);
    let draggedCard = null;

    cards.forEach(card => {
      card.addEventListener('dragstart', () => {
        draggedCard = card;
        card.classList.add('dragging');
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        draggedCard = null;
      });
    });

    list.addEventListener('dragover', event => {
      event.preventDefault();
      list.classList.add('drag-over');
      const afterElement = getDragAfterElement(list, event.clientY);
      if (afterElement == null) list.appendChild(draggedCard);
      else list.insertBefore(draggedCard, afterElement);
    });

    list.addEventListener('dragleave', () => list.classList.remove('drag-over'));
    list.addEventListener('drop', () => list.classList.remove('drag-over'));

    function getDragAfterElement(container, y) {
      const draggableElements = [...container.querySelectorAll('.trouble-card:not(.dragging)')];
      return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) return { offset, element: child };
        return closest;
      }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    checkButton.addEventListener('click', () => {
      let correct = true;
      [...list.querySelectorAll('.trouble-card')].forEach((card, index) => {
        card.classList.remove('correct', 'incorrect');
        if (Number(card.dataset.order) === index + 1) card.classList.add('correct');
        else {
          card.classList.add('incorrect');
          correct = false;
        }
      });
      if (correct) {
        feedback.textContent = 'Correct. This is a good first-pass troubleshooting order.';
        feedback.style.color = '#2e7d32';
      } else {
        feedback.textContent = 'Not quite. Move the red cards and try again.';
        feedback.style.color = '#b00020';
      }
    });

    resetButton.addEventListener('click', () => {
      startingOrder.forEach(card => {
        card.classList.remove('correct', 'incorrect');
        list.appendChild(card);
      });
      feedback.textContent = '';
    });
  });
}

initCategorySort('.wire-sort-slide');
initOrderSort();



document.addEventListener("DOMContentLoaded", () => {
  const componentInfo = {
    battery: {
      title: "Battery",
      image: "assets/Components/battery.jpg",
      alt: "FRC robot battery",
      description: "The battery is the main 12V power source for the robot.",
      checks: [
    "A weak or poorly charged battery can cause brownouts, slow motors, radio drops, and match failures.",
    "The battery must be securely mounted so it cannot fall out during a match.",
    "Battery terminals and lugs should be tight, covered, and inspected often.",
    "Teams should label batteries and track which ones are competition-ready.",
    "The robot turns on does not mean the battery is good enough for a match.",
    "Batteries should be load-tested, not just voltage-checked."
   ]
    },

    mainBreaker: {
      title: "Main Breaker",
      image: "assets/components/main-breaker.png",
      alt: "FRC main breaker",
      description: "The main breaker is the robot’s primary power shutoff.",
      checks: [
   "It should be easy to reach quickly for safety, inspection, and field staff.",
    "It is usually mounted between the battery and the power distribution device.",
    "Loose wires or lugs at the main breaker can cause major power problems.",
    "It should be mounted firmly so impacts do not loosen it.",
    "Do not hide it behind mechanisms, panels, or wires.",
    "Students should know how to turn the robot off quickly."
      ]
    },

    powerDistribution: {
      title: "Power Distribution",
      image: "assets/components/pdps.png",
      alt: "FRC power distribution device",
      description: "The power distribution device sends battery power to robot circuits through breakers and fuses.",
      checks: [
    "It uses breakers or fuses to protect individual circuits.",
    "Motor controllers, the robot controller, radio power, pneumatics, and other devices may all receive power from this system.",
    "Using the wrong breaker or wire size can damage wiring or cause failures.",
    "The power distribution layout should be documented with a breaker/fuse map.",
    "Wires should be inserted fully, tug-tested, and labeled.",
    "It should be protected from metal chips, impacts, and loose debris."
      ]
    },

    roboRio: {
      title: "roboRIO / SystemCore",
      image: "assets/components/controllers.png",
      alt: "FRC robot controller",
      description: "The robot controller runs robot code and communicates with motor controllers, sensors, the radio, and the Driver Station.",
      checks: [
    "It receives commands from the Driver Station and sends commands to motors and mechanisms.",
    "It connects to sensors, motor controllers, the radio, and other robot devices.",
    "Power and communication cables should be strain-relieved so they do not pull out.",
    "Status lights are important for troubleshooting and should stay visible.",
    "It should be protected from impacts but still accessible for service.",
    "Many electrical problems may actually involve code, communication, wiring, or sensor issues.",
    "In 2027 the compeititon control system with switch to SystemCore"
      ]
    },

    radio: {
      title: "Radio",
      image: "assets/components/radio.png",
      alt: "FRC robot radio",
      description: "The radio connects the robot to the field and Driver Station.",
      checks: [
 "If the radio loses power or communication, the robot may become disabled.",
    "It should be mounted securely and protected from impacts.",
    "It should not be buried deep inside metal structure if avoidable.",
    "Ethernet and power cables should be strain-relieved.",
    "Status lights should be visible for troubleshooting.",
    "Good placement is usually high, visible, secure, and away from large metal or high-current wiring when possible."
      ]
    },

    motorControllers: {
      title: "Motor Controllers",
      image: "assets/components/motor-controllers.png",
      alt: "FRC motor controller",
      description: "Motor controllers receive commands from robot code and control motors.",
      checks: [
    "They receive power from the power distribution system and send power to motors.",
    "Many FRC motor controllers communicate over CAN.",
    "Each CAN motor controller needs the correct CAN ID.",
    "Power wires, motor wires, and CAN wires should all be labeled.",
    "Status lights help diagnose power, CAN, and fault issues.",
    "They should be mounted where they are secure, protected, and able to cool."
      ]
    },

    canBus: {
      title: "CAN Bus",
      image: "assets/components/can-connectors.png",
      alt: "CAN bus wiring",
      description: "The CAN bus is a communication network used by many FRC devices. ",
      checks: [
    "It commonly uses yellow and green wires.",
    "Devices on CAN need unique CAN IDs.",
    "A loose CAN connection can cause several devices to disappear or stop responding.",
    "The CAN chain or order should be documented.",
    "CAN wiring should be neat, secured, and protected from moving parts.",
    "CAN errors can often be diagnosed through software tools, logs, and device status lights."
      ]
    },

    pneumatics: {
      title: "Pneumatics",
      image: "assets/components/pneumatics.png",
      alt: "FRC pneumatics module",
      description: "If used, the pneumatics module controls the compressor, pressure switch, and solenoids.",
      checks: [
    "Pneumatics use compressed air to move cylinders or actuators.",
    "Pneumatic wiring and tubing should be protected from moving mechanisms and sharp edges.",
    "Solenoid wires and tubing should be labeled so problems are easier to trace.",
    "Leaks can reduce performance and cause the compressor to run too often.",
    "Pneumatic systems must follow current FRC rules for pressure, components, and setup.",
    "Students should understand both the electrical control side and the air/tubing side."
      ]
    },

    sensors: {
      title: "Sensors",
      image: "assets/components/sensors.png",
      alt: "FRC robot sensors",
      description: "Sensors give the robot information about position, speed, distance, pressure, limits, game pieces, and field targets.",
      checks: [
    "Common sensors include encoders, limit switches, beam-break sensors, gyros, cameras, distance sensors, and pressure sensors.",
    "Sensors must be mounted securely or their readings may be unreliable.",
    "Sensor wires are often small and should be protected from strain, impact, and moving parts.",
    "Sensors should be tested through the full range of mechanism motion.",
    "Sensor values should be checked in software before competition.",
    "Good sensor labels help both programmers and electrical students troubleshoot faster."
      ]
    }
  };

  const modal = document.getElementById("componentModal");
  const title = document.getElementById("componentModalTitle");
  const description = document.getElementById("componentModalDescription");
  const checks = document.getElementById("componentModalChecks");
  const image = document.getElementById("componentModalImage");
  const closeButton = document.getElementById("componentModalClose");

  if (!modal || !title || !description || !checks || !image || !closeButton) {
    console.warn("Component modal HTML is missing.");
    return;
  }

document.querySelectorAll(".component-card[data-component]").forEach(card => {
  card.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();

    const info = componentInfo[card.dataset.component];

    if (!info) {
      console.warn("No component info found for:", card.dataset.component);
      return;
    }

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

  closeButton.addEventListener("click", closeModal);

  modal.addEventListener("click", event => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });
});

function initComponentMatchSlides() {
  document.querySelectorAll(".component-match-slide").forEach(slide => {
    if (slide.dataset.matchInit === "true") return;
    slide.dataset.matchInit = "true";

    const bank = slide.querySelector(".match-bank");
    const cards = Array.from(slide.querySelectorAll(".match-card"));
    const dropSlots = slide.querySelectorAll(".drop-slot");
    const checkBtn = slide.querySelector(".match-check-btn");
    const resetBtn = slide.querySelector(".match-reset-btn");
    const feedback = slide.querySelector(".match-feedback");

    let draggedCard = null;

    cards.forEach(card => {
      card.addEventListener("dragstart", () => {
        draggedCard = card;
        card.classList.add("dragging");
      });

      card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
        draggedCard = null;
      });
    });

function makeDropTarget(target) {
  target.addEventListener("dragover", e => {
    e.preventDefault();
    target.classList.add("over");
  });

  target.addEventListener("dragleave", () => {
    target.classList.remove("over");
  });

  target.addEventListener("drop", e => {
    e.preventDefault();
    target.classList.remove("over");
    if (!draggedCard) return;

    if (target.classList.contains("drop-slot")) {
      const existing = target.querySelector(".match-card");

      if (existing && existing !== draggedCard) {
        bank.appendChild(existing);
      }

      target.appendChild(draggedCard);
      target.classList.add("filled");
    } else {
      bank.appendChild(draggedCard);
    }

    slide.querySelectorAll(".drop-slot").forEach(slot => {
      if (!slot.querySelector(".match-card")) {
        slot.classList.remove("filled");
      }
    });

    target.classList.remove("correct", "incorrect");
    feedback.textContent = "";
  });
}

    makeDropTarget(bank);
    dropSlots.forEach(slot => makeDropTarget(slot));

    checkBtn.addEventListener("click", () => {
      let correctCount = 0;

      dropSlots.forEach(slot => {
        const card = slot.querySelector(".match-card");
        const isCorrect = card && card.dataset.match === slot.dataset.accept;

        slot.classList.remove("correct", "incorrect");

        if (isCorrect) {
          slot.classList.add("correct");
          correctCount++;
        } else {
          slot.classList.add("incorrect");
        }
      });

      if (correctCount === dropSlots.length) {
        feedback.textContent = "Excellent — all 9 matches are correct.";
      } else {
        feedback.textContent = `You have ${correctCount} of ${dropSlots.length} correct.`;
      }
    });

    resetBtn.addEventListener("click", () => {
      const allCards = Array.from(slide.querySelectorAll(".match-card"));

      allCards
        .sort((a, b) => Number(a.dataset.order) - Number(b.dataset.order))
        .forEach(card => bank.appendChild(card));

dropSlots.forEach(slot => {
  slot.classList.remove("correct", "incorrect", "filled");
});

      feedback.textContent = "";
    });
  });
}

document.addEventListener("DOMContentLoaded", initComponentMatchSlides);

document.addEventListener("DOMContentLoaded", () => {
  const sensorInfo = {
    limitSwitch: {
      title: "Limit Switch",
      image: "assets/Sensors/limit-switch.png",
      alt: "Limit switch",
      description: "A limit switch detects physical contact. It is usually used to tell the robot that a mechanism has reached a known endpoint.",
      checks: [
        "Homing an elevator or arm.",
        "Stopping motion at travel limits.",
        "Detecting whether a mechanism is fully closed.",
        "Confirming a part has reached a start position.",
        "Protecting mechanisms from overtravel."
      ]
    },

    beamBreak: {
      title: "Beam Break Sensor",
      image: "assets/Sensors/beam-break.jpg",
      alt: "Beam break sensor",
      description: "A beam break sensor uses a light beam to detect when an object passes through or blocks the beam.",
      checks: [
        "Detecting a game piece in an intake.",
        "Confirming cargo or notes are loaded.",
        "Counting objects moving through a path.",
        "Triggering an indexer or shooter sequence.",
        "Checking whether a game piece is staged."
      ]
    },

    relativeEncoder: {
      title: "Relative Encoder",
      image: "assets/Sensors/relative-encoder.png",
      alt: "Relative encoder",
      description: "A relative encoder measures change in rotation or position from a starting point. It usually needs to be zeroed when the robot powers on.",
      checks: [
        "Measuring wheel movement.",
        "Tracking motor shaft rotation.",
        "Estimating drivetrain distance.",
        "Measuring elevator or arm movement.",
        "Controlling closed-loop motor position."
      ]
    },

    absoluteEncoder: {
      title: "Absolute Encoder",
      image: "assets/Sensors/absolute-encoder.png",
      alt: "Absolute encoder",
      description: "An absolute encoder reports the real position of a mechanism, even after the robot has been turned off and back on.",
      checks: [
        "Knowing arm angle at startup.",
        "Tracking swerve module angle.",
        "Measuring wrist or turret position.",
        "Avoiding repeated homing routines.",
        "Recovering position after power cycles."
      ]
    },

    gyro: {
      title: "Gyro",
      image: "assets/Sensors/gyro.png",
      alt: "Gyro sensor",
      description: "A gyro measures robot rotation, heading, and orientation. It is often used by autonomous and drivetrain code.",
      checks: [
        "Driving straight automatically.",
        "Tracking robot heading.",
        "Field-relative swerve driving.",
        "Balancing or orientation control.",
        "Autonomous path following."
      ]
    },

    camera: {
      title: "Cameras",
      image: "assets/Sensors/cameras.png",
      alt: "Robot cameras",
      description: "Cameras help the robot or drivers see important targets, field locations, game pieces, or alignment information.",
      checks: [
        "Driver vision.",
        "AprilTag localization.",
        "Target alignment.",
        "Game piece detection.",
        "Assisted scoring alignment."
      ]
    },

    lidar: {
      title: "Distance / LiDAR Sensor",
      image: "assets/Sensors/lidar.png",
      alt: "LiDAR distance sensor",
      description: "A distance sensor measures how far away an object or surface is from the robot.",
      checks: [
        "Measuring distance to a wall.",
        "Detecting nearby game pieces.",
        "Checking mechanism spacing.",
        "Aligning to field elements.",
        "Stopping before contact."
      ]
    },
    accelerometer: {
  title: "Accelerometer",
  image: "assets/Sensors/accelerometer.jpg",
  alt: "Accelerometer sensor",
  description: "An accelerometer measures acceleration and changes in motion. It can help detect robot movement, impacts, tilt, vibration, or sudden changes in speed.",
  checks: [
    "Detecting robot impacts.",
    "Measuring sudden acceleration.",
    "Monitoring robot vibration.",
    "Detecting tilt or tipping.",
    "Supporting balance or motion analysis."
      ]
    },
  };

  const modal = document.getElementById("componentModal");
  const title = document.getElementById("componentModalTitle");
  const description = document.getElementById("componentModalDescription");
  const checks = document.getElementById("componentModalChecks");
  const image = document.getElementById("componentModalImage");

  if (!modal || !title || !description || !checks || !image) {
    console.warn("Sensor modal HTML is missing.");
    return;
  }

  document.querySelectorAll(".sensor-click-card[data-sensor]").forEach(card => {
    card.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();

      const info = sensorInfo[card.dataset.sensor];

      if (!info) {
        console.warn("No sensor info found for:", card.dataset.sensor);
        return;
      }

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
});
