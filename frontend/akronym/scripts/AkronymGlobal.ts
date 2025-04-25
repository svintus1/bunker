/** Delay when animating cascade (in milliseconds) */
export const CASCADE_ANIMATION_DELAY: number = 200;

/** Possible states (triggering transitions) */
export type AkronymState = 
    'idle' 
    | 'active' | 'disabled' 
    | 'opened' | 'closed'
    | 'error' | 'success'
    ;

/** Possible animations */
export type AkronymAnimation = 
    'none'
    | 'css-driven'
    | 'fade-in' | 'fade-out'
    | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right'
    |  'modal-window-slide-in' | 'modal-window-slide-out'
    | 'error-window-slide-in' | 'error-window-slide-out'
    | 'curtain-up' | 'curtain-down' | 'curtain-left' | 'curtain-right'
    | 'error' | 'success';

export type AkronymVisibility =
    'hidden' | 'visible'
    | 'deleted';