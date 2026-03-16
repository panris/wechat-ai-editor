package com.wechat.aieditor.service;

import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.wechat.aieditor.config.DoubaoConfig;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

/**
 * 图像生成服务
 */
@Service
public class ImageGenerationService {

    private static final Logger log = LoggerFactory.getLogger(ImageGenerationService.class);

    private final DoubaoConfig doubaoConfig;
    private final OkHttpClient okHttpClient;

    public ImageGenerationService(DoubaoConfig doubaoConfig) {
        this.doubaoConfig = doubaoConfig;
        this.okHttpClient = new OkHttpClient.Builder()
                .connectTimeout(doubaoConfig.getImageTimeout(), TimeUnit.SECONDS)
                .readTimeout(doubaoConfig.getImageTimeout(), TimeUnit.SECONDS)
                .writeTimeout(doubaoConfig.getImageTimeout(), TimeUnit.SECONDS)
                .build();
    }

    /**
     * 生成图片
     *
     * @param prompt 图片描述
     * @return 图片URL
     */
    public String generateImage(String prompt) {
        try {
            // 构建请求体
            JSONObject requestBody = JSONUtil.createObj()
                    .set("model", doubaoConfig.getImageModel())
                    .set("prompt", prompt)
                    .set("n", 1)
                    .set("size", "1024x1024")
                    .set("quality", "standard")
                    .set("style", "vivid");

            log.info("生成图片，prompt: {}", prompt);

            // 构建请求
            Request request = new Request.Builder()
                    .url(doubaoConfig.getImageEndpoint())
                    .addHeader("Content-Type", "application/json")
                    .addHeader("Authorization", "Bearer " + doubaoConfig.getApiKey())
                    .post(RequestBody.create(
                            requestBody.toString(),
                            MediaType.parse("application/json")))
                    .build();

            // 发送请求
            try (Response response = okHttpClient.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    String errorBody = response.body() != null ? response.body().string() : "Unknown error";
                    log.error("图像生成 API 错误: {}", errorBody);
                    throw new RuntimeException("调用图像生成 API 失败: " + errorBody);
                }

                String responseBody = response.body().string();
                JSONObject jsonResponse = JSONUtil.parseObj(responseBody);

                // 提取图片URL
                String imageUrl = jsonResponse.getJSONArray("data")
                        .getJSONObject(0)
                        .getStr("url");

                log.info("图片生成成功，URL: {}", imageUrl);
                return imageUrl;
            }

        } catch (IOException e) {
            log.error("生成图片失败", e);
            throw new RuntimeException("网络错误: " + e.getMessage(), e);
        }
    }

    /**
     * 批量生成图片
     *
     * @param prompts 图片描述列表
     * @return 图片URL列表
     */
    public java.util.List<String> generateImages(java.util.List<String> prompts) {
        java.util.List<String> imageUrls = new java.util.ArrayList<>();

        for (String prompt : prompts) {
            try {
                String imageUrl = generateImage(prompt);
                imageUrls.add(imageUrl);
            } catch (Exception e) {
                log.error("生成图片失败，prompt: {}", prompt, e);
                imageUrls.add(null);
            }
        }

        return imageUrls;
    }
}