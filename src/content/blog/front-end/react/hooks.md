---
title: React Hooks
link: hooks
catalog: true
date: 2025-01-05 13:00:00
description: React Hooks 使用方法。
tags:
  - React
  - Hooks
categories:
  - [前端, React]
---

在 React 16.8 版本之前，组件主要分为两种：**类组件（Class Components）** 和 **函数组件（Function Components）**。类组件可以使用 `state` 来管理内部状态，也能使用生命周期方法（如 `componentDidMount`）来处理副作用。而函数组件是“无状态的”，它们只能接收 `props` 并返回 JSX，无法拥有自己的状态和生命周期。
**React Hooks 是一系列特殊的函数，它们允许你在函数组件中“钩入”React 的 state 及生命周期等特性。** 简单来说，Hooks 让函数组件也能拥有和类组件几乎同等的能力，从此你可以在不编写 class 的情况下使用 state 和其他 React 功能。这使得函数组件成为现代 React 开发的首选。

**使用 hooks 的原则:**
- **只在顶层调用 Hooks**：不要在循环、条件判断或嵌套函数中调用 Hooks。必须保证 Hooks 在每次组件渲染时的调用顺序都是完全一致的。这是因为 React 依赖于 Hooks 的调用顺序来正确地将 state 与对应的 `useState` 或 `useEffect` 关联起来。
- **只在 React 函数中调用 Hooks**：你只能在 **React 函数组件** 或 **自定义 Hooks** 中调用 Hooks。不能在普通的 JavaScript 函数中调用。

## 数据驱动更新型

### useState 数据更新
适用于管理组件的局部状态，如开关的开/关状态、表单输入的值、一个计数器的值等。当状态逻辑简单，且不依赖于其他复杂状态时，`useState` 是最佳选择。

`表单`:
```js
import React, { useState } from 'react';

function NameInput() {
  // 声明一个名为 name 的状态，初始值为空字符串
  const [name, setName] = useState('');

  const handleChange = (event) => {
    // 调用 setName 更新状态，触发重新渲染
    setName(event.target.value);
  };

  return (
    <div>
      <input type="text" value={name} onChange={handleChange} />
      <p>Hello, {name}!</p>
    </div>
  );
}
```

### useReducer 订阅更新
当状态逻辑变得复杂，或者下一个状态依赖于前一个状态时，`useReducer` 是 `useState` 的一个更强大的替代方案。它借鉴了 Redux 的思想，通过 `dispatch` 一个 `action` 来集中管理状态的更新逻辑。
在事件处理中，调用 `dispatch({ type: 'ACTION_TYPE', payload: ... })` 来触发状态更新。

```js
import React, { useReducer } from 'react';

// 1. Reducer 函数：定义所有可能的状态转换
const counterReducer = (state, action) => {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
    default:
      throw new Error();
  }
};

function Counter() {
  // 2. 使用 useReducer 初始化状态
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      {/* 3. Dispatch actions 来触发更新 */}
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  );
}
```

## 状态的获取和传递值

### useContext 订阅获取上下文
在 React 应用中，数据通常是通过 `props` 从父组件单向地流向子组件。但如果一个状态需要被深层次的子组件使用，或者被多个不同层级的组件共享，通过 props 层层传递（这个过程被称为 "prop drilling" 或“属性钻探”）会变得非常繁琐和难以维护。

- **创建 Context**: 使用 `React.createContext()` 创建一个 Context 对象。这个对象就像一个信息频道。
```javascript
const MyContext = React.createContext(defaultValue);
```

- **提供 Context**: 在组件树的上层，使用 `<MyContext.Provider>` 组件，通过 `value` 属性来“广播”你想要共享的数据。所有被这个 Provider 包裹的子组件（无论层级多深）都能访问到这个 `value`。
```javascript
<MyContext.Provider value={/* 你想共享的任何值 */}>
  <App />
</MyContext.Provider>
```

- **消费 Context**: 在任何一个子组件中，调用 `useContext(MyContext)` Hook 来“订阅”并读取这个 `value`
```javascript
const value = useContext(MyContext);
```

**全局状态管理**：如应用的主题（白天/黑夜模式）、当前的登录用户信息、语言偏好设置等。
```js
import React, { useState, useContext, createContext } from 'react';

// 1. 创建一个主题 Context，可以给一个默认值
const ThemeContext = createContext('light');

// App 组件作为顶层组件
function App() {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(current => (current === 'light' ? 'dark' : 'light'));
  };

  // 2. 使用 Provider 将 theme 和 toggleTheme 函数提供给所有子组件
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Toolbar />
    </ThemeContext.Provider>
  );
}

// Toolbar 组件，它本身不需要 theme，只是一个中间组件
function Toolbar() {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

// ThemedButton 是真正需要使用 theme 的深层子组件
function ThemedButton() {
  // 3. 使用 useContext 直接获取共享的主题和方法
  const { theme, toggleTheme } = useContext(ThemeContext);

  const style = {
    background: theme === 'dark' ? '#333' : '#eee',
    color: theme === 'dark' ? '#fff' : '#333',
    padding: '10px',
    border: 'none',
    borderRadius: '5px'
  };

  return (
    <button style={style} onClick={toggleTheme}>
      当前是 {theme} 主题，点我切换
    </button>
  );
}

export default App;
```

### useRef 元素组件获取
`useRef` 是一个非常独特的 Hook。虽然它也用于在组件中存储数据，但它与 `useState` 有一个本质区别：**更新 `useRef` 的值不会触发组件的重新渲染**。

**用途:**
**1.访问 DOM 元素**
这是 `useRef` 的首要用途。你可以创建一个 ref，并将它附加到 JSX 元素的 `ref` 属性上，之后就可以通过这个 ref 直接访问该 DOM 节点。
```js
import React, { useRef } from 'react';

function FocusInput() {
  // 1. 创建一个 ref 对象
  const inputRef = useRef(null);

  const handleFocus = () => {
    // 3. 通过 .current 属性访问 DOM 节点并调用其方法
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div>
      {/* 2. 将 ref 附加到 input 元素上 */}
      <input ref={inputRef} type="text" />
      <button onClick={handleFocus}>Focus the input</button>
    </div>
  );
}
```


2.存储一个可变的引用值:

因为 `useRef` 的值在每次渲染时都保持不变，且更新它不会触发重渲染，所以它也可以作为一个“实例变量”，用来存储那些你需要在多次渲染之间共享、但又不想触发视图更新的数据。更新`.current`属性**不会**触发任何重渲染

```js
import react, { useState, useEffect, useRef } from 'react';

function RenderCounter() {
  const [count, setCount] = useState(0);
  // 使用 ref 来存储渲染次数
  const renderCount = useRef(0);

  useEffect(() => {
    // 每次渲染后，renderCount 的值加一
    // 注意：更新 ref 不会触发另一次渲染，避免了无限循环
    renderCount.current = renderCount.current + 1;
  });

  return (
    <div>
      <p>State Count: {count}</p>
      <p>This component has rendered {renderCount.current} times.</p>  
      <button onClick={() => setCount(c => c + 1)}>
        Trigger Re-render
      </button>
    </div>
  );
}
```

## 状态派生和保存型
- 当你需要缓存一个**计算结果**（如一个经过过滤的数组，一个复杂的计算值）时，用 **`useMemo`**。
- 当你需要缓存一个**函数本身**（通常是为了作为 prop 传递）时，用 **`useCallback`**。

### useMemo 派生新状态
`useMemo` 的核心作用是 **“记忆”一个计算结果**。在 React 中，当一个组件的 `state` 或 `props` 改变时，整个组件函数会重新执行，这意味着函数内部的所有代码（包括一些复杂的计算）都会被重新运行。如果某个计算非常耗时，这就会导致界面卡顿，影响用户体验。只有当其依赖项发生变化时，它才会重新执行计算，否则它会直接返回上一次缓存的结果。

**适用场景:**
- 对一个巨大的列表进行排序或过滤。
- 在组件中进行复杂的数学运算或数据处理。
- 当一个子组件的 props 需要通过复杂计算得出时，用 `useMemo` 来稳定这个 prop，防止子组件不必要的重新渲染。
```js
import React, { useState, useMemo } from 'react';

// 假设 allUsers 是一个包含 1000 个对象的巨大数组
const allUsers = [...]; 

function UserList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [anotherState, setAnotherState] = useState(false);

  //  没有优化的写法：
  // 无论 searchTerm 变不变，只要组件重渲染（比如点击 Toggle 按钮），
  // filter 这个昂贵操作就会被重新执行一次。
  // const filteredUsers = allUsers.filter(user => user.name.includes(searchTerm));

  //  使用 useMemo 优化：
  // 这个 filter 操作现在被“记忆”了。
  const filteredUsers = useMemo(() => {
    console.log('Filtering logic is running...'); // 你会发现只有在 searchTerm 改变时才会打印
    return allUsers.filter(user => user.name.includes(searchTerm));
  }, [searchTerm]); // 依赖项是 searchTerm

  return (
    <div>
      <input 
        type="text" 
        placeholder="Search users..." 
        onChange={e => setSearchTerm(e.target.value)} 
      />
      {/* 这个按钮的点击只会更新 anotherState，不会触发上面的 filter 计算 */}
      <button onClick={() => setAnotherState(!anotherState)}>Toggle</button>
      <ul>
        {filteredUsers.map(user => <li key={user.id}>{user.name}</li>)}
      </ul>
    </div>
  );
}
```

### useCallback 保存状态
useCallback 是什么?
- `useCallback` 的核心作用是 **“记忆”一个函数**。在 JavaScript 中，函数是对象。在 React 组件每次重新渲染时，在函数组件内部定义的所有函数都会被重新创建。这意味着，即使函数体内的代码完全一样，前后两次渲染生成的函数在内存中也是两个不同的引用。
 - 当一个函数作为 `prop` 传递给一个被 `React.memo` 优化的子组件时，这个问题就变得很关键。因为父组件的每次重渲染都会创建一个新的函数实例，导致子组件接收到的 `prop` (那个函数) 每次都“不相等”，从而使得 `React.memo` 的优化失效，子组件依然会不必要地重新渲染。
- `useCallback` 就是用来解决这个问题的。它会缓存你提供的函数实例，只有当其依赖项改变时，才会重新创建一个新的函数实例

```js
import React, { useState, useCallback } from 'react';

// 使用 React.memo 优化子组件，只有 props 变化时才重渲染
const MemoizedButton = React.memo(({ onClick, children }) => {
  console.log(`Button "${children}" is rendering...`);
  return <button onClick={onClick}>{children}</button>;
});

function ParentComponent() {
  const [count, setCount] = useState(0);
  const [anotherState, setAnotherState] = useState(0);

  // 没有优化的写法：
  // 每次 ParentComponent 重渲染，都会创建一个新的 handleIncrement 函数。
  // const handleIncrement = () => setCount(count + 1);

  // 使用 useCallback 优化：
  // handleIncrement 函数被缓存了，它的引用只在依赖项变化时才更新。
  // 因为依赖项是空数组 []，所以它在组件的整个生命周期内都保持不变。
  const handleIncrement = useCallback(() => {
    setCount(prevCount => prevCount + 1); // 使用函数式更新，避免依赖 count
  }, []); 

  // 这个函数依赖 anotherState，所以只有 anotherState 变化时才会重新创建
  const handleAnotherAction = useCallback(() => {
    // ... do something with anotherState
  }, [anotherState]);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setAnotherState(anotherState + 1)}>
        Update Another State (will not re-render Increment button)
      </button>

      <MemoizedButton onClick={handleIncrement}>Increment Count</MemoizedButton>
      <MemoizedButton onClick={handleAnotherAction}>Another Action</MemoizedButton>
    </div>
  );
}
```


## 工具类

### useId 服务端渲染
`useId` 是 React 18 中引入的一个新 Hook，它的主要目的是**在客户端和服务端生成稳定且唯一的 ID**，以解决服务端渲染（Server-Side Rendering, SSR）和客户端激活（Hydration）过程中的 ID 不匹配问题。
在 `useId` 出现之前，如果我们需要为组件生成一个唯一的 ID,生成一个在服务端和客户端之间稳定、唯一且无冲突的 ID 字符串。
```js
import React, { useId } from 'react';

function FormField() {
  // 调用 useId 生成一个在 SSR 和 CSR 中都稳定的唯一 ID
  const id = useId();

  console.log('Generated ID:', id); 
  // 在服务端和客户端会打印出相同的 ID，例如 ":r1:"

  return (
    <div>
      {/* 使用生成的 id 来关联 label 和 input */}
      <label htmlFor={id}>Your Name:</label>
      <input id={id} type="text" name="name" />
    </div>
  );
}

// 如果一个组件需要多个 ID
function ComplexFormField() {
    const id = useId();
    return (
        <div>
            <label htmlFor={`${id}-firstName`}>First Name</label>
            <input id={`${id}-firstName`} type="text" />

            <label htmlFor={`${id}-lastName`}>Last Name</label>
            <input id={`${id}-lastName`} type="text" />
        </div>
    );
}
```

## 执行副作用型

### useEffect 异步执行副作用
这是处理副作用最常用、也是你最应该首先考虑的 Hook。`useEffect` 允许你在组件渲染到屏幕之后，执行一些与渲染本身无关的操作，比如数据获取、设置订阅、手动操作 DOM 等。**“异步执行”** 这个描述非常关键。`useEffect` 的执行时机是**在 React 完成 DOM 更新并将其绘制到屏幕上之后**。这意味着 `useEffect` 内部的代码不会阻塞浏览器的绘制过程，从而保证了用户界面的流畅和响应性。

**执行流程:**
- React 渲染组件。
- 浏览器更新 DOM 并且**绘制（Paint）**界面。
- **然后**，`useEffect` 内部的函数被执行。

```js
import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 这个函数会在组件渲染到屏幕上之后被调用
    console.log('Component has been painted to the screen.');
    
    async function fetchUserData() {
      console.log('Starting data fetch...');
      const response = await fetch(`https://api.example.com/users/${userId}`);
      const userData = await response.json();
      setUser(userData);
      console.log('Data fetch complete.');
    }

    fetchUserData();

    // 清理函数：在组件卸载或下一次 effect 执行前运行
    return () => {
      console.log('Cleaning up previous effect.');
    };
  }, [userId]); // 依赖数组，仅在 userId 变化时重新执行

  if (!user) {
    return <div>Loading...</div>;
  }

  return <h1>{user.name}</h1>;
}
```

### useLayoutEffect 同步执行副作用
`useLayoutEffect` 在 API 上与 `useEffect` 完全相同，但它们的执行时机截然不同。这微小的差异导致了其用途的巨大区别。 **“同步执行”** 是 `useLayoutEffect` 的关键。它会在 **React 计算完所有 DOM 变更之后，但在浏览器将这些变更绘制到屏幕上之前**同步执行。

**执行流程:**
- React 渲染组件，并计算出 DOM 的变更。
- **在浏览器绘制前**，`useLayoutEffect` 内部的函数被**同步**执行。
- `useLayoutEffect` 内部的代码可能会再次触发状态更新，导致组件同步地重新渲染。
- **然后**，浏览器才将最终的 DOM 变更绘制到屏幕上。
因为它是同步执行的，所以如果内部逻辑非常耗时，**它会阻塞浏览器的绘制**，导致页面卡顿。因此，应该谨慎使用。

只有当你需要**在浏览器绘制前，读取 DOM 布局信息并同步地使用这些信息来改变 DOM** 时，才应该使用 `useLayoutEffect`。这样做是为了防止用户看到“闪烁”（Flicker）现象——即组件先以一种状态渲染，然后又立即变为另一种状态。
```js
import React, { useState, useLayoutEffect, useRef } from 'react';

function AutoWidthInput() {
  const [width, setWidth] = useState(0);
  const divRef = useRef(null);

  // 使用 useLayoutEffect 来防止闪烁
  useLayoutEffect(() => {
    // 这个 effect 会在 DOM 更新后、浏览器绘制前执行
    if (divRef.current) {
      console.log('Reading layout before paint.');
      // 读取 div 的宽度
      const measuredWidth = divRef.current.offsetWidth;
      // 同步更新 state
      setWidth(measuredWidth);
    }
  }, []); // 空数组表示只在挂载后执行一次

  // 如果这里用的是 useEffect，你可能会短暂地看到 input 宽度为 0，然后才跳到正确宽度，造成闪烁。

  return (
    <div>
      <div ref={divRef} style={{ width: '200px', marginBottom: '10px', background: 'lightblue' }}>
        Measure my width!
      </div>
      <input type="text" style={{ width: `${width}px` }} placeholder="My width matches the div" />
    </div>
  );
}
```

