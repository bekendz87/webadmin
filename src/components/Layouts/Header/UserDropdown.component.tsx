'use client';

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PATHS } from '@/constants/paths';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAlert } from '@/contexts/AlertContext';

export function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      if (user) {
        try {
          showAlert('error', 'Đăng xuất', `Đang đăng xuất ${user.username} khỏi hệ thống...`);
          await logout();
        } catch (error) {
          console.error('Failed to handle logout:', error);
          await logout();
        }
      } else {
        await logout();
      }
      navigate(PATHS.HOME);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="macos26-user-trigger"
      >
        <div className="flex items-center gap-3">
          <div className="macos26-avatar">
            {user?.avatar ? (
              <img
                src={user?.avatar}
                alt={user?.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src='/assets/img/droh.png'
                alt={user?.username}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="hidden text-left lg:block">
            <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
              {user?.username || 'Người dùng'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.group?.name || 'Nhân viên'}
            </p>
          </div>
        </div>

        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="macos26-dropdown">
          <div className="macos26-dropdown-header">
            <div className="flex items-center gap-3">
              <div className="macos26-avatar macos26-avatar-lg">
                {user?.avatar ? (
                  <img
                    src={user?.avatar}
                    alt={user?.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src='/assets/img/droh.png'
                    alt={user?.username}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {user?.username}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.type !== undefined ? (user.type === 1 ? 'Quản trị viên' : 'Nhân viên') : 'Nhân viên'}
                </p>
              </div>
            </div>
          </div>

          <div className="macos26-dropdown-content">
            <Link
              to={PATHS.PROFILE}
              className="macos26-dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              <User className="h-4 w-4 text-blue-500" />
              <span>Thông tin cá nhân</span>
            </Link>

            <div className="macos26-dropdown-separator" />

            <button
              onClick={handleLogout}
              className="macos26-dropdown-item macos26-dropdown-item-danger"
            >
              <LogOut className="h-4 w-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}