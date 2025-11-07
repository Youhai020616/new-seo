'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'News' },
    { href: '/keywords', label: 'Keywords' },
    { href: '/seo', label: 'SEO Assistant' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-blue-600">
                📰 News SEO Assistant
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      inline-flex items-center px-4 pt-1 text-sm font-medium
                      transition-all duration-200 ease-in-out
                      border-b-2 relative
                      ${
                        isActive
                          ? 'text-blue-600 border-blue-500'
                          : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
                      }
                    `}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
