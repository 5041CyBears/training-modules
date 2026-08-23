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
// Paste your deployed Google Apps Script /exec URL below.
// This app is intentionally structured like the 5041 Hours Tracker app:
// static files + config.js + Google Apps Script backend.
// STUDENT NOTE: Exposes `ROAR_APP_CONFIG` globally so inline HTML such as onclick="ROAR_APP_CONFIG(...)" can call it.
window.ROAR_APP_CONFIG = {
  SCRIPT_URL: "https://script.google.com/a/macros/west-branch.k12.ia.us/s/AKfycbzeV7l7oYu0m-YgSJLx2EeDfYWABV1Yc8Wm7Ye_Cw8gD04IMB7sb-W20_I_evGyZzi_/exec",

  // Optional light protection. Must match APP_TOKEN in google-apps-script/Code.gs.
  // This is visible in the browser, so it is not strong security.
  APP_TOKEN: "5041-roar-report-token"
};
