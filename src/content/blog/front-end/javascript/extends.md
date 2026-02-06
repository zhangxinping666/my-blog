---
title: JavaScript 继承详讲
link: extends
catalog: true
date: 2025-11-05 10:44:20
description: JavaScript继承详细讲解, 开启你的继承之旅。
tags:
  - JavaScript
  - ES6
  - 继承
categories:
  - [前端, JavaScript]
---

在 JavaScript 中，`继承`是非常核心重要的，今天我要和大家分享一下 JavaScript 中的继承都有那些，以及对应的一些优缺点。

## 原型链继承

原型链继承是 JavaScript 中实现继承的一种基本方式， 它利用原型机制让一个对象能够访问另一个对象的属性和方法。

原型链継承的`核心思想`是： 将父类的实例作为子类的原型对象，这样，子类实例就可以通过原型链访问父类的属性和方法

示例:

```js
function Animal(name) {
    this.name = name || 'Animal';
    this.colors = ['red', 'blue'];
}

Animal.prototype.sayName = function() {
    console.log('My name is ' + this.name);
};

function Cat() {
    this.type = 'cat';
}

Cat.prototype = new Animal();
Cat.prototype.constructor = Cat;

Cat.prototype.meow = function() {
    console.log('Meow!');

const cat1 = new Cat();
cat1.sayName();
cat1.meow();
```

为什么`constructor`要进行修复：

```js
const cat = new Cat();
console.log(cat.constructor === Animal); // true - 错误！
console.log(cat.constructor === Cat); // false - 不正确
```

### 原型链结构分析

cat1 (Cat 实例)
├── 自身属性: type = 'cat'
└── **proto** → Cat.prototype (Animal 实例)
├── constructor: Cat
├── meow: function
└── **proto** → Animal.prototype
├── constructor: Animal
├── sayName: function
└── **proto** → Object.prototype

### 原型链继承的特点

优点

1. 实现简单：代码简洁，易于理解
2. 纯粹的继承关系：子类是父类的实例，也是父类的子类的实例
3. 方法复用：父类方法可以被所有子类实例共享

缺点

1. 引用类型属性共享问题

```js
const cat1 = new Cat();
const cat2 = new Cat();

cat1.colors.push("green");
console.log(cat2.colors); // ['red', 'blue', 'green'] - 被影响了！
```

2. 无法向父类构造函数传参

```js
// 无法在创建Cat实例时给Animal传参
const cat = new Cat("Tom"); // 这里的参数无法传递给Animal
```

3. 无法实现多继承

```js
Child.prototype = new Parent1();
// 无法同时设置：Child.prototype = new Parent2();
```

验证继承关系的方法 :

```js
const cat = new Cat();

console.log(cat instanceof Cat); // true
console.log(cat instanceof Animal); // true
console.log(cat instanceof Object); // true

console.log(Cat.prototype.isPrototypeOf(cat)); // true
console.log(Animal.prototype.isPrototypeOf(cat)); // true
```

## 构造函数继承

构造函数继承（Constructor Inheritance）是 JavaScript 中实现继承的重要方式之一，它通过**在子类构造函数中调用父类构造函数**来实现继承。

在子类构造函数中，使用`call()`或`apply()`方法调用父类构造函数，将父类的属性和方法绑定到子类实例上：

```javascript
function Child() {
  Parent.call(this); // 关键步骤
  // 子类自己的属性初始化
}
```

### 示例

```javascript
function Animal(name) {
  this.name = name || "Animal";
  this.colors = ["red", "blue"];
  this.sayName = function () {
    console.log("My name is " + this.name);
  };
}

function Cat(name) {
  // 调用父类构造函数，继承属性
  Animal.call(this, name);
  this.type = "cat";
  this.meow = function () {
    console.log("Meow!");
  };
}

const cat1 = new Cat("Tom");
cat1.sayName();
cat1.meow();
```

### 构造函数继承的特点

**优点**

1. **解决引用类型共享问题**

```js
const cat1 = new Cat("Tom");
const cat2 = new Cat("Jerry");

cat1.colors.push("green");
console.log(cat1.colors); // ['red', 'blue', 'green']
console.log(cat2.colors); // ['red', 'blue'] - 互不影响
```

2. **支持向父类传递参数**

```js
function Cat(name) {
  Animal.call(this, name); // 传递name参数
  // ...
}
```

3. **可实现多继承**

```javascript
function FlyingAnimal() {
  this.canFly = true;
  this.fly = function () {
    console.log("Flying!");
  };
}

function Cat(name) {
  Animal.call(this, name);
  FlyingAnimal.call(this); // 多继承
  // ...
}
```

**缺点**

1. **无法继承父类原型上的方法**

```js
// 将方法定义在原型上
Animal.prototype.sayName = function () {
  console.log("My name is " + this.name);
};

const cat = new Cat("Tom");
cat.sayName(); // TypeError: cat.sayName is not a function
```

2. **方法无法复用**

每个实例都会创建自己的方法副本：

```javascript
const cat1 = new Cat();
const cat2 = new Cat();
console.log(cat1.sayName === cat2.sayName); // false
```

3. **无法使用 instanceof 检查继承关系**

```javascript
console.log(cat1 instanceof Animal); // false
```

## 组合继承

组合继承（Combination Inheritance）是 JavaScript 中最常用的继承模式，它结合了**原型链继承**和**构造函数继承**的优点，同时规避了它们的缺点。

### 核心概念

组合继承的核心思想是：

1. **使用构造函数继承**来继承父类的实例属性
2. **使用原型链继承**来继承父类的原型方法

### 实现步骤

```javascript
function Animal(name) {
  this.name = name || "Animal";
  this.colors = ["red", "blue"];
}
Animal.prototype.sayName = function () {
  console.log("My name is " + this.name);
};

function Cat(name, age) {
  Animal.call(this, name);
  this.age = age || 1;
  this.type = "cat";
}

Cat.prototype = new Animal();
// 7. 修复constructor指向
Cat.prototype.constructor = Cat;
Cat.prototype.meow = function () {
  console.log("Meow! I am " + this.age + " years old.");
};
```

### 组合继承的优势

**解决引用类型共享问题**

```javascript
const cat1 = new Cat("Tom", 2);
const cat2 = new Cat("Jerry", 1);

cat1.colors.push("green");
console.log(cat1.colors); // ['red', 'blue', 'green']
console.log(cat2.colors); // ['red', 'blue'] - 互不影响
```

**支持向父类传递参数**

```javascript
const cat = new Cat("Garfield", 5);
cat.sayName(); // "My name is Garfield"
```

**方法复用**

```javascript
console.log(cat1.sayName === cat2.sayName); // true (共享原型方法)
```

**正确的继承关系检查**

```javascript
console.log(cat1 instanceof Cat); // true
console.log(cat1 instanceof Animal); // true
console.log(cat1.constructor === Cat); // true
```

### 组合继承的缺点

**父类构造函数被调用两次**

```javascript
function Animal(name) {
  console.log("Animal constructor called");
  // ...
}

function Cat(name) {
  Animal.call(this, name); // 第一次调用
}

Cat.prototype = new Animal(); // 第二次调用
```

**原型对象上存在冗余属性**

```javascript
const cat = new Cat("Tom");
console.log(cat); // 实例自身有name和colors
console.log(Object.getPrototypeOf(cat)); // 原型上也有name和colors
```

## 原型式继承

原型式继承（Prototypal Inheritance）是一种不涉及构造函数的继承方式，它直接基于现有对象创建新对象，是 JavaScript 中最纯粹的面向对象继承方式。

原型式继承不关注构造函数，而是关注对象之间的关系。它的核心是：**创建一个新对象，并将一个已有的对象作为这个新对象的原型**。

### 示例

```js
const animalPrototype = {
  isAlive: true,
  colors: ["black", "white"],
  sayHello: function () {
    console.log(`Hello, I have ${this.colors.join(" and ")} fur.`);
  },
};

const cat1 = Object.create(animalPrototype);

cat1.name = "Tom";
cat1.age = 2;

cat1.sayHello();

console.log(cat1.isAlive);

console.log(cat1.name);
```

### 原型式继承的特点

**优点**

1. **更符合原型本质**：它完美地体现了 JavaScript 的原型思想——任何对象都可以是另一个对象的原型，而无需“类”作为中介。
2. **语法简单直接**：一行 `Object.create()` 即可建立继承关系，非常清晰。
3. **可以继承普通对象**：继承的来源可以是一个简单的字面量对象，而不仅限于构造函数的实例。

**缺点**

1. **引用类型属性共享问题**：这是它与“原型链继承”共有的致命弱点。所有继承自同一个原型的实例，都会共享原型上的引用类型属性。如果一个实例修改了该属性，会影响到所有其他实例。

   ```js
   const cat2 = Object.create(animalPrototype);

   cat1.colors.push("yellow");

   // cat2 的 colors 属性也受到了影响
   console.log(cat2.colors); // 输出: ['black', 'white', 'yellow']
   ```

2. **属性初始化复杂**：由于没有构造函数来统一处理初始化，每创建一个新对象后，都需要手动为其添加新的实例属性（如 `cat1.name = 'Tom'`），如果属性多，会比较繁琐。

## 寄生式继承

寄生式继承（Parasitic Inheritance）是 JavaScript 中一种特殊的继承模式，它基于原型式继承，通过"寄生"的方式增强对象的功能。

### 核心概念

寄生式继承的核心思想是：

1. **基于现有对象创建新对象**（使用原型式继承）
2. **增强新对象的功能**（添加新属性和方法）
3. **返回增强后的对象**

### 基本实现

```js
function createEnhancedObject(original) {
  const clone = Object.create(original);
  clone.sayHello = function () {
    console.log("Hello, I am " + this.name);
  };

  return clone;
}
// 使用示例
const person = {
  name: "John",
  age: 30,
};

const enhancedPerson = createEnhancedObject(person);
enhancedPerson.sayHello();
console.log(enhancedPerson.age);
```

### 寄生式继承的优缺点

**优点**

1. **简单灵活**：不需要定义构造函数
2. **功能增强**：可以自由添加新功能
3. **对象定制**：每个对象可以有独特的增强
4. **兼容性好**：适用于各种 JavaScript 环境
   **缺点**

5. **方法无法复用**

```javascript
const obj1 = createEnhancedObject({});
const obj2 = createEnhancedObject({});
console.log(obj1.sayHello === obj2.sayHello); // false
```

2. **引用类型共享问题**

```javascript
const original = { list: [1] };
const obj1 = createEnhancedObject(original);
obj1.list.push(2);
const obj2 = createEnhancedObject(original);
console.log(obj2.list); // [1, 2]
```

3. **无法使用 instanceof 检查类型**

```javascript
console.log(enhancedPerson instanceof Object); // true
// 但无法检查是否是特定"类型"
```

## 寄生组合式继承

寄生组合式继承（Parasitic Combination Inheritance）是 JavaScript 中最完善的继承模式，它结合了**构造函数继承**和**原型链继承**的优点，同时完美规避了它们的缺点。

### 核心概念

寄生组合式继承的核心思想是：

1. **使用构造函数继承**来继承父类的实例属性
2. **使用寄生式继承**来继承父类的原型方法
3. **避免调用父类构造函数两次**（解决组合继承的主要缺点）

### 示例

```javascript
function Animal(name) {
  this.name = name || "Animal";
  this.colors = ["red", "blue"];
}

Animal.prototype.sayName = function () {
  console.log("My name is " + this.name);
};

function Cat(name, age) {
  Animal.call(this, name);

  this.age = age || 1;
  this.type = "cat";
}

Cat.prototype = new Animal();
Cat.prototype.constructor = Cat;

Cat.prototype.meow = function () {
  console.log("Meow! I am " + this.age + " years old.");
};
```

### 寄生组合式继承的优势

**解决引用类型共享问题**

```javascript
const cat1 = new Cat("Tom", 2);
const cat2 = new Cat("Jerry", 1);

cat1.colors.push("green");
console.log(cat1.colors); // ['red', 'blue', 'green']
console.log(cat2.colors); // ['red', 'blue'] - 互不影响
```

**支持向父类传递参数**

```javascript
const cat = new Cat("Garfield", 5);
cat.sayName(); // "My name is Garfield"
```

**方法复用**

```javascript
console.log(cat1.sayName === cat2.sayName); // true (共享原型方法)
```

**正确的继承关系检查**

```javascript
console.log(cat1 instanceof Cat); // true
console.log(cat1 instanceof Animal); // true
console.log(cat1.constructor === Cat); // true
```

### 寄生组合式继承的缺点

**父类构造函数被调用两次**

```javascript
function Animal(name) {
  console.log("Animal constructor called");
  // ...
}

function Cat(name) {
  Animal.call(this, name); // 第一次调用
}

Cat.prototype = new Animal(); // 第二次调用
```

**原型对象上存在冗余属性**

```javascript
const cat = new Cat("Tom");
console.log(cat); // 实例自身有name和colors
console.log(Object.getPrototypeOf(cat)); // 原型上也有name和colors
```

## Class 继承

`class` 语法是 JavaScript 现有原型继承模型的“语法糖”（Syntactic Sugar）。它并没有引入新的继承机制，而是提供了一套更清晰、更简洁的语法来操作原型和构造函数。
ES6 Class 继承的核心思想是：使用 `extends` 关键字来实现类之间的继承关系。它极大地简化了继承的写法，并解决了传统原型链继承的一些痛点。

### 示例

```js
class Animal {
  constructor(name) {
    this.name = name || "Animal";
    this.colors = ["red", "blue"];
  }
  sayName() {
    console.log("My name is " + this.name);
  }
}
class Cat extends Animal {
  constructor(name, type) {
    super(name);
    this.type = type || "cat";
  }
  meow() {
    console.log("Meow!");
  }
}
const cat1 = new Cat("Tom", "橘猫");
cat1.sayName();
cat1.meow();
console.log(cat1.name);
console.log(cat1.type);
```

### Class 继承的特点

**优点**

1. **语法清晰，符合直觉**：`class` 和 `extends` 的写法让代码更易于阅读和理解，对有其他面向对象语言（如 Java、C++、Python）背景的开发者非常友好。
2. **解决了原型链继承的核心痛点**：
   - **完美解决引用属性共享问题**：父类的实例属性（如 `this.colors`）是在子类 `constructor` 中通过 `super()` 调用时才创建的，每个子类实例都有自己的一份，互不影响。
     ```js
     const cat1 = new Cat("Tom");
     const cat2 = new Cat("Jerry");

     cat1.colors.push("green");

     console.log(cat1.colors); // ['red', 'blue', 'green']
     console.log(cat2.colors); // ['red', 'blue'] - 未受影响！
     ```

3. **内置 `super` 关键字**：`super` 提供了简洁的方式来调用父类的构造函数和方法，代码更健壮。
4. **类内部默认使用严格模式**：`class` 和模块的内部，默认就是严格模式 (`'use strict'`)，所以不需要再显式声明，有助于编写更规范、更安全的代码。

**缺点**

1. **并非新的继承机制**：它本质上还是原型继承，对于不了解原型机制的开发者来说，可能会对一些底层行为感到困惑。它是一个强大的“语法糖”，但不是一个全新的模型。
2. **兼容性问题**：`class` 语法是 ES6 (2015 年) 的标准，在一些非常老旧的浏览器（如 IE11）上不支持。但在现代前端开发中，通常会使用 Babel 等工具将其转换为 ES5 兼容的代码，所以这已经不是一个主要障碍。
