#!/usr/bin/env python3
"""门户栏目改名：「词汇网页」→「词汇学习」、「单词听力」→「词汇朗读」。

只改**文案**，不改 URL（/vocab、/listen）也不改文件名（listen_pages/NN_X_单词听力.html 等
是磁盘上的真实文件名，改名要连带动 32 对页面与 data/papers.json），所以老链接、老收藏全部有效。

用法：cd 学习门户_20261008 && python3 scripts/rename_labels.py            # 改
      python3 rename_labels.py --check    # 只列出还没改的地方
"""
import os
import sys

P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # 学习门户_20261008

FILES = {
    ".vitepress/config.mts": [
        ("词汇网页 + 单词听力", "词汇学习 + 词汇朗读"),
        ("{ text: '词汇网页', link: '/vocab' }", "{ text: '词汇学习', link: '/vocab' }"),
        ("{ text: '单词听力', link: '/listen' }", "{ text: '词汇朗读', link: '/listen' }"),
    ],
    ".vitepress/theme/custom.css": [("词汇网页=绿、单词听力=橙", "词汇学习=绿、词汇朗读=橙")],
    "listen.md": [("title: 单词听力", "title: 词汇朗读"), ("# 单词听力", "# 词汇朗读")],
    "vocab.md": [("title: 词汇网页", "title: 词汇学习"), ("# 词汇网页", "# 词汇学习")],
    "master.md": [("词汇网页", "词汇学习"), ("单词听力", "词汇朗读")],
    "components/HomeIntro.vue": [("词汇网页", "词汇学习"), ("单词听力", "词汇朗读")],
    "components/PaperIndex.vue": [("词汇网页", "词汇学习"), ("单词听力", "词汇朗读")],
    "scripts/refresh-papers.mjs": [("词汇网页", "词汇学习"), ("单词听力", "词汇朗读")],
    "papers.md": [("词汇网页", "词汇学习"), ("单词听力", "词汇朗读")],
    "README.md": [("词汇网页", "词汇学习"), ("单词听力页", "词汇朗读页"), ("单词听力", "词汇朗读")],
}


def main():
    check = "--check" in sys.argv
    left = 0
    for rel, pairs in FILES.items():
        path = os.path.join(P, rel)
        src = open(path, encoding="utf-8").read()
        new = src
        for old, rep in pairs:
            n = new.count(old)
            if n == 0:
                continue                       # 已改过，或这条本来只出现一次已被上一条吃掉
            new = new.replace(old, rep)
            print(f"  {'[待改]' if check else '[改]'} {rel}: {old} → {rep}  ×{n}")
            left += n if check else 0
        if not check and new != src:
            open(path, "w", encoding="utf-8").write(new)
    if check:
        print(f"还有 {left} 处未改" if left else "已全部改过 ✓")
    else:
        print("下一步：cd 学习门户_20261008 && npm run build && 重启 preview")


if __name__ == "__main__":
    main()
