# 5041 Training Hub — Student Developer Guide

This copy of the training hub contains **extensive educational comments** in every HTML, CSS, and JavaScript file. The comments are aimed at high-school students who will create new training modules, update existing slides, add resources, and troubleshoot interactions.

## What each file type does

- **HTML** = content and structure. In Reveal.js modules, `<section>` elements are slides.
- **CSS** = appearance and layout. Classes connect CSS rules to HTML elements.
- **JavaScript** = behavior and interaction. It powers quizzes, sorting, reveal cards, calculators, certificates, forms, and other activities.
- **assets/** = images, PDFs, audio, and other media referenced by relative paths in HTML/CSS.

## Recommended workflow for a new module

1. Copy an existing module that is structurally similar to what you want.
2. Rename the HTML/CSS/JS files and module-specific class/function prefixes.
3. Keep the shared Reveal.js and 5041 styles linked.
4. Build slides with `<section>` elements and reuse existing card/grid classes where practical.
5. Add one interaction at a time and test it before adding the next.
6. Use `data-*` attributes for small pieces of answer/configuration data that JavaScript needs.
7. Use `closest(".your-slide-class")` in click handlers so one activity affects only its own slide.
8. Add a Reset action for any interaction that changes multiple elements.
9. Test navigation forward/backward, browser refresh, full screen, and a smaller browser window.
10. Open Developer Tools → Console whenever a click or script does nothing.

## Reveal.js slide structure

```html
<div class="reveal">
  <div class="slides">
    <section>Horizontal slide</section>

    <section>
      <section>Vertical slide 1</section>
      <section>Vertical slide 2</section>
    </section>
  </div>
</div>
```

## Common interaction pattern

```html
<section class="example-activity-slide">
  <button class="example-card" data-correct="true" onclick="checkExample(this)">
    Choice
  </button>
  <p class="example-feedback"></p>
</section>
```

```js
function checkExample(button) {
  const slide = button.closest(".example-activity-slide");
  const isCorrect = button.dataset.correct === "true";
  button.classList.add(isCorrect ? "correct" : "incorrect");
  slide.querySelector(".example-feedback").textContent =
    isCorrect ? "Correct." : "Try again.";
}

window.checkExample = checkExample;
```

```css
.example-card.correct { background: #e6f4ea; }
.example-card.incorrect { background: #fdecea; }
```

The three files work together: HTML provides `data-correct`, JavaScript reads it and adds a class, and CSS decides what that class looks like.

## Before committing changes

- No broken relative paths.
- No duplicate ids on one page.
- All buttons work more than once.
- Reset buttons fully reset the activity.
- Quiz grading still uses the intended answer key and passing score.
- Images fit the slide at common screen sizes.
- No errors appear in the browser Console.
- New code includes comments explaining *why* it exists, not only what the syntax says.
