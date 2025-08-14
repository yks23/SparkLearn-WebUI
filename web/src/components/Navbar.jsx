import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const navClass = ({ isActive }) =>
    'px-3 py-2 rounded-md text-sm font-medium ' +
    (isActive
      ? 'bg-indigo-700 text-white'
      : 'text-gray-300 hover:bg-indigo-500');

  return (
    <nav className="bg-indigo-600 text-white flex items-center gap-4 px-4 h-14">
      <span className="font-bold">SparkLearn</span>

      {/* 原来指向 /，现在改为 /pipeline */}
      <NavLink to="/pipeline" className={navClass}>
        流程
      </NavLink>

      <NavLink to="/kg" className={navClass}>
        图谱
      </NavLink>

      <NavLink to="/qa" className={navClass}>
        题目
      </NavLink>
    </nav>
  );
}