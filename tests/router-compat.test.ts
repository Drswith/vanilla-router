import { describe, it, expect, beforeEach } from 'vitest'
import { Router, Route } from '../src/index'

function createContainer() {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return el
}

describe('Router fallback compatibility', () => {
  let container: HTMLElement
  let routes: Route[]
  let originalPushState: any
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
    originalPushState = window.history.pushState
  })

  it('should fallback to hash mode if history unsupported', () => {
    // 模拟不支持 pushState
    // @ts-ignore
    window.history.pushState = undefined
    const router = new Router({ mode: 'history', base: '/', routes, fallback: true })
    router.mount(container)
    expect(router.mode).toBe('hash')
    // 恢复
    window.history.pushState = originalPushState
  })

  it('should not fallback if fallback is false', () => {
    // @ts-ignore
    window.history.pushState = undefined
    const routes = [
      { path: '/', component: document.createElement('div') }
    ]
    const router = new Router({ mode: 'history', base: '/', routes, fallback: false })
    router.mount(container)
    expect(() => {
      router.push('/about')
    }).toThrow(/history\.pushState/)
    window.history.pushState = originalPushState
  })
})
