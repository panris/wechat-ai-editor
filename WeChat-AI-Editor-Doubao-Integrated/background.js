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

  // 可以在这里添加其他后台任务
  if (request.action === 'openDoubao') {
    chrome.tabs.create({ url: 'https://www.doubao.com/chat/' });
    sendResponse({ success: true });
  }

  return true;
});
