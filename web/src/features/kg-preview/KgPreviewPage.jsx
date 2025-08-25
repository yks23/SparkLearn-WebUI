import { useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { ChevronDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useApp } from '../../stores/appStore';
import { invoke } from '../../utils/ipc';
import path from 'path-browserify';
export default function KgQaPage() {
  const { state: s, dispatch } = useApp();
  const containerRef = useRef(null);
  const fgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const isInitialized = useRef(false);
  const [physicsConfig, setPhysicsConfig] = useState({
    linkDistance: 65,
    nodefontSize: 17,
    edgefontSize: 14,
    lineWidth: 3,
    nodeBaseSize: 2,
  });
  const [selectNeighborsMode, setSelectNeighborsMode] = useState(false);
  const [removeNeighborsMode, setRemoveNeighborsMode] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [randomK, setRandomK] = useState(3); // 默认随机选择3个节点
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [savedPath, setSavedPath] = useState('');
  const handleLinkHover = (link, prevLink) => {
    setHoveredLink(link);
  };
  const loadKnowledgeGraph = async () => {
    if (!s.outputPath) {
      setError('请先运行处理流程生成知识图谱');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const result = await invoke('getKnowledgeGraph', {
        output_path: s.outputPath
      });
      
      if (result.success) {
        setGraphData(result.data);
        setHasLoaded(true);
        const graphPath = path.join(s.outputPath, 'tree','graph');
        console.log('graphPath:', graphPath);
        const concepts = result.data.nodes.map(node => node.name);
        dispatch({ type: 'setConcepts', payload: concepts });
        dispatch({ type: 'setGraph', payload: graphPath });
        // // 重置 Pipeline 完成状态
        // dispatch({ type: 'setPipelineCompleted', payload: false });
      } else {
        setError(result.error || '加载知识图谱失败');
      }
    } catch (err) {
      setError(err.message || '加载知识图谱时发生错误');
      console.error('加载知识图谱失败:', err);
    } finally {
      setLoading(false);
    }
  };
  //自动加载知识图谱
  useEffect(() => {
    if (s.graphPath !='' && !hasLoaded) {
      loadKnowledgeGraph();
    }
  }, [s.graphPath, hasLoaded]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!fgRef.current) return;
    fgRef.current.d3Force('link').distance(physicsConfig.linkDistance);
    fgRef.current.d3ReheatSimulation();
  }, [physicsConfig]);

  useEffect(() => {
    if (fgRef.current && !isInitialized.current) {
      fgRef.current.d3Force('link').distance(physicsConfig.linkDistance);
      fgRef.current.d3ReheatSimulation();
      isInitialized.current = true;
    }
  }, [fgRef.current, dimensions]);

  const updatePhysicsParam = (key, value) => {
    setPhysicsConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // const drawDirectedLink = (link, ctx, globalScale) => {
  //   const sourceRadius = Math.sqrt(link.source.val) * physicsConfig.nodeBaseSize;
  //   const targetRadius = Math.sqrt(link.target.val) * physicsConfig.nodeBaseSize;
  //   const dx = link.target.x - link.source.x;
  //   const dy = link.target.y - link.source.y;
  //   const length = Math.sqrt(dx * dx + dy * dy);
  //   const ux = dx / length;
  //   const uy = dy / length;
  //   const startX = link.source.x + ux * sourceRadius;
  //   const startY = link.source.y + uy * sourceRadius;
  //   const endX = link.target.x - ux * targetRadius;
  //   const endY = link.target.y - uy * targetRadius;

  //   ctx.beginPath();
  //   ctx.moveTo(startX, startY);
  //   ctx.lineTo(endX, endY);
  //   ctx.strokeStyle = '#999';
  //   ctx.lineWidth = physicsConfig.lineWidth / globalScale;
  //   ctx.stroke();

  //   const arrowLength = 4.1 * physicsConfig.lineWidth / globalScale;
  //   const arrowWidth = 2.5 * physicsConfig.lineWidth / globalScale;
  //   ctx.beginPath();
  //   ctx.moveTo(endX, endY);
  //   ctx.lineTo(
  //     endX - arrowLength * ux - arrowWidth * uy,
  //     endY - arrowLength * uy + arrowWidth * ux
  //   );
  //   ctx.lineTo(
  //     endX - arrowLength * ux + arrowWidth * uy,
  //     endY - arrowLength * uy - arrowWidth * ux
  //   );
  //   ctx.closePath();
  //   ctx.fillStyle = '#999';
  //   ctx.fill();

  //   const midX = (startX + endX) / 2;
  //   const midY = (startY + endY) / 2;
  //   const offsetPixels = 15 / globalScale;
  //   const offsetX = -uy * offsetPixels;
  //   const offsetY = ux * offsetPixels;
  //   const labelX = midX + offsetX;
  //   const labelY = midY + offsetY;
  //   const label = link.label;
  //   const fontSize = physicsConfig.edgefontSize / globalScale;
  //   // 使用支持中文的字体
  //   ctx.font = `${fontSize}px 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'SimHei', 'Arial Unicode MS', sans-serif`;
  //   ctx.textAlign = 'center';
  //   ctx.textBaseline = 'middle';
  //   ctx.fillStyle = '#333';
  //   ctx.fillText(label, labelX, labelY);
  // };

  const handleNodeClick = (node) => {
    if (selectNeighborsMode) {
      // 邻居选择模式 - 只添加不删除
      const neighborIds = new Set();
      
      // 添加当前节点
      neighborIds.add(node.id);
      
      // 添加所有邻居节点
      graphData.links.forEach(link => {
        if (link.source.id === node.id) neighborIds.add(link.target.id);
        if (link.target.id === node.id) neighborIds.add(link.source.id);
      });
      
      // 创建新节点集合（使用Set确保唯一）
      const newNodesSet = new Set([...selectedNodes.map(n => n.id), ...neighborIds]);
      
      // 转换为节点对象数组
      const newSelectedNodes = graphData.nodes.filter(n => newNodesSet.has(n.id));
      
      setSelectedNodes(newSelectedNodes);
    } else if (removeNeighborsMode) {
      // 去除邻居模式 - 移除该节点及其所有邻居
      const neighborIds = new Set();
      
      // 添加当前节点
      neighborIds.add(node.id);
      
      // 添加所有邻居节点
      graphData.links.forEach(link => {
        if (link.source.id === node.id) neighborIds.add(link.target.id);
        if (link.target.id === node.id) neighborIds.add(link.source.id);
      });
      
      // 从已选节点中移除这些节点
      setSelectedNodes(prev => 
        prev.filter(n => !neighborIds.has(n.id)));
    } else {
      // 单个节点选择 - 正常切换
      const index = selectedNodes.findIndex(n => n.id === node.id);
      if (index !== -1) {
        // 如果已选择则移除
        const newSelectedNodes = [...selectedNodes];
        newSelectedNodes.splice(index, 1);
        setSelectedNodes(newSelectedNodes);
      } else {
        // 如果未选择则添加
        setSelectedNodes([...selectedNodes, node]);
      }
    }
  };

  // 随机选择k个节点
  const handleRandomSelect = () => {
    if (graphData.nodes.length === 0) return;
    
    // 计算实际要选择的节点数（不能超过总节点数）
    const k = Math.min(randomK, graphData.nodes.length);
    
    // 打乱节点数组
    const shuffled = [...graphData.nodes].sort(() => 0.5 - Math.random());
    
    // 选择前k个节点
    const randomNodes = shuffled.slice(0, k);
    
    setSelectedNodes(randomNodes);
  };

  const generate = async (e) => {
    e.preventDefault();
    if (selectedNodes.length === 0) return;

    setGenerating(true);
    setSavedPath('');

    try {
      const concepts = selectedNodes.map(node => node.name);
      const result = await invoke('generateQA', {
        graphPath: s.graphPath,
        concepts,
        difficulty: new FormData(e.target).get('difficulty'),
        output: s.outputPath,
      });

      if (result.success) {
        setSavedPath(path.join(s.outputPath, 'QA'));
      } else {
        setError(result.error || '生成题目失败');
      }
    } catch (err) {
      setError(err.message || '生成题目时发生错误');
    } finally {
      setGenerating(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6 text-indigo-700">知识图谱与题目生成</h1>
      
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">知识图谱预览</h2>
        <div className="flex gap-2">
          {/* 添加重新加载按钮 */}
          <button
            type="button"
            onClick={loadKnowledgeGraph}
            disabled={loading}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md disabled:opacity-50 flex items-center"
          >
            <ArrowPathIcon className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            {loading ? '加载中...' : '重新加载图谱'}
          </button>

          <button
            type="button"
            className={`px-3 py-1 text-sm rounded-md ${
              selectNeighborsMode
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => {
              setSelectNeighborsMode(!selectNeighborsMode);
              setRemoveNeighborsMode(false); // 关闭其他模式
            }}
          >
            选择所有邻居
            {selectNeighborsMode && <span className="ml-1">✓</span>}
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-sm rounded-md ${
              removeNeighborsMode
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => {
              setRemoveNeighborsMode(!removeNeighborsMode);
              setSelectNeighborsMode(false); // 关闭其他模式
            }}
          >
            去除所有邻居
            {removeNeighborsMode && <span className="ml-1">✓</span>}
          </button>
          <button
            type="button"
            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md"
            onClick={() => setSelectedNodes([])}
          >
            清空选择
          </button>
          {/* 随机选择控件 */}
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="1"
              max={graphData.nodes.length}
              value={randomK}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value > 0) {
                  setRandomK(Math.min(value, graphData.nodes.length));
                }
              }}
              className="w-12 px-1 py-1 border border-gray-300 rounded text-sm text-center"
            />
            <button
              type="button"
              className="px-2 py-1 bg-gray-200 text-gray-700 text-sm rounded-md"
              onClick={handleRandomSelect}
            >
              随机选择
            </button>
          </div>
        </div>
        
      </div>
      {/* 添加加载状态和错误提示 */}
      {loading && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-700">正在加载知识图谱...</p>
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 rounded-lg">
          <p className="text-red-700">错误: {error}</p>
          <p className="text-sm mt-2">请确保已运行处理流程并生成了知识图谱</p>
        </div>
      )}
      <div className="mb-4 p-3 bg-gray-50/80 backdrop-blur-sm rounded-md border border-gray-200/50">
        <p className="text-sm text-gray-600">
          {selectNeighborsMode
            ? '点击节点将添加该节点及其所有邻居节点'
            : removeNeighborsMode
            ? '点击节点将移除该节点及其所有邻居节点'
            : '点击节点将其添加到知识点列表或移除'}
        </p>
        <p className="text-sm mt-1">
          已选知识点: 
          <span className="font-medium ml-2">
            {selectedNodes.length > 0 
              ? selectedNodes.map(n => n.name).join(', ') 
              : '无'}
          </span>
        </p>
      </div>
      
      {/* 物理参数配置控制条 */}
      <div className="mb-4 p-4 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/50">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">物理参数配置</h2>
        <div className="flex flex-row justify-around flex-wrap gap-4">
          <div className="min-w-[120px]">
            <label className="block text-sm mb-1">链接长度: {physicsConfig.linkDistance}px</label>
            <input 
              type="range" 
              min="20" max="500" 
              value={physicsConfig.linkDistance}
              onChange={e => updatePhysicsParam('linkDistance', +e.target.value)}
              className="w-full"
            />
          </div>
          <div className="min-w-[120px]">
            <label className="block text-sm mb-1">节点字号: {physicsConfig.nodefontSize}</label>
            <input 
              type="range" 
              min="8" max="30" 
              value={physicsConfig.nodefontSize}
              onChange={e => updatePhysicsParam('nodefontSize', +e.target.value)}
              className="w-full"
            />
          </div>
          <div className="min-w-[120px]">
            <label className="block text-sm mb-1">边字号: {physicsConfig.edgefontSize}</label>
            <input 
              type="range" 
              min="5" max="27" 
              value={physicsConfig.edgefontSize}
              onChange={e => updatePhysicsParam('edgefontSize', +e.target.value)}
              className="w-full"
            />
          </div>
          <div className="min-w-[120px]">
            <label className="block text-sm mb-1">边粗细: {physicsConfig.lineWidth}</label>
            <input 
              type="range" 
              min="1" max="6" 
              value={physicsConfig.lineWidth}
              onChange={e => updatePhysicsParam('lineWidth', +e.target.value)}
              className="w-full"
            />
          </div>
          <div className="min-w-[120px]">
            <label className="block text-sm mb-1">节点大小: {physicsConfig.nodeBaseSize}</label>
            <input 
              type="range" 
              min="0.5" max="10" step="0.1"
              value={physicsConfig.nodeBaseSize}
              onChange={e => updatePhysicsParam('nodeBaseSize', +e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>
      
      <div ref={containerRef} className="border border-gray-200/50 rounded-lg overflow-hidden mb-8 bg-white/20 backdrop-blur-sm" style={{ height: '500px' }}>
        {dimensions.width > 0 && dimensions.height > 0 && (
          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            width={dimensions.width}
            height={dimensions.height}
            backgroundColor="transparent"
            nodeVal="val"
            nodeLabel={null}
            linkLabel={null}
            cooldownTicks={Infinity}
            nodePointerAreaPaint={null}
            onNodeClick={handleNodeClick}
            linkPointerAreaPaint={null}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const isSelected = selectedNodes.some(n => n.id === node.id);
              const radius = Math.sqrt(node.val) * physicsConfig.nodeBaseSize;
              
              // 绘制节点
              ctx.beginPath();
              ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
              ctx.fillStyle = isSelected ? '#FF6B6B' : '#69b3a2';
              ctx.fill();
              
              // 添加选中效果
              if (isSelected) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, radius + 3, 0, 2 * Math.PI, false);
                ctx.strokeStyle = '#FF6B6B';
                ctx.lineWidth = 2 / globalScale;
                ctx.stroke();
              }
              
              // 绘制节点标签
              const label = node.name;
              const fontSize = physicsConfig.nodefontSize / globalScale;
              // 使用支持中文的字体
              ctx.font = `${fontSize}px 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'SimHei', 'Arial Unicode MS', sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = isSelected ? '#C53030' : '#000';
              ctx.fillText(
                label,
                node.x,
                node.y + radius + fontSize + 1 / globalScale
              );
            }}
            linkCanvasObject={(link, ctx, globalScale) => {
                // 1. 画连线
                ctx.beginPath();
                ctx.moveTo(link.source.x, link.source.y);
                ctx.lineTo(link.target.x, link.target.y);
                ctx.strokeStyle = '#999';
                ctx.lineWidth = physicsConfig.lineWidth / globalScale;
                ctx.stroke();

                // 2. 画箭头（可选）
                const dx = link.target.x - link.source.x;
                const dy = link.target.y - link.source.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                if (len === 0) return;
                const ux = dx / len;
                const uy = dy / len;

                const endX = link.target.x - ux * (Math.sqrt(link.target.val) * physicsConfig.nodeBaseSize);
                const endY = link.target.y - uy * (Math.sqrt(link.target.val) * physicsConfig.nodeBaseSize);

                const arrowLen = 4.1 * physicsConfig.lineWidth / globalScale;
                const arrowW  = 2.5 * physicsConfig.lineWidth / globalScale;

                ctx.beginPath();
                ctx.moveTo(endX, endY);
                ctx.lineTo(endX - arrowLen * ux - arrowW * uy, endY - arrowLen * uy + arrowW * ux);
                ctx.lineTo(endX - arrowLen * ux + arrowW * uy, endY - arrowLen * uy - arrowW * ux);
                ctx.closePath();
                ctx.fillStyle = '#999';
                ctx.fill();

                // 3. 只有悬停时才画标签
                if (link === hoveredLink && link.label) {
                  const midX = (link.source.x + link.target.x) / 2;
                  const midY = (link.source.y + link.target.y) / 2;
                  const fontSize = physicsConfig.edgefontSize / globalScale;
                  ctx.font = `${fontSize}px 'PingFang SC', 'Microsoft YaHei', sans-serif`;
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillStyle = '#333';
                  ctx.fillText(link.label, midX, midY);
                }
              }}
          />
        )}
      </div>
      
      {/* 题目生成表单 */}
      <div className="bg-gray-50/80 backdrop-blur-sm p-6 rounded-lg border border-gray-200/50">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">题目生成</h2>
        <p className="mb-4 text-gray-600">
          使用选中的知识点生成题目
        </p>
        
        <form onSubmit={generate} className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-gray-300/50">
            <h3 className="font-medium text-gray-700 mb-2">已选知识点</h3>
            {selectedNodes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedNodes.map((node, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {node.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">请在图谱中选择知识点</p>
            )}
          </div>
          
          <Select name="difficulty" label="难度">
            <option>简单</option>
            <option>中等</option>
            <option>困难</option>
          </Select>
          
          <button
            type="submit"
            className={`btn w-full ${selectedNodes.length === 0 || generating ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={selectedNodes.length === 0 || generating}
          >
            {generating ? '正在生成题目...' : '生成题目'}
          </button>

          {savedPath && (
            <div className="mt-4 p-3 bg-green-50 rounded-md text-green-700">
              题目已保存到 <span className="font-semibold">{savedPath}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function Select({ name, label, children }) {
  return (
    <label className="block">
      <span className="font-medium text-gray-700 mb-2 block">{label}</span>
      <div className="relative">
        <select
          name={name}
          className="w-full border border-gray-300 rounded-md p-3 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {children}
        </select>
        <ChevronDownIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
      </div>
    </label>
  );
}