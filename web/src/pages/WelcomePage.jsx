import './WelcomePage.css';            // 你可以把 App.css 中的样式搬到这里

export default function WelcomePage({ onEnter }) {
  // 添加模态框状态管理
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 切换模态框显示/隐藏
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Top Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="block h-8 w-auto text-indigo-600 font-bold text-2xl">
                  SparkLearn
                </span>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                联系我们
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
              Spark Learn
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
              提供丰富的学习资源和工具，帮助您提升编程技能和知识水平。
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <button
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                onClick={onEnter}
              >
                开始学习
              </button>
              <button 
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
                onClick={toggleModal}
              >
                了解更多
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">
              为什么选择我们？
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
              我们提供全方位的学习支持，助您轻松掌握编程技能，开启职业新篇章。
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-base font-medium text-indigo-600">
                  丰富的学习资源
                </div>
                <p className="mt-2 text-gray-500">
                  提供海量课程、教程和实战项目，满足不同学习阶段的需求。
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-base font-medium text-indigo-600">
                  互动式学习体验
                </div>
                <p className="mt-2 text-gray-500">
                  通过代码编辑器、在线调试工具和实时反馈，提升学习效率。
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-base font-medium text-indigo-600">
                  专业导师指导
                </div>
                <p className="mt-2 text-gray-500">
                  行业资深专家全程护航，解答疑惑，提供个性化学习建议。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 了解更多模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">关于 SparkLearn</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={toggleModal}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {/* 产品定位 */}
              <section className="mb-10">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-indigo-100 text-indigo-800 p-2 rounded-full mr-2">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  产品定位
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                    <h5 className="font-medium text-indigo-600 mb-2">一个好书童</h5>
                    <p className="text-gray-600">通过整合来自手写笔记、课件、板书和网页等多源输入，帮助你高效汇总与组织学习资源，省去繁杂的查找和整理工作，轻松获得所需的知识。</p>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                    <h5 className="font-medium text-indigo-600 mb-2">一个好考官</h5>
                    <p className="text-gray-600">根据你的学习情况和掌握程度，自动生成模拟试题和答案，帮助你进行知识点的自测和巩固，随时随地检查自己的学习成果，确保全面掌握所学内容。</p>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                    <h5 className="font-medium text-indigo-600 mb-2">一个好队友</h5>
                    <p className="text-gray-600">根据你的笔记内容，自动生成补充批注与解释，确保你掌握知识的每个细节。无论是重点、疑点，还是扩展内容，都能迅速为你补充，让学习不再遗漏。</p>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                    <h5 className="font-medium text-indigo-600 mb-2">一个好私教</h5>
                    <p className="text-gray-600">时刻追踪你的学习进度，精准了解你的知识掌握情况，并根据学习路径为你提供个性化的学习建议，帮助你高效规划每一步，提升学习效果。</p>
                  </div>
                </div>
              </section>

              {/* 团队特点 */}
              <section>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-indigo-100 text-indigo-800 p-2 rounded-full mr-2">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </span>
                  团队特点
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h5 className="font-medium text-gray-900 mb-1">丰富学术沉淀</h5>
                    <p className="text-gray-600 text-sm">清华大学计算机系班底，相关工作论文发表顶会</p>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h5 className="font-medium text-gray-900 mb-1">专注技术创新</h5>
                    <p className="text-gray-600 text-sm">通过独特的创新思维和领先的技术，为用户提供高效、智能、个性化的解决方案</p>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h5 className="font-medium text-gray-900 mb-1">扎实开发经验</h5>
                    <p className="text-gray-600 text-sm">团队成员参与校内外多项科创竞赛，具有丰富的相关项目开发经验</p>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 flex flex-col items-center text-center md:col-span-1.5">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h5 className="font-medium text-gray-900 mb-1">团队分工明确</h5>
                    <p className="text-gray-600 text-sm">产品/宣传工作分明，协同开发流畅</p>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 flex flex-col items-center text-center md:col-span-1.5">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <h5 className="font-medium text-gray-900 mb-1">聚焦实际场景</h5>
                    <p className="text-gray-600 text-sm">聚焦大学生学习特点和实际场景，响应AI助教建设需求</p>
                  </div>
                </div>
              </section>
            </div>
            <div className="p-6 border-t flex justify-end">
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                onClick={toggleModal}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}