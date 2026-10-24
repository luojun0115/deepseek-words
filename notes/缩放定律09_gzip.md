---
# 「缩放定律」专题 09 的索引卡入口页（卡片见 /notes 专题与索引组）；精读正文在 zhuanti-search/09_gzip-scaling/
title: 缩放定律 09 · gzip 2024
pageClass: note-page
order: 609
cover: "数据多难压， / 定律就多偏数据。"
coverKicker: "Topic · Scaling Laws · 09 gzip"
coverYear: "2024"
---

[← 学习笔记索引](/notes/) · [← 专题总览](缩放定律.md)

# 缩放定律 09 · Pandey 2024：gzip Predicts Data-dependent Scaling Laws

> **论文**：Rohan Pandey（Reworkd，独立作者），2024-05 · [arXiv:2405.16684](https://arxiv.org/abs/2405.16684)
> **一句话**：用 PCFG 造 6 种复杂度的语料，发现缩放律参数随数据的 **gzip 压缩率**系统漂移——数据越难压缩，计算最优解越偏向"多买数据、少买参数"；一条 gzip 命令就能在训练前预估配比。

## 本篇两个入口

| 文件 | 是什么 |
|---|---|
| [精读正文 README](zhuanti-search/09_gzip-scaling/README.md) | 身份卡 / PCFG 实验设计 / 压缩率度量 Eq.3 / 律参数线性漂移 Eq.4 / 前沿漂移图 / StarCoder 推演 / 批判性评价 / 术语表 |
| [全网解读资源](zhuanti-search/09_gzip-scaling/解读资源.md) | **腾讯云/火山引擎两篇中文专文** / Ritvik19 Medium 逐步讲解 / 姊妹篇《LM Is Compression》知乎双解读 / 泛读视频 30:43 章节 |

## 三分钟速览

- **实验**：6 个 PCFG 数据集（压缩率 0.11–0.61）× 6 个模型尺寸（4.2M–1.4B）× 6 档数据量（100K–100M token），单 epoch。
- **律随 H 漂移**：L(N,D)=E+A/N^α+B/D^β 的五个参数都可写成压缩率 H 的线性函数；β 从 ~1.31 漂到 ~0.14（好压的数据很快饱和，难压的吃不饱）。
- **前沿交叉**：数据越难压越偏"买数据"；与 Chinchilla 1:1 的交叉发生在 H≈0.23–0.45 之间。
- **真实数据立判**：代码远比自然语言可压缩——两者应配不同参数/数据比例；按此估算 StarCoder 级省 24% FLOPs（≈$278k H100 时）。
- **对 DeepSeek 系**：代码/数学语料占比持续加权的配比策略，方向与"难压缩语料要多喂"一致。
