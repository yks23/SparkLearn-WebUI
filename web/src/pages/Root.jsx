import React, { useCallback } from 'react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import PipelinePage from '../features/pipeline/PipelinePage';
import KgPreviewPage from '../features/kg-preview/KgPreviewPage';
import reactLogo from '../assets/react.svg';
import thucs from '../assets/cs.jpg';

export default function Root() {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

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

        <div className="flex justify-center mb-10">
          <span className="text-4xl font-bold">SparkLearn 知识图谱工具</span>
        </div>
        <div className="space-y-8">
          <PipelinePage />
          
          <KgPreviewPage />
        </div>
      </div>
    </div>
  );
}