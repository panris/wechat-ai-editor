# Crawler Service - WeChat AI-Editor

## 功能简介

基于 Playwright 的微信公众号文章爬虫服务，支持：

- 通过文章 URL 直接抓取内容
- 提取文章标题、作者、正文、封面图
- 获取阅读数、点赞数等统计数据
- 异步高效抓取
- 防反爬策略

## 环境要求

- Python 3.10+
- Playwright (自动化浏览器)

## 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 安装浏览器

```bash
playwright install chromium
```

### 3. 配置目标账号

编辑 `config/config.json`：

```json
{
  "target_accounts": [
    {
      "name": "公众号名称",
      "biz": "__biz_parameter",
      "description": "账号描述"
    }
  ],
  "max_articles_per_account": 10,
  "headless": true
}
```

### 4. 运行爬虫

#### 方式 1: 抓取指定文章

```bash
python src/main.py https://mp.weixin.qq.com/s/XXXXXX
```

#### 方式 2: 批量抓取（未来版本）

```bash
python src/batch_crawler.py
```

## 数据格式

抓取的文章数据保存在 `data/articles.json`：

```json
[
  {
    "title": "文章标题",
    "author": "作者名",
    "publish_time": "2024-01-01",
    "content": "文章正文...",
    "cover_img": "https://...",
    "url": "https://mp.weixin.qq.com/s/xxx",
    "read_count": 10000,
    "like_count": 500,
    "crawl_time": "2024-01-01 12:00:00",
    "content_length": 3500
  }
]
```

## 核心功能

### 文章内容提取

- ✅ 标题、作者、发布时间
- ✅ 正文内容（纯文本）
- ✅ 封面图片
- ✅ 阅读数、点赞数
- ⬜ 评论数据
- ⬜ 图片、视频附件

### 反反爬策略

1. **User-Agent 模拟**：模拟真实浏览器
2. **Headless 模式**：无界面浏览器提高效率
3. **随机延迟**：避免频繁请求
4. **代理 IP**：支持配置代理池（可选）

## 配置说明

### config.json 参数

```json
{
  "headless": true,              // 是否使用无头模式
  "user_agent": "Mozilla/5.0...", // User-Agent
  "crawl_interval": 3600,        // 抓取间隔（秒）
  "enable_proxy": false,         // 是否启用代理
  "proxy": {
    "server": "http://proxy:8080",
    "username": "user",
    "password": "pass"
  }
}
```

## 常见问题

### Q: Playwright 安装失败？

```bash
# 使用国内镜像
pip install playwright -i https://pypi.tuna.tsinghua.edu.cn/simple

# 手动下载浏览器
PLAYWRIGHT_DOWNLOAD_HOST=https://playwright.azureedge.net playwright install chromium
```

### Q: 爬取速度慢？

- 开启 headless 模式
- 调整网络超时时间
- 使用更快的网络环境

### Q: 被反爬限制？

1. 降低爬取频率（增加间隔时间）
2. 配置代理 IP
3. 更换 User-Agent
4. 考虑使用第三方 API

### Q: 如何获取公众号的 biz 参数？

1. 打开任意一篇该账号的文章
2. 查看 URL 中的 `__biz=` 参数
3. 复制完整的 biz 值

## 第三方 API 选择

如果自建爬虫遇到困难，可考虑以下第三方服务：

- **清博大数据**: https://www.gsdata.cn/
- **新榜**: https://www.newrank.cn/
- **西瓜数据**: https://data.xiguaji.com/

（需付费，但数据更稳定完整）

## 开发计划

### v1.0 (当前)

- [x] 单篇文章抓取
- [x] 基础数据提取
- [x] JSON 格式输出

### v2.0

- [ ] 批量抓取指定账号
- [ ] 定时任务调度
- [ ] MongoDB 数据存储
- [ ] 增量更新

### v3.0

- [ ] 分布式爬虫
- [ ] 代理池管理
- [ ] 数据清洗与去重
- [ ] RESTful API 接口

## 法律声明

⚠️ **请遵守以下规则**：

1. 仅用于个人学习和研究
2. 不得用于商业用途
3. 遵守目标网站的 robots.txt
4. 不得频繁请求造成服务器压力
5. 尊重原作者版权

## 技术支持

- 提交 Issue: GitHub Issues
- 查看日志: `logs/crawler_*.log`

## 许可证

MIT License
