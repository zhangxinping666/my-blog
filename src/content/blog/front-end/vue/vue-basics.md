---
title: Vue 详细讲解
link: vue-basics
catalog: true
date: 2025-01-25 15:25:22
description: 全量合并 JavaScript 与 Vue2 进阶笔记，严格保留所有原始代码、注释、心得及编辑占位符。
tags:
  - JavaScript
  - Vue2
  - 前端开发
categories:
  - [前端, Vue]
---

## 第一部分：JavaScript 基础

**js 的三种书写方式：**

行内：

```html
<body>
  <button onclick="alert('行内')"></button>
</body>
```

内部：

```html
<body>
  <script>
    alert("内部");
  </script>
</body>
```

外部：
外部 js 标签中间不能书写东西

```html
<body>
  <script src="./01.js.html"></script>
</body>
```

**js 的输入输出：**

输入语法：
页面打印：`document.write('页面打印')`

​编辑​

控制台打印：`console.log('控制台打印')`

​编辑​

弹出界面：`console.log('控制台打印')`

​编辑​

输入语法：`prompt('请输入信息')`

​编辑​

**注释：**
单行注释：`// 我是单行注释`

多行注释：`/* 我是多行注释 */`

**变量：**
变量是用来储存数据的容器，简单理解就是一个盒子。

```javascript
// 声明并赋值一个年龄变量
let age = 18;
// 输出
alert(age);

// 声明一个年龄变量
let age;
// 赋值
age = 18;
// 输出
alert(age);
```

**数组：**

定义数组：
`let arr = [1, 2, 3, 4, 5]; console.log(arr); // 输出 [1, 2, 3, 4, 5]`

数组的增删改查：

- **增加元素：**
- `push()` 向数组的末尾添加一个或多个元素。
- `unshift()` 向数组的开头添加一个或多个元素。
- `splice()` 可以在任意位置插入元素。

- **删除元素：**
- `pop()` 从数组末尾移除并返回。
- `shift()` 从数组开头移除并返回。
- `splice()` 从指定位置删除元素。

- **修改元素：**
  直接通过索引修改：`arr[1] = 2.5;`
- **查询元素：**
  `indexOf(元素)` 返回索引，不存在返回 -1。

**数据类型：**

基本数据类型（栈内存）：

1. **number**: 数值。
2. **string**: 字符串。
3. **boolean**: 布尔值（true/false）。
4. **undefined**: 未定义。
5. **null**: 空值。

引用数据类型（堆内存）：

1. **对象 (Object)**: 键值对集合。
2. **数组 (Array)**: 有序元素列表。
3. **函数 (Function)**: 可执行的代码块。

**数据转换：**

- **隐式转换：** `11 + '11'` 变字符串，`+'123'` 变数字。
- **显式转换：** `Number()`、`String()`、`Boolean()`。

**运算符：**
包括算数运算符（`+`, `-`, `*`, `/`, `%`, `**`）、比较运算符（`==`, `===`, `!=`, `!==`）和逻辑运算符（`&&`, `||`, `!`）。

**函数：**
包含函数声明、函数表达式、立即执行函数（IIFE）以及箭头函数。

**对象：**
创建对象可用字面量 `{}` 或 `new Object()`。支持属性的增（`obj.prop = val`）、删（`delete obj.prop`）、改、查（`Object.keys/values`）及 `for...in` 遍历。

---

## 第二部分：JavaScript 进阶 (DOM/BOM)

**DOM (Document Object Model)：**
DOM 将文档视为树形结构。

- **节点类型：** 元素节点、属性节点、文本节点、注释节点、文档节点。
- **获取节点：** `getElementById`、`getElementsByClassName`、`querySelector`、`querySelectorAll`。
- **自定义属性：** `data-*` 属性，通过 `element.dataset` 访问。

**操作 Class：**
使用 `classList` 方法：`add()`、`remove()`、`toggle()`、`contains()`。

**定时器：**

- `setTimeout` / `clearTimeout`: 延时执行一次。
- `setInterval` / `clearInterval`: 每隔一段时间执行。

**事件监听：**

1. **鼠标：** `click`, `mouseenter`, `mouseleave` (推荐，无冒泡)。
2. **键盘：** `keydown`, `keyup`。
3. **表单：** `submit`, `input`, `change`, `focus`, `blur`。

**事件流：**
经历捕获阶段、目标阶段、冒泡阶段。

- 阻止冒泡：`e.stopPropagation()`。
- 阻止默认行为：`e.preventDefault()`。

**页面尺寸与位置：**
`scroll` (滚动), `offset` (偏移), `client` (视口)。
​编辑

**日期与时间：**
`new Date()` 获取当前时间，支持获取年、月、日等。时间戳获取：`Date.now()` 或 `+new Date()`。
​编辑

**BOM (Browser Object Model)：**

- `location`: 地址栏操作（`href`, `reload`）。
- `history`: 历史记录（`back`, `forward`）。
- `localStorage`: 本地存储，持久化。

---

## 第三部分：Vue2 进阶篇

**组件基础：**
​编辑
组件由 `template` (结构)、`style` (样式)、`script` (逻辑) 组成。

- **Scoped:** `<style scoped>` 确保样式只作用于当前组件，防止污染。Vue 会通过 `data-v-xxxx` 属性来实现样式隔离。
- **Data:** 在组件中 `data` 必须是一个函数并 `return` 一个对象，确保每个实例维护独立的数据拷贝。
  ​编辑

**组件通信：**

1. **Props (父传子):** 父组件绑定属性，子组件通过 `props` 接收（支持数组、对象、校验）。
2. **$emit (子传父):** 子组件通过 `this.$emit('event', data)\` 触发，父组件监听该事件。
3. **EventBus:** 建立一个中央事件总线，实现非父子组件通信。
   ​编辑

**v-model 原理：**
`v-model` 是 `v-bind:value` 和 `v-on:input` 的语法糖。
​编辑

**.sync 修饰符：**
实现父子组件数据的“双向绑定”，本质是 `update:prop` 事件的简写。
​编辑

**Computed (计算属性) vs Watch (侦听器)：**

- **Computed:** 具有缓存性，依赖项不变不重新计算。支持 `getter` 和 `setter`。
- **Watch:** 监听数据变化执行回调，适合异步或开销较大的操作。支持 `deep: true` 深度监听。

**Vuex (Store) 核心：**

1. **State:** 存放共享数据。
2. **Mutations:** 同步修改 State 的唯一方式。
3. **Actions:** 处理异步逻辑，提交 Mutation。
4. **Getters:** 类似计算属性，对 State 进行加工。

**插槽 (Slot)：**

- **基本插槽:** `<slot></slot>`。
- **具名插槽:** `<slot name="header"></slot>`。
- **作用域插槽:** 子组件传数据给父组件展示。

**路由 (Vue Router)：**

- `router-link`: 导航链接。
- `router-view`: 路由组件显示出口。
- `params / query`: 路由传参。
- **重定向与守卫:** `redirect` 配置和 `beforeEach` 全局守卫。
  ​编辑

**自定义指令：**
使用 `Vue.directive` 或组件内 `directives` 定义。常用于操作 DOM（如 `v-focus`）。
