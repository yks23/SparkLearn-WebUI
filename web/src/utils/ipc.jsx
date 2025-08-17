// 实现本地存储和API调用功能
const BACKEND_URL = 'http://localhost:5001'; // 修改这里为你的后端端口

export const invoke = async (cmd, arg) => {
  switch (cmd) {
    case 'getApiConfig':
      return getApiConfig();
    case 'saveApiConfig':
      return saveApiConfig(arg);
    case 'getModelConfig':
      return getModelConfig();
    case 'saveModelConfig':
      return saveModelConfig(arg);
    case 'sendConfigToBackend':
      return sendConfigToBackend(arg);
    case 'processInput':
      return processInput(arg);
    case 'augmentFile':
      return augmentFile(arg);
    case 'generateQA':
      return generateQA(arg);
    case 'buildKnowledgeGraph':
      return buildKnowledgeGraph(arg);
    case 'runPipeline':
      return runPipeline(arg);
    case 'loadState':
      return loadState(arg);
    case 'selectFolder':
      return selectFolder(arg);
    case 'selectInput':
      return selectInput(arg);
    case 'openFolder':
      return openFolder(arg);
    case 'listDirectory':
      return listDirectory(arg);
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
      console.log('从localStorage获取API配置:', config);
      return config;
    }
  } catch (error) {
    console.warn('从localStorage获取API配置失败:', error);
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
      console.log('从后端获取API配置并保存到localStorage:', config);
      return config;
    }
  } catch (error) {
    console.warn('从后端获取API配置失败:', error);
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
  
  console.log('使用默认API配置:', defaultConfig);
  return defaultConfig;
};

// 从localStorage或后端获取模型配置
const getModelConfig = async () => {
  // 首先从localStorage获取用户保存的配置
  try {
    const localConfig = localStorage.getItem('modelConfig');
    if (localConfig) {
      const config = JSON.parse(localConfig);
      console.log('从localStorage获取模型配置:', config);
      return config;
    }
  } catch (error) {
    console.warn('从localStorage获取模型配置失败:', error);
  }
  
  // 如果localStorage没有配置，尝试从后端获取
  try {
    const response = await fetch(`${BACKEND_URL}/api/getModelConfig`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.ok) {
      const config = await response.json();
      // 保存到localStorage作为备份
      localStorage.setItem('modelConfig', JSON.stringify(config));
      console.log('从后端获取模型配置并保存到localStorage:', config);
      return config;
    }
  } catch (error) {
    console.warn('从后端获取模型配置失败:', error);
  }
  
  // 返回默认配置
  const defaultConfig = {
    model_provider: 'silicon',
    model_name: 'Pro/deepseek-ai/DeepSeek-V3',
  };
  
  console.log('使用默认模型配置:', defaultConfig);
  return defaultConfig;
};

// 保存API配置到localStorage和后端
const saveApiConfig = async (config) => {
  try {
    console.log('开始保存API配置:', config);
    
    // 首先保存到localStorage
    localStorage.setItem('apiConfig', JSON.stringify(config));
    console.log('API配置已保存到localStorage');
    
    // 然后尝试保存到后端
    try {
      const response = await fetch(`${BACKEND_URL}/api/saveApiConfig`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      
      if (response.ok) {
        console.log('API配置已保存到后端');
      } else {
        console.warn('保存API配置到后端失败，但已保存到本地存储');
      }
    } catch (error) {
      console.warn('后端不可用，仅保存API配置到本地存储:', error);
    }
    
    return true;
  } catch (error) {
    console.error('保存API配置失败:', error);
    return false;
  }
};

// 保存模型配置到localStorage和后端
const saveModelConfig = async (config) => {
  try {
    console.log('开始保存模型配置:', config);
    
    // 首先保存到localStorage
    localStorage.setItem('modelConfig', JSON.stringify(config));
    console.log('模型配置已保存到localStorage');
    
    // 然后尝试保存到后端
    try {
      const response = await fetch(`${BACKEND_URL}/api/saveModelConfig`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      
      if (response.ok) {
        console.log('模型配置已保存到后端');
      } else {
        console.warn('保存模型配置到后端失败，但已保存到本地存储');
      }
    } catch (error) {
      console.warn('后端不可用，仅保存模型配置到本地存储:', error);
    }
    
    return true;
  } catch (error) {
    console.error('保存模型配置失败:', error);
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

// 处理输入文件
const processInput = async (params) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/processInput`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    
    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      throw new Error('文件处理请求失败');
    }
  } catch (error) {
    console.error('处理输入文件失败:', error);
    throw error;
  }
};

// 增强文件
const augmentFile = async (params) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/augmentFile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    
    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      throw new Error('文件增强请求失败');
    }
  } catch (error) {
    console.error('增强文件失败:', error);
    throw error;
  }
};

// 生成问答对
const generateQA = async (params) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/generateQA`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    
    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      throw new Error('问答生成请求失败');
    }
  } catch (error) {
    console.error('生成问答对失败:', error);
    throw error;
  }
};

// 构建知识图谱
const buildKnowledgeGraph = async (params) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/buildKnowledgeGraph`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    
    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      throw new Error('知识图谱构建请求失败');
    }
  } catch (error) {
    console.error('构建知识图谱失败:', error);
    throw error;
  }
};

// 运行处理流程
const runPipeline = async (params) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/runPipeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    
    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || '流程执行失败');
    }
  } catch (error) {
    console.error('运行流程失败:', error);
    throw error;
  }
};

// 加载状态文件
const loadState = async (params) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/loadState`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    
    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      throw new Error('状态加载失败');
    }
  } catch (error) {
    console.error('加载状态失败:', error);
    throw error;
  }
};

// 选择文件夹
const selectFolder = async (params) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/selectFolder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    
    if (response.ok) {
      const result = await response.json();
      return result.path;
    } else {
      throw new Error('文件夹选择失败');
    }
  } catch (error) {
    console.error('选择文件夹失败:', error);
    throw error;
  }
};

// 选择输入文件或文件夹
const selectInput = async (params) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/selectInput`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    
    if (response.ok) {
      const result = await response.json();
      return result.path;
    } else {
      throw new Error('输入选择失败');
    }
  } catch (error) {
    console.error('选择输入失败:', error);
    throw error;
  }
};

// 列出目录内容
const listDirectory = async (params) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/listDirectory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    
    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      throw new Error('目录列表获取失败');
    }
  } catch (error) {
    console.error('列出目录失败:', error);
    throw error;
  }
};

// 打开文件夹
const openFolder = async (params) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/openFolder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    
    if (response.ok) {
      const result = await response.json();
      return result.success;
    } else {
      throw new Error('打开文件夹失败');
    }
  } catch (error) {
    console.error('打开文件夹失败:', error);
    throw error;
  }
};