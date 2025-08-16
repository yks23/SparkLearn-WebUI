import { NavLink } from 'react-router-dom';

export default function Navbar({ setIsWelcomeVisible }) {
  const navClass = ({ isActive }) =>
    'px-3 py-2 rounded-md text-sm font-medium ' +
    (isActive
      ? 'bg-indigo-700 text-white'
      : 'text-gray-300 hover:bg-indigo-500');

  return (
    <nav
      className="bg-indigo-600 text-white flex items-center gap-4 px-4"
      style={{
        height: '64px',
        minHeight: '64px',
        maxHeight: '64px',
        overflow: 'hidden'
      }}
    >
      <NavLink to="/" className="font-bold px-3 flex items-center">
        SparkLearn
      </NavLink>
      <NavLink to="/api-config" className={navClass}>
        API配置
      </NavLink>
    </nav>
  );
}