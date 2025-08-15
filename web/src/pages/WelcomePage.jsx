import './WelcomePage.css';            // 你可以把 App.css 中的样式搬到这里

export default function WelcomePage({ onEnter }) {
  // 原来的计数器示例已不再使用，可移除
  // const [count, setCount] = useState(0);

  return (
    <div className="bg-gray-100">
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
              <button className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50">
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
    </div>
  );
}