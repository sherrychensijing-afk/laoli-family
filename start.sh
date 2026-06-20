#!/bin/bash
# 老郦家 家庭管理系统 — 启动脚本
# 使用方法: ./start.sh

cd /Users/chensijing/WorkBuddy/2026-06-20-23-15-15

echo "🏠 启动老郦家 家庭管理系统..."

# 检查是否已经在运行
if lsof -ti:3456 > /dev/null 2>&1; then
  echo "  → 服务已在运行 (端口 3456)"
  echo "  → 访问: http://localhost:3456"
  ./node_modules/.bin/pm2 status
  exit 0
fi

# 用 PM2 启动
./node_modules/.bin/pm2 start ecosystem.config.js
sleep 2

if curl -s http://localhost:3456/api/family > /dev/null 2>&1; then
  echo "✅ 服务启动成功！"
  echo "   📱 网页: http://localhost:3456"
  echo "   📊 状态: ./node_modules/.bin/pm2 status"
  echo "   📋 日志: ./node_modules/.bin/pm2 logs laoli-family"
  echo "   🛑 停止: ./node_modules/.bin/pm2 stop laoli-family"
else
  echo "❌ 启动失败，请检查日志: ./node_modules/.bin/pm2 logs laoli-family"
fi
