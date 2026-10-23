---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 07 · DeepSeek-Prover 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [DeepSeek-Prover 详解（V1 + V1.5）：用合成数据与树搜索把开源模型推到 SOTA（yudonglee 系列）](https://yudonglee.me/deepseek-prover-explained/) — 覆盖本篇（V1 合成数据 pipeline 与整证生成）的最佳中文详解
- [一文速览可证数学定理的 DeepSeek-Prover 系列模型（CSDN·v_JULY_v）](https://blog.csdn.net/v_JULY_v/article/details/147739776) — 从 V1 的 800 万条 Lean 4 合成数据讲起（系列长文，含本篇）
- [AI 让数学证明自动化的首次突破：DeepSeek-Prover 实战教程（CSDN）](https://blog.csdn.net/gitblog_00591/article/details/156180164) — 5 个真实数学问题的 V1 证明过程走查
- [DeepSeek-Prover uses synthetic data to boost theorem proving（BDTechTalks）](https://bdtechtalks.com/2024/06/03/deepseek-prover/) — 英文专文：合成数据路线对自动定理证明的意义

### 视频（B站 / YouTube）
- [B站] [逐篇讲解 DeepSeek 关键 9 篇论文及创新点](https://www.bilibili.com/video/BV1xuK5eREJi/) — 全系列综述视频，含本篇（YouTube 版：https://www.youtube.com/watch?v=j5CSpSqNCJw ）

### 英文 & 社区
- [arXiv 原文页](https://arxiv.org/abs/2405.14333) — 论文官方摘要页
- [alphaXiv 论文页](https://www.alphaxiv.org/abs/2405.14333) — 附 AI 解读与讨论
- [Hacker News 讨论帖](https://news.ycombinator.com/item?id=41838589) — 「大规模合成数据做定理证明」热议
- [NeurIPS 2024 收录页](https://neurips.cc/virtual/2024/98511) — 会议官方页

### 全系列综述（含本篇）
- [DeepSeek 技术路线图（yudonglee）](https://yudonglee.me/deepseek-roadmap/) — 全系列演进导览
- [知乎：10 篇论文读懂 DeepSeek 技术演进脉络](https://zhuanlan.zhihu.com/p/2036459670894810864) — 中文全系列串讲
- [Turing Post: Inside DeepSeek Models](https://www.turingpost.com/p/deepseek) — 英文深度综述

