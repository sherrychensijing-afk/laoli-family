#!/bin/bash
# 老郦家 家庭管理系统 - 一键启动
cd "$(dirname "$0")"

# 检查 node_modules
if [ ! -d "node_modules" ]; then
  echo "正在安装依赖..."
  npm install
fi

echo "启动老郦家管理系统..."

# 停掉旧进程
lsof -ti:3456 | xargs kill -9 2>/dev/null

# 用 PM2 启动
./node_modules/.bin/pm2 start ecosystem.config.js

echo "=========================================="
echo "  老郦家 已启动"
echo "  本机: http://localhost:3456"
echo "  状态: ./node_modules/.bin/pm2 status"
echo "  日志: ./node_modules/.bin/pm2 logs laoli-family"
echo "=========================================="

# 显示网络地址
sleep 2
ifconfig 2>/dev/null | grep "inet " | grep -v 127.0.0.1 | awk '{print "  手机访问: http://"$2":3456"}'
