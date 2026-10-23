---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 12 · Janus 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [一文读懂 DeepSeek 多模态大模型 Janus-Pro（知乎，详解 Janus 与 Janus-Pro）](https://zhuanlan.zhihu.com/p/20770930171) — 先讲清 Janus 的视觉编码解耦思想，再讲 Janus-Pro 改进
- [Janus 系列模型：解耦统一多模态理解和生成的视觉编码（知乎）](https://zhuanlan.zhihu.com/p/21253623275) — 重点讲「视觉编码解耦」核心设计
- [DeepSeek Janus: Multimodal Image Model Explained（deepseekai.guide）](https://deepseekai.guide/models/deepseek-janus) — 英文详解：SigLIP + VQ tokenizer 双编码器与家族时间线
- [GitHub 官方项目页 deepseek-ai/Janus](https://github.com/deepseek-ai/Janus) — Janus/JanusFlow/Janus-Pro 系列共用官方主页

### 视频（B站 / YouTube）
- [YouTube] [Janus 1.3B: Small Multimodal Model for Image Generation and RAG](https://www.youtube.com/watch?v=WWrr8l82ZUU) — 详细讲解解耦视觉编码并演示用法
- [YouTube] [DeepSeek Janus-Pro: DeepSeek's Revolution in Multimodal AI?](https://www.youtube.com/watch?v=RQ-0LkpUNro) — 一支视频讲透 Janus/JFlow/Janus-Pro 架构演进
- [B站] [逐篇讲解 DeepSeek 关键 9 篇论文及创新点](https://www.bilibili.com/video/BV1xuK5eREJi/) — 全系列综述视频，含本篇

### 英文 & 社区
- [Hugging Face 论文页](https://huggingface.co/papers/2410.13848) — 官方收录页与讨论
- [Moonlight 文献综述页（已覆盖 Janus 原版设计）](https://www.themoonlight.io/en/review/janus-pro-unified-multimodal-understanding-and-generation-with-data-and-model-scaling)
- [Janus CVPR 2025 Poster 页](https://cvpr.thecvf.com/virtual/2025/poster/35230) — 已被 CVPR 2025 正式收录

### 全系列综述（含本篇）
- [DeepSeek 技术路线图（yudonglee）](https://yudonglee.me/deepseek-roadmap/)
- [知乎：10 篇论文读懂 DeepSeek 技术演进脉络](https://zhuanlan.zhihu.com/p/2036459670894810864)
- [Martin Fowler: The DeepSeek Series](https://martinfowler.com/articles/deepseek-papers.html)

