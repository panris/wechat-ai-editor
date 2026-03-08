package com.wechat.aieditor.model.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 生成初稿请求
 */
@Data
public class GenerateRequest {

    /**
     * 文章分析结果
     */
    @NotBlank(message = "分析结果不能为空")
    private String analysisResult;

    /**
     * 自定义要求（可选）
     */
    private String customRequirement;
}
