// Background Service Worker - 简化版（无需 API 调用）
console.log('WeChat AI-Editor: Background service worker loaded');

// 安装时初始化
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('WeChat AI-Editor installed');
    // 打开使用说明页面
    chrome.tabs.create({
      url: chrome.runtime.getURL('popup.html')
    });
  }
});

// 处理图标点击
chrome.action.onClicked.addListener((tab) => {
  // 向当前 tab 发送消息
  chrome.tabs.sendMessage(tab.id, {
    action: 'toggleSidebar'
  });
});

// 监听来自 content script 的消息（保留扩展性）
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);

  // 处理热点API请求
  if (request.action === 'fetchHotspots') {
    const source = request.source;

    // 优先使用本地后端API
    const backendUrl = 'http://localhost:8080/api/ai/hotspots';

    console.log('正在从后端获取热点数据...');

    // 先尝试后端API
    fetch(`${backendUrl}?source=${source}`)
      .then(response => response.json())
      .then(data => {
        console.log('后端热点数据:', data);

        if (data.code === 200 && data.data) {
          sendResponse({ success: true, data: { code: 200, data: data.data } });
        } else {
          // 后端也失败了，返回友好提示
          sendResponse({
            success: false,
            error: '热点服务暂时不可用，请稍后重试'
          });
        }
      })
      .catch(error => {
        console.error('后端热点API失败:', error);
        // 后端不可用时的提示
        sendResponse({
          success: false,
          error: '热点服务未启动或不可用。所有免费第三方热点API均已失效，建议使用后端热点服务。'
        });
      });

    return true; // 保持消息通道开放
  }

  // 辅助函数：获取源名称
  function getSourceName(source) {
    const names = {
      weibo: '微博',
      zhihu: '知乎',
      baidu: '百度'
    };
    return names[source] || source;
  }

  // 打开豆包
  if (request.action === 'openDoubao') {
    chrome.tabs.create({ url: 'https://www.doubao.com/chat/' });
    sendResponse({ success: true });
  }

  return true;
});
