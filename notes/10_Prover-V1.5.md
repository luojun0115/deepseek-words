---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 10 · Prover-V1.5 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [DeepSeek-Prover-V1.5 解读（知乎）](https://zhuanlan.zhihu.com/p/32389403805) — SFT 数据构成与训练流程拆解
- [DeepSeek-Prover-V1.5 中文导读（deeprlhub）](https://www.deeprlhub.com/blog/1560-deepseek-prover-v15) — 强化学习视角全文导读
- [DeepSeek-Prover-V1.5 翻译翻译（CSDN）](https://blog.csdn.net/qq_28385535/article/details/141505402) — 中译加笔记式导读
- [DeepSeek-Prover 详解（V1 + V1.5）（yudonglee 系列）](https://yudonglee.me/deepseek-prover-explained/) — 重点讲截断-恢复 MCTS 与 RMaxTS
- [New Grounds in Theorem Proving with DeepSeek-Prover-V1.5（Medium）](https://medium.com/@haitham.bouammar71/new-grounds-in-theorem-proving-with-deepseek-prover-v1-5-681c4e41caba) — 英文解读 RMaxTS 内在奖励探索

### 英文 & 社区
- [arXiv 原文页](https://arxiv.org/abs/2408.08152) — 论文官方页
- [Hugging Face 论文页](https://huggingface.co/papers/2408.08152) — 收录页与社区讨论
- [OpenReview 评审页（ICLR 2025）](https://openreview.net/forum?id=I4YAIwrsXa) — 审稿人与作者公开讨论
- [Reddit r/MachineLearning 讨论帖](https://www.reddit.com/r/MachineLearning/comments/1f1nld3/r_deepseekproverv15_harnessing_proof_assistant/) — RMaxTS 与 63.5% 新 SOTA 的讨论
- [LessWrong: Distillation of DeepSeek-Prover V1.5](https://www.lesswrong.com/posts/y3NgXbtCK8qQNzhYq/distillation-of-deepseek-prover-v1-5) — RMaxTS 算法技术摘要
- [官方 X(Twitter) 发布帖](https://x.com/deepseek_ai/status/1824291724887208040) — 官方一手发布

### 全系列综述（含本篇）
- [DeepSeek 技术路线图（yudonglee）](https://yudonglee.me/deepseek-roadmap/) — 演进导览
- [知乎：10 篇论文读懂 DeepSeek 技术演进脉络](https://zhuanlan.zhihu.com/p/2036459670894810864) — 中文串讲
- [fengweifeng DeepSeek 论文库](https://fengweifeng.com/deepseek-papers/) — 中文译文+逐篇解读汇总
- [B站：逐篇讲解 DeepSeek 关键 9 篇论文](https://www.bilibili.com/video/BV1xuK5eREJi/) — 视频版（单篇 V1.5 专属视频未检索到）

