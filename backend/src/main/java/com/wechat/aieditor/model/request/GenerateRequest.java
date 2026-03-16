package com.wechat.aieditor.model.request;

import jakarta.validation.constraints.NotBlank;

/**
 * 生成初稿请求
 */
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

    public String getAnalysisResult() {
        return analysisResult;
    }

    public void setAnalysisResult(String analysisResult) {
        this.analysisResult = analysisResult;
    }

    public String getCustomRequirement() {
        return customRequirement;
    }

    public void setCustomRequirement(String customRequirement) {
        this.customRequirement = customRequirement;
    }
}
