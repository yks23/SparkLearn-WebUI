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
      content: "这是一个知识图谱构建工具，可以帮助您从文档中提取知识并构建可视化图谱。",
      action: "下一步"
    },
    {
      title: "基本使用流程",
      content: "1. 选择输入文件或文件夹\n2. 选择要执行的步骤\n3. 点击开始处理\n4. 查看进度日志",
      action: "下一步"
    },
    {
      title: "注意事项",
      content: "• 支持PDF、Word、PPT等格式\n• 处理时间取决于文档大小\n• 如遇错误请查看详细日志",
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
              <button
                onClick={skipGuide}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                跳过引导
              </button>
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