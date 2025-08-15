import { useState } from 'react';
import { FolderOpenIcon, PlayIcon } from '@heroicons/react/24/outline';
import { useApp } from '../../stores/appStore';
import { invoke } from '../../utils/ipc';   //封装对后端的调用

export default function PipelinePage() {
  const { state: s, dispatch } = useApp();
  const [steps, setSteps] = useState({ preprocess: true, augment: true, tree: true });
  const [running, setRunning] = useState(false);

  const pickFolder = async () => {
    const path = await invoke('selectFolder');
    if (path) dispatch({ type: 'setOutput', payload: path });
  };
  const pickInput = async () => {
    const path = await invoke('selectInput');
    if (path) dispatch({ type: 'setInput', payload: path });
  };

  const run = async () => {
    setRunning(true);
    await invoke('runPipeline', {
      inputPath: s.inputPath,
      outputPath: s.outputPath,
      steps: Object.keys(steps).filter(k => steps[k]),
    });
    setRunning(false);
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
          <button onClick={pickFolder}
            className="btn"><FolderOpenIcon className="w-4 h-4 mr-2" />选择输出</button>
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