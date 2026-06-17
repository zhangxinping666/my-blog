---
title: RAG文档解析 - pypdf、LlamaParse、DeepDoc、SimpleDirectoryReader到底怎么选？
link: file-parse
catalog: true
date: 2026-05-05 13:00:00
description: RAG文档解析 - pypdf、LlamaParse、DeepDoc、SimpleDirectoryReader
tags:
  - python
  - agent
  - RAG
categories:
  - [Agent, RAG]
---

最近做 RAG 项目时，很多人第一步就卡在“文档解析”上。

表面看，好像都是把 PDF 里的内容读出来，但不知道要如何选择 `pypdf.extract_text()`、`LlamaParse`、`DeepDoc`、`SimpleDirectoryReader` 。

```text
SimpleDirectoryReader 是入口
pypdf.extract_text() 是底层文本抽取
LlamaParse 是面向 LLM 的文档解析服务
DeepDoc 是偏重型的文档理解流水线
```

## 1. 如何选择?

简单 PDF，本地快速抽字，用 `pypdf.extract_text()`。

需要保留标题、段落、表格、阅读顺序，做 RAG 数据预处理，优先看 `LlamaParse`。

扫描件、复杂表格、企业知识库、私有化部署场景，可以看 RAGFlow 里的 `DeepDoc`。

如果你只是想把一个目录里的文件统一加载进 LlamaIndex，`SimpleDirectoryReader` 才是入口，但它本身不决定解析质量。

## 2. 为什么 [pypdf](https://pypi.org/project/pypdf/)  不是“文档理解” 

`pypdf.extract_text()` 的定位很清楚，就是从 PDF 页面对象里提取文字。

```python
from pypdf import PdfReader

reader = PdfReader("a.pdf")
text = ""

for page in reader.pages:
    text += page.extract_text() or ""
```

它的优势是轻、快、本地、不需要 API key。根据 PyPI，`pypdf` 在 2026-05-09 发布到 `6.11.0`，说明这个库仍然很活跃。

但它的边界也很明显：PDF 本身不是为了机器理解设计的。pypdf 官方文档也强调，复杂 PDF 中表格、页眉页脚、阅读顺序、扫描件都会带来问题；如果页面本质是图片，pypdf 并不是 OCR 工具。

新版 pypdf 也支持 `extraction_mode="layout"`，可以尽量贴近页面布局：

```python
text = page.extract_text(extraction_mode="layout")
```

但要注意，这仍然不是语义解析。它只能尽力还原“看起来像什么”，不真正知道哪里是标题、哪里是表格、哪里是引用。

## 3. [LlamaParse](https://developers.api.llamaindex.ai/cloud/llamaparse)  的核心价值

LlamaParse 的思路不是“把字抽出来就完事”，而是把复杂文档变成更适合 LLM 使用的数据。

官方文档把它描述为把非结构化文档转成 LLM-ready data 的解析服务，支持文本、Markdown、JSON 等结果，当前 LlamaCloud 还强调 Agentic OCR 和 130+ 格式处理。

这意味着它更适合下面这种链路：

```text
PDF / DOCX / PPTX
        ↓
LlamaParse
        ↓
Markdown / JSON / 页面结构
        ↓
chunking
        ↓
embedding
        ↓
retrieval
        ↓
RAG answer
```

比如在 LlamaIndex 里，可以让 `SimpleDirectoryReader` 把 PDF 分发给 LlamaParse：

```python
from llama_parse import LlamaParse
from llama_index.core import SimpleDirectoryReader

parser = LlamaParse(
    api_key="llx-...",
    result_type="markdown",
)

documents = SimpleDirectoryReader(
    "./data",
    file_extractor={".pdf": parser},
).load_data()
```

我的判断是：如果目标是 RAG，而不是单纯抽字，LlamaParse 通常比 pypdf 更接近生产需求。

但它的问题也现实：云服务、成本、延迟、数据上传、合规审查。这些不是技术小问题，而是项目能不能上线的问题。

## 4. [DeepDoc](https://raw.githubusercontent.com/infiniflow/ragflow/main/deepdoc/README.md)  更像“文档理解基础设施”

这里的 DeepDoc 指 RAGFlow 中的 DeepDoc。

DeepDoc 做的事情更重。官方 README 里把它分成 vision 和 parser 两部分，vision 里有 OCR、layout recognition、table structure recognition。它还会处理表格旋转、表格结构、图表、页面坐标等问题。

它的 PDF parser 输出不只是纯文本，还包括：

```text
带页面位置的文本块
表格裁剪图和表格内容
图片、caption、图片内文本
```

所以 DeepDoc 更适合这类场景：

```text
扫描件 PDF
表格密集型财报
合同、说明书、企业制度文档
需要私有化部署的知识库
对引用、溯源、页面定位要求高的系统
```

但 DeepDoc 的代价也很明显。RAGFlow 官方自托管要求至少 4 核 CPU、16GB RAM、50GB 磁盘，并依赖 Docker。它不是一个随手 pip install 就能结束的轻量 parser，而更像企业 RAG 平台里的文档处理底座。

## 5. [SimpleDirectoryReader](https://developers.llamaindex.ai/python/framework/module_guides/loading/simpledirectoryreader/)  不负责“变聪明”

`SimpleDirectoryReader` 很容易被误解。

它的作用是读取目录、识别文件类型、调用对应 reader，最后返回 LlamaIndex 的 `Document` 对象。

```python
from llama_index.core import SimpleDirectoryReader

documents = SimpleDirectoryReader(
    input_dir="./data",
    recursive=True,
    required_exts=[".pdf", ".docx"],
).load_data()
```

它可以扫描目录、递归读取、限制后缀、附加文件元数据，也可以通过 `file_extractor` 替换默认解析器。

但它自己不是高级解析器。

所以真正影响质量的是：

```text
.pdf 默认 reader 是谁？
是否替换成 LlamaParse？
是否走 DeepDoc？
是否需要 OCR？
是否要保留表格结构？
```

`SimpleDirectoryReader` 更像调度入口，不是解析能力本身。

## 6. 四者对比

| 组件 | 定位 | 适合场景 | 优点 | 主要问题 |
|---|---|---|---|---|
| `pypdf.extract_text()` | 底层 PDF 文本抽取 | 简单 PDF、本地 baseline | 免费、本地、快 | 结构弱，不做 OCR |
| `LlamaParse` | 云端 LLM 文档解析 | RAG 数据预处理、复杂 PDF | Markdown/JSON 友好，结构更好 | 成本、延迟、数据合规 |
| `DeepDoc` | 文档理解流水线 | 扫描件、表格、企业知识库 | OCR、布局、表格能力强 | 部署重、维护成本高 |
| `SimpleDirectoryReader` | 文件加载入口 | LlamaIndex 多文件导入 | 简单统一，可扩展 | 解析质量取决于背后 parser |

## 7. 现在的技术趋势

截至 2026-05-10，文档解析已经不只是“PDF 转文本”了。

RAGFlow 已经把 DeepDoc 放在“深度文档理解”位置，并且在更新记录里提到支持 MinerU、Docling 等文档解析方法。LlamaCloud 也把 Parse、Extract、Classify、Split、Index 拆成更完整的文档智能链路。

这里有个变化值得注意：

```text
过去：提取文本 → 分块 → 向量化
现在：解析结构 → 保留版面 → 表格/图片理解 → 生成可引用 chunk → 检索
```

也就是说，RAG 的质量问题，很多时候不是 embedding 模型不行，而是文档一开始就被解析坏了。

## 8. 选型建议

如果只是做 demo：

```text
SimpleDirectoryReader + 默认 PDF reader
或
pypdf.extract_text()
```

如果要做一个像样的 RAG：

```text
SimpleDirectoryReader + LlamaParse
```

如果数据不能出内网：

```text
Docling / MinerU / DeepDoc / 自建 OCR pipeline
```

如果是企业知识库，并且文档质量很差：

```text
RAGFlow + DeepDoc
或者自建 DeepDoc 类似流水线
```

如果文档主要是电子版 PDF，排版简单，不要一上来就上重型方案。先用 pypdf 做 baseline，把失败样本收集出来，再决定是否升级到 LlamaParse 或 DeepDoc。

## 结尾

这四个工具不是谁替代谁，而是处在不同的层级，选择的不是最优，而是最合适。

真正合理的架构应该是：

```text
目录入口：SimpleDirectoryReader
简单文件：pypdf
复杂文件：LlamaParse
扫描件/企业复杂文档：DeepDoc
最终目标：高质量 Document / chunk / citation
```
