import { AkronymSplash } from '../akronym/scripts/AkronymSplash.js';
import { AkronymButton } from '../akronym/scripts/AkronymButton.js';
import { AkronymEventRouter } from '../akronym/scripts/AkronymEventRouter.js';
import { AkronymAnimator } from '../akronym/scripts/AkronymAnimator.js';
class App {
    constructor() {
        this.root = document.documentElement;
        this.body = document.body;
        this.splash = document.querySelector('[is="ak-splash"]');
        this.startButton = document.querySelector('button#start');
        AkronymEventRouter.add(this.startButton, "startIntro", this.startIntro.bind(this), true);
        AkronymEventRouter.add(this.splash, "introEnd", this.endIntro.bind(this), true);
        this.init();
    }
    init() {
        // Fetch data from cookies and obtain user's avatar from server
    }
    startIntro() {
        AkronymAnimator.changeVisibility(this.splash, "visible", 3000);
        this.splash.startAudio();
        AkronymEventRouter.add(this.splash, "animationendvisible", () => {
            AkronymAnimator.changeVisibility(this.startButton, "hidden", 0);
            this.splash.startVideo();
        }, true);
    }
    endIntro() {
        AkronymAnimator.changeVisibility(this.splash, "hidden", 3000);
    }
}
customElements.define('ak-button', AkronymButton, { extends: 'button' });
customElements.define('ak-splash', AkronymSplash, { extends: 'div' });
window.app = new App();
