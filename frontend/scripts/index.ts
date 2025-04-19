type Route = {
    script: () => Promise<any>;
    style: string;
    template: string;
  };
  
  const routes: Record<string, Route> = {
    main: {
      script: () => import('./main.js'),
      style: 'styles/main.css',
      template: 'pages/main.html'
    }
  };
  
  function loadStyle(href: string): void {
    const existing = document.querySelector(`link[href="${href}"]`);
    if (existing) return;
  
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
  
  async function loadTemplate(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load template: ${url}`);
    }
    return response.text();
  }
  
  async function loadPage(page: string): Promise<void> {
    const route = routes[page];
    const appContainer = document.getElementById('root');
  
    if (!route || !appContainer) {
      appContainer!.innerHTML = '<h1 class="error">404 Not Found</h1>';
      return;
    }

      // Загрузка HTML-шаблона
      const template = await loadTemplate(route.template);
  
      // Удаление старой страницы
      const oldPage = appContainer.querySelector('.page');
      if (oldPage) {
        oldPage.remove();
      }
  
      // Создание нового контейнера страницы
      const pageContainer = document.createElement('div');
      pageContainer.className = 'page';
      pageContainer.id = page;
      pageContainer.innerHTML = template;
  
      // Вставка в DOM
      appContainer.appendChild(pageContainer);
  
      // Подключаем стили
      loadStyle(route.style);
  
      // Запуск скрипта страницы
      const module = await route.script();
      module.init();
  }
  
  
  function getPageFromPath(path: string): string {
    const cleanPath = path.replace(/^\/+/, '');
    return cleanPath || 'main'; // Default to 'main' if path is empty
  }
  
  function onRouteChange(): void {
    console.log('Route changed:', window.location.pathname);
    const page = getPageFromPath(window.location.pathname);
    loadPage(page);
  }
  
  function navigateTo(page: string): void {
    console.log('Route navigate:', window.location.pathname);
    history.pushState(null, '', `/${page}`);
    loadPage(page);
  }
  
  // Initial load
  window.addEventListener('load', onRouteChange);
  window.addEventListener('popstate', onRouteChange);
  
  // Expose for manual navigation (example)
  (window as any).navigateTo = navigateTo;
  