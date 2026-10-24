#!/bin/bash
# 应急推送通道：GitHub HTTPS 走不通时，改走 SSH-22 直连可达 IP 段。
#
# 背景（2026-10-24 实测，见 DECISIONS §D4）：
#   本机 DNS 把 github.com 解析到亚洲段（20.205.243.x），该段在此网络下 TLS 握手被掐断；
#   而 GitHub 美西段（140.82.112/113/114.x、20.27.177.x、20.200.245.x）稳定可达。
#   代理侧当时也不可用（订阅过期 / 本地转发进程没起），所以走「换 IP 直连 SSH」。
#
# 做法：
#   1) 依次对候选 IP 试 `git ls-remote`（走 SSH-22），第一个认证通过的即选用；
#   2) 用该 IP 的 SSH URL 直接 push，不改仓库 remote，也不改 ~/.gitconfig；
#   3) 推完顺手把 refs/remotes/origin/main 更新到远端 HEAD（push 到 URL 不会自动更新它）。
#
# 用法：
#   bash scripts/push_via_ssh.sh            # 推 main
#   bash scripts/push_via_ssh.sh --dry-run  # 只探测，不推
set -uo pipefail

REPO="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO" || exit 1

OWNER="$(git config --get remote.origin.url | sed -E 's#.*github\.com[/:]([^/]+)/([^/.]+)(\.git)?.*#\1/\2#')"
[ -n "$OWNER" ] || { echo "✗ 从 remote.origin.url 读不出 owner/repo"; exit 1; }
OWNER="${OWNER%.git}"

DRY=0
[ "${1:-}" = "--dry-run" ] && DRY=1

# GitHub 官方 IP 段候选（DNS 默认那条亚洲段常常是死路，所以不从 DNS 起手）
IPS=(
  140.82.113.3
  140.82.114.3
  140.82.112.3
  20.27.177.113
  20.200.245.247
  20.205.243.160
  20.205.243.166
)

SSH_OPTS="-o HostKeyAlias=github.com -o StrictHostKeyChecking=accept-new -o ConnectTimeout=12 -o BatchMode=yes"

echo "── 探测可达 IP（SSH-22）"
PICK=""
for ip in "${IPS[@]}"; do
  if GIT_SSH_COMMAND="ssh $SSH_OPTS" git ls-remote "ssh://git@$ip/$OWNER" HEAD >/dev/null 2>&1; then
    echo "  ✓ $ip 可用"
    PICK="$ip"
    break
  else
    echo "  ✗ $ip 不通"
  fi
done

if [ -z "$PICK" ]; then
  echo "✗ 所有候选 IP 都不通 —— 这次是真的没有出口（检查代理客户端是否在跑）"
  exit 1
fi

if [ "$DRY" = "1" ]; then
  echo "（dry-run）选定 ${PICK}；实际推送请去掉 --dry-run"
  exit 0
fi

echo "── 用 $PICK 推送 main"
GIT_SSH_COMMAND="ssh $SSH_OPTS -o ServerAliveInterval=20 -o ServerAliveCountMax=6" \
  git push "ssh://git@$PICK/$OWNER" main:main
rc=$?

if [ $rc -eq 0 ]; then
  # push 到 URL 不会更新本地 origin/main，这里补上，免得下次又误判「没推上去」
  GIT_SSH_COMMAND="ssh $SSH_OPTS" git fetch "ssh://git@$PICK/$OWNER" main:refs/remotes/origin/main >/dev/null 2>&1
  echo "✓ 推送完成，origin/main 已同步到 $(git rev-parse --short origin/main)"
else
  echo "✗ 推送失败（退出码 $rc）"
fi
exit $rc
