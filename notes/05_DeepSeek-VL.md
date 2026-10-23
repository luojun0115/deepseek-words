---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 05 · DeepSeek-VL 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [幻方/深度求索多模态大模型 DeepSeek-VL（知乎）](https://zhuanlan.zhihu.com/p/696505990) — 发布期中文介绍
- [[MLLM 算法推荐] DeepSeek-VL 更懂现实的模型（知乎）](https://zhuanlan.zhihu.com/p/686852476) — 技术向梳理：混合视觉编码器、数据构造与平衡多模态训练策略
- [DeepSeek-VL 论文解读（乔木博客）](https://blog.qiaomu.ai/deepseek-vl) — 1.3B/7B 核心目标：真实场景看图说话且不丢语言能力
- [数据到训练 pipeline，构建 real-world 多模态范式（yudonglee 系列）](https://yudonglee.me/deepseek-vl-explained/) — 中文精读：SigLIP-L + SAM-B 混合编码器与三支柱设计
- [DeepSeek-VL 中文评述（Moonlight）](https://www.themoonlight.io/zh/review/deepseek-vl-towards-real-world-vision-language-understanding) — 结构化评述
- [DeepSeek Vision Models: Janus, VL2, and OCR（Roboflow）](https://roboflow.com/blog/deepseek-vision-models) — 权威视觉平台博客，VL 作为主线起点

### 视频（B站 / YouTube）
- [YouTube] [逐篇讲解 DeepSeek 关键 9 篇论文及创新点](https://www.youtube.com/watch?v=j5CSpSqNCJw) — 系列含 DeepSeek-VL 章节（B站镜像：https://www.bilibili.com/video/BV1xuK5eREJi/ ）
- [B站] [逐篇讲解 DeepSeek 关键 9 篇论文及创新点](https://www.bilibili.com/video/BV1xuK5eREJi/) — 同系列 B 站版

### 英文 & 社区
- [Hugging Face 论文页](https://huggingface.co/papers/2403.05525) — 官方收录页与社区讨论
- [alphaXiv 论文页](https://www.alphaxiv.org/abs/2403.05525) — 可交互问答
- [DeepSeek-VL · Blog（DOCSAID 英文）](https://docsaid.org/en/blog/papers/deepseek/deepseek-vl) — 英文精读，双视觉编码器训练配方
- [Reddit 发布讨论帖](https://www.reddit.com/r/machinelearningnews/comments/1bdrrk7/deepseekai_introduces_deepseekvl_an_opensource/) — 发布时社区讨论
- [GitHub 官方仓库 deepseek-ai/deepseek-vl](https://github.com/deepseek-ai/deepseek-vl) — 权重、代码与 README

