import { CASCADE_ANIMATION_DELAY } from './AkronymGlobal.js';
export class AkronymAnimator {
    static changeVisibility(akronymElement, visibility, duration) {
        var _a, _b, _c, _d;
        const current = (_a = akronymElement.dataset.visibility) !== null && _a !== void 0 ? _a : 'visible';
        if (current === visibility)
            return;
        akronymElement.dataset.visibility = visibility;
        const cascadeIndex = parseInt(visibility === 'visible'
            ? (_b = akronymElement.dataset.cascadeShow) !== null && _b !== void 0 ? _b : '0'
            : (_c = akronymElement.dataset.cascadeHide) !== null && _c !== void 0 ? _c : '0');
        const animation = (_d = akronymElement.animations[visibility]) !== null && _d !== void 0 ? _d : 'none';
        setTimeout(() => {
            AkronymAnimator.runAnimation(akronymElement, animation, duration, visibility);
        }, cascadeIndex * CASCADE_ANIMATION_DELAY);
    }
    static changeState(akronymElement, state, duration) {
        var _a, _b;
        const current = (_a = akronymElement.dataset.state) !== null && _a !== void 0 ? _a : 'idle';
        if (current === state)
            return;
        akronymElement.dataset.state = state;
        const animation = (_b = akronymElement.animations[state]) !== null && _b !== void 0 ? _b : 'none';
        AkronymAnimator.runAnimation(akronymElement, animation, duration, state);
    }
    static runAnimation(akronymElement, animation, duration, target) {
        akronymElement.dataset.animation = animation;
        if (akronymElement.dataset.visibility == 'visible') {
            akronymElement.removeAttribute('data-hidden');
        }
        setTimeout(() => {
            akronymElement.dataset.animation = 'none';
            if (akronymElement.dataset.visibility == 'hidden') {
                akronymElement.dataset.hidden = 'true';
            }
            akronymElement.dispatchEvent(new CustomEvent("animationend" + target.toString()));
        }, duration);
    }
}
