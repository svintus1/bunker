import { AkronymAnimator } from '../akronym/scripts/AkronymAnimator.js';
import { AkronymEventRouter } from '../akronym/scripts/AkronymEventRouter.js';
type Route = {
  script: () => Promise<any>;
  style: string;
  template: string;
};

type PageModule = {
  init: (ctx: { navigateTo: (path: string) => void }) => any
}

class Index {
  public page: any;

  private routes: Record<string, Route> = {
    main: {
      script: () => import('./main.js'),
      style: 'styles/main.css',
      template: 'pages/main.html',
    },
    lobby: {
      script: () => import('./lobby.js'),
      style: 'styles/lobby.css',
      template: 'pages/lobby.html',
    }
  };

  private modalBackdrop: HTMLDivElement;
  private modalWindow: HTMLDivElement | null = null;
  private cover: HTMLDivElement;
  private musicStatus: HTMLButtonElement;
  private ambientMusic: HTMLAudioElement;

  constructor() {
    this.modalBackdrop = document.querySelector('.modal-window-backdrop') as HTMLDivElement;
    this.cover = document.getElementById('cover') as HTMLDivElement;
    this.musicStatus = document.getElementById('music-status') as HTMLButtonElement;
    this.ambientMusic = document.getElementById('ambient-music') as HTMLAudioElement;

    window.addEventListener('load', this.onRouteChange.bind(this, false));
    window.addEventListener('popstate', this.onRouteChange.bind(this, true));
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
    (window as any).navigateTo = this.navigateTo.bind(this);
  }

  private loadStyle(href: string): void {
    if (document.querySelector(`link[href="${href}"]`)) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  private async loadTemplate(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load template: ${url}`);
    return response.text();
  }

  private async loadPage(page: string, transition: boolean): Promise<void> {
    const route = this.routes[page];
    const appContainer = document.getElementById('root');

    this.musicStatus.setAttribute('data-mute', "true");
    this.ambientMusic.pause();
    const template = await this.loadTemplate(route.template);
    
    if (transition){
      await AkronymAnimator.changeVisibility(this.cover, 'visible', 'fade-in', 1000);
    }

    const oldPage = appContainer?.querySelector('.page');
    if (oldPage) oldPage.remove();

    const pageContainer = document.createElement('div');
    pageContainer.className = 'page';
    pageContainer.id = page;
    pageContainer.innerHTML = template;

    // Extract modal-window and move it to modal-window-backdrop
    this.modalWindow = pageContainer.querySelector('.modal-window') as HTMLDivElement;
    if (this.modalWindow) {
        if (this.modalBackdrop) {
          this.modalBackdrop.appendChild(this.modalWindow);
        }
    }

    appContainer?.appendChild(pageContainer);

    this.loadStyle(route.style);

    const module = await route.script() as PageModule;
    this.page = module.init({
        navigateTo: this.navigateTo.bind(this)
    });
    if (transition) {
      await AkronymAnimator.changeVisibility(this.cover, 'hidden', 'fade-out', 1000);
    }
  }

  private getPageFromPath(path: string): string {
    const cleanPath = path.replace(/^\/+/, '');
    return cleanPath || 'main';
  }

  private onRouteChange(isPopState: boolean): void {
    console.log('Route changed:', window.location.pathname);
    const page = this.getPageFromPath(window.location.pathname);

    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const navigationType = navigationEntries[0].type;
    if (isPopState){
      console.log('Navigation type: back-forward');
    }
    else {
      console.log('Navigation type:', navigationType);
    }

    if (page === 'main' && navigationType === 'navigate') {
      this.loadPage('main', false);
    }
    else if (navigationType == 'navigate') {
      console.log('Illegal change of route, loading main page');
      history.pushState(null, '', '/main');
      this.loadPage('main', false);
    }
    else {
      this.loadPage(page, true);
    }
  }

  public navigateTo(page: string): void{
    const currentPage = window.location.pathname.slice(1);
    if (currentPage === page) return;
    history.pushState(null, '', `/${page}`);
    console.log('Route navigate:', window.location.pathname);
    console.log('Navigation type: routing');
    this.loadPage(page, true);
  }
}

// Инициализация
(window as any).index = new Index();
