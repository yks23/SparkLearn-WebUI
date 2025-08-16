import { useState, useEffect } from 'react';
import { invoke } from '../utils/ipc';

export default function ApiConfigPage() {
  // 状态管理API配置
  const [apiConfig, setApiConfig] = useState({
    spark_api_key: '',
    silicon_api_key: '',
    openai_api_key: '',
    glm_api_key: '',
    APPID: '',
    APISecret: '',
    APIKEY: '',
  });
  const [isSaved, setIsSaved] = useState(false);
  const [showPassword, setShowPassword] = useState({}); // 为每个字段单独控制密码显示状态
  const [loading, setLoading] = useState(true);

  // 从localStorage加载配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const config = await invoke('getApiConfig');
        setApiConfig(config);
        console.log('配置加载成功:', config);
      } catch (error) {
        console.error('加载API配置失败:', error);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  // 处理输入变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setApiConfig(prev => ({...prev, [name]: value}));
    setIsSaved(false);
  };

  // 切换密码显示状态
  const togglePasswordVisibility = (fieldName) => {
    setShowPassword(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  // 保存配置
  const handleSave = async () => {
    try {
      console.log('准备保存的配置:', apiConfig);
      
      // 保存到localStorage
      const saveResult = await invoke('saveApiConfig', apiConfig);
      
      if (saveResult) {
        // 尝试发送配置到后端
        try {
          await invoke('sendConfigToBackend', apiConfig);
          console.log('配置已发送到后端');
        } catch (backendError) {
          console.warn('发送配置到后端失败:', backendError.message);
          // 不阻止保存成功的提示，因为localStorage保存成功了
        }
        
        setIsSaved(true);
        showNotification('配置已成功保存！', 'success');
        
        // 3秒后重置保存状态
        setTimeout(() => {
          setIsSaved(false);
        }, 3000);
      } else {
        throw new Error('保存到localStorage失败');
      }
    } catch (error) {
      console.error('保存API配置失败:', error.message);
      showNotification(`保存配置失败: ${error.message}`, 'error');
    }
  };

  // 显示通知
  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${
      type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`;
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${type === 'success' 
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
          }
        </svg>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(notification);
    
    // 3秒后移除提示
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  // 配置项说明
  const configDescriptions = {
    spark_api_key: '星火认知大模型API密钥，用于访问科大讯飞星火大模型服务',
    silicon_api_key: 'SiliconFlow API密钥，用于访问硅基流动提供的AI服务',
    openai_api_key: 'OpenAI API密钥，用于访问OpenAI的GPT等模型服务',
    glm_api_key: 'ChatGLM API密钥，用于访问智谱AI的ChatGLM大模型服务',
    APPID: '科大讯飞文字识别APPID，用于访问文字识别服务。登录后在控制台>文字识别>通用文档识别（大模型）中获取',
    APISecret: '科大讯飞文字识别APISecret，用于访问文字识别服务',
    APIKEY: '科大讯飞文字识别APIKEY，用于访问文字识别服务',
  };

  // 配置获取链接
  const configLinks = {
    spark_api_key: 'https://xinghuo.xfyun.cn/',
    silicon_api_key: 'https://siliconflow.cn/',
    openai_api_key: 'https://platform.openai.com/account/api-keys',
    glm_api_key: 'https://open.bigmodel.cn',
    APPID: 'https://www.xfyun.cn/',
    APISecret: 'https://www.xfyun.cn/',
    APIKEY: 'https://www.xfyun.cn/',
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600">加载配置中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <h1 className="text-2xl font-bold mb-6 text-indigo-700">API配置</h1>
      <p className="mb-6 text-gray-600">
        在此页面配置各种API密钥，这些配置将用于访问相应的服务。
      </p>

      <div className="space-y-6">
        {Object.entries(apiConfig).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor={key} className="font-medium text-gray-700">{key}</label>
              <a 
                href={configLinks[key]} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                获取密钥
              </a>
            </div>
            <p className="text-sm text-gray-500">{configDescriptions[key]}</p>
            <div className="relative">
              <input
                type={showPassword[key] ? 'text' : 'password'}
                id={key}
                name={key}
                value={value}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                placeholder={`输入${key}`}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility(key)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword[key] ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.41l2.682-2.682a4.48 4.48 0 00.496-6.346l-.823-.823a1.125 1.125 0 00-1.591 0L1.591 3.469A11.95 11.95 0 000 12c0 .99.133 1.959.37 2.907a10.025 10.025 0 01-3.296 6.607 2.25 2.25 0 001.72 3.938h15.362a2.25 2.25 0 001.72-3.938 10.025 10.025 0 01-3.296-6.607A10.06 10.06 0 0112 19c0 .39-.006.779-.018 1.17A4.496 4.496 0 0013.875 18.825z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        ))}

        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            保存配置
          </button>
        </div>

        {isSaved && (
          <div className="bg-green-100 text-green-700 p-3 rounded-md mt-4">
            配置已成功保存！
          </div>
        )}
      </div>
    </div>
  );
}