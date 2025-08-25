import React, { useState, useEffect } from 'react';

// 进度统计组件
export default function ProgressStats() {
  const [stats, setStats] = useState({
    totalRuns: 0,
    stepCount: 0,
    avgTime: 0
  });

  useEffect(() => {
    // 从localStorage加载历史数据
    const savedHistory = localStorage.getItem('progressHistory');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        const stepTimes = history.stepTimes || {};
        
        // 计算统计信息
        const totalRuns = history.totalRuns || 0;
        const stepCount = Object.keys(stepTimes).length;
        
        // 计算平均时间
        let totalTime = 0;
        let timeCount = 0;
        Object.values(stepTimes).forEach(times => {
          times.forEach(time => {
            totalTime += time;
            timeCount++;
          });
        });
        
        const avgTime = timeCount > 0 ? Math.round(totalTime / timeCount) : 0;
        
        setStats({
          totalRuns,
          stepCount,
          avgTime
        });
      } catch (e) {
        console.warn('历史数据加载失败:', e);
      }
    }
  }, []);

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}秒`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds}秒`;
  };

  if (stats.totalRuns === 0) {
    return null; // 没有历史数据时不显示
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        📊 学习统计
      </h3>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalRuns}
          </div>
          <div className="text-sm text-gray-600">总运行次数</div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {stats.stepCount}
          </div>
          <div className="text-sm text-gray-600">已学习步骤</div>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {formatTime(stats.avgTime)}
          </div>
          <div className="text-sm text-gray-600">平均耗时</div>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-500 text-center">
        系统正在持续学习中，预测将越来越准确
      </div>
    </div>
  );
}
