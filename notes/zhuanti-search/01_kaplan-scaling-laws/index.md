---
# 缩放定律专题 01：Kaplan et al. 2020，Scaling Laws for Neural Language Models（arXiv:2001.08361）
title: 缩放定律 01 · Kaplan 2020：Scaling Laws for Neural Language Models
pageClass: note-page
---

[← 专题总览](../index.md)

# 01 · Kaplan 2020：Scaling Laws for Neural Language Models

> **一句话**：语言模型的测试损失随参数量、数据量、算力在 7 个数量级上呈**幂律**下降；固定算力下"训练一个大模型然后提前停止"胜过"训练小模型训到底"。这篇论文把"该训多大的模型"从玄学变成了查表题，定义了 GPT-3 时代的缩放世界观。

## ① 论文身份卡

| 项 | 值 |
|----|----|
| 标题 | Scaling Laws for Neural Language Models |
| 机构 / 团队 | Johns Hopkins University + OpenAI（Kaplan 当时在 JHU） |
| 作者 | Jared Kaplan*、Sam McCandlish*、Tom Henighan、Tom B. Brown、Benjamin Chess、Rewon Child、Scott Gray、Alec Radford、Jeffrey Wu、Dario Amodei |
| 发表 | arXiv:2001.08361，2020-01 |
| 链接 | [原文](https://arxiv.org/abs/2001.08361) · [PDF](https://arxiv.org/pdf/2001.08361) |
| 关键词 | scaling law、power law、compute allocation、sample efficiency、critical batch size |

## ② 定位与动机

**痛点**：预训练一个语言模型动辄百万美元，但没人能回答"同一笔算力，参数开多大、数据喂多少、batch 开多大"——训练前只能拍脑袋。

**前作 gap**：2017-2019 已有零散观测（Hestness et al. 2017 发现测试误差随数据量呈幂律），但只在 1-2 个数量级内、未形成系统规律，也没给出算力分配准则。

**本文思路**：把它当**实验物理**做——训练数百个 Transformer 语言模型（WebText2 语料，上下文 1024），扫过参数量、数据量、算力共 7 个数量级，直接拟合"损失 vs 规模"的曲线，并回答四个问题：损失怎么降？算力怎么分？batch 开多大？架构重不重要？

## ③ 核心贡献（5 条）

1. **三条幂律**：损失分别随非嵌入参数量 N、数据量 D、训练算力 C 呈幂律下降，跨越 7 个数量级稳定成立。
2. **算力最优分配**：N_opt ∝ C^0.73、D_opt ∝ C^0.27——**模型为王**：绝大多数算力应该加在参数上。
3. **大模型更省样本**：达到同样损失，越大的模型需要的 token 越少（样本效率随规模上升）。
4. **架构几乎不重要**：在固定参数量下，层数/宽度/注意力头数怎么配，损失只差几个百分点；规模本身压倒形状。
5. **临界 batch size**：B_crit 随损失下降而下降（原文 §5），低于它时加大 batch 近似免费；且学习率等超参可在大小模型间迁移。

## ④ 方法精读

三条核心幂律（原文 Table 1，WebText2 上拟合）：

```text
L(N) ≈ (Nc / N)^αN          αN = 0.076    Nc = 8.8e13   （非嵌入参数量）
L(D) ≈ (Dc / D)^αD          αD = 0.095    Dc = 5.4e13   （训练 token 数）
L(C) ≈ (Cc / C)^αC          αC = 0.050    Cc = 3.1e8    （训练 FLOPs）

L = 测试交叉熵，单位 nat；幂律前面还有一个不可约熵项 E（自然文本的固有熵）
```

**图解：log-log 图上的直线**

```text
log(损失)
 │＼
 │ ＼   斜率 = -αN ≈ -0.076（很缓：参数要翻 10 倍，损失才降约 16%）
 │  ＼        1 - 10^(-0.076) ≈ 0.16
 │   ＼
 │    ＼＿＿＿＿ 拟合横跨 7 个数量级不弯
 └──────────────────────────→ log(参数量)
```

**为什么"模型为王"**：在算力约束 C ≈ 6·N·D 下，对每一档算力实测不同 (N, D) 组合的损失，看等损失/等算力轮廓落在哪里：

```text
约束：C = 6·N·D
实测：同一 C 下，损失最小的组合偏向"参数大、数据少"
  →  N_opt ∝ C^0.73 ,  D_opt ∝ C^0.27   （原文 §6.2 实测拟合，非纯公式反推）

直觉：样本效率律——大模型每看一个 token 学到的东西更多，
     所以把算力投进参数、训练到中途提前停止更划算。
```

> **方法论备注**：若用后来 Chinchilla 的两项式 L = E + A/N^α + B/D^β 代入本文测得的 αN/αD 反推，最优分配会明显偏向数据侧——这正是 Kaplan（0.73）与 Chinchilla（0.5）分歧的方法论根源之一，详见本专题 02 篇的批判性评价与 09 篇对"定律随数据漂移"的讨论。

**另一个被低估的结论**：大模型样本效率更高。损失同为 3.0 时，100M 模型可能要 20B token，1B 模型只要几 B——所以"训大一点、少喂点、早点停"在训练算力上是划算的，这就是"显著欠训练的大模型"策略（GPT-3 175B 只训 300B token 的直接依据）。

## ⑤ 实验解读

| 结论 | 关键数字 | 出处 |
|------|----------|------|
| 幂律普适 | 7 个数量级内直线拟合 | 原文 Fig.1-3 |
| 架构无关 | 固定 N，形状改动损失差异仅几个百分点 | 原文 §3.2 |
| 样本效率 | 大模型更早达到同损失 | 原文 Fig.4 |
| 算力分配 | N:C^0.73 / D:C^0.27 | 原文 §6.2 |
| 临界 batch | B_crit 随损失下降而下降 | 原文 §5 |

**数字背后**：α ≈ 0.05~0.1 的幂律意味着"指数式回报"——损失想降 10%，规模得翻好几倍。这条陡峭的天花板曲线，正是后来整个行业拼命找"数据/架构/算法改进"（即本专题 04-09 篇）的物理动机。

## ⑥ 知识点拓展（3）

### 拓展 1：不可约熵 E
- 是什么：幂律的渐近下界，即数据分布本身的熵——模型再大也压不掉的部分。
- 为什么重要：它是幂律的"地板"；Chinchilla 后来把 E 拟合为 1.69 nat，gzip 篇（本专题 09）则证明这个"地板"其实随数据复杂度漂移。

### 拓展 2：临界 batch size（B_crit）
- 是什么：梯度噪声与学习信号平衡的 batch 尺度；小于它时加大 batch 几乎不浪费算力。
- 与本文关联：给出了"多大 batch 合理"的第一性判据，也是后来 large-batch 训练与学习率调参迁移的依据。

### 拓展 3：迁移缩放（transfer laws）
- 是什么：论文还验证了在分布 A 上训练、分布 B 上评估，损失仍呈平移过的幂律。
- 与系列关联：这为"预训练 + 微调"范式的可预测性埋下伏笔，也预告了本专题 07（下游任务缩放律）的核心张力。

## ⑦ 批判性评价

- **优点**：第一次把规模化变成可拟合的定量科学；结论简单到能直接指导 GPT-3 的选型；"架构不重要、规模为王"释放了整个行业的算力军备竞赛。
- **局限与争议**：
  1. **数据端被系统性低估**。D_opt ∝ C^0.27 严重偏参数——根因之一是训练长度被学习率余弦退火调度绑死（LR schedule = 训练长度），导致"多训"的收益没测出来。
  2. **2022 年被 Chinchilla 改判**：同样算力下 1:1 分配更优（本专题 02），Gopher/GPT-3 这类模型事后看是"参数过大、显著欠训"。
  3. **2024 年的复现分析**（Besiroglu et al., *Chinchilla Scaling: A replication attempt*, arXiv:2404.10102）指出 Kaplan 拟合方法论上会低估数据项；另有 *Resolving Discrepancies in Compute-Optimal Scaling of Language Models*（Porian et al., NeurIPS 2024）把分歧归因到 LR 调度与 warmup 等细节。
  4. 样本效率结论（"大模型更省数据"）与 Chinchilla 的"小模型多训"路线并不矛盾，但常被误读为"越大的模型永远更划算"。

## ⑧ 谱系定位

```text
2017 Hestness（深度学习误差幂律） → 【本文 2020】 → Chinchilla 2022（1:1 改判）
                                   ↘ GPT-3 2020.05（175B/300B = 本文策略的产物）
                                   ↘ 本专题 04/05（2022：幂律能不能被打破/重复数据为何偏离幂律）
```

**与 DeepSeek 系列的关联**：DeepSeek-LLM（[笔记](../../01_DeepSeek-LLM.md)）在自有数据上重跑缩放实验后得出偏向"多训数据"的最优配比，7B/67B 都训到 2T tokens——正是对本文"0.73 分配"与 Chinchilla"1:1"两代口径的再修正。

## ⑨ 资源与延伸阅读

- **A 一手原文**：[Scaling Laws for Neural Language Models（arXiv:2001.08361）](https://arxiv.org/abs/2001.08361) —— 取用：Table 1（三条幂律参数）、§6.2（算力分配）
- **B 同组后续**：[GPT-3 论文（arXiv:2005.14165）](https://arxiv.org/abs/2005.14165) —— 本文策略的第一个大规模落地
- **C 二手解读**：
  - [Scaling laws for neural language models · 走读笔记（Krish Patel, UWaterloo）](https://cs.uwaterloo.ca/~k587pate/notes/scaling-laws-kaplan.html) —— 取用：逐条推导与曲线讲解
  - [Scaling Laws: Kaplan, Chinchilla, Mirage Emergence（TheoremPath 专题页）](https://theorempath.com/topics/scaling-laws) —— 取用：两代定律的对照框架
  - [Chinchilla Scaling: A replication attempt（arXiv:2404.10102）](https://arxiv.org/abs/2404.10102) —— 取用：对 Kaplan 拟合方法的批判细节
- **D 课程讲义**：[UW CSE 599J · Scaling Laws 课程（2024 冬，第 1 讲）](https://koh.pw/cse599j/slides/CSE599J_1-10-24.pdf) —— 取用：教学视角的九篇缩放律综述串讲

## ⑩ 核心术语表

| 英文 | 中文 | 一句话解释 |
|------|------|-----------|
| power law | 幂律 | L ∝ N^(-α)：log-log 图上是一条直线 |
| irreducible entropy | 不可约熵 | 数据分布固有熵，损失的渐近下界 |
| critical batch size | 临界批大小 | 梯度噪声与信号平衡点，之下加 batch 近似免费 |
| sample efficiency | 样本效率 | 达到同一损失所需 token 数，越大越省 |
| compute allocation | 算力分配 | 固定 FLOPs 下参数量与 token 量的最优配比 |
| non-embedding parameters | 非嵌入参数 | 去掉词表嵌入矩阵后的参数计数口径 |
