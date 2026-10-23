---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 01 · DeepSeek-LLM 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [DeepSeek LLM：以长远主义扩展开源语言模型（论文中文翻译，知乎）](https://zhuanlan.zhihu.com/p/21892870242) — 全文中文翻译，适合对照原文逐节读
- [DeepSeek LLM 论文解读（知乎专栏）](https://zhuanlan.zhihu.com/p/23968906426) — 完整解读：模型规格、优化器/超参（AdamW、β1=0.9、β2=0.95）、多步学习率调度等细节
- [一文搞懂 DeepSeek LLM（知乎专栏）](https://zhuanlan.zhihu.com/p/1937265830216857540) — 从「长期主义」视角系统梳理架构与训练方式的综述
- [知乎问答：如何评价 DeepSeek-LLM？](https://www.zhihu.com/question/659184541) — 发布当期多个回答，含「月影（产品经理带你读论文）」长答
- [【DeepSeek 论文精读】1. 从 DeepSeek LLM 到 DeepSeek R1（CSDN·youcans）](https://blog.csdn.net/youcans/article/details/145391398) — 系列精读首发篇：2 万亿 token 预训练、7B/67B 与训练策略
- [DeepSeek 模型解读：Scaling Law, MLA, MoE（知乎专栏）](https://zhuanlan.zhihu.com/p/707492425) — 重点拆本篇灵魂部分 Scaling Law：多步学习率、1e17→2e19 计算预算网格实验、复用第一阶段训练
- [论文阅读《DeepSeek LLM：以长期主义规模化开源语言模型》（牛客社区）](https://m.nowcoder.com/discuss/887838055204200448) — Longtermism 训练体系的个人读后梳理
- [攻克 DeepSeek LLM：一次 AI 论文阅读之旅（腾讯云开发者社区）](https://cloud.tencent.com/developer/article/2506651) — 长文阅读笔记，方法论视角
- [【论文简读】DeepSeek LLM（一起AI）](https://17aitech.com/post/133-deepseek-llm/) — 简读版，重点讲多步学习率调度替换余弦退火
- [DeepSeek LLM 论文页（HyperAI 超神经）](https://hyper.ai/cn/papers/2401.02954) — 中文论文介绍页，摘要中译与关键结论速览
- [DeepSeek LLM · 博客（DOCSAID）](https://docsaid.org/zh-hans/blog/papers/deepseek/deepseek-llm) — 博客式精读：超参选择、Scaling Laws 校准与微调策略比较

### 视频（B站 / YouTube）
- [B站] [【闪客】深入解读 DeepSeek V1~V4！男女老少都听得懂](https://www.bilibili.com/video/BV1rpovBCEGH/) — 手绘动画长片，本篇（=V1）是起点（YouTube 版：https://www.youtube.com/watch?v=XN7XnojObME ）
- [B站] [逐篇讲解 DeepSeek 关键 9 篇论文及创新点](https://www.bilibili.com/video/BV1xuK5eREJi/) — 系列课程，DeepSeek LLM 为第一篇（YouTube 版：https://www.youtube.com/watch?v=j5CSpSqNCJw ）
- [B站] [8 篇 Scaling Laws 论文泛读](https://www.bilibili.com/video/BV1gisteJEWx/) — Scaling Law 论文串讲，本篇是代表作之一
- [B站] [解析大模型中的 Scaling Law（卢菁博士）](https://www.bilibili.com/video/BV1eN4y1z7N1/) — 幂律与模型分档背景课，铺垫必看
- [YouTube] [Scaling Open Source Language Models with Longtermism](https://www.youtube.com/watch?v=nS5avAZh7To) — 以论文标题命名的走查视频，内容未全部核实

### 英文 & 社区
- [Hugging Face 论文页](https://huggingface.co/papers/2401.02954) — 官方收录页，权重直达 deepseek-ai/deepseek-llm-7b-base 等 4 个仓库
- [Moonlight 中文评述](https://www.themoonlight.io/zh/review/deepseek-llm-scaling-open-source-language-models-with-longtermism) — 结构化论文评述
- [Emergent Mind](https://www.emergentmind.com/papers/2401.02954) — 论文摘要卡：non-embedding FLOPs/token 表示法 M 速览
- [Planet Banatt: Understanding Modern LLMs via DeepSeek](https://planetbanatt.net/articles/deepseek.html) — 英文长文，专节讲本篇 Scaling Laws 如何指导超参选型
- [Cameron Wolfe: LLM Scaling Laws 综述](https://cameronrwolfe.substack.com/p/llm-scaling-laws) — Kaplan→Chinchilla→DeepSeek LLM 缩放脉络
- [Reddit r/LocalLLaMA：Deepseek LLM 67B Chat & Base](https://www.reddit.com/r/LocalLLaMA/comments/186o3sx/deepseek_llm_67b_chat_base/) — 发布时社区实测与讨论
- [Reddit r/LocalLLaMA：Is DeepSeek a violation of Scaling Laws?](https://www.reddit.com/r/LocalLLaMA/comments/1iejv4i/is_deepseek_a_violation_of_scaling_laws/) — 就本篇确立的 Scaling Law 框架引发的社区争论
- [GitHub 官方仓库 deepseek-ai/deepseek-LLM](https://github.com/deepseek-ai/deepseek-LLM) — 「Let there be answers」，权重与 checkpoints

