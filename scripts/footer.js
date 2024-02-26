export default class Footer {
    constructor() {
        this.footer = document.querySelector(".footer__wrapper");
        this.button = document.querySelector(".footer__wrapper > button")
        this.hidden = localStorage.getItem("footer__hidden") || false;

        if(this.hidden) {
            this.footer.classList.add("-hidden")
            this.button.innerHTML = "Open";
        }

        this.button.addEventListener("focus", (e) => e.target.blur());
        this.button.addEventListener("click", () => this.toggle())
    }

    toggle() {
        if(this.hidden) {
            this.footer.classList.remove("-hidden");
            this.button.innerHTML = "Close";
            this.hidden = false;
        } else {
            this.footer.classList.add("-hidden");
            this.button.innerHTML = "Open";
            this.hidden = true;
        }

        localStorage.setItem("footer__hidden", JSON.stringify(this.hidden));
    }
}