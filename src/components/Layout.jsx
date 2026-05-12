import { Link, useLocation } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../lib/storage';
import { useState, useEffect } from 'react';

const navLinks = [
  { to: '/', label: '3D地图' },
  { to: '/shenzhen/overview', label: '深圳概览' },
  {
    label: '城市系统',
    children: [
      { to: '/shenzhen/transportation', label: '交通系统' },
      { to: '/shenzhen/economy', label: '经济发展' },
      { to: '/shenzhen/culture', label: '文化教育' },
      { to: '/shenzhen/planning', label: '城市规划' },
    ],
  },
  {
    label: '各区历史',
    children: [
      { to: '/districts/nanshan', label: '南山区' },
      { to: '/districts/futian', label: '福田区' },
      { to: '/districts/luohu', label: '罗湖区' },
      { to: '/districts/baoan', label: '宝安区' },
      { to: '/districts/longgang', label: '龙岗区' },
    ],
  },
  { to: '/community', label: '社区' },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [user, setUser] = useState(getCurrentUser());
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, [location]);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="h-12 bg-[#0a0a1a] border-b border-white/10 flex items-center px-4 shrink-0 z-50">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mr-8 no-underline">
          <span className="text-xl">🗺️</span>
          <span className="text-white font-bold text-lg tracking-wide">Maperta</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1 flex-1">
          {navLinks.map((item) =>
            item.to ? (
              <Link
                key={item.to}
                to={item.to}
                className={
                  'px-3 py-1.5 rounded text-sm no-underline transition-colors ' +
                  (location.pathname === item.to
                    ? 'bg-white/15 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5')
                }
              >
                {item.label}
              </Link>
            ) : (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="px-3 py-1.5 rounded text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                  {item.label}
                  <span className="ml-1 text-xs">▾</span>
                </button>
                {openDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-1 bg-[#1a1a2e] border border-white/10 rounded-lg py-1 shadow-xl min-w-[140px]">
                    {item.children.map((child) => (
                      <Link
                        key={child.to}
                        to={child.to}
                        className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 no-underline"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          )}
        </nav>

        {/* User area */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="text-sm text-gray-400 hover:text-white no-underline"
              >
                👤 {user.username}
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-red-400 bg-transparent border border-white/10 rounded px-2 py-1 cursor-pointer"
              >
                退出
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-sm text-gray-400 hover:text-white no-underline border border-white/10 rounded px-3 py-1"
            >
              登录
            </Link>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
