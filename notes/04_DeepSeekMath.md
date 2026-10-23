---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 04 · DeepSeekMath 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [【论文解读】DeepSeekMath：用 GRPO 改进 PPO（知乎）](https://zhuanlan.zhihu.com/p/14574329458) — 经典中文解读：无 critic 模型的 GRPO 与 MATH 破 50%
- [【LLM】GRPO：改进 PPO 增强推理能力（知乎）](https://zhuanlan.zhihu.com/p/15677409107) — GRPO 为什么省显存、如何显著提推理
- [GRPO 算法原始文章解读《DeepSeekMath》（知乎）](https://zhuanlan.zhihu.com/p/25177936374) — 回到公式层面拆组内基线替代价值函数
- [【大模型】GRPO：从 PPO 到群体相对策略优化（CSDN）](https://blog.csdn.net/songxia928_928/article/details/146606701) — 「组内竞争求相对优势 + 双重约束」原理与稳定性
- [B站配套 B 站 GRPO 原理 / 零基础 / 训练方法详解系列](https://www.bilibili.com/video/BV1enQLYKEA5/) — 见视频区（同系列另有 BV1M9NyeVEUp / BV1iZs1zqEgf）
- [DeepSeekMath 综述（Medium·EleventhHourEnthusiast）](https://medium.com/@EleventhHourEnthusiast/deepseekmath-pushing-the-limits-of-mathematical-reasoning-in-open-language-models-f2665df4019e) — 英文书评式综述，评数据收集与 GRPO 双贡献
- [HF 配套技术笔记（官方，无 arXiv 版内容）](https://huggingface.co/deepseek-ai/simple-open-source-gsm8k-solution) — GRPO 思想的工程化一手说明

### 视频（B站 / YouTube）
- [B站] [【论文精读】数学推理强化学习入门：DeepSeekMath 与 GRPO 精华版解析](https://www.bilibili.com/video/BV1w2eG6FEm4/) — 中文精读视频
- [B站] [有难度但必读的一篇论文《DeepSeekMath》](https://www.bilibili.com/video/BV1qUFMeGE2q/) — 「带读 AI 经典论文 100 篇」系列
- [B站] [GRPO 详解：DeepSeekMath（搬运版）](https://www.bilibili.com/video/BV1hbwxzjEbA/) — GRPO 解释视频的 B 站搬运
- [YouTube] [不讲数学的 GRPO 算法解读 | 深入浅出 DeepSeekMath](https://www.youtube.com/watch?v=JZZgBu8MV4Q) — 中文视频，直观理解
- [YouTube] [[GRPO Explained] DeepSeekMath](https://www.youtube.com/watch?v=bAWV_yrqx4w) — 英文视频，GRPO 如何成为 R1 核心
- [YouTube] [GRPO Reinforcement Learning Explained](https://www.youtube.com/watch?v=YCawyzAOg1Y) — AI Papers Academy 出品，PPO→GRPO 全景

### 英文 & 社区
- [Hugging Face 论文页](https://huggingface.co/papers/2402.03300) — 官方收录页
- [Emergent Mind](https://www.emergentmind.com/papers/2402.03300) — 摘要智能概括与引用脉络
- [GRPO Reinforcement Learning Explained（AI Papers Academy 博客版）](https://aipapersacademy.com/deepseekmath-grpo/) — 与视频配套的图文版，逐步还原公式
- [Group Relative Policy Optimization (GRPO)（Cameron R. Wolfe）](https://cameronrwolfe.substack.com/p/grpo) — 英文深度长文，从 GRPO 追到 R1
- [Why GRPO is Important and How it Works（Oxen.ai）](https://www.oxen.ai/blog/why-grpo-is-important-and-how-it-works) — 面向工程师解释 GRPO

