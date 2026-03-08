"""
WeChat Article Crawler
基于 Playwright 的公众号文章爬虫

使用方法：
1. 配置目标公众号列表 (config/accounts.json)
2. 运行爬虫: python main.py
3. 查看抓取结果 (data/articles.json)
"""

import asyncio
import json
import time
from pathlib import Path
from typing import List, Dict
from urllib.parse import urlparse

from playwright.async_api import async_playwright, Page
from bs4 import BeautifulSoup
from loguru import logger


class WeChatCrawler:
    """微信公众号文章爬虫"""

    def __init__(self, config_path: str = "config/config.json"):
        self.config = self._load_config(config_path)
        self.articles: List[Dict] = []

    def _load_config(self, config_path: str) -> Dict:
        """加载配置文件"""
        config_file = Path(config_path)
        if config_file.exists():
            with open(config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {
            "target_accounts": [],
            "max_articles_per_account": 10,
            "headless": True,
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }

    async def fetch_article_by_url(self, url: str) -> Dict:
        """
        通过 URL 直接抓取文章内容

        Args:
            url: 微信公众号文章链接

        Returns:
            文章数据字典
        """
        logger.info(f"Fetching article from: {url}")

        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=self.config.get("headless", True)
            )
            page = await browser.new_page(
                user_agent=self.config.get("user_agent")
            )

            try:
                await page.goto(url, wait_until="networkidle", timeout=30000)
                await page.wait_for_selector("#js_content", timeout=10000)

                # 提取文章内容
                article_data = await self._extract_article_content(page)
                article_data["url"] = url

                logger.success(f"Successfully fetched: {article_data.get('title', 'Unknown')}")
                return article_data

            except Exception as e:
                logger.error(f"Failed to fetch article: {e}")
                return {}

            finally:
                await browser.close()

    async def _extract_article_content(self, page: Page) -> Dict:
        """
        从页面中提取文章内容

        Args:
            page: Playwright 页面对象

        Returns:
            文章数据字典
        """
        # 获取页面 HTML
        html = await page.content()
        soup = BeautifulSoup(html, 'lxml')

        # 提取标题
        title_elem = soup.select_one("#activity-name")
        title = title_elem.get_text(strip=True) if title_elem else "无标题"

        # 提取作者
        author_elem = soup.select_one("#js_name")
        author = author_elem.get_text(strip=True) if author_elem else "未知作者"

        # 提取发布时间
        time_elem = soup.select_one("#publish_time")
        publish_time = time_elem.get_text(strip=True) if time_elem else ""

        # 提取正文内容
        content_elem = soup.select_one("#js_content")
        if content_elem:
            # 移除脚本和样式标签
            for tag in content_elem.select("script, style"):
                tag.decompose()

            content = content_elem.get_text(separator="\n", strip=True)
        else:
            content = ""

        # 提取封面图
        cover_img = ""
        meta_img = soup.select_one('meta[property="og:image"]')
        if meta_img:
            cover_img = meta_img.get("content", "")

        # 统计数据（如果可见）
        read_count = await self._extract_read_count(page)
        like_count = await self._extract_like_count(page)

        return {
            "title": title,
            "author": author,
            "publish_time": publish_time,
            "content": content,
            "cover_img": cover_img,
            "read_count": read_count,
            "like_count": like_count,
            "crawl_time": time.strftime("%Y-%m-%d %H:%M:%S"),
            "content_length": len(content)
        }

    async def _extract_read_count(self, page: Page) -> int:
        """提取阅读数"""
        try:
            read_elem = await page.query_selector("#readNum3")
            if read_elem:
                read_text = await read_elem.inner_text()
                # 处理 "10万+" 等格式
                if "万" in read_text:
                    return int(float(read_text.replace("万+", "")) * 10000)
                return int(read_text.replace("+", ""))
        except:
            pass
        return 0

    async def _extract_like_count(self, page: Page) -> int:
        """提取点赞数"""
        try:
            like_elem = await page.query_selector("#likeNum3")
            if like_elem:
                like_text = await like_elem.inner_text()
                return int(like_text.replace("+", ""))
        except:
            pass
        return 0

    def save_articles(self, output_path: str = "data/articles.json"):
        """保存抓取的文章"""
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.articles, f, ensure_ascii=False, indent=2)

        logger.info(f"Saved {len(self.articles)} articles to {output_path}")


async def main():
    """主函数"""
    crawler = WeChatCrawler()

    # 示例：抓取指定 URL 的文章
    test_url = "https://mp.weixin.qq.com/s/XXXXXX"  # 替换为实际的文章 URL

    # 如果有命令行参数，使用参数作为 URL
    import sys
    if len(sys.argv) > 1:
        test_url = sys.argv[1]

    article = await crawler.fetch_article_by_url(test_url)

    if article:
        crawler.articles.append(article)
        crawler.save_articles()

        # 打印摘要
        logger.info("=" * 50)
        logger.info(f"标题: {article.get('title', 'N/A')}")
        logger.info(f"作者: {article.get('author', 'N/A')}")
        logger.info(f"发布时间: {article.get('publish_time', 'N/A')}")
        logger.info(f"字数: {article.get('content_length', 0)}")
        logger.info(f"阅读数: {article.get('read_count', 0)}")
        logger.info(f"点赞数: {article.get('like_count', 0)}")
        logger.info("=" * 50)


if __name__ == "__main__":
    # 配置日志
    logger.add("logs/crawler_{time}.log", rotation="1 day", retention="7 days")

    # 运行爬虫
    asyncio.run(main())
