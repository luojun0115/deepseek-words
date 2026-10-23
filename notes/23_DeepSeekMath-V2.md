---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 23 · DeepSeekMath-V2 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [腾讯云开发者：DeepSeekMath-V2 再次震撼开源社区](https://cloud.tencent.com/developer/article/2594732) — 685B 自验证：IMO/CMO 金牌水平、Putnam 118/120、Apache 2.0 开放
- [每经网快讯：DeepSeek 推出 DeepSeekMath-V2](https://www.nbd.com.cn/articles/2025-11-27/4159911.html) — LLM 验证器自动审查证明 + 高难样本持续优化的训练框架
- [yudonglee 系列专文：DeepSeekMath-V2 详解（Self-Verifiable Reasoning）](https://yudonglee.me/deepseek-roadmap/) — 系列内 Reasoning 主线专文入口
- [fengweifeng 论文库条目（含中文译文）](https://fengweifeng.com/deepseek-papers/) — 验证器训练 + 推理扩展技术
- [DeepSeek Math 交互式详解（deepseekmodel1.org）](https://deepseekmodel1.org/zh/deepseek-math) — 非官方交互科普：自我验证逐行批改、生成-验证循环与 GRPO 对比

### 视频（B站 / YouTube）
- [YouTube] [DeepSeek Math V2 Review: IMO Gold Level Performance](https://www.youtube.com/watch?v=n8ahfijI8eQ) — IMO 金牌级成绩的横向对比点评
- [B站] [逐篇讲解 DeepSeek 关键 9 篇论文及创新点](https://www.bilibili.com/video/BV1xuK5eREJi/) — 全系列综述含本篇方向；单篇精讲稀缺

### 英文 & 社区
- [GitHub 官方仓库 deepseek-ai/DeepSeek-Math-V2](https://github.com/deepseek-ai/DeepSeek-Math-V2) — IMO-ProofBench、成绩表与可二次核验的证明输出
- [Hugging Face 论文页](https://huggingface.co/papers/2511.22570) — 收录页与社区评论
- [新华社英文报道](https://english.news.cn/20251128/1f5b98d58f0b47e8a343cb9fcdb63abf/c.html) — prover/reviewer 双模型机制报道
- [知乎：10 篇论文读懂 DeepSeek 技术演进脉络（全系列综述）](https://zhuanlan.zhihu.com/p/2036459670894810864)

