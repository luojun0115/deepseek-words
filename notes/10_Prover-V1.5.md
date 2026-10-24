---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 10 · Prover-V1.5 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [DeepSeek-Prover-V1.5 解读（知乎）](https://zhuanlan.zhihu.com/p/32389403805) — SFT 数据构成与训练流程拆解
- [DeepSeek-Prover-V1.5 中文导读（deeprlhub）](https://www.deeprlhub.com/blog/1560-deepseek-prover-v15) — 强化学习视角全文导读
- [DeepSeek-Prover-V1.5 翻译翻译（CSDN）](https://blog.csdn.net/qq_28385535/article/details/141505402) — 中译加笔记式导读
- [DeepSeek-Prover 详解（V1 + V1.5）（yudonglee 系列）](https://yudonglee.me/deepseek-prover-explained/) — 重点讲截断-恢复 MCTS 与 RMaxTS
- [New Grounds in Theorem Proving with DeepSeek-Prover-V1.5（Medium）](https://medium.com/@haitham.bouammar71/new-grounds-in-theorem-proving-with-deepseek-prover-v1-5-681c4e41caba) — 英文解读 RMaxTS 内在奖励探索

### 英文 & 社区
- [arXiv 原文页](https://arxiv.org/abs/2408.08152) — 论文官方页
- [Hugging Face 论文页](https://huggingface.co/papers/2408.08152) — 收录页与社区讨论
- [OpenReview 评审页（ICLR 2025）](https://openreview.net/forum?id=I4YAIwrsXa) — 审稿人与作者公开讨论
- [Reddit r/MachineLearning 讨论帖](https://www.reddit.com/r/MachineLearning/comments/1f1nld3/r_deepseekproverv15_harnessing_proof_assistant/) — RMaxTS 与 63.5% 新 SOTA 的讨论
- [LessWrong: Distillation of DeepSeek-Prover V1.5](https://www.lesswrong.com/posts/y3NgXbtCK8qQNzhYq/distillation-of-deepseek-prover-v1-5) — RMaxTS 算法技术摘要
- [官方 X(Twitter) 发布帖](https://x.com/deepseek_ai/status/1824291724887208040) — 官方一手发布

### 全系列综述（含本篇）
- [DeepSeek 技术路线图（yudonglee）](https://yudonglee.me/deepseek-roadmap/) — 演进导览
- [知乎：10 篇论文读懂 DeepSeek 技术演进脉络](https://zhuanlan.zhihu.com/p/2036459670894810864) — 中文串讲
- [fengweifeng DeepSeek 论文库](https://fengweifeng.com/deepseek-papers/) — 中文译文+逐篇解读汇总
- [B站：逐篇讲解 DeepSeek 关键 9 篇论文](https://www.bilibili.com/video/BV1xuK5eREJi/) — 视频版（单篇 V1.5 专属视频未检索到）

---

# RLPAF + RMaxTS 完整流程（含所有疑问点）

## 角色与核心思想

先报一遍出场角色（全部来自原文）：

- **模型**：DeepSeek-Prover-V1.5，7B 参数，底座是 DeepSeekMath-Base，继续预训练后叫 V1.5-Base，SFT 后叫 V1.5-SFT，再过强化学习叫 V1.5-RL。
- **Lean 4 证明助手**：就是那个不会说谎的「编译器」。证明给进去，它只回答两种话：「验证通过」或「在某个位置报错」。
- **任务**：给定定理声明，写出一段 Lean 4 证明代码（whole-proof generation，整条证明一次生成）。
- **核心思想**：证明助手这种反馈太珍贵了——准确、免费、天然二值——所以要把它的血榨干三次：**训练前**（把 tactic state 注释塞进 SFT 数据）、**训练中**（RLPAF，Lean 验证结果直接当 reward）、**推理时**（截断-续写机制把整证明生成变成 MCTS 的每一步 rollout，再配上内在奖励驱动探索的 RMaxTS）。

一代 Prover-V1 走的是 expert iteration（专家迭代）路线：模型采样证明 → Lean 验证筛出正确的 → 回炉续训。那是「把反馈变成新数据」；V1.5 往前推了一步：「把反馈直接变成在线 RL 的 reward 信号」（RLPAF），再往前推一步：「把反馈变成树搜索的每一步路标」（truncate-and-resume MCTS）。

下面用「一道 miniF2F-test 题从采样到全树找到证明」当主干，把整个循环推演一遍。

---

## 阶段零：训练场搭建（SFT 都准备了什么）

树搜索能跑通，全靠 SFT 阶段埋的两个伏笔，先看清楚：

1. **CoT 注释**：用 DeepSeek-Coder V2 236B 给 V1 的证明数据加工两种注释——证明块开头插入一段完整自然语言解法、每个 Lean tactic 前插入对应的自然语言步骤规划。训练数据里用两种引导提示词区分 CoT / non-CoT 模式。
2. **tactic state 注释**：改造 Lean REPL（借 LeanDojo 的抽取工具），把每条 tactic 的位置、应用前后的 tactic state 抽成三元组，在证明代码里插入注释 `/- tactic state: … -/`。

**疑问点①：训练时模型到底「学」这段注释的什么？**
原文设计得很明确：注释之后的所有 token 作为响应算 SFT loss（模型要**预测** Lean 会把状态变成什么样），注释之前的 token 只当 prompt，不算 loss。这是一个辅助预测任务：逼模型内心维护一个「编译器视角的证明状态」的表示。

**疑问点②：为什么要两个注释机制？分工是什么？**
CoT 管「策略」：Step 之前先想清楚数学上怎么走，消解 V1 发现的问题——Lean 里模型只会堆高层 tactic 硬怼，蒙住了内部机制。tactic state 管「感知」：给树搜索续写时一个确定的状态锚点（消融实验证明去掉它，树搜索收益明显缩水，见疑问点⑬）。数据规模：最终证明数据集 9,645k 条序列。

---

正片开始。设题目是 miniF2F-test 里的一道竞赛题，当前用的模型是 V1.5-RL。

```
root（定理声明）
   │
   ▼
[第 1 轮] 整证明采样 ──► Lean 编译 ──┬─ 通过 ✔ 流程结束
                                    └─ 报错 ✘ 截断 → 建树节点 → 选节点 → 再采样 → ……
```

## 阶段一：单次全证明采样

在单块 A100-40G 上用 vLLM 采样：temperature 1、top-p 0.95、最长 2,048 token。一次生成**整条证明**，不是一条 tactic。

**疑问点③：为什么不学 ReProver / GPT-f 那样一条 tactic 一验证？**
两种路线各有账。proof-step 生成能拿到中间 tactic state，但每步都要和验证器通信一圈，计算贵；whole-proof 生成计算高效，但长程预测全程看不到中间状态——V1 论文点名的 compounding errors：一步对证明状态的误判，后面全跟着歪。V1.5 的答案是先用便宜的整证明生成，出错了再用截断-续写把中间状态「补」进来（阶段三～四），等于花一份钱同时吃两边的红利。

**疑问点④：CoT 模式和 non-CoT 模式差在哪？**
同一个模型，两份引导提示词。CoT 模式下证明块开头先写一段自然语言解法再进 Lean 代码，策略更系统化；non-CoT 模式直接怼 Lean 高层 tactic，擅长 Lean 自动化机制能处理的问题（如可交给 `aesop`/暴力枚举的计算题）。4.2 节发现两者势不均：样本预算越大，CoT 优势越大，且两模式在不同题目上互补——所以最后的 SOTA 是把预算对半劈给两种模式的 mixture 策略。

## 阶段二：Lean 编译与截断（truncate）

整段证明提交 Lean 4 验证（导入 Mathlib4 与 Aesop，限时 300 秒）。两种结局：

- **验证通过且完整**：流程直接终止，这题 solved。
- **检测到错误**：在**最早的报错处**截断代码，报错之后的代码全部丢弃。

**疑问点⑤：为什么丢弃报错之后的所有代码，而不是让模型自己绕过去？**
报错之后那段代码，是在模型**错误的认知**下写出的——它以为前面的 tactic 状态是 X，实际是 X′，后面整段建立在幻觉上。而截断点之前的每一行都真实通过过 Lean 的解析与应用，是可信前缀。丢幻觉、留事实。

## 阶段三：从截断点续写（resume）

从被选中续写的节点拼 prompt：

```
prompt = 文件头 + 定理声明 + (祖先节点已成功应用的 tactics)
       + 未完成证明代码（截断到选中 tactic 为止）
       + "/- tactic state: <Lean 返回的最新状态> -/"
```

模型续写后续证明。整证明生成天生就是一次 rollout，所以标准 MCTS 的四步里 Simulation 被合并进 Expansion。

**疑问点⑥：MCTS 不是每轮展开「一层」吗？这里怎么会一次插进去一整条链？**
对，这是本文与下棋式 MCTS（AlphaGo 那类每轮只长一层孩子）的结构性区别。因为模型输出的是**整段证明**（一串 tactic 而非一个 tactic），一次续写里凡是通过验证的 tactic 都会被逐段拆开、注册成树上一连串新节点。一轮迭代可能让树长出一条链，采样效率就来自这里：一次模型调用产生的信息全部入库，不浪费。

## 阶段四：树到底长什么样（tactic 级树抽象）

- **节点 = 一个 tactic 状态**；边 = 一次 tactic 应用（配它的 CoT 注释）。
- **节点上存的是一组等价 tactic 代码**：Lean 里不同 tactic 可以到达同一个状态。展开该节点时从这组里**随机挑一个**拼进 prompt。

**疑问点⑦：一个节点存一撮等价 tactic，随机挑一个，图什么？**
图多样性。同一条续写路径，换不同的入口 tactic，模型写出的后续代码就不同，能到达的后继状态分布更宽。这对以「发现新节点」为奖励的探索机制（阶段五）是直接的正反馈：等价入口多了，同一状态的可行出路就多点，撞出新状态的几率更大，还能减少冗余生成、提高样本效率。

**疑问点⑧：续写不限于从叶节点开始吗？**
不限于。选节点动作集合是 Children(s) ∪ {⊘}——既可以往下走子节点，也可以用 ⊘ 这个特殊符号选「就地展开当前节点」。这就是 virtual node 技巧：给每个节点挂一个假想孩子代表「展开我」。生成式模型的动作空间没有固定上限（一个状态后面能接的 tactic 多得写不完），所以永远需要保留「继续就地展开」这个选项，搜索才不会长歪到一个过早定型的局部。

## 阶段五：Selection——怎么挑下一个展开点

树策略一行（原文式 1、2）：

```
TreePolicy(s) = argmaxₐ (a ∈ Children(s) ∪ {⊘})  Q_UCB(s, a)

Q_UCB(s, a) = Q(s, a)      （利用：历史选中记录的均值）
            + UCB(s, a)    （探索：置信上界奖励，选中越多越小）
```

## 阶段六：Backpropagation 与 RMaxTS 的内在奖励

每轮迭代沿选择轨迹回传奖励。外生奖励来自编译器：完整证明 R_extrinsic = 1，未解决 = 0——**极稀疏**：整棵树只有窄窄一撮叶子值 1，其余全是 0。

RMaxTS 的做法（原文式 3）：把一次树扩展的内在奖励定义为

```
R_intrinsic(τ) = 𝕀[本轮扩展至少向搜索树添加了一个新节点]
```

即只要「撞出了没见过的 tactic 状态」就自赏，对着 RMax 经典套路：到达未见状态给自己发最大奖励。原文明确本流程按 reward-free 形式跑（类似 ZeroRMax，R(τ) = R_intrinsic(τ)），外生 1/0 仍按 3.2 节定义参与回传体系。

**疑问点⑨、「把反馈用到探索上，最大障碍是什么」——答案在那条 UCB 公式里**
内在奖励是**非平稳**的：树越大越饱和，再发现一个新节点越难，期望值随探索推进而衰减。标准 UCB1 假设样本充分大后渐近收敛，不适应这种衰减信号；它要么被访问次数主导，要么把过时的正反馈一直端着。文章的解法是折扣置信上界 DUCB（原文式 7–9）：

```
Q_DUCB(s,a) = W_γ(s,a) / N_γ(s,a) + √( 2·ln Σ_a′ N_γ(s,a′) / N_γ(s,a) )
W_γ(s,a) = Σₜ γ^(N(s,a)−t) · R(τ_t)     γ = 0.99
N_γ(s,a) = Σₜ γᵗ
```

新到的反馈权重高，老反馈按几何级数淡出。注意这里的 γ 折扣打在**树搜索迭代次数**上，不是单条轨迹的步长 horizon——与无限期 MDP 价值迭代里的 γ 角色不同。

**疑问点⑩：证明成功这么难，靠「有/没有新节点」这种指示函数真的能导向证明吗？**
原文的消融（图 5）给了双向证据：完全砍掉内在奖励（纯 UCT）时，探索只剩访问计数在驱使，16×6400 预算下 61.1%，低于完整 RMaxTS 的 62.7%；把 DUCB 换成 UCB1，也跌回 60.7%。单看每个部件都只差一两个点，但三者（内在奖励 × DUCB × tactic state 信息）是合在一起才能把树搜索从「在已知区域打转」拉出来做全局探索的组合。另外记住这些 run 的 CoT 单次采样基线只有 60.2%——树搜索的增益是在这个基线上叠加的。

## 阶段七：并行与终止

- **Root 并行**：256 个 MCTS runner 并行跑独立搜索树（每 GPU 一个模型，batch 512）；Lean 验证跑在数千核 CPU 集群上，每个验证任务独立沙盒进程，生成与验证全异步。
- **Tree 并行**：每棵树 32 个线程 worker 同时迭代。
- **Virtual loss**：并发线程同时盯上一个节点时，给进行中的迭代临时回传 R = 0，逼后来的线程去挑别的节点，防止扎堆。完成后才写回真实奖励。
- **终止**：某轮 rollout 的整段证明被 Lean 验证通过 → 收工；或样本预算耗尽。

---

## 关键数字与实验

各训练阶段 pass@128 对比（原文图 3，miniF2F-test / ProofNet-test）：

| 模型 | miniF2F-test | ProofNet-test |
|---|---|---|
| Base（3-shot） | 29.7%±0.5% | 9.7%±0.7% |
| SFT（non-CoT） | 49.8%±0.3% | 15.9%±0.5% |
| SFT（CoT） | 50.4%±0.4% | 15.9%±0.6% |
| RL（non-CoT） | 50.5%±0.6% | 17.5%±0.5% |
| RL（CoT） | 51.6%±0.5% | 18.2%±0.5% |

主战场 miniF2F-test（原文表 1、表 3）：

| 方法 | 采样预算 | pass 率 |
|---|---|---|
| DeepSeek-Prover-V1（单次采样） | 128 | 46.1%±0.5% |
| DeepSeek-Prover-V1（单次采样） | 16×4096 | 50.0% |
| V1.5-RL 单次采样 | 128 | 51.6%±0.5% |
| V1.5-RL 单次采样 | 3200 | 54.9%±0.7% |
| V1.5-RL 单次采样 | 16×6400 | 60.2% |
| InternLM2-StepProver（树搜索） | 64×3200 | 54.5% |
| V1.5-RL + RMaxTS | 16×6400 | 62.7% |
| V1.5-RL + RMaxTS（mixture） | 32×6400 | **63.5%（SOTA）** |

亮点掂一掂：RL 模型只花 **3200 次整证明采样**就到 54.9%，超过做了 64×3200 次树搜索才到 54.5% 的 InternLM2-StepProver——即同等预算下对方的 64 倍搜索深度。ProofNet（原文表 2）：单次采样 RL 4×6400 得 test 23.7%；RL+RMaxTS 4×6400 达 valid 25.4% / test 25.3%，超 ReProver（13.8%）与 InternLM2-StepProver（18.1%）。

RL 阶段配置（原文 2.3 节）：GRPO 算法（无 critic，组内相对比较），约 4.5k 条「SFT 模型中等成功率」的定理作 prompt，每题采样组大小 32，学习率 5e-6，KL 系数 0.02，batch 512，最长 2048 token。SFT：9B token，batch 2048，lr 1e-4，上下文 4096。

---

## 与前作 Prover-V1 的管线对照

| 环节 | Prover-V1 | Prover-V1.5 |
|---|---|---|
| 底座 | — | DeepSeekMath-Base 继续预训练（Lean/Isabelle/Metamath 语料）→ V1.5-Base |
| 数据回路 | expert iteration：采样→筛正确证明→续训 | 同回路保留，另用 DeepSeek-Coder V2 236B 补 CoT 注释与 tactic state 注释（9,645k 序列） |
| 反馈用法 | 离线筛数据（RFT 思路） | **在线 RL**：GRPO + Lean 验证二值 reward（RLPAF） |
| 推理 | 单次整证明采样 | 单次采样 **或** 截断-续写 MCTS（RMaxTS） |
| 产出 | miniF2F-test 50.0% | 单次采样 60.2%，树搜索 63.5% |

值得留意的一处原文新发现（2.4 节）：在自然语言数学任务（DeepSeekMath）里，RL 主要把 TopK 内的正确率抬上去；但在形式化证明上，RL 带来的是**小预算到大预算全区间稳定的能力增强**——不是采样曲线头部变尖，是整条曲线抬升。

---

## 全局数据流总表

| 阶段 | 谁在动 | 产出 | 付出 |
|---|---|---|---|
| SFT 造数据 | V1 模型采样 + Lean 验证 + Coder V2 236B 注释 | 9645k 条带双注释的证明序列 | LLM 调用 + 编译 |
| SFT 训练 | V1.5-Base | V1.5-SFT（学会读 tactic state、学会先想后写） | 9B token |
| RL（RLPAF） | GRPO + Lean 验证 reward（1/0） | V1.5-RL | 每题 32 候选 × 4.5k 题 |
| 推理·单次 | vLLM 采样 | 整条证明 | 1 次生成 + 1 次编译 |
| 推理·树搜索 | MCTS 循环：选→扩（生成+编译）→回传 | 一棵 tactic 树 → 若验证通过即证毕 | 每轮 ≥1 次生成 + 1 次编译 |
| 探索驱动 | RMaxTS：内在奖励 + DUCB | 多样的 proof 路径 | γ=0.99 的统计维护 |

---

## 所有疑问点速查

| 疑问 | 答案 |
|---|---|
| ① SFT 里 tactic state 注释学什么 | 注释后的 token 算 loss：预测 Lean 会返回的状态（辅助目标），前面只当 prompt |
| ② CoT 与 tactic state 两个投喂机制分工 | CoT 管策略（先想数学再写 tactic），state 管感知（给搜索续写一个状态锚点） |
| ③ 为何不做一条 tactic 一验证 | 整证明生成便宜；出错后靠截断-续写补中间状态，两路线红利通吃 |
| ④ CoT/non-CoT 训练差异 | 同一模型、两种引导提示词；两模式在不同题上互补，最终 SOTA 靠对半混合 |
| ⑤ 截断为何截到最早报错 | 报错后代码建立在模型对状态的误判上；截断点之前每行都真实通过验证 |
| ⑥ 为什么一轮能长一条链 | 模型输出整段证明，通过验证的 tactic 逐段入树，信息零浪费 |
| ⑦ 节点为何存一组等价 tactic | 同状态多入口 → 续写更多样 → 更易撞出新状态，且省冗余生成 |
| ⑧ 搜索为什么可以回非叶节点 | 儿子集合外挂 ⊘（就地展开），生成式动作空间无固定上限 |
| ⑨ 「反馈用到探索上」最大障碍 | 内在奖励非平稳（随探索衰减）；用 DUCB（γ=0.99）给新反馈加权、旧反馈淡出 |
| ⑩ 指示函数式的内在奖励真能导出证明 | 消融：纯 UCT 61.1% / UCB1 变体 60.7% / 完整 RMaxTS 62.7%（16×6400），三件套缺一走弱 |
| ⑪ RL 的提升形态与自然语言任务有何不同 | DeepSeekMath 里 RL 主要抬 TopK 头部；形式化证明上是全预算区间整条曲线抬升（原文 2.4） |
| ⑫ RL 的 reward 是什么 | Lean 编译：通过 = 1，否则 = 0；prompt 专挑 SFT 模型中等成功率的题以抗稀疏 |
| ⑬ tactic state 信息被拿走会怎样 | 消融「without tactic state」：收益明显缩水（16×6400：61.1% vs 62.7%） |
| ⑭ 为什么这套搜索难得搞 | 外生奖励只在证明完成的窄叶子区非零；无内在奖励时 UCT 退化到访问计数驱动 |

---

## 一句话总括

**把 Lean 编译器的「通过/报错」反馈吃干抹净：SFT 时把 tactic state 注释接进数据让模型学会预测编译器的中间状态，RL 时用 Lean 验证当 GRPO 的二值 reward（RLPAF），推理时把整证明生成的报错截断点变成 MCTS 的枝干——每次 rollout 撞出新 tactic 状态就自赏（RMax 内在奖励），用折扣 UCB（γ=0.99）对抗衰减、让非叶节点也能被反复展开——单次采样把 miniF2F-test 从一代的 50.0% 抬到 60.2%，树搜索加混合提示词再抬到 63.5%。**

---

## 参考与延伸阅读

- [arXiv 摘要页（2408.08152）](https://arxiv.org/abs/2408.08152)
- [arXiv HTML 全文](https://arxiv.org/html/2408.08152v1)（本文所有数字均出自此版本原文）
- [官方 GitHub：deepseek-ai/DeepSeek-Prover-V1.5](https://github.com/deepseek-ai/DeepSeek-Prover-V1.5)
- [本篇词汇](../study/vocab/10_Prover-V1.5_论文词汇.html)
- [本篇听力](../study/listen/10_Prover-V1.5_单词听力.html)

