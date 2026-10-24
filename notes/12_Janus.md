---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 12 · Janus 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [一文读懂 DeepSeek 多模态大模型 Janus-Pro（知乎，详解 Janus 与 Janus-Pro）](https://zhuanlan.zhihu.com/p/20770930171) — 先讲清 Janus 的视觉编码解耦思想，再讲 Janus-Pro 改进
- [Janus 系列模型：解耦统一多模态理解和生成的视觉编码（知乎）](https://zhuanlan.zhihu.com/p/21253623275) — 重点讲「视觉编码解耦」核心设计
- [DeepSeek Janus: Multimodal Image Model Explained（deepseekai.guide）](https://deepseekai.guide/models/deepseek-janus) — 英文详解：SigLIP + VQ tokenizer 双编码器与家族时间线
- [GitHub 官方项目页 deepseek-ai/Janus](https://github.com/deepseek-ai/Janus) — Janus/JanusFlow/Janus-Pro 系列共用官方主页

### 视频（B站 / YouTube）
- [YouTube] [Janus 1.3B: Small Multimodal Model for Image Generation and RAG](https://www.youtube.com/watch?v=WWrr8l82ZUU) — 详细讲解解耦视觉编码并演示用法
- [YouTube] [DeepSeek Janus-Pro: DeepSeek's Revolution in Multimodal AI?](https://www.youtube.com/watch?v=RQ-0LkpUNro) — 一支视频讲透 Janus/JFlow/Janus-Pro 架构演进
- [B站] [逐篇讲解 DeepSeek 关键 9 篇论文及创新点](https://www.bilibili.com/video/BV1xuK5eREJi/) — 全系列综述视频，含本篇

### 英文 & 社区
- [Hugging Face 论文页](https://huggingface.co/papers/2410.13848) — 官方收录页与讨论
- [Moonlight 文献综述页（已覆盖 Janus 原版设计）](https://www.themoonlight.io/en/review/janus-pro-unified-multimodal-understanding-and-generation-with-data-and-model-scaling)
- [Janus CVPR 2025 Poster 页](https://cvpr.thecvf.com/virtual/2025/poster/35230) — 已被 CVPR 2025 正式收录

### 全系列综述（含本篇）
- [DeepSeek 技术路线图（yudonglee）](https://yudonglee.me/deepseek-roadmap/)
- [知乎：10 篇论文读懂 DeepSeek 技术演进脉络](https://zhuanlan.zhihu.com/p/2036459670894810864)
- [Martin Fowler: The DeepSeek Series](https://martinfowler.com/articles/deepseek-papers.html)

---

# 解耦视觉编码完整流程（含所有疑问点）

## 角色与核心思想

统一多模态模型（一个模型既能「看图答题」又能「按提示词画图」）最大的坑在**视觉编码器**：

- **理解任务**要的是高层语义：物体类别、属性、图中文字……只需要抽象语义表示，不需要每个像素。
- **生成任务**要的是逐像素细节：局部纹理、空间结构、全局一致性，语义太抽象画不出来。

先例 Chameleon 用**同一个 VQ tokenizer** 服务两个任务，结果两边都要妥协（原文消融实验证明：VQ 做理解 POPE 只有 60.1）。Janus 的解法：**两条独立视觉编码路径 + 同一个 Transformer**。

- **谁在动**：一路走 SigLIP 提取语义特征（理解），一路走 VQ tokenizer 把图编成离散 ID（生成），各自经过一个投影矩阵进同一个自回归 Transformer。
- **产出**：理解路径走 LLM 自带的文本预测头；生成路径走一个随机初始化的图像预测头，逐 token 预测 VQ codebook ID（词表 16,384）。

---

## 主干推演：一次图文交错多轮对话的完整 token 序列

设定：用户先发一张猫的图问「这是什么动物」→ 助手答「这是一只橘猫……」→ 用户说「画一张戴帽子的橘猫」→ 助手文字回复后开始画图。

所有输入统一转成向量序列喂进 Transformer。**三种素材、三条转换路径**：

```
素材              转换路径                              产物
────────────────────────────────────────────────────────────────
文本 token       LLM 自带 tokenizer → 词嵌入表          文本词向量
理解用图像       SigLIP → 2D 特征图 → 拍平成 1D 序列    语义特征向量
                 → 理解适配器(2层MLP) → LLM 输入空间
生成用图像       VQ tokenizer → 离散 ID(词表16,384)     codebook 嵌入向量
                 → 拍平成 1D
                 → 生成适配器(2层MLP) → LLM 输入空间
```

**完整序列长这样**（U=理解图 token，T=文本 token，G=生成图 ID，I=图像头预测的 ID）：

```
[T…用户:这是什么动物]
[U₁ U₂ … U₅₇₆]                        ← 猫图走 SigLIP+理解适配器
[T…assistant: 这是一只 橘猫 …]
[T…用户: 画一张戴帽子的橘猫]
[T…assistant: 好的,这是图:]           ← 文本部分走文本头正常预测
[G₈₄₂ G₄₅₆ … I₃₀₇ I₉₉ …]              ← 图像部分走图像头,逐个预测 VQ ID
```

关键点：

1. **同一张图如果先被看、后被问，从始至终只用理解路径的 U token**；生成的新图用 G/I token。两套 token 在同一个序列里混排，靠位置顺序和内容区分，不需要任何特殊 attention mask——整个模型就是标准自回归。
2. **生成图 ID 在后续轮次回看时**：已生成的 ID 也通过生成适配器映射回 LLM 输入空间（查 codebook 嵌入再过 MLP），即序列里出现过的每个位置永远用它当初进场的路径表示。
3. 384×384 输入下两条路径**恰好都是 576 个 token**：SigLIP-Large-Patch16-384 输出 24×24 特征图，VQ tokenizer 下采样 16 倍也得到 24×24 网格。但二者的嵌入空间毫无亲缘性，只是长度相同。

---

## 阶段一：三条静态路径各自就位（架构装配）

**为什么这样设计**：理解要细粒度语义，SigLIP 这种对比学习预训练的编码器给的是高层语义特征；生成要逐像素可重建，VQ tokenizer（取自 LlamaGen）给的是能被像素解码器还原的离散 ID。两边的「正确答案格式」都不同：理解路径进 LLM 输入空间的是**连续向量**，生成路径最终要预测的输出是**16,384 选 1 的离散 ID**。

```
                 ┌→ 理解适配器(MLP) ─┐
图像 ─→ SigLIP ──┤                   │
                 └───────────────────┤
                                      ├──→ 统一 Transformer ──┬→ 文本头(LLM自带)
文本 ─→ LLM tokenizer ─→ 词嵌入 ──────┤                       └→ 图像头(随机初始化)
                 ┌→ 生成适配器(MLP) ─┤
图像 ─→ VQ tokenizer ────────────────┘
```

**疑问点①：为什么文本、两个图像路径各配一个适配器，而不是共享一个输入投影？**
因为三条路上来的向量空间完全不同：文本词表的嵌入、SigLIP 的连续语义特征、VQ 的 codebook 嵌入，方差和语义密度都不在一个尺度上。各自一个 2 层 MLP（论文明写 understanding adaptor 和 generation adaptor 均为 two-layer MLPs）把它们各自映射到 LLM 输入空间，代价小、互不干扰。

**疑问点②：为什么输出要分两个头？**
因为输出分布压根不同：文本头输出的是 LLM 词表（几十万级）上的分布，图像头输出 16,384 取一。让一个头同时对两个词表打分，等于要求共享层「同时精通两套放大镜的读法」，还不如干脆分家——这也是「解耦」思想在输出端的自然延续。

---

## 阶段二：第一阶段训练——只练适配器与图像头

冻结：两个视觉编码器 + LLM 全部冻住；只训练：理解适配器、生成适配器、图像头。

数据（比例 1 : 0 : 1，即**理解 : 纯文本 : 生成**，纯文本为 0）：

- 理解：ShareGPT-4V 的 125 万图文对，格式 `<image><text>`。
- 生成：约 120 万 ImageNet-11k 样本，按类目名组织成 `<category_name><image>` 的文生图格式。

**疑问点③：第一阶段为什么不放开 LLM？纯文本比例为什么是 0？**
LLM 已经是预训练好的（DeepSeek-LLM 1.3B），语言能力在了，先别动它。这一步的目标只是**在嵌入空间里建立视觉与语言的初步连接**：让 LLM「看懂」两个适配器送进来的新向量是谁、图像头学会 16,384 个 ID 的基本预测。如果此时放开 LLM，它会被大量「没对齐过的视觉向量」直接砸中，还得分心学语言无关的东西。纯文本 = 0 也是同理：这一步没有需要巩固的语言知识。

**疑问点④：生成这边为什么用 ImageNet-11k 起步？**
ImageNet 类目清晰、构图简单，是「先学会基础像素依赖、再学复杂场景」的经典爬梯子做法（论文自述受 PixArt 启发）。先让图像头和生成适配器在简单分布上把「预测下一个 ID」这个动作练熟。

**疑问点⑤：损失函数是什么？两个任务会互相打架吗？**
就一个普通的自回归交叉熵：

```
L = − Σᵢ log Pθ(xᵢ | x₍<i₎)
```

理解任务的损失只算在文本段上，生成任务的损失只算在图像段上，且**不给不同任务分配不同损失权重**——设计诉求就是「简单」。不打架的原因来自架构：两任务在输入端走各自的适配器、输出端走各自的头，共享的只有 Transformer 主体，冲突面已经被最小化了。

---

## 阶段三：第二阶段统一预训练——撒开 LLM，全数据轮灌

**放开 LLM**（两个视觉编码器仍冻结），三大类数据混合（比例 2 : 3 : 5 = 理解 : 纯文本 : 生成）：

1. 纯文本：DeepSeek-LLM 预训练语料。
2. 理解类：WikiHow、WIT 的图文交错数据；图像描述数据（加工成问答对如 `<image>详细描述这张图。<caption>`）；DeepSeek-VL 的表格与图表数据（`<question><answer>`）。
3. 生成类：多个公开数据集的图文对 + 200 万自有数据（部分图像按美学分数和图像尺寸过滤，只留 20%）；训练时以 25% 概率只取 caption 首句，逼模型对**短描述**也有强生成能力。

生成数据的节奏有讲究：

```
第 1 ~ 120K 步:  ImageNet-11k 样本           ← 继续垫底
第 120K ~ 180K 步: 开放域文生图数据            ← 升级到复杂场景
```

**疑问点⑥：既然第一阶段已经摸过 ImageNet，第二阶段为什么前 120K 步还只有它？**
两阶段是连续的爬梯子：第一阶段只训了适配器和图像头（LLM 冻着），ImageNet 上的「像素依赖」只练到了最冻结的部分；第二阶段 LLM 刚放开，主体还在重新适应，先用 ImageNet 稳住生成行为，再换开放域数据，防止一上来就啃复杂场景把刚建立的能力冲垮。

**疑问点⑦：开放域图文对里 caption 几十词、描述复杂，为什么要 25% 概率砍成首句？**
砍成首句本质是配比技巧：确实能保证「一句话提示词」这种最常见的用户输入也能把图生成对。原文明确给出该机制但未进一步论证动机，其兴起逻辑可从生成行为稳定角度理解，具体实验依据待核实。

---

## 阶段四：第三阶段 SFT——聊天格式与指令遵循

数据换装成指令格式：`User: <Input Message> \n Assistant: <Response>`，多轮对话按此逐轮重复；**只对回答部分计算监督，system 和 user 的提示部分被 mask 掉**。

训练参数：**除生成编码器外全部可训练**。数据比例 7 : 3 : 10（理解 : 纯文本 : 生成），含 SFT 文本对话数据（来源之一见原文第 4.2 节引用列表）+ 多任务理解指令数据 + 生成数据（公开集子集 + 400 万自有数据）。

**疑问点⑧：为什么 SFT 不单独训「纯理解版」和「纯生成版」两个模型？**
因为目标是**一个模型同时会两件事**：多轮对话里「看图聊天」和「按需画图」要发生在同一份权重里。原文明写：为保证理解和生成两方面能力兼备，不分任务单独微调，而是混合三类数据。

**疑问点⑨：三个阶段下来，到底哪些东西从头到尾没动过？**
SigLIP 编码器和 VQ tokenizer：第一阶段明确冻住，后面也没解冻。它们只是「多层感知机 + tokenizer」的原料供应商，真正被三次训练反复塑形的是：适配器×2、图像头、Transformer 主体。这样职责最干净：理解/生成分家发生在**接口处**，不在编码器本身。

---

## 阶段五：推理——两种采样模式

- **理解**：标准 next-token 采样，从预测分布逐 token 抽。
- **生成**：用 classifier-free guidance（CFG）。训练时以 10% 概率把文生图数据里的文本条件替换成 pad token，让模型同时学会「有条件」和「无条件」两种生成；推理时每个 token 的 logit 合成：

```
l_g = l_u + s × (l_c − l_u)

l_c：有文本条件时的 logit
l_u：无条件（pad 条件）时的 logit
s：  引导强度，默认 5
```

含义：条件与无条件差异越大、越「贴题」的方向被放大 s 倍，图和提示词的对齐度因此提升（GenEval 位置属性 0.46 对 SDXL 0.15，可见一斑）。

---

## 与 Chameleon 对照叙事（先例→本文论证）

Chameleon 类统一模型用**单一 VQ tokenizer** 同时服务理解与生成，理由是「统一即简洁」。Janus 论文的论证链是三段消融（原文表 5）：

```
           视觉编码方式            训练任务        POPE   MMB   SEED  MMMU  COCO-FID
Exp-A      仅 VQ（Chameleon式）    理解+生成       60.1   35.0  34.9  24.7  8.72
Exp-B      语义tokenizer(SigLIP蒸馏) 理解+生成      82.4   52.7  54.9  26.6  7.11
Exp-C      语义 tokenizer           仅理解         83.9   62.1  60.8  27.5  —
Exp-D      SigLIP + VQ（Janus）     理解+生成       87.0   69.4  63.7  30.5  8.53
Exp-E      仅 SigLIP                仅理解         85.9   70.6  64.8  28.8  —
Exp-F      仅 VQ                    仅生成          —     —     —     —     8.92
```

三条关键推理：

1. **A vs B**：给 VQ 嫁接语义能力（SigLIP 蒸馏出的语义 tokenizer），理解 POPE 从 60.1 涨到 82.4，说明先前差距主要来自「VQ 没语义」，但差距仍然存在——单一编码器有上限。
2. **B vs C**：同一个语义 tokenizer，只训理解比又理解又生成更强（MMB 52.7 → 62.1）。**这就是「折衷」实锤**：共享编码器确实在两个任务间做了让步，理解被牺牲了。
3. **B vs D（生成端）**：B 的生成 FID（7.11）反而优于 D（8.53）。作者给两个假设：其一，语义 tokenizer 的离散 ID 语义更连贯，对 LLM 是更好的预测目标；其二，该编码器参数量比 Janus 的生成编码器更大。原文措辞为假设，未严格归因。

另外定性证据（原文图 5，梗图理解）也指向同一结论：Chameleon 和 Show-o 在梗图内文字识别上翻车，Chameleon 还识别不了对象，Show-o 看错狗的颜色——都是共用编码器、在细粒度语义上吃亏的表现。

---

## 关键数字与实验

| 指标 | 本文（Janus, 1.3B） | 对照 | 出处 |
|---|---|---|---|
| MME-P | 1338.0 | Show-o 948.4（+41%） | 原文表2 |
| GQA | 59.1 | Show-o 48.7（+30%） | 原文表2 |
| POPE | 87.0 | Show-o 73.8；LLaVA-v1.5-7B 85.9 | 原文表2 |
| MMBench | 69.4 | LLaVA-v1.5-7B 64.3；Qwen-VL-Chat 60.6 | 原文表2 |
| SEED-Bench | 63.7 | LLaVA-v1.5-7B 58.6；Qwen-VL-Chat 58.2 | 原文表2 |
| MMMU / MM-Vet | 30.5 / 34.3 | LLaVA-v1.5-7B 35.4 / 31.1 | 原文表2 |
| GenEval 总分 | 61% | Show-o 53%；SDXL 55%；DALL-E 2 52%；Chameleon-34B 39% | 原文表3 |
| GenEval 位置/颜色属性 | 0.46 / 0.42 | SDXL 0.15 / 0.23 | 原文表3 |
| COCO-30K FID | 8.53 | Show-o 9.24；SDv1.5 9.62；PixArt-α 7.32 | 原文表4 |
| MJHQ-30K FID | 10.10 | Show-o 15.18；VILA-U(384) 7.69 | 原文表4 |
| 训练成本 | 7 天，16 节点 × 8 A100 (40GB) | — | 原文4.1节 |
| 图像分辨率 | 384×384 理解与生成同尺寸 | — | 原文4.1节 |

理解侧在 1.3B 同体量段综合最强，同时在 POPE/MMBench/SEED/MM-Vet 上压过 LLaVA-v1.5-7B 与 Qwen-VL-Chat-7B。

---

## 全局数据流总表

| 阶段 | 训练了谁 | 数据组合（理解：文本：生成） | 关键动作 |
|---|---|---|---|
| 架构 | — | — | SigLIP / VQ / 2 个适配器 / 2 个头就位 |
| Stage I | 适配器×2 + 图像头 | 1 : 0 : 1 | ShareGPT4V 125万 + ImageNet 120万 |
| Stage II | + LLM 解冻 | 2 : 3 : 5 | 前120K步仅 ImageNet，后60K步开放域 |
| Stage III | 除生成编码器全部 | 7 : 3 : 10 | 指令格式 SFT，answer 监督、prompt mask |
| 推理-理解 | — | — | 标准自回归采样 |
| 推理-生成 | — | — | pad 10% + CFG (s=5) |

---

## 所有疑问点速查

| 疑问 | 答案 |
|---|---|
| 为什么拆两条视觉路径而不是一条 | 理解要高层语义、生成要逐像素细节，需求空间不重叠，共享必然折衷（Exp-B vs C 实锤） |
| 适配器为什么分开、还是 MLP | 让词嵌入 / SigLIP 特征 / VQ 嵌入各自映射进 LLM 输入空间，不互相拉扯 |
| 输出为什么两个头 | 文本输出是 LLM 词表分布，图像输出是 16,384 选一，分布形状不同 |
| 一张图理解后还能被反复问 | 该图在序列中始终走理解路径的 U token |
| 生成图的 ID 如何回看 | 已生成 ID 经生成适配器映射到 LLM 输入空间 |
| 第一阶段为什么冻 LLM | 防止未对齐视觉向量直接砸中语言主体，先连概念 |
| 第一阶段纯文本=0 | 该步没有需要巩固的语言知识 |
| Stage II 为什么先用 ImageNet | 铺底像素依赖，再换开放域，防能力被冲垮 |
| 损失统一 CE 会打架吗 | 不打架，接口处已解耦，无需加权 |
| SFT 为什么不分任务训 | 目标是单模型多任务，混合三类数据 |
| 哪些模块三阶段没动过 | SigLIP 与 VQ tokenizer |
| CFG 怎么提升贴题 | 无条件与条件 logit 差值放大 s 倍，训练时 10% pad 掉条件 |

---

## 一句话总括

**统一多模态的瓶颈不在 Transformer 而在视觉编码器：Janus 把「看懂」和「画好」拆成 SigLIP 语义路径与 VQ 像素路径，各经一个 2 层 MLP 适配器进入同一个自回归 Transformer，输出端再一次分家（LLM 自带文本头 + 随机初始化图像头），三阶段训练（适配器起步 → LLM 解冻 + ImageNet→开放域 → 混合指令 SFT）把两条路缝成一个权重。** 消融实验显示单编码器方案确实在任务间折衷（Exp-B vs C），解耦后同体量下理解和生成双双领先（MME +41%、GQA +30% 对比Show-o，GenEval 61%）。

---

## 参考与延伸阅读

- [arXiv:2410.13848 提交页](https://arxiv.org/abs/2410.13848)
- [arXiv HTML 全文](https://arxiv.org/html/2410.13848v1)
- [GitHub 官方项目页 deepseek-ai/Janus](https://github.com/deepseek-ai/Janus)
- 本站：[本篇词汇](../study/vocab/12_Janus_论文词汇.html) · [本篇听力](../study/listen/12_Janus_单词听力.html)

