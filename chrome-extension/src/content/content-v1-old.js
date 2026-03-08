// Content Script - 注入到微信公众号编辑页面
console.log('WeChat AI-Editor: Content script loaded');

// 检查是否在图文编辑页面
function isEditorPage() {
  return window.location.href.includes('mp.weixin.qq.com') &&
         (window.location.href.includes('appmsgpublish') ||
          window.location.href.includes('appmsg'));
}

// 创建 AI 助手侧边栏
function createAISidebar() {
  if (document.getElementById('ai-editor-sidebar')) {
    console.log('AI Sidebar already exists');
    return;
  }

  const sidebar = document.createElement('div');
  sidebar.id = 'ai-editor-sidebar';
  sidebar.className = 'ai-editor-sidebar';

  sidebar.innerHTML = `
    <div class="ai-sidebar-header">
      <h3>🤖 AI 创作助手 (豆包)</h3>
      <button id="ai-sidebar-close" class="close-btn">×</button>
    </div>
    <div class="ai-sidebar-content">
      <div class="ai-tabs">
        <button class="tab-btn active" data-tab="doubao">豆包对话</button>
        <button class="tab-btn" data-tab="articles">竞品追踪</button>
        <button class="tab-btn" data-tab="tools">创作工具</button>
      </div>

      <!-- 豆包对话面板 - 嵌入豆包网页版 -->
      <div id="doubao-panel" class="panel active">
        <div class="doubao-container">
          <div class="doubao-tips">
            <p>💡 <strong>快速开始：</strong></p>
            <ul>
              <li>直接在下方与豆包对话</li>
              <li>粘贴文章链接让豆包分析</li>
              <li>使用右侧工具按钮快速生成</li>
            </ul>
          </div>
          <iframe
            id="doubao-iframe"
            src="https://www.doubao.com/chat/"
            frameborder="0"
            allow="clipboard-read; clipboard-write"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          ></iframe>
          <div class="doubao-controls">
            <button id="open-doubao" class="secondary-btn">在新窗口打开豆包</button>
            <button id="copy-from-doubao" class="secondary-btn">从豆包复制</button>
            <button id="paste-to-editor" class="primary-btn">粘贴到编辑器</button>
          </div>
        </div>
      </div>

      <!-- 竞品追踪面板 -->
      <div id="articles-panel" class="panel">
        <div class="article-list" id="article-list">
          <p class="placeholder">暂无抓取的竞品文章</p>
          <button id="add-article-url" class="primary-btn">添加文章链接</button>
        </div>
      </div>

      <!-- 创作工具面板 -->
      <div id="tools-panel" class="panel">
        <div class="tools-container">
          <h4>快速 Prompt 模板</h4>

          <div class="tool-card">
            <h5>📊 文章解构分析</h5>
            <p>深度分析文章结构、受众、情绪基调</p>
            <button class="tool-btn" data-prompt="analyze">使用此模板</button>
          </div>

          <div class="tool-card">
            <h5>✍️ 生成原创初稿</h5>
            <p>基于分析结果生成全新文章</p>
            <button class="tool-btn" data-prompt="generate">使用此模板</button>
          </div>

          <div class="tool-card">
            <h5>🎯 标题优化</h5>
            <p>生成吸引眼球的爆款标题</p>
            <button class="tool-btn" data-prompt="title">使用此模板</button>
          </div>

          <div class="tool-card">
            <h5>💡 扩写润色</h5>
            <p>对指定段落进行扩写优化</p>
            <button class="tool-btn" data-prompt="expand">使用此模板</button>
          </div>

          <div class="tool-card">
            <h5>🔍 提取金句</h5>
            <p>从长文中提取可传播金句</p>
            <button class="tool-btn" data-prompt="extract">使用此模板</button>
          </div>

          <div class="custom-prompt">
            <h5>📝 自定义 Prompt</h5>
            <textarea id="custom-prompt-input" placeholder="输入你的自定义 Prompt..."></textarea>
            <button id="use-custom-prompt" class="primary-btn">发送到豆包</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(sidebar);

  // 绑定事件
  bindSidebarEvents();
}

// 绑定侧边栏事件
function bindSidebarEvents() {
  // 关闭按钮
  document.getElementById('ai-sidebar-close')?.addEventListener('click', () => {
    document.getElementById('ai-editor-sidebar').style.display = 'none';
  });

  // Tab 切换
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabName = e.target.dataset.tab;
      switchTab(tabName);
    });
  });

  // 豆包控制按钮
  document.getElementById('open-doubao')?.addEventListener('click', () => {
    window.open('https://www.doubao.com/chat/', '_blank');
  });

  document.getElementById('copy-from-doubao')?.addEventListener('click', copyFromDoubao);
  document.getElementById('paste-to-editor')?.addEventListener('click', pasteToEditor);

  // 添加文章链接
  document.getElementById('add-article-url')?.addEventListener('click', addArticleUrl);

  // 工具按钮
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const promptType = e.target.dataset.prompt;
      usePromptTemplate(promptType);
    });
  });

  // 自定义 Prompt
  document.getElementById('use-custom-prompt')?.addEventListener('click', useCustomPrompt);
}

// 切换 Tab
function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  document.querySelectorAll('.panel').forEach(panel => {
    panel.classList.remove('active');
  });

  document.getElementById(`${tabName}-panel`)?.classList.add('active');
}

// Prompt 模板库
const PROMPT_TEMPLATES = {
  analyze: `请深度分析以下公众号文章，提取关键要素：

【请粘贴文章内容或链接】

请按以下维度分析：
1. **核心主题**：文章的中心思想
2. **目标受众**：主要面向哪类人群
3. **痛点挖掘**：触及了什么痛点或需求
4. **文章结构**：采用了什么行文结构（总分总、故事引入、问题-解决方案等）
5. **情绪基调**：文章的情绪倾向（焦虑、治愈、激励、干货等）
6. **爆款元素**：标题特点、金句摘录、引发共鸣的点
7. **内容密度**：信息量评估（高密度干货 vs 情绪共鸣为主）

请用结构化的方式输出分析结果。`,

  generate: `基于以下文章分析结果，生成一篇全新的、结构相似但内容原创的公众号文章初稿：

【请先粘贴文章分析结果】

要求：
1. 保持相似的文章结构和情绪基调
2. 核心观点和案例必须完全原创，避免抄袭
3. 融入最新的热点或案例，增加时效性
4. 标题要吸引眼球，符合公众号爆款标题特征
5. 字数控制在 1500-2000 字
6. 语言风格要贴近目标受众
7. 适当加入排版技巧

请直接输出完整的文章初稿（包括标题和正文）。`,

  title: `请为以下文章生成 10 个吸引眼球的公众号标题：

【请粘贴文章核心内容或主题】

要求：
1. 符合公众号爆款标题特征
2. 包含数字、疑问、对比等元素
3. 激发好奇心和点击欲望
4. 避免标题党，保证内容相关
5. 每个标题控制在 15-25 字

请按照点击率从高到低排序输出。`,

  expand: `请对以下段落进行扩写优化：

【请粘贴需要扩写的段落】

要求：
1. 增加具体案例和细节描述
2. 丰富论据和数据支撑
3. 加入生动的比喻或故事
4. 保持原有观点和逻辑
5. 扩写后字数增加 2-3 倍

请直接输出扩写后的内容。`,

  extract: `请从以下文章中提取 10 条可传播的金句：

【请粘贴文章内容】

要求：
1. 每条金句独立成句，有完整意义
2. 具有启发性、共鸣性或传播价值
3. 字数控制在 15-50 字
4. 可用于朋友圈、海报等场景
5. 标注每条金句的类型（励志/干货/情感/观点等）

请按传播价值从高到低排序输出。`
};

// 从豆包复制内容
async function copyFromDoubao() {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      // 保存到临时存储
      window.doubaoClipboard = text;
      showNotification('已从剪贴板复制豆包内容', 'success');
    }
  } catch (error) {
    showNotification('复制失败，请手动复制内容', 'error');
  }
}

// 粘贴到编辑器
function pasteToEditor() {
  const content = window.doubaoClipboard;
  if (!content) {
    showNotification('请先从豆包复制内容', 'error');
    return;
  }

  insertToEditor(content);
  showNotification('内容已插入编辑器', 'success');
}

// 添加文章链接
function addArticleUrl() {
  const url = prompt('请输入文章链接：');
  if (!url) return;

  // 构建分析 Prompt
  const analysisPrompt = `请帮我分析这篇文章：${url}\n\n` + PROMPT_TEMPLATES.analyze;

  // 复制到剪贴板
  copyToClipboard(analysisPrompt);
  showNotification('分析 Prompt 已复制，请切换到豆包对话粘贴', 'success');

  // 切换到豆包 Tab
  switchTab('doubao');
}

// 使用 Prompt 模板
function usePromptTemplate(promptType) {
  const template = PROMPT_TEMPLATES[promptType];
  if (!template) return;

  // 复制到剪贴板
  copyToClipboard(template);
  showNotification('Prompt 模板已复制，请切换到豆包对话粘贴', 'success');

  // 切换到豆包 Tab
  switchTab('doubao');
}

// 使用自定义 Prompt
function useCustomPrompt() {
  const input = document.getElementById('custom-prompt-input');
  const prompt = input.value.trim();

  if (!prompt) {
    showNotification('请输入 Prompt 内容', 'error');
    return;
  }

  copyToClipboard(prompt);
  showNotification('自定义 Prompt 已复制，请切换到豆包对话粘贴', 'success');

  // 切换到豆包 Tab
  switchTab('doubao');
}

// 复制到剪贴板
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {
    // 降级方案
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  });
}

// 显示通知
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `ai-notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // 添加显示动画
  setTimeout(() => notification.classList.add('show'), 10);

  // 3秒后移除
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// 插入内容到微信编辑器
function insertToEditor(content) {
  // 查找微信公众号编辑器
  const editor = document.querySelector('#edui1_iframeholder iframe')?.contentDocument?.body ||
                 document.querySelector('.rich_media_area_primary')?.contentWindow?.document?.body ||
                 document.querySelector('[contenteditable="true"]');

  if (editor) {
    // 插入内容
    const formattedContent = content.replace(/\n/g, '<br>');
    editor.innerHTML += formattedContent;
    console.log('Content inserted to editor');
  } else {
    console.error('Editor element not found');
    alert('未找到编辑器，请确保在图文编辑页面');
  }
}

// 创建悬浮按钮
function createFloatingButton() {
  const button = document.createElement('div');
  button.id = 'ai-editor-float-btn';
  button.className = 'ai-editor-float-btn';
  button.innerHTML = '🤖';
  button.title = 'AI 创作助手';

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

// 页面加载完成后初始化
if (isEditorPage()) {
  // 等待页面完全加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

function init() {
  console.log('Initializing WeChat AI-Editor');
  createFloatingButton();
  createAISidebar();

  // 监听来自 popup 的消息
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleSidebar') {
      const sidebar = document.getElementById('ai-editor-sidebar');
      if (sidebar) {
        sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
      }
    }
  });
}
