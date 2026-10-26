---
category: edge
# 卡片元数据（/notes「专题与索引」组用，2026-10-25 从顶层卡页搬进来）：卡面金句 / 排序 / 封面图名
# 缩放定律专题 04：Sorscher et al. 2022，Beyond Neural Scaling Laws: Beating Power Law Scaling via Data Pruning（arXiv:2206.14486）
title: 缩放定律 04 · Sorscher 2022：Beyond Neural Scaling Laws — Beating Power Law Scaling via Data Pruning
order: 604
cover: "挑对数据， / 幂律也能变指数。"
coverKicker: "Topic · Scaling Laws · 04 Data Pruning"
coverYear: "2022"
coverFile: 缩放定律04_数据剪枝
pageClass: note-page
---

[← 专题总览](../index.md)

# 04 · Sorscher 2022：Beyond Neural Scaling Laws — 数据剪枝打破幂律

> **一句话**：幂律不是天命——如果数据的"难例分布"是重尾的，且你有一个足够好的剪枝指标，把冗余样本剔掉后，误差随数据量可以按**指数**下降，直接逃离幂律刻度。缩放律第一次被"挑数据"这件事改写。

## ① 论文身份卡

| 项 | 值 |
|----|----|
| 标题 | Beyond Neural Scaling Laws: Beating Power Law Scaling via Data Pruning |
| 机构 / 团队 | Princeton · Stanford · DeepMind |
| 作者 | Ben Sorscher、Robert Geirhos、Shashank Shekhar、Surya Ganguli、Ari Morcos |
| 发表 | arXiv:2206.14486，2022-06；NeurIPS 2022 |
| 链接 | [原文](https://arxiv.org/abs/2206.14486) · [OpenReview](https://openreview.net/forum?id=UmvSlP-PyV) · [Meta AI 收录页](https://ai.meta.com/research/publications/beyond-neural-scaling-laws-beating-power-law-scaling-via-data-pruning/) |
| 关键词 | data pruning、heavy-tailed、exponential scaling、pruning metric、perplexity |

## ② 定位与动机

**痛点**：Kaplan/Chinchilla 给的都是幂律——损失想降一个点，数据或算力要翻好几倍，回报天然递减。问题是：这条陡峭的天花板是**数据本身的性质**，还是可以绕开？

**前作 gap**：缩放律研究默认"数据是随机均匀的"；而数据剪枝（data pruning）研究只关心"裁掉 x% 掉几个点"，没人把两件事连起来问：**剪枝指标好到什么程度，缩放曲线的形状会变？**

**本文思路**：把数据集按"难例出现频率"分成三种数学结构（最坏情形 / 幂律 / 重尾），推导每种结构下最优剪枝能达到的缩放指数，再用 ImageNet 实验验证最好情形确实可达。

## ③ 核心贡献（4 条）

1. **三情形定理式刻画**：数据的难例分布决定剪枝的上限——最坏情形下剪枝无用，典型（幂律）情形下剪枝仍得幂律，**重尾情形下可获得指数级缩放律**。
2. **剪枝指标分级**：困惑度（perplexity）、已训练模型的 EL2C（error L2C）等指标越"懂数据"，剪枝收益越大。
3. **ImageNet 实证**：用已训练模型打分做剪枝，同精度所需数据更少、同数据量下精度更高——"beating power law scaling"落地。
4. **方向性结论**：发现更好的剪枝指标，是一条可代替"堆算力"的缩放路径。

## ④ 方法精读

**三种数据结构 × 最优剪枝的缩放指数**：

```text
数据结构                例子频率分布            最优剪枝后的误差-数据量关系
─────────────────────────────────────────────────────────────
worst-case（最坏）      各类别均匀出现          剪枝无增益，只能随机采（代数级）
typical（典型）         幂律/对数分布           先剪"简单例"，仍是幂律、指数略变好
heavy-tailed（重尾）    少数难例占大头（Zipf 式）→ 剪掉冗余后 误差 ~ exp(-c·n) 指数下降 ★
─────────────────────────────────────────────────────────────
重尾直觉：大量样本彼此近似重复（信息冗余），
         只要指标能认出"这是第 N 个近似重复"，指数级节省就有了。
```

**剪枝指标怎么来**（越往下越强）：

```text
无指标           → 随机剪（只会更差）
perplexity       → 用一个小模型对样本打分（"生词率"代理难度）
EL2C / error-l2c → 用一个已训练模型的错误率/置信度打分（"我还会不会做错它"）
训练自举         → 模型自己给自己打分，随训练迭代更新（自举式剪枝）
```

**ImageNet 实验设计**：把 1.28M 图像按指标排序，逐步裁掉"最简单"的部分再训练——用训练好的模型的 EL2C 指标，剪枝后的曲线在同样的数据量下**高于**全量数据的缩放曲线（原文 Fig.3-4）。

## ⑤ 实验解读

| 结论 | 关键数字 | 出处 |
|------|----------|------|
| 重尾 + 好指标 → 指数缩放 | 误差随保留数据指数下降 | 原文 §3 理论 |
| 典型情形只有增量改善 | 仍为幂律 | 原文 §3 |
| ImageNet 剪枝 | 剪掉大量"简单例"后精度反升、训练更省 | 原文 §4 |
| 指标质量决定一切 | 无/弱指标下剪枝净伤害 | 原文 §4 |

**数字背后**：这篇论文真正的信息量在"**指标与分布要匹配**"——重尾数据配好指标才有奇迹；对均匀难例，任何剪枝都输给全量。它把"数据质量"从口号变成了一个可测量的数学条件。

## ⑥ 知识点拓展（3）

### 拓展 1：重尾分布（heavy-tailed）
- 是什么：少数"元素"（类别/特征/难例）占据分布大头，如 Zipf 律。
- 为什么重要：自然语言与互联网数据天然重尾——这也是本专题 09 用"压缩率"测复杂度的底层原因。

### 拓展 2：剪枝指标的"鸡生蛋"问题
- 是什么：最好的指标（EL2C）需要一个已训练模型；要训模型又需要数据。
- 后续发展：DeepMind 2024 年的 JEST（*Data curation via joint example selection further accelerates multimodal learning*, arXiv:2406.17711）用现成评分模型给候选数据联合打分，把本文明示的这条路径做成了工业流程。

### 拓展 3："prune easy"的争议
- 是什么：本文主张重尾数据先剪简单例；但"简单例"的定义依赖指标，剪错方向会净损失。
- 与系列关联：这一张力在下游任务（本专题 07）里更尖锐——预训练阶段的"简单"不等于下游的"有用"。

## ⑦ 批判性评价

- **优点**：第一次给出"缩放律可被数据工程打破"的明确条件；理论（三种分布结构）与实验（ImageNet）闭环。
- **局限与争议**：
  1. 指标是循环依赖的——需要先有模型才能剪出好数据；
  2. 实验集中在分类任务（ImageNet），对开放域语言预训练的适配靠后人（JEST 等）补课；
  3. "指数缩放"是保留数据的理论最优情形，真实管线里的增益是渐进的。

## ⑧ 谱系定位

```text
Kaplan/Chinchilla（数据当均匀介质）→【本文 2022：数据有结构，可挑】
    ↘ DeepSeekMath 2024.02：fastText 分类器迭代筛 120B 数学语料（工业版剪枝）
    ↘ JEST 2024：联合打分剪枝的多模态大规模实践
```

**与 DeepSeek 系列的关联**：DeepSeekMath（[笔记](../../04_DeepSeekMath.md)）用"训练一个分类器 → 捞取更多相似语料 → 再训练"的迭代闭环，正是本文"指标驱动剪枝"在数学语料上的落地；DeepSeek-V3 的质量过滤管线同理。

## ⑨ 资源与延伸阅读

- **一手原文**：[Beyond Neural Scaling Laws（arXiv:2206.14486）](https://arxiv.org/abs/2206.14486) —— 本文取用：§3（三种数据结构）、§4（ImageNet 实验）
- **全网解读**：见本文文末 **⑪ 全网解读资源**（分割线以下，同一页）


## ⑩ 核心术语表

| 英文 | 中文 | 一句话解释 |
|------|------|-----------|
| data pruning | 数据剪枝 | 按指标剔除冗余/低价值样本 |
| heavy-tailed distribution | 重尾分布 | 少数元素占大头的分布（Zipf 式） |
| pruning metric | 剪枝指标 | 给样本打"值不值得学"分数的模型或规则 |
| EL2C | 错误率型指标 | 用已训练模型的错误信息给样本定难度 |
| exponential scaling | 指数缩放 | 误差 ~ exp(-cn)，快于一切幂律的下降速度 |

---

## ⑪ 全网解读资源

> 整理时间：2026-10-24

### 检索关键词

- 检索关键词：`beyond neural scaling laws`、`data pruning`、`数据剪枝/数据修剪`、`heavy-tailed 指数缩放`、`Sorscher Ganguli`。

### 知乎（图文解读）

| 链接 | 是什么 |
|---|---|
| [Meta AI 新研究：实现 AGI 之路，数据剪枝比我们想象得更重要](https://zhuanlan.zhihu.com/p/544033320) | 2022-07 中文报道式解读：SVHN/CIFAR-10/ImageNet 上误差"指数缩放"的实验讲得最清楚 |
| [机器学习学术速递 2022.6.30](https://zhuanlan.zhihu.com/p/535694691) | 发布当周的中文一句话速递（含标题直译"超越神经标度定律"） |
| [透视 Scaling Law 背后的信息论、流形假设与资源分配逻辑](https://zhuanlan.zhihu.com/p/2014387264638169865) | 理论视角：本文"数据分布结构决定缩放上限"的思想放回信息论框架 |

### 英文 / 权威站点

| 链接 | 是什么 |
|---|---|
| [OpenReview · NeurIPS 2022 讨论页](https://openreview.net/forum?id=UmvSlP-PyV) | 审稿人与作者的往返讨论：指数缩放的适用条件被追问得最充分的地方 |
| [NeurIPS 2022 正式版收录页](https://proceedings.neurips.cc/paper_files/paper/2022/hash/7b75da9b61eda40fa35453ee5d077df6-Abstract-Conference.html) | 官方摘要与评审信息 |
| [Meta AI 收录页](https://ai.meta.com/research/publications/beyond-neural-scaling-laws-beating-power-law-scaling-via-data-pruning/) | 机构官方页面 |
| [JEST: Data curation via joint example selection（arXiv:2406.17711）](https://arxiv.org/abs/2406.17711) | DeepMind 2024 续作：把"剪枝指标"做成工业流程，读本文后必看 |
| [Epoch AI · Scaling laws literature review](https://epoch.ai/publications/scaling-laws-literature-review) | 本文在缩放律谱系中的位置（含逐篇评注的论文数据库） |

### 视频（B 站 / YouTube）

| 链接 | 平台 | 是什么 |
|---|---|---|
| [Beyond neural scaling laws – Paper Explained](https://www.youtube.com/watch?v=joZaCw5PxYs) | YouTube | 动画讲解：三种数据结构（最坏/典型/重尾）与对应缩放曲线，最直观的一版 |
| [8 篇 Scaling Laws 论文泛读](https://www.bilibili.com/video/BV1gisteJEWx/) | B站 | 缩放律谱系串讲，本篇"打破幂律"的定位一目了然 |

### X（推特）与社区讨论

| 链接 | 平台 | 是什么 |
|---|---|---|
| [Surya Ganguli 的发布推文](https://x.com/SuryaGanguli/status/1542599453659451392) | X | 通讯作者亲发："如何用数据剪枝获得指数级缩放"——**作者第一手口径** |
| [r/mlscaling · 发布讨论串（2022-06）](https://www.reddit.com/r/mlscaling/comments/vo5br7/220614486_beyond_neural_scaling_laws_beating/) | Reddit | 发布当周社区讨论：teacher-student 式剪枝与适用性争论 |

### 官方一手资源

- 论文：[arXiv:2206.14486](https://arxiv.org/abs/2206.14486) · [HTML 全文](https://arxiv.org/html/2206.14486v6)
- 通讯作者主页：Surya Ganguli（Stanford），论文与 talk 汇总见其个人页

### 给阅读者的建议路径

1. 先看 **YouTube 动画讲解（#joZaCw5PxYs）**——三种数据结构的图示比文字直观得多；
2. 再读 **知乎《数据剪枝比我们想象得更重要》**补实验细节（ImageNet/SVHN/CIFAR 数字）；
3. 打架处看 **OpenReview 审稿往返**（"剪枝指标是不是循环依赖"被正面回应）；
4. 进阶读 **作者 Ganguli 的发布推文** 与 **JEST 续作**，看理论如何变成 2024 年的工业管线。
