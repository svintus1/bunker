import { AkronymAnimator } from '../akronym/scripts/AkronymAnimator.js';
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

  constructor() {
    this.modalBackdrop = document.querySelector('.modal-window-backdrop') as HTMLDivElement;
    this.cover = document.getElementById('cover') as HTMLDivElement;

    window.addEventListener('load', this.onRouteChange.bind(this));
    window.addEventListener('popstate', this.onRouteChange.bind(this));
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

  private async loadPage(page: string): Promise<void> {
    const route = this.routes[page];
    const appContainer = document.getElementById('root');

    if (!route || !appContainer) {
        appContainer!.innerHTML = '<h1 class="error">404 Not Found (successful api request)</h1>';
        return;
    }

    const template = await this.loadTemplate(route.template);
    await AkronymAnimator.changeVisibility(this.cover, 'visible', 'fade-in', 1000);

    const oldPage = appContainer.querySelector('.page');
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

    appContainer.appendChild(pageContainer);

    this.loadStyle(route.style);

    const module = await route.script() as PageModule;
    await AkronymAnimator.changeVisibility(this.cover, 'hidden', 'fade-out', 1000);
    this.page = module.init({
        navigateTo: this.navigateTo.bind(this)
    });
  }

  private getPageFromPath(path: string): string {
    const cleanPath = path.replace(/^\/+/, '');
    return cleanPath || 'main';
  }

  private onRouteChange(): void {
    console.log('Route changed:', window.location.pathname);
    const page = this.getPageFromPath(window.location.pathname);
    this.loadPage(page);
  }

  public navigateTo(page: string): void{
    const currentPage = window.location.pathname.slice(1);
    if (currentPage === page) return;

    history.pushState(null, '', `/${page}`);
    console.log('Route navigate:', window.location.pathname);
    this.loadPage(page);
  }
}

// Инициализация
(window as any).index = new Index();
