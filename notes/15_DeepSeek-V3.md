---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 15 · DeepSeek-V3 学习笔记
pageClass: note-page
---


[DeepSeek-V3 技术报告详细解读-1](https://www.bilibili.com/video/BV1WYFQeGEf1/)



[DeepSeek-V3 技术报告详细解读-2](https://www.bilibili.com/video/BV1HqFQezEMt)

mla  旋转编码

[DeepSeek-V3 论文中的隐藏细节](https://www.bilibili.com/video/BV15XFQebEBM)

moe
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [解读 DeepSeek-V3 技术报告（知乎）](https://zhuanlan.zhihu.com/p/20691073152) — 逐段解读设计、训练方法与性能
- [DeepSeek-V3 论文解读（知乎）](https://zhuanlan.zhihu.com/p/14988009150) · [4 万字超详细解读（知乎）](https://zhuanlan.zhihu.com/p/22985118565) · [架构深度解析（知乎）](https://zhuanlan.zhihu.com/p/1983605109255599552) — 三篇高质量中文图文
- [DeepSeek-V3 技术解析：MLA 专篇（OSCHINA）](https://my.oschina.net/IDP/blog/17943880) — MLA 低维潜在向量压缩细节
- [PyImageSearch: DeepSeek-V3 from Scratch 系列（6 篇）](https://pyimagesearch.com/2026/03/09/deepseek-v3-model-theory-config-and-rotary-positional-embeddings) — 最全代码级实现系列：RoPE、MLA、MoE（无辅助损失均衡）、MTP、完整架构
- [Stable-Learn: DeepSeek-V3 深度分析合集](https://stable-learn.com/en/tags/deepseek-v3) — 英文长文合集：MLA+MoE+FP8+MTP 与训练成本全景
- [Martin Fowler: The DeepSeek Series](https://martinfowler.com/articles/deepseek-papers.html) — 全系列综述，含本篇

### 视频（B站 / YouTube）
- [YouTube] [DeepSeek 完整走查（含 MLA/MoE/MTP/FP8 时间戳）](https://www.youtube.com/watch?v=8v2l6SJECW4) — 最著名的英文完整走查
- [YouTube] [DeepSeek V3: The GPT-4 Killer?](https://www.youtube.com/watch?v=ypxtz3I6xvo) — 逐节拆解架构、SFT、基准与价格
- [YouTube] [DeepSeek-V3 Technical Report (Dec 2024)](https://www.youtube.com/watch?v=u3OuPKY-6_c) — 按报告原文顺序的学术向解说
- [YouTube] [What is DeepSeek? Mixture of Experts](https://www.youtube.com/watch?v=0sW-oWuHxX4) — 671B→37B 激活、MLA 与无辅助损失负载均衡
- [B站] [DeepSeek 系列论文解读 1【V3】【R1】](https://www.bilibili.com/video/BV18iNBehEwq/) — V3&R1 系列解读
- [B站] [【闪客】深入解读 DeepSeek V1~V4](https://www.bilibili.com/video/BV1rpovBCEGH/) — V3 在演进长片中的位置

### 英文 & 社区
- [Hugging Face 论文页](https://huggingface.co/papers/2412.19437) — 社区讨论最热，89 篇相关文章收录
- [GitHub 官方仓库 deepseek-ai/DeepSeek-V3](https://github.com/deepseek-ai/DeepSeek-V3) — README 即官方详解（架构亮点、MTP 权重、本地部署）
- [Emergent Mind：DeepSeek-V3 专题](https://www.emergentmind.com/topics/deepseek-v3) — 无辅助损失均衡公式、MTP、FP8 训练与基准全拆解
- [Moonlight 文献综述页](https://www.themoonlight.io/en/review/deepseek-v3-technical-report) — 一句话抓核心贡献 + AI Viewer 精读
- [alphaXiv 论文页](https://www.alphaxiv.org/abs/2412.19437) — 社区讨论与音频摘要
- [Reddit r/LocalLLaMA: DeepSeek V3 "is the shit"](https://www.reddit.com/r/LocalLLaMA/comments/1huq6z0/deepseek_v3_is_the_shit/) — 发布时社区热议


# 15 · DeepSeek-V3 精读笔记

## ① 论文身份卡

| 项 | 值 |
|----|----|
| 标题 | DeepSeek-V3 Technical Report |
| 机构 / 团队 | DeepSeek-AI（深度求索，杭州）· 199+ 位署名作者 |
| 发布 | 2024-12-26 官方发布并开源；arXiv v1 2024-12-27，v2 修订 2025-02-18 |
| 链接 | [arXiv 摘要](https://arxiv.org/abs/2412.19437) · [HTML 全文](https://arxiv.org/html/2412.19437) · [GitHub](https://github.com/deepseek-ai/DeepSeek-V3) · [HuggingFace](https://huggingface.co/deepseek-ai/DeepSeek-V3) · [官方发布页](https://www.deepseek.com/news/deepseek-v3/) |
| 规模 | 总参数 671B，每 token 激活 37B；预训练 14.8T tokens；上下文 4K 训练 → YaRN 两阶段扩展至 128K |
| 训练成本 | 全程 2.788M H800 GPU 小时（预训练 2.664M + 上下文扩展 119K + 后训练 5K） |
| 关键词 | MoE · MLA · 无辅助损失负载均衡 · MTP · FP8 训练 · DualPipe · R1 蒸馏 |

## ② 定位与动机

DeepSeek-V3 不是推倒重来，而是**把 DeepSeek-V2 已验证的两大架构（MLA + DeepSeekMoE）作为地基，在其上解决三个新问题**：

1. **负载均衡损失与模型性能的矛盾**——传统 MoE 靠辅助损失（auxiliary loss）逼路由均匀，但辅助损失权重调大伤性能、调小不管用，V3 首创"无辅助损失"方案（bias 动态调节）；
2. **训练信号不够密**——只预测下一个 token 信号稀疏，V3 引入多 token 预测（MTP）目标；
3. **成本与稳定性**——目标是在**不牺牲性能的前提下**把一次完整训练压到 2.788M H800 GPU 小时，并且全程不发生不可恢复的 loss spike、不回滚（原文摘要）。

外部对照：发布时（2024-12）开源阵营与 GPT-4o / Claude-3.5-Sonnet 仍有肉眼可见差距；官方定位是"多项评测超越 Qwen2.5-72B、Llama-3.1-405B，与 GPT-4o、Claude-3.5-Sonnet 不分伯仲"（官方发布页）。

## ③ 核心贡献（5 条）

1. **架构**：在 V2 的 MLA + DeepSeekMoE 上首创**无辅助损失负载均衡**（bias 修正），并引入 **MTP 训练目标**（还可用于推理投机解码）——原文贡献 1；
2. **预训练效率**：**FP8 混合精度训练**首次在超大规模模型上验证可行；DualPipe 流水 + 跨节点 All-to-All 定制 kernel + 节点受限路由，实现近乎完全的计算-通信重叠——原文贡献 2；
3. **后训练**：从 DeepSeek-R1 系列向 V3 **蒸馏推理能力**（验证/反思机制注入，同时控制输出风格与长度）——原文贡献 3；
4. **结果**：14.8T token 预训练 + SFT + RL 后，**开源最强、对齐当时顶级闭源**（官方发布页与原文摘要）；发布时生成速度 20→60 TPS（较 V2.5 提升 3 倍，官方发布页）；
5. **稳定性与透明度**：全程无不可恢复 loss spike、无回滚；开源原生 FP8 权重与完整技术报告。

## ④ 方法精读

> 本章按论文原公式编号（式 1–28）逐条讲解：先给"论文怎么写"（纯文本复刻），再回答"为什么这样设计"。超参数以原文 §4.2 为准——此前依赖二手转引的行已用 arXiv HTML 原文逐项校正。

### 4.0 总架构（一张图）

```
（与原文 §2.1 / §4.2 对齐）
输入 token
   ↓ Embedding（词表 129280 × 隐藏维 7168，Byte-level BPE 128K，§4.1）
┌─ Layer 0–2   MLA + Dense FFN（中间维 18432）      ← 前 3 层 dense
├─ Layer 3–60  MLA + MoE                            ← 后 58 层 MoE
│     ├ 共享专家 ×1（所有 token 必经，承接通用知识）
│     ├ 路由专家 ×256，每 token 选 8（sigmoid 打分 + bias 修正选择）
│     └ 节点受限路由：每 token 最多跨 M=4 个节点
├─ MTP 模块 ×1（深度 D=1，与主干共享 embedding 与输出头）
   ↓ Final RMSNorm → LM Head（7168 → 129280）→ 采样
（共 61 层 Transformer；总参数 671B，每 token 激活 37B，§4.2）
```

训练时的并行部署（原文 §3.2）：**PP=16（DualPipe）+ EP=64（跨 8 节点，每层 256 个路由专家均布在 64 张卡上）+ ZeRO-1 DP，全程不用 TP**——省掉 TP 通信靠的是显存侧的极限优化（见 §4.8），这是 671B 模型能用 2048 张 H800、2.788M GPU 小时训完的前提之一。

关键超参（原文 §4.2 一手口径；与此前走读/徐天乐转引一致）：

| 参数 | 值 | 参数 | 值 |
|------|----|------|----|
| 层数 | 61（前 3 层 dense） | 隐藏维 | 7168 |
| 注意力头 n_h | 128（每头 d_h=128） | Q 压缩维 d_c' | 1536 |
| KV 压缩维 d_c | 512 | 解耦 RoPE 每头维 d_h^R | 64 |
| 路由 / 共享专家 | 256 / 1 | 每 token 激活路由专家 K_r | 8 |
| 专家中间维 | 2048 | Dense FFN 中间维 | 18432 |
| 专家分组 / 选组 | 8 组 / 选 4 组 | 路由缩放因子 | 2.5 |
| 参数初始化 | 正态分布 std=0.006 | MTP 深度 D | 1 |

（"专家分组 8 选 4"与 routed_scaling_factor=2.5 来自 transformers 配置，经推理走读一文转引；其余各行均见原文 §4.2。另注意两个"隐藏开关"：压缩 latent 后额外加 RMSNorm、宽度瓶颈处乘额外缩放因子——写在超参节而非架构节，是复现时最容易漏的细节。）

### 4.1 MLA 逐式精讲（原文式 1–11）

**符号与 V3 取值**（§4.2）：d=7168（隐藏维）、n_h=128（头数）、d_h=128（每头维）、d_c=512（KV 压缩维）、d_c'=1536（Q 压缩维）、d_h^R=64（解耦 RoPE 每头维）。

**(A) KV 联合低秩压缩（式 1、2、5）**

```text
c_t^KV  = W^DKV · h_t                                   (式1：压缩，512 维)
[k^C_{t,1}; …; k^C_{t,n_h}] = k_t^C = W^UK · c_t^KV     (式2：Key 虚拟展开)
[v^C_{t,1}; …; v^C_{t,n_h}] = v_t^C = W^UV · c_t^KV     (式5：Value 虚拟展开)
```

- W^DKV ∈ R^{512×7168} 是"压缩器"，W^UK、W^UV 是"虚拟展开器"：注意力仍按 128 个头计算，但**推理缓存的永远只有压缩态 c_t^KV**；
- "joint（联合）"的含义：K 和 V 共用同一次下行投影——K/V 信息高度冗余，绑在一起压缩比分头压缩更省参数与缓存；
- 低秩假设是机制成立的前提：K/V 本质上能被 512 维流形近似，而 128 头 ×128 维的全量空间（16384 维）冗余很大。

**(B) 解耦 RoPE 通道（式 3、4）**

```text
k_t^R  = RoPE(W^KR · h_t)            (式3：64 维，全头共享同一个 k^R)
k_{t,i} = [ k^C_{t,i} ; k_t^R ]      (式4：每头的 K = 内容部分 ⊕ 位置部分)
```

- 为什么必须解耦（V2 §2.1.3 的论证，V3 沿用）：RoPE 是**乘性**位置编码。若直接乘在压缩通道上，W^UK 会与"随当前生成 token 变化的 RoPE 矩阵"纠缠——矩阵乘法**不满足交换律**，推理时 W^UK 就无法被吸收进 Q 侧（见 (E)），每生成一个 token 都要重算全部前缀的 K，MLA 的推理优势直接归零；
- 位置与内容解耦的第二重收益：YaRN 长文扩展**只作用在这 64 维的 k^R 上**（§4.7），改动面极小；
- 注意 k^R 是**全头共享**的（不是每头一份），缓存里只加 64 维、不是 64×128。

**(C) Query 侧低秩压缩（式 6–9）**

```text
c_t^Q   = W^DQ · h_t                          (式6：1536 维)
q_t^C   = W^UQ · c_t^Q                        (式7)
q_t^R   = RoPE(W^QR · c_t^Q)                  (式8：每头 64 维，随头切分)
q_{t,i} = [ q^C_{t,i} ; q^R_{t,i} ]           (式9)
```

- **Q 压缩不减少 KV cache**（cache 只由 K/V 决定），它省的是**训练时的激活显存与算力**——方向感别搞反，这是二手解读常混淆的点（徐天乐解读亦同）。

**(D) 注意力汇聚与输出（式 10、11）**

```text
o_{t,i} = Attention(q_{t,i}, [k_{1,i};…;k_{t,i}], [v_1^C;…;v_t^C])   (式10)
u_t = W^O · [o_{t,1}; …; o_{t,n_h}]                                (式11)
```

**(E) 推理"权重吸收"（absorbed inference，V2 论文给出，V3 沿用）**

- 矩阵乘法满足结合律：注意力本来要算 q^C·(W^UK·c^KV)^T，可以把 W^UK 直接乘进 Q 侧投影矩阵；同理 W^UV 乘进输出投影 W^O——**推理时永远不必显式重建 K/V**，直接在 latent 态上完成注意力；
- "上投影"只是训练视角的数学等价物；推理 kernel 的正确实现形态是"吸收式"，SGLang/vLLM 的 MLA 优化路径正是如此（官方 README 推荐列表）；
- 吸收可行性与 (B) 互为因果：一旦 RoPE 混进压缩通道，吸收立刻失效——**解耦 RoPE 就是为了保住吸收**。

**(F) 缓存账**：每 token 每层只缓存 c_t^KV(512) + k_t^R(64) = **576 维**；相对 MHA 的逐维算账见 §5.2 专讲。`routed_scaling_factor=2.5` 在推理侧兼作 FP16 溢出修复系数（推理走读）。

### 4.2 DeepSeekMoE 逐式精讲（原文式 12–20）

**(A) 基本形态：共享专家 + 细粒度路由（式 12–15）**

```text
h'_t = u_t + Σ_{i=1}^{N_s} FFN^(s)_i(u_t) + Σ_{i=1}^{N_r} g_{i,t}·FFN^(r)_i(u_t)   (式12)
g_{i,t}  = g'_{i,t} / Σ_{j=1}^{N_r} g'_{j,t}                                       (式13：选中者再归一化)
g'_{i,t} = s_{i,t} 若 s_{i,t} ∈ TopK({s_{j,t}|1≤j≤N_r}, K_r)，否则 0              (式14)
s_{i,t}  = Sigmoid(u_t^T · e_i)                                                   (式15：token-专家亲和度)
```

- V3 取值：N_s=1（共享专家）、N_r=256（路由专家）、K_r=8（每 token 激活数）、专家中间维 2048；e_i 是第 i 个路由专家的**质心向量**——路由本质是"token 隐状态与专家质心的相似度打分"，一个专家就是一次 FFN 变换的聚类中心；
- 式13：sigmoid 之后分数不再天然归一化，所以对被选中的 8 个分数**显式做一次归一化**再当 gate 用（softmax 时代这步是免费的）；
- **为什么改 sigmoid**（V2→V3 的差别，原文 §2.1.2 点明）：softmax 让所有专家得分竞争同一组归一化（此消彼长）；sigmoid 给每个专家**独立**的 [0,1] 打分（多标签式），专家数升到 256 后区分度更好（DeepSeek MoE 演进一文同此解释）。

**(B) 无辅助损失负载均衡（式 16 + γ 动态更新）**

```text
g'_{i,t} = s_{i,t} 若 s_{i,t}+b_i ∈ TopK({s_{j,t}+b_j |1≤j≤N_r}, K_r)，否则 0   (式16)
更新规则（每个训练 step 末，按全 batch 统计的实际负载）：
    专家过载 → b_i ← b_i − γ
    专家欠载 → b_i ← b_i + γ
γ = 0.001（前 14.3T token；最后 500B token 置 γ=0，把路由完全交还模型）    （§4.2）
```

- 核心设计：**bias 只参与"选谁"，不参与"权重多少"**——真正乘进 FFN 输出的 gate 仍是干净的 s_{i,t}（式 13/14 不含 b），均衡动作不进梯度、不污染语言建模目标；
- 与辅助损失的对比：辅助损失要靠反向传播"劝"整网权重去凑均匀，权重调大伤质量（论文引 Wang et al. 2024a）；bias 是选择侧的"配重"，只改排序、不动损失曲面；
- γ 在末段 500B token 归零：均衡已完成"启动"职责，后期不再干预——这是论文里很容易被忽略的一行调度细节。

**(C) 序列级辅助损失（式 17–20）**

```text
L_Bal = α · Σ_{i=1}^{N_r} f_i · P_i                              (式17)
f_i   = (N_r / (K_r·T)) · Σ_{t=1}^{T} 1(s_{i,t} ∈ TopK(...))    (式18：归一化后的实际负载)
s'_{i,t} = s_{i,t} / Σ_{j=1}^{N_r} s_{j,t}                       (式19：门控归一化)
P_i   = (1/T) · Σ_{t=1}^{T} s'_{i,t}                             (式20：门控概率均值)
```

- α=1e-4（§4.2："极小值，仅为避免单条序列内极端失衡"）——所以严格说 V3 是"**无专家级/设备级辅助损失**"，不是零损失（⑧-2），f_i·P_i 的形式沿用 GShard/ST-MoE 的均衡损失，但作用域砍到序列级、权重砍到万分之一。

**(D) 节点受限路由（node-limited routing，§2.1.2）**

- 每 token 最多发往 **M=4 个节点**；节点选择按"该节点上 top(K_r/M) 个亲和度分数之和"排序取前 M 个；
- 目的：把跨节点 All-to-All 流量削掉大半，配合 IB(50GB/s)/NVLink(160GB/s) 带宽差实现计算-通信全重叠（§4.8）。

**(E) 不丢 token（no token-dropping）**

- 训练全程负载均衡良好 → 不做任何 token 丢弃（V2 还有设备级丢弃，V3 取消）；推理侧靠冗余专家部署同样不丢（§4.10、拓展 10）。

### 4.3 MTP 逐式精讲（原文式 21–25）

**模块构成**（深度 D=1）：D 个串行 MTP 模块，每个含共享 embedding Emb(·)、共享输出头 OutHead(·)、一个 Transformer 块 TRM_k(·)、投影矩阵 M_k ∈ R^{d×2d}。（主干第 (2, 30, 58) 层隐状态供三个 MTP 辅助头使用——该细节来自建模代码，推理走读一文转引；论文正文只规定主 MTP 深度 D=1。）

```text
h'^k_i   = M_k · [ RMSNorm(h^{k-1}_i) ; RMSNorm(Emb(t_{i+k})) ]    (式21：拼接未来 token 的词嵌入)
h^k_{1:T-k} = TRM_k(h'^k_{1:T-k})                                   (式22：过第 k 层 Transformer)
P^k_{i+k+1} = OutHead(h^k_i)                                        (式23：线性层+Softmax)
```

- 直觉：把"未来第 k+1 个 token 的**词嵌入**"提前拼进当前位置的隐状态——模型被迫学出"为未来做表征规划"的能力（论文两个动机：加密训练信号 + pre-plan representations，§2.2）；
- 与 Gloeckle 等（[2404.19737](https://arxiv.org/abs/2404.19737)）用 D 个**并行** head 不同：V3 是**串行**预测且每个深度保持完整因果链（第 k 层能看到第 k−1 层的输入）——论文自陈这一原则与 EAGLE（[2401.15077](https://arxiv.org/abs/2401.15077)）相同，但目的不同：EAGLE 为推理加速，V3 为训练收益；
- 与主干共享 Emb/OutHead（省参数与显存，物理上把最浅层与最深层放同一 PP rank，§3.2.3）。

**训练损失（式 24、25）**

```text
L_MTP^k = CrossEntropy(P^k_{2+k:T+1}, t_{2+k:T+1}) = −(1/T)·Σ_{i=2+k}^{T+1} log P^k_i[t_i]   (式24)
L_MTP   = (λ/D) · Σ_{k=1}^{D} L_MTP^k                                                       (式25)
λ = 0.3（前 10T token）→ 0.1（后 4.8T token）                          （§4.2）
```

- λ 的两段调度说明：MTP 辅助目标前期"猛给"、后期收敛到轻量——与 γ、LR 的衰减逻辑一致（都属于"课程式退火"）；
- 论文消融（§4.5.1，详见⑥-4）证明 MTP 对基准有**正增益**——"训练目标"与"推理加速"一鱼两吃。

**推理中的 MTP（§5.4.3）**

- 推理时 MTP 模块可**整体丢弃**，主模型独立可用；复用它做投机解码：主 forward → 采样 token → MTP forward 产出 draft → 下一步主 forward 并行验证；
- 论文实测口径：第二 token 接受率 **85%–90%**（跨多种生成主题稳定），解码提速 **≈1.8× TPS**——此前走读文的"~1.5×"为第三方估算，以论文口径为准。

### 4.4 训练总目标账本：三项损失、一个不进损失的旋钮

```text
总目标 = L_main（next-token 交叉熵，主干）
       + L_MTP（式25，λ = 0.3→0.1 两段调度）
       + L_Bal （式17，α = 1e-4，序列级）

被砍掉的（V2 时代都存在）：专家级辅助损失 · 设备级辅助损失 · 通信均衡损失
不进损失的：路由 bias b_i（只改式16的 Top-K 选择，不进反向传播）
```

| 项 | 作用域 | 量级 | 一句话角色 |
|----|--------|------|-----------|
| L_main | 全 token | 1 | 唯一的"学习目标" |
| L_MTP | 每位置多预测 1 token | λ 级 | 加密监督信号 + 白送投机解码 |
| L_Bal | 单条序列内 | 1e-4 | 只防"单序列极端偏科"的保险丝 |
| bias b_i | 全 batch 负载 | γ 级调节 | 真正的均衡主力，且不动梯度 |

### 4.5 预训练超参与调度（原文 §4.2 一手数据）

| 项 | 值 |
|----|----|
| 优化器 | AdamW，β₁=0.9，β₂=0.95，weight decay=0.1 |
| 梯度裁剪 | norm=1.0 |
| 最大序列长 | 4K（预训练阶段） |
| Batch size | 3072 → 15360（前 469B token 内逐步增大，之后恒定） |
| 学习率 | 0→2.2e-4（前 2K 步 warmup）→ 恒定 2.2e-4 至 10T token → cosine 降至 2.2e-5（跨 4.3T token）→ 最后 500B：前 333B 保持 2.2e-5，后 167B 降至 7.3e-6 |
| 均衡 bias 更新速度 γ | 0.001（前 14.3T）→ 0.0（最后 500B） |
| 均衡损失系数 α | 0.0001 |
| MTP 损失权重 λ | 0.3（前 10T）→ 0.1（后 4.8T） |

设计解读：预训练**收尾的两级 LR 平台**（2.2e-5 → 7.3e-6）不是随手设的——7.3e-6 正是后续 YaRN 长文扩展阶段使用的恒定学习率（§4.7），预训练末段就在为上下文扩展"无缝接轨"。

### 4.6 数据与分词器（原文 §4.1）

- 语料 **14.8T token**：相比 V2 提高数学与编程样本占比、把多语覆盖扩到中英之外；去冗余同时保多样性；
- **文档打包**（document packing）保数据完整性，但**不做跨样本注意力 mask**；
- **FIM**（Fill-in-Middle，填空训练）：PSM 结构（前缀-后缀-中间），比例 0.1——延续 DeepSeekCoder-V2 结论：不伤 next-token 能力，还额外获得"根据上下文猜中间"的能力；
- 分词器：**Byte-level BPE，128K 词表**（全词表 129280 含特殊 token）；新 pretokenizer 把"标点+换行"合并成 token 提升多语压缩率，但这类 token 在"多行且无结尾换行"的少样本提示里会引入 **token 边界偏差**（论文引 Lundberg 2023）——对策是训练时随机拆分该类 token，让模型见过更多边界特例；
- 效率分母：**每训练 1 trillion token 仅需 180K H800 GPU 小时**（§4.4.2）——比训 72B/405B dense 模型便宜得多。

### 4.7 长上下文扩展：YaRN 两阶段（原文 §4.3）

```text
阶段1：4K → 32K  ，1000 步，batch 1920
阶段2：32K → 128K，1000 步，batch 480
两阶段学习率恒定 7.3e-6（= 预训练末段 LR，无缝衔接）
YaRN 超参：s = 40，α = 1，β = 32，√t = 0.1·ln(s) + 1（与 DeepSeek-V2 相同）
作用位置：只作用于解耦共享 key k^R（那 64 维）
```

- **注意符号冲突**：YaRN 的 α/β 与均衡损失的 α、与 GRPO 的 β 是完全不同语境的符号，读表时别混；
- 效果：SFT 后 NIAH 在 128K 全窗口稳定（原文图 8）——机制与局限见拓展 8 与⑧-5。

### 4.8 训练基础设施：DualPipe 与跨节点 All-to-All（原文 §3.1–3.2）

**集群与并行拓扑**：2048 张 H800（每节点 8 卡，节点内 NVLink/NVSwitch，跨节点 InfiniBand）；并行为 **PP=16 + EP=64（跨 8 节点）+ ZeRO-1 DP，全程不用 TP**（自研 HAI-LLM 框架）。不用 TP 的底气来自显存三招（见下）。

**DualPipe（§3.2.1）**——动机：跨节点 EP 让计算:通信 ≈ **1:1**，传统流水线扛不住。

```text
切块：每个 chunk 拆成 4 段 —— attention │ all-to-all dispatch │ MLP │ all-to-all combine
反向：attention 与 MLP 再各拆成「输入梯度」与「权重梯度」（ZeroBubble 思路）
调度：一对前向+反向 chunk 内部重排组件顺序 → 通信藏进计算；
      双向——microbatch 从流水线两端同时喂入，通信大半被完全重叠
```

| 方法 | 流水气泡 | 参数显存 | 激活显存 |
|------|----------|----------|----------|
| 1F1B | (PP−1)(F+B) | 1× | PP |
| ZB1P | (PP−1)(F+B−2W) | 1× | PP |
| **DualPipe** | **(PP/2−1)(F&B+B−3W)** | 2× | PP+1 |

（F/B/W = 前向/反向/权重梯度耗时；出自原文表 2。）DualPipe 要保留两份参数副本，但 EP 很大、参数本来就切得碎，代价可接受；只要**计算通信比恒定**，扩节点近乎零额外开销——这是"671B 用 2048 卡训完"的系统学底座。

**跨节点 All-to-All 定制 kernel（§3.2.2）**

- 带宽现实：NVLink 160 GB/s ≈ IB 50 GB/s 的 3.2 倍 → token 先走 IB 到目标节点"同编号 GPU"，再经 NVLink 即时转发给宿主专家——两种网络的传输完全重叠；
- 由此平均每节点可容纳 **3.2 个专家**：现在只选 8 个专家，理论上**扩到 13 个（4 节点 ×3.2）通信成本不变**——为将来加宽路由预留了免费空间；
- 只用 **20 个 SM、分 10 条通信通道**，warp specialization（dispatch 的 IB 发送/IB→NVLink 转发/NVLink 接收各由专职 warp 处理），配定制 PTX 指令与自动调优 chunk 大小，压 L2 干扰。

**显存三招（§3.2.3）**：①反向时**重算** RMSNorm 与 MLA 上投影（省激活存储，开销极小）；②EMA 参数放 **CPU 内存**异步更新（早估模型质量用，不占 GPU）；③MTP 与主干**共享** Emb/OutHead，且把最浅层（Emb）与最深层（OutHead）放在**同一个 PP rank** 上物理共享参数与梯度。

### 4.9 FP8 训练全解（原文 §3.3 + 附录 B）

1. **混合精度框架**：Linear 的三个 GEMM（Fprop/Dgrad/Wgrad）全部 FP8（输出 BF16/FP32），理论算力翻倍；**保持原精度的算子清单**：embedding、输出头、MoE 门控、归一化、注意力；主权重、梯度累积、优化器状态保 FP32，AdamW 一阶/二阶矩用 BF16 存（实测无可见劣化）；
2. **细粒度量化**：激活按 **1×128** tile（per token per 128 通道）、权重按 **128×128** block 缩放——专治离群值；对比先例是 per-tensor 缩放，一个离群激活就能毁掉整个张量的 scale；沿 GEMM 内维引入 per-group 缩放因子（标准 FP8 GEMM 不支持，靠 FP32 累加路径顺带完成反量化）；
3. **累加精度**：H800 Tensor Core 的 FP8 GEMM 实际只保 **~14 位**累加精度（32 个尾数积按最大指数右对齐后只取最高 14 位；K=4096 随机矩阵实测最大相对误差近 **2%**）→ 每 **N_C=128** 次 MMA（=4 个 WGMMA）把部分和提升到 CUDA Core 做 FP32 累加；双 warpgroup 交替（一个提升、一个继续 MMA）掩盖开销；
4. **尾数优先（全量 E4M3）**：先例是 Fprop 用 E4M3、Dgrad/Wgrad 用高指数范围的 E5M2；V3 **所有张量统一 E4M3**——细粒度分组让"组内共享指数位"成立，动态范围问题被 scale 解掉，于是敢弃用低精度的 E5M2；
5. **在线量化**：不用历史 max 的 delayed 量化，每个 1×128/128×128 组**当场**算 max → 出 scale → 量化，保证 scale 准确且框架简单；
6. **低精度缓存与通信**：注意力后 Linear 的输入（反向还要用，精度敏感）用定制 **E5M6** 格式，缩放因子取 **2 的整数次幂**（避免二次量化误差）；MoE SwiGLU 缓存输入（FP8）、反向重算输出；MoE 上投影前的激活 FP8 dispatch，而 combine 前后向都保 BF16；
7. **验证口径**：16B（1.33T token）与 230B（~0.9T token）两档对照 BF16，**相对损失误差 <0.25%**（附录 B.1）——注意这是小规模验证，**不是 671B 的全量 BF16 对照**（⑧-3）；附录 B.2：把激活梯度也改 128×128 block 量化会直接**训崩**（16B/300B token 发散）——激活梯度存在 token 相关离群值，Dgrad 对精度极敏感，这解释了为何激活不能像权重那样量化。

### 4.10 推理部署与"给芯片厂的公开信"（原文 §3.4–3.5）

**Prefill 最小单元 = 4 节点 32 卡**：注意力 TP4+SP、DP8（TP 规模刻意压小以省通信），MoE 用 EP32（保证每专家 batch 足够大），浅层 dense MLP 用 TP1；**32 个冗余专家**（每卡原 8 个 + 1 个冗余）；双微批重叠——一个微批的 attention/MoE 与另一个微批的 dispatch/combine 同时跑；探索中的动态冗余：每卡放 16 专家、每步只激活 9 个，每次 All-to-All 前在线算全局最优路由（prefill 算力充足，这点开销可忽略）。

**Decode 最小单元 = 40 节点 320 卡**：TP4+SP+DP80，MoE EP320（每卡 1 个专家，另 64 卡专门放冗余+共享专家）；**共享专家被当作"永远被选中的重载路由专家"参与路由**（每 token 共 9 选）；All-to-All 走 IB 点对点 + **IBGDA** 进一步降延迟；冗余专家集按在线负载**每约 10 分钟**重算一次；解码阶段 attention 时间占比更高 → 用一个微批的 attention 去掩另一个微批的 dispatch+MoE+combine（每专家 batch 通常 <256 token，瓶颈是访存不是算力，给 MoE 分少量 SM 即可）。

**§3.5 给硬件厂商的四点建议**（V3 把系统瓶颈写成了采购需求）：

1. **通信别再吃 SM**：V3 都要拿 132 个 SM 里的 20 个专职搬数据（tensor core 全程闲置）——希望出现通信协处理器，对上层统一 IB（scale-out）与 NVLink（scale-up）视图；
2. **更高 FP8 累加精度**：Hopper 的 14 位累加是硬件缺陷，V3 的 CUDA Core 提升只是权宜妥协；
3. **原生 tile/block 量化支持**：现在 GPU 只支持 per-tensor 量化，1×128/128×128 全靠手工流程；
4. **支持在线量化与转置 GEMM**：前向按 1×128 存、反向要转成 128×1 再读，多一轮 HBM 往返——希望从共享内存直接转置读取、FP8 格式转换与 TMA 融合。

（这套"自曝其短"的写法本身就是 V3 报告的特色：把 2.788M GPU 小时背后的每一个硬件妥协都摊开给社区看。训练全程零不可恢复 loss spike、零回滚见摘要与 §1。）

## ⑤ 跨模型架构对比

被对比模型规格逐项以官方技术报告为最终出处（链接见 5.1 上方与⑩-A）。

### 5.1 逐模块对比矩阵

被对比模型规格以官方技术报告为准：Llama-3（[2407.21783](https://arxiv.org/abs/2407.21783)）、Qwen2.5（[2412.15115](https://arxiv.org/abs/2412.15115)）、DeepSeek-V2（[2405.04434](https://arxiv.org/abs/2405.04434)）。

| 模块 | **DeepSeek-V3（本文）** | DeepSeek-V2（前代） | Llama-3.1-405B（同期） | Qwen2.5-72B（同期） |
|------|------------------------|--------------------|------------------------|---------------------|
| 规模 | 671B 总 / 37B 激活（MoE） | 236B / 21B（MoE） | 405B（dense） | 72B（dense） |
| **注意力** | **MLA**：128 头，d_c=512 / d_c'=1536 / d_h^R=64 | MLA（V2 首发验证） | GQA：128 Q 头 / 8 KV 头 | GQA：64 Q 头 / 8 KV 组 |
| **位置编码** | RoPE（解耦 64 维共享通道）+ **YaRN 两阶段 4K→32K→128K** | RoPE + YaRN 128K | RoPE（基频放大）+ 8K→128K 扩展 | RoPE + YaRN（32K/128K 档） |
| **FFN / MoE** | 1 共享 + 256 路由（top-8，sigmoid），前 3 层 dense | 2 共享 + 160 路由（top-6） | dense SwiGLU | dense SwiGLU |
| **负载均衡** | **无辅助损失 bias**（γ=0.001→0）+ 序列级损失（α=1e-4），不丢 token | 辅助损失 + 设备级 token 丢弃 | —（无路由） | —（无路由） |
| **训练目标** | next-token + **MTP（D=1，λ=0.3→0.1）** | next-token | next-token | next-token |
| **训练精度** | **FP8 混合精度**（全 E4M3 + 1×128/128×128） | BF16 | BF16 | BF16 |
| **训练并行** | DualPipe PP16 + EP64 + ZeRO-1 DP（**无 TP**） | EP+DP（核对中） | TP/PP/DP（官方报告） | TP/PP/DP（官方报告） |
| KV cache/层 | 512+64=576 维压缩 latent（≈MHA 的 1.8%） | 同 MLA | 8 组全量 K/V（2048 维） | 8 组全量 K/V |
| 长文推理部署 | prefill 4 节点 32 卡 / decode 40 节点 320 卡（冗余专家） | — | 单副本可跑（dense） | 单副本可跑（dense） |

（V2 的 160 路由/6 激活与演进细节出自 DeepSeek MoE 演进一文；V2 训练并行细节未逐项核对，标「核对中」。）

### 5.2 注意力差异专讲：MLA vs MHA / GQA

**1) 结构差异**

```
MHA:  每头独立 K、V： h ──→ k_1..k_128, v_1..v_128        （32768 维/token/层 全缓存）
GQA:  头分组共享：    128 个 Q 对应 G 组 K/V              （如 G=8 → 2048 维，≈1/16）
MLA:  低秩压缩共享：  h ──W^DKV──→ c(512)  +  RoPE k^R(64) （576 维，≈1/57）
      注意力时才用 W^UK/W^UV 把 k、v"虚拟展开"——缓存的永远是压缩态
```

**2) KV cache 账**（按 V3 配置算术）

| 机制 | 每 token 每层缓存 | 相对 MHA |
|------|-------------------|----------|
| MHA | 128×(128+128)=32768 维 ≈ 64KB(BF16) | 1× |
| GQA-8 | 8×(128+128)=2048 维 | 1/16 |
| **MLA** | 512+64=**576 维 ≈ 1.15KB** | **≈1/57（~1.8%）** |

→ 这是 V3 能在 128K 上下文、大并发下把推理显存压下来的结构性原因（对比：MoE 解决"参数多"，MLA 解决"上下文长"，两者正交）。

**3) 权重吸收与算力/实现账**

- 吸收（详见 §4.1(E)）：W^UK 吸进 Q 侧、W^UV 吸进 W^O（结合律）——推理**不必显式重建 K/V**，kernel 直接在 latent 上算；解耦 RoPE 就是为了保住这个吸收；
- 训练：Q 侧也压缩（1536），省激活显存；"重组"只是数学等价视角；
- 推理框架：SGLang/vLLM 均实现了吸收式 MLA 优化路径（官方 README 推荐列表）；
- 部署耦合（原文 §3.4 一手口径）：prefill 注意力 TP4+SP + DP8、MoE EP32；decode 注意力 TP4+SP + DP80、MoE EP320，最小解码单元 40 节点 320 卡。

**4) 代价与取舍**

- 结构复杂度上升：低秩重组、解耦 RoPE、专用算子融合，实现门槛远高于 GQA；
- 压缩不可逆地丢信息——MLA 的效果依赖 W^DKV 的学习质量（V2→V3 两代验证其可靠）；
- 与 RoPE 强耦合：RoPE 必须走独立 64 维通道，**这正是"位置信息在数学上无法被低秩压缩"的工程印证**。

## ⑥ 实验解读

### 6.1 Chat 模型主表（报告 Table 6，已与 arXiv HTML 原文逐行核对）

| 基准（指标） | **DeepSeek-V3** | GPT-4o-0513 | Claude-3.5-S-1022 | Llama-3.1-405B | Qwen2.5-72B |
|--------------|:---:|:---:|:---:|:---:|:---:|
| MMLU (EM) | **88.5** | 87.2 | 88.3 | 88.6 | 85.3 |
| MMLU-Pro (EM) | 75.9 | 72.6 | **78.0** | 73.3 | 71.6 |
| GPQA-Diamond (Pass@1) | 59.1 | 49.9 | **65.0** | 51.1 | 49.0 |
| DROP (3-shot F1) | **91.6** | 83.7 | 88.3 | 88.7 | 76.7 |
| MATH-500 (EM) | **90.2** | 74.6 | 78.3 | 73.8 | 80.0 |
| AIME 2024 (Pass@1) | **39.2** | 9.3 | 16.0 | 23.3 | 23.3 |
| LiveCodeBench (Pass@1-COT) | **40.5** | 33.4 | 36.3 | 28.4 | 31.1 |
| Codeforces (Percentile) | **51.6** | 23.6 | 20.3 | 25.3 | 24.8 |
| SWE-bench Verified | 42.0 | 38.8 | **50.8** | 24.5 | 23.8 |
| C-Eval (EM) | **86.5** | 76.0 | 76.7 | 61.5 | 86.1 |
| Arena-Hard | **85.5** | 80.4 | 85.2 | 69.3 | 81.2 |
| AlpacaEval 2.0 | **70.0** | 51.1 | 52.0 | 40.5 | 49.1 |

**数字背后**：
- **数学/代码是断层领先**：AIME 39.2 接近第二名 23.3 的 1.7 倍、Codeforces 百分位 51.6 是唯一进入前 25% 的非 o1 模型——与官方"远超全部非 o1 类模型"的表述一致（官方发布页）；
- **知识与长文本补齐短板**：MMLU 88.5 超 GPT-4o-0513，DROP 91.6 全场最高，官方称 DROP/FRAMES/LongBench v2 平均第一；
- **仍非全面碾压**：GPQA/MMLU-Pro/SWE 领先是 Claude-3.5-Sonnet-1022，FRAMES 输给 GPT-4o（73.3 vs 80.5），SimpleQA 低于 GPT-4o（24.9 vs 38.2）——"不分伯仲"是准确措辞；
- **对前代的跃迁**：MMLU 相对 DeepSeek-V2.5（80.6）+7.9，MATH-500（74.7→90.2）、AIME（16.7→39.2）翻倍以上（langbase 表内 V2.5 列）。

### 6.2 Base 模型精选（报告 Table 3，langbase + Pocket Reference 双源一致行）

| 基准 | DeepSeek-V3 Base | Llama-3.1-405B Base | Qwen2.5-72B Base |
|------|:---:|:---:|:---:|
| BBH (3-shot) | **87.5** | 82.9 | 79.8 |
| MMLU (5-shot) | **87.1** | 84.4 | 85.0 |
| MATH (4-shot) | **61.6** | 49.0 | 54.4 |
| C-Eval (5-shot) | **90.1** | 72.5 | 89.2 |
| HumanEval (0-shot) | **65.2** | 54.9 | 53.0 |

### 6.3 评测口径（必须一起看的五个限定）

1. 对手是**发布时版本**（GPT-4o-0513 / Claude-3.5-S-1022 等），这是 2024 年末的能力快照，不是实时榜（徐天乐解读）；
2. 报告 Table 6 限制最大输出 8K token；<1000 样本的基准用多 temperature 多次评测取稳健值；
3. 表内混用 EM / Pass@1 / Percentile / Resolved，**不可横向比较数字大小**；
4. 细节口径（§5.3.1）：AIME/CNMO 用 temperature 0.7 跑 16 次取平均，MATH-500 贪心解码；SWE-bench Verified 用 agentless 框架；chat 版 LiveCodeBench 题目窗口为 2024-08~11（base 版为 0801-1101）；
5. base 表（Table 3）用**内部评测框架**统一路测，论文明说"分差 ≤0.3 视为同一水平"——读表时别把 0.2 的差距当结论。

### 6.4 消融解读：数字比结论好看在哪、危险在哪

**MTP 消融（§4.5.1 / Table 4）**——两档基线：15.7B/1.33T 与 228.7B/540B，只加 1 层 MTP 模块：

| 基准 | 小 MoE 基线→+MTP | 大 MoE 基线→+MTP |
|------|------------------|------------------|
| HumanEval | 20.7 → **26.8** | 44.5 → **53.7** |
| GSM8K | 25.4 → **31.4** | 72.3 → **74.0** |
| BBH | 39.0 → **41.4** | 70.0 → **70.7** |
| MMLU | 50.0 → **53.3** | 67.5 → 66.6（**微降**） |

→ MTP 对代码/数学增益最大；**MMLU 在大档反而掉 0.9**——"综合提升"不是全绿，批判性阅读时值得记一笔。

**无辅助损失消融（§4.5.2 / Table 5）**——两档基线：15.7B/1.33T 与 228.7B/578B（基线均为纯辅助损失 + sigmoid 门控）：

| 基准 | 小 MoE 基线→无辅助损失 | 大 MoE 基线→无辅助损失 |
|------|------------------------|------------------------|
| HumanEval | 22.0 → 22.6 | 40.2 → **46.3** |
| GSM8K | 27.1 → **29.6** | 70.7 → **74.5** |
| MMLU | 51.0 → **51.8** | 68.3 → 67.2（**微降**） |

**batch 级 vs 序列级均衡（§4.5.3，全文最被低估的一节）**：1B MoE 验证损失 2.258（序列级损失）vs **2.253**（无辅助损失）vs **2.253**（batch 级辅助损失）；3B：2.085 vs **2.080** vs **2.080**——说明**真正的收益来自"把均衡约束从序列级放松到 batch 级"，bias 只是实现这种松弛的手段之一**；batch 级辅助损失能达到同等效果。代价是两个效率挑战：单序列/小 batch 内可能失衡、推理时域偏移导致失衡——V3 分别用大规模 EP+DP（保证 microbatch 足够大）和冗余专家部署来兜底。

**专家特化（附录 C / 图 9、11）**：无辅助损失模型在 Pile 三个领域上的负载分布更"块状"——不同领域激活不同专家，即**特化（specialization）更强**，这正是性能增益的机制解释。

**FP8（附录 B.1/B.2）**：16B/1.33T 与 230B/0.9T 两档对照 BF16，相对损失误差 <0.25%；但激活梯度若按 128×128 block 量化会在 16B/300B token 处直接发散——**FP8 可行的前提是那套精细到"算子级"的分寸感**（徐天乐解读指出"<0.25% 不是 671B 全量对照"的边界同样成立）。

**长上下文**：见 §4.7（YaRN 两阶段参数为原文一手数据），SFT 后 NIAH 128K 全窗稳定（图 8）。

### 6.5 后训练管线精读（原文 §5，此前版本漏讲）

**SFT（§5.1）**：**1.5M 条**指令样本，多领域分工构造；推理类数据（数学/代码竞赛/逻辑题）由**内部 DeepSeek-R1 模型**生成——方法论很讲究：

```text
1) 为每个领域先训一个"专家模型"（SFT+RL 流水线），当数据生成器
2) 每题生成两种 SFT 样本：〈问题, R1 原始回答〉 与 〈系统提示, 问题, R1 回答〉
   （系统提示里写入"反思、验证"机制的指令）
3) RL 阶段高温采样，让回答融合 R1 模式与简洁格式——数百步后中间模型内化 R1 模式
4) 拒绝采样（rejection sampling）筛选出最终 SFT 数据：保 R1 的准确率、去其过度思考/格式差/冗长
非推理数据（写作/角色扮演/问答）：DeepSeek-V2.5 生成 + 人工校验
SFT 设置：2 epoch，LR 5e-6→1e-6 cosine；样本打包但用 mask 保证互不可见
```

**Reward Model（§5.2.1）双轨制**：可规则验证的（数学最终答案、代码测试用例/编译器）用**规则奖励**（抗 hack）；自由答案/无标准答案的用**模型 RM**——由 V3 的 SFT checkpoint 训练，且偏好数据**连同产生奖励的链式推理过程一起标注**，专门缓解 reward hacking。

**RL（§5.2.2）**：GRPO 算法（目标函数逐式精讲见拓展 7），prompt 覆盖代码/数学/写作/角色扮演/问答多域——即使 SFT 数据稀疏的域也能靠 RL 补齐。

**自奖励与生成式裁判（§5.4.2 / §5.3.4）**：主观题用 constitutional AI 思路、拿 V3 自己的投票结果当反馈；V3（maj@6）在 RewardBench 平均 89.6，与 GPT-4o-0806、Claude-3.5-S-1022 最新版相当——"自己给自己打分"有了硬指标背书。

**蒸馏消融（§5.4.1 / Table 9，基于 DeepSeek-V2.5 做对照）**：

| 模型 | LiveCodeBench-CoT | 长度 | MATH-500 | 长度 |
|------|:---:|:---:|:---:|:---:|
| V2.5 基线（短 CoT） | 31.1 | 718 | 74.6 | 769 |
| V2.5 + R1 蒸馏数据 | **37.4** | 783 | **83.2** | **1510** |

→ 蒸馏显著涨点（+6.3 / +8.6），但 **MATH-500 回答长度翻倍**——V3 后训练专门做了"准确率 vs 推理成本"的设置折中；这是理解"V3 为什么又强又没变成 o1 式超长思考"的关键一行。

## ⑦ 知识点拓展（10 个）

### 拓展 1：MoE 负载均衡的三代演进（纵向谱系）

```
GShard/ST-MoE（业界基线）:  softmax 路由 + 辅助损失 L_B = N·Σ f_i·P_i + Router Z-loss
        ↓ DeepSeek-MoE(02篇):  细粒度专家 + 共享专家隔离 + 专家级/设备级辅助损失
        ↓ DeepSeek-V2:          设备受限路由(M) + 通信辅助损失 + 设备级 token 丢弃
        ↓ DeepSeek-V3(本文):    ✂ 砍掉专家级/设备级/通信级辅助损失
                               改 sigmoid 打分（式15）+ 每专家 bias（式16，只动选择、不动梯度）
                               仅保留 α=1e-4 的序列级损失（式17–20）；取消 token 丢弃
                               γ=0.001→0 两段调度（末 500B token 退出均衡干预）
```

- **辅助损失为什么是妥协**：它通过反向传播改整网权重来逼均匀——权重调大伤模型质量；Router Z-loss（ST-MoE 提出，[2202.08906](https://arxiv.org/abs/2202.08906)）压的是路由 logits 的量级、防 softmax 数值爆炸，与均衡损失互补但同样要进梯度；
- **V3 的突破**：第一次证明大 MoE 可以**不靠梯度干预**保持均衡，且专家特化更强（附录 C）；但 §4.5.3 也说明——真正在起作用的是"batch 级松弛"，bias 只是最干净的实现方式；
- 关联：GShard（[2006.16668](https://arxiv.org/abs/2006.16668)）定义了 MoE+辅助损失的行业模板，V3 是对这个模板的最彻底修订；后续 DeepSeek 线（及被开源社区广泛借鉴）延续 bias 路线。来源：DeepSeek MoE 演进一文 + 原文 §2.1.2/§4.5.3。

### 拓展 2：MTP → 投机解码谱系（概念溯源）

- **是什么**：MTP 训练时多预测未来 token（加密训练信号 + 表征预规划，§2.2）；推理时复用同一模块做 draft，主模型一次 forward 并行验证——"自己给自己的草稿"（self-speculation），无需外挂小 draft 模型；
- **谱系**：MTP 训练目标的出处是 Gloeckle 等（[2404.19737](https://arxiv.org/abs/2404.19737)，并行多 head 版本）；投机解码的两篇奠基作是 SpecInfer（[2302.01318](https://arxiv.org/abs/2302.01318)）与 Leviathan 等（[2211.17192](https://arxiv.org/abs/2211.17192)）；V3 的"串行+保因果链"设计则明说与 EAGLE（[2401.15077](https://arxiv.org/abs/2401.15077)）同源、目的不同（EAGLE 只为推理，V3 先为训练）；
- **论文数字**（§5.4.3，替代此前第三方估算）：第二 token 接受率 **85%–90%**、解码 **≈1.8× TPS**；
- **关联**：训练目标=推理加速的复用设计，V3.1/V3.2 线的投机解码均基于此（24/32 篇展开）。

### 拓展 3：FP8 大规模训练的六个关键工程（工程实现）

1. **细粒度量化**：激活 1×128、权重 128×128 分块缩放——专治离群值（附录 B.2 反证：激活梯度改 block 量化直接训崩）；
2. **累加精度**：每 N_C=128 次 MMA（4 个 WGMMA）提升 CUDA Core 做 FP32 累加——Hopper Tensor Core FP8 累加仅约 14 位有效精度、K=4096 时相对误差近 2%，是硬件缺陷；
3. **全量 E4M3（尾数优先）**：先例 Fprop E4M3 + Dgrad/Wgrad E5M2；V3 弃用高指数低尾数的 E5M2——细粒度 scale 把动态范围问题解掉后，尾数精度成为唯一瓶颈；
4. **在线量化**：当次 max 出 scale，不用历史值（delayed quantization）；
5. **敏感算子保高精度**：embedding/输出头/MoE 门控/norm/注意力保持 BF16/FP32；主权重、梯度累积 FP32；AdamW 矩 BF16；
6. **低精度缓存与通信**：E5M6 + 2 的幂 scale 缓存注意力后 Linear 输入；MoE dispatch 走 FP8、combine 保 BF16。
   → 论文 §3.5 直接给芯片厂提需求（通信协处理器/更高累加精度/原生 tile-block 量化/在线量化与转置 GEMM），其 1×128/128×128 设计与 Blackwell microscaling 方向一致。

### 拓展 4：怎么读"$557 万美元训出 V3"（口径素养）

```text
2.788M H800·h = 预训练 2.664M + 上下文扩展 119K + 后训练 5K   （原文 §1/§4.3/§5）
× $2/卡时（论文统一估算租赁价） ≈ $5.576M
对照：每 trillion token 仅 180K GPU 小时（§4.4.2）——效率来自架构与系统，不是"少干活"

❌ 不含: 前置架构研究 · 数据清洗实验 · 消融与失败尝试 · 人员/集群运维 · 推理服务
✅ 能衡量: 正式 run 的算力效率   ✗ 不是项目总投入
```

（拆分与边界出自徐天乐解读对原文的整理——引用该数字必须带边界。）

### 拓展 5：DualPipe 与计算-通信重叠（承 11/18 篇）

细粒度专家意味着每层跨节点 All-to-All、计算通信比恶化到 ≈1:1；DualPipe 用**双向流水**把通信塞进计算气泡（气泡公式对比见 §4.8 表），配合定制 kernel 后"只要计算通信比恒定，扩节点近乎零成本"（原文 §3.2 一手口径）。这是 Fire-Flyer（11 篇）硬件哲学与 NSA（18 篇）"训练友好"设计之间的系统层桥梁——批次 5 展开。

### 拓展 6：MLA 的低秩世界观——从 MQA/GQA 到"权重吸收"（概念谱系）

- **谱系一句话**：MQA（全头共享一套 KV）→ GQA（分组共享）→ MLA（低秩压缩 + 位置解耦）——都是在"KV cache 太贵"这一个约束下找不同解；前两者是**结构共享**（精度有损但实现简单），MLA 是**代数压缩**（精度可学习补偿、实现复杂）；
- **关键代数**：缓存 latent（512+64）→ 注意力时靠结合律把 W^UK/W^UV 吸进 Q/O 投影——**"先压后展开"在推理里根本不需要发生**（§4.1(E)）；
- **RoPE 的角色**：乘性位置编码不可与线性压缩交换 → 必须另开 64 维位置通道 → 顺带让 YaRN 只改 64 维就能扩上下文——一个"被迫的妥协"变成三处收益；
- 关联：位置编码（RoPE / YaRN）是它的前置知识；NSA/DSA（18/24 篇）把"压缩"再推进到"分块稀疏"。

### 拓展 7：GRPO——把 critic 整个删掉的 PPO（RL 算法精讲）

```text
J_GRPO(θ) = E_{q, {o_i}~π_θ_old} [ (1/G)·Σ_{i=1}^{G} min( ρ_i·Â_i , clip(ρ_i, 1−ε, 1+ε)·Â_i )
                                   − β·D_KL(π_θ‖π_ref) ]                          (式26)
其中  ρ_i = π_θ(o_i|q) / π_θ_old(o_i|q)                                            （重要性采样比）
      D_KL = π_ref/π_θ − log(π_ref/π_θ) − 1        (式27：KL 的单调近似，恒大于等于 0)
      Â_i = (r_i − mean(r_1..r_G)) / std(r_1..r_G)  (式28：组内归一化优势)
```

- **PPO 的痛点**：需要一个与策略**同规模**的价值网络（critic）估计 baseline——RL 阶段显存与算力的近半开销花在"只是为了算个基线"的网络上；
- **GRPO 的答案**：对同一 prompt 采样 **G 个回答**，拿组内奖励的均值当 baseline、标准差当尺度——critic 直接删掉；代价是必须"一个 prompt 能批量采样"，恰好数学/代码这类可验证任务最适配；
- 式27 用单调 KL 估计替代经典 estimator，方差更小；clip 项与 PPO 相同，限制策略更新幅度；
- 出处：DeepSeekMath（[2402.03300](https://arxiv.org/abs/2402.03300)）首次提出；V2 后训练、V3、R1 一脉相承；**V3 报告未给出 ε、β、G 的具体取值**（复现需回看 DeepSeekMath 设置）。

### 拓展 8：RoPE 与 YaRN——乘性位置编码为什么难扩展（概念溯源 + 站内联动）

- **RoPE**（[2104.09864](https://arxiv.org/abs/2104.09864)）：把位置做成旋转矩阵注入 Q/K，点积后只依赖相对位置 m−n——**乘性**是它相对加性位置编码的本质优势，也是它两处"难缠"的根源；
- 难缠一：与低秩压缩不可交换 → MLA 必须解耦通道（拓展 6）；
- 难缠二：外推时不同频率分量表现完全不同，简单截断/线性插值都伤短程建模 → **YaRN**（[2309.00071](https://arxiv.org/abs/2309.00071)）按波长把频率分段（低频插值、高频外推）+ 温度补偿，只需少量超参即可把窗口放大数十倍；
- V3 用法（§4.3 一手数据）：YaRN 只作用于 k^R 的 64 维，s=40、α=1、β=32、√t=0.1·ln s + 1；两阶段各 1000 步 4K→32K→128K，LR 与预训练末段同为 7.3e-6；
- 关联：V3 是 RoPE 解耦通道 + YaRN 扩展最完整的工程案例（参数与超参全公开）——它也是位置编码这条线的天然落点。

### 拓展 9：R1→V3 的"反向蒸馏"闭环（后训练精讲）

- **时间线彩蛋**：V3 基座（2024-12-26 发布）先于 R1（2025-01-20）公开，但 V3 的后训练用的是**内部版 DeepSeek-R1** 生成的推理数据（§5.1）——先有内部 R1（基于 V3-Base 训练）、再把 R1 的能力"蒸"回 V3 的 SFT 数据，形成 Base→R1→V3-Chat 的循环；
- **方法论四步**（§5.1，全文照录于 §6.5）：领域专家模型 → 双格式 SFT 样本（带/不带反思系统提示）→ RL 数百步内化 R1 模式 → 拒绝采样定稿；
- **收益与代价**（§5.4.1 Table 9）：LiveCodeBench-CoT +6.3、MATH-500 +8.6，但 MATH-500 回答长度 769→1510 token——V3 特意折中出"强推理但不像 o1 那样话痨"的风格；
- 关联：16 篇（R1）与 21 篇（Insights-V3）会把这条闭环讲透；本篇只需记住"V3 的数学/代码断层领先，一半功劳在蒸馏"。

### 拓展 10：冗余专家——无辅助损失均衡在推理侧的延伸（工程实现）

- **问题**：训练时 batch 很大，batch 级均衡很稳；推理时单条请求/域偏移会让某些专家被挤爆——均衡问题在推理侧"复活"；
- **V3 的解法**（§3.4）：**冗余专家**——按在线统计的负载，把高载专家多复制几份（prefill 设 32 个冗余，每卡 8+1）；每约 10 分钟重算一次冗余集与卡内排布，且**不增加跨节点 All-to-All 流量**；
- **升级方向**：动态冗余（每卡放 16 个专家、每步只激活 9 个），每次 All-to-All 前在线求解全局最优路由——prefill 算力富余，路由求解开销可忽略；
- **哲学**：训练侧用"不动梯度的 bias"、推理侧用"不动模型的复制"——V3 的均衡观一以贯之：**凡是能用系统手段解决的，绝不用损失函数污染模型**。

## ⑧ 批判性评价

**优点**
- 架构三件套（MLA + 细粒度 MoE + MTP）**每一件都有双档规模消融**（Table 4/5、附录 B），不是技巧堆砌；
- 效率叙事完整可核：GPU 小时拆分、每 trillion token 180K 卡时、零回滚、FP8 连失败实验（附录 B.2）都公开；
- 开源彻底：权重（含原生 FP8）、部署细节、论文 v2 持续修订；§3.5 把硬件短板写成公开需求单。

**局限与争议**
1. **37B 激活 ≠ 37B 部署成本**：671B 权重 + EP320 集群仍在（最小解码单元 320 卡，论文 §6 自认"推荐部署单元对小团队是负担"）；
2. "无辅助损失"**并非零辅助损失**：仍保留 α=1e-4 的序列级损失（式 17–20）；且 §4.5.3 显示 batch 级辅助损失可取得同等效果——bias 的独占性优势没有论文暗示的那么大；
3. **FP8 结论外推有限**：<0.25% 误差来自 16B/230B 两档验证，非 671B 全量 BF16 对照（徐天乐指出）；
4. **消融不是全绿**：MTP 与无辅助损失在大档 MoE 上都出现 MMLU 微降（67.5→66.6 / 68.3→67.2）——"consistent improvements" 的措辞需要按行细读；
5. **蒸馏的副作用被官方承认**：R1 蒸馏让 MATH-500 回答长度 769→1510 token（Table 9），V3 靠额外设置压制长度——换模型/换域复现蒸馏时要重新调；
6. **复现门槛在数据而不在权重**：SFT/RL 依赖"内部 DeepSeek-R1 专家模型"与 1.5M 精标样本，GRPO 的 ε/β/G 未公开——开源权重可复用，后训练配方难以完整复刻；
7. **评测是版本快照**：对手为 GPT-4o-0513 等旧版本；指标混用不可横比；codesota 的 LiveCodeBench 49.2 与论文 40.5 不一致（疑为 V3-0324/不同 LCB 版本——**待核实**）；
8. **128K ≠ 万能长文本**：NIAH 是检索压测，跨段推理/多轮长任务另测（徐天乐同论）；
9. 部署方案（EP320/冗余专家/双微批/IBGDA）是 DeepSeek 自家 H800 集群参考实现，社区小规模部署需裁剪。

## ⑨ 系列谱系定位

```
承接:
  01 DeepSeek-LLM ──→ 02 DeepSeekMoE ──→ 06 DeepSeek-V2
  (数据/扩律基线)      (细粒度+共享专家)    (MLA + 236B)
                              │
                              ▼
                   ★ 15 DeepSeek-V3（本文）
                   = 验证过的架构 + 无辅助损失 + MTP + FP8/DualPipe
                              │
        ┌─────────────┬───────┴────────┬──────────────┐
        ▼             ▼                ▼              ▼
  16 DeepSeek-R1   21 Insights-V3   18 NSA        24 DeepSeek-V3.2
  (数周后发布,RL)   (V3 深度解析)    (训练友好稀疏)  (DSA 稀疏降成本)
        │ 蒸馏回灌 R1→V3（本文 §5.4）
        ▼
  V3.1 / V4 线（24/29/32 篇展开）
```

- **同周彩蛋**：V3（2024-12-26）与 R1（2025-01-20）仅隔数周，且 V3 后训练直接**从 R1 蒸馏**——基座与推理模型互相成就；
- 位置编码视角：RoPE 解耦通道 + YaRN 扩展是这条线最完整的工程案例。

## ⑩ 参考与延伸阅读（全部原链接）

**A 一手原文（本篇深化主要依据，均直接抓取全文核对）**

- [DeepSeek-V3 Technical Report（arXiv 摘要页）](https://arxiv.org/abs/2412.19437) —— 取用：摘要关键数字、贡献列表、版本时间
- [arXiv HTML 全文](https://arxiv.org/html/2412.19437) —— 取用：式 1–28 全部公式、§2.1.2 均衡/bias 更新规则、§2.2 MTP、§3 全部基础设施与 FP8、§4.2 全套超参与调度、§4.3 YaRN 参数、§4.5 消融表（Table 4/5）、§5 后训练（SFT/RM/GRPO/蒸馏 Table 9）、§5.4.3 接受率与 1.8× TPS、附录 B/C
- [DeepSeek-V2 Technical Report](https://arxiv.org/abs/2405.04434) —— 取用：MLA 权重吸收（W^UK→W^Q、W^UV→W^O）、解耦 RoPE 的不可交换性论证、设备级受限路由前身
- [DeepSeekMath（GRPO 出处）](https://arxiv.org/abs/2402.03300) —— 取用：GRPO 目标函数、组内归一化优势、免 critic 动机
- [RoPE（RoFormer）](https://arxiv.org/abs/2104.09864) —— 取用：乘性位置编码定义
- [YaRN](https://arxiv.org/abs/2309.00071) —— 取用：频率分段插值 + 温度补偿机制
- [GShard](https://arxiv.org/abs/2006.16668) · [ST-MoE](https://arxiv.org/abs/2202.08906) —— 取用：MoE 辅助损失与 Router Z-loss 的行业模板
- [Better & Faster LLMs via Multi-token Prediction（Gloeckle 等）](https://arxiv.org/abs/2404.19737) —— 取用：MTP 训练目标的灵感来源（并行 head 版）
- [EAGLE](https://arxiv.org/abs/2401.15077) —— 取用：串行因果链 draft 设计的对照系
- [SpecInfer](https://arxiv.org/abs/2302.01318) · [Leviathan 等投机解码](https://arxiv.org/abs/2211.17192) —— 取用：投机解码奠基工作
- [ZeroBubble](https://arxiv.org/abs/2308.05940) —— 取用：反向拆分输入/权重梯度的流水线思路（DualPipe 基础）
- [Llama 3](https://arxiv.org/abs/2407.21783) —— 取用：405B 的 GQA 配置（128 Q / 8 KV）与 RoPE 长文扩展口径
- [Qwen2.5](https://arxiv.org/abs/2412.15115) —— 取用：72B 的 GQA 配置（64 Q / 8 KV 组）与 YaRN 档位

**B 官方资源**
- [DeepSeek 官方发布页（2024-12-26）](https://www.deepseek.com/news/deepseek-v3/) —— 取用：定性评测结论、20→60 TPS、FP8 权重与定价
- [GitHub 仓库 deepseek-ai/DeepSeek-V3](https://github.com/deepseek-ai/DeepSeek-V3) —— 代码/权重入口（抓取超时，README 内容经镜像取得）
- [HuggingFace 模型卡 deepseek-ai/DeepSeek-V3](https://huggingface.co/deepseek-ai/DeepSeek-V3) —— 权重与推理框架推荐（直连受限，README 实际经 [hf-mirror 镜像](https://hf-mirror.com/deepseek-ai/DeepSeek-V3/raw/main/README.md) 取得）

**C 深度解读**
- [徐天乐：DeepSeek-V3 精读（系统视角）](https://www.xutianle.me/en/blog/deepseek-01-v3-technical-report/) —— 取用：成本拆分、YaRN 两阶段参数、评测口径限定
- [原力注入：V3 端到端推理 Pipeline 走读（61 层）](https://forceinjection.github.io/09_inference_system/vllm/module_analysis/deepseek_v3_inference_pipeline.html) —— 取用：DeepseekV3Config 全套超参、KV cache 576 维/1.8%、MTP 辅助层
- [Luning：DeepSeek MoE 从 v1 到 v3 的演进](https://wln20.github.io/posts/2025/09/dsmoe/) —— 取用：负载均衡三代对比、sigmoid vs softmax、160/6→256/8
- [armcvai：DeepSeekV3 论文解读](https://www.armcvai.cn/2025-02-08/deepseekv3-paper.html) —— 取用：节点受限路由 M=4 与代码、部署方案、GPU 小时拆分
- [Langbase：DeepSeek-V3 Benchmarks 全表](https://langbase.com/models/deep-seek/deepseek-v3/benchmarks) —— 取用：Table 3/6 全量基准数字
- [AI Pocket Reference：DeepSeek-v3](https://vectorinstitute.github.io/ai-pocket-reference/nlp/models/deepseek_v3.html) —— 取用：超参与 Base 表双源核对、YaRN/128K 确认
- [CodeSOTA：DeepSeek-V3 收录](https://www.codesota.com/model/deepseek-v3) —— 取用：MMLU/MATH/SWE 交叉核对（LiveCodeBench 49.2 差异已标待核实）

**D 视频（前两条含你手写笔记原有内容）**
- [DeepSeek-V3 技术报告详细解读-1](https://www.bilibili.com/video/BV1WYFQeGEf1/) —— 手写收录
- [DeepSeek-V3 技术报告详细解读-2](https://www.bilibili.com/video/BV1HqFQezEMt) —— 手写收录
- [DeepSeek-V3 论文中的隐藏细节](https://www.bilibili.com/video/BV15XFQebEBM) —— 手写收录
- [80 分钟精读 DeepSeek V3 技术报告](https://www.bilibili.com/video/BV1mkNPebEUU) —— 搜索发现（21.1 万播放）
- [老石谈芯：DeepSeek-V3 解读](https://www.bilibili.com/video/BV1Yh4y1p7ZE) —— 搜索发现（10.6 万播放）
- [矿大·Serverless：DeepSeek-V3 论文精读](https://www.bilibili.com/video/BV1N5411G7nd) —— 搜索发现（6.4 万播放）

## ⑪ 核心术语表（中英对照）

| 英文 | 中文 | 一句话解释 |
|------|------|-----------|
| Multi-head Latent Attention (MLA) | 多头潜在注意力 | K/V 低秩压成 latent 只缓存压缩态，注意力时虚拟展开 |
| Low-Rank Joint Compression | 低秩联合压缩 | K、V 共用一次下行投影（式1/2/5），压掉二者冗余 |
| Decoupled RoPE | 解耦旋转位置编码 | 位置信息走独立 64 维通道，保住权重吸收与低秩压缩的兼容 |
| Absorbed Inference | 吸收式推理 | 由结合律把 W^UK/W^UV 吸进 Q/O 投影，推理不显式重建 K/V |
| DeepSeekMoE | 细粒度混合专家 | 共享专家 + 细粒度路由专家的 MoE 配方（1+256，top-8） |
| Auxiliary-Loss-Free Load Balancing | 无辅助损失负载均衡 | 可调 bias 只改路由选择、不进梯度的均衡方案 |
| Sigmoid Gating | sigmoid 门控 | 每个专家独立打分（式15），区别于 softmax 归一化竞争 |
| Expert / Router | 专家 / 路由器 | 专家=一个 FFN 变换簇；路由器=token 与专家质心相似度打分 |
| Shared Expert | 共享专家 | 所有 token 必经的专家（N_s=1），承接通用知识 |
| Auxiliary Loss | 辅助损失 | 为均衡负载加进损失的项；V3 只留序列级 α=1e-4 |
| Router Z-loss | 路由 Z 损失 | 压路由 logits 量级防数值爆炸的先例项（ST-MoE，V3 未用） |
| Sequence-Wise / Batch-Wise Balance | 序列级 / 批级均衡 | 约束作用域；§4.5.3 证明收益来自放松到批级 |
| Node-Limited Routing | 节点受限路由 | 每 token 最多跨 4 节点，压 All-to-All 成本 |
| Multi-Token Prediction (MTP) | 多 token 预测 | 训练多预测未来 token 加信号，推理做投机草稿 |
| Self-Speculation | 自投机解码 | 用自身 MTP 头当草稿模型，不外挂小模型 |
| Acceptance Rate | 接受率 | 草稿 token 被主模型一次验证通过的比例（V3: 85–90%） |
| DualPipe | 双向流水并行 | 双向调度流水线，把通信藏进计算气泡 |
| Pipeline / Expert / Tensor Parallelism (PP/EP/TP) | 流水 / 专家 / 张量并行 | V3 用 PP16+EP64、不用 TP（通信代价太高） |
| ZeRO-1 | 分片优化器状态 | 只在 DP 组间分片 Adam 状态的显存优化 |
| All-to-All Communication | 全互联通信 | MoE dispatch/combine 的原语；IB 跨节点 + NVLink 节点内 |
| Warp Specialization | 线程束特化 | 专职通信/计算线程分工（V3 用 20 SM 跑通信） |
| FP8 Fine-Grained Quantization | FP8 细粒度量化 | 1×128/128×128 分组缩放对抗离群值 |
| E4M3 / E5M2 | FP8 浮点格式 | 4 位指数 3 位尾数 / 5 指数 2 尾数；V3 全量用 E4M3 |
| MMA / WGMMA | 矩阵乘累加指令 | Tensor Core 的底层指令；每 4 个 WGMMA 提升 FP32 累加一次 |
| Online Quantization | 在线量化 | 每次 GEMM 前当场算 scale 再量化（vs 用历史 max 的延迟量化） |
| Exponential Moving Average (EMA) | 指数滑动平均 | 参数平滑副本，放 CPU 异步更新用于早估效果 |
| AdamW / Cosine Decay | 优化器 / 余弦衰减 | β=(0.9,0.95)、wd=0.1；LR 分段调度见 §4.5 |
| Byte-Level BPE / FIM | 字节级 BPE / 填空训练 | 128K 词表分词；FIM 以 PSM 结构、比例 0.1 注入填空能力 |
| Token Boundary Bias | token 边界偏差 | 合并"标点+换行"token 在多行提示下的切分偏差 |
| Redundant Experts | 冗余专家 | 按在线负载复制高载专家，推理侧负载均衡手段 |
| IBGDA | 网卡直写显存 | InfiniBand GPU 直接寻址，降解码 all-to-all 延迟 |
| Group Relative Policy Optimization (GRPO) | 组相对策略优化 | 用组内相对奖励替代价值网络的 RL 算法（后训练用） |
| Critic / Value Network | 价值网络 | PPO 估 baseline 用的同规模网络，GRPO 直接删掉 |
| Reward Model (RM) / Rule-Based Reward | 奖励模型 / 规则奖励 | 模型打分 vs 可验证规则打分的双轨奖励设计 |
| Rejection Sampling | 拒绝采样 | 按规则/打分筛掉低质生成，沉淀高质量 SFT 数据 |
| Constitutional AI / Self-Rewarding | 宪法式 AI / 自奖励 | 用模型自身投票与规则清单当主观题反馈源 |
| Supervised Fine-Tuning (SFT) | 监督微调 | 用高质量（含 R1 蒸馏）样本做指令对齐（V3: 1.5M 条） |
| Needle In A Haystack (NIAH) | 大海捞针 | 长文任意位置藏信息考检索稳定性的压测 |
| YaRN | YaRN 长文扩展 | RoPE 频率分段插值 + 温度补偿的上下文扩展法 |
| Speculative Decoding | 投机解码 | 草稿小步快跑、大模型一次并行验证 |
| GPQA / AIME / MATH-500 | 高难度评测集 | 博士级科学 / 奥数 / 数学题集，V3 数学断层领先主战场 |
| LiveCodeBench / SWE-bench Verified / Codeforces | 代码评测集 | 算法赛题 / 真实仓库修 bug / 竞赛百分位三种代码考法 |

词汇页：[本篇词汇](../study/vocab/15_DeepSeek-V3_论文词汇.html) · [本篇听力](../study/listen/15_DeepSeek-V3_单词听力.html)
