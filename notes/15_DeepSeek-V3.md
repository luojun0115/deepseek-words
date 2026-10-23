---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 15 · DeepSeek-V3 学习笔记
pageClass: note-page
---


[DeepSeek-V3 技术报告详细解读-1](https://www.bilibili.com/video/BV1WYFQeGEf1/)



[DeepSeek-V3 技术报告详细解读-2](https://www.bilibili.com/video/BV1HqFQezEMt)

mla  旋转编码

[DeepSeek-V3 论文中的隐藏细节](https://www.bilibili.com/video/BV15XFQebEBM)

moe
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [解读 DeepSeek-V3 技术报告（知乎）](https://zhuanlan.zhihu.com/p/20691073152) — 逐段解读设计、训练方法与性能
- [DeepSeek-V3 论文解读（知乎）](https://zhuanlan.zhihu.com/p/14988009150) · [4 万字超详细解读（知乎）](https://zhuanlan.zhihu.com/p/22985118565) · [架构深度解析（知乎）](https://zhuanlan.zhihu.com/p/1983605109255599552) — 三篇高质量中文图文
- [DeepSeek-V3 技术解析：MLA 专篇（OSCHINA）](https://my.oschina.net/IDP/blog/17943880) — MLA 低维潜在向量压缩细节
- [PyImageSearch: DeepSeek-V3 from Scratch 系列（6 篇）](https://pyimagesearch.com/2026/03/09/deepseek-v3-model-theory-config-and-rotary-positional-embeddings) — 最全代码级实现系列：RoPE、MLA、MoE（无辅助损失均衡）、MTP、完整架构
- [Stable-Learn: DeepSeek-V3 深度分析合集](https://stable-learn.com/en/tags/deepseek-v3) — 英文长文合集：MLA+MoE+FP8+MTP 与训练成本全景
- [Martin Fowler: The DeepSeek Series](https://martinfowler.com/articles/deepseek-papers.html) — 全系列综述，含本篇

### 视频（B站 / YouTube）
- [YouTube] [DeepSeek 完整走查（含 MLA/MoE/MTP/FP8 时间戳）](https://www.youtube.com/watch?v=8v2l6SJECW4) — 最著名的英文完整走查
- [YouTube] [DeepSeek V3: The GPT-4 Killer?](https://www.youtube.com/watch?v=ypxtz3I6xvo) — 逐节拆解架构、SFT、基准与价格
- [YouTube] [DeepSeek-V3 Technical Report (Dec 2024)](https://www.youtube.com/watch?v=u3OuPKY-6_c) — 按报告原文顺序的学术向解说
- [YouTube] [What is DeepSeek? Mixture of Experts](https://www.youtube.com/watch?v=0sW-oWuHxX4) — 671B→37B 激活、MLA 与无辅助损失负载均衡
- [B站] [DeepSeek 系列论文解读 1【V3】【R1】](https://www.bilibili.com/video/BV18iNBehEwq/) — V3&R1 系列解读
- [B站] [【闪客】深入解读 DeepSeek V1~V4](https://www.bilibili.com/video/BV1rpovBCEGH/) — V3 在演进长片中的位置

### 英文 & 社区
- [Hugging Face 论文页](https://huggingface.co/papers/2412.19437) — 社区讨论最热，89 篇相关文章收录
- [GitHub 官方仓库 deepseek-ai/DeepSeek-V3](https://github.com/deepseek-ai/DeepSeek-V3) — README 即官方详解（架构亮点、MTP 权重、本地部署）
- [Emergent Mind：DeepSeek-V3 专题](https://www.emergentmind.com/topics/deepseek-v3) — 无辅助损失均衡公式、MTP、FP8 训练与基准全拆解
- [Moonlight 文献综述页](https://www.themoonlight.io/en/review/deepseek-v3-technical-report) — 一句话抓核心贡献 + AI Viewer 精读
- [alphaXiv 论文页](https://www.alphaxiv.org/abs/2412.19437) — 社区讨论与音频摘要
- [Reddit r/LocalLLaMA: DeepSeek V3 "is the shit"](https://www.reddit.com/r/LocalLLaMA/comments/1huq6z0/deepseek_v3_is_the_shit/) — 发布时社区热议
