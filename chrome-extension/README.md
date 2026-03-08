# Chrome Extension - WeChat AI-Editor

## 功能说明

这是 WeChat AI-Editor 的浏览器插件部分，提供：

1. **AI 侧边栏**：在微信公众号编辑器右侧显示 AI 助手面板
2. **悬浮按钮**：快速唤醒/隐藏侧边栏
3. **三大功能模块**：
   - 对话：与 AI 实时交互
   - 竞品追踪：查看抓取的热门文章
   - 文章解构：分析并生成初稿

## 构建与安装

### 构建插件

```bash
node build.js
```

构建产物位于 `dist/` 目录。

### 加载到 Chrome

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启"开发者模式"（右上角开关）
4. 点击"加载已解压的扩展程序"
5. 选择 `dist` 目录
6. 完成！插件图标会出现在工具栏

## 使用指南

### 首次配置

1. 点击插件图标，打开设置页面
2. 输入豆包 API Key
3. （可选）配置后端服务地址
4. 点击"测试连接"验证
5. 保存配置

### 日常使用

1. 打开微信公众号编辑页面：`https://mp.weixin.qq.com/`
2. 进入图文编辑器
3. 右下角会自动出现 🤖 悬浮按钮
4. 点击按钮唤醒 AI 侧边栏
5. 开始使用各项功能

## 文件结构

```
chrome-extension/
├── manifest.json          # 插件配置文件
├── build.js              # 构建脚本
├── src/
│   ├── content/          # 内容脚本（注入到页面）
│   │   ├── content.js    # 核心逻辑
│   │   └── content.css   # 样式文件
│   ├── background/       # 后台服务
│   │   └── background.js # API 调用处理
│   └── popup/            # 设置页面
│       ├── popup.html    # HTML 结构
│       └── popup.js      # 交互逻辑
└── dist/                 # 构建产物（加载到 Chrome）
```

## 核心技术

- **Manifest V3**: Chrome Extension 最新版本
- **Content Scripts**: 注入到微信公众号页面
- **Background Service Worker**: 处理 API 调用
- **Chrome Storage API**: 保存用户配置

## 权限说明

插件需要以下权限：

- `storage`: 保存用户配置（API Key）
- `activeTab`: 访问当前标签页
- `scripting`: 注入脚本到页面
- `host_permissions`: 访问微信公众号域名和豆包 API

## 常见问题

### 插件无法加载？

- 确保使用 Chrome 88+ 版本
- 检查 manifest.json 格式是否正确
- 查看浏览器控制台错误信息

### 侧边栏未出现？

- 确认在正确的页面（`mp.weixin.qq.com`）
- 刷新页面重新加载插件
- 打开控制台查看是否有 JavaScript 错误

### API 调用失败？

- 检查 API Key 是否正确配置
- 验证网络连接
- 查看后台日志：`chrome://extensions/` → 插件详情 → Service Worker → 控制台

## 开发调试

### 启用开发模式

在 `manifest.json` 中添加：

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### 查看日志

- **Content Script 日志**: 在微信公众号页面打开开发者工具（F12）
- **Background 日志**: 在 `chrome://extensions/` 点击插件的 "Service Worker" 链接
- **Popup 日志**: 在设置页面右键 → 检查

### 热重载

修改代码后，在 `chrome://extensions/` 点击插件的刷新按钮即可重新加载。

## 更新日志

### v1.0.0 (2024-01-01)

- ✅ 初始版本发布
- ✅ AI 侧边栏
- ✅ 豆包 API 对接
- ✅ 对话功能
- ✅ 文章解构功能
- ✅ 初稿生成功能

## 未来规划

- [ ] 支持更多 AI 模型（GPT、Claude 等）
- [ ] 离线缓存历史对话
- [ ] 快捷键支持
- [ ] 主题切换（深色模式）
- [ ] 更多排版工具集成

## 贡献

欢迎提交 Issue 和 PR！

## 许可证

MIT License
