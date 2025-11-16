import React from 'react';
import { cn } from '@/v0/lib/utils';

export interface V0LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
  onClick?: () => void;
}

// Replacing Next.js Link component with a React/Vite equivalent
export const V0Link: React.FC<V0LinkProps> = ({
  href,
  children,
  className,
  external = false,
  onClick,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    }

    // Handle internal navigation
    if (!external && href.startsWith('/')) {
      e.preventDefault();
      window.history.pushState({}, '', href);
      // Dispatch a custom event for router to handle
      window.dispatchEvent(new CustomEvent('v0:navigate', { detail: { path: href } }));
    }
  };

  const props = {
    href,
    className: cn('v0-nav-link', className),
    onClick: handleClick,
    ...(external && { target: '_blank', rel: 'noopener noreferrer' }),
  };

  return <a {...props}>{children}</a>;
};

export interface V0NavigationProps {
  items: Array<{
    href: string;
    label: string;
    active?: boolean;
  }>;
  className?: string;
}

export const V0Navigation: React.FC<V0NavigationProps> = ({ items, className }) => {
  return (
    <nav className={className}>
      <ul className="flex space-x-6">
        {items.map((item, index) => (
          <li key={index}>
            <V0Link
              href={item.href}
              className={item.active ? 'v0-nav-link-active' : 'v0-nav-link-inactive'}
            >
              {item.label}
            </V0Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
