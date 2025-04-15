import { CASCADE_ANIMATION_DELAY, AkronymState, AkronymAnimation, AkronymVisibility, AkronymElement } from './AkronymGlobal.js';
export class AkronymButton extends HTMLButtonElement {

    private clickEvent: CustomEvent;
    public animations: Partial<Record<AkronymState | AkronymVisibility, AkronymAnimation>> =
    {
        visible: 'fade-in',
        hidden: 'fade-out',
        deleted: 'fade-out'
    };

    constructor(){
        super();
        this.clickEvent = new CustomEvent(this.dataset.clickEvent ?? 'none', { bubbles: true });
        this.addEventListener('click', this.click.bind(this));
    };

    public click(){
        this.dispatchEvent(this.clickEvent);
    }
}