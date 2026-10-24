---
pageClass: wide papers
title: 论文总览 · 官方发布
---

**本栏目**： [📋 论文总览](/papers/index.md)  ·  **🚀 官方发布**  ·  [🔗 解读资源](/papers/resources.md)

# 未上 arXiv 的技术产出（GitHub / HuggingFace 独占）

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