import { Router } from '../../src/index.ts'
import './style.css'

const MODE_STORAGE_KEY = 'vanilla-router:playground:mode'
const app = document.querySelector<HTMLDivElement>('#app')
const activeMode = window.localStorage.getItem(MODE_STORAGE_KEY) === 'history' ? 'history' : 'hash'

if (!app) {
  throw new Error('#app is required')
}

function createPage(title: string, description: string) {
  const page = document.createElement('section')
  page.className = 'page'
  page.innerHTML = `
    <p class="eyebrow">Route View</p>
    <h2>${title}</h2>
    <p>${description}</p>
  `
  return page
}

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

app.innerHTML = `
  <main class="shell">
    <section class="hero">
      <p class="eyebrow">vanilla-router playground</p>
      <h1>原生前端路由示例</h1>
      <p class="lead">
        这个 playground 直接调用 <code>src/index.ts</code> 的 Router，演示静态路由、动态路由、查询参数、编程式跳转，以及 hash/history 两种模式切换。
      </p>
    </section>

    <section class="panel">
      <div class="mode-switch">
        <button data-mode="hash" type="button">Hash 模式</button>
        <button data-mode="history" type="button">History 模式</button>
      </div>

      <div class="nav">
        <button data-path="/" type="button">首页</button>
        <button data-path="/about" type="button">关于</button>
        <button data-path="/user/42" type="button">用户 42</button>
        <button data-path="/search?keyword=bun&sort=desc" type="button">搜索</button>
        <button data-path="/lazy" type="button">懒加载页</button>
        <button data-path="/missing" type="button">404</button>
      </div>

      <div class="link-list">
        <a href="/">首页链接</a>
        <a href="/about">关于链接</a>
        <a href="/user/7">用户链接</a>
        <a href="/search?keyword=router&sort=asc">搜索链接</a>
        <a href="/lazy">懒加载链接</a>
      </div>

      <div class="toolbar">
        <button id="replace-route" type="button">replace 到关于页</button>
        <button id="back-route" type="button">返回</button>
      </div>

      <div class="status">
        <div>
          <span>当前模式</span>
          <strong id="current-mode">${activeMode}</strong>
        </div>
        <div>
          <span>当前路径</span>
          <strong id="current-path">/</strong>
        </div>
        <div>
          <span>当前参数</span>
          <strong id="current-params">{}</strong>
        </div>
        <div>
          <span>当前 URL</span>
          <strong id="current-url">/</strong>
        </div>
      </div>

      <div id="router-view" class="view"></div>
    </section>
  </main>
`

const currentPath = document.querySelector<HTMLElement>('#current-path')
const currentParams = document.querySelector<HTMLElement>('#current-params')
const currentMode = document.querySelector<HTMLElement>('#current-mode')
const currentUrl = document.querySelector<HTMLElement>('#current-url')
const view = document.querySelector<HTMLElement>('#router-view')

if (!currentPath || !currentParams || !currentMode || !currentUrl || !view) {
  throw new Error('router playground nodes are required')
}

const router = new Router({
  mode: activeMode,
  base: '/',
  routes: [
    {
      path: '/',
      component: () => createPage('首页', '欢迎来到 vanilla-router 的最小示例。'),
    },
    {
      path: '/about',
      component: () => createPage('关于页', '这个页面由静态路由渲染。'),
    },
    {
      path: '/user/:id',
      component: () => createPage(
        '用户详情',
        `动态参数 id = ${Router.getInstance()?.currentParams.id ?? '-'}`,
      ),
    },
    {
      path: '/search',
      component: () => createPage(
        '搜索结果',
        `keyword = ${Router.getInstance()?.currentParams.keyword ?? '-'}, sort = ${Router.getInstance()?.currentParams.sort ?? '-'}`,
      ),
    },
    {
      path: '/lazy',
      component: async () => {
        await wait(800)
        const page = createPage('懒加载页面', '这个页面通过异步组件工厂渲染，模拟了 800ms 的加载时间。')
        const badge = document.createElement('span')
        badge.className = 'lazy-badge'
        badge.textContent = 'Lazy Loaded'
        page.appendChild(badge)
        return page
      },
    },
    {
      path: '*',
      component: () => createPage('404', '当前路径没有匹配到任何路由。'),
    },
  ],
})

const rawHandleRoute = router.handleRoute.bind(router)
router.handleRoute = () => {
  rawHandleRoute()
  currentMode.textContent = router.mode
  currentPath.textContent = router.currentRoute?.path ?? '(none)'
  currentParams.textContent = JSON.stringify(router.currentParams)
  currentUrl.textContent = `${window.location.pathname}${window.location.search}${window.location.hash}`
}

router.mount(view)

document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => {
  if (button.dataset.mode === activeMode)
    button.dataset.active = 'true'

  button.addEventListener('click', () => {
    const nextMode = button.dataset.mode
    if (nextMode !== 'hash' && nextMode !== 'history')
      return
    if (nextMode === activeMode)
      return

    window.localStorage.setItem(MODE_STORAGE_KEY, nextMode)
    window.location.href = nextMode === 'history' ? '/' : '/#/'
  })
})

document.querySelectorAll<HTMLButtonElement>('[data-path]').forEach((button) => {
  button.addEventListener('click', () => {
    router.push(button.dataset.path ?? '/')
  })
})

document.querySelectorAll<HTMLAnchorElement>('.link-list a').forEach((link) => {
  if (activeMode === 'hash')
    link.href = `#${link.getAttribute('href') ?? '/'}`
})

document.querySelector<HTMLButtonElement>('#replace-route')?.addEventListener('click', () => {
  router.replace('/about')
})

document.querySelector<HTMLButtonElement>('#back-route')?.addEventListener('click', () => {
  router.back()
})
