package com.wechat.aieditor.service;

import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.wechat.aieditor.config.DoubaoConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * 豆包 API 服务
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class DoubaoService {

    private final DoubaoConfig doubaoConfig;
    private final OkHttpClient okHttpClient = new OkHttpClient.Builder()
            .connectTimeout(60, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(60, TimeUnit.SECONDS)
            .build();

    /**
     * 调用豆包 API 进行对话
     *
     * @param userMessage 用户消息
     * @return AI 回复
     */
    public String chat(String userMessage) {
        return chat(userMessage, "你是一位专业的公众号内容创作助手，擅长分析爆款文章并协助创作高质量内容。");
    }

    /**
     * 调用豆包 API 进行对话
     *
     * @param userMessage   用户消息
     * @param systemPrompt  系统提示词
     * @return AI 回复
     */
    public String chat(String userMessage, String systemPrompt) {
        List<JSONObject> messages = new ArrayList<>();

        // 系统提示词
        if (systemPrompt != null && !systemPrompt.isEmpty()) {
            messages.add(JSONUtil.createObj()
                    .set("role", "system")
                    .set("content", systemPrompt));
        }

        // 用户消息
        messages.add(JSONUtil.createObj()
                .set("role", "user")
                .set("content", userMessage));

        return callAPI(messages);
    }

    /**
     * 分析文章
     *
     * @param articleContent 文章内容
     * @return 分析结果
     */
    public String analyzeArticle(String articleContent) {
        String prompt = String.format("""
                请深度分析以下公众号文章，提取关键要素：

                文章内容：
                %s

                请按以下维度分析：
                1. **核心主题**：文章的中心思想
                2. **目标受众**：主要面向哪类人群
                3. **痛点挖掘**：触及了什么痛点或需求
                4. **文章结构**：采用了什么行文结构（总分总、故事引入、问题-解决方案等）
                5. **情绪基调**：文章的情绪倾向（焦虑、治愈、激励、干货等）
                6. **爆款元素**：标题特点、金句摘录、引发共鸣的点
                7. **内容密度**：信息量评估（高密度干货 vs 情绪共鸣为主）

                请用结构化的方式输出分析结果。
                """, articleContent);

        return chat(prompt);
    }

    /**
     * 生成初稿
     *
     * @param analysisResult 分析结果
     * @param customRequirement 自定义要求
     * @return 生成的初稿
     */
    public String generateDraft(String analysisResult, String customRequirement) {
        String prompt = String.format("""
                基于以下文章分析结果，生成一篇全新的、结构相似但内容原创的公众号文章初稿：

                分析结果：
                %s

                %s

                要求：
                1. 保持相似的文章结构和情绪基调
                2. 核心观点和案例必须完全原创，避免抄袭
                3. 融入最新的热点或案例，增加时效性
                4. 标题要吸引眼球，符合公众号爆款标题特征
                5. 字数控制在 1500-2000 字
                6. 语言风格要贴近目标受众
                7. 适当加入表情符号和排版技巧

                请直接输出完整的文章初稿（包括标题和正文）。
                """, analysisResult, customRequirement != null ? "自定义要求：" + customRequirement : "");

        return chat(prompt);
    }

    /**
     * 改写润色
     *
     * @param content 原内容
     * @param instruction 改写指令
     * @return 改写后的内容
     */
    public String rewrite(String content, String instruction) {
        String prompt = String.format("""
                请按照以下指令改写内容：

                原内容：
                %s

                改写指令：
                %s

                请直接输出改写后的内容。
                """, content, instruction);

        return chat(prompt);
    }

    /**
     * 调用豆包 API
     *
     * @param messages 消息列表
     * @return AI 回复
     */
    private String callAPI(List<JSONObject> messages) {
        try {
            // 构建请求体
            JSONObject requestBody = JSONUtil.createObj()
                    .set("model", doubaoConfig.getModel())
                    .set("messages", messages)
                    .set("temperature", doubaoConfig.getTemperature())
                    .set("max_tokens", doubaoConfig.getMaxTokens());

            // 构建请求
            Request request = new Request.Builder()
                    .url(doubaoConfig.getEndpoint())
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
                    log.error("Doubao API error: {}", errorBody);
                    throw new RuntimeException("调用豆包 API 失败: " + errorBody);
                }

                String responseBody = response.body().string();
                JSONObject jsonResponse = JSONUtil.parseObj(responseBody);

                // 提取回复内容
                return jsonResponse.getJSONArray("choices")
                        .getJSONObject(0)
                        .getJSONObject("message")
                        .getStr("content");
            }

        } catch (IOException e) {
            log.error("Failed to call Doubao API", e);
            throw new RuntimeException("网络错误: " + e.getMessage(), e);
        }
    }
}
