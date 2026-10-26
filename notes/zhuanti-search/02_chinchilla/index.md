---
category: data
# 卡片元数据（/notes「专题与索引」组用，2026-10-25 从顶层卡页搬进来）：卡面金句 / 排序 / 封面图名
# 缩放定律专题 02：Hoffmann et al. 2022，Training Compute-Optimal Large Language Models（arXiv:2203.15556）
title: 缩放定律 02 · Chinchilla 2022：Training Compute-Optimal Large Language Models
order: 602
cover: "模型翻倍， / 数据也要翻倍。"
coverKicker: "Topic · Scaling Laws · 02 Chinchilla"
coverYear: "2022"
coverFile: 缩放定律02_Chinchilla
pageClass: note-page
---

[← 专题总览](../index.md)

# 02 · Chinchilla 2022：Training Compute-Optimal Large Language Models

> **一句话**：DeepMind 用三种独立方法重估算力最优分配，改判 Kaplan：模型与数据应 **1:1 等比缩放**（约 20 tokens/参数）。70B 的 Chinchilla 用与 280B Gopher 相同的算力，在大多数基准上反超——一个 70B 模型打赢了一大票"参数堆出来的"巨无霸。

## ① 论文身份卡

| 项 | 值 |
|----|----|
| 标题 | Training Compute-Optimal Large Language Models |
| 机构 / 团队 | Google DeepMind |
| 作者 | Jordan Hoffmann、Sebastian Borgeaud、Arthur Mensch、Elena Buchatskaya、Trevor Cai、Eliza Rutherford、…、Jack W. Rae、Oriol Vinyals、Laurent Sifre（22 人） |
| 发表 | arXiv:2203.15556，2022-03；NeurIPS 2022 |
| 链接 | [原文](https://arxiv.org/abs/2203.15556) · [NeurIPS 版](https://proceedings.neurips.cc/paper/2022/file/c1e2faff6f588870935f114ebe04a3e5-Paper-Conference.pdf) |
| 关键词 | compute-optimal、Chinchilla、tokens-per-parameter、IsoFLOP、scaling law |

## ② 定位与动机

**痛点**：Kaplan 律统治两年后，模型越做越大（GPT-3 175B → Gopher 280B → MT-NLG 530B），但都是"参数大、数据相对少"（Gopher 280B 只训 300B token）。没人系统验证过：这是不是花算力的最优方式？

**前作 gap**：Kaplan 的数据端分配（C^0.27）从未被独立复算；且其实验把学习率调度长度与训练长度绑定，"多训"的收益被系统性压低。

**本文思路**：把"算力固定，模型多大数据多"当成一个受控实验，用**三种互相独立的方法**估最优分配，再训一个按新律配置的模型（Chinchilla 70B）与旧律产物（Gopher 280B）同台对决。

## ③ 核心贡献（4 条）

1. **三法归一**：固定模型变数据、IsoFLOP 轮廓、参数化损失联合拟合——三条路都指向 **N_opt ∝ C^0.5、D_opt ∝ C^0.5**。
2. **经验法则**：约 **20 tokens/参数**（如 10B 模型 ≈ 200B token）。
3. **Chinchilla 70B / 1.4T token**：与 Gopher 280B 同算力，MMLU 等大多数基准反超 Gopher、GPT-3、Jurassic-1、MT-NLG 530B。
4. **历史模型全部"欠训"**：按新律，GPT-3 应训 3.7T、Gopher 5.9T、MT-NLG 应训 11.2T token（原文 Table 3 估算）。

## ④ 方法精读

**参数化损失联合拟合（Approach 3，最常被引用）**：

```text
L(N, D) = E + A/N^α + B/D^β

拟合结果（原文 Table 3）：
  E = 1.69   ← 不可约熵（自然文本固有损失的地板）
  A = 406.4  α = 0.34   ← 参数项
  B = 410.7  β = 0.28   ← 数据项
```

对约束 C ≈ 6ND 求最优分配：

```text
令参数项与数据项的"算力敏感度"相等：
  α·A/N^α ∝ 1/N · … → N^α/α 与 D^β/β 平衡
  →  N_opt ∝ C^(β/(α+β))≈C^0.45 ~ C^0.5
     D_opt ∝ C^(α/(α+β))≈C^0.55 ~ C^0.5
  →  实用口径：模型参数翻倍，数据也翻倍（20 tokens/参数）
```

**三法对照图**：

```text
Approach 1        固定 N ∈ {70M … 16B}，只变 token   → 每个模型各自的"最优点"
Approach 2        固定每档 FLOPs（IsoFLOP），变 N     → 每档 FLOPs 的最优 N
Approach 3        全部 400 个 run 联合拟合 L(N,D)     → 一条解析式
                          ↓ 三者交叉验证
        N_opt ∝ C^0.5 , D_opt ∝ C^0.5 （≈ 20 tokens/param）
```

**为什么与 Kaplan 相反**：本文实验把学习率调度解耦（不绑死训练长度）、扫了更宽的数据区间，"多训 token"的真实收益被释放出来——数据项从 C^0.27 跳到 C^0.5。

## ⑤ 实验解读

| 结论 | 关键数字 | 出处 |
|------|----------|------|
| 最优分配 | N ∝ C^0.5、D ∝ C^0.5 | 原文 §3、§6 |
| 经验法则 | ≈ 20 tokens/参数 | 原文 §3.3 |
| 联合拟合参数 | E=1.69, A=406.4, B=410.7, α=0.34, β=0.28 | 原文 Table 3 |
| 历史欠训估算 | GPT-3→3.7T；Gopher→5.9T；MT-NLG→11.2T | 原文 Table 3 |
| 同算力对决 | Chinchilla-70B 在 MMLU 67.6% 超 Gopher 60.0% | 原文 §4 基准表 |

**数字背后**：MMLU +7.6 个点只靠"少 210B 参数、多 1.1T token"——这在 2022 年是颠覆性的性价比论证。但注意作者也明确说明：这是**训练算力最优**，未计入推理成本；如果模型要被海量调用，"多参数少训"反而可能更划算（这一棒交给了 LLaMA，见本专题 03）。

## ⑥ 知识点拓展（3）

### 拓展 1：IsoFLOP 方法
- 是什么：固定每档算力预算，只扫参数量，看哪条曲线最低——缩放律研究的"标准实验设计"之一。
- 与系列关联：本专题 06（数据受限）的 400 次实验、09（gzip）的拟合都沿用这一套流程。

### 拓展 2：tokens-per-parameter 口径
- 是什么：D/N 比值，用来快速判断一个模型"训够了没有"。20 = Chinchilla 最优；LLaMA-1 7B 是 1T/7B ≈ 143；DeepSeek-LLM 7B 是 2T/7B ≈ 286。
- 为什么重要：它是行业里最容易背、也最容易被误用的数——"训过 20 就停"只在纯训练算力最优、数据无约束时成立。

### 拓展 3：EM（嵌入参数）不计入 N
- 是什么：拟合时 N 取非嵌入参数——词表巨大的模型（如 V3 的 12.9 万词表）如果算上嵌入，最优配比会被系统性扭曲。
- 与 DeepSeek 关联：MoE 模型"激活参数 vs 总参数"该用哪个口径，至今仍是缩放律研究的开放问题。

## ⑦ 批判性评价

- **优点**：三种独立方法互相验证，实验设计滴水不漏；直接改写了全行业的训练配方（LLaMA、Falcon、Qwen、DeepSeek 的 token 量都以此为锚再上浮）。
- **局限与争议**：
  1. **只优化训练算力**：推理成本、微调成本不在目标函数里——后续"inference-optimal"路线（LLaMA、Llama-3 的 15T token）本质是换了个目标函数。
  2. **复现争议**：Besiroglu et al. 2024（arXiv:2404.10102）复核了 Approach 1 的原始 run，认为 Kaplan 侧的拟合被低估、Chinchilla 侧结论基本站得住但常数需修正；Porian et al. 2024（NeurIPS 2024）把两派分歧进一步归因到 LR 调度、warmup 等训练细节。
  3. **20 tokens/参数不是铁律**：数据受限（本专题 06）、数据复杂度（09）、多 epoch（06 的 4 epochs）都会让最优点漂移；DeepSeek-LLM 在自有数据上重估后同样偏离该口径。

## ⑧ 谱系定位

```text
Kaplan 2020（模型为王 C^0.73）→【本文 2022：1:1 等比】→ LLaMA 2023（换目标：推理最优）
                                              ↘ 本专题 06：数据不够时 1:1 根本做不到 → 4 epochs 内重复
                                              ↘ DeepSeek-LLM 2024.01：在自有数据上重估（偏多训数据）
```

**与 DeepSeek 系列的关联**：DeepSeek-LLM（[笔记](../../01_DeepSeek-LLM.md)）明确以 Chinchilla 为对照系，训 2T tokens 并给出自己的缩放律修订；DeepSeek-V3 的 14.8T tokens 则是"token 堆到远超 20/参数"时代的产物。

## ⑨ 资源与延伸阅读

- **一手原文**：[Training Compute-Optimal Large Language Models（arXiv:2203.15556）](https://arxiv.org/abs/2203.15556) —— 本文取用：Table 3（拟合常数与欠训估算）、§3（三种方法）
- **全网解读**：见本文文末 **⑪ 全网解读资源**（分割线以下，同一页）


## ⑩ 核心术语表

| 英文 | 中文 | 一句话解释 |
|------|------|-----------|
| compute-optimal | 计算最优 | 固定训练 FLOPs 下损失最低的 (N, D) 配置 |
| IsoFLOP profile | 等算力轮廓 | 固定算力档、扫参数量的实验设计 |
| tokens-per-parameter | 每参数 token 数 | D/N，判断"训够了没"的快查口径 |
| parametric loss fit | 参数化损失拟合 | L = E + A/N^α + B/D^β 的联合回归 |
| undertrained | 欠训 | 参数相对数据过多、离计算最优点的偏离状态 |

---

## ⑪ 全网解读资源

> 整理时间：2026-10-24

### 检索关键词

- 检索关键词：`Chinchilla scaling law`、`compute-optimal`、`20 tokens per parameter`、`计算最优 缩放律`。

### 知乎（图文解读）

| 链接 | 是什么 |
|---|---|
| [Chinchilla Scaling Law 最优化大型语言模型训练](https://zhuanlan.zhihu.com/p/1991568611886769303) | 2026-01 的专文解读，"纠正盲目追求大参数量的误区"叙事完整 |
| [解析大模型中的 Scaling Law](https://zhuanlan.zhihu.com/p/667489780) | 与 Kaplan 对照讲解，三种估计方法的思路最容易看懂的一版 |
| [万字长文解读 Scaling Law 的一切，洞见 LLM 的未来](https://zhuanlan.zhihu.com/p/20966132534) | 2025-02 全景综述，Chinchilla 的三法与后续修正都覆盖 |
| [大语言模型的 Scaling：扩展方向、收益规律与训练配置](https://zhuanlan.zhihu.com/p/2090808675141170697) | 2026-10 新文，把"token 应随算力同步增长"的口径放进训练配置实践 |
| [透视 Scaling Law 背后的信息论、流形假设与资源分配逻辑](https://zhuanlan.zhihu.com/p/2014387264638169865) | 理论视角，解释 1:1 律为什么会成立 |

### 中文博客与媒体

| 链接 | 是什么 |
|---|---|
| [OpenAI 与 DeepMind 的 Scaling Laws 之争（BAAI 智源社区）](https://hub.baai.ac.cn/view/34084) | 两代定律交锋的中文叙事，本篇正是"改判方" |
| [深度长文｜多模态 Scaling Laws 新篇章：Chinchilla 范式已破（CSDN）](https://blog.csdn.net/cf2SudS8x8F0v/article/details/147200471) | 2025-04，含"Kaplan 律 vs Chinchilla 律演进"对照与后续挑战 |
| [深度｜Scaling Law 的发展历程，与数据受限问题的解决措施（阿里云）](https://startup.aliyun.com/info/1087256.html) | 从 Chinchilla 讲到数据受限时代，接本专题 06 篇 |

### 视频（B 站 / YouTube）

| 链接 | 平台 | 是什么 |
|---|---|---|
| [Chinchilla Explained: Compute-Optimal LLMs](https://www.youtube.com/watch?v=PZXN7jm9IC0) | YouTube | 33 分钟讲座式精讲，三种估计方法逐步过 |
| [LLM Scaling Laws Explained（@DrRyanRad）](https://www.youtube.com/watch?v=Zy23dMqk_Rs) | YouTube | 同时讲 Chinchilla 与"Inference-Optimal（为什么现在都过度训练）"，正好衔接本专题 03 |
| [8 篇 Scaling Laws 论文泛读](https://www.bilibili.com/video/BV1gisteJEWx/) | B站 | 本专题 9 篇的泛读串讲，快速建立谱系；[YouTube 同款带章节时间戳](https://www.youtube.com/watch?v=eindNx4Uk-M) |
| [你真的懂 Scaling Law 吗？](https://www.bilibili.com/video/BV1aa3b6PE7h/) | B站 | 科普向，Kaplan→Chinchilla 的"改判"讲得通俗 |
| [解析大模型中的 Scaling Law（卢菁博士）](https://www.bilibili.com/video/BV1eN4y1z7N1/) | B站 | 铺垫视频，理解"为什么是 20 tokens/参数" |

### 英文 / 权威站点

| 链接 | 是什么 |
|---|---|
| [Chinchilla — The Paper That Changed AI（Omar Faroque 博客）](https://www.omarfaroque.com/posts/chinchilla.html) | "改判"叙事的清晰时间线 |
| [TheoremPath · Scaling Laws 专题页](https://theorempath.com/topics/scaling-laws) | Kaplan vs Chinchilla 的公式级对照 |
| [An empirical analysis of compute-optimal LLM training（DeepMind 官方博客）](https://deepmind.google/blog/an-empirical-analysis-of-compute-optimal-large-language-model-training/) | **官方一手博客**：发布时的核心结论与 Chinchilla/Gopher 对决摘要 |
| [Scaling Laws, Carefully（Lilian Weng，2026-06）](https://lilianweng.github.io/posts/2026-06-24-scaling-laws/) | 权威综述含对 Chinchilla 口径的批判性讨论；[知乎译文](https://zhuanlan.zhihu.com/p/2053808273044797046) |
| [Thoughts on Chinchilla（Irhum Shafkat 博客）](https://irhum.github.io/blog/chinchilla/) | 2023-10 博客，讨论 1:1 律的适用条件与误用 |
| [Chinchilla Scaling Laws: Compute-Optimal LLM Training（mbrenndoerfer）](https://mbrenndoerfer.com/writing/chinchilla-scaling-laws-compute-optimal-llm-training) | Handbook 章节：20 tokens/参数的来龙去脉 |
| [Chinchilla Scaling: A replication attempt（arXiv:2404.10102）](https://arxiv.org/abs/2404.10102) | 复现分析：复核三法原始数据，修正两派分歧 |
| [Scaling Laws and Compute-Optimal Training Beyond Fixed Training Duration（Hägele et al., NeurIPS 2024）](https://proceedings.neurips.cc/paper_files/paper/2024/file/8b970e15a89bf5d12542810df8eae8fc-Paper-Conference.pdf) | 重要后续：训练长度不再绑死时的最优策略（对"余弦退火 vs 常数 LR"之争的回应） |

### X（推特）与社区讨论

| 链接 | 平台 | 是什么 |
|---|---|---|
| [r/mlscaling · 发布当周讨论串（2022-03）](https://www.reddit.com/r/mlscaling/comments/trwkck/training_computeoptimal_large_language_models/) | Reddit | 39 票讨论帖，发布期的业界第一反应与质疑 |
| [r/mlscaling 版块](https://www.reddit.com/r/mlscaling/) | Reddit | 缩放律专门社区，后续 replication 讨论都在此 |

### 官方一手资源

- 论文：[arXiv:2203.15556](https://arxiv.org/abs/2203.15556) · [NeurIPS 2022 正式版](https://proceedings.neurips.cc/paper/2022/file/c1e2faff6f588870935f114ebe04a3e5-Paper-Conference.pdf)
- HuggingFace Papers 页：[https://huggingface.co/papers/2203.15556](https://huggingface.co/papers/2203.15556)
- 官方博客：[DeepMind · An empirical analysis of compute-optimal LLM training](https://deepmind.google/blog/an-empirical-analysis-of-compute-optimal-large-language-model-training/)

### 给阅读者的建议路径

1. 先读 **BAAI《OpenAI 与 DeepMind 的 Scaling Laws 之争》**建立两派对立的叙事框架；
2. 再看 **YouTube《Chinchilla Explained》（#PZXN7jm9IC0）**把三种估计方法过一遍；
3. 细节对照 **知乎专文（#1991568611886769303）** 与 **DeepMind 官方博客**；
4. 批判视角读 **replication attempt（2404.10102）** 与 **Hägele et al. 2024**（训练时长自由化后的修正）。
