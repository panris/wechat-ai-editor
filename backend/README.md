# Backend Service - WeChat AI-Editor

## 功能简介

基于 Spring Boot 的后端 API 服务，提供：

- 豆包大模型 API 封装
- 文章分析、生成、改写接口
- 爬虫数据管理
- 用户配置存储
- 请求限流与安全控制

## 技术栈

- **Java 17**
- **Spring Boot 3.2**
- **Spring Data JPA**
- **H2 Database** (开发环境)
- **MySQL** (生产环境)
- **OkHttp**: HTTP 客户端
- **Lombok**: 简化代码
- **Hutool**: Java 工具库

## 快速开始

### 1. 环境要求

- JDK 17+
- Maven 3.6+
- （可选）MySQL 8.0+

### 2. 配置 API Key

#### 方式 1: 环境变量（推荐）

```bash
export DOUBAO_API_KEY=your-api-key-here
```

#### 方式 2: 配置文件

编辑 `src/main/resources/application.yml`：

```yaml
doubao:
  api-key: your-api-key-here
```

### 3. 启动服务

```bash
# 清理并编译
mvn clean install

# 运行服务
mvn spring-boot:run
```

服务启动在 `http://localhost:8080`

### 4. 验证服务

```bash
curl http://localhost:8080/api/ai/health
```

预期响应：

```json
{
  "code": 200,
  "message": "Success",
  "data": "AI Service is running",
  "timestamp": 1234567890
}
```

## API 文档

### 1. 对话接口

**请求**：

```http
POST /api/ai/chat
Content-Type: application/json

{
  "message": "如何写好公众号标题？",
  "systemPrompt": "你是专业的内容创作顾问"
}
```

**响应**：

```json
{
  "code": 200,
  "message": "Success",
  "data": "写好公众号标题的关键是...",
  "timestamp": 1234567890
}
```

### 2. 分析文章

**请求**：

```http
POST /api/ai/analyze
Content-Type: application/json

{
  "title": "文章标题",
  "content": "文章正文内容...",
  "url": "https://mp.weixin.qq.com/s/xxx"
}
```

**响应**：

```json
{
  "code": 200,
  "message": "Success",
  "data": "### 核心主题\n...\n### 目标受众\n...",
  "timestamp": 1234567890
}
```

### 3. 生成初稿

**请求**：

```http
POST /api/ai/generate
Content-Type: application/json

{
  "analysisResult": "文章分析结果...",
  "customRequirement": "请调整为医疗健康领域"
}
```

**响应**：

```json
{
  "code": 200,
  "message": "Success",
  "data": "# 标题：...\n\n正文内容...",
  "timestamp": 1234567890
}
```

### 4. 改写润色

**请求**：

```http
POST /api/ai/rewrite
Content-Type: application/json

{
  "content": "原文内容...",
  "instruction": "改为更专业的语气"
}
```

**响应**：

```json
{
  "code": 200,
  "message": "Success",
  "data": "改写后的内容...",
  "timestamp": 1234567890
}
```

## 配置详解

### application.yml

```yaml
spring:
  application:
    name: wechat-ai-editor

  # 数据源配置
  datasource:
    url: jdbc:h2:mem:aieditor  # H2 内存数据库
    driver-class-name: org.h2.Driver
    username: sa
    password:

  # JPA 配置
  jpa:
    hibernate:
      ddl-auto: update  # 自动更新表结构
    show-sql: true      # 显示 SQL 日志

# 服务器配置
server:
  port: 8080

# 豆包 API 配置
doubao:
  api-key: ${DOUBAO_API_KEY:your-api-key-here}
  endpoint: https://ark.cn-beijing.volces.com/api/v3/chat/completions
  model: doubao-pro-32k
  temperature: 0.7
  max-tokens: 4096
  timeout: 60
```

### 切换到 MySQL

1. 修改 `application.yml`：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/ai_editor?useSSL=false&serverTimezone=UTC
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: root
    password: your-password
```

2. 创建数据库：

```sql
CREATE DATABASE ai_editor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 项目结构

```
backend/
├── pom.xml                    # Maven 配置
└── src/main/
    ├── java/com/wechat/aieditor/
    │   ├── AIEditorApplication.java  # 启动类
    │   ├── config/               # 配置类
    │   │   ├── DoubaoConfig.java
    │   │   └── WebConfig.java
    │   ├── controller/           # 控制器
    │   │   └── AIController.java
    │   ├── service/              # 业务逻辑
    │   │   └── DoubaoService.java
    │   ├── model/                # 数据模型
    │   │   ├── request/          # 请求 DTO
    │   │   └── response/         # 响应 DTO
    │   └── utils/                # 工具类
    └── resources/
        └── application.yml       # 配置文件
```

## 核心组件

### DoubaoService

封装豆包 API 调用逻辑：

```java
@Service
public class DoubaoService {
    // 基础对话
    public String chat(String userMessage);

    // 文章分析
    public String analyzeArticle(String articleContent);

    // 生成初稿
    public String generateDraft(String analysisResult, String customRequirement);

    // 改写润色
    public String rewrite(String content, String instruction);
}
```

### AIController

提供 RESTful API：

```java
@RestController
@RequestMapping("/api/ai")
public class AIController {
    @PostMapping("/chat")
    public ApiResponse<String> chat(@RequestBody ChatRequest request);

    @PostMapping("/analyze")
    public ApiResponse<String> analyze(@RequestBody AnalyzeRequest request);

    @PostMapping("/generate")
    public ApiResponse<String> generate(@RequestBody GenerateRequest request);

    @PostMapping("/rewrite")
    public ApiResponse<String> rewrite(@RequestBody RewriteRequest request);
}
```

## 测试

### 单元测试

```bash
mvn test
```

### 集成测试

```bash
mvn verify
```

### 手动测试（使用 curl）

```bash
# 测试对话接口
curl -X POST http://localhost:8080/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "如何写好公众号标题？"}'
```

## 性能优化

1. **连接池配置**：OkHttp 使用连接池复用 TCP 连接
2. **异步处理**：长时间任务使用 @Async 异步执行
3. **缓存策略**：对频繁查询的数据使用 Redis 缓存
4. **限流保护**：集成 Resilience4j 限流器

## 安全措施

1. **CORS 配置**：仅允许指定域名跨域访问
2. **API Key 加密存储**：敏感信息加密存储
3. **请求校验**：使用 @Valid 注解校验请求参数
4. **异常处理**：全局异常处理器统一返回错误信息

## 日志

查看日志：

```bash
tail -f logs/application.log
```

日志级别配置：

```yaml
logging:
  level:
    com.wechat.aieditor: DEBUG
    org.springframework.web: INFO
```

## 部署

### Docker 部署（推荐）

```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

构建并运行：

```bash
mvn clean package
docker build -t wechat-ai-editor-backend .
docker run -p 8080:8080 -e DOUBAO_API_KEY=your-key wechat-ai-editor-backend
```

### JAR 部署

```bash
mvn clean package
java -jar target/ai-editor-backend-1.0.0.jar
```

## 常见问题

### Q: 启动时提示找不到 API Key？

设置环境变量或在 `application.yml` 中配置。

### Q: 调用豆包 API 超时？

增加超时时间：

```yaml
doubao:
  timeout: 120  # 120 秒
```

### Q: 如何查看 SQL 日志？

```yaml
spring:
  jpa:
    show-sql: true
logging:
  level:
    org.hibernate.SQL: DEBUG
```

## 更新日志

### v1.0.0

- ✅ 基础 API 接口
- ✅ 豆包 API 集成
- ✅ CORS 跨域配置
- ✅ 统一响应格式

## 许可证

MIT License
