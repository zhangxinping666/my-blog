---
title: JavaScript ：从基础语法到 DOM/BOM 进阶（完整版）
link: js-basics
catalog: true
date: 2026-02-06 18:30:00
description: 本文为 JavaScript 基础与进阶笔记的完全合集，涵盖书写方式、数据类型、函数对象、DOM 树操作、事件流、BOM 对象及本地存储等全部细节。
tags:
  - JavaScript
  - DOM
  - BOM
  - 编程基础
categories:
  - [前端, JavaScript]
---

## 第一部分：JavaScript 基础语法

### js 的三种书写方式

**行内：**

```html
<body>
  <button onclick="alert('行内')"></button>
</body>
```

**内部：**

```html
<body>
  <script>
    alert("内部");
  </script>
</body>
```

**外部：**
外部 js 标签中间不能书写东西

```html
<body>
  <script src="./01.js.html"></script>
</body>
```

### js 的输入输出

**输入语法：**
页面打印：
`document.write('页面打印')`
​[编辑]​
控制台打印：
`console.log('控制台打印')`
​[编辑]​
弹出界面：
`console.log('控制台打印')`
​[编辑]​

**输入语法：**
`prompt('请输入信息')`
​[编辑]​

### 注释

**单行注释：**
`//我是单行注释`
**多行注释：**
`/*我是多行注释*/`

### 变量

变量是用来储存数据的容器，简单理解就是一个盒子

```javascript
//声明并赋值一个年龄变量
let age = 18;
//输出
alert(age);
//声明一个年龄变量
let age;
//赋值
age = 18;
//输出
alert(age);
```

### 数组

**定义数组：**
`let arr = [1, 2, 3, 4, 5];console.log(arr); // 输出 [1, 2, 3, 4, 5]`

**数组的增删改查：**

- **增加元素：**
  - `push ( )` 向数组的末尾添加一个或多个元素
    `const arr = [1, 2, 3]; arr.push(4);console.log(arr); // 输出 [1, 2, 3, 4]`
  - `unshift ( )` 向数组的开头添加一个或多个元素
    `const arr = [1, 2, 3]; arr.unshift(0);console.log(arr); // 输出 [0, 1, 2, 3]`
  - `splice ( )` 可以在任意位置插入元素，并且可以同时删除元素。
    `const arr = [1, 2, 3]; arr.splice(1, 0, 1.5); // 在索引1的位置插入1.5console.log(arr); // 输出 [1, 1.5, 2, 3]`

- **删除元素：**
  - `pop()` 从数组的末尾移除一个元素，并返回该元素
    `const arr = [1, 2, 3];const removed = arr.pop();console.log(arr); // 输出 [1, 2]console.log(removed); // 输出 3`
  - `shift()` 从数组的开头移除一个元素，并返回该元素。
    `const arr = [1, 2, 3];const removed = arr.shift();console.log(arr); // 输出 [2, 3]console.log(removed); // 输出 1`
  - `splice()` 可以从数组中删除元素，并且可以同时插入元素。
    `const arr = [1, 2, 3, 4, 5]; arr.splice(1, 2); // 从索引1开始删除2个元素console.log(arr); // 输出 [1, 4, 5]`

- **修改元素：**
  - 可以直接通过索引访问和修改数组中的元素
    `const arr = [1, 2, 3]; arr[1] = 2.5;console.log(arr); // 输出 [1, 2.5, 3]`
- **查询元素：**
  - 返回数组中某个元素第一次出现的位置索引，如果不存在则返回-1
    `const arr = [1, 2, 3, 2, 4];const index = arr.indexOf(2);console.log(index); // 输出 1`

### 数据类型

**基本数据类型：**
基本数据类型是值类型，它们直接存储在栈内存中，而不是通过引用访问。当赋值给另一个变量时，复制的是具体的值，而不是引用。

1. **number**: 表示数值，包括整数和浮点数。 `let num = 42;`
2. **string**: 表示文本字符串。 `let str = "Hello, world!";`
3. **boolean**: 表示逻辑值，只有 true 和 false 两个值。 `let flag = true;`
4. **undifined**: 表示尚未赋值的变量或函数返回的未定义值。 `let x;console.log(x); // 输出 undefined`
5. **null**: 表示空值或空对象指针。 `let nothing = null;`

**引用数据类型：**

1. **对象**: 对象是键值对的集合，是最常用的复合数据类型之一。对象可以包含属性（键值对）和方法（函数）。
   `let person = { name: "Alice", age: 30, sayHello: function() { console.log("Hello, my name is " + this.name); } };`
2. **数组**: 数组是一种特殊的对象，用于存储有序的元素列表。数组的元素可以是任何类型的数据。
   `let numbers = [1, 2, 3, 4, 5];let mixed = ["apple", 42, true, {name: "Alice"}];console.log(numbers[0]); // 输出 1console.log(mixed[3].name); // 输出 "Alice"`
3. **函数**: 函数也是一种对象，可以作为值进行传递，并且可以作为对象的属性或方法。
   `function greet(name) { console.log("Hello, " + name + "!"); }`

### 数据转换

**隐式转换：**

```javascript
console.log(11 + 11); //number
console.log("11" + 11); //string
console.log("111"); //string
console.log(+"123"); //number
console.log(+"123" + 132); //number
```

**显示转换：**

```javascript
let str = "123";
let num = Number(str); //number
let num1 = +str; //number
let num = 123;
let str = String(num); //string
let str1 = num.toStrign(); //string
```

### 运算符

**算数运算符：**
| 运算符 | 描述 | 示例 |
| :--- | :--- | :--- |
| + | 加法 | 5 + 3 |
| - | 减法 | 5 - 3 |
| _ | 乘法 | 5 _ 3 |
| / | 除法 | 5 / 3 |
| % | 取模（求余数） | 5 % 3 |
| ** | 幂运算（次方） | 2 ** 3 |

**比较运算符：**
| 运算符 | 描述 | 示例 |
| :--- | :--- | :--- |
| == | 等于（值相等即可） | 5 == "5" |
| === | 严格等于（值和类型都相等） | 5 === "5" |
| != | 不等于 | 5 != 3 |
| !== | 严格不等于 | 5 !== "5" |
| < | 小于 | 5 < 3 |
| > | 大于 | 5 > 3 |
| <= | 小于等于 | 5 <= 5 |
| >= | 大于等于 | 5 >= 5 |

**逻辑运算符：**
| 运算符 | 描述 | 示例 |
| :--- | :--- | :--- |
| && | 逻辑与（AND） | true && false |
| || | 逻辑或（OR) | true && false |
| ! | 逻辑非（NOT） | !true |

**一元运算符：**
| 符号 | 描述 | 示例 |
| :--- | :--- | :--- |
| ++ | 前置/后置自增 | ++x 或 x++ |
| -- | 前置/后置自减 | --x 或 x-- |
| + | 正号（强制转换为数字） | +5 |
| - | 负号（取反） | -5 |
| ! | 逻辑非 | !true |
| typeof | 获取变量的类型 | typeof x |
| delete | 删除对象的属性 | delete obj.prop |

### 函数

**函数声明：**
`function greet(name) { console.log("Hello, " + name + "!"); }`
**函数表达式：**
`const greet = function(name) { console.log("Hello, " + name + "!"); };`
**立即执行表达式：**
`(function(name) { console.log("Hello, " + name + "!"); })("Charlie");`
**箭头函数：**
`const greet = (name) => { console.log("Hello, " + name + "!"); };`

### 对象

**对象的创建：**
使用字面量方式创建：

```javascript
//定义对象
let obj = {
  name: "阿伟",
  age: 12,
  phone: 12323232323,
};
console.log(obj);
```

使用构造函数创建：
`const person = new Object(); person.name = "Bob"; person.age = 25;`

**对象增删改查：**

- **增加属性：**
  使用标点： `const person = {}; person.name = "Alice"; person.age = 30;`
  使用括号： `const person = {}; person["name"] = "Alice"; person["age"] = 30;`
- **修改属性：**
  `const person = { name: "Alice", age: 30 }; person.age = 31;`
- **删除属性：**
  `const person = { name: "Alice", age: 30 }; delete person.age;`
- **查找对象属性：**
  `Object.keys(person); // 输出 ["name", "age"]`
  `Object.values(person); // 输出 ["Alice", 30]`
  `Object.entries(person); // 输出 [["name", "Alice"], ["age", 30]]`
- **遍历对象：**

```javascript
const person = { name: "Alice", age: 30, city: "New York" };
for (const key in person) {
  if (person.hasOwnProperty(key)) {
    console.log(`${key}: ${person[key]}`);
  }
}
```

---

## 第二部分：JavaScript 进阶 DOM 与 BOM

### DOM

**概念：**
DOM（文档对象模型）是一种编程接口...[省略重复概念描述]...DOM 把文档视为树形结构。

**DOM 树节点：**

- 元素节点、属性节点、文本节点、注释节点、文档节点。

### 获取 dom 节点

**1. 获取 id 名的 dom 节点：**

```javascript
const divById = document.getElementById("my_div");
const divById_ = document.querySelector("#div");
divById.style.backgroundColor = "yellow";
```

**2. 获取 class 类名的 dom 节点:**

```javascript
const divsByClass = document.getElementsByClassName("div");
const divsByClass_ = document.querySelector(".div");
const divsByClass_all = document.querySelectorAll(".div");
divsByClass[0].style.backgroundColor = "lightblue";
```

**3. 获得 data-*为名的节点：**

```javascript
const one = document.querySelector("div");
console.log(one.dataset.id); //1
```

### 为 dom 节点添加删除切换 class 类

- `box.classList.add('active')`
- `box.classList.remove('active')`
- `box.classList.toggle('active')`

### 定时器

**延迟函数：**
`setTimeout(greet, 5000);`
`clearTimeout(timeoutId);`

### 事件监听

**1. 鼠标事件**
`click`, `dblclick`, `mousedown`, `mouseup`, `mousemove`, `mouseover`, `mouseout`, `mouseenter` (推荐), `mouseleave` (推荐)。
**2. 键盘事件**
`keydown`, `keyup`。
**3. 表单事件**
`submit`, `change`, `input`, `focus`, `blur`, `select`。

### 事件流

1. **捕获阶段**: 从 document 开始向下。
2. **目标阶段**: 事件到达目标。
3. **冒泡阶段**: 从目标向上。

**capture 参数：**
`addEventListener(..., ..., true)` 捕获阶段执行。
`addEventListener(..., ..., false)` 冒泡阶段执行。

**阻止冒泡：**
`e.stopPropagation()`

### 事件解绑

`button.onclick = null`
`button.removeEventListener('click', fu)`

### 阻止表单默认提交行为

`e.preventDefault()`

### 页面尺寸事件

- `scrollLeft` / `scrollTop`
- `offsetLeft` / `offsetTop`
- `clientWidth` / `clientHeight`
- `offsetWidth` / `offsetHeight`

### 日期对象

`const date = new Date()`
`getFullYear()`, `getMonth() + 1`, `getDate()`, `getDay()`。

### 时间戳

1. `Date.now()`
2. `+new Date()`
3. `date.getTime()`

### BOM

**定时器函数：**
`setInterval(sayHello, 2000);`
`clearInterval(intervalId);`

**location 对象：**
`location.href = '跳转地址'`
`location.reload()`

**history 对象：**
`history.back()` / `history.forward()`

**localStorage 对象：**
`localStorage.setItem('test', 'dom')`
`localStorage.getItem('test')`
