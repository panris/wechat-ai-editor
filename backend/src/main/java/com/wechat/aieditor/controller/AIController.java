package com.wechat.aieditor.controller;

import com.wechat.aieditor.model.request.AnalyzeRequest;
import com.wechat.aieditor.model.request.ChatRequest;
import com.wechat.aieditor.model.request.GenerateRequest;
import com.wechat.aieditor.model.request.RewriteRequest;
import com.wechat.aieditor.model.response.ApiResponse;
import com.wechat.aieditor.service.DoubaoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * AI 控制器
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
public class AIController {

    private final DoubaoService doubaoService;

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
}
