import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './stores/appStore';
import WelcomePage from './pages/WelcomePage'; // 全屏欢迎界面
import PipelinePage from './features/pipeline/PipelinePage';
import KgPreviewPage from './features/kg-preview/KgPreviewPage';
import QaPage from './features/qa/QaPage';
import Navbar from './components/Navbar';

function App() {
  const [isWelcomeVisible, setIsWelcomeVisible] = useState(true); // 控制欢迎界面显示

  // 点击按钮后，隐藏欢迎界面，展示主界面
  const handleEnterApp = () => {
    setIsWelcomeVisible(false);
  };

  if (isWelcomeVisible) {
    // 初始加载时只显示欢迎界面
    return <WelcomePage onEnter={handleEnterApp} />;
  }

  // 点击按钮后，展示主应用
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 p-4">
            <Routes>
              <Route path="/" element={<PipelinePage />} />
              <Route path="/kg" element={<KgPreviewPage />} />
              <Route path="/qa" element={<QaPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;