---
# 卡片元数据（/notes「专题与索引」组用，2026-10-25 从顶层卡页搬进来）：卡面金句 / 排序 / 封面图名
# 缩放定律专题 06：Muennighoff et al. 2023，Scaling Data-Constrained Language Models（arXiv:2305.16264）
title: 缩放定律 06 · Muennighoff 2023：Scaling Data-Constrained Language Models
order: 606
cover: "重复四遍以内， / 约等于新数据。"
coverKicker: "Topic · Scaling Laws · 06 Data-Constrained"
coverYear: "2023"
coverFile: 缩放定律06_数据受限
pageClass: note-page
---

[← 专题总览](../index.md)

# 06 · Muennighoff 2023：数据受限语言模型的缩放律

> **一句话**：互联网的文本快被"用完"了，Chinchilla 的 1:1 分配根本做不到怎么办？这篇论文训练 400 个模型给出可操作答案：**重复 ≤4 epochs ≈ 新数据**，超过后收益指数衰减直至倒亏；并给出数据受限版的缩放律，算出该把重复省下的算力投给参数还是早停。

## ① 论文身份卡

| 项 | 值 |
|----|----|
| 标题 | Scaling Data-Constrained Language Models |
| 机构 / 团队 | HuggingFace · Harvard · Stanford 等 |
| 作者 | Niklas Muennighoff、Alexander M. Rush、Boaz Barak、Teven Le Scao、Aleksandra Piktus、Nouamane Tazi、Sampo Pyysalo、Thomas Wolf、Colin Raffel（9 人） |
| 发表 | arXiv:2305.16264，2023-05；NeurIPS 2023 |
| 链接 | [原文](https://arxiv.org/abs/2305.16264) · [代码 GitHub（huggingface/datablations）](https://github.com/huggingface/datablations) |
| 关键词 | data-constrained、data repetition、epochs、data-constrained scaling law、data curation |

## ② 定位与动机

**痛点**：Chinchilla 律默认数据无限供应——1:1 等比意味着 10B 模型要 200B 独特 token、70B 要 1.4T。而 Villalobos et al. 2022（*Will We Run Out of Data?*）已估算公开高质量文本的增长远慢于训练需求的增长：**数据即将先于算力见顶**。

**前作 gap**：Hernandez 2022（本专题 05）研究"小部分数据重复很多遍"的伤害，但工业界真正面对的问题是反过来的——**整个数据集要重复几遍才划算**；此前没有定量的重复收益曲线，更没有数据受限下的最优分配律。

**本文思路**：把"重复度 R（epochs）"作为独立变量扫进缩放实验（400+ 次训练，最多 9B 参数、900B token），拟合一条同时解释"新数据收益"与"重复数据衰减收益"的缩放律，再回答两个工程问题：重复多少遍？算力改投哪里？

## ③ 核心贡献（4 条）

1. **4 epochs 法则**：受数据约束时，**重复 ≤4 epochs 的损失≈等量新数据**；继续重复收益逐 epoch 衰减，最终可能负收益（不如早停）。
2. **数据受限缩放律**：在 Chinchilla 形式上引入"重复 token 价值衰减 + 多余参数价值衰减"，对全部 400 次训练拟合成立。
3. **最优分配迁移**：数据受限时，计算最优解从"1:1"偏向"**多训几遍数据**"，直到 ~4 epochs 后剩余算力转投参数/早停。
4. **缓解手段实测**：加代码数据、放宽过严的质量过滤器都有正收益——"先扩源、再重复"的优先级排序。

## ④ 方法精读

**实验空间（原文 §3）**：

```text
400+ 次训练：
  独特 token：~0.3B … 900B（受约束）
  总 token：  最高 900B（重复最多 44 epochs）
  参数：      最高 9B（Pythia 式配置，11 个尺寸档）
评估：所有 run 的验证损失 → 拟合数据受限缩放律
```

**核心直觉：重复 token 的边际价值衰减**

```text
第 1 遍：  价值 = 1（新数据）
第 2~4 遍：价值缓慢衰减（≈ 0.9 ~ 0.7?）→ 几乎等价新数据
第 5+ 遍： 衰减加快 → 回收率递减
尾部：     价值 → 0，继续训反而过拟合（损失回升）
```

**受限缩放律的形状**（示意，在 Chinchilla 的 E + A/N^α + B/D^β 上加两处修正）：

```text
L ≈ E + A/N^α(λ) + B/D_eff^β
     其中 D_eff = 独特 token + Σ(每遍重复 token × 该遍衰减系数)
          λ 刻画"参数超出数据支撑后的贬值"
```

**受限下的决策图**：

```text
给定 C（算力）与 U（独特 token）：
  C 所需 token = C/6/20·N … 若 U 足够      → 走 Chinchilla 1:1
  若 U < 所需 → 重复至 4 epochs 顶格
             → 剩余算力：加参数？还是就此打住（防过拟合）？论文给出定量分界
```

## ⑤ 实验解读

| 结论 | 关键数字 | 出处 |
|------|----------|------|
| 4 epochs 法则 | ≤4 epochs 损失变化可忽略 | 原文摘要、§4 |
| 超过 4 epochs | 收益逐 epoch 衰减，最终趋零/为负 | 原文 §4-5 |
| 实验规模 | 400+ runs、≤9B 参数、≤900B token | 原文摘要 |
| 缓解手段 | 代码数据增补、放宽过滤均有效 | 原文 §6 |
| 耗尽预测 | 论文估算 2023-2030 间高质量数据接近见顶 | 原文 §1、§6 |

**数字背后**："4 epochs"的真正意义不是"背口诀"，而是**把重复从禁忌变成可定价的资源**——重复有价、随遍数衰减，于是可以被放进优化目标，与参数一起统筹分配。这也是它与专题 05 的关系：05 揭示重复的危险机制，06 量化重复的安全收益。

## ⑥ 知识点拓展（3）

### 拓展 1：数据约束的定义
- 是什么：当"独特数据量 U < 该算力下 Chinchilla 所需的 token 量"时，称数据受限（data-constrained）。
- 判断意义：大厂与小团队的真实约束不同——算力受限走 Chinchilla，数据受限走本文。

### 拓展 2：多 epoch 的数据排序
- 是什么：重复时的采样顺序（打乱/课程式）会影响收益。
- 与专题 05 关联：05 的"盯重复子集拟合进度"诊断在这里同样适用——拟合到接近零就是该停的信号。

### 拓展 3：合成数据的伏笔
- 是什么：本文只测了代码增补与放宽过滤，未测模型生成数据。
- 后续：2024 年后合成数据管线（以及"模型 Collapse"研究）成为数据受限的主战场——本文是问题陈述的起点。

## ⑦ 批判性评价

- **优点**：实验量级（400+ runs）在该体量论文里罕见；结论直接可用（4 epochs 法则进了大量开源训练配方）；开源了全部模型与数据（GitHub datablations）。
- **局限与争议**：
  1. 最大 9B 参数——"4 epochs 对大模型同样成立"是外推，不是实测；
  2. 重复数据集是"全量重复"，有意按质量加权重复（更接近真实）只做了初步实验；
  3. 收益衰减系数依赖数据质量分布——对自有数据应重估，不能直接抄常数。

## ⑧ 谱系定位

```text
Villalobos 2022（数据见顶预测）→ Hernandez 2022（重复的伤害，本专题 05）
    →【本文 2023：重复的收益定价 + 受限缩放律】
    ↘ 开源配方：多 epoch 预训练（如 Finnish LLM 以 38B token 重复 8 epochs）以此为据
    ↘ DeepSeek-V3 2024.12：14.8T tokens + 配比上采样 = 数据受限时代的标准操作
```

**与 DeepSeek 系列的关联**：DeepSeek-V3（[笔记](../../15_DeepSeek-V3.md)）在 14.8T 语料上按领域配比上采样（数学/代码加权），本质是本文"重复有价、按价值分配"的工业版；DeepSeek-LLM 的 2T tokens 决策同样是在自有数据约束下的分配问题。

## ⑨ 资源与延伸阅读

- **A 一手原文**：[Scaling Data-Constrained Language Models（arXiv:2305.16264）](https://arxiv.org/abs/2305.16264) —— 取用：§4（4 epochs 曲线）、§5（受限缩放律）
- **B 官方资源**：[GitHub · huggingface/datablations](https://github.com/huggingface/datablations)（400 runs 的模型与数据）· [HuggingFace Papers 页](https://huggingface.co/papers/2305.16264)
- **C 二手解读**：
  - [数据受限语言模型扩展（BAAI 中文导读）](https://hub.baai.ac.cn/view/27223) —— 取用：中文视角的结论摘要
  - [Will We Run Out of Data?（arXiv:2211.04325）](https://arxiv.org/abs/2211.04325) —— 取用："数据见顶"的问题来源
  - [r/MachineLearning · 论文讨论串](https://www.reddit.com/r/MachineLearning/comments/16ifl84/r_scaling_dataconstrained_language_models_hugging/) —— 取用：作者答疑与业界反馈
- **D 讨论**：[Niklas Muennighoff · 后续实践推文](https://x.com/Muennighoff/status/1724134083905884408)（38B token 重复 8 epochs 训芬兰语 LLM）—— 取用：法则在小语种场景的应用验证

## ⑩ 核心术语表

| 英文 | 中文 | 一句话解释 |
|------|------|-----------|
| data-constrained | 数据受限 | 独特数据不足以支撑该算力下的 Chinchilla 最优 |
| epoch | 遍数 | 数据被完整重复消费的次数 |
| data repetition value | 重复数据价值 | 第 n 遍重复相对新数据的边际收益（逐遍衰减） |
| data curation | 数据治理 | 过滤/增补/配比等扩大有效数据集的手段 |
| compute optimality | 计算最优性 | 固定算力下 (N, D, epochs) 的最优分配 |
