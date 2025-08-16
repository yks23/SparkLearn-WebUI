import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './stores/appStore';
import WelcomePage from './pages/WelcomePage'; // 全屏欢迎界面
import Navbar from './components/Navbar';
import RootPage from './pages/Root'
import ApiConfigPage from './pages/ApiConfigPage';

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

  return (
    <AppProvider>
      <BrowserRouter>
        <div className="h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<RootPage/>} />
              <Route path="/api-config" element={<ApiConfigPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;