import React, { useState, useEffect, useMemo } from 'react';
import { request } from '@/utils/request';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { API_ENDPOINTS } from '@/routerPath';
import { storage } from '@/utils/auth';
import { APP_CONFIG } from '@/constants/config';
import * as DebitTypes from '@/types/debit';
import type { InvoiceUser } from '@/types/invoice';
import Filter, { FilterField, ExportOption } from '@/components/Filter/Filter';
import InvoiceDetailModal from '@/components/Modal/InvoiceDetailModal';
import Pagination from '@/components/Pagination/Pagination';
import { TableHeader, TableBody, TableRow, TableHead, TableCell, Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAlert } from '@/contexts/AlertContext';
import { useNotification } from '@/contexts/NotificationContext';
import { createNotification } from '@/utils/notification';


// Fallback constants in case imports fail
const DEBIT_TYPES_FALLBACK = [
    { value: "Tất cả", key: "" },
    { value: "Top up", key: "top_up" },
    { value: "Yêu cầu rút tiền", key: "withdraw" },
];

const DebitReportPage: React.FC = () => {
    const [list, setList] = useState<DebitTypes.DebitItem[]>([]);
    const [report, setReport] = useState<DebitTypes.DebitReport>({
        totalPayCredit: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [invoiceCode, setInvoiceCode] = useState('');
    const [phoneCreator, setPhoneCreator] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedDebitType, setSelectedDebitType] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [userGroups, setUserGroups] = useState<any[]>([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10);

    // Detail modal states
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<DebitTypes.DebitItem | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [invoiceDetail, setInvoiceDetail] = useState<any>(null);

    // Use fallbacks if imports are undefined
    const debitTypes = DebitTypes.DEBIT_TYPES || DEBIT_TYPES_FALLBACK;

    // Page size options
    const pageNumberSettings = [
        { value: 10, name: '10' },
        { value: 50, name: '50' },
        { value: 100, name: '100' },
        { value: 150, name: '150' },
        { value: 200, name: '200' }
    ];

    // Define filter fields configuration
    const filterFields: FilterField[] = useMemo(() => [
        {
            type: 'date',
            name: 'dateFrom',
            label: 'Từ Ngày',
            value: dateFrom,
            onChange: setDateFrom
        },
        {
            type: 'date',
            name: 'dateTo',
            label: 'Đến Ngày',
            value: dateTo,
            onChange: setDateTo
        },
        {
            type: 'text',
            name: 'invoiceCode',
            label: 'Mã HĐ',
            placeholder: 'Nhập mã hóa đơn',
            value: invoiceCode,
            onChange: setInvoiceCode
        },
        {
            type: 'text',
            name: 'phoneCreator',
            label: 'Tài khoản tạo',
            placeholder: 'Nhập số điện thoại tạo',
            value: phoneCreator,
            onChange: setPhoneCreator
        },
        {
            type: 'text',
            name: 'phone',
            label: 'Tài khoản người dùng',
            placeholder: 'Nhập số điện thoại',
            value: phone,
            onChange: setPhone
        },
        {
            type: 'select',
            name: 'selectedDebitType',
            label: 'Loại trừ tiền',
            value: selectedDebitType,
            onChange: setSelectedDebitType,
            options: debitTypes
        },
        {
            type: 'select',
            name: 'selectedGroupId',
            label: 'Nhóm người dùng',
            value: selectedGroupId,
            onChange: setSelectedGroupId,
            options: userGroups.map(group => ({
                key: group._id || '',
                value: group.name || 'Không xác định'
            }))
        },
        {
            type: 'select',
            name: 'limit',
            label: 'Hiển thị',
            value: limit.toString(),
            onChange: (value: string) => setLimit(parseInt(value)),
            options: pageNumberSettings.map(item => ({ key: item.value.toString(), value: item.name }))
        }
    ], [
        dateFrom, dateTo, invoiceCode, phoneCreator, phone, selectedDebitType, selectedGroupId, limit,
        debitTypes, userGroups
    ]);

    // Define export options
    const exportOptions: ExportOption[] = [
        {
            type: 'excel',
            label: 'Xuất Excel',
            icon: (
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
            )
        }
    ];

    const { showAlert } = useAlert();
    const { refreshNotifications } = useNotification();

    // Add debug logging
    useEffect(() => {
        console.log('🔍 Debit Report Page - Alert Context:', { showAlert });
        console.log('🔍 Debit Report Page - Notification Context:', { refreshNotifications });
    }, [showAlert, refreshNotifications]);

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

    const fetchUserGroups = async () => {
        try {
            const token = storage.getItem<string>('webadmin_auth_token') || storage.getItem<string>(APP_CONFIG.TOKEN_KEY);

            const response = await request<any>({
                method: 'GET',
                url: `/api/cashier/groups`,
                params: {
                    showAll: true
                },
                headers: {
                    'oh_token': token ? token.replace(/^["']|["']$/g, '').replace(/\\"/g, '"') : ''
                }
            });

            if (response?.success) {
                const groups = response.data || response.one_health_msg || [];
                setUserGroups([
                    { _id: '', name: 'Tất cả nhóm' },
                    ...groups
                ]);
            } else {
                console.error('Failed to fetch user groups:', response);
                setUserGroups([{ _id: '', name: 'Tất cả nhóm' }]);
            }
        } catch (error) {
            console.error('Error fetching user groups:', error);
            setUserGroups([{ _id: '', name: 'Tất cả nhóm' }]);
        }
    };

    const fetchDebitList = async (page = 1, exportType, overrideFilters) => {
        try {
            setLoading(true);
            setError(null);

            // Show loading alert
            console.log('🚨 Showing loading alert...');
            if (showAlert) {
                showAlert(
                    'warning',
                    'Đang tải dữ liệu',
                    exportType ? 'Đang xuất báo cáo...' : 'Đang tải danh sách trừ tiền...',
                    3000
                );
            } else {
                console.error('❌ showAlert is not available');
            }

            const params: any = {
                invoiceType: 'debit',
                limit: limit.toString(),
                page: page.toString()
            };

            // Use override filters if provided, otherwise use current state
            const filters = overrideFilters || {
                dateFrom,
                dateTo,
                invoiceCode,
                phoneCreator,
                phone,
                selectedDebitType,
                selectedGroupId
            };

            // Date filters
            if (filters.dateFrom) {
                const fromDate = new Date(filters.dateFrom);
                fromDate.setHours(0, 0, 0, 0);
                params.from = fromDate.toISOString();
            }

            if (filters.dateTo) {
                const toDate = new Date(filters.dateTo);
                toDate.setHours(23, 59, 59, 999);
                params.to = toDate.toISOString();
            }

            // Set default dates if not provided
            if (!params.from) {
                const defaultFrom = new Date();
                defaultFrom.setHours(0, 0, 0, 0);
                params.from = defaultFrom.toISOString();
            }

            if (!params.to) {
                const defaultTo = new Date();
                defaultTo.setHours(23, 59, 59, 999);
                params.to = defaultTo.toISOString();
            }

            // Debit specific filters
            if (filters.selectedDebitType && filters.selectedDebitType !== '') {
                params.debit_type = filters.selectedDebitType;
            }

            if (filters.selectedGroupId && filters.selectedGroupId !== '') {
                const selectedGroup = userGroups.find(group => group._id === filters.selectedGroupId);
                if (selectedGroup && selectedGroup.name && selectedGroup.name !== 'Tất cả nhóm') {
                    params.group = selectedGroup.name;
                }
            }

            // Other filters
            params.report_type = 'all';

            if (filters.invoiceCode) {
                params.code = filters.invoiceCode;
            }

            if (filters.phoneCreator) {
                params.username_creator = filters.phoneCreator;
            }

            if (filters.phone) {
                params.username_user = filters.phone;
            }

            // Get token
            const token = storage.getItem < string > ('webadmin_auth_token') || storage.getItem < string > (APP_CONFIG.TOKEN_KEY);

            console.log('🚀 Making debit request with params:', params);

            // Export handling
            if (exportType) {
                params.export = exportType;
                params.title = 'Báo cáo trừ tiền';

                const queryParts: any = [];
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        queryParts.push(`${key}=${value}`);
                    }
                });

                const exportUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/invoices/list?${queryParts.join('&')}`;
                window.open(exportUrl, '_blank');

                // Show export success alert
                console.log('🚨 Showing export success alert...');
                if (showAlert) {
                    showAlert(
                        'success',
                        'Xuất báo cáo thành công',
                        `Đang tải xuống file ${exportType.toUpperCase()}...`,
                        4000
                    );
                }

                // Create notification
                await createNotification({
                    title: 'Bạn vừa xuất báo cáo trừ tiền thành công',
                    message: `Đang tải xuống file ${exportType.toUpperCase()}...`,
                    type: 'success'
                });

                return;
            }

            const response = await request < DebitTypes.DebitApiResponse > ({
                method: 'GET',
                url: `${API_ENDPOINTS.INVOICE.list}`,
                params,
                headers: {
                    'oh_token': token ? token.replace(/^["']|["']$/g, '').replace(/\\"/g, '"') : ''
                }
            });

            if (response?.success) {
                const data = response.data || response.one_health_msg;
                if (data) {
                    // Process debit items
                    const processedList = (data.list || []).map(item => {
                        // Add debit-specific processing
                        item.moneyType = 'payment'; // Debit items are payment type
                        return item;
                    });

                    setList(processedList);
                    setReport(data.report || report);
                    setTotalPages(Math.ceil((data.count || 0) / limit));
                    setCurrentPage(page);

                    // Show success alert
                    console.log('🚨 Showing success alert...');
                    if (showAlert) {
                        showAlert(
                            'success',
                            'Tải dữ liệu thành công',
                            `Tìm thấy ${processedList.length} bản ghi trừ tiền`,
                            4000
                        );
                    }

                    if (processedList.length > 0) {
                        await createNotification({
                            title: 'Bạn vừa tải danh sách trừ tiền thành công',
                            message: `Tìm thấy ${processedList.length} bản ghi`,
                            type: 'success'
                        });
                    }

                } else {
                    setList([]);
                    setError('Không có dữ liệu trả về');

                    console.log('🚨 Showing no data alert...');
                    if (showAlert) {
                        showAlert(
                            'error',
                            'Không có dữ liệu',
                            'Không có dữ liệu trừ tiền nào được tìm thấy',
                            4000
                        );
                    }
                }
            } else {
                console.error('❌ Request failed:', response);
                setList([]);
                setError(response?.message || 'Không thể tải dữ liệu trừ tiền - có thể do lỗi xác thực');

                console.log('🚨 Showing error alert...');
                if (showAlert) {
                    showAlert(
                        'error',
                        'Lỗi tải dữ liệu',
                        response?.message || 'Không thể tải dữ liệu trừ tiền. Vui lòng thử lại.',
                        5000
                    );
                }
            }
        } catch (error: any) {
            console.error('💥 Error fetching debit list:', error);
            setList([]);
            const errorMessage = error.message || 'Có lỗi xảy ra khi tải dữ liệu';
            setError(errorMessage);

            console.log('🚨 Showing catch error alert...');
            if (showAlert) {
                showAlert(
                    'error',
                    'Lỗi tải dữ liệu',
                    errorMessage,
                    5000
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchInvoiceDetail = async (invoiceId: string) => {
        try {
            setDetailLoading(true);
            const token = storage.getItem < string > ('webadmin_auth_token') || storage.getItem < string > (APP_CONFIG.TOKEN_KEY);

            const response = await request < any > ({
                method: 'GET',
                url: `${API_ENDPOINTS.INVOICE.detail.replace(':id', invoiceId)}`,
                params: {
                    id: invoiceId
                },
                headers: {
                    'oh_token': token ? token.replace(/^["']|["']$/g, '').replace(/\\"/g, '"') : ''
                }
            });

            if (response?.success) {
                setInvoiceDetail(response.data || response.one_health_msg);
            } else {
                console.error('Failed to fetch invoice detail:', response);
            }
        } catch (error) {
            console.error('Error fetching invoice detail:', error);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchDebitList(1);
    };

    const handlePageChange = (page: number) => {
        fetchDebitList(page);
    };

    const handleExport = (type: any) => {
        fetchDebitList(currentPage, type);
    };

    const handleViewDetail = (invoice: DebitTypes.DebitItem) => {
        setSelectedInvoice(invoice);
        setShowDetailModal(true);
        fetchInvoiceDetail(invoice._id);
    };

    const handleCloseDetail = () => {
        setShowDetailModal(false);
        setSelectedInvoice(null);
        setInvoiceDetail(null);
    };

    const getDebitTypeLabel = (type: string) => {
        const debitType = debitTypes.find(t => t.key === type);
        return debitType ? debitType.value : type;
    };

    const getDebitTypeDisplay = (debitInfo: any) => {
        if (!debitInfo || !debitInfo.type) return '-';

        switch (debitInfo.type) {
            case 'top_up':
                return 'Topup';
            case 'oh_card':
                return 'Thẻ OH';
            case 'withdraw':
                return 'Yêu cầu rút tiền';
            case 'noi_4':
                return 'Nội 4';
            default:
                return debitInfo.type;
        }
    };

    const resetFilters = () => {
        // Show reset alert
        console.log('🚨 Showing reset filters alert...');
        if (showAlert) {
            showAlert(
                'warning',
                'Đặt lại bộ lọc',
                'Đang tải lại dữ liệu với bộ lọc mặc định...',
                2000
            );
        }

        // Reset all filter states
        setDateFrom('');
        setDateTo('');
        setInvoiceCode('');
        setPhoneCreator('');
        setPhone('');
        setSelectedDebitType('');
        setSelectedGroupId('');
        setCurrentPage(1);

        // Fetch data with default filter values
        fetchDebitList(1, undefined, {
            dateFrom: '',
            dateTo: '',
            invoiceCode: '',
            phoneCreator: '',
            phone: '',
            selectedDebitType: '',
            selectedGroupId: ''
        });
    };

    useEffect(() => {
        fetchUserGroups();
        fetchDebitList();
    }, []);

    return (
        <div className="macos-liquid-glass min-h-screen">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header Section */}
                <Card className="macos26-header mb-8">
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex-1">
                                <h1 className="macos-heading-1 mb-2">
                                    Báo cáo trừ tiền
                                </h1>
                                <p className="macos-body-secondary">
                                    Quản lý và báo cáo các giao dịch trừ tiền từ tài khoản người dùng
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Error Alert */}
                {error && (
                    <Alert variant="error" className="mb-6">
                        <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Filter Section */}
                <Card className="macos26-header mb-8">
                    <Filter
                        fields={filterFields}
                        onSubmit={handleSubmit}
                        onReset={resetFilters}
                        loading={loading}
                        title="Bộ lọc"
                        submitLabel="Báo cáo"
                        showExport={true}
                        onExport={handleExport}
                        exportOptions={exportOptions}
                    />
                </Card>

                {/* Report Summary */}
                <Card className="macos26-header mb-8">
                    <CardHeader>
                        <h3 className="macos-heading-3">Chi tiết báo cáo</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                            <Card className="macos26-info-card macos26-info-card-primary">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <Badge variant="outline" className="mb-3 text-red-600 border-red-200">
                                                TỔNG TIỀN RÚT
                                            </Badge>
                                            <p className="macos-heading-2 text-red-900 dark:text-red-100">
                                                {formatCurrency(report.totalPayCredit)}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>

                {/* Table Section */}
                <Card className="macos26-header mb-8">
                    <CardHeader>
                        <h3 className="macos-heading-3">Danh sách trừ tiền</h3>
                        <p className="macos-body-secondary text-sm mt-1">
                            Cuộn ngang để xem thêm thông tin chi tiết
                        </p>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <LoadingSpinner size="lg" />
                                <p className="macos-body-secondary">Đang tải dữ liệu trừ tiền...</p>
                            </div>
                        ) : (
                            <div className="table-container">
                                <div className="macos26-table-wrapper">
                                    <Table className="macos26-table"
                                        showScrollHint={true}
                                        scrollHintText="Kéo ngang để xem thêm dữ liệu">
                                        <TableHeader className="macos26-table-head">
                                            <TableRow>
                                                <TableHead className="macos26-table-header-cell w-16 sticky-column">#</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[120px]">Mã Hóa đơn</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[150px]">Người tạo</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[150px]">Người sử dụng</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[120px]">Ngày tạo</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[100px]">Số tiền</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[120px]">Thanh toán</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[200px]">Ghi chú</TableHead>
                                                <TableHead className="macos26-table-header-cell w-32">Thao tác</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {list.length > 0 ? (
                                                list.map((invoice, index) => (
                                                    <TableRow key={invoice._id} className="macos26-table-row">
                                                        <TableCell className="macos26-table-cell text-center sticky-column">
                                                            <Badge variant="secondary" className="font-mono">
                                                                {(currentPage - 1) * limit + index + 1}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="macos26-table-cell">
                                                            <Badge variant="outline" className="macos26-table-cell-highlight font-mono">
                                                                {invoice.code}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="macos26-table-cell">
                                                            <div className="space-y-1">
                                                                <p className="font-medium">{invoice.creator.username}</p>
                                                                <p className="macos-body-secondary">
                                                                    {invoice.creator.last_name} {invoice.creator.first_name}
                                                                </p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="macos26-table-cell">
                                                            <div className="space-y-1">
                                                                <p className="font-medium">{invoice.user.username}</p>
                                                                <p className="macos-body-secondary">
                                                                    {invoice.user.last_name} {invoice.user.first_name}
                                                                </p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="macos26-table-cell">
                                                            <Badge variant="outline" className="font-mono">
                                                                {formatDate(invoice.created_time)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="macos26-table-cell">
                                                            <Badge variant="outline" className="macos26-table-cell-number text-red-600 border-red-200">
                                                                {formatCurrency(invoice.totalCredit)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="macos26-table-cell">
                                                            <Badge variant="secondary">
                                                                {getDebitTypeDisplay(invoice.debit_info)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="macos26-table-cell">
                                                            <div className="max-w-[200px]">
                                                                <p className="text-sm break-words">
                                                                    {invoice.note || '-'}
                                                                </p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="macos26-table-cell">
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                className="macos26-btn macos26-btn-secondary macos26-btn-sm"
                                                                onClick={() => handleViewDetail(invoice)}
                                                                leftIcon={
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                    </svg>
                                                                }
                                                            >
                                                                Chi tiết
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={9} className="text-center py-12">
                                                        <EmptyState
                                                            icon={
                                                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                            }
                                                            title="Chưa có dữ liệu trừ tiền nào"
                                                            description="Hãy thử thay đổi bộ lọc để tìm kiếm dữ liệu trừ tiền"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center pt-6">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}

                {/* Detail Modal */}
                <InvoiceDetailModal
                    isOpen={showDetailModal}
                    onClose={handleCloseDetail}
                    invoice={selectedInvoice}
                    invoiceDetail={invoiceDetail}
                    loading={detailLoading}
                    getInvoiceTypeLabel={getDebitTypeLabel}
                />
            </div>
        </div>
    );
};

export default DebitReportPage;