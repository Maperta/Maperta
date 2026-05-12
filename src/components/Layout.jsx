import { Link, useLocation } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../lib/storage';
import { useI18n } from '../lib/i18n';
import { useState, useEffect } from 'react';

export default function Layout({ children }) {
  const location = useLocation();
  const { t, lang, toggleLang } = useI18n();
  const [user, setUser] = useState(getCurrentUser());
  const [openDropdown, setOpenDropdown] = useState(null);

  const navLinks = [
    { to: '/', label: t('nav_3dmap') },
    { to: '/shenzhen/overview', label: t('nav_overview') },
    {
      label: t('nav_systems'),
      children: [
        { to: '/shenzhen/transportation', label: lang === 'zh' ? '交通系统' : 'Transportation' },
        { to: '/shenzhen/economy', label: lang === 'zh' ? '经济发展' : 'Economy' },
        { to: '/shenzhen/culture', label: lang === 'zh' ? '文化教育' : 'Culture & Education' },
        { to: '/shenzhen/planning', label: lang === 'zh' ? '城市规划' : 'Urban Planning' },
      ],
    },
    {
      label: t('nav_districts'),
      children: [
        { to: '/districts/nanshan', label: lang === 'zh' ? '南山区' : 'Nanshan' },
        { to: '/districts/futian', label: lang === 'zh' ? '福田区' : 'Futian' },
        { to: '/districts/luohu', label: lang === 'zh' ? '罗湖区' : 'Luohu' },
        { to: '/districts/baoan', label: lang === 'zh' ? '宝安区' : "Bao'an" },
        { to: '/districts/longgang', label: lang === 'zh' ? '龙岗区' : 'Longgang' },
      ],
    },
    { to: '/community', label: t('nav_community') },
  ];

  useEffect(() => {
    setUser(getCurrentUser());
  }, [location]);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <div className="h-full flex flex-col">
      <header className="h-12 bg-[#0a0a1a] border-b border-white/10 flex items-center px-4 shrink-0 z-50">
        <Link to="/" className="flex items-center gap-2 mr-6 no-underline">
          <span className="text-xl">🗺️</span>
          <span className="text-white font-bold text-lg tracking-wide">Maperta</span>
        </Link>

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
                <button className="px-3 py-1.5 rounded text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors bg-transparent border-none cursor-pointer">
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

        {/* Tools + Language switcher + User area */}
        <div className="flex items-center gap-3">
          <Link
            to="/admin/editor"
            className="text-xs text-gray-400 hover:text-white no-underline border border-white/10 rounded px-2 py-1 hover:bg-white/5 transition-colors"
            title={lang === 'zh' ? '内容编辑器' : 'Content Editor'}
          >
            ✏️ {lang === 'zh' ? '编辑' : 'Edit'}
          </Link>
          <button
            onClick={toggleLang}
            className="text-xs text-gray-400 hover:text-white bg-white/5 border border-white/10 rounded px-2 py-1 cursor-pointer transition-colors"
            title={t('lang_switch')}
          >
            🌐 {t('lang_switch')}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="text-sm text-gray-400 hover:text-white no-underline">
                👤 {user.username}
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-red-400 bg-transparent border border-white/10 rounded px-2 py-1 cursor-pointer"
              >
                {t('nav_logout')}
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-sm text-gray-400 hover:text-white no-underline border border-white/10 rounded px-3 py-1"
            >
              {t('nav_login')}
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
