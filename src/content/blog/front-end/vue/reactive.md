---
title: Vue 响应式原理深度解析：从 Vue 2 到 Vue 3
link: reactive
catalog: true
date: 2025-11-05 17:30:00
description: Vue的响应式原理。
tags:
  - Vue2
  - Vue3
categories:
  - [前端, Vue]
---

---

想必大家在学习 Vue 的时候都会有这样的疑问：在学习原生 JavaScript 时，不论修改什么内容，通常只有在页面刷新时值才会更新。但在 Vue 项目中，数据变化却能实现页面的**实时更新**。这就是 Vue 的核心特性——**响应式数据更新**。

---

## Vue 2 响应式原理

### 核心实现：Object.defineProperty()

Vue 2 通过 `Object.defineProperty()` 来实现响应式。当你创建一个 Vue 实例并将数据添加到 `data` 选项中时，Vue 会遍历这些数据，并使用 `Object.defineProperty()` 为每个属性添加 **getter** 和 **setter**。

* **Getter**: 用于追踪依赖（依赖收集）。
* **Setter**: 用于在属性被修改时通知变更。

### 中枢神经：Watcher

`Watcher` 是 Vue 2 响应式系统的核心，扮演着中枢神经的角色，承担三大核心职责：

1. **收集依赖**：记录哪些组件用到了这个数据。
2. **变更检测**：感知数据的变化。
3. **更新调度**：通知视图进行重新渲染。

### 局限性：无法检测数组和对象的新增

Vue 2 **不能**检测到通过索引直接修改数组或动态添加对象属性的变化。

* **原因**：索引赋值不会触发 `setter` 函数。
* **解决方案**：Vue 2 重写了数组的 7 个方法（`push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`）来手动触发响应式更新。

**示例代码对比**

```html
<div id="app">
    <ul>
        <li v-for="(item, index) in list" :key="index">{{ item }}</li>
    </ul>
    <button @click="updateByIndex">直接索引修改（无效）</button>
    <button @click="updateBySplice">用 splice 修改（有效）</button>
</div>

<script>
    new Vue({
        el: '#app',
        data: {
            list: [1, 2, 3]
        },
        methods: {
            // 直接使用索引赋值：页面不会更新
            updateByIndex() {
                this.list[0] = 4;
                console.log('数组已变但页面未更新：', this.list);
            },
            // 使用 splice 方法：页面实时更新
            updateBySplice() {
                this.list.splice(0, 1, 4);
                console.log('页面同步更新：', this.list);
            }
        }
    });
</script>

```

---

## Vue 3 响应式原理

### 核心实现：Proxy

Vue 3 改用 ES6 的 `Proxy` 特性来实现响应式对象。`Proxy` 可以直接代理整个对象，而不是像 `defineProperty` 那样只能代理属性。

### ref 与 reactive 的区别

* **`reactive`**: 只能用于数组和对象类型。它底层完全基于 `Proxy` 实现。
* **`ref`**: 可以用于所有类型。
* 如果封装的是**简单类型**（如 String, Number），Vue 3 会回退使用 `getter/setter`（`.value` 访问），因为对简单类型使用 `Proxy` 性能开销反而更大。
* 如果封装的是**复杂类型**，`ref` 内部依然会调用 `reactive`（即 `Proxy`）。



### 核心机制：track 与 trigger

* **`track`**: 依赖收集函数。在 `get` 阶段运行，记录当前是哪个副作用函数（Effect）在访问数据。
* **`trigger`**: 依赖触发函数。在 `set` 阶段运行，当数据变化时，通知所有收集到的依赖重新执行。

**Vue 3 简化版原理实现**

```javascript
const targetMap = new WeakMap(); // 存储对象的所有依赖
let activeEffect = null;         // 当前正在运行的副作用函数

// 依赖收集
function track(target, key) {
    if (activeEffect) {
        let depsMap = targetMap.get(target);
        if (!depsMap) targetMap.set(target, (depsMap = new Map()));
        let dep = depsMap.get(key);
        if (!dep) depsMap.set(key, (dep = new Set()));
        dep.add(activeEffect);
    }
}

// 触发更新
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    if (depsMap) {
        const dep = depsMap.get(key);
        if (dep) dep.forEach(effect => effect());
    }
}

// 创建响应式对象
function reactive(target) {
    return new Proxy(target, {
        get(target, key, receiver) {
            track(target, key);
            const res = Reflect.get(target, key, receiver);
            return (typeof res === 'object' && res !== null) ? reactive(res) : res;
        },
        set(target, key, value, receiver) {
            const oldValue = target[key];
            const result = Reflect.set(target, key, value, receiver);
            if (oldValue !== value) trigger(target, key);
            return result;
        }
    });
}

```

---

## Vue 2 vs Vue 3 核心区别汇总

| 特性 | Vue 2 | Vue 3 | 核心差异说明 |
| --- | --- | --- | --- |
| **实现原理** | `Object.defineProperty` | `Proxy` | Proxy 直接代理整个对象，无需递归初始化属性。 |
| **数组响应式** | 需重写数组方法 | 原生支持 | Vue 3 可直接通过索引 `arr[0]=1` 或修改 `length` 触发更新。 |
| **动态新增属性** | 需用 `Vue.set()` | 直接赋值生效 | Vue 3 中 `obj.newProp = value` 自动触发响应式。 |
| **初始化性能** | 递归遍历所有属性 | 按需惰性代理 | Vue 3 极大减少了大型对象的初始化开销。 |
| **集合支持** | 不支持 | 支持 Map/Set 等 | Vue 3 原生支持 `Map`, `Set`, `WeakMap` 的响应式。 |
| **API 灵活性** | 仅限于 `data` 选项 | `ref` / `reactive` | Vue 3 的响应式 API 可脱离组件单独使用。 |
| **调试能力** | 较弱 | 增强的调试钩子 | 提供 `onTrack` 和 `onTrigger` 钩子，方便追踪变化。 |

---

> **总结**：Vue 3 通过 `Proxy` 解决了 Vue 2 中最令人头疼的数组/对象新增属性不响应的问题，并通过惰性代理和精简的依赖追踪机制，带来了更强劲的性能表现。

---
