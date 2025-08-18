import { useState } from 'react';
import { FolderOpenIcon, PlayIcon, FolderIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useApp } from '../../stores/appStore';
import { invoke } from '../../utils/ipc';

export default function PipelinePage() {
  const { state: s, dispatch } = useApp();
  const [steps, setSteps] = useState({ preprocess: true, augment: true, tree: true });
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);

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

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog = { timestamp, message, type };
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
    addLog('开始处理...', 'info');
    
    try {
      await invoke('runPipeline', {
        input_path: s.inputPath,
        output_path: s.outputPath,
        steps: Object.keys(steps).filter(k => steps[k]),
      });
      addLog('处理完成！', 'success');
    } catch (error) {
      console.error('处理失败:', error);
      addLog('处理失败: ' + error.message, 'error');
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

  return (
    <div className="max-w-2xl mx-auto p-8">
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
