import { AkronymSplash } from '../akronym/scripts/AkronymSplash.js';
import { AkronymButton } from '../akronym/scripts/AkronymButton.js';
import { AkronymEventRouter } from '../akronym/scripts/AkronymEventRouter.js';
import { AkronymAnimator } from '../akronym/scripts/AkronymAnimator.js';
import { AkronymDiv } from '../akronym/scripts/AkronymDiv.js';
class App {
    public root: HTMLElement;
    public body: HTMLBodyElement;
    public splash: AkronymSplash;
    public startButton: AkronymButton;
    public cover: AkronymDiv;

    constructor() {
        this.root = document.documentElement;
        this.body = document.body as HTMLBodyElement;
        this.splash = document.querySelector('[is="ak-splash"]') as AkronymSplash;
        this.startButton = document.querySelector('button#start') as AkronymButton;
        this.cover = document.querySelector('div#cover') as AkronymDiv;

        const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;

        if (navEntry.type === "reload") {
          this.skipIntro();
        }
        else{
            this.initIntro();
        }

        this.init();
    }

    deleteElement() : void 
    {

    }

    init(): void {
        // Fetch data from cookies and obtain user's avatar from server
    }

    skipIntro(){
        console.log("Skip intro");
        AkronymAnimator.changeState(this.cover, "closed", 0);
        AkronymAnimator.changeVisibility(this.cover, "deleted", 0);
        AkronymAnimator.changeVisibility(this.splash, "deleted", 0);
    }

    initIntro(){
        console.log("Intro initialized");
        AkronymAnimator.changeState(this.cover, "opened", 0);
        AkronymAnimator.changeVisibility(this.cover, "visible", 0);
        AkronymEventRouter.add(this.startButton, "startIntro", this.startIntro.bind(this), true);
        AkronymEventRouter.add(this.splash, "introEnd", this.endIntro.bind(this), true);
    }

    startIntro(): void {
        AkronymAnimator.changeVisibility(this.splash, "visible", 3000);
        this.splash.startAudio();
        AkronymEventRouter.add(this.splash, "animationendvisible", () => {
            AkronymAnimator.changeVisibility(this.cover, "deleted", 0)
            this.splash.startVideo();
        }, true)
    }

    endIntro(): void {
        AkronymAnimator.changeVisibility(this.splash, "deleted", 3000);
    }
}

customElements.define('ak-button', AkronymButton, { extends: 'button' });
customElements.define('ak-splash', AkronymSplash, { extends: 'div'})
customElements.define('ak-div', AkronymDiv, { extends: 'div'})

window.app = new App();