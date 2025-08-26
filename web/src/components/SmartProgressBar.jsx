import React, { useState, useEffect, useMemo } from 'react';

// 智能进度条组件 - 支持文件夹输入
export default function SmartProgressBar({
  isRunning,
  percentage,
  currentStep,
  estimatedTime,
  fileSize = 0,
  fileType = '',
  inputPath = '' // 新增：输入路径
}) {
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [folderInfo, setFolderInfo] = useState(null);

  // 获取文件夹信息
  const getFolderInfo = async (path) => {
    if (!path) return null;
    
    try {
      const { invoke } = await import('../utils/ipc.jsx');
      const result = await invoke('getFolderInfo', { path });
      if (result.success) {
        return result;
      } else {
        console.warn('获取文件夹信息失败:', result.error);
        return null;
      }
    } catch (error) {
      console.warn('获取文件夹信息失败:', error);
      return null;
    }
  };

  // 初始化文件夹信息
  useEffect(() => {
    if (inputPath && !folderInfo) {
      getFolderInfo(inputPath).then(info => {
        if (info) {
          setFolderInfo(info);
        }
      });
    }
  }, [inputPath, folderInfo]);

  // 智能预测逻辑 - 支持文件夹
  const smartPrediction = useMemo(() => {
    // 如果有文件夹信息，使用文件夹信息进行预测
    if (folderInfo) {
      const { totalSize, fileCount, fileTypes } = folderInfo;
      
      // 文件类型调整系数
      const typeMultipliers = {
        'pdf': 1.2, 'docx': 1.0, 'txt': 0.8, 'md': 0.7, 'html': 0.9, 'json': 0.6
      };

      // 文件大小调整系数
      const sizeMultipliers = {
        'small': 0.5, 'medium': 1.0, 'large': 2.0, 'huge': 4.0
      };

      // 步骤基础时间（秒）
      const stepBaseTimes = {
        '预处理': 30, '数据增广': 45, '知识树构建': 90, '模型训练': 120, '完成': 10
      };

      // 计算平均文件类型系数
      const typeCounts = {};
      fileTypes.forEach(type => {
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
      
      let avgTypeMultiplier = 1.0;
      if (Object.keys(typeCounts).length > 0) {
        const totalFiles = Object.values(typeCounts).reduce((a, b) => a + b, 0);
        avgTypeMultiplier = Object.entries(typeCounts).reduce((sum, [type, count]) => {
          return sum + (typeMultipliers[type.toLowerCase()] || 1.0) * (count / totalFiles);
        }, 0);
      }

      // 文件大小分类
      const sizeCategory = totalSize < 1024 * 1024 ? 'small' : 
                          totalSize < 10 * 1024 * 1024 ? 'medium' : 
                          totalSize < 100 * 1024 * 1024 ? 'large' : 'huge';
      const sizeMultiplier = sizeMultipliers[sizeCategory];
      
      // 文件数量调整系数 - 使用对数函数避免过度增长
      const fileCountMultiplier = Math.max(1, Math.log(fileCount + 1) / Math.log(2));
      
      // 文件类型多样性调整系数
      const diversityMultiplier = Math.max(1, Math.min(1.5, fileTypes.length * 0.2));
      
      const baseTime = stepBaseTimes[currentStep] || 60;
      
      // 最终预测时间
      const predictedTime = Math.round(baseTime * avgTypeMultiplier * sizeMultiplier * fileCountMultiplier * diversityMultiplier);
      
      // 确保预测时间在合理范围内（最少30秒，最多30分钟）
      return Math.max(30, Math.min(1800, predictedTime));
    }

    // 如果没有文件夹信息，使用原来的逻辑
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
  }, [fileType, fileSize, currentStep, estimatedTime, folderInfo]);

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

      {/* 文件信息 - 支持文件夹 */}
      {folderInfo ? (
        <div className="space-y-2 text-xs text-gray-500 border-t pt-2">
          <div className="flex justify-between">
            <span>📁 文件夹输入</span>
            <span>{folderInfo.fileCount} 个文件</span>
          </div>
          <div className="flex justify-between">
            <span>总大小:</span>
            <span>{formatFileSize(folderInfo.totalSize)}</span>
          </div>
          <div className="flex justify-between">
            <span>文件类型:</span>
            <span>{folderInfo.fileTypes.slice(0, 3).join(', ')}{folderInfo.fileTypes.length > 3 ? '...' : ''}</span>
          </div>
        </div>
      ) : fileType && fileSize > 0 ? (
        <div className="flex justify-between text-xs text-gray-500 border-t pt-2">
          <span>文件类型: {fileType.toUpperCase()}</span>
          <span>文件大小: {formatFileSize(fileSize)}</span>
        </div>
      ) : null}

      {/* 说明文字 */}
      <div className="text-xs text-gray-400 text-center border-t pt-2">
        {folderInfo ? 
          '文件夹处理时间会根据文件数量和类型自动调整' : 
          '时间仅供参考，会随着使用次数增多越来越准确'
        }
      </div>
    </div>
  );
}
