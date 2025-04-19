import { CASCADE_ANIMATION_DELAY, AkronymState, AkronymAnimation, AkronymVisibility } from './AkronymGlobal.js';

export class AkronymAnimator {
  static changeVisibility(element: any, visibility: AkronymVisibility, animation: AkronymAnimation, duration: number, isCascade: boolean = false): void {
    const current = element.dataset.visibility ?? 'visible';
    if (current === visibility) return;

    element.dataset.visibility = visibility;

    const cascadeIndex = parseInt(
      visibility === 'visible'
        ? element.dataset.cascadeShow ?? '0'
        : element.dataset.cascadeHide ?? '0'
    );

    // Запуск анимации для текущего элемента
    setTimeout(() => {
        AkronymAnimator.runAnimation(element, animation, duration, visibility);
    }, cascadeIndex * CASCADE_ANIMATION_DELAY);

    // Если isCascade включен, рекурсивно вызываем функцию для дочерних элементов
    if (isCascade) {
        const children = element.querySelectorAll('[data-cascade-show], [data-cascade-hide]');
        
        children.forEach((child: any) => {
            // Получаем каскадный индекс для каждого дочернего элемента
            const childCascadeIndex = parseInt(
                visibility === 'visible'
                    ? child.dataset.cascadeShow ?? '0'
                    : child.dataset.cascadeHide ?? '0'
            );

            // Устанавливаем задержку с учётом индивидуального индекса дочернего элемента
            setTimeout(() => {
                AkronymAnimator.changeVisibility(child, visibility, animation, duration, false);
            }, (cascadeIndex + childCascadeIndex) * CASCADE_ANIMATION_DELAY); // Увеличиваем задержку с учётом индекса дочернего элемента
        });
    }
}


  static changeState(element: any, state: AkronymState, animation: AkronymAnimation, duration: number): void {
    const current = element.dataset.state ?? 'idle';
    if (current === state) return;

    element.dataset.state = state;

    AkronymAnimator.runAnimation(element, animation, duration, state);
  }

  static runAnimation(element: any, animation: AkronymAnimation, duration: number, target: AkronymState | AkronymVisibility): void {
    element.dataset.animation = animation;
    if (element.dataset.visibility == 'visible'){
        element.removeAttribute('data-hidden');
    }

    setTimeout(() => {
      element.dataset.animation = 'none';
      if (element.dataset.visibility == 'hidden'){
        element.dataset.hidden = 'true';
      }
      element.dispatchEvent(new CustomEvent("animationend" + target.toString()))
      if (element.dataset.visibility == 'deleted') element.remove();
    }, duration);
  }
}
