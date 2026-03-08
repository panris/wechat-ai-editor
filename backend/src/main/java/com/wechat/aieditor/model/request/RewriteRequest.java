package com.wechat.aieditor.model.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 改写请求
 */
@Data
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
}
