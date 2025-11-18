export class BaseElement {
    anchor: HTMLElement;

    constructor(anchor: HTMLElement) {
        this.anchor = anchor;
    }

    hide() {
        this.anchor.classList.add("gone");
    }

    show() {
        this.anchor.classList.remove("gone");
    }
}