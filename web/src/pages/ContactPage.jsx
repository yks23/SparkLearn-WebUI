import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaBook, FaUsers, FaQuestionCircle, FaArrowLeft } from 'react-icons/fa';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 返回按钮 */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FaArrowLeft size={20} />
            <span>返回首页</span>
          </Link>
        </div>

        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">联系我们</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            欢迎使用 SparkLearn-WebUI！我们致力于为智能教育和知识图谱应用提供最佳的用户体验。
          </p>
        </div>



        {/* 联系方式和资源 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* GitHub */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <FaGithub className="text-2xl text-gray-800 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">GitHub</h3>
            </div>
            <p className="text-gray-600 mb-4">访问我们的开源仓库，查看最新代码和更新。</p>
            <a
              href="https://github.com/yks23/SparkLearn-WebUI"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              访问仓库
            </a>
          </div>

          {/* Issues */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <FaQuestionCircle className="text-2xl text-orange-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">问题反馈</h3>
            </div>
            <p className="text-gray-600 mb-4">遇到问题或有建议？请在GitHub Issues中反馈。</p>
            <a
              href="https://github.com/yks23/SparkLearn-WebUI/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors"
            >
              提交Issue
            </a>
          </div>

          {/* 文档 */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <FaBook className="text-2xl text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">使用文档</h3>
            </div>
            <p className="text-gray-600 mb-4">查看详细的使用说明和API配置指南。</p>
            <a
              href="https://github.com/yks23/SparkLearn-WebUI#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
            >
              查看文档
            </a>
          </div>
        </div>



        {/* 贡献指南 */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <FaUsers className="text-3xl text-green-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">贡献指南</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">如何贡献</h3>
              <ol className="text-gray-600 space-y-2">
                <li>1. Fork 项目</li>
                <li>2. 创建功能分支</li>
                <li>3. 提交更改</li>
                <li>4. 推送到分支</li>
                <li>5. 创建 Pull Request</li>
              </ol>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">开发环境</h3>
              <div className="text-gray-600 space-y-2">
                <p>• Python 3.11+</p>
                <p>• Node.js 18+</p>
                <p>• Git</p>
                <p>• 各种AI API密钥</p>
              </div>
            </div>
          </div>
        </div>

        {/* 页脚 */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600">
            © 2024 SparkLearn-WebUI. 开源项目，采用 MIT 许可证。
          </p>
          <p className="text-gray-500 text-sm mt-2">
            感谢所有贡献者的支持！
          </p>
        </div>
      </div>
    </div>
  );
}
