---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 08 · DeepSeek-Coder-V2 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [DeepSeek-Coder-V2 教程：示例、安装、基准测试（DataCamp）](https://www.datacamp.com/zh/tutorial/deepseek-coder-v2) — 中文教程：安装使用 + 逐项基准解读
- [DeepSeek-Coder-V2 中文摘要（LinkedIn Pulse 中文版）](https://cn.linkedin.com/pulse/deepseek-coder-v2-breaking-barrier-closed-source-models-vlad-bogolin-bywte?tl=zh) — 要点与跑分的中文摘要
- [如何看待 DeepSeek 新发布的代码模型 DeepSeek-Coder-V2？（知乎讨论）](https://www.zhihu.com/question/659184541/answer/3582435057) — 知乎高赞讨论，含 KV Cache 与架构分析
- [知乎：DeepSeek-Coder-V2 发布讨论](https://www.zhihu.com/question/659238493/answer/3535361372) — 社区评价与使用场景问答
- [DeepSeek-V2 vs Coder-V2: A Comparative Analysis（PromptLayer）](https://blog.promptlayer.com/deepseek-v2-vs-coder-v2-a-comparative-analysis/) — 英文对比：通用版与代码版定位差异

### 视频（B站 / YouTube）
- [YouTube] [DeepSeek Coder v2: First Open Coding Model that Beats GPT-4 Turbo](https://www.youtube.com/watch?v=_elpZaJERD4) — 英文解读视频

### 英文 & 社区
- [arXiv 原文页](https://arxiv.org/abs/2406.11931) — 论文官方页
- [GitHub 官方仓库 deepseek-ai/DeepSeek-Coder-V2](https://github.com/deepseek-ai/DeepSeek-Coder-V2) — 模型规格与评测表
- [Reddit r/LocalLLaMA 讨论帖](https://www.reddit.com/r/LocalLLaMA/comments/1dhx449/deepseekcoderv2_breaking_the_barrier_of/) — 开源社区本地部署视角讨论
- [Artificial Analysis: Coder-V2 Lite 评测](https://artificialanalysis.ai/models/deepseek-coder-v2-lite) — 第三方独立基准评测
- [Turing Post: Inside DeepSeek Models](https://www.turingpost.com/p/deepseek) — 专讲 Coder-V2 如何把训练数据扩到 10.2T tokens（全系列综述，含本篇）

