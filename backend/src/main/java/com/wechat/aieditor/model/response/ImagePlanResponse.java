package com.wechat.aieditor.model.response;

import java.util.List;

/**
 * 配图方案响应
 */
public class ImagePlanResponse {

    /**
     * 图片总数
     */
    private Integer totalImages;

    /**
     * 图片列表
     */
    private List<ImageInfo> images;

    /**
     * 带图片的完整文章HTML（如果autoInsert=true）
     */
    private String articleWithImages;

    public ImagePlanResponse() {
    }

    public ImagePlanResponse(Integer totalImages, List<ImageInfo> images, String articleWithImages) {
        this.totalImages = totalImages;
        this.images = images;
        this.articleWithImages = articleWithImages;
    }

    public static ImagePlanResponseBuilder builder() {
        return new ImagePlanResponseBuilder();
    }

    public Integer getTotalImages() {
        return totalImages;
    }

    public void setTotalImages(Integer totalImages) {
        this.totalImages = totalImages;
    }

    public List<ImageInfo> getImages() {
        return images;
    }

    public void setImages(List<ImageInfo> images) {
        this.images = images;
    }

    public String getArticleWithImages() {
        return articleWithImages;
    }

    public void setArticleWithImages(String articleWithImages) {
        this.articleWithImages = articleWithImages;
    }

    public static class ImagePlanResponseBuilder {
        private Integer totalImages;
        private List<ImageInfo> images;
        private String articleWithImages;

        public ImagePlanResponseBuilder totalImages(Integer totalImages) {
            this.totalImages = totalImages;
            return this;
        }

        public ImagePlanResponseBuilder images(List<ImageInfo> images) {
            this.images = images;
            return this;
        }

        public ImagePlanResponseBuilder articleWithImages(String articleWithImages) {
            this.articleWithImages = articleWithImages;
            return this;
        }

        public ImagePlanResponse build() {
            return new ImagePlanResponse(totalImages, images, articleWithImages);
        }
    }

    /**
     * 图片信息
     */
    public static class ImageInfo {
        /**
         * 插入位置
         */
        private String position;

        /**
         * 图片类型
         */
        private String type;

        /**
         * 中文描述
         */
        private String description;

        /**
         * 英文绘图prompt
         */
        private String prompt;

        /**
         * 生成的图片URL
         */
        private String imageUrl;

        public ImageInfo() {
        }

        public ImageInfo(String position, String type, String description, String prompt, String imageUrl) {
            this.position = position;
            this.type = type;
            this.description = description;
            this.prompt = prompt;
            this.imageUrl = imageUrl;
        }

        public static ImageInfoBuilder builder() {
            return new ImageInfoBuilder();
        }

        public String getPosition() {
            return position;
        }

        public void setPosition(String position) {
            this.position = position;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getPrompt() {
            return prompt;
        }

        public void setPrompt(String prompt) {
            this.prompt = prompt;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }

        public static class ImageInfoBuilder {
            private String position;
            private String type;
            private String description;
            private String prompt;
            private String imageUrl;

            public ImageInfoBuilder position(String position) {
                this.position = position;
                return this;
            }

            public ImageInfoBuilder type(String type) {
                this.type = type;
                return this;
            }

            public ImageInfoBuilder description(String description) {
                this.description = description;
                return this;
            }

            public ImageInfoBuilder prompt(String prompt) {
                this.prompt = prompt;
                return this;
            }

            public ImageInfoBuilder imageUrl(String imageUrl) {
                this.imageUrl = imageUrl;
                return this;
            }

            public ImageInfo build() {
                return new ImageInfo(position, type, description, prompt, imageUrl);
            }
        }
    }
}