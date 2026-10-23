---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 29 · DeepSeek-V4 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [DeepSeek-V4 技术报告解读：从架构到 Infra 的全栈重构（知乎）](https://zhuanlan.zhihu.com/p/2030982954617414764) — CSA/HCA 双轨压缩注意力到 Infra，1M 上下文从「能跑」变「可用」
- [DeepSeek-V4 技术报告解读（知乎·第二篇）](https://zhuanlan.zhihu.com/p/2031507181812585811) — 按架构、优化算法、分布式 Infra、预/后训练逐节梳理：V4-Pro（1.6T/49B 激活）与 V4-Flash（284B/13B 激活）
- [DeepSeek-V4 技术报告快速解读（知乎）](https://zhuanlan.zhihu.com/p/2030970565092177542) — 快速导读 + 系列延伸阅读汇总
- [DeepSeek-V4 详解：1.6T MoE、CSA+HCA 混合 attention（yudonglee 系列）](https://yudonglee.me/deepseek-v4-explained/) — V4 是此前 16 篇论文的「产品级总集成」逐项拆解
- [逐层拆解 DeepSeek-V4 与 V4-Flash（gangliao.me，中文）](https://gangliao.me/blog/2026/deepseek-v4-deep-dive/zh/) — 「百万 token 下账单是 KV cache」逐层拆解混合注意力与缓存管理
- [知乎问题：DeepSeek V4 预览版上线同步开源，亮点盘点](https://www.zhihu.com/question/2030963929510310856) — 多方评价与开案权重链接

### 视频（B站 / YouTube）
- [B站] [【闪客】深入解读 DeepSeek V1~V4！男女老少都听得懂](https://www.bilibili.com/video/BV1rpovBCEGH/) — 手绘动画长片，V4 为终点
- [YouTube] [闪客同款 YouTube 版](https://www.youtube.com/watch?v=XN7XnojObME)
- [YouTube] [The insane engineering of DeepSeek V4](https://www.youtube.com/watch?v=XJUpuOBpT-4) — 英文硬核拆解：Hybrid Attention、CSA 与稀疏 KV，附完整时间轴

### 英文 & 社区
- [官方公告：DeepSeek V4 Preview Release](https://api-docs.deepseek.com/news/news260424/) — V4-Pro/V4-Flash 参数规格与调用方式
- [Hugging Face 官方 V4 系列合集](https://huggingface.co/collections/deepseek-ai/deepseek-v4) — Pro/Flash 权重入口
- [cybernews: DeepSeek V4 评测视角](https://cybernews.com/ai-tools/deepseek-v4/) — 是否值得切换的对比

