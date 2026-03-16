package com.wechat.aieditor.controller;

import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.wechat.aieditor.model.request.AnalyzeRequest;
import com.wechat.aieditor.model.request.ChatRequest;
import com.wechat.aieditor.model.request.GenerateRequest;
import com.wechat.aieditor.model.request.RewriteRequest;
import com.wechat.aieditor.model.request.GenerateImagesRequest;
import com.wechat.aieditor.model.response.ApiResponse;
import com.wechat.aieditor.model.response.ImagePlanResponse;
import com.wechat.aieditor.model.response.HotspotItemDTO;
import com.wechat.aieditor.service.DoubaoService;
import com.wechat.aieditor.service.ImageGenerationService;
import com.wechat.aieditor.service.ImageCacheService;
import com.wechat.aieditor.service.HotspotService;
import com.wechat.aieditor.service.LocalImagePlanService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * AI 控制器
 */
@RestController
@RequestMapping("/api/ai")
public class AIController {

    private static final Logger log = LoggerFactory.getLogger(AIController.class);

    private final DoubaoService doubaoService;
    private final ImageGenerationService imageGenerationService;
    private final ImageCacheService imageCacheService;
    private final HotspotService hotspotService;
    private final LocalImagePlanService localImagePlanService;

    public AIController(DoubaoService doubaoService,
                       ImageGenerationService imageGenerationService,
                       ImageCacheService imageCacheService,
                       HotspotService hotspotService,
                       LocalImagePlanService localImagePlanService) {
        this.doubaoService = doubaoService;
        this.imageGenerationService = imageGenerationService;
        this.imageCacheService = imageCacheService;
        this.hotspotService = hotspotService;
        this.localImagePlanService = localImagePlanService;
    }

    /**
     * 对话接口
     */
    @PostMapping("/chat")
    public ApiResponse<String> chat(@Valid @RequestBody ChatRequest request) {
        try {
            log.info("Chat request: {}", request.getMessage());
            String response = doubaoService.chat(request.getMessage(), request.getSystemPrompt());
            return ApiResponse.success(response);
        } catch (Exception e) {
            log.error("Chat failed", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 分析文章接口
     */
    @PostMapping("/analyze")
    public ApiResponse<String> analyze(@Valid @RequestBody AnalyzeRequest request) {
        try {
            log.info("Analyze article: {}", request.getTitle());
            String analysis = doubaoService.analyzeArticle(request.getContent());
            return ApiResponse.success(analysis);
        } catch (Exception e) {
            log.error("Analysis failed", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 生成初稿接口
     */
    @PostMapping("/generate")
    public ApiResponse<String> generate(@Valid @RequestBody GenerateRequest request) {
        try {
            log.info("Generate draft based on analysis");
            String draft = doubaoService.generateDraft(
                    request.getAnalysisResult(),
                    request.getCustomRequirement()
            );
            return ApiResponse.success(draft);
        } catch (Exception e) {
            log.error("Generation failed", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 改写润色接口
     */
    @PostMapping("/rewrite")
    public ApiResponse<String> rewrite(@Valid @RequestBody RewriteRequest request) {
        try {
            log.info("Rewrite content: {}", request.getInstruction());
            String rewritten = doubaoService.rewrite(
                    request.getContent(),
                    request.getInstruction()
            );
            return ApiResponse.success(rewritten);
        } catch (Exception e) {
            log.error("Rewrite failed", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 健康检查
     */
    @GetMapping("/health")
    public ApiResponse<String> health() {
        return ApiResponse.success("AI Service is running");
    }

    /**
     * 为文章生成配图（客户端模式 - 只生成prompt，不生成图片）
     */
    @PostMapping("/generate-images")
    public ApiResponse<ImagePlanResponse> generateImages(@Valid @RequestBody GenerateImagesRequest request) {
        try {
            log.info("生成文章配图方案，文章长度: {}", request.getArticleContent().length());

            // 1. 检查缓存
            ImagePlanResponse cachedPlan = imageCacheService.getCachedPlan(request.getArticleContent());
            if (cachedPlan != null) {
                log.info("使用缓存的配图方案");
                return ApiResponse.success(cachedPlan);
            }

            // 2. 分析文章并生成配图方案（使用本地服务，无需API Key）
            String imagePlanJson = localImagePlanService.analyzeArticleForImages(request.getArticleContent());
            log.info("配图方案: {}", imagePlanJson);

            // 3. 解析JSON
            JSONObject planObj = JSONUtil.parseObj(imagePlanJson);
            Integer totalImages = planObj.getInt("totalImages");
            List<JSONObject> imagesArray = planObj.getJSONArray("images").toList(JSONObject.class);

            // 4. 构建配图信息（客户端模式：不生成图片，只返回prompt）
            List<ImagePlanResponse.ImageInfo> imageInfos = new ArrayList<>();

            for (JSONObject imageObj : imagesArray) {
                String position = imageObj.getStr("position");
                String type = imageObj.getStr("type");
                String description = imageObj.getStr("description");
                String prompt = imageObj.getStr("prompt");

                log.info("配图 - 位置: {}, 描述: {}", position, description);

                // 客户端模式：不生成图片，imageUrl设为null
                ImagePlanResponse.ImageInfo imageInfo = ImagePlanResponse.ImageInfo.builder()
                        .position(position)
                        .type(type)
                        .description(description)
                        .prompt(prompt)
                        .imageUrl(null)  // 客户端模式不生成图片
                        .build();

                imageInfos.add(imageInfo);
            }

            // 5. 构建响应
            ImagePlanResponse response = ImagePlanResponse.builder()
                    .totalImages(totalImages)
                    .images(imageInfos)
                    .articleWithImages(null)  // 客户端模式不自动插入
                    .build();

            // 6. 缓存配图方案
            imageCacheService.cachePlan(request.getArticleContent(), response);

            log.info("配图方案生成完成，共 {} 张图片（客户端模式）", totalImages);
            return ApiResponse.success(response);

        } catch (Exception e) {
            log.error("生成配图方案失败", e);
            return ApiResponse.error("生成配图方案失败: " + e.getMessage());
        }
    }

    /**
     * 生成单张图片（供前端重新生成使用）
     */
    @PostMapping("/generate-single-image")
    public ApiResponse<String> generateSingleImage(@RequestBody Map<String, String> request) {
        try {
            String prompt = request.get("prompt");
            if (prompt == null || prompt.isEmpty()) {
                return ApiResponse.error("prompt不能为空");
            }

            log.info("生成单张图片，prompt: {}", prompt);

            // 检查缓存
            String cachedUrl = imageCacheService.getCachedImage(prompt);
            if (cachedUrl != null) {
                log.info("使用缓存的图片");
                return ApiResponse.success(cachedUrl);
            }

            // 生成图片
            String imageUrl = imageGenerationService.generateImage(prompt);

            // 缓存图片URL
            imageCacheService.cacheImage(prompt, imageUrl);

            return ApiResponse.success(imageUrl);

        } catch (Exception e) {
            log.error("生成图片失败", e);
            return ApiResponse.error("生成图片失败: " + e.getMessage());
        }
    }

    /**
     * 清理过期缓存
     */
    @PostMapping("/clean-cache")
    public ApiResponse<String> cleanCache() {
        try {
            imageCacheService.cleanExpiredCache();
            return ApiResponse.success("缓存清理完成");
        } catch (Exception e) {
            log.error("清理缓存失败", e);
            return ApiResponse.error("清理缓存失败: " + e.getMessage());
        }
    }

    /**
     * 获取热点数据
     */
    @GetMapping(value = "/hotspots", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getHotspots(@RequestParam(defaultValue = "weibo") String source) {
        try {
            log.info("获取热点数据: {}", source);
            List<HotspotService.HotspotItem> hotspots = hotspotService.getHotspots(source);

            Map<String, Object> response = new HashMap<>();
            response.put("timestamp", System.currentTimeMillis());

            if (hotspots == null || hotspots.isEmpty()) {
                response.put("code", 500);
                response.put("message", "暂无热点数据，所有API均不可用");
                response.put("data", null);
                return ResponseEntity.ok(response);
            }

            // 转换为DTO
            List<HotspotItemDTO> dtoList = new ArrayList<>();
            for (HotspotService.HotspotItem item : hotspots) {
                dtoList.add(new HotspotItemDTO(
                    item.getTitle(),
                    item.getHot(),
                    item.getTag(),
                    item.getDesc()
                ));
            }

            response.put("code", 200);
            response.put("message", "Success");
            response.put("data", dtoList);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("获取热点失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("code", 500);
            response.put("message", "获取热点失败: " + e.getMessage());
            response.put("data", null);
            response.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.ok(response);
        }
    }

    /**
     * 将图片插入文章
     */
    private String insertImagesToArticle(String articleContent, List<ImagePlanResponse.ImageInfo> images) {
        StringBuilder result = new StringBuilder();
        String[] paragraphs = articleContent.split("\n\n");

        for (ImagePlanResponse.ImageInfo image : images) {
            String position = image.getPosition();

            if ("start".equals(position)) {
                // 在文章开头插入封面图
                result.append(createImageHtml(image, "封面图")).append("\n\n");
            }
        }

        // 插入文章内容和段落配图
        for (int i = 0; i < paragraphs.length; i++) {
            result.append(paragraphs[i]).append("\n\n");

            // 检查是否需要在这个段落后插入图片
            int sectionNum = i + 1;
            String sectionPosition = "section-" + sectionNum;

            for (ImagePlanResponse.ImageInfo image : images) {
                if (sectionPosition.equals(image.getPosition())) {
                    result.append(createImageHtml(image, "配图")).append("\n\n");
                }
            }
        }

        // 在文章结尾插入图片
        for (ImagePlanResponse.ImageInfo image : images) {
            if ("end".equals(image.getPosition())) {
                result.append(createImageHtml(image, "结尾配图")).append("\n\n");
            }
        }

        return result.toString();
    }

    /**
     * 创建图片HTML
     */
    private String createImageHtml(ImagePlanResponse.ImageInfo image, String label) {
        return String.format(
                "<figure style=\"text-align: center; margin: 20px 0;\">\n" +
                "  <img src=\"%s\" alt=\"%s\" style=\"max-width: 100%%; border-radius: 8px;\" />\n" +
                "  <figcaption style=\"color: #999; font-size: 14px; margin-top: 10px;\">%s</figcaption>\n" +
                "</figure>",
                image.getImageUrl(),
                image.getDescription(),
                image.getDescription()
        );
    }
}
