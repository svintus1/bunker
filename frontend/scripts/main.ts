import { AkronymEventRouter } from '../akronym/scripts/AkronymEventRouter.js';
import { AkronymAnimator } from '../akronym/scripts/AkronymAnimator.js';
export function init(): void {
    (window as any).MainMenu = new MainMenu();
}
class MainMenu {
    public root: HTMLDivElement;
    public body: HTMLBodyElement;
    public splashscreen: HTMLDivElement;
    public playButton: HTMLButtonElement;
    public cover: HTMLDivElement;
    public introAudio: HTMLAudioElement | null = null;
    public introVideo: HTMLVideoElement | null = null;
    constructor() {
        this.root = document.getElementById('root') as HTMLDivElement;
        this.body = document.body as HTMLBodyElement;
        this.splashscreen = document.getElementById('splashscreen') as HTMLDivElement;
        this.playButton = document.getElementById('play-button') as HTMLButtonElement;
        this.cover = document.getElementById('cover') as HTMLDivElement;

        const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;

        if (navEntry.type === "reload"){
          this.skipIntro();
        }
        else{
            this.initIntro();
        }
    }
    skipIntro(){
        console.log("Skip intro");
        AkronymAnimator.changeState(this.cover, "closed", 'fade-out', 0);
        AkronymAnimator.changeVisibility(this.cover, "hidden", 'fade-out', 0);
        AkronymAnimator.changeVisibility(this.playButton, "deleted", 'fade-out', 0);
        AkronymAnimator.changeVisibility(this.splashscreen, "deleted", 'fade-out', 0);
    }

    initIntro(){
        console.log("Intro initialized");
        AkronymAnimator.changeState(this.cover, "opened", 'fade-in', 0);
        AkronymAnimator.changeVisibility(this.cover, "visible", 'fade-in', 0);
        AkronymAnimator.changeVisibility(this.playButton, "visible", 'fade-in', 0);

        this.introAudio = document.getElementById("intro-audio") as HTMLAudioElement;
        this.introVideo = document.getElementById("intro-video") as HTMLVideoElement;

        AkronymEventRouter.add(this.playButton, "click", this.startIntro.bind(this), true);
        AkronymEventRouter.add(this.introAudio, "ended", this.endIntro.bind(this), true);
    }

    startIntro(): void {
        AkronymAnimator.changeVisibility(this.splashscreen, "visible", 'fade-in', 3000);
        this.introAudio?.play();
        AkronymEventRouter.add(this.splashscreen, "animationendvisible", () => this.introVideo?.play(), true)
    }

    endIntro(): void {
        AkronymAnimator.changeVisibility(this.cover, "hidden", 'fade-out', 0);
        AkronymAnimator.changeVisibility(this.playButton, "deleted", 'fade-out', 0);
        AkronymAnimator.changeVisibility(this.splashscreen, "deleted", 'fade-out', 3000);
    }
}