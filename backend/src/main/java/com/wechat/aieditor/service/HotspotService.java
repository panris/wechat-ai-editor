package com.wechat.aieditor.service;

import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * 热点服务
 * 提供微博、知乎、百度等平台的实时热点数据
 */
@Service
public class HotspotService {

    private static final Logger log = LoggerFactory.getLogger(HotspotService.class);

    private final OkHttpClient httpClient;

    // 缓存热点数据（5分钟过期）
    private final Map<String, CachedHotspots> cache = new ConcurrentHashMap<>();
    private static final long CACHE_EXPIRE_MS = 5 * 60 * 1000; // 5分钟

    public HotspotService() {
        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(10, TimeUnit.SECONDS)
                .readTimeout(10, TimeUnit.SECONDS)
                .build();
    }

    /**
     * 获取热点数据
     */
    public List<HotspotItem> getHotspots(String source) {
        // 检查缓存
        CachedHotspots cached = cache.get(source);
        if (cached != null && !cached.isExpired()) {
            log.info("使用缓存的热点数据: {}", source);
            return cached.getItems();
        }

        // 获取新数据
        List<HotspotItem> items = fetchHotspots(source);

        // 缓存数据
        if (items != null && !items.isEmpty()) {
            cache.put(source, new CachedHotspots(items));
        }

        return items;
    }

    /**
     * 从API获取热点数据
     */
    private List<HotspotItem> fetchHotspots(String source) {
        log.info("从API获取热点数据: {}", source);

        // 尝试多个API源
        List<String> apiUrls = getApiUrls(source);

        for (String apiUrl : apiUrls) {
            try {
                log.info("尝试API: {}", apiUrl);
                String jsonData = fetchFromUrl(apiUrl);

                if (StrUtil.isNotBlank(jsonData)) {
                    List<HotspotItem> items = parseHotspotData(jsonData, source);
                    if (items != null && !items.isEmpty()) {
                        log.info("成功获取热点数据，共 {} 条", items.size());
                        return items;
                    }
                }
            } catch (Exception e) {
                log.warn("API {} 获取失败: {}", apiUrl, e.getMessage());
            }
        }

        log.error("所有API都失败，无法获取热点数据");
        return new ArrayList<>();
    }

    /**
     * 获取API URL列表
     */
    private List<String> getApiUrls(String source) {
        List<String> urls = new ArrayList<>();

        switch (source) {
            case "weibo":
                // 微博热搜API（按优先级排序）
                urls.add("https://weibo.com/ajax/side/hotSearch");
                urls.add("https://api.oioweb.cn/api/common/HotList?type=wbHot");
                urls.add("https://api.vvhan.com/api/weibo/hot");
                break;
            case "zhihu":
                urls.add("https://api.oioweb.cn/api/common/HotList?type=zhihuHot");
                break;
            case "baidu":
                urls.add("https://api.oioweb.cn/api/common/HotList?type=baiduRD");
                break;
            default:
                log.warn("未知的热点源: {}", source);
        }

        return urls;
    }

    /**
     * 从URL获取数据
     */
    private String fetchFromUrl(String url) throws Exception {
        Request request = new Request.Builder()
                .url(url)
                .addHeader("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")
                .addHeader("Referer", "https://weibo.com")
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (response.isSuccessful() && response.body() != null) {
                return response.body().string();
            }
            log.warn("API请求失败: {} - {}", response.code(), response.message());
            return null;
        }
    }

    /**
     * 解析热点数据
     */
    private List<HotspotItem> parseHotspotData(String jsonData, String source) {
        try {
            JSONObject json = JSONUtil.parseObj(jsonData);
            List<HotspotItem> items = new ArrayList<>();

            // 微博官方API格式
            if (json.containsKey("data") && json.getJSONObject("data").containsKey("realtime")) {
                JSONArray realtime = json.getJSONObject("data").getJSONArray("realtime");
                for (int i = 0; i < Math.min(50, realtime.size()); i++) {
                    JSONObject item = realtime.getJSONObject(i);
                    items.add(HotspotItem.builder()
                            .title(item.getStr("note", item.getStr("word", "无标题")))
                            .hot(formatHot(item.getStr("num", "")))
                            .tag(item.getStr("category", ""))
                            .desc(item.getStr("note", item.getStr("word", "")))
                            .build());
                }
                return items;
            }

            // oioweb API格式
            if (json.getInt("code") == 200 && json.containsKey("result")) {
                JSONArray result = json.getJSONArray("result");
                for (int i = 0; i < Math.min(50, result.size()); i++) {
                    JSONObject item = result.getJSONObject(i);
                    items.add(HotspotItem.builder()
                            .title(item.getStr("title", "无标题"))
                            .hot(item.getStr("hot", ""))
                            .tag("")
                            .desc(item.getStr("title", ""))
                            .build());
                }
                return items;
            }

            // vvhan API格式
            if (json.getBool("success") && json.containsKey("data")) {
                JSONArray data = json.getJSONArray("data");
                for (int i = 0; i < Math.min(50, data.size()); i++) {
                    JSONObject item = data.getJSONObject(i);
                    items.add(HotspotItem.builder()
                            .title(item.getStr("title", "无标题"))
                            .hot(item.getStr("hot", ""))
                            .tag(item.getStr("tag", ""))
                            .desc(item.getStr("title", ""))
                            .build());
                }
                return items;
            }

            log.warn("未知的数据格式");
            return null;

        } catch (Exception e) {
            log.error("解析热点数据失败", e);
            return null;
        }
    }

    /**
     * 格式化热度数字
     */
    private String formatHot(String hot) {
        if (StrUtil.isBlank(hot)) {
            return "";
        }
        try {
            long num = Long.parseLong(hot);
            if (num >= 100000000) {
                return String.format("%.1f亿", num / 100000000.0);
            } else if (num >= 10000) {
                return String.format("%.1f万", num / 10000.0);
            }
            return String.valueOf(num);
        } catch (Exception e) {
            return hot;
        }
    }

    /**
     * 清理过期缓存
     */
    public void cleanExpiredCache() {
        cache.entrySet().removeIf(entry -> entry.getValue().isExpired());
        log.info("清理热点缓存完成");
    }

    /**
     * 热点数据项
     */
    public static class HotspotItem {
        private String title;
        private String hot;
        private String tag;
        private String desc;

        public static Builder builder() {
            return new Builder();
        }

        public static class Builder {
            private HotspotItem item = new HotspotItem();

            public Builder title(String title) {
                item.title = title;
                return this;
            }

            public Builder hot(String hot) {
                item.hot = hot;
                return this;
            }

            public Builder tag(String tag) {
                item.tag = tag;
                return this;
            }

            public Builder desc(String desc) {
                item.desc = desc;
                return this;
            }

            public HotspotItem build() {
                return item;
            }
        }

        // Getters
        public String getTitle() { return title; }
        public String getHot() { return hot; }
        public String getTag() { return tag; }
        public String getDesc() { return desc; }

        // Setters
        public void setTitle(String title) { this.title = title; }
        public void setHot(String hot) { this.hot = hot; }
        public void setTag(String tag) { this.tag = tag; }
        public void setDesc(String desc) { this.desc = desc; }
    }

    /**
     * 缓存的热点数据
     */
    private static class CachedHotspots {
        private final List<HotspotItem> items;
        private final long timestamp;

        public CachedHotspots(List<HotspotItem> items) {
            this.items = items;
            this.timestamp = System.currentTimeMillis();
        }

        public boolean isExpired() {
            return System.currentTimeMillis() - timestamp > CACHE_EXPIRE_MS;
        }

        public List<HotspotItem> getItems() {
            return items;
        }
    }
}