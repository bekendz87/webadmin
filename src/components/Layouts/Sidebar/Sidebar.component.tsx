'use client';

import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { NAV_DATA } from '@/constants/navigation';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { ChevronDown, X, Menu } from 'lucide-react';
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? [] : [title]));
  };

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  const openSidebar = () => {
    if (isMobile) {
      setIsOpen(true);
    } else {
      setIsCollapsed(false);
    }
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

  // Sidebar visibility logic
  const sidebarVisible = isMobile ? isOpen : (!isCollapsed && isOpen);
  const showFloatingButton = !isMobile && (isCollapsed || !isOpen);

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300 sidebar-backdrop"
          style={{ zIndex: 55 }}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Desktop Floating Toggle Button */}
      {showFloatingButton && (
        <button
          onClick={openSidebar}
          className={cn(
            'fixed top-6 left-6 desktop-toggle-btn',
            'flex items-center justify-center',
            'w-12 h-12',
            'bg-[var(--card-bg)] hover:bg-[var(--glass-bg)]',
            'backdrop-filter backdrop-blur-xl',
            '-webkit-backdrop-filter backdrop-blur-xl',
            'border-2 border-[var(--card-border)]',
            'hover:border-[var(--accent)]/30',
            'rounded-xl',
            'shadow-2xl shadow-black/20',
            'hover:shadow-3xl hover:shadow-black/30',
            'transition-all duration-300 ease-out',
            'hover:scale-110 active:scale-105',
            'group'
          )}
          style={{ zIndex: 55 }}
          aria-label="Open sidebar"
        >
          <Menu
            className={cn(
              "w-5 h-5",
              "text-[var(--primary-text)]",
              "group-hover:text-[var(--accent)]",
              "group-hover:scale-110",
              "transition-all duration-200",
              "drop-shadow-sm"
            )}
          />

          {/* Glow effect */}
          <div className={cn(
            "absolute inset-0 rounded-xl",
            "bg-[var(--accent)]/10 opacity-0",
            "group-hover:opacity-100",
            "transition-opacity duration-300",
            "pointer-events-none"
          )} />
        </button>
      )}

      <aside
        className={cn(
          'relative transition-all duration-300 ease-out sidebar-container',
          theme === 'dark' && 'dark',
          isMobile
            ? cn(
              'fixed inset-y-0 left-0',
              isOpen ? 'translate-x-0' : '-translate-x-full',
              'w-[300px] max-w-[85vw]'
            )
            : cn(
              'sticky top-0 min-h-screen flex-shrink-0',
              sidebarVisible ? 'w-[280px]' : 'w-0'
            )
        )}
        style={{ zIndex: 60 }}
        aria-label="Main navigation"
        aria-hidden={!sidebarVisible}
      >
        {/* macOS26 Liquid Glass Container */}
        <div className={cn(
          'liquid-glass-card h-full min-h-screen',
          'relative overflow-hidden',
          '!border-r !border-[var(--card-border)]',
          '!rounded-none !rounded-r-2xl',
          'shadow-xl shadow-black/5',
          !sidebarVisible && 'hidden'
        )}>
          {/* Glass overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent pointer-events-none" />

          <div className="flex h-full flex-col relative z-10">
            {/* macOS26 Header */}
            <div className={cn(
              'flex-shrink-0 p-4',
              'border-b border-[var(--card-border)]',
              'bg-gradient-to-r from-white/1 to-transparent'
            )}>
              {!isMobile ? (
                <div className="flex items-center justify-between">
                  <div className="relative group">
                    <Logo />
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/15 to-[var(--accent-secondary)]/15 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg -z-10" />
                  </div>
                  {/* Desktop collapse button */}
                  <button
                    onClick={toggleCollapsed}
                    className={cn(
                      "flex items-center justify-center",
                      "w-8 h-8",
                      "rounded-lg",
                      "text-[var(--primary-text-secondary)]",
                      "hover:text-[var(--primary-text)]",
                      "hover:bg-[var(--card-bg)]",
                      "transition-all duration-200",
                      "opacity-70 hover:opacity-100"
                    )}
                    aria-label="Collapse sidebar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <Logo />
                  <button
                    onClick={toggleSidebar}
                    className={cn(
                      "flex items-center justify-center",
                      "w-8 h-8",
                      "rounded-lg",
                      "text-[var(--primary-text-secondary)]",
                      "hover:text-[var(--primary-text)]",
                      "hover:bg-[var(--card-bg)]",
                      "transition-all duration-200"
                    )}
                    aria-label="Close sidebar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Navigation Content */}
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <div className="space-y-4">
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
                    <div key={section.label} className="space-y-1">
                      <h2 className={cn(
                        'px-2 text-xs font-semibold uppercase tracking-wide',
                        'text-[var(--primary-text-secondary)] mb-2'
                      )}>
                        {section.label}
                      </h2>
                      <nav role="navigation" aria-label={section.label}>
                        <ul className="space-y-0.5">
                          {validItems.map((item) => (
                            <li key={item.title}>
                              {item.items?.length ? (
                                <div className="space-y-0.5">
                                  {/* Parent menu item */}
                                  <MacOS26MenuItem
                                    isActive={item.items.some(
                                      ({ url }) => url === location.pathname,
                                    )}
                                    isExpanded={expandedItems.includes(item.title)}
                                    onClick={() => toggleExpanded(item.title)}
                                    hasSubmenu
                                  >
                                    <item.icon className="h-4 w-4 flex-shrink-0" />
                                    <span className="flex-1 font-medium truncate text-sm">{item.title}</span>
                                    <ChevronDown
                                      className={cn(
                                        'h-3 w-3 transition-all duration-300 ease-out',
                                        expandedItems.includes(item.title) && 'rotate-180'
                                      )}
                                    />
                                  </MacOS26MenuItem>

                                  {/* Submenu */}
                                  <div
                                    className={cn(
                                      "overflow-hidden transition-all duration-400 ease-out",
                                      expandedItems.includes(item.title)
                                        ? "max-h-screen opacity-100 mt-1"
                                        : "max-h-0 opacity-0 mt-0"
                                    )}
                                  ></div>
                                  <div className="sidebar-submenu-container ml-3 pl-3 space-y-0.5">
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
                                            <span className="text-xs font-medium truncate w-full">
                                              {subItem.title}
                                            </span>
                                          </MacOS26MenuItem>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                              ) : (
                                <MacOS26MenuItem
                                  as="link"
                                  href={item.url || `/${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                                  isActive={location.pathname === (item.url || `/${item.title.toLowerCase().replace(/\s+/g, '-')}`)}
                                  onClick={() => isMobile && toggleSidebar()}
                                >
                                  <item.icon className="h-4 w-4 flex-shrink-0" />
                                  <span className="font-medium truncate text-sm">{item.title}</span>
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
            <div className="h-12 bg-gradient-to-t from-[var(--card-bg)] to-transparent pointer-events-none" />
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
    'group relative w-full flex items-center gap-2 px-2 py-2 rounded-lg',
    'text-[var(--primary-text)] transition-all duration-200 ease-out text-sm',
    'hover:bg-[var(--card-bg)] hover:backdrop-blur-sm',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]/30',

    // Active state
    isActive && [
      'bg-gradient-to-r from-[var(--accent)]/12 to-[var(--accent)]/3',
      'border border-[var(--accent)]/15',
      'text-[var(--accent)]',
      'shadow-md shadow-[var(--accent)]/8',
      'font-semibold'
    ],

    // Submenu styling
    isSubmenu && [
      'text-xs py-1.5 px-3',
      'hover:translate-x-0.5'
    ],

    // Hover effects
    'hover:transform hover:scale-[1.01]',
    'active:scale-[0.99]'
  );

  const glowEffect = isActive && (
    <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/15 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
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