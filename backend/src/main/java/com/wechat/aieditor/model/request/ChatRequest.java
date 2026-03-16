package com.wechat.aieditor.model.request;

import jakarta.validation.constraints.NotBlank;

/**
 * 对话请求
 */
public class ChatRequest {

    /**
     * 用户消息
     */
    @NotBlank(message = "消息不能为空")
    private String message;

    /**
     * 系统提示词（可选）
     */
    private String systemPrompt;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSystemPrompt() {
        return systemPrompt;
    }

    public void setSystemPrompt(String systemPrompt) {
        this.systemPrompt = systemPrompt;
    }
}
