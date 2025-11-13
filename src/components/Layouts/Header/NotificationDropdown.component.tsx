'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, X, BellRing } from 'lucide-react';
import { formatDateTime } from '@/utils/formatDate';
import { useNotification } from '@/contexts/NotificationContext';

export function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const {
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        removeNotification
    } = useNotification();

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(target) &&
                buttonRef.current &&
                !buttonRef.current.contains(target)
            ) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleMarkAsRead = async (id: string) => {
        try {
            await markAsRead(id);
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    const handleRemoveNotification = async (id: string) => {
        try {
            await removeNotification(id);
        } catch (err) {
            console.error('Error removing notification:', err);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="macos26-btn macos26-btn-ghost macos26-btn-sm relative"
                aria-label="Thông báo"
                type="button"
            >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                    <span className="macos26-notification-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className={`macos26-notification-dropdown ${isMobile ? 'macos26-notification-dropdown-mobile' : ''}`}>
                    <div className="macos26-notification-header">
                        <div className="flex items-center gap-2">
                            <BellRing className="h-5 w-5 text-blue-500" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Thông báo
                            </h3>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="macos26-btn macos26-btn-ghost macos26-btn-sm text-blue-500"
                                disabled={loading}
                            >
                                Đánh dấu tất cả
                            </button>
                        )}
                    </div>

                    <div className="macos26-notification-content">
                        {error ? (
                            <div className="macos26-notification-error">
                                <p className="text-red-500 mb-2">
                                    Lỗi tải thông báo: {error}
                                </p>
                                <button
                                    onClick={fetchNotifications}
                                    className="macos26-btn macos26-btn-primary macos26-btn-sm"
                                >
                                    Thử lại
                                </button>
                            </div>
                        ) : loading ? (
                            <div className="macos26-notification-loading">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                                <p className="text-sm text-gray-500">Đang tải...</p>
                            </div>
                        ) : !notifications || notifications.length === 0 ? (
                            <div className="macos26-notification-empty">
                                <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Không có thông báo
                                </p>
                                <p className="text-xs text-gray-500">
                                    Bạn sẽ thấy thông báo mới ở đây
                                </p>
                            </div>
                        ) : (
                            notifications.map((notification: any, index: number) => (
                                <div
                                    key={notification._id || index}
                                    className={`macos26-notification-item ${!notification.read ? 'macos26-notification-item-unread' : ''}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                {notification.title || 'Thông báo'}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                {notification.message || 'Không có nội dung'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                                {formatDateTime(notification.timestamp || notification.created_time || notification.createdAt)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 ml-3">
                                            {!notification.read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification._id)}
                                                    className="macos26-notification-action macos26-notification-action-success"
                                                    title="Đánh dấu đã đọc"
                                                    disabled={loading}
                                                >
                                                    <Check className="h-3 w-3" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleRemoveNotification(notification._id)}
                                                className="macos26-notification-action macos26-notification-action-danger"
                                                title="Xóa"
                                                disabled={loading}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {notifications && notifications.length > 0 && (
                        <div className="macos26-notification-footer">
                            <button className="macos26-btn macos26-btn-ghost macos26-btn-sm w-full">
                                Xem tất cả thông báo
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}