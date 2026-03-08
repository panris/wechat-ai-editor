# WeChat AI-Editor 项目总览

## 🎯 项目简介

**WeChat AI-Editor** 是一款基于豆包大模型的公众号内容创作辅助工具，通过 Chrome 插件形式深度集成到微信公众号编辑器，帮助创作者高效完成选题分析、内容生成和文章优化。

## ✨ 核心特性

1. **竞品文章抓取**：通过爬虫自动抓取同类账号的最新爆款文章
2. **智能文章解构**：AI 深度分析文章结构、受众痛点、情绪基调和爆款元素
3. **一键生成初稿**：基于分析结果，生成结构相似但内容原创的全新文章
4. **实时对话助手**：随时与 AI 交流，获取创作建议和灵感
5. **无缝编辑器集成**：Chrome 插件形式，直接在微信公众号后台使用

## 📁 项目结构

```
wechat-ai-editor/
├── chrome-extension/      # Chrome 浏览器插件（前端）
│   ├── manifest.json      # 插件配置
│   ├── src/
│   │   ├── content/       # 注入到公众号页面的脚本
│   │   ├── background/    # 后台服务（API 调用）
│   │   └── popup/         # 设置页面
│   └── dist/              # 构建产物（加载到 Chrome）
│
├── backend/               # 后端服务（Spring Boot）
│   ├── pom.xml            # Maven 依赖配置
│   └── src/main/
│       ├── java/          # Java 源码
│       │   └── com/wechat/aieditor/
│       │       ├── controller/    # API 控制器
│       │       ├── service/       # 业务逻辑
│       │       ├── config/        # 配置类
│       │       └── model/         # 数据模型
│       └── resources/
│           └── application.yml    # 应用配置
│
├── crawler/               # 爬虫服务（Python）
│   ├── src/
│   │   └── main.py        # 爬虫主程序
│   ├── config/
│   │   └── config.json    # 爬虫配置
│   └── requirements.txt   # Python 依赖
│
├── docs/                  # 项目文档
│   └── README.md          # 完整使用文档
│
├── start.sh               # 快速启动脚本
└── README.md              # 项目说明
```

## 🚀 快速开始

### 方式 1：使用启动脚本（推荐）

```bash
cd wechat-ai-editor
./start.sh
```

按提示选择要启动的服务。

### 方式 2：手动启动

#### 1. 构建并安装 Chrome 插件

```bash
cd chrome-extension
node build.js
```

然后在 Chrome 中加载 `chrome-extension/dist` 目录。

#### 2. 启动后端服务

```bash
# 设置 API Key
export DOUBAO_API_KEY=your-api-key-here

# 启动服务
cd backend
mvn spring-boot:run
```

#### 3. 运行爬虫（可选）

```bash
cd crawler
pip install -r requirements.txt
playwright install chromium

# 抓取指定文章
python src/main.py <文章URL>
```

## 🔑 配置豆包 API Key

### 获取 API Key

1. 访问 [火山引擎控制台](https://console.volcengine.com/ark)
2. 注册/登录账号
3. 在 API 管理页面创建 API Key

### 配置方式

**Chrome 插件**：
- 点击插件图标 → 输入 API Key → 测试连接 → 保存

**后端服务**：
- 设置环境变量：`export DOUBAO_API_KEY=your-key`
- 或编辑 `backend/src/main/resources/application.yml`

## 📖 使用指南

### 基础使用流程

1. **打开微信公众号编辑器**
   - 访问 `https://mp.weixin.qq.com/`
   - 进入图文素材编辑页面

2. **唤醒 AI 助手**
   - 点击右下角的 🤖 悬浮按钮
   - AI 侧边栏自动展开

3. **三大核心功能**

   **① 对话模式**
   - 与 AI 实时交流创作思路
   - 获取选题建议和写作灵感

   **② 竞品追踪**
   - 查看最新抓取的同类爆款文章
   - 一键选择目标文章进行分析

   **③ 文章解构与生成**
   - 输入竞品文章链接
   - AI 自动提取核心要素
   - 点击"一键生成初稿"
   - 初稿直接插入编辑器

### 高级功能

- **划线改写**：选中文本 → 右键菜单 → AI 改写
- **语气调整**：将文本调整为更专业/幽默/治愈的语气
- **扩写/缩写**：对指定段落进行扩展或精简
- **金句提取**：从长文中提取可传播的金句

## 🛠️ 技术栈

| 模块 | 技术栈 |
|------|--------|
| 前端插件 | Chrome Extension API, Vanilla JavaScript, CSS3 |
| 后端服务 | Java 17, Spring Boot 3.2, OkHttp, Lombok |
| 爬虫服务 | Python 3.10, Playwright, BeautifulSoup4, asyncio |
| AI 模型 | 豆包大模型 (Doubao-Pro-32K) |
| 数据库 | H2 (开发), MySQL (生产) |

## 📊 开发路线

### ✅ v1.0 MVP (当前版本)

- Chrome 插件基础框架
- 豆包 API 对接与对话功能
- 文章解构与初稿生成
- 基础爬虫服务
- 后端 API 服务

### 🚧 v2.0 自动化池（规划中）

- 定时后台爬虫
- 竞品账号管理面板
- 热门文章排行榜
- 历史记录与草稿管理
- 文章入库与检索

### 🔮 v3.0 个性化（未来）

- 用户风格学习与模仿
- RAG 知识库集成
- 历史文章向量检索
- 自定义 Prompt 模板
- 多账号管理
- 私有化部署支持

## 📚 文档导航

- **完整使用文档**: [docs/README.md](docs/README.md)
- **Chrome 插件文档**: [chrome-extension/README.md](chrome-extension/README.md)
- **后端服务文档**: [backend/README.md](backend/README.md)
- **爬虫服务文档**: [crawler/README.md](crawler/README.md)

## ❓ 常见问题

### Q: 插件无法在公众号页面显示？

- 确认已在 `chrome://extensions/` 正确加载插件
- 刷新公众号编辑页面
- 检查浏览器控制台是否有错误

### Q: 后端服务启动失败？

- 检查 Java 版本（需要 17+）
- 确认 8080 端口未被占用
- 验证 API Key 配置是否正确

### Q: 生成的内容原创度如何？

- Prompt 已强制要求"完全原创"
- 建议融入自己的案例和观点
- 生成后需人工审核和调整
- 可使用第三方查重工具检测

### Q: 爬虫被反爬限制？

- 降低爬取频率
- 配置代理 IP
- 考虑接入第三方 API（清博、新榜）

## ⚠️ 法律声明

1. **仅供学习研究**：本项目仅用于个人学习和研究用途
2. **内容版权**：生成的内容需人工审核，遵守原创保护规则
3. **爬虫规范**：爬虫功能请合理使用，遵守目标网站规则
4. **商业使用**：如需商业使用，请自行确保合规性

## 🤝 贡献指南

欢迎贡献代码和提出建议！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📧 联系方式

- **GitHub**: [项目地址](https://github.com/your-repo/wechat-ai-editor)
- **问题反馈**: [Issues](https://github.com/your-repo/wechat-ai-editor/issues)

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

**Built with ❤️ by WeChat AI-Editor Team**

**Powered by 豆包大模型 (Doubao)**
