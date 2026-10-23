---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 18 · NSA 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [【手撕 NSA】DeepSeek 新作：原生稀疏注意力超长文（附代码，知乎）](https://zhuanlan.zhihu.com/p/24841366485) — 原理到代码逐层拆解，动手派必读
- [NSA 深度解析（知乎）](https://zhuanlan.zhihu.com/p/25626791635) · [NSA 阅读笔记（知乎）](https://zhuanlan.zhihu.com/p/24632322448) — 两篇高质量中文解读
- [获 ACL 最佳论文的讨论（知乎问题）](https://www.zhihu.com/question/12616022631) — 社区对其获奖与价值的评价
- [The Illustrated Guide to Native Sparse Attention（Medium）](https://medium.com/@nanda.yugandhar/the-illustrated-guid-to-native-sparse-attention-b657b5e76bbc) — 图解三层分支设计
- [DeepSeek Native Sparse Attention 机制专述（Medium）](https://medium.com/data-science-in-your-pocket/deepseek-native-sparse-attention-advanced-attention-mechanism-for-llms-6ac68fc014ff) — token 组合与 kernel 硬件对齐
- [AI Engineering from Scratch: NSA 讲义](https://aiengineeringfromscratch.com/lesson?path=phases%2F10-llms-from-scratch%2F17-native-sparse-attention) — 从零构建视角
- [ACL 2025 官方论文 PDF（最佳论文长文版）](https://aclanthology.org/2025.acl-long.1126.pdf) — 正式收录版本
- [NSA 中文技术博客：硬件对齐的高效长上下文方案](https://generative-ai-discovery.pages.dev/2026/02/01/inference/2025-02-16_nsa-native-sparse-attention/) — 含 Triton kernel 与硬件对齐要点

### 视频（B站 / YouTube）
- [B站] [【论文精读】从 Native Sparse Attention 出发，到任何地方](https://www.bilibili.com/video/BV14k4UzAEMu/) — 针对性最强的 NSA 论文精读
- [B站] [从 NSA 到 DSA：DeepSeek 稀疏注意力完全拆解](https://www.bilibili.com/video/BV1J3x6ztEGX/) — NSA 及其后续 DSA 发展脉络
- [B站] [卢菁博士：稀疏注意力 + DSA（NSA/MLA）](https://www.bilibili.com/video/BV1PGnmzVEwa/)
- [YouTube] [#280 Native sparse attention from DeepSeek](https://www.youtube.com/watch?v=FGmd44d2naQ) — 英文设计动机讲解
- [YouTube] [Hardware-Aligned and Natively Trainable Sparse Attention](https://www.youtube.com/watch?v=PxuOWYUzUYQ) — 围绕原论文标题内容讲解

### 英文 & 社区
- [Hugging Face 论文页](https://huggingface.co/papers/2502.11089) — 曾登 HF 周榜 TOP（约 129 票）
- [Reddit r/MachineLearning 发布讨论帖](https://www.reddit.com/r/MachineLearning/comments/1is9ufs/r_native_sparse_attention_hardwarealigned_and/) — 当日社区集中讨论

