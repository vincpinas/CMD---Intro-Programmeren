import Footer from "./footer.js";
import Wordle from "./wordle.js";

export const StorageGet = (key) => {
    return JSON.parse(localStorage.getItem(key))
}

export const StorageSet = (key, json) => {
    return localStorage.setItem(key, JSON.stringify(json));
}

new Wordle({ container: document.querySelector("main") });
new Footer();