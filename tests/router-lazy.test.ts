import { beforeEach, describe, expect, it } from 'vitest'
import { Router, type Route } from '../src/index'

function createContainer() {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return el
}

function createDeferredElement() {
  let resolve!: (value: HTMLElement) => void
  const promise = new Promise<HTMLElement>((res) => {
    resolve = res
  })

  return { promise, resolve }
}

function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

describe('Router lazy routes', () => {
  let container: HTMLElement
  let routes: Route[]

  beforeEach(() => {
    // @ts-ignore
    Router.instance = null
    document.body.innerHTML = ''
    container = createContainer()
    routes = []
    window.history.replaceState({}, '', '/')
    window.location.hash = ''
  })

  it('should render lazy route components', async () => {
    routes = [
      { path: '/', component: document.createElement('div') },
      {
        path: '/lazy',
        component: async () => {
          const el = document.createElement('div')
          el.textContent = 'lazy page'
          return el
        },
      },
    ]

    const router = new Router({ mode: 'hash', base: '/', routes })
    router.mount(container)
    router.push('/lazy')
    await flushPromises()

    expect(router.currentRoute?.path).toBe('/lazy')
    expect(container.textContent).toContain('lazy page')
  })

  it('should ignore stale lazy route resolutions', async () => {
    const slow = createDeferredElement()
    const fast = createDeferredElement()

    routes = [
      { path: '/', component: document.createElement('div') },
      { path: '/slow', component: () => slow.promise },
      { path: '/fast', component: () => fast.promise },
    ]

    const router = new Router({ mode: 'hash', base: '/', routes })
    router.mount(container)

    router.push('/slow')
    router.push('/fast')

    const fastEl = document.createElement('div')
    fastEl.textContent = 'fast page'
    fast.resolve(fastEl)
    await flushPromises()

    expect(router.currentRoute?.path).toBe('/fast')
    expect(container.textContent).toContain('fast page')

    const slowEl = document.createElement('div')
    slowEl.textContent = 'slow page'
    slow.resolve(slowEl)
    await flushPromises()

    expect(container.textContent).toContain('fast page')
    expect(container.textContent).not.toContain('slow page')
  })
})
