package com.wechat.aieditor.model.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 分析文章请求
 */
@Data
public class AnalyzeRequest {

    /**
     * 文章标题
     */
    private String title;

    /**
     * 文章内容
     */
    @NotBlank(message = "文章内容不能为空")
    private String content;

    /**
     * 文章来源 URL（可选）
     */
    private String url;
}
