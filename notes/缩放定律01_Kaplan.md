---
# 「缩放定律」专题 01 的索引卡入口页（卡片见 /notes 专题与索引组）；精读正文在 zhuanti-search/01_kaplan-scaling-laws/
title: 缩放定律 01 · Kaplan 2020
pageClass: note-page
order: 601
cover: "损失随尺度， / 冥冥之中是幂律。"
coverKicker: "Topic · Scaling Laws · 01 Kaplan"
coverYear: "2020"
---

[← 学习笔记索引](/notes/) · [← 专题总览](缩放定律.md)

# 缩放定律 01 · Kaplan 2020：Scaling Laws for Neural Language Models

> **论文**：Kaplan et al.（OpenAI + JHU），2020-01 · [arXiv:2001.08361](https://arxiv.org/abs/2001.08361)
> **一句话**：语言模型测试损失随参数、数据、算力在 7 个数量级上呈幂律下降；固定算力下"训大模型、提前停"胜过"训小模型训到底"——缩放定律的开山之作。

## 本篇两个入口

| 文件 | 是什么 |
|---|---|
| [精读正文 README](zhuanti-search/01_kaplan-scaling-laws/README.md) | 身份卡 / 定位动机 / 方法精读（三条幂律 + 算力分配）/ 实验解读 / 批判性评价 / 谱系定位 / 术语表 |
| [全网解读资源](zhuanti-search/01_kaplan-scaling-laws/解读资源.md) | 知乎 5 篇 / 中文媒体 4 篇 / 视频（含 Jared Kaplan 本人讲座）/ Lilian Weng 综述 / 建议路径 |

## 三分钟速览

- **三条幂律**：L(N)≈(Nc/N)^0.076、L(D)≈(Dc/D)^0.095、L(C)≈(Cc/C)^0.050，log-log 图上是不弯的直线（原文 Table 1）。
- **算力最优分配**：N_opt ∝ C^0.73、D_opt ∝ C^0.27——"模型为王"；GPT-3 175B 只训 300B token 即此策略的产物。
- **大模型更省样本**：达到同样损失，越大的模型需要的 token 越少。
- **后来**：2022 年被 Chinchilla 改判为"数据端被低估"；2024 年复现分析把分歧归因到学习率调度等实验细节。
- **对 DeepSeek 系**：DeepSeek-LLM 在自有数据上重估缩放律、7B/67B 训 2T tokens，是对本篇与 Chinchilla 两代口径的再修正。
