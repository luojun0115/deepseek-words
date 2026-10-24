---
pageClass: wide papers
title: 论文总览
order: 1
cover: "32 篇技术报告， / 两年九个月，五条主线。"
coverKicker: "Index · Papers"
coverYear: "2024 — 2026"
---

<script setup>
import PaperIndex from '../components/PaperIndex.vue'
</script>

# 📚 DeepSeek 论文总览

DeepSeek 全系列论文的时间线、分主线清单与解读资源汇总。本站已为其中 32 篇制作了词汇学习页：→ [词汇学习](/vocab) · [词汇朗读](/listen)

<!-- 卡片墙（2026-10-25 用户要求）：32 张金句封面卡，整卡外链 arXiv 原文；
     下面的文字表保留作细表（时间 / 主线 / 解读资源） -->
<PaperIndex mode="arxiv" />



## 按时间线（首次发表时间排序）

> 🅻＝LLM主线　🅲＝代码　🅼＝数学/推理/证明　🅿＝多模态　🅢＝推理系统与范式　；*斜体*＝仅 GitHub/HF 发布、无 arXiv 论文；**编号**＝本站学习页序号，—＝暂未建学习页。

| 编号 | 时间 | 论文名称（全称，点击直达 arXiv） | 主线 |
|---|---|---|---|
| 01 | 2024-01-05 | [DeepSeek LLM: Scaling Open-Source Language Models with Longtermism](https://arxiv.org/abs/2401.02954) | 🅻 |
| 02 | 2024-01-11 | [DeepSeekMoE: Towards Ultimate Expert Specialization in Mixture-of-Experts Language Models](https://arxiv.org/abs/2401.06066) | 🅻 |
| 03 | 2024-01-25 | [DeepSeek-Coder: When the Large Language Model Meets Programming — The Rise of Code Intelligence](https://arxiv.org/abs/2401.14196)（模型 2023-11 已发布） | 🅲 |
| 04 | 2024-02-05 | [DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models](https://arxiv.org/abs/2402.03300) | 🅼 |
| 05 | 2024-03-08 | [DeepSeek-VL: Towards Real-World Vision-Language Understanding](https://arxiv.org/abs/2403.05525) | 🅿 |
| 06 | 2024-05-07 | [DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model](https://arxiv.org/abs/2405.04434) | 🅻 |
| 07 | 2024-05-23 | [DeepSeek-Prover: Advancing Theorem Proving in LLMs through Large-Scale Synthetic Data](https://arxiv.org/abs/2405.14333) | 🅼 |
| 08 | 2024-06-17 | [DeepSeek-Coder-V2: Breaking the Barrier of Closed-Source Models in Code Intelligence](https://arxiv.org/abs/2406.11931) | 🅲 |
| 09 | 2024-07-02 | [Let the Expert Stick to His Last: Expert-Specialized Fine-Tuning (ESFT)](https://arxiv.org/abs/2407.01906) | 🅻 |
| 10 | 2024-08-15 | [DeepSeek-Prover-V1.5: Harnessing Proof Assistant Feedback for RL and MCTS](https://arxiv.org/abs/2408.08152) | 🅼 |
| 11 | 2024-08-26 | [Fire-Flyer AI-HPC: A Cost-Effective Software-Hardware Co-Design for Deep Learning](https://arxiv.org/abs/2408.14158) | 🅢 |
| 12 | 2024-10-17 | [Janus: Decoupling Visual Encoding for Unified Multimodal Understanding and Generation](https://arxiv.org/abs/2410.13848) | 🅿 |
| 13 | 2024-11-12 | [JanusFlow: Harmonizing Autoregression and Rectified Flow for Unified Multimodal Understanding and Generation](https://arxiv.org/abs/2411.07975) | 🅿 |
| 14 | 2024-12-13 | [DeepSeek-VL2: Mixture-of-Experts Vision-Language Models for Advanced Multimodal Understanding](https://arxiv.org/abs/2412.10302) | 🅿 |
| 15 | 2024-12-27 | [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437) | 🅻 |
| 16 | 2025-01-22 | [DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning](https://arxiv.org/abs/2501.12948) | 🅼 |
| 17 | 2025-01-27 | [Janus-Pro: Unified Multimodal Understanding and Generation with Data and Model Scaling](https://arxiv.org/abs/2501.17811) | 🅿 |
| — | *2025-02-底* | *开源周：FlashMLA / DeepEP / DeepGEMM / 3FS / ProfileGym（仅 GitHub, 无论文）* | 🛠 |
| 18 | 2025-02-16 | [Native Sparse Attention: Hardware-Aligned and Natively Trainable Sparse Attention (NSA)](https://arxiv.org/abs/2502.11089) | 🅻 |
| 19 | 2025-04-03 | [Inference-Time Scaling for Generalist Reward Modeling](https://arxiv.org/abs/2504.02495) | 🅼 |
| 20 | 2025-04-30 | [DeepSeek-Prover-V2: Advancing Formal Mathematical Reasoning via RL for Subgoal Decomposition](https://arxiv.org/abs/2504.21801) | 🅼 |
| 21 | 2025-05-09 | [Insights into DeepSeek-V3: Scaling Challenges and Reflections on Hardware for AI Architectures](https://arxiv.org/abs/2505.09343) | 🅻 |
| — | *2025-05-28* | *DeepSeek-R1-0528（仅 HF 更新说明, 无论文）* | 🅼 |
| — | *2025-08* | *DeepSeek-V3.1 / V3.1-Base（仅 HF 模型卡, 无论文）* | 🅻 |
| — | *2025-09-29* | *DeepSeek-V3.2-Exp（仅官方发布说明, 无论文）* | 🅻 |
| 22 | 2025-10-21 | [DeepSeek-OCR: Contexts Optical Compression](https://arxiv.org/abs/2510.18234) | 🅿 |
| 23 | 2025-11-27 | [DeepSeekMath-V2: Towards Self-Verifiable Mathematical Reasoning](https://arxiv.org/abs/2511.22570) | 🅼 |
| 24 | 2025-12-02 | [DeepSeek-V3.2: Pushing the Frontier of Open Large Language Models](https://arxiv.org/abs/2512.02556) | 🅻 |
| 25 | 2025-12-31 | [mHC: Manifold-Constrained Hyper-Connections](https://arxiv.org/abs/2512.24880) | 🅻 |
| 26 | 2026-01-12 | [Conditional Memory via Scalable Lookup: A New Axis of Sparsity for LLMs (Engram)](https://arxiv.org/abs/2601.07372) | 🅻 |
| 27 | 2026-01-28 | [DeepSeek-OCR 2: Visual Causal Flow](https://arxiv.org/abs/2601.20552) | 🅿 |
| 28 | 2026-02-25 | [DualPath: Breaking the Storage Bandwidth Bottleneck in Agentic LLM Inference](https://arxiv.org/abs/2602.21548) | 🅢 |
| 29 | 2026-04-26 | [DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence](https://arxiv.org/abs/2606.19348) | 🅻 |
| 30 | 2026-07-06 | [DSpark: Confidence-Scheduled Speculative Decoding with Semi-Autoregressive Generation](https://arxiv.org/abs/2607.05147) | 🅢 |
| 31 | 2026-08-26 | [A Programming Paradigm for Spatiotemporal Composability](https://arxiv.org/abs/2608.25512) | 🅢 |
| 32 | 2026-09-17 | [DeepSeek-V4.1-Flash: Pushing the Limits of KV Cache Compression](https://arxiv.org/abs/2609.19969) | 🅻 |

---

# A. arXiv 正式论文

## 一、LLM 主线（基座 / 架构 / 效率）

| 论文 | 时间 | 论文地址 | 解读（图文 · 视频 · Reddit） |
|---|---|---|---|
| DeepSeek LLM | 2024-01 | [arXiv:2401.02954](https://arxiv.org/abs/2401.02954) | 图文：[月影·产品经理带你读论文1](https://www.zhihu.com/question/659184541/answer/114573612841) · 见「全系列综述」 |
| DeepSeekMoE | 2024-01 | [arXiv:2401.06066](https://arxiv.org/abs/2401.06066) | [Turing Post: MoE/MLA 解析](https://www.turingpost.com/p/deepseek) · 见「全系列综述」 |
| DeepSeek-V2（首提 MLA） | 2024-05 | [arXiv:2405.04434](https://arxiv.org/abs/2405.04434) | 图文：[MLA 含代码](https://zhuanlan.zhihu.com/p/696380978) · [V2 技术详解](https://zhuanlan.zhihu.com/p/697524307) · [速读 V2-理解 MLA](https://zhuanlan.zhihu.com/p/696671064) · [MLA 总结与思考](https://zhuanlan.zhihu.com/p/697781431) · 视频：见 V3 YouTube 走查（含 MLA 章节） |
| ESFT: Expert-Specialized Fine-Tuning | 2024-07 | [arXiv:2407.01906](https://arxiv.org/abs/2407.01906) | 见「全系列综述」 |
| **DeepSeek-V3**（MoE+MTP+无辅助损失均衡） | 2024-12 | [arXiv:2412.19437](https://arxiv.org/abs/2412.19437) | 图文：[论文解读](https://zhuanlan.zhihu.com/p/14988009150) · [4万字超详细](https://zhuanlan.zhihu.com/p/22985118565) · [架构深度解析](https://zhuanlan.zhihu.com/p/1983605109255599552) · [PyImageSearch: V3 from Scratch MoE](https://pyimagesearch.com/2026-03-23/deepseek-v3-from-scratch-mixture-of-experts-moe/) · 视频：[YouTube 完整走查(含时间戳)](https://www.youtube.com/watch?v=8v2l6SJECW4) · [YouTube MoE 讲解](https://www.youtube.com/watch?v=pl38wKk-dHo) · [B站: V3&R1 系列解读](https://www.bilibili.com/video/BV18iNBehEwq/) · Reddit：[r/LocalLLaMA "V3 is the shit"](https://www.reddit.com/r/LocalLLaMA/comments/1huq6z0/deepseek_v3_is_the_shit/) |
| Native Sparse Attention (NSA, ACL'25 最佳论文) | 2025-02 | [arXiv:2502.11089](https://arxiv.org/abs/2502.11089) | 图文：[NSA 深度解析](https://zhuanlan.zhihu.com/p/25626791635) · [NSA 阅读笔记](https://zhuanlan.zhihu.com/p/24632322448) · [获 ACL 最佳论文讨论](https://www.zhihu.com/question/12616022631) · 视频：[B站 卢菁博士: 稀疏注意力+DSA](https://www.bilibili.com/video/BV1PGnmzVEwa/) |
| Insights into DeepSeek-V3（硬件扩展反思, ISCA'25） | 2025-05 | [arXiv:2505.09343](https://arxiv.org/abs/2505.09343) | [fengweifeng 中文解读](https://fengweifeng.com/deepseek-papers/) · [Aleph Alpha: 推理理论模型](https://aleph-alpha.com/wp-content/uploads/DeepSeek-Inference-Theoretical-Model_Deriving-the-performance-from-hardware-primitives_02092025.pdf) |
| DeepSeek-V3.2（引入 DSA） | 2025-12 | [arXiv:2512.02556](https://arxiv.org/abs/2512.02556) | 图文：[正式版技术解读](https://zhuanlan.zhihu.com/p/1979991066141815036) · [2025 LLM技术报告(11)](https://zhuanlan.zhihu.com/p/1979678585833952663) · 视频：[B站 V3.2 原论文解读](https://www.bilibili.com/video/BV1b8nzzZE7L/) · Reddit：[r/ML 3.2 稀疏注意力机制](https://www.reddit.com/r/MachineLearning/comments/1o2pzxk/r_deepseek_32s_sparse_attention_mechanism/) |
| mHC: Manifold-Constrained Hyper-Connections | 2025-12-31 | [arXiv:2512.24880](https://arxiv.org/abs/2512.24880) | [知乎解读](https://zhuanlan.zhihu.com/p/1990581481937077277) · [新浪报道](https://finance.sina.com.cn/stock/t/2026-01-04/doc-inhfchyr0382333.shtml) · [C2 顶刊分享](https://www.c2.org.cn/h-nd-2647.html) · Reddit：[r/LocalLLaMA mHC](https://www.reddit.com/r/LocalLLaMA/comments/1q0zk1u/deepseek_new_paper_mhc_manifoldconstrained/) |
| Engram: Conditional Memory via Scalable Lookup | 2026-01 | [arXiv:2601.07372](https://arxiv.org/abs/2601.07372) | [Introl 博客解读](https://introl.com/zh/blog/deepseek-engram-conditional-memory-architecture-january-2026) · [GitHub: deepseek-ai/Engram](https://github.com/deepseek-ai/Engram) |
| DeepSeek-V4（百万上下文, V4-Pro/Flash） | 2026-04 | [arXiv:2606.19348](https://arxiv.org/abs/2606.19348) | [V4 技术报告解读](https://zhuanlan.zhihu.com/p/2031507181812585811) · [全栈重构解读](https://zhuanlan.zhihu.com/p/2030982954617414764) · [快速解读](https://zhuanlan.zhihu.com/p/2030970565092177542) |
| **DeepSeek-V4.1-Flash**（KV Cache 压缩极限, 多模态 MoE, 552B backbone） | 2026-09 | [arXiv:2609.19969](https://arxiv.org/abs/2609.19969) · [HF](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash) | 解读待补 |

## 二、代码（Code）

| 论文 | 时间 | 论文地址 | 解读 |
|---|---|---|---|
| DeepSeek-Coder | 2024-01 | [arXiv:2401.14196](https://arxiv.org/abs/2401.14196) | [知乎评价/解读](https://www.zhihu.com/question/628883095/answer/3380290320) |
| DeepSeek-Coder-V2 | 2024-06 | [arXiv:2406.11931](https://arxiv.org/abs/2406.11931) | [中文解读](https://zhuanlan.zhihu.com/p/21266825023) · [发布讨论](https://www.zhihu.com/question/659238493/answer/3535361372) · [Turing Post](https://www.turingpost.com/p/deepseek) |

## 三、数学与定理证明（Math / Reasoning）

| 论文 | 时间 | 论文地址 | 解读 |
|---|---|---|---|
| DeepSeekMath（首提 GRPO） | 2024-02 | [arXiv:2402.03300](https://arxiv.org/abs/2402.03300) | [HF 配套技术笔记（无 arXiv 版）](https://huggingface.co/deepseek-ai/simple-open-source-gsm8k-solution) · 视频(GRPO)：[B站 GRPO 原理](https://www.bilibili.com/video/BV1enQLYKEA5/) · [B站 GRPO 零基础](https://www.bilibili.com/video/BV1M9NyeVEUp/) · [B站 GRPO 训练方法详解](https://www.bilibili.com/video/BV1iZs1zqEgf/) |
| DeepSeek-Prover-V1 | 2024-05 | [arXiv:2405.14333](https://arxiv.org/abs/2405.14333) | 见「全系列综述」 |
| DeepSeek-Prover-V1.5（MCTS + RL） | 2024-08 | [arXiv:2408.08152](https://arxiv.org/abs/2408.08152) | [MarkTechPost 英文报道](https://www.marktechpost.com/2024-08-17/deepseek-ai-open-sources-deepseek-prover-v1-5-a-language-model-with-7-billion-parameters-that-outperforms-all-open-source-models-in-formal-theorem-proving-in-lean-4/) |
| **DeepSeek-R1**（纯 RL 激发推理, 里程碑） | 2025-01 | [arXiv:2501.12948](https://arxiv.org/abs/2501.12948) | 图文：[技术笔记含图解](https://zhuanlan.zhihu.com/p/22112201320) · [技术报告解读](https://zhuanlan.zhihu.com/p/19868935152) · [三部曲详细解读](https://zhuanlan.zhihu.com/p/24339006797) · [Medium: Inference-Time Scaling review](https://medium.com/@saehwanpark/deepseek-r1-a-new-chapter-in-inference-time-scaling-for-reasoning-models-reviewing-deepseek-bae149ca88bc) · 视频：[李宏毅课(YouTube)](https://www.youtube.com/watch?v=bJFtcwLSNxI) · [R1论文逐段精读(YouTube)](https://www.youtube.com/watch?v=ZoC7OiBR09U) · [比肩o1深度解读(YouTube)](https://www.youtube.com/watch?v=tRuN8xYdETs) · [B站 R1 深度解读](https://www.bilibili.com/video/BV1dHw4e8E3e/) · [B站 中英双语 GRPO+RL+SFT](https://www.bilibili.com/video/BV158FzedEpp/) · Reddit：[r/ML 无废话阅读单](https://www.reddit.com/r/MachineLearning/comments/1ideupn/no_hype_deepseekr1_reading_list/) · 复现：[HF Open-R1 博客](https://huggingface.co/blog/open-r1) |
| Inference-Time Scaling for Generalist Reward Modeling | 2025-04 | [arXiv:2504.02495](https://arxiv.org/abs/2504.02495) | 通用奖励模型（Verifier/RM）推理时扩展 |
| DeepSeek-Prover-V2（Lean 4 SOTA） | 2025-04 | [arXiv:2504.21801](https://arxiv.org/abs/2504.21801) | 见「全系列综述」 |
| DeepSeekMath-V2（自验证数学推理） | 2025-11 | [arXiv:2511.22570](https://arxiv.org/abs/2511.22570) · [GitHub](https://github.com/deepseek-ai/DeepSeek-Math-V2) | [fengweifeng 中文解读](https://fengweifeng.com/deepseek-papers/) |

## 四、多模态（Vision-Language / OCR / 生成）

| 论文 | 时间 | 论文地址 | 解读 |
|---|---|---|---|
| DeepSeek-VL | 2024-03 | [arXiv:2403.05525](https://arxiv.org/abs/2403.05525) | 见「全系列综述」 |
| Janus（解耦视觉编码, 统一理解+生成） | 2024-10 | [arXiv:2410.13848](https://arxiv.org/abs/2410.13848) | [From Janus to Janus-Pro](https://zhuanlan.zhihu.com/p/20582287990) |
| JanusFlow（Rectified Flow 统一理解+生成, CVPR 2025） | 2024-11 | [arXiv:2411.07975](https://arxiv.org/abs/2411.07975) | [GitHub: deepseek-ai/Janus](https://github.com/deepseek-ai/Janus) · [HF: JanusFlow-1.3B](https://huggingface.co/deepseek-ai/JanusFlow-1.3B) |
| DeepSeek-VL2（MoE 视觉语言） | 2024-12 | [arXiv:2412.10302](https://arxiv.org/abs/2412.10302) | 见「全系列综述」 |
| Janus-Pro | 2025-01 | [arXiv:2501.17811](https://arxiv.org/abs/2501.17811) | [Janus→Janus-Pro 解读](https://zhuanlan.zhihu.com/p/20582287990) · [技术报告解析(知乎)](https://zhuanlan.zhihu.com/p/20580737510) · [GitHub: deepseek-ai/Janus](https://github.com/deepseek-ai/Janus) · 视频：[B站 Janus-Pro 深度解读](https://www.bilibili.com/video/BV1qEfQYZEAj/) · [B站 本地部署+微调实战](https://www.bilibili.com/video/BV1r5AUeBEtk/) |
| DeepSeek-OCR（上下文光学压缩） | 2025-10 | [arXiv:2510.18234](https://arxiv.org/abs/2510.18234) | [OCR/OCR-2 解读](https://zhuanlan.zhihu.com/p/1999550137660366972) · [GitHub: deepseek-ai/DeepSeek-OCR](https://github.com/deepseek-ai/DeepSeek-OCR) · 视频：[B站 保姆级部署与调用](https://www.bilibili.com/video/BV1b8nzzZE7L/) |
| DeepSeek-OCR 2（Visual Causal Flow, 2026） | 2026-01 | [arXiv:2601.20552](https://arxiv.org/abs/2601.20552) | [新 OCR 架构解读](https://zhuanlan.zhihu.com/p/1999550137660366972) · [GitHub: deepseek-ai/DeepSeek-OCR-2](https://github.com/deepseek-ai/DeepSeek-OCR-2) |

## 五、推理系统 · AI 基础设施 · 编程范式（Systems / Infra / Paradigm）

| 论文 | 时间 | 论文地址 | 说明 |
|---|---|---|---|
| Fire-Flyer AI-HPC: A Cost-Effective Software-Hardware Co-Design for Deep Learning | 2024-08 | [arXiv:2408.14158](https://arxiv.org/abs/2408.14158) | SC'24 接收；DeepSeek 万卡集群软硬件协同设计，52 位作者含梁文锋；`open-infra-index` 官方列为「2024 AI Infrastructure Paper」 |
| DualPath: Breaking the Storage Bandwidth Bottleneck in Agentic LLM Inference | 2026-02 | [arXiv:2602.21548](https://arxiv.org/abs/2602.21548) | 智能体推理存储带宽瓶颈的系统优化 |
| DSpark: Confidence-Scheduled Speculative Decoding with Semi-Autoregressive Generation | 2026-07 | [arXiv:2607.05147](https://arxiv.org/abs/2607.05147) | 置信度调度的投机解码 + 半自回归生成 |
| A Programming Paradigm for Spatiotemporal Composability | 2026-08 | [arXiv:2608.25512](https://arxiv.org/abs/2608.25512) | 时空可组合性编程范式（机构署名 DeepSeek-AI） |

---

# B. 未上 arXiv 的技术产出（GitHub / HuggingFace 独占）

> 这部分没有论文，但都是 DeepSeek 官方发布、对理解其模型很关键的一手资料。

## B1. 「开源周」（Open Source Week, 2025-02 底, 连续 5 天）——纯 GitHub 库

| 项目 | 作用 | 地址 | 解读 |
|---|---|---|---|
| **FlashMLA** | Hopper GPU 上高效的 MLA 解码内核 | [github/deepseek-ai/FlashMLA](https://github.com/deepseek-ai/FlashMLA) | [开源周技术总览](https://gkm0120.cn/p/45524.html) · [B站/YouTube 开源周全盘点](https://www.youtube.com/watch?v=deZjgTAkzoc) |
| **DeepEP** | MoE 训练/推理的高性能 EP 通信库 | [github/deepseek-ai/DeepEP](https://github.com/deepseek-ai/DeepEP) | [5万字开源周报告](https://zhuanlan.zhihu.com/p/27127875284) |
| **DeepGEMM** | FP8 GEMM 库（V3/R1 关键算子, 核心仅 300 行） | [github/deepseek-ai/DeepGEMM](https://github.com/deepseek-ai/DeepGEMM) | [知乎 DeepGEMM 详解](https://zhuanlan.zhihu.com/p/26425592139) · [量子位报道](https://www.qbitai.com/2025-02-258439.html) |
| **3FS** | 面向 AI 训练的高性能分布式文件系统 | [github/deepseek-ai/3FS](https://github.com/deepseek-ai/3FS) | [5万字开源周报告](https://zhuanlan.zhihu.com/p/27127875284) |
| **ProfileGym** | GPU 算子性能预测器（LLM 生成 kernel） | [github/deepseek-ai/ProfileGym](https://github.com/deepseek-ai/ProfileGym) | [5万字开源周报告](https://zhuanlan.zhihu.com/p/27127875284) |

## B2. HuggingFace 技术笔记 / 模型卡（DeepSeek 亲自撰写, 无对应 arXiv 论文）

| 内容 | 时间 | 地址 | 说明 |
|---|---|---|---|
| Simple GSM8K Open Solution（GRPO 雏形笔记） | 2024-02 | [HF: simple-open-source-gsm8k-solution](https://huggingface.co/deepseek-ai/simple-open-source-gsm8k-solution) | DeepSeekMath/GRPO 思想的工程化说明 |
| DeepSeek-V3.1 / V3.1-Base（混合推理 thinking/non-thinking） | 2025-08 | [HF: DeepSeek-V3.1-Base](https://huggingface.co/deepseek-ai/DeepSeek-V3.1-Base) · [Reddit 讨论](https://www.reddit.com/r/LocalLLaMA/comments/1mukwq6/deepseekv31base/) | 仅模型卡，未发论文 |
| DeepSeek-V3.2-Exp（首个落地 DSA 的实验版） | 2025-09 | [官方发布说明](https://api-docs.deepseek.com/news/news250929) | 发布说明 + 技术附录，正式报告在 V3.2 |
| DeepSeek-R1-0528（无蒸馏、去语言混合的更新版） | 2025-05 | [HF: DeepSeek-R1-0528](https://huggingface.co/deepseek-ai/DeepSeek-R1-0528) · [B站/YouTube 测评](https://www.youtube.com/watch?v=rrJig5xrHoE) | 更新说明随 R1 仓库发布 |
| DeepSeek 官方 Notes 主页（技术笔记合集） | 持续更新 | [huggingface.co/deepseek-ai](https://huggingface.co/deepseek-ai) | 部分推理/训练心得只发在此 |

## B3. DeepSeek 官网 News 公告（`www.deepseek.com/news/`, 一手来源）

> 官网新闻页是 DeepSeek 亲自撰写的一手发布说明：多数没有对应的 arXiv 论文，但含技术要点、基准与更新日志。下面分「模型 / 研究」与「产品 / API」两类。

**🧠 模型 / 研究类发布**

| 日期 | 公告 | 链接 | 关联论文 |
|---|---|---|---|
| 2026-09-10 | DeepSeek V4.1 Flash：更强、更快、更普惠 | [news](https://www.deepseek.com/news/deepseek-v4-1-flash/) | V4.1-Flash `2609.19969` |
| 2026-04-24 | DeepSeek-V4 预览版：迈入百万上下文普惠时代 | [news](https://www.deepseek.com/news/v4-preview/) | V4 `2606.19348` |
| 2025-12-01 | DeepSeek V3.2 正式版：强化 Agent 能力，融入思考推理 | [news](https://www.deepseek.com/news/deepseek-v3-2/) | V3.2 `2512.02556` |
| 2025-09-29 | DeepSeek-V3.2-Exp 发布，训练推理提效，API 同步降价 | [news](https://www.deepseek.com/news/v3-2-exp/) | 首个落地 DSA 的实验版 |
| 2025-09-22 | DeepSeek-V3.1 版本更新（Terminus） | [news](https://www.deepseek.com/news/v3-1-terminus/) | 仅公告，无论文 |
| 2025-08-21 | DeepSeek-V3.1 发布 | [news](https://www.deepseek.com/news/deepseek-v3-1/) | 混合推理，仅模型卡 |
| 2025-05-28 | DeepSeek-R1 更新，思考更深，推理更强（R1-0528） | [news](https://www.deepseek.com/news/r1-0528/) | 更新说明，无独立论文 |
| 2025-03-25 | DeepSeek-V3 模型更新，各项能力全面进阶（V3-0324） | [news](https://www.deepseek.com/news/v3-0324/) | V3 报告勘误版 |
| 2025-01-20 | DeepSeek-R1 发布，性能对标 OpenAI o1 正式版 | [news](https://www.deepseek.com/news/deepseek-r1/) | R1 `2501.12948` |
| 2024-12-26 | DeepSeek-V3 正式发布 | [news](https://www.deepseek.com/news/deepseek-v3/) | V3 `2412.19437` |
| 2024-12-10 | DeepSeek V2 系列收官，联网搜索上线官网（V2.5-1210） | [news](https://www.deepseek.com/news/v2-5-final/) | V2.5 收官，无独立论文 |
| 2024-11-20 | DeepSeek 推理模型预览版上线，解密 o1 推理过程（R1-Lite） | [news](https://www.deepseek.com/news/r1-lite-preview/) | R1 前身预览，无论文 |
| 2024-09-05 | DeepSeek-V2.5：融合通用与代码能力的全新开源模型 | [news](https://www.deepseek.com/news/deepseek-v2-5/) | 合并 Coder-V2，无独立论文 |

**🔧 产品 / API 类公告**

| 日期 | 公告 | 链接 |
|---|---|---|
| 2025-01-15 | DeepSeek APP 正式上线 | [news](https://www.deepseek.com/news/deepseek-app/) |
| 2024-08-02 | DeepSeek API 创新采用硬盘缓存，价格再降一个数量级 | [news](https://www.deepseek.com/news/context-caching/) |
| 2024-07-25 | DeepSeek API 升级，支持续写、FIM、Function Calling、JSON Output | [news](https://www.deepseek.com/news/api-upgrade/) |

---

# C. 一次读懂全系列（综述型解读，推荐优先看）

- 🧭 **《DeepSeek 技术路线图：2024-01 到 2026 的两年半完整演进史（30+ 论文导读）》** — <https://yudonglee.me/deepseek-roadmap/> （全系列按主线串联，最适合作总目录）
- 📚 **《10 篇论文读懂 DeepSeek 技术演进脉络》**（知乎）— <https://zhuanlan.zhihu.com/p/2036459670894810864>
- 🎬 **《逐篇讲解 DeepSeek 关键 9 篇论文及创新点》**（B站视频）— <https://www.bilibili.com/video/BV1xuK5eREJi/>
- 📺 **《Deepseek 系列论文解读1【V3】【R1】》**（B站视频）— <https://www.bilibili.com/video/BV18iNBehEwq/>
- 🇬🇧 **Martin Fowler: The DeepSeek Series — A Technical Overview** — <https://martinfowler.com/articles/deepseek-papers.html> （英文，覆盖 LLM/V2/V3/R1）
- 🗂 **fengweifeng AI 大模型论文库（DeepSeek 合集, 含 PDF + 中文全文翻译 + 逐篇解读）** — <https://fengweifeng.com/deepseek-papers/>
- 🇬🇧 **Turing Post: Inside DeepSeek Models (MoE, MLA, Coder-V2)** — <https://www.turingpost.com/p/deepseek>
- 🎓 **李宏毅「生成式AI时代下的机器学习(2025)」第七讲：DeepSeek-R1 与推理模型** — <https://www.youtube.com/watch?v=bJFtcwLSNxI>

---

# D. 视频解读汇总（B站 / YouTube）

> 覆盖多篇论文的系列视频与优质单篇，集中放这里方便按视频学。

**🔁 全系列 / 多篇串讲**
- 🎬 **《逐篇讲解 DeepSeek 关键 9 篇论文及创新点》**（B站）— <https://www.bilibili.com/video/BV1xuK5eREJi/>
- 📺 **《Deepseek 系列论文解读 1【V3】【R1】》**（B站）— <https://www.bilibili.com/video/BV18iNBehEwq/>
- 🧩 **《DeepSeek 开源周六天内容全盘点》（FlashMLA/DeepEP/DeepGEMM…）**（YouTube）— <https://www.youtube.com/watch?v=deZjgTAkzoc>
- 🗂 **视频/资料聚合仓库（大量中英解读链接清单）** — <https://github.com/Event-AHU/DeepSeek_ResearchResources>

**🧠 DeepSeek-V3**
- 🇬🇧 **DeepSeek-V3 完整走查（含 MLA/MoE/MTP/FP8 时间戳）**（YouTube）— <https://www.youtube.com/watch?v=8v2l6SJECW4>
- 🇬🇧 **DeepSeek Explained｜Mixture of Experts**（YouTube）— <https://www.youtube.com/watch?v=pl38wKk-dHo>

**🧠 DeepSeek-R1 / GRPO**
- 🇨🇳 **李宏毅课：推理模型为何与众不同**（YouTube）— <https://www.youtube.com/watch?v=bJFtcwLSNxI>
- 🎬 **R1 论文逐段精读 + 训练流程全解**（YouTube）— <https://www.youtube.com/watch?v=ZoC7OiBR09U>
- 🎬 **比肩 OpenAI-o1：论文深度解读 + 独家分析**（YouTube）— <https://www.youtube.com/watch?v=tRuN8xYdETs>
- 📺 **R1 深度解读：大模型 + 强化学习**（B站）— <https://www.bilibili.com/video/BV1dHw4e8E3e/>
- 📺 **中英双语：R1 理论概述 GRPO + RL + SFT**（B站）— <https://www.bilibili.com/video/BV158FzedEpp/>
- 📺 **GRPO 原理 / 零基础 / 训练方法详解**（B站）— <https://www.bilibili.com/video/BV1enQLYKEA5/> · <https://www.bilibili.com/video/BV1M9NyeVEUp/> · <https://www.bilibili.com/video/BV1iZs1zqEgf/>

**👁 多模态 Janus / OCR / V3.2**
- 📺 **Janus-Pro 深度解读**（B站）— <https://www.bilibili.com/video/BV1qEfQYZEAj/>
- 📺 **Janus 微调实战（本地部署）**（B站）— <https://www.bilibili.com/video/BV1r5AUeBEtk/>
- 📺 **DeepSeek-V3.2 重磅发布：原论文解读**（B站）— <https://www.bilibili.com/video/BV1b8nzzZE7L/>
- 📺 **DeepSeek-OCR 保姆级部署与调用**（B站）— <https://www.bilibili.com/video/BV1b8nzzZE7L/>
- 🎬 **卢菁博士：稀疏注意力 + DSA（NSA/MLA）**（B站）— <https://www.bilibili.com/video/BV1PGnmzVEwa/>
