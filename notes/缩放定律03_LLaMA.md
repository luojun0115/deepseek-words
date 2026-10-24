---
# 「缩放定律」专题 03 的索引卡入口页（卡片见 /notes 专题与索引组）；精读正文在 zhuanti-search/03_llama-open-efficient/
title: 缩放定律 03 · LLaMA 2023
pageClass: note-page
order: 603
cover: "训练最优， / 不等于推理最优。"
coverKicker: "Topic · Scaling Laws · 03 LLaMA"
coverYear: "2023"
---

[← 学习笔记索引](/notes/) · [← 专题总览](缩放定律.md)

# 缩放定律 03 · LLaMA 2023：Open and Efficient Foundation Language Models

> **论文**：Touvron et al.（Meta AI），2023-02 · [arXiv:2302.13971](https://arxiv.org/abs/2302.13971)
> **一句话**：缩放律的第三次改判——目标函数从训练算力换成推理算力：小模型喂超量 token（7B×1T），13B 打赢 GPT-3 175B，并把 RoPE+RMSNorm+SwiGLU 变成开源世界的底座。

## 本篇两个入口

| 文件 | 是什么 |
|---|---|
| [精读正文 README](zhuanti-search/03_llama-open-efficient/README.md) | 身份卡 / 模型与训练配置 / 语料配比 / "缩放立场的账" / 基准对比 / 批判性评价 / 术语表 |
| [全网解读资源](zhuanti-search/03_llama-open-efficient/解读资源.md) | 博客园逐节精读 / 知乎 Llama 家族万字梳理 / 李沐 Llama 3.1 五连讲 / 权重泄露史 / 建议路径 |

## 三分钟速览

- **换目标函数**：Chinchilla 的"20 tokens/参数"只保证训练算力最优；模型被调用亿万次时推理成本才是主导项。
- **配方**：7B/13B 训 1.0T、33B/65B 训 1.4T tokens；RMSNorm + SwiGLU + RoPE + 无 bias + BPE 32K——此后开源模型默认模板。
- **战绩**：LLaMA-13B 多数基准胜 GPT-3 175B；65B 与 Chinchilla-70B、PaLM-540B 同台（MMLU 63.4 vs 67.6，"多训"买不来没见过的知识）。
- **生态**：研究许可权重在发布一周内泄露，直接引爆 Alpaca/Vicuna/QLoRA 开源时代。
- **对 DeepSeek 系**：DeepSeek-LLM 7B×2T 是"小模型多训"的直接延续；DeepSeek 全系架构底座即出自本篇配方。
