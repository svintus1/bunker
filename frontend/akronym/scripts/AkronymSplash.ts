import { CASCADE_ANIMATION_DELAY, AkronymState, AkronymAnimation, AkronymVisibility, AkronymElement } from './AkronymGlobal.js';
export class AkronymSplash extends HTMLDivElement {
    private intro: HTMLVideoElement;
    private introSound: HTMLAudioElement;

    public animations: Partial<Record<AkronymState | AkronymVisibility, AkronymAnimation>> =
    {
        visible: 'fade-in',
        hidden: 'fade-out',
    };

    constructor() {
        super();
        this.intro = document.querySelector('video#intro') as HTMLVideoElement;
        this.introSound = document.querySelector('audio#intro-sound') as HTMLAudioElement;
    }

    public async startVideo() {
        await this.waitForMediaLoaded(this.intro);

        this.intro.play();
    }

    public async startAudio() {
        await this.waitForMediaLoaded(this.introSound);

        this.introSound.play();

        await this.waitForAudioEnd(this.introSound);
        this.dispatchEvent(new CustomEvent('introEnd', { bubbles: true }));
    }

    private waitForMediaLoaded(mediaElement: HTMLMediaElement): Promise<void> {
        return new Promise((resolve, reject) => {
            if (mediaElement.readyState >= 3) {
                resolve();
            } else {
                mediaElement.addEventListener('canplaythrough', () => resolve(), { once: true });
                mediaElement.addEventListener('error', () => reject(new Error('Media failed to load')), { once: true });
            }
        });
    }

    private waitForAudioEnd(audioElement: HTMLAudioElement): Promise<void> {
        return new Promise((resolve) => {
            audioElement.addEventListener('ended', () => resolve(), { once: true });
        });
    }
}
