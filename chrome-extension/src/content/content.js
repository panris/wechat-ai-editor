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

    <!-- 顶部Tab切换 -->
    <div class="tab-navigation">
      <button class="tab-btn active" data-tab="create">🎨 创作</button>
      <button class="tab-btn" data-tab="hotspot">🔥 热点</button>
    </div>

    <div class="ai-sidebar-content">
      <!-- 创作Tab内容 -->
      <div id="create-tab" class="tab-content active">
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

      <!-- 豆包对话区 -->
      <div id="doubao-section" class="doubao-section" style="display:none;">
        <div class="section-header">
          <h4>🤖 豆包 AI</h4>
          <button id="close-doubao" class="close-doubao-btn">收起</button>
        </div>
        <div class="doubao-hint">
          <p>📋 Prompt 已复制！请在下方豆包中粘贴</p>
          <p class="hint-sub">Ctrl+V (Mac: Cmd+V) 粘贴即可</p>
        </div>
        <iframe id="doubao-iframe" src="https://www.doubao.com/chat/" frameborder="0"></iframe>
        <div class="doubao-actions">
          <button id="copy-from-doubao" class="secondary-btn">📋 从豆包复制结果</button>
          <button id="paste-to-editor" class="primary-btn">➜ 粘贴到编辑器</button>
        </div>
      </div>

      <!-- Prompt展示区 -->
      <div id="prompt-section" class="prompt-section" style="display:none;">
        <h4>📋 生成的 Prompt</h4>
        <div class="prompt-hint">👇 Prompt已生成，点击下方按钮使用豆包</div>
        <div id="prompt-content" class="prompt-content"></div>
        <div class="prompt-actions">
          <button id="copy-prompt" class="secondary-btn">📋 复制 Prompt</button>
          <button id="open-doubao" class="primary-btn">🚀 打开豆包对话</button>
        </div>
      </div>
      </div>
      <!-- 创作Tab结束 -->

      <!-- 热点Tab内容 -->
      <div id="hotspot-tab" class="tab-content">
        <div class="hotspot-header">
          <h4>🔥 今日热点</h4>
          <div class="hotspot-sources">
            <button class="source-btn active" data-source="weibo">微博</button>
            <button class="source-btn" data-source="zhihu">知乎</button>
            <button class="source-btn" data-source="baidu">百度</button>
          </div>
        </div>

        <div class="hotspot-time">
          <span id="hotspot-update-time">更新时间：加载中...</span>
          <button id="refresh-hotspot" class="refresh-btn">🔄 刷新</button>
        </div>

        <div id="hotspot-list" class="hotspot-list">
          <div class="loading-placeholder">
            <div class="loading-spinner"></div>
            <p>正在加载热点...</p>
          </div>
        </div>

        <div id="hotspot-detail" class="hotspot-detail" style="display:none;">
          <div class="detail-header">
            <button id="back-to-list" class="back-btn">← 返回列表</button>
            <h4 id="detail-title"></h4>
          </div>
          <div class="detail-content">
            <div class="detail-meta">
              <span id="detail-hot">🔥 热度：加载中...</span>
              <span id="detail-time">⏰ 时间：加载中...</span>
            </div>
            <div id="detail-desc" class="detail-desc"></div>
            <div class="detail-actions">
              <button id="create-from-hotspot" class="primary-btn">✨ 基于此热点创作</button>
              <button id="analyze-hotspot" class="secondary-btn">🔍 分析热点</button>
            </div>
          </div>
        </div>
      </div>
      <!-- 热点Tab结束 -->
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

  // Tab切换
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabName = e.target.dataset.tab;
      switchTab(tabName);
    });
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

  // Prompt操作按钮
  document.getElementById('copy-prompt')?.addEventListener('click', copyPrompt);
  document.getElementById('open-doubao')?.addEventListener('click', openDoubaoSection);

  // 豆包区域按钮
  document.getElementById('close-doubao')?.addEventListener('click', closeDoubaoSection);
  document.getElementById('copy-from-doubao')?.addEventListener('click', () => {
    showNotification('💡 请在豆包中复制结果，然后点击"粘贴到编辑器"', 'info');
  });
  document.getElementById('paste-to-editor')?.addEventListener('click', pasteToEditor);

  // 热点Tab相关按钮
  document.querySelectorAll('.source-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const source = e.target.dataset.source;
      switchHotspotSource(source);
    });
  });
  document.getElementById('refresh-hotspot')?.addEventListener('click', refreshHotspot);
  document.getElementById('back-to-list')?.addEventListener('click', backToHotspotList);
  document.getElementById('create-from-hotspot')?.addEventListener('click', createFromHotspot);
  document.getElementById('analyze-hotspot')?.addEventListener('click', analyzeHotspot);
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
    // 智能识别用户意图并生成Prompt
    const response = await processUserMessage(message);

    // 添加 AI 回复
    addMessageToHistory('assistant', response.text);

    // 显示生成的Prompt
    if (response.generatedPrompt) {
      showPrompt(response.generatedPrompt);
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

// 处理用户消息（生成Prompt）
async function processUserMessage(message) {
  // 智能识别用户意图
  const intent = detectIntent(message);

  // 根据意图生成对应的 Prompt
  const prompt = generatePrompt(intent, message);

  return {
    text: `✅ 已为你生成专业 Prompt！`,
    generatedPrompt: prompt,
    intentAction: intent.action
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

// 显示Prompt
function showPrompt(prompt) {
  const promptSection = document.getElementById('prompt-section');
  const promptContent = document.getElementById('prompt-content');

  promptContent.textContent = prompt;
  promptSection.style.display = 'block';

  // 滚动到Prompt区
  setTimeout(() => {
    promptSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

// 复制Prompt
function copyPrompt() {
  const content = document.getElementById('prompt-content').textContent;
  navigator.clipboard.writeText(content).then(() => {
    showNotification('✅ Prompt 已复制到剪贴板', 'success');
  }).catch(() => {
    showNotification('❌ 复制失败', 'error');
  });
}

// 打开豆包对话区域
function openDoubaoSection() {
  const content = document.getElementById('prompt-content').textContent;

  // 复制Prompt到剪贴板
  navigator.clipboard.writeText(content).then(() => {
    // 显示豆包区域
    const doubaoSection = document.getElementById('doubao-section');
    const promptSection = document.getElementById('prompt-section');

    promptSection.style.display = 'none';
    doubaoSection.style.display = 'block';

    // 重新加载iframe确保豆包页面刷新
    const iframe = document.getElementById('doubao-iframe');
    iframe.src = 'https://www.doubao.com/chat/';

    showNotification('✅ Prompt已复制！请在下方豆包中粘贴', 'success');

    // 滚动到豆包区
    setTimeout(() => {
      doubaoSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }).catch(() => {
    showNotification('❌ 复制失败', 'error');
  });
}

// 关闭豆包区域
function closeDoubaoSection() {
  const doubaoSection = document.getElementById('doubao-section');
  doubaoSection.style.display = 'none';
}

// 粘贴到编辑器
function pasteToEditor() {
  navigator.clipboard.readText().then(text => {
    if (!text) {
      showNotification('❌ 剪贴板为空，请先从豆包复制内容', 'warning');
      return;
    }

    insertToEditor(text);
  }).catch(() => {
    showNotification('❌ 读取剪贴板失败，请确保已授予权限', 'error');
  });
}

// 插入内容到微信编辑器
function insertToEditor(content) {
  const editor = document.querySelector('#edui1_iframeholder iframe')?.contentDocument?.body ||
                 document.querySelector('.rich_media_area_primary')?.contentWindow?.document?.body ||
                 document.querySelector('[contenteditable="true"]');

  if (editor) {
    // 转换换行符为 <br>
    const formattedContent = content.replace(/\n/g, '<br>');
    editor.innerHTML += formattedContent;
    showNotification('✅ 内容已插入编辑器', 'success');

    // 关闭豆包区域
    closeDoubaoSection();
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

// ========== 热点功能相关函数 ==========

// Tab切换
function switchTab(tabName) {
  // 切换Tab按钮状态
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
    }
  });

  // 切换Tab内容
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });

  if (tabName === 'create') {
    document.getElementById('create-tab').classList.add('active');
  } else if (tabName === 'hotspot') {
    document.getElementById('hotspot-tab').classList.add('active');
    // 首次加载热点
    if (!window.hotspotsLoaded) {
      loadHotspots('weibo');
      window.hotspotsLoaded = true;
    }
  }
}

// 切换热点源
function switchHotspotSource(source) {
  // 切换源按钮状态
  document.querySelectorAll('.source-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.source === source) {
      btn.classList.add('active');
    }
  });

  // 加载对应源的热点
  loadHotspots(source);
}

// 加载热点数据
async function loadHotspots(source) {
  const hotspotList = document.getElementById('hotspot-list');
  const updateTime = document.getElementById('hotspot-update-time');

  // 显示加载状态
  hotspotList.innerHTML = `
    <div class="loading-placeholder">
      <div class="loading-spinner"></div>
      <p>正在加载${getSourceName(source)}热点...</p>
    </div>
  `;

  try {
    const hotspots = await fetchHotspots(source);

    // 更新时间
    const now = new Date();
    updateTime.textContent = `更新时间：${now.toLocaleTimeString('zh-CN')}`;

    // 渲染热点列表
    renderHotspotList(hotspots, source);
  } catch (error) {
    hotspotList.innerHTML = `
      <div class="error-placeholder">
        <p>❌ 加载失败：${error.message}</p>
        <button class="retry-btn" onclick="loadHotspots('${source}')">重试</button>
      </div>
    `;
  }
}

// 获取热点数据
async function fetchHotspots(source) {
  // 通过background script获取数据，避免CORS问题
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: 'fetchHotspots', source: source },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (response.success) {
          const data = response.data;
          // 处理不同API的数据格式
          if (data.code === 200 && data.data) {
            resolve(data.data.slice(0, 50));
          } else if (data.success && data.data) {
            resolve(data.data.slice(0, 50));
          } else if (Array.isArray(data)) {
            resolve(data.slice(0, 50));
          } else {
            reject(new Error('数据格式错误'));
          }
        } else {
          reject(new Error(response.error || '获取数据失败'));
        }
      }
    );
  });
}

// 渲染热点列表
function renderHotspotList(hotspots, source) {
  const hotspotList = document.getElementById('hotspot-list');

  if (!hotspots || hotspots.length === 0) {
    hotspotList.innerHTML = '<div class="empty-placeholder"><p>暂无热点数据</p></div>';
    return;
  }

  const html = hotspots.map((item, index) => {
    const rankClass = index < 3 ? 'top-rank' : '';
    // 兼容多种数据格式
    const hotValue = item.hot || item.hotScore || item.index || item.hotnum || '';
    const title = item.title || item.query || item.word || item.name || '无标题';

    return `
      <div class="hotspot-item ${rankClass}" data-index="${index}" data-source="${source}">
        <div class="hotspot-rank">${index + 1}</div>
        <div class="hotspot-content">
          <div class="hotspot-title">${title}</div>
          ${hotValue ? `<div class="hotspot-hot">🔥 ${formatHotValue(hotValue)}</div>` : ''}
        </div>
        <div class="hotspot-arrow">→</div>
      </div>
    `;
  }).join('');

  hotspotList.innerHTML = html;

  // 绑定点击事件
  document.querySelectorAll('.hotspot-item').forEach(item => {
    item.addEventListener('click', () => {
      const index = parseInt(item.dataset.index);
      const source = item.dataset.source;
      showHotspotDetail(hotspots[index], source);
    });
  });
}

// 显示热点详情
function showHotspotDetail(hotspot, source) {
  const listView = document.getElementById('hotspot-list');
  const detailView = document.getElementById('hotspot-detail');

  // 保存当前热点到全局变量
  window.currentHotspot = hotspot;
  window.currentHotspotSource = source;

  // 兼容多种数据格式
  const title = hotspot.title || hotspot.query || hotspot.word || hotspot.name || '无标题';
  const hotValue = hotspot.hot || hotspot.hotScore || hotspot.index || hotspot.hotnum || '未知';
  const desc = hotspot.desc || hotspot.excerpt || hotspot.mobileSummary || title || '暂无描述';

  // 填充详情
  document.getElementById('detail-title').textContent = title;
  document.getElementById('detail-hot').textContent = `🔥 热度：${formatHotValue(hotValue)}`;
  document.getElementById('detail-time').textContent = `⏰ 来源：${getSourceName(source)}`;
  document.getElementById('detail-desc').innerHTML = `<p>${desc}</p>`;

  // 切换视图
  listView.style.display = 'none';
  detailView.style.display = 'block';
}

// 返回热点列表
function backToHotspotList() {
  const listView = document.getElementById('hotspot-list');
  const detailView = document.getElementById('hotspot-detail');

  listView.style.display = 'block';
  detailView.style.display = 'none';
}

// 基于热点创作
function createFromHotspot() {
  const hotspot = window.currentHotspot;
  if (!hotspot) return;

  // 切换到创作Tab
  switchTab('create');

  // 生成Prompt - 兼容多种数据格式
  const title = hotspot.title || hotspot.query || hotspot.word || hotspot.name || '热点话题';
  const prompt = `请基于以下热点话题创作一篇公众号文章：

热点标题：${title}

要求：
1. 紧扣热点，找准切入角度
2. 标题要有吸引力，15-25字
3. 内容1500-2000字
4. 结构清晰，有观点有案例
5. 语言生动，易于传播`;

  // 显示Prompt
  showPrompt(prompt);
  showNotification('✅ 已生成创作Prompt，请使用豆包创作', 'success');
}

// 分析热点
function analyzeHotspot() {
  const hotspot = window.currentHotspot;
  if (!hotspot) return;

  // 切换到创作Tab
  switchTab('create');

  // 生成分析Prompt - 兼容多种数据格式
  const title = hotspot.title || hotspot.query || hotspot.word || hotspot.name || '热点话题';
  const prompt = `请深度分析以下热点话题：

热点标题：${title}

分析维度：
1. 热点背景和起因
2. 核心讨论点和争议
3. 受众情绪和立场
4. 传播特点和趋势
5. 适合的创作角度
6. 风险提示和注意事项`;

  // 显示Prompt
  showPrompt(prompt);
  showNotification('✅ 已生成分析Prompt，请使用豆包分析', 'success');
}

// 刷新热点
function refreshHotspot() {
  const activeSource = document.querySelector('.source-btn.active').dataset.source;
  loadHotspots(activeSource);
  showNotification('🔄 正在刷新热点...', 'info');
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

// 辅助函数：格式化热度值
function formatHotValue(value) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') {
    if (value > 10000) {
      return (value / 10000).toFixed(1) + '万';
    }
    return value.toString();
  }
  return '未知';
}

// ========== 热点功能结束 ==========

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
