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

    // 目前只有微博接口可用
    const apiUrls = {
      weibo: 'https://api.qqsuu.cn/api/dm-weibohot',
      // 知乎和百度接口暂不可用
      zhihu: null,
      baidu: null
    };

    const url = apiUrls[source];

    // 检查接口是否可用
    if (!url) {
      sendResponse({
        success: false,
        error: `${getSourceName(source)}热榜暂时不可用，请使用微博热搜`
      });
      return true;
    }

    // 通过background发送请求，避免CORS问题
    fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log('Hotspot data:', data);
        sendResponse({ success: true, data: data });
      })
      .catch(error => {
        console.error('Fetch hotspot error:', error);
        sendResponse({ success: false, error: error.message });
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
