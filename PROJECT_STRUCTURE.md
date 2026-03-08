# 项目结构说明

## 📁 项目路径
`/Users/panris/project/wechat-ai-editor-final`

## 📦 项目大小
总大小：436KB

## 🗂️ 目录结构

```
wechat-ai-editor-final/
├── .gitignore                                 # Git忽略配置
├── README.md                                  # 项目主文档
├── PROJECT_OVERVIEW.md                        # 项目概览
├── PROJECT_COMPLETION.md                      # 完成情况
├── PROJECT_STRUCTURE.md                       # 本文件
├── USAGE_GUIDE.md                             # 使用指南
├── COMPARISON_V1_V2.md                        # v1与v2版本对比
├── UPDATE_NOTES.md                            # 更新日志
├── QUICK_START.md                             # 快速开始
├── start.sh                                   # 启动脚本
│
├── chrome-extension/                          # Chrome扩展源码
│   ├── manifest.json                          # 扩展配置文件
│   ├── package.json                           # npm配置
│   ├── build.js                               # 构建脚本
│   ├── assets/                                # 资源文件
│   ├── src/                                   # 源代码
│   │   ├── background/                        # 后台脚本
│   │   │   └── background.js
│   │   ├── content/                           # 内容脚本
│   │   │   ├── content.js
│   │   │   └── content.css
│   │   └── popup/                             # 弹出页面
│   │       ├── popup.html
│   │       └── popup.js
│   └── dist/                                  # 构建输出目录
│
├── WeChat-AI-Editor-Doubao-Integrated/        # 豆包集成版（已构建）
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── content.css
│   ├── popup.html
│   ├── popup.js
│   └── assets/
│
├── WeChat-AI-Editor-Doubao-Integrated.zip     # 豆包集成版压缩包
│
├── WeChat-AI-Editor-Final/                    # API版本（已构建）
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── content.css
│   ├── popup.html
│   ├── popup.js
│   └── assets/
│
├── backend/                                    # 后端服务（Spring Boot）
│   ├── pom.xml                                # Maven配置
│   ├── src/
│   │   └── main/
│   │       ├── java/                          # Java源码
│   │       └── resources/                     # 配置文件
│   └── README.md
│
├── crawler/                                    # 爬虫服务（Python）
│   ├── requirements.txt                       # Python依赖
│   ├── config/
│   │   └── config.json                        # 爬虫配置
│   ├── src/
│   │   └── main.py                            # 爬虫主程序
│   └── README.md
│
└── docs/                                       # 文档目录
    └── README.md

```

## 📋 版本说明

### 1. WeChat-AI-Editor-Doubao-Integrated (豆包集成版) ⭐ 推荐
- **特点**：直接集成豆包客户端（iframe方式）
- **优势**：无需API Key，开箱即用
- **使用**：在插件内完成所有操作，不跳转页面
- **状态**：已构建，可直接安装使用

### 2. WeChat-AI-Editor-Final (API版本)
- **特点**：使用豆包API进行内容生成
- **优势**：自动生成内容，自动排版
- **使用**：需要配置豆包API Key
- **状态**：已构建，需要API Key才能使用

## 🚀 快速开始

### 安装Chrome扩展（推荐使用豆包集成版）

1. 打开Chrome浏览器
2. 访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `WeChat-AI-Editor-Doubao-Integrated` 文件夹

### 开发和构建

```bash
cd chrome-extension
npm install
node build.js
```

构建后的文件会输出到 `chrome-extension/dist/` 目录

## 🔧 项目组成

### Chrome扩展
- **manifest.json**: V3版本的扩展配置
- **content.js**: 注入到微信公众号页面的脚本
- **content.css**: 侧边栏和UI样式
- **popup.html/js**: 扩展弹出页面
- **background.js**: 后台服务Worker

### 后端服务（可选）
- Spring Boot 3.2
- 提供API接口
- 数据存储和管理

### 爬虫服务（可选）
- Python + Playwright
- 爬取微信公众号文章
- 数据分析和提取

## 📝 核心功能

1. 📝 帮我写文章 - 基于参考文章创作新内容
2. 💡 写标题 - 生成10个爆款标题
3. 🔍 分析文章 - 深度分析文章结构和套路
4. ✨ 扩写段落 - 内容扩充和丰富
5. 🎯 提炼金句 - 提取可传播的精彩句子
6. 📋 改写润色 - 内容优化和美化

## 📞 技术支持

如有问题，请参考：
- README.md - 项目主文档
- USAGE_GUIDE.md - 详细使用指南
- QUICK_START.md - 快速入门

---

**更新日期**: 2026-03-08
**版本**: v3.0