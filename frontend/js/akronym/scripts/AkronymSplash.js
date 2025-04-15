var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class AkronymSplash extends HTMLDivElement {
    constructor() {
        super();
        this.animations = {
            visible: 'fade-in',
            hidden: 'fade-out',
        };
        this.intro = document.querySelector('video#intro');
        this.introSound = document.querySelector('audio#intro-sound');
    }
    startVideo() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.waitForMediaLoaded(this.intro);
            this.intro.play();
        });
    }
    startAudio() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.waitForMediaLoaded(this.introSound);
            this.introSound.play();
            yield this.waitForAudioEnd(this.introSound);
            this.dispatchEvent(new CustomEvent('introEnd', { bubbles: true }));
        });
    }
    waitForMediaLoaded(mediaElement) {
        return new Promise((resolve, reject) => {
            if (mediaElement.readyState >= 3) {
                resolve();
            }
            else {
                mediaElement.addEventListener('canplaythrough', () => resolve(), { once: true });
                mediaElement.addEventListener('error', () => reject(new Error('Media failed to load')), { once: true });
            }
        });
    }
    waitForAudioEnd(audioElement) {
        return new Promise((resolve) => {
            audioElement.addEventListener('ended', () => resolve(), { once: true });
        });
    }
}
