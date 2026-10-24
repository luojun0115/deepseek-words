---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 05 · DeepSeek-VL 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [幻方/深度求索多模态大模型 DeepSeek-VL（知乎）](https://zhuanlan.zhihu.com/p/696505990) — 发布期中文介绍
- [[MLLM 算法推荐] DeepSeek-VL 更懂现实的模型（知乎）](https://zhuanlan.zhihu.com/p/686852476) — 技术向梳理：混合视觉编码器、数据构造与平衡多模态训练策略
- [DeepSeek-VL 论文解读（乔木博客）](https://blog.qiaomu.ai/deepseek-vl) — 1.3B/7B 核心目标：真实场景看图说话且不丢语言能力
- [数据到训练 pipeline，构建 real-world 多模态范式（yudonglee 系列）](https://yudonglee.me/deepseek-vl-explained/) — 中文精读：SigLIP-L + SAM-B 混合编码器与三支柱设计
- [DeepSeek-VL 中文评述（Moonlight）](https://www.themoonlight.io/zh/review/deepseek-vl-towards-real-world-vision-language-understanding) — 结构化评述
- [DeepSeek Vision Models: Janus, VL2, and OCR（Roboflow）](https://roboflow.com/blog/deepseek-vision-models) — 权威视觉平台博客，VL 作为主线起点

### 视频（B站 / YouTube）
- [YouTube] [逐篇讲解 DeepSeek 关键 9 篇论文及创新点](https://www.youtube.com/watch?v=j5CSpSqNCJw) — 系列含 DeepSeek-VL 章节（B站镜像：https://www.bilibili.com/video/BV1xuK5eREJi/ ）
- [B站] [逐篇讲解 DeepSeek 关键 9 篇论文及创新点](https://www.bilibili.com/video/BV1xuK5eREJi/) — 同系列 B 站版

### 英文 & 社区
- [Hugging Face 论文页](https://huggingface.co/papers/2403.05525) — 官方收录页与社区讨论
- [alphaXiv 论文页](https://www.alphaxiv.org/abs/2403.05525) — 可交互问答
- [DeepSeek-VL · Blog（DOCSAID 英文）](https://docsaid.org/en/blog/papers/deepseek/deepseek-vl) — 英文精读，双视觉编码器训练配方
- [Reddit 发布讨论帖](https://www.reddit.com/r/machinelearningnews/comments/1bdrrk7/deepseekai_introduces_deepseekvl_an_opensource/) — 发布时社区讨论
- [GitHub 官方仓库 deepseek-ai/deepseek-vl](https://github.com/deepseek-ai/deepseek-vl) — 权重、代码与 README

---

# 一张 1024×1024 图片进 DeepSeek-VL 的完整旅程（含所有疑问点）

## 角色与核心思想

2024 年初的处境：开源多模态模型榜单追得凶，真实体验却和 GPT-4V / Gemini 差一大截。原文在引言里点了四个病根：算力烧在指令微调、预训练太少；instruction 数据靠拼学术数据集，榜单会做、真人难用；视觉编码器分辨率低（大家都停在 336×336 / 448×448），读不清小字小目标；多模态训练把语言能力训垮（prolonged 多模态训练后语言退化）。

DeepSeek-VL 是对着这四条逐个开的药：

- **数据**：一手真实世界数据管线——网页截图、PDF、OCR、图表、知识类内容（专业知识、教科书），SFT 数据从真实用户场景建 taxonomy；
- **架构**：混合视觉编码器——SigLIP-L（文本对齐、384×384，管语义）+ SAM-B（纯视觉自监督、1024×1024，管细节），把一张 1024×1024 的图压进固定 576 个视觉 token；
- **训练**：从第一个 step 起就混语言数据训，语言 ≥70%，外加 modality warm-up 退火。

整套推演里谁在动：

```
一张图 (resize 成两份)
  ├─ SAM-B（纯视觉, ViTDet 预训练）→ 低层细节/grounding 特征
  └─ SigLIP-L（文本对齐）          → 高层语义特征
        ↓ 沿通道拼接
   VL Adaptor（混合两层 MLP）      → 576 个 2048 维视觉 token
        ↓ 与文本 token 排进同一条序列
   DeepSeek-LLM（分阶段解冻）      → 只对语言部分算 next-token loss
```

---

## 阶段零：数据哲学——这张图属于哪一类、为什么值得学

先说一个容易搞混的点：**数据类别不做编码器分工**。几十类数据是给整个模型学世界知识的（长进 LLM 权重里），两条编码器流的分工由架构决定（阶段一）。数据侧的任务是把「真实世界该见过的东西」收集全。

联合预训练数据配比（原文表 1，合计 100%）：

| 类别 | 占比 | 代表来源 |
|---|---|---|
| 图文交错 | 13.1% | MMC4、Wikipedia 中英、Wikihow、in-house PDF/EPub 教材 |
| 图像描述 | 11.1% | CapsFusion、TaiSu、Detailed Caption |
| 表格与图表 | 2.1% | Chart2text、Unichart、ScreenQA、SciGraphQA、ScienceQA 等 |
| 网页代码 | 0.4% | Websight（UI 逆渲染）+ 自建管线（下述） |
| 场景文字 OCR | 1.2% | ArT、LSVT、TextOCR、HierText 等十个公开集 |
| 文档 OCR | 2.1% | 自建管线（下述） |
| 纯文本 | 70.0% | DeepSeek-LLM 2T 文本语料 |

两条值得盯住的自建管线（用的都是**真实材料渲染**，不是模型编故事）：

```
文档 OCR：
  1.4M 篇 arXiv 文章（源码+编译 PDF）→ Nougat 工具渲染成图-文对
  Anna's Archive 电子书 860K 英文 + 180K 中文 + 百万级 K-12 试题
  　→ HTML 模板渲染（wkhtmltopdf）成图-文对

网页代码：
  Stack 数据集 ~1.46M 个 Jupyter notebook
  　→ 抽出所有图 + 其前导代码 → 2M 图-码对
  　→ 过滤：单图 + 至少 5 行代码 → 留下 1.1M 对
```

**疑问点①：多模态数据已经海量，为什么纯文本还占七成？**
先看反例：原文拿 100% 多模态数据直训 LLM（stage 2，多模态：语言 = 100%:0%），多模态指标慢慢涨，语言指标断崖式下跌（原文图 4）。语言知识需要持续的纯文本训练保住——intro 里的结论句是「保持至少 70% 的语言数据对语言知识完整性 essential」。这七成不是保守，是实验定出来的下限（详见阶段五疑问点⑪）。

**疑问点②：这些数据与「用模型合成几百万条指令对」的路线差在哪？**
差在 SFT 的构建方式：不靠模型自问自答，而是先到网上**人工收集 GPT-4V 和 Gemini 的真实测试用例**，分析整理成一张 taxonomy（原文表 3，8 个主类：识别 Recognition、转换 Conversion、分析 Analysis、常识推理 Commonsense Reasoning、逻辑推理 Logical Reasoning、评价 Evaluation、多图 Multi-graph、安全 Safety；主类之下有二层/三层细类——电路图、流程图、乐谱、财务图、平面图、病理图都挂在「专业图表分析」下面），再按 taxonomy 给每张测试图配 prompt，造出 in-house 指令集。同一张 taxonomy 回头还用来搭人工评测集，保证「训什么就考什么」。最终 SFT 配比（原文表 2）：in-house taxonomy 数据 10.5%、通用多模态（ShareGPT4V、LAION-GPT4V 等）35.5%、表格图表 4.1%、网页代码 2.0%、纯文本 SFT 47.9%。

---

## 阶段一：为什么非要两个编码器

**疑问点③：把 SigLIP 换大、换成高分辨率版不就行了？为什么要叠一个 SAM？**
原文 3.1 节给了两个病根，而且换大 CLIP 一个都治不了：

1. **CLIP-blind pairs**：CLIP 家族（含 SigLIP）是文本对齐的语义编码器，视觉上差异明显的两张图会被编码得几乎一样（引 Tong et al., 2024「Eyes wide shut」）。这是语义对齐带来的病，不是分辨率问题，换大模型不解决。
2. **低分辨率天花板**：输入普遍停在 224/336/384/512，密集 OCR、视觉 grounding 这类要看小目标的任务直接受限。

所以走双流：语义交给文本对齐的 SigLIP-L（384×384 输入），细节与 grounding 交给**纯视觉自监督**的 SAM-B——其 image encoder 是 ViTDet 预训练的，接受 1024×1024 输入。编码器消融（原文图 10）实测：加入纯视觉自监督编码器后 stage 2 训练 loss 明显更优，最终定案 SigLIP+SAM。

分工一句话：SigLIP 管「这是什么 / 什么场景」的语义层；SAM 管「字在哪、边界在哪、小目标长啥样」的低层细节。

---

## 阶段二：高分辨率流——1024×1024 怎么压进 576 个 token

```
输入图 → resize 成 1024×1024
SAM-B 前向 → 特征图 64×64×256            （1024/16 = 64 个 patch 位置）

VL Adaptor：
  ① 插值（interpolate）→ 96×96×256
  ② 两层 stride=2 卷积 → 96→48→24，得 24×24×1024
  ③ reshape → 576 × 1024
```

**疑问点④：64×64 = 4096 个位置，全塞给 LLM 不就行了？为什么非要压到 576？**
算两笔账就明白。序列账：训练序列长度 4096（原文表 4），一张图占 4096 个 token 等于一句话就把上下文塞满，图文交错和多轮对话都别做了。钱账：注意力与 KV cache 随序列长度增长，推理成本跟着涨。所以原文的设计目标是「**固定 token 预算内**吃下高分辨率」（fixed token budget），并明说 576 这个数就是为了「图文交错与多轮推理可行」。对比参照：CLIP 家族 336×336 也出 24×24 = 576 个 token——DeepSeek-VL 在**同样的 token 预算**里吃进了 1024² 的原图信息。

**疑问点⑤：压缩的常规办法是平均池化或线性投影，为什么是「插值到 96×96 再两次 stride-2 卷积」？**
卷积核带可学权重，能学到「哪块相邻位置合并不丢信息」，比固定权重的平均池化表达力强。至于「为什么先插值到 96×96（4096 个位置反而先变多成 9216）再两次卷积压回 24×24」，原文没有给出论证——一个合理的读法是：两次步长 2 的卷积在更细的网格上逐步聚合感受野，而最终 24×24 与 SigLIP 流天然对齐（384/16 = 24，见阶段三）；此段归「待核实」，原文未展开。

**疑问点⑥：576 个 token 表示 1024×1024，平均一个 token 管约 43×43 像素，细节不就糊了吗？**
算透明账：24×24 网格对 64×64 patch 网格，每 token 聚合 64/24 ≈ 2.67 个 patch 一步，即每 token 覆盖约 7 个 SAM patch ≈ 42.7×42.7 像素。单 token 确实变粗，但关键是**压缩发生在高分辨率特征层内（卷积合并），而不是先降采样再编码**——细粒度信息在 SAM-B 特征图里先保住，再由可学卷积决定合并方式。效果侧证：OCR 病了没——OCRBench 7B 得 456（原文表 5），高于同规模 LLaVA-1.5 的 331；原文图 2 也展示它抓得住 tiny object。

---

## 阶段三：低分辨率流——SigLIP 管「这是什么」

```
输入图 → resize 成 384×384
SigLIP-L → 24×24 patch → 576 个 token，每个 1024 维
```

两条流精确同形：各 576 个 token、各 1024 维，正好一一对齐，为阶段四的通道拼接做准备。语义流负责回答「图里是什么主题、什么风格、什么场景」，细看不清没关系——那是 SAM 流的活。

---

## 阶段四：拼接与 adaptor——576×1024 + 576×1024 = 576×2048

```
高分辨流 576×1024 ──┐
                    ├─ 沿特征维拼接 → 576 × 2048
低分辨流 576×1024 ──┘
        ↓
各过一层独立 MLP（分别适配两条流的取值分布）
        ↓　再一层 MLP 变换到 LLM 输入空间
576 个 2048 维视觉 token，GeLU 激活 + embedding 层接入语言模型
```

**疑问点⑦：为什么不沿序列维拼成 1152 个 token？信息不是更无损吗？**
直觉没错，算力错了。原文引 Tong et al.：沿序列拼接确实可能更好，但序列加长带来算力代价。本文实测（原文表 10）：序列拼接方案（Token Pooling-W 平均 55.5、Token Pooling-H 54.2）都打不过通道拼接的 Hybrid MLP（55.9）——至少在本文的规模与数据下，通道拼接不掉点还省一半序列长度。所以「每 token 更粗但 token 数不变」的通道拼接胜出。

**疑问点⑧：adaptor 的「混合两层 MLP」到底怎么混？**
消融暴露的矛盾（原文表 10 + 3.1 文字）：全共享 MLP（平均 55.2）利于两条流的充分融合，但没法贴合各自特征的数值分布；全分开 MLP（54.5）能精调各流分布，但融合不足。混合策略：先各自一层 MLP 精调，再拼起来过一层 MLP 完成融合——55.9 最高，取长补短。

---

## 阶段五：进 LLM——什么时候进、怎么训

**疑问点⑨：视觉 token 是逐层插进 LLM，还是只在输入端进一次？**
只在输入端进一次：576 个视觉 token 与文本 token 排成同一条序列，作为 LLM 的输入 embedding。本文没有「每层 / 隔层插视觉」的设计——不动 LLM 结构，才有可能与 DeepSeek-LLM 上层完全复用（工程节明确说「上层与 DeepSeek-LLM 完全一样」，3D 并行因此现成）。每个视觉 token 2048 维，高 / 低分辨率流各占一半（1024）。

LLM 底座连线：

- DeepSeek-VL-1B ← DeepSeek-LLM-1B（已训约 500B 文本 token）
- DeepSeek-VL-7B ← DeepSeek-LLM-7B（已训约 2T 文本 token）
- 取预训练**中间 checkpoint** 续训； induces：微观设计跟 LLaMA——Pre-Norm + RMSNorm、SwiGLU FFN（中间维 8/3 d_model）、RoPE，tokenizer 与 DeepSeek-LLM 相同。

三分阶段，每一阶段谁解冻（原文图 3，只对语言部分算 next-token loss）：

```
          视觉编码器          VL Adaptor        LLM
Stage 1    全冻结               训练            冻结
Stage 2    冻结                 训练            训练
Stage 3    SAM-B 冻结           训练            训练
          （SigLIP-L 解冻）
```

**疑问点⑩：adaptor 热身（Stage 1）数据越多越好？**
不是，而且实测是负的。Stage 1 数据：ShareGPT4V 125 万图文对 + 250 万文档 OCR 渲染对。消融（原文表 8）：训练步数 2K→8K→20K→80K，随后直接 SFT 的平均分 57.5→55.1→55.5→55.6，不升反降。原文自问自答了原因：adaptor 只是两层 MLP，参数容量太小，装不下多模态知识，扩数据无益。所以 Stage 1 只需搭好「概念桥」，立刻解冻 LLM 进 Stage 2 承接大规模联合预训练。

**疑问点⑪：语言：多模态 = 7:3 这个比例怎么定下来的？**
1B 模型上扫配比（原文图 4）给出三条结论：(1) 掺语言数据显著缓解语言下滑；(2) 掺语言不显著损失多模态性能；(3) 两模态性能与其数据占比强相关——竞争关系坐实。逃不掉的取舍里取平衡：语言至少 70% 保语言知识，最终约 7:3。还有一道保险 **modality warm-up**：语言比例从 1.0 起步、逐渐退火到目标值（如 0.7）——一上来就固定比例掺新模态会不稳，退火换来训练全程更稳、末期两模态结果更好（原文图 9）。

**疑问点⑫：语料混着训还有工程坑吗？**
有。同一 batch 内混语言和多模态样本，反传要等最慢的样本跑完——快的纯文本 batch 干等慢的多模态 batch，效率被拖低。改法：**按 global step 分组**——某些 step 整批全语言、某些 step 整批全多模态。实测性能不掉，训练效率 +20%（原文图 8）。

**疑问点⑬：1.3B 模型榜单分跑不出来，怎么在放大到 7B 之前做可靠迭代？**
双招（引 Schaeffer et al., 2024：小规模生成式指标会「sharp and unpredictable」地跳变，尽管真实 error rate 平滑变化）：

1. **Multi-choice PPL 评测协议**：把问题 + 图 + 全部选项一起喂进网络，对每个选项位置算 PPL，取最小者为答案——绕开「其实知道答案、却吐不出那个格式」的假跳变。
2. **预训练期掺少量 SFT 数据**，让 1.3B 先学会照格式作答，指令跟随不再成为瓶颈。

效果：1B 上拿到合理表现，stage 2 的结论（编码器选型等）能传给 7B；stage 2 完的 1B 平均分从单 stage 1 的 57.4 涨到 61.7（原文表 9），三阶段全开 62.4。

训练成本与工程（原文表 4 与 3.3 节）：框架 HAI-LLM；把「视觉编码器 + 文本 embedding」整体看成 pipeline 第一层，它结构复杂不宜张量并行、但算力小——干脆在所有 TP rank 上**重算视觉编码器前向**；视觉编码器的存在使各层耗时不均，在 PP rank 间**重新切分层数**做负载均衡。7B 训了 5 天（64 节点 × 8 张 A100），1B 训 7 天（16 节点）。Stage 3 细节：SAM-B 因显存限制保持冻结，SigLIP-L / adaptor / LLM 解冻；只监督答案与特殊 token，屏蔽 system / user prompt。

---

## 关键数字与实验

| 指标 | DeepSeek-VL | 对照 | 出处 |
|---|---|---|---|
| MMB / MMC / SEED（7B） | 73.2 / 72.8 / 70.4 | GPT-4V SEED = 71.6 | 原文表 5 及正文 |
| OCRBench（7B） | 456 | LLaVA-1.5 = 331 | 原文表 5 |
| POPE / MathVista / MMVet（7B） | 88.1 / 36.1 / 41.5 | GPT-4V MathVista = 47.8 | 原文表 5 |
| MMMU / CMMMU（7B） | 36.6 / 37.9 | CogVLM 37.3 / 24.8 | 原文表 5 |
| 同款五项（1.3B） | 32.2 / 27.4 / 64.6 / 61.3 / 66.7（MMMU/CMMMU/MMB/MMC/SEED） | 优于 2.7B 级 MobileVLM V2 的 MMB 63.2 | 原文表 6 |
| HellaSwag（7B） | 68.4 | DeepSeek-LLM-7B = 68.5 | 原文表 7 |
| MMLU / AGIEval（7B） | 52.4 / 27.8 | DeepSeek-LLM-7B = 49.4 / 19.3（多模态训练反超） | 原文表 7 |
| GSM8K / MBPP（7B） | 55.0 / 35.2 | DeepSeek-LLM-7B = 63.0 / 35.2（数学仍有竞争损耗） | 原文表 7 |
| 训练阶段消融平均分 | 仅 S1 57.4 → S1+S2 61.7 → S1+S2+S3 62.4 | — | 原文表 9 |
| Stage 1 数据规模消融平均分 | 2K 步 57.5 → 80K 步 55.6（负收益） | — | 原文表 8 |
| Adaptor 消融平均分 | 混合 MLP 55.9 优于 共享 55.2 / 独立 54.5 / 序列拼接 55.5 与 54.2 | — | 原文表 10 |
| 人工评测 | 100 题七类；GPT-4V 裁判 99 题：对 Fuyu-8B、CogVLM-17B、InternLM-XComposer2-VL 胜率 >60%，与 GPT-4V 自身接近 | — | 原文 4.3 与图 6/7 |

---

## 全局数据流总表

一张图的旅程（尺寸逐站核对原文 3.1）：

| 步骤 | 输入 | 输出 | 谁在做 |
|---|---|---|---|
| 双路 resize | 原图 | 1024×1024 一份 + 384×384 一份 | 预处理 |
| SAM-B 前向 | 1024×1024 | 64×64×256 特征图（4096 位置） | 高分辨流 |
| 插值 | 64×64×256 | 96×96×256 | VL Adaptor |
| 两次 stride-2 卷积 | 96×96×256 | 24×24×1024 | VL Adaptor |
| reshape | 24×24×1024 | 576×1024 | VL Adaptor |
| SigLIP-L 前向 | 384×384 | 576×1024（24×24 patch） | 低分辨流 |
| 通道拼接 | 576×1024 + 576×1024 | 576×2048 | VL Adaptor |
| 混合 MLP（各一层→拼→再一层）+ GeLU + embedding | 576×2048 | 576 个视觉 token，进入 LLM | VL Adaptor |
| 序列拼排 + next-token 预测 | 视觉 token + 文本 token | 生成文本（只对语言部分算 loss） | DeepSeek-LLM |

三阶段训练账：

| 阶段 | 可训 | 冻结 | 主要数据 | 关键教训 |
|---|---|---|---|---|
| 1 热身 adaptor | Adaptor | 双编码器 + LLM | 125 万 caption + 250 万 OCR 对 | 数据扩了没用（表 8），够用就撤 |
| 2 联合预训练 | Adaptor + LLM | 双编码器 | 表 1 全集，语言:多模态 ≈7:3 + warm-up | 文本 70% 是语言能力下限；分组提效 20% |
| 3 SFT | Adaptor + LLM + SigLIP-L | SAM-B（显存） | 表 2 全集（原始 prompt 屏蔽） | 只监督答案与特殊 token |

---

## 所有疑问点速查

| 疑问 | 答案 |
|---|---|
| ① 文本为什么占 70%？ | 100% 多模态直训语言崩（图 4）；≥70% 文本是语言能力的实验下限 |
| ② 与合成指令数据差在哪？ | 真实用例 → taxonomy（8 主类）→ 按 taxonomy 配 prompt；真实渲染代替编造 |
| ③ 为什么不是更大的 SigLIP？ | CLIP-blind pairs 是对齐机制病，换大不治；分辨率另需 SAM-B 1024 输入 |
| ④ 为什么压到 576 token？ | 固定 token 预算：4096 个 token 一图占满 4096 序列预算，交错与多轮没得做 |
| ⑤ 为什么插值+两次卷积？ | 卷积带可学权重的合并优于固定池化；插值动机原文未展开（待核实） |
| ⑥ 一 token 管 43×43 像素不糊？ | 压缩发生在高分辨率特征层的可学卷积里，OCR 等细粒度分数侧证 |
| ⑦ 为什么不序列拼 1152？ | 表 10：通道拼接 55.9 优于序列拼接 55.5/54.2，且序列短一倍省算力 |
| ⑧ 混合 MLP 是什么混法？ | 各一条流先独立单层 MLP 调分布，再拼接过一层 MLP 融合（55.9 两头兼顾） |
| ⑨ 视觉 token 逐层插吗？ | 不插，输入端进一次；LLM 上层与 DeepSeek-LLM 完全一致，并行策略现成 |
| ⑩ Stage 1 数据越多越好？ | 反例：2K→80K 步平均分 57.5→55.6；adaptor 容量太小装不下知识 |
| ⑪ 7:3 怎么定？ | 图 4 扫配比：比例决定两模态性能且竞争；语言 ≥70% 保底，取 ~7:3 |
| ⑫ 混合训练的工程坑？ | 批内混要等最慢样本；按 global step 分组 → 效率 +20%、性能不掉 |
| ⑬ 小模型怎么可靠迭代？ | Multi-choice PPL 协议 + 预训练掺少量 SFT 数据，防指令跟随成为瓶颈 |

---

## 一句话总括

**一张图先被 resize 两份：1024×1024 走纯视觉的 SAM-B 出 64×64×256 特征图，384×384 走文本对齐的 SigLIP-L 出 576×1024 语义特征；前者经「插值到 96×96 → 两次 stride-2 卷积压回 24×24」变成 576×1024 细节特征，两条流精确同形、沿通道拼成 576×2048，经混合两层 MLP 打包成 576 个视觉 token 与文本同列进 DeepSeek-LLM——分辨率收益被塞进 token 维度而不是序列长度，推理成本锁死。配套的另一半是训练哲学：真实世界一手数据建认知、taxonomy 收口指令分布、语言数据始终 ≥70% 并 warm-up 退火、 adaptor 热身点到即止立刻解冻 LLM 联合预训练。** 这就是 DeepSeek-VL 用 7B 量级同时守住「看得细」和「说得好」的全部机关。

---

## 参考与延伸阅读

- [arXiv 摘要页](https://arxiv.org/abs/2403.05525) — Meta 信息与官方摘要
- [arXiv HTML 全文](https://arxiv.org/html/2403.05525v2) — 本笔记所有数字的出处（表 1–10 均在此版本）
- [GitHub 官方仓库 deepseek-ai/DeepSeek-VL](https://github.com/deepseek-ai/DeepSeek-VL) — 权重下载与推理代码

学习配套：词汇页：[本篇词汇](../study/vocab/05_DeepSeek-VL_论文词汇.html) · [本篇听力](../study/listen/05_DeepSeek-VL_单词听力.html)

