---
title: 浅拷贝深拷贝
link: copy
catalog: true
date: 2025-01-05 10:00:00
description: 深入理解 JavaScript 什么是浅拷贝, 什么是深拷贝。
tags:
  - JavaScript
  - ES6
categories:
  - [前端, JavaScript]
---

## 1. 什么是浅拷贝?
浅拷贝不存在于基本数据类型当中, 只存在于引用数据类型中

对于**基本类型**而言: 如 `String`,`Number`, `Boolean`, `null`, `undefined`, `Symbol`, `BigInt`。这些值存储在栈内存中。当你把一个基本类型的值赋给另一个变量时，你是在复制这个值。

```javascript
  let a = 10;
  let b = a; // 赋值a的值  
  b = 20;   
  console.log(a); // 10 (a 不受影响)
```

对于**引用类型**而言 : 主要是`Object`，包括`Array`、`Function`、`Date`、`RegExp` (正则) 等。这些值的内容存储在堆内存中，而变量本身（在栈中）只存储一个指向堆内存地址的引用（指针）。所以浅拷贝只是对第一层的复制, 对于深层的属性是引用

```js
const original = {
  name: "张三",
  age: 30,
  address: {
    city: "北京",
    street: "朝阳路"
  },
  skills: ["JavaScript", "HTML", "CSS"]
};

// 2. 使用扩展运算符创建一个浅拷贝
const shallowCopy = { ...original };//... 扩展运算符或 Object.assign() 都是浅拷贝。

console.log("---  1: 修改顶层的 '基本类型' ---");
// 我们修改浅拷贝的 name 属性
shallowCopy.name = "李四";
console.log("Original name:", original.name);     // 输出: "张三"
console.log("ShallowCopy name:", shallowCopy.name); // 输出: "李四"
// 结论: 顶层的基本类型是完全独立的。
console.log("\n---  2: 修改嵌套的 '对象' 属性 ---");
// 我们修改浅拷贝中 address 对象的 city 属性
shallowCopy.address.city = "上海";
console.log("Original city:", original.address.city);     // 输出: "上海" (被修改了！)
console.log("ShallowCopy city:", shallowCopy.address.city); // 输出: "上海"
```

## 2. 什么是深拷贝?
深拷贝就是创建一个全新的对象，这个新对象与原始对象完全独立，互不干扰。 深拷贝会递归地复制原始对象及其所有嵌套的子对象和数组，直到所有层级都是新创建的副本。
```js
 let obj1 = { name: 'Alice', details: { age: 25 } };
 let obj3 = deepCopy(obj1); // 假设 deepCopy 是一个深拷贝函数
 obj3.details.age = 30;  
 console.log(obj1.details.age); // 25 (obj1 保持不变)
```

## 3. 如何实现深拷贝？
### 3.1 JSON.parse(JSON.stringify(obj))
- JSON.stringify(obj): 将 JavaScript 对象序列化（转换）为一个 JSON 字符串。
- JSON.parse(...): 将这个 JSON 字符串解析回一个新的 JavaScript 对象。

```js
  let obj1 = {
    name: 'Alice',
    details: { age: 25 },
    skills: ['JS', 'CSS']
  };
  let obj2 = JSON.parse(JSON.stringify(obj1));
  obj2.details.age = 30;
  console.log(obj1.details.age); // 25 (未受影响)
```
**优点:** 能处理绝大多数纯数据对象（只包含对象、数组、字符串、数字、布尔值）

**缺点:** 
- 会丢失 undefined、Symbol、Function
- 无法处理循环引用
- 特殊对象会被转换 ( Date --> 日期字符串、RegExp -->{}、Map --> {}、Set --> {} 、NaN --> null、Infinity --> null )

### 3.2 structuredClone()
这是一个较新的、专门用于深拷贝的全局函数，现在已经被大多数现代浏览器和 Node.js 支持。
```js
  let obj1 = {
    name: 'Alice',
    joined: new Date(),
    skills: new Set(['JS', 'CSS']),
    metadata: new Map([['id', 123]])
  };

  let obj2 = structuredClone(obj1);

  obj2.skills.add('HTML');
  console.log(obj1.skills); // Set(2) { 'JS', 'CSS' } 
  console.log(obj2.joined === obj1.joined); // false 
```

**优点:** 能正确处理 Date, RegExp, Map, Set, ArrayBuffer, Blob, File 

**缺点:** 
- 无法克隆函数 
- 无法克隆原型链

### 3.3 使用第三方库 (Lodash)
```js
let obj1 = {
    name: 'Alice',
    details: { age: 25 },
    myFunc: () => console.log('hello')
  };
  let obj2 = _.cloneDeep(obj1);
  obj2.details.age = 30;
  console.log(obj1.details.age); // 25

  // Lodash 甚至可以（浅）复制函数
  console.log(obj1.myFunc === obj2.myFunc); // true (函数是浅复制的，这通常是期望行为)
```

**优点:** 相当健壮, 可以解决很多问题

**缺点:** 使用的时候需要为项目引入一个额外的库,增加了包的体积



### 3.4 自定义深拷贝
 * 支持基本类型 (string, number, boolean, null, undefined, symbol, bigint)。
 * 支持标准对象 ({}) 和数组 ([]).
 * 支持 Date, RegExp, Set, Map, ArrayBuffer, TypedArrays (如 Uint8Array)。
 * 正确处理循环引用 (使用 WeakMap)。
 * 保留原型链 (使用 Object.getPrototypeOf 和 Object.create)。
 * 复制 Symbol 属性 (使用 Reflect.ownKeys)。
 * 复制属性描述符 (enumerable, writable, configurable) 以及 getter 和 setter。

```js
function deepClone(value, cache = new WeakMap()) {
  // 1. 处理基本类型和函数
  if (value === null || typeof value !== 'object') {
    return value;
  }
  
  // 2. 处理循环引用
  if (cache.has(value)) {
    return cache.get(value);
  }
  
  // 3. 处理特定的引用类型 (这些类型有特殊的内部结构)
  // 3.1. 日期 (Date)
  if (value instanceof Date) {
    const copy = new Date(value.getTime());
    cache.set(value, copy); // 存入缓存
    return copy;
  }
  // 3.2. 正则表达式 (RegExp)
  if (value instanceof RegExp) {
    const copy = new RegExp(value.source, value.flags);
    cache.set(value, copy); // 存入缓存
    return copy;
  }
  // 3.3. Set
  if (value instanceof Set) {
    // 重要：必须先创建空 Set 并立即存入缓存
    const copy = new Set();
    cache.set(value, copy);
    // 然后再递归地克隆 Set 中的每一个值
    value.forEach(item => {
      copy.add(deepClone(item, cache));
    });
    return copy;
  }

  // 3.4. Map
  if (value instanceof Map) {
    // 重要：同 Set，必须先创建空 Map 并立即存入缓存
    const copy = new Map();
    cache.set(value, copy);
    // 然后再递归地克隆 Map 中的每一个键和值
    value.forEach((v, k) => {
      copy.set(deepClone(k, cache), deepClone(v, cache));
    });
    return copy;
  }
  // 3.5. 数组缓冲区 (ArrayBuffer)
  if (value instanceof ArrayBuffer) {
    const copy = value.slice(0); // ArrayBuffer.slice() 会创建新副本
    cache.set(value, copy);
    return copy;
  }
  // 3.6. 类型化数组 (TypedArrays, e.g., Uint8Array, Float64Array)
  if (ArrayBuffer.isView(value) && !(value instanceof DataView)) {
    const bufferCopy = deepClone(value.buffer, cache);
    const copy = new value.constructor(bufferCopy, value.byteOffset, value.length);
    cache.set(value, copy);
    return copy;
  }
  // 3.7. DataView
  if (value instanceof DataView) {
    const bufferCopy = deepClone(value.buffer, cache);
    const copy = new DataView(bufferCopy, value.byteOffset, value.byteLength);
    cache.set(value, copy);
    return copy;
  }
  
  // 4. 处理普通对象 ({}) 和数组 ([])
  // 4.1. 保留原型链
  const proto = Object.getPrototypeOf(value);
  // 4.2. 创建新容器（对象或数组）
  const copy = (Array.isArray(value)) ? [] : Object.create(proto);
  // 4.3.在遍历属性前，立即将新创建的容器存入缓存
  cache.set(value, copy);
  
  // 5. 遍历并复制所有自有属性 (包括 Symbol 和不可枚举属性)
  // 5.1. 使用 Reflect.ownKeys 获取所有类型的键
  const keys = Reflect.ownKeys(value);
  for (const key of keys) {
    // 5.2. 获取原始属性描述符
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor) continue;
    // 5.3. 复制属性描述符
    const newDescriptor = { ...descriptor };
    // 5.4. A: 如果是数据属性 (data property)，递归克隆其值
    if (newDescriptor.hasOwnProperty('value')) {
      newDescriptor.value = deepClone(newDescriptor.value, cache);
    }
    // 5.5. 将新属性和描述符定义到克隆体上
    try {
      Object.defineProperty(copy, key, newDescriptor);
    } catch (e) {
      // 在某些严格模式或特定情况下 (例如克隆只读属性)，defineProperty 可能会失败
      console.warn(`[deepClone] Could not define property "${String(key)}":`, e.message);
    }
  }
  return copy;
}
```















