# 客户官网页面规格 (Website Specification)

## 1. 设计语言

参考 gallery-attic.com 的极简画廊美学：

| 元素     | 规格                                                                       |
| -------- | -------------------------------------------------------------------------- |
| 主色调   | 暖中性色系：奶白(#FAF8F5)、灰褐(#8B7E74)、炭灰(#2C2C2C)、黄铜点缀(#B8956A) |
| 标题字体 | Playfair Display (衬线)                                                    |
| 正文字体 | Inter (无衬线)                                                             |
| 中文字体 | Noto Serif SC (标题) / Noto Sans SC (正文)                                 |
| 间距     | 大量留白，section 间距 80-120px                                            |
| 图片风格 | 高质量产品照，4:5 竖版为主                                                 |
| 动效     | 微妙的 fade-in 滚动动画，hover 时图片微放大(scale 1.03)                    |

### 目录结构

```
apps/web/
├── middleware.ts                # i18n 语言检测与路由
├── app/
│   ├── [locale]/                # 国际化路由组
│   │   ├── layout.tsx
│   │   ├── page.tsx             # 首页
│   │   ├── collection/
│   │   │   ├── page.tsx         # 藏品列表
│   │   │   └── [slug]/page.tsx  # 藏品详情
│   │   ├── designer/
│   │   │   └── [slug]/page.tsx  # 设计师专页
│   │   ├── about/page.tsx
│   │   └── contact/page.tsx
│   └── api/
│       └── contact/route.ts     # 联系表单处理
├── components/
│   ├── layout/                  # Header, Footer, Navigation, LanguageSwitcher
│   ├── home/                    # HeroCarousel, FeaturedItems, AboutTeaser
│   ├── collection/              # ItemGrid, ItemCard, Filters, Pagination
│   └── product/                 # ImageGallery, ProductSpecs
└── lib/
    ├── i18n.ts                  # next-intl 配置
    └── queries.ts               # 服务端数据查询函数
```

---

## 2. 导航栏 (Header)

```
┌──────────────────────────────────────────────────────┐
│  [画廊 Logo]     Collection | Designers | About | Contact    [ZH/EN]  │
└──────────────────────────────────────────────────────┘
```

- 固定在顶部，向下滚动后加背景毛玻璃效果
- **Collection** 下拉：分类列表（椅子、桌子、收纳、灯具...）
- **Designers** 下拉：设计师列表（Eames、Pierre Jeanneret、Le Corbusier...）
- **语言切换**：ZH / EN 按钮
- 移动端：汉堡菜单展开全屏导航

---

## 3. 首页 (`/[locale]/`)

### Section 1: Hero 轮播

- **高度**：`calc(100vh - 导航栏高度)`
- **轮播**：Embla Carousel，crossfade 过渡，5 秒自动播放
- **数据源**：HeroSlide 模型（管理后台可配置）
- **叠加**：可选标题文字 + "View Collection" 按钮

### Section 2: 精选藏品

- **标题**：Featured Collection / 精选藏品
- **布局**：4 列网格 (desktop)、2 列 (tablet)、1 列 (mobile)
- **数据**：Item where Product.featured=true AND showOnWebsite=true，限制 8 件
- **卡片**：图片(4:5) + 名称 + 设计师 + 状态徽章("Sold"/"Available")
- **底部**："View All" 按钮链接到 Collection 页

### Section 3: 画廊简介

- **布局**：左图右文 (desktop)，上图下文 (mobile)
- **内容**：画廊故事简述 (2-3 段)
- **CTA**："Learn More" 按钮链接到 About 页

### Section 4: 联系入口

- **布局**：全宽背景图 + 半透明覆盖层
- **内容**："Interested in a piece? Get in touch." / "对藏品感兴趣？欢迎联系我们。"
- **CTA**："Contact Us" 按钮

---

## 4. 藏品页 (`/[locale]/collection`)

```
┌────────────────────────────────────────────────────────────┐
│  Collection / 藏品                                          │
├───────────┬────────────────────────────────────────────────┤
│           │                                                │
│  Filters  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐            │
│           │  │     │ │     │ │     │ │     │            │
│  Category │  │ img │ │ img │ │ img │ │ img │            │
│  ☐ 椅子   │  │     │ │     │ │     │ │     │            │
│  ☐ 桌子   │  │name │ │name │ │name │ │name │            │
│  ☐ 收纳   │  │dsgnr│ │dsgnr│ │dsgnr│ │dsgnr│            │
│  ☐ 灯具   │  └─────┘ └─────┘ └─────┘ └─────┘            │
│  ☐ 其他   │                                                │
│           │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐            │
│  Designer │  │     │ │     │ │     │ │     │            │
│  ☐ Eames  │  │ ... │ │ ... │ │ ... │ │ ... │            │
│  ☐ PJ     │  │     │ │     │ │     │ │     │            │
│  ☐ Chapo  │  └─────┘ └─────┘ └─────┘ └─────┘            │
│           │                                                │
│  Status   │            ◄  1  2  3  4  ►                   │
│  ○ All    │                                                │
│  ○ 在售   │                                                │
│  ○ 已售   │                                                │
└───────────┴────────────────────────────────────────────────┘
```

### 筛选逻辑

- **分类**：多选 checkbox，筛选 Product.category
- **设计师**：多选 checkbox，筛选 Item.designerSeries
- **状态**：单选 radio，All / Available(IN_STOCK+IN_TRANSIT) / Sold(SOLD)
- **URL 参数**：`?category=椅子,桌子&designer=Eames&status=available&page=2`
- 移动端：筛选器收起为顶部抽屉，点击"筛选"按钮展开

### 分页

每页 24 件，数字分页 + 上下翻页箭头

### 网格响应式

4 列 (>1200px)、3 列 (>768px)、2 列 (>480px)、1 列 (<480px)

### 商品卡片

- 图片：4:5 比例，hover 时 scale(1.03) + 轻微阴影
- 名称：单行，溢出截断
- 设计师：浅色小字
- 状态："Sold" 标签覆盖在图片左上角（半透明背景）

---

## 5. 藏品详情页 (`/[locale]/collection/[slug]`)

```
┌────────────────────────────────────────────────────────────┐
│  ← Back to Collection                                       │
├──────────────────────────┬─────────────────────────────────┤
│                          │                                 │
│   ┌──────────────────┐   │  Designer Series                │
│   │                  │   │  Item Name / 名称               │
│   │   Main Image     │   │                                 │
│   │                  │   │  Era: 1955-1960                 │
│   │                  │   │  Manufacturer: Zenith            │
│   └──────────────────┘   │  Material: Teak + Cane          │
│   ┌──┐ ┌──┐ ┌──┐ ┌──┐   │  Dimensions: 535x650x775mm     │
│   │th│ │th│ │th│ │th│   │  Condition: Grade A              │
│   └──┘ └──┘ └──┘ └──┘   │  Status: Available ●            │
│                          │                                 │
│                          │  [Inquire About This Piece]     │
│                          │                                 │
├──────────────────────────┴─────────────────────────────────┤
│  Description                                                │
│  详细描述文本...                                             │
├────────────────────────────────────────────────────────────┤
│  Related Items                                              │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                         │
│  │     │ │     │ │     │ │     │                         │
│  └─────┘ └─────┘ └─────┘ └─────┘                         │
└────────────────────────────────────────────────────────────┘
```

- **图片画廊**：主图 + 缩略图条，点击切换，支持灯箱放大
- **信息面板**：设计师系列、名称、年代、厂家、材质、尺寸、成色、状态
- **询价按钮**：链接到联系页，自动填充商品参考信息
- **描述区**：富文本内容（中英双语，根据 locale 切换）
- **相关推荐**：同设计师系列或同分类的其他在售商品，4 件

---

## 6. 设计师专页 (`/[locale]/designer/[slug]`)

- **顶部**：设计师名称 + 简介文字（中英双语）
- **下方**：复用藏品页网格组件，预设 designerSeries 筛选
- **URL**：`/zh/designer/eames`、`/en/designer/pierre-jeanneret`
- **支持设计师**：eames, pierre-jeanneret, le-corbusier, charlotte-perriand, jean-prouve, pierre-chapo, bernard-albin-gras, poul-henningsen

---

## 7. 关于页 (`/[locale]/about`)

- **Hero 区**：画廊空间全宽照片
- **故事区**：左文右图交替排列，讲述画廊理念与历史
- **团队区（可选）**：合伙人简介
- **信息区**：画廊地址、营业时间、联系方式

---

## 8. 联系页 (`/[locale]/contact`)

### 左侧：联系表单

| 字段     | 类型   | 验证                           |
| -------- | ------ | ------------------------------ |
| 姓名     | 文本   | 可选                           |
| 邮箱 \*  | 邮箱   | 必填，格式验证                 |
| 电话     | 文本   | 可选                           |
| 主题     | 下拉   | 一般咨询 / 商品咨询 / 预约参观 |
| 商品参考 | 文本   | 可选，从详情页跳转时自动填充   |
| 留言 \*  | 长文本 | 必填                           |

### 右侧：画廊信息

- 地址
- 电话
- 邮箱
- 微信（二维码图片）
- 营业时间
- 社交媒体链接

**提交后**：存入 ContactInquiry 表 + 显示成功提示

---

## 9. 页脚 (Footer)

```
┌─────────────────────────────────────────────────────┐
│  [画廊 Logo]                                         │
│                                                     │
│  Collection    Designers     About     Contact       │
│  椅子          Eames         画廊故事   联系表单      │
│  桌子          Jeanneret     团队       地址         │
│  收纳          Chapo                                 │
│  灯具          Prouve                                │
│                                                     │
│  Instagram | WeChat                                  │
│  © 2025 Gallery Name. All rights reserved.          │
└─────────────────────────────────────────────────────┘
```

---

## 10. i18n 实现

- **路由**：`/zh/...` 和 `/en/...`，middleware 检测 Accept-Language 自动重定向
- **默认语言**：中文 (zh)
- **翻译文件**：`packages/shared/src/i18n/{zh,en}.json`
- **数据库双语**：Product 和 Item 的名称/描述字段均有 zh/en 两个版本
- **语言切换器**：导航栏右侧 ZH / EN 切换按钮，切换时保持当前页面路径

---

## 11. SEO

- 每页独立的 `<title>` 和 `<meta description>`（中英文）
- Open Graph 标签（图片、标题、描述）
- 自动生成 `sitemap.xml`
- `robots.txt`
- 结构化数据 (JSON-LD) 用于产品页面
