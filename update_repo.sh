#!/bin/bash
# 自动更新 GitHub 仓库脚本 (由 MetaSeal AI Agent 维护)
echo "🚀 正在自动同步测试结果至 GitHub..."

# 1. 暂存所有更改
git add .

# 2. 提交更改 (附带时间戳)
git commit -m "chore: auto sync after testing iteration - $(date +'%Y-%m-%d %H:%M:%S')"

# 3. 推送至远程 auth main 分支
git push origin main

echo "✅ 同步完美收官！"
