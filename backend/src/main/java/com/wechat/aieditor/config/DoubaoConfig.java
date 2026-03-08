package com.wechat.aieditor.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * 豆包 API 配置
 */
@Configuration
@ConfigurationProperties(prefix = "doubao")
@Data
public class DoubaoConfig {

    /**
     * API Key
     */
    private String apiKey;

    /**
     * API 端点
     */
    private String endpoint = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

    /**
     * 模型名称
     */
    private String model = "doubao-pro-32k";

    /**
     * 温度参数 (0-1)
     */
    private Double temperature = 0.7;

    /**
     * 最大 Token 数
     */
    private Integer maxTokens = 4096;

    /**
     * 请求超时时间（秒）
     */
    private Integer timeout = 60;
}
