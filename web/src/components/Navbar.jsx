import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const navClass = ({ isActive }) =>
    'px-3 py-2 rounded-md text-sm font-medium ' +
    (isActive
      ? 'bg-indigo-700 text-white'
      : 'text-gray-300 hover:bg-indigo-500');

  return (
    <nav className="bg-indigo-600 text-white flex items-center gap-4 px-4 h-14">
      <NavLink to="/" onClick={() => setIsWelcomeVisible(true)} className="font-bold px-3 flex items-center">
        SparkLearn
      </NavLink>
      <NavLink to="/pipeline" className={navClass}>
        流程
      </NavLink>
      <NavLink to="/kg" className={navClass}>
        图谱
      </NavLink>
      <NavLink to="/qa" className={navClass}>
        题目
      </NavLink>
      <NavLink to="/api-config" className={navClass}>
        API配置
      </NavLink>
    </nav>
  );
}