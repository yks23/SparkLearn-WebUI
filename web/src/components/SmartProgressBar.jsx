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

  // 基于实际经验的简单时间估算
  const smartPrediction = useMemo(() => {
    // 如果有文件夹信息，使用文件夹信息进行预测
    if (folderInfo) {
      const { totalSize, fileCount, fileTypes } = folderInfo;
      
      // 基于实际测试数据：
      // - 1MB图片：8分钟
      // - README文件（约几KB）：4分钟
      let baseTime = 4 * 60; // 基础4分钟
      
      // 根据总大小调整
      const sizeInMB = totalSize / (1024 * 1024);
      if (sizeInMB > 0.1) {
        baseTime = 4 * 60 + (sizeInMB - 0.1) * 4 * 60; // 每MB增加4分钟
      }
      
      // 文件数量调整（文件越多，处理时间越长）
      const fileCountAdjustment = Math.max(1, fileCount * 0.1); // 每个文件增加10%时间
      
      // 文件类型调整
      const hasImages = fileTypes.some(type => ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(type.toLowerCase()));
      const hasPDFs = fileTypes.some(type => type.toLowerCase() === 'pdf');
      
      let typeMultiplier = 1.0;
      if (hasImages) typeMultiplier *= 1.3; // 图片处理较慢
      if (hasPDFs) typeMultiplier *= 1.2;   // PDF处理较慢
      
      return Math.round(baseTime * fileCountAdjustment * typeMultiplier);
    }

    // 单个文件的情况
    if (!fileType || !fileSize) return estimatedTime;

    // 基于实际测试数据
    const sizeInMB = fileSize / (1024 * 1024);
    let baseTime = 4 * 60; // 基础4分钟
    
    // 根据文件大小调整
    if (sizeInMB > 0.1) {
      baseTime = 4 * 60 + (sizeInMB - 0.1) * 4 * 60; // 每MB增加4分钟
    }
    
    // 根据文件类型调整
    const typeAdjustments = {
      'jpg': 1.3, 'jpeg': 1.3, 'png': 1.3, 'gif': 1.3, 'bmp': 1.3, // 图片
      'pdf': 1.2, // PDF
      'txt': 0.8, 'md': 0.7, 'json': 0.6, // 文本文件
      'docx': 1.0, 'doc': 1.0, // Word文档
      'html': 0.9, 'htm': 0.9 // HTML文件
    };
    
    const typeMultiplier = typeAdjustments[fileType.toLowerCase()] || 1.0;
    
    return Math.round(baseTime * typeMultiplier);
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
