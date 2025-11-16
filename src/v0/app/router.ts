// V0 App router utilities (replacing Next.js routing)
export interface Route {
  path: string;
  component: React.ComponentType;
  title?: string;
  description?: string;
}

export interface V0Router {
  routes: Route[];
  currentPath: string;
  navigate: (path: string) => void;
  back: () => void;
  forward: () => void;
}

export function createV0Router(routes: Route[]): V0Router {
  let currentPath = window.location.pathname;
  let history: string[] = [currentPath];
  let historyIndex = 0;

  const navigate = (path: string) => {
    if (path !== currentPath) {
      currentPath = path;
      history = history.slice(0, historyIndex + 1);
      history.push(path);
      historyIndex = history.length - 1;
      window.history.pushState({}, '', path);
    }
  };

  const back = () => {
    if (historyIndex > 0) {
      historyIndex--;
      currentPath = history[historyIndex];
      window.history.back();
    }
  };

  const forward = () => {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      currentPath = history[historyIndex];
      window.history.forward();
    }
  };

  return {
    routes,
    currentPath,
    navigate,
    back,
    forward,
  };
}
