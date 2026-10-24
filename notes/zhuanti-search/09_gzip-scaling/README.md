---
# 缩放定律专题 09：Rohan Pandey 2024，gzip Predicts Data-dependent Scaling Laws（arXiv:2405.16684）
title: 缩放定律 09 · Pandey 2024：gzip Predicts Data-dependent Scaling Laws
pageClass: note-page
---

[← 专题总览](../index.md)

# 09 · Pandey 2024：gzip 预测数据依赖的缩放律

> **一句话**：Chinchilla 声称缩放律与数据集无关，本文用一个独⽴作者的轻量实验反驳：用 PCFG 造 6 种复杂度的语料，发现拟合出的缩放律参数随数据的 **gzip 压缩率**系统漂移——数据越难压缩，计算最优解越偏向"多买数据、少买参数"。一条 gzip 命令，就能在训练前预测你的数据该配多大的模型。

## ① 论文身份卡

| 项 | 值 |
|----|----|
| 标题 | gzip Predicts Data-dependent Scaling Laws |
| 机构 / 团队 | Reworkd（San Francisco）——单人作者 |
| 作者 | Rohan Pandey |
| 发表 | arXiv:2405.16684，2024-05 |
| 链接 | [原文](https://arxiv.org/abs/2405.16684) · [代码 GitHub（KhoomeiK/complexity-scaling）](https://github.com/KhoomeiK/complexity-scaling) |
| 关键词 | data-dependent scaling law、gzip、compressibility、PCFG、compute-optimal frontier |

## ② 定位与动机

**痛点**：Chinchilla 的 1:1 律是从"网络抓取文本"这**一种**分布上估出来的，却当成了普适律。可数据质量/复杂度明明千差万别——代码、数学、多语言、自然语言的"每 token 信息量"完全不同，凭什么共用一条分配律？

**前作 gap**：Sorscher 2022（本专题 04）证明数据结构能改变缩放曲线的形状，但没给出"用什么可测量预测曲线怎么变"；Jones 2021 在棋盘游戏里发现"缩放律随任务难度平移"，缺一个文本版的可测难度旋钮。

**本文思路**：造一个**复杂度可控**的语料发生器（PCFG：可调产生式规则数量/长度），扫"数据复杂度 × 模型大小 × 数据量"，验证缩放律对复杂度敏感；再找一个便宜复杂度度量——**gzip 压缩率**（压缩率 ≈ 熵的经验代理）——看它能否预测律的漂移。

## ③ 核心贡献（4 条）

1. **定律敏感于数据复杂度**：同一 Chinchilla 形式 L = E + A/N^α + B/D^β，在 6 个 PCFG 数据集上拟出的参数随语法复杂度单调漂移。
2. **gzip 是有效预测器**：各参数可写成压缩率 H 的线性函数（x(H) = m·H + n），用一条 gzip 命令就能预估缩放律。
3. **计算最优前沿随复杂度移动**：数据越难压缩，N_opt 越小、最优解越偏数据；在压缩率 0.23~0.45 之间越过 Chinchilla 的 1:1 线。
4. **真实数据立判**：代码远比自然语言"可压缩"→ 两者应配不同的参数/数据比例；按此估算 StarCoder 级代码模型可省 **24% FLOPs**（约 27.8 万美元 H100 时）。

## ④ 方法精读

**实验设计**：

```text
PCFG 旋钮（越大越复杂）：非终端数 · 终端数 · RHS 选项数 · RHS 长度
6 个数据集：gzip 压缩率 0.11 → 0.61（越低越好压）
模型 6 档：4.2M / 8.8M / 20.3M / 59.0M / 275.3M / 1.4B
数据 6 档：100K / 1M / 5M / 20M / 50M / 100M tokens
训练：单 epoch · batch 32 · AdamW（lr 5e-5 余弦退火）· 4×A100
```

**压缩率度量（原文 Eq.3）**：

```text
H(D) = 每条序列 d 的 ‖gzip(d)‖ / ‖d‖ 的中位数
      ——压缩后字节 / 原始字节，越低 = 冗余越多 = 越好压
      （gzip = DEFLATE = Huffman + LZ77，熵的无参数估计器）
```

**逐数据集拟合 + 线性外推（原文 Eq.1-4）**：

```text
① 每个 PCFG 数据集各自拟合 Chinchilla 式律：
      L(N,D) = E + A/N^α + B/D^β
② 计算最优参数量：
      N_opt(C) = ( (αA/βB) · (C/6)^β )^(1/(α+β))
③ 把五个参数写成 H 的线性函数：
      x(H) = m_x·H + n_x ，x ∈ {E, A, B, α, β}
   → 新数据集只需测一次 H，即可预估整条缩放律
```

**前沿漂移图解**：

```text
最优参数量 N_opt
 │＼
 │ ＼＼ ← H=0.12（极好压）：比 Chinchilla 更偏"买参数"
 │  ＼ ＼＼
 │   ＼   ＼＼ ← Chinchilla 1:1（灰色虚线）
 │    ＼    ＼＼
 │     ＼＿   ＼＼＼ ← H=0.60（难压）：明显偏"买数据"
 └──────────────────────→ 算力 C（对数）
  交叉点在压缩率 0.23~0.45 之间
```

## ⑤ 实验解读

| 结论 | 关键数字 | 出处 |
|------|----------|------|
| 复杂度 → 收敛变慢 | H 越高，所有尺寸收敛越慢 | 原文 Fig.2 |
| 律参数单调漂移 | α 从 ~1.05 降至 ~0.56；β 从 ~1.31 降至 ~0.14 | 原文 Table 2 |
| 前沿交叉 | 1:1 交叉发生在 H≈0.23–0.45 | 原文 §4.1 |
| 真实数据差异 | 代码可压缩性显著高于自然语言 | 原文 Fig.1 |
| 成本推演 | StarCoder 级省 24% FLOPs ≈ $278k H100 时 | 原文 §1 |

**数字背后**：最反直觉的是 β（数据项指数）的剧烈漂移（1.31 → 0.14）——好压的数据"喂多少都快饱和"，难压的数据"永远吃不饱"，两者的最优配比自然南辕北辙。E（不可约熵）反而是唯一不显著随 H 下降的参数——"地板"高度另有人管。

## ⑥ 知识点拓展（3）

### 拓展 1：压缩率 ≈ 熵的经验代理
- 是什么：无损压缩的输出长度逼近序列的香农熵（Shannon 1948），gzip 因此成为"零训练成本的信息量计"。
- 与系列关联：Delétang et al. 2023《Language Modeling Is Compression》把 LM 本身视为压缩器（arXiv:2309.10668）——本文反其道行之，用压缩器量数据。

### 拓展 2：PCFG 作为可控试验台
- 是什么：概率上下文文法可以用旋钮（规则数/长度）精确控制语法复杂度。
- 为什么重要：缩放律研究第一次有了"数据维度的受控变量"，不再只能被动接受真实语料的混杂。

### 拓展 3：对"20 tokens/参数"的最后一击
- 是什么：本专题的收束——Kaplan 说 0.27、Chinchilla 说 0.5、LLaMA 说看推理、Muennighoff 说看数据约束、本文说看压缩率。
- 结论：**不存在普适配比**，只存在"给定数据分布的配比"；gzip 给出了这一分布的第一近似。

## ⑦ 批判性评价

- **优点**：单人 + 4 张 A100 就打中了大厂结论的边界条件；gzip 预测器便宜到人人可用；PCFG 受控实验设计干净。
- **局限与争议**：
  1. PCFG 语料是"整数 token 序列"，不是真正的自然语言——线性外推 x(H) 只在 6 个点中间区域可靠；
  2. 单 epoch、最大 1.4B 参数，远离前沿模型的训练机制；
  3. gzip 对"质量"（事实性、教育价值）不敏感，它量的是**复杂度**不是**好坏**——两者相关但不等同；
  4. 独立作者、未经同行评审（arXiv 预印本），复现依赖其开源仓库。

## ⑧ 谱系定位

```text
Jones 2021（律随任务难度平移）→ Sorscher 2022（数据结构改变曲线）
    →【本文 2024：复杂度可测（gzip）→ 律可预测地漂】
    ↘ 代码模型（DeepSeek-Coder 等）"代码占比高 → 配比应不同"的理论注脚
    ↘ 后续数据混合律（data mixing laws）研究把"复杂度→配比"推向连续优化
```

**与 DeepSeek 系列的关联**：DeepSeek 系对代码/数学语料的配比显著高于 LLaMA 时代（[03 篇](../03_llama-open-efficient/README.md) 的 7% → V3 的大幅加权），方向与本文一致：**难压缩的语料要多喂**；DeepSeek-Coder 的训练配置可视为"按数据复杂度调分配"的工业案例。

## ⑨ 资源与延伸阅读

- **A 一手原文**：[gzip Predicts Data-dependent Scaling Laws（arXiv:2405.16684）](https://arxiv.org/abs/2405.16684) —— 取用：Eq.1-4、Table 1-3
- **B 官方资源**：[GitHub · KhoomeiK/complexity-scaling](https://github.com/KhoomeiK/complexity-scaling)（PCFG 生成器 + 拟合代码）
- **C 二手解读**：
  - [Papers Explained · gzip Predicts Data-dependent Scaling Laws（Ritvik 19, Medium）](https://ritvik19.medium.com/papers-explained-570-gzip-predicts-data-dependent-scaling-laws-44c1d94b1213) —— 取用：压缩率测量与实验流程的逐步讲解
  - [mlsanity · 论文页](https://mlsanity.com/paper/2405.16684/) —— 取用：结论速览
  - [Delétang et al. 2023 · Language Modeling Is Compression（arXiv:2309.10668）](https://arxiv.org/abs/2309.10668) —— 取用："LM 即压缩器"的姊妹视角
- **D 前置**：[Jones 2021 · Scaling Laws for Board Games（arXiv:2104.03787）](https://arxiv.org/abs/2104.03787) —— 取用："律随难度平移"的首个证据

## ⑩ 核心术语表

| 英文 | 中文 | 一句话解释 |
|------|------|-----------|
| compressibility | 可压缩性 | gzip 压缩后/原始字节比，越低越冗余 |
| PCFG | 概率上下文文法 | 产生式规则带概率的文法，可旋钮式控制复杂度 |
| compute-optimal frontier | 计算最优前沿 | 各算力档最优 (N, D) 连成的曲线 |
| data-dependent scaling law | 数据依赖缩放律 | 律参数写成数据属性（如 H）函数的扩展形式 |
| irreducible entropy | 不可约熵 E | 损失的渐近地板，本文中不随 H 显著变化 |
