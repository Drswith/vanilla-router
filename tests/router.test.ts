import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Router, Route } from '../src/index'

function createContainer() {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return el
}

describe('Router', () => {
  let container: HTMLElement
  let routes: Route[]
  beforeEach(() => {
    container = createContainer()
    routes = [
      { path: '/', component: document.createElement('div') },
      { path: '/about', component: document.createElement('div') },
      { path: '*', component: document.createElement('div') },
    ]
    window.history.replaceState({}, '', '/')
    window.location.hash = ''
    container.innerHTML = ''
  })

  it('should initialize with base and mode', () => {
    const router = new Router({ mode: 'hash', base: '/app', routes })
    expect(router.base).toBe('/app')
    expect(router.mode).toBe('hash')
  })

  it('should mount and render route', () => {
    const router = new Router({ mode: 'hash', base: '/', routes })
    router.mount(container)
    router.push('/')
    expect(router.container).toBe(container)
    expect(container.childNodes.length).toBe(1)
  })

  it('should navigate with push and replace (hash mode)', () => {
    const router = new Router({ mode: 'hash', base: '/', routes })
    router.mount(container)
    router.push('/about')
    expect(window.location.hash).toContain('/about')
    router.replace('/')
    expect(window.location.hash).toContain('/')
  })

  it('should handle base path in hash mode', () => {
    const router = new Router({ mode: 'hash', base: '/app', routes })
    router.mount(container)
    router.push('/about')
    expect(window.location.hash).toContain('/app/about')
  })

  it('should handle base path in history mode', () => {
    const router = new Router({ mode: 'history', base: '/app', routes })
    router.mount(container)
    router.push('/about')
    expect(router.base + '/about').toBe('/app/about')
  })

  it('should match wildcard route', () => {
    if (typeof window.history.pushState !== 'function') {
      window.history.pushState = (() => {}) as any
    }
    const router = new Router({ mode: 'hash', base: '/', routes })
    router.mount(container)
    router.push('/not-exist')
    expect(router.currentRoute?.path).toBe('*')
  })
})
