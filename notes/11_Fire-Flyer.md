---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 11 · Fire-Flyer 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [幻方 AI DeepSeek 模型背后的万卡集群建设精华（51CTO）](https://www.51cto.com/aigc/2201.html) — 中文详解 Fire-Flyer 2 万卡集群的 PCIe 架构、HFReduce、3FS 等全套优化
- [Fire-Flyer AI-HPC：SC24 官方论文页](https://sc24.supercomputing.org/proceedings/tech_paper/tech_paper_pages/pap350.html) — SC24 技术论文存档页

### 视频（B站 / YouTube）
- [YouTube] [Low-Cost AI Infrastructure Revolution: Fire-Flyer AI-HPC for LLM Training](https://www.youtube.com/watch?v=DChAYv92msA) — 如何用一半成本搭出接近 DGX-A100 的万卡训练集群
- [SC'24 正式论文页（ACM，含现场宣讲录像）](https://dl.acm.org/doi/10.1109/SC41406.2024.00089) — 会议收录页 + Recorded Presentation
- [B站] [逐篇讲解 DeepSeek 关键 9 篇论文及创新点](https://www.bilibili.com/video/BV1xuK5eREJi/) — 全系列综述视频，含本篇

### 英文 & 社区
- [Hugging Face 论文页](https://huggingface.co/papers/2408.14158) — 收录页与社区讨论
- [Emergent Mind](https://www.emergentmind.com/papers/2408.14158) — 英文深度解读：「80% DGX-A100 性能、60% 成本」结论拆解

### 全系列综述（含本篇）
- [DeepSeek 技术路线图（yudonglee）](https://yudonglee.me/deepseek-roadmap/) — 含 Fire-Flyer 集群硬件要点
- [知乎：10 篇论文读懂 DeepSeek 技术演进脉络](https://zhuanlan.zhihu.com/p/2036459670894810864)
- [fengweifeng DeepSeek 论文库](https://fengweifeng.com/deepseek-papers/)
- [Martin Fowler: The DeepSeek Series](https://martinfowler.com/articles/deepseek-papers.html)

