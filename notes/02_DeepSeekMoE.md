---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 02 · DeepSeekMoE 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [深入理解 DeepSeek 系列技术(一)：DeepSeekMoE 架构（知乎）](https://zhuanlan.zhihu.com/p/1927154457638072839) — 细粒度专家划分与共享专家隔离要克服的负载均衡与通信开销
- [【LLM MoE Pretrain】论文分享：DeepSeekMoE（知乎）](https://zhuanlan.zhihu.com/p/1902128681587052917) — 从 Top-2 路由对比切入，解释细粒度切分带来的更灵活专家组合
- [DeepSeekMoE：迈向混合专家语言模型中的终极专家专业化（知乎）](https://zhuanlan.zhihu.com/p/24105779262) — 较完整的中译式导读，覆盖 2B/16B/145B 三档实验
- [DeepSeekMoE 论文略读(一)（知乎）](https://zhuanlan.zhihu.com/p/677538421) — 发布当年的一手略读笔记，两大策略框架清晰
- [迈向混合专家语言模型的终极专业化（CSDN·youcans）](https://blog.csdn.net/youcans/article/details/145485468) — 精读篇，含对 LLaMA2 7B / GShard 的对比数据
- [DeepSeek-MOE 原理讲解（博客园）](https://www.cnblogs.com/gongzb/p/19154754) — 从基础 MoE 实现讲起，推导「让专家更专精」的改造过程

### 视频（B站 / YouTube）
- [YouTube] [DeepSeek Explained | Mixture of Experts (MoE)](https://www.youtube.com/watch?v=pl38wKk-dHo) — 英文讲解 DeepSeekMoE 的门控与专家设计
- [B站] [逐篇讲解 DeepSeek 关键 9 篇论文及创新点](https://www.bilibili.com/video/BV1xuK5eREJi/) — 系列课程，含 DeepSeekMoE 专章

### 英文 & 社区
- [Hugging Face 论文页](https://huggingface.co/papers/2401.06066) — 官方收录页 + 社区讨论
- [alphaXiv 论文页](https://www.alphaxiv.org/abs/2401.06066) — 可交互式问答与评论
- [Understanding DeepSeek Part I: DeepSeekMoE（Chris Hayduk）](https://www.chrishayduk.com/p/understanding-deepseek-part-i-deepseekmoe) — 英文专栏，强调对本地/边缘推理可行性
- [Mixture-of-Experts (MoE) LLMs（Cameron R. Wolfe）](https://cameronrwolfe.substack.com/p/moe-llms) — 把 DeepSeekMoE 放进 Mixtral/Grok 等 MoE 大图景
- [DeepSeek Technical Analysis — Mixture-of-Experts（Medium·DataTurbo）](https://dataturbo.medium.com/key-techniques-behind-deepseek-models-10x-efficiency-1-moe-9bd2534987c8) — 英文技术分析
- [Inside DeepSeek MoE: A Step-by-Step Walkthrough（GoPenAI）](https://blog.gopenai.com/inside-deepseek-moe-a-step-by-step-walkthrough-f5e1966c4e21) — 逐步走读两大创新
- [Martin Fowler: The DeepSeek Series](https://martinfowler.com/articles/deepseek-papers.html) — 工程视角系列综述，含本篇
- [GitHub 官方仓库 deepseek-ai/DeepSeek-MoE](https://github.com/deepseek-ai/DeepSeek-MoE) — 权重与代码

