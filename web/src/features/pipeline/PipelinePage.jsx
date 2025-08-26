import { useState } from 'react';
import { FolderOpenIcon, PlayIcon, FolderIcon, DocumentTextIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useApp } from '../../stores/appStore';
import { invoke } from '../../utils/ipc';
import ErrorNotification from '../../components/ErrorNotification';
import SmartProgressBar from '../../components/SmartProgressBar';
import ProgressStats from '../../components/ProgressStats';
import path from 'path-browserify';
export default function PipelinePage() {
  const { state: s, dispatch } = useApp();
  const [steps, setSteps] = useState({ preprocess: true, augment: true, tree: true });
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [errorNotification, setErrorNotification] = useState(null);

  // 获取文件大小（字节）
  const getFileSize = (path) => {
    try {
      if (!path) return 0;
      
      // 在Electron环境中，我们可以使用Node.js的fs模块
      if (window.electronAPI) {
        return window.electronAPI.getFileSize(path);
      }
      
      // 在Web环境中，我们可以尝试使用File API
      // 这里返回一个基于文件名的估算值
      const ext = path.split('.').pop()?.toLowerCase();
      const sizeEstimates = {
        'pdf': 2 * 1024 * 1024,    // 2MB
        'docx': 1.5 * 1024 * 1024, // 1.5MB
        'txt': 0.5 * 1024 * 1024,  // 0.5MB
        'md': 0.3 * 1024 * 1024,   // 0.3MB
        'html': 0.8 * 1024 * 1024, // 0.8MB
        'json': 0.2 * 1024 * 1024  // 0.2MB
      };
      
      return sizeEstimates[ext] || 1024 * 1024; // 默认1MB
    } catch (e) {
      console.warn('获取文件大小失败:', e);
      return 1024 * 1024; // 默认1MB
    }
  };

  // 获取文件类型
  const getFileType = (path) => {
    if (!path) return '';
    const ext = path.split('.').pop()?.toLowerCase();
    return ext || 'unknown';
  };

  // 错误处理映射
  const errorSolutions = {
    'auth_error': {
      title: 'API认证失败',
      description: '您的API密钥可能无效或已过期',
      solutions: [
        '前往"API配置"页面检查配置',
        '确认API密钥是否正确输入',
        '验证API密钥是否有效且未过期',
        '如果问题持续，请联系API服务提供商'
      ]
    },
    'quota_error': {
      title: 'API配额已用完',
      description: '您已达到API调用限制',
      solutions: [
        '等待一段时间后重试',
        '检查API使用配额',
        '考虑升级API计划',
        '减少并发请求数量'
      ]
    },
    'network_error': {
      title: '网络连接错误',
      description: '无法连接到API服务器',
      solutions: [
        '检查网络连接是否正常',
        '确认防火墙设置',
        '尝试使用VPN或代理',
        '稍后重试'
      ]
    },
    'file_error': {
      title: '文件操作错误',
      description: '文件路径或权限问题',
      solutions: [
        '检查文件路径是否正确',
        '确认文件是否存在',
        '检查文件访问权限',
        '确保磁盘空间充足'
      ]
    },
    'FileNotFoundError': {
      title: '文件未找到',
      description: '指定的文件或文件夹不存在',
      solutions: [
        '检查文件路径是否正确',
        '确认文件是否已被移动或删除',
        '重新选择输入文件'
      ]
    },
    'PermissionError': {
      title: '权限不足',
      description: '没有足够的权限访问文件或文件夹',
      solutions: [
        '以管理员身份运行程序',
        '检查文件夹权限设置',
        '确保文件没有被其他程序占用'
      ]
    },
    'TimeoutError': {
      title: '处理超时',
      description: '处理时间过长，可能由于文件过大或网络问题',
      solutions: [
        '尝试处理较小的文件',
        '检查网络连接',
        '稍后重试'
      ]
    },
    'default': {
      title: '未知错误',
      description: '发生了未预期的错误',
      solutions: [
        '重启应用程序',
        '检查系统资源是否充足',
        '联系技术支持并提供错误日志'
      ]
    }
  };

  // 获取错误解决方案
  const getErrorSolution = (errorMessage, errorType = null) => {
    // 首先检查是否有特定的错误类型
    if (errorType && errorSolutions[errorType]) {
      return errorSolutions[errorType];
    }
    
    // 然后检查错误消息中是否包含特定关键词
    for (const [errorType, solution] of Object.entries(errorSolutions)) {
      if (errorMessage.includes(errorType) || errorMessage.toLowerCase().includes(errorType.toLowerCase())) {
        return solution;
      }
    }
    return errorSolutions.default;
  };

  // 生成错误日志
  const generateErrorLog = (error, errorDetails = null) => {
    let solution;
    
    if (errorDetails && errorDetails.error_type) {
      solution = getErrorSolution(error.message, errorDetails.error_type);
    } else {
      solution = getErrorSolution(error.message);
    }
    
    const timestamp = new Date().toISOString();
    const errorLog = {
      timestamp,
      error: error.message,
      stack: error.stack,
      solution: solution,
      details: errorDetails
    };
    
    // 这里可以添加发送错误日志到服务器的逻辑
    console.log('错误日志:', errorLog);
    
    return solution;
  };

  // 创建隐藏的文件输入元素
  const createFileInput = (multiple = false, accept = '') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = multiple;
    if (accept) input.accept = accept;
    input.style.display = 'none';
    return input;
  };

  const createOutputFolder = async () => {
    try {
      // 使用后端API自动创建输出文件夹
      const result = await invoke('createOutputFolder');
      if (result.success) {
        dispatch({ type: 'setOutput', payload: result.path });
        addLog(`创建输出文件夹: ${result.folder_name} (${result.path})`);
        
        // 自动加载状态并设置步骤的默认选择
        try {
          const stateResult = await invoke('loadState', { output_path: result.path });
          if (stateResult.success) {
            const state = stateResult.state;
            // 根据状态设置步骤的默认选择：已完成的步骤默认不选择
            const newSteps = {
              preprocess: !state.preprocess,
              augment: !state.augment,
              tree: !state.tree
            };
            setSteps(newSteps);
            
            // 显示状态信息
            const completedSteps = Object.entries(state)
              .filter(([_, completed]) => completed)
              .map(([step, _]) => {
                const stepNames = { preprocess: '预处理', augment: '增广', tree: '知识树' };
                return stepNames[step];
              });
            
            if (completedSteps.length > 0) {
              addLog(`检测到已完成步骤: ${completedSteps.join(', ')}，已自动取消选择`, 'info');
            } else {
              addLog('未检测到已完成步骤，所有步骤默认选中', 'info');
            }
          }
        } catch (stateError) {
          console.warn('加载状态失败:', stateError);
          addLog('状态加载失败，使用默认设置', 'warning');
        }
      }
    } catch (error) {
      console.error('创建输出文件夹失败:', error);
      addLog('创建输出文件夹失败: ' + error.message, 'error');
    }
  };



  const pickInput = async () => {
    try {
      // 使用后端API选择文件或文件夹
      const path = await invoke('selectInput');
      if (path) {
        dispatch({ type: 'setInput', payload: path });
        addLog('选择输入: ' + path);
        
        // 自动创建输出文件夹
        await createOutputFolder();
      }
    } catch (error) {
      console.error('选择输入失败:', error);
      addLog('选择输入失败: ' + error.message, 'error');
    }
  };

  const openOutputFolder = async () => {
    if (!s.outputPath) {
      addLog('请先选择输出文件夹', 'warning');
      return;
    }
    
    try {
      await invoke('openFolder', { path: s.outputPath });
      addLog('打开输出文件夹: ' + s.outputPath);
    } catch (error) {
      console.error('打开文件夹失败:', error);
      addLog('打开文件夹失败: ' + error.message, 'error');
    }
  };

  const addLog = (message, type = 'info', details = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog = { timestamp, message, type, details };
    setLogs(prev => [...prev.slice(-9), newLog]); // 保持最近10条日志
  };

  const run = async () => {
    if (!s.inputPath) {
      addLog('请先选择输入路径', 'warning');
      return;
    }

    // 如果没有输出路径，自动创建
    if (!s.outputPath) {
      await createOutputFolder();
    }

    setRunning(true);
    dispatch({ type: 'setProgress', payload: { 
      percentage: 0, 
      currentStep: '初始化...', 
      estimatedTime: '计算中...',
      isRunning: true 
    }});
    addLog('开始处理...', 'info');
    
    try {
      // 智能进度更新 - 基于实际步骤
      let startTime = Date.now();
      const selectedSteps = Object.keys(steps).filter(k => steps[k]);
      const totalSteps = selectedSteps.length;
      let currentStepIndex = 0;
      
      const progressInterval = setInterval(() => {
        const currentProgress = s.progress.percentage;
        if (currentProgress < 90) {
          // 基于时间的平滑进度增长
          const timeElapsed = (Date.now() - startTime) / 1000; // 秒
          const estimatedTotalTime = totalSteps * 120; // 每个步骤预估2分钟
          const newProgress = Math.min(90, (timeElapsed / estimatedTotalTime) * 100);
          
          // 确保进度只增不减
          const finalProgress = Math.max(currentProgress, newProgress);
          
          // 根据进度确定当前步骤
          const stepProgress = finalProgress / totalSteps;
          currentStepIndex = Math.min(Math.floor(stepProgress), totalSteps - 1);
          
          const stepNames = {
            'preprocess': '🔧 预处理文件...',
            'augment': '🧠 文本增广...', 
            'tree': '🌳 构建知识树...'
          };
          
          const currentStep = stepNames[selectedSteps[currentStepIndex]] || '处理中...';
          
          // 更合理的预计时间计算
          const remainingTime = Math.max(1, Math.round((estimatedTotalTime - timeElapsed) / 60));
          
          dispatch({ type: 'setProgress', payload: { 
            percentage: finalProgress, 
            currentStep,
            estimatedTime: `${remainingTime}分钟`
          }});
        }
      }, 2000);

      // 启动后端处理
      const pipelinePromise = invoke('runPipeline', {
        input_path: s.inputPath,
        output_path: s.outputPath,
        steps: Object.keys(steps).filter(k => steps[k]),
      });
      
      // 等待处理完成
      await pipelinePromise;
      
      clearInterval(progressInterval);
      dispatch({ type: 'setProgress', payload: { 
        percentage: 100, 
        currentStep: '✅ 处理完成', 
        estimatedTime: '',
        isRunning: false 
      }});
      addLog('处理完成！', 'success');
      const graphPath = path.join(s.outputPath, 'tree','graph');
      console.log('graphPath:', graphPath);
      dispatch({
        type: 'setGraph',
        payload: graphPath
      });
    } catch (error) {
      console.error('处理失败:', error);
      
      // 检查是否是后端返回的详细错误信息
      let errorDetails = null;
      let errorMessage = error.message;
      
      if (error.response && error.response.data) {
        errorDetails = error.response.data;
        errorMessage = errorDetails.error || error.message;
      }
      
      const solution = generateErrorLog(error, errorDetails);
      
      // 显示错误通知
      setErrorNotification({
        title: solution.title,
        description: errorDetails?.details || solution.description,
        solutions: errorDetails?.solutions || solution.solutions,
        originalError: errorMessage,
        errorType: errorDetails?.error_type
      });
      
      addLog(`处理失败: ${solution.title}`, 'error', {
        description: errorDetails?.details || solution.description,
        solutions: errorDetails?.solutions || solution.solutions,
        originalError: errorMessage,
        errorType: errorDetails?.error_type
      });
      dispatch({ type: 'setProgress', payload: { 
        percentage: 0, 
        currentStep: '处理失败', 
        estimatedTime: '',
        isRunning: false 
      }});
    } finally {
      setRunning(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const loadState = async () => {
    if (!s.outputPath) {
      addLog('请先选择输出文件夹', 'warning');
      return;
    }
    
    try {
      const stateResult = await invoke('loadState', { output_path: s.outputPath });
      if (stateResult.success) {
        const state = stateResult.state;
        // 根据状态设置步骤的默认选择：已完成的步骤默认不选择
        const newSteps = {
          preprocess: !state.preprocess,
          augment: !state.augment,
          tree: !state.tree
        };
        setSteps(newSteps);
        
        // 显示状态信息
        const completedSteps = Object.entries(state)
          .filter(([_, completed]) => completed)
          .map(([step, _]) => {
            const stepNames = { preprocess: '预处理', augment: '增广', tree: '知识树' };
            return stepNames[step];
          });
        
        if (completedSteps.length > 0) {
          addLog(`重新加载状态 - 已完成步骤: ${completedSteps.join(', ')}，已自动取消选择`, 'info');
        } else {
          addLog('重新加载状态 - 未检测到已完成步骤，所有步骤默认选中', 'info');
        }
      }
    } catch (error) {
      console.error('加载状态失败:', error);
      addLog('状态加载失败: ' + error.message, 'error');
    }
  };

  const handleErrorAction = (action) => {
    if (action === 'goToConfig') {
      // 导航到API配置页面
      window.location.href = '/api-config';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      {/* 错误通知 */}
      <ErrorNotification 
        error={errorNotification}
        onClose={() => setErrorNotification(null)}
        onAction={handleErrorAction}
      />
      <h1 className="text-2xl font-bold mb-6 text-indigo-700">处理流程</h1>

      <div className="space-y-6">
        <PathCard title="输入">
          <button onClick={pickInput}
            className="btn"><FolderOpenIcon className="w-4 h-4 mr-2" />选择输入</button>
          <p className="text-sm text-slate-600 mt-1">{s.inputPath || '未选择'}</p>
          <p className="text-xs text-gray-500 mt-1">
            如需选择文件，请直接点击；如需选择文件夹，请取消第一个选择框后选择。
          </p>
        </PathCard>

        <PathCard title="输出">
          <div className="flex gap-2">
            {s.outputPath && (
              <button onClick={openOutputFolder}
                className="btn-secondary"><FolderIcon className="w-4 h-4 mr-2" />查看文件夹</button>
            )}
          </div>
          <p className="text-sm text-slate-600 mt-1">{s.outputPath || '未创建'}</p>
          <p className="text-xs text-gray-500 mt-1">
            选择输入路径或开始处理时会自动创建带时间戳的文件夹
          </p>
        </PathCard>

        <PathCard title="步骤">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">选择要执行的步骤（已完成的步骤默认不选择）</span>
            {s.outputPath && (
              <button onClick={loadState} className="text-sm text-indigo-600 hover:text-indigo-800">
                重新加载状态
              </button>
            )}
          </div>
          {Object.entries(steps).map(([k, v]) => {
            const stepNames = { 
              preprocess: '预处理原始文件', 
              augment: '增广文本', 
              tree: '构建知识树结构' 
            };
            const stepDescriptions = {
              preprocess: '将各种格式的文档（PDF、Word、PPT等）转换为Markdown格式，提取文本内容',
              augment: '使用AI模型对文本进行增广，生成更多相关内容和知识点',
              tree: '基于增广后的文本构建知识图谱，生成可视化的知识树结构'
            };
            return (
              <div key={k} className="p-3 rounded border border-gray-200 hover:bg-gray-50">
                <label className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    checked={v}
                    onChange={e => setSteps({ ...steps, [k]: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{stepNames[k]}</div>
                    <div className="text-xs text-gray-500 mt-1">{stepDescriptions[k]}</div>
                  </div>
                </label>
              </div>
            );
          })}
        </PathCard>

        <button disabled={running} onClick={run}
          className="btn w-full">
          <PlayIcon className="w-4 h-4 mr-2" />
          {running ? '处理中...' : '开始处理'}
        </button>

        {/* 智能进度条 */}
        {s.progress.isRunning && (
          <SmartProgressBar
            isRunning={s.progress.isRunning}
            percentage={s.progress.percentage}
            currentStep={s.progress.currentStep}
            estimatedTime={s.progress.estimatedTime}
            fileSize={s.inputPath ? getFileSize(s.inputPath) : 0}
            fileType={s.inputPath ? getFileType(s.inputPath) : ''}
            inputPath={s.inputPath}
          />
        )}

        {/* 进度统计 */}
        <ProgressStats />

        {/* 日志栏 */}
        <div className="bg-gray-50/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800 flex items-center">
              <DocumentTextIcon className="w-4 h-4 mr-2" />
              进度日志
            </h2>
            {logs.length > 0 && (
              <button onClick={clearLogs} className="text-sm text-gray-500 hover:text-gray-700">
                清空
              </button>
            )}
          </div>
          
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-sm text-gray-500">暂无日志</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`text-xs p-2 rounded ${
                  log.type === 'error' ? 'bg-red-50/80 text-red-700' :
                  log.type === 'warning' ? 'bg-yellow-50/80 text-yellow-700' :
                  log.type === 'success' ? 'bg-green-50/80 text-green-700' :
                  'bg-blue-50/80 text-blue-700'
                }`}>
                  <span className="font-mono text-gray-500">[{log.timestamp}]</span> {log.message}
                  
                  {/* 详细错误信息 */}
                  {log.type === 'error' && log.details && (
                    <div className="mt-2 p-2 bg-red-100/50 rounded border border-red-200">
                      <div className="flex items-start gap-2 mb-2">
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-red-800">{log.details.description}</p>
                          <p className="text-xs text-red-600 mt-1">原始错误: {log.details.originalError}</p>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-xs font-medium text-red-800 mb-1">解决方案:</p>
                        <ul className="text-xs text-red-700 space-y-1">
                          {log.details.solutions.map((solution, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-red-500">•</span>
                              <span>{solution}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                        <div className="flex items-center gap-2">
                          <InformationCircleIcon className="w-4 h-4 text-red-600" />
                          <span className="text-xs text-red-700">错误日志已自动记录，如需技术支持请提供此信息</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
function PathCard({ title, children }) {
  return (
    <div className="bg-gray-50/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
      <h2 className="font-semibold mb-3 text-gray-800">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
