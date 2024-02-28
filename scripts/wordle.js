const ENTER_KEY = "enter";
const BACKSPACE_KEY = "backspace";
const ARROWLEFT_KEY = "arrowleft";
const ARROWRIGHT_KEY = "arrowright";

import { confetti, startConfetti } from "./confetti.js";
import { words as wordlist } from "./wordlist.js";

export default class Wordle {
  constructor(options = {}) {
    if (!options.word) {
      this.wordLength = Storage.get('wordle__length') || 6;
    }

    this.word = options.word && options.word.split("") || this.randomWord(this.wordLength).split("");
    this.attempts = options.attempts || 6;
    this.container = options.container || document.body;

    this.enableControls = true;
    this.currentAttempt = 0;
    this.currentCol = 0;
    this.guesses = [];

    this.__createMenu();
    this.init();
    this.__registerKeyEvent();
    // this.__startTutorial();
  }

  // Functions
  init() {
    this.__createGrid();
    this.__createErrorContainer();
  }

  randomWord = (length = null) => {
    const list = length ? wordlist.filter(word => word.length === length) : wordlist;
    return list[Math.floor(Math.random() * list.length)].toLowerCase();
  }

  element(element, className = false, innerHTML = false) {
    const el = document.createElement(element);
    if (className) el.className = className;
    if (innerHTML) el.innerHTML = innerHTML;

    return el;
  }

  isLetter(character) {
    if (character.length === 1 && character.match(/[a-z]/g)) return true;
    else return false;
  }

  inArray(item, arr) {
    if (arr.indexOf(item) > -1) return true;
    else return false;
  }

  inArrayAtPos(item, index, arr) {
    if (arr[index] === item) return true;
    else return false;
  }

  reset() {
    this.currentCol = 0;
    this.currentAttempt = 0;
    this.guesses = [];
    this.wordLength = Storage.get("wordle__length");

    this.word = this.randomWord(this.wordLength).split("");

    document.querySelector(".wordle__grid").remove();
    document.querySelector(".wordle__errors").remove();

    const overlay = document.querySelector(".wordle__overlay");
    if (overlay) overlay.remove();

    this.enableControls = true;

    this.init();
  }

  checkAnswer(answer, cols) {
    const inWordList = this.inArray(answer.join(''), wordlist);
    const alreadyGuessed = this.inArray(answer.join(''), this.guesses);
    let correctLetters = [];

    if (answer.length <= 0) return;
    if (!inWordList) return this.__createError(`<span>${answer.join('')}</span> is not in wordlist`);
    if (alreadyGuessed) return this.__createError(`<span>${answer.join('')}</span> has already been guessed`);

    answer.forEach((letter, i) => {
      if (this.inArrayAtPos(letter, i, this.word)) {
        cols[i].style.background = "#004F2D";
        correctLetters.push({ letter, i })
      } else if (this.inArray(letter, this.word)) {
        cols[i].style.background = "#ffda22";
        cols[i].style.color = "#000000";
      } else null;
    })

    this.currentAttempt += 1;
    this.currentCol = 0;
    this.guesses.push(answer.join(''))

    if (correctLetters.length === answer.length || this.currentAttempt === this.attempts) this.__createFinishScreen();
  }

  handleInput(key) {
    let target = document.querySelector(`.row-${this.currentAttempt} .column-${this.currentCol}`);
    target.classList.remove("target")


    if (key === ARROWLEFT_KEY && this.currentCol > 0) { this.currentCol -= 1; }
    if (key === ARROWRIGHT_KEY && this.currentCol < this.word.length - 1) { this.currentCol += 1; }
    else if (key === BACKSPACE_KEY) {
      let isLastCol = this.currentCol <= this.word.length - 1;

      if (target.innerHTML !== "") {
        // Move back a space before editing if it's not the last col
        if (this.currentCol > 0 && !isLastCol) { this.currentCol -= 1; }

        target = document.querySelector(`.row-${this.currentAttempt} .column-${this.currentCol}`)
        target.innerHTML = "";
      }
      // Move back a space after editing if it's the last col.
      else if (this.currentCol > 0 && isLastCol) { this.currentCol -= 1; }
    } else if (key === ENTER_KEY) {
      const row = document.querySelector(`.row-${this.currentAttempt}`).children;
      const answer = [];
      const cols = [];

      for (let i = 0; i < row.length; i++) {
        const col = row.item(i);

        // if string is empty return before pushing to answer arr.
        if (col.innerHTML.length <= 0) return;
        answer.push(col.innerHTML);
        cols.push(col)
      }

      this.checkAnswer(answer, cols)
    } else if (this.isLetter(key)) {
      target.innerHTML = key;
      if (this.currentCol < this.word.length - 1) this.currentCol += 1;
    } else null;

    if (this.currentAttempt >= this.attempts) return;

    target = document.querySelector(`.row-${this.currentAttempt} .column-${this.currentCol}`);
    target.classList.add("target")
  }

  // Events / Setup
  __createMenu() {
    const menu = this.element("span", "wordle__menu")

    if (this.wordLength) {
      const wordLength = this.element("input", "wordle__menuInput")
      wordLength.type = "number"
      wordLength.value = this.wordLength;
      wordLength.max = 11;
      wordLength.min = 3;

      wordLength.addEventListener("change", (e) => {
        let newLength = Number(wordLength.value);

        if (newLength < wordLength.min) {
          wordLength.value = wordLength.min;
          this.wordLength = Number(wordLength.min);
        } else if (newLength > wordLength.max) {
          wordLength.value = wordLength.max;
          this.wordLength = Number(wordLength.max);
        } else {
          this.wordLength = newLength;
        }

        Storage.set("wordle__length", this.wordLength)
        this.reset();
      })

      wordLength.addEventListener("focus", (e) => e.target.blur());

      menu.appendChild(wordLength);
    }
    this.container.appendChild(menu);
  }

  __createFinishScreen() {
    this.enableControls = false;

    const overlayBackground = this.element("div", "wordle__overlay");
    const backgroundCanvas = this.element("canvas", "wordle__canvas")
    const newGameButton = this.element("button", "wordle__button", "New Game")
    const showAnswer = this.element("p", "wordl__answer", `Your word was: ${this.word.join('')}`)

    newGameButton.addEventListener("click", () => this.reset())

    overlayBackground.appendChild(backgroundCanvas)
    overlayBackground.appendChild(showAnswer)
    overlayBackground.appendChild(newGameButton)
    this.container.appendChild(overlayBackground)

    confetti();
    startConfetti(".wordle__canvas")
  }

  __createError(message) {
    const errorMessage = this.element("span", "error", message);
    const errorContainer = document.querySelector(".wordle__errors");
    const timeout = 6000;

    errorContainer.appendChild(errorMessage);

    setTimeout(() => { errorMessage.style.opacity = 0 }, timeout);
    setTimeout(() => { errorMessage.remove() }, timeout + 1200);
  }

  __createGrid() {
    const grid = this.element("section", "wordle__grid");
    const columns = this.word;
    const rows = this.attempts;

    for (let i = 0; i < rows; i++) {
      const row = this.element("article", `row row-${i}`);

      columns.forEach((col, index) => {
        const temp = this.element("p", `column column-${index}`);
        row.appendChild(temp)
      })

      grid.appendChild(row)
    }

    this.container.appendChild(grid);
  }

  __createErrorContainer() {
    const container = this.element("section", "wordle__errors");

    this.container.appendChild(container);
  }

  __registerKeyEvent() {
    addEventListener("keydown", (e) => {
      if (!this.enableControls) return;
      this.handleInput(e.key.toLowerCase())
    })
  }




  /*
    This feature is still in development and has a lot of bugs, not sure if I will ever be able to finish this...
  */

  // __startTutorial() {
  //   // Don't start tutorial if tutorial has already been done once.
  //   if (JSON.parse(localStorage.getItem("wordle__tutorial"))) return;

  //   this.enableControls = false;
  //   let currentTarget = 0;

  //   const targets = [
  //     { el: document.querySelector(".wordle__menu > .wordle__menuInput"), text: "Increase or decrease the length of your word using this input" },
  //     { el: document.querySelector(".wordle__grid"), text: "" }
  //   ]

  //   const moveTarget = (target) => {
  //     const element = target.el;
  //     const parent = element.parentNode;
  //     const clone = target.el.cloneNode(true);

  //     element.insertAdjacentHTML("afterend", "<div class='wordle__tutorialBackground'></div");
  //     const background = document.querySelector(".wordle__tutorialBackground");

  //     const flash = this.element("div", "wordle__tutorialFlash");
  //     flash.style.zIndex = 10;

  //     parent.replaceChild(flash, element);
  //     flash.appendChild(element);

  //     const tooltip = this.element("div", "wordle__tutorialTooltip", target.text);
  //     tooltip.style.zIndex = 10;

  //     const buttonWrapper = this.element("span")

  //     if (currentTarget > 0) {
  //       const prev = this.element("button", "wordle__tutorialButton -prev", "previous");
  //       buttonWrapper.appendChild(prev)
  //     }

  //     const next = this.element("button", "wordle__tutorialButton -next", "next");

  //     buttonWrapper.appendChild(next)

  //     tooltip.appendChild(buttonWrapper)

  //     flash.insertAdjacentHTML("afterend", tooltip.outerHTML);

  //     document.querySelector(".-next").addEventListener("click", () => {
  //       removeTarget(clone, parent, [background, flash, tooltip, element]);
        
  //       currentTarget++

  //       moveTarget(targets[currentTarget])
  //     })
  //   }

  //   const removeTarget = (clone, parent, remove) => {
  //     remove.forEach(target => target.remove());

  //     parent.appendChild(clone)
  //   }

  //   moveTarget(targets[currentTarget]);

    // Set storage to not start tutorial again upon coming back to site.
    // localStorage.setItem("wordle__tutorial", JSON.stringify(true));
  // }
}