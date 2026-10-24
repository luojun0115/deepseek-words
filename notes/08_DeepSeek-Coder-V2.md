---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 08 · DeepSeek-Coder-V2 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [DeepSeek-Coder-V2 教程：示例、安装、基准测试（DataCamp）](https://www.datacamp.com/zh/tutorial/deepseek-coder-v2) — 中文教程：安装使用 + 逐项基准解读
- [DeepSeek-Coder-V2 中文摘要（LinkedIn Pulse 中文版）](https://cn.linkedin.com/pulse/deepseek-coder-v2-breaking-barrier-closed-source-models-vlad-bogolin-bywte?tl=zh) — 要点与跑分的中文摘要
- [如何看待 DeepSeek 新发布的代码模型 DeepSeek-Coder-V2？（知乎讨论）](https://www.zhihu.com/question/659184541/answer/3582435057) — 知乎高赞讨论，含 KV Cache 与架构分析
- [知乎：DeepSeek-Coder-V2 发布讨论](https://www.zhihu.com/question/659238493/answer/3535361372) — 社区评价与使用场景问答
- [DeepSeek-V2 vs Coder-V2: A Comparative Analysis（PromptLayer）](https://blog.promptlayer.com/deepseek-v2-vs-coder-v2-a-comparative-analysis/) — 英文对比：通用版与代码版定位差异

### 视频（B站 / YouTube）
- [YouTube] [DeepSeek Coder v2: First Open Coding Model that Beats GPT-4 Turbo](https://www.youtube.com/watch?v=_elpZaJERD4) — 英文解读视频

### 英文 & 社区
- [arXiv 原文页](https://arxiv.org/abs/2406.11931) — 论文官方页
- [GitHub 官方仓库 deepseek-ai/DeepSeek-Coder-V2](https://github.com/deepseek-ai/DeepSeek-Coder-V2) — 模型规格与评测表
- [Reddit r/LocalLLaMA 讨论帖](https://www.reddit.com/r/LocalLLaMA/comments/1dhx449/deepseekcoderv2_breaking_the_barrier_of/) — 开源社区本地部署视角讨论
- [Artificial Analysis: Coder-V2 Lite 评测](https://artificialanalysis.ai/models/deepseek-coder-v2-lite) — 第三方独立基准评测
- [Turing Post: Inside DeepSeek Models](https://www.turingpost.com/p/deepseek) — 专讲 Coder-V2 如何把训练数据扩到 10.2T tokens（全系列综述，含本篇）

---

# DeepSeek-Coder-V2 续训升级完整流程（含所有疑问点）

## 角色与核心思想

先把全篇最重要的一句话立住（原文摘要原话）：**「DeepSeek-Coder-V2 is further pre-trained from an intermediate checkpoint of DeepSeek-V2 with additional 6 trillion tokens」**——它不是一个从零造出来的新模型，而是拿 DeepSeek-V2 中的一个**中间检查点**，换上偏代码+数学的新饲料，继续练 6T token 得到的。

整套推演里在动的东西：

- **检查点**：那个练了 4.2T token 的中间状态，携带 V2 的全部语言与结构知识。4.2T+6T = **总计 10.2T token**（原文 §3.3）。
- **新语料**：1170B 代码相关 + 221B 数学相关 + 从 V2 训练集里抽的的自然语言，按 **60% 代码 / 10% 数学 / 30% 自然语言** 配比（原文 §1、§2）。
- **产出**：两个型号——16B（激活 2.4B）与 236B（激活 21B），基于 DeepSeekMoE 框架（原文贡献节）；支持语言 **86 → 338**，上下文 **16K → 128K**。
- **定位跃迁**：论文自称 **「第一个开源千亿参数代码模型」**（"the first open-source hundred-billion-parameter code model"，贡献节），并且在编码与数学上对标 GPT4-Turbo、Claude 3 Opus、Gemini 1.5 Pro。

架构细节先交个底，免得后面追问：论文 §3.2 只有简短两句——架构与 DeepSeekV2 一致，16B/236B 的超参分别对应 DeepSeek-V2-Lite 与 DeepSeek-V2 的设置。**专家个数、路由细节本篇论文没写**，在 DeepSeek-V2 与 DeepSeekMoE 论文里（见文末参考）。

## 阶段一：升级流程总览

```
DeepSeek-V2 中间检查点（已练 4.2T token）
   │
   │  换饲料：6T token = 60% 代码 + 10% 数学 + 30% 自然语言
   │  目标：16B → NTP + FIM(0.5)   236B → 只 NTP
   ▼
继续预训练  ──────────────▶ DeepSeek-Coder-V2 / -Lite 的 Base
   │
   │  长上下文扩展：YARN（s=40, α=1, β=32）
   │  两阶段：32K×(batch 1152)×1000步 → 128K×(batch 288)×1000步
   ▼
Base（支持 128K）
   │
   │  SFT：代码+数学+通用指令混合，共 300M token
   ▼
Instruct（16B 版微调时也用了 FIM，为对齐后保留补全能力）
   │
   │  RL：GRPO 算法 + 奖励模型（在编译器反馈数据上训练）
   │  prompts 约 4 万条
   ▼
DeepSeek-Coder-V2 Instruct / Lite-Instruct
```

**疑问点①：为什么不干脆从零训一个代码大模型，要拿 V2 的检查点续？**

论文没有明说成本账，但给出了明确的功能性理由：*「To maintain robust natural language understanding capabilities in DeepSeek-Coder-V2, we continue the pre-training process from an intermediate checkpoint」*（§3.3）——保持自然语言理解能力。从零训一个纯代码模型，语言能力要重新搭；从 V2 检查点出发，数学推理能力本身就是继承来的（这不是顺带的好处，是论文 §4.5 的实验卖点之一：MATH 75.7%）。可以合乎逻辑地补一句常识推断：4.2T token 的训练成本可以完全复用，不必重烧。

**疑问点②：一个「代码模型」，为什么新语料里还要掺 30% 的自然语言？**

这正是「给 V2 发代码升级包」的代价与对策：变强（coding+math）同时**不退步**（general language）。掺 30% 自然语言就是为了稳住通用能力。证据是论文自己引用的对照：Lite-Instruct 在知识密集型的 TriviaQA 上输给 V2-Lite-Chat（59.5 vs 65.2），论文归因于 *「relatively smaller amount of web data used during pre-training」*（§4.6）——也就是说，即使掺了三成自然语言，web 数据的绝对量仍比通用模型少，知识类基准仍会掉。掺是止损，不掺掉得更多。

## 阶段二：新代码语料怎么挖出来（fastText 三轮迭代推演）

这是全文写作最扎实、也最能被 ignore 的部分，值得单独推演。论文 §2，沿用 DeepSeekMath 的管道。

```
第 0 步  GitHub：取 2023-11 之前创建的公开仓库
         用 DeepSeek-Coder 的老规则过滤 + 近重复去重
         ──▶ 821B 源码（338 种语言）+ 185B 代码相关文本（markdown、issues 等）

第 1 步  种子语料：StackOverflow、PyTorch 文档、math.stackexchange
         训练一个 fastText 分类器
         ⚠ 分词不用空格，改用 DeepSeek-V2 的 BPE
           —— 因为中文等语言无法靠空格切开

第 2 步  循环（网页部分共 3 轮）：
           用分类器在 Common Crawl 上召回代码/数学页面
           统计各域名第一轮收集比例 → 命中超过 10% 的域名
           整域标记为「代码相关」或「数学相关」
           标出这些域名内的相关 URL → 尚未抓到的页面补进种子语料
         ──▶ 3 轮后：70B 代码网页 token + 221B 数学 token

第 3 步  同一套管道套在 GitHub 上（2 轮）
         种子 = 手工挑的高质量源码（如带详细描述的）
         ──▶ 94B 源码

汇总     821 + 185 + 70 + 94 = 1170B 代码相关 token
         （论文：sourced from GitHub and CommonCrawl）
```

**疑问点③：那些过滤规则（行长 100 字符、字母占比 25%）看起来很武断，它们在防什么？**

论文只陈述规则、没解释动机，动机是合理推断：平均行长超 100 或最长行超 1000，多半是压缩过的机器生成文件（minified JS、数据表）；字母字符不到 25%，说明内容不是「给人读的代码」而是数值；文件开头 100 字符里有 `<?xml version=` 的（XSLT 除外）多半是往机器喂的模板文件（XSLT 本身就是 XML 生态，所以豁免）；HTML 只保留可见文本占比 ≥20% 且 ≥100 字符的（防整个网页都是脚本标签）；JSON/YAML 只留 50–5000 字符的（这类文件通常是配置和数据，超大文件连着几千行转储没有学习价值）。每条规则对应一类我们手头一看就懂「这不该进语料」的文件，只是写成了可执行判定。

**疑问点④：域名级判定那个「10% 阈值」是干嘛的？**

加速第二轮以后的开采。第一轮逐页判断之后，统计每个域名里被收进来的网页占比；超过 10% 的域名（比如某个技术文档站、某个论坛挂了）整体晋升为「代码相关域名」。然后给这些域名下所有相关 URL 做标注，把没抓到的页面塞回种子语料，下一轮 fastText 就带着它们一起学。效果是边开采边扩张狩猎场，而不是每页单独审。

**疑问点⑤：新语料真的更好吗？还是只是「显得新」？**

论文做了消融（表 1）：拿 1B 小模型对比新旧语料。

```
                    1T token           2T token
旧（DeepSeek-Coder 语料）  —                  —
新语料              HumanEval 30.5→36.0        HumanEval 37.2
                    MBPP       44.6→49.0        MBPP       54.0
```

1T 时新语料带来 +5.5% / +4.4%，继续到 2T 合计 +6.7% / +9.4%。同样的模型、同样的 token 预算，只是换了语料，差距是实打实的——所以语言扩到 338 种不是凑数，是有增量价值的。

## 阶段三：继续预训练的目标与超参

- **训练目标**：16B 用 NTP + FIM（PSM 模式，FIM 率 0.5，文档级 pre-packing）；236B 只用 NTP（表 2：FIM Enable/Disable）。
- **FIM 序列形状**（原文 §3.1）：

```
<｜fim_begin｜> f_pre <｜fim_hole｜> f_suf <｜fim_end｜> f_middle <eos_token>
```

  也就是把「前缀＋后缀」摆前面、「中段」摆后面，模型学会看前缀和后缀把洞补上。

- **优化器**：AdamW，β₁=0.9，β₂=0.95，weight decay 0.1；cosine 衰减，2000 步 warmup，最终学习率降到初值的 10%（§3.3）。
- **分词器**：与 DeepSeek-V2 完全相同，**没有扩词表**（§2 明说 "We use the same tokenizer as DeepSeekV2"）。

**疑问点⑥：236B 为什么不开 FIM？**

论文只陈述了差异（Lite Enable、236B Disable），没给理由，**原因待核实**。能站在数据上说的是：所有 FIM 补全评测（RepoBench、FIM-Tasks，表 5/6）论文**只用 Lite-Base 参与**，236B 版本权当没有补全技能——236B 是拿来打生成、修复、数学的旗舰。至于「训练大模型时混入 FIM 会稀释 NTP 或增加成本」一类的解释，是推断，论文没写。

**疑问点⑦：训练期间还翻过一次车？**

是。§3.2 记录：训练中出现不稳定、**梯度尖峰（spikes）**，作者把锅归给「指数归一化技术」，*回退到常规归一化* 才稳住。机制上说得通（推断）：指数函数会放大数值离群的个别维度，几个位置撑爆之后梯度跟着爆尖峰——所以宁可回到保守方案。这篇论文的诚实之处在于：把架构折返这种「不优雅」的细节白纸黑字写出来。

**疑问点⑧：MoE 里到底几个专家、每次激活几个？前面说 16B/2.4B，这个 2.4B 怎么来的?**

本论文**没写**。它只给了三件事：基于 DeepSeekMoE 框架（贡献节、GitHub README 均此口径）、16B/236B 总参、2.4B/21B 激活参、超参对齐 V2-Lite/V2。专家数量、路由函数、共享专家/路由专家怎么分工，按论文口径要去看 DeepSeek-V2 论文与 DeepSeekMoE 原文（链接在文末）。「每层多数专家沉睡、只为每个 token 唤醒一小撮」是你已经会背的 MoE 课，但本篇的官方数字在别处。

## 阶段四：上下文从 16K 拉到 128K

沿用 DeepSeek-V2 的做法，YARN，超参相同：scale s=40，α=1，β=32。之后**两阶段**继续训练（§3.4）：

```
阶段 A：seq len 32K  × batch 1152  × 1000 步
阶段 B：seq len 128K × batch  288  × 1000 步
（期间上采样长上下文数据的比例）
```

NIAH（大海捞针）测试通过到 128K（图 2）。128K 在论文里的意义不止是「能读长文档」：RepoBench（表 5）里 Lite-Base 是拿 2K–16K 测的，而代码修复常用的 SWE-bench 场景（表 7）动辄要读长仓库——表 7 里 Llama3-Instruct 因为只支持 8K 连 SWE-Bench 都没测。**有限上下文直接决定哪些评测能进**，上下文长度就是代码场景的入场券之一。

**疑问点⑨：batch 为什么从 1152 砍到 288？**

推断（论文未明说推理）：同样的步数，第二阶段序列长度翻了 4 倍（32K→128K），单步显存与计算量也跟着翻，维持总吞吐可以接受的前提下把 batch 缩小——「先在便宜的长度上学会承受长文，再喂昂贵的超长文」。如果直接一步到 128K，可以合理想象训练成本与稳定性都会更难看。

## 阶段五：SFT——指令数据怎么拼

论文 §3.5.1，账目清楚：

- **数据源**：DeepSeek-Coder 里拿 **2 万条代码指令**、DeepSeek-Math 里拿 **3 万条数学指令**，再从 DeepSeek-V2 的指令数据里抽通用样本凑总量。
- **规模**：指令数据集共 **300M token**；训练与总量共 **1B token**；batch 1M token；cosine 调度，100 步 warmup，初始学习率 **5e-6**。
- **16B 版的特别条款**：为了「对齐之后仍能做代码补全」，微调 16B 时也用了 FIM（论文 §1 交代）。

**疑问点⑩：SFT 只有 300M token，是不是太少了？**

301M 比 6T 预训练小四个数量级，成立。合理解释（推断）：对齐阶段不教「知识」，只教「姿态」——对话格式、指令跟随、按格式说话；这些技能不需要海量 token，之前的模型基本不会连指令都听不懂。对照上文，真正的能力增长发生在预训练阶段的 6T token（论文 §1.2 说 Pre-training Tokens 4.2T+6T）。论文没有给 SFT 量为什么是 300M 的理由，所以 300M 的具体选择待核实，但「对齐阶段轻量」这个定位是整套 DeepSeek 训练方法论一致的逻辑。

## 阶段六：RL——GRPO 与「编译器信号不够好」这件事

论 §3.5.2，一个清晰的取舍：

- **数据**：从各处收代码与数学 prompts，每条代码 prompt 带测试用例，过滤后约 **4 万条**。
- **奖励信号**：编译器可以给 0/1 反馈（测试用例全过 =1），看起来已经够客观了，**但作者偏要练一个奖励模型再拿 RM 的信号去训 RL**。理由（论文原文给足）：

> 部分代码 prompt 的测试用例数量有限、覆盖不全，直接用编译器 0/1 反馈会**噪声大且次优**（"noisy and sub-optimal"）。在 RM 见过的数据（编译器反馈）上训出的奖励模型，泛化更好。

  实测撑腰（图 3）：在自建 **Leetcode 和 Leetcode-zh** 测试集上，RM 信号明显好于原始编译器信号。此后所有实验都用 RM 信号。
- **算法**：GRPO（Group Relative Policy Optimization，DeepSeekMath 引入），与 DeepSeek-V2 同款。省点是不用额外维护一个 critic 模型，比 PPO 成本低（论文原话）。
- **数学偏好数据**：直接用 ground-truth 标签做偏好对，没有 RM 加持的必要（数学答案对错客观可判）。

**疑问点⑪：编译器 0/1 明明是客观信号，凭什么说 RM 比它还好？**

因为这 0/1 对「这道题」客观，对「模型行为的整体质量」却说不上。举例（推断层面理解即可）：一道题只有 3 个测试用例，模型代码逻辑正确但绕了远路，或只因为某一个用例没踩中就判 0 并往错误方向更新——这是「题级」噪声。RM 是在大量编译器反馈数据上拟合出来的平滑函数，能对「这答案像不像一个对的行为」给出连续分数，对没见过的题型也稳一些。所以不是 RM 「更客观」，而是 RM 「更平滑、更泛化」，编译器信号是它的训练原料。

**疑问点⑫：GRPO 为啥不要 critic 式价值函数也行？**

论文一句话带过：*「proven to be quite effective and has less cost compared with PPO, since there is no need to maintain an additional critic model」*。机制（GRPO 设计思路，非本篇新提出）：不用 V(s) 这类单点估计，而是**一组采样内互相对比**——同题给 G 个采样，在每个组里算基线，比组内的相对优势作梯度信号。没有 critic 就少一份模型要训练、显存少一大块。这是承接 DeepSeekMath 与 DeepSeek-V2 的成熟零件，本篇论文没有重新发明它。

## 关键数字与实验

（所有数字抄自原文相应表格）

| 指标 | 本文 | 出处 |
|---|---|---|
| 数据配比 | 60% 代码 / 10% 数学 / 30% 自然语言 | 原文 §2 |
| 新增预训练 token | 6T（检查点已有 4.2T，总计 10.2T） | 原文 §1、§3.3 |
| 代码语料构成 | 821B 源码 + 185B 代码相关文本 + 70B 网页 + 94B GitHub 二轮 = 1170B | 原文 §2 |
| 数学语料 | 221B（≈ 2× DeepSeekMath 的 120B） | 原文 §2 |
| 支持语言 | 86 → 338 | 摘要 |
| 上下文长度 | 16K → 128K（YARN s=40, α=1, β=32） | 原文 §3.4 |
| 人参/激活参 | 16B/2.4B（Lite） 与 236B/21B（旗舰），DeepSeekMoE | 贡献节 |
| HumanEval | 90.2% | 原文表 3 |
| MBPP+ | 76.2%（EvalPlus 口径新 SOTA） | 原文 §1.2 |
| LiveCodeBench（23.12–24.06） | 43.4%，与 GPT-4o 并列 | 原文表 4 |
| USACO | 12.1% | 原文表 4 |
| SWE-Bench | 12.7%，**首个开源破 10%** | 原文表 7、§1.2 |
| Aider（代码编辑） | 73.7%，**全场最高**，压过 GPT-4o 72.9% | 原文表 7 |
| Defects4J | 21.0% | 原文表 7 |
| CRUXEval I/O (COT) | 70.0% / 75.1%（差距归因于激活参仅 21B） | 原文表 8 |
| GSM8K | 94.9% | 原文表 9 |
| MATH | 75.7%（GPT-4o 76.6%） | 原文表 9 |
| AIME 2024 | 4/30（maj@64 为 5/30） | 原文表 9 |
| Math Odyssey | 53.7% | 原文表 9 |
| MMLU | 79.2% | 原文表 10 |
| BBH | 83.9%（超 V2 Chat 的 79.7） | 原文表 10 |
| Arena-Hard | 65.0 | 原文表 10 |
| RepoBench-Python 均值（Lite-Base, 激活 2.4B） | 38.9%（DS-Coder-33B 全激活 39.1% 就两条分之差） | 原文表 5 |
| FIM 三语均值（Lite-Base, 2.4B） | 86.4%，与 DS-Coder-33B 并列最高 | 原文表 6 |
| 多语 HumanEval 均值 | Lite 65.6% vs DS-Coder-33B 全参 61.9% | 原文表 3 |
| 许可 | 允许学术研究与无限商业使用（代码 MIT） | 贡献节 / README §7 |

## 全局数据流总表

| 阶段 | 在动什么 | 产出 | 关键参数 |
|---|---|---|---|
| 语料采集 | GitHub 老规则 + fastText 3 轮（网页）/2 轮（GitHub） | 1170B 代码 + 221B 数学 | 种子：StackOverflow/PyTorch 文档/SE；BPE 分词 |
| 混合采样 | 60/10/30 配比 | 6T token 新饲料 | 自然语言直接从 V2 训练集抽 |
| 继续预训练 | 4.2T 检查点 + 6T | Base 各一 | 16B: NTP+FIM(0.5 PSM)；236B: NTP only；AdamW β₂=0.95，cosine，2000 warmup |
| 长上下文扩展 | YARN + 两阶段训练 | 128K 上下文 | s=40，α=1，β=32；32K×1152×1000 → 128K×288×1000 |
| SFT | 指令混合微调 | Instruct 各一 | 300M token 数据 / 1B token 训练量；LR 5e-6；16B 加 FIM |
| RL | GRPO + RM | 面向人类偏好的最终版 | ~40k prompts；数学用 GT 偏好，代码用 RM |

## 所有疑问点速查

| 疑问 | 答案 |
|---|---|
| 为什么拿 V2 检查点续训，不从头训？ | 功能理由是保持自然语言理解；成本账未写明，为推断 |
| 代码模型为什么还掺 30% 自然语言？ | 防通用能力塌方；即便如此 TriviaQA 仍掉（web 数据少了） |
| 新语料有价值吗？ | 1B 消融：HumanEval +6.7%、MBPP +9.4%（2T 时） |
| 过滤规则（行长/字母占比）在防什么？ | 防机器生成文件、数据转储、非代码内容；属推断 |
| fastText 为什么换 BPE 分词？ | 中文等语言无空格分隔，BPE 提升召回准确率 |
| 域名 10% 阈值干嘛的？ | 域名级晋升为相关域，扩张种子语料、提高召回 |
| FIM 是什么玩？ | PSM：`<fim_begin>`前缀`<fim_hole>`后缀`<fim_end>`中段`<eos>`，FIM 率 0.5 |
| 236B 为什么不开 FIM？ | 论文未给理由，待核实；所有补全评测只用 Lite-Base |
| 训练翻车？ | 梯度尖峰，归因指数归一化，回退常规归一化 |
| MoE 专家数、激活数？ | 本论文没写；只有总/激活参数量与「基于 DeepSeekMoE」一句 |
| batch 长上下文阶段为什么降？ | 32K→128K 单步变贵，缩 batch 维持吞吐；推断 |
| SFT 仅 300M token 够吗？ | 对齐阶段只教「姿态」不教知识，轻量是逻辑；具体量待核实 |
| RM 比 0/1 编译器信号好？ | 部分题测试用例噪声大、覆盖不全；RM 平滑+泛化，实测围城更好 |
| GRPO 省 PPO 哪里？ | 不用维护 critic；组内相对对比做优势估计 |
| 作者自己的不足是什么？ | 对齐后指令跟随仍不及 GPT-4 Turbo，SWE-bench 表现欠佳 |

## 一句话总括

**DeepSeek-Coder-V2 的全部故事是「不换人，换饲料」：拿着 DeepSeek-V2 的 4.2T 中间检查点，用 fastText 老管道挖出的 1170B 代码 + 221B 数学 + 30% 配比的自然语言（合计 6T）继续预训练，架构分毫不动（超参就是 V2-Lite/V2 那套，MoE 底盘照旧），中途被指数归一化扎过一次梯度尖峰折回常规方案，再用 YARN 两阶段把上下文从 16K 撑到 128K，最后 SFT（300M token）+ GRPO（编译器反馈训出的 RM 当信号）对齐收尾。** 代价是通用能力微微下滑（TriviaQA −5.7），收益是 HumanEval 90.2%、Aider 73.7% 全场最高、作为首个开源千亿代码模型达到「对标 GPT-4o、紧追 GPT-4 Turbo」的档位。

## 参考与延伸阅读

- [arXiv:2406.11931 摘要页](https://arxiv.org/abs/2406.11931)
- [arXiv HTML 全文](https://arxiv.org/html/2406.11931)（本笔记全部数字、表格出处）
- [GitHub 官方仓库 deepseek-ai/DeepSeek-Coder-V2](https://github.com/deepseek-ai/DeepSeek-Coder-V2)（README 口径与论文一致）
- [DeepSeekMoE 论文 arXiv:2401.06066](https://arxiv.org/pdf/2401.06066)（MoE 专家粒度/路由细节的原点，本篇引用但未展开）
- DeepSeek-V2（arXiv:2405.01935，架构、分词、YARN 超参的出处）
- DeepSeekMath（arXiv:2402.03300，fastText 数据管道与 GRPO 的出处）
- [本篇词汇](../study/vocab/08_DeepSeek-Coder-V2_论文词汇.html) · [本篇听力](../study/listen/08_DeepSeek-Coder-V2_单词听力.html)

