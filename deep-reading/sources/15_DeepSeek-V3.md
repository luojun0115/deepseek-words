# 15 DeepSeek-V3 · 来源档案

- 访问日期：2026-10-17（首轮 18 条）；**2026-10-18 深化轮**（#19–31，为应用户反馈扩深④⑥⑦⑩⑪补充）
- 侦察结论：公开资料**丰富**——原文 HTML 可抓（深化轮已把全文 curl 到本地、按章节精确抽取式 1–28 与全部超参/消融/后训练数字）、官方页可访问、高质量中文精读 ≥4 篇、基准聚合表 2 源交叉核对；HF/GitHub 直连受限（超时），README 经 hf-mirror 镜像取得。

## 来源清单（与笔记 ⑩ 节双向对账）

| # | 级 | 标题 | 原始 URL | 访问日期 | 取用要点 | 对应笔记小节 |
|---|----|------|----------|----------|----------|--------------|
| 1 | A | DeepSeek-V3 Technical Report（摘要页） | https://arxiv.org/abs/2412.19437 | 2026-10-17 | 671B/37B、14.8T、2.788M H800·h、零回滚、v1/v2 时间 | ①②③④ |
| 2 | A | arXiv HTML 全文 | https://arxiv.org/html/2412.19437 | 2026-10-17 | 章节目录（§2 架构/§3 基础设施/§4.5 消融边界）；§3.3 FP8 细节原文（1×128/128×128、N_C=128、尾数优先、在线量化、敏感算子保高精度） | ④⑦ |
| 3 | B | DeepSeek 官方发布页 | https://www.deepseek.com/news/deepseek-v3/ | 2026-10-17 | 发布日 2024-12-26、定性评测结论（超 Qwen/Llama、平 GPT-4o/Claude）、20→60 TPS、FP8 权重、定价 | ①②③⑥⑧ |
| 4 | B | GitHub deepseek-ai/DeepSeek-V3 | https://github.com/deepseek-ai/DeepSeek-V3 | 2026-10-17 | 仓库/许可入口（**抓取超时**；README 经 #5 镜像取得：推理框架推荐 SGLang/vLLM/LMDeploy/TRT-LLM、MIT 代码许可） | ①⑩ |
| 5 | B | HuggingFace 模型卡（经 hf-mirror 读 README） | https://huggingface.co/deepseek-ai/DeepSeek-V3 | 2026-10-17 | 模型简介、推理框架支持（MLA/FP8 优化）、许可；原站直连失败，镜像 https://hf-mirror.com/deepseek-ai/DeepSeek-V3/raw/main/README.md | ①⑤⑩ |
| 6 | C | 徐天乐：V3 精读（系统视角） | https://www.xutianle.me/en/blog/deepseek-01-v3-technical-report/ | 2026-10-17 | 成本三段拆分与边界、YaRN 两阶段（步数/batch）、Table6 口径（8K 输出、多 temperature）、SFT 1.5M、FP8 误差<0.25% 边界、NIAH 局限 | ⑥⑦⑧ |
| 7 | C | 原力注入：61 层推理 Pipeline 走读 | https://forceinjection.github.io/09_inference_system/vllm/module_analysis/deepseek_v3_inference_pipeline.html | 2026-10-17 | DeepseekV3Config 全套超参（61 层/7168/128 头/q1536/kv512/rope64/256+1/top8/2048/18432/组8选4/缩放2.5/词表129280）、KV cache 576 维≈1.15KB vs ~80KB≈1.8%、MTP 辅助层(2,30,58)、self-speculation≈1.5× | ④⑤⑥⑦ |
| 8 | C | Luning：DeepSeek MoE v1→v3 演进 | https://wln20.github.io/posts/2025/09/dsmoe/ | 2026-10-17 | GShard/ST-MoE 辅助损失公式、V1 细粒度+共享、V2 设备受限+丢弃、V3 sigmoid+bias 公式、160/6→256/8 | ④⑤⑦ |
| 9 | C | armcvai：DeepSeekV3 论文解读 | https://www.armcvai.cn/2025-02-08/deepseekv3-paper.html | 2026-10-17 | 节点受限路由 M=4 及 MoEGate 代码、无辅助损失/序列级损失/不丢 token、部署（prefill 56/32+32 冗余、decode EP320 40 节点 320 卡、双微批重叠）、预训练 2.664M+后训 0.1M | ④⑤⑦⑧ |
| 10 | C | Langbase：V3 Benchmarks 全表 | https://langbase.com/models/deep-seek/deepseek-v3/benchmarks | 2026-10-17 | Table 3（base）与 chat 全量基准数字（12 行主表、V2/V2.5 对照列） | ⑥ |
| 11 | C | AI Pocket Reference：DeepSeek-v3 | https://vectorinstitute.github.io/ai-pocket-reference/nlp/models/deepseek_v3.html | 2026-10-17 | 超参表双源核对、YaRN+128K、2048×H800、2.664M/0.1M、Base 表（Table 3 转引） | ①④⑥ |
| 12 | C | CodeSOTA：DeepSeek-V3 收录 | https://www.codesota.com/model/deepseek-v3 | 2026-10-17 | MMLU 88.5 / MATH 90.2 / SWE 42.0 / HumanEval 82.6 交叉核对；LiveCodeBench 49.2 与论文 40.5 冲突（→待核实 #1） | ⑥⑧ |
| 13 | D | DeepSeek-V3 技术报告详细解读-1 | https://www.bilibili.com/video/BV1WYFQeGEf1/ | 2026-10-17 | 用户手写笔记原有链接，收编进参考 | ⑩-D |
| 14 | D | DeepSeek-V3 技术报告详细解读-2 | https://www.bilibili.com/video/BV1HqFQezEMt | 2026-10-17 | 同上 | ⑩-D |
| 15 | D | DeepSeek-V3 论文中的隐藏细节 | https://www.bilibili.com/video/BV15XFQebEBM | 2026-10-17 | 同上 | ⑩-D |
| 16 | D | 80 分钟精读 V3 技术报告 | https://www.bilibili.com/video/BV1mkNPebEUU | 2026-10-17 | 搜索发现（21.1 万播放） | ⑩-D |
| 17 | D | 老石谈芯：V3 解读 | https://www.bilibili.com/video/BV1Yh4y1p7ZE | 2026-10-17 | 搜索发现（10.6 万播放） | ⑩-D |
| 18 | D | 矿大·Serverless：V3 论文精读 | https://www.bilibili.com/video/BV1N5411G7nd | 2026-10-17 | 搜索发现（6.4 万播放） | ⑩-D |
| 19 | A | arXiv HTML 全文（**深化轮全文本地解析复用**） | https://arxiv.org/html/2412.19437 | 2026-10-18 | 式 1–28 全部公式原文；§2.1.2 bias 更新规则（过载 −γ/欠载 +γ、γ=0.001→0）；式17–20 序列级损失与 α=1e-4；§2.2 MTP 式21–25 与 λ=0.3→0.1；§3.2 并行（PP16/EP64/ZeRO-1、DualPipe 气泡表 2、All-to-All 20SM/10 通道、IB50/NVLink160、3.2 专家/节点）；§3.3 FP8 全套（1×128/128×128、N_C=128、全 E4M3、在线量化、E5M6、BF16 矩）；§3.4 部署（prefill 32 卡/decode 320 卡、32 冗余、IBGDA）；§3.5 芯片建议；§4.1 数据/FIM/词表；§4.2 全套超参（LR/batch/γ/α/λ）；§4.3 YaRN 参数；§4.5 消融 Table4/5 与 §4.5.3 损失数字；§5 后训练（1.5M SFT、双轨 RM、GRPO 式26–28）；§5.4.1 Table9、§5.4.3 接受率 85–90%/1.8× TPS；附录 B/C | ①②③④⑤⑥⑦⑧ |
| 20 | A | DeepSeek-V2 Technical Report | https://arxiv.org/abs/2405.04434 | 2026-10-18 | HTML 全文 §2.1：权重吸收原文（W^UK→W^Q、W^UV→W^O）、解耦 RoPE 的不可交换性论证、MLA 缓存只有 c^KV | ④-4.1 ⑤-5.2 ⑦-拓展6 ⑩-A |
| 21 | A | DeepSeekMath（GRPO 出处） | https://arxiv.org/abs/2402.03300 | 2026-10-18 | §4.1 GRPO 目标函数（式26–28 与 V3 一致）、免 critic 动机 | ⑦-拓展7 ⑩-A |
| 22 | A | RoPE（RoFormer） | https://arxiv.org/abs/2104.09864 | 2026-10-18 | 乘性位置编码定义（概念引用，未抓正文） | ⑦-拓展8 ⑩-A |
| 23 | A | YaRN | https://arxiv.org/abs/2309.00071 | 2026-10-18 | 频率分段插值 + 温度补偿机制（概念引用） | ⑦-拓展8 ⑩-A |
| 24 | A | GShard | https://arxiv.org/abs/2006.16668 | 2026-10-18 | MoE+辅助损失行业模板（对照引用） | ⑦-拓展1 ⑩-A |
| 25 | A | ST-MoE | https://arxiv.org/abs/2202.08906 | 2026-10-18 | Router Z-loss 与均衡损失出处 | ⑦-拓展1 ⑩-A |
| 26 | A | Gloeckle 等 Multi-token Prediction | https://arxiv.org/abs/2404.19737 | 2026-10-18 | MTP 训练目标的论文灵感来源（V3 §2.2 引用） | ④-4.3 ⑦-拓展2 ⑩-A |
| 27 | A | EAGLE | https://arxiv.org/abs/2401.15077 | 2026-10-18 | 串行因果链 draft 对照系（V3 §2.2 点名） | ④-4.3 ⑦-拓展2 ⑩-A |
| 28 | A | SpecInfer · Leviathan 投机解码 | https://arxiv.org/abs/2302.01318 · https://arxiv.org/abs/2211.17192 | 2026-10-18 | 投机解码奠基工作（V3 §5.4.3 引用） | ⑦-拓展2 ⑩-A |
| 29 | A | ZeroBubble | https://arxiv.org/abs/2308.05940 | 2026-10-18 | 反向拆分输入/权重梯度（DualPipe 引用的基础） | ④-4.8 ⑩-A |
| 30 | A | Llama 3 | https://arxiv.org/abs/2407.21783 | 2026-10-18 | 405B GQA 配置（128 Q/8 KV）与长文扩展口径（对照规格） | ⑤-5.1 ⑩-A |
| 31 | A | Qwen2.5 | https://arxiv.org/abs/2412.15115 | 2026-10-18 | 72B GQA 配置（64 Q/8 KV 组）与 YaRN 档位（对照规格） | ⑤-5.1 ⑩-A |

> 抓取失败但已尝试的入口（记录以免审查者重复踩坑）：GitHub 仓库直连超时、HF 直连失败（用镜像）、微信公众号解读（接口报错）、DeepWiki 评测页（429 限流）、arXiv PDF（二进制不可解析，改用 HTML+摘要页）、CSDN 一篇（404）。

## 待核实 / 风险标记

1. **LiveCodeBench 冲突**：论文/徐天乐口径 40.5（Pass@1-COT），CodeSOTA 收录 49.2——疑为 V3-0324 或不同 LCB 数据版本；笔记按论文口径写并已标注。
2. **Base 表个别行双源不一致**：RACE-Middle 等个别行 langbase 与 Pocket Reference 有出入（67.1 vs 74.9）；笔记精选行均为两源一致项。
3. **rope_theta 未取到原值**：HF config.json 直连失败；原文 §4.3 只给 YaRN 超参（s=40/α=1/β=32/√t=0.1·ln s+1）与"与 V2 相同"的说明，**未直接给出基础 rope_theta**——笔记仅写"RoPE+YaRN"，此条部分解决、数值仍待核。
4. **langbase 页面元数据"Context upto 1M"不可信**：与论文 128K 冲突，疑似托管商宣传值；笔记采用 128K（徐天乐 + Pocket Reference 双源，且已由原文 §4.3 直接确认）。
5. **（深化轮新增）MTP 辅助头取层 (2,30,58)**：出自建模代码而非论文正文，仍以推理走读转引标注。
6. **（深化轮新增）GRPO 超参 ε/β/G 未在 V3 报告出现**：属论文本身未披露，非来源缺陷；笔记按"未公开"表述。
7. **（深化轮已消解）"self-speculation ≈1.5×"第三方估算**：已被论文 §5.4.3 一手口径（接受率 85–90%、1.8× TPS）替代，草稿已改写。
