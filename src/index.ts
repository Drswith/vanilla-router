export interface Route {
  path: string
  component: HTMLElement | (() => HTMLElement)
}

export interface RouterOptions {
  mode: 'hash' | 'history'
  base?: string
  routes: Array<Route>
  fallback?: boolean
}

export class Router {
  static instance: Router | null = null
  mode!: 'hash' | 'history'
  base!: string
  routes!: Array<Route>
  currentRoute!: Route | null
  currentParams: Record<string, string> = {}
  container: HTMLElement | null = null
  fallback: boolean = true

  constructor(options: RouterOptions) {
    if (Router.instance)
      return Router.instance
    const { mode = 'hash', routes = [], base = '/', fallback = true } = options
    this.mode = mode
    this.routes = routes
    this.base = base
    this.fallback = fallback
    Router.instance = this
  }

  mount(container: HTMLElement) {
    if (!container)
      throw new Error('router container is required')
    this.container = container
    if (
      this.mode === 'history'
      && !(window.history && typeof window.history.pushState === 'function')
    ) {
      if (this.fallback) {
        this.mode = 'hash'
        const path = window.location.pathname + window.location.search + window.location.hash
        console.warn('当前环境不支持 history.pushState，已自动切换为 hash 模式')
        window.location.replace(`#${path}`)
      }
      else {
        throw new Error('当前环境不支持 history.pushState，且 fallback 被禁用')
      }
    }
    window.addEventListener('popstate', () => this.handleRoute())
    this.handleRoute()
  }

  static getInstance() {
    return Router.instance
  }

  private getPathAndParams(raw: string) {
    const [purePath, queryString] = raw.split('?')
    return {
      path: purePath,
      params: queryString ? Object.fromEntries(new URLSearchParams(queryString)) : {},
    }
  }

  addRoute(route: Route | Route[]) {
    if (Array.isArray(route)) {
      const newRoutes = route.filter((r, index, self) => self.findIndex(t => t.path === r.path) === index)
      this.routes.push(...newRoutes)
    }
    else {
      const index = this.routes.findIndex(r => r.path === route.path)
      if (index === -1) {
        this.routes.push(route)
      }
      else {
        this.routes[index] = route
      }
    }
  }

  handleRoute() {
    let path = ''
    let params: Record<string, string> = {}

    if (this.mode === 'hash') {
      const hash = window.location.hash.slice(1)
      if (!hash) {
        window.location.hash = this.base.endsWith('/') ? this.base : `${this.base}/`
        return
      }
      ({ path, params } = this.getPathAndParams(hash))
      if (path.startsWith(this.base)) {
        path = path.slice(this.base.length)
        if (!path.startsWith('/'))
          path = `/${path}`
      }
    }
    else {
      let pathname = window.location.pathname
      if (!pathname || pathname === this.base) {
        if (window.location.pathname !== this.base) {
          window.history.replaceState({}, '', this.base)
        }
        path = '/'
        params = {}
      }
      else {
        if (pathname.startsWith(this.base)) {
          pathname = pathname.slice(this.base.length)
          if (!pathname.startsWith('/'))
            pathname = `/${pathname}`
        }
        ({ path, params } = this.getPathAndParams(pathname))
      }
    }

    const route = this.routes.find(r => r.path === path) || this.routes.find(r => r.path === '*')
    if (route && this.container) {
      this.currentRoute = route
      this.currentParams = params
      this.container.innerHTML = ''
      this.container.appendChild(typeof route.component === 'function' ? route.component() : route.component)
    }
    console.log('handleRoute', this)
  }

  push(path: string) {
    let fullPath = ''
    if (this.base.endsWith('/')) {
      fullPath = this.base + (path.startsWith('/') ? path.slice(1) : path)
    }
    else {
      fullPath = this.base + (path.startsWith('/') ? path : `/${path}`)
    }
    if (this.mode === 'hash') {
      window.history.pushState({}, '', `#${fullPath}`)
    }
    else {
      window.history.pushState({}, '', fullPath)
    }
    this.handleRoute()
  }

  replace(path: string) {
    let fullPath = ''
    if (this.base.endsWith('/')) {
      fullPath = this.base + (path.startsWith('/') ? path.slice(1) : path)
    }
    else {
      fullPath = this.base + (path.startsWith('/') ? path : `/${path}`)
    }
    if (this.mode === 'hash') {
      window.history.replaceState({}, '', `#${fullPath}`)
    }
    else {
      window.history.replaceState({}, '', fullPath)
    }
    this.handleRoute()
  }

  back() {
    window.history.back()
    this.handleRoute()
  }

  go(n: number) {
    window.history.go(n)
    this.handleRoute()
  }
}
