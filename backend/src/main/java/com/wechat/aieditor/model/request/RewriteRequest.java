package com.wechat.aieditor.model.request;

import jakarta.validation.constraints.NotBlank;

/**
 * 改写请求
 */
public class RewriteRequest {

    /**
     * 原内容
     */
    @NotBlank(message = "原内容不能为空")
    private String content;

    /**
     * 改写指令
     */
    @NotBlank(message = "改写指令不能为空")
    private String instruction;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getInstruction() {
        return instruction;
    }

    public void setInstruction(String instruction) {
        this.instruction = instruction;
    }
}
