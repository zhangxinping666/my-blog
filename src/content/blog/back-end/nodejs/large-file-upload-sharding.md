---
title: 大文件上传：分片上传与断点续传的深度实现
link: large-file-upload-sharding
catalog: true
date: 2026-02-01 22:31:24
description: 深入探讨 2GB+ 大文件的分片切割、SHA-256 哈希校验、指数退避重试机制以及后端流式合并与安全防护。
tags:
  - 大文件上传
  - 分片上传
categories:
  - [后端, NodeJs]
  - [前端, Vue]
---

上一篇我们实现了并发控制和安全防线，解决了多文件上传的问题。但如果面试官继续追问："如果用户要上传一个 2GB 的视频文件怎么办？"或者"上传到一半网络断了，用户需要从头开始吗？"这就需要分片上传和断点续传了。

## 核心概念

### 分片上传 - 大文件切割

传统的文件上传是将整个文件一次性发送到服务器，这对于大文件来说有几个致命问题：

- 浏览器内存溢出：一次性读取 2GB 文件到内存，浏览器直接崩溃
- 请求超时：大文件传输时间长，容易触发服务器超时限制
- 失败代价高：上传 99% 时网络断开，所有进度全部丢失

分片上传的核心思路是：**将大文件切成小块（如 2MB），逐个上传，最后在服务器端合并**。

```plain
┌─────────────────────────────────────────────────────┐
│                    2GB 视频文件                       │
└─────────────────────────────────────────────────────┘
                         ↓ Blob.slice()
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ 2MB  │ │ 2MB  │ │ 2MB  │ │ ...  │ │ 2MB  │  共 1024 个分片
└──────┘ └──────┘ └──────┘ └──────┘ └──────┘
    ↓        ↓        ↓        ↓        ↓
┌─────────────────────────────────────────────────────┐
│              服务器 chunks/{hash}/ 目录               │
│   000000   000001   000002   ...   001023           │
└─────────────────────────────────────────────────────┘
                         ↓ 合并
┌─────────────────────────────────────────────────────┐
│                    完整视频文件                       │
└─────────────────────────────────────────────────────┘
```

### 断点续传 - 网络中断恢复

断点续传的原理很简单：**上传前先问服务器"你已经收到了哪些分片？"，然后只上传缺失的部分**。

```js
// 伪代码：断点续传核心逻辑
const uploadedChunks = await 查询服务器已有分片(fileHash);
for (let i = 0; i < totalChunks; i++) {
  if (uploadedChunks.includes(i)) continue; // 跳过已上传的
  await 上传分片(chunks[i]);
}
await 合并分片();
```

### 文件哈希 - 唯一标识

如何判断两次上传的是同一个文件？我们需要计算文件的哈希值作为唯一标识。这里使用 **SHA-256** 而不是 MD5，因为现代 CPU 对 SHA-256 有硬件加速，实际速度比 MD5 快 2-4 倍。

```js
// 使用 Web Crypto API 计算 SHA-256
const hashBuffer = await crypto.subtle.digest("SHA-256", fileBuffer);
```

## 前端实现

我们在现有代码基础上，新增分片上传的核心函数。整体思路是：先计算文件哈希作为唯一标识，然后将文件切成固定大小的分片，逐个上传到服务器，最后通知服务器合并。

### 分片配置

首先我们需要确定分片的大小。这是一个需要权衡的决策点：

- 太小（如 256KB）：分片数量多，HTTP 请求开销大，每个请求都有 TCP 握手和 HTTP 头部的额外成本
- 太大（如 10MB）：单个分片失败后重传代价高，在不稳定网络下容易超时
- 2MB：适合大多数网络环境，是一个经过实践验证的平衡点

```ts
// 分片大小：固定 2MB，简单可靠
const CHUNK_SIZE = 2 * 1024 * 1024;
```

### 计算文件哈希

文件哈希是整个分片上传和断点续传的基石。我们使用浏览器原生的 **Web Crypto API** 来计算 SHA-256 哈希值。这个 API 的优势在于：

1. 原生实现，性能远超 JS 库
2. 现代 CPU 对 SHA-256 有硬件加速（Intel SHA-NI 指令集）
3. 返回的是 ArrayBuffer，需要转换为十六进制字符串便于传输

```ts
// 使用 Web Crypto API 计算 SHA-256（比 MD5 更快）
const calculateHash = async (file: File): Promise<string> => {
  // 将文件读取为 ArrayBuffer，这一步会将整个文件加载到内存
  const buffer = await file.arrayBuffer();
  // 调用原生加密 API 计算哈希
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  // 将 ArrayBuffer 转换为十六进制字符串
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};
```

### 切割文件为分片

文件切割使用的是 **Blob.slice()** 方法。这个方法有一个非常重要的特性：它是**惰性的**（lazy）。调用 `slice()` 并不会立即读取文件内容到内存，而是创建一个指向原文件特定区域的引用。只有在实际使用这个分片（比如通过 FormData 发送）时，才会真正读取对应的字节。

这意味着即使是一个 10GB 的文件，切成 5000 个分片，内存中也只是存储了 5000 个轻量级的 Blob 引用，而不是 10GB 的数据。

```ts
// 使用 Blob.slice() 切割文件，不会一次性读取整个文件到内存
const createChunks = (file: File): Blob[] => {
  const chunks: Blob[] = [];
  let start = 0;
  // 循环切割，每次取 CHUNK_SIZE 大小的片段
  while (start < file.size) {
    // slice(start, end) 返回 [start, end) 区间的数据引用
    chunks.push(file.slice(start, start + CHUNK_SIZE));
    start += CHUNK_SIZE;
  }
  return chunks;
};
```

### 上传单个分片（带重试）

网络环境是不可预测的，单个分片上传可能因为网络抖动、服务器繁忙等原因失败。为了提高上传的健壮性，我们实现了**指数退避重试**策略：

- 第一次失败：等待 1 秒后重试
- 第二次失败：等待 2 秒后重试
- 第三次失败：等待 4 秒后重试
- 超过最大重试次数：抛出错误，由上层处理

这种策略的好处是，在服务器临时过载的情况下，逐渐增加的等待时间给了服务器恢复的机会，同时避免了频繁重试造成的雪崩效应。

```ts
const uploadChunk = async (
  chunk: Blob,
  index: number,
  hash: string,
  filename: string,
  retryCount = 3,
): Promise<void> => {
  // 构建 FormData，这是分片上传的标准格式
  const formData = new FormData();
  formData.append("chunk", chunk);
  formData.append("index", index.toString());
  formData.append("hash", hash);
  formData.append("filename", filename);

  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      await axios.post("http://localhost:3000/upload/chunk", formData, {
        timeout: 60000, // 60秒超时，大分片需要足够的传输时间
      });
      return; // 成功则返回
    } catch (error) {
      if (attempt === retryCount) throw error;
      // 指数退避：1s, 2s, 4s
      const delay = 1000 * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
};
```

### 完整上传流程（含断点续传）

现在我们把所有模块组合起来，实现完整的上传流程。这个流程包含六个关键步骤：

1. **计算哈希**：生成文件的唯一标识，用于后续的分片管理和断点续传
2. **初始化状态**：在响应式 Map 中记录上传状态，用于 UI 展示
3. **查询已有分片**：这是断点续传的核心，询问服务器已经收到了哪些分片
4. **上传缺失分片**：跳过已存在的分片，只上传缺失的部分
5. **请求合并**：所有分片上传完成后，通知服务器将分片合并为完整文件
6. **更新状态**：标记上传成功或失败

整个过程中，我们使用 Vue 3 的 `reactive` 来管理上传状态。这里有一个技巧：使用 `Map` 而不是普通对象，是因为 Map 的键可以是任意值（我们用文件哈希作为键），而且 Vue 3 对 Map 有完整的响应式支持。

```ts
// 上传状态接口定义
interface UploadState {
  file: File;
  hash: string;
  status: "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

// 使用 Map 存储多个文件的上传状态，键为文件哈希
const uploadStates = reactive<Map<string, UploadState>>(new Map());

const uploadFile = async (file: File) => {
  // 1. 计算文件哈希 - 这是后续所有操作的基础
  const hash = await calculateHash(file);
  const chunks = createChunks(file);
  const totalChunks = chunks.length;

  // 2. 初始化上传状态 - 用于 UI 展示
  uploadStates.set(hash, {
    file,
    hash,
    status: "uploading",
    progress: 0,
  });

  try {
    // 3. 【断点续传关键】查询服务器已有哪些分片
    // 如果是新上传，返回空数组；如果是续传，返回已有的分片索引
    const res = await axios.get(`http://localhost:3000/upload/status/${hash}`);
    const uploaded = new Set<number>(res.data.uploadedChunks);

    console.log(
      `文件 ${file.name} 已上传 ${uploaded.size}/${totalChunks} 个分片`,
    );

    // 4. 只上传缺失的分片 - 这就是断点续传的实现
    let completed = uploaded.size;
    for (let i = 0; i < totalChunks; i++) {
      if (uploaded.has(i)) continue; // 跳过已上传的分片

      await uploadChunk(chunks[i], i, hash, file.name);
      completed++;

      // 实时更新进度，让用户看到上传进展
      const state = uploadStates.get(hash);
      if (state) {
        state.progress = Math.round((completed / totalChunks) * 100);
      }
    }

    // 5. 所有分片上传完成，请求服务器合并
    // 传入预期大小用于服务器端校验
    await axios.post("http://localhost:3000/upload/merge", {
      hash,
      filename: file.name,
      totalChunks,
      expectedSize: file.size,
    });

    // 6. 标记上传成功
    const state = uploadStates.get(hash);
    if (state) {
      state.status = "success";
      state.progress = 100;
    }
  } catch (error) {
    // 错误处理：记录错误信息，UI 可以展示重试按钮
    const state = uploadStates.get(hash);
    if (state) {
      state.status = "error";
      state.error = error instanceof Error ? error.message : "上传失败";
    }
  }
};
```

### 进度显示组件

有了上传状态数据，我们需要一个组件来展示。这个组件遍历 `uploadStates` Map，为每个正在上传的文件显示进度条和状态。

组件的几个设计要点：

- 使用 `v-for` 遍历 Map 时，解构为 `[hash, state]` 键值对
- 进度条使用 CSS `width` 百分比实现，配合 `transition` 实现平滑动画
- 错误状态下显示重试按钮，提升用户体验

```js
<template>
  <div class="upload-list">
    <div v-for="[hash, state] in uploadStates" :key="hash" class="upload-item">
      <div class="file-info">
        <span class="filename">{{ state.file.name }}</span>
        <span class="status" :class="state.status">
          {{ state.status === 'uploading' ? '上传中' : state.status === 'success' ? '成功' : '失败' }}
        </span>
      </div>

      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: state.progress + '%' }"
          :class="{ error: state.status === 'error' }"
        ></div>
      </div>
      <span class="progress-text">{{ state.progress }}%</span>

      <div v-if="state.status === 'error'" class="error-info">
        <span>{{ state.error }}</span>
        <button @click="retryUpload(state.file)">重试</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-item {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 10px;
}
.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin: 8px 0;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  transition: width 0.2s;
}
.progress-fill.error {
  background: #f44336;
}
.status.uploading { color: #1976d2; }
.status.success { color: #4caf50; }
.status.error { color: #f44336; }
</style>
```

### 后端实现

后端需要新增三个核心接口来配合前端的分片上传：**接收分片**、**查询状态**、**合并分片**。此外还需要处理文件名安全和过期分片清理。

### 目录结构

在开始编码前，我们先明确服务器端的文件组织结构。分片临时存储在 `chunks/` 目录下，以文件哈希为子目录名，每个分片以索引命名。合并完成的文件存储在 `uploads/` 目录。

```plain
server/
  ├── uploads/      # 完整文件存储
  ├── chunks/       # 临时分片存储
  │   └── {hash}/   # 每个文件的分片目录
  │       ├── 000000
  │       ├── 000001
  │       └── ...
  └── index.js
```

### 接收分片接口

这是分片上传的入口接口。每次请求接收一个分片，将其存储到对应的目录中。

关键设计点：

- **以哈希为目录名**：相同文件的分片会自动归类到同一目录，便于管理和合并
- **零填充命名**：使用 `padStart(6, '0')` 确保分片按数字顺序排列，避免 `1, 10, 2` 这样的字典序问题
- **使用 `fs.renameSync`**：Multer 已经将文件保存到临时目录，我们只需要移动到目标位置，比复制更高效

```js
// 首先确保分片存储目录存在
const chunksDir = path.join(__dirname, "chunks");
if (!fs.existsSync(chunksDir)) {
  fs.mkdirSync(chunksDir);
}

// 接收单个分片
app.post("/upload/chunk", upload.single("chunk"), (req, res) => {
  const { index, hash, filename } = req.body;

  // 参数校验：确保必要信息都已提供
  if (!req.file || !hash || index === undefined) {
    return res.status(400).json({ msg: "参数不完整" });
  }

  // 以文件哈希为文件夹名存储分片
  // 这样相同文件的分片会自动归类在一起
  const chunkDir = path.join(chunksDir, hash);
  if (!fs.existsSync(chunkDir)) {
    fs.mkdirSync(chunkDir, { recursive: true });
  }

  // 使用零填充命名（000000, 000001...），确保排序正确
  // 6位数字支持最多 999999 个分片，对于 2MB 分片大小，可支持约 2TB 文件
  const chunkPath = path.join(chunkDir, String(index).padStart(6, "0"));
  fs.renameSync(req.file.path, chunkPath);

  res.json({ msg: "分片上传成功", index: parseInt(index) });
});
```

### 查询上传状态接口（断点续传核心）

这个接口是实现断点续传的关键。前端在开始上传前调用此接口，获取服务器已经收到的分片列表，然后跳过这些分片，只上传缺失的部分。

接口设计非常简单：根据文件哈希找到对应的分片目录，读取目录中的所有文件名（即分片索引），返回给前端。如果目录不存在，说明是新上传，返回空数组。

```js
// 查询已上传的分片列表
// 这个接口是断点续传的核心，前端据此决定哪些分片需要上传
app.get("/upload/status/:hash", (req, res) => {
  const { hash } = req.params;
  const chunkDir = path.join(chunksDir, hash);

  // 目录不存在说明是新上传，返回空数组
  if (!fs.existsSync(chunkDir)) {
    return res.json({ uploadedChunks: [] });
  }

  // 读取目录中的所有分片文件，提取索引
  // 过滤条件：只保留纯数字命名的文件（排除 .DS_Store 等系统文件）
  const uploadedChunks = fs
    .readdirSync(chunkDir)
    .filter((name) => /^\d+$/.test(name))
    .map((name) => parseInt(name))
    .sort((a, b) => a - b);

  res.json({ uploadedChunks });
});
```

### 合并分片接口

当所有分片上传完成后，前端调用此接口通知服务器进行合并。这是整个上传流程中最关键的一步，需要处理多个边界情况：

1. **分片完整性检查**：确保收到的分片数量与预期一致
2. **流式合并**：使用 `createWriteStream` 逐个写入分片，避免一次性加载所有分片到内存
3. **大小校验**：合并后检查文件大小是否与预期一致，防止数据丢失
4. **安全校验**：复用现有的二进制魔数校验，确保文件类型合法
5. **清理工作**：合并成功后删除临时分片目录，释放磁盘空间
6. **错误回滚**：如果合并过程中出错，删除不完整的目标文件

```js
// 合并所有分片为完整文件
app.post("/upload/merge", express.json(), async (req, res) => {
  const { hash, filename, totalChunks, expectedSize } = req.body;
  const chunkDir = path.join(chunksDir, hash);

  // 首先检查分片目录是否存在
  if (!fs.existsSync(chunkDir)) {
    return res.status(400).json({ msg: "分片目录不存在" });
  }

  // 检查分片完整性：实际分片数量必须等于预期数量
  const existingChunks = fs
    .readdirSync(chunkDir)
    .filter((name) => /^\d+$/.test(name))
    .sort((a, b) => parseInt(a) - parseInt(b));

  if (existingChunks.length !== totalChunks) {
    return res.status(400).json({
      msg: "分片不完整",
      expected: totalChunks,
      received: existingChunks.length,
    });
  }

  // 安全处理文件名，防止路径穿越攻击
  const safeFilename = sanitizeFilename(filename);
  const filePath = path.join(uploadDir, `${Date.now()}-${safeFilename}`);

  try {
    // 使用流式写入合并分片，避免内存溢出
    // 对于 2GB 的文件，如果一次性读取所有分片，内存会直接爆掉
    const writeStream = fs.createWriteStream(filePath);

    // 按顺序读取并写入每个分片
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(chunkDir, String(i).padStart(6, "0"));
      const chunkBuffer = fs.readFileSync(chunkPath);
      writeStream.write(chunkBuffer);
    }

    // 等待写入流完成
    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
      writeStream.end();
    });

    // 验证合并后的文件大小是否与预期一致
    // 这一步可以检测出传输过程中的数据丢失
    const stats = fs.statSync(filePath);
    if (expectedSize && stats.size !== expectedSize) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ msg: "文件大小不匹配，合并失败" });
    }

    // 复用现有的二进制魔数校验，确保文件类型合法
    // 这是最后一道安全防线，防止恶意文件伪装
    const buffer = Buffer.alloc(8);
    const fd = fs.openSync(filePath, "r");
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);

    if (!isJPG(buffer) && !isPNG(buffer) && !isPDF(buffer)) {
      fs.unlinkSync(filePath);
      return res.status(403).json({ msg: "安全警告：文件类型验证失败" });
    }

    // 合并成功，清理临时分片目录
    fs.rmSync(chunkDir, { recursive: true });

    res.json({
      msg: "文件合并成功",
      filename: path.basename(filePath),
      size: stats.size,
    });
  } catch (error) {
    // 出错时清理可能已创建的不完整文件
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({ msg: "合并失败: " + error.message });
  }
});
```

### 文件名安全处理

文件名安全是一个容易被忽视但非常重要的安全点。攻击者可能通过构造特殊的文件名来实现**路径穿越攻击**（Path Traversal），例如 `../../etc/passwd` 这样的文件名，如果不经处理直接拼接路径，可能会将文件写入到系统敏感目录。

我们的安全处理策略包括：

- **Unicode 规范化**：防止通过不同编码形式绕过检查
- **移除危险字符**：删除 `<>:"/\|?*` 等在文件系统中有特殊含义的字符
- **提取文件名**：使用 `path.basename()` 确保只保留文件名部分
- **长度限制**：过长的文件名可能导致文件系统错误

```js
const sanitizeFilename = (filename) => {
  // Unicode NFC 规范化，防止字符编码绕过
  // 例如 é 可以表示为单个字符或 e + 重音符的组合
  let safe = filename.normalize("NFC");

  // 移除在 Windows/Linux 文件系统中有特殊含义的危险字符
  // 同时移除控制字符 (0x00-0x1f)
  safe = safe.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_");

  // 只保留文件名部分，丢弃任何路径信息
  // 这是防止路径穿越攻击的关键步骤
  safe = path.basename(safe);

  // 限制文件名长度，大多数文件系统限制在 255 字节
  // 我们保守地限制在 200 字符
  if (safe.length > 200) {
    const ext = path.extname(safe);
    safe = safe.slice(0, 200 - ext.length) + ext;
  }

  return safe || "unnamed";
};
```

### 启动时清理过期分片

用户可能在上传过程中关闭浏览器，或者上传失败后没有重试，这些情况会在服务器上留下未完成的分片目录。如果不清理，随着时间推移会占用大量磁盘空间。

我们的策略是在服务器启动时执行一次清理，删除超过 24 小时的未完成上传。这个时间阈值的选择考虑了：

- 太短：用户可能第二天继续上传，不应该删除
- 太长：占用磁盘空间
- 24 小时：一个合理的平衡点

```js
// 清理超过 24 小时的未完成上传
// 这些是用户中途放弃或上传失败后遗留的分片
const cleanupOrphanedChunks = () => {
  const maxAgeMs = 24 * 60 * 60 * 1000; // 24 小时
  const now = Date.now();

  if (!fs.existsSync(chunksDir)) return;

  const sessions = fs.readdirSync(chunksDir);

  for (const sessionId of sessions) {
    const sessionPath = path.join(chunksDir, sessionId);
    try {
      // 检查目录的最后修改时间
      const stats = fs.statSync(sessionPath);
      if (now - stats.mtimeMs > maxAgeMs) {
        // 超过 24 小时，删除整个分片目录
        fs.rmSync(sessionPath, { recursive: true });
        console.log(`[清理] 已删除过期分片: ${sessionId}`);
      }
    } catch (error) {
      console.error(`[清理] 处理 ${sessionId} 时出错:`, error.message);
    }
  }
};

// 服务器启动时执行一次清理
cleanupOrphanedChunks();
```

### 完整流程图

最后，让我们通过一个完整的流程图来回顾整个分片上传和断点续传的过程：

```plain
用户选择文件
     ↓
计算文件 SHA-256 哈希（生成唯一标识）
     ↓
查询服务器 GET /upload/status/{hash}
     ↓
获取已上传分片列表 [0, 1, 2, ...]
     ↓
切割文件为 2MB 分片
     ↓
循环上传缺失分片 POST /upload/chunk
  ├── 分片 0 (已存在，跳过)
  ├── 分片 1 (已存在，跳过)
  ├── 分片 2 → 上传 → 更新进度
  ├── 分片 3 → 上传 → 更新进度
  └── ...
     ↓
所有分片上传完成
     ↓
请求合并 POST /upload/merge
     ↓
服务器合并分片 + 大小校验 + 安全校验
     ↓
清理临时分片目录
     ↓
返回上传成功
```

下一篇我们将实现文件管理功能：列表展示、下载、删除，完成文件上传系统的最后一块拼图。
