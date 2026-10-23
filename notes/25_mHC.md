---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 25 · mHC 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [mHC 中文解读（知乎）](https://zhuanlan.zhihu.com/p/1990581481937077277) — 知乎首发解读：HC 破坏恒等映射导致数值不稳定，mHC 把残差流约束在流形上
- [残差连接之后，是 mHC（知乎·曾天真）](https://zhuanlan.zhihu.com/p/1996248164529881390) — HC 在大规模训练中的两个核心问题（训练不稳定、系统开销）与解决路径
- [残差连接十年新突破！一文吃透 DeepSeek mHC（知乎·绝密伏击）](https://zhuanlan.zhihu.com/p/2032501763199214881) — 系统科普长文，从 ResNet 演进讲到 mHC
- [mHC 架构用流形约束重构 ResNet 残差连接（知乎·deephub）](https://zhuanlan.zhihu.com/p/1990166597114020628) — 侧重 Sinkhorn-Knopp 双随机矩阵投影
- [mHC 核心机制解读（知乎）](https://zhuanlan.zhihu.com/p/1991534973442875733) — 按「残差连接演进 → mHC 方法」脉络整理
- [新浪财经报道：mHC 发布](https://finance.sina.com.cn/stock/t/2026-01-04/doc-inhfchyr0382333.shtml) — 媒体报道
- [C2 顶刊分享页](https://www.c2.org.cn/h-nd-2647.html) — 国内学术交流渠道

### 视频（B站 / YouTube）
- [B站] [【闪客】深入解读 DeepSeek mHC！但是用大白话哟](https://www.bilibili.com/video/BV1jMi4BbESc/) — 飞天闪客大白话动画，B 站高热（点赞 7500+）
- [B站] [4 分钟速通 DeepSeek 新论文 mHC 是什么？](https://www.bilibili.com/video/BV1jgifB7EAp/) — 短小入门
- [B站] [国产大模型再突破！mHC 论文精讲](https://www.bilibili.com/video/BV1BH6jBCE7g/) — 从残差连接到 Hyper-Connections 再到 mHC
- [B站] [拆解 mHC 论文第一页核心内容](https://www.bilibili.com/video/BV15YrVBYEVP/) — 逐图拆解首页摘要与示意图
- [YouTube] [Manifold-Constrained Hyper-Connections (mHC) 论文解读](https://www.youtube.com/watch?v=HWz9MD00z9w)
- [YouTube] [DeepSeek mHC Explained](https://www.youtube.com/watch?v=z9LRAxVRXOk)

### 英文 & 社区
- [arXiv 官方页](https://arxiv.org/abs/2512.24880) — 论文原文
- [Hugging Face Papers 页](https://huggingface.co/papers/2512.24880) — 336+ upvotes 与社区讨论
- [Reddit r/LocalLLaMA 讨论](https://www.reddit.com/r/LocalLLaMA/comments/1q0zk1u/deepseek_new_paper_mhc_manifoldconstrained/)
- [mHC 精读（Substack·vizuara）](https://vizuara.substack.com/p/mhc-manifold-constrained-hyper-connections) — 「Hyper-Connection 概念 → 流形约束」演化拆解
- [alphaXiv 论文页](https://www.alphaxiv.org/abs/2512.24880)

