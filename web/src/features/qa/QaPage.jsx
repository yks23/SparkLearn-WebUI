import { useEffect } from 'react';
import { useApp } from '../../stores/appStore';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { invoke } from '../../utils/ipc';

export default function QaPage() {
  const { state: s, dispatch } = useApp();

  useEffect(() => {
    if (s.graphPath && s.concepts.length === 0) {
      invoke('listConcepts', s.graphPath).then(list =>
        dispatch({ type: 'setConcepts', payload: list }));
    }
  }, [s.graphPath]);

  const generate = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await invoke('generateQA', {
      graphPath: s.graphPath,
      concept: fd.get('concept'),
      difficulty: fd.get('difficulty'),
      output: s.outputPath,
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <h1 className="text-2xl font-bold mb-6 text-indigo-700">题目生成</h1>
      <p className="mb-6 text-gray-600">
        选择知识点和难度，生成相应的题目。
      </p>
      
      <form onSubmit={generate} className="space-y-6">
        <Select name="concept" label="知识点">
          {s.concepts.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>

        <Select name="difficulty" label="难度">
          <option>简单</option>
          <option>中等</option>
          <option>困难</option>
        </Select>

        <button className="btn w-full">生成</button>
      </form>
    </div>
  );
}

function Select({ name, label, children }) {
  return (
    <label className="block">
      <span className="font-medium text-gray-700 mb-2 block">{label}</span>
      <div className="relative">
        <select name={name}
          className="w-full border border-gray-300 rounded-md p-3 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {children}
        </select>
        <ChevronDownIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
      </div>
    </label>
  );
}