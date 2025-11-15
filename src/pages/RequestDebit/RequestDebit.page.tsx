import React, { useState, useEffect, useMemo } from 'react';
import { request } from '@/utils/request';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { API_ENDPOINTS } from '@/routerPath';
import { storage } from '@/utils/auth';
import { APP_CONFIG } from '@/constants/config';
import * as DebitTypes from '@/types/debit';
import Filter, { FilterField, ExportOption } from '@/components/Filter/Filter';
import Pagination from '@/components/Pagination/Pagination';
import { TableHeader, TableBody, TableRow, TableHead, TableCell, Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAlert } from '@/contexts/AlertContext';
import Modal from '@/components/Modal/Modal';

const RequestDebitPage: React.FC = () => {
    const [groupedList, setGroupedList] = useState < DebitTypes.DebitItem[] > ([]);
    const [report, setReport] = useState < DebitTypes.DebitReport > ({
        totalPayCredit: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState < string | null > (null);
    const [expandedRows, setExpandedRows] = useState < Set < number >> (new Set());

    // Filter states
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [invoiceCode, setInvoiceCode] = useState('');
    const [phoneCreator, setPhoneCreator] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [userGroups, setUserGroups] = useState < any[] > ([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10);

    // Child pagination for expanded rows
    const [childPages, setChildPages] = useState < { [key: number]: number } > ({});
    const [childLimits, setChildLimits] = useState < { [key: number]: number } > ({});

    // Modal states
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [selectedInvoiceForRefund, setSelectedInvoiceForRefund] = useState < DebitTypes.DebitItem | null > (null);
    const [refundList, setRefundList] = useState < any[] > ([]);
    const [refundLoading, setRefundLoading] = useState(false);

    const { showAlert } = useAlert();

    // Page size options
    const pageNumberSettings = [
        { value: 10, name: '10' },
        { value: 50, name: '50' },
        { value: 100, name: '100' },
        { value: 150, name: '150' },
        { value: 200, name: '200' }
    ];

    // Define filter fields configuration
    const filterFields = useMemo(() => [
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
            onChange: (value) => setLimit(parseInt(value)),
            options: pageNumberSettings.map(item => ({ key: item.value.toString(), value: item.name }))
        }
    ], [dateFrom, dateTo, invoiceCode, phoneCreator, phone, selectedGroupId, limit, userGroups]);

    // Define export options
    const exportOptions = [

    ];

    // Fetch user groups
    const fetchUserGroups = async () => {
        try {
            const token = storage.getItem < string > ('webadmin_auth_token') || storage.getItem < string > (APP_CONFIG.TOKEN_KEY);

            const response = await request < any > ({
                method: 'GET',
                url: API_ENDPOINTS.CASHIER.groups,
                params: { showAll: true },
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
            }
        } catch (error) {
            console.error('Error fetching user groups:', error);
            setUserGroups([{ _id: '', name: 'Tất cả nhóm' }]);
        }
    };

    // Fetch main debit list (grouped by creator)
    const fetchDebitList = async (page = 1, exportType, overrideFilters) => {
        try {
            setLoading(true);
            setError(null);

            if (showAlert) {
                showAlert(
                    'warning',
                    'Đang tải dữ liệu',
                    exportType ? 'Đang xuất báo cáo...' : 'Đang tải danh sách trừ tiền...',
                    3000
                );
            }

            const params = {
                invoiceType: 'debit',
                limit: limit.toString(),
                page: page.toString(),
                report_type: 'all',
                debit_type: 'withdraw',
                withdraw_gr_by_creator: true
            };

            // Use override filters if provided, otherwise use current state
            const filters = overrideFilters || {
                dateFrom, dateTo, invoiceCode, phoneCreator, phone, selectedGroupId
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

            // Other filters
            if (filters.invoiceCode) params.code = filters.invoiceCode;
            if (filters.phoneCreator) params.username_creator = filters.phoneCreator;
            if (filters.phone) params.username_user = filters.phone;

            if (filters.selectedGroupId && filters.selectedGroupId !== '') {
                const selectedGroup = userGroups.find(group => group._id === filters.selectedGroupId);
                if (selectedGroup && selectedGroup.name && selectedGroup.name !== 'Tất cả nhóm') {
                    params.group = selectedGroup.name;
                }
            }

            const token = storage.getItem < string > ('webadmin_auth_token') || storage.getItem < string > (APP_CONFIG.TOKEN_KEY);

            // Export handling
            if (exportType) {
                params.export = exportType;
                params.title = 'Báo cáo trừ tiền';

                const queryParts = [];
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        queryParts.push(`${key}=${value}`);
                    }
                });

                const exportUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/invoices/list?${queryParts.join('&')}`;
                window.open(exportUrl, '_blank');

                if (showAlert) {
                    showAlert(
                        'success',
                        'Xuất báo cáo thành công',
                        `Đang tải xuống file ${exportType.toUpperCase()}...`,
                        4000
                    );
                }
                return;
            }

            const response = await request < DebitTypes.DebitApiResponse > ({
                method: 'GET',
                url: API_ENDPOINTS.DEBIT.list,
                params,
                headers: {
                    'oh_token': token ? token.replace(/^["']|["']$/g, '').replace(/\\"/g, '"') : ''
                }
            });

            if (response?.success) {
                const data = response.data || response.one_health_msg;
                if (data) {
                    // Process grouped data
                    const processedList = (data.list || []).map((item, index) => {
                        item.moneyType = 'payment';
                        item.idHtml = `pagination_${index}`;
                        return item;
                    });

                    setGroupedList(processedList);
                    setReport(data.report || report);
                    setTotalPages(Math.ceil((data.count || 0) / limit));
                    setCurrentPage(page);

                    if (showAlert) {
                        showAlert(
                            'success',
                            'Tải dữ liệu thành công',
                            `Tìm thấy ${processedList.length} nhóm trừ tiền`,
                            4000
                        );
                    }
                } else {
                    setGroupedList([]);
                    setError('Không có dữ liệu trả về');

                    if (showAlert) {
                        showAlert('error', 'Không có dữ liệu', 'Không có dữ liệu trừ tiền nào được tìm thấy', 4000);
                    }
                }
            } else {
                setGroupedList([]);
                setError(response?.message || 'Không thể tải dữ liệu trừ tiền');

                if (showAlert) {
                    showAlert('error', 'Lỗi tải dữ liệu', response?.message || 'Không thể tải dữ liệu trừ tiền', 5000);
                }
            }
        } catch (error) {
            console.error('Error fetching debit list:', error);
            setGroupedList([]);
            setError(error.message || 'Có lỗi xảy ra khi tải dữ liệu');

            if (showAlert) {
                showAlert('error', 'Lỗi tải dữ liệu', error.message || 'Có lỗi xảy ra khi tải dữ liệu', 5000);
            }
        } finally {
            setLoading(false);
        }
    };

    // Fetch detailed data for expanded row
    const fetchDebitDetails = async (invoice, index, expanded) => {
        if (!expanded) return;

        try {
            const params = {
                invoiceType: 'debit',
                report_type: 'all',
                debit_type: 'withdraw',
                username_creator: invoice.creator.username,
                limit: childLimits[index] || 10,
                page: childPages[index] || 1,
                expanded: true
            };

            // Apply date filters
            if (dateFrom) {
                const fromDate = new Date(dateFrom);
                fromDate.setHours(0, 0, 0, 0);
                params.from = fromDate.toISOString();
            }

            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                params.to = toDate.toISOString();
            }

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

            if (invoiceCode) params.code = invoiceCode;
            if (phone) params.username_user = phone;

            const token = storage.getItem < string > ('webadmin_auth_token') || storage.getItem < string > (APP_CONFIG.TOKEN_KEY);

            const response = await request < DebitTypes.DebitApiResponse > ({
                method: 'GET',
                url: API_ENDPOINTS.DEBIT.list,
                params,
                headers: {
                    'oh_token': token ? token.replace(/^["']|["']$/g, '').replace(/\\"/g, '"') : ''
                }
            });

            if (response?.success) {
                const data = response.data || response.one_health_msg;
                if (data) {
                    // Update the specific group item with details
                    setGroupedList(prevList => {
                        const newList = [...prevList];
                        newList[index] = {
                            ...newList[index],
                            details: data.list || [],
                            totalPageChild: data.count || 0
                        };
                        return newList;
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching debit details:', error);
        }
    };

    // Fetch refund details
    const fetchRefundDetails = async (invoice) => {
        try {
            setRefundLoading(true);
            const params = {
                username: invoice.user.username
            };

            // Apply date filters
            if (dateFrom) {
                const fromDate = new Date(dateFrom);
                fromDate.setHours(0, 0, 0, 0);
                params.from = fromDate.toISOString();
            }

            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                params.to = toDate.toISOString();
            }

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

            const token = storage.getItem < string > ('webadmin_auth_token') || storage.getItem < string > (APP_CONFIG.TOKEN_KEY);

            const response = await request < any > ({
                method: 'GET',
                url: API_ENDPOINTS.DEBIT.listRefund,
                params,
                headers: {
                    'oh_token': token ? token.replace(/^["']|["']$/g, '').replace(/\\"/g, '"') : ''
                }
            });

            if (response?.success) {
                const data = response.data || response.one_health_msg;
                setRefundList(data || []);
            } else {
                setRefundList([]);
            }
        } catch (error) {
            console.error('Error fetching refund details:', error);
            setRefundList([]);
        } finally {
            setRefundLoading(false);
        }
    };

    // Handle expand/collapse
    const handleRowExpand = (index) => {
        const newExpandedRows = new Set(expandedRows);
        const isExpanded = expandedRows.has(index);

        if (isExpanded) {
            newExpandedRows.delete(index);
        } else {
            newExpandedRows.add(index);
            // Initialize child pagination if not exist
            if (!childLimits[index]) {
                setChildLimits(prev => ({ ...prev, [index]: 10 }));
            }
            if (!childPages[index]) {
                setChildPages(prev => ({ ...prev, [index]: 1 }));
            }
            // Fetch details for this row
            fetchDebitDetails(groupedList[index], index, true);
        }

        setExpandedRows(newExpandedRows);
    };

    // Handle child pagination
    const handleChildPageChange = (newPage, index) => {
        setChildPages(prev => ({ ...prev, [index]: newPage }));
        fetchDebitDetails(groupedList[index], index, true);
    };

    const handleChildLimitChange = (newLimit, index) => {
        setChildLimits(prev => ({ ...prev, [index]: newLimit }));
        setChildPages(prev => ({ ...prev, [index]: 1 }));
        fetchDebitDetails(groupedList[index], index, true);
    };

    // Handle refund modal
    const handleViewRefund = (invoice) => {
        setSelectedInvoiceForRefund(invoice);
        setShowRefundModal(true);
        fetchRefundDetails(invoice);
    };

    const handleCloseRefundModal = () => {
        setShowRefundModal(false);
        setSelectedInvoiceForRefund(null);
        setRefundList([]);
    };

    // Form handlers
    const handleSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchDebitList(1);
    };

    const handlePageChange = (page) => {
        fetchDebitList(page);
    };

    const handleExport = (type) => {
        fetchDebitList(currentPage, type);
    };

    const resetFilters = () => {
        if (showAlert) {
            showAlert('warning', 'Đặt lại bộ lọc', 'Đang tải lại dữ liệu với bộ lọc mặc định...', 2000);
        }

        setDateFrom('');
        setDateTo('');
        setInvoiceCode('');
        setPhoneCreator('');
        setPhone('');
        setSelectedGroupId('');
        setCurrentPage(1);
        setExpandedRows(new Set());

        fetchDebitList(1, undefined, {
            dateFrom: '', dateTo: '', invoiceCode: '', phoneCreator: '', phone: '', selectedGroupId: ''
        });
    };

    // Format payment method
    const getPaymentMethodLabel = (method) => {
        return DebitTypes.PAYMENT_METHODS[method] || method;
    };

    // Format draw type
    const getDrawTypeLabel = (drawType) => {
        return DebitTypes.DRAW_TYPES[drawType] || drawType;
    };

    // Initialize
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
                                    Báo cáo trừ tiền nhóm theo người tạo
                                </h1>
                                <p className="macos-body-secondary">
                                    Quản lý và báo cáo các giao dịch trừ tiền được nhóm theo người tạo
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
                        <div className="flex items-center justify-between">
                            <h3 className="macos-heading-3">Chi tiết báo cáo</h3>
                            <div className="flex gap-4">
                                <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleExport('excel')}
                                    leftIcon={
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                        </svg>
                                    }
                                >
                                    Excel
                                </Button>
                                <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleExport('pdf')}
                                    leftIcon={
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                        </svg>
                                    }
                                >
                                    PDF
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-end">
                            <div className="text-right">
                                <Badge variant="outline" className="text-lg px-4 py-2 font-bold text-red-600 border-red-300">
                                    Tổng tiền rút: {formatCurrency(report.totalPayCredit)}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Table */}
                <Card className="macos26-header mb-8">
                    <CardHeader>
                        <h3 className="macos-heading-3">Danh sách nhóm theo người tạo</h3>
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
                                    <Table className="macos26-table">
                                        <TableHeader className="macos26-table-head">
                                            <TableRow>
                                                <TableHead className="macos26-table-header-cell w-16">#</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[150px]">Tài khoản trả tiền</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[200px]">Tên người trả tiền</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[120px]">Tổng Tiền</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[100px]">Số Hóa Đơn</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[100px]">Số Trang</TableHead>
                                                <TableHead className="macos26-table-header-cell w-32">Hành động</TableHead>
                                                <TableHead className="macos26-table-header-cell w-20"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {groupedList.length > 0 ? (
                                                groupedList.map((invoice, index) => (
                                                    <React.Fragment key={invoice._id || index}>
                                                        {/* Main Group Row */}
                                                        <TableRow className="macos26-table-row">
                                                            <TableCell className="macos26-table-cell text-center">
                                                                <Badge variant="secondary" className="font-mono">
                                                                    {(currentPage - 1) * limit + index + 1}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="macos26-table-cell">
                                                                <Badge variant="outline" className="font-semibold">
                                                                    {invoice.creator.username}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="macos26-table-cell">
                                                                <div className="font-medium">
                                                                    {invoice.creator.last_name} {invoice.creator.first_name}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="macos26-table-cell">
                                                                <Badge variant="outline" className="macos26-table-cell-number text-red-600 border-red-200">
                                                                    {invoice.moneyType === 'payment' ? formatCurrency(invoice.totalCredit) : '0'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="macos26-table-cell">
                                                                <Badge variant="secondary" className="font-mono">
                                                                    {invoice.totalInvoice || 0}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="macos26-table-cell">
                                                                <select
                                                                    className="macos26-input macos26-input-sm w-20"
                                                                    value={childLimits[index] || 10}
                                                                    onChange={(e) => handleChildLimitChange(parseInt(e.target.value), index)}
                                                                >
                                                                    {pageNumberSettings.map(setting => (
                                                                        <option key={setting.value} value={setting.value}>
                                                                            {setting.name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </TableCell>
                                                            <TableCell className="macos26-table-cell text-center">
                                                                <Button
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    className={`w-10 h-10 rounded-full ${expandedRows.has(index) ? 'bg-red-100 border-red-200' : ''}`}
                                                                    onClick={() => handleRowExpand(index)}
                                                                >
                                                                    {expandedRows.has(index) ? '−' : '+'}
                                                                </Button>
                                                            </TableCell>
                                                            <TableCell className="macos26-table-cell"></TableCell>
                                                        </TableRow>

                                                        {/* Expanded Detail Rows */}
                                                        {expandedRows.has(index) && (
                                                            <TableRow>
                                                                <TableCell colSpan={8} className="p-0">
                                                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4">
                                                                        <div className="macos26-table-wrapper">
                                                                            <Table className="macos26-table">
                                                                                <TableHeader className="macos26-table-head">
                                                                                    <TableRow>
                                                                                        <TableHead className="macos26-table-header-cell w-16">#</TableHead>
                                                                                        <TableHead className="macos26-table-header-cell min-w-[120px]">Mã Hóa Đơn</TableHead>
                                                                                        <TableHead className="macos26-table-header-cell min-w-[150px]">Người Sử Dụng</TableHead>
                                                                                        <TableHead className="macos26-table-header-cell min-w-[150px]">Hình Thức Trả Tiền</TableHead>
                                                                                        <TableHead className="macos26-table-header-cell min-w-[120px]">Số Tiền Rút</TableHead>
                                                                                        <TableHead className="macos26-table-header-cell min-w-[120px]">Ngày Tạo</TableHead>
                                                                                        <TableHead className="macos26-table-header-cell min-w-[120px]">Tiền Chuyển/Trả KH</TableHead>
                                                                                        <TableHead className="macos26-table-header-cell min-w-[120px]">Tiền Chiết Khấu</TableHead>
                                                                                        <TableHead className="macos26-table-header-cell min-w-[200px]">Thông tin ngân hàng</TableHead>
                                                                                        <TableHead className="macos26-table-header-cell min-w-[150px]">Ghi Chú</TableHead>
                                                                                        <TableHead className="macos26-table-header-cell w-32"></TableHead>
                                                                                    </TableRow>
                                                                                </TableHeader>
                                                                                <TableBody>
                                                                                    {invoice.details && invoice.details.length > 0 ? (
                                                                                        invoice.details.map((innerItem, innerIndex) => (
                                                                                            <TableRow key={innerItem._id || innerIndex} className="macos26-table-row">
                                                                                                <TableCell className="macos26-table-cell text-center">
                                                                                                    <Badge variant="secondary" className="font-mono text-xs">
                                                                                                        {innerIndex + 1}
                                                                                                    </Badge>
                                                                                                </TableCell>
                                                                                                <TableCell className="macos26-table-cell">
                                                                                                    <Badge variant="outline" className="font-mono text-xs">
                                                                                                        {innerItem.code}
                                                                                                    </Badge>
                                                                                                </TableCell>
                                                                                                <TableCell className="macos26-table-cell">
                                                                                                    <div className="text-sm">
                                                                                                        <div className="font-medium">{innerItem.user.username}</div>
                                                                                                        <div className="macos-body-secondary">
                                                                                                            {innerItem.user.last_name} {innerItem.user.first_name}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </TableCell>
                                                                                                <TableCell className="macos26-table-cell">
                                                                                                    <Badge variant="secondary" className="text-xs">
                                                                                                        {innerItem.debit_info?.payment_method ?
                                                                                                            getPaymentMethodLabel(innerItem.debit_info.payment_method) :
                                                                                                            '-'
                                                                                                        }
                                                                                                    </Badge>
                                                                                                </TableCell>
                                                                                                <TableCell className="macos26-table-cell">
                                                                                                    <Badge variant="outline" className="macos26-table-cell-number text-red-600 border-red-200 text-xs">
                                                                                                        {formatCurrency(innerItem.totalCredit)}
                                                                                                    </Badge>
                                                                                                </TableCell>
                                                                                                <TableCell className="macos26-table-cell">
                                                                                                    <Badge variant="outline" className="font-mono text-xs">
                                                                                                        {formatDate(innerItem.created_time)}
                                                                                                    </Badge>
                                                                                                </TableCell>
                                                                                                <TableCell className="macos26-table-cell">
                                                                                                    <Badge variant="outline" className="macos26-table-cell-number text-green-600 border-green-200 text-xs">
                                                                                                        {innerItem.keep_draw_money?.return_amount ?
                                                                                                            formatCurrency(innerItem.keep_draw_money.return_amount) :
                                                                                                            '0'
                                                                                                        }
                                                                                                    </Badge>
                                                                                                </TableCell>
                                                                                                <TableCell className="macos26-table-cell">
                                                                                                    <div className="text-xs">
                                                                                                        <Badge variant="outline" className="macos26-table-cell-number text-orange-600 border-orange-200 text-xs mb-1">
                                                                                                            {innerItem.keep_draw_money?.keep_amount ?
                                                                                                                formatCurrency(innerItem.keep_draw_money.keep_amount) :
                                                                                                                '0'
                                                                                                            }
                                                                                                        </Badge>
                                                                                                        {innerItem.keep_draw_money?.rate && (
                                                                                                            <div className="text-gray-500 text-xs mt-1">
                                                                                                                {innerItem.keep_draw_money.rate.draw_type ?
                                                                                                                    `${getDrawTypeLabel(innerItem.keep_draw_money.rate.draw_type)}: ${innerItem.keep_draw_money.rate.draw_value}` :
                                                                                                                    ''
                                                                                                                }
                                                                                                            </div>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </TableCell>
                                                                                                <TableCell className="macos26-table-cell">
                                                                                                    <div className="text-xs space-y-1">
                                                                                                        {innerItem.debit_info?.bank_info?.customerName && (
                                                                                                            <div>{innerItem.debit_info.bank_info.customerName}</div>
                                                                                                        )}
                                                                                                        {innerItem.debit_info?.bank_info?.cardNumber && (
                                                                                                            <div>Số thẻ: {innerItem.debit_info.bank_info.cardNumber}</div>
                                                                                                        )}
                                                                                                        {innerItem.debit_info?.bank_info?.accountNumber && (
                                                                                                            <div>STK: {innerItem.debit_info.bank_info.accountNumber}</div>
                                                                                                        )}
                                                                                                        {innerItem.debit_info?.bank_info?.bankName && (
                                                                                                            <div>NH: {innerItem.debit_info.bank_info.bankName}</div>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </TableCell>
                                                                                                <TableCell className="macos26-table-cell">
                                                                                                    <div className="text-xs max-w-[120px] break-words">
                                                                                                        {innerItem.note || '-'}
                                                                                                    </div>
                                                                                                </TableCell>
                                                                                                <TableCell className="macos26-table-cell text-center">
                                                                                                    {innerItem.countRF && innerItem.countRF > 0 && (
                                                                                                        <Button
                                                                                                            variant="primary"
                                                                                                            size="sm"
                                                                                                            className="text-xs"
                                                                                                            onClick={() => handleViewRefund(innerItem)}
                                                                                                        >
                                                                                                            Hóa đơn hoàn
                                                                                                        </Button>
                                                                                                    )}
                                                                                                </TableCell>
                                                                                            </TableRow>
                                                                                        ))
                                                                                    ) : (
                                                                                        <TableRow>
                                                                                            <TableCell colSpan={11} className="text-center py-8">
                                                                                                <p className="macos-body-secondary text-sm">Chưa có dữ liệu chi tiết</p>
                                                                                            </TableCell>
                                                                                        </TableRow>
                                                                                    )}
                                                                                </TableBody>
                                                                            </Table>
                                                                        </div>

                                                                        {/* Child Pagination */}
                                                                        {invoice.totalPageChild && invoice.totalPageChild > (childLimits[index] || 10) && (
                                                                            <div className="flex justify-center mt-4">
                                                                                <Pagination
                                                                                    currentPage={childPages[index] || 1}
                                                                                    totalPages={Math.ceil(invoice.totalPageChild / (childLimits[index] || 10))}
                                                                                    onPageChange={(newPage) => handleChildPageChange(newPage, index)}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </React.Fragment>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="text-center py-12">
                                                        <EmptyState
                                                            icon={
                                                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 011-1h6a2 2 0 011 1v2M7 7h10" />
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

                {/* Main Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center pt-6">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}

                {/* Refund Modal */}
                <Modal
                    isOpen={showRefundModal}
                    onClose={handleCloseRefundModal}
                    title="Chi tiết hóa đơn hoàn"
                    maxWidth="4xl"
                >
                    {selectedInvoiceForRefund && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Thông tin hóa đơn:</h4>
                                <p><strong>Mã HĐ:</strong> {selectedInvoiceForRefund.code}</p>
                                <p><strong>Người sử dụng:</strong> {selectedInvoiceForRefund.user.username} - {selectedInvoiceForRefund.user.last_name} {selectedInvoiceForRefund.user.first_name}</p>
                                <p><strong>Số tiền:</strong> {formatCurrency(selectedInvoiceForRefund.totalCredit)}</p>
                            </div>

                            <div className="space-y-4"></div>
                            <h4 className="font-semibold">Danh sách hóa đơn hoàn:</h4>

                            {refundLoading ? (
                                <div className="flex justify-center py-8">
                                    <LoadingSpinner size="md" />
                                    <span className="ml-2">Đang tải danh sách hoàn tiền...</span>
                                </div>
                            ) : refundList.length > 0 ? (
                                <div className="macos26-table-wrapper">
                                    <Table className="macos26-table">
                                        <TableHeader className="macos26-table-head">
                                            <TableRow>
                                                <TableHead className="macos26-table-header-cell">#</TableHead>
                                                <TableHead className="macos26-table-header-cell">Mã HĐ Hoàn</TableHead>
                                                <TableHead className="macos26-table-header-cell">Số tiền hoàn</TableHead>
                                                <TableHead className="macos26-table-header-cell">Ngày tạo</TableHead>
                                                <TableHead className="macos26-table-header-cell">Ghi chú</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {refundList.map((refund, index) => (
                                                <TableRow key={refund._id || index} className="macos26-table-row">
                                                    <TableCell className="macos26-table-cell text-center">
                                                        <Badge variant="secondary" className="font-mono text-xs">
                                                            {index + 1}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="macos26-table-cell">
                                                        <Badge variant="outline" className="font-mono text-xs">
                                                            {refund.code}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="macos26-table-cell">
                                                        <Badge variant="outline" className="text-green-600 border-green-200 text-xs">
                                                            {formatCurrency(refund.totalCredit || refund.amount)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="macos26-table-cell">
                                                        <Badge variant="outline" className="font-mono text-xs">
                                                            {formatDate(refund.created_time)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="macos26-table-cell">
                                                        <div className="text-xs max-w-[150px] break-words">
                                                            {refund.note || '-'}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <EmptyState
                                        icon={
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        }
                                        title="Không có hóa đơn hoàn nào"
                                        description="Không tìm thấy hóa đơn hoàn cho người dùng này"
                                    />
                                </div>
                            )}
                        </div>

                    )}
                </Modal>
            </div >
        </div >
    );
};

export default RequestDebitPage;
