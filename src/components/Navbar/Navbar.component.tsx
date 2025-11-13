'use client';

import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/contexts/AlertContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { showAlert } = useAlert();

  const handleLogout = async () => {
    if (user) {
      console.log(123);

      try {
        // Show logout alert first
        showAlert('error', 'Đăng xuất', `Đang đăng xuất ${user.username} khỏi hệ thống...`, 2000);

        // Wait a bit for user to see the alert, then logout
        setTimeout(async () => {
          await logout();
        }, 1500); // 1.5 seconds delay to show alert

      } catch (error) {
        console.error('Failed to handle logout:', error);
        // If error, logout immediately
        await logout();
      }
    } else {
      console.log(456);
      // If no user, logout immediately
      await logout();
    }
  };

  return (
    <header className="liquid-glass-navbar">
      <div className="flex justify-between items-center w-full">
        {/* Logo/Brand Section */}
        <div className="flex items-center gap-4">
          <div className="group relative overflow-hidden">
            <h1 className="text-xl font-bold tracking-tight">
              DROH
            </h1>
            {/* Optionally add a shine effect here if desired */}
          </div>
        </div>

        {/* User Info and Actions */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-sm text-gray-500">
              Chào mừng,
            </span>
            <span className="text-base font-semibold">
              {user?.username}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="theme-toggle-btn flex items-center gap-2 px-3 py-2"
            aria-label="Đăng xuất khỏi hệ thống"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
}