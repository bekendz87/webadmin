import React, { useState, useEffect, useRef } from 'react';
import { request } from '@/utils/request';
import { API_ENDPOINTS } from '@/routerPath';
import { OtpItem, OtpApiResponse } from '@/types/otp';
import { useAlert } from '@/contexts/AlertContext';
import { useNotification } from '@/contexts/NotificationContext';
import { NotificationApiResponse } from '@/types/notification';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell
} from '@/components/ui/Table';

const OtpPage: React.FC = () => {
    const [list, setList] = useState<OtpItem[]>([]);
    const [phoneSearch, setPhoneSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [limit] = useState(100);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { showAlert } = useAlert();
    const { refreshNotifications } = useNotification();

    const getUserInfo = () => {
        try {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                const parsed = JSON.parse(userInfo);
                return {
                    userId: parsed._id || parsed.id || 'demo-user-id',
                    username: parsed.username || parsed.name || 'demo-user'
                };
            }
        } catch (error) {
            console.error('Error parsing userInfo from localStorage:', error);
        }
        return { userId: 'demo-user-id', username: 'demo-user' };
    };

    const getRequestHeaders = () => {
        const { userId, username } = getUserInfo();
        return {
            'Content-Type': 'application/json',
            'X-User-ID': userId,
            'X-Username': username
        };
    };

    const fetchOtpList = async (searchValue?: string) => {
        try {
            setLoading(true);
            setError(null);

            const params: any = { limit };
            const searchTerm = searchValue !== undefined ? searchValue : phoneSearch;
            if (searchTerm && searchTerm.trim() !== '') {
                params.search = searchTerm.trim();
            }

            showAlert(
                'warning',
                'Đang tìm kiếm OTP',
                searchTerm
                    ? `Đang tìm kiếm OTP cho số điện thoại: ${searchTerm}`
                    : 'Đang tải danh sách OTP...',
                3000
            );

            const response = await request<OtpApiResponse>({
                method: 'GET',
                url: `${API_ENDPOINTS.OTP}/list`,
                params
            });

            if (response?.success) {
                const otpData = response.data || response.one_health_msg || [];
                setList(otpData);

                if (otpData.length > 0) {
                    showAlert(
                        'success',
                        'Tìm kiếm thành công',
                        `Tìm thấy ${otpData.length} kết quả${searchTerm ? ` cho số ${searchTerm}` : ''}`,
                        4000
                    );

                    try {
                        await request<NotificationApiResponse>({
                            method: 'POST',
                            url: '/api/notification/create',
                            headers: getRequestHeaders(),
                            body: {
                                title: 'Bạn vừa tìm kiếm OTP thành công',
                                message: `Tìm thấy ${otpData.length} kết quả${searchTerm ? ` cho số ${searchTerm}` : ''}`,
                                type: 'success'
                            }
                        });

                        await refreshNotifications();
                    } catch (notificationError) {
                        console.error('Error creating notification:', notificationError);
                    }
                } else {
                    showAlert(
                        'error',
                        'Không tìm thấy kết quả',
                        searchTerm
                            ? `Không tìm thấy OTP nào cho số điện thoại: ${searchTerm}`
                            : 'Không có dữ liệu OTP nào',
                        4000
                    );
                }
            } else {
                console.warn('⚠️ API response not successful:', response);
                setList([]);
                setError('Không thể tải dữ liệu OTP');
                showAlert(
                    'error',
                    'Lỗi tìm kiếm',
                    'Không thể tải dữ liệu OTP. Vui lòng thử lại.',
                    5000
                );
            }
        } catch (error: any) {
            console.error('💥 Error fetching OTP list:', error);
            setList([]);
            const errorMessage = error.message || 'Có lỗi xảy ra khi tải dữ liệu';
            setError(errorMessage);
            showAlert(
                'error',
                'Lỗi tìm kiếm',
                errorMessage,
                5000
            );
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPhoneSearch(value);

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        if (value.trim() === '') {
            fetchOtpList('');
        } else {
            debounceTimeoutRef.current = setTimeout(() => {
                fetchOtpList(value);
            }, 300);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        fetchOtpList(phoneSearch);
    };

    const clearSearch = () => {
        setPhoneSearch('');
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        fetchOtpList('');
    };

    const handleRefresh = () => {
        showAlert(
            'warning',
            'Làm mới dữ liệu',
            'Đang tải lại danh sách OTP mới nhất...',
            2000
        );
        fetchOtpList();
    };

    useEffect(() => {
        fetchOtpList();
    }, []);

    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    const formatExpireTime = (expire: string | null | undefined) => {
        if (!expire) return '';
        try {
            const date = new Date(expire);
            return date.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        } catch {
            return '';
        }
    };

    const getStatusVariant = (status: string | null | undefined): 'default' | 'success' | 'destructive' | 'warning' => {
        if (!status) return 'default';

        switch (status.toLowerCase()) {
            case 'active':
            case 'valid':
            case 'verified':
                return 'success';
            case 'expired':
            case 'invalid':
                return 'destructive';
            case 'used':
                return 'warning';
            default:
                return 'default';
        }
    };

    const formatStatus = (status: string | null | undefined) => {
        if (!status) {
            return 'Không xác định';
        }

        switch (status.toLowerCase()) {
            case 'active':
                return 'Hoạt động';
            case 'valid':
                return 'Có hiệu lực';
            case 'expired':
                return 'Hết hạn';
            case 'invalid':
                return 'Không hợp lệ';
            case 'used':
                return 'Đã sử dụng';
            default:
                return status;
        }
    };

    return (
        <div className="macos-liquid-glass">
            <div className="p-6 space-y-6">
                {/* Header Card */}
                <Card className="macos26-header">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-4 sm:mb-0">
                            <h1 className="text-2xl font-bold text-var(--primary-text) mb-2">
                                Quản lý OTP
                            </h1>
                            <p className="text-var(--primary-text-secondary)">
                                Danh sách các mã OTP được tạo cho xác thực số điện thoại
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleRefresh}
                                variant="secondary"
                                size="sm"
                                disabled={loading}
                                leftIcon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                }
                            >
                                Làm mới
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Search Card */}
                <Card className="liquid-glass-card">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-400/30">
                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-var(--primary-text) mb-2">
                            Tìm kiếm OTP
                        </h3>
                        <p className="text-var(--primary-text-secondary)">
                            Nhập số điện thoại để tìm kiếm mã OTP tương ứng
                        </p>
                    </div>

                    <form onSubmit={handleSearchSubmit} className="space-y-4">
                        <div className="relative">
                            <Input
                                type="text"
                                value={phoneSearch}
                                onChange={handlePhoneChange}
                                placeholder="Nhập số điện thoại (VD: 0987654321)"
                                disabled={loading}
                                leftIcon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                }
                                rightElement={
                                    <div className="flex items-center space-x-2">
                                        {phoneSearch && (
                                            <Button
                                                type="button"
                                                onClick={clearSearch}
                                                variant="ghost"
                                                size="sm"
                                                className="!p-1 !h-auto !min-h-0 !min-w-0 hover:bg-transparent"
                                            >
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </Button>
                                        )}
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            size="sm"
                                            loading={loading}
                                            leftIcon={
                                                !loading && (
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                    </svg>
                                                )
                                            }
                                        >
                                            Tìm kiếm
                                        </Button>
                                    </div>
                                }
                            />
                        </div>

                        {phoneSearch && (
                            <div className="flex items-center justify-center">
                                <div className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-blue-50/50 text-blue-700 border border-blue-200/50 backdrop-blur-sm">
                                    <span>Đang tìm kiếm: </span>
                                    <span className="font-medium ml-1">"{phoneSearch}"</span>
                                    <Button
                                        type="button"
                                        onClick={clearSearch}
                                        variant="ghost"
                                        size="sm"
                                        className="ml-2 !p-1 !h-auto !min-h-0 !min-w-0 text-blue-600 hover:text-blue-800"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>
                </Card>

                {/* OTP Table Card */}
                <Card className="liquid-glass-card">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="loading-spinner"></div>
                            <span className="ml-4 text-var(--primary-text-secondary)">
                                Đang tải dữ liệu OTP...
                            </span>
                        </div>
                    ) : (
                        <div className="macos26-table-wrapper">
                            <Table className="macos26-table">
                                <TableHeader className="macos26-table-head">
                                    <TableRow>
                                        <TableHead className="macos26-table-header-cell w-16">
                                            STT
                                        </TableHead>
                                        <TableHead className="macos26-table-header-cell min-w-[150px]">
                                            Số điện thoại
                                        </TableHead>
                                        <TableHead className="macos26-table-header-cell min-w-[120px]">
                                            Mã OTP
                                        </TableHead>
                                        <TableHead className="macos26-table-header-cell min-w-[130px]">
                                            Hết hạn vào lúc
                                        </TableHead>
                                        <TableHead className="macos26-table-header-cell w-32">
                                            Trạng thái
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {list.length > 0 ? (
                                        list.map((item, index) => (
                                            <TableRow key={`${item.phone}-${index}`} className="macos26-table-row">
                                                <TableCell className="macos26-table-cell text-center">
                                                    <span className="text-var(--primary-text-secondary) font-medium">
                                                        {index + 1}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="macos26-table-cell">
                                                    <span className="font-semibold text-var(--primary-text) otp-table-phone">
                                                        {item.phone}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="macos26-table-cell">
                                                    <Badge variant="secondary" className="otp-code-badge">
                                                        {item.pin_code}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="macos26-table-cell">
                                                    <span className="text-var(--primary-text-secondary) otp-table-expire">
                                                        {formatExpireTime(item.expire) || 'Không xác định'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="macos26-table-cell">
                                                    <Badge variant={getStatusVariant(item.status)}>
                                                        {formatStatus(item.status)}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="macos26-table-cell text-center py-16">
                                                <div className="flex flex-col items-center justify-center space-y-4">
                                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 12a8 8 0 01-8 8 8 8 0 01-8-8 7.962 7.962 0 012-5.291m0 0A7.962 7.962 0 0112 4c2.038 0 3.9.762 5.291 2M6.709 6.009c.362-.362.75-.709 1.164-1.041" />
                                                        </svg>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-var(--primary-text-secondary) text-lg">
                                                            {phoneSearch
                                                                ? `Không tìm thấy OTP cho số điện thoại "${phoneSearch}"`
                                                                : 'Chưa có dữ liệu OTP nào'
                                                            }
                                                        </p>
                                                        {phoneSearch && (
                                                            <Button
                                                                onClick={clearSearch}
                                                                variant="ghost"
                                                                size="sm"
                                                                className="mt-4"
                                                            >
                                                                Xóa bộ lọc
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </Card>

                {/* Footer Statistics Card */}
                {list.length > 0 && (
                    <Card className="liquid-glass-card">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-4">
                                <div className="text-var(--primary-text-secondary)">
                                    Hiển thị <span className="font-medium text-var(--primary-text)">{list.length}</span> kết quả
                                    {phoneSearch && (
                                        <span> cho từ khóa "<span className="font-medium text-var(--primary-text)">{phoneSearch}</span>"</span>
                                    )}
                                </div>
                            </div>
                            <div className="text-var(--primary-text-secondary)">
                                Giới hạn: {limit} bản ghi
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default OtpPage;

