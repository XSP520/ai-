import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const navLinks = [
  { to: '/', label: '首页' },
  { to: '/roadmap', label: '学习路线' },
  { to: '/progress', label: '进度总览' },
  { to: '/settings', label: '⚙️ 设置' },
];

export default function Navbar() {
  const location = useLocation();
  const { dark, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 bg-[#F8FAFC]/90 dark:bg-[#0F172A]/90 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#1E293B]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <span className="text-2xl">🧠</span>
            <span className="hidden sm:inline">AI 进化之路</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <button
              onClick={toggleTheme}
              className="ml-2 p-2 rounded-lg text-lg hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B] transition-colors"
              aria-label={dark ? '切换浅色模式' : '切换暗黑模式'}
              title={dark ? '切换浅色模式' : '切换暗黑模式'}
            >
              {dark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
