# 📦 微信AI编辑器 v3.1.4 - 完整安装指南

## 🎯 版本信息

- **版本号**: v3.1.4
- **发布日期**: 2026-03-10
- **更新内容**:
  - ✨ 智能配图功能（v3.1.0新增）
  - 🔧 热点功能修复（v3.1.4）- 使用后端热点服务
- **系统要求**: macOS/Windows/Linux + Chrome浏览器

---

## 📋 功能列表

### 核心功能
- ✅ AI写文章
- ✅ 智能标题生成
- ✅ 文章分析
- ✅ 段落扩写
- ✅ 金句提炼
- ✅ 改写润色
- ✅ 热点追踪（已修复）

### 🆕 智能配图功能
- ✅ 客户端模式（免费）
- ✅ 配图缓存加速
- ✅ 可视化预览
- ✅ 单张重新生成
- ✅ 位置拖拽调整

### 🔧 热点功能（v3.1.4修复）
- ✅ 微博热搜TOP 50
- ✅ 后端API服务（稳定可靠）
- ✅ 5分钟智能缓存
- ✅ 多API自动fallback

---

## 💻 系统要求

### 最低配置
- **操作系统**: macOS 10.14+ / Windows 10+ / Linux
- **浏览器**: Chrome 90+ / Edge 90+
- **Java**: JDK 17+
- **内存**: 4GB RAM
- **磁盘**: 500MB 可用空间

### 推荐配置
- **操作系统**: macOS 12+ / Windows 11
- **浏览器**: Chrome 最新版
- **Java**: JDK 21+
- **内存**: 8GB RAM
- **磁盘**: 1GB 可用空间

---

## 🚀 快速安装（10分钟）

### 第一步：安装依赖（3分钟）

#### 1. 安装Java（如果未安装）

**macOS:**
```bash
# 使用 Homebrew 安装
brew install openjdk@17

# 设置环境变量
echo 'export PATH="/usr/local/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 验证安装
java -version
```

**Windows:**
1. 下载 JDK 17: https://www.oracle.com/java/technologies/downloads/
2. 运行安装程序
3. 配置环境变量 JAVA_HOME
4. 验证：打开 CMD 运行 `java -version`

#### 2. 安装Maven（如果未安装）

**macOS:**
```bash
brew install maven
mvn -version
```

**Windows:**
1. 下载 Maven: https://maven.apache.org/download.cgi
2. 解压到 C:\Program Files\Maven
3. 添加到 PATH 环境变量
4. 验证：`mvn -version`

### 第二步：下载项目（1分钟）

```bash
# 如果是 Git 仓库
git clone <repository-url>
cd wechat-ai-editor-final

# 或者直接解压下载的压缩包
unzip wechat-ai-editor-final.zip
cd wechat-ai-editor-final
```

### 第三步：启动后端服务（3分钟）

```bash
# 进入后端目录
cd backend

# 首次运行：下载依赖并编译（可能需要3-5分钟）
mvn clean install

# 启动服务
mvn spring-boot:run
```

等待看到以下提示表示成功：
```
================================================
🤖 WeChat AI-Editor Backend Started
================================================
API Docs: http://localhost:8080/swagger-ui.html
Health Check: http://localhost:8080/actuator/health
================================================
```

### 第四步：安装Chrome扩展（3分钟）

#### 方法1：开发者模式安装（推荐）

1. **打开Chrome扩展页面**
   - 在地址栏输入: `chrome://extensions/`
   - 或点击菜单 → 更多工具 → 扩展程序

2. **开启开发者模式**
   - 点击右上角的"开发者模式"开关

3. **加载扩展**
   - 点击"加载已解压的扩展程序"
   - 选择项目中的 `chrome-extension` 文件夹
   - 点击"选择"

4. **验证安装**
   - 看到"微信AI编辑器"扩展卡片
   - 扩展图标显示在工具栏

---

## ✅ 安装验证

### 1. 验证后端服务

```bash
# 方法1：访问健康检查
curl http://localhost:8080/api/ai/health

# 方法2：打开浏览器访问
open http://localhost:8080
```

应该看到服务正常运行的响应。

### 2. 验证Chrome扩展

1. 打开微信公众号后台
2. 进入图文编辑页面
3. 应该看到右下角有🤖悬浮按钮
4. 点击按钮，侧边栏正常显示

### 3. 验证热点功能（重要）

1. 点击🤖按钮打开侧边栏
2. 切换到"🔥 热点"标签
3. 应该能看到微博热搜TOP 50
4. 数据正常加载，无错误提示

### 4. 验证智能配图功能

1. 点击🤖按钮打开侧边栏
2. 点击"🎨 自动配图"按钮
3. 粘贴一段测试文字（>100字）
4. 应该能正常生成配图预览界面

---

## 🎨 首次使用指南

### 场景1：写文章

1. **打开侧边栏**
   - 在微信编辑器页面，点击右下角🤖按钮

2. **选择功能**
   - 点击"📝 帮我写文章"卡片
   - 输入参考文章链接或主题

3. **生成内容**
   - 系统生成Prompt
   - 点击"🚀 打开豆包对话"
   - 在豆包中粘贴Prompt获取文章

4. **插入编辑器**
   - 复制豆包生成的文章
   - 点击"➜ 粘贴到编辑器"
   - 文章自动插入到微信编辑器

### 场景2：智能配图

1. **触发配图**
   - 粘贴文章时自动提示
   - 或点击"🎨 自动配图"按钮

2. **预览配图方案**
   - 查看AI生成的配图方案
   - 显示图片数量、位置、描述

3. **生成图片**
   - 选择AI客户端（豆包/文心一言）
   - 点击"生成图片"打开客户端
   - 在客户端粘贴Prompt生成图片
   - 保存图片或复制链接

4. **调整和插入**
   - 拖拽调整图片顺序
   - 下拉选择插入位置
   - 重新生成不满意的图片
   - 点击"确认插入"完成

### 场景3：热点追踪

1. **打开热点面板**
   - 点击🤖按钮
   - 切换到"🔥 热点"标签

2. **浏览热点**
   - 查看微博热搜TOP 50
   - 显示热度、标签
   - 每5分钟自动更新

3. **使用热点**
   - 点击热点查看详情
   - 点击"创作文章"基于热点创作
   - 点击"分析热点"获取分析建议

---

## 🔧 配置说明

### 后端配置

配置文件: `backend/src/main/resources/application.yml`

```yaml
# 服务器配置
server:
  port: 8080  # 可修改端口

# 豆包API配置（可选，客户端模式不需要）
doubao:
  api-key: ${DOUBAO_API_KEY:your-api-key-here}
  endpoint: https://ark.cn-beijing.volces.com/api/v3/chat/completions
  model: doubao-pro-32k
  temperature: 0.7
  max-tokens: 4096
  timeout: 60
  # 图像生成配置
  image-endpoint: https://ark.cn-beijing.volces.com/api/v3/images/generations
  image-model: doubao-image-pro
  image-timeout: 120

# 日志配置
logging:
  level:
    com.wechat.aieditor: DEBUG
```

### 前端配置

配置文件: `chrome-extension/manifest.json`

```json
{
  "name": "微信AI编辑器",
  "version": "3.1.4",
  "permissions": [
    "activeTab",
    "clipboardRead",
    "clipboardWrite"
  ]
}
```

---

## 🐛 常见问题

### Q1: 后端启动失败

**错误信息**: `Address already in use`

**原因**: 端口8080被占用

**解决方案**:
```bash
# 方法1：杀掉占用端口的进程
lsof -ti:8080 | xargs kill -9

# 方法2：修改端口
# 编辑 application.yml，将 port 改为其他值（如8081）
```

### Q2: Chrome扩展加载失败

**错误信息**: `Manifest file is missing or unreadable`

**原因**: 选择的文件夹不正确

**解决方案**:
- 确保选择的是 `chrome-extension` 文件夹
- 文件夹内应该有 `manifest.json` 文件

### Q3: 热点功能显示"加载失败"

**原因**: 后端服务未启动

**解决方案**:
```bash
# 1. 确保后端服务正在运行
cd backend
mvn spring-boot:run

# 2. 检查服务状态
curl http://localhost:8080/api/ai/hotspots?source=weibo

# 3. 重新加载Chrome扩展
# 在 chrome://extensions/ 页面点击刷新按钮
```

### Q4: 配图预览界面不显示

**原因**: 后端服务未启动或前端脚本错误

**解决方案**:
```bash
# 1. 检查后端服务状态
curl http://localhost:8080/api/ai/health

# 2. 检查浏览器控制台
# 按F12查看Console是否有错误

# 3. 重新加载扩展
# 在 chrome://extensions/ 页面点击刷新按钮
```

### Q5: 无法复制Prompt

**原因**: 剪贴板权限被拒绝

**解决方案**:
1. 点击地址栏的锁图标
2. 允许"剪贴板"权限
3. 刷新页面重试

### Q6: Maven下载依赖失败

**原因**: 网络问题或Maven配置

**解决方案**:
```bash
# 配置国内Maven镜像
# 编辑 ~/.m2/settings.xml，添加阿里云镜像

<mirrors>
  <mirror>
    <id>aliyun</id>
    <mirrorOf>central</mirrorOf>
    <name>Aliyun Maven</name>
    <url>https://maven.aliyun.com/repository/public</url>
  </mirror>
</mirrors>

# 重新下载依赖
mvn clean install -U
```

---

## 🔄 更新说明

### v3.1.4 (2026-03-10) - 热点功能修复

**修复内容：**
- 🔧 修复第三方热点API失效问题
- ✨ 新增后端热点服务（HotspotService）
- ✨ 使用微博官方API，稳定可靠
- ✨ 5分钟智能缓存，提升性能
- ✨ 多API自动fallback机制
- 📚 更新安装文档

**技术改进：**
- 从依赖第三方API改为自建后端服务
- 实现缓存机制，减少API请求
- 增强错误处理，友好提示
- 支持多数据格式兼容

### v3.1.0 (2026-03-10) - 智能配图升级

**新增功能：**
- ✨ 智能配图功能
- ✨ 客户端模式（免费）
- ✨ 配图缓存系统
- ✨ 可视化预览界面
- ✨ 位置拖拽调整
- ✨ 单张重新生成
- 🐛 修复Lombok编译问题
- 📚 完善文档

### v3.0.0 (2026-01-15)
- ✨ 初始版本发布
- ✨ 基础AI写作功能
- ✨ 热点追踪功能

---

## 📊 性能优化建议

### 后端优化

```bash
# 1. 使用生产环境配置
mvn spring-boot:run -Dspring.profiles.active=prod

# 2. 增加JVM内存
export MAVEN_OPTS="-Xmx2048m -Xms1024m"
mvn spring-boot:run

# 3. 使用后台运行
nohup mvn spring-boot:run > app.log 2>&1 &
```

### 前端优化

```javascript
// 在 content.js 中调整缓存时间（可选）
const CACHE_EXPIRE_TIME = 24 * 60 * 60 * 1000; // 24小时

// 调整为更长时间
const CACHE_EXPIRE_TIME = 7 * 24 * 60 * 60 * 1000; // 7天
```

---

## 🔐 安全建议

### 1. API Key保护

```bash
# 不要在代码中硬编码API Key
# 使用环境变量
export DOUBAO_API_KEY="your-actual-api-key"

# 或创建配置文件（不提交到Git）
echo "DOUBAO_API_KEY=your-key" > backend/.env
```

### 2. 生产环境部署

```yaml
# application-prod.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/aieditor
    username: ${DB_USER}
    password: ${DB_PASSWORD}

logging:
  level:
    com.wechat.aieditor: INFO
```

### 3. HTTPS配置

```yaml
server:
  port: 443
  ssl:
    enabled: true
    key-store: classpath:keystore.p12
    key-store-password: ${SSL_PASSWORD}
    key-store-type: PKCS12
```

---

## 📱 多设备使用

### 在其他电脑上安装

1. **复制项目文件**
   ```bash
   # 打包项目
   tar -czf wechat-ai-editor.tar.gz wechat-ai-editor-final/

   # 在新电脑上解压
   tar -xzf wechat-ai-editor.tar.gz
   ```

2. **按照安装步骤操作**
   - 安装Java和Maven
   - 启动后端服务
   - 加载Chrome扩展

### 云服务器部署

```bash
# 1. 上传到服务器
scp -r backend/ user@server:/opt/wechat-ai-editor/

# 2. SSH登录服务器
ssh user@server

# 3. 启动服务
cd /opt/wechat-ai-editor/backend
nohup mvn spring-boot:run > app.log 2>&1 &

# 4. 配置防火墙
sudo ufw allow 8080
```

---

## 📚 相关文档

### 完整文档列表

1. **QUICK_START.md** - 3分钟快速上手
2. **IMAGE_GENERATION_GUIDE.md** - 智能配图完整指南
3. **IMAGE_GENERATION_DEMO.md** - 功能演示说明
4. **IMAGE_GENERATION_SUMMARY.md** - 技术实现总结
5. **HOTSPOT_FIX_GUIDE.md** - 热点功能修复指南
6. **本文档** - 详细安装说明

### 在线资源

- **项目主页**: [待添加]
- **问题反馈**: [待添加]
- **使用教程**: 查看项目文档
- **API文档**: http://localhost:8080/swagger-ui.html

---

## 🎓 学习资源

### 推荐阅读

1. **Spring Boot官方文档**: https://spring.io/projects/spring-boot
2. **Chrome扩展开发**: https://developer.chrome.com/docs/extensions/
3. **豆包AI文档**: https://www.doubao.com/docs/

---

## 🆘 获取帮助

### 遇到问题？

1. **查看文档** - 首先查看相关文档
2. **检查日志** - 查看后端日志和浏览器控制台
3. **重启服务** - 重启后端服务和重新加载扩展
4. **清除缓存** - 清除浏览器缓存和应用缓存
5. **寻求帮助** - 提交Issue或联系技术支持

### 联系方式

- **技术支持**: [待添加]
- **问题反馈**: [待添加]
- **功能建议**: [待添加]

---

## 🎉 安装完成

恭喜！如果你完成了以上所有步骤，微信AI编辑器已经成功安装。

### 下一步

1. ✅ 尝试写第一篇文章
2. ✅ 体验智能配图功能
3. ✅ 探索热点追踪功能
4. ✅ 分享给朋友

### 快速访问

```bash
# 启动后端服务
cd backend && mvn spring-boot:run

# 访问服务
open http://localhost:8080

# 打开微信编辑器
# 访问: https://mp.weixin.qq.com/
```

**开始你的创作之旅吧！** 🚀✨

---

## 📝 更新日志

### v3.1.4 (2026-03-10)
- 🔧 修复热点功能（使用后端服务）
- ✨ 新增HotspotService后端服务
- ✨ 微博官方API支持
- ✨ 5分钟智能缓存
- 📚 更新安装文档

### v3.1.0 (2026-03-10)
- ✨ 新增智能配图功能
- ✨ 支持客户端模式（免费）
- ✨ 添加配图缓存系统
- ✨ 实现可视化预览界面
- ✨ 支持位置拖拽调整
- ✨ 支持单张重新生成
- 🐛 修复Lombok编译问题
- 📚 完善文档

### v3.0.0 (2026-01-15)
- ✨ 初始版本发布
- ✨ 基础AI写作功能
- ✨ 热点追踪功能

---

**祝你使用愉快！如有问题，随时查看文档或寻求帮助。** 💪