---
title: DeepSeek LLM · 全网解读资源
pageClass: note-page
order: 30
cover: "一篇论文， / 28 份外部解读。"
coverKicker: "Topic · DeepSeek-LLM"
coverYear: "2026-10"
---

# DeepSeek LLM（arXiv: 2401.02954）全网解读资源汇总

> 整理时间：2026-10-22

## 0. 论文定位与标题说明

- **arXiv 编号：[2401.02954](https://arxiv.org/abs/2401.02954)**，DeepSeek-AI 团队第一篇 LLM 论文（即 DeepSeek-V1，2024-01-05），也是本站编号 01 的那一篇。
- 标题注记：本站论文总览里写作 **《DeepSeek LLM: Scaling Open Foundation Models with Advancing Hardware》**；arXiv 官方页面现在列出的标题为 **《DeepSeek LLM: Scaling Open-Source Language Models with Longtermism》**。两者指同一篇论文（arXiv 2401.02954），网上资料绝大多数以「Longtermism/长远主义」版本标题收录，检索时用这个标题最容易找齐。

**论文核心内容（找解读时的关键词）**：
- 系统研究 **Scaling Law**：提出用非嵌入 FLOPs/token 表示模型规模 M，用 `C = M·D` 替代近似的 `C = 6ND`；给出 **batch size 与学习率随模型规模变化的缩放公式**；
- **计算最优配置**：M ≈ 1.6934 N^0.3249；每增加 100B token 数据就把模型规模加倍约 0.3039 倍；
- **多步学习率调度器**（multi-step LR scheduler）替代 cosine，且第一阶段可跨不同 batch size 复用；
- 训练 7B/67B 两个 Dense 模型（2T token，中英文），67B 对标并超过 LLaMA-2 70B；
- 发现 **Scaling Law 对 SFT 与 RL 微调同样成立**；7B 为最优性价比规模（微调成本仅 33B 的 54%~78% 但性能相当）；
- 结论：开源 + 长期主义（Longtermism）。

---

## 1. 知乎（图文解读）

| 链接 | 是什么 |
|---|---|
| [DeepSeek LLM：以长远主义扩展开源语言模型（论文中文翻译）](https://zhuanlan.zhihu.com/p/21892870242) | 全文中文翻译，适合对照原文逐节读 |
| [DeepSeek LLM论文解读](https://zhuanlan.zhihu.com/p/23968906426) | 一篇完整解读：模型规格、优化器/超参（AdamW、β1=0.9、β2=0.95、权重衰减 0.1）、多步学习率调度等细节 |
| [知乎问答：如何评价 DeepSeek-LLM？](https://www.zhihu.com/question/659184541) | 发布当期的多个回答，含「月影（产品经理带你读论文）」的回答：[直达](https://www.zhihu.com/question/659184541/answer/114573612841) |
| [DeepSeek LLM系列——V1~V3解读](https://zhuanlan.zhihu.com/p/1901560244187960315) | 把 V1（即本篇）到 V3 的演进串起来：V1 主要探讨 scaling law、超参设置、数据集策略 |
| [DeepSeek模型解读：Scaling Law, MLA, MoE](https://zhuanlan.zhihu.com/p/707492425) | 重点拆本篇的 Scaling Law 部分（多步学习率、1e17→2e19 计算预算网格实验、复用第一阶段训练） |
| [预训练LLM副本攻略：结构优化与超参数调整](https://zhuanlan.zhihu.com/p/707993464) | 以本篇的超参 Scaling Law 公式为基准讲"预训练设超参"怎么做 |
| [Sam聊算法：大模型超参的 Scaling Law（回答）](https://www.zhihu.com/question/25097993/answer/3356180120) | 作者直接用本篇结论回答"深度学习调参有哪些技巧"，实用向 |
| [How To Scale（Turing Post 文章中文译介）](https://zhuanlan.zhihu.com/p/1906090918169277200) | 系统综述 Scaling Law（含本篇的 LR/Batch size 缩放结论），脉络类 |

## 2. 中文博客（博客园 / CSDN）

| 链接 | 是什么 |
|---|---|
| [DeepSeek论文详解（sasatotori，博客园）](https://www.cnblogs.com/sasasatori/p/18843818) | 按 motivation→预训练→SFT→RL→评测走读；重点讲 Scaling Law 研究如何孵出 7B/67B |
| [DeepSeek系列论文解读之 DeepSeek LLM（CSDN）](https://blog.csdn.net/weixin_58022259/article/details/145441638) | 单篇精读，"长期主义遇见社区智慧"视角 |
| [DeepSeek系列论文总结（CSDN）](https://blog.csdn.net/qq_57597568/article/details/145602372) | 系列总结里对本篇提要：batch size、学习率、数据与模型规模的缩放行为、2T token 数据集 |
| [万字长文拆解 DeepSeek 大模型技术演进（aifrontiers）](https://www.cnblogs.com/aifrontiers/p/19608897) | 演进综述，覆盖本篇作为中国首个 67B 完全开源模型对标 LLaMA-2 70B 的位置 |

## 3. 视频（B 站 / YouTube）

| 链接 | 平台 | 是什么 |
|---|---|---|
| [【闪客】深入解读 DeepSeek V1~V4！男女老少都听得懂](https://www.bilibili.com/video/BV1rpovBCEGH/) | B站 | 通俗易懂地把整条 LLM 主线（含本篇 = V1）讲一遍；YouTube 同款：[XN7XnojObME](https://www.youtube.com/watch?v=XN7XnojObME) |
| [8 篇 Scaling Laws 论文泛读](https://www.bilibili.com/video/BV1gisteJEWx/) | B站 | Scaling Law 论文串讲（本篇是其中代表作），适合快速建立谱系 |
| [解析大模型中的 Scaling Law（卢菁博士，B站课程）](https://www.bilibili.com/video/BV1eN4y1z7N1/) | B站 | 不是单讲本篇，但把幂律、为什么模型按 6/7B/13B/130B 分档讲透，铺垫必看 |
| [Scaling Open Source Language Models with Longtermism](https://www.youtube.com/watch?v=nS5avAZh7To) | YouTube | 以论文标题命名的走查视频，未核实全内容，谨慎取用 |
| [What are LLM Scaling Laws](https://www.youtube.com/watch?v=FUqzdvlaoRk) | YouTube | Scaling Law 入门科普，提供看懂本篇的背景知识 |

## 4. 英文 / 权威站点

| 链接 | 是什么 |
|---|---|
| [Hugging Face 论文页](https://huggingface.co/papers/2401.02954) | 官方收录页，模型权重直达（`deepseek-ai/deepseek-llm-7b-base` 等四个仓库） |
| [Emergent Mind 论文摘要](https://www.emergentmind.com/papers/2401.02954) | 机读论文摘要卡：non-embedding FLOPs/token 表示法 M、缩放发现速览 |
| [Moonlight（月色）智能论文评述](https://www.themoonlight.io/zh/review/deepseek-llm-scaling-open-source-language-models-with-longtermism) | 自动化论文评述：超参 Scaling Law、模型规模贡献等要点清单（中文界面） |
| [Turing Post FOD #36](https://www.turingpost.com/p/fod36) | 英文一手解读媒体，对本篇 scaling 开源 LLM 的定位评述 |
| [Understanding Modern LLMs via DeepSeek（Planet Banatt）](https://planetbanatt.net/articles/deepseek.html) | 英文长文，通过 DeepSeek 全系列理解现代 LLM；本篇一节专讲 Scaling Laws 如何预测并指导超参选型 |
| [docsaid 博客读书笔记](https://docsaid.org/zh-hans/blog/papers/deepseek/deepseek-llm) | 中英双语博客笔记，聚焦 Scaling Law 讨论与数据处理策略（去重→筛选） |
| [Cameron Wolfe: LLM Scaling Laws 综述](https://cameronrwolfe.substack.com/p/llm-scaling-laws) | 权威 Scaling Law 综述（Kaplan → Chinchilla → DeepSeek LLM 的独特发现） |
| [AIMultiple: LLM Scaling Laws 专家综述](https://aimultiple.com/llm-scaling-laws) | 汇总学界/工业界观点，本篇被多处引用 |
| [Reddit r/LocalLLaMA：Is DeepSeek a violation of Scaling Laws?](https://www.reddit.com/r/LocalLLaMA/comments/1iejv4i/is_deepseek_a_violation_of_scaling_laws/) | 社区讨论（虽由 V3 引起，但围绕本篇确立的缩放框架展开） |
| [ResearchGate 论文页](https://www.researchgate.net/publication/379694907) | 学术元信息与引用记录 |
| [Maginative 报道](https://www.maginative.com/article/chinese-startup-unveils-impressive-new-ai-chatbot-deepseek/) | 发布当时的英文媒体报道，可看到 2024-01 的发布语境 |

## 5. 官方一手资源

- 论文：[arXiv:2401.02954](https://arxiv.org/abs/2401.02954)（HTML 全文：[v1 HTML](https://arxiv.org/html/2401.02954v1)）
- GitHub：[deepseek-ai/deepseek-LLM](https://github.com/deepseek-ai/deepseek-LLM)（"Let there be answers"，含 7B/67B Base 与 Chat 四个模型及 checkpoints）
- 模型权重：[Hugging Face deepseek-ai](https://huggingface.co/deepseek-ai)（`deepseek-llm-7b-base` / `-7b-chat` / `-67b-base` / `-67b-chat`）

## 6. 给阅读者的建议路径

1. 先看 **B站闪客 V1~V4 视频**（10 分钟建立全系列地图，本篇是起点）；
2. 再读 **知乎「DeepSeek模型解读：Scaling Law,MLA,MoE」（#707492425）** 只精读 Scaling Law 一节——这是本篇的灵魂；
3. 细节拿不准时对照 **知乎中文全文翻译（#21892870242）** 或 arXiv 原文；
4. 想要英文视角 / 引用话语体系，用 **Turing Post** 与 **Cameron Wolfe 综述**。

> 本篇论文自身的精读（缩放定律校准、训练配方、逐阶段拆解）见 [01 · DeepSeek-LLM 学习笔记](01_DeepSeek-LLM.html)；那份笔记末尾另有一份更精简的资源列表。
