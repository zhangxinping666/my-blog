---
title: Node.js 基础
link: node-basics
catalog: true
date: 2025-01-05 15:00:00
description: Node.js 运行时的基础知识和常用模块介绍。
tags:
  - NodeJs
  - npm
categories:
  - [后端, NodeJs]
---

## 全局对象

### `global` 的属性

```js
$ node server
<ref *1> Object [global] {
  global: [Circular *1],
  clearImmediate: [Function: clearImmediate],
  setImmediate: [Function: setImmediate] {
    [Symbol(nodejs.util.promisify.custom)]: [Getter]
  },
  clearInterval: [Function: clearInterval],
  clearTimeout: [Function: clearTimeout],
------
}
```

### `setTimeout` 对象

在**浏览器**环境中，`setTimeout()` 返回一个简单的**数字（Number）**，作为计时器的唯一 ID。
在 **Node.js** 环境中，`setTimeout()` 返回一个 **`Timeout` 对象**。

### `dirname` 属性

获取当前目录的绝对路径 dirname 不是 global 里面的属性:

```js
console.log(__dirname); //D:\Web\nodejs\nodeDemo
```

### `filename` 属性

获取当前文件的绝对路径 filename 不是 global 里面的属性:

```js
console.log(__filename); //D:\Web\nodejs\nodeDemo\server.js
```

### `require` 对象

`require` 是 Node.js 的模块加载函数，负责导入文件和模块。其核心机制包括：**同步执行**，即加载时会阻塞代码；**模块缓存**，确保同一模块只被加载并运行一次；以及返回 `module.exports`，作为模块的唯一出口。它是 CommonJS 模块系统的基石。

### `console` 对象

用于在命令行或终端中输出信息的对象。
最常用的 `console.log()`、`console.error()`、`console.warn()` 等方法都来自这个全局对象。

### `Buffer` 类

```js
const buffer = Buffer.from("abc", "utf-8");
console.log(buffer); //<Buffer 61 62 63>
```

用于处理二进制数据的全局类。

- 在 Node.js 中，当你处理文件 I/O、网络流或加密解密时，数据通常以二进制流的形式存在，`Buffer` 就是专门用来高效处理这些数据的。
- Buffer 的底层是用于处理**二进制原始数据**的。而十六进制（Hexadecimal）之所以成为表示和输出 Buffer 数据的首选方式，主要是因为它在**紧凑性**、**可读性**和**与二进制的直接转换**上有着独特的优势。

### `process` 对象

`process` 对象本身是 `EventEmitter` 的一个实例，一个非常重要的全局对象，这意味着你可以监听它发出的各种事件，从而在进程的不同生命周期阶段执行代码
这些属性用于获取当前进程和系统环境的各种信息。

**进程信息**

- `process.pid`: 当前进程的 ID。
- `process.ppid`: 父进程的 ID。
- `process.platform`: 操作系统平台，如 `'win32'`、`'linux'`、`'darwin'`（macOS）。
- `process.arch`: CPU 架构，如 `'x64'`、`'arm'`。
- `process.version`: Node.js 的版本号。
- `process.versions`: Node.js 及其依赖库的版本信息，如 V8 引擎、OpenSSL 等。
- `process.env`: 一个包含了所有环境变量的对象。这是在不同环境中（开发、测试、生产）配置应用程序的常见方式。
- `process.cwd()`: 返回当前工作目录。

```js
// 假设运行命令是 PORT=3000 node app.js
console.log(process.env.PORT); // 输出: 3000
```

**命令行参数**

`process.argv`: 一个数组，包含了所有命令行参数。

- `process.argv[0]`: `node` 命令的执行路径。
- `process.argv[1]`: 当前执行的脚本文件路径。
- `process.argv[2]` 及以后: 传递给脚本的实际参数。

```js
// 假设运行命令是 node app.js hello world
console.log(process.argv);
// 输出: ['/path/to/node', '/path/to/app.js', 'hello', 'world']
```

**标准 I/O 流**

**`process`** 对象提供了三个用于标准输入、输出和错误处理的流。

- `process.stdout`: 标准输出流。`console.log()` 和 `console.info()` 最终都会使用它。
- `process.stderr`: 标准错误流。`console.error()` 和 `console.warn()` 最终会使用它。
- `process.stdin`: 标准输入流。可以监听它的 `data` 事件来接收用户在终端的输入。

**进程控制与生命周期**

- `process.exit([code])`: 立即终止 Node.js 进程。
  - `code` 是可选的退出码。约定俗成地，`0` 表示成功退出，非零值表示失败或错误。
- `process.kill(pid, [signal])`: 向指定的进程 ID（`pid`）发送一个信号。
  - **示例：** `process.kill(process.pid, 'SIGTERM')` 可以优雅地关闭当前进程。

**事件监听**

`process` 是一个 `EventEmitter`，你可以通过 `.on()` 方法监听其发出的重要事件，从而在进程生命周期的关键时刻执行一些操作。

- `'exit'`: 当进程即将退出时触发。你可以在这个事件中执行清理操作，如关闭数据库连接、保存数据等。**注意：** 这里的代码必须是同步的。
- `'beforeExit'`: 当 Node.js 清空事件循环，但没有未完成的异步任务时触发。这给了你执行额外异步任务的机会。
- `'uncaughtException'`: 当一个未捕获的同步异常抛出时触发。监听这个事件可以防止应用因意外错误而崩溃。
- 'unhandledRejection'`: 当一个 Promise 被拒绝但没有`catch` 处理器时触发

## 模块化

当你调用 `require()` 时，Node.js 会严格按照以下优先级和步骤来查找模块：

### 第一步：检查核心模块（优先级最高）

Node.js 会首先检查模块标识符是否属于其**内置的核心模块**。

- **规则**：如果标识符是 `fs`、`path`、`http` 等核心模块名，Node.js 会立即从内存中加载并返回这些模块，查找过程到此结束。
- **示例**：`require('fs')`

### 第二步：检查文件系统路径

如果不是核心模块，Node.js 会根据模块标识符的开头来判断它是否指向一个文件或文件夹路径。

- **规则**：
  - **相对路径**：如果标识符以 **`./`** 或 **`../`** 开头，Node.js 会将路径解析为**相对于当前文件**的位置。
  - **绝对路径**：如果标识符以**根目录**（`/`）或**盘符**（如 `D:\`）开头，Node.js 会将其视为一个完整的文件系统路径，并直接在这个位置进行查找。
- **查找过程**：
  1. Node.js 会先尝试将标识符作为一个**完整的文件名**来加载。
  2. 如果失败，它会尝试自动**添加文件后缀**（`.js`、`.json`、`.node`）来寻找文件。
  3. 如果还是没有找到，它会尝试将标识符作为一个**文件夹**来处理，并寻找该文件夹的入口文件（见下文“查找细节”部分）。
- **示例**：
  - `require('./utils/helper.js')`
  - `require('D:\\project\\main.js')`

### 第三步：检查 node_modules 文件夹

如果不是核心模块，也不是文件系统路径（即标识符既不以 `/` 开头，也不以 `./` 或 `../` 开头），Node.js 就会进入这个阶段。

- **规则**：Node.js 会从**当前文件所在的目录**开始，查找一个名为 `node_modules` 的子文件夹。
- **向上递归**：如果找不到，它会进入父目录，继续寻找 `node_modules`。这个过程会一直向上递归，直到到达文件系统的根目录。
- **示例**：
  - 你的项目结构是 `project/src/app.js`。
  - 当 `app.js` 中 `require('express')` 时，Node.js 会依次在以下路径中寻找 `node_modules/express
    1. `/project/src/node_modules`
    2. `/project/node_modules`
  - 这就是为什么你可以在项目的任何子文件夹中直接导入 `npm` 包。

### 第四步：查找细节与默认规则

在第二步和第三步的查找过程中，Node.js 遵循以下默认规则：

1. **关于文件后缀名**：如果你没有指定后缀，Node.js 会按 `js` -> `json` -> `node` 的顺序依次尝试。
2. **关于文件夹入口**：如果你 `require` 的路径是一个文件夹，Node.js 会按以下优先级寻找其入口文件：
   - **`package.json` 中的 `main` 字段**：如果有 `package.json` 文件且指定了 `main` 字段，Node.js 就会使用该文件。
   - **`index.js`**：如果上述条件都不满足，Node.js 会默认使用文件夹内的 `index.js` 文件作为入口。

**总结**：Node.js 的模块查找是一个有严格优先级的流程。它首先检查最快的核心模块，然后是文件系统路径，最后才是相对耗时的 `node_modules` 递归查找。理解这个流程，能让你更清晰地组织和管理自己的模块。

### 面试题相关题

问题的核心在于对 `module.exports` 和 `exports` 之间关系的理解。
在 Node.js 中，每个模块开始执行时，都会默认有以下两个对象：

1. **`module.exports`**：这是模块真正的**导出对象**，`require()` 函数最终返回的就是它。
2. **`exports`**：这是一个方便的**快捷方式**，它在模块开始时默认**指向** `module.exports`。

理解了这一点，我们就可以来分析您的两种代码形式了。
第一种情况：您的**实际运行代码**

```js
// exports 是 module.exports 的引用
exports.c = 3;
// this 在模块顶部默认也指向 exports，所以这和上面等价
this.m = 5;

// 直接在 module.exports 对象上添加属性
module.exports.a = 1;
module.exports.b = 2;

console.log(this);
```

在这种情况下，无论是通过 `exports`、`this` 还是 `module.exports`，您都只是在**往同一个对象上添加新的属性**。这个对象在内存中始终是唯一的。

- `exports.c = 3` → 修改了 `module.exports
- `this.m = 5` → 同样修改了 `module.exports`
- `module.exports.a = 1` → 直接修改了 `module.exports`

由于 `this` 和 `exports` 一直都指向 `module.exports`，它们始终是**同步**的。因此，`console.log(this)` 将输出 `{ c: 3, m: 5, a: 1, b: 2 }`，最终导出的也是这个完整的对象。

第二种情况：您\*_注释掉的代码_

```js
exports.c = 3;
this.m = 5;

// ❗这里发生了关键操作：对 module.exports 进行了重新赋值
// module.exports = {
//   a: 1,
//   b: 2,
// }

// console.log(this); // 此时会输出什么？
```

在这种情况下，`module.exports = { a: 1, b: 2 }` 这个操作是**重新赋值**，它做的事情是：

1. 创建一个**全新的对象** `{ a: 1, b: 2 }`。
2. 将 `module.exports` 这个变量的引用**指向**这个新对象。
3. **`exports`** 和 **`this`** 这两个变量的引用**没有改变**，它们依然指向模块开始时那个空的原始对象。

所以，此时 `exports.c = 3` 和 `this.m = 5` 这两行代码，是修改了那个已经“被抛弃”的原始对象。最终 `require()` 返回的是重新赋值后的 `module.exports`，即 `{ a: 1, b: 2 }`。

如果在这里执行 `console.log(this)`，它会输出 `{ c: 3, m: 5 }`，因为它仍然指向最初的那个对象。但这个对象最终并不会被导出。

总结

`module.exports` 和 `exports` 的关系就是“主菜”和“筷子”的关系。

- **`module.exports` 是主菜**，最终端上桌（被 `require`）的是它。
- **`exports` 是一双筷子**，默认指向 `module.exports` 这盘主菜。
- **`exports.属性 = 值`**：等同于用筷子夹菜，主菜（`module.exports`）里的菜变多了。
- **`module.exports = 新对象`**：等同于把主菜换成了一盘新的菜，这双筷子（`exports`）还在夹原来的空盘子，与你新换的主菜无关了。

因此，当你想导出**多个属性**时，推荐使用 `module.exports.a = 1` 这种方式，或者将所有属性封装在一个对象中，一次性赋值给 `module.exports`。但**不要**同时使用 `exports` 添加属性又重新赋值 `module.exports`，那会导致逻辑混乱。

## Node 中 this 的指向

### `this` 指向的变化

虽然 `this` 在模块的顶级作用域指向 `exports`，但它在其他上下文中的行为与标准的 JavaScript 规则是一致的。

| 上下文             | `this` 的指向                    | 示例                                                                                                                             |
| ------------------ | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **模块顶级作用域** | **`exports` 对象**               | `console.log(this === exports);`                                                                                                 |
| **普通函数调用**   | 在默认的严格模式下为 `undefined` | `function test() { console.log(this); } test();` // 输出: undefined                                                              |
| **对象方法调用**   | 调用方法的对象本身               | `const obj = { method: function() { console.log(this === obj); } }; obj.method();` // 输出: true                                 |
| **箭头函数**       | 继承自父级作用域的 `this`        | 在模块顶级作用域的箭头函数中，`this` 依然指向 `exports`。`const arrow = () => { console.log(this === exports); };` // 输出: true |
| **类构造函数**     | 新创建的实例                     | `class MyClass { constructor() { console.log(this instanceof MyClass); } }` // 输出: true                                        |

## 基本内置模块

### 文件系统与路径处理

- **`fs` (File System)**
  - **功能：** 提供与文件系统交互的所有功能，包括文件的读、写、删除、重命名，以及文件夹的创建、读取等。
  - **特点：** 大多数方法都提供了同步（如 `fs.readFileSync`）和异步（如 `fs.readFile`）两种版本，推荐优先使用异步版本以避免阻塞事件循环。
  - **常见用途：** 读取配置文件、保存用户上传的文件、遍历目录等。
- **`path`**
  - **功能：** 提供了处理文件和目录路径的工具，能够解决不同操作系统（Windows 使用 `\`，Linux/macOS 使用 `/`）路径分隔符不一致的问题。
  - **常见用途：** 拼接路径 (`path.join`)、解析路径中的文件名或目录名 (`path.basename`, `path.dirname`)、将相对路径解析为绝对路径 (`path.resolve`)。

### 网络通信

- **`http`**
  - **功能：** 用于创建 HTTP 服务器和客户端，是 Node.js 成为 Web 服务器的首要基础。
  - **常见用途：** 构建 RESTful API、处理 HTTP 请求和响应、发起网络请求等。
- **`https`**
  - **功能：** `http` 模块的安全版本，支持 SSL/TLS 加密，用于创建安全的 Web 服务器。
  - **常见用途：** 搭建需要 HTTPS 协议的生产环境服务器。
- **`net`**
  - **功能：** 用于创建底层 TCP/IP 服务器和客户端。
  - **常见用途：** 构建非 HTTP 的网络服务，如自定义协议、即时通讯等

### 操作系统与进程

- **`os`**
  - **功能：** 提供与操作系统相关的实用信息，如 CPU 架构、内存总量、网络接口、操作系统类型等。
  - **常见用途：** 根据操作系统类型执行不同逻辑、获取系统性能指标。
- **`child_process`**
  - **功能：** 提供了创建子进程的能力，允许你的 Node.js 脚本执行外部的系统命令或运行其他程序。
  - **常见用途：** 执行 Shell 命令、调用其他语言编写的脚本（如 Python、Java）。

### 核心工具与数据结构

- **`events`**
  - **功能：** 提供了 `EventEmitter` 类，是 Node.js 中实现事件驱动编程的核心模式。许多内置模块（如 `http` 服务器、流）都继承自它。
  - **常见用途：** 自定义事件系统，实现发布-订阅模式。
- **`stream`**
  - **功能：** 用于处理流数据（`Readable` 可读流、`Writable` 可写流、`Duplex` 双向流、`Transform` 转换流）。
  - **特点：** 流是 Node.js 处理大数据和文件 I/O 的高效方式，它能分块处理数据，避免一次性将所有数据加载到内存中。
- **`util`**
  - **功能：** 提供了各种常用工具函数，如类型检查、格式化字符串等。
  - **常见用途：** `util.promisify` 将回调函数转换为 Promise，`util.inspect` 用于对象深度打印。
- **`url`**
  - **功能：** 用于解析和格式化 URL 字符串。
  - **常见用途：** 解析 URL 中的查询参数、协议、域名等。

## 文件 I/O

文件 I/O（输入/输出）是指程序与文件系统进行交互的操作，包括读取、写入、更新、删除文件等。Node.js 通过内置的 **`fs` 核心模块**（File System）来处理所有这些功能。

### readFile

`fs.readFile` 方法将整个文件的内容一次性读取到内存中，并返回结果。它适用于读取**小文件**。
**异步版本**：`fs.readFile()`
这是最常用的方法，它不会阻塞主线程。

```js
const fs = require("fs/promises");
async function readSmallFile() {
  try {
    // 读取文件，并指定 utf8 编码，结果为字符串
    const data = await fs.readFile("./config.json", "utf8");
    console.log("文件内容:", data);

    // 如果不指定编码，结果将是一个 Buffer 对象
    const buffer = await fs.readFile("./image.png");
    console.log("文件大小:", buffer.length, "字节");
  } catch (err) {
    console.error("读取文件失败:", err);
  }
}
readSmallFile();
```

**同步版本**：`fs.readFileSync()`
**特点**：会阻塞主线程，直到文件读取完成才继续执行。

```js
const fs = require("fs");
try {
  const data = fs.readFileSync("./config.json", "utf8");
  console.log("文件内容:", data);
} catch (err) {
  console.error("读取文件失败:", err);
}
```

**流式读取文件**（`fs.createReadStream`）
当你需要处理**大文件**（如几百兆或数 GB 的视频、日志文件）时，一次性读取整个文件会导致内存溢出。流式读取是解决这个问题的**最佳方案**。

```js
const fs = require("fs");
const readStream = fs.createReadStream("./large-video.mp4");
let totalBytes = 0;

// 监听 'data' 事件，每次读取到一个数据块时触发
readStream.on("data", (chunk) => {
  // chunk 是一个 Buffer 对象，表示一个数据块
  totalBytes += chunk.length;
  console.log(`已接收到 ${totalBytes} 字节数据...`);
});

// 监听 'end' 事件，当所有数据都已读取完成时触发
readStream.on("end", () => {
  console.log("文件读取完成！");
});

// 监听 'error' 事件，当发生错误时触发
readStream.on("error", (err) => {
  console.error("文件读取失败:", err);
});
```

### writeFile

`fs.promises.writeFile()` 方法可以通过 `flag` 参数来控制文件的写入模式，这决定了新内容是覆盖还是追加到原有文件上。
**覆盖写入（默认行为）**
这是 `writeFile` 的默认模式，无需指定 `flag` 参数。

```js
await fs.promises.writeFile(filename, "abc");
```

- **行为**
  - `writeFile` 默认使用 `flag: 'w'`（write）模式。
  - 如果文件已存在，会**清空**原有内容，然后写入新数据。
  - 这代表一种**替换**操作。

**追加写入**
需要显式地设置 `flag` 参数为 `'a'`。

```js
await fs.promises.writeFile(filename, "abc", { flag: "a" });
```

- 行为:
  - 使用 `flag: 'a'`（append）模式。
  - 如果文件已存在，新数据会**追加到文件末尾**，原有内容被保留。
  - 这代表一种**添加**操作，常用于日志记录。

**新建文件写入**
写入没有的文件,使用 buffer,会新建文件

```js
const fs = require("fs");
const path = require("path");
const filename = path.resolve(__dirname, "./file/2.txt");
async function test2() {
  const buffer = Buffer.from("abc", "utf8");
  await fs.promises.writeFile(filename, buffer);
  console.log("写入成功");
}
```

**图片 copy**
这个过程之所以能实现图片复制，是因为 `Buffer` 作为一种**不可知的二进制数据容器**，能够忠实地完成“搬运”任务，确保了从读取到写入的整个过程中，文件数据的原始形态没有发生任何改变。

```js
async function copyImage() {
  // 读取文件
  const filename = path.resolve(__dirname, "./file/1.png");
  const buffer = await fs.promises.readFile(filename);
  // 写入文件
  const filename2 = path.resolve(__dirname, "./file/2.png");
  await fs.promises.writeFile(filename2, buffer);
  console.log("写入成功");
}
```

### stat

`stat` 是 **`fs` 核心模块**中的一个方法，它的作用是获取一个文件或目录的**详细信息**，而无需读取其内容。这个方法的名字来源于 Unix/Linux 系统中的 `stat()` 系统调用。
`stat` 返回的对象提供了丰富的属性和方法，可以让你了解文件的方方面面：

- **文件类型**：
  - `stats.isFile()`: 如果是文件，返回 `true`。
  - `stats.isDirectory()`: 如果是目录，返回 `true`。
  - `stats.isSymbolicLink()`: 如果是符号链接，返回 `true`。
- **文件大小**：
  - `stats.size`: 文件的大小，以字节（Bytes）为单位。
- **时间戳**：
  - `stats.atime`: 最近一次访问（Access）的时间。
  - `stats.mtime`: 最近一次修改（Modification）内容的时间。
  - `stats.ctime`: 最近一次更改文件 inode 信息（如权限、所有者、文件名）的时间。
  - `stats.birthtime`: 文件的创建时间。
- **权限与所有者**：
  - `stats.mode`: 文件的权限模式。
  - `stats.uid`: 文件所有者的用户 ID。
  - `stats.gid`: 文件所有者的组 ID。

```js
async function stat() {
  const stat = await fs.promises.stat(filename);
  console.log("目录", stat.isDirectory);
  console.log("文件", stat.isFile);
  console.log("大小", stat.size);
  console.log("修改时间", stat.mtime);
  console.log("创建时间", stat.birthtime);
}
```

stat 还有一个用法就是判断文件或目录是否存在，历史上曾有直接的方法，但它们各有缺陷。现在，社区更推荐使用一种更健壮、更通用的方法。
`fs.promises.stat()`：现代异步方法（强烈推荐）
这是目前最通用、最健壮、最符合 Node.js 异步编程哲学的方法。

- **特点**：
  - **非阻塞**：它是一个 Promise 方法，不会阻塞主线程。
  - **通用性**：`stat` 可以用于判断文件和目录。
  - **强大的错误处理**：如果路径不存在，它会抛出一个带有特定错误码（`ENOENT`）的异常。这让你能够精准地判断是“不存在”还是“其他错误”。

```js
const fs = require("fs/promises");

async function pathExists(path) {
  try {
    await fs.stat(path); // 尝试获取文件/目录信息
    return true; // 成功获取，表示存在
  } catch (error) {
    // 如果错误码是 'ENOENT'，则表示不存在
    if (error.code === "ENOENT") {
      return false;
    }
    // 如果是其他错误，比如权限不足，则抛出
    throw error;
  }
}

(async () => {
  console.log(await pathExists("./my-file.txt"));
  console.log(await pathExists("./my-folder"));
})();
```

### readdir

`readdir` 是 **`fs` 核心模块**中的一个方法，它的作用是**读取一个目录的内容**。它会返回一个数组，包含了该目录下所有文件和子目录的名称(只有子集)。

```js
async function readdir() {
  const paths = await fs.promises.readdir(filename);
  console.log(paths);
}
```

### mkdir

创建目录是通过 **`fs` 核心模块**中的 `mkdir`（make directory）方法来实现的。`mkdir` 用于在文件系统中创建一个新的文件夹。

**异步回调**
这是传统的非阻塞方式，当操作完成后，通过回调函数来处理结果。

```js
const fs = require("fs/promises");
fs.mkdir("./new-folder", (err) => {
  if (err) {
    console.error("创建目录失败:", err);
    return;
  }
  console.log("目录创建成功！");
});
```

**同步**
同步版本会阻塞主线程，直到目录创建完成。

```js
const fs = require("fs/promises");
async function createDirectory() {
  try {
    await fs.promises.mkdir("./new-folder-promise");
    console.log("目录创建成功！");
  } catch (err) {
    console.error("创建目录失败:", err);
  }
}

createDirectory();
```

**递归**
这是 `mkdir` 最重要的特性。默认情况下，`mkdir` **无法创建多级嵌套的目录**。

- **问题：** 如果你想创建 `a/b/c` 目录，而 `a` 和 `b` 目录不存在，`mkdir` 会失败并报错。
  为了解决这个问题，Node.js 提供了 `recursive` 选项。
- `recursive: true`：当这个选项被设置为 `true` 时，`mkdir` 会自动创建路径中所有不存在的父目录。

```js
const fs = require("fs/promises");

// ✅ 最佳实践：使用 recursive 选项
async function createNestedDirSuccess() {
  try {
    await fs.promises.mkdir("./a/b/c", { recursive: true });
    console.log("目录及其所有父目录创建成功！");
  } catch (err) {
    console.error("错误:", err);
  }
}

createNestedDirSuccess();
```
