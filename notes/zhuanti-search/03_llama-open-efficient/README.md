---
# 缩放定律专题 03：Touvron et al. 2023，LLaMA: Open and Efficient Foundation Language Models（arXiv:2302.13971）
title: 缩放定律 03 · LLaMA 2023：Open and Efficient Foundation Language Models
pageClass: note-page
---

[← 专题总览](../index.md)

# 03 · LLaMA 2023：Open and Efficient Foundation Language Models

> **一句话**：缩放律的"第三次改判"——目标函数从训练算力换成**推理算力**：既然模型要被调用亿万次，就该训小一点、喂多得多。7B~65B 四个模型、1T~1.4T tokens，13B 打赢 GPT-3 175B，并把 RoPE+RMSNorm+SwiGLU 这套配方变成了整个开源世界的底座。

## ① 论文身份卡

| 项 | 值 |
|----|----|
| 标题 | LLaMA: Open and Efficient Foundation Language Models |
| 机构 / 团队 | Meta AI（巴黎等） |
| 作者 | Hugo Touvron、Thibaut Lavril、Gautier Izacard、Xavier Martinet、Marie-Anne Lachaux、Timothée Lacroix、Baptiste Rozière、Naman Goyal、…、Guillaume Lample（14 人） |
| 发表 | arXiv:2302.13971，2023-02 |
| 链接 | [原文](https://arxiv.org/abs/2302.13971) · [Meta AI 公告](https://ai.meta.com/blog/large-language-model-llama-meta-ai/) |
| 关键词 | inference-optimal、data mixture、open weights、RoPE、RMSNorm、SwiGLU |

## ② 定位与动机

**痛点**：Chinchilla 口径下"20 tokens/参数"只保证**训练**算力最优；但对开源社区和企业来说，模型会被部署、被推理亿万次——推理成本（每 token 的延迟与显存）才是主导项。一个 70B 的"训练最优"模型，推理账单可能养不起。

**前作 gap**：Chinchilla 论文自己就承认未考虑推理；但没人给出"为推理优化该怎么训"的公开实践。

**本文思路**：给定**目标推理性能与推理预算**，反推训练策略——用比 Chinchilla 建议多得多的 token 训小模型（7B 训 1T，约 143 tokens/参数），并公开权重，让生态来验证。

## ③ 核心贡献（4 条）

1. **缩放立场改判**：训练最优 ≠ 推理最优；公开了"小模型 × 超量 token"路线的完整配方。
2. **同尺寸最强开源底座**：LLaMA-13B 在多数基准超过 GPT-3 175B；LLaMA-65B 与 Chinchilla-70B、PaLM-540B 同台竞技。
3. **训练配方标准化**：RMSNorm（Pre-Norm）+ SwiGLU + RoPE + 无 bias，1T~1.4T tokens 混合语料——成为此后开源模型的默认模板。
4. **开放权重**：向研究者放出的 7B~65B 权重直接引爆开源生态（Alpaca、Vicuna、QLoRA 时代）。

## ④ 方法精读

**模型与训练配置**：

```text
规模：7B / 13B / 33B / 65B
token：7B/13B → 1.0T；33B/65B → 1.4T（65B ≈ 22 tokens/参数，恰在 Chinchilla 附近；
       7B~33B 则是 42~143 tokens/参数，远超 20 的"训练最优"口径）
架构：Pre-Norm RMSNorm · SwiGLU（FFN 隐层 ×2/3）· RoPE（θ=10000）· 无 bias · MHA
优化：AdamW（0.9, 0.95）· 余弦退火至峰值 10% · wd 0.1 · grad clip 1.0 · warmup 2000 步
上下文：2048 · 词表：BPE 32K（数字拆位、字节回退）
```

**语料配比（共 ~1.4T token，原文 §2）**：

```text
CommonCrawl 67% ── CCNet 流水线、行级去重、质量分类
C4          4.5% ┐
GitHub      4.5% ┤ 代码 7%
Wikipedia   4.5% ┤ 高质量少量多遍（为重复数据问题埋下伏笔，见专题 05）
Books       4.5% ┘
ArXiv       2.5% ── LaTeX 清洗
StackExchange 2% ── 按分数排序
```

**缩放立场的账**：

```text
Chinchilla 训练最优：    7B → ~140B token 就该停
LLaMA 实际做法：        7B → 1T token（≈ 7 倍）
理由：推理时 7B 与 65B 的成本差 ~10 倍；
     用一次性训练算力换永久性推理算力——训练贵一次，推理省到老。
```

## ⑤ 实验解读

| 对比 | 结果 | 出处 |
|------|------|------|
| LLaMA-13B vs GPT-3 175B | 多数基准反超，参数少 13 倍 | 原文 §3 |
| LLaMA-65B vs Chinchilla-70B | 几乎全面相当/互有胜负（除 BoolQ 等） | 原文 §3 |
| LLaMA-65B vs PaLM-540B | 相当（除 BoolQ、WinoGrande 等） | 原文 §3 |
| MMLU | LLaMA-65B 63.4% vs Chinchilla-70B 67.6% | 原文 §3.6 |
| 代码（HumanEval） | 34B/65B 已可用（后成为 Code LLaMA 前身） | 原文 §3.5 |

**数字背后**：MMLU 上 65B 仍输 Chinchilla 4 个点——"推理最优"不是免费的：远离训练最优点的模型，同算力下训练损失确实更差。LLaMA 买的是部署经济学，不是训练效率本身。

## ⑥ 知识点拓展（3）

### 拓展 1：training-optimal vs inference-optimal
- 是什么：同一个缩放问题、两个目标函数。训练最优（Chinchilla）：min 训练 FLOPs；推理最优（LLaMA）：min 训练 FLOPs + 推理 FLOPs×调用量。
- 后续：Llama-2/3 把 token 继续堆到 2T/15T，即该目标函数下的持续外推。

### 拓展 2：LLaMA 式架构模板
- 是什么：RoPE + RMSNorm + SwiGLU + Pre-Norm + 无 bias 的组合。
- 与 DeepSeek 关联：DeepSeek 全系（[06_DeepSeek-V2](../../06_DeepSeek-V2.md) 起）都在这套底座上做增量创新（MLA、MoE 等）——底座是 LLaMA 定型的，创新发生在注意力和 FFN 的位置。

### 拓展 3：数据配比作为超参数
- 是什么：LLaMA 首次把"各来源占比"写成论文级细节（67/4.5/4.5/…）。
- 与系列关联：配比调优直接通向本专题 09（数据复杂度决定配比）与 DeepSeek-V3 的"配比上采样"实践。

## ⑦ 批判性评价

- **优点**：把缩放律从 DeepMind 的内部知识变成全行业的公共品；架构模板与数据细节全公开，是开源 LLM 时代的真正起点。
- **局限与争议**：
  1. 权重仅限研究许可（非商用），真正的商用爆发要等 Llama-2；
  2. 65B 在 MMLU 等知识型基准上仍输同算力 Chinchilla——"多训"买不来没见过的知识；
  3. 1T tokens 里有相当比例高质量数据被多遍消费（Wiki/Books 4.5% 多遍），重复数据的代价当时尚无系统研究（本专题 05 是同年的回答）。

## ⑧ 谱系定位

```text
Kaplan 2020 → Chinchilla 2022 →【本文 2023：换目标函数】→ Llama-2/3（2T/15T）
                                              ↘ Mistral / Qwen / DeepSeek 全系沿用其底座
```

**与 DeepSeek 系列的关联**：DeepSeek-LLM 7B×2T 是"小模型多训"路线的直接延续；DeepSeek 技术报告里的架构表（RoPE/RMSNorm/SwiGLU）读起来眼熟，模板即出自本文。

## ⑨ 资源与延伸阅读

- **A 一手原文**：[LLaMA: Open and Efficient Foundation Language Models（arXiv:2302.13971）](https://arxiv.org/abs/2302.13971) —— 取用：§2（数据配比）、§3（基准对比）
- **B 官方资源**：[Meta AI 公告页](https://ai.meta.com/blog/large-language-model-llama-meta-ai/)
- **C 二手解读**：
  - [LLaMA Paper Summary（AI Zero to Hero）](https://ai.noblerworks.com/papers/language-models/15-llama/summary/) —— 取用：训练配方速查
  - [alphaxiv · LLaMA 讨论页](https://www.alphaxiv.org/abs/2302.13971) —— 取用：65B vs Chinchilla 的逐任务对比整理
- **D 视频**：[LLaMA 论文讲解（YouTube）](https://www.youtube.com/watch?v=E5OnoYF2oAk) —— 取用：7B~65B 系列的设计动机串讲

## ⑩ 核心术语表

| 英文 | 中文 | 一句话解释 |
|------|------|-----------|
| inference-optimal | 推理最优 | 以"训练+推理总算力"为目标函数的缩放策略 |
| data mixture | 语料配比 | 各来源 token 的占比，LLaMA 起成为论文标配细节 |
| byte-pair encoding (BPE) | 字节对编码 | 32K 词表的子词切分，数字拆位、未知字节回退 |
| pre-norm RMSNorm | 前置均方根归一化 | 去掉均值中心的 LayerNorm 变体，训练更稳 |
| SwiGLU | 门控线性单元变体 | FFN 激活改为 SiLU 门控，隐层乘 2/3 补偿参数 |
| weight decay | 权重衰减 | 0.1 的 AdamW 正则，LLaMA 配方默认值 |
