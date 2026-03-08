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
        <h4 id="result-title">✅ 生成的 Prompt</h4>
        <div class="result-hint">👇 这是为你生成的专业 Prompt，复制去豆包使用</div>
        <div id="result-content" class="result-content"></div>
        <div class="result-actions">
          <button id="copy-result" class="secondary-btn">📋 复制 Prompt</button>
          <button id="insert-result" class="primary-btn">🚀 打开豆包</button>
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
      showResult(response.generatedContent, response.isPrompt);
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

// 处理用户消息（直接调用豆包 API）
async function processUserMessage(message) {
  // 智能识别用户意图
  const intent = detectIntent(message);

  // 根据意图生成对应的 Prompt
  const prompt = generatePrompt(intent, message);

  try {
    // 调用豆包 API
    const result = await callDoubaoAPI(prompt);

    return {
      text: `✅ 完成！已经帮你${intent.action}好了！`,
      generatedContent: result,
      isPrompt: false  // 这是最终结果，不是 Prompt
    };
  } catch (error) {
    // 如果 API 调用失败，降级为 Prompt 模式
    console.error('API call failed:', error);
    return {
      text: `⚠️ 由于未配置 API，为你生成了专业 Prompt\n\n请复制去豆包使用，或者配置 API Key 实现自动生成`,
      generatedContent: prompt,
      isPrompt: true
    };
  }
}

// 调用豆包 API
async function callDoubaoAPI(prompt) {
  // 从 storage 获取配置
  const config = await chrome.storage.sync.get(['doubaoApiKey', 'doubaoEndpoint', 'doubaoModel']);

  const apiKey = config.doubaoApiKey || '';
  const endpoint = config.doubaoEndpoint || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
  const model = config.doubaoModel || 'doubao-pro-32k';

  if (!apiKey) {
    throw new Error('未配置 API Key');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: '你是一位专业的公众号内容创作助手。请用清晰的段落格式回复，使用Markdown格式（**加粗**、## 标题等）。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || '调用失败');
  }

  const data = await response.json();
  return data.choices[0].message.content;
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
function showResult(content, isPrompt = false) {
  const resultSection = document.getElementById('result-section');
  const resultTitle = document.getElementById('result-title');
  const resultHint = resultSection.querySelector('.result-hint');
  const resultContent = document.getElementById('result-content');

  // 如果不是 Prompt，则格式化内容
  if (!isPrompt) {
    // 格式化并显示
    const formattedHTML = formatContentToHTML(content);
    resultContent.innerHTML = formattedHTML;
  } else {
    // Prompt 显示纯文本
    resultContent.textContent = content;
  }

  resultSection.style.display = 'block';

  // 根据是否为 Prompt 修改界面
  const copyBtn = document.getElementById('copy-result');
  const insertBtn = document.getElementById('insert-result');

  if (isPrompt) {
    // 如果是 Prompt
    resultTitle.textContent = '📋 生成的 Prompt';
    resultHint.textContent = '⚠️ 未配置 API，这是为你生成的专业 Prompt';
    resultHint.style.display = 'block';
    resultHint.style.background = '#fff3cd';
    resultHint.style.borderColor = '#ff9800';

    copyBtn.innerHTML = '📋 复制 Prompt';
    copyBtn.onclick = copyResult;

    insertBtn.innerHTML = '🚀 打开豆包';
    insertBtn.onclick = () => {
      navigator.clipboard.writeText(content).then(() => {
        showNotification('✅ Prompt 已复制！打开豆包粘贴即可', 'success');
        setTimeout(() => {
          window.open('https://www.doubao.com/chat/', '_blank');
        }, 500);
      }).catch(() => {
        showNotification('❌ 复制失败，请手动复制', 'error');
      });
    };
  } else {
    // 如果是最终结果
    resultTitle.textContent = '✅ 生成完成';
    resultHint.textContent = '👇 内容已自动排版，可直接复制或插入编辑器';
    resultHint.style.display = 'block';
    resultHint.style.background = '#d4edda';
    resultHint.style.borderColor = '#28a745';

    copyBtn.innerHTML = '📋 复制（带格式）';
    copyBtn.onclick = copyFormattedResult;

    insertBtn.innerHTML = '➜ 插入编辑器';
    insertBtn.onclick = insertResult;
  }

  // 滚动到结果区
  setTimeout(() => {
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

// 格式化内容为 HTML（支持 Markdown）
function formatContentToHTML(content) {
  let html = content;

  // 1. 转换标题
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

  // 2. 转换加粗
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // 3. 转换斜体
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // 4. 转换列表
  html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');
  html = html.replace(/^(\d+)\. (.*?)$/gm, '<li>$2</li>');

  // 5. 包装连续的 li 为 ul
  html = html.replace(/(<li>.*?<\/li>\n?)+/g, '<ul>$&</ul>');

  // 6. 转换段落（连续的非空行）
  html = html.split('\n\n').map(para => {
    para = para.trim();
    if (para && !para.startsWith('<')) {
      return `<p>${para}</p>`;
    }
    return para;
  }).join('\n');

  // 7. 转换单个换行为 <br>
  html = html.replace(/\n/g, '<br>');

  return html;
}

// 复制带格式的内容
function copyFormattedResult() {
  const resultContent = document.getElementById('result-content');

  // 创建一个临时元素来复制 HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = resultContent.innerHTML;
  document.body.appendChild(tempDiv);

  // 选择内容
  const range = document.createRange();
  range.selectNode(tempDiv);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  try {
    // 复制（会包含 HTML 格式）
    document.execCommand('copy');
    showNotification('✅ 已复制！可直接粘贴到公众号（保留格式）', 'success');
  } catch (err) {
    // 降级为纯文本复制
    navigator.clipboard.writeText(resultContent.textContent).then(() => {
      showNotification('✅ 已复制纯文本', 'success');
    }).catch(() => {
      showNotification('❌ 复制失败', 'error');
    });
  } finally {
    selection.removeAllRanges();
    document.body.removeChild(tempDiv);
  }
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
  const resultContent = document.getElementById('result-content');

  // 获取 HTML 内容（如果有格式）或纯文本
  const content = resultContent.innerHTML;

  const editor = document.querySelector('#edui1_iframeholder iframe')?.contentDocument?.body ||
                 document.querySelector('.rich_media_area_primary')?.contentWindow?.document?.body ||
                 document.querySelector('[contenteditable="true"]');

  if (editor) {
    // 直接插入 HTML 内容
    editor.innerHTML += content;
    showNotification('✅ 内容已插入编辑器（保留格式）', 'success');
  } else {
    showNotification('❌ 未找到编辑器，请确保在图文编辑页面', 'error');
  }
}

// 插入内容到微信编辑器
function insertToEditor(content) {
  const editor = document.querySelector('#edui1_iframeholder iframe')?.contentDocument?.body ||
                 document.querySelector('.rich_media_area_primary')?.contentWindow?.document?.body ||
                 document.querySelector('[contenteditable="true"]');

  if (editor) {
    // 如果 content 是 HTML 字符串，直接插入
    // 否则转换换行符
    if (content.includes('<')) {
      editor.innerHTML += content;
    } else {
      const formattedContent = content.replace(/\n/g, '<br>');
      editor.innerHTML += formattedContent;
    }
    showNotification('✅ 内容已插入编辑器', 'success');
  } else {
    showNotification('❌ 未找到编辑器，请确保在图文编辑页面', 'error');
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
