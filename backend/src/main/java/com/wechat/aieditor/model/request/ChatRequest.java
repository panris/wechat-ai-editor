package com.wechat.aieditor.model.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 对话请求
 */
@Data
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
}
