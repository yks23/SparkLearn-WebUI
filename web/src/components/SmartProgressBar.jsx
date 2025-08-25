import React, { useState, useEffect, useMemo } from 'react';

// 智能进度条组件 - 简洁版本
export default function SmartProgressBar({
  isRunning,
  percentage,
  currentStep,
  estimatedTime,
  fileSize = 0,
  fileType = ''
}) {
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // 智能预测逻辑
  const smartPrediction = useMemo(() => {
    if (!fileType || !fileSize) return estimatedTime;

    // 文件类型调整系数
    const typeMultipliers = {
      'pdf': 1.2, 'docx': 1.0, 'txt': 0.8, 'md': 0.7, 'html': 0.9, 'json': 0.6
    };

    // 文件大小调整系数
    const sizeMultipliers = {
      'small': 0.5, 'medium': 1.0, 'large': 2.0, 'huge': 4.0
    };

    // 步骤基础时间
    const stepBaseTimes = {
      '预处理': 30, '数据增广': 45, '知识树构建': 90, '模型训练': 120, '完成': 10
    };

    const typeMultiplier = typeMultipliers[fileType.toLowerCase()] || 1.0;
    const sizeCategory = fileSize < 1024 * 1024 ? 'small' : 
                        fileSize < 10 * 1024 * 1024 ? 'medium' : 
                        fileSize < 100 * 1024 * 1024 ? 'large' : 'huge';
    const sizeMultiplier = sizeMultipliers[sizeCategory];
    const baseTime = stepBaseTimes[currentStep] || 60;

    return Math.round(baseTime * typeMultiplier * sizeMultiplier);
  }, [fileType, fileSize, currentStep, estimatedTime]);

  // 时间格式化
  const formatTime = (seconds) => {
    if (seconds < 60) return `${Math.round(seconds)}秒`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}分${remainingSeconds}秒`;
  };

  // 文件大小格式化
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // 更新计时器
  useEffect(() => {
    if (isRunning && !startTime) {
      setStartTime(Date.now());
    } else if (!isRunning) {
      setStartTime(null);
      setElapsedTime(0);
    }
  }, [isRunning, startTime]);

  useEffect(() => {
    if (!isRunning || !startTime) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  if (!isRunning) return null;

  return (
    <div className="bg-white border rounded-lg p-4 space-y-3">
      {/* 进度条 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{currentStep}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* 时间信息 */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center">
          <div className="text-gray-500">已用时间</div>
          <div className="font-medium">{formatTime(elapsedTime)}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">预计总时间</div>
          <div className="font-medium">{formatTime(smartPrediction)}</div>
        </div>
      </div>

      {/* 文件信息 */}
      {fileType && fileSize > 0 && (
        <div className="flex justify-between text-xs text-gray-500 border-t pt-2">
          <span>文件类型: {fileType.toUpperCase()}</span>
          <span>文件大小: {formatFileSize(fileSize)}</span>
        </div>
      )}

      {/* 说明文字 */}
      <div className="text-xs text-gray-400 text-center border-t pt-2">
        时间仅供参考，会随着使用次数增多越来越准确
      </div>
    </div>
  );
}
