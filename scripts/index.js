import Wordle from "./wordle.js";
import { words } from "./wordlist.js"

const randomWord = () => {
  return words[Math.floor(Math.random() * words.length)]
}

new Wordle(randomWord());