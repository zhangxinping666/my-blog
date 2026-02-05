---
title: JavaScript 基础
link: basics
catalog: true
date: 2025-01-05 10:00:00
description: JavaScript 语言的基础语法和核心概念介绍。
tags:
  - JavaScript
  - ES6
categories:
  - [前端, JavaScript]
---

JavaScript 是 Web 开发的核心语言。

## 变量声明

```javascript
// ES6+ 推荐使用 const 和 let
const name = '星光';
let count = 0;

// 避免使用 var
```

## 数据类型

- **基本类型**: string, number, boolean, null, undefined, symbol, bigint
- **引用类型**: object, array, function

## 函数

```javascript
// 箭头函数
const add = (a, b) => a + b;

// async/await
async function fetchData() {
  const res = await fetch('/api/data');
  return res.json();
}
```

## 常用数组方法

```javascript
const nums = [1, 2, 3, 4, 5];

nums.map(n => n * 2);      // [2, 4, 6, 8, 10]
nums.filter(n => n > 2);   // [3, 4, 5]
nums.reduce((a, b) => a + b, 0); // 15
```
