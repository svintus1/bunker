import { CASCADE_ANIMATION_DELAY, AkronymState, AkronymAnimation, AkronymVisibility } from './AkronymGlobal.js';

export class AkronymAnimator {
  static async changeVisibility(
    element: any,
    visibility: AkronymVisibility,
    animation: AkronymAnimation,
    duration: number = 0,
    delay: number = 0,
    isCascade: boolean = false,
    cascadeAnimation: AkronymAnimation = 'none',
    cascadeAnimationDuration: number = 0
  ): Promise<void> {
    const current = element.dataset.visibility ?? 'visible';
    if (current === visibility) return;

    const currentAnimation = element.dataset.animation ?? 'none';
    if (currentAnimation !== 'none') {
      console.log('Animation is already running. Please wait for it to finish before changing visibility.');
      return;
    }

    element.dataset.visibility = visibility;

    // Start parent animation without awaiting it
    const parentAnimation = AkronymAnimator.runAnimation(element, animation, duration, delay, visibility);

    if (isCascade) {
      const children = Array.from(element.children);

      // Run all child animations concurrently with appropriate delays
      const childAnimations = children.map((child, index) =>
        new Promise((resolve) =>
          setTimeout(async () => {
            await AkronymAnimator.changeVisibility(
              child,
              visibility,
              cascadeAnimation,
              cascadeAnimationDuration,
              delay,
              false
            );
            resolve(null);
          }, (index + 1) * CASCADE_ANIMATION_DELAY)
        )
      );

      // Wait for all child animations to complete
      await Promise.all(childAnimations);
    }

    // Wait for the parent animation to complete
    await parentAnimation;
  }

  static async changeState(
    element: any,
    state: AkronymState,
    animation: AkronymAnimation,
    duration: number = 0,
    delay: number = 0
  ): Promise<void> {
    const current = element.dataset.state ?? 'idle';
    if (current === state) return;

    const currentAnimation = element.dataset.animation ?? 'none';
    if (currentAnimation !== 'none') {
      console.log('Animation is already running. Please wait for it to finish before changing state.');
      return;
    }

    element.dataset.state = state;

    await AkronymAnimator.runAnimation(element, animation, duration, delay, state);
  }

  static async runAnimation(
    element: any,
    animation: AkronymAnimation,
    duration: number,
    delay: number,
    target: AkronymState | AkronymVisibility
  ): Promise<void> {
    return new Promise((resolve) => {
      element.dataset.animation = animation;
      element.style.animationDuration = duration + 'ms';

      setTimeout(() => {
        element.style.animationPlayState = 'running';
        if (element.dataset.visibility == 'visible') {
          element.removeAttribute('data-hidden');
        }
      }, delay);

      setTimeout(() => {
        element.dataset.animation = 'none';
        if (element.dataset.visibility == 'hidden') {
          element.dataset.hidden = 'true';
        }
        if (element.dataset.state == 'error' || element.dataset.state == 'success') {
          element.dataset.state = 'idle';
        }
        element.dispatchEvent(new CustomEvent('animationend' + target.toString()));
        if (element.dataset.visibility == 'deleted') element.remove();
        resolve();
      }, duration + delay);
    });
  }
}