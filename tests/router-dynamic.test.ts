import { describe, it, expect, beforeEach } from 'vitest'
import { Router, Route } from '../src/index'

function createContainer() {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return el
}

describe('Router dynamic route', () => {
  let container: HTMLElement
  let routes: Route[]
  beforeEach(() => {
    // 重置单例，确保每个测试用例独立
    // @ts-ignore
    Router.instance = null
    container = createContainer()
    routes = []
    window.history.replaceState({}, '', '/')
    window.location.hash = ''
    container.innerHTML = ''
  })

  it('should match dynamic route and extract params', () => {
    routes = [
      { path: '/', component: document.createElement('div') },
      { path: '/user/:id', component: document.createElement('div') },
    ]
    const router = new Router({ mode: 'hash', base: '/', routes })
    router.mount(container)
    router.push('/user/42')
    expect(router.currentRoute?.path).toBe('/user/:id')
    expect(router.currentParams).toMatchObject({ id: '42' })
  })

  it('should prefer static route over dynamic', () => {
    routes = [
      { path: '/', component: document.createElement('div') },
      { path: '/user/:id', component: document.createElement('div') },
      { path: '/user/me', component: document.createElement('div') },
    ]
    const router = new Router({ mode: 'hash', base: '/', routes })
    router.mount(container)
    router.push('/user/me')
    expect(router.currentRoute?.path).toBe('/user/me')
    expect(router.currentParams).toMatchObject({})
  })
})
