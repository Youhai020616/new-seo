'use client';

import { useSidebar } from '@/lib/contexts/SidebarContext';
import { ReactNode } from 'react';

interface LayoutContentProps {
  children: ReactNode;
}

export default function LayoutContent({ children }: LayoutContentProps) {
  const { collapsed } = useSidebar();

  return (
    <div 
      className={`
        transition-all duration-300 ease-in-out
        ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}
      `}
    >
      <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 pt-20 lg:pt-8">
        <div 
          className={`
            mx-auto transition-all duration-300
            ${collapsed ? 'max-w-[calc(100vw-5rem)]' : 'max-w-7xl'}
          `}
        >
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-md border-t border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            © 2025 News SEO Assistant. Built with ❤️ using Next.js & DeepSeek AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
