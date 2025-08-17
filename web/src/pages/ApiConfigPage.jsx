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

  // 新增：模型配置状态
  const [modelConfig, setModelConfig] = useState({
    model_provider: 'silicon',
    model_name: 'Pro/deepseek-ai/DeepSeek-V3',
  });

  // 服务商配置
  const providers = {
    silicon: {
      name: 'SiliconFlow',
      description: '提供多种开源模型，支持本地部署',
      api_key_field: 'silicon_api_key',
      models: [
        { value: 'Pro/deepseek-ai/DeepSeek-V3', label: 'DeepSeek V3 Pro' },
        { value: 'deepseek-ai/DeepSeek-V3', label: 'DeepSeek V3' },
        { value: 'zai-org/GLM-4.5', label: 'ZAI GLM-4.5' },
        { value: 'zai-org/GLM-4.5-Air', label: 'ZAI GLM-4.5 Air' },
        { value: 'moonshortai/Kimi-K2-Instruct', label: 'Kimi K2 Instruct' },
        { value: 'Qwen/Qwen3-235B-A22B-Instruct-2507', label: 'Qwen3 235B A22B Instruct' },
      ]
    },
    spark: {
      name: '科大讯飞星火',
      description: '必配服务商，提供强大的中文AI能力',
      api_key_field: 'spark_api_key',
      models: [
        { value: '4.0Ultra', label: '星火4.0 Ultra' },
        { value: 'generalv3.5', label: '星火3.5 通用版' },
        { value: 'max-32k', label: '星火 Max 32K' },
        { value: 'generalv3', label: '星火3.0 通用版' },
        { value: 'pro-128k', label: '星火 Pro 128K' },
        { value: 'lite', label: '星火 Lite' },
      ]
    },
    zhipuai: {
      name: '智谱AI',
      description: '提供GLM系列模型，支持多种规格',
      api_key_field: 'glm_api_key',
      models: [
        { value: 'glm-4.5', label: 'GLM-4.5' },
        { value: 'glm-4.5-air', label: 'GLM-4.5 Air' },
        { value: 'glm-4.5-x', label: 'GLM-4.5 X' },
        { value: 'glm-4.5-airx', label: 'GLM-4.5 AirX' },
        { value: 'glm-4.5-flash', label: 'GLM-4.5 Flash' },
        { value: 'glm-4-plus', label: 'GLM-4 Plus' },
        { value: 'glm-4-air-250414', label: 'GLM-4 Air 250414' },
        { value: 'glm-4-airx', label: 'GLM-4 AirX' },
        { value: 'glm-4-flashx', label: 'GLM-4 FlashX' },
        { value: 'glm-4-flashx-250414', label: 'GLM-4 FlashX 250414' },
        { value: 'glm-z1-air', label: 'GLM-Z1 Air' },
        { value: 'glm-z1-airx', label: 'GLM-Z1 AirX' },
        { value: 'glm-z1-flash', label: 'GLM-Z1 Flash' },
        { value: 'glm-z1-flashx', label: 'GLM-Z1 FlashX' },
      ]
    },
    openai: {
      name: 'OpenAI',
      description: '提供GPT系列模型，支持多语言',
      api_key_field: 'openai_api_key',
      models: [
        { value: 'gpt-5', label: 'GPT-5' },
        { value: 'gpt-5-mini', label: 'GPT-5 Mini' },
        { value: 'gpt-5-nano', label: 'GPT-5 Nano' },
        { value: 'gpt-4.1', label: 'GPT-4.1' },
      ]
    }
  };

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
        
        // 加载模型配置
        const modelConfigData = await invoke('getModelConfig');
        setModelConfig(modelConfigData);
        
        console.log('配置加载成功:', config);
        console.log('模型配置加载成功:', modelConfigData);
      } catch (error) {
        console.error('加载配置失败:', error);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  // 处理API配置输入变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setApiConfig(prev => ({...prev, [name]: value}));
    setIsSaved(false);
  };

  // 处理模型配置变化
  const handleModelConfigChange = (field, value) => {
    setModelConfig(prev => ({...prev, [field]: value}));
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
      console.log('准备保存的模型配置:', modelConfig);
      
      // 保存API配置到localStorage
      const saveResult = await invoke('saveApiConfig', apiConfig);
      
      // 保存模型配置到localStorage
      const saveModelResult = await invoke('saveModelConfig', modelConfig);
      
      if (saveResult && saveModelResult) {
        // 尝试发送配置到后端
        try {
          await invoke('sendConfigToBackend', { ...apiConfig, ...modelConfig });
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
        throw new Error('保存配置失败');
      }
    } catch (error) {
      console.error('保存配置失败:', error.message);
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
    APPID: '（必配）科大讯飞文字识别APPID，用于访问文字识别服务。登录后在控制台>文字识别>通用文档识别（大模型）中获取',
    APISecret: '（必配）科大讯飞文字识别APISecret，用于访问文字识别服务',
    APIKEY: '（必配）科大讯飞文字识别APIKEY，用于访问文字识别服务',
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
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600">加载配置中...</span>
        </div>
      </div>
    );
  }

  const currentProvider = providers[modelConfig.model_provider];
  const currentApiKeyField = currentProvider?.api_key_field;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-indigo-700">API配置</h1>
          <p className="mt-2 text-gray-600">
            在此页面配置各种API密钥和模型选择，这些配置将用于访问相应的服务。
          </p>
        </div>
        <button
          onClick={() => window.open('/docs/api-config', '_blank')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>帮助文档</span>
        </button>
      </div>

      {/* 模型配置部分 */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-indigo-600">模型配置</h2>
        
        {/* 服务商选择 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择服务商
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(providers).map(([key, provider]) => (
              <button
                key={key}
                onClick={() => handleModelConfigChange('model_provider', key)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  modelConfig.model_provider === key
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">{provider.name}</div>
                <div className="text-xs text-gray-500 mt-1">{provider.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 模型选择 */}
        {currentProvider && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择模型
            </label>
            <select
              value={modelConfig.model_name}
              onChange={(e) => handleModelConfigChange('model_name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {currentProvider.models.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              当前选择: {currentProvider.name} - {currentProvider.models.find(m => m.value === modelConfig.model_name)?.label}
            </p>
          </div>
        )}

        {/* 当前服务商的API密钥输入 */}
        {currentApiKeyField && (
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <label htmlFor={currentApiKeyField} className="font-medium text-gray-700">
                {currentProvider.name} API密钥
              </label>
              <a 
                href={configLinks[currentApiKeyField]} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                获取密钥
              </a>
            </div>
            <p className="text-sm text-gray-500 mb-2">{configDescriptions[currentApiKeyField]}</p>
            <div className="relative">
              <input
                type={showPassword[currentApiKeyField] ? 'text' : 'password'}
                id={currentApiKeyField}
                name={currentApiKeyField}
                value={apiConfig[currentApiKeyField] || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                placeholder={`输入${currentApiKeyField}`}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility(currentApiKeyField)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword[currentApiKeyField] ? (
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
        )}
      </div>

      {/* API配置部分 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-indigo-600">其他API配置</h2>
        <div className="space-y-6">
          {/* 星火大模型必配项 */}
          {['APPID', 'APISecret', 'APIKEY'].map((key) => (
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
                  value={apiConfig[key] || ''}
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
          
          {/* 其他API配置项 */}
          {Object.entries(apiConfig).filter(([key]) => !['APPID', 'APISecret', 'APIKEY'].includes(key)).map(([key, value]) => (
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
        </div>
      </div>

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
  );
}