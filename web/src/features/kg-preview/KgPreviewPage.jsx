import { useMemo, useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export default function KgPreviewPage() {
  const containerRef = useRef(null);
  const fgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const isInitialized = useRef(false);
  const [physicsConfig, setPhysicsConfig] = useState({
    linkDistance: 65,
    chargeStrength: -30,
    centerStrength: 0.1,
    velocityDecay: 0.4,
    alphaDecay: 0.01,
    nodefontSize: 17, 
    edgefontSize: 14,  
    lineWidth: 3,
    nodeBaseSize: 2, 
  });

  const data = useMemo(() => ({
    nodes: [
      { id: '1', name: 'THUCS', val: 5},
      { id: '2', name: '清华大学', val: 7 },
      { id: '3', name: '海淀区', val: 10 },
    ],
    links: [
      { source: '1', target: '2', label: '属于' },
      { source: '2', target: '3', label: '位于' },
    ],
  }), []);

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
    fgRef.current.d3Force('charge').strength(physicsConfig.chargeStrength);
    fgRef.current.d3Force('center').strength(physicsConfig.centerStrength);
    fgRef.current.d3ReheatSimulation();
  }, [physicsConfig]);

  useEffect(() => {
    if (fgRef.current && !isInitialized.current) {
      fgRef.current.d3Force('link').distance(physicsConfig.linkDistance);
      fgRef.current.d3Force('charge').strength(physicsConfig.chargeStrength);
      fgRef.current.d3Force('center').strength(physicsConfig.centerStrength);
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

  const drawDirectedLink = (link, ctx, globalScale) => {
    const sourceRadius = Math.sqrt(link.source.val) * physicsConfig.nodeBaseSize;
    const targetRadius = Math.sqrt(link.target.val) * physicsConfig.nodeBaseSize;
    const dx = link.target.x - link.source.x;
    const dy = link.target.y - link.source.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const ux = dx / length;
    const uy = dy / length;
    const startX = link.source.x + ux * sourceRadius;
    const startY = link.source.y + uy * sourceRadius;
    const endX = link.target.x - ux * targetRadius;
    const endY = link.target.y - uy * targetRadius;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = '#999';
    ctx.lineWidth = physicsConfig.lineWidth / globalScale; 
    ctx.stroke();

    const arrowLength = 4.1*physicsConfig.lineWidth / globalScale;
    const arrowWidth = 2.5*physicsConfig.lineWidth / globalScale;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowLength * ux - arrowWidth * uy,
      endY - arrowLength * uy + arrowWidth * ux
    );
    ctx.lineTo(
      endX - arrowLength * ux + arrowWidth * uy,
      endY - arrowLength * uy - arrowWidth * ux
    );
    ctx.closePath();
    ctx.fillStyle = '#999';
    ctx.fill();

    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const offsetPixels = 15 / globalScale;
    const offsetX = -uy * offsetPixels;
    const offsetY = ux * offsetPixels;
    const labelX = midX + offsetX;
    const labelY = midY + offsetY;
    const label = link.label;
    const fontSize = physicsConfig.edgefontSize / globalScale; 
    ctx.font = `${fontSize}px 'Amiri', serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#333';
    ctx.fillText(label, labelX, labelY);
  };

  return (
    <div className="h-full flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-4">知识图谱预览</h1>
      
      <div className="mb-4 p-3 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">物理参数配置</h2>
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
            <label className="block text-sm mb-1">排斥力强度: {physicsConfig.chargeStrength}</label>
            <input 
              type="range" 
              min="-100" max="0" 
              value={physicsConfig.chargeStrength}
              onChange={e => updatePhysicsParam('chargeStrength', +e.target.value)}
              className="w-full"
            />
          </div>
          <div className="min-w-[120px]">
            <label className="block text-sm mb-1">中心力强度: {physicsConfig.centerStrength}</label>
            <input 
              type="range" 
              min="0" max="1" step="0.01"
              value={physicsConfig.centerStrength}
              onChange={e => updatePhysicsParam('centerStrength', +e.target.value)}
              className="w-full"
            />
          </div>
          <div className="min-w-[120px]">
            <label className="block text-sm mb-1">速度衰减: {physicsConfig.velocityDecay}</label>
            <input 
              type="range" 
              min="0" max="0.9" step="0.01"
              value={physicsConfig.velocityDecay}
              onChange={e => updatePhysicsParam('velocityDecay', +e.target.value)}
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
          {/* 新增：节点大小调节滑块 */}
          <div className="min-w-[120px]">
            <label className="block text-sm mb-1">节点大小: {physicsConfig.nodeBaseSize}</label>
            <input 
              type="range" 
              min="0.5" max="5" step="0.1"
              value={physicsConfig.nodeBaseSize}
              onChange={e => updatePhysicsParam('nodeBaseSize', +e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>
      
      <div ref={containerRef} className="flex-1 border rounded-lg overflow-hidden">
        {dimensions.width > 0 && dimensions.height > 0 && (
          <ForceGraph2D
            ref={fgRef}
            graphData={data}
            width={dimensions.width}
            height={dimensions.height}
            backgroundColor="#fafafa"
            nodeVal="val"
            nodeLabel={null}
            linkLabel={null} 
            d3VelocityDecay={physicsConfig.velocityDecay}
            d3AlphaDecay={physicsConfig.alphaDecay}
            cooldownTicks={Infinity}
            nodePointerAreaPaint={null}
            onNodeHover={null}
            onNodeClick={null}
            linkPointerAreaPaint={null}
            onLinkHover={null}
            onLinkClick={null}
            nodeCanvasObject={(node, ctx, globalScale) => {
              //节点半径
              const radius = Math.sqrt(node.val) * physicsConfig.nodeBaseSize;
              
              ctx.beginPath();
              ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
              ctx.fillStyle = '#69b3a2';
              ctx.fill();
              
              const label = node.name;
              const fontSize = physicsConfig.nodefontSize / globalScale;
              ctx.font = `${fontSize}px 'Amiri', serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = '#000';
              ctx.fillText(
                label, 
                node.x, 
                node.y + radius + fontSize + 1/globalScale
              );
            }}
            linkCanvasObject={drawDirectedLink}
          />
        )}
      </div>
    </div>
  );
}