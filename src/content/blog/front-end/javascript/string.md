---
title: JavaScript 字符串详解
link: string
catalog: true
date: 2025-11-05 10:44:20
description: JavaScript字符串详解。
tags:
  - JavaScript
  - ES6
categories:
  - [前端, JavaScript]
---

## 创建字符串

`1.使用字面量(推荐)`：
这是最常用、最直接的方式。你可以用单引号 (`'`)、双引号 (`"`) 或反引号 (`` ` ``) 把文本包起来

```js
let singleQuote = "单引号";
let doubleQuote = "双引号";
let templateLiteral = `反引号`;
```

`2.使用String 构造函数（不推荐）`
这种方式会创建一个字符串对象 (Object)，而不是一个基本类型的值，可能会在比较时产生意想不到的结果。

```js
let strObject = new String("这是一个字符串对象");
console.log(typeof strObject); // "object"
let strLiteral = "这是一个字符串字面量";
console.log(typeof strLiteral); // "string"
```

### 字符串的不可变性

一旦一个字符串被创建，它的内容就永远无法被改变。

```js
let greeting = "Hello";
greeting = greeting + ", World!"; // 拼接
console.log(greeting); // "Hello, World!"
```

表面上看，`greeting` 变量的值被改变了。但实际上，内存中发生的事情是：`greeting + ", World!"` 创建了一个**全新的字符串** `"Hello, World!"`。然后 `greeting` 变量的“指针”从旧的 `"Hello"` 指向了这个**新的**字符串。

### 字符串的属性和方法

#### charAt(index)

- 功能： 返回字符串中指定索引位置的单个字符。
- 参数：`index` (必需): 一个整数，表示你想要获取的字符的索引 (从 0 开始)。
- 返回值： 一个只包含单个字符的新字符串。如果 index 超出范围，返回一个空字符串 ""。
- 无法正确处理超出基本多文种平面 (BMP) 的 `Unicode` 字符,因为 JavaScript 内部使用 `UTF-16` 编码来表示字符串,在需要处理可能包含 `emoji` 或其他特殊字符的字符串时，应避免使用 charAt()。推荐使用 ES6 提供的展开运算符 (...)、Array.from() 或 for...of 循环，它们能够正确识别并处理完整的 `Unicode` 字符。

```js
let str = "JavaScript";
// 获取第一个字符
console.log(str.charAt(0)); // "J"
// 获取第五个字符
console.log(str.charAt(4)); // "S"
// 如今更常用方括号 str[0] 的写法，但它在索引越界时返回 undefined。
let emojiStr = "Hello👍";

// 这个字符串的 length 并不是 6，而是 7 因为 "👍" 这个 emoji 占了两个码元
console.log(emojiStr.length); // 7
```

#### slice(startIndex, endIndex)

- 功能： 提取字符串的一个片段，并以新字符串的形式返回它，原始字符串不会被修改。
- 参数： `startIndex` (必需): 开始提取的索引。如果为负数，则从字符串尾部开始计算。`endIndex` (可选): 结束提取的索引 (该索引处的字符不被包含)。如果省略，则提取到字符串末尾。如果为负数，也从尾部计算。
- 返回值： 包含提取部分的新字符串。
- 开始索引 `startIndex` 大于或等于结束索引 `endIndex`，slice() 方法将始终返回一个空字符串 ""。它不会像 substring() 那样自动交换参数。如果传递给 slice() 的参数不是数字，JavaScript 会尝试将它们隐式转换为数字。

```js
let text = "The quick brown fox";
// 提取 "quick"
console.log(text.slice(4, 9)); // "quick"
// 从索引 10 到末尾
console.log(text.slice(10)); // "brown fox"
// 提取最后 3 个字符
console.log(text.slice(-3)); // "fox"

let data = "0123456789";
// null 被转换为 0, true 被转换为 1
console.log(data.slice(2, 1)); // ""空的
console.log(data.slice(null, true)); // "0" (相当于 slice(0, 1))
```

#### substring(startIndex, endIndex)

- 功能： 与 slice() 类似，提取字符串的片段并返回。
- 参数：`startIndex` (必需): 开始提取的索引。`endIndex` (可选): 结束提取的索引 (不包含)。
- 返回值： 包含提取部分的新字符串。
- 如果传递给的参数不是数字，JavaScript 会尝试将它们隐式转换为数字。
- 与 slice() 的核心区别：

1. 不支持负数索引：任何负数参数都会被视为 0。
2. 参数位置可互换：如果 `startIndex` 大于 `endIndex`，方法会自动交换这两个参数。

```js
let str = "Mozilla";
console.log(str.substring(1, 4)); // "ozi"
// 自动交换参数 4 和 1
console.log(str.substring(4, 1)); // "ozi"
// 负数被视为 0
console.log(str.substring(-2, 4)); // "Mozi" (相当于 substring(0, 4))
```

#### includes(searchValue, position)

- 功能： 判断一个字符串是否包含另一个指定的子字符串。
- 参数: `searchValue` (必需): 要查找的子字符串。
- `position` (可选): 开始搜索的索引位置，默认为 0, 如果 `position` 是负数或 NaN，也会被当作 0。
- 返回值： true (如果找到) 或 false (如果未找到)。
- includes() 方法的搜索是严格区分大小写的。如果要进行不区分大小写的搜索，需要先将原字符串和搜索字符串转换为相同的大小写（通常是全小写或全大写），如果是搜索空字符串 ("")返回 true，还可以处理 Unicode 字符。

```js
let sentence = "Hello, welcome to the universe.";
console.log(sentence.includes("welcome")); // true
console.log(sentence.includes("world")); // false
// 从索引 8 开始搜索 "welcome"
console.log(sentence.includes("welcome", 8)); // true
```

#### indexOf(searchValue, fromIndex)

- 功能：查找指定子字符串首次出现的索引。
- 参数：searchValue (必需): 要查找的子字符串。
- `fromIndex` (可选): 开始搜索的起始索引，默认为 0，`fromIndex` 是负数，会被当作 0，如果`fromIndex` 大于或等于字符串的长度，搜索将不会进行（除非搜索值是空字符串），并直接返回 -1。
- 返回值： 第一个匹配项的索引。如果未找到，则返回 -1。
- indexOf() 的搜索是严格区分大小写的。

```js
let paragraph =
  "The quick brown fox jumps over the lazy dog. If the dog barked, was it a quick dog?";
// 查找第一个 "dog"
console.log(paragraph.indexOf("dog")); // 40
// 从索引 41 之后开始查找 "dog"
console.log(paragraph.indexOf("dog", 41)); // 72
// 查找一个不存在的词
console.log(paragraph.indexOf("cat")); // -1
```

#### lastIndexOf(searchValue, fromIndex)

- 功能： 与 indexOf() 类似，但它是从字符串的末尾向前搜索，返回最后一次出现的索引。
- 参数：`searchValue` (必需): 要查找的子字符串。`fromIndex` (可选): 从该索引处开始向前搜索。默认为字符串的长度。
- 返回值： 最后一个匹配项的索引，未找到则返回 -1
- 与 indexOf() 一样，lastIndexOf() 的搜索也是严格区分大小写的。

```js
let paragraph =
  "The quick brown fox jumps over the lazy dog. If the dog barked, was it a quick dog?";
console.log(paragraph.lastIndexOf("dog")); // 72
```

#### startsWith(searchString, position)

- 功能： 判断当前字符串是否以另一个给定的子字符串开头。
- 参数：`searchString` (必需): 要搜索的子字符串。
- `position` (可选): 开始搜索的索引位置，默认为 0，如果 `position` 是负数，它会被当作 0。
- 返回值： true 或 false。
- 区分大小写，使用 startsWith("") 检查任何字符串，结果始终为 true。

```js
let str = "To be, or not to be, that is the question.";
console.log(str.startsWith("To be")); // true
// 检查从索引 14 开始的子串是否以 "that" 开头
console.log(str.startsWith("that", 24)); // true
```

#### endsWith(searchString, length)

- 功能： 判断当前字符串是否以另一个给定的子字符串结尾。
- 参数：`searchString` (必需): 要搜索的子字符串。
- `length` (可选): `length` 参数是 endsWith() 一个非常独特的特性。它并不指定搜索字符串的长度，而是指定将原字符串的前 `length` 个字符视为要检查的子串。
- 返回值： true 或 false。
- endsWith() 的搜索是严格区分大小写的，使用 endsWith("") 检查任何字符串，结果始终为 true，这包括指定了 `length` 参数的情况。

```js
let str = "Cats are the best!";
console.log(str.endsWith("best!")); // true
// 检查前 8 个字符 "Cats are" 是否以 "are" 结尾
console.log(str.endsWith("are", 8)); // true
```

#### replace(searchValue, newValue)

- 功能： 用某些字符替换另一些字符，或替换一个与正则表达式匹配的子串。
- 参数： `searchValue` (必需): 要被替换的字符串或正则表达式 (RegExp), 当 `searchValue` 是一个正则表达式时，你可以在 `newValue` 这个字符串中使用一些特殊字符 $ 来引用匹配到的内容 1.$&: 插入匹配到的完整子串, 2.$`: 插入匹配子串左边的所有内容。`newValue` (必需): newValue 不仅可以是字符串，还可以是一个函数（回调函数），这极大地增强了替换的灵活性。
- 返回值： 一个部分或全部匹配项被替换的新字符串。

```js
let p =
  "The quick brown fox jumps over the lazy dog. If the dog barked, was it a quick dog?";
// 当 searchValue 是字符串时，只替换第一个匹配项
console.log(p.replace("dog", "monkey"));
// "The quick brown fox ... lazy monkey. If the dog barked..."

// 使用带 g (全局)标志的正则表达式，替换所有匹配项
console.log(p.replace(/dog/g, "cat"));
// "The quick brown fox ... lazy cat. If the cat barked..."
```

#### replaceAll(searchValue, newValue)

- 功能： 替换所有匹配的子串。
- 参数： `searchValue` (必需): 字符串或必须带 g 标志的正则表达式。`newValue` (必需): 用于替换的字符串或函数。
- 返回值： 所有匹配项被替换的新字符串。
- 如果它的第一个参数 `searchValue` 是一个正则表达式，那么这个正则表达式必须包含全局标志 g。否则，会抛出一个 TypeError。这是为了防止开发者误用，因为一个不带 g 的 replaceAll 没有任何意义。

```js
let str = "I like cats. My favorite cats are Siamese cats.";
// 使用字符串直接替换所有 "cats"
console.log(str.replaceAll("cats", "dogs")); // "I like dogs. My favorite dogs are Siamese dogs."
```

#### toLowerCase() 和 toUpperCase()

- 功能： 分别将字符串转换为全小写或全大写。
- 参数： 无。
- 返回值： 转换后的新字符串, 原始字符串保持不变。

```js
let text = "Hello World!";
console.log(text.toLowerCase()); // "hello world!"
console.log(text.toUpperCase()); // "HELLO WORLD!"
```

#### trim(), trimStart(), trimEnd()

- 功能： 移除字符串开头、结尾或两端的空白字符 (空格、制表符、换行符等)。
- 参数： 无。
- 返回值： 移除空白后的新字符串, 原始字符串保持不变。

```js
let greeting = "   Hello there!   ";
console.log(greeting.trim()); // "Hello there!"
console.log(greeting.trimStart()); // "Hello there!   "
console.log(greeting.trimEnd()); // "   Hello there!"
```

#### split(separator, limit)

- 功能： 使用指定的分隔符将一个字符串分割成一个字符串数组。
- 参数： `separator` (必需): 用作分割依据的字符串或正则表达式。如果为空字符串 ""，则每个字符都会被分割。 `limit` (可选): 一个整数，限制返回的数组中的元素个数。
- 返回值： 一个包含分割后子串的数组。

```js
let csv = "2025,August,17,Sunday";
let parts = csv.split(",");
console.log(parts); // ["2025", "August", "17", "Sunday"]
let word = "character";
console.log(word.split("")); // ["c", "h", "a", "r", "a", "c", "t", "e", "r"]
```

#### padStart(targetLength, padString) 和 padEnd(targetLength, padString)

- 功能： 在当前字符串的开头 (padStart) 或结尾 (padEnd) 填充指定的字符串，直到达到目标长度。
- 参数：`targetLength` (必需): 最终生成的字符串的期望长度。
- `padString` (可选): 用来填充的字符串，默认为空格。
- 返回值： 填充后的新字符串。
- 如果目标长度 `targetLength` 小于或等于当前字符串的长度，这两个方法将不会进行任何填充，而是直接返回原始字符串, 需要填充的长度超过了`padString` 的长度，`padString` 将会被重复使用。如果重复后的 `padString` 超出了所需长度，它会被从末尾截断。

```js
let orderId = "123";
// 通常用于补全编号，如在开头补 0
console.log(orderId.padStart(8, "0")); // "00000123"

let label = "Chapter 1";
// 在结尾补点，用于对齐
console.log(label.padEnd(20, ".")); // "Chapter 1..........."
```

#### concat(...strings)

- 功能： 将一个或多个字符串与原字符串连接合并。
- 参数 `...strings` (必需): 一个或多个要连接的字符串。
- 返回值： 连接后的新字符串。

```js
let str1 = "Hello";
let str2 = "World";
console.log(str1.concat(" ", str2, "!")); // "Hello World!"
// 注意：在现代 JS 中，加号 `+` 或模板字符串 `` `${}` `` 是更常用和更高效的拼接方式。
// let result = str1 + ' ' + str2 + '!';
// let result = `${str1} ${str2}!`;
```

#### repeat(count)

- 功能： 将字符串重复指定的次数。
- 参数： count (必需): 一个整数，表示重复的次数。
- 返回值： 包含重复内容的新字符串。

repeat() 对 `count` 参数有严格的要求：

- count 为 0: 返回一个空字符串 ""。
- count 为负数: 抛出一个 RangeError 错误。
- count 为无穷大 (Infinity): 抛出一个 RangeError 错误。
- count 为小数: 会被向下取整。

```js
let cheer = "Go! ";
console.log(cheer.repeat(3)); // "Go! Go! Go! "

let separatorLine = "=".repeat(20);
console.log(separatorLine); // "===================="
```
