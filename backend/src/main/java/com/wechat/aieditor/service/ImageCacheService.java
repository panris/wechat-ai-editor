package com.wechat.aieditor.service;

import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.wechat.aieditor.model.response.ImagePlanResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 配图缓存服务
 */
@Service
public class ImageCacheService {

    private static final Logger log = LoggerFactory.getLogger(ImageCacheService.class);

    // 缓存：prompt hash -> 图片URL
    private final Map<String, CachedImage> imageCache = new ConcurrentHashMap<>();

    // 缓存：文章hash -> 配图方案
    private final Map<String, CachedImagePlan> planCache = new ConcurrentHashMap<>();

    // 缓存过期时间：24小时
    private static final long CACHE_EXPIRE_TIME = 24 * 60 * 60 * 1000;

    /**
     * 获取缓存的图片
     */
    public String getCachedImage(String prompt) {
        String hash = hashString(prompt);
        CachedImage cached = imageCache.get(hash);

        if (cached != null && !cached.isExpired()) {
            log.info("从缓存获取图片，prompt hash: {}", hash);
            return cached.getImageUrl();
        }

        return null;
    }

    /**
     * 缓存图片
     */
    public void cacheImage(String prompt, String imageUrl) {
        String hash = hashString(prompt);
        imageCache.put(hash, new CachedImage(imageUrl, System.currentTimeMillis()));
        log.info("缓存图片，prompt hash: {}, url: {}", hash, imageUrl);
    }

    /**
     * 获取缓存的配图方案
     */
    public ImagePlanResponse getCachedPlan(String articleContent) {
        String hash = hashString(articleContent);
        CachedImagePlan cached = planCache.get(hash);

        if (cached != null && !cached.isExpired()) {
            log.info("从缓存获取配图方案，article hash: {}", hash);
            return cached.getPlan();
        }

        return null;
    }

    /**
     * 缓存配图方案
     */
    public void cachePlan(String articleContent, ImagePlanResponse plan) {
        String hash = hashString(articleContent);
        planCache.put(hash, new CachedImagePlan(plan, System.currentTimeMillis()));
        log.info("缓存配图方案，article hash: {}, 图片数: {}", hash, plan.getTotalImages());
    }

    /**
     * 清理过期缓存
     */
    public void cleanExpiredCache() {
        long now = System.currentTimeMillis();

        // 清理图片缓存
        imageCache.entrySet().removeIf(entry -> entry.getValue().isExpired());

        // 清理方案缓存
        planCache.entrySet().removeIf(entry -> entry.getValue().isExpired());

        log.info("清理过期缓存完成");
    }

    /**
     * 计算字符串的hash
     */
    private String hashString(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hash = md.digest(input.getBytes("UTF-8"));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            log.error("计算hash失败", e);
            return UUID.randomUUID().toString();
        }
    }

    /**
     * 缓存的图片
     */
    private static class CachedImage {
        private final String imageUrl;
        private final long cacheTime;

        public CachedImage(String imageUrl, long cacheTime) {
            this.imageUrl = imageUrl;
            this.cacheTime = cacheTime;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public boolean isExpired() {
            return System.currentTimeMillis() - cacheTime > CACHE_EXPIRE_TIME;
        }
    }

    /**
     * 缓存的配图方案
     */
    private static class CachedImagePlan {
        private final ImagePlanResponse plan;
        private final long cacheTime;

        public CachedImagePlan(ImagePlanResponse plan, long cacheTime) {
            this.plan = plan;
            this.cacheTime = cacheTime;
        }

        public ImagePlanResponse getPlan() {
            return plan;
        }

        public boolean isExpired() {
            return System.currentTimeMillis() - cacheTime > CACHE_EXPIRE_TIME;
        }
    }
}