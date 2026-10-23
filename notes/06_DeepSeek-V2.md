---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 06 · DeepSeek-V2 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [[LLM 底座] 关于 DeepSeek-V2 中的 MLA（含代码）（知乎）](https://zhuanlan.zhihu.com/p/696380978) — 原理+代码拆解 V2 核心创新 MLA
- [十分钟读懂 DeepSeek MLA（Multi-Head Latent Attention）（知乎）](https://zhuanlan.zhihu.com/p/1945869053592866971) — 快速入门 MLA 的低秩压缩 KV
- [论文解读 DeepSeek-V2（知乎）](https://zhuanlan.zhihu.com/p/21051416112) — 全面解读 MLA + DeepSeekMoE 两大架构设计
- [一文通透 DeepSeek-V2 中的多头潜在注意力 MLA（CSDN·v_JULY_v）](https://blog.csdn.net/v_JULY_v/article/details/141535986) — 从 MHA 改进讲起，含 KV Cache 压缩推导
- [DeepSeek-V2 高性能推理(1)：通过矩阵吸收十倍提速 MLA 算子（知乎）](https://zhuanlan.zhihu.com/p/700214123) — 结合开源实现讲 MLA 矩阵吸收优化
- [DeepSeek-V2 详解：低秩 latent + decoupled RoPE，重新定义 KV Cache（yudonglee 系列）](https://yudonglee.me/deepseek-v2-explained/) — 系列作者对本篇的专文详解
- [速读 V2：理解 MLA（知乎）](https://zhuanlan.zhihu.com/p/696671064) · [MLA 总结与思考（知乎）](https://zhuanlan.zhihu.com/p/697781431) — 两篇快手笔记

### 视频（B站 / YouTube）
- [B站] [DeepSeek-v2 MLA 原理讲解（RethinkFun）](https://www.bilibili.com/video/BV1BYXRYWEMj/) — 播放近 4 万的 MLA 原理动画
- [B站] [《RethinkFun 深度学习教程》18.3 DeepSeekV2](https://www.bilibili.com/video/BV1j1tczUEMF/) — 系统课讲解
- [B站] [【MLA】【KV Cache】10 分钟了解 DeepSeek-V2 的创新点](https://www.bilibili.com/video/BV1yspRzPEw8/) — 10 分钟速览
- [B站] [DeepSeek V2 为什么可以节省 90% 以上 KV Cache?](https://www.bilibili.com/video/BV11M4m1d7A4/) — 直观解释省显存原理

### 英文 & 社区
- [arXiv 原文页](https://arxiv.org/abs/2405.04434) — 论文官方页（引用超千）
- [Hugging Face 模型页 deepseek-ai/DeepSeek-V2](https://huggingface.co/deepseek-ai/DeepSeek-V2) — 官方权重与说明
- [The New Economics of AI with DeepSeek's Latent Attention（Medium）](https://medium.com/@adnanmasood/the-new-economics-of-ai-with-deepseeks-latent-attention-an-analysis-of-multi-head-latent-eeafd6dbae31) — MLA 如何改变推理成本结构
- [DeepSeek-V2 多头潜在注意力讲解（BAAI 社区）](https://hub.baai.ac.cn/view/42912) — 聚焦 GPU 利用率瓶颈与 MLA 实现

