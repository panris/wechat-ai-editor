package com.wechat.aieditor.model.response;

/**
 * 热点数据项DTO
 */
public class HotspotItemDTO {
    private String title;
    private String hot;
    private String tag;
    private String desc;

    public HotspotItemDTO() {
    }

    public HotspotItemDTO(String title, String hot, String tag, String desc) {
        this.title = title;
        this.hot = hot;
        this.tag = tag;
        this.desc = desc;
    }

    // Getters
    public String getTitle() {
        return title;
    }

    public String getHot() {
        return hot;
    }

    public String getTag() {
        return tag;
    }

    public String getDesc() {
        return desc;
    }

    // Setters
    public void setTitle(String title) {
        this.title = title;
    }

    public void setHot(String hot) {
        this.hot = hot;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }
}