# 🌙 WELCOME TO MY MOON

蜡笔手绘涂鸦风的个人作品集 · 纯 HTML + CSS + 原生 JS + Vite

---

## 快速开始

```bash
npm install     # 安装依赖（只有 vite 一个）
npm run dev     # 本地开发 → http://localhost:5173
npm run build   # 打包 → dist/
npm run preview # 预览打包结果 → http://localhost:4173
```

**注意**：`npm run dev` 需要 Node 18+。

---

## 目录结构

```
moon-portfolio/
├─ index.html              页面结构 + 内联 SVG 手绘角色
├─ package.json
├─ vite.config.js
├─ public/
│  ├─ favicon.svg          月牙图标
│  └─ assets/fonts/        本地化手写字体（683 个 woff2 分片，离线可用）
│     ├─ Caveat.css        英文手写（标题）
│     ├─ Gaegu.css         英文手写（正文）
│     ├─ Kalam.css         英文手写（备用）
│     ├─ LongCang.css      中文手写
│     └─ NotoSansSC.css    中文黑体（兜底）
└─ src/
   ├─ main.js              oil-motion 跟随效果 + 卡片倾斜 + 平滑滚动
   └─ styles/main.css      全部样式
```

---

## 核心实现

### 1. oil-motion 跟随效果（原生实现，无第三方库）

`src/main.js` 里实现了一个**阻尼弹簧**类，模拟 oil-motion 的手感：

```js
class Spring {
  constructor(value, { stiffness, damping, precision })
  set(target)   // 设目标
  step(dt)      // 物理积分
}
```

用**固定步长 1/120s** 积分，保证不同刷新率下手感一致，也不会在低帧率下发散。

分层跟随，各自有独立弹簧参数：

| 元素 | 变量 | 刚度 | 阻尼 | 幅度 | 效果 |
|---|---|---|---|---|---|
| 头部旋转 | `--head-rot` | 95 | 16 | ±13° | 缓慢柔和地转头 |
| 头部横移 | `--head-x` | 80 | 17 | ±9px | 假 3D 视差 |
| 眼球 | `--ex` `--ey` | 210 | 20 | ±4.6px | 反应更快，视线先动 |
| 整体位移 | `--gx` `--gy` | 55 | 18 | ±5px | 身体微微跟随 |

关键在于**头慢眼快**——眼球先到位、头再转过去，这个错位才有生气。

### 2. 手绘角色（分层 SVG）

角色画在 `index.html` 的内联 SVG 里，分三层：

```
<g class="girl-head">        ← 跟随鼠标转动
  <g class="girl-head-inner">  ← 水平视差位移
    <g class="girl-eye l/r">   ← 眼球独立移动
```

蜡笔质感靠 SVG 滤镜实现：

- `#crayon` — `feTurbulence` + `feDisplacementMap`，让描边变成手绘的粗糙不规则线
- `#crayon-soft` — 更轻的粗糙度，用于小元素
- 纸张颗粒 — `body::before` 的 `feTurbulence` 噪点，`mix-blend-mode: multiply`

配色直接采样自 AI 手绘参考图：纸底 `#EBE5D9`、毛衣 `#EDD36C`、头发 `#5A3C37`、皮肤 `#E7C5AA`。

### 3. 装饰

- **星星闪烁** — `.star` 用 `twinkle` 关键帧，位置/周期由 JS 随机化
- **蝴蝶涂鸦** — 手绘路径 SVG，`floaty` 动画漂浮
- **胶带** — 卡片顶部 `.tape` 元素
- **卡片 hover** — `translateY(-12px)` 上浮 + 内发光黄边 + 3D 倾斜

---

## 怎么改内容

**改文字** — 直接改 `index.html`。

**改卡片** — 找到 `.card` 区块，四个卡片分别是 `.c1` `.c2` `.c3` `.c4`，
用 `data-accent` 换胶带颜色（`butter` / `blush` / `dusty` / `sage`）。

**换角色配色** — 改 `index.html` 里 SVG 的 `fill` 值，CSS 变量在 `src/styles/main.css` 顶部。

**调跟随幅度** — `src/main.js` 里的 `MAX_ROT` / `MAX_EYE` / `MAX_HEAD_X` / `MAX_BODY`。

---

## 部署上线

见根目录的 `部署说明.md`，覆盖 Vercel / Netlify / GitHub Pages / 腾讯云静态托管四种方式。
