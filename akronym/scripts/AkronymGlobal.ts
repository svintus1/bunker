/** Delay when animating cascade (in milliseconds) */
export const CASCADE_ANIMATION_DELAY: number = 500;

/** Possible states (triggering transitions) */
export type AkronymState = 
    'idle' 
    | 'active' | 'disabled' 
    | 'opened' | 'closed';

/** Possible animations */
export type AkronymAnimation = 
    'none'
    | 'css-driven'
    | 'fade-in' | 'fade-out'
    | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' 
    | 'curtain-up' | 'curtain-down' | 'curtain-left' | 'curtain-right';

export type AkronymVisibility =
    'hidden' | 'visible'
    | 'deleted';

export type AkronymElement = HTMLElement & {
  animations: Partial<Record<AkronymState | AkronymVisibility, AkronymAnimation>>;
  visibility: AkronymVisibility;
  state: AkronymState;
};