import { CASCADE_ANIMATION_DELAY, AkronymState, AkronymAnimation, AkronymVisibility, AkronymElement } from './AkronymGlobal.js';

export class AkronymAnimator {
  static changeVisibility(akronymElement: any, visibility: AkronymVisibility, duration: number): void {
    const current = akronymElement.dataset.visibility ?? 'visible';
    if (current === visibility) return;

    akronymElement.dataset.visibility = visibility;

    const cascadeIndex = parseInt(
      visibility === 'visible'
        ? akronymElement.dataset.cascadeShow ?? '0'
        : akronymElement.dataset.cascadeHide ?? '0'
    );

    const animation = akronymElement.animations[visibility] ?? 'none';

    setTimeout(() => {
        AkronymAnimator.runAnimation(akronymElement, animation, duration, visibility);
    }, cascadeIndex * CASCADE_ANIMATION_DELAY);
  }

  static changeState(akronymElement: AkronymElement, state: AkronymState, duration: number): void {
    const current = akronymElement.dataset.state ?? 'idle';
    if (current === state) return;

    akronymElement.dataset.state = state;

    const animation = akronymElement.animations[state] ?? 'none';
    AkronymAnimator.runAnimation(akronymElement, animation, duration, state);
  }

  static runAnimation(akronymElement: AkronymElement, animation: AkronymAnimation, duration: number, target: AkronymState | AkronymVisibility): void {
    akronymElement.dataset.animation = animation;
    if (akronymElement.dataset.visibility == 'visible'){
        akronymElement.removeAttribute('data-hidden');
    }

    setTimeout(() => {
      akronymElement.dataset.animation = 'none';
      if (akronymElement.dataset.visibility == 'hidden'){
        akronymElement.dataset.hidden = 'true';
      }
      akronymElement.dispatchEvent(new CustomEvent("animationend" + target.toString()))
      if (akronymElement.dataset.visibility == 'deleted') akronymElement.remove();
    }, duration);
  }
}
