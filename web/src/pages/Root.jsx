import React, { useCallback, useState, useEffect } from 'react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import PipelinePage from '../features/pipeline/PipelinePage';
import KgPreviewPage from '../features/kg-preview/KgPreviewPage';
import reactLogo from '../assets/react.svg';
import thucs from '../assets/cs.jpg';

export default function Root() {
  const [showGuide, setShowGuide] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  
  // 检查是否已经显示过引导框
  useEffect(() => {
    const hasShownGuide = localStorage.getItem('sparklearn_guide_shown');
    if (!hasShownGuide) {
      setShowGuide(true);
    }
  }, []);
  
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  // 引导步骤
  const guideSteps = [
    {
      title: "欢迎使用 SparkLearn",
      content: "这是一个智能知识图谱构建工具，可以帮助您从文档中提取知识并构建可视化图谱，还能生成相关的练习题。",
      action: "下一步"
    },
    {
      title: "第一步：配置处理流程",
      content: "1. 选择输入文件或文件夹（支持PDF、Word、PPT、TXT等格式）\n2. 选择输出目录保存处理结果\n3. 勾选需要执行的步骤（可以一次性勾选所有步骤）\n4. 点击'开始处理'按钮\n\n系统会自动按顺序执行：文档预处理 → 知识增广 → 构建知识图谱",
      action: "下一步"
    },
    {
      title: "第二步：查看处理进度",
      content: "1. 在进度条中查看当前执行步骤\n2. 在日志区域查看详细处理信息\n3. 系统会自动跳过已完成的步骤\n4. 等待所有步骤完成\n\n处理时间取决于文档大小，大文档可能需要几分钟。",
      action: "下一步"
    },
    {
      title: "第三步：查看知识图谱",
      content: "1. 处理完成后，在'知识图谱预览'区域查看生成的图谱\n2. 可以放大、缩小、拖拽查看不同部分\n3. 点击节点查看详细信息\n4. 图谱会自动保存为图片格式（可在输出文件夹/tree/graph/下找到）\n\n这里展示了所有提取的概念和它们之间的关联关系。",
      action: "下一步"
    },
    {
      title: "第四步：选择概念生成题目",
      content: "1. 在知识图谱中点击感兴趣的概念节点\n2. 或者在下拉菜单中选择特定概念\n3. 选择题目类型（选择题、填空题、简答题等）\n4. 设置题目数量和难度\n5. 点击'生成题目'按钮\n\n系统会根据选中的概念自动生成相关的练习题。",
      action: "下一步"
    },
    {
      title: "第五步：查看和导出题目",
      content: "1. 查看生成的题目列表\n2. 可以编辑或删除不满意的题目\n3. 点击'导出题目'保存为文件\n4. 支持多种格式：Word、PDF、JSON等\n\n生成的题目可以直接用于教学或学习测试。",
      action: "下一步"
    },
    {
      title: "注意事项和技巧",
      content: "• 建议先处理小文档测试流程\n• 如遇错误请查看详细日志信息\n• 可以随时跳过已完成的步骤\n• 生成的图谱和题目都可以重复使用\n• 支持批量处理多个文档\n• 可以点击右上角'重新引导'按钮重新查看此说明",
      action: "开始使用"
    }
  ];

  const nextGuideStep = () => {
    if (guideStep < guideSteps.length - 1) {
      setGuideStep(guideStep + 1);
    } else {
      // 完成引导，记录到本地存储
      localStorage.setItem('sparklearn_guide_shown', 'true');
      setShowGuide(false);
    }
  };

  const prevGuideStep = () => {
    if (guideStep > 0) {
      setGuideStep(guideStep - 1);
    }
  };

  const skipGuide = () => {
    // 跳过引导，也记录到本地存储
    localStorage.setItem('sparklearn_guide_shown', 'true');
    setShowGuide(false);
  };

  const resetGuide = () => {
    // 重置引导，清除本地存储记录
    localStorage.removeItem('sparklearn_guide_shown');
    setGuideStep(0);
    setShowGuide(true);
  };

  //粒子效果配置
  const particlesOptions = {
    particles: {
      number: {
        value: 110,
        density: {
          enable: true,
          area: 800
        }
      },
      color: {
        value: ["#4F46E5", "#818CF8", "#C7D2FE", "#A5B4FC"]
      },
      shape: {
        type: "circle",
      },
      opacity: {
        value: {
          min: 0.1,
          max: 0.5
        },
        animation: {
          enable: true,
          speed: 1,
          sync: false
        }
      },
      size: {
        value: {
          min: 1,
          max: 3
        }
      },
      links: {
        enable: true,
        distance: 150,
        color: "#818CF8",
        opacity: 0.3,
        width: 1
      },
      move: {
        enable: true,
        speed: 1,
        direction: "none",
        random: true,
        straight: false,
        outModes: {
          default: "out"
        }
      }
    },
    interactivity: {
      detectsOn: "canvas",
      events: {
        onHover: {
          enable: true,
          mode: "grab"
        },
        onClick: {
          enable: true,
          mode: "push"
        },
        resize: true
      },
      modes: {
        grab: {
          distance: 140,
          links: {
            opacity: 1
          }
        },
        push: {
          quantity: 4
        }
      }
    },
    detectRetina: true
  };

  return (
    <div className="relative min-h-screen" style={{ minHeight: '100vh' }}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesOptions}
        className="absolute inset-0 -z-10"
        style={{ marginTop:'74px', height: 'calc(100vh - 64px)' }}
      />

      {/* 引导对话框 */}
      {showGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-indigo-700">{guideSteps[guideStep].title}</h2>
            <div className="text-gray-700 mb-6 whitespace-pre-line">{guideSteps[guideStep].content}</div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <button
                  onClick={prevGuideStep}
                  className="text-gray-500 hover:text-gray-700 text-sm mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={guideStep === 0}
                >
                  上一步
                </button>
                <button
                  onClick={skipGuide}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  跳过引导
                </button>
              </div>
              <button
                onClick={nextGuideStep}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                {guideSteps[guideStep].action}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative max-w-6xl mx-auto p-4 z-10">
        <div className="flex justify-center items-center mb-8">
          <a href="https://www.cs.tsinghua.edu.cn/" target="_blank" rel="noopener noreferrer">
            <img src={thucs} className="logo" alt="ThuCS logo" style={{ height: 50, width: 50 }} />
          </a>
          <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
            <img
              src={reactLogo}
              className="logo react"
              alt="React logo"
              style={{ height: 50, width: 50, marginLeft: 50 }}
            />
          </a>
        </div>

        <div className="flex justify-center mb-10 relative">
          <span className="text-4xl font-bold">SparkLearn 知识图谱工具</span>
          <button
            onClick={resetGuide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 hover:text-indigo-600 px-3 py-1 rounded border border-gray-300 hover:border-indigo-300 transition-colors"
            title="重新显示引导"
          >
            重新引导
          </button>
        </div>
        <div className="space-y-8">
          <PipelinePage />
          
          <KgPreviewPage />
        </div>
      </div>
    </div>
  );
}