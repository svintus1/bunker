import { AkronymEventRouter } from '../akronym/scripts/AkronymEventRouter.js';
import { AkronymAnimator } from '../akronym/scripts/AkronymAnimator.js';
import { APIMain } from '../scripts/api-main.js';
export function init({ navigateTo }: { navigateTo: (path: string) => void }): MainMenu {
    return new MainMenu(navigateTo);
}

const lobbyIDRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const usernameRegex = /^[A-Za-zА-Яа-я0-9]{3,20}$/;

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
    private usernameInput: HTMLInputElement;
    private createLobbyButton: HTMLButtonElement;
    private joinLobbyButton: HTMLButtonElement;

    private modalWindowBackdrop: HTMLDivElement;
    private modalWindow: HTMLDivElement;
    private modalWindowCloseButton: HTMLButtonElement;
    private enterLobbyButton: HTMLButtonElement;
    private lobbyIDInput: HTMLInputElement;

    private navigateTo: (path: string) => void;
    private errorWindow: HTMLDivElement;
    
    constructor(navigateTo: (path: string) => void) {
        this.navigateTo = navigateTo;
        this.errorWindow = document.getElementById('error-window') as HTMLDivElement;
        this.menu = document.getElementById('main-menu') as HTMLDivElement;
        this.buttons = Array.from(document.querySelectorAll('button')) as HTMLButtonElement[];

        this.modalWindowBackdrop = document.querySelector('.modal-window-backdrop') as HTMLDivElement;
        this.modalWindow = document.querySelector('.modal-window') as HTMLDivElement;
        this.modalWindowCloseButton = document.querySelector('.modal-window button.close') as HTMLButtonElement;
        this.enterLobbyButton = document.querySelector('.modal-window #enter-lobby') as HTMLButtonElement;
        this.lobbyIDInput = document.querySelector('.modal-window input') as HTMLInputElement;

        this.usernameInput = document.querySelector('input#username') as HTMLInputElement;
        this.createLobbyButton = document.getElementById('create-lobby') as HTMLButtonElement;
        this.joinLobbyButton = document.getElementById('join-lobby') as HTMLButtonElement;

        this.cover = document.getElementById('cover') as HTMLDivElement;
        this.ambientMusic = document.getElementById('ambient-music') as HTMLAudioElement;
        this.ambientMusic.src = './static/End of the World Echoes.mp3';
        this.musicStatus = document.getElementById('music-status') as HTMLButtonElement;

        this.intro = document.getElementById('intro') as HTMLDivElement;
        this.splashscreen = document.getElementById('splashscreen') as HTMLDivElement;
        this.playButton = document.getElementById('play-button') as HTMLButtonElement;

        const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;

        if (navEntry.type === "reload"){
            this.skipIntro();
        }
        else{
            this.initIntro();
        }
    }

    private showErrorWindow(message: string, initiator: HTMLButtonElement): void {
        if (this.errorWindow.dataset.visibility === "visible") {
            AkronymAnimator.changeState(initiator, "error", "error", 1500);
            this.errorWindow.innerHTML = message;
            return;
        }
        AkronymAnimator.changeState(initiator, "error", "error", 1500);
        this.errorWindow.innerHTML = message;
        AkronymAnimator.changeVisibility(this.errorWindow, "visible", 'error-window-slide-in', 500);
        setTimeout(() => {
            if (this.errorWindow.dataset.visibility === "visible") {
                AkronymAnimator.changeVisibility(this.errorWindow, "hidden", 'error-window-slide-out', 500);
            }
        }, 5000);
    }

    private initMenuListeners(){
        AkronymEventRouter.add(this.errorWindow, "dblclick", () => {
            AkronymAnimator.changeVisibility(this.errorWindow, "hidden", 'error-window-slide-out', 500);
        });
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

        this.buttons.forEach((button) => {
            AkronymEventRouter.add(button, "click", () => {
                button.blur();
            });
        });

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

        AkronymEventRouter.add(this.createLobbyButton, "click", this.createLobby.bind(this));
        AkronymEventRouter.add(this.enterLobbyButton, "click", this.joinLobby.bind(this));
    }

    private createLobby(): void {
        const username = this.usernameInput.value;
        const testUsername = usernameRegex.test(username);
    
        if (!testUsername) {
            const errorMsg = "Invalid username format. Must be alphanumeric and between 3 and 20 characters.";
            this.showErrorWindow(errorMsg, this.createLobbyButton);
            AkronymAnimator.changeState(this.usernameInput, "error", "error", 1500);
            return;
        }
    
        console.log('Creating lobby...');
        this.navigateTo(`lobby`);
        // APIMain.createUser(username).then((user) => {
        //     return APIMain.createLobby(username, user.id);
        // }).then((lobby) => {
        //     console.log('Lobby created:', lobby);
        //     this.navigateTo(`lobby`);
        //     AkronymAnimator.changeState(this.createLobbyButton, "success", "success", 1500);
        // }).catch((err) => {
        //     const message = err?.message || "Unknown error occurred during lobby creation.";
        //     console.error(message);
        //     this.showErrorWindow(message, this.createLobbyButton);
        //     AkronymAnimator.changeState(this.createLobbyButton, "error", "error", 1500);
        // });
    }
    

    private joinLobby(): void {
        const lobbyID = this.lobbyIDInput.value;
        const username = this.usernameInput.value;
    
        const testLobbyID = lobbyIDRegex.test(lobbyID);
        const testUsername = usernameRegex.test(username);
    
        if (!testLobbyID) {
            const errorMsg = "Invalid lobby ID format. Must be a valid UUID.";
            this.showErrorWindow(errorMsg, this.enterLobbyButton);
            AkronymAnimator.changeState(this.lobbyIDInput, "error", "error", 1500);
        }
    
        if (!testUsername) {
            const errorMsg = "Invalid username format. Must be alphanumeric and between 3 and 20 characters.";
            this.showErrorWindow(errorMsg, this.enterLobbyButton);
            AkronymAnimator.changeState(this.usernameInput, "error", "error", 1500);
        }
    
        if (!testLobbyID || !testUsername) {
            return;
        }
    
        console.log('Joining lobby...');
        this.navigateTo(`lobby`);
        // APIMain.createUser(username).then((user) => {
        //     return APIMain.joinLobby(lobbyID);
        // }).then((lobby) => {
        //     AkronymAnimator.changeState(this.enterLobbyButton, "success", "success", 1500);
        //     this.navigateTo(`lobby`);
        // }).catch((err) => {
        //     const message = err?.message || "Unknown error occurred while joining the lobby.";
        //     console.error(message);
        //     this.showErrorWindow(message, this.enterLobbyButton);
        //     AkronymAnimator.changeState(this.enterLobbyButton, "error", "error", 1500);
        // });
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
        AkronymEventRouter.add(this.menu, "animationendvisible", this.initMenuListeners.bind(this), true);
    }
}