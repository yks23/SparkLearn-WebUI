// 实现本地存储和API调用功能
const BACKEND_URL = 'http://localhost:5001';

export const invoke = async (cmd, arg) => {
  switch (cmd) {
    case 'getApiConfig':
      return getApiConfig();
    case 'saveApiConfig':
      return saveApiConfig(arg);
    case 'sendConfigToBackend':
      return sendConfigToBackend(arg);
    default:
      // 对于其他命令，尝试调用后端API
      return fetch(`${BACKEND_URL}/api/${cmd}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arg),
      }).then(r => r.json());
  }
};

// 从localStorage或后端获取API配置
const getApiConfig = async () => {
  // 首先从localStorage获取用户保存的配置
  try {
    const localConfig = localStorage.getItem('apiConfig');
    if (localConfig) {
      const config = JSON.parse(localConfig);
      console.log('从localStorage获取配置:', config);
      return config;
    }
  } catch (error) {
    console.warn('从localStorage获取配置失败:', error);
  }
  
  // 如果localStorage没有配置，尝试从后端获取
  try {
    const response = await fetch(`${BACKEND_URL}/api/getApiConfig`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.ok) {
      const config = await response.json();
      // 保存到localStorage作为备份
      localStorage.setItem('apiConfig', JSON.stringify(config));
      console.log('从后端获取配置并保存到localStorage:', config);
      return config;
    }
  } catch (error) {
    console.warn('从后端获取配置失败:', error);
  }
  
  // 返回默认配置
  const defaultConfig = {
    spark_api_key: '',
    silicon_api_key: '',
    openai_api_key: '',
    glm_api_key: '',
    APPID: '',
    APISecret: '',
    APIKEY: '',
  };
  
  console.log('使用默认配置:', defaultConfig);
  return defaultConfig;
};

// 保存API配置到localStorage和后端
const saveApiConfig = async (config) => {
  try {
    console.log('开始保存配置:', config);
    
    // 首先保存到localStorage
    localStorage.setItem('apiConfig', JSON.stringify(config));
    console.log('配置已保存到localStorage');
    
    // 然后尝试保存到后端
    try {
      const response = await fetch(`${BACKEND_URL}/api/saveApiConfig`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      
      if (response.ok) {
        console.log('配置已保存到后端');
      } else {
        console.warn('保存到后端失败，但已保存到本地存储');
      }
    } catch (error) {
      console.warn('后端不可用，仅保存到本地存储:', error);
    }
    
    return true;
  } catch (error) {
    console.error('保存API配置失败:', error);
    return false;
  }
};

// 发送配置到后端（这里可以扩展为真正的后端调用）
const sendConfigToBackend = async (config) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/sendConfigToBackend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    
    if (response.ok) {
      console.log('配置已发送到后端');
      return true;
    } else {
      throw new Error('后端响应错误');
    }
  } catch (error) {
    console.error('发送配置到后端失败:', error);
    throw error;
  }
};