import { AkronymSplash } from '../akronym/scripts/AkronymSplash.js';
import { AkronymButton } from '../akronym/scripts/AkronymButton.js';
import { AkronymEventRouter } from '../akronym/scripts/AkronymEventRouter.js';
import { AkronymAnimator } from '../akronym/scripts/AkronymAnimator.js';
class App {
    public root: HTMLElement;
    public body: HTMLBodyElement;
    public splash: AkronymSplash;
    public startButton: AkronymButton;

    constructor() {
        this.root = document.documentElement;
        this.body = document.body as HTMLBodyElement;
        this.splash = document.querySelector('[is="ak-splash"]') as AkronymSplash;
        this.startButton = document.querySelector('button#start') as AkronymButton;

        AkronymEventRouter.add(this.startButton, "startIntro", this.startIntro.bind(this), true);
        AkronymEventRouter.add(this.splash, "introEnd", this.endIntro.bind(this), true);

        this.init();
    }

    init(): void {
        // Fetch data from cookies and obtain user's avatar from server
    }

    startIntro(): void {
        AkronymAnimator.changeVisibility(this.splash, "visible", 3000);
        this.splash.startAudio();
        AkronymEventRouter.add(this.splash, "animationendvisible", () => {
            AkronymAnimator.changeVisibility(this.startButton, "hidden", 0)
            this.splash.startVideo();
        }, true)
    }

    endIntro(): void {
        AkronymAnimator.changeVisibility(this.splash, "hidden", 3000);
    }
}

customElements.define('ak-button', AkronymButton, { extends: 'button' });
customElements.define('ak-splash', AkronymSplash, { extends: 'div'})

window.app = new App();