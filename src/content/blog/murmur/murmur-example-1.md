---
title: 碎碎念
link: murmur-example-1
catalog: true
date: 2024-01-04 00:00:00
description: 这是一篇碎碎念示例，展示碎碎念功能的使用方式。
tags:
  - 碎碎念
categories:
  - 碎碎念
---

这是一篇碎碎念示例，记录生活中的点滴想法。

## 关于碎碎念

碎碎念是记录日常随想的地方，适合：

- 生活感悟
- 随想随记
- 灵感记录
- 心情日记

## 碎碎念配置

在 `config/site.yaml` 中配置：

```yaml
featuredSeries:
  categoryName: 碎碎念       # 分类名称
  label: 碎碎念              # 显示标签
  fullName: 碎碎念
  description: 记录生活中的点滴想法...
  cover: /img/weekly_header.webp
  enabled: true              # 设为 false 可关闭
```

## 碎碎念特点

1. **专属页面** - 碎碎念有独立的 `/murmur` 页面
2. **首页展示** - 最新一篇会在首页置顶展示
3. **独立列表** - 碎碎念不会出现在普通文章列表中
4. **系列导航** - 碎碎念之间有上下篇导航

---

这就是一篇简单的碎碎念示例。
