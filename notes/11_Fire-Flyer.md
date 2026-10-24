---
# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。
# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。
# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）
title: 11 · Fire-Flyer 学习笔记
pageClass: note-page
---

## 全网解读资源（2026-10-22 整理）

### 图文解读
- [幻方 AI DeepSeek 模型背后的万卡集群建设精华（51CTO）](https://www.51cto.com/aigc/2201.html) — 中文详解 Fire-Flyer 2 万卡集群的 PCIe 架构、HFReduce、3FS 等全套优化
- [Fire-Flyer AI-HPC：SC24 官方论文页](https://sc24.supercomputing.org/proceedings/tech_paper/tech_paper_pages/pap350.html) — SC24 技术论文存档页

### 视频（B站 / YouTube）
- [YouTube] [Low-Cost AI Infrastructure Revolution: Fire-Flyer AI-HPC for LLM Training](https://www.youtube.com/watch?v=DChAYv92msA) — 如何用一半成本搭出接近 DGX-A100 的万卡训练集群
- [SC'24 正式论文页（ACM，含现场宣讲录像）](https://dl.acm.org/doi/10.1109/SC41406.2024.00089) — 会议收录页 + Recorded Presentation
- [B站] [逐篇讲解 DeepSeek 关键 9 篇论文及创新点](https://www.bilibili.com/video/BV1xuK5eREJi/) — 全系列综述视频，含本篇

### 英文 & 社区
- [Hugging Face 论文页](https://huggingface.co/papers/2408.14158) — 收录页与社区讨论
- [Emergent Mind](https://www.emergentmind.com/papers/2408.14158) — 英文深度解读：「80% DGX-A100 性能、60% 成本」结论拆解

### 全系列综述（含本篇）
- [DeepSeek 技术路线图（yudonglee）](https://yudonglee.me/deepseek-roadmap/) — 含 Fire-Flyer 集群硬件要点
- [知乎：10 篇论文读懂 DeepSeek 技术演进脉络](https://zhuanlan.zhihu.com/p/2036459670894810864)
- [fengweifeng DeepSeek 论文库](https://fengweifeng.com/deepseek-papers/)
- [Martin Fowler: The DeepSeek Series](https://martinfowler.com/articles/deepseek-papers.html)

---

# Fire-Flyer 2 万卡 PCIe 集群完整流程（含所有疑问点）

## 角色与核心思想

- **硬件**：Fire-Flyer 2 AI-HPC，1 万张 PCIe 版 A100（约 1250 个 GPU 计算节点 + 约 200 个存储服务器），没有 DGX 那样的全家桶高端配置。
- **软件**：四件套自研补丁——HFReduce（通信）、HaiScale（并行训练）、3FS（分布式文件系统）、HAI Platform（调度）。哪块硬件弱，软件就补哪块。
- **核心思想一句话**：「你（DGX）有 80% 的性能，我只要 60% 的价格、60% 的能耗，差的 20% 用软件补。」最终：达到 DGX-A100 约 80% 性能，成本减半、能耗降 40%（原文摘要与结论〕。

下面以「一个 64 卡训练任务从头跑到尾闯一遍整个集群」为主干推演，每一步都问：为什么这么设计。

---

## 阶段 0：立项——凭什么不用 DGX

任务要训练 LLM，需要上千张卡。市面标杆是 NVIDIA DGX-A100。本文的选择逻辑：

```
DGX-A100：SXM 卡 + 9 张 200Gbps 网卡 + 2TB 内存 + 全 8 卡 NVLink 全互联
本文架构：PCIe 卡 + 1 张 200Gbps 网卡 + 512GB 内存 + 可选 NVLink Bridge
```

性能账（原文表 II）：TF32 GEMM 每 GPU 107 vs 131 TFLOPS，FP16 220 vs 263 TFLOPS，即 PCIe 版约为 SXM 版的 83% GEMM 性能；节点功耗 2500W vs 4200W；节点价格 60%。省下的钱一部分投给了几十人的自研软件团队（原文 VIII-C1：软件成本只是数千台 GPU 服务器的零头）。

**疑问点①：8 张 GPU 为什么只配 1 张 200Gbps 网卡？DGX 配 9 张啊！**
原文 III-A 给了判据：「我们的训练负载里，8 张 PCIe A100 的存储 IO + 计算通信带宽需求，一张 200Gbps CX6 IB 网卡就能满足。」省 8 张网卡的钱，是整个省钱体系的第一步。前提是后面所有软件设计（HFReduce 主机内存中转、PP 错峰）都围绕「出口只有一条车道」来做。

**疑问点②：为什么 GPU 和网卡直连 CPU，不用 PCIe Switch？**
原文 III-A 三条设计决策之一：IB 网卡独占一个 PCIe root complex，避免与 GPU 相互干扰。不用 switch 是因为 NCCL 在这种架构下主要是被 PCIe 带宽卡脖子（原文 IV-B1），switch 救不了 NCCL（Rome CPU 不支持 chained write，GPU↔IB NIC 点对点最高约 9 GiB/s，原文 IV-D2），反而 HFReduce 用 CPU 中转绕开了这个限制。

---

## 阶段 1：任务领到机器——节点与全网形态

HAI Platform 不池化 GPU，以计算节点为基本单位、按资源类型和网络区域打标分配。任务被分配到 8 个节点（64 卡）。

```
单节点（原文图4）：
                ┌─ GPU0 ─┐
  2×AMD 32核    │ GPU1   │ PCIe 4.0 x16 直连 CPU
  EPYC Rome     │  ...   │
      │         │ GPU5/6 ├── 注意：这两张卡共享同一个 PCIe root port！
  512GB 16通道  │ GPU7   │
  DDR4-3200     └────────┘
      │
      └── CX6 200Gbps IB 网卡（独立 root complex）
```

全网形态（原文 III-B）：约 1250 个 GPU 节点 + 近 200 个存储服务器，接成**两个区**，每区一个 800 口双层 Fat-Tree（20 台 spine + 40 台 leaf，最多容纳 800 节点），各挂约 600 个 GPU 节点；存储服务器每台带 2 张 IB 网卡，分别接入两个区，于是所有计算节点共享同一套存储；两区之间只有少量互连链路。

**疑问点③：为什么拆成两个区？跨区链路那么少，跨区任务不就把路堵死了？**
因为双层 Fat-Tree 上限 800 节点，万卡必然装不下，三层 Fat-Tree 又太贵（见阶段 5 的账）。原文的解法是**调度器保证**：跨区任务最多 1 个，且不管是 NCCL 还是 HFReduce，跨区都用 double binary tree 算法走那几条互连链路——一棵树每层只有一条活跃边，少量链路恰好够用。

---

## 阶段 2：并行怎么切——HaiScale 四种切法

64 卡任务在 HaiScale 里选并行组合（原文 V-B）：

- **DDP**：HFReduce 做通信后端（PyTorch DDP 用 NCCL）。反传时对算好的梯度做**异步 allreduce**，与反传计算重叠。训 VGG16：比 Torch DDP/NCCL 只花一半时间，32→512 GPU 规模并行效率 88%（原文图 8a）。
- **TP（张量并行）**：LLM 时代给 PCIe 卡之间加装了 NVLink Bridge，每对卡之间 600 GB/s（原文表 I：DGX 是 8 卡全共享 600 GB/s；本文是每对卡一条），TP 走 NVLink 更高效。
- **PP（流水线并行）**：8 卡共用 1 张网卡的节点，PP 的 P2P 通信会抢网卡。解法巧妙：**把同节点的 8 张卡分到 8 个不同的 DP rank**，各 rank 的 PP 时序错开，避免同一时刻都在发数据。训 LLaMA-13B（seq 2048、batch 4096、PP=4）：64→512 GPU，step 时间 64.118s→9.717s，并行效率 91%（原文图 9a）。
- **FSDP（ZeRO Stage 3 实现）**：每卡只存 1/n 的参数、梯度、优化器状态；前向/反向各做一次 allgather 拼全参数，反传末尾 reduce-scatter 同步梯度后各更 1/n。HaiScale 版加了两个重叠：allgather/reduce-scatter 与前反向计算重叠、优化器 step 拆进反传里。训 GPT2-medium：16→128 GPU 并行效率 95%，训练时间约比 PyTorch FSDP 少一半（原文图 8b）。

另一个成绩：DeepSeekMoE-16B（seq 4096、batch 4608、PP=10），40→640 GPU step 时间 79.615s→6.535s（并行效率 76.14%），320 GPU 时 10.71s、效率 92.92%（原文图 9b）。

**疑问点④：PP 抢网卡为什么会成为问题？错峰为什么能解决？**
一个节点 8 张 PP 阶段的卡同时发/收 P2P 数据，全部挤一条 200Gbps 出口，互相等待。错峰是让 8 个 DP rank 的 PP 各微步（micro-batch）时间表错开——同一瞬间通常只有一个 rank 在大流量通信，出口车道轮流用。这是「只有 1 张网卡」这个廉价设计倒逼出来的软件补偿。

---

## 阶段 3：每一步最贵的一件事——All-Reduce（HFReduce 三段推演）

反传结束要同步梯度。看 HFReduce（原文 IV-A，图 6）的完整一轮：

```
① D2H：8 张卡的梯度块异步搬到 CPU 内存
     小数据走 GDRCopy，大数据走 MemCpyAsync（用 GPU Copy Engine，不占 SM！）
② 节点内归约：CPU 用 SIMD 向量指令做 reduce add
     支持 FP32 / FP16 / BF16 / FP8
③ 节点间 allreduce：CPU 内存之间走 IB RDMA
     double binary tree 算法，数据切块流水线化
④ H2D：结果写回 GPU
     GDRCopy 一次读主机内存、写同 NUMA 的 4 张卡（比 MemCpy 少 3 倍读）
```

```
GPU0 ─┐                        ┌─ GPU0
 ...  ├→ [D2H] → CPU内存REDUCE → [节点间RDMA双二叉树] → [H2D] → 全体一致
GPU7 ─┘
```

**疑问点⑤：NCCL 在 PCIe 架构下到底慢在哪？——一笔「PCIe 带宽税」**
NCCL ring 里，n 是 GPU 总数，每单位数据要走 **2(n−1) 次传输**，每次各占一台 GPU 的收、另一台的发带宽。摊到每单位数据：

```
NCCL ring：  单位数据的 PCIe 双向带宽消耗 = 2(n−1)/n 份   （n 越大越接近 2）
HFReduce：   单位数据只走 1 次 D2H + 1 次 H2D = 1 份
```

同规模带宽下，HFReduce 的 PCIe 流量预算近 2 倍于 NCCL，所以更快（原文 IV-B1）。实测 186 MiB 数据、16→1440 GPU 强扩展：HFReduce 节点间 6.3~8.1 GB/s，NCCL 只有 1.6~4.8 GB/s（原文图 7a）。

**疑问点⑥：梯度搬到 CPU 用 SIMD 加，不怕慢、不怕精度问题？**
慢的顾虑正是实测推翻的：CPU 向量指令加法本身不是瓶颈（见下）。精度上 reduce add 是确定性的算术归约，顺序不同可能与 GPU 归约结果有极小的舍入差——原文未讨论这层，此处不展开，但支持 FP32/FP16/BF16/FP8 四种类型按数据类型加。另一个隐藏收益：NCCL 的 allreduce 要占 GPU kernel（干扰其他计算 kernel），HFReduce 只用 Copy Engine 搬运、用 CPU 归约，**GPU 上完全零 kernel 开销、完全异步**（原文 IV-B2）。

**疑问点⑦：HFReduce 理论速度是多少？为什么实测只有 8 GB/s？**
原文 IV-D3 的内存操作账（每节点、以原始数据大小为 1）：

```
D2H 阶段：           8 次写
节点内 reduce add：  8 读 + 1 写
节点间 allreduce：   IB 发 2 读 + IB 收 2 写 + 归约 1 读
H2D 阶段：           GDRCopy 2 读（MemCpyAsync 则要 8 读）
合计 ≈ 24 × 数据大小

16 通道 DDR4-3200 实测内存访问 ≈ 320 GB/s
→ 理论上限 320/24 ≈ 13.3 GB/s，计入算法/网络带宽打折扣后 ≈ 12 GB/s
→ 实测只到 8 GB/s 多，缺口来自下一问的 CPU 坑
```

**疑问点⑧：那 8→13.3 的缺口坑在哪？**
GPU5 和 GPU6 共享同一个 PCIe root port（阶段 1 图里的坑）。Rome/Milan 的单个 root port 到 CPU 内部总线带宽约 37.5 GB/s；单张 PCIe 4.0 x16 本可跑 27 GB/s 以上，但**两张卡并发时就合计被压到约 37 GB/s**，双向并发更低。连下一代 Genoa 也一样，作者希望 AMD 改进（原文 IV-D3）。

**疑问点⑨：NVLink Bridge 到底加不加？**
原文 VIII-B 的结论很实用主义：**初期不加**（省钱+稳定，HFReduce 当时够用），LLM 时代按需加。加了之后出第二形态「HFReduce with NVLink」：先让 NVLink 配对的两卡互相归约，再把结果交 CPU，回程拆一半给配对卡、再经 NVLink allgather 补齐——绕开了 CPU 内存带宽瓶颈，节点间带宽超过 10 GB/s（原文 IV-C 图 7b）。代价也有：NVLink 问题是 PCIe 集群里最高的硬件故障源（见阶段 4）。

---

## 阶段 4：数据从哪来——3FS 与「不堵的艺术」

训练数据 / checkpoint 都在 3FS（原文 VI-B）：

```
存储节点 × 180：1×64核 EPYC 7742 + 512GB + 2×CX6 200Gbps + 16×15.36TB NVMe
合计：2880 块 NVMe（>20PiB，镜像冗余）；360 张 200Gbps 网卡
     出口带宽 9 TB/s（理论）→ 实测读吞吐 8 TB/s
```

内部结构：cluster manager（多主选举）+ meta service + storage service + client 四角色；文件元数据（inode 表、目录项表）存在分布式 KV；文件切成 chunk，用 **CRAQ 链式复制**（write-all-read-any）保强一致并吃满所有 SSD 的 IOPS；meta 给每个文件在链表（chain table）里选偏移和条带宽度 k，把 chunk 摊到 k 条链。

**疑问点⑩：训练流量和存储流量挤同一张网，怎么互不踩？**
原文 VI-A 的组合拳：
1. **流量分道**——IB 的 SL（Service Level）映射到虚拟队列 VL，HFReduce 通信、NCCL 通信、3FS 存储、其他四类流量各占不同 VL，互不干扰，避免队头阻塞；
2. **静态路由**——存储的高吞吐场景天然多 incast，实测开自适应路由反而把拥塞扩散，于是改静态路由，并把存储/计算/管理节点均匀铺到 leaf→spine 链路上；
3. **NCCL 调优**——让 NCCL 走同 NUMA 的 IB 网卡和 GPU，减少 CPU chiplet 互联造成的 PCIe 拥塞，再加 PCIe Relaxed Ordering；
4. **3FS 的 request-to-send**——客户端侧会出现 incast 拥塞，于是存储服务读到数据后先向客户端「申请发送许可」，客户端限制并发发送方数量，获批才 RDMA WRITE。牺牲一点端到端延迟，换来可持续高吞吐。

**疑问点⑪：为什么干脆把 DCQCN 关了？**
DCQCN 是 IB 网卡默认拥塞控制（原文 VIII-A）。作者实测**找不到一组参数能同时伺候 HFReduce 流量和 3FS 存储流量**（两种流量特征差异太大），干脆禁用 DCQCN，靠上面的 SL/VL 分道 + 静态路由 + RTS 实现「无拥塞控制但无拥塞」。

---

## 阶段 5：挂了怎么办——故障、checkpoint 与年度账本

任务跑几周，硬件故障是常态不是意外（原文 II-B2、VII）。本集群一年的故障画像：

- **GPU Xid 错误分类**（原文表 V/VI）：NVLink 错误 Xid74 占全部的 **42.57%**（NVLink Bridge 连接器固有故障率 × 上千张卡的规模放大）；非法内存访问 Xid43 占 **33.48%**；显存 ECC 类（Xid63/64/94/95）约 **2%**。
- **网络 flash cut**：排除 Xid74 后的硬件故障里 IB 链路闪断占 **30%**，且整个运行期随机出现。
- 参照另一篇论文：别家 NVLink 相关故障占总故障约 **52.42%**（54/103）——本文的 42.57% 量级相当。

防御三件套：

1. **Checkpoint manager**（原文 VII-A）：参数和优化器状态切块、异步 GPU→CPU、经 3FS 批量写 API 落盘，**每节点可超 10 GiB/s，秒级存完**，默认约每 5 分钟一次；每个张量记录索引与 checkpoint 内偏移，加载也是秒级。挂掉只损失最后 5 分钟。
2. **Validator**（原文 VII-B）：平台运维系统**每周**对节点跑例行体检——硬件频率/链路状态、CPU 压力与内存带宽、逐字节 GPU 显存测试、满显存 GEMM、节点内 allreduce(NVLink 带宽)、存储带宽压测；不合格节点从调度池摘除。
3. **HAI Platform 时分调度**（原文 VI-C）：收到中断信号→存 checkpoint→通知退出→日后从 checkpoint 恢复；代码必须写成可断点续跑。换来集群 **99% 利用率**。

**疑问点⑫：每 5 分钟存一次 checkpoint，万卡集群不会把存储打爆、把训练拖慢吗？**
两个前提：GPU→CPU 是异步搬运（不占用反传后的关键路径）；落盘走 3FS 高吞吐批量写（每节点 10 GiB/s、秒级完成），写在后台完成。原文明确说「不影响训练进程」（VII-A）——瓶颈根本不在盘，这正是自研 3FS 配 8 TB/s 读吞吐的回报。

---

## 阶段 6：算总账——成本与能耗对照（原文表 II/III）

| 项目 | 本文架构 | PCIe+三层 Fat-Tree | DGX 架构 |
|---|---|---|---|
| 交换机数 | **122** | 200 | 1320 |
| 网络相对价格 | **350** | 600 | 4000 |
| 服务器相对价格 | 11250 | 11250 | 19000 |
| 总价 | **11600** | 11850 | **23000** |

- 同规模三层 Fat-Tree（1600 接入点、40 核心+160 spine/leaf 共 200 台）相比，本文网络省 **40%** 成本；800 口框式交换机进一步省光模块和线缆。
- 整机能耗：Fire-Flyer 2 总计不超过 4 MW、约 3 MW 出头（原文 VIII-C2）；结论重申「80% 性能、能耗不到 DGX 的 60%」。
- 性价比指标（表 II）：成本性能比 **1.38**（DGX 归一为 1）。
- 下一代规划（原文 IX）：面向 MoE 的 GPU:网卡 1:1、多平面网络、考虑换 RoCE 交换机——128 口 400Gbps RoCE、4 平面双层 Fat-Tree 可扩到 **32768** 卡。

---

## 全局数据流总表

| 阶段 | 谁在动 | 产出 | 代价/瓶颈 |
|---|---|---|---|
| 提交任务 | HAI Platform | 按节点单位分配、区标化 | 保证跨区任务 ≤1 |
| 读数据 | 3FS | chunk 链式读、RTS 控流 | 8 TB/s 实测读 |
| 切并行 | HaiScale | DDP/TP/PP/FSDP 组合 | 网卡争抢 → DP rank 错峰 |
| 反传重叠 | HaiScale DDP | 梯度异步 allreduce | GPU 零 kernel 开销 |
| 梯度同步 | HFReduce | D2H→CPU SIMD→双二叉树 RDMA→H2D | 24×内存操作，实测 ~8 GB/s |
| 落盘 | Checkpoint Mgr+3FS | 秒级存/读 checkpoint | 每 5 分钟，只损失 5 分钟 |
| 体检 | Validator | 周期摘除坏节点 | Xid74 是头号故障源 |

---

## 所有疑问点速查

| 疑问 | 答案 |
|---|---|
| 8 张 GPU 只配 1 张网卡？ | 训练负载的存储 IO+通信一张 200Gbps 就够（原文判据），软件围绕单出口设计 |
| 为什么无 PCIe Switch、网卡独占 root complex？ | 避免干扰；switch 救不了被 PCIe 带宽卡死的 NCCL |
| 万卡怎么塞进双层 Fat-Tree？ | 拆两区，存储双网卡双归属，跨区任务限 1 个+二叉树算法走少量互连链路 |
| PP 抢网卡怎么办？ | 同节点 8 卡分 8 个 DP rank，PP 时序错峰 |
| NCCL 慢在 PCIe 架构哪里？ | ring 每单位数据 2(n−1)/n 份 PCIe 双向带宽；HFReduce 只 1 份 |
| CPU SIMD 加梯度可靠吗？ | 确定性归约、四精度类型支持；且不占 GPU SM、零 kernel 开销 |
| 理论 13.3、实测 8 GB/s 差在哪？ | 24× 内存操作账 + GPU5/6 共享 root port 的 37.5 GB/s 上限 |
| HFReduce with NVLink 是什么？ | 先 NVLink 配对归约再交 CPU，>10 GB/s，绕开主机内存瓶颈 |
| 计算和存储共用网会互踩吗？ | SL/VL 分道 + 静态路由 + NCCL 调优 + 3FS 的 request-to-send |
| 为什么关 DCQCN？ | 无参数同时适配两种流量，改用网络调优实现无拥塞 |
| 最高的硬件故障是什么？ | NVLink Xid74 占 42.57%，周体检 + 摘除坏节点 |
| 5 分钟 checkpoint 拖不拖训练？ | 异步搬运+3FS 批量写 10 GiB/s/节点，秒级完成不挡路 |

---

## 一句话总括

**用「1 张网卡的 PCIe A100 节点 + 两区双层 Fat-Tree」把硬件价格压到 DGX 的 60%，再用 HFReduce（CPU 中转 allreduce，PCIe 流量从 2(n−1)/n 份降到 1 份）、HaiScale（并行组合+错峰+重叠）、3FS（8 TB/s 存储 + SL/VL 流量分道）、HAI Platform（时分调度 + 秒级 checkpoint）四件自研软件把缺的 20% 性能补回来——最终 1 万张 PCIe A100 跑出 DGX 约 80% 的性能、一半的成本、60% 的能耗。**

---

## 参考与延伸阅读

- 本篇论文：[arXiv:2408.14158 摘要页](https://arxiv.org/abs/2408.14158) ｜ [arXiv HTML 全文](https://arxiv.org/html/2408.14158v2)（本笔记全部数字出自此全文）
- SC'24 收录页：[SC24 论文页](https://sc24.supercomputing.org/proceedings/tech_paper/tech_paper_pages/pap350.html) ｜ [ACM DL（含宣讲录像）](https://dl.acm.org/doi/10.1109/SC41406.2024.00089)
- 论文中给出的开源地址：[HAI Platform（HFAiLab/hai-platform）](https://github.com/HFAiLab/hai-platform)
- 本站配套：[本篇词汇](../study/vocab/11_Fire-Flyer_论文词汇.html) ｜ [本篇听力](../study/listen/11_Fire-Flyer_单词听力.html)

