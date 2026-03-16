package com.wechat.aieditor.model.request;

import jakarta.validation.constraints.NotBlank;

/**
 * 生成配图请求
 */
public class GenerateImagesRequest {

    /**
     * 文章内容
     */
    @NotBlank(message = "文章内容不能为空")
    private String articleContent;

    /**
     * 是否自动插入图片到文章中
     */
    private Boolean autoInsert = true;

    public String getArticleContent() {
        return articleContent;
    }

    public void setArticleContent(String articleContent) {
        this.articleContent = articleContent;
    }

    public Boolean getAutoInsert() {
        return autoInsert;
    }

    public void setAutoInsert(Boolean autoInsert) {
        this.autoInsert = autoInsert;
    }
}