---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 16 · DeepSeek-R1 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [《DeepSeek-R1》论文解读（知乎）](https://zhuanlan.zhihu.com/p/20844750193) — 经典解读：R1-Zero 纯 RL（GRPO）直训思路
- [【论文解读】DeepSeek-R1：通过强化学习提升 LLM 推理能力（知乎）](https://zhuanlan.zhihu.com/p/19551355661) — 冷启动 + 多阶段训练全流程
- [论文精读：DeepSeek-R1 的「顿悟时刻」（知乎）](https://zhuanlan.zhihu.com/p/19727315310) — 两段式 RL、顿悟时刻与蒸馏小模型
- [DeepSeek 突然更新 R1 论文：暴增至 86 页（知乎）](https://zhuanlan.zhihu.com/p/1992643061826724743) — 新版论文首次披露的 RL 训练基础设施架构
- [DeepSeek-R1 论文解读及相关技术杂谈（pfcc 博客）](https://pfcc.blog/posts/swagger-deepseek-r1) — 长文精读，含「不成功的尝试」的梳理
- [DeepSeek-R1 万字解读（CSDN）](https://blog.csdn.net/xian_wwq/article/details/145454377) — Zero→R1→蒸馏全流程万字长文
- [DeepSeek-R1 技术三部曲详细解读（知乎）](https://zhuanlan.zhihu.com/p/24339006797) · [技术笔记含图解（知乎）](https://zhuanlan.zhihu.com/p/22112201320) → 这两篇质量较高
- [Medium: R1 与推理时扩容（Inference-Time Scaling）评述](https://medium.com/@saehwanpark/deepseek-r1-a-new-chapter-in-inference-time-scaling-for-reasoning-models-reviewing-deepseek-bae149ca88bc)

### 视频（B站 / YouTube）
- [B站] [DeepSeek-R1 深度解读，大模型+强化学习（ZOMI 酱）](https://www.bilibili.com/video/BV1dHw4e8E3e/) — 知名 B 站讲解者
- [B站] [读 R1 的训练过程《DeepSeek-R1》论文导读（LLM 张老师）](https://www.bilibili.com/video/BV1EmF9e6EdG) — 7.6 万播放，四阶段训练流程
- [B站] [【DeepSeek 系列】深度解读 DeepSeek-R1 论文](https://www.bilibili.com/video/BV1v1AseFExj/) — 按论文顺序逐节解读并补模糊点
- [B站] [EZ 撸 paper: R1 论文详解 part 1（比肩 OpenAI-o1）](https://www.bilibili.com/video/BV14dPfe5EJD) — 3.1 万播放，带独家分析
- [B站] [【精译】UmarJamil：DeepSeek-R1 论文详解](https://www.bilibili.com/video/BV1giFNe9E4k) — 经典英文教程的中英精译
- [YouTube] [李宏毅 2025 第七讲：R1 与推理模型](https://www.youtube.com/watch?v=bJFtcwLSNxI) — 权威课程讲解
- [YouTube] [R1 论文逐段精读 + 训练流程全解](https://www.youtube.com/watch?v=ZoC7OiBR09U)
- [YouTube] [DeepSeek-R1 Paper Explained（AI Papers Academy）](https://www.youtube.com/watch?v=DCqqCLlsIBU) — 去掉 SFT、纯 RL 激发推理
- [YouTube] [和 META 大佬一起 40 分钟解析 V3 + R1](https://www.youtube.com/watch?v=M9TzN-0Raz0) · [前微软工程师视角 R1 Explained](https://www.youtube.com/watch?v=r3TpcHebtxM)
- [B站] [中英双语：R1 理论概述 GRPO + RL + SFT](https://www.bilibili.com/video/BV158FzedEpp/)

### 英文 & 社区
- [Hugging Face 论文页](https://huggingface.co/papers/2501.12948) — 官方论文页与社区讨论
- [HF Open-R1 复现博客](https://huggingface.co/blog/open-r1) — HF 官方团队开源复现 R1 训练路线
- [HF LLM Course R1 章节](https://huggingface.co/learn/llm-course/en/chapter12/3) — Zero 与 R1 对比表清晰
- [AI Papers Academy 图文版](https://aipapersacademy.com/deepseek-r1/) — 英文入门精读
- [Reddit r/LocalLLaMA：R1-Distill 结果难以复现的讨论](https://www.reddit.com/r/LocalLLaMA/comments/1i7rank/claimed_deepseekr1distill_results_largely_fail_to/) — 批判性视角好素材
- [Reddit r/ML「无废话阅读单」](https://www.reddit.com/r/MachineLearning/comments/1ideupn/no_hype_deepseekr1_reading_list/) · [86 页新版论文讨论](https://www.reddit.com/r/MachineLearning/comments/1q6cb0k/r_deepseekr1s_paper_was_updated_2_days_ago/)

