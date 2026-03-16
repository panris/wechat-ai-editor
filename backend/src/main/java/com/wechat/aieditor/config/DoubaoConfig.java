package com.wechat.aieditor.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * 豆包 API 配置
 */
@Configuration
@ConfigurationProperties(prefix = "doubao")
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

    /**
     * 图像生成 API 端点
     */
    private String imageEndpoint = "https://ark.cn-beijing.volces.com/api/v3/images/generations";

    /**
     * 图像生成模型名称
     */
    private String imageModel = "doubao-image-pro";

    /**
     * 图像生成超时时间（秒）
     */
    private Integer imageTimeout = 120;

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Integer getMaxTokens() {
        return maxTokens;
    }

    public void setMaxTokens(Integer maxTokens) {
        this.maxTokens = maxTokens;
    }

    public Integer getTimeout() {
        return timeout;
    }

    public void setTimeout(Integer timeout) {
        this.timeout = timeout;
    }

    public String getImageEndpoint() {
        return imageEndpoint;
    }

    public void setImageEndpoint(String imageEndpoint) {
        this.imageEndpoint = imageEndpoint;
    }

    public String getImageModel() {
        return imageModel;
    }

    public void setImageModel(String imageModel) {
        this.imageModel = imageModel;
    }

    public Integer getImageTimeout() {
        return imageTimeout;
    }

    public void setImageTimeout(Integer imageTimeout) {
        this.imageTimeout = imageTimeout;
    }
}