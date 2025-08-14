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
    <form onSubmit={generate} className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">题目生成</h1>

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
  );
}

function Select({ name, label, children }) {
  return (
    <label className="block">
      <span className="font-medium">{label}</span>
      <div className="relative">
        <select name={name}
          className="w-full border rounded p-2 appearance-none pr-8">
          {children}
        </select>
        <ChevronDownIcon className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </label>
  );
}