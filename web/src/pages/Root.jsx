import reactLogo from '../assets/react.svg';
import thucs from '../assets/cs.jpg';

export default function Root() {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <a href="https://www.cs.tsinghua.edu.cn/" target="_blank" rel="noopener noreferrer">
          <img src={thucs} className="logo" alt="ThuCS logo" style={{ height: '50px', width: '50px' }} />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" style={{ height: '50px', width: '50px', marginLeft: '20px' }} />
        </a>
      </div>
    </>
  );
}