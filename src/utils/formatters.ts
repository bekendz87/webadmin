/**
 * Format currency for Vietnamese locale
 */
export const formatCurrency = (amount: number | string | null | undefined): string => {
    if (amount === null || amount === undefined || amount === '') {
        return '0 ₫';
    }
    
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numericAmount)) {
        return '0 ₫';
    }
    
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numericAmount);
};

/**
 * Format number with thousand separators
 */
export const formatNumber = (num: number | string | null | undefined): string => {
    if (num === null || num === undefined || num === '') {
        return '0';
    }
    
    const numericValue = typeof num === 'string' ? parseFloat(num) : num;
    
    if (isNaN(numericValue)) {
        return '0';
    }
    
    return new Intl.NumberFormat('vi-VN').format(numericValue);
};

/**
 * Format date for Vietnamese locale
 */
export const formatDate = (date: string | Date | null | undefined, format: 'short' | 'long' | 'datetime' = 'short'): string => {
    if (!date) {
        return '--';
    }
    
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        if (isNaN(dateObj.getTime())) {
            return '--';
        }
        
        switch (format) {
            case 'long':
                return new Intl.DateTimeFormat('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }).format(dateObj);
                
            case 'datetime':
                return new Intl.DateTimeFormat('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                }).format(dateObj);
                
            case 'short':
            default:
                return new Intl.DateTimeFormat('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).format(dateObj);
        }
    } catch (error) {
        console.error('Error formatting date:', error);
        return '--';
    }
};

/**
 * Format time from date
 */
export const formatTime = (date: string | Date | null | undefined): string => {
    if (!date) {
        return '--';
    }
    
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        if (isNaN(dateObj.getTime())) {
            return '--';
        }
        
        return new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(dateObj);
    } catch (error) {
        console.error('Error formatting time:', error);
        return '--';
    }
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number | string | null | undefined, decimals: number = 1): string => {
    if (value === null || value === undefined || value === '') {
        return '0%';
    }
    
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numericValue)) {
        return '0%';
    }
    
    return `${numericValue.toFixed(decimals)}%`;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number | null | undefined): string => {
    if (!bytes || bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format phone number for Vietnamese format
 */
export const formatPhoneNumber = (phone: string | null | undefined): string => {
    if (!phone) return '--';
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Vietnamese phone number formats
    if (cleaned.length === 10) {
        // Format: 0xxx xxx xxx
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('84')) {
        // Format: +84 xxx xxx xxx
        return `+84 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
    
    return phone;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string | null | undefined, maxLength: number = 50): string => {
    if (!text) return '';
    
    if (text.length <= maxLength) return text;
    
    return `${text.substring(0, maxLength)}...`;
};

/**
 * Format relative time (time ago)
 */
export const formatRelativeTime = (date: string | Date | null | undefined): string => {
    if (!date) return '--';
    
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Vừa xong';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} phút trước`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} giờ trước`;
        } else if (diffInSeconds < 2592000) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} ngày trước`;
        } else {
            return formatDate(dateObj);
        }
    } catch (error) {
        console.error('Error formatting relative time:', error);
        return '--';
    }
};

/**
 * Format status with Vietnamese labels
 */
export const formatStatus = (status: string | null | undefined): string => {
    if (!status) return '--';
    
    const statusMap: { [key: string]: string } = {
        'active': 'Hoạt động',
        'inactive': 'Không hoạt động',
        'pending': 'Đang chờ',
        'approved': 'Đã duyệt',
        'rejected': 'Đã từ chối',
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy',
        'processing': 'Đang xử lý',
        'success': 'Thành công',
        'failed': 'Thất bại',
        'error': 'Lỗi',
        'warning': 'Cảnh báo',
        'info': 'Thông tin'
    };
    
    return statusMap[status.toLowerCase()] || status;
};
