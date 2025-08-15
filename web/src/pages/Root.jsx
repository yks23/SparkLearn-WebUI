import reactLogo from '../assets/react.svg';
import thucs from '../assets/cs.jpg';

export default function Root() {
  return (
    <>
      {/* 原有 Logo 区域 */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <a href="https://www.cs.tsinghua.edu.cn/" target="_blank" rel="noopener noreferrer">
          <img src={thucs} className="logo" alt="ThuCS logo" style={{ height: 50, width: 50 }} />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img
            src={reactLogo}
            className="logo react"
            alt="React logo"
            style={{ height: 50, width: 50, marginLeft: 50 }}
          />
        </a>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
        <span style={{ fontSize: 100, fontWeight: 'bold' }}>你好，还没想好放啥</span>
      </div>
    </>
  );
}