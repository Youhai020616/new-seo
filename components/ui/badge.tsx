import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-blue-100/80 text-blue-800 backdrop-blur-sm border border-blue-200/50',
      secondary: 'bg-gray-100/80 text-gray-800 backdrop-blur-sm border border-gray-200/50',
      success: 'bg-green-100/80 text-green-800 backdrop-blur-sm border border-green-200/50',
      warning: 'bg-yellow-100/80 text-yellow-800 backdrop-blur-sm border border-yellow-200/50',
      danger: 'bg-red-100/80 text-red-800 backdrop-blur-sm border border-red-200/50',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 hover:shadow-sm',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };
