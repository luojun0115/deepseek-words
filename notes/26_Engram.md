---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 26 · Engram 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [MIT 科技评论中国：DeepSeek 最新论文，直指 Transformer 要害](https://mittrchina.com/news/detail/15769) — 「条件记忆」概念与 Engram 实体模块设计灵感
- [知乎热问：如何看待梁文锋署名的「条件记忆」及 Engram？](https://www.zhihu.com/question/1994233409871050526/answer/1994379467439764811) — 多答主讨论等参数/等算力 MoE 基线对比
- [Engram 深度解读（机器学习 POD）](https://www.mlpod.com/papers/1372) — 条件记忆作为 MoE 条件计算的互补轴、确定性寻址支持内存预取
- [hyper.ai 中文论文导读](https://hyper.ai/cn/papers/Engram) — 现代 N-gram 嵌入、常数时间查找、稀疏分配问题
- [迈向 V4/R2 之路：Engram 如何解放大模型算力（腾讯云）](https://cloud.tencent.com/developer/article/2619862) — 「查算分离」视角与下一代模型的意义
- [Introl 博客解读](https://introl.com/zh/blog/deepseek-engram-conditional-memory-architecture-january-2026) — 中文版权威博客引流

### 视频（B站 / YouTube）
- [B站] [白话解读 Engram：DeepSeek 又突发论文了](https://www.bilibili.com/video/BV1mYrzBtEga/) — 大白话入门
- [B站] [【Engram】一个视频轻松看懂 DeepSeek 新论文](https://www.bilibili.com/video/BV1jAzuBSED3/) — 快速看懂版
- [B站] [完全搞懂 Engram 模块原理与实现](https://www.bilibili.com/video/BV1vt6tBuEjz/) — 原理 + 实现，含流程图
- [YouTube] [DeepSeek's Insane Architecture Breakthrough [Engram Explained]](https://www.youtube.com/watch?v=xUlX6jvwVfM) — bycloud 出品，14.7 万播放可视化拆解

### 英文 & 社区
- [GitHub 官方仓库 deepseek-ai/Engram](https://github.com/deepseek-ai/Engram) — 官方实现（4.7k+ star），含论文 PDF 与 demo
- [Hugging Face 论文页](https://huggingface.co/papers/2601.07372) — U-shaped scaling law 摘要与讨论
- [Reddit r/LocalLLaMA 发布讨论](https://www.reddit.com/r/LocalLLaMA/comments/1qb034t/github_deepseekaiengram_conditional_memory_via/)
- [Introl 英文：Engram Separates Memory from Reasoning](https://introl.com/blog/deepseek-engram-conditional-memory-architecture-january-2026) — 内存与推理解耦、绕过 GPU HBM 限制
- [MarkTechPost 报道](https://www.marktechpost.com/2026/01/14/deepseek-ai-researchers-introduce-engram-a-conditional-memory-axis-for-sparse-llms/)
- [SGLang Engram 集成提案](https://github.com/sgl-project/sglang/issues/19907) — 推理框架生态动向

