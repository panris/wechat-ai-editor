// Content Script - 小白友好版
console.log('WeChat AI-Editor (小白版): Content script loaded');

// 检查是否在图文编辑页面
function isEditorPage() {
  return window.location.href.includes('mp.weixin.qq.com') &&
         (window.location.href.includes('appmsgpublish') ||
          window.location.href.includes('appmsg'));
}

// 创建简化版 AI 助手侧边栏
function createAISidebar() {
  if (document.getElementById('ai-editor-sidebar')) {
    return;
  }

  const sidebar = document.createElement('div');
  sidebar.id = 'ai-editor-sidebar';
  sidebar.className = 'ai-editor-sidebar';

  sidebar.innerHTML = `
    <div class="ai-sidebar-header">
      <h3>🤖 AI 创作小助手</h3>
      <button id="ai-sidebar-close" class="close-btn">×</button>
    </div>

    <div class="ai-sidebar-content">
      <!-- 智能对话区 -->
      <div class="chat-section">
        <div class="greeting">
          <p>👋 你好！我是你的 AI 创作助手</p>
          <p class="hint">告诉我你想要什么，我来帮你搞定！</p>
        </div>

        <div id="chat-history" class="chat-history"></div>

        <div class="chat-input-box">
          <textarea
            id="user-input"
            placeholder="比如：帮我分析这篇文章 https://..."
            rows="3"
          ></textarea>
          <button id="send-btn" class="primary-btn">
            <span id="btn-text">发送</span>
            <span id="btn-loading" class="loading" style="display:none;">处理中...</span>
          </button>
        </div>
      </div>

      <!-- 快捷功能卡片 -->
      <div class="quick-actions">
        <h4>✨ 快捷功能</h4>

        <div class="action-cards">
          <div class="action-card" data-action="write-article">
            <div class="card-icon">📝</div>
            <div class="card-title">帮我写文章</div>
            <div class="card-desc">给个参考文章，我写一篇新的</div>
          </div>

          <div class="action-card" data-action="generate-titles">
            <div class="card-icon">💡</div>
            <div class="card-title">写标题</div>
            <div class="card-desc">输入主题，生成10个爆款标题</div>
          </div>

          <div class="action-card" data-action="analyze-article">
            <div class="card-icon">🔍</div>
            <div class="card-title">分析文章</div>
            <div class="card-desc">学习别人的爆款套路</div>
          </div>

          <div class="action-card" data-action="expand-content">
            <div class="card-icon">✨</div>
            <div class="card-title">扩写段落</div>
            <div class="card-desc">让内容更丰富详细</div>
          </div>

          <div class="action-card" data-action="extract-quotes">
            <div class="card-icon">🎯</div>
            <div class="card-title">提炼金句</div>
            <div class="card-desc">提取可传播的精彩句子</div>
          </div>

          <div class="action-card" data-action="rewrite">
            <div class="card-icon">📋</div>
            <div class="card-title">改写润色</div>
            <div class="card-desc">让文字更专业/更幽默</div>
          </div>
        </div>
      </div>

      <!-- 结果展示区 -->
      <div id="result-section" class="result-section" style="display:none;">
        <h4>✅ 生成结果</h4>
        <div id="result-content" class="result-content"></div>
        <div class="result-actions">
          <button id="copy-result" class="secondary-btn">📋 复制</button>
          <button id="insert-result" class="primary-btn">➜ 插入编辑器</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(sidebar);
  bindEvents();
}

// 绑定事件
function bindEvents() {
  // 关闭按钮
  document.getElementById('ai-sidebar-close')?.addEventListener('click', () => {
    document.getElementById('ai-editor-sidebar').style.display = 'none';
  });

  // 发送消息
  document.getElementById('send-btn')?.addEventListener('click', handleSendMessage);
  document.getElementById('user-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSendMessage();
    }
  });

  // 快捷功能卡片
  document.querySelectorAll('.action-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const action = e.currentTarget.dataset.action;
      handleQuickAction(action);
    });
  });

  // 结果操作按钮
  document.getElementById('copy-result')?.addEventListener('click', copyResult);
  document.getElementById('insert-result')?.addEventListener('click', insertResult);
}

// 处理用户输入
async function handleSendMessage() {
  const input = document.getElementById('user-input');
  const message = input.value.trim();

  if (!message) {
    showNotification('请输入内容', 'warning');
    return;
  }

  // 添加用户消息到历史
  addMessageToHistory('user', message);
  input.value = '';

  // 显示加载状态
  setLoadingState(true);

  try {
    // 智能识别用户意图并生成回复
    const response = await processUserMessage(message);

    // 添加 AI 回复
    addMessageToHistory('assistant', response.text);

    // 如果有生成的内容，显示结果区
    if (response.generatedContent) {
      showResult(response.generatedContent);
    }
  } catch (error) {
    addMessageToHistory('error', '抱歉，处理失败了。' + error.message);
  } finally {
    setLoadingState(false);
  }
}

// 处理快捷功能
function handleQuickAction(action) {
  const actionMap = {
    'write-article': {
      prompt: '请输入你想模仿的文章链接：',
      placeholder: 'https://mp.weixin.qq.com/s/...',
      instruction: '帮我写一篇新文章'
    },
    'generate-titles': {
      prompt: '请输入文章主题：',
      placeholder: '例如：AI 在教育领域的应用',
      instruction: '生成10个标题'
    },
    'analyze-article': {
      prompt: '请输入要分析的文章链接：',
      placeholder: 'https://mp.weixin.qq.com/s/...',
      instruction: '分析这篇文章'
    },
    'expand-content': {
      prompt: '请粘贴需要扩写的段落：',
      placeholder: '粘贴你想扩写的内容...',
      instruction: '扩写这段内容'
    },
    'extract-quotes': {
      prompt: '请粘贴文章内容：',
      placeholder: '粘贴完整文章...',
      instruction: '提取金句'
    },
    'rewrite': {
      prompt: '请粘贴需要改写的内容：',
      placeholder: '粘贴需要改写的文字...',
      instruction: '改写润色'
    }
  };

  const config = actionMap[action];
  if (!config) return;

  // 弹出输入框
  const userContent = prompt(config.prompt, config.placeholder);
  if (!userContent) return;

  // 组合完整消息
  const fullMessage = `${config.instruction}\n\n${userContent}`;

  // 填充到输入框并发送
  document.getElementById('user-input').value = fullMessage;
  handleSendMessage();
}

// 添加消息到历史记录
function addMessageToHistory(role, content) {
  const history = document.getElementById('chat-history');
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${role}`;

  const roleLabels = {
    'user': '你',
    'assistant': 'AI 助手',
    'error': '提示'
  };

  messageDiv.innerHTML = `
    <div class="message-header">${roleLabels[role]}</div>
    <div class="message-body">${formatMessage(content)}</div>
  `;

  history.appendChild(messageDiv);
  history.scrollTop = history.scrollHeight;
}

// 格式化消息内容
function formatMessage(content) {
  return content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
}

// 处理用户消息（调用豆包 API 或使用智能模板）
async function processUserMessage(message) {
  // 智能识别用户意图
  const intent = detectIntent(message);

  // 根据意图生成对应的 Prompt
  const prompt = generatePrompt(intent, message);

  // 这里需要调用豆包 API
  // 暂时返回模拟响应
  return {
    text: `收到！我正在帮你${intent.action}...\n\n由于这是演示版本，请：\n1. 打开豆包网站 https://www.doubao.com/chat/\n2. 粘贴以下内容：\n\n${prompt}\n\n3. 点击下方"显示结果"按钮查看生成内容`,
    generatedContent: null
  };
}

// 智能识别用户意图
function detectIntent(message) {
  const patterns = {
    analyze: /分析|解构|学习|研究/,
    write: /写|生成|创作|帮我写/,
    title: /标题|起标题/,
    expand: /扩写|丰富|展开|详细/,
    extract: /金句|提取|摘录/,
    rewrite: /改写|润色|修改/
  };

  for (const [key, pattern] of Object.entries(patterns)) {
    if (pattern.test(message)) {
      return { type: key, action: getActionLabel(key) };
    }
  }

  return { type: 'general', action: '处理' };
}

// 获取操作标签
function getActionLabel(type) {
  const labels = {
    analyze: '分析文章',
    write: '写文章',
    title: '生成标题',
    expand: '扩写内容',
    extract: '提取金句',
    rewrite: '改写润色',
    general: '处理'
  };
  return labels[type] || '处理';
}

// 生成对应的 Prompt
function generatePrompt(intent, userMessage) {
  // 这里返回针对不同意图的专业 Prompt
  const prompts = {
    analyze: `请深度分析以下公众号文章：\n\n${userMessage}\n\n分析维度：核心主题、目标受众、痛点挖掘、文章结构、情绪基调、爆款元素、内容密度`,
    write: `基于以下参考，生成一篇全新的原创文章：\n\n${userMessage}\n\n要求：结构相似但内容原创，1500-2000字，标题吸引人`,
    title: `为以下主题生成10个公众号爆款标题：\n\n${userMessage}\n\n要求：15-25字，包含数字、疑问或对比元素，按点击率排序`,
    expand: `请扩写以下内容：\n\n${userMessage}\n\n要求：增加具体案例、数据支撑、生动描述，扩写2-3倍`,
    extract: `请从以下文章提取10条可传播金句：\n\n${userMessage}\n\n要求：15-50字，有启发性，标注类型`,
    rewrite: `请改写润色以下内容：\n\n${userMessage}\n\n要求：保持原意，语言更流畅专业`
  };

  return prompts[intent.type] || userMessage;
}

// 显示结果
function showResult(content) {
  const resultSection = document.getElementById('result-section');
  const resultContent = document.getElementById('result-content');

  resultContent.textContent = content;
  resultSection.style.display = 'block';

  // 滚动到结果区
  resultSection.scrollIntoView({ behavior: 'smooth' });
}

// 复制结果
function copyResult() {
  const content = document.getElementById('result-content').textContent;
  navigator.clipboard.writeText(content).then(() => {
    showNotification('已复制到剪贴板', 'success');
  });
}

// 插入结果到编辑器
function insertResult() {
  const content = document.getElementById('result-content').textContent;
  insertToEditor(content);
  showNotification('已插入编辑器', 'success');
}

// 插入内容到微信编辑器
function insertToEditor(content) {
  const editor = document.querySelector('#edui1_iframeholder iframe')?.contentDocument?.body ||
                 document.querySelector('.rich_media_area_primary')?.contentWindow?.document?.body ||
                 document.querySelector('[contenteditable="true"]');

  if (editor) {
    const formattedContent = content.replace(/\n/g, '<br>');
    editor.innerHTML += formattedContent;
  } else {
    alert('未找到编辑器');
  }
}

// 设置加载状态
function setLoadingState(isLoading) {
  const btnText = document.getElementById('btn-text');
  const btnLoading = document.getElementById('btn-loading');
  const sendBtn = document.getElementById('send-btn');

  if (isLoading) {
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    sendBtn.disabled = true;
  } else {
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
    sendBtn.disabled = false;
  }
}

// 显示通知
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `ai-notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);
  setTimeout(() => notification.classList.add('show'), 10);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// 创建悬浮按钮
function createFloatingButton() {
  const button = document.createElement('div');
  button.id = 'ai-editor-float-btn';
  button.className = 'ai-editor-float-btn';
  button.innerHTML = '🤖';
  button.title = 'AI 创作小助手';

  button.addEventListener('click', () => {
    const sidebar = document.getElementById('ai-editor-sidebar');
    if (sidebar) {
      sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
    } else {
      createAISidebar();
    }
  });

  document.body.appendChild(button);
}

// 初始化
if (isEditorPage()) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

function init() {
  console.log('Initializing WeChat AI-Editor (小白版)');
  createFloatingButton();
  createAISidebar();

  // 监听消息
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleSidebar') {
      const sidebar = document.getElementById('ai-editor-sidebar');
      if (sidebar) {
        sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
      }
    }
  });
}
