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

  const pickFolder = async () => {
    try {
      // 使用后端API选择文件夹
      const path = await invoke('selectFolder');
      if (path) {
        dispatch({ type: 'setOutput', payload: path });
        addLog('选择输出文件夹: ' + path);
      }
    } catch (error) {
      console.error('选择文件夹失败:', error);
      addLog('选择文件夹失败: ' + error.message, 'error');
    }
  };

  const pickInput = async () => {
    try {
      // 使用后端API选择文件或文件夹
      const path = await invoke('selectInput');
      if (path) {
        dispatch({ type: 'setInput', payload: path });
        addLog('选择输入: ' + path);
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
    if (!s.inputPath || !s.outputPath) {
      addLog('请先选择输入和输出路径', 'warning');
      return;
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

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <h1 className="text-2xl font-bold mb-6 text-indigo-700">处理流程</h1>

      <div className="space-y-6">
        <PathCard title="输入">
          <button onClick={pickInput}
            className="btn"><FolderOpenIcon className="w-4 h-4 mr-2" />选择输入</button>
          <p className="text-sm text-slate-600 mt-1">{s.inputPath || '未选择'}</p>
        </PathCard>

        <PathCard title="输出">
          <div className="flex gap-2">
            <button onClick={pickFolder}
              className="btn"><FolderOpenIcon className="w-4 h-4 mr-2" />选择输出</button>
            {s.outputPath && (
              <button onClick={openOutputFolder}
                className="btn-secondary"><FolderIcon className="w-4 h-4 mr-2" />打开</button>
            )}
          </div>
          <p className="text-sm text-slate-600 mt-1">{s.outputPath || '未选择'}</p>
        </PathCard>

        <PathCard title="步骤">
          {Object.entries(steps).map(([k, v]) => (
            <label key={k} className="flex items-center gap-2">
              <input type="checkbox" checked={v}
                onChange={e => setSteps({ ...steps, [k]: e.target.checked })} />
              {k}
            </label>
          ))}
        </PathCard>

        <button disabled={running} onClick={run}
          className="btn w-full">
          <PlayIcon className="w-4 h-4 mr-2" />
          {running ? '处理中...' : '开始处理'}
        </button>

        {/* 日志栏 */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
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
                  log.type === 'error' ? 'bg-red-50 text-red-700' :
                  log.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                  log.type === 'success' ? 'bg-green-50 text-green-700' :
                  'bg-blue-50 text-blue-700'
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
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h2 className="font-semibold mb-3 text-gray-800">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}