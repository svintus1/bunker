import { AkronymEventRouter } from '../akronym/scripts/AkronymEventRouter.js';
import { AkronymAnimator } from '../akronym/scripts/AkronymAnimator.js';
export function init(): MainMenu {
    return new MainMenu();
}
class MainMenu {
    private cover: HTMLDivElement;
    private ambientMusic: HTMLAudioElement;
    private musicStatus: HTMLButtonElement;

    private intro: HTMLDivElement;
    private splashscreen: HTMLDivElement;
    private playButton: HTMLButtonElement;
    private introAudio: HTMLAudioElement | null = null;
    private introVideo: HTMLVideoElement | null = null;

    private menu: HTMLDivElement;
    private buttons: HTMLButtonElement[];
    private createLobbyButton: HTMLButtonElement;
    private joinLobbyButton: HTMLButtonElement;

    private modalWindowBackdrop: HTMLDivElement;
    private modalWindow: HTMLDivElement;
    private modalWindowCloseButton: HTMLButtonElement;
    private enterLobbyButton: HTMLButtonElement;
    private lobbyIDInput: HTMLInputElement;
    
    constructor() {
        this.menu = document.getElementById('main-menu') as HTMLDivElement;
        this.buttons = Array.from(document.querySelectorAll('button')) as HTMLButtonElement[];
        this.buttons.forEach((button) => {
            AkronymEventRouter.add(button, "click", () => {
                button.blur();
            });
        });

        this.modalWindowBackdrop = document.querySelector('.modal-window-backdrop') as HTMLDivElement;
        this.modalWindow = document.querySelector('.modal-window') as HTMLDivElement;
        this.modalWindowCloseButton = document.querySelector('.modal-window button#close') as HTMLButtonElement;
        this.enterLobbyButton = document.querySelector('.modal-window #enter-lobby') as HTMLButtonElement;
        this.lobbyIDInput = document.querySelector('.modal-window input') as HTMLInputElement;

        this.createLobbyButton = document.getElementById('create-lobby') as HTMLButtonElement;
        this.joinLobbyButton = document.getElementById('join-lobby') as HTMLButtonElement;

        AkronymEventRouter.add(this.joinLobbyButton, "click", () => {
            AkronymAnimator.changeVisibility(this.modalWindowBackdrop, "visible", 'fade-in', 750);
            AkronymAnimator.changeVisibility(this.modalWindow, "visible", 'modal-window-slide-in', 750);
        });
        AkronymEventRouter.add(document, "keydown", (event: Event) => {
            const keyboardEvent = event as KeyboardEvent;
            if (keyboardEvent.key === "Escape") {
                if (this.modalWindow.dataset.visibility === "visible" && this.modalWindow.dataset.animation === "none") {
                    AkronymAnimator.changeVisibility(this.modalWindowBackdrop, "hidden", 'fade-out', 750);
                    AkronymAnimator.changeVisibility(this.modalWindow, "hidden", 'modal-window-slide-out', 750);
                }
            }
        });
        AkronymEventRouter.add(this.modalWindow, "animationendvisible", () => {
            this.lobbyIDInput.focus();
        });

        AkronymEventRouter.add(this.modalWindowCloseButton, "click", () => {
            AkronymAnimator.changeVisibility(this.modalWindowBackdrop, "hidden", 'fade-out', 750);
            AkronymAnimator.changeVisibility(this.modalWindow, "hidden", 'modal-window-slide-out', 750);
            this.lobbyIDInput.blur();
        })

        this.cover = document.getElementById('cover') as HTMLDivElement;
        this.ambientMusic = document.getElementById('ambient-music') as HTMLAudioElement;
        this.ambientMusic.src = './static/End of the World Echoes.mp3';
        this.musicStatus = document.getElementById('music-status') as HTMLButtonElement;

        this.intro = document.getElementById('intro') as HTMLDivElement;
        this.splashscreen = document.getElementById('splashscreen') as HTMLDivElement;
        this.playButton = document.getElementById('play-button') as HTMLButtonElement;
        
        AkronymEventRouter.add(this.musicStatus, "click", () => {
            if (this.ambientMusic.paused)
            {
                this.ambientMusic.play()
                this.musicStatus.setAttribute('data-mute', "false");
            }
            else
            {
                this.ambientMusic.pause()
                this.musicStatus.setAttribute('data-mute', "true");
            }
        });

        const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;

        if (navEntry.type === "reload"){
            this.skipIntro();
        }
        else{
            this.initIntro();
        }
    }

    private skipIntro(){
        AkronymAnimator.changeVisibility(this.cover, "hidden", 'fade-out', 0);
        AkronymAnimator.changeVisibility(this.intro, "deleted", 'fade-out', 0);
        this.musicStatus.setAttribute('data-mute', "true");
        this.showMenu();
    }

    private initIntro(){
        AkronymAnimator.changeVisibility(this.cover, "visible", 'fade-in', 0);
        AkronymAnimator.changeVisibility(this.intro, "visible", 'fade-in', 0);

        this.introAudio = document.getElementById("intro-audio") as HTMLAudioElement;
        this.introVideo = document.getElementById("intro-video") as HTMLVideoElement;

        AkronymEventRouter.add(this.playButton, "click", this.startIntro.bind(this), true);
        AkronymEventRouter.add(this.introAudio, "ended", this.endIntro.bind(this), true);

        this.musicStatus.setAttribute('data-mute', "false");
    }

    private startIntro(): void {
        this.introAudio?.play();
        AkronymAnimator.changeVisibility(this.splashscreen, "visible", 'fade-in', 3000);
        AkronymEventRouter.add(this.splashscreen, "animationendvisible", () => this.introVideo?.play(), true)
    }

    private endIntro(): void {
        this.ambientMusic.play()
        AkronymAnimator.changeVisibility(this.cover, "hidden", 'fade-out', 0);
        AkronymAnimator.changeVisibility(this.intro, "deleted", 'fade-out', 2000);
        AkronymEventRouter.add(this.intro, "animationenddeleted", this.showMenu.bind(this), true);
    }

    private showMenu(): void {
        AkronymAnimator.changeVisibility(this.menu, "visible", 'fade-in', 2000, 0, true, 'slide-up', 1000);
        AkronymAnimator.changeVisibility(this.musicStatus, "visible", 'fade-in', 2000, 800);
    }
}