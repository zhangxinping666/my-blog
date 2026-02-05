---
title: HTML 基础
link: basics
catalog: true
date: 2025-01-05 11:00:00
description: HTML 标记语言的基础知识和常用标签介绍。
tags:
  - HTML
  - HTML5
categories:
  - [前端, HTML]
---

HTML 是网页的骨架，定义了内容的结构。

## 文档结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>页面标题</title>
</head>
<body>
  <!-- 内容 -->
</body>
</html>
```

## 常用标签

### 文本标签

```html
<h1>一级标题</h1>
<p>段落文本</p>
<span>行内文本</span>
<strong>加粗</strong>
<em>斜体</em>
```

### 列表

```html
<ul>
  <li>无序列表项</li>
</ul>

<ol>
  <li>有序列表项</li>
</ol>
```

### 表单

```html
<form action="/submit" method="POST">
  <input type="text" name="username" placeholder="用户名">
  <button type="submit">提交</button>
</form>
```

## 语义化标签

```html
<header>页头</header>
<nav>导航</nav>
<main>主要内容</main>
<article>文章</article>
<aside>侧边栏</aside>
<footer>页脚</footer>
```
