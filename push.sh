#!/bin/bash
# MetaSeal 一键提交并推送到 GitHub
# 用法：./push.sh "提交说明"（省略说明则自动生成）

set -e

MSG=${1:-"chore: auto sync $(date '+%Y-%m-%d %H:%M:%S')"}

# 删除可能存在的 git 锁文件
rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/main.lock 2>/dev/null || true

git add -A
git commit -m "$MSG" || echo "⚠️  没有新改动需要提交"
git push

echo "✅ 已推送到 GitHub"
