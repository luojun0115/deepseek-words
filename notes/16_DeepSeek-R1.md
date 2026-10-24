---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 16 · DeepSeek-R1 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [《DeepSeek-R1》论文解读（知乎）](https://zhuanlan.zhihu.com/p/20844750193) — 经典解读：R1-Zero 纯 RL（GRPO）直训思路
- [【论文解读】DeepSeek-R1：通过强化学习提升 LLM 推理能力（知乎）](https://zhuanlan.zhihu.com/p/19551355661) — 冷启动 + 多阶段训练全流程
- [论文精读：DeepSeek-R1 的「顿悟时刻」（知乎）](https://zhuanlan.zhihu.com/p/19727315310) — 两段式 RL、顿悟时刻与蒸馏小模型
- [DeepSeek 突然更新 R1 论文：暴增至 86 页（知乎）](https://zhuanlan.zhihu.com/p/1992643061826724743) — 新版论文首次披露的 RL 训练基础设施架构
- [DeepSeek-R1 论文解读及相关技术杂谈（pfcc 博客）](https://pfcc.blog/posts/swagger-deepseek-r1) — 长文精读，含「不成功的尝试」的梳理
- [DeepSeek-R1 万字解读（CSDN）](https://blog.csdn.net/xian_wwq/article/details/145454377) — Zero→R1→蒸馏全流程万字长文
- [DeepSeek-R1 技术三部曲详细解读（知乎）](https://zhuanlan.zhihu.com/p/24339006797) · [技术笔记含图解（知乎）](https://zhuanlan.zhihu.com/p/22112201320) → 这两篇质量较高
- [Medium: R1 与推理时扩容（Inference-Time Scaling）评述](https://medium.com/@saehwanpark/deepseek-r1-a-new-chapter-in-inference-time-scaling-for-reasoning-models-reviewing-deepseek-bae149ca88bc)

### 视频（B站 / YouTube）
- [B站] [DeepSeek-R1 深度解读，大模型+强化学习（ZOMI 酱）](https://www.bilibili.com/video/BV1dHw4e8E3e/) — 知名 B 站讲解者
- [B站] [读 R1 的训练过程《DeepSeek-R1》论文导读（LLM 张老师）](https://www.bilibili.com/video/BV1EmF9e6EdG) — 7.6 万播放，四阶段训练流程
- [B站] [【DeepSeek 系列】深度解读 DeepSeek-R1 论文](https://www.bilibili.com/video/BV1v1AseFExj/) — 按论文顺序逐节解读并补模糊点
- [B站] [EZ 撸 paper: R1 论文详解 part 1（比肩 OpenAI-o1）](https://www.bilibili.com/video/BV14dPfe5EJD) — 3.1 万播放，带独家分析
- [B站] [【精译】UmarJamil：DeepSeek-R1 论文详解](https://www.bilibili.com/video/BV1giFNe9E4k) — 经典英文教程的中英精译
- [YouTube] [李宏毅 2025 第七讲：R1 与推理模型](https://www.youtube.com/watch?v=bJFtcwLSNxI) — 权威课程讲解
- [YouTube] [R1 论文逐段精读 + 训练流程全解](https://www.youtube.com/watch?v=ZoC7OiBR09U)
- [YouTube] [DeepSeek-R1 Paper Explained（AI Papers Academy）](https://www.youtube.com/watch?v=DCqqCLlsIBU) — 去掉 SFT、纯 RL 激发推理
- [YouTube] [和 META 大佬一起 40 分钟解析 V3 + R1](https://www.youtube.com/watch?v=M9TzN-0Raz0) · [前微软工程师视角 R1 Explained](https://www.youtube.com/watch?v=r3TpcHebtxM)
- [B站] [中英双语：R1 理论概述 GRPO + RL + SFT](https://www.bilibili.com/video/BV158FzedEpp/)

### 英文 & 社区
- [Hugging Face 论文页](https://huggingface.co/papers/2501.12948) — 官方论文页与社区讨论
- [HF Open-R1 复现博客](https://huggingface.co/blog/open-r1) — HF 官方团队开源复现 R1 训练路线
- [HF LLM Course R1 章节](https://huggingface.co/learn/llm-course/en/chapter12/3) — Zero 与 R1 对比表清晰
- [AI Papers Academy 图文版](https://aipapersacademy.com/deepseek-r1/) — 英文入门精读
- [Reddit r/LocalLLaMA：R1-Distill 结果难以复现的讨论](https://www.reddit.com/r/LocalLLaMA/comments/1i7rank/claimed_deepseekr1distill_results_largely_fail_to/) — 批判性视角好素材
- [Reddit r/ML「无废话阅读单」](https://www.reddit.com/r/MachineLearning/comments/1ideupn/no_hype_deepseekr1_reading_list/) · [86 页新版论文讨论](https://www.reddit.com/r/MachineLearning/comments/1q6cb0k/r_deepseekr1s_paper_was_updated_2_days_ago/)

---

# DeepSeek-R1 完整流程：纯 RL「顿悟」、四阶段配方与蒸馏（含所有疑问点）

## 角色与核心思想

这篇论文其实讲了三个角色的三段故事：

- **R1-Zero**：拿 DeepSeek-V3-Base 直接做纯强化学习（GRPO + 规则奖励），**跳过 SFT**，看推理能力能不能自己「长」出来。结论：能，而且长出了人类没教过的反思、验证、换路线等策略——但代价是文本难读、中英文混杂。
- **DeepSeek-R1**：在 R1-Zero 的经验上加一个四阶段配方（cold start SFT → 推理导向 RL → 拒绝采样再造 800K 数据 SFT → 全场景 RL），把推理和「像人一样好读」同时拿到。
- **Distill 系列**：把 R1 生成的 800K 样本拿去 SFT 更小的 Qwen / Llama 底座（纯 SFT、没有 RL），1.5B 的小模型在数学上反超 GPT-4o。

整套推演里「动」的东西只有一个：**策略模型 π_θ（参数向量）**。奖励验证器、语言统计、奖励模型都只负责给它打分。产出的是三样东西：R1-Zero（证明纯 RL 有效）、R1（证明配方可行）、蒸馏系列（证明能力可搬运）。

```
DeepSeek-V3-Base
   │  纯 RL：GRPO + 规则奖励（跳过 SFT）
   ▼
DeepSeek-R1-Zero  （推理强：AIME 15.6%→77.9%；但难读 + 语言混杂）
   │  ① cold start：数千条「可读长 CoT」SFT
   ▼
R1-Dev1           （IF-Eval 46.6→71.7；AIME 77.9→59.0 暂时掉）
   │  ② 推理导向 RL（+ 语言一致性奖励）
   ▼
R1-Dev2           （AIME 回到 74.0，Codeforces 评分 1444→1687）
   │  ③ 拒绝采样生成 800K 数据（60 万推理 + 20 万非推理）再 SFT
   ▼
R1-Dev3           （Aider-Polyglot 25.6→44.8，通场任务起来了）
   │  ④ 全场景 RL（规则奖励 + 两个奖励模型）
   ▼
DeepSeek-R1       （AIME 79.8 ≈ o1-1217 的 79.2）
   │
   └─ 800K 样本蒸馏出 6 个学生：Qwen 1.5B/7B/14B/32B、Llama 8B/70B
```

（Dev1/Dev2/Dev3 是论文明确命名的中间检查点，阶段对照表见原文表 3。）

---

## 主干 A：R1-Zero 的一次 GRPO 训练步（照着推一遍）

### A.0 训练前的全部设定（原文表 1、原文 §2.1-2.2）

```
起点模型   : DeepSeek-V3-Base（671B MoE，37B 激活，预训练无任何合成数据）
提示模板   : 只有一个格式要求——
             "<think> 推理过程 </think> <answer> 答案 </answer>"
             （除此之外不教任何推理方法，"避免内容层面的偏置"）
RL 算法    : GRPO（组相对策略优化）
奖励       : Reward_rule = Reward_acc + Reward_format（两项等权，原文式(4)）
超参       : 学习率 3e-6，KL 系数 0.001，采样温度 1
每题采样   : 16 条输出；最大长度 8.2k 步前 32768 tokens，之后 65536 tokens
训练量     : 10,400 步（约 1.6 个 epoch）；每步 32 道不同题 → 批大小 512
参考模型   : 每 400 步刷新为当前策略
rollout 加速: 每次 rollout 生成 8192 条输出，随机切 16 个 minibatch，只训 1 个内 epoch
```

### A.1 第 1 步：采样（rollout，贵，串行生成）

当前策略模型对一批题目各吐 16 条完整回答（含 `<think>` 全文）。这道题是 AIME 风格的：

```
q: √(a−√(a+x)) = x 的所有实根之和……
o₁: <think>设两边平方…则 a−√(a+x)=x²… </think> <answer>…</answer>
o₂: <think>两边平方…略</think> <answer>…</answer>   ← 后半段会和 o₃ 很像
o₃: （同上，正确）
…
o₁₆: <think>…权当方向就不对</think> <answer>错</answer>
```

模板没教「怎么推理」，只圈了个格式框。这一步的 16 条回答全是模型自己现想的。

**疑问点①：为什么敢跳过 SFT，直接让一个没见过对话格式的 base 模型做 RL？**
论文的假设原话是：人类定义的推理模式可能限制模型探索，SFT 的监督目标是模仿人写的回答，而人写的回答往往省略反思、验证这些关键步骤（原文附录 A.2）。RL 允许模型自由探索出非人类式的推理路径。赌注：base 模型只要能偶尔吐出 `<think>` 标签和正确答案，奖励信号就存在；其余交给优化。

**疑问点②：奖励怎么打？数学答案和代码怎么判对错？**
全是规则，不含神经网络（原文 §2.2）：数学题要求把最终答案放进指定格式（如 `\boxed{}`），答案与标准答案比对，对 1 分错 0 分；代码题用编译器跑一组预置测试用例，全过得分。格式奖励只检查 `<think></think>` 标签是否规范。**故意不用神经奖励模型**——作者观察到大规模 RL 下神经 RM 会被「破解」（reward hacking），而且重训 RM 又贵又把流水线搞复杂。

### A.2 第 2 步：组内算优势（不碰模型，纯算术）

GRPO 的核心一招：**16 条回答互相当参照系，不需要价值网络**。

```
r₁..r₁₆ = 16 条回答的规则奖励（如 1 分 / 0 分）
Aᵢ = (rᵢ − mean(r₁,…,r₁₆)) / std(r₁,…,r₁₆)        （原文式(3)）
```

比如这道题 16 条里 8 条对 8 条错：对的那条 A>0（被鼓励），错的 A<0（被抑制）。一道全员答对的题，所有 r 相同 → 优势全为 0，没有梯度（这是公式(3)的直接推论，论文未展开，但等于这道题这一步「白跑」——所以题目难度必须和模型能力匹配）。

**疑问点③：PPO 明明能用，为什么要另造 GRPO？**
三个理由，全在原文附录 A.3：
1. **省一个价值模型**。PPO 的价值模型通常和策略一样大，显存和计算双倍开销；而且价值模型的任务是「看到一半的长 CoT 就预测最后的奖励」——长推理里前文常被后文推翻，这个预测本质上做不好。
2. **KL 的加法方式不同**。PPO 把每 token 的 KL 当成逐 token 的稠密奖励加进信号，惩罚的是 KL 累计和，隐含地也在惩罚长回答；GRPO 把 KL 的无偏估计量（k₃ 式，原文式(2)）直接加在损失里。做长 CoT 训练时这个差别致命——你想让回答变长，PPO 的写法在跟你作对。
3. 实测（原文图 4，DeepSeek-Coder-V2-Lite）：PPO 的 GAE 系数 λ 需要精调才能接近 GRPO，λ 取开源实现的默认 0.95 时明显更差。GRPO 少整定参数、少一个模型。

但 GRPO 仍保留 KL 项和安全带：每 400 步把参考模型刷新成最新策略——因为要训几千步，策略离初始参考会非常远，定期刷新是在「探索范围」和「训练稳定」之间平衡（原文附录 A.3）。

### A.3 第 3 步：策略更新（唯一的梯度计算）

对 16 条回答逐条算重要性比率并裁剪（ε 取大裁剪，第一阶段 RL 实验里 ε=10）：

```
ρᵢ = π_θ(oᵢ|q) / π_old(oᵢ|q)
J_GRPO(θ) = E[ (1/G)·Σᵢ min( ρᵢ·Aᵢ , clip(ρᵢ, 1−ε, 1+ε)·Aᵢ ) − β·D_KL(π_θ‖π_ref) ]
```

**疑问点④：ε=10？正常 PPO 才 0.2 左右，裁剪带放大 50 倍不失控吗？**
论文明确说裁剪比「起关键作用」（原文 §3.2.1）：取小了会截断大量 token 的梯度、损害性能；取大了训练不稳。10 是他们试出来的中间值——跨步的绝对步长控制交给 KL 项和参考模型定期刷新，clip 只防「单步狂奔」。这也是核心作者 Zhibin Gou 提出的「大幅 PPO 裁剪策略」（原文第 7 节作者贡献表）。

### A.4 第 4 步：同一循环跑 10,400 步之后发生了什么

- **AIME 2024 pass@1 从 15.6% 一路涨到 77.9%**；用 16 选多数的 self-consistency 还能到 86.7%，超过人类参赛者平均分（原文 §2.3、图 1a）。
- **平均回答长度自发稳步上升**（图 1b）：没人奖励「长」，但更长的反思确实更能答对，于是被优势信号间接选中。
- **反思词汇频率上升 5~7 倍**（wait / however / verify / retry 等，33 位人类专家先列词表再统计，附录 C.2a）。
- **「wait」在约 8,000 步后突然飙升**（附录 C.2b：前期几乎为零，4000–7000 步偶发，之后大涨）——「aha moment」的直接量化证据。
- 8.2k 步处有一次跳变：该步把最大长度从 32768 提到 65536，性能与回答长度同步跳升（原文 §2.1 明说如此）。

**疑问点⑤：「Aha moment」到底是模型的什么换挡？**
原文表 2 的完整样例是一道二次根号套娃题：模型先正常解，随后冒出 "Wait, wait. Wait. That's aha moment I can flag here."，然后**推翻重来、逐步重估**。机制上这不是 mystical 事件：反思（先写错的路径再纠正）在纯结果奖励下能提高最终正确率 → 优势为正 → 这个行为模式被强化 → 在训练中期样本里集中涌现。论文也特意提醒：这类「俨然像人」的模式是 DeepSeek 工程选择的产物，不代表模型真有类人智能（ cold start 一节原文声明）。

**疑问点⑥：那为什么不用 PRM（过程奖励）或 MCTS 把「反思」显式教给它？**
试过，都失败了（原文附录 G.2）：PRM 三大难——通用推理里「一步」难定义、中间步对错难判、模型打的分必然被 hack 且重训 RM 又贵；MCTS 在围棋里好使是因为搜索空间有限，token 生成空间呈指数级，节点扩展上限导致陷入局部最优，细粒度价值模型也训不好。所以选择「结果奖励 + 完整输出」这种最笨但最可靠的做法。

---

## 主干 B：从 R1-Zero 到 R1 的四阶段配方（每阶段一个 why）

R1-Zero 的两个硬伤（原文 §1、§3）：**可读性差、单条 CoT 里中英文混杂**（V3-Base 预训练语料以中英为主）；且规则奖励只覆盖可验证任务，写作、开放问答拉胯（IF-Eval 只有 46.6、AlpacaEval 24.7，原文表 3）。四阶段每一步都在修一个具体的洞。

### 阶段① cold start SFT：几千条「好看的 CoT」（修格式与可读性）

制作流程（原文附录 B.3.2，全文最抠细节的一段）：

```
1. 收集数千条多样推理题
2. 用 R1-Zero 以温度 1.0 每题采多条轨迹
3. 过滤：答案正确 + 格式可读（sympy 解析数学、检测重复段、语言混杂过滤）
4. 人肉把 R1-Zero 的原始推理改写成「自然对话风」
5. 改写后的样本当 few-shot 例子，让 LLM 照着风格继续改写
6. 所有 LLM 产出再做第二轮人工质检
7. 语言混杂直接用模板修："把思考过程翻译成与问题相同的语言"
```

**疑问点⑦：几千条样本能干嘛？推理又没变强，是不是白训？**
目的不是教推理，是把「格式这种琐碎要素」从 RL 的探索空间里摘出去：成为 RL 起点前模型已经稳定输出第一人称、语言一致、段落实简的可读 CoT，RL 从此只需优化答案质量。代价确实存在——冷启动数据量小，Dev1 的 AIME 从 77.9 掉到 59.0、GPQA 从 75.8 掉到 66.1（原文表 3，论文原话：因数据有限推理性能暂时部分回退），但换来了 IF-Eval 46.6→71.7。**用短期的推理下滑买可读的初始化。**

### 阶段② 推理导向 RL：重新把推理推上去 + 顺带治语言混杂

沿用 R1-Zero 配方（lr 3e-6、KL 0.001、ε=10、16 采样、32768 长度、400 步刷参考模型），新增一项**语言一致性奖励**：

```
Reward_language = Num(Words_target) / Num(Words)      （目标语言词占比，原文式(7)）
Reward = Reward_reasoning(rule) + Reward_language
```

**疑问点⑧：为一图可读性去奖励「说不说英文」，不亏吗？**
消融实验（原文附录 B.6，在同样用 cold start 数据的 R1-Distill-Qwen-7B 上做）：不加 LC 奖励，语言一致性随步数持续恶化；加了之后全程稳定。基准上数学持平、代码略降。作者的定论就是「性能略降换人偏好对齐」——一项明码标价的交易。注意治标不治本：R1 对中英以外语言仍有「自顾自用英文推理」的问题（原文第 6 节 Limitation，归因到底模 V3-Base 中英语料为主）。

### 阶段③ 拒绝采样 + 再 SFT：造 80 万条数据「一次补齐」

这一步最容易看漏的要害是：**新 SFT 数据不是新的标注，而是第一阶段 RL 模型的产物**（原文附录 B.3.3）。

- **60 万推理样本**：从第一阶段 RL 的检查点上做拒绝采样（每题多采、只留对的），部分用生成式 RM（把标准答案和模型答案一起喂 DeepSeek-V3 当裁判，判 correct/incorrect）；同时**过滤掉语言混杂、超长段落、代码块**这些会让 SFT 学坏了的 CoT。
- **20 万非推理样本**：复用 DeepSeek-V3 的 SFT 数据管线（写作、事实问答、自认知、翻译），另加软件工程数据（程序修复、前端开发）；部分任务带 CoT，简单问题（如 "hello"）不带。
- 思考风格全按产品原则合成：段落短、语气像聊天、不用 markdown、**先理解用户完整语境（含没说出口的需求）再答**。
- SFT 落地（原文表 5 / B.4.2）：共 804,745 条、平均轮数 1.0、平均 5355 tokens（数学 395,285 条均 6094 tokens，代码 211,129 条均 7436 tokens，写作类 177,812 条均 1420 tokens）；微调 V3-Base 2–3 个 epoch，lr 5e-5 余弦降到 5e-6，batch 128，上下文 32768。

**疑问点⑨：为什么是「再 SFT」而不是直接再 RL？SFT 不是开头被批评的对象吗？**
不冲突。开头反对的是「用人写的推理轨迹当 RL 前的初始化」；这里 SFT 的角色变了——素材是**模型自己在 RL 中摸索出的推理路径**，作者原话（附录 A.2）：把自探索出的轨迹再蒸馏回模型，能让推理更稳、更泛化。而且 SFT 一次性喂 80 万条混合数据，能把「推理强人」的模式平均铺到非推理任务上，RL 硬凑这个高成本又不稳（不可验证任务没有可靠奖励信号）。Dev3 的 Aider-Polyglot 从 25.6 跳到 44.8 就是加非推理语料和代码工程数据带来的（原文第 4 节）。

### 阶段④ 全场景 RL：最后把「乐意」对齐

规则奖励（数学/代码/逻辑）照旧 + 两个神经奖励模型：helpful RM（66,000 对偏好对，用 V3-arena 格式 4 次判断取平均，Δ>1 才留，水位偏好对长度均检对齐）和 safety RM（106,000 条 safe/unsafe 标注，point-wise），第二个 RL 共 **1,700 步，温度降到 0.7**（高温下生成不连贯），**偏好奖励只在最后 400 步加入**（原文 §3.2.2）。

**疑问点⑩：为什么 helpful/safety RM 要晚 1300 步才进场？**
论文原话：用模型类偏好奖励信号步数太多会导致 reward hacking——附录 B.5 的实测图更狠：RM 分数一直上升，CodeForces 成绩在同步下滑。可验证任务的奖励不会被破解，所以推理训练全押规则奖励；一般任务没有可靠验证器，RM 只能在小剂量下短期使用（他们只训了几百步）（原文第 6 节也承接这一点：无法可靠评价的任务，纯 RL 放大现在就是开放难题）。
Dev1→R1 的最终成绩总体变化不大（AIME 78.1→79.8），增幅主要落在 AlpacaEval 2.0（62.1→87.6，+25）与 ArenaHard（75.6→92.3，+17）——最后 400 步在修的就是这些（原文第 4 节）。

### 四阶段收完的效果对照（原文表 3、表 8，节选）

| 阶段 | AIME 2024 | IF-Eval | AlpacaEval | Codeforces 评分 |
|---|---|---|---|---|
| R1-Zero | 77.9 | 46.6 | 24.7 | 1444 |
| Dev1（cold start） | 59.0 | 71.7 | 50.1 | 1534 |
| Dev2（推理 RL） | 74.0 | 72.0 | 55.8 | 1687 |
| Dev3（80 万 SFT） | 78.1 | 78.1 | 62.1 | 1746 |
| R1（全场景 RL） | 79.8 | 83.3 | 87.6 | 2029 |
| （对照）o1-1217 | 79.2 | — | — | 2061 |

最终 R1 拿到 MMLU 90.8、MATH-500 97.3、MMLU-Pro 84.0、GPQA-Diamond 71.5、LiveCodeBench 65.9、Codeforces 胜过 96.3% 的人类（原文表 8 / 图 10）。

---

## 主干 C：蒸馏——1.5B 为什么能反超 GPT-4o？

### C.1 蒸馏只有一句话配方

拿 R1 生成的 800K 样本（阶段③那批），直接 SFT 到开源底座上，**不跑 RL**（原文附录 F 明说是有意为之，是为了先验证蒸馏本身；留给社区后续做 RL）。超参（B.4.3 / 表 6）：2–3 epoch、余弦衰减到初始 lr 的 1/10、batch 64、上下文 32768。六个学生和底座：

| 学生 | 底座 |
|---|---|
| Distill-Qwen-1.5B | Qwen2.5-Math-1.5B |
| Distill-Qwen-7B | Qwen2.5-Math-7B |
| Distill-Qwen-14B / 32B | Qwen2.5-14B / 32B |
| Distill-Llama-8B | Llama-3.1-8B |
| Distill-Llama-70B | Llama-3.3-70B-Instruct |

### C.2 成绩单（原文表 15）

| 模型 | AIME 2024 pass@1 | AIME cons@64 | MATH-500 | GPQA | LiveCodeBench | Codeforces |
|---|---|---|---|---|---|---|
| GPT-4o-0513 | 9.3 | 13.4 | 74.6 | 49.9 | 32.9 | 759 |
| Claude-3.5-Sonnet-1022 | 16.0 | 26.7 | 78.3 | 65.0 | 38.9 | 717 |
| Distill-Qwen-1.5B | 28.9 | 52.7 | 83.9 | 33.8 | 16.9 | 954 |
| Distill-Qwen-32B | 72.6 | 83.3 | 94.3 | 62.1 | 57.2 | 1691 |
| Distill-Llama-70B | 70.0 | 86.7 | 94.5 | 65.2 | 57.5 | 1633 |

论文原话：1.5B 这种小模型在数学基准上超过了最好的闭源模型之一（GPT-4o），规模越大成绩越好。

**疑问点⑪：1.5B 反超 GPT-4o，靠的是什么魔法？**
不是参数量大变出可能性，而是三件事的叠加：底座本身是数学特化模型（Qwen2.5-Math-1.5B）；学的东西不是「答案」，是**一整套 RL 涌现出的长 CoT 行为模式**（先反思、再验证、再换路）——这些模式被 R1 自己「示范」在 800K 样本里，SFT 直接把行为抄走；而 GPT-4o 是非推理模型，没有这套行为。差距不是「数学知识」，是「解题姿势」。

### C.3 顺手做了个对照实验：小模型自己 RL 拼不拼得过蒸馏？（原文表 16 / F.1）

| 模型 | AIME 2024 | cons@64 | MATH-500 | GPQA | LiveCodeBench |
|---|---|---|---|---|---|
| QwQ-32B-Preview | 50.0 | 60.0 | 90.6 | 54.5 | 41.9 |
| Qwen2.5-32B-Zero（纯 RL 10K 步） | 47.0 | 60.0 | 91.6 | 55.0 | 40.2 |
| Distill-Qwen-32B | 72.6 | 83.3 | 94.3 | 62.1 | 57.2 |

结论原文两条：① 把更强模型蒸馏进小模型效果极好；而小模型自己上大规模 RL，算力花费巨大还可能达不到蒸馏的效果。② 蒸馏便宜但它学的只是老师教的东西，**想突破人类智慧边界，还是得靠更强的底座 + 更大规模 RL**。附加实验：让 Qwen2-Math-7B 也纯 RL 训到底（约 10,000 步得到 Qwen2-Math-7B-Zero），AIME 2024 到 22.3%，超过 Instruct 版 7.9% 和 GPT-4o 的 9.3%——小模型纯 RL 也能冒头，但性价比输给了直接抄 R1 的作业（原文表 17）。

---

## 关键数字与实验

| 指标 | 数字 | 出处 |
|---|---|---|
| R1-Zero AIME 2024 pass@1 训练曲线 | 15.6% → 77.9%（cons@16 86.7%） | 原文 §2.3 图 1a |
| 反思词频涨幅 | 训练全程升 5–7 倍；「wait」约 8,000 步后飙升 | 附录 C.2 图 9ab |
| 长度上限跳变点 | 8.2k 步（32768 → 65536 tokens） | 原文 §2.1 |
| MATH 分级进步 | L4 0.78→0.95，L5 0.55→0.90 | 附录 C.1 |
| cold start 数据 | 数千条（R1-Zero 温度 1.0 采样→人工+LLM 双轮改写） | 附录 B.3.2 |
| 800K SFT 构成（总 804,745 条） | 推理约 60 万，非推理约 20 万 | 附录 B.3.3 |
| 蒸馏底座 | Qwen2.5-Math-1.5B/7B、Qwen2.5-14B/32B、Llama-3.1-8B、Llama-3.3-70B-Instruct | 附录 B.4.3 表 6 |
| R1 成本 | 64×8 H800：R1-Zero 约 198 小时（101K GPU 时，$202K），R1 约 80 小时（41K GPU 时，$82K），加建 SFT 数据 5K（$10K），总 147K GPU 时 / $294K | 附录 B.4.4 表 7 |
| R1-Zero 超参 | lr 3e-6、KL 0.001、每题 16 样、10,400 步、每步 32 题、batch 512、400 步刷参考模型 | 原文 §2.1 |
| 阶段② RL 新增 | 语言一致性奖励（目标语言词占比，式(7)；数学持平、代码略降） | §3.2.1、附录 B.6 |
| 阶段④ RL | 1,700 步、温度 0.7、偏好奖励只进最后 400 步（再训会 reward hacking） | §3.2.2、附录 B.5 |
| R1 最终（对照 o1-1217） | AIME 79.8（o1: 79.2）、MATH-500 97.3（96.4）、GPQA 71.5（75.7）、Codeforces 评分 2029（2061） | 表 8 |
| 1.5B 蒸馏 vs GPT-4o | AIME 28.9 vs 9.3；MATH-500 83.9 vs 74.6 | 表 15 |

## 全局数据流总表

| 步骤 | 谁在动 | 产出 | 代价（原文数） |
|---|---|---|---|
| ① R1-Zero 纯 RL | V3-Base + GRPO + 规则奖励 | 推理能力涌现，但难读/混杂 | 101K H800 GPU 时（$202K） |
| ② cold start SFT | 人改写 + LLM 批量改写 | 数千条可读长 CoT | 人工 + 「5K GPU 时造数据」内 |
| ③ 推理 RL | Dev1 + 语言一致性奖励 | Dev2（AIME 74.0） | 含在下项 |
| ④ 拒绝采样 | Dev2 自采样 + 人审 | 800K 样本 | 5K GPU 时（$10K） |
| ⑤ 二次 SFT | V3-Base + 800K 数据 | Dev3 | （计在 R1 一项） |
| ⑥ 全场景 RL | Dev3 + 规则奖励 + 2 个 RM | DeepSeek-R1 | 41K GPU 时（$82K） |
| ⑦ 蒸馏 | 800K 样本 SFT 进 6 个小底座 | 1.5B~70B 学生模型 | 原文未单列 |

## 所有疑问点速查

| 疑问 | 答案 |
|---|---|
| 为什么 RL 前不 SFT？ | 人类的推理示范会限制探索、缺反思/验证步；奖励只看结果，探索更自由（附录 A.2） |
| GRPO 为什么每题采 16 条一起打分？ | 组内均值/方差当基线，A=(r−mean)/std，不需要价值网络（式(3)） |
| 为什么不用 PPO？ | 价值模型既贵又难在长 CoT 下预测最终奖励；PPO 逐 token 加 KL 隐含惩罚长度；实测调不好还更差（附录 A.3 图 4） |
| 不用神经奖励模型？ | 大规模 RL 中会被 hack，重训 RM 又贵又复杂（§2.2） |
| 全组全对/全错时怎么办？ | 优势为 0、无梯度，这题这一步没有信号（式(3)推论），需要题目难度覆盖面广 |
| ε 裁剪为什么取 10？ | 太小截断梯度损性能，太大训练不稳；步长控制交给 KL + 400 步刷参考 | 
| Aha moment 是什么？ | 反思模式因「能涨分」被结果奖励间接强化；wait 词频 8000 步后飙升（表 2、附录 C.2） |
| 几千条 cold start 有什么用？ | 修格式与可读性；推理暂时回退（AIME 77.9→59.0）做交换（表 3） |
| 语言一致性奖励亏不亏？ | 数学持平、代码略降，换人可读性（附录 B.6）；治不好中英以外语言 |
| 为什么 80 万条数据再 SFT？ | 就是把模型自探索出的轨迹蒸馏回去更稳；非推理任务靠 SFT 补齐 |
| helpful/safety RM 为何只进最后 400 步？ | RM 类信号训多了会 reward hacking（B.5：RM 分升、CodeForces 降） |
| 为什么不用 PRM/MCTS？ | 三个都败于人手不好定义、标注难、会被 hack / 嵌形搜索空间指数级、价值模型训不好（G.2） |
| 1.5B 凭什么超 GPT-4o？ | 抄的是 R1 RL 涌现的「长 CoT 行为」示范，加上数学特化底座；只 SFT 不 RL |
| 小模型自己 RL 行不行？ | 能练出（Qwen2-Math-7B-Zero 22.3% vs GPT-4o 9.3%），但比不上蒸馏，性价比差（表 16-17） |

## 一句话总括

**推得动这篇的全部燃料是「可验证奖励」四字**：R1-Zero 证明一条纯 RL 條（GRPO + 结果奖励 + 不需 SFT）就能让 base 模型自发长出反思、验证、长 CoT——顺手长出来的还有语言混杂和难读；R1 用四阶段（cold start 修可读、推理 RL 恢复推理、80 万 samples 自蒸馏 SFT 补齐通场、末段 RM RL 对齐偏好）把两个目的同时拿到，代价是全流程 147K H800 GPU 时（$294K）；蒸馏一招把 R1 的 800K 输出挺进 1.5B 的参数量，AIME 28.9 反超 GPT-4o，但有奶嘴限制——想突破人类边界仍然只能回到「更大模型 + 更大 RL」那条路。

---

## 参考与延伸阅读

- [arXiv 摘要页](https://arxiv.org/abs/2501.12948)（v2，2026-01-04 修订；正式版见 Nature 645, 633–638, 2025）
- [arXiv HTML 全文（v2）](https://arxiv.org/html/2501.12948v2)（本笔记全部数字均抄自此版）
- [官方 GitHub DeepSeek-R1 使用指南](https://github.com/deepseek-ai/DeepSeek-R1)
- [HuggingFace deepseek-ai 模型集合](https://huggingface.co/deepseek-ai)（R1 / R1-Zero / 6 个 Distill 权重）
- 本站配套：[16_DeepSeek-R1 论文词汇页](../study/vocab/16_DeepSeek-R1_论文词汇.html) · [16_DeepSeek-R1 单词听力页](../study/listen/16_DeepSeek-R1_单词听力.html)

