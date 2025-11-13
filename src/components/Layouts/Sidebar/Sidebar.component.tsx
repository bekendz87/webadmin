'use client';

import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { NAV_DATA } from '@/constants/navigation';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { ChevronDown, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import routerPath from '@/routerPath';
import { Logo } from '@/components/Logo/Logo.component';
import { useTheme } from '@/contexts/ThemeContext';

export function Sidebar() {
  const location = useLocation();
  const { setIsOpen, isOpen, isMobile, toggleSidebar } = useSidebarContext();
  const { permissions } = useAuth();
  const { theme } = useTheme();
  const [expandedItems, setExpandedItems] = useState < string[] > ([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? [] : [title]));
  };

  useEffect(() => {
    NAV_DATA.forEach((section) => {
      section.items.forEach((item) => {
        if (item.items?.some((subItem) => subItem.url === location.pathname)) {
          if (!expandedItems.includes(item.title)) {
            setExpandedItems(prev => [...prev, item.title]);
          }
        }
      });
    });
  }, [location.pathname]);

  const hasPermission = (permission: any) => {
    if (!permission) return true;
    return permissions.indexOf(permission) !== -1;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-all duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'relative transition-all duration-300 ease-out',
          theme === 'dark' && 'dark',
          isMobile
            ? cn(
              'fixed inset-y-0 left-0 z-50',
              isOpen ? 'translate-x-0' : '-translate-x-full',
              'w-[360px] max-w-[90vw]' // Tăng từ 320px lên 360px cho mobile
            )
            : cn(
              'sticky top-0 min-h-screen',
              isOpen ? 'w-[320px]' : 'w-0' // Tăng từ 280px lên 320px cho desktop
            )
        )}
        aria-label="Main navigation"
        aria-hidden={!isOpen}
      >
        {/* macOS26 Liquid Glass Container */}
        <div className={cn(
          'liquid-glass-card h-full min-h-screen',
          'relative overflow-hidden',
          '!border-r !border-[var(--card-border)]',
          '!rounded-none !rounded-r-3xl',
          'shadow-2xl shadow-black/10'
        )}>
          {/* Glass overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

          <div className="flex h-full flex-col relative z-10">
            {/* macOS26 Header */}
            <div className={cn(
              'flex-shrink-0 p-6',
              'border-b border-[var(--card-border)]',
              'bg-gradient-to-r from-white/2 to-transparent'
            )}>
              {!isMobile ? (
                <div className="flex items-center justify-center">
                  <div className="relative group">
                    <Logo />
                    {/* macOS glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/20 to-[var(--accent-secondary)]/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <Logo />
                  <button
                    onClick={toggleSidebar}
                    className="macos26-btn macos26-btn-ghost macos26-btn-sm"
                    aria-label="Close sidebar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Navigation Content */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="space-y-6">
                {NAV_DATA.map((section) => {
                  const validItems = section.items.filter(item => {
                    if (!hasPermission(item.permission)) return false;
                    if (item.items?.length) {
                      return item.items.some(subItem => hasPermission(subItem.permission));
                    }
                    return true;
                  });

                  if (validItems.length === 0) return null;

                  return (
                    <div key={section.label} className="space-y-2">
                      <h2 className={cn(
                        'px-3 text-xs font-semibold uppercase tracking-wider',
                        'text-[var(--primary-text-secondary)] mb-3'
                      )}>
                        {section.label}
                      </h2>
                      <nav role="navigation" aria-label={section.label}>
                        <ul className="space-y-1">
                          {validItems.map((item) => (
                            <li key={item.title}>
                              {item.items?.length ? (
                                <div className="space-y-1">
                                  {/* Parent menu item */}
                                  <MacOS26MenuItem
                                    isActive={item.items.some(
                                      ({ url }) => url === location.pathname,
                                    )}
                                    isExpanded={expandedItems.includes(item.title)}
                                    onClick={() => toggleExpanded(item.title)}
                                    hasSubmenu
                                  >
                                    <item.icon className="h-5 w-5 flex-shrink-0" />
                                    <span className="flex-1 font-medium truncate">{item.title}</span>
                                    <ChevronDown
                                      className={cn(
                                        'h-4 w-4 transition-all duration-300 ease-out',
                                        expandedItems.includes(item.title) && 'rotate-180'
                                      )}
                                    />
                                  </MacOS26MenuItem>

                                  {/* Submenu - Enhanced version */}
                                  <div
                                    className={cn(
                                      "overflow-hidden transition-all duration-500 ease-out", // Tăng duration cho smooth hơn
                                      expandedItems.includes(item.title)
                                        ? "max-h-screen opacity-100 mt-2" // Sử dụng max-h-screen thay vì fixed value
                                        : "max-h-0 opacity-0 mt-0"
                                    )}
                                  >
                                    <div className="sidebar-submenu-container ml-4 pl-4 space-y-1">
                                      {item.items.map((subItem) => {
                                        if (!hasPermission(subItem.permission)) return null;
                                        return (
                                          <div key={subItem.title} className="submenu-item">
                                            <MacOS26MenuItem
                                              as="link"
                                              href={subItem.url}
                                              isActive={location.pathname === subItem.url}
                                              onClick={() => isMobile && toggleSidebar()}
                                              isSubmenu
                                            >
                                              <span className="text-sm font-medium truncate w-full">
                                                {subItem.title}
                                              </span>
                                            </MacOS26MenuItem>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <MacOS26MenuItem
                                  as="link"
                                  href={item.url || `/${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                                  isActive={location.pathname === (item.url || `/${item.title.toLowerCase().replace(/\s+/g, '-')}`)}
                                  onClick={() => isMobile && toggleSidebar()}
                                >
                                  <item.icon className="h-5 w-5 flex-shrink-0" />
                                  <span className="font-medium truncate">{item.title}</span>
                                </MacOS26MenuItem>
                              )}
                            </li>
                          ))}
                        </ul>
                      </nav>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar footer gradient */}
            <div className="h-16 bg-gradient-to-t from-[var(--card-bg)] to-transparent pointer-events-none" />
          </div>
        </div>
      </aside>
    </>
  );
}

interface MacOS26MenuItemProps {
  children: React.ReactNode;
  as?: 'button' | 'link';
  href?: string;
  isActive?: boolean;
  isExpanded?: boolean;
  onClick?: () => void;
  hasSubmenu?: boolean;
  isSubmenu?: boolean;
}

function MacOS26MenuItem({
  children,
  as = 'button',
  href,
  isActive = false,
  onClick,
  hasSubmenu = false,
  isSubmenu = false,
}: MacOS26MenuItemProps) {
  const baseClasses = cn(
    // Base styling
    'group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl',
    'text-[var(--primary-text)] transition-all duration-200 ease-out',
    'hover:bg-[var(--card-bg)] hover:backdrop-blur-sm',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30',

    // Active state with macOS accent
    isActive && [
      'bg-gradient-to-r from-[var(--accent)]/15 to-[var(--accent)]/5',
      'border border-[var(--accent)]/20',
      'text-[var(--accent)]',
      'shadow-lg shadow-[var(--accent)]/10',
      'font-semibold'
    ],

    // Submenu styling
    isSubmenu && [
      'text-sm py-2 px-4',
      'hover:translate-x-1'
    ],

    // Hover effects
    'hover:transform hover:scale-[1.02]',
    'active:scale-[0.98]'
  );

  // Active item glow effect
  const glowEffect = isActive && (
    <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
  );

  if (as === 'link' && href) {
    return (
      <Link
        to={href}
        className={baseClasses}
        onClick={onClick}
      >
        {glowEffect}
        {children}
      </Link>
    );
  }

  return (
    <button
      className={baseClasses}
      onClick={onClick}
      type="button"
    >
      {glowEffect}
      {children}
    </button>
  );
}