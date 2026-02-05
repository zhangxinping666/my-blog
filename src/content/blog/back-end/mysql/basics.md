---
title: MySQL 基础
link: basics
catalog: true
date: 2025-01-05 14:00:00
description: MySQL 数据库的基础操作和常用 SQL 语句。
tags:
  - MySQL
  - SQL
  - 数据库
categories:
  - [后端, MySQL]
---

## 基础管理与 SQL 分类

* **服务控制**：
* 通过 `services.msc` 管理。
* 命令行：`net start mysql80` / `net stop mysql80`。


* **SQL 四大分类**：
* **DDL (Data Definition Language)**：定义数据库、表、字段（`CREATE`, `DROP`, `ALTER`）。
* **DML (Data Manipulation Language)**：对数据进行增删改（`INSERT`, `UPDATE`, `DELETE`）。
* **DQL (Data Query Language)**：查询数据（`SELECT`）。
* **DCL (Data Control Language)**：控制访问权限与用户管理（`GRANT`, `REVOKE`）。



## DQL 数据查询

这是日常开发中最常用的部分，博客中详细列出了执行顺序：

* **基础查询**：字段别名、去重。
* **条件查询**：`WHERE` 子句（比较运算符、逻辑运算符、模糊查询 `LIKE`）。
* **聚合函数**：`COUNT`, `MAX`, `MIN`, `AVG`, `SUM`（纵向计算）。
* **分组查询**：`GROUP BY`，以及分组后的过滤 `HAVING`。
* **排序与分页**：`ORDER BY` (ASC/DESC) 和 `LIMIT` (起始索引, 查询记录数)。
* **执行顺序**：`FROM` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY` → `LIMIT`。

## 函数与约束

* **内置函数**：
* **字符串**：`CONCAT`, `LOWER`, `UPPER`, `SUBSTR`。
* **数值**：`CEIL`, `FLOOR`, `RAND`, `ROUND`。
* **日期**：`CURDATE`, `NOW`, `DATEDIFF`。
* **流程控制**：`IF`, `IFNULL`, `CASE...WHEN`。


* **约束机制**：
* 用于保证数据一致性：`NOT NULL`, `UNIQUE`, `PRIMARY KEY`, `DEFAULT`, `CHECK`。
* **外键 (FOREIGN KEY)**：关联两张表，确保数据的完整性。



## 多表查询

* **连接查询 (Join)**：
* **内连接**：查询交集数据。
* **外连接**：左外连接（左表全部+交集）、右外连接（右表全部+交集）。
* **自连接**：表与自身进行连接。


* **联合查询 (Union)**：将多次查询结果合并（注意 `UNION ALL` 会保留重复行）。
* **子查询**：嵌套查询，分为标量子查询（单值）、列子查询（一列）、行子查询（一行）、表子查询（多行多列）。

## 事务 Transaction

* **核心特性 (ACID)**：
1. **原子性** (Atomicity)：事务是不可分割的最小单元。
2. **一致性** (Consistency)：完成后数据保持一致。
3. **隔离性** (Isolation)：并发事务互不干扰。
4. **持久性** (Durability)：一旦提交，修改是永久的。


* **并发事务问题**：脏读、不可重复读、幻读。
* **隔离级别**：`Read Uncommitted`、`Read Committed`、`Repeatable Read`（MySQL 默认）、`Serializable`。

---

**学习建议：**
你整理的这份基础非常扎实。在准备简历时，建议将“多表查询中的复杂子查询”和“事务隔离级别的原理”作为亮点。如果有需要，我可以针对其中某一个模块（比如多表查询的 SQL 写法）为你出几道练习题。