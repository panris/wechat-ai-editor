# WeChat AI-Editor 开发文档

## 项目简介

WeChat AI-Editor 是一款基于豆包大模型的公众号内容创作辅助工具，通过 Chrome 插件形式深度集成到微信公众号编辑器，帮助创作者高效完成选题分析、内容生成和文章优化。

## 快速开始

### 1. Chrome 插件安装

#### 构建插件

```bash
cd chrome-extension
node build.js
```

#### 加载到 Chrome

1. 打开 Chrome 浏览器，访问 `chrome://extensions/`
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `chrome-extension/dist` 目录

#### 配置豆包 API

1. 点击插件图标，打开设置页面
2. 输入豆包 API Key（从[火山引擎控制台](https://console.volcengine.com/ark)获取）
3. 点击"测试连接"验证配置
4. 保存配置

### 2. 后端服务启动

#### 前置要求

- Java 17+
- Maven 3.6+

#### 配置 API Key

编辑 `backend/src/main/resources/application.yml`，或设置环境变量：

```bash
export DOUBAO_API_KEY=your-api-key-here
```

#### 启动服务

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

服务启动后访问：
- API 地址: http://localhost:8080
- 健康检查: http://localhost:8080/api/ai/health

### 3. 爬虫服务部署

#### 安装依赖

```bash
cd crawler
pip install -r requirements.txt

# 安装 Playwright 浏览器
playwright install chromium
```

#### 配置目标账号

编辑 `crawler/config/config.json`，添加目标公众号信息。

#### 运行爬虫

```bash
python src/main.py <文章URL>
```

抓取结果保存在 `crawler/data/articles.json`。

## 功能使用

### 基础对话

1. 打开微信公众号图文编辑页面
2. 点击右下角悬浮的 🤖 按钮
3. 在"对话"标签页与 AI 助手交互
4. 输入问题或需求，获取创作建议

### 文章解构分析

1. 复制竞品文章链接
2. 在对话框中输入链接
3. AI 自动分析文章结构、受众痛点、爆款元素等
4. 查看结构化分析结果

### 生成原创初稿

1. 完成文章分析后，切换到"文章解构"标签页
2. 根据需要调整生成参数（可选）
3. 点击"一键生成初稿"按钮
4. 等待 AI 流式输出完成
5. 点击"插入正文"将内容导入编辑器

### 内容改写润色

1. 在编辑器中选中需要改写的文本
2. 右键菜单选择"AI 改写"（或使用快捷键）
3. 输入改写指令（如："更专业"、"更幽默"、"扩写"）
4. 应用改写结果

## API 文档

### 后端接口

#### 1. 对话接口

```http
POST /api/ai/chat
Content-Type: application/json

{
  "message": "如何写好公众号标题？",
  "systemPrompt": "你是专业的内容创作顾问"
}
```

响应：
```json
{
  "code": 200,
  "message": "Success",
  "data": "AI 的回复内容...",
  "timestamp": 1234567890
}
```

#### 2. 分析文章

```http
POST /api/ai/analyze
Content-Type: application/json

{
  "title": "文章标题",
  "content": "文章正文...",
  "url": "https://mp.weixin.qq.com/s/xxx"
}
```

#### 3. 生成初稿

```http
POST /api/ai/generate
Content-Type: application/json

{
  "analysisResult": "文章分析结果...",
  "customRequirement": "请调整为医疗健康领域"
}
```

#### 4. 改写润色

```http
POST /api/ai/rewrite
Content-Type: application/json

{
  "content": "原文内容...",
  "instruction": "改为更专业的语气"
}
```

## 核心技术

### 前端技术栈

- **Chrome Extension Manifest V3**: 浏览器插件框架
- **Vanilla JavaScript**: 轻量级实现，无额外依赖
- **CSS3**: 现代化 UI 样式

### 后端技术栈

- **Spring Boot 3.2**: 企业级 Java 框架
- **OkHttp**: HTTP 客户端（调用豆包 API）
- **Jsoup**: HTML 解析（文章内容提取）
- **Hutool**: Java 工具库
- **H2 Database**: 内存数据库（开发环境）

### 爬虫技术栈

- **Playwright**: 现代化浏览器自动化工具
- **BeautifulSoup4**: HTML/XML 解析
- **asyncio**: 异步 IO 框架
- **loguru**: Python 日志库

### AI 模型

- **豆包大模型 (Doubao-Pro-32K)**: 字节跳动出品的大语言模型
- **API 端点**: 火山引擎 ARK 平台
- **上下文窗口**: 32K tokens

## 架构设计

```
┌─────────────────┐
│  Chrome Plugin  │ (用户界面)
└────────┬────────┘
         │ REST API
         ↓
┌─────────────────┐
│  Backend API    │ (业务逻辑)
└────────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌────────┐ ┌─────────────┐
│ Doubao │ │   Crawler   │
│  API   │ │   Service   │
└────────┘ └─────────────┘
```

## Prompt 工程

### 文章解构 Prompt

```
请深度分析以下公众号文章，提取关键要素：

文章内容：
{article_content}

请按以下维度分析：
1. **核心主题**：文章的中心思想
2. **目标受众**：主要面向哪类人群
3. **痛点挖掘**：触及了什么痛点或需求
4. **文章结构**：采用了什么行文结构
5. **情绪基调**：文章的情绪倾向
6. **爆款元素**：标题特点、金句摘录
7. **内容密度**：信息量评估

请用结构化的方式输出分析结果。
```

### 生成初稿 Prompt

```
基于以下文章分析结果，生成一篇全新的、结构相似但内容原创的公众号文章初稿：

分析结果：
{analysis_result}

要求：
1. 保持相似的文章结构和情绪基调
2. 核心观点和案例必须完全原创，避免抄袭
3. 融入最新的热点或案例，增加时效性
4. 标题要吸引眼球，符合公众号爆款标题特征
5. 字数控制在 1500-2000 字
6. 语言风格要贴近目标受众
7. 适当加入表情符号和排版技巧

请直接输出完整的文章初稿（包括标题和正文）。
```

## 开发计划

### v1.0 MVP (当前版本)

- [x] Chrome 插件基础框架
- [x] 豆包 API 对接
- [x] 对话式 AI 助手
- [x] 侧边栏 UI
- [x] 后端 API 服务
- [x] 文章解构功能
- [x] 初稿生成功能
- [x] 基础爬虫服务

### v2.0 自动化池

- [ ] 后台定时爬虫
- [ ] 竞品账号管理
- [ ] 热门文章列表
- [ ] 趋势看板
- [ ] 文章入库与管理
- [ ] 历史记录功能

### v3.0 个性化

- [ ] 用户风格学习
- [ ] RAG 知识库集成
- [ ] 历史文章向量检索
- [ ] 自定义 Prompt 模板
- [ ] 多账号管理
- [ ] 私有化部署支持

## 常见问题

### Q: 豆包 API Key 如何获取？

访问[火山引擎控制台](https://console.volcengine.com/ark)，注册账号后在 API 管理页面创建 API Key。

### Q: 插件无法注入到公众号页面？

1. 确认已在 `chrome://extensions/` 加载插件
2. 刷新公众号编辑页面
3. 检查浏览器控制台是否有错误日志

### Q: 爬虫被反爬限制怎么办？

1. 降低爬取频率
2. 配置代理IP
3. 调整 User-Agent
4. 考虑接入第三方微信文章 API（如清博、新榜）

### Q: 生成的内容如何保证原创度？

1. Prompt 中强制要求"完全原创"
2. 提供自定义案例和素材
3. 使用后人工审核和调整
4. 可集成查重工具进行检测

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

- 项目地址: https://github.com/your-repo/wechat-ai-editor
- 问题反馈: Issues 页面

---

**⚠️ 免责声明**

本工具仅用于辅助内容创作，生成的内容需经人工审核。请遵守微信公众平台运营规范，不得发布违规内容。爬虫功能请合理使用，遵守目标网站的 robots.txt 规则。
