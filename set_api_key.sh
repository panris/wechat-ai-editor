#!/bin/bash
# 豆包 API 密钥配置脚本

# 替换为你的实际 API 密钥
export DOUBAO_API_KEY="your-api-key-here"

echo "环境变量已设置："
echo "DOUBAO_API_KEY: ${DOUBAO_API_KEY:0:10}..."

# 启动后端服务
echo ""
echo "正在启动后端服务..."
cd backend
mvn spring-boot:run