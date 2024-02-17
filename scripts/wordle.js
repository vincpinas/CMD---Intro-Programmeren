const ENTER_KEY = "enter";
const BACKSPACE_KEY = "backspace";

import { words as wordlist } from "./wordlist.js";

export default class Wordle {
  constructor(word, options = {}) {
    this.word = word.split("");
    this.attempts = options.attemps||5;
    this.container = options.container||document.body;
    
    this.currentAttempt = 0;
    this.currentCol = 0;

    this.__createGrid();
    this.__createErrorContainer();
    this.__registerKeyEvent();
  }

  // Functions
  element(element, className = null, innerHTML = null) {
    const el = document.createElement(element);
    if(className) el.className = className;
    if(innerHTML) el.innerHTML = innerHTML;

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

  compareAnswer(answer, cols) {
    const inWordList = this.inArray(answer.join(''), wordlist);

    if(!inWordList) return this.createError("Word is not in wordlist");

    answer.forEach((letter, i) => {
      if (this.inArrayAtPos(letter, i, this.word)) {
        cols[i].style.background = "green";
      } else if (this.inArray(letter, this.word)) {
        cols[i].style.background = "yellow";
      } else {

      }
    })

    this.currentAttempt += 1;
    this.currentCol = 0;
  }

  createError(message) {
    const errorMessage = this.element("span", "error", message);
    const errorContainer = document.querySelector(".wordle__errors");
    const timeout = 6000;

    errorContainer.appendChild(errorMessage);

    setTimeout(() => { errorMessage.style.opacity = 0 }, timeout);
    setTimeout(() => { errorMessage.remove() }, timeout + 1200);
  }

  handleInput(key) {
    let target = document.querySelector(`.row-${this.currentAttempt} .column-${this.currentCol}`);
    target.classList.remove("target")

    if (key === BACKSPACE_KEY) {
      let isLastCol = this.currentCol <= this.word.length - 1;

      // Move back a space before editing if it's not the last col
      if (this.currentCol > 0 && !isLastCol) { this.currentCol -= 1; }

      target = document.querySelector(`.row-${this.currentAttempt} .column-${this.currentCol}`)
      target.innerHTML = "";

      // Move back a space after editing if it's the last col.
      if (this.currentCol > 0 && isLastCol) { this.currentCol -= 1; }
    } else if (key === ENTER_KEY) {
      const row = document.querySelector(`.row-${this.currentAttempt}`).children;
      const answer = [];
      const cols = [];

      for (let i = 0; i < row.length; i++) {
        const col = row.item(i);
        answer.push(col.innerHTML);
        cols.push(col)
      }

      this.compareAnswer(answer, cols)
    } else if (this.isLetter(key)) {
      target.innerHTML = key;
      if (this.currentCol < this.word.length - 1) this.currentCol += 1;
    } else null;

    target = document.querySelector(`.row-${this.currentAttempt} .column-${this.currentCol}`);
    target.classList.add("target")
  }

  // Events / Setup
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
      this.handleInput(e.key.toLowerCase())
    })
  }
}