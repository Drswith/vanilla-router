# vanilla-router

一个零依赖的前端路由库，适用于原生 JavaScript / TypeScript 项目，支持 `hash` 与 `history` 两种 SPA 路由模式。

## 特性

- 零运行时依赖
- 支持 `hash` 与 `history` 模式
- 支持静态路由、动态路由和通配符路由
- 支持查询参数解析
- 支持 `push`、`replace`、`back`、`go` 编程式导航
- `history` 模式下支持同源内部链接拦截
- 支持异步组件工厂，实现路由懒加载

## 安装

```bash
bun add vanilla-router
```

也可以使用：

```bash
npm install vanilla-router
```

## 快速开始

```ts
import { Router } from 'vanilla-router'

const app = document.querySelector('#app')

if (!app) {
  throw new Error('#app is required')
}

const router = new Router({
  mode: 'hash',
  base: '/',
  routes: [
    {
      path: '/',
      component: () => {
        const el = document.createElement('div')
        el.textContent = '首页'
        return el
      },
    },
    {
      path: '/about',
      component: () => {
        const el = document.createElement('div')
        el.textContent = '关于页'
        return el
      },
    },
    {
      path: '*',
      component: () => {
        const el = document.createElement('div')
        el.textContent = '404'
        return el
      },
    },
  ],
})

router.mount(app)
```

## 路由模式

### Hash 模式

```ts
const router = new Router({
  mode: 'hash',
  base: '/',
  routes,
})
```

路由会体现在 URL 的 `#` 后面，例如：

```txt
/#/about
```

### History 模式

```ts
const router = new Router({
  mode: 'history',
  base: '/app',
  routes,
})
```

路由会体现在真实路径中，例如：

```txt
/app/about
```

在 `history` 模式下，库会自动拦截同源内部链接，例如：

```html
<a href="/app/about">关于页</a>
```

点击后会走 SPA 导航，不触发整页刷新。

注意：服务端需要把非静态资源请求回退到应用入口页面，否则刷新深层路由时会返回 404。

## 动态路由

```ts
const router = new Router({
  mode: 'hash',
  routes: [
    {
      path: '/user/:id',
      component: () => {
        const el = document.createElement('div')
        const id = Router.getInstance()?.currentParams.id ?? ''
        el.textContent = `用户 ID: ${id}`
        return el
      },
    },
  ],
})
```

访问 `/user/42` 后，可以通过 `router.currentParams` 读取：

```ts
{ id: '42' }
```

## 查询参数

无论是 `hash` 还是 `history` 模式，都可以通过 `currentParams` 读取查询参数：

```ts
router.push('/search?keyword=router&sort=desc')

console.log(router.currentParams)
// { keyword: 'router', sort: 'desc' }
```

## 路由懒加载

`component` 支持返回 `Promise<HTMLElement>`，可以直接用异步组件工厂实现懒加载：

```ts
const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/lazy',
      component: async () => {
        const module = await import('./pages/lazy-page')
        return module.createLazyPage()
      },
    },
  ],
})
```

库内部会忽略过期导航的异步结果，避免用户快速切页时旧页面覆盖新页面。

## API

### `new Router(options)`

创建路由实例。

`options` 支持：

- `mode`: `'hash' | 'history'`
- `base?`: 路由基路径，默认为 `'/'`
- `routes`: 路由表
- `fallback?`: 当运行环境不支持 `history.pushState` 时，是否自动回退到 `hash` 模式，默认为 `true`

### `router.mount(container)`

挂载路由容器并根据当前 URL 渲染页面。

### `router.push(path)`

新增一条历史记录并跳转。

### `router.replace(path)`

替换当前历史记录并跳转。

### `router.back()`

后退一条历史记录。

### `router.go(n)`

按历史栈偏移量跳转。

### `router.addRoute(route | route[])`

动态追加或更新路由。

### `router.currentRoute`

当前命中的路由对象。

### `router.currentParams`

当前路由参数与查询参数。

### `Router.getInstance()`

获取当前路由单例。

## 本地开发

安装依赖：

```bash
bun install
```

启动 playground：

```bash
bun run dev
```

运行测试：

```bash
bun run test
```

构建库产物：

```bash
bun run build
```

当前仓库使用 `Bun workspace` 管理 `playground`，库构建使用 `tsdown` 配置，示例页面使用 Vite。
