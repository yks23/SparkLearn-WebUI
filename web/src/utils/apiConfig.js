// 处理API配置的加载和保存

// 默认配置
const defaultConfig = {
  spark_api_key: '',
  silicon_api_key: '',
  openai_api_key: '',
  glm_api_key: '',
  APPID: '',
  APISecret: '',
  APIKEY: '',
};

// 加载API配置
export function getApiConfig() {
  try {
    // 尝试从localStorage加载配置
    const savedConfig = localStorage.getItem('apiConfig');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        // 验证解析后的数据格式
        if (typeof parsedConfig !== 'object') {
          console.error('加载API配置失败: 配置格式无效');
          return {...defaultConfig};
        }
        return {...defaultConfig, ...parsedConfig};
      } catch (parseError) {
        console.error('加载API配置失败: JSON解析错误 -', parseError.message);
        // 尝试清除无效的配置
        localStorage.removeItem('apiConfig');
        return {...defaultConfig};
      }
    }
    return {...defaultConfig};
  } catch (error) {
    console.error('加载API配置失败:', error);
    return {...defaultConfig};
  }
}

// 保存API配置
export function saveApiConfig(config) {
  try {
    // 验证配置格式
    if (!config || typeof config !== 'object') {
      console.error('保存API配置失败: 配置必须是一个对象');
      return false;
    }
    
    // 尝试序列化配置
    let configString;
    try {
      configString = JSON.stringify(config);
    } catch (jsonError) {
      console.error('保存API配置失败: JSON序列化错误 -', jsonError.message);
      return false;
    }
    
    // 将配置保存到localStorage
    localStorage.setItem('apiConfig', configString);
    
    // 验证保存是否成功
    const savedConfig = localStorage.getItem('apiConfig');
    if (savedConfig !== configString) {
      console.error('保存API配置失败: 保存的数据与原始数据不匹配');
      return false;
    }
    
    console.log('API配置保存成功:', config);
    return true;
  } catch (error) {
    console.error('保存API配置失败:', error.message);
    return false;
  }
}

// 注意：当前配置仅保存在前端localStorage中，
// 如需后端获取，需要通过Electron的ipc机制将配置发送到后端
// 并在后端实现相应的接收和处理逻辑

// 为了兼容之前的代码，这里模拟ipc invoke
// 在实际应用中，这部分可能会被Electron的ipc机制替换
window.invoke = function(method, ...args) {
  if (method === 'getApiConfig') {
    return Promise.resolve(getApiConfig());
  } else if (method === 'saveApiConfig') {
    try {
      const result = saveApiConfig(args[0]);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  } else if (method === 'sendConfigToBackend') {
    // 模拟发送配置到后端
    console.log('尝试发送配置到后端:', args[0]);
    
    try {
      // 在实际应用中，这里应该通过Electron的ipcRenderer发送配置到主进程
      // 例如:
      // return ipcRenderer.invoke('send-config-to-backend', args[0]);
      
      // 为了演示，我们假设发送成功
      return Promise.resolve(true);
    } catch (error) {
      console.error('发送配置到后端失败:', error.message);
      return Promise.reject(new Error(`发送配置到后端失败: ${error.message}`));
    }
  }
  return Promise.reject(new Error(`未知方法: ${method}`));
};

// 后端需要实现的逻辑说明:
// 1. 在Electron主进程中监听'send-config-to-backend'事件
// 2. 接收配置数据并将其设置为环境变量
// 3. 例如:
// ipcMain.on('send-config-to-backend', (event, config) => {
//   for (const [key, value] of Object.entries(config)) {
//     process.env[key] = value;
//   }
//   event.reply('config-sent', true);
// });
// 4. 这样后端代码就可以通过os.getenv获取到配置的值