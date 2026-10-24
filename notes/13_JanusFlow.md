---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 13 · JanusFlow 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [JanusFlow CVPR 2025 Open Access 页](https://openaccess.thecvf.com/content/CVPR2025/html/Ma_JanusFlow_Harmonizing_Autoregression_and_Rectified_Flow_for_Unified_Multimodal_Understanding_CVPR_2025_paper.html) — 正式收录版（pp.7739-7751），附 PDF 与补充材料
- [GitHub 官方仓库 deepseek-ai/Janus（含 JanusFlow 实现与项目页）](https://github.com/deepseek-ai/Janus)
- [HuggingFace 模型卡 JanusFlow-1.3B](https://huggingface.co/deepseek-ai/JanusFlow-1.3B) — 官方权重
- [From Janus to Janus-Pro（知乎）](https://zhuanlan.zhihu.com/p/20582287990) — 系列演进解读里覆盖「自回归+Rectified Flow」路线

### 视频（B站 / YouTube）
- [YouTube] [DeepSeek Janus-Pro: DeepSeek's Revolution in Multimodal AI?](https://www.youtube.com/watch?v=RQ-0LkpUNro) — 同时覆盖 Janus 与 JanusFlow（JanusFlow 未检索到单篇视频）
- [JanusFlow CVPR 2025 Poster 虚拟页](https://cvpr.thecvf.com/virtual/2025/poster/34669) — 官方 poster 页与讲解材料

### 英文 & 社区
- [Hugging Face 论文页](https://huggingface.co/papers/2411.07975) — 收录页与讨论

### 全系列综述（含本篇）
- [DeepSeek 技术路线图（yudonglee）](https://yudonglee.me/deepseek-roadmap/)
- [fengweifeng DeepSeek 论文库](https://fengweifeng.com/deepseek-papers/) — 对「自回归 + Rectified Flow」路线有专门讨论
- [知乎：10 篇论文读懂 DeepSeek 技术演进脉络](https://zhuanlan.zhihu.com/p/2036459670894810864)

---

# 自回归 + Rectified Flow 统一建模完整流程（含所有疑问点）

## 角色与核心思想

- **LLM**：同一个 1.3B Transformer，既做理解（逐词自回归预测下一个 token），又做生成（在图像段反复输出"整张图的速度场"）。
- **两套视觉通道**：理解用预训练 SigLIP 提语义特征；生成用从零初始化的轻量 ConvNeXt 编/解码器 + SDXL-VAE latent 空间。**两套各自独立，不共享。**
- **核心思想**：抛弃"把图像也离散成 VQ 词元"的思路（那是 Janus 的做法，被 tokenizer 质量卡住上限），改为——**序列前半段还是正常的自回归文本，图像"段"改成一小块连续 latent 占位，模型在这占位上跑 Rectified Flow：学一条从高斯噪声到目标图的直线速度场，推理时用一个欧拉法反复积分到 t=1 出图**。再配两个保命招：解耦双编码器（防两任务互相打架）+ 表示对齐正则（让生成段的内部特征向理解编码器的语义空间靠拢）。
- **整套推演里谁在动**：理解阶段动的是"词位"；生成阶段动的是"整块 z_t 状态"，一个 Euler 步 = LLM 一次前向 = 全图速度场刷新一次，重复到 t=1。

---

## 阶段一：备料——先数清这套系统的零件（架构）

按原文第 3.2/4.1 节清点：

```
零件清单：
  LLM        = DeepSeek-LLM 1.3B（增强版），24 个 transformer 块，序列长度 4096
  f_enc      = SigLIP-Large-Patch/16（预训练，~300M 参数）—— 只管理解
  g_enc      = 2×2 patchify + 2 个 ConvNeXt 块 + 线性层（从零初始化）—— 只管生成
  g_dec      = 2 个 ConvNeXt 块 + pixel-shuffle 上采样 + 线性层（从零初始化）—— 只管生成
  VAE        = 预训练 SDXL-VAE，生成全程在它的 latent 空间跑
  另记       = g_enc 与 g_dec 之间有一条 long skip connection（架构图 2 中省略了 VAE 编码器和它）
  总账       = g_enc + g_dec 加起来才 ~70M 参数；"极简改造"就是指它
```

**疑问点①：为什么不再用 VQ tokenizer 把图像也变成"词"，一个模型自回归到底？**

VQ 路线（Chameleon、LWM、VILA-U、Janus 都属此类）实现简单，但原文第 2 节说得很直接：这类方法 **"inherently limited by their image tokenization quality"——天生被 tokenizer 的重建质量卡上限**。词元表就那么大，图像细节全靠量化码本硬撑。JanusFlow 换打法：不造词元，直接在 SDXL-VAE 的连续 latent 空间跑 RF，把"图像怎么表示"这一层的上限从 tokenizer 换成了 VAE + 速度场学习。

**疑问点②：一个 LLM 前两次任务，输入长得一样吗？**

不一样，两段式混在一条序列里：

```
理解任务序列： [文本token…] [BOI] [SigLIP特征图→展平→线性投影 的 H_im×W_im 段] [EOI] […回答token]
生成任务序列： [文本条件x_con…] [BOI] [g_enc(z_t) 的 H_gen×W_gen 段] (+ 1 个时间槽) → 输出速度场
```

图像前后加 `|BOI|` / `|EOI|` 特殊 token，帮模型在序列里定位图像段（原文 3.2，与 Janus/Show-o/Transfusion 同一惯例）。

**疑问点③：z_t 是连续向量，LLM 明明是"吃 embedding、吐 embedding"，维度怎么对上？**

g_enc 负责翻译进、g_dec 负责翻译出：z_t（形如 H_latent×W_latent×D_latent 的 latent）先被 g_enc 编成 H_gen·W_gen 个 D_emb 维 embedding，混入 LLM 的词 embedding 一起进注意力；LLM 对应这些位置的输出再被 g_dec 变回 latent 形状的速度向量。**LLM 从头到尾只见过 D_emb 维向量，"连续 latent"对它来说只是一批普通 embedding。**

**疑问点④：这个 H_gen、W_gen 是多少？**

原文没有直接印数字，但给了硬约束：为了做表示对齐，作者**故意把 g_enc/g_dec 配置成 H_gen = H_im、W_gen = W_im**（原文 3.4）。384×384 分辨率下 SigLIP Patch/16 就是 24×24（Patch/16 的几何，384/16=24），所以生成段的占位与理解段特征图等大——这步是从原文条件推出来的尺寸算术，参数本身以代码为准。

---

## 阶段二：先补课——Rectified Flow 训练时学的是什么（式 2–3）

RF 只有一条核心公式。设图像 latent 数据为 x（分布 π₁），噪声 z₀ ~ N(0,I)（π₀）：

```
训练：  随机抽 t∈[0,1]，把两点连成直线上的一个中间点:
          z_t = t·x + (1−t)·z_0
        让网络 v(z_t, t) 回归这条直线的方向（直线的全丈量向量）:
          min  E[ ‖ v(z_t, t) − (x − z_0) ‖² ]
推理：  解常微分方程 d z_t/dt = v(z_t, t)，从 z_0 (纯噪声) 积到 t=1:
          z_(t+dt) = z_t + v(z_t, t)·dt     ← 标准欧拉步(式4), dt 是自己定的步长
        积分终点 z_1 就落在数据分布 π₁ 里 → VAE 解码成图
```

**疑问点⑤：为什么说 RF 是"直线"的、所以可以少步采样？**

看推导链：训练目标（式 3）就是让速度场处处指向"连接一个随机噪声点与一个数据点的直线"的方向 (x−z₀)。**若理想情况下网络的容量足够、目标完全收敛，最优速度场把基本分布 π₀ 直接送成数据分布 π₁（原文 3.1 的原话）**——轨迹近似直线的含义是：每一步的"方向修正"很小，欧拉法几步就能沿直线走完；而传统扩散模型的去噪轨迹是弯的，步数少了就偏离。 RF 推理一步的代价也极简：一次前向出一个恒定方向向量，不加噪声项、纯确定性的积分。

要诚实补一句：本文**成片没有炫耀"一步出图"**——主结果用 30 步采样、CFG 因子 w=2（原文 4.4）；附录 C 扫参显示"采样步数的影响相对较小"（原文原话：the number of sampling steps shows relatively minor influence on performance），30 步是质量/算力的折中。RFC 的"能少步"是能力边界，不是本文默认用法。

**疑问点⑥：这个速度场每个时刻是"一张图"还是一个"更新量"？**

一个更新量。v 是 D_latent_whole 的向量——**整张图所有 latent 通道的变化速度合在一起**，不是一张可见的图。所以每步欧拉算完 z_t 只是"离真实图更近一点的 latent"，要等 t=1 后再走 VAE 解码器才变成人眼的图。

---

## 阶段三：推理时间线——一张图是怎么被"杂交"出来的（主推演）

文字条件 x^con 已定（比如"一只戴宇航员的猫"），BoI 已开始生成：

```
第0步（t=0）:
   ① z_0 ~ N(0,I)  采样一批纯噪声 latent
   ② 序列 = [ x^con 的所有文本token… ] [BOI] [ g_enc(z_0) 的576格 ] [ 时间槽: t=0 ]
   ③ LLM 一次前向（因果注意力），对 576 个位置各出一个输出
   ④ g_dec 把这些输出拼回 latent 形状 → 速度场 v(z_0, 0 | x^con)
   ⑤ CFG 加权: v = w·v(有条件) + (1−w)·v(无条件)，w≥1（本文主结果 w=2）
      无条件那次 = 同一模型在"文本条件被清空"时的再次前向
   ⑥ 欧拉步: z_(0+dt) = z_0 + v·dt        ← dt=1/N，N=步数
第1步（t=dt）:
   输入里的 z_0 换成 z_dt，时间槽换成 t=dt，重复 ①②③④⑤⑥
第N步（t=1）:
   得到 z_1 → SDXL-VAE 解码器 → 最终图像
```

总前向代价 = N 步 ×（有条件+无条件 = 2 次）前向，每一步都覆盖全图状态。**这张图从进入生成段到完成，共 N 步循环；对比 Janus（VQ 版）：图像段是持续的 576 个词位，逐词"挤牙膏"式产出**，JanusFlow 的图像段不放词，一个时间步就输出"全图变化的场"一次——这就是"为什么不用 RF 就要一次又一次刷整图状态却更省事"的答案。

**疑问点⑦：生成阶段的序列，是"变长"还是"刷新"？**

刷新，不增长。AR 段（文本条件+BoI）可类比"前缀"，只加不减；图像段那 576+1 个位置**每一步被重新填入新 z 和新 t 的 embedding**，旧的 z 换掉。所以生成一张图的序列长度恒定（约等于条件长度+577），不像 VQ 版那样随图像词元数线性拉长。

**疑问点⑧：为什么图像段这些位置之间全部用因果注意力也行，不用全可见（双向）掩码？**

原文 3.2 明确写了：他们试过其它掩码方案，**"初步实验显示没有收益"**（ our preliminary experiments showed no performance benefits from alternative masking schemes），所以干脆直接用 causal attention 统一两种任务——还顺带省掉了 Show-o/Transfusion 这类方案里专门为扩散段设计的掩码工程。这一条的设计理由就是"试过了，不亏"，别读过深。

**疑问点⑨：skip connection 干嘛的？**

原文 3.2：g_enc 与 g_dec 之间有 long skip connection，遵循已有扩散模型的通行做法（引的方向是 DiT/hourglass diffusion 一脉）。它把编码器的浅层细节特征**绕过 LLM 直达解码器**，解出更贴近 latent 原貌的速度场。人是"细节真钞空心"，Transformer 负责语义节奏、ConvNeXt 小路负责底层纹理。

---

## 阶段四：三个损失怎么加在一起（式 6–8）

训练时每条数据被拆成"条件 x^con + 响应 x^res"，θ 是全部可训参数（LLM、f_enc、g_enc、g_dec、线性层）：

```
理解数据用（式6）:
   L_AR = − E[ Σ (从 i=ℓ_con 到 ℓ−1) log P(x_(i+1) | x_1…x_i) ]
          只在响应段的 token 上算损失

生成数据用（式7 + 式8）:
   L_RF   = E[ ‖ v_θ(z_t, t | x^con) − (x^res − z_0) ‖² ]
            z_t = t·x^res + (1−t)·z_0
            t 从 logit-normal 分布抽（照抄 SD3 的做法）
            训练时随机丢 10% 的文本 prompt → 为 CFG 推理做准备

   L_REPA = − E[ sim( stop_grad( f_enc(x^res) ) , h_φ( q_θ(z_t) ) ) ]
            q_θ(z_t) = LLM 第 6 块之后的中间特征
            h_φ = 3 层小 MLP，投到 D_enc 维
            sim = 逐元素余弦相似度取平均
            取值条件: z_t 掺了噪声也能与"干净图的 SigLIP 语义特征"对齐
```

三目标都用在全部训练阶段：理解任务 L_AR，生成任务 L_RF + L_REPA（原文 3.4 Summary）。

**疑问点⑩：REPA 是"KL/SVD 之类的正则"吗？**

不是。它比那朴素得多：**一个余弦相似度的对齐损失**（式 8），没有 KL、没有 SVD。动机来自 REPA 原论文（本文参考文献 [103]）：给扩散 transformer 加"中间表示对齐到语义编码器"这一针，能明显加速收敛、提升泛化。JanusFlow 解耦编码器设计恰好白送了这个条件——理解编码器 f_enc 一直像理解任务里那样运行，随时可以对齐。

**疑问点⑪：L_REPA 的梯度会倒灌回 SigLIP 打坏理解能力吗？**

不会。式 8 里 stop_grad() 括在 f_enc(x^res) 一侧，**梯度只推 h_φ（MLP）与 q_θ（LLM 内部特征），不回传到理解编码器**（原文明说：The gradient of L_REPA is not back-propagated through the understanding encoder）。SigLIP 的语义特征是固定的"靶子"，生成段的特征去贴靶子，靶子不动。

**疑问点⑫：stop_grad 前的 f_enc 应该跟生成端用同一个图版安排吗？**

对齐要成立得先形状对得上。作者**故意把 g_enc/g_dec 的配置调成 H_gen=H_im、W_gen=W_im**，再把 LLM 中间特征 reshape 成 H_gen×W_gen×D_enc，就能跟 SigLIP 特征逐位置算余弦。这也是"为什么上文疑问④敢推 24×24"的调度依据。

---

## 阶段五：三阶段训练配方（原文 3.3、表 1）

```
阶段1  适配新零件     只训随机初始化的：线性层、g_enc、g_dec
                     → 让这些"新生儿"跟预训练的 LLM/SigLIP 配平
                     10,000 步  batch 512  lr 1.0×10⁻⁴ 恒定
                     数据比（理解:生成:纯文本）= 50:50:0

阶段2  统一预训练     训除 SigLIP 外的一切
                     390,000 步  batch 512  lr 1×10⁻⁴ 恒定
                     数据比 = 14:80:6（生成大头）；
                     前 10,000 步特例 30:50:20 —— 先猛喂理解数据，
                     再加码生成（扩散类模型收敛吞数据，后段多喂）
                     纯文本 6% 保底语言能力（直接用 DeepSeek-LLM 语料）

阶段3  指令微调SFT   对话、任务对话、高质量文本→图指令混合微调
                     26,000 步  batch 256  lr 2.0×10⁻⁵ 恒定
                     数据比 = 21:70:9
                     → 这一阶段才解冻 SigLIP encoder
```

三个阶段统一用 AdamW（β₁=0.9, β₂=0.95）、weight decay 0、梯度裁剪 1.0、EMA 比 0.99；每条序列 4096、多条 packed 塞一行；模型基于 HAI-LLM 平台、NVIDIA A100 训练，**每个模型约 1,600 A100 GPU 天**（原文 4.1）。

**疑问点⑬：为什么阶段1只训新件、阶段2才全员训练、SigLIP 却拖到阶段3才解冻？**

三个目的层层接力：(a) 阶段1 是"初始化"——全新从零的 70M 小模块若一开始就接受 390k 步大混合数据的锤打，会拿全尺寸损失噪声冲垮预训练好的 LLM 权重；(b) 阶段2 冻住 SigLIP 是 MLLM 预训练惯例（LLaVA、DeepSeek-VL 都这么干），别让统一文本-图像对齐这些粗数据污染理解编码器；(c) 阶段3 是指令微调，数据质量高、风格贴近最终用户体验，此时解锁 SigLIP 让语义编码器跟着 instruction 的口味再精调一版（同 Janus/DeepSeek-VL/展示过的同期实践）。

**疑问点⑭：同一套权重既要理解又要生成，不会两件事互相拖累吗？**

这是本文最关键的消融证据（原文表 6，全部在 256×256 消融条件、统一预训练 50,000 步，FID 为 MJHQ FID-10k 且 w=7.5、30 步）：

```
表6 精选（F=最终配置）:
  A 不加REPA、SigLIP理解   : POPE 82.40  VQAv2 69.62  GQA 54.43  FID 19.84  CLIP 24.94
  F 加REPA、SigLIP解耦理解 : POPE 84.73  VQAv2 69.20  GQA 54.83  FID 17.61  CLIP 26.40  ← 全面更好

  B 共享ConvNeXt编码器(Transfusion式): POPE 78.13  VQAv2 53.94  GQA 44.04  FID 18.05
  C 独立但换成同类ConvNeXt当理解编码器:过分独立但不用SigLIP → POPE 75.30  FID 17.53
  → 共享编码器与"用同构新网络当理解编码器"都会拉胯理解；F 用 SigLIP 才是正解

  D 只做理解(同数据比例): POPE 85.03  VQAv2 69.10  GQA 54.23
  E 只做生成(同数据比例): FID 16.69  CLIP 26.89
  → 统一模型 F 与任务专用 D/E 的差距很小（GRADING:
    F 得到"两项全能"几乎没交学费: POPE 84.73 vs 85.03, FID 17.61 vs 16.69）
```

这套对比回答了两个问题：理解/生成冲突的真正来源是**编码器纠缠**（B 差的 POPE 就是证据），而"不专注"的代价比直觉小得多。

---

## 关键数字与实验

| 指标 | 本文（JanusFlow，1.3B，384×384） | 关键对照 | 出处 |
|---|---|---|---|
| GenEval 总分 | **0.63**（子项: 单目标 0.97 / 双目标 0.59 / 计数 0.45 / 颜色 0.83 / 位置 0.53 / 颜色属性 0.42） | Janus 0.61 / Show-o 0.53 / SDXL 0.55 / DALL-E 2 0.52；Transfusion 0.63（7.3B） | 原文表2 |
| MJHQ FID-30k | **9.51**（w=2、30 步） | Janus 10.10 / Show-o 15.18 / VILA-U-384 7.69（7B） | 原文表4 |
| DPG-Bench | **80.09%**（全局 87.03 / 实体 87.31 / 属性 87.39 / 关系 89.79 / 其他 88.10） | PixArt-Σ 80.54 / Emu3-Gen 80.60 / SDXL 74.65 | 原文表3 |
| MMBench-dev | **74.9** | Janus 69.4 / Show-o — / LLaVA-v1.5（7B）64.3 | 原文表5 |
| SEED | **70.5** | Janus 63.7 / Emu3-Chat（8B）68.2 | 原文表5 |
| GQA | **60.3** | Janus 59.1 / Qwen-VL-Chat（7B）57.5 | 原文表5 |
| POPE | **88.0** | Janus 87.0 | 原文表5 |
| VQAv2 test | **79.8** | Janus 77.3 / LLaVA-v1.5 78.5 | 原文表5 |
| MMMU | 29.3 | Janus 30.5 | 原文表5 |
| MM-Vet | 30.9 | Janus 34.3 | 原文表5 |
| 训练开销 | ≈1,600 A100 GPU 天/模型 | — | 原文4.1 |

（附录 A 另有 256×256 版对照：GenEval 0.70、FID 12.70、DPG-Bench 81.23——分辨率低了语义跟随类指标反而更好，原文归因于低分辨率下语义更好控。）

---

## 全局数据流总表

| 阶段 | 谁在动 | 产出 | 是否前向 | 代价 |
|---|---|---|---|---|
| 1. 条件编码 | 文本 token 进 LLM，SigLIP/`g_enc` 进图像侧 | 混合序列（理解/生成分叉） | 1 次小前向（SigLIP/g_enc） | 轻 |
| 2. 自回归文本段 | LLM 逐词预测 | 理解回答 或 文本条件+BoI | 每词1次（KV 缓存逐位前向） | 标准 LLM 开销 |
| 3. 采样 z₀ | 从 N(0,I) 抽噪声 latent | 生成段的 576 格初值 | 无 | 免费（抽签） |
| 4. 单个欧拉步 | LLM（对 576+1 位置）+ g_dec + CFG | 全图速度场 → 更新一步 z | 有条件+无条件各1次 | **贵的主体：×2×N步** |
| 5. 终点解码 | SDXL-VAE 解码器 t=1 的 z₁ | 最终图像 | 1 次 | 轻 |
| 6. REPA 正则（仅训练） | stop_grad(SigLIP) + 第6层特征 MLP | 对齐余弦损失 | 复用前向中间量 | 训练时轻 |

**LLM 在生成一张图里的开销主体：N 个欧拉步 × 2（有/无条件） ≈ 60 次全图覆盖式前向（N=30 时），且序列长度恒定，不随图像"变长"。**

---

## 所有疑问点速查

| 疑问 | 答案 |
|---|---|
| ① 为什么不继续 VQ 离散化？ | VQ 天生被 tokenizer 重建质量卡上限；改成连续 latent + RF 绕开 |
| ② 两种任务输入序列一样吗？ | 不一样：理解=数据训练SigLIP段+后续token；生成=文本条件+576格z+时间槽 |
| ③ 连续 latent 怎么进 LLM？ | g_enc/g_dec 双向翻译成 D_emb 维 embedding，LLM 无感知 |
| ④ 图像段几格？ | 原文要求 H_gen=H_im、W_gen=W_im；384 下 SigLIP Patch/16 即 24×24 |
| ⑤ 为什么 RF 是直线、可少步？ | 式3的训练目标就是拉上直线的恒定方向 (x−z₀)；轨迹近似直线时欧拉少步误差小；但本文成片实际用 30 步 |
| ⑥ 速度场是图还是更新量？ | 更新量（整图 latent 的变化速度），等 t=1 才出来图 |
| ⑦ 生成时序列是变长还是刷新？ | 不加长：576+1 格每步被重填新 z、新 t |
| ⑧ 因果注意力够用吗？ | 原文初步实验：其它掩码无收益 → 直接用 causal |
| ⑨ skip connection 干嘛？ | g_enc→g_dec 的长跳连，绕过 LLM 送底层细节 |
| ⑩ REPA 是 KL/SVD 正则吗？ | 不是，是余弦对齐损失（式8），动机引 REPA [103] |
| ⑪ REPA 梯度会打坏 SigLIP 吗？ | stop_grad 括在 SigLIP 侧，梯度不回传理解编码器 |
| ⑫ 共用一个模型两任务会拖累吗？ | 表6：统一 F 与任务专属 D/E 差距小；真正的坑在共享编码器（B 的 POPE 78.13） |
| ⑬ 为什么三阶段这样切分、SigLIP 到阶段3才解冻？ | 新件先适应、全员再拉练、指令阶段才动理解编码器（与 LLaVA/DeepSeek-VL 惯例一致） |

---

## 一句话总括

**同一条 1.3B 自回归序列，前半段照常逐词预测（理解/文本条件），后半段不给图像造词，而是放 576 格连续 latent 占位+1 个时间槽，让 LLM 用因果注意力学一个"从高斯噪声直线驶向目标图"的速度场，推理时 CFG 加权+欧拉法 30 步积分到 t=1、SDXL-VAE 解码出图；训练用 交叉熵（理解）+ MSE 速度回归（生成）+ 余弦对齐正则（REPA，SigLIP 特征当固定靶子）三头并进，三阶段逐步解锁组件，1600 A100 GPU 天在 GenEval/FID/理解榜上同时追平 1.3B 专用模型。** 与 Janus（VQ 版）比，换来的是摆脱 tokenizer 上限；与 Transfusion 一类共享编码器方案比，换来的是"解耦双编码器 + 表示对齐"两个几乎零架构代价的性能增益。

---

## 参考与延伸阅读

- [arXiv 原文页](https://arxiv.org/abs/2411.07975) — 论文摘要与元信息（v2 为 CVPR 2025 收录版）
- [arXiv HTML 全文](https://arxiv.org/html/2411.07975v2) — 本笔记全部公式编号（式 2–8）、表格数据（表 1–6、附录）的出处
- [JanusFlow CVPR 2025 Open Access 页](https://openaccess.thecvf.com/content/CVPR2025/html/Ma_JanusFlow_Harmonizing_Autoregression_and_Rectified_Flow_for_Unified_Multimodal_Understanding_CVPR_2025_paper.html) — 正式收录版
- [GitHub 官方仓库 deepseek-ai/Janus（含 JanusFlow）](https://github.com/deepseek-ai/Janus) — weights 与项目页
- [HuggingFace 模型卡 JanusFlow-1.3B](https://huggingface.co/deepseek-ai/JanusFlow-1.3B) — 官方权重
- 本篇词汇：[本篇词汇](../study/vocab/13_JanusFlow_论文词汇.html) · [本篇听力](../study/listen/13_JanusFlow_单词听力.html)
- 本文件上方「全网解读资源」小节另有知乎/B站的多篇拆解可交叉验证
- 系列对照：Janus（arXiv:2410.13848）是本文的 VQ 前作；REPA（arXiv:2410.06940）是本文对齐正则的来源论文


