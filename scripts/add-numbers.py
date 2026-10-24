#!/usr/bin/env python3
"""给论文列表文稿维护「编号」列（写仓内母本 content/DeepSeek_论文列表.md，2026-10-09 定案）。
编号取自门户 data/papers.json（arXiv id → 编号），查不到（无 arXiv 或非学习页篇目）标 —。
两种模式：首次跑 → 新增该列；已有该列 → 默认跳过，加 --force 则按 papers.json 重写（重排编号后必须跑）。
图例里的「01–NN 共 N 篇」也跟着 papers.json 走，不写死。
用法：python3 add-numbers.py [--force] [源md路径]"""
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
PAPERS = os.path.join(HERE, "..", "data", "papers.json")
FORCE = "--force" in sys.argv
# 文稿母本在仓内（与 refresh-papers.mjs 同一份，两边默认值必须一致）
SRC = next((a for a in sys.argv[1:] if not a.startswith("--")),
           os.path.join(HERE, "..", "papers", "论文清单.md"))

num_by_arxiv = {p["arxiv"]: p["num"] for p in json.load(io.open(PAPERS, encoding="utf-8")) if p["arxiv"]}
papers = json.load(io.open(PAPERS, encoding="utf-8"))
nums = sorted(p["num"] for p in papers if p["num"])
N = len(num_by_arxiv)
# 用实际最小/最大编号（重排后中间有空位也不会写错区间）
LEG = "**编号**＝本站学习页序号（%s–%s 共 %d 篇）" % (nums[0], nums[-1], N)

lines = io.open(SRC, encoding="utf-8").read().split("\n")
has_col = any(ln.startswith("|") and "编号" in (ln.split("|")[1] if len(ln.split("|")) > 1 else "")
              for ln in lines)
if has_col and not FORCE:
    print("✓ 已含编号列；要按 papers.json 重写（重排编号后必须跑）请加 --force")
    sys.exit(0)
mode = "rewrite" if has_col else "add"
out, in_tl, done = [], False, 0
for ln in lines:
    if ln.startswith("## 按时间线"):
        in_tl = True
    elif in_tl and ln.startswith("---"):
        in_tl = False
    if in_tl and ln.startswith("|"):
        cells = ln.split("|")
        if mode == "add":
            if ln.startswith("| 时间 |"):
                ln = "| 编号 |" + ln[1:]
            elif re.match(r"^\|[-\s|]+\|$", ln):
                ln = "|---|" + ln[1:]
            else:
                m = re.search(r"arxiv\.org/abs/([0-9]{4}\.[0-9]{4,5})", ln)
                tag = num_by_arxiv.get(m.group(1), "—") if m else "—"
                if tag != "—":
                    done += 1
                ln = "| %s |%s" % (tag, ln[1:])
        elif len(cells) > 2 and "编号" not in cells[1] and not re.match(r"^\s*[-:\s]+$", cells[1]):
            # 重写：只动数据行的第一格（表头与分隔行原样保留）
            m = re.search(r"arxiv\.org/abs/([0-9]{4}\.[0-9]{4,5})", ln)
            tag = num_by_arxiv.get(m.group(1), "—") if m else "—"
            if tag != "—":
                done += 1
            cells[1] = " %s " % tag
            ln = "|".join(cells)
    if in_tl and ln.startswith("> 🅻"):
        # 编号说明整段重写，不靠判重追加（旧版判重字面量写成「编号＝」，实际文本是
        # 「编号**＝」永远判不中，导致每跑一次尾部多一份图例）。
        head = ln.split("；**编号**＝")[0].rstrip("。")
        ln = "%s；%s，—＝暂未建学习页。" % (head, LEG)
    out.append(ln)

io.open(SRC, "w", encoding="utf-8").write("\n".join(out))
print("✓ %s（%s 模式）：编号列匹配 %d 篇（papers.json 有 %d 篇）" % (SRC, mode, done, N))
if done != N:
    print("⚠ 匹配数与 papers.json 不一致，请人工核对（文稿里的 arXiv 号与学习页清单可能不同步）")
