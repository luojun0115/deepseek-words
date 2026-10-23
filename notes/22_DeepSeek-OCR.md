---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 22 · DeepSeek-OCR 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [第一财经：DeepSeek 开源新模型！单张 A100 日处理可超 20 万页数据](https://www.yicai.com/news/102871507.html) — 「光学压缩」思路、97%@10x 与 60%@20x、用图像模糊度模拟遗忘曲线
- [DeepSeek-OCR/OCR-2 解读（知乎）](https://zhuanlan.zhihu.com/p/1999550137660366972) — 中文技术解读
- [Moonlight 中文评述](https://www.themoonlight.io/zh/review/deepseek-ocr-contexts-optical-compression) — 以视觉模态作为文本压缩介质的结构化点评
- [South China Morning Post 英文报道](https://www.scmp.com/tech/tech-trends/article/3329707/deepseek-unveils-multimodal-ai-model-uses-visual-perception-compress-text-input) — 发布背景与开源渠道

### 视频（B站 / YouTube）
- [B站] [Deepseek-OCR 技术报告详解！【论文精读】](https://www.bilibili.com/video/BV1VNyfBcEHP/) — 3 条视频（引言/方法/实验）
- [YouTube] [DeepSeek OCR Explained: 10x Cheaper AI Coding](https://www.youtube.com/watch?v=ooLMdup4krA) — 实测向解读
- [YouTube] [DeepSeek-OCR: Contexts Optical Compression（论文讲解）](https://www.youtube.com/watch?v=tLszWVgL2sw) — 逐点拆解：为什么 OCR 论文在讲上下文压缩

### 英文 & 社区
- [GitHub 官方仓库 deepseek-ai/DeepSeek-OCR](https://github.com/deepseek-ai/DeepSeek-OCR) — Tiny→Gundam 五档分辨率模式与推理代码
- [Reddit r/LocalLLaMA: The Innovations in DeepSeek OCR](https://www.reddit.com/r/LocalLLaMA/comments/1obn0q7/the_innovations_in_deepseek_ocr) — 视觉 token 作为「可调损度压缩谱系」的技术长帖
- [反方研究 1：Optical Context Compression Is Just (Bad) Autoencoding（arXiv 2512.03643）](https://arxiv.org/pdf/2512.03643) — UCSD 批评观点，mean pooling 即可匹敌视觉路径
- [反方研究 2：Visual Merit or Linguistic Crutch?（arXiv 2601.03714）](https://arxiv.org/pdf/2601.03714) — 复原实验：VQA 近随机、约 1 万 token 处崩溃

