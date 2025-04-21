import { CASCADE_ANIMATION_DELAY, AkronymState, AkronymAnimation, AkronymVisibility } from './AkronymGlobal.js';

export class AkronymAnimator {
  static changeVisibility(
    element: any,
    visibility: AkronymVisibility,
    animation: AkronymAnimation,
    duration: number = 0,
    delay: number = 0,
    isCascade: boolean = false,
    cascadeAnimation: AkronymAnimation = 'none',
    cascadeAnimationDuration: number = 0
  ): void {
    const current = element.dataset.visibility ?? 'visible';
    if (current === visibility){
      return
    };
  
    element.dataset.visibility = visibility;
  
    AkronymAnimator.runAnimation(element, animation, duration, delay, visibility);
  
    if (isCascade) {
      const children = Array.from(element.children);
  
      children.forEach((child: any, index: number) => {
        setTimeout(() => {
          AkronymAnimator.changeVisibility(
            child,
            visibility,
            cascadeAnimation,
            cascadeAnimationDuration,
            delay,
            false
          );
        }, index * CASCADE_ANIMATION_DELAY);
      });
    }
  }

  static changeState(element: any, state: AkronymState, animation: AkronymAnimation, duration: number, delay: number): void {
    const current = element.dataset.state ?? 'idle';
    if (current === state) return;

    element.dataset.state = state;

    AkronymAnimator.runAnimation(element, animation, duration, delay, state);
  }

  static runAnimation(element: any, animation: AkronymAnimation, duration: number, delay: number, target: AkronymState | AkronymVisibility): void {
    element.dataset.animation = animation;
    element.style.animationDuration = duration + 'ms';
    setTimeout(() => {
      if (element.dataset.visibility == 'visible'){
        element.style.animationPlayState = 'running';
        element.removeAttribute('data-hidden');
      }
    }, delay);

    setTimeout(() => {
      element.dataset.animation = 'none';
      if (element.dataset.visibility == 'hidden'){
        element.dataset.hidden = 'true';
      }
      element.dispatchEvent(new CustomEvent("animationend" + target.toString()))
      if (element.dataset.visibility == 'deleted') element.remove();
    }, duration + delay);
  }
}
