# 智能配图功能完整实现文档

## 🎨 功能概览

本次升级为微信AI编辑器添加了完整的智能配图功能，支持以下5大特性：

### ✅ 1. 客户端模式 - 无需API Key
- 移除了对API Key的依赖
- 支持豆包AI和文心一言两个客户端
- 用户在客户端生成图片后手动上传
- 完全免费，不需要任何API配置

### ✅ 2. 配图缓存系统
- 自动缓存配图方案和图片URL
- 避免重复生成相同内容
- 缓存有效期24小时
- 使用MD5 hash作为缓存key

### ✅ 3. 配图预览界面
- 可视化展示所有配图
- 查看每张图的描述和prompt
- 支持确认/取消操作
- 美观的卡片式布局

### ✅ 4. 单张重新生成
- 每张图片独立的重新生成按钮
- 只重新生成选中的图片
- 保持其他图片不变
- 一键打开AI客户端

### ✅ 5. 位置调整功能
- 拖拽调整图片顺序
- 下拉选择插入位置
- 删除不需要的图片
- 实时预览调整效果

---

## 📁 文件结构

### 后端文件 (3个新增 + 2个修改)

#### 新增文件：

1. **ImageCacheService.java** (新建)
   - 路径：`backend/src/main/java/com/wechat/aieditor/service/ImageCacheService.java`
   - 功能：配图缓存管理
   - 核心方法：
     - `getCachedImage(prompt)` - 获取缓存的图片
     - `cacheImage(prompt, url)` - 缓存图片
     - `getCachedPlan(article)` - 获取配图方案
     - `cachePlan(article, plan)` - 缓存配图方案
     - `cleanExpiredCache()` - 清理过期缓存

#### 修改文件：

2. **AIController.java** (修改)
   - 修改 `/api/ai/generate-images` 端点为客户端模式
   - 新增 `/api/ai/generate-single-image` 端点
   - 新增 `/api/ai/clean-cache` 端点
   - 集成缓存服务

3. **DoubaoService.java** (修改)
   - 新增 `analyzeArticleForImages()` 方法
   - 智能分析文章并生成配图方案

### 前端文件 (2个修改)

4. **content.css** (修改)
   - 新增配图预览界面样式（~400行CSS）
   - 响应式卡片布局
   - 拖拽效果样式
   - 客户端选择器样式

5. **content.js** (修改)
   - 新增配图功能模块（~450行代码）
   - 实现配图预览界面
   - 实现拖拽排序
   - 实现客户端集成

---

## 🚀 使用流程

### 方式1：自动触发（推荐）

1. 在豆包中生成文章内容
2. 复制文章内容
3. 点击Chrome扩展的"粘贴到编辑器"按钮
4. 如果文章超过500字，自动弹窗提示"是否自动生成配图"
5. 点击"确定"

### 方式2：手动触发

1. 在豆包对话区点击"🎨 自动配图"按钮
2. 系统读取剪贴板内容（需要至少100字）

### 方式3：预览界面生成

1. 进入配图预览界面后
2. 选择AI客户端（豆包/文心一言）
3. 点击每张图片的"生成图片"按钮
4. 系统自动打开客户端并复制prompt
5. 在客户端粘贴prompt生成图片
6. 保存图片或复制图片链接
7. 返回预览界面，上传或粘贴图片
8. 调整位置、顺序
9. 点击"确认插入"

---

## 💡 配图预览界面功能详解

### 界面布局

```
┌─────────────────────────────────────────────┐
│  🎨 配图预览与调整                      ×   │
├─────────────────────────────────────────────┤
│  [客户端选择器]                              │
│  ○ 豆包AI    ○ 文心一言                     │
├─────────────────────────────────────────────┤
│  💡 提示信息                                 │
├─────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ [封面图] │  │ [第1段]  │  │ [第2段]  │  │
│  │  ⋮⋮      │  │  ⋮⋮      │  │  ⋮⋮      │  │
│  │ [图片]   │  │ [图片]   │  │ [图片]   │  │
│  │ 描述     │  │ 描述     │  │ 描述     │  │
│  │ prompt   │  │ prompt   │  │ prompt   │  │
│  │ [位置]   │  │ [位置]   │  │ [位置]   │  │
│  │ [生成图] │  │ [生成图] │  │ [生成图] │  │
│  └──────────┘  └──────────┘  └──────────┘  │
├─────────────────────────────────────────────┤
│  📋 图片生成指引                             │
│  1. 点击"生成图片"...                        │
│  2. 在客户端粘贴...                          │
├─────────────────────────────────────────────┤
│                      [取消]  [确认插入]      │
└─────────────────────────────────────────────┘
```

### 卡片操作

每张图片卡片支持以下操作：

1. **拖拽排序** (⋮⋮)
   - 按住拖拽手柄可以调整顺序
   - 拖到目标位置释放即可

2. **重新生成** (🔄)
   - 点击可重新生成该图片
   - 会清空当前图片，重新打开客户端

3. **删除图片** (🗑️)
   - 点击可删除该图片
   - 需要确认操作

4. **调整位置**
   - 下拉选择插入位置
   - 可选：封面、第N段后、结尾

5. **生成图片**
   - 打开选中的AI客户端
   - 自动复制prompt到剪贴板
   - 引导用户生成并上传图片

---

## 🔧 API端点说明

### 1. 生成配图方案（客户端模式）

**端点**: `POST /api/ai/generate-images`

**请求体**:
```json
{
  "articleContent": "文章内容...",
  "autoInsert": false
}
```

**响应**:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "totalImages": 3,
    "images": [
      {
        "position": "start",
        "type": "cover",
        "description": "AI技术发展趋势",
        "prompt": "A modern illustration showing artificial intelligence...",
        "imageUrl": null
      }
    ],
    "articleWithImages": null
  }
}
```

### 2. 生成单张图片

**端点**: `POST /api/ai/generate-single-image`

**请求体**:
```json
{
  "prompt": "A modern illustration..."
}
```

**响应**:
```json
{
  "code": 200,
  "data": "https://image-url.com/abc123.jpg"
}
```

### 3. 清理缓存

**端点**: `POST /api/ai/clean-cache`

**响应**:
```json
{
  "code": 200,
  "data": "缓存清理完成"
}
```

---

## 🎯 核心优势

### 1. 完全免费
- 不需要任何API Key
- 使用免费的AI客户端
- 零成本使用

### 2. 智能高效
- AI自动分析文章
- 智能决定配图数量
- 自动生成专业prompt
- 缓存避免重复生成

### 3. 用户友好
- 可视化预览界面
- 拖拽调整超简单
- 随时重新生成
- 完整的操作指引

### 4. 灵活可控
- 自由选择客户端
- 手动调整位置
- 删除不需要的图片
- 确认后再插入

### 5. 性能优化
- 配图方案缓存
- 图片URL缓存
- 减少重复请求
- 24小时缓存过期

---

## 📊 智能配图算法

AI会根据以下因素决定配图数量和位置：

### 文章长度
- 短文（<500字）：1张封面图
- 中等（500-1500字）：2-3张配图
- 长文（>1500字）：3-5张配图

### 文章结构
- 总分总：封面 + 各分点配图
- 故事类：封面 + 关键场景配图
- 干货类：封面 + 要点配图

### 配图类型
- **封面图**：吸引眼球，体现主题
- **段落配图**：辅助理解，增强视觉
- **结尾图**：总结呼应，留下印象

---

## 🎨 客户端集成

### 支持的AI客户端

#### 1. 豆包AI
- 网址：https://www.doubao.com/chat/
- 特点：国内访问快速，生成质量高
- 使用：免费无限次

#### 2. 文心一言
- 网址：https://yiyan.baidu.com/
- 特点：百度出品，中文理解好
- 使用：免费无限次

### 使用技巧

1. **Prompt优化**
   - 系统自动生成英文prompt
   - 包含画面元素、风格、色调
   - 可以手动微调后再生成

2. **图片保存**
   - 生成后右键保存图片
   - 或者复制图片链接
   - 推荐保存到本地后上传

3. **批量生成**
   - 打开多个客户端标签页
   - 同时生成多张图片
   - 提高效率

---

## 🔍 故障排查

### 问题1：预览界面不显示
**原因**：JavaScript加载失败
**解决**：
1. 刷新页面
2. 检查浏览器控制台是否有错误
3. 重新安装Chrome扩展

### 问题2：无法生成配图方案
**原因**：后端服务未启动
**解决**：
```bash
cd backend
mvn spring-boot:run
```

### 问题3：Prompt复制失败
**原因**：浏览器权限问题
**解决**：
1. 允许网站访问剪贴板
2. 手动复制prompt文本

### 问题4：拖拽不生效
**原因**：浏览器不支持拖拽API
**解决**：
1. 使用位置下拉选择
2. 或使用最新版Chrome

---

## 📝 代码示例

### 前端调用示例

```javascript
// 生成配图
async function generateImagesClient(articleContent) {
  const response = await fetch('http://localhost:8080/api/ai/generate-images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      articleContent: articleContent,
      autoInsert: false
    })
  });

  const result = await response.json();
  if (result.code === 200) {
    showImagePreview(result.data);
  }
}

// 显示预览界面
function showImagePreview() {
  const modal = document.getElementById('image-preview-modal');
  modal.classList.add('active');
  renderImageCards();
}
```

### 后端处理示例

```java
@PostMapping("/generate-images")
public ApiResponse<ImagePlanResponse> generateImages(@RequestBody GenerateImagesRequest request) {
    // 1. 检查缓存
    ImagePlanResponse cached = imageCacheService.getCachedPlan(request.getArticleContent());
    if (cached != null) {
        return ApiResponse.success(cached);
    }

    // 2. 生成配图方案
    String plan = doubaoService.analyzeArticleForImages(request.getArticleContent());

    // 3. 解析并返回
    ImagePlanResponse response = parseImagePlan(plan);

    // 4. 缓存
    imageCacheService.cachePlan(request.getArticleContent(), response);

    return ApiResponse.success(response);
}
```

---

## 🎓 最佳实践

### 1. 文章内容
- 确保文章结构清晰
- 每段落有明确主题
- 长度适中（500-2000字最佳）

### 2. Prompt调整
- 查看AI生成的prompt
- 必要时手动优化
- 添加特定风格描述

### 3. 图片选择
- 多生成几张备选
- 选择最符合主题的
- 注意图片版权

### 4. 位置安排
- 封面图最重要
- 段落配图辅助理解
- 避免图片过于密集

### 5. 缓存管理
- 定期清理过期缓存
- 避免存储过多数据
- 重要图片及时保存

---

## 🚀 启动指南

### 1. 启动后端服务

```bash
cd /Users/panris/project/wechat-ai-editor-final/backend
mvn spring-boot:run
```

等待看到：
```
================================================
🤖 WeChat AI-Editor Backend Started
================================================
API Docs: http://localhost:8080/swagger-ui.html
Health Check: http://localhost:8080/actuator/health
================================================
```

### 2. 安装Chrome扩展

1. 打开Chrome浏览器
2. 访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `/Users/panris/project/wechat-ai-editor-final/chrome-extension` 目录

### 3. 开始使用

1. 打开微信公众号编辑器
2. 点击右下角的🤖按钮
3. 开始创作吧！

---

## 📞 联系与支持

如有问题或建议，欢迎反馈！

---

**版本**: v3.1.0 - 智能配图升级版
**更新日期**: 2026-03-10
**作者**: AI Assistant
**许可**: MIT License