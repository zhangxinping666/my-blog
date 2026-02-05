---
title: JavaScript对象创建方式完全指南：从原始到现代的演进之路
link: createObject
catalog: true
date: 2025-01-05 10:00:00
description: JavaScript 对象创建的几种方法。
tags:
  - JavaScript
  - ES6
  - 对象
categories:
  - [前端, JavaScript]
---

## 前言

作为一名前端开发者，JavaScript 中对象创建是很重要。在 JavaScript 这门基于原型的语言中，对象几乎无处不在。今天，我将带领大家回顾 JavaScript 对象创建的 7 种方式，从最原始的字面量到现代的 ES6 class，每一步演进都解决了前一步的痛点，这就像是 JavaScript 语言设计的进化史。

## 对象字面量

最原始的创建方式。

### 代码示例

```javascript
// 使用字面量进行创建
// 通过字面量创建的对象，都会有原型开销，并且他们的原型都是指向Object.prototype
var Sheep = {
  name: "小羊",
  school: "青青草原",
  age: 18
}

// 验证原型链
const sheepPrototype = Object.getPrototypeOf(Sheep)
console.log(sheepPrototype === Object.prototype) // 输出: true
```

### 深入讲解

最初接触 JavaScript 时，对象字面量是我学会的第一种创建对象的方式。它的创建方式很直观，你需要什么属性就直接写什么属性。

**原型链解析：**
```javascript
// 深入理解字面量对象的原型
const myObj = { a: 1 }
console.log(myObj.__proto__ === Object.prototype) // true
console.log(myObj.hasOwnProperty('a')) // true - 来自Object.prototype
console.log(myObj.toString()) // "[object Object]" - 来自Object.prototype
```

### 优缺点分析

**优点：**
- 语法简洁直观，易于理解和使用
- 适合创建单个、独特的对象
- 创建速度快，无需额外的函数调用

**缺点：**
- 无法实现代码复用，每个对象都需要重新定义
- 不适合创建大量相似的对象
- 缺乏封装性，所有属性都是公开的

### 特点

对象字面量就像是"手工定制"，每个对象都是独一无二的艺术品。但当我需要创建 100 只羊时，难道要写 100 次相同的代码吗？这让我意识到，我们需要一种"批量生产"的方式。

## 工厂模式

批量生产的开始。

### 代码示例

```javascript
// 使用工厂模式创建对象 - 避免了new关键字，并且具有封装性
function Sheep(name, age) {
  if (name === '喜羊羊') {
    return { 
      name, 
      age, 
      feature: ['聪明'],
      eat: function() {
        console.log(`${this.name}在吃青草`)
      }
    }
  } else {
    return { 
      name, 
      age, 
      feature: ['贪吃鬼'],
      eat: function() {
        console.log(`${this.name}在吃零食`)
      }
    }
  }
}

const sheep1 = Sheep('喜羊羊', 3)
const sheep2 = Sheep('懒羊羊', 4)

// 类型检测问题
console.log(sheep1 instanceof Object); // true (所有对象都是Object的实例)
console.log(sheep1 instanceof Sheep);  // false! 无法识别具体类型
```

### 深入讲解

工厂模式是我第一次体会到"函数即工厂"的概念。把它想象成一个制造羊的工厂，你告诉工厂想要什么样的（参数），工厂就给你制造出来（返回对象）。这种模式能够根据不同的输入条件，创建不同特性的对象。

**方法重复问题演示：**
```javascript
function createSheep(name) {
  return {
    name: name,
    eat: function() { // 每次调用都创建新函数
      console.log('吃草')
    }
  }
}

const s1 = createSheep('羊1')
const s2 = createSheep('羊2')
console.log(s1.eat === s2.eat) // false - 方法没有复用！
```

### 优缺点分析

**优点：**
- 解决了代码复用问题，可以批量创建对象
- 可以根据参数动态决定对象的属性
- 隐藏了对象创建的细节，提供了一定的封装性

**缺点：**
- 无法识别对象的具体类型（都是 Object 的实例）
- 每个对象都包含相同的方法副本，造成内存浪费
- 没有利用原型链，无法实现真正的继承

### 核心特点与反思

工厂模式就像一个"代工厂"，能批量生产但产品上没有品牌标识。我开始思考：如何让创建的对象能够被识别出"出身"？这就引出了构造函数的概念。

## 构造函数模式

引入类型标识。

### 代码示例

```javascript
// 使用构造函数创建对象 - 使用new的好处是模板化、高效率、类型识别和封装
// 在构造函数中创建的方法在每次创建对象的时候，都会重新创建一次方法
function Sheep(name, age) {
  this.name = name;
  this.age = age;
  this.eat = function() {
    console.log(`${age}岁的${name}在吃草`)
  }
}

const sheep1 = new Sheep('喜羊羊', 3)
const sheep2 = new Sheep('沸羊羊', 4)

// 类型识别成功
console.log(sheep1 instanceof Sheep) // true
console.log(sheep1.constructor === Sheep) // true

// 但方法依然没有复用
console.log(sheep1.eat === sheep2.eat) // false - 每个实例都有独立的eat方法
```

### 深入讲解

构造函数让我第一次感受到 JavaScript 中"类"的概念（虽然 ES6 之前没有真正的类）。通过 new 关键字，仿佛在说："请按照这个蓝图（构造函数）给我制造一个对象"。new 操作符背后发生了什么？

**new 操作符的内部机制：**
```javascript
// new操作符的模拟实现
function myNew(Constructor, ...args) {
  // 1. 创建一个新对象
  const obj = {}
  
  // 2. 将新对象的原型指向构造函数的prototype
  obj.__proto__ = Constructor.prototype
  
  // 3. 将构造函数的this绑定到新对象上并执行
  const result = Constructor.apply(obj, args)
  
  // 4. 如果构造函数返回对象，则返回该对象；否则返回新创建的对象
  return result instanceof Object ? result : obj
}

// 使用示例
const mySheep = myNew(Sheep, '美羊羊', 3)
console.log(mySheep instanceof Sheep) // true
```

**解决方法重复的尝试：**
```javascript
// 解决办法：将方法绑定到构造函数的原型上
function Sheep(name, age) {
  this.name = name;
  this.age = age;
}

Sheep.prototype.eat = function() {
  console.log(`${this.age}岁的${this.name}在吃草`)
}

const sheep1 = new Sheep('喜羊羊', 3)
const sheep2 = new Sheep('沸羊羊', 4)
console.log(sheep1.eat === sheep2.eat) // true - 方法复用成功！
```

### 优缺点分析

**优点：**
- 解决了对象类型识别问题（instanceof 可以正确判断）
- 代码结构更清晰，符合面向对象的思维
- 可以通过 prototype 添加共享方法

**缺点：**
- 方法定义在构造函数内部时，每个实例都会创建方法的副本
- 内存利用率低，相同的方法被重复创建

### 核心特点与反思

构造函数就像给产品打上了"品牌标签"，但每个产品都自带了一套完整的"使用说明书"（方法），这显然是一种浪费。需要找到一种方式，让所有同类产品共享同一份"说明书"。

## 原型模式

共享的力量。

### 代码示例

```javascript
// 原型模式 - 所有属性和方法都定义在原型上
function Sheep() {}

// 所有属性和方法都定义在原型上
Sheep.prototype.name = '阳光中学';
Sheep.prototype.age = 3;
Sheep.prototype.feature = ['聪明'] // 引用类型属性
Sheep.prototype.eat = function() {
  console.log('我正在吃青春蛋糕~');
};

const sheep1 = new Sheep()
const sheep2 = new Sheep()

// 方法共享成功
console.log(sheep1.eat === sheep2.eat) // true

// 但引用类型属性共享带来了问题
sheep1.feature.push('玩游戏')
console.log(sheep2.feature) // ['聪明', '玩游戏'] - 意外修改了所有实例！
```

### 深入讲解

原型模式让我真正理解了 JavaScript 的精髓：原型链。把原型想象成一个"公共仓库"，所有实例都可以从这个仓库中获取方法和属性。这就像一个家族的"传家宝"，所有家族成员都能使用，但不能据为己有。

**原型链查找机制：**
```javascript
// 深入理解原型链查找
const s = new Sheep()

// 属性查找顺序演示
console.log(s.hasOwnProperty('name')) // false - name不是实例自有属性
console.log('name' in s) // true - 但能通过原型链找到

// 原型链：s -> Sheep.prototype -> Object.prototype -> null
console.log(s.__proto__ === Sheep.prototype) // true
console.log(Sheep.prototype.__proto__ === Object.prototype) // true
console.log(Object.prototype.__proto__ === null) // true
```

### 优缺点分析

**优点：**
- 完美解决了方法共享问题，内存利用率高
- 原型链机制支持属性和方法的查找
- 所有实例共享原型上的属性和方法

**缺点：**
- 引用类型的属性被所有实例共享，容易造成意外修改
- 无法在创建实例时传递初始化参数
- 所有实例的属性初始值都相同

### 核心特点与反思

纯原型模式就像"共产主义"，所有资源都是共享的。有些东西（比如个人名字）应该是私有的，有些东西（比如吃饭的方法）可以是共享的。这让我意识到，我需要一种"混合经济体制"。

## 组合模式

完美的平衡。

### 代码示例

```javascript
// 组合模式(构造函数+原型) - ES6 class出现之前的最佳实践
// 独立属性+通用方法
function Sheep(name, age) {
  // 实例属性 - 每个实例独有
  this.name = name;
  this.age = age;
  this.friends = []; // 引用类型也是独有的
}

// 共享方法 - 定义在原型上
Sheep.prototype.eat = function() {
  console.log(`${this.age}岁的${this.name}在吃草`)
}

Sheep.prototype.addFriend = function(friendName) {
  this.friends.push(friendName)
}

const sheep1 = new Sheep('喜羊羊', 3)
const sheep2 = new Sheep('沸羊羊', 4)

// 验证方法共享
console.log(sheep1.eat === sheep2.eat) // true

// 验证属性独立
sheep1.addFriend('美羊羊')
console.log(sheep1.friends) // ['美羊羊']
console.log(sheep2.friends) // [] - 不受影响
```

### 深入讲解

组合模式是最优雅的解决方案（在 ES6 之前）。它采用了"各司其职"的策略：构造函数负责定义实例属性（每个对象的"个性"），原型负责定义方法（所有对象的"共性"）。这就像现代社会的分工合作，效率最高。

**深入理解组合模式的优势：**
```javascript
// 组合模式的灵活性展示
function Animal(type) {
  this.type = type;
  this.energy = 100;
}

// 可以动态添加原型方法
Animal.prototype.sleep = function() {
  this.energy += 20;
  console.log(`${this.type}睡觉后，能量恢复到${this.energy}`)
}

// 可以覆盖原型方法
Animal.prototype.toString = function() {
  return `[Animal: ${this.type}]`
}

const cat = new Animal('猫')
console.log(cat.toString()) // [Animal: 猫]
```

### 优缺点分析

**优点：**
- 完美解决了共享和独立的平衡问题
- 每个实例有自己的属性副本，方法则共享
- 支持向构造函数传递参数
- 是 ES6 class 出现之前的最佳实践

**缺点：**
- 需要分别管理构造函数和原型
- 代码分散在两个地方，不够聚合

### 核心特点与反思

组合模式让我理解了"取长补短"的智慧。它就像一个成熟的企业：有私有财产（实例属性），也有公共设施（原型方法）。但我还在想，有没有更灵活的方式来控制对象的创建和继承？

## Object.create()

精确控制原型链。

### 代码示例

```javascript
// Object.create() - 可以显式指定原型对象

// 示例1：显式指定原型
const Sheep = {
  name: '喜羊羊',
  eat: function() {
    console.log('我爱吃饭')
  }
}

const sheep = Object.create(Sheep)
sheep.name = '懒羊羊' // 覆盖原型上的name
console.log(sheep.name) // 懒羊羊
console.log(Object.getPrototypeOf(sheep) === Sheep); // true

// 示例2：创建无原型对象 - Object.prototype也不继承
const sheep1 = Object.create(null);
const sheep2 = {};

// 检查原型
console.log(Object.getPrototypeOf(sheep1)); // null
console.log(Object.getPrototypeOf(sheep2)); // [Object: null prototype] {} (即Object.prototype)

// 尝试调用基础方法
console.log(typeof sheep1.toString); // "undefined"
console.log(typeof sheep2.toString); // "function"

// 示例3：实现对象的浅克隆，保持原型链不变
function shallowClone(original) {
  const clone = Object.create(Object.getPrototypeOf(original));
  Object.assign(clone, original);
  return clone;
}

// 克隆无原型对象
const sheep1 = Object.create(null);
sheep1.name = '喜羊羊';

const clonedSheep1 = shallowClone(sheep1);
console.log(clonedSheep1.name); // 喜羊羊
console.log(clonedSheep1 === sheep1); // false
console.log(Object.getPrototypeOf(clonedSheep1)); // null
console.log(typeof clonedSheep1.toString); // undefined

// 克隆标准对象
const sheep2 = {};
sheep2.name = '懒羊羊';

const clonedSheep2 = shallowClone(sheep2);
console.log(clonedSheep2.name); // 懒羊羊
console.log(clonedSheep2 === sheep2); // false - 是一个全新的、独立的对象
console.log(Object.getPrototypeOf(clonedSheep2) === Object.prototype); // true
console.log(typeof clonedSheep2.toString); // function
```

### 深入讲解

Object.create()对原型链的"完全掌控"。能够精确地指定一个对象的原型，甚至可以创建一个"无根之木"（没有原型的对象）。

**Object.create()的高级用法：**
```javascript
// 使用第二个参数定义属性描述符
const sheepPrototype = { eat: function() { console.log('吃草') } }
const animal = Object.create(sheepPrototype, {
  age: {
    value: 3,
    writable: true,
    enumerable: true,
    configurable: true
  },
  id: {
    value: Math.random(),
    writable: false, // 只读属性
    enumerable: false // 不可枚举
  }
})

console.log(animal.age) // 3
animal.age = 4 // 可以修改
console.log(animal.age) // 4

animal.id = 999 // 尝试修改只读属性
console.log(animal.id) // 仍然是原来的随机数

// 枚举测试
for(let key in animal) {
  console.log(key) // 只会打印age和原型上的属性，不会打印id
}
```

### 优缺点分析

**优点：**
- 提供了对原型链的精确控制
- 可以创建真正的"纯净"对象（无原型）
- 支持属性描述符，可以定义只读、不可枚举等特性
- 是实现继承的底层机制

**缺点：**
- 语法相对复杂，不够直观
- 需要手动设置构造函数
- 对于简单场景来说过于底层

### 核心特点与反思

Object.create()就像是对象创建的"原子操作"，它让我看到了 JavaScript 对象系统的底层机制。但对于日常开发，希望有更简洁、更符合传统 OOP 思维的语法。

## ES6 Class

现代化的语法糖。

### 代码示例

```javascript
// ES6 Class - class中定义的方法，不是绑定到构造函数本身，
// 而是被自动添加到了构造函数的prototype(原型)对象上
class Sheep {
  constructor(name, age) {
    // 实例属性
    this.name = name;
    this.age = age;
    this.friends = [];
  }
  
  // 实例方法 - 自动添加到prototype
  sayHello() {
    console.log(`Hello, my name is ${this.name}`);
  }
  
  eat() {
    console.log(`${this.name}在吃草`);
  }
  
  addFriend(friend) {
    this.friends.push(friend);
  }
  
  // 静态方法
  static compare(sheep1, sheep2) {
    return sheep1.age - sheep2.age;
  }
  
  // getter
  get info() {
    return `${this.name} (${this.age}岁)`;
  }
  
  // setter
  set info(value) {
    [this.name, this.age] = value.split(',');
  }
}

// 使用
const sheep1 = new Sheep('喜羊羊', 3);
const sheep2 = new Sheep('美羊羊', 2);

// 验证方法共享
console.log(sheep1.sayHello === sheep2.sayHello); // true

// 使用静态方法
console.log(Sheep.compare(sheep1, sheep2)); // 1

// 使用getter/setter
console.log(sheep1.info); // 喜羊羊 (3岁)
sheep1.info = '懒羊羊,5';
console.log(sheep1.name); // 懒羊羊
console.log(sheep1.age); // "5"
```

### 深入讲解

ES6 Class 它本质上还是基于原型的，但语法上更接近传统的面向对象语言。把它理解为一个"语法糖"，背后还是我们熟悉的原型机制。

**Class 本质的揭示：**
```javascript
// Class本质上还是函数
console.log(typeof Sheep) // "function"

// Class定义的方法在prototype上
console.log(Sheep.prototype.sayHello) // [Function: sayHello]

// 用传统方式实现同样的效果
function TraditionalSheep(name, age) {
  this.name = name;
  this.age = age;
}

TraditionalSheep.prototype.sayHello = function() {
  console.log(`Hello, my name is ${this.name}`);
};

// 验证：方法不属于实例的自有属性，而是在prototype上
const sheep = new Sheep("喜羊羊", 2)
console.log(sheep.hasOwnProperty('sayHello')); // false
console.log(sheep.__proto__.hasOwnProperty('sayHello')); // true
```

**Class 的高级特性：**
```javascript
// 继承
class SmartSheep extends Sheep {
  constructor(name, age, iq) {
    super(name, age); // 调用父类构造函数
    this.iq = iq;
  }
  
  // 方法重写
  eat() {
    super.eat(); // 调用父类方法
    console.log('...一边吃一边思考');
  }
  
  // 新方法
  solve() {
    console.log(`${this.name}解决了问题！`);
  }
}

const smartSheep = new SmartSheep('喜羊羊', 3, 150);
smartSheep.eat(); 
// 喜羊羊在吃草
// ...一边吃一边思考
```

### 优缺点分析

**优点：**
- 语法清晰、简洁、易于理解
- 更好的代码组织，所有相关代码在一个地方
- 原生支持继承、静态方法、getter/setter
- 符合其他编程语言的 OOP 习惯

**缺点：**
- 本质还是原型，可能给其他语言背景的开发者造成误解
- 不支持私有属性（虽然有提案）
- 必须使用 new 调用（不像普通函数那样灵活）

### 核心特点与反思

ES6 Class 就像给 JavaScript 穿上了一件"现代化的外衣"，让它看起来更像 Java 或 C++。这件外衣下面，还是 JavaScript 独特的原型链机制。理解这一点，对深入掌握 JavaScript 至关重要。

## 总结

| 创建方式 | 代码复用 | 类型识别 | 内存效率 | 参数传递 | 继承支持 | 语法复杂度 | 适用场景 |
|---------|---------|---------|---------|---------|---------|-----------|---------|
| 对象字面量 | ✗ | ✗ | ✓ | ✗ | ✗ | 简单 | 创建单个对象 |
| 工厂模式 | ✓ | ✗ | ✗ | ✓ | ✗ | 简单 | 批量创建相似对象 |
| 构造函数 | ✓ | ✓ | ✗ | ✓ | 部分 | 中等 | 需要类型识别的场景 |
| 原型模式 | ✓ | ✓ | ✓ | ✗ | ✓ | 中等 | 方法共享为主的场景 |
| 组合模式 | ✓ | ✓ | ✓ | ✓ | ✓ | 中等 | ES5 最佳实践 |
| Object.create | ✓ | 部分 | ✓ | 部分 | ✓ | 复杂 | 需要精确控制原型链 |
| ES6 Class | ✓ | ✓ | ✓ | ✓ | ✓ | 简单 | 现代 JavaScript 开发 |



通过这 7 种对象创建方式的学习，深刻理解了 JavaScript 语言设计的演进。每一种方式都有其存在的价值和适用场景。作为开发者，我们不应该盲目追求"最新"或"最好"，而应该根据实际需求选择最合适的方案。