// Popup Script - 配置管理
document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('settings-form');
  const apiKeyInput = document.getElementById('api-key');
  const apiEndpointInput = document.getElementById('api-endpoint');
  const testBtn = document.getElementById('test-btn');
  const statusDiv = document.getElementById('status');

  // 加载已保存的配置
  const config = await chrome.storage.sync.get(['doubaoApiKey', 'doubaoEndpoint']);
  if (config.doubaoApiKey) {
    apiKeyInput.value = config.doubaoApiKey;
  }
  if (config.doubaoEndpoint) {
    apiEndpointInput.value = config.doubaoEndpoint;
  }

  // 保存配置
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const apiKey = apiKeyInput.value.trim();
    const endpoint = apiEndpointInput.value.trim() || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

    try {
      await chrome.storage.sync.set({
        doubaoApiKey: apiKey,
        doubaoEndpoint: endpoint,
        doubaoModel: 'doubao-pro-32k'
      });

      if (apiKey) {
        showStatus('success', '✅ 配置已保存！现在可以直接在插件内生成内容了');
      } else {
        showStatus('success', '✅ 配置已清除！将使用 Prompt 模式');
      }
    } catch (error) {
      showStatus('error', '❌ 保存失败: ' + error.message);
    }
  });

  // 测试连接
  testBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      showStatus('error', '❌ 请先输入 API Key');
      return;
    }

    testBtn.disabled = true;
    testBtn.textContent = '测试中...';

    try {
      const endpoint = apiEndpointInput.value.trim() || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'doubao-pro-32k',
          messages: [
            {
              role: 'user',
              content: '你好'
            }
          ],
          max_tokens: 10
        })
      });

      if (response.ok) {
        showStatus('success', '✅ API 连接测试成功！配置正确');
      } else {
        const error = await response.json();
        showStatus('error', '❌ API 测试失败: ' + (error.error?.message || '未知错误'));
      }
    } catch (error) {
      showStatus('error', '❌ 网络错误: ' + error.message);
    } finally {
      testBtn.disabled = false;
      testBtn.textContent = '测试连接';
    }
  });

  // 显示状态信息
  function showStatus(type, message) {
    statusDiv.className = `status ${type}`;
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';

    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 5000);
  }
});
