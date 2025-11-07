'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

export default function Breadcrumb({ items, showHome = true }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600">
      {showHome && (
        <>
          <Link
            href="/"
            className="flex items-center hover:text-blue-600 transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </>
      )}

      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          {item.href && !item.active ? (
            <Link
              href={item.href}
              className="hover:text-blue-600 transition-colors font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={
                item.active
                  ? 'text-blue-600 font-semibold'
                  : 'text-gray-900 font-medium'
              }
            >
              {item.label}
            </span>
          )}
          {index < items.length - 1 && (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </div>
      ))}
    </nav>
  );
}
