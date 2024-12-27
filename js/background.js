let darkModeStates = new Map(); // 存储每个域名的暗黑模式状态

// 检查URL是否可以应用暗黑模式
function isValidUrl(url) {
  return url && !url.startsWith('chrome://') && !url.startsWith('chrome-extension://');
}

// 获取当前域名的暗黑模式状态
async function getDarkModeState(hostname) {
  const data = await chrome.storage.local.get(hostname);
  return data[hostname] || false;
}

// 注入基础样式
async function injectBaseStyles(tabId) {
  const css = `
    .dark-mode {
      filter: invert(1) hue-rotate(180deg) !important;
    }
    .dark-mode img,
    .dark-mode video,
    .dark-mode canvas {
      filter: invert(1) hue-rotate(180deg) !important;
    }
  `;

  try {
    await chrome.scripting.insertCSS({
      target: { tabId },
      css: css
    });
    return true;
  } catch (error) {
    console.error('注入样式失败:', error);
    return false;
  }
}

// 切换暗黑模式
async function toggleDarkMode(tabId, isDark) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (isDark) => {
        document.documentElement.classList.toggle('dark-mode', isDark);
      },
      args: [isDark]
    });
    return true;
  } catch (error) {
    console.error('切换暗黑模式失败:', error);
    return false;
  }
}

// 显示通知
async function showNotification(message) {
  try {
    const iconUrl = chrome.runtime.getURL('icons/dark.png');
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: iconUrl,
      title: '关灯',
      message: message,
      priority: 2
    });
  } catch (error) {
    console.error('显示通知失败:', error);
  }
}

// 监听插件图标点击事件
chrome.action.onClicked.addListener(async (tab) => {
  if (!isValidUrl(tab.url)) {
    await showNotification('此页面不支持暗黑模式');
    return;
  }

  try {
    const hostname = new URL(tab.url).hostname;
    const currentState = await getDarkModeState(hostname);
    const newState = !currentState;

    // 确保基础样式已注入
    await injectBaseStyles(tab.id);

    // 切换暗黑模式
    const success = await toggleDarkMode(tab.id, newState);
    if (!success) {
      await showNotification(newState ? '开启暗黑模式失败' : '关闭暗黑模式失败');
      return;
    }

    // 保存新状态
    await chrome.storage.local.set({ [hostname]: newState });
    darkModeStates.set(hostname, newState);
  } catch (error) {
    console.error('切换暗黑模式失败:', error);
    await showNotification('切换暗黑模式失败');
  }
});

// 监听页面内导航
async function setupNavigationListener(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        // 监听所有点击事件
        document.addEventListener('click', async () => {
          // 等待可能的页面更新
          setTimeout(async () => {
            // 发送消息给扩展，通知页面可能已更新
            chrome.runtime.sendMessage({ type: 'pageUpdated' });
          }, 500);
        });

        // 监听 History API
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function() {
          originalPushState.apply(this, arguments);
          chrome.runtime.sendMessage({ type: 'pageUpdated' });
        };

        history.replaceState = function() {
          originalReplaceState.apply(this, arguments);
          chrome.runtime.sendMessage({ type: 'pageUpdated' });
        };

        // 监听 popstate 事件
        window.addEventListener('popstate', () => {
          chrome.runtime.sendMessage({ type: 'pageUpdated' });
        });
      }
    });
  } catch (error) {
    console.error('设置导航监听器失败:', error);
  }
}

// 处理页面更新
async function handlePageUpdate(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url || !isValidUrl(tab.url)) return;

    const hostname = new URL(tab.url).hostname;
    const isDark = await getDarkModeState(hostname);
    
    if (isDark) {
      await injectBaseStyles(tabId);
      await toggleDarkMode(tabId, true);
    }
  } catch (error) {
    console.error('处理页面更新失败:', error);
  }
}

// 监听来自页面的消息
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'pageUpdated' && sender.tab) {
    handlePageUpdate(sender.tab.id);
  }
});

// 修改原有的标签页更新监听器
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && isValidUrl(tab.url)) {
    try {
      const hostname = new URL(tab.url).hostname;
      const isDark = await getDarkModeState(hostname);
      
      // 注入基础样式和设置监听器
      await injectBaseStyles(tabId);
      await setupNavigationListener(tabId);
      
      if (isDark) {
        await toggleDarkMode(tabId, true);
      }
      
      // 更新当前状态
      darkModeStates.set(hostname, isDark);
    } catch (error) {
      console.error('自动应用暗黑模式失败:', error);
    }
  }
}); 