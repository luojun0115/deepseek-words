---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 31 · Spatiotemporal 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [全文首发：DeepSeek Harness 背后的秘密，Cordis 的设计哲学深度解读（知乎）](https://zhuanlan.zhihu.com/p/2071345388896924946) — 近 80 页论文（含大量形式化证明）的设计哲学全文级解读
- [DeepSeek 论文揭秘：Cordis 如何管理可逆副作用与动态依赖（博客园）](https://www.cnblogs.com/powertoolsteam/p/22868171) — 传统编程语言的 effect/coeffect 提升为时空两维动态组合机制
- [DeepSeek Harness 是什么？为什么开源后这么火？（腾讯云）](https://developer.cloud.tencent.com/article/2726636) — 从 Harness 开源热度切入，北大×DeepSeek 联合署名论文
- [Cordis: Spatiotemporal Composability & DeepSeek Harness（redreamality.com）](https://redreamality.com/blog/cordis-spatiotemporal-composability-deepseek-harness/) — 英文长文：revertible effects、reactive coeffects、plugin 生命周期
- [Medium: DeepSeek Quietly Built a Different Kind of AI Agent Framework](https://dinmaybrahma.medium.com/deepseek-quietly-built-a-different-kind-of-ai-agent-framework-80e4775103f9) — temporal 与 spatial composability 两类问题

### 视频（B站 / YouTube）
- [YouTube] [Cordis: Spatiotemporal Composability Explained](https://www.youtube.com/watch?v=fKDQ7vFxECs) — TypeScript 元框架如何让动态组件副作用全程可逆

### 英文 & 社区
- [Hugging Face 论文页](https://huggingface.co/papers/2608.25512) — 摘要与社区讨论入口
- [Reddit r/AI_Agents 讨论](https://www.reddit.com/r/AI_Agents/comments/1vrus7t/this_new_deepseek_paper_is_a_mustread_for_anyone/) — 给 agent 动态可组合性提供扎实方案
- [lobste.rs 技术社区讨论帖](https://lobste.rs/s/wwf3th/programming_paradigm_for) — 编程语言与框架设计视角
- [X 要点式推文（thejoven）](https://x.com/thejoven_com/status/2087896967624200452) — 核心不是新 Agent 模型，而是插件系统形式化

### 全系列综述（含本篇）
- [DeepSeek 技术路线图（yudonglee）](https://yudonglee.me/deepseek-roadmap/) — 归入「基础设施层」主线
- [知乎：10 篇论文读懂 DeepSeek 技术演进脉络](https://zhuanlan.zhihu.com/p/2036459670894810864)

