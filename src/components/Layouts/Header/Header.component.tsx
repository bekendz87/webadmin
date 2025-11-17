'use client';

import { Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { ThemeToggle } from './ThemeToggle.component';
import { UserDropdown } from './UserDropdown.component';
import { NotificationDropdown } from './NotificationDropdown.component';
import { SearchDropdown } from './SearchDropdown.component';
import { NAV_DATA } from '@/constants/navigation';

export function Header() {
  const { toggleSidebar, isMobile } = useSidebarContext();
  const navData = NAV_DATA;

  return (
    <header className="macos26-header" style={{ zIndex: 40 }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="macos26-btn macos26-btn-ghost macos26-btn-sm"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex-1 max-w-xl mx-6 hidden md:block">
          <SearchDropdown navData={navData} />
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NotificationDropdown />
          <UserDropdown />
        </div>
      </div>

      <div className="md:hidden mt-4">
        <SearchDropdown navData={navData} />
      </div>
    </header>
  );
}