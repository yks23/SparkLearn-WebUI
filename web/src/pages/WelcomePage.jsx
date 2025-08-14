import { useState } from 'react';
import reactLogo from '../assets/react.svg';
import thucs from '../assets/cs.jpg';
import './WelcomePage.css';

export default function WelcomePage({ onEnter }) {
  const [count, setCount] = useState(0);

  return (
    <div className="welcome-container flex flex-col items-center justify-center h-screen">
      <div className="flex gap-8 mb-8">
        <a href="https://www.cs.tsinghua.edu.cn/" target="_blank" rel="noreferrer">
          <img src={thucs} className="logo hover:shadow-[0_0_10px_#4f46e5]" alt="ThuCS logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react hover:shadow-[0_0_10px_#6366f1]" alt="React logo" />
        </a>
      </div>

      <h1 className="text-4xl font-bold mb-4">Spark Learn</h1>

      {/* 进入按钮 */}
      <button
        className="mt-8 px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        onClick={onEnter}
      >
        Enter Spark Learn
      </button>
    </div>
  );
}