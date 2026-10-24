---
# 「缩放定律」专题 02 的索引卡入口页（卡片见 /notes 专题与索引组）；精读正文在 zhuanti-search/02_chinchilla/
title: 缩放定律 02 · Chinchilla 2022
pageClass: note-page
order: 602
cover: "模型翻倍， / 数据也要翻倍。"
coverKicker: "Topic · Scaling Laws · 02 Chinchilla"
coverYear: "2022"
---

[← 学习笔记索引](/notes/) · [← 专题总览](缩放定律.md)

# 缩放定律 02 · Chinchilla 2022：Training Compute-Optimal Large Language Models

> **论文**：Hoffmann et al.（DeepMind），2022-03，NeurIPS 2022 · [arXiv:2203.15556](https://arxiv.org/abs/2203.15556)
> **一句话**：三种独立方法重估算力最优分配，改判 Kaplan——模型与数据应 1:1 等比（约 20 tokens/参数）；70B 的 Chinchilla 用与 280B Gopher 相同算力在大多数基准反超。

## 本篇两个入口

| 文件 | 是什么 |
|---|---|
| [精读正文 README](zhuanti-search/02_chinchilla/README.md) | 身份卡 / 三法归一 / 参数化损失拟合（E=1.69, A=406.4, B=410.7）/ 历史模型欠训估算 / 批判性评价 / 术语表 |
| [全网解读资源](zhuanti-search/02_chinchilla/解读资源.md) | 知乎专文 / BAAI《Scaling Laws 之争》/ **DeepMind 官方博客** / YouTube 精讲 / 复现分析 / 建议路径 |

## 三分钟速览

- **三法归一**：固定模型变数据、IsoFLOP 轮廓、参数化联合拟合——都指向 N_opt ∝ C^0.5、D_opt ∝ C^0.5。
- **经验法则**：≈20 tokens/参数（10B 模型 ≈ 200B token）；按新律 GPT-3 应训 3.7T、MT-NLG 应训 11.2T（原文 Table 3）。
- **同算力对决**：Chinchilla-70B/1.4T 的 MMLU 67.6% 超 Gopher-280B 的 60.0%。
- **边界**：只优化训练算力，未计推理成本——这一棒交给了 LLaMA（专题 03）；复现争议见 Besiroglu et al. 2024。
- **对 DeepSeek 系**：DeepSeek-LLM 以 Chinchilla 为对照系、在自有数据上重估最优配比（偏多训数据一侧）。
