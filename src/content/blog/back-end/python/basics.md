---
title: Python 基础
link: basics
catalog: true
date: 2025-01-05 16:00:00
description: Python 语言的基础语法和常用特性介绍。
tags:
  - Python
  - Flask
  - FastAPI
categories:
  - [后端, Python]
---

## 环境与基础概念

Python 是一种**解释型**、**面向对象**、**动态数据类型**的高级编程语言。

### 变量与命名

Python 中的变量不需要声明类型，直接赋值即可使用。

* **命名规则**：由字母、数字和下划线组成，不能以数字开头。
* **风格习惯**：推荐使用蛇形命名法（snake_case），如 `user_name`。

### 标准输入输出

```python
print("Hello Python")           # 输出
name = input("请输入你的名字: ") # 输入（结果始终为字符串）

```

---

## 数据类型

Python 拥有丰富且灵活的数据类型：

### 基础类型

* **数字**：整数 (`int`)、浮点数 (`float`)、复数 (`complex`)。
* **布尔**：`True` 和 `False`。

### 容器类型

| 类型 | 特点 | 示例 |
| --- | --- | --- |
| **列表 (List)** | 有序、可变、允许重复 | `fruits = ["apple", "banana"]` |
| **元组 (Tuple)** | 有序、**不可变** | `coords = (10, 20)` |
| **字典 (Dict)** | 键值对、无序(3.7 后有序) | `user = {"name": "Gemini", "age": 1}` |
| **集合 (Set)** | 无序、**元素唯一** | `unique_ids = {1, 2, 3}` |

---

## 控制流程

### 条件判断

Python 使用**缩进**来表示代码块，这在其他语言中通常使用花括号 `{}`。

```python
score = 85
if score >= 90:
    print("优秀")
elif score >= 60:
    print("及格")
else:
    print("不及格")

```

### 循环结构

* **for 循环**：遍历序列。
* **while 循环**：条件满足时重复执行。

```python
# 遍历 0 到 4
for i in range(5):
    print(i)

# 遍历列表
for item in ["A", "B", "C"]:
    print(item)

```

---

## 函数与模块

### 定义函数

使用 `def` 关键字定义函数。

```python
def add_numbers(a, b=10):  # b 为默认参数
    """计算两数之和"""
    return a + b

result = add_numbers(5)    # 返回 15

```

### 模块导入

Python 的强大之处在于其丰富的库。

```python
import math
print(math.sqrt(16))      # 输出 4.0

from datetime import datetime
print(datetime.now())     # 输出当前时间

```

---

## 异常处理与文件操作

### 异常处理

防止程序因为小错误直接崩溃。

```python
try:
    num = 10 / 0
except ZeroDivisionError:
    print("错误：除数不能为零")
finally:
    print("操作完成")

```

### 文件读写

使用 `with` 语句可以自动关闭文件，防止内存泄露。

```python
# 写入文件
with open("test.txt", "w", encoding="utf-8") as f:
    f.write("Python 基础学习")

# 读取文件
with open("test.txt", "r", encoding="utf-8") as f:
    content = f.read()
    print(content)

```

---

## 学习路线建议

1. **基础阶段**：掌握上述语法、列表推导式、装饰器。
2. **进阶阶段**：面向对象编程 (OOP)、正则表达、多线程/多进程。
3. **应用阶段**：
* **Web 开发**：Django / Flask。
* **数据分析**：Pandas / Numpy / Matplotlib。
* **爬虫**：Requests / Scrapy。
* **人工智能**：PyTorch / TensorFlow。



---
