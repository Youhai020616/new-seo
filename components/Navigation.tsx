'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';
import { useSidebar } from '@/lib/contexts/SidebarContext';
import LanguageSwitcher from './LanguageSwitcher';
import { 
  Newspaper, 
  KeyRound, 
  FileSearch, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();

  const navItems = [
    { 
      href: '/', 
      label: t.nav.news,
      icon: Newspaper,
      description: t.nav.news
    },
    { 
      href: '/keywords', 
      label: t.nav.keywords,
      icon: KeyRound,
      description: t.nav.keywords
    },
    { 
      href: '/seo', 
      label: t.nav.seo,
      icon: FileSearch,
      description: t.nav.seo
    },
    { 
      href: '/ai', 
      label: t.nav.ai,
      icon: Sparkles,
      description: t.nav.ai
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-white/95 backdrop-blur-md 
          shadow-xl border-r border-gray-200/50 z-40
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
            {!collapsed && (
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl">📰</span>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-blue-600">News SEO</span>
                  <span className="text-xs text-gray-500">Assistant</span>
                </div>
              </Link>
            )}
            {collapsed && (
              <Link href="/" className="mx-auto">
                <span className="text-2xl">📰</span>
              </Link>
            )}
            
            {/* Collapse Button - Desktop Only */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`
                hidden lg:flex items-center justify-center
                w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors
                ${collapsed ? 'mx-auto' : ''}
              `}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-4 px-2">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-3 rounded-lg
                      transition-all duration-200
                      ${collapsed ? 'justify-center' : ''}
                      ${
                        isActive
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                    title={collapsed ? item.label : ''}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {!collapsed && (
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium truncate">{item.label}</span>
                        <span className={`text-xs truncate ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                          {item.description}
                        </span>
                      </div>
                    )}
                    {isActive && !collapsed && (
                      <div className="w-1 h-6 bg-white/30 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer - Language Switcher */}
          <div className={`
            border-t border-gray-200/50 p-4
            ${collapsed ? 'flex justify-center px-2' : ''}
          `}>
            {!collapsed && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">语言设置</p>
              </div>
            )}
            <LanguageSwitcher collapsed={collapsed} />
          </div>

          {/* Version Info */}
          {!collapsed && (
            <div className="px-4 pb-4">
              <div className="text-xs text-gray-400 text-center">
                <p>v1.0.0 Beta</p>
                <p>© 2025 News SEO</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
