---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 04 · DeepSeekMath 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [【论文解读】DeepSeekMath：用 GRPO 改进 PPO（知乎）](https://zhuanlan.zhihu.com/p/14574329458) — 经典中文解读：无 critic 模型的 GRPO 与 MATH 破 50%
- [【LLM】GRPO：改进 PPO 增强推理能力（知乎）](https://zhuanlan.zhihu.com/p/15677409107) — GRPO 为什么省显存、如何显著提推理
- [GRPO 算法原始文章解读《DeepSeekMath》（知乎）](https://zhuanlan.zhihu.com/p/25177936374) — 回到公式层面拆组内基线替代价值函数
- [【大模型】GRPO：从 PPO 到群体相对策略优化（CSDN）](https://blog.csdn.net/songxia928_928/article/details/146606701) — 「组内竞争求相对优势 + 双重约束」原理与稳定性
- [B站配套 B 站 GRPO 原理 / 零基础 / 训练方法详解系列](https://www.bilibili.com/video/BV1enQLYKEA5/) — 见视频区（同系列另有 BV1M9NyeVEUp / BV1iZs1zqEgf）
- [DeepSeekMath 综述（Medium·EleventhHourEnthusiast）](https://medium.com/@EleventhHourEnthusiast/deepseekmath-pushing-the-limits-of-mathematical-reasoning-in-open-language-models-f2665df4019e) — 英文书评式综述，评数据收集与 GRPO 双贡献
- [HF 配套技术笔记（官方，无 arXiv 版内容）](https://huggingface.co/deepseek-ai/simple-open-source-gsm8k-solution) — GRPO 思想的工程化一手说明

### 视频（B站 / YouTube）
- [B站] [【论文精读】数学推理强化学习入门：DeepSeekMath 与 GRPO 精华版解析](https://www.bilibili.com/video/BV1w2eG6FEm4/) — 中文精读视频
- [B站] [有难度但必读的一篇论文《DeepSeekMath》](https://www.bilibili.com/video/BV1qUFMeGE2q/) — 「带读 AI 经典论文 100 篇」系列
- [B站] [GRPO 详解：DeepSeekMath（搬运版）](https://www.bilibili.com/video/BV1hbwxzjEbA/) — GRPO 解释视频的 B 站搬运
- [YouTube] [不讲数学的 GRPO 算法解读 | 深入浅出 DeepSeekMath](https://www.youtube.com/watch?v=JZZgBu8MV4Q) — 中文视频，直观理解
- [YouTube] [[GRPO Explained] DeepSeekMath](https://www.youtube.com/watch?v=bAWV_yrqx4w) — 英文视频，GRPO 如何成为 R1 核心
- [YouTube] [GRPO Reinforcement Learning Explained](https://www.youtube.com/watch?v=YCawyzAOg1Y) — AI Papers Academy 出品，PPO→GRPO 全景

### 英文 & 社区
- [Hugging Face 论文页](https://huggingface.co/papers/2402.03300) — 官方收录页
- [Emergent Mind](https://www.emergentmind.com/papers/2402.03300) — 摘要智能概括与引用脉络
- [GRPO Reinforcement Learning Explained（AI Papers Academy 博客版）](https://aipapersacademy.com/deepseekmath-grpo/) — 与视频配套的图文版，逐步还原公式
- [Group Relative Policy Optimization (GRPO)（Cameron R. Wolfe）](https://cameronrwolfe.substack.com/p/grpo) — 英文深度长文，从 GRPO 追到 R1
- [Why GRPO is Important and How it Works（Oxen.ai）](https://www.oxen.ai/blog/why-grpo-is-important-and-how-it-works) — 面向工程师解释 GRPO

---

# 深读：从 Common Crawl 挖数据到 GRPO 一个训练 step 的完整流程（含所有疑问点）

## 角色与核心思想

这篇论文干了两件事，对应两个互相独立的机制：

- **机制一（造数据）**：数学内容大量藏身于 Common Crawl，但没人挖干净过。DeepSeek 用「fastText 分类器 + 迭代自举」捞出 35.5M 个数学网页、共 120B token，接续预训练 DeepSeek-Coder-Base-v1.5 7B，得到 DeepSeekMath-Base（MATH 36.2%，超过 77 倍大的 Minerva 540B）。
- **机制二（GRPO，本文最大遗产）**：PPO 做大模型 RL 要同时养 4 个模型（actor / critic / reward / reference），critic 又大又难训。GRPO 砍掉 critic，用「同一道题采一组回答、组内奖励互相当基线」来估 advantage，只留 3 个模型。DeepSeek-V3、R1 用的就是它。

解答的问题一句话：**高质量数学数据能从公开网页里成规模挖出来；RL 不必背上 critic。**

```
Common Crawl ──(种子=OpenWebMath, fastText, 4轮自举)──► 120B 数学 token
                                                        │
        基座(DeepSeek-Coder-Base-v1.5 7B) ── 500B token 继续预训练 ──► Base
                                                        │
        SFT（776K 例）───────► Instruct（GSM8K 82.9 / MATH 46.8）
                                                        │
        GRPO（144K 题 × 每题 G=64 答）──► RL（GSM8K 88.2 / MATH 51.7）
```

---

## 机制一：从 Common Crawl 自举挖出 120B 数学 token

整套推演里真正「在动」的只有 fastText 分类器：每轮重训一次，越训越准、挖得越多，**语料反过来喂分类器**——这就是「自举」。

### 阶段 0：选定种子

OpenWebMath（13.6B token）是别人已发布的高质量数学网页集，但量太小。它不当语料用，**当分类器的教材用**。

### 阶段 1：训 fastText 分类器

- 正样本：种子随机抽 500K 条；负样本：Common Crawl 随机抽 500K 页；
- 设置：向量维度 256、学习率 0.1、词 n-gram 最长 3、词最低出现次数 3、训 3 epochs。

产出：给任意网页打一个「像不像数学页」的分数。

### 阶段 2：全网打分、排序、截头

先把 CC 减肥：URL 去重 + 近似去重 → 40B 个 HTML 网页。fastText 全量打分，按分排序，只留头部。留多少？用 top 40B/80B/120B/160B token 的预训练实验来定，第一轮先保留 top 40B token。

**疑问点①：为什么「排序截头」而不是设一个及格阈值？**
阈值难定且跨领域不稳；截头把选择变成容量问题：要多少数据取头部多少，且能与数据量权衡实验直接挂钩（他们正是用四档预训练实验定的量）。低分页不是「判假」而是「排后」，天然保留部分召回余地。

### 阶段 3：迭代自举（关键一步）

第一轮挖完仍漏大量数学页——正样本全是 OpenWebMath 的样，多样性不够。补救：

```
把 CC 按域名分组（同一 base URL = 一个 domain，如 mathoverflow.net）
        │
        ▼
统计每个 domain 中「第一轮被收回语料的网页占比」
        │
        ▼
占比 > 10% 的 domain 判为数学相关
        │
        ▼
人工标注这些数学 domain 里的数学 URL（如 mathoverflow.net/questions）
        │
        ▼
这些 URL 下、此前未收回的网页 ──► 加进种子
        │
        ▼
用扩充后的种子重训 fastText ──► 回到阶段 2
```

**疑问点②：「域名 >10% 已收 ⇒ 数学域名」这个规则凭什么成立？**
一个域名下页面主题通常高度相关：如果挖矿前 10% 的页面已被判为数学页，说明这个站点的随机抽样里数学密度就很高，再由人工确认其数学 URL 区段。规则把「网页级二分类」升级成「站点级先验 + 人工精标」，等于用人的免费标注扩种。论文没解释 10% 的来源，属经验设定。

**疑问点③：负样本随机抽 CC，不会把数学页混进去当负例吗？**
会混入少量，但 CC 里数学页占比极低，500K 抽样的污染量级可忽略；且每一轮分类器都在重训，标签持续刷新，页不会被「一次判负、终身判负」——后续轮次密度更高的正确正例会把它校正回来。

**疑问点④：fastText 只是线性分类器，够格吗？**
这个环节的判别粒度是「整页像不像数学内容」，粗分类。精细筛选靠排序截头（只有头部进语料）+ 迭代重训补召回。另一个现实约束：要对 40B 页全量打分，必须便宜，深度模型跑不动。

四轮之后：第 4 轮发现约 98% 的数据已在第 3 轮收过，边际收益耗尽，停。**为什么不多跑几轮？** 因为自举的收益曲线是指数衰减：每轮新种子与已收页高度重叠，第 5 轮预计与第 4 轮一样几乎无新增。

### 阶段 4：去污染

考题可能原样出现在语料里。规则：任何文本段若包含与评测基准（GSM8K、MATH、CMATH、AGIEval 等）子串**完全一致的 10-gram**，整段移除；基准文本不足 10-gram 但 ≥3-gram 的，用精确匹配过滤整页。

最终产出：35.5M 数学网页、120B token（约为 Minerva 数学网页的 7 倍、OpenWebMath 的 9 倍）。质量证据（原文表 1，1.3B 模型各训 150B token）：GSM8K 23.8% / MATH 13.6% / CMATH 41.5%，对比 Proof-Pile-2 14.3%/11.2%/19.9%、OpenWebMath 11.5%/8.9%/16.8%、MathPile 2.7%/3.3%/1.2%（不训数学 2.9%/3.0%/12.3%，MathPile 反而更糟）。

---

## 机制二：GRPO 一个训练 step 的完整旅程

### 阶段零：清点队伍——PPO 四模型 vs GRPO 三模型

```
PPO 需要 4 个模型同时在显存里：
  π_θ     actor（行为模型）：生成回答，要更新的是它
  V_ψ     critic（价值模型）：估每个 token 的期望回报，喂 GAE 算 advantage
  π_ref   reference（参照）：通常是初始 SFT 模型，冻结，管 KL 约束
  r_φ     reward（奖励模型）：打分

GRPO 只留 3 个：π_θ、π_ref、r_φ   ← critic 被扔了
```

为什么敢扔 critic？论文给的理由：① value 模型与 policy 差不多大，显存/算力负担重；② LLM 场景下奖励模型通常只在回答**最后一个 token**给分，信号极稀，要训练一个「每个 token 都准」的 value 函数更加困难。GRPO 的替代品：**用同一道题一组回答的奖励平均值当基线，组内相对分当 advantage。**

### 阶段一：旧策略采样 G 个回答

从题集抽一批题，对每道题 q，用**旧策略快照** π_θold 采 G=64 个回答 {o₁,…,o₆₄}（max length 1024）。

### 阶段二：打分

奖励模型 r_φ 给每条回答一个分数（本文的奖励模型在规则判对错的数据上训练），得 {r₁,…,r₆₄}：

```
例（示意）：r = [1,0,0,1,0,0,1,1,…]，mean(r)=0.37，std(r)=0.48
```

### 阶段三：组内标准化 → advantage

outcome 监督下，回答 i 的**所有 token** 共享同一个标准分：

```
Â_i,t = r̃_i = (r_i − mean(r)) / std(r)     对 i 的每个 token t 都成立
```

**疑问点⑤：为什么需要「组」？单条回答的绝对分不行吗？**
不行——不同题难度不同，绝对分没有共同参照系；同一题内 64 条互相比，组均值天然消掉题目难度的偏差，std 消掉量纲，「比组均值好多少个标准差」才可跨题比较。这也契合奖励模型本质是用**同题对比**训练出来的：组内相对比较正是它训练时的形态。

**疑问点⑥：一道题 64 条全对（或全错）会怎样？**
std→0，比值失去意义，组内无梯度信息（全对=无需改，全错=无从比）。数值稳定的具体工程处理（如给 std 加小常数）论文未写，属实现细节；结论是「组内分化才有梯度」，这正是每题要采一组、而非采一条的原因。

**疑问点⑦：过程监督（PRM 版）在这同一框架下怎么变？**
论文给出对应变体：PRM 对回答 i 的第 j 步末 token 打分，组内标准化后，每个 token 的 advantage = **其后所有步标准分的累加**：Â_i,t = Σ_{index(j)≥t} r̃_i^index(j)。即 step 级信号的「时间轴后缀和」。实验里 GRPO+PS（过程监督）优于 GRPO+OS（结果监督）。

### 阶段四：逐 token 组装目标（KL 进损失、不进 reward）

对回答 i 的每个 token，令 ratio r = π_θ(o_{i,t}|q,o_{i,<t}) / π_θold(o_{i,t}|q,o_{i,<t})：

```
J_GRPO(θ) = E[ q∼P(Q), {o_i}∼π_θold(O|q) ]
    (1/G) Σ_i (1/|o_i|) Σ_t { min[ r·Â_i,t , clip(r, 1−ε, 1+ε)·Â_i,t ]
                              − β · D_KL[π_θ ‖ π_ref] }

D_KL[π_θ ‖ π_ref] ≈ π_ref(o_{i,t}|q,o_{i,<t}) / π_θ(…) − log(π_ref/π_θ) − 1
```

KL 用 Schulman(2020) 的无偏估计，**恒为非负**（数学上：x − log x − 1 ≥ 0）。

**疑问点⑧：PPO 把 KL 加进 reward，GRPO 为什么非要挪进损失？**
PPO 的做法：r_t = r_φ(q,o≤t) − β·log(π_θ/π_ref)，KL 混进 reward 后会渗入 value 函数的学习目标和 GAE 的每步奖励，advantage 的计算被搅浑，critic 还得替 KL 背锅。GRPO 在目标函数里把 β·KL 单列一项，advantage 保持纯净——论文原话：避免搞复杂 Â 的计算。副作用顺带：反正 critic 已被删，也没有可以承接 KL 的地方了。

### 阶段五：更新一次

本文设定：每轮探索后 policy 只更新一次（故 min/clip 在这一步近似失效，ratio≈1），梯度形如（原文附录式 20）：

```
∇J_GRPO ∝ Σ_i Σ_t [ Â_i,t + β·( π_ref(o_{i,t}|q,o_{i,<t}) / π_θ(…) − 1 ) ] · ∇ log π_θ(o_{i,t}|q,o_{i,<t})
```

读法：答对了（Â>0）→ 推高整条回答各 token 的条件概率；答错了（Â<0）→ **主动压低**；离参照模型越远的 token，β 项越把它往回拽。

**疑问点⑨：和 Online RFT（在线拒绝采样微调）差在哪？**
Online RFT 的梯度系数只有对/错指示 I(o)：错样本被无视（系数 0），对样本一律同样强度推高。GRPO 用 Â 的大小做**差分强化**：错样本被负系数惩罚，对样本按相对好坏不同强度强化。论文实验里 GRPO 稳超 Online RFT，说明「正负梯度系数的调制」是关键增益。

**疑问点⑩：min 和 clip 不是在单次更新下没用吗，图什么？**
单次更新时确实近似失效；但迭代式训练中同一批采样可以再更新 μ 轮，π_θ 就会偏离 π_θold。ratio 落在 [1−ε, 1+ε] 外时 clip 截断，min 取「悲观」一侧——防止单 token 概率被一步翻转，这是从 PPO 继承的全部稳定器。

### 阶段六：迭代 GRPO——奖励模型跟不上怎么办

策略不断变强，旧 r_φ 的分数会逐渐失去区分度（很多题 64 条全对，std 不再分化）。Algorithm 1 的循环：策略自采新样本 → 用规则对错构造新 RM 训练集 → **replay 机制连续训练旧 RM（混 10% 历史数据）** → π_ref ← π_θ → 继续。论文做了两轮迭代（图 6），第一轮提升最明显。

### 阶段七：缩略图 & 与 PPO 对照

```
抽题 → π_θold 采 64 答 → r_φ 打分 → 组内标准化 Â → 目标+KL → 更新 1 次
     ↑（若干轮后：重训 RM（replay 10% 旧数据）、π_ref ← π_θ、继续）
```

**同一批数据走 PPO 会怎样？** 阶段一相同；阶段二之前要先训一个与 policy 同尺寸的 value 模型 V_ψ；阶段三的 advantage 由 GAE 对 {r≥t} 与 V_ψ 折现而来，逐 token 各不相同；reward 里还得扣 KL。GRPO 用「组统计」把 critic + GAE + reward 内 KL 三个环节合并成一个减法和除法。

---

## 机制三：整条管线为什么每步成立

- **代码在数学前面（原文表 6）**：1.3B 模型，先 400B 代码 token 再 150B 数学：GSM8K 21.9% / MATH 15.3%，优于先 400B 通用语料再数学的 19.1%/14.4%；且一阶段混合训练保住编码能力（MATH+Python 13.5% vs 两阶段 9.4%）。→ 所以起点选 DeepSeek-Coder-Base-v1.5 而非通用 LLM。
- **arXiv 论文没用（原文表 8）**：1.3B 在 MathPile（>85% arXiv）上 GSM8K 2.7%，不如不训的 2.9%；7B 同样下降。→ 主力数据必须是 CC 网页（语料的可读问答式表达），arXiv 仅占预训练的 10%。
- **SFT → RL 的接力**：776K 例（CoT / PoT / 工具集成）训出 Instruct：GSM8K 82.9%、MATH 46.8%；GRPO 只用 **144K 条 CoT 格式的 GSM8K+MATH 题**（SFT 数据子集）继续训，就推到 GSM8K 88.2%、MATH 51.7%（开源 7B 首破 MATH 50%；CMATH 84.6%→88.8% 属域外上涨；64 样本自洽 60.9%）。
- **RL 到底带来了什么（原文图 7）**：RL 提升 Maj@K 但不提升 Pass@K——模型「会做的题」集合没变（基础能力没变），变的是**把正确回答排进 TopK 的概率分布更稳了**。首因疑点在数据源单一（仅 SFT 题 + 朴素核采样）与奖励信号噪声（连 PRM800K 约有 20% 标注错误）。

---

## 关键数字与实验

| 指标 | 本文 | 出处 |
|---|---|---|
| MATH top-1（无工具/无投票） | 51.7%（DeepSeekMath-RL 7B） | 摘要 / 表5 |
| MATH 自洽投票@64 | 60.9% | 摘要 |
| Base 全线 | GSM8K 64.2% / MATH 36.2% / CMATH 71.7% / MMLU 54.9% / BBH 59.5% | 表2 / 表4 |
| 对照 Minerva 540B | GSM8K 58.8% / MATH 33.6%（模型大 77 倍） | 表2 |
| 语料产出 | 35.5M 页、120B token；迭代 4 轮；第 4 轮 98% 已收过 | 原文 2.1 |
| CC 去重后规模 | 40B HTML 页 | 原文 2.1 |
| fastText 训练 | 正/负各 500K；dim 256、lr 0.1、n-gram≤3、min freq 3、3 epochs | 原文 2.1 |
| 截头档位实验 | top 40B / 80B / 120B / 160B token，首轮取 40B | 原文 2.1 |
| 数学域判定 | 域内 >10% 网页已收 → 数学域（如 mathoverflow.net） | 原文 2.1 |
| 去污染 | 10-gram 精确匹配（<10-gram 且 ≥3-gram 用精确匹配整页过滤） | 原文 2.1 |
| 语料对照（1.3B 各训 150B） | 本语料 GSM8K 23.8 / MATH 13.6；Proof-Pile-2 14.3/11.2；OpenWebMath 11.5/8.9；MathPile 2.7/3.3 | 表1 |
| 预训练配比（500B） | 56% 数学语料 / 4% AlgebraicStack / 10% arXiv / 20% GitHub / 10% CC 自然语言 | 原文 2.3 |
| SFT | 776K 例；500 步、batch 256、lr 5e-5、上下文 4K | 原文 3.1/3.2 |
| RL 设定 | 144K CoT 题；G=64；max len 1024；batch 1024；KL 系数 0.04；policy lr 1e-6；RM lr 2e-5（RM 基于 Base 训） | 原文 4.2 |
| RL 提升 | GSM8K 82.9→88.2；MATH 46.8→51.7；CMATH 84.6→88.8；MGSM-zh 73.2→79.6；TIR-MATH 57.4→58.8 | 摘要 / 表5 |
| 代码先修收益 | 两阶段 code→math 21.9/15.3 vs general→math 19.1/14.4；混训 GSM8K+Python 19.7 / MATH+Python 13.5 vs 两阶段 17.4/9.4 | 表6 |
| arXiv 无效 | 1.3B MathPile GSM8K 2.7 / MATH 3.3（不训 2.9/3.0）；Coder-7B MathPile GSM8K 23.6（不训 29.0） | 表8 |
| 迭代 RL | 两轮；RM replay 混 10% 历史数据；第一轮提升最明显 | 原文 4.1.4 / 图6 |
| RL 效果本质 | Maj@K 升、Pass@K 不升（温度 0.7） | 图7 |

（引注：5.1 节的数学训练实验用的是数据收集第 2 轮的 89B token 子集。）

---

## 全局数据流总表

| 阶段 | 谁在动 | 产出 | 关键代价 |
|---|---|---|---|
| 语料·首轮 | fastText 训练→打分 | top 40B token 数学页 | 40B 页全量推理（线性模型，便宜） |
| 语料·自举 | 重训 fastText × 3 轮 | 累计 120B token | 4 轮迭代；第 4 轮近零收益故停 |
| 语料·质检 | 字符串匹配过滤 | 无污染语料 | 免费（规则） |
| 预训练 | 基座 + 500B token | DeepSeekMath-Base | MATH 36.2%，MMLU/BBH 反升 |
| SFT | 776K 例监督训练 | DeepSeekMath-Instruct | MATH 46.8% |
| RL·探索 | π_θold 采样 | 每题 64 答 | 生成量大（batch 1024 × len 1024） |
| RL·打分 | r_φ | {r₁..r₆₄} | 一次 RM 前向 |
| RL·优势 | 纯算术 | Â = (r−mean)/std | 免费 |
| RL·更新 | π_θ 梯度一步 | 新策略 | 三模型前向+反传，无 critic |
| RL·迭代 | 重训 RM、刷新 π_ref | 更强监督信号 | 两轮后主线收益放缓 |

---

## 所有疑问点速查

| 疑问 | 答案 |
|---|---|
| 为什么截头不设阈值？ | 量可控、跨域稳、直接跟数据量权衡实验挂钩 |
| 负样本会混入数学页吗？ | 会但量级可忽略；分类器每轮重训，标签持续刷新 |
| fastText 线性够用吗？ | 页级粗分类足够；精细筛靠截头 + 迭代补召回；40B 页打分必须便宜 |
| 为什么第 4 轮就停？ | 98% 数据已被第 3 轮收过，自举收益指数衰减 |
| 为什么需要「组」？ | 组均值消掉题目难度偏差、消掉量纲；组内相对分可跨题比较 |
| 64 条全对全错会怎样？ | std→0，组内无梯度信息；数值处理属实现细节（论文未写） |
| 过程监督版 advantage？ | PRM 给每步打分、组内标准化后，token 的 Â = 其后所有步标准分之和 |
| KL 为什么进损失不进 reward？ | 不让 KL 渗入 value/GAE 搅浑 advantage；critic 已删，也没地方承接 |
| GRPO vs Online RFT？ | RFT 错样本系数 0、对样本等强度；GRPO 用 Â 差分强化+惩罚 |
| min/clip 的作用？ | 单次更新近似失效；多轮迭代时截住 ratio 翻转、取悲观侧 |
| 为什么比 PPO 省？ | 4 模型（actor/critic/ref/RM）→ 3 模型；GAE/组统计 + reward 内 KL → 减法除法 |
| RL 只稳分布不出新能力？ | 图 7：Maj@K 升、Pass@K 不变；机制疑在数据源单一与奖励噪声 |

---

## 一句话总括

**用 OpenWebMath 教出来的 fastText 分堆 Common Crawl，网页挖矿自举四轮挖出 120B 数学 token 去喂底座；再用「每题采一组回答、组内互为基线」的 GRPO（三模型、KL 进损失不进 reward）在 SFT 之上把 MATH 推过 51.7%——前者证明公开网页的数学矿藏足够肥，后者证明 RL 不必背 critic；而 GRPO 的本质其实很小：把 PPO 的 advantage 计算从「学一个 value 函数 + GAE 折现」简化成「组内减均值除标准差」。**

---

## 参考与延伸阅读

- [arXiv:2402.03300 摘要页](https://arxiv.org/abs/2402.03300) · [arXiv HTML 全文（v3）](https://arxiv.org/html/2402.03300v3) — 本文所有数字与公式出处
- [官方 GitHub 仓库 deepseek-ai/DeepSeek-Math](https://github.com/deepseek-ai/DeepSeek-Math) — 论文文首给出的官方代码地址
- [Schulman 的 KL 无偏估计博客（式 4 出处）](http://joschu.net/blog/kl-approx.html) — GRPO 采用的 KL 估计器原文
- [本篇词汇](../study/vocab/04_DeepSeekMath_论文词汇.html) · [本篇听力](../study/listen/04_DeepSeekMath_单词听力.html)
- 上方「全网解读资源」一节的知乎/HF/社区解读链接也可配合本笔记服用

