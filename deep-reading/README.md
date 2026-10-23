# 深度精读工作台 · DeepSeek 32 篇论文（deep-reading/）

> **本目录是工程过程文档，不是站点内容**：已在 `.vitepress/config.mts` 的 `srcExclude` 排除，不会被构建进站点。
> **交付流程**：论文笔记先以**草稿**写在 `drafts/<编号>_<短名>.md`（供外部模型审查）→ 用户过审 → 才带 frontmatter 同步进 `notes/<编号>_<短名>.md` 渲染上站；**过审前 `notes/` 保持原状、一个字节不写**。
> 本目录同时保存**解读方案、引用规范、来源证据档案、进度与变更日志**，供审查对账。

---

## 0. 外部审查模型从这里开始

| 你要审的东西 | 在哪 |
|--------------|------|
| 笔记草稿（审查对象） | `deep-reading/drafts/01_…` ~ `drafts/32_*.md`；过审后才同步进 `notes/` 同名文件 |
| 每篇引用了哪些原始资料 | `deep-reading/sources/<编号>_<短名>.md`（来源档案，逐条含 URL / 取用要点 / 对应笔记小节） |
| 跨模型对比的基准规格 | `deep-reading/模型对照系.md`（DeepSeek 谱系 / 外部基准 / 注意力谱系，每行带来源链接） |
| 解读框架与引用规范 | 本文件 §2 §3 |
| 审查清单（照着走一遍即可） | 本文件 §4 |
| 进度与改动范围 | 本文件 §6 §7 |

## 1. 目标与硬性原则

对 32 篇 DeepSeek 论文做**深度精读**笔记，尽可能填充优质资料（链接 + 总结性补充）。四条硬规矩：

1. **引用必给原链接**：凡参考过的内容，文内行内链接标注，且文末「参考与延伸阅读」必须完整列出原始 URL。
2. **禁止编造**：数字、链接、结论必须有来源；查不到的标「待核实」，资料少的明说"公开资料有限"。
3. **不碰既有约定**：**过审前不写 `notes/`**（草稿全在 `drafts/`）；同步时 frontmatter 原样保留、`15_DeepSeek-V3` 已有手写内容只增不删；公式用纯文本（站点无数学插件）。
4. **仓库守卫全绿**：每批完成后 `npm run build` + `npm run verify` 必须通过（当前基线 13/13）。

## 2. 解读框架（每篇 11 个固定角度）

| # | 角度 | 回答的问题 | 形式 |
|---|------|-----------|------|
| ① | 论文身份卡 | 标题/机构/时间/arXiv/代码/关键词 | 信息表 |
| ② | 定位与动机 | 解决什么痛点，前作与竞品的 gap | 短段落 |
| ③ | 核心贡献 | 真正的新东西 3~5 条 | 编号列表 |
| ④ | 方法精读 | 架构/公式/算法**为什么这样设计** | ≥1 张 ASCII 图 + 纯文本公式 |
| ⑤ | 跨模型架构对比 | 与前代 DeepSeek 谱系和同期模型逐模块差异；新/改注意力机制到底**不同在哪** | 对比矩阵表；含新注意力时加「注意力差异专讲」（基准见模型对照系.md） |
| ⑥ | 实验解读 | 关键数字说明了什么，消融发现 | 精选结果表 |
| ⑦ | 知识点拓展 | **至少 3 个**：纵向谱系 / 横向对比 / 概念溯源 / 工程实现 | 每个含"是什么→为何重要→关联" |
| ⑧ | 批判性评价 | 局限、失效场景、争议、竞品对比 | 优缺点两栏 |
| ⑨ | 系列谱系定位 | 在 32 篇中承上启下的位置 | 时间线/关系小图 |
| ⑩ | 参考与延伸阅读 | **全部被引用来源的原始链接**（见 §3） | 分类链接列表 |
| ⑪ | 核心术语表 | 中英对照，链到该篇词汇页/听力页（相对路径 `../study/vocab/<编号>_….html`） | 表格 |

## 3. 资料与引用规范

**来源分级**（笔记文末按级分组列出）：

- **A 一手原文**：arXiv 摘要/HTML 全文（注明取用的章节/表号）
- **B 官方资源**：GitHub README、官方博客、HuggingFace 模型卡
- **C 二手解读**：PaperWeekly / 机器之心 / 知乎等深度文
- **D 视频**：B 站等解读视频

**来源档案格式**（`sources/<编号>_<短名>.md`，一表 + 摘要）：

```markdown
| # | 级 | 标题 | 原始 URL | 访问日期 | 取用要点 | 对应笔记小节 |
```

- 每条"取用要点"写清：从该来源提取了什么、落到笔记哪一节。
- 反向也成立：笔记里出现的每个外部链接，来源档案里必须有对应行（双向可对账）。
- 访问日期写实；链接若失效，档案里记录"YYYY-MM-DD 已失效，改用镜像/存档"。
- **对比也要有来源**：跨模型对比中，被对比模型的规格（参数量、注意力、位置编码等）逐项引其官方技术报告；拿不准写「核对中」，传闻写「传闻·未证实」（如 GPT-4 的 MoE 规格）。

## 4. 审查清单（供外部模型执行）

1. 抽查笔记中 5~10 个关键数字 → 与来源档案标注的原文位置是否一致。
2. 文末「参考与延伸阅读」逐条点开 → 链接真实可达、与所述内容相符。
3. 双向对账 → 来源档案的行 ↔ 笔记引用，有无"引了没记档 / 记档没用上"。
4. 框架完整性 → 11 个角度齐全、知识点拓展 ≥3、≥1 图 ≥1 表；架构类论文必须有跨模型对比矩阵、涉新注意力必须有「注意力差异专讲」，被对比模型规格有来源或标「核对中」。
5. 仓库约束 → frontmatter 未动；`15` 手写内容仍在；01 篇无自检禁词（构建/工作区/TTS 等）；站内链接为相对路径。
6. 改动范围 → 审查阶段 `git status` 只应出现 `deep-reading/**` 及经批准的配置改动（**`notes/` 与 `data/` 应零改动**）；仅在过审同步阶段才应出现 `notes/*.md`。
7. 结构卫生 → 每篇代码围栏数为偶数、章节顺序无错位（可用脚本核）。

## 5. 批次计划（6 批 × 按主题谱系）

| 批次 | 主题 | 篇目 |
|------|------|------|
| 1 | 基座与 MoE 主线 | 01 · 02 · 06 · 15（整合手写）· 21 |
| 2 | 代码与数学 | 03 · 04 · 08 · 09 · 23 |
| 3 | 推理·证明·对齐 | 07 · 10 · 16 · 19 · 20 |
| 4 | 多模态理解与生成 | 05 · 12 · 13 · 14 · 17 |
| 5 | 文档视觉与基础设施 | 11 · 18 · 22 · 27 · 31 |
| 6 | 2025 末–2026 新作 | 24 · 25 · 26 · 28 · 29 · 30 · 32 |

> 批次 6 中 mHC / Engram / DualPath / DSpark 等先侦察资料再定归属，跨题则微调并在此处更新。

## 6. 进度总表

状态：`未开始` → `侦察中` → `已写待审`（草稿在 drafts/） → `已过审` → `已同步`（写入 notes/ 且 build + verify 通过）

| 编号 | 短名 | 批次 | 状态 | 草稿 / 过审后落位 | 来源档案 |
|------|------|------|------|------|---------|
| 01 | DeepSeek-LLM | 1 | 未开始 | `notes/01_DeepSeek-LLM.md` | `sources/01_DeepSeek-LLM.md` |
| 02 | DeepSeekMoE | 1 | 未开始 | `notes/02_DeepSeekMoE.md` | `sources/02_DeepSeekMoE.md` |
| 03 | DeepSeek-Coder | 2 | 未开始 | `notes/03_DeepSeek-Coder.md` | `sources/03_DeepSeek-Coder.md` |
| 04 | DeepSeekMath | 2 | 未开始 | `notes/04_DeepSeekMath.md` | `sources/04_DeepSeekMath.md` |
| 05 | DeepSeek-VL | 4 | 未开始 | `notes/05_DeepSeek-VL.md` | `sources/05_DeepSeek-VL.md` |
| 06 | DeepSeek-V2 | 1 | 未开始 | `notes/06_DeepSeek-V2.md` | `sources/06_DeepSeek-V2.md` |
| 07 | DeepSeek-Prover | 3 | 未开始 | `notes/07_DeepSeek-Prover.md` | `sources/07_DeepSeek-Prover.md` |
| 08 | DeepSeek-Coder-V2 | 2 | 未开始 | `notes/08_DeepSeek-Coder-V2.md` | `sources/08_DeepSeek-Coder-V2.md` |
| 09 | ESFT | 2 | 未开始 | `notes/09_ESFT.md` | `sources/09_ESFT.md` |
| 10 | Prover-V1.5 | 3 | 未开始 | `notes/10_Prover-V1.5.md` | `sources/10_Prover-V1.5.md` |
| 11 | Fire-Flyer | 5 | 未开始 | `notes/11_Fire-Flyer.md` | `sources/11_Fire-Flyer.md` |
| 12 | Janus | 4 | 未开始 | `notes/12_Janus.md` | `sources/12_Janus.md` |
| 13 | JanusFlow | 4 | 未开始 | `notes/13_JanusFlow.md` | `sources/13_JanusFlow.md` |
| 14 | VL2 | 4 | 未开始 | `notes/14_VL2.md` | `sources/14_VL2.md` |
| 15 | DeepSeek-V3 | 1 | **已写待审**（草稿 `drafts/15_DeepSeek-V3.md`，手写视频已整合；2026-10-18 按用户反馈**深化一轮**：逐式精讲+10 拓展） | `notes/15_DeepSeek-V3.md` | `sources/15_DeepSeek-V3.md` |
| 16 | DeepSeek-R1 | 3 | 未开始 | `notes/16_DeepSeek-R1.md` | `sources/16_DeepSeek-R1.md` |
| 17 | Janus-Pro | 4 | 未开始 | `notes/17_Janus-Pro.md` | `sources/17_Janus-Pro.md` |
| 18 | NSA | 5 | 未开始 | `notes/18_NSA.md` | `sources/18_NSA.md` |
| 19 | RM | 3 | 未开始 | `notes/19_RM.md` | `sources/19_RM.md` |
| 20 | Prover-V2 | 3 | 未开始 | `notes/20_Prover-V2.md` | `sources/20_Prover-V2.md` |
| 21 | Insights-V3 | 1 | 未开始 | `notes/21_Insights-V3.md` | `sources/21_Insights-V3.md` |
| 22 | DeepSeek-OCR | 5 | 未开始 | `notes/22_DeepSeek-OCR.md` | `sources/22_DeepSeek-OCR.md` |
| 23 | DeepSeekMath-V2 | 2 | 未开始 | `notes/23_DeepSeekMath-V2.md` | `sources/23_DeepSeekMath-V2.md` |
| 24 | DeepSeek-V3.2 | 6 | 未开始 | `notes/24_DeepSeek-V3.2.md` | `sources/24_DeepSeek-V3.2.md` |
| 25 | mHC | 6 | 未开始 | `notes/25_mHC.md` | `sources/25_mHC.md` |
| 26 | Engram | 6 | 未开始 | `notes/26_Engram.md` | `sources/26_Engram.md` |
| 27 | OCR2 | 5 | 未开始 | `notes/27_OCR2.md` | `sources/27_OCR2.md` |
| 28 | DualPath | 6 | 未开始 | `notes/28_DualPath.md` | `sources/28_DualPath.md` |
| 29 | DeepSeek-V4 | 6 | 未开始 | `notes/29_DeepSeek-V4.md` | `sources/29_DeepSeek-V4.md` |
| 30 | DSpark | 6 | 未开始 | `notes/30_DSpark.md` | `sources/30_DSpark.md` |
| 31 | Spatiotemporal | 5 | 未开始 | `notes/31_Spatiotemporal.md` | `sources/31_Spatiotemporal.md` |
| 32 | DeepSeek-V4.1-Flash | 6 | 未开始 | `notes/32_DeepSeek-V4.1-Flash.md` | `sources/32_DeepSeek-V4.1-Flash.md` |

> 审查阶段草稿在 `deep-reading/drafts/<同名>.md`；过审后原样同步到表中 `notes/` 路径（同步前 `notes/` 零改动）。
> 已完成的站内资产：专题笔记《位置编码》（`notes/位置编码.md`，此前按你指示直接写入，非 32 篇序列，见 `/notes` 索引页底部入口）。

## 7. 变更日志

- **2026-10-17** 建立本目录；解读方案（10 角度框架 + 6 批次 + 引用规范 + 审查清单）定稿；`srcExclude` 排除本目录出站点。
- **2026-10-17（二）** 应要求新增第⑤「跨模型架构对比」角度（框架 10→11 角度，含「注意力差异专讲」套路）；新建共用基准 `模型对照系.md`（DeepSeek 谱系 + 外部基准 + 注意力谱系，每行带来源）；§0/§3/§4 同步更新。
- **2026-10-17（三）** 交付流程调整（用户纠正）：论文笔记**先写 `drafts/` 供审查，过审后才同步 `notes/`**；同步前 `notes/` 零改动，审查清单 §4-6 与状态枚举同步收紧。
- **2026-10-17（四）** 样稿开工（应用户点名）：`drafts/15_DeepSeek-V3.md`（11 角度全、344 行）+ `sources/15_DeepSeek-V3.md`（18 条来源、4 条待核实）完成，状态 → 已写待审；`notes/` 零改动。
- **2026-10-18** 15 篇深化（用户反馈"解读不够深、公式/架构要详细解释、关键点与关键词有遗漏"）：
  - ④ 重写为**逐式精讲**——覆盖原文式 1–28（MLA 式1–11、MoE/均衡式12–20、MTP式21–25），新增 4.5–4.10 六节（超参调度表 / 数据与分词器 / YaRN 长文 / DualPipe 与 All-to-All / FP8 全解 / 部署与硬件建议），关键超参（γ、α、λ、LR、batch）全部改以原文 §4.2 一手数据；
  - ⑤ 对比矩阵补训练并行、部署行与 Llama/Qwen 头数（挂官方报告链接）；专讲新增"权重吸收"；
  - ⑥ 补评测口径 2 条、消融 Table 4/5 逐行数字与 §4.5.3 损失对比、**新增 6.5 后训练管线**（1.5M SFT / 双轨 RM / GRPO / 自奖励 / 蒸馏 Table 9）；
  - ⑦ 拓展 5→**10**（+MLA 吸收谱系、GRPO 公式精讲、RoPE/YaRN、R1 反向蒸馏闭环、冗余专家）；
  - ⑧ 局限 6→9 条（消融非全绿、蒸馏拉长回答、复现门槛等）；
  - ⑩/来源档案新增 **13 条一手来源**（#19–31，双向对账）；⑪ 术语表 12→**43** 条。
  - 结构自检：11 角度齐、代码围栏偶数；`notes/` 与 `data/` 零改动；build + verify 复跑通过（见本条下方核验记录）。
