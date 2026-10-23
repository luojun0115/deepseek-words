---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 24 · DeepSeek-V3.2 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [知乎：DeepSeek-V3.2 发布！解读来了](https://zhuanlan.zhihu.com/p/1979049746460066669) — V3.1-Terminus → V3.2-Exp → V3.2 正式版脉络，DSA 架构试水 + 大规模 RL + Agentic 任务合成
- [DeepSeek-V3.2 正式版技术解读（知乎）](https://zhuanlan.zhihu.com/p/1979991066141815036) — 正式版技术拆解
- [2025 LLM 技术报告(11)（知乎）](https://zhuanlan.zhihu.com/p/1979678585833952663) — 年度系列盘点中 V3.2 的定位
- [Kili Technology: DeepSeek V3.2 Explained — Data, RL, and Sparse Attention](https://kili-technology.com/blog/data-story-deepseek-v3-2) — 英文深度拆解：数据合成管线、DSA 与后训练 RL
- [DeepSeek V3.2 全解析（deepseekai.guide）](https://deepseekai.guide/models/deepseek-v3-2) — DSA 把注意力复杂度从 O(L²) 降到 O(Lk)，Exp/正式/Speciale 三版本对照
- [yudonglee 专文：DeepSeek-V3.2 详解（DSA 落地）](https://yudonglee.me/deepseek-roadmap/) — 纳入 MLA→NSA→DSA 注意力演化主线

### 视频（B站 / YouTube）
- [B站] [DeepSeek-V3.2 重磅发布！成本暴降 50%！原论文解读](https://www.bilibili.com/video/BV1b8nzzZE7L/) — 原论文解读 + DSA 稀疏注意力原理
- [YouTube] [DeepSeek Explained 系列相关视频](https://www.youtube.com/watch?v=8v2l6SJECW4) — V3 走查中的 MLA 章节是理解 DSA 的基础（DSA 单篇英文视频稀缺）

### 英文 & 社区
- [Hugging Face 官方模型页 deepseek-ai/DeepSeek-V3.2](https://huggingface.co/deepseek-ai/DeepSeek-V3.2) — 模型卡 + 技术报告 PDF
- [官方 News：DeepSeek V3.2 正式版](https://www.deepseek.com/news/deepseek-v3-2/) — 一手发布说明
- [DeepWiki: DeepSeek Sparse Attention 代码导读](https://deepwiki.com/deepseek-ai/DeepSeek-V3.2-Exp/1.2-deepseek-sparse-attention) — lightning indexer + top-k 选择的自动代码讲解
- [HF Transformers 官方文档：deepseek_v32](https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/deepseek_v32.md) — indexer FP8/Hadamard、top-2048、MQA 模式 MLA 文档
- [NVIDIA cuDNN: DSA 算子文档](https://docs.nvidia.com/deeplearning/cudnn/latest/fe-oss-apis/dsa.html) — NVIDIA 官方 kernel 支持，产业地位佐证
- [Reddit r/ML：V3.2 稀疏注意力机制讨论](https://www.reddit.com/r/MachineLearning/comments/1o2pzxk/r_deepseek_32s_sparse_attention_mechanism/)

