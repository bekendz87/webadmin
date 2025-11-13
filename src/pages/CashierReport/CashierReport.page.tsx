import React, { useState, useEffect, useMemo } from 'react';
import { request } from '@/utils/request';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { API_ENDPOINTS } from '@/routerPath';
import { storage } from '@/utils/auth';
import { APP_CONFIG } from '@/constants/config';
import * as CashierTypes from '@/types/cashier';
import {
    CASHIER_TYPES,
    CASHIER_SOURCES,
    CASHIER_ACCOUNTING_OPTIONS,
    CASHIER_LIMIT_OPTIONS,
    getInvoiceTypeLabel,
    getCashInSourceLabel
} from '@/types/cashier';
import Filter, { FilterField, ExportOption } from '@/components/Filter/Filter';
import Pagination from '@/components/Pagination/Pagination';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Button,
    Badge
} from '@/components/ui';
import { useAlert } from '@/contexts/AlertContext';
import { useNotification } from '@/contexts/NotificationContext';
import { createNotification } from '@/utils/notification';
import OffsetModal from '@/components/Modal/OffsetModal';
import ChangeInvoiceTypeModal from '@/components/Modal/ChangeInvoiceTypeModal';

const CashierReportPage: React.FC = () => {
    const [data, setData] = useState < any[] > ([]);
    const [groups, setGroups] = useState < CashierTypes.CashierGroup[] > ([]);
    const [cashiers, setCashiers] = useState < CashierTypes.CashierUser[] > ([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState < string | null > (null);

    // Filter states - matching Angular version
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedGroups, setSelectedGroups] = useState < string[] > ([]);
    const [selectedCashier, setSelectedCashier] = useState('all');
    const [inputInvoiceCode, setInputInvoiceCode] = useState('');
    const [inputPhoneCreator, setInputPhoneCreator] = useState('');
    const [inputPhone, setInputPhone] = useState('');
    const [selectedType, setSelectedType] = useState('all_recharge');
    const [selectedSources, setSelectedSources] = useState < string[] > ([]);
    const [selectedAccounting, setSelectedAccounting] = useState('all');
    const [limits, setLimits] = useState(200);

    // Summary and pagination
    const [summary, setSummary] = useState < any > (null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const { showAlert } = useAlert();
    const { refreshNotifications } = useNotification();

    // Add offset modal state
    const [showOffsetModal, setShowOffsetModal] = useState(false);
    const [selectedOffsetInvoice, setSelectedOffsetInvoice] = useState(null);
    const [offsetLoading, setOffsetLoading] = useState(false);

    // Add change invoice type modal state
    const [showChangeTypeModal, setShowChangeTypeModal] = useState(false);
    const [selectedChangeInvoice, setSelectedChangeInvoice] = useState(null);
    const [changeTypeLoading, setChangeTypeLoading] = useState(false);

    // Helper functions
    const getAuthToken = () => {
        return storage.getItem < string > ('webadmin_auth_token') || storage.getItem < string > (APP_CONFIG.TOKEN_KEY);
    };

    // Initialize dates to today
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setDateFrom(today);
        setDateTo(today);
    }, []);

    // Load initial data
    useEffect(() => {
        loadGroups();
    }, []);

    // Load cashiers when groups change
    useEffect(() => {
        if (selectedGroups.length > 0) {
            loadCashiers();
        } else {
            setCashiers([]);
        }
    }, [selectedGroups]);

    // Reset sources when type changes
    useEffect(() => {
        setSelectedSources([]);
    }, [selectedType]);

    const loadGroups = async () => {
        try {
            const token = getAuthToken();
            const response = await request < any > ({
                method: 'GET',
                url: `${API_ENDPOINTS.CASHIER.groups}`,
                params: { showAll: true },
                headers: {
                    'oh_token': token ? token.replace(/^["']|["']$/g, '').replace(/\\"/g, '"') : ''
                }
            });

            if (response?.success && response.data) {
                setGroups(response.data);
            }
        } catch (error) {
            console.error('Error loading groups:', error);
        }
    };

    const loadCashiers = async () => {
        try {
            const token = getAuthToken();
            const response = await request < any > ({
                method: 'GET',
                url: `${API_ENDPOINTS.CASHIER.users}`,
                params: {
                    groups: selectedGroups.join(','),
                    show_all: true
                },
                headers: {
                    'oh_token': token ? token.replace(/^["']|["']$/g, '').replace(/\\"/g, '"') : ''
                }
            });

            if (response?.success && response.data) {
                setCashiers(response.data);
            }
        } catch (error) {
            console.error('Error loading cashiers:', error);
        }
    };

    const loadCashierReport = async (exportType, page) => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page,
                limit: limits,
                stat: 'recharge',
                cache: 'true'
            };

            // Date filters - format to match working request
            const fromDateValue = dateFrom || new Date().toISOString().split('T')[0];
            const toDateValue = dateTo || new Date().toISOString().split('T')[0];

            const fromDate = new Date(fromDateValue);
            fromDate.setHours(0, 0, 0, 0);
            params.from = fromDate.toISOString();

            const toDate = new Date(toDateValue);
            toDate.setHours(23, 59, 59, 999);
            params.to = toDate.toISOString();

            // Invoice type filter - always send invoiceType parameter
            params.invoiceType = selectedType || 'all_recharge';

            // Payment filter - add payment parameter
            params.payment = 'all'; // Default value, can be made configurable later

            // Report type filter - add report_type parameter  
            params.report_type = 'all'; // Default value for cashier reports

            // Other filters matching Angular
            if (inputInvoiceCode) {
                params.code = inputInvoiceCode;
            }

            if (inputPhoneCreator) {
                params.username_creator = inputPhoneCreator;
            }

            if (inputPhone) {
                params.username_user = inputPhone;
            }

            if (selectedGroups.length > 0) {
                params.group = selectedGroups.join(',');
            }

            if (selectedAccounting !== 'all') {
                params.isAccounting = selectedAccounting === 'true';
            }

            if (selectedSources.length > 0) {
                if (selectedType === 'debit') {
                    params.debit_sources = selectedSources;
                } else {
                    params.sources = selectedSources;
                }
            }

            const token = getAuthToken();

            // Export handling
            if (exportType) {
                params.export = exportType;
                params.template_name = 'oh_inv_card_excel';

                const queryParts = Object.entries(params)
                    .filter(([_, value]) => value !== undefined && value !== null)
                    .map(([key, value]) => `${key}=${Array.isArray(value) ? value.join(',') : value}`);

                const exportUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/invoices/list?${queryParts.join('&')}&oh_token=${token}`;
                window.open(exportUrl, '_blank');

                if (showAlert) {
                    showAlert('success', 'Xuất báo cáo thành công', 'Đang tải xuống file...', 4000);
                }
                return;
            }

            console.log('🚀 Making cashier report request with params:', params);

            const response = await request < any > ({
                method: 'GET',
                url: `${API_ENDPOINTS.CASHIER.list}`,
                params,
                headers: {
                    'oh_token': token ? token.replace(/^["']|["']$/g, '').replace(/\\"/g, '"') : ''
                }
            });

            if (response?.success) {
                const data = response.data || response.one_health_msg;
                if (data) {
                    setData(data.list || []);
                    setSummary({
                        report: data.report || {},
                        report_recharge: data.report_recharge || {},
                        cash_basis: (data.report?.totalCashIn || 0) - (data.report_recharge?.debit || 0)
                    });
                    setCurrentPage(page);
                    setTotalPages(Math.ceil((data.count || 0) / limits));

                    if (showAlert) {
                        showAlert('success', 'Tải dữ liệu thành công', `Tìm thấy ${data.list?.length || 0} bản ghi`, 4000);
                    }
                } else {
                    setData([]);
                    setSummary(null);
                    setError('Không có dữ liệu trả về');
                }
            } else {
                setData([]);
                setSummary(null);
                setError(response?.message || 'Không thể tải dữ liệu báo cáo nạp tài khoản');

                if (showAlert) {
                    showAlert('error', 'Lỗi tải dữ liệu', response?.message || 'Không thể tải dữ liệu báo cáo. Vui lòng thử lại.', 5000);
                }
            }
        } catch (error) {
            console.error('Error loading cashier report:', error);
            setData([]);
            setSummary(null);
            setError(error.message || 'Có lỗi xảy ra khi tải dữ liệu');

            if (showAlert) {
                showAlert('error', 'Lỗi tải dữ liệu', error.message || 'Có lỗi xảy ra khi tải dữ liệu', 5000);
            }
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        // Show reset alert
        if (showAlert) {
            showAlert('warning', 'Đặt lại bộ lọc', 'Đang tải lại dữ liệu với bộ lọc mặc định...', 2000);
        }

        // Reset all filter states
        const today = new Date().toISOString().split('T')[0];
        setDateFrom(today);
        setDateTo(today);
        setSelectedType('all_recharge');
        setSelectedSources([]);
        setSelectedAccounting('all');
        setInputInvoiceCode('');
        setInputPhoneCreator('');
        setInputPhone('');
        setSelectedGroups([]);
        setSelectedCashier('all');
        setLimits(200);
        setCurrentPage(1);

        // Clear current data and summary
        setData([]);
        setSummary(null);
        setError(null);

        // Reload data with default values after a short delay to ensure state updates
        setTimeout(() => {
            loadCashierReport(undefined, 1);
        }, 100);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        loadCashierReport(undefined, 1);
    };

    const handleExport = (type) => {
        if (!dateFrom || !dateTo) {
            if (showAlert) {
                showAlert('warning', 'Thông báo', 'Bạn phải chọn ngày bắt đầu và kết thúc để xuất báo cáo.', 4000);
            }
            return;
        }
        loadCashierReport(type);
    };

    const handlePageChange = (page) => {
        loadCashierReport(undefined, page);
    };

    // Filter fields definition using Filter component
    const filterFields = useMemo(() => [
        {
            type: 'date',
            name: 'dateFrom',
            label: 'Từ Ngày',
            value: dateFrom,
            onChange: setDateFrom,
            colSpan: 1
        },
        {
            type: 'date',
            name: 'dateTo',
            label: 'Đến Ngày',
            value: dateTo,
            onChange: setDateTo,
            colSpan: 1
        },
        {
            type: 'text',
            name: 'inputInvoiceCode',
            label: 'Mã HĐ',
            value: inputInvoiceCode,
            onChange: setInputInvoiceCode,
            placeholder: 'Nhập mã hóa đơn',
            colSpan: 1
        },
        {
            type: 'text',
            name: 'inputPhoneCreator',
            label: 'Tài khoản tạo',
            value: inputPhoneCreator,
            onChange: setInputPhoneCreator,
            placeholder: 'Nhập số điện thoại tạo',
            colSpan: 1
        },
        {
            type: 'text',
            name: 'inputPhone',
            label: 'Số điện thoại',
            value: inputPhone,
            onChange: setInputPhone,
            placeholder: 'Nhập số điện thoại',
            colSpan: 1
        },
        {
            type: 'select',
            name: 'selectedType',
            label: 'Dịch vụ',
            value: selectedType,
            onChange: setSelectedType,
            options: CASHIER_TYPES.map(item => ({
                key: item.key,
                text: item.label,
                value: item.key
            })),
            colSpan: 1
        },
        {
            type: 'multiselect',
            name: 'selectedSources',
            label: 'Nạp từ',
            value: selectedSources,
            onChange: setSelectedSources,
            options: CASHIER_SOURCES.map(item => ({
                key: item.key,
                text: item.label,
                value: item.label
            })),
            placeholder: 'Chọn nguồn nạp',
            colSpan: 1
        },
        {
            type: 'multiselect',
            name: 'selectedGroups',
            label: 'Nhóm tài khoản tạo',
            value: selectedGroups,
            onChange: setSelectedGroups,
            options: groups.map(group => ({
                key: group.name,
                text: group.name,
                value: group.name
            })),
            placeholder: 'Chọn nhóm',
            colSpan: 1
        },
        {
            type: 'select',
            name: 'selectedAccounting',
            label: 'Hạch toán',
            value: selectedAccounting,
            onChange: setSelectedAccounting,
            options: CASHIER_ACCOUNTING_OPTIONS.map(item => ({
                key: item.key,
                text: item.label,
                value: item.key
            })),
            colSpan: 1
        },
        {
            type: 'select',
            name: 'limits',
            label: 'Hoá đơn hiển thị',
            value: limits.toString(),
            onChange: (value) => setLimits(Number(value)),
            options: CASHIER_LIMIT_OPTIONS.map(limit => ({
                key: limit.toString(),
                text: limit.toString(),
                value: limit.toString()
            })),
            colSpan: 1
        }
    ], [
        dateFrom, dateTo, inputInvoiceCode, inputPhoneCreator, inputPhone,
        selectedType, selectedSources, selectedGroups, selectedAccounting,
        limits, groups
    ]);

    // Export options
    const exportOptions = [
        {
            type: 'excel',
            label: 'Xuất Excel',
            icon: (
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                </svg>
            )
        }
    ];

    // Summary table data - match card.html calculations
    const summaryData = useMemo(() => {
        if (!summary) return [];

        const reportRecharge = summary.report_recharge || {};

        // Calculate totals based on card.html logic
        const cashTotal = (reportRecharge.cash_topup || 0) +
            (reportRecharge.cash_transfer_visa_cash || 0) +
            (reportRecharge.cash_transfer_atm_cash || 0);

        const visaMasterTotal = (reportRecharge.cash_transfer_visa_credit || 0) +
            (reportRecharge.visa_master_topup || 0);

        return [
            {
                id: 'summary',
                type: 'Tổng cộng',
                cash_total: cashTotal,
                transfer_topup: reportRecharge.transfer_topup || 0,
                visa_master_total: visaMasterTotal,
                onepay_visa: reportRecharge.onepay_visa || 0,
                onepay_atm: reportRecharge.onepay_atm || 0
            },
        ];
    }, [summary]);

    // Calculate "Thực thu" based on card.html formula
    const calculateActualRevenue = useMemo(() => {
        if (!summary) return 0;

        const reportRecharge = summary.report_recharge || {};

        return (
            (reportRecharge.cash_topup || 0) +
            (reportRecharge.transfer_topup || 0) +
            (reportRecharge.visa_master_topup || 0) +
            (reportRecharge.onepay_visa || 0) +
            (reportRecharge.onepay_atm || 0)
        );
    }, [summary]);

    // Add handler functions for the new buttons
    const handleChangeInvoiceType = (invoice) => {
        setSelectedChangeInvoice(invoice);
        setShowChangeTypeModal(true);
    };

    const handlePrintInvoice = (invoice) => {
        console.log('Print invoice for:', invoice.code);
        if (showAlert) {
            showAlert('info', 'Thông báo', 'Tính năng in hóa đơn đang được phát triển', 3000);
        }
    };

    const handleOffset = (invoice) => {
        setSelectedOffsetInvoice(invoice);
        setShowOffsetModal(true);
    };

    const handleOffsetConfirm = async (amount) => {
        if (!selectedOffsetInvoice) { return; }

        try {
            setOffsetLoading(true);
            const token = getAuthToken();

            const response = await request({
                method: 'POST',
                url: `${API_ENDPOINTS.CASHIER.offset}`,
                body: {
                    invoiceId: selectedOffsetInvoice._id,
                    one_health_msg: {
                        totalCashMore: amount
                    }
                },
                headers: {
                    'oh_token': token ? token.replace(/^["']|["']$/g, '').replace(/\\"/g, '"') : ''
                }
            });

            if (response?.success || response?.result === 'true') {
                if (showAlert) {
                    showAlert(
                        'success',
                        'Cấn trừ thành công',
                        `Đã cấn trừ ${formatCurrency(amount)} cho hóa đơn ${selectedOffsetInvoice.code}`,
                        4000
                    );
                }

                // Create notification
                await createNotification({
                    title: 'Cấn trừ hóa đơn thành công',
                    message: `Đã cấn trừ ${formatCurrency(amount)} cho hóa đơn ${selectedOffsetInvoice.code}`,
                    type: 'success'
                });

                // Close modal and refresh data
                setShowOffsetModal(false);
                setSelectedOffsetInvoice(null);
                loadCashierReport(undefined, currentPage);
            } else {
                const errorMessage = response?.message || 'Lỗi cấn trừ vui lòng thử lại.';
                if (showAlert) {
                    showAlert('error', 'Lỗi cấn trừ', errorMessage, 5000);
                }
            }
        } catch (error) {
            console.error('Error processing offset:', error);
            if (showAlert) {
                showAlert('error', 'Lỗi cấn trừ', 'Có lỗi xảy ra khi cấn trừ hóa đơn', 5000);
            }
        } finally {
            setOffsetLoading(false);
        }
    };

    const handleOffsetClose = () => {
        if (!offsetLoading) {
            setShowOffsetModal(false);
            setSelectedOffsetInvoice(null);
        }
    };

    const handleChangeTypeConfirm = async (newType, ftCode) => {
        if (!selectedChangeInvoice) return;

        try {
            setChangeTypeLoading(true);
            const token = getAuthToken();

            const response = await request({
                method: 'POST',
                url: `${API_ENDPOINTS.CASHIER.changeType}`,
                body: {
                    one_health_msg: {
                        newTypeChange: newType,
                        invoiceId: selectedChangeInvoice._id,
                        codeFT: ftCode || ""
                    }
                },
                headers: {
                    'oh_token': token ? token.replace(/^["']|["']$/g, '').replace(/\\"/g, '"') : ''
                }
            });

            if (response?.success || response?.result === 'true') {
                if (showAlert) {
                    showAlert(
                        'success',
                        'Cập nhật thành công',
                        `Đã cập nhật nguồn tiền cho hóa đơn ${selectedChangeInvoice.code}`,
                        4000
                    );
                }

                // Create notification
                await createNotification({
                    title: 'Cập nhật nguồn tiền thành công',
                    message: `Đã cập nhật nguồn tiền cho hóa đơn ${selectedChangeInvoice.code}`,
                    type: 'success'
                });

                // Close modal and refresh data
                setShowChangeTypeModal(false);
                setSelectedChangeInvoice(null);
                loadCashierReport(undefined, currentPage);
            } else {
                const errorMessage = response?.message || 'Lỗi cập nhật nguồn tiền vui lòng thử lại.';
                if (showAlert) {
                    showAlert('error', 'Lỗi cập nhật', errorMessage, 5000);
                }
            }
        } catch (error) {
            console.error('Error changing invoice type:', error);
            if (showAlert) {
                showAlert('error', 'Lỗi cập nhật', 'Có lỗi xảy ra khi cập nhật nguồn tiền', 5000);
            }
        } finally {
            setChangeTypeLoading(false);
        }
    };

    const handleChangeTypeClose = () => {
        if (!changeTypeLoading) {
            setShowChangeTypeModal(false);
            setSelectedChangeInvoice(null);
        }
    };

    // Load data when component mounts
    useEffect(() => {
        if (dateFrom && dateTo) {
            loadCashierReport(undefined, 1);
        }
    }, []);

    // Auto-reload when limits change
    useEffect(() => {
        if (dateFrom && dateTo) {
            loadCashierReport(undefined, 1);
        }
    }, [limits]);

    return (
        <div className="macos-liquid-glass">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Header Section */}
                <div className="liquid-glass-header">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Báo cáo nạp tài khoản
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Báo cáo chi tiết các giao dịch nạp tài khoản theo từng dịch vụ
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filter Section using Filter Component */}
                <Card className="liquid-glass-card">
                    <Filter
                        fields={filterFields}
                        onSubmit={handleSubmit}
                        onReset={reset}
                        loading={loading}
                        title="Bộ lọc"
                        submitLabel="Báo cáo"
                        showExport={true}
                        onExport={handleExport}
                        exportOptions={exportOptions}
                    />
                </Card>

                {/* Error Alert */}
                {error && (
                    <div className="macos26-alert macos26-alert-error">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-500 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-red-800 dark:text-red-200">{error}</p>
                            </div>
                            <button
                                className="alert-close-btn"
                                onClick={() => setError(null)}
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Summary Section - Updated to match card.html structure */}
                {summary && summaryData.length > 0 && (
                    <Card className="liquid-glass-card">
                        <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-white">
                                Tổng báo cáo nạp tài khoản từ ngày {formatDate(dateFrom)} đến ngày {formatDate(dateTo)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Summary Table with horizontal scroll */}
                            <div className="macos26-table-wrapper">
                                <Table className="macos26-table">
                                    <TableHeader className="macos26-table-head">
                                        <TableRow>
                                            <TableHead className="macos26-table-header-cell min-w-[120px]">#</TableHead>
                                            <TableHead className="macos26-table-header-cell min-w-[120px]">Nạp tiền mặt</TableHead>
                                            <TableHead className="macos26-table-header-cell min-w-[140px]">Nạp tiền chuyển khoản</TableHead>
                                            <TableHead className="macos26-table-header-cell min-w-[140px]">Nạp tiền Visa/Master</TableHead>
                                            <TableHead className="macos26-table-header-cell min-w-[120px]">OnePay Visa</TableHead>
                                            <TableHead className="macos26-table-header-cell min-w-[120px]">OnePay ATM</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {summaryData.map((item, index) => (
                                            <TableRow key={item.id || index} className="macos26-table-row">
                                                <TableCell className="macos26-table-cell text-left font-medium">
                                                    {item.type}
                                                </TableCell>
                                                <TableCell className="macos26-table-cell text-center">
                                                    {item.cash_total ? formatCurrency(item.cash_total) : '—'}
                                                </TableCell>
                                                <TableCell className="macos26-table-cell text-center">
                                                    {item.transfer_topup ? formatCurrency(item.transfer_topup) : '—'}
                                                </TableCell>
                                                <TableCell className="macos26-table-cell text-center">
                                                    {item.visa_master_total ? formatCurrency(item.visa_master_total) : '—'}
                                                </TableCell>
                                                <TableCell className="macos26-table-cell text-center">
                                                    {item.onepay_visa ? formatCurrency(item.onepay_visa) : '—'}
                                                </TableCell>
                                                <TableCell className="macos26-table-cell text-center">
                                                    {item.onepay_atm ? formatCurrency(item.onepay_atm) : '—'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Thực thu section */}
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="macos26-info-card macos26-info-card-primary">
                                    <div className="flex justify-between items-center p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                                                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                                                    Thực thu
                                                </h4>
                                                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                                    Tổng tiền thực tế thu được
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                                                {formatCurrency(calculateActualRevenue)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Detail Table */}
                <Card className="liquid-glass-card">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">
                            Chi tiết báo cáo
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="macos26-table-wrapper">
                            <Table className="macos26-table">
                                <TableHeader className="macos26-table-head">
                                    <TableRow>
                                        <TableHead className="macos26-table-header-cell w-16">#</TableHead>
                                        <TableHead className="macos26-table-header-cell min-w-[140px]">Chỉnh hoá đơn</TableHead>
                                        <TableHead className="macos26-table-header-cell min-w-[120px]">Mã Hóa đơn</TableHead>
                                        <TableHead className="macos26-table-header-cell min-w-[150px]">Người tạo</TableHead>
                                        <TableHead className="macos26-table-header-cell min-w-[150px]">Người sử dụng</TableHead>
                                        <TableHead className="macos26-table-header-cell min-w-[120px]">Mã bệnh nhân</TableHead>
                                        <TableHead className="macos26-table-header-cell min-w-[150px]">Tên bệnh nhân</TableHead>
                                        <TableHead className="macos26-table-header-cell min-w-[120px]">Ngày tạo</TableHead>
                                        <TableHead className="macos26-table-header-cell min-w-[150px]">Loại</TableHead>
                                        <TableHead className="macos26-table-header-cell min-w-[140px]">Nạp tiền mặt</TableHead>
                                        <TableHead className="macos26-table-header-cell min-w-[200px]">Nạp tiền chuyển khoản</TableHead>
                                        <TableHead className="macos26-table-header-cell min-w-[150px]">Tổng nạp</TableHead>
                                        <TableHead className="macos26-table-header-cell min-w-[100px]">Mã FT</TableHead>
                                        <TableHead className="macos26-table-header-cell min-w-[140px]">Nguồn tiền nạp</TableHead>
                                        <TableHead className="macos26-table-header-cell min-w-[200px]">Cấn trừ chi nhánh</TableHead>
                                        <TableHead className="macos26-table-header-cell min-w-[150px]">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={16} className="macos26-table-loading">
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                                                    <span className="ml-2">Đang tải dữ liệu...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : !data || data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={16} className="macos26-table-empty">
                                                Không có dữ liệu báo cáo nào
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        data.map((record, index) => (
                                            <TableRow key={record._id || index} className="macos26-table-row">
                                                <TableCell className="macos26-table-cell text-center">
                                                    {(currentPage - 1) * limits + index + 1}
                                                </TableCell>
                                                <TableCell className="macos26-table-cell text-center">
                                                    {(record.invoiceType === 'onepay_visa' || record.invoiceType === 'onepay_atm') ? null : (
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => handleChangeInvoiceType(record)}
                                                            className="macos26-btn macos26-btn-secondary macos26-btn-sm"
                                                        >
                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                            </svg>
                                                            Chuyển hình thức
                                                        </Button>
                                                    )}
                                                </TableCell>
                                                <TableCell className="macos26-table-cell">
                                                    {record.code || '—'}
                                                </TableCell>
                                                <TableCell className="macos26-table-cell">
                                                    <div className="space-y-1">
                                                        <div className="font-medium">
                                                            {record.creator?.username || '—'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {record.creator?.last_name} {record.creator?.first_name}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="macos26-table-cell">
                                                    <div className="space-y-1">
                                                        <div className="font-medium">
                                                            {record.user?.username || '—'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {record.user?.last_name} {record.user?.first_name}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="macos26-table-cell">
                                                    {(() => {
                                                        const meta = record.meta || {};
                                                        if (meta.source === 'hong_duc') {
                                                            return meta.profile?.his_profile?.patient_code || '—';
                                                        } else {
                                                            const sourceProfile = meta.profile?.[meta.source || ''];
                                                            return sourceProfile?.patient_code || '—';
                                                        }
                                                    })()}
                                                </TableCell>
                                                <TableCell className="macos26-table-cell">
                                                    {record.meta?.profile?.name || '—'}
                                                </TableCell>
                                                <TableCell className="macos26-table-cell">
                                                    {record.created_time ? formatDate(record.created_time) : '—'}
                                                </TableCell>
                                                <TableCell className="macos26-table-cell">
                                                    <Badge
                                                        variant={record.invoiceType === 'debit' ? 'destructive' : 'default'}
                                                        className="cashier-badge"
                                                    >
                                                        {getInvoiceTypeLabel(record.invoiceType, record.ohSerial)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="macos26-table-cell text-right macos26-table-cell-amount">
                                                    {(() => {
                                                        if (record.invoiceType === 'debit') return '0';
                                                        const cashInSource = record.cash_in_source;
                                                        if (['cash_transfer_atm', 'cash_transfer_visa', 'cash'].includes(cashInSource)) {
                                                            return formatCurrency(record.originMoney || 0);
                                                        }
                                                        return '0';
                                                    })()}
                                                </TableCell>
                                                <TableCell className="macos26-table-cell text-right macos26-table-cell-amount">
                                                    {(() => {
                                                        if (record.invoiceType === 'debit') return '0';
                                                        const cashInSource = record.cash_in_source;
                                                        if (['cash_transfer_atm', 'cash_transfer_visa', 'transfer'].includes(cashInSource)) {
                                                            return formatCurrency(record.originCredit || 0);
                                                        }
                                                        return '0';
                                                    })()}
                                                </TableCell>
                                                <TableCell className="macos26-table-cell text-right macos26-table-cell-amount">
                                                    {record.invoiceType === 'debit' ? '0' : formatCurrency(record.totalCredit || 0)}
                                                </TableCell>
                                                <TableCell className="macos26-table-cell">
                                                    <Badge variant="outline" className="font-mono text-xs">
                                                        {record.meta?.transactionId || '—'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="macos26-table-cell">
                                                    <Badge variant="outline">
                                                        {getCashInSourceLabel(record.cash_in_source)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="macos26-table-cell text-right macos26-table-cell-amount">
                                                    {record.totalcashMore ? (
                                                        <span className="font-semibold text-orange-600 dark:text-orange-400">
                                                            {formatCurrency(record.totalcashMore)}
                                                        </span>
                                                    ) : '—'}
                                                </TableCell>
                                                <TableCell className="macos26-table-cell text-center">
                                                    <div className="flex flex-col gap-2 w-full">
                                                        {record.cash_in_source && record.cash_in_source !== '' && (
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={() => handlePrintInvoice(record)}
                                                                className="macos26-btn macos26-btn-secondary macos26-btn-sm w-full"
                                                            >
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                                </svg>
                                                                In hóa đơn
                                                            </Button>
                                                        )}
                                                        {record.cash_in_source === 'cash' && !record.totalcashMore && (
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleOffset(record)}
                                                                className="macos26-btn macos26-btn-danger macos26-btn-sm w-full"
                                                            >
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                </svg>
                                                                Cấn trừ
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

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
                    </CardContent>
                </Card>
            </div>

            {/* Offset Modal */}
            <OffsetModal
                isOpen={showOffsetModal}
                onClose={handleOffsetClose}
                invoice={selectedOffsetInvoice}
                onConfirm={handleOffsetConfirm}
                loading={offsetLoading}
            />

            {/* Change Invoice Type Modal */}
            <ChangeInvoiceTypeModal
                isOpen={showChangeTypeModal}
                onClose={handleChangeTypeClose}
                invoice={selectedChangeInvoice}
                onConfirm={handleChangeTypeConfirm}
                loading={changeTypeLoading}
            />
        </div>
    );
};

export default CashierReportPage;
