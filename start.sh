#!/bin/bash

# WeChat AI-Editor 快速启动脚本

echo "================================================"
echo "🤖 WeChat AI-Editor 启动脚本"
echo "================================================"
echo ""

# 检查 API Key
if [ -z "$DOUBAO_API_KEY" ]; then
    echo "⚠️  警告: 未设置 DOUBAO_API_KEY 环境变量"
    echo "请先设置: export DOUBAO_API_KEY=your-api-key"
    echo ""
fi

# 启动选项
echo "请选择要启动的服务："
echo "1) 构建 Chrome 插件"
echo "2) 启动后端服务"
echo "3) 运行爬虫（需要提供文章 URL）"
echo "4) 全部启动（后端服务 + 插件构建）"
echo "5) 退出"
echo ""
read -p "请输入选项 (1-5): " choice

case $choice in
    1)
        echo ""
        echo "📦 正在构建 Chrome 插件..."
        cd chrome-extension
        node build.js
        echo ""
        echo "✅ 插件构建完成！"
        echo "请在 Chrome 中加载 chrome-extension/dist 目录"
        ;;

    2)
        echo ""
        echo "🚀 正在启动后端服务..."
        cd backend
        mvn spring-boot:run
        ;;

    3)
        echo ""
        read -p "请输入文章 URL: " article_url
        echo "🕷️  正在抓取文章..."
        cd crawler
        python src/main.py "$article_url"
        ;;

    4)
        echo ""
        echo "📦 构建 Chrome 插件..."
        cd chrome-extension
        node build.js
        cd ..

        echo ""
        echo "🚀 启动后端服务..."
        cd backend
        mvn spring-boot:run &
        BACKEND_PID=$!

        echo ""
        echo "✅ 所有服务已启动！"
        echo "后端服务 PID: $BACKEND_PID"
        echo ""
        echo "按 Ctrl+C 停止服务..."

        # 捕获退出信号
        trap "kill $BACKEND_PID; exit" INT TERM

        wait $BACKEND_PID
        ;;

    5)
        echo "👋 再见！"
        exit 0
        ;;

    *)
        echo "❌ 无效的选项"
        exit 1
        ;;
esac

echo ""
echo "================================================"
echo "✅ 操作完成"
echo "================================================"
