---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 20 · Prover-V2 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [MIT 科技评论中文：DeepSeek 公布 Prover-V2 技术报告，定理证明达到业内最佳](https://www.mittrchina.com/news/detail/14737) — 34 页报告完整中文解读：递归定理证明、子目标分解、冷启动数据合成与两阶段训练
- [MarkTechPost: DeepSeek-AI Released DeepSeek-Prover-V2](https://www.marktechpost.com/2025/05/01/deepseek-ai-released-deepseek-prover-v2-an-open-source-large-language-model-designed-for-formal-theorem-proving-through-subgoal-decomposition-and-reinforcement-learning) — 英文报道，含 MiniF2F 88.9%、PutnamBench 49/658 等关键数字
- [fengweifeng 论文库条目（含完整中文译文）](https://fengweifeng.com/deepseek-papers/) — 全系列综述含本篇（97% 翻译进度）
- [yudonglee 技术路线图](https://yudonglee.me/deepseek-roadmap/) — Prover 系列列于 Reasoning 主线；V1/V1.5 有专文详解，V2 沿演进脉络出镜

### 视频（B站 / YouTube）
- [B站] [逐篇讲解 DeepSeek 关键 9 篇论文及创新点](https://www.bilibili.com/video/BV1xuK5eREJi/) — 全系列综述视频，含本篇；单篇 V2 精讲未检索到

### 英文 & 社区
- [GitHub 官方仓库 deepseek-ai/DeepSeek-Prover-V2](https://github.com/deepseek-ai/DeepSeek-Prover-V2) — 论文 PDF、miniF2F 全量证明下载、7B/671B 模型入口
- [Unsloth 托管 671B 模型卡](https://huggingface.co/unsloth/DeepSeek-Prover-V2-671B) — 冷启动合成 + RL 训练逻辑说明
- [alphaXiv 音频导读](https://www.alphaxiv.org/audio/2504.21801) — 递归证明搜索、与 Kimina-Prover 对比、AIME 形式化差距

### 全系列综述（含本篇）
- [知乎：10 篇论文读懂 DeepSeek 技术演进脉络](https://zhuanlan.zhihu.com/p/2036459670894810864)
- [Turing Post: Inside DeepSeek Models](https://www.turingpost.com/p/deepseek)

