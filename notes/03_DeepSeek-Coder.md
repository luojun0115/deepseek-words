---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 03 · DeepSeek-Coder 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [如何评价深度求索发布的开源代码大模型 DeepSeek Coder?（知乎问答）](https://www.zhihu.com/question/628883095/answer/3380290320) — 高赞长答，拆 1.3B/6.7B/33B 三档模型与预训练语料
- [【llm】DeepSeek Coder 论文速读（知乎）](https://zhuanlan.zhihu.com/p/686277024) — 速读版，聚焦 HumanEval 等 Pass@1 成绩与基准对比
- [DeepSeek-Coder 中文摘要页（alphaXiv 中文）](https://www.alphaxiv.org/zh/abs/2401.14196) — 讲 87% 源代码 + 10% 英文 + 3% 中文的数据构成
- [DeepSeek-Coder 研报式摘要（研报吧）](https://www.fxbaogao.com/detail/5439519) — 超越 Codex / GPT-3.5 的评测定位梳理
- [Brief Review — DeepSeek-Coder（Sh-tsang·Medium）](https://sh-tsang.medium.com/brief-review-deepseek-coder-when-the-large-language-model-meets-programming-the-rise-of-code-7e87d75ae8a6) — 英文简评，聚焦跨文件补全优势

### 视频（B站 / YouTube）
- [B站] [逐篇讲解 DeepSeek 关键 9 篇论文及创新点](https://www.bilibili.com/video/BV1xuK5eREJi/) — 系列课含 DeepSeek-Coder 专章（YouTube 版：https://www.youtube.com/watch?v=j5CSpSqNCJw ）
- [YouTube] [DeepSeek Coder v2: First Open Coding Model that Beats GPT-4 Turbo](https://www.youtube.com/watch?v=_elpZaJERD4) — 代码系列英文解读（ loose 涉及 Coder→Coder-V2 演进）

### 英文 & 社区
- [Hugging Face 论文页](https://huggingface.co/papers/2401.14196) — 官方收录页
- [alphaXiv 论文页](https://www.alphaxiv.org/abs/2401.14196) — CodeLlama 对比与社区问答
- [GitHub 官方仓库 deepseek-ai/DeepSeek-Coder](https://github.com/deepseek-ai/DeepSeek-Coder) — 官方仓库：权重、fill-in-the-middle 说明与评测表

---

# 代码语料生产线 + repo-level 预训练 + FIM 完整流程（含所有疑问点）

## 角色与核心思想

本文（arXiv:2401.14196）要回答一个问题：**把"写代码"这件事从头到尾喂给一个 Transformer，要做到什么程度才算喂对了？** 它给了三件互相咬合的设计：

- **一条代码语料生产线**：GitHub 公开仓库 → 规则过滤 → 依赖解析 + 拓扑排序 → 仓库级近去重 → 质量筛选 + 基准题去污染。产出的不是一堆孤立文件，而是**保持仓库结构、依赖在前、无重复、无泄漏**的训练样本。
- **repo-level 预训练**：不再是"一个文件一个样本"，而是把一个仓库的文件按依赖顺序拼成一条长序列，配合 16K 上下文窗口。前作都停在文件级，本文第一次在预训练期就这么干，换来跨文件补全能力。
- **Fill-in-the-Middle（FIM）**：训练时随机把文本切成三段、打乱重排，逼模型学会"看了前文和后文，补中间"。以 50% PSM 模式执行。

模型本体是 1.3B / 6.7B / 33B 三个 decoder-only Transformer，**从零**在 2T token 上预训练。下面用两次完整推演把机制走通：一次跟着**一份 HTML 文件**走完生产线的每一站，一次手工**构造一个 FIM 训练样本**。

---

## 推演一：一份 HTML 文件从 GitHub 仓库到训练 token 的旅程

设有一份文件 `webapp/index.html`，属于一个 Python + 前端混合的仓库。

### 阶段1：GitHub 抓取

```
抓取对象：2023年2月之前创建的 GitHub 公开仓库
保留范围：87 种编程语言的白名单（原文表1列出全部87种）
白名单核对：index.html → HTML ✓ 入队
```

原文明说数据源是 **GitHub 公开仓库**（不是 Common Crawl），按语言白名单保留 87 种语言中的文件。HTML 在最终语料里占 30.05 GB、14,998k 个文件、3.77%（原文表1）。最大的是 Java（148.66 GB、18.63%）和 Python（120.68 GB、15.12%）。

**疑问点①：为什么直接从 GitHub 抓、还设语言白名单？**
GitHub 上的代码天然带着"项目"结构（目录、依赖、README），这是后面 repo-level 处理的前提；随机网页抓来的代码片段没有仓库语境。语言白名单则是为了把长尾噪声（二进制、未知格式）挡在门外——87 种语言已经覆盖了主流量：表1里 87 种语言合计 797.92 GB / 603,173k 个文件，此后这条语料全部走下游流程。

### 阶段2：规则过滤

参照 StarCoder 的规则做粗筛，**过滤后总量只剩原来的 32.8%**（原文 §2.1）。对 `index.html` 逐条体检：

```
规则清单（原文）：
R1 平均行长度 > 100字符        → 剔除（多半是压缩/混淆的一行式代码）
R2 最大行长度 > 1000字符       → 剔除
R3 字母字符占比 < 25%          → 剔除（更像数据/乱码，不像代码）
R4 前100字符出现 "<?xml version=" → 剔除（XSLT 除外）
R5 HTML 专属：可见文本占代码比例 ≥ 20% 且 ≥ 100 字符 → 否则剔除
R6 JSON/YAML 专属：字符数必须在 50~5000 之间，否则剔除
```

我们的 index.html：行均长 60 字符 ✓、字母占比 61% ✓、可见文本占比 45% 且有 800 字符 ✓——**存活**。假设它身边的 10 个 HTML 文件里 4 个是纯 `<div>` 模板壳，被 R5 干掉。

**疑问点②：这一堆阈值分别在防什么？**
R1/R2 防"minified 压缩代码"——那种一行几万字符的 JS 对学语言结构毫无价值；R3 防"伪代码文件"（CSV、日志、序列化数据伪装成 .py）；R4 防自动生成的 XML 样板；R5 防"页面全是标签、几乎没有人类文字"的模板壳；R6 防把海量数据文件当语料。每一关都在把"占着字节数但不教语言"的文件剔出去——32.8% 这个数字就是粗筛的产出量级。

### 阶段3：依赖解析 + 拓扑排序

现在轮到**整个仓库**，不是单个文件。用正则抽文件间调用关系：Python 抓 `import`、C# 抓 `using`、C 抓 `include`（原文 §2.2）。设仓库结构：

```
utils.py      ← 被 app.py 和 test.py import   （依赖：无）
app.py        ← import utils                  （依赖：utils.py）
test.py       ← import app, utils             （依赖：app.py, utils.py）
index.html    ← 无代码依赖                     （孤立节点）

依赖图（边：被依赖者 → 依赖者）：
  utils.py → app.py → test.py
       └──────────────────↗
```

原文算法1的做法：`fileA depends on fileB` 时加边 B→A、`inDegree[A]+1`——所以**一个节点的入度 = 它还没排上场的依赖数**。反复挑入度最小的节点输出，输出后把它指向的节点的入度减一：

```
第1轮：utils.py 入度最小（0 个未排的依赖）→ 输出，app/test 入度-1
第2轮：app.py 入度 0 → 输出，test.py 入度-1
第3轮：test.py 输出；index.html 孤立，也入列
最终顺序：[utils.py, app.py, test.py, index.html]
```

之后把这一串文件**拼成一条序列**作为一个训练样本，并且**每个文件开头插一行路径注释**（如 `# webapp/app.py`），再交给 tokenizer 训进词表、随正文一起编码。

**疑问点③：为什么必须排序？随便排不行吗？**
模型训练目标是 next token prediction + 因果注意力：**每个位置只能看到它前面的内容**。如果把 `test.py` 排在 `utils.py` 前面，模型读到 `import utils` 时，`utils` 的实现还在序列后面，等于让它背一个没见过的函数名。排序保证"每个文件依赖的东西都排在它前面"，模型读 `import utils` 时目标是紧接着读出一个工厂函数或类定义——**补全 API 的习惯是这么养成的**。

**疑问点④：依赖图有环（A import B、B import A）怎么拓扑排序？**
标准拓扑排序要求无环。原文算法1的改动是：每轮**不挑入度为 0 的节点，而挑入度最小的节点**（原文步骤：`file ← argmin(inDegree[file] | file ∈ subgraph)`）。环上节点永远凑不出 0 入度，但"最小入度"总能选出一个来打破僵局，排序照常进行。代价是环内的排序未必是"真正"的依赖顺序，但比直接报错放弃整个仓库好得多。

**疑问点⑤：isolated / disconnected 子图怎么处理？**
算法1先 `getDisconnectedSubgraphs` 把仓库拆成互不相连的几个子图，每个子图独立排序，各排一条序列，最后返回排序序列列表。

**疑问点⑥：路径为什么要写成注释塞进正文？**
拼接后是一条长序列，文件边界自然消失。开头的路径注释有两个作用：一，告诉模型"你现在是新文件"；二，路径本身是强信号——`webapp/app.py` 暗示了目录结构和语言，这些信息训练时混进正文，推理时模型就能利用它做出更符合项目习惯的补全。

### 阶段4：仓库级近去重

近去重（near-deduplication）在 LLM 语料里是标准操作，但本文刻意改了粒度：**把"仓库拼接后的整体"当一个样本去重，而不是按文件去重**（原文 §2.3）。

**疑问点⑦：为什么不按文件去重？**
按文件去重会误伤：仓库里常有大量长得一样的样板文件（如多平台各自独立的 `LICENSE`、生成的绑定代码）；按文件筛会把它们剔掉，**仓库结构出现缺口**，阶段3辛苦排好的依赖链断了。整体去重只删"整个仓库都重复"的样本，保留库内多样性。引用的判据：Lee et al. 2022 证明去重能提升 LLM 表现，Kocetkov et al. 2022 证明近去重是代码基准上 competitive performance 的必要预处理。

### 阶段5：编译器 + 质量模型 + 基准题去污染

```
① 编译器 + 质量模型 + 启发式：剔除语法错误、可读性差、模块化差的代码（原文一句话，细节未展开）
② 去污染（原文规则很具体）：
   目标测试集：HumanEval / MBPP / GSM8K / MATH
   规则A：训练样本中出现与测试数据相同的 10-gram 字符串 → 整个文件剔除
   规则B：测试数据里的字符串短于 10-gram 但 ≥ 3-gram → 用精确匹配过滤
```

我们的 `index.html` 既不含 HumanEval 题面也没有任何 10-gram 命中 → **入库**。

**疑问点⑧：为什么 n-gram 阈值定在 10，而不是"全部精确比对"？**
基准测试集在 GitHub 上可能被公开讨论、贴出题面和解答，模型提前"背题"会让评测分数虚高。10-gram 是一个工程折衷：完整的题面/解答片段往往超过 10 个 token，10-gram 命中已足以识别泄漏，同时避免把所有正常英文/代码短语误伤（正常文本也常出现重复的 10 字符短语，所以配合**去掉 docstring、题面、解答整个文件**的粒度控制）。对短于 10-gram（≥3-gram）的测试串没法抽 n-gram，就退回逐串精确匹配。

### 阶段6：分词 + 打包成训练序列

- **Tokenizer**：HuggingFace Tokenizer 库、BPE 算法，在语料子集上训练，**词表 32,000**（原文 §3.2）。
- **打包**：把多个（仓库级）样本拼接成定长训练条目，模型目标仍是 next token prediction。
- 训练语料构成（原文开头）：**87% 源代码 + 10% 英文代码相关自然语言（GitHub Markdown + StackExchange）+ 3% 中文自然语言**。英文部分是给"库用法、bug 修复"这类理解任务垫的；中文部分纯为中文理解。

到这里，`index.html` 和同仓库的三个 .py 文件已经成为一条定长训练序列里的 token，进入 2T token 的预训练流。

---

## 推演二：一次 FIM 训练样本的构造

### 阶段0：为什么 NTP 不够、要 FIM？

补全工具最常见的需求不是"接着往下写"，而是**光标在中间、往光标处填代码**：前文约束了"该写什么"，后文约束了"写到哪结束"。纯 next token prediction 的因果注意力**永远看不到后文**，这个能力学不出来。FIM 的思路（引 Bavarian et al. 2022、Li et al. 2023）：训练时就把文本**故意打乱**，让"给定前缀和后缀、产出中间"这个任务以 NTP 的形式出现。

### 阶段1：掷骰子决定要不要 FIM

```
对每个文件（document 级，在 packing 之前）：
 掷骰子 r ~ Uniform(0,1)
 r < 0.5 → 走 FIM 流程（本文最终 FIM rate = 0.5，PSM 模式）
 r ≥ 0.5 → 原样走普通 NTP
```

**疑问点⑨：为什么 FIM rate 是 0.5，不做 100%？**
原文用 1.3B 模型、Python 子集、HumanEval-FIM 基准做了消融（原文图3），四组对照：**0% FIM、50% FIM、100% FIM、50% MSP**。结论有三层：
- 100% FIM rate 在 HumanEval-FIM 上**峰值最高**，但此时**普通代码补全能力最弱**——所有样本都在练填空，没人练"接着写"；
- 50% FIM + 50% 正常 NTP，是 FIM 能力和补全能力之间的平衡点，**最终采用 50% PSM**；
- 50% PSM 优于 50% MSP（T5 式遮住多个 span 训重建，CodeGen2.5 曾说 MSP 可能更好，此处实测 PSM 胜出）。
所以 0.5 不是拍脑袋，是在"保住补全"红线内尽量多做 FIM。

### 阶段2：切三段 + PSM 重排

设文件（一段 Python）为：

```
原文：def add(a, b):
      🞄    return a + b
      print(add(2, 3))

（🞄 = 随机切点）
f_pre    = "def add(a, b):\n"     ← prefix（前缀）
f_middle = "    return a + b\n"  ← middle（中间）
f_suf    = "print(add(2, 3))"    ← suffix（后缀）
```

PSM（Prefix-Suffix-Middle）模式重排，配三个哨兵 token（原文给出的具体格式）：

```
<｜fim_start｜> f_pre <｜fim_hole｜> f_suf <｜fim_end｜> f_middle <|eos_token|>

拼出来：
<｜fim_start｜>def add(a, b):
<｜fim_hole｜>print(add(2, 3))
<｜fim_end｜>    return a + b
<|eos_token|>
```

**疑问点⑩：middle 被挪到末尾、suffix 塞到 prefix 后面，这不是把语序打乱了吗？模型不会学坏？**
不会，这正是设计意图。模型在训练这个序列时，仍然做 next token prediction——只是每个位置"下一个"的内容变了。推理时模型读到 `<｜fim_end｜>` 这个位置，它的上文里已经有 prefix（在 fim_start 后）和 suffix（在 fim_hole 后），它输出的就是"照着这些约束填出来的 middle"。表面是打乱，实质是把"填空"翻译回了"预测下一个 token"，模型架构和训练目标**一行都不用改**。

**疑问点⑪：`<｜fim_hole｜>` 和 `<｜fim_end｜>` 各自干什么？**
- `<｜fim_start｜>`：宣布"此后是 prefix"，分隔上一段内容与本样本的 FIM 结构；
- `<｜fim_hole｜>`：prefix 和 suffix 的分界。这个位置**就是将来光标所在的洞**，模型在这里看到 suffix 开始"接上"；
- `<｜fim_end｜>`：suffix 结束、该输出 middle 了。这个位置是训练目标真正密集的地方。

**疑问点⑫：SPM（Suffix-Prefix-Middle）是干嘛的、本文用了吗？**
原文说 FIM 有两种模式：PSM 排成 Prefix,Suffix,Middle；SPM 排成 Suffix,Prefix,Middle，是"另一种结构挑战"。实验和最终训练配置都以 **PSM** 为准（原文图3消融、§3.1.2"0.5 FIM rate, PSM mode"），SPM 只是文中点到。

**疑问点⑬：为什么在 packing 之前、按 document 切？**
原文明确说"在 packing 之前、document 级实施 FIM"（引 Bavarian et al. 2023 的做法）。如果在打包成定长序列之后再切三段，切点会落在两个文件的接缝上，prefix/suffix/middle 语义就乱了；先在完整文档上切好、重排，再去做定长打包，保证三段各自完整。

---

## 训练细节速览（原文表2 + §3.3–3.7）

| 项 | 1.3B | 6.7B | 33B |
|---|---|---|---|
| 激活 | SwiGLU | SwiGLU | SwiGLU |
| Hidden | 2048 | 4096 | 7168 |
| FFN 中间层 | 5504 | 11008 | 19200 |
| 层数 | 24 | 32 | 62 |
| 注意力 | Multi-head ×16 | Multi-head ×32 | **GQA（group=8）** ×56 |
| Batch size | 1024 | 2304 | 3840 |
| 峰值 LR | 5.3e-4 | 4.2e-4 | 3.5e-4 |

- **优化器**：AdamW（β₁=0.9，β₂=0.95）；LR 三阶段调度，2000 步 warm-up，最终 LR = 初始的 10%，每阶段 LR 缩为前一阶段的 √(1/10)。
- **长上下文（16K）**：遵循线性缩放做法，把 RoPE 缩放系数从 11 加到 **44**、基频从 **10000 → 100000**，然后用 batch=512、序列长 16K **再训 1000 步**（LR 沿用预训练末期）。理论上模型可处理到 **64K** token，但实测 **16K 内输出最可靠**。
- **指令微调（Instruct 版）**：Alpaca 格式数据，对话轮之间用 `<|EOT|>` 分隔；cosine 调度、100 步 warm-up、LR 1e-5、batch 4M token、共 2B token。
- **33B 用 GQA（group=8）** + FlashAttention v2，训练和推理都省。

**疑问点⑭：RoPE 基频从 10000 加到 100000，凭什么这能让上下文变长？**
RoPE 把位置 m 编码成复数旋转，频率是 base 的幂：第 i 对分量转 1/10000^(2i/d) 圈。base 越大，同一对分量转得越慢，相邻 token 的相位差越小——远距离 token 的旋转区分度被"压缩"了。预训练模型在旧窗口内学到的注意力模式，在更长窗口里相位超纲、注意力就崩。放大 base（配合线性缩放系数 11→44）把"旧窗口"的相对相位结构**摊平到新窗口**上，模型只需再训 1000 步适应，即可外推到 16K 而不用从头重来。

**疑问点⑮：仓库级样本和 16K 窗口怎么配合？**
阶段3排好的顺序正是为了配合窗口：**依赖文件先入窗、依赖者后入窗**。窗口 16K 能装下若干个小文件 + 它们的依赖，模型读到一个 `import` 或一个函数调用时，被依赖方的定义往往还在上下文里，跨文件补全有据可依。窗口外的东西因果注意力看不到，所以排序只保证"窗口内"自洽。

---

## 关键数字与实验

| 指标 | 本文 | 出处 |
|---|---|---|
| 训练 token 总量 | 2T（从零预训练） | 原文摘要 |
| 语料构成 | 87% 代码 + 10% 英文 + 3% 中文 | 原文 §2 |
| 语言数 | 87 种 | 原文表1 |
| 清洗后语料 | 797.92 GB / 603,173k 文件 | 原文表1 |
| 规则过滤后 | 仅剩原始量的 32.8% | 原文 §2.1 |
| HTML 语料 | 30.05 GB / 14,998k 文件 / 3.77% | 原文表1 |
| 最大两门语言 | Java 148.66 GB (18.63%)、Python 120.68 GB (15.12%) | 原文表1 |
| 词表 | 32,000（BPE） | 原文 §3.2 |
| 上下文窗口 | 16K（理论 64K） | 原文 §3.6、结论 |
| FIM 配置 | 0.5 FIM rate，PSM 模式 | 原文 §3.1.2 |
| HumanEval-多语言均分(Base) | 33B 50.3%、6.7B 44.7%（CodeLlama-34B 41.0%） | 原文表3 |
| HumanEval-Python(Base) | 33B 56.1%、6.7B 49.4% | 原文表3 |
| MBPP | 33B 66.0%、6.7B 60.6% | 原文表3 |
| HumanEval-Python(Instruct) | 33B 79.3%（GPT-3.5 76.2%） | 原文表3 |
| LeetCode 竞赛题 Pass@1 | Instruct 6.7B 19.4%、33B 27.8%（+CoT 28.9%），GPT-3.5 23.3%，GPT-4-Turbo 40.6% | 原文表5 |
| DS-1000 均分(Base) | 33B 40.2%、6.7B 30.5% | 原文表4 |
| FIM 单行补全均分 | 1.3B 70.4%、7B 80.7%、33B 81.2%（StarCoder-16B 69.7%） | 原文表6 |
| CrossCodeEval(6.7B+检索) | Java EM 17.72%（去掉 repo 级预训练后 16.64%）、TS 14.03→13.23%、C# 16.23→14.48% | 原文表7 |
| 程序化数学推理均分 | 33B 65.8%（GSM8K 60.7%、MATH 29.1%） | 原文表8 |
| v1.5（续训自 DeepSeek-LLM-7B） | 再训 2T token、4K 窗口、纯 NTP；GSM8K 43.2%→62.4%，MMLU 36.6%→49.1% | 原文 §5、表10 |

---

## 全局数据流总表

| 阶段 | 谁在动 | 产出 | 代价 |
|---|---|---|---|
| 抓取 | 爬虫 | 2023-02 前 GitHub 公开仓库、87 语言白名单 | 抓取耗时 |
| 规则过滤 | 正则/规则引擎 | 剩 32.8%，粗去模板壳与数据文件 | 便宜 |
| 依赖解析 | 正则（import/using/include）+ 拓扑排序 | 仓库内文件排成依赖在前的序列，每文件加路径注释 | O(V²) 判依赖 |
| 仓库级近去重 | 近重复检测（具体算法原文未披露） | 整仓库为粒度的去重样本 | 中等 |
| 质量筛选 | 编译器 + 质量模型 | 剔语法错误/低可读/低模块化 | 贵（跑编译器） |
| 去污染 | n-gram 匹配 | 剔 HumanEval/MBPP/GSM8K/MATH 泄漏文件 | 便宜 |
| 分词 | 32k BPE | 87%代码+10%英文+3%中文 → token 流 | 一次性 |
| FIM(p=0.5) | 切三段+PSM 重排 | 半数样本变填空式 NTP 序列 | 便宜 |
| 预训练 | 1.3B/6.7B/33B Transformer | 2T token、16K 窗口 | 主开销 |
| 长上下文特训 | RoPE base 10000→100000，+1000 步 | 16K 窗口可用 | 小 |
| 指令微调 | Alpaca 格式 | DeepSeek-Coder-Instruct | 2B token |

---

## 所有疑问点速查

| 疑问 | 答案 |
|---|---|
| 为什么从 GitHub 抓、还设 87 语言白名单？ | 要仓库结构和语言纯净度，白名单挡长尾噪声 |
| 规则过滤的阈值在防什么？ | minified/超长行/伪代码/生成样板/纯标签壳/数据文件 |
| 为什么要拓扑排序？ | 因果注意力只看前文，依赖必须先出现在序列里 |
| 依赖图有环怎么办？ | 把"挑入度0"改成"挑入度最小"来打破僵局（算法1） |
| 路径为什么写进正文？ | 拼接后文件边界消失，路径注释=new-file 信号+结构信息 |
| 为什么不去重复文件？ | 会拆掉仓库结构，改以整个仓库为单位去重 |
| 泄漏检测为什么用 10-gram？ | 泄漏片段通常≥10 token，10-gram 命中已够准；<10 且≥3 用精确匹配 |
| FIM rate 为什么是 0.5 不上 100%？ | 100% FIM 补全能力最差，0.5 是消融出的平衡点 |
| FIM 把语序打乱了不会学坏？ | 本质仍是 NTP，只是"下一个 token"的定义变了 |
| `fim_hole` 和 `fim_end` 各干什么？ | hole=prefix/suffix 分界（即光标位置），end=该输出 middle |
| SPM 和 PSM 差别？ | 排列顺序不同（Suffix-Prefix-Middle vs PSM），本文实验和最终都用 PSM |
| 为什么不用 T5 式 MSP？ | 50% PSM 实测优于 50% MSP（原文图3） |
| FIM 在哪个粒度做？ | document 级、packing 之前，保证三段完整 |
| RoPE base 放大为什么能加长上下文？ | 相当于把旧窗口的相位结构摊平进新窗口 |
| 仓库级怎么和 16K 窗口咬合？ | 拓扑序保证依赖文件先入窗，窗口内跨文件可查 |

---

## 一句话总括

**GitHub 87 语言的仓库先被规则粗筛到 32.8%，再按 import/using/include 拓扑排序把仓库拼成"依赖在前"的长序列当样本、按仓库粒度去重、按 10-gram 对基准题去污染，产出的语料以 87% 代码+10% 英文+3% 中文、32k BPE、16K 窗口（RoPE base 10000→100000）从头预训练 2T token；其中半数样本在 packing 前被切成 prefix/suffix/middle、以 `<｜fim_start｜>…<｜fim_hole｜>…<｜fim_end｜>` 重排成 50% PSM 的填空式 NTP 序列，让"补光标处的代码"也变成预测下一个 token 的能力。** 代价是 6.7B 就打平 CodeLlama-34B、Instruct 33B 超过 GPT-3.5-Turbo，靠的都是这条生产线，不是参数堆出来的。

---

## 参考与延伸阅读

- [arXiv:2401.14196 摘要页](https://arxiv.org/abs/2401.14196) — 摘要与版本信息
- [arXiv 全文 HTML v2](https://arxiv.org/html/2401.14196v2) — 本文正文所引所有表/图的来源
- [GitHub 官方仓库 deepseek-ai/DeepSeek-Coder](https://github.com/deepseek-ai/DeepSeek-Coder) — 权重、评测脚本、LeetCode 基准发布页
- [本篇词汇](../study/vocab/03_DeepSeek-Coder_论文词汇.html) · [本篇听力](../study/listen/03_DeepSeek-Coder_单词听力.html) — 同仓库词汇/听力页

