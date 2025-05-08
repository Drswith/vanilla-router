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
    // 自动添加 / 路由，保证至少有一个首页
    if (!this.routes.some(r => r.path === '/')) {
      this.routes.unshift({ path: '/', component: document.createElement('div') })
    }
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

  /**
   * 匹配路由，支持静态、动态（:param）、通配符，优先级：静态 > 动态 > 通配符
   */
  private matchRoute(path: string): { route: Route | null, params: Record<string, string> } {
    // 1. 静态路由优先
    let route = this.routes.find(r => !r.path.includes(':') && r.path !== '*' && r.path === path)
    if (route)
      return { route, params: {} }

    // 2. 动态路由
    for (const r of this.routes) {
      if (!r.path.includes(':') || r.path === '*')
        continue
      const paramNames: string[] = []
      const regex = r.path.replace(/:([^/]+)/g, (_, name) => {
        paramNames.push(name)
        return '([^/]+)'
      })
      const match = path.match(new RegExp(`^${regex}$`))
      if (match) {
        const params: Record<string, string> = {}
        paramNames.forEach((name, i) => {
          params[name] = match[i + 1]
        })
        return { route: r, params }
      }
    }
    // 3. 通配符
    route = this.routes.find(r => r.path === '*')
    return { route: route || null, params: {} }
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
      if (!path.startsWith('/'))
        path = `/${path}`
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
      if (!path.startsWith('/'))
        path = `/${path}`
    }

    const { route, params: dynamicParams } = this.matchRoute(path)
    if (route && this.container) {
      this.currentRoute = route
      this.currentParams = { ...params, ...dynamicParams }
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
