package com.wechat.aieditor.service;

import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * 本地配图方案生成服务（无需API Key）
 * 基于规则和算法生成配图方案，完全免费
 */
@Service
public class LocalImagePlanService {

    private static final Logger log = LoggerFactory.getLogger(LocalImagePlanService.class);

    /**
     * 分析文章并生成配图方案（本地算法，无需API）
     *
     * @param articleContent 文章内容
     * @return JSON格式的配图方案
     */
    public String analyzeArticleForImages(String articleContent) {
        log.info("使用本地算法生成配图方案，文章长度: {}", articleContent.length());

        // 1. 分析文章结构
        int wordCount = articleContent.length();
        String[] paragraphs = splitParagraphs(articleContent);
        int paragraphCount = paragraphs.length;

        // 2. 决定图片数量
        int imageCount = calculateImageCount(wordCount, paragraphCount);

        // 3. 生成配图方案
        JSONObject plan = JSONUtil.createObj();
        plan.set("totalImages", imageCount);

        JSONArray images = new JSONArray();

        // 封面图（第一张，总是需要的）
        if (imageCount >= 1) {
            JSONObject coverImage = createCoverImage(articleContent, paragraphs);
            images.add(coverImage);
        }

        // 段落配图（根据段落数量分配）
        if (imageCount > 1) {
            List<Integer> positions = calculateImagePositions(imageCount - 1, paragraphCount);
            for (int i = 0; i < positions.size(); i++) {
                int position = positions.get(i);
                JSONObject sectionImage = createSectionImage(
                        paragraphs,
                        position,
                        i + 2  // 序号从2开始（1是封面）
                );
                images.add(sectionImage);
            }
        }

        plan.set("images", images);

        String result = plan.toString();
        log.info("配图方案生成完成: {} 张图片", imageCount);
        return result;
    }

    /**
     * 根据文章长度和段落数量决定配图数量
     */
    private int calculateImageCount(int wordCount, int paragraphCount) {
        // 短文（<500字）：1张封面
        if (wordCount < 500) {
            return 1;
        }
        // 中等（500-1000字）：2-3张
        else if (wordCount < 1000) {
            return Math.min(2, paragraphCount);
        }
        // 中长（1000-1500字）：3张
        else if (wordCount < 1500) {
            return Math.min(3, paragraphCount);
        }
        // 长文（1500-2500字）：4张
        else if (wordCount < 2500) {
            return Math.min(4, paragraphCount);
        }
        // 超长文（>2500字）：5张
        else {
            return Math.min(5, paragraphCount);
        }
    }

    /**
     * 计算图片插入位置（段落索引）
     */
    private List<Integer> calculateImagePositions(int imageCount, int paragraphCount) {
        List<Integer> positions = new ArrayList<>();
        if (paragraphCount <= 1 || imageCount == 0) {
            return positions;
        }

        // 均匀分布算法
        double step = (double) paragraphCount / (imageCount + 1);
        for (int i = 1; i <= imageCount; i++) {
            int position = (int) Math.round(step * i);
            // 确保位置在有效范围内
            position = Math.max(1, Math.min(position, paragraphCount - 1));
            positions.add(position);
        }

        return positions;
    }

    /**
     * 创建封面图配置
     */
    private JSONObject createCoverImage(String articleContent, String[] paragraphs) {
        JSONObject image = JSONUtil.createObj();
        image.set("position", "start");
        image.set("type", "cover");

        // 提取文章主题作为描述
        String theme = extractTheme(articleContent, paragraphs);
        image.set("description", theme);

        // 生成封面图的英文prompt
        String prompt = generateCoverPrompt(theme, articleContent);
        image.set("prompt", prompt);

        // 客户端模式，URL留空
        image.set("imageUrl", null);

        return image;
    }

    /**
     * 创建段落配图配置
     */
    private JSONObject createSectionImage(String[] paragraphs, int position, int index) {
        JSONObject image = JSONUtil.createObj();
        image.set("position", "section-" + position);
        image.set("type", "section");

        // 提取该段落的关键内容作为描述
        String description = extractParagraphTheme(paragraphs, position);
        image.set("description", description);

        // 生成段落配图的英文prompt
        String prompt = generateSectionPrompt(description, paragraphs, position);
        image.set("prompt", prompt);

        // 客户端模式，URL留空
        image.set("imageUrl", null);

        return image;
    }

    /**
     * 提取文章主题
     */
    private String extractTheme(String articleContent, String[] paragraphs) {
        // 优先从第一段提取（通常是主题概述）
        if (paragraphs.length > 0 && paragraphs[0].length() > 10) {
            String firstParagraph = paragraphs[0];
            // 取前100字作为主题
            return firstParagraph.length() > 100
                    ? firstParagraph.substring(0, 100) + "..."
                    : firstParagraph;
        }

        // 否则取文章开头
        return articleContent.length() > 100
                ? articleContent.substring(0, 100) + "..."
                : articleContent;
    }

    /**
     * 提取段落主题
     */
    private String extractParagraphTheme(String[] paragraphs, int position) {
        if (position >= 0 && position < paragraphs.length) {
            String paragraph = paragraphs[position];
            return paragraph.length() > 80
                    ? paragraph.substring(0, 80) + "..."
                    : paragraph;
        }
        return "内容配图 " + (position + 1);
    }

    /**
     * 生成封面图的英文prompt
     */
    private String generateCoverPrompt(String theme, String articleContent) {
        // 检测文章类型和关键词
        String style = detectArticleStyle(articleContent);

        StringBuilder prompt = new StringBuilder();
        prompt.append("A professional and attractive cover image for an article. ");
        prompt.append("The theme is about: ").append(translateToEnglish(theme)).append(". ");
        prompt.append("Style: ").append(style).append(". ");
        prompt.append("Modern, clean design with vibrant colors. ");
        prompt.append("High quality, professional photography or illustration. ");
        prompt.append("Suitable for social media sharing.");

        return prompt.toString();
    }

    /**
     * 生成段落配图的英文prompt
     */
    private String generateSectionPrompt(String description, String[] paragraphs, int position) {
        String style = detectParagraphStyle(paragraphs, position);

        StringBuilder prompt = new StringBuilder();
        prompt.append("An illustrative image that complements the article content. ");
        prompt.append("The scene depicts: ").append(translateToEnglish(description)).append(". ");
        prompt.append("Style: ").append(style).append(". ");
        prompt.append("Clear composition, good lighting, professional quality. ");
        prompt.append("Visually appealing and relevant to the context.");

        return prompt.toString();
    }

    /**
     * 检测文章风格
     */
    private String detectArticleStyle(String content) {
        // 关键词检测
        if (containsAny(content, "科技", "AI", "技术", "互联网", "数字化")) {
            return "technology, modern, futuristic";
        } else if (containsAny(content, "商业", "创业", "管理", "营销", "品牌")) {
            return "business, professional, corporate";
        } else if (containsAny(content, "健康", "养生", "医疗", "心理")) {
            return "health, wellness, medical";
        } else if (containsAny(content, "教育", "学习", "知识", "成长")) {
            return "education, learning, growth";
        } else if (containsAny(content, "生活", "情感", "故事", "感悟")) {
            return "lifestyle, emotional, storytelling";
        } else if (containsAny(content, "旅行", "美食", "文化", "艺术")) {
            return "travel, culture, art";
        }
        return "modern, professional, vibrant";
    }

    /**
     * 检测段落风格
     */
    private String detectParagraphStyle(String[] paragraphs, int position) {
        if (position >= 0 && position < paragraphs.length) {
            String paragraph = paragraphs[position];
            return detectArticleStyle(paragraph);
        }
        return "modern, professional";
    }

    /**
     * 简单的中译英（关键词提取）
     */
    private String translateToEnglish(String chineseText) {
        // 这里做简化处理，实际应用中可以接入翻译API
        // 当前策略：提取关键信息并用英文描述

        if (chineseText.length() > 50) {
            chineseText = chineseText.substring(0, 50);
        }

        // 移除特殊字符
        chineseText = chineseText.replaceAll("[\\p{Punct}\\s]+", " ");

        // 基础翻译映射
        String result = chineseText
            .replaceAll("技术|科技", "technology")
            .replaceAll("人工智能|AI", "artificial intelligence")
            .replaceAll("发展|进步", "development")
            .replaceAll("未来", "future")
            .replaceAll("创新", "innovation")
            .replaceAll("商业|生意", "business")
            .replaceAll("健康|养生", "health")
            .replaceAll("教育|学习", "education")
            .replaceAll("生活", "lifestyle");

        // 如果翻译后仍然主要是中文，则返回通用描述
        if (result.matches(".*[\\u4e00-\\u9fa5]{10,}.*")) {
            return "an interesting and relevant scene that matches the article theme";
        }

        return result.isEmpty() ? "article content illustration" : result;
    }

    /**
     * 检查文本是否包含任意关键词
     */
    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 将文章分割成段落
     */
    private String[] splitParagraphs(String content) {
        // 按换行符分割
        String[] lines = content.split("\n+");

        // 过滤空行和太短的行（<10字）
        List<String> paragraphs = new ArrayList<>();
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.length() >= 10) {
                paragraphs.add(trimmed);
            }
        }

        // 如果段落太少，尝试按标点符号分割长段落
        if (paragraphs.size() < 3 && content.length() > 500) {
            return splitByPunctuation(content);
        }

        return paragraphs.toArray(new String[0]);
    }

    /**
     * 按标点符号分割文本
     */
    private String[] splitByPunctuation(String content) {
        // 按句号、问号、感叹号分割
        String[] sentences = content.split("[。！？\\n]+");

        // 将短句合并成段落（每段约100-200字）
        List<String> paragraphs = new ArrayList<>();
        StringBuilder currentParagraph = new StringBuilder();

        for (String sentence : sentences) {
            String trimmed = sentence.trim();
            if (trimmed.isEmpty()) continue;

            currentParagraph.append(trimmed).append("。");

            // 当段落长度达到100字以上时，开始新段落
            if (currentParagraph.length() >= 100) {
                paragraphs.add(currentParagraph.toString());
                currentParagraph = new StringBuilder();
            }
        }

        // 添加最后一段
        if (currentParagraph.length() > 0) {
            paragraphs.add(currentParagraph.toString());
        }

        return paragraphs.toArray(new String[0]);
    }
}