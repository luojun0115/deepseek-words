---
# 卡片元数据（/notes「专题与索引」组用，2026-10-25 从顶层卡页搬进来）：卡面金句 / 排序 / 封面图名
# 专题精读工作区：缩放定律（Scaling Laws）。
# 本目录一篇论文一个子目录，每个子目录的 index.md 是精读正文（目录首页）：
# 身份卡 / 定位与动机 / 核心贡献 / 方法精读 / 实验解读 / 知识点拓展 / 批判性评价 / 谱系定位 / 资源来源 / 术语表。
# 文件在 notes/ 子目录下、不带 NN_ 编号前缀，不属于 data/papers.json，也不占用 /notes 索引的论文卡位
# （PaperIndex 的 glob 只扫 notes/*.md 一层，详见 components/PaperIndex.vue）。
title: 缩放定律 · Scaling Laws 专题精读（9 篇）
order: 600
cover: "先定律，再改判， / 最后给定律画出边界。"
coverKicker: "Topic · Scaling Laws × 9"
coverYear: "2020 — 2024"
coverFile: 缩放定律
pageClass: note-page
---

[← 学习笔记索引](/notes/)

# 缩放定律 · Scaling Laws 专题精读

**一句话主线**：预训练一次太贵，"模型该做多大、数据该喂多少"必须先算后训——这 9 篇论文把这道题从经验变成了可预测的定律：先定律（Kaplan → Chinchilla），再改判（LLaMA 为推理省算力），再追问"数据不够怎么办"（剪枝 / 重复 / 数据受限），最后给定律画出边界（下游脱钩 / 观测外推 / 数据复杂度漂移）。

## 〇、发展脉络一图流

```text
时间    2020         2022                      2023                2024
     ┌────────┬───────────┬──────────────┬─────────────┬────────────────────────┐
定律  │ Kaplan │ Chinchilla│              │             │                        │
     │ 模型为王│  1:1 等比 │              │             │                        │
     └───┬────┴─────┬─────┴──────────────┴─────────────┴────────────────────────┘
改判           │ LLaMA（2023.02）：为推理省算力 → 小模型多训 token
数据           │ 数据剪枝(2022.06)   重复数据(2022.05) → 数据受限(2023.05)
边界           │ 下游脱钩(2024.02) · 观测缩放律(2024.05) · gzip 复杂度漂移(2024.05)
                ▼
     GPT-3(175B) → Gopher → Chinchilla(70B) → LLaMA(65B) → 开源时代（DeepSeek 系全部继承）
```

**三条阅读主线**：

1. **算力怎么花**：Kaplan（模型为王）→ Chinchilla（模型与数据 1:1）→ LLaMA（训练最优 ≠ 推理最优）
2. **数据不够怎么办**：Beyond Scaling Laws（挑数据）→ Repeated Data（重复的代价）→ Data-Constrained（重复的上限与最优解）
3. **定律的边界**：Downstream（预训练 loss 与下游指标脱钩）→ Observational（不训练也能预测）→ gzip（定律随数据复杂度漂移）

## 一、9 篇论文总目录

| # | 目录 | 简称 | 一句话 | 年份 / 机构 | arXiv |
|---|------|------|--------|------------|-------|
| 01 | [01_kaplan-scaling-laws](01_kaplan-scaling-laws/index.md) | Kaplan | 损失随参数/数据/算力呈幂律，大模型更省样本 | 2020 · OpenAI / JHU | [2001.08361](https://arxiv.org/abs/2001.08361) |
| 02 | [02_chinchilla](02_chinchilla/index.md) | Chinchilla | 计算最优 ≈ 模型与数据 1:1 等比，~20 tokens/参数 | 2022 · DeepMind | [2203.15556](https://arxiv.org/abs/2203.15556) |
| 03 | [03_llama-open-efficient](03_llama-open-efficient/index.md) | LLaMA | 推理最优 > 训练最优：小模型多训 token 的开源底座 | 2023 · Meta AI | [2302.13971](https://arxiv.org/abs/2302.13971) |
| 04 | [04_beyond-data-pruning](04_beyond-data-pruning/index.md) | 数据剪枝 | 好的剪枝指标把幂律刻度变成指数级 | 2022 · Princeton/DeepMind | [2206.14486](https://arxiv.org/abs/2206.14486) |
| 05 | [05_repeated-data](05_repeated-data/index.md) | 重复数据 | 少量数据重复过多遍 → 双下降，抄写/归纳头被破坏 | 2022 · Anthropic | [2205.10487](https://arxiv.org/abs/2205.10487) |
| 06 | [06_data-constrained](06_data-constrained/index.md) | 数据受限 | 重复 ≤4 epochs ≈ 新数据；数据不够时的最优解 | 2023 · HuggingFace/哈佛 | [2305.16264](https://arxiv.org/abs/2305.16264) |
| 07 | [07_downstream-scaling](07_downstream-scaling/index.md) | 下游任务 | 预训练 loss 单调改善 ≠ 下游指标单调改善 | 2024 · Stanford/Google | [2402.04177](https://arxiv.org/abs/2402.04177) |
| 08 | [08_observational-scaling](08_observational-scaling/index.md) | 观测缩放律 | 不训练新模型，用 ~100 个公开模型预测 GPT-4 | 2024 · 滑铁卢/GDM/斯坦福 | [2405.10938](https://arxiv.org/abs/2405.10938) |
| 09 | [09_gzip-scaling](09_gzip-scaling/index.md) | gzip | 数据越难压缩，定律越偏向"多买数据" | 2024 · Reworkd | [2405.16684](https://arxiv.org/abs/2405.16684) |

> **状态**：9 篇精读全部完成，可点进子目录阅读。每个论文目录含两个文件：**index.md**＝精读正文（身份卡 / 方法精读 / 实验解读 / 批判性评价 / 谱系定位 / 资源来源 / 术语表）；**解读资源.md**＝全网解读导航（知乎 / 中文媒体 / B站 / YouTube / X 与社区 / 官方资源 / 建议阅读路径，2026-10-24 检索整理）。
>
> **索引卡入口**：本专题在 /notes「专题与索引」组挂了 10 张封面卡（1 张专题总览 + 9 张论文卡）。
> 卡面元数据（`cover` 金句 / `coverKicker` / `coverYear` / `order` / `coverFile`）就写在**本页与各子目录 index.md 的 frontmatter** 里，`npm run covers` 按它出图；点卡片直接跳进对应正文。

## 二、建议阅读顺序

```text
第一遍（骨架）: 01 Kaplan → 02 Chinchilla → 03 LLaMA
                （10 分钟理解"同一笔算力的三种花法"）
第二遍（数据）: 05 重复数据 → 06 数据受限 → 04 数据剪枝
                （去重了为什么还要小心？重复多少遍安全？能不能干脆挑数据？）
第三遍（边界）: 07 下游 → 08 观测 → 09 gzip
                （loss 定了基准没定怎么办；不训练怎么预测；定律本身会不会漂）
```

## 三、与 DeepSeek 精读系列的衔接

这 9 篇都不出自 DeepSeek，但 DeepSeek 技术报告里所有"我们训了多少 token、按什么配比、为什么这么训"的决策，都是这 9 篇定下的语言：

- [01_DeepSeek-LLM](../01_DeepSeek-LLM.md)：7B/67B 训 2T tokens，在自有数据上重估了 Chinchilla 的最优配比（偏多训数据一侧）；
- [04_DeepSeekMath](../04_DeepSeekMath.md)：fastText 分类器迭代筛选 120B 数学语料——"挑数据"路线（04 数据剪枝）的工业实践；
- [15_DeepSeek-V3](../15_DeepSeek-V3.md)：14.8T tokens 的质量过滤与配比上采样——数据受限时代的标准操作（06 数据受限）。

## 四、参考文献（九篇原文）

- Kaplan et al. 2020 · *Scaling Laws for Neural Language Models*（arXiv:2001.08361）
- Hoffmann et al. 2022 · *Training Compute-Optimal Large Language Models*（arXiv:2203.15556，NeurIPS 2022）
- Hernandez et al. 2022 · *Scaling Laws and Interpretability of Learning from Repeated Data*（arXiv:2205.10487）
- Sorscher et al. 2022 · *Beyond Neural Scaling Laws: Beating Power Law Scaling via Data Pruning*（arXiv:2206.14486，NeurIPS 2022）
- Touvron et al. 2023 · *LLaMA: Open and Efficient Foundation Language Models*（arXiv:2302.13971）
- Muennighoff et al. 2023 · *Scaling Data-Constrained Language Models*（arXiv:2305.16264，NeurIPS 2023）
- Isik et al. 2024 · *Scaling Laws for Downstream Task Performance of Large Language Models*（arXiv:2402.04177，ICLR 2025 以机器翻译专版发表）
- Ruan, Maddison, Hashimoto 2024 · *Observational Scaling Laws and the Predictability of Language Model Performance*（arXiv:2405.10938，NeurIPS 2024 Spotlight）
- Pandey 2024 · *gzip Predicts Data-dependent Scaling Laws*（arXiv:2405.16684）
