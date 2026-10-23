---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 09 · ESFT 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [ESFT 详解：只更新任务相关 expert，让 MoE 模型的 fine-tuning 更省更快（yudonglee 系列）](https://yudonglee.me/deepseek-esft-explained/) — 本篇专文详解，定位为 DeepSeekMoE 方法论「第三件套」
- [ESFT 论文解读（BAAI 中文社区）](https://hub.baai.ac.cn/paper/887f01fb-49aa-4f13-9db1-8419081d01fb) — 冻结无关专家、只微调高亲和度专家的思路
- [DeepSeek AI 提出 ESFT：内存最高省 90%、时间最高省 30%（MarkTechPost）](https://www.marktechpost.com/2024/07/06/deepseek-ai-researchers-propose-expert-specialized-fine-tuning-or-esft-to-reduce-memory-by-up-to-90-and-time-by-up-to-30/) — 英文报道式解读，突出关键数字
- [知乎：对 ESFT 的中文小结（MoE 专用 PEFT）](https://www.zhihu.com/question/1887626597667952435/answer/1976339831215912781) — 社区回答里的方法梳理

### 英文 & 社区
- [Hugging Face 论文页](https://huggingface.co/papers/2407.01906) — 收录页与社区评论
- [alphaXiv 论文页](https://www.alphaxiv.org/abs/2407.01906) — AI 辅助解读
- [GitHub 官方仓库 deepseek-ai/ESFT](https://github.com/deepseek-ai/ESFT) — 官方开源实现
- [ACL Anthology: EMNLP 2024 正式收录版](https://aclanthology.org/2024.emnlp-main.46.pdf) — 会议正式版 PDF
- [planetbanatt: Deepseek Continued](https://planetbanatt.net/articles/deepseek2.html) — 英文系列长文，覆盖 Coder-V2→R1 之间 8 篇（含本篇）

### 视频（B站 / YouTube）
- [B站] [逐篇讲解 DeepSeek 关键 9 篇论文及创新点](https://www.bilibili.com/video/BV1xuK5eREJi/) — 全系列综述视频，含本篇；单篇精讲未检索到

