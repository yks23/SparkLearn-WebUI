import { useEffect, useState } from 'react';
import { useApp } from '../../stores/appStore';
import { invoke } from '../../utils/ipc';

export default function KgPreviewPage() {
  const { state: s } = useApp();
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (s.graphPath) {
      setUrl(`http://localhost:3000/graph/${encodeURIComponent(s.graphPath)}/graph.png`);
    }
  }, [s.graphPath]);

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4">知识图谱预览</h1>
      {url
        ? <img src={url} alt="KG" className="border rounded flex-1 object-contain" />
        : <p className="text-slate-400">暂无图谱</p>}
    </div>
  );
}