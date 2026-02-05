---
title: CSS 基础
link: basics
catalog: true
date: 2025-01-05 11:00:00
description: CSS 层叠样式表的基础知识，包括选择器、盒模型、布局等核心概念。
tags:
  - CSS
  - CSS3
categories:
  - [前端, CSS]
---

CSS（Cascading Style Sheets）是用于描述 HTML 文档样式的语言。

## 选择器

### 基础选择器

```css
/* 元素选择器 */
p { color: blue; }

/* 类选择器 */
.container { max-width: 1200px; }

/* ID 选择器 */
#header { background: #333; }

/* 通配符选择器 */
* { margin: 0; padding: 0; }
```

### 组合选择器

```css
/* 后代选择器 */
.nav a { text-decoration: none; }

/* 子选择器 */
.nav > li { display: inline-block; }

/* 相邻兄弟选择器 */
h1 + p { margin-top: 0; }

/* 通用兄弟选择器 */
h1 ~ p { color: gray; }
```

### 伪类与伪元素

```css
/* 伪类 */
a:hover { color: red; }
li:first-child { font-weight: bold; }
input:focus { outline: 2px solid blue; }

/* 伪元素 */
p::first-line { font-size: 1.2em; }
.quote::before { content: '"'; }
.quote::after { content: '"'; }
```

## 盒模型

每个 HTML 元素都可以看作一个盒子，由内容、内边距、边框和外边距组成。

```css
.box {
  /* 内容区域 */
  width: 200px;
  height: 100px;

  /* 内边距 */
  padding: 20px;

  /* 边框 */
  border: 1px solid #ccc;

  /* 外边距 */
  margin: 10px;

  /* 盒模型计算方式 */
  box-sizing: border-box; /* 推荐 */
}
```

### box-sizing 属性

```css
/* content-box（默认）: width/height 只包含内容 */
.content-box {
  box-sizing: content-box;
  width: 200px;
  padding: 20px;
  /* 实际宽度 = 200 + 20*2 = 240px */
}

/* border-box: width/height 包含内容、内边距、边框 */
.border-box {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  /* 实际宽度 = 200px */
}
```

## Flexbox 布局

Flexbox 是一维布局模型，适合处理行或列的布局。

```css
.container {
  display: flex;

  /* 主轴方向 */
  flex-direction: row; /* row | column | row-reverse | column-reverse */

  /* 主轴对齐 */
  justify-content: center; /* flex-start | flex-end | center | space-between | space-around */

  /* 交叉轴对齐 */
  align-items: center; /* flex-start | flex-end | center | stretch | baseline */

  /* 换行 */
  flex-wrap: wrap; /* nowrap | wrap | wrap-reverse */

  /* 间距 */
  gap: 20px;
}

.item {
  /* 放大比例 */
  flex-grow: 1;

  /* 缩小比例 */
  flex-shrink: 0;

  /* 基础尺寸 */
  flex-basis: 200px;

  /* 简写 */
  flex: 1 0 200px;
}
```

## Grid 布局

Grid 是二维布局模型，适合复杂的页面布局。

```css
.container {
  display: grid;

  /* 定义列 */
  grid-template-columns: 1fr 2fr 1fr;
  /* 或使用 repeat */
  grid-template-columns: repeat(3, 1fr);

  /* 定义行 */
  grid-template-rows: auto 1fr auto;

  /* 间距 */
  gap: 20px;
}

.item {
  /* 跨列 */
  grid-column: 1 / 3; /* 从第1列到第3列 */

  /* 跨行 */
  grid-row: span 2; /* 跨越2行 */
}
```

## 响应式设计

### 媒体查询

```css
/* 移动端优先 */
.container {
  width: 100%;
  padding: 10px;
}

/* 平板 */
@media (min-width: 768px) {
  .container {
    max-width: 720px;
    margin: 0 auto;
  }
}

/* 桌面 */
@media (min-width: 1024px) {
  .container {
    max-width: 960px;
  }
}
```

### 响应式单位

```css
.responsive {
  /* 视口单位 */
  width: 100vw;
  height: 100vh;

  /* 相对单位 */
  font-size: 1rem; /* 相对于根元素 */
  padding: 2em;    /* 相对于当前元素 */

  /* 百分比 */
  width: 50%;

  /* clamp() 函数 */
  font-size: clamp(1rem, 2vw, 2rem);
}
```

## CSS 变量

```css
:root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --font-size-base: 16px;
  --spacing: 8px;
}

.button {
  background-color: var(--primary-color);
  padding: calc(var(--spacing) * 2);
  font-size: var(--font-size-base);
}

/* 动态修改变量 */
.dark-theme {
  --primary-color: #2980b9;
}
```

## 常用技巧

### 居中对齐

```css
/* Flexbox 居中 */
.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Grid 居中 */
.grid-center {
  display: grid;
  place-items: center;
}

/* 绝对定位居中 */
.absolute-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

### 文本溢出处理

```css
/* 单行省略 */
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 多行省略 */
.multi-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

## 总结

CSS 核心知识点：

1. **选择器** - 精准选中目标元素
2. **盒模型** - 理解元素的尺寸计算
3. **Flexbox** - 一维布局利器
4. **Grid** - 二维布局方案
5. **响应式** - 适配不同屏幕
6. **CSS 变量** - 提高代码复用性

掌握这些基础，是成为前端开发者的必经之路。
