export class AkronymButton extends HTMLButtonElement {
    constructor() {
        var _a;
        super();
        this.animations = {
            visible: 'fade-in',
            hidden: 'fade-out',
        };
        this.clickEvent = new CustomEvent((_a = this.dataset.clickEvent) !== null && _a !== void 0 ? _a : 'none', { bubbles: true });
        this.addEventListener('click', this.click.bind(this));
    }
    ;
    click() {
        this.dispatchEvent(this.clickEvent);
    }
}
