import React, { useState } from 'react';
import SmartProgressBar from './SmartProgressBar';

// 智能进度条演示组件 - 简洁版本
export default function SmartProgressDemo() {
  const [isRunning, setIsRunning] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [currentStep, setCurrentStep] = useState('预处理');
  const [selectedFile, setSelectedFile] = useState('sample.pdf');
  const [fileSize, setFileSize] = useState(2 * 1024 * 1024); // 2MB

  const steps = ['预处理', '数据增广', '知识树构建', '模型训练', '完成'];
  const fileTypes = [
    { name: 'PDF文档', value: 'sample.pdf', size: 2 * 1024 * 1024 },
    { name: 'Word文档', value: 'document.docx', size: 1.5 * 1024 * 1024 },
    { name: '纯文本', value: 'text.txt', size: 0.5 * 1024 * 1024 },
    { name: 'Markdown', value: 'readme.md', size: 0.3 * 1024 * 1024 },
    { name: 'HTML文件', value: 'page.html', size: 0.8 * 1024 * 1024 },
    { name: 'JSON数据', value: 'data.json', size: 0.2 * 1024 * 1024 }
  ];

  const startDemo = () => {
    setIsRunning(true);
    setPercentage(0);
    setCurrentStep('预处理');
    
    let stepIndex = 0;
    const interval = setInterval(() => {
      setPercentage(prev => {
        const newPercentage = prev + Math.random() * 5;
        if (newPercentage >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          return 100;
        }
        return newPercentage;
      });
      
      // 模拟步骤变化
      if (Math.random() < 0.1 && stepIndex < steps.length - 1) {
        stepIndex++;
        setCurrentStep(steps[stepIndex]);
      }
    }, 1000);
  };

  const handleFileChange = (fileType) => {
    setSelectedFile(fileType.value);
    setFileSize(fileType.size);
  };

  const formatFileSize = (bytes) => {
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          智能进度条演示
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：控制面板 */}
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3">文件选择</h3>
              <div className="grid grid-cols-2 gap-2">
                {fileTypes.map((file) => (
                  <button
                    key={file.value}
                    onClick={() => handleFileChange(file)}
                    className={`p-2 rounded border text-left text-sm ${
                      selectedFile === file.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{file.name}</div>
                    <div className="text-gray-500">{formatFileSize(file.size)}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3">当前文件</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">类型:</span>
                  <span>{selectedFile.split('.').pop()?.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">大小:</span>
                  <span>{formatFileSize(fileSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">分类:</span>
                  <span>
                    {fileSize < 1024 * 1024 ? '小文件' : 
                     fileSize < 10 * 1024 * 1024 ? '中等文件' : 
                     fileSize < 100 * 1024 * 1024 ? '大文件' : '超大文件'}
                  </span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <button
                onClick={startDemo}
                disabled={isRunning}
                className={`w-full py-2 px-4 rounded font-medium ${
                  isRunning
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isRunning ? '处理中...' : '开始演示'}
              </button>
            </div>
          </div>

          {/* 右侧：进度条显示 */}
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3">智能进度条</h3>
              <SmartProgressBar
                isRunning={isRunning}
                percentage={percentage}
                currentStep={currentStep}
                estimatedTime={120}
                fileSize={fileSize}
                fileType={selectedFile.split('.').pop() || ''}
              />
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3">预测原理</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <div>• 文件类型影响: PDF(1.2x) → Word(1.0x) → JSON(0.6x)</div>
                <div>• 文件大小影响: 小文件(0.5x) → 大文件(2.0x)</div>
                <div>• 步骤时间: 预处理(30s) → 训练(120s)</div>
                <div>• 历史学习: 记录处理时间，提升预测准确度</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
