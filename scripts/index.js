import Footer from "./footer.js";
import Wordle from "./wordle.js";

Storage.get = (key) => {
    return JSON.parse(localStorage.getItem(key))
}

Storage.set = (key, json) => {
    return localStorage.setItem(key, JSON.stringify(json));
}

new Wordle({ container: document.querySelector("main") });
new Footer();