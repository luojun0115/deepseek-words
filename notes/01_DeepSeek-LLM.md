---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 01 · DeepSeek-LLM 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [DeepSeek LLM：以长远主义扩展开源语言模型（论文中文翻译，知乎）](https://zhuanlan.zhihu.com/p/21892870242) — 全文中文翻译，适合对照原文逐节读
- [DeepSeek LLM 论文解读（知乎专栏）](https://zhuanlan.zhihu.com/p/23968906426) — 完整解读：模型规格、优化器/超参（AdamW、β1=0.9、β2=0.95）、多步学习率调度等细节
- [一文搞懂 DeepSeek LLM（知乎专栏）](https://zhuanlan.zhihu.com/p/1937265830216857540) — 从「长期主义」视角系统梳理架构与训练方式的综述
- [知乎问答：如何评价 DeepSeek-LLM？](https://www.zhihu.com/question/659184541) — 发布当期多个回答，含「月影（产品经理带你读论文）」长答
- [【DeepSeek 论文精读】1. 从 DeepSeek LLM 到 DeepSeek R1（CSDN·youcans）](https://blog.csdn.net/youcans/article/details/145391398) — 系列精读首发篇：2 万亿 token 预训练、7B/67B 与训练策略
- [DeepSeek 模型解读：Scaling Law, MLA, MoE（知乎专栏）](https://zhuanlan.zhihu.com/p/707492425) — 重点拆本篇灵魂部分 Scaling Law：多步学习率、1e17→2e19 计算预算网格实验、复用第一阶段训练
- [论文阅读《DeepSeek LLM：以长期主义规模化开源语言模型》（牛客社区）](https://m.nowcoder.com/discuss/887838055204200448) — Longtermism 训练体系的个人读后梳理
- [攻克 DeepSeek LLM：一次 AI 论文阅读之旅（腾讯云开发者社区）](https://cloud.tencent.com/developer/article/2506651) — 长文阅读笔记，方法论视角
- [【论文简读】DeepSeek LLM（一起AI）](https://17aitech.com/post/133-deepseek-llm/) — 简读版，重点讲多步学习率调度替换余弦退火
- [DeepSeek LLM 论文页（HyperAI 超神经）](https://hyper.ai/cn/papers/2401.02954) — 中文论文介绍页，摘要中译与关键结论速览
- [DeepSeek LLM · 博客（DOCSAID）](https://docsaid.org/zh-hans/blog/papers/deepseek/deepseek-llm) — 博客式精读：超参选择、Scaling Laws 校准与微调策略比较

### 视频（B站 / YouTube）
- [B站] [【闪客】深入解读 DeepSeek V1~V4！男女老少都听得懂](https://www.bilibili.com/video/BV1rpovBCEGH/) — 手绘动画长片，本篇（=V1）是起点（YouTube 版：https://www.youtube.com/watch?v=XN7XnojObME ）
- [B站] [逐篇讲解 DeepSeek 关键 9 篇论文及创新点](https://www.bilibili.com/video/BV1xuK5eREJi/) — 系列课程，DeepSeek LLM 为第一篇（YouTube 版：https://www.youtube.com/watch?v=j5CSpSqNCJw ）
- [B站] [8 篇 Scaling Laws 论文泛读](https://www.bilibili.com/video/BV1gisteJEWx/) — Scaling Law 论文串讲，本篇是代表作之一
- [B站] [解析大模型中的 Scaling Law（卢菁博士）](https://www.bilibili.com/video/BV1eN4y1z7N1/) — 幂律与模型分档背景课，铺垫必看
- [YouTube] [Scaling Open Source Language Models with Longtermism](https://www.youtube.com/watch?v=nS5avAZh7To) — 以论文标题命名的走查视频，内容未全部核实

### 英文 & 社区
- [Hugging Face 论文页](https://huggingface.co/papers/2401.02954) — 官方收录页，权重直达 deepseek-ai/deepseek-llm-7b-base 等 4 个仓库
- [Moonlight 中文评述](https://www.themoonlight.io/zh/review/deepseek-llm-scaling-open-source-language-models-with-longtermism) — 结构化论文评述
- [Emergent Mind](https://www.emergentmind.com/papers/2401.02954) — 论文摘要卡：non-embedding FLOPs/token 表示法 M 速览
- [Planet Banatt: Understanding Modern LLMs via DeepSeek](https://planetbanatt.net/articles/deepseek.html) — 英文长文，专节讲本篇 Scaling Laws 如何指导超参选型
- [Cameron Wolfe: LLM Scaling Laws 综述](https://cameronrwolfe.substack.com/p/llm-scaling-laws) — Kaplan→Chinchilla→DeepSeek LLM 缩放脉络
- [Reddit r/LocalLLaMA：Deepseek LLM 67B Chat & Base](https://www.reddit.com/r/LocalLLaMA/comments/186o3sx/deepseek_llm_67b_chat_base/) — 发布时社区实测与讨论
- [Reddit r/LocalLLaMA：Is DeepSeek a violation of Scaling Laws?](https://www.reddit.com/r/LocalLLaMA/comments/1iejv4i/is_deepseek_a_violation_of_scaling_laws/) — 就本篇确立的 Scaling Law 框架引发的社区争论
- [GitHub 官方仓库 deepseek-ai/deepseek-LLM](https://github.com/deepseek-ai/deepseek-LLM) — 「Let there be answers」，权重与 checkpoints

---

# 缩放定律校准 + 训练配方完整流程（含所有疑问点）

> 一手资料：arXiv:2401.02954v1（2024-01-05 提交），全部数字抄自该版原文。注意：论文实际标题是《DeepSeek LLM: Scaling Open-Source Language Models with Longtermism》；不少二手资料说的「Computation-Optimal vs Budget-Optimal 两口径」「训练 token ×1.28」等说法**在本版原文里没有**，见疑问点①。

## 角色与核心思想

这篇论文回答两个问题：

1. **钱该怎么花**：给定计算预算 C，模型规模和数据量各占多少，训练出的模型损失最低？前人（Kaplan 2020、Chinchilla 2022）给的分配指数互相矛盾，而且实验细节（超参）残缺，没法确认各自的模型是不是在最优状态下测的。本文把这两个缺口都补上：先拟定「超参缩放律」保证每个预算档都用近优 batch size / 学习率训练，再用 IsoFLOP 曲线拟合出模型/数据的最优分配指数。
2. **两个具体模型怎么建**：把缩放律的结论落到 7B 和 67B 两个配置上——超参怎么定、层深怎么选、学习率调度怎么改、数据管线怎么搭。

整套推演里「在动」的东西是三层：**计算预算 C**（外生变量）、**M（每个 token 的非嵌入 FLOPs，代表模型规模）与 D（token 数，代表数据规模）**（分配变量）、**验证集 bits-per-byte（BPB）**（产出，越低越好）。

---

## 阶段一：先立「超参缩放律」——保证每一档预算都在近优状态下训练

**为什么第一步是这个？** 因为如果不同预算档用了不合适的 batch size 或学习率，测出来的「最优分配」本身就是脏的。早期工作的一个公认缺陷（原文 §3 明说）就是超参描述不全，"leaving it uncertain whether models under different compute budgets reached optimal performance"。

流程：

```
① 在 1e17 FLOPs 的小实验上网格搜索 batch size × 学习率
   （例如 177M FLOPs/token 的模型），发现泛化误差在很宽的
   参数带内都稳定 → 近优不是单点，是一个「带」

② 利用多步学习率调度器的特性（见阶段五），
   复用第一阶段训练，把 1e17 ~ 2e19 的多个预算档都跑出
   「batch size × 学习率 × 预算」的扫参结果

③ 判定近优：泛化误差比最小值高出 ≤0.25% 的参数都算近优
   （冗余带思路，不追求单点最优）

④ 对近优带拟合幂律，得到「超参缩放律」（原文公式 1）：

   η_opt = 0.3118 × C^(−0.1250)      （学习率随预算下降）
   B_opt = 0.2920 × C^(+0.3271)      （batch size 随预算上升）

⑤ 在 1e20 FLOPs 上验证：按公式选的超参落在最优参数带中央
   （原文 Figure 2(b)，2.94B FLOPs/token 例）
```

**疑问点②：为什么 batch size 要随预算变大、学习率要变小？**
原文的实证结果就是这两条单调趋势（Figure 3），且"为符合放大模型时 batch size 和学习率的直觉经验设置"。直觉理解：预算越大训练越久，学习率小一点可以让后期损失平滑下降；数据/模型都大了，单步消耗 token 更多，用大 batch 把并行度吃满。原文没有给数学证明，这是拟合出来的经验律。

**疑问点③：本文的超参律和早期「通用临界 batch size」说法冲突在哪？**
原文明确说：McCandlish 等人和 Kaplan 等人把最优 batch size 建模成**只与泛化误差 L 相关**；本文的拟合是 batch size（与学习率）直接对计算预算 C 建幂律，而且观察到「同一预算下不同模型/数据分配的最优参数带略有差异」——说明还应该有 C 之外的因素在起作用，留作 future work。

---

## 阶段二：换尺子——用 M（非嵌入 FLOPs/token）替换参数量 N

旧口径的公式是 C ≈ 6ND（N 是参数量、D 是 token 数）。问题在于「参数量」有两种常见的数法：

```
6N₁ = 72 · n_layer · d_model²                       （Kaplan 用：非嵌入参数）
6N₂ = 72 · n_layer · d_model² + 6 · n_vocab · d_model（Chinchilla 用：全部参数）
M   = 72 · n_layer · d_model² + 12 · n_layer · d_model · l_seq
      ↑本文新尺子：非嵌入 FLOPs/token
```

三种口径的差别（原文表 3 摘样）：

```
层数 d_model   N1      N2      M       6N₁/M   6N₂/M
 8    512     25.2M   77.6M   352M    0.43    1.32   ← 小模型误差最大
32    4096    6.44B   6.86B   45.1B   0.85    0.91
80    8192    64.4B   65.3B   419B    0.92    0.94
```

**疑问点④：6N₁ 和 6N₂ 各自错在哪？为什么小模型错得最离谱（达 50%）？**
- 6N₁（非嵌入参数）：**漏算了注意力操作的计算开销**。注意力开销随序列长度 l_seq 增长；小模型 d_model 小，注意力那项占比反而大，漏掉之后 6N₁ 只剩真实值的 43%。
- 6N₂（全部参数）：除了同样的注意力漏算，还**多算了词表计算**（n_vocab × d_model 那一项）。词表的输出投影对模型容量贡献小（本质是个查找/映射），把它算进「模型规模」会虚胖。
- 大模型里 d_model² 项占绝对主导，两种旧口径的相对误差都缩到 10% 以内；小模型则两项误差都暴露，差距可达 50%。

改用 M 之后，预算公式变成精确等式 **C = M · D**，优化目标也随之清晰化（原文公式 3）：

```
M_opt(C), D_opt(C) = argmin_{M,D, s.t. C=M·D} L(N, D)
```

---

## 阶段三：IsoFLOP 扫描——实测每个预算档的最优分配

沿用 Chinchilla 的 IsoFLOP profile 方法（减少实验量）：

```
选 8 个计算预算：1e17 ~ 3e20
每个预算下，设计约 10 种 M/D 分配（同一个 C，不同切法）
每个实验的超参用阶段一公式(1)确定，保证近优
泛化误差在独立验证集上测（100M tokens，分布与训练集相近）
   → 每个预算得到一条「切法 → BPB」的 U 形曲线，谷底就是该预算的最优分配
把 8 个谷底连起来，拟合幂律（原文公式 4）：

M_opt = 0.1715 × C^(+0.5243)
D_opt = 5.8316 × C^(+0.4757)
```

**疑问点⑤：a=0.5243 / b=0.4757 怎么读？跻身什么水平？**
预算每翻 2 倍，模型规模的最优值乘 2^0.5243 ≈ 1.44 倍，数据量的最优值乘 2^0.4757 ≈ 1.39 倍——模型略多、数据略少，但两者接近五五开。对比原文表 4 的各路拟合：

```
口径（数据集）              a（模型指数）  b（数据指数）
OpenAI（OpenWebText2）      0.73          0.27          ← Kaplan：偏堆模型
Chinchilla（MassiveText）   0.49          0.51          ← 接近对半
本文（早期内部数据）         0.450         0.550         ← 偏堆数据
本文（当前内部数据）         0.524         0.476
本文（OpenWebText2）        0.578         0.422
```

**疑问点⑥：拿这套曲线能干什么「别人做不到」的事？**
原文 Figure 5 的验证结果：**用小规模实验可以准确外推 1000 倍计算预算模型的性能**。具体用法：8 个谷底连成的损失-预算幂律上，把 7B 和 67B 对应预算的预测 BPB 抠出来，和后来真实训练的 7B/67B 对账，落点在曲线上。这给大模型正式开训前提供了「性能预测单」，避免烧掉几百万卡时才发现配置偏了。

---

## 阶段四：意外发现——数据质量会移动最优分配（a、b 不是常数）

开发过程中数据集迭代了多轮，作者顺手在 3 套数据上各拟合了一遍缩放曲线，得到上表格外的一列。规律：**数据质量越高，a 越大、b 越小**——预算增量应该更多分给模型，而不是数据。

**疑问点⑦：为什么高质量数据会把最优解推向「更大的模型」？**
原文给的直觉推测（明确标注为 speculation）：高质量数据通常逻辑更清晰、充分训练后预测难度更低，也就是数据这一侧更容易「喂饱」；此时继续加数据的边际收益变低，把预算投到模型容量上更划算。反过来说，数据质量差时，模型大了也学不出东西，还得靠堆数据。

**疑问点⑧：这能当数据质量的测量仪吗？**
原文认为「最优分配策略的差异或许可以作为评估数据质量的间接手段」——同一套 IsoFLOP 流程在不同数据上各跑一遍，比较拟合出的 a 值即可。这是一种新用途：不用人工标注，用缩放行为本身反推数据好坏。同时这也是对领域的一个解釋：**早期工作结论互相矛盾（0.73/0.27 vs 0.49/0.51），根源很可能就是各自数据集质量/分布不同**，而不是缩放律本身失效。

---

## 阶段五：多步学习率调度——为「复用实验」服务的取舍

预训练没有用标配的余弦退火，改用**多步**调度（原文 §2.3）：

```
warmup 2000 步 → 到最大 LR
训练 80% tokens 时  LR 降到峰值的 31.6%
训练 90% tokens 时  LR 降到峰值的 10%
其余超参：AdamW，β₁=0.9，β₂=0.95，weight_decay=0.1，
梯度裁剪 1.0，初始化 std=0.006
```

**疑问点⑨：既然多步和余弦最终性能一致，为什么费劲换调度器？**
在 1.6B 参数、100B tokens 的对照实验里（原文 Figure 1(a)），多步和余弦的损失下降轨迹不同，但最终性能基本一致。换的核心动机是**可复用**：余弦调度离开总 token 数就没法定形状（计划到 1T 的曲线在 2T 计划下形状全变），而多步是「按已训练 token 比例」走台阶——如果你中途决定把训练拉长，第一阶段的训练直接续用，不用推倒重来。这对阶段一的扫参（要在多个预算档跑几十个模型）和后续「延长训练」都是刚需。

**疑问点⑩：80/10/10 的比例是最优的吗？**
不是。原文 Figure 1(b) 显示调整各段比例能换来略好的性能，但作者权衡「复用比例与模型性能」后固定为 80%/10%/10%——刻意保留一个大的低学习率台阶，方便续训时复用。

---

## 阶段六：7B / 67B 训练配方落袋

按缩放律选定的两个配置（原文表 2）：

```
        层数  d_model  heads  KV heads  上下文   序列批大小  LR      tokens
7B      30    4096     32     32(MHA)   4096    2304       4.2e-4  2.0T
67B     95    8192     64     8(GQA)    4096    4608       3.2e-4  2.0T
```

架构微调（宏观层面）与 LLaMA 的差异点：
- **7B 用 30 层**（多数同级模型是 32 层），**67B 用 95 层**——参数量与同级模型一致，但层数刻意调过，方便做流水线切分（pipeline partitioning）优化训练与推理。
- **67B 往「深」扩而不是往「宽」扩**：多数工作加参数会加宽 FFN 中间层，本文选加深度，目标是更好的性能。
- **67B 用 GQA**（8 个 KV 头），7B 保持 MHA（32 头）——GQA 是为了控制推理成本；7B 体量小，没必要上。

**疑问点⑪：67B 的学习率 3.2e-4、批次 4608，哪来的？**
不是手拍的：这两个数正是阶段一超参缩放律在 67B 对应预算档上的取值，7B 同理（原文表 2 注明"基于 §3 的发现选择超参"）。这就是缩放律从「论文发现」变成「生产配方」的闭环。两个模型同样吃 2.0T tokens（中英文为主）。

数据管线（原文 §2.1，三段式）：

```
去重 → 过滤 → 重混
① 去重：跨 Common Crawl 整体去重（激进策略）。
   跨 91 个 dumps 去重删掉 89.8% 文档，
   只跨 1 个 dump 只删 22.2%（原文表 1）→ 全库去重能抓到跨月重复
② 过滤：语言+语义双维度质量打分，提高信息密度
③ 重混：调整配比，提高欠表示领域的占比，压平数据失衡
分词器：BBPE（byte-level BPE），预分词隔断换行/标点/CJK 等异类合并，
数字逐位拆分；常规 token 100000 + 特殊 token 15 = 100015，
但训练用词表开到 102400（留余量 + 计算对齐效率）
```

**疑问点⑫：去重删得越狠越好吗？删掉近 90% 不可惜？**
可惜的是重复文档，不是数据。跨库去重删掉近九成，说明 Common Crawl 各 dump 之间大量内容是重复的；重复样本对学习没有增量还浪费算力。这是「预算该花在独一份信息上」的同一逻辑在数据侧的体现。

---

## 阶段七：SFT + DPO——把 Base 变 Chat

```
监督微调 SFT：
  数据：约 150 万中英文指令实例 = 120 万 helpful
       （31.2% 语言任务 / 46.6% 数学 / 22.2% 代码）+ 30 万安全数据
  7B：4 epochs，LR 1e-5     67B：2 epochs，LR 5e-6
  （67B 只给 2 epoch，因为观察到过拟合严重，分数早早到顶）
两阶段微调（7B）：
  Stage1 全量数据 → 重复率 2.0%
  Stage2 去掉数学/代码数据再微调 → 重复率 1.4%，基准分基本不掉
  （重复率 = 3868 条中英 prompt 生成结果里「无限复读不终止」的比例；
   病根是数学 SFT 数据推理模式相近，弱模型学不会就复读）
  67B 一阶段后重复率已 <1%，二阶段反而伤分 → 只做一阶段
直接偏好优化 DPO：
  helpful/harmless 偏好数据，回复候选由自家 Chat 模型生成
  1 epoch，LR 5e-6，batch 512，warmup + 余弦调度
  效果：开放式生成变强，标准基准几乎不动
```

**疑问点⑬：SFT 究竟给了模型什么？**
原文 §5.1.2 的结论很克制：(a) SFT **学的不是推理能力，而是推理路径的正确格式**（BBH、NaturalQuestions 只小幅提升）；(b) 数学/代码大涨（GSM8K 17.4→63.0、HumanEval 26.2→48.2，7B Chat 口径）是因为 base 模型在这些任务上**欠拟合**，SFT 数据里大量同类题补了课；(c) 知识类分数（MMLU、TriviaQA）小幅波动不代表知识增减，SFT 的真正价值是让 Chat 模型 **0-shot 达到 Base 模型 few-shot 的水平**——这更贴近真实使用场景。

**疑问点⑭： benchmark 上「刷分式提升」为什么不追？**
齐 2000 万中文选择题数据后 MMLU 49.4→60.9、C-Eval 47.0→71.3，但生成式评测 TriviaQA 74.4→不升、中英对话无感。作者判定这是**对基准格式的过拟合**而非变聪明，并明确决定预训练和微调都不收这类数据（预训练末段掺 500 万 instruction 数据的对照试验结论也相同：最终效果与放到 SFT 阶段无差别）。同理「避免 benchmark decoration」写进了结论章。

---

## 关键数字与实验

| 指标 | 本文 | 出处 |
|---|---|---|
| 预训练数据 | 2T tokens（中英为主），持续扩充 | 原文摘要 / §2 |
| 跨 91 dumps 去重率 vs 单 dump | 89.8% vs 22.2% | 原文表 1 |
| 词表 | 100015（训练 vocab size 102400） | §2.1 |
| 7B 配置 | 30 层 / d_model 4096 / MHA / LR 4.2e-4 / 批 2304 / 2.0T | 原文表 2 |
| 67B 配置 | 95 层 / d_model 8192 / GQA(8 KV 头) / LR 3.2e-4 / 批 4608 / 2.0T | 原文表 2 |
| 超参律 | η_opt=0.3118×C^(−0.1250)，B_opt=0.2920×C^(+0.3271) | 原文式(1) |
| 分配律 | M_opt ∝ C^0.5243，D_opt ∝ C^0.4757 | 原文式(4) |
| IsoFLOP 实验规模 | 8 个预算档（1e17~3e20）× 每档约 10 种分配；验证集 100M tokens | §3.2 |
| 近优超参判据 | 泛化误差 ≤ 最小值 ×1.0025 | §3.1 |
| 模型规模尺子误差 | 小模型（8 层 512 宽）6N₁/M=0.43、6N₂/M=1.32 | 原文表 3 |
| 各家 a/b | Kaplan 0.73/0.27；Chinchilla 0.49/0.51；本文当前数据 0.524/0.476 | 原文表 4 |
| 性能外推 | 小规模实验可准确预测 1000× 计算预算的模型 | §3.2 / Figure 5 |
| 多步调度 | 80%→31.6% 峰值，90%→10% 峰值，warmup 2000 步 | §2.3 |
| SFT 数据 | 120 万 helpful + 30 万安全 ≈150 万实例 | §4 |
| 重复率（7B Chat） | Stage1 2.0% → Stage2 1.4%（温度 0 计） | 原文表 12 |
| DPO 配方 | 1 epoch / LR 5e-6 / batch 512 / warmup+余弦 | §4 |
| Base 67B vs LLaMA2 70B | MMLU 71.3 vs 69.0；HumanEval 42.7 vs 28.7；GSM8K 63.4 vs 58.4；CHID 92.1 vs 55.5 | 原文表 5 |
| Chat 67B 开放评测 | MT-Bench 8.35（DPO 后 8.76，对标 GPT-3.5-turbo 8.39） | 原文表 8 |
| 选择题数据诱惑 | 加 2000 万 MC：MMLU +11.5 但 TriviaQA 不动 → 弃用 | 原文表 13 |

---

## 全局数据流总表

| 步骤 | 输入 | 产出 | 代价 |
|---|---|---|---|
| 1. 超参律 | 1e17~2e19 扫参（复用第一阶段） | 式(1)：η_opt、B_opt 随 C 的幂律 | 一次性，可复用 |
| 2. 换尺子 | 架构展开式 | M（含注意力、去词表），C=M·D | 零训练成本 |
| 3. IsoFLOP | 8 档预算×约 10 种分配，超参来自步 1 | 式(4)：a=0.5243、b=0.4757 | 最大的实验开销 |
| 4. 数据质量对照 | 3 套数据重复步 3 | a 随数据质量上升 → 分配可当数据质量的间接测量 | 复用算力 |
| 5. 7B/67B 落地 | 式(1)选 LR/批，式(4)校验 token 预算 | 表 2 配方，2.0T tokens 开训 | 生产训练 |
| 6. SFT+DPO | 150 万 SFT + 偏好数据 | 7B Chat（两阶段）/ 67B Chat（一阶段+DPO） | 远小于预训练 |

---

## 所有疑问点速查

| 疑问 | 答案 |
|---|---|
| ① 网传的「两口径」「×1.28」在哪？ | arXiv v1 原文没有这些术语和数字；本文口径就是「给定 C=M·D 最小化泛化误差」单一路线 |
| ② batch 为何升、LR 为何降？ | 实测幂律趋势，与放大模型的直觉一致；无数学证明 |
| ③ 与旧「临界 batch size」理论差在哪？ | 本文对 C 直接建幂律，且发现最优带还受分配方式影响，不只依赖 L |
| ④ 6N₁/6N₂ 错在哪？ | 前者漏注意力开销；后者还多算词表项；小模型误差最大约 50% |
| ⑤ a/b 怎么读？ | 预算 ×2 → 模型 ×2^a、数据 ×2^b；本文 0.5243/0.4757 接近对半 |
| ⑥ 缩放律最大的实用价值？ | 小实验外推 1000× 预算的性能，大模型开训前先拿「预测单」 |
| ⑦ 高质量数据为什么偏向堆模型？ | 好数据预测难度低、易喂饱，加模型的边际收益更高（原文标注为推测） |
| ⑧ 缩放律能测数据质量？ | 可以间接测：不同数据各拟合一遍，比较 a 值；也解释了各家结论矛盾 |
| ⑨ 多步调度图什么？ | 性能与余弦持平，但按比例走台阶可以复用第一阶段续训（扫参刚需） |
| ⑩ 80/10/10 最优吗？ | 不是，调比例略好，但为复用比例固定 80/10/10 |
| ⑪ 7B/67B 超参哪来的？ | 缩放律产出：LR 与批大小直接查式(1)，token 预算由式(4)指导 |
| ⑫ 去重删近 90% 不可惜？ | 删的是跨月重复文档，独一份信息才值得花算力 |
| ⑬ SFT 到底给了什么？ | 学的是输出格式（含推理路径格式）+ 补齐数学/代码欠拟合；0-shot 追平 base 的 few-shot |
| ⑭ 为什么拒绝刷题数据？ | 只涨选择题基准不涨生成式评测，是格式的过拟合，非真智能 |

---

## 一句话总括

**先用超参缩放律（B_opt ∝ C^0.3271、η_opt ∝ C^−0.1250）保证每个预算档都在近优状态下训练，再用 M（非嵌入 FLOPs/token）替换参数量这一把更准的尺子立起 C=M·D，沿 Chinchilla 的 IsoFLOP 方法在 1e17~3e20 上扫出最优分配 a=0.5243 / b=0.4757——并意外发现数据质量越高 a 越大，从而把各家缩放律矛盾归因到数据集差异；随后把结论直接兑现为 7B（30 层 MHA）/ 67B（95 层 GQA、往深不往宽）的 2T token 配方，配上多步学习率调度（80/10/10，为续训复用留手脚）、三段式数据管线（跨 91 dumps 去重删 89.8%）和 7B 两阶段 / 67B 一阶段的 SFT 加 DPO，最终 67B 在代码/数学/推理与中文上全面压过 LLaMA2 70B，Chat 版开放评测对标 GPT-3.5。**

---

## 参考与延伸阅读

- [arXiv:2401.02954 摘要页](https://arxiv.org/abs/2401.02954)
- [arXiv HTML 全文（v1，本文笔记的一手资料）](https://arxiv.org/html/2401.02954v1)
- [官方 GitHub：deepseek-ai/deepseek-LLM](https://github.com/deepseek-ai/deepseek-LLM)
- 对照阅读：[Chinchilla（Hoffmann et al., 2022）](https://arxiv.org/abs/2203.15556)、[Kaplan et al., 2020](https://arxiv.org/abs/2001.08361) —— 原文表 4 对比的另两个拟合口径
- [本篇词汇](../study/vocab/01_DeepSeek-LLM_论文词汇.html) · [本篇听力](../study/listen/01_DeepSeek-LLM_单词听力.html)

