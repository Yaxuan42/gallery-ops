---
title: 管理后台 UI 设计规范
type: methodology
status: active
created: 2026-02-12
updated: 2026-02-12
source: workspace-app-modern.html
---

# 管理后台 UI 设计规范

从 workspace-app-modern.html 提取的设计系统，适用于管理后台类产品。白底、细边框、克制用色，信息密度适中。

---

## 1. Design Tokens

主题色通过 CSS 变量配置，替换 `--accent-color` 即可切换整套主题。

```css
:root {
  /* 背景层级：三层灰度建立视觉深度 */
  --bg-primary: #ffffff;
  --bg-secondary: #f7f7f7;
  --bg-tertiary: #f0f0f0;

  /* 文字层级 */
  --text-primary: #202124;
  --text-secondary: #5f6368;
  --text-tertiary: #9aa0a6;

  /* 边框与交互 */
  --border-color: #e8eaed;
  --hover-bg: #f1f3f4;
  --active-bg: #e8f0fe; /* 选中态背景，跟随主题色调整 */

  /* 语义色 */
  --accent-color: #1a73e8; /* 主题色，可替换 */
  --success-color: #34a853;
  --warning-color: #fbbc04;
  --danger-color: #ea4335;

  /* 布局 */
  --sidebar-width: 260px;
  --header-height: 56px;

  /* 字体 */
  --font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", monospace;
}
```

> `--active-bg` 需跟随 `--accent-color` 色相调整，保持 ~10% 透明度的浅底色。

---

## 2. 排版

| 用途             | 字号    | 字重 | 行高 |
| ---------------- | ------- | ---- | ---- |
| 页面标题 (h1)    | 28px    | 600  | 1.4  |
| 内容标题         | 24px    | 600  | —    |
| 二级标题 (h2)    | 22px    | 600  | 1.4  |
| 三级标题 (h3)    | 18px    | 600  | 1.4  |
| 正文（富文本区） | 15px    | 400  | 1.8  |
| 正文（UI）       | 14px    | 400  | 1.6  |
| 导航 / 辅助      | 13px    | 400  | —    |
| 区块标题         | 11px    | 600  | —    |
| Badge / 标注     | 11–12px | 500  | —    |

区块标题附加 `text-transform: uppercase; letter-spacing: 0.5px`。

---

## 3. 间距

基于 **4px** 基数：

| Token | 值   | 典型用途                     |
| ----- | ---- | ---------------------------- |
| xs    | 2px  | section 间距                 |
| sm    | 4px  | breadcrumb gap, li margin    |
| md    | 8px  | icon gap, 按钮间距, 小内边距 |
| lg    | 12px | 卡片内边距, 消息间距         |
| xl    | 16px | section padding, 内容间距    |
| 2xl   | 24px | 页面内边距, heading margin   |

---

## 4. 圆角

| 场景                     | 值   |
| ------------------------ | ---- |
| 行内代码                 | 3px  |
| 小按钮 / scrollbar       | 4px  |
| 输入框 / 按钮 / 普通卡片 | 6px  |
| Logo / 主卡片 / 配置面板 | 8px  |
| Badge                    | 10px |
| 弹窗 / 消息气泡          | 12px |
| 圆形按钮（icon-only）    | 50%  |

---

## 5. 阴影

| 场景       | 值                                                  |
| ---------- | --------------------------------------------------- |
| 默认态     | none                                                |
| 卡片 hover | `0 2px 8px rgba(0, 0, 0, 0.1)`                      |
| Logo 强调  | `0 2px 4px rgba(accent, 0.2)`                       |
| 侧边栏浮层 | `±2px 0 16px rgba(0, 0, 0, 0.1)`                    |
| 弹窗       | `0 20px 40px rgba(0, 0, 0, 0.15)`                   |
| 遮罩背景   | `rgba(0, 0, 0, 0.5)` + `backdrop-filter: blur(4px)` |

---

## 6. 交互状态

### Focus

```css
border-color: var(--accent-color);
box-shadow: 0 0 0 3px rgba(accent, 0.1);
```

统一 3px ring shadow，颜色跟随 `--accent-color`。

### Hover

```css
background: var(--hover-bg);
transition: all 0.2s;
```

### Active / 选中

- 背景 `var(--active-bg)` + 文字 `var(--accent-color)`
- 导航项：左侧 3px 指示条
- Tab：底部 2px 指示线

### 卡片 Hover

```css
border-color: var(--accent-color);
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
transform: translateY(-2px);
```

---

## 7. 动画

| 场景       | 参数                                                   |
| ---------- | ------------------------------------------------------ |
| 通用过渡   | `transition: all 0.2s`                                 |
| 侧边栏滑入 | `transition: transform 0.3s ease`                      |
| 遮罩淡入   | `transition: opacity 0.3s`                             |
| 弹窗弹入   | `0.3s cubic-bezier(0.34, 1.56, 0.64, 1)` — scale 0.9→1 |
| 脉冲指示灯 | `animation: pulse 2s infinite`                         |
| Spinner    | `animation: spin 0.8s linear infinite`                 |
| 展开箭头   | `transform: rotate(90deg)` 0.2s                        |

---

## 8. 组件

### 按钮

| 类型         | 背景                        | 文字               | Hover        |
| ------------ | --------------------------- | ------------------ | ------------ |
| Primary      | `--accent-color`            | white              | 深一阶       |
| Danger       | `--danger-color`            | white              | 深一阶       |
| Secondary    | `--bg-tertiary` + border    | `--text-secondary` | `--hover-bg` |
| Icon (36×36) | transparent + border        | `--text-secondary` | `--hover-bg` |
| Small        | padding 6px 12px, 12px font | —                  | —            |

Disabled 态：`background: var(--text-tertiary); cursor: not-allowed`

### 卡片

```css
border: 1px solid var(--border-color);
border-radius: 8px;
padding: 16px;
/* hover: border 变主题色 + shadow + translateY(-2px) */
```

### 输入框

```css
border: 1px solid var(--border-color);
border-radius: 6px;
padding: 8px 12px;
font-size: 14px;
/* focus: accent border + 3px ring */
```

Textarea 变体：`min-height: 80px; max-height: 200px; border-radius: 8px; padding: 12px`

### Tab

```css
padding: 12px 16px;
border-bottom: 2px solid transparent;
font-size: 13px;
font-weight: 500;
/* active: accent 色文字 + 底部指示线 + bg-primary 背景 */
```

### 导航项

```css
padding: 6px 16px;
font-size: 13px;
/* active: 左侧 3px accent 指示条 + active-bg 背景 */
/* 子级缩进: 一级 42px, 二级 58px */
```

### Badge

```css
background: var(--bg-tertiary);
padding: 2px 6px;
border-radius: 10px;
font-size: 11px;
font-weight: 500;
```

### 状态标签

| 状态      | 背景          | 文字色            |
| --------- | ------------- | ----------------- |
| Running   | `#e8f5e8`     | `--success-color` |
| Stopped   | `#ffeaa7`     | `#d63031`         |
| Available | `--active-bg` | `--accent-color`  |

### 消息气泡

- 用户：`bg: --accent-color; color: white; border-radius: 12px; max-width: 80%`
- 系统：`bg: --bg-tertiary; color: --text-primary; border-radius: 12px; max-width: 80%`

### 弹窗（Modal）

```css
max-width: 800px;
width: 90%;
max-height: 80vh;
border-radius: 12px;
box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
/* 遮罩: rgba(0,0,0,0.5) + backdrop-filter: blur(4px) */
/* 动画: scale 0.9→1, 0.3s spring easing */
```

### Scrollbar

```css
width: 8px;
thumb: var(--text-tertiary), border-radius 4px;
thumb:hover: var(--text-secondary);
track: transparent;
```

---

## 9. 布局

### 整体结构

三栏 Grid：`sidebar (260px) | main (flex) | panel (480px)`

```
┌──────────┬─────────────────────┬────────────┐
│ Sidebar  │     Main Content    │   Panel    │
│  260px   │       flex: 1       │   480px    │
│          │                     │            │
│ - Logo   │ - Header (56px)     │ - Tabs     │
│ - Search │ - Breadcrumb        │ - Content  │
│ - Nav    │ - Content (scroll)  │ - Input    │
└──────────┴─────────────────────┴────────────┘
```

### 内容网格

- 文件卡片网格：`repeat(auto-fill, minmax(200px, 1fr)); gap: 16px`
- 文件列表：4 列 `1fr 120px 160px 100px`
- Markdown 内容：`max-width: 900px; margin: 0 auto`

---

## 10. 响应式

| 断点       | 行为                                         |
| ---------- | -------------------------------------------- |
| ≥1280px    | 三栏全显                                     |
| 768–1279px | 隐藏右侧面板（浮层展开），导航栏可收折       |
| <768px     | 单栏布局，侧边栏抽屉式滑入，右侧面板全屏覆盖 |

移动端文件网格调整为 `minmax(150px, 1fr)`。

---

## 11. 风格总结

| 维度     | 规则                                                    |
| -------- | ------------------------------------------------------- |
| 色彩策略 | 白底为主，3 层灰度背景建立层级，仅 accent + 语义色点缀  |
| 分隔方式 | 1px 细边框分隔区域，不依赖 shadow 做层级                |
| 信息密度 | 13–14px 正文，8–16px 间距，适中偏紧凑                   |
| 动效原则 | 微动效（0.2–0.3s），hover 上浮、focus ring、箭头旋转    |
| 字体     | 系统字体栈优先，等宽字体仅用于终端和代码                |
| 主题适配 | 替换 `--accent-color` + 对应 `--active-bg` 即可切换主题 |
