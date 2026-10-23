---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 03 · DeepSeek-Coder 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [如何评价深度求索发布的开源代码大模型 DeepSeek Coder?（知乎问答）](https://www.zhihu.com/question/628883095/answer/3380290320) — 高赞长答，拆 1.3B/6.7B/33B 三档模型与预训练语料
- [【llm】DeepSeek Coder 论文速读（知乎）](https://zhuanlan.zhihu.com/p/686277024) — 速读版，聚焦 HumanEval 等 Pass@1 成绩与基准对比
- [DeepSeek-Coder 中文摘要页（alphaXiv 中文）](https://www.alphaxiv.org/zh/abs/2401.14196) — 讲 87% 源代码 + 10% 英文 + 3% 中文的数据构成
- [DeepSeek-Coder 研报式摘要（研报吧）](https://www.fxbaogao.com/detail/5439519) — 超越 Codex / GPT-3.5 的评测定位梳理
- [Brief Review — DeepSeek-Coder（Sh-tsang·Medium）](https://sh-tsang.medium.com/brief-review-deepseek-coder-when-the-large-language-model-meets-programming-the-rise-of-code-7e87d75ae8a6) — 英文简评，聚焦跨文件补全优势

### 视频（B站 / YouTube）
- [B站] [逐篇讲解 DeepSeek 关键 9 篇论文及创新点](https://www.bilibili.com/video/BV1xuK5eREJi/) — 系列课含 DeepSeek-Coder 专章（YouTube 版：https://www.youtube.com/watch?v=j5CSpSqNCJw ）
- [YouTube] [DeepSeek Coder v2: First Open Coding Model that Beats GPT-4 Turbo](https://www.youtube.com/watch?v=_elpZaJERD4) — 代码系列英文解读（ loose 涉及 Coder→Coder-V2 演进）

### 英文 & 社区
- [Hugging Face 论文页](https://huggingface.co/papers/2401.14196) — 官方收录页
- [alphaXiv 论文页](https://www.alphaxiv.org/abs/2401.14196) — CodeLlama 对比与社区问答
- [GitHub 官方仓库 deepseek-ai/DeepSeek-Coder](https://github.com/deepseek-ai/DeepSeek-Coder) — 官方仓库：权重、fill-in-the-middle 说明与评测表

