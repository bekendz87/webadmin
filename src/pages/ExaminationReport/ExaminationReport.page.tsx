import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { request } from '@/utils/request';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { API_ENDPOINTS } from '@/routerPath';
import { storage } from '@/utils/auth';
import { APP_CONFIG } from '@/constants/config';
import * as ExaminationTypes from '@/types/examination';
import Filter, { FilterField, ExportOption } from '@/components/Filter/Filter';
import Pagination from '@/components/Pagination/Pagination';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { useAlert } from '@/contexts/AlertContext';
import { useNotification } from '@/contexts/NotificationContext';
import { createNotification } from '@/utils/notification';
import ExaminationDetailModal from '@/components/Modal/ExaminationDetailModal';


const ExaminationReportPage: React.FC = () => {
    // State management - Fixed type annotations
    const [records, setRecords] = useState < ExaminationTypes.ExaminationRecord[] > ([]);
    const [report, setReport] = useState < ExaminationTypes.ExaminationReport > ({
        total: 0,
        count: 0,
        count_done: 0,
        count_sent: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState < string | null > (null);

    // Filter states
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedPaymentType, setSelectedPaymentType] = useState('');
    const [selectedSource, setSelectedSource] = useState('');
    const [selectedSourceApp, setSelectedSourceApp] = useState('');
    const [searchOption, setSearchOption] = useState < ExaminationTypes.SearchOptionValue > ('patient_code');
    const [selectedHealthService, setSelectedHealthService] = useState < ExaminationTypes.HealthService | null > (null);
    const [exportTemplate, setExportTemplate] = useState < string > ('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalDisplayed, setTotalDisplayed] = useState(20);
    const limit = 20;

    // Detail modal
    const [selectedRecord, setSelectedRecord] = useState < ExaminationTypes.ExaminationRecord | null > (null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const { showAlert } = useAlert();
    const { refreshNotifications } = useNotification();

    // Helper functions
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
            'X-Username': username,
            'oh_token': storage.getItem < string > ('webadmin_auth_token') || storage.getItem < string > (APP_CONFIG.TOKEN_KEY) || ''
        };
    };

    // Filter fields configuration
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
            type: 'select',
            name: 'selectedCategory',
            label: 'Loại',
            value: selectedCategory,
            onChange: setSelectedCategory,
            options: ExaminationTypes.EXAMINATION_TEMPLATES
        },
        {
            type: 'select',
            name: 'selectedPaymentType',
            label: 'Thanh toán',
            value: selectedPaymentType,
            onChange: setSelectedPaymentType,
            options: ExaminationTypes.PAYMENT_TYPES
        },
        {
            type: 'select',
            name: 'selectedSource',
            label: 'Nơi đặt khám',
            value: selectedSource,
            onChange: setSelectedSource,
            options: ExaminationTypes.SOURCES
        },
        {
            type: 'input',
            name: 'healthService',
            label: 'Dịch vụ',
            value: selectedHealthService ? selectedHealthService.name : '',
        },
        {
            type: 'select',
            name: 'searchOption',
            label: 'Tùy chọn tìm kiếm',
            value: searchOption,
            options: ExaminationTypes.SEARCH_OPTIONS,
            onChange: setSearchOption
        },
        {
            type: 'text',
            name: 'searchText',
            label: 'Từ khóa',
            placeholder: 'Nhập từ khóa tìm kiếm',
            value: searchText,
            onChange: setSearchText
        },

    ], [
        dateFrom, dateTo, selectedCategory, selectedPaymentType, selectedSource,
        selectedSourceApp, selectedHealthService, searchText, searchOption
    ]);


    // Export options
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
        },
        {
            type: 'pdf',
            label: 'Xuất PDF',
            icon: (
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
            )
        }
    ];

    // Fetch examination data
    const fetchExaminationData = async (page = 1, exportType: string, overrideFilters: any) => {
        try {
            setLoading(true);
            setError(null);

            if (showAlert) {
                showAlert(
                    'warning',
                    'Đang tải dữ liệu',
                    exportType ? 'Đang xuất báo cáo...' : 'Đang tải danh sách báo cáo khám...',
                    3000
                );
            }

            const params = {};

            // Use override filters if provided, otherwise use current state
            const filters = overrideFilters || {
                dateFrom,
                dateTo,
                selectedCategory,
                selectedPaymentType,
                selectedSource,
                selectedSourceApp,
                selectedHealthService,
                searchText,
                searchOption
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

            // Other filters
            if (filters.selectedCategory && filters.selectedCategory !== 'all') {
                params.category = filters.selectedCategory;
            }

            if (filters.selectedPaymentType) {
                params.payment = filters.selectedPaymentType;
            }

            if (filters.selectedSource) {
                params.source = filters.selectedSource;
            }

            if (filters.selectedSourceApp) {
                params.source_app = filters.selectedSourceApp;
            }

            if (filters.selectedHealthService) {
                params.healthService = filters.selectedHealthService._id;
            }

            if (filters.searchText) {
                params[filters.searchOption || 'patient_code'] = filters.searchText;
            }

            if (exportTemplate) {
                params.export_template = exportTemplate;
            }

            // Get token
            const token = storage.getItem < string > ('webadmin_auth_token') || storage.getItem < string > (APP_CONFIG.TOKEN_KEY);

            // Export handling
            if (exportType) {
                params.export = exportType;

                const queryParts = [];
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        queryParts.push(`${key}=${value}`);
                    }
                });

                const exportUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/order/examination/report?${queryParts.join('&')}&oh_token=${token}`;
                window.open(exportUrl, '_blank');

                if (showAlert) {
                    showAlert(
                        'success',
                        'Xuất báo cáo thành công',
                        `Đang tải xuống file ${exportType.toUpperCase()}...`,
                        4000
                    );
                }

                await createNotification(
                    {
                        title: 'Bạn vừa xuất báo cáo khám thành công',
                        message: `Đã xuất báo cáo định dạng ${exportType.toUpperCase()}`,
                        type: 'success'
                    }
                );

                return;
            }

            const response = await request < ExaminationTypes.ExaminationApiResponse > ({
                method: 'GET',
                url: `${API_ENDPOINTS.EXAMINATION_REPORT}/list`,
                params,
                headers: getRequestHeaders()
            });

            if (response?.success) {
                const data = response.data || response.one_health_msg || [];

                if (Array.isArray(data) && data.length > 0) {
                    // Calculate totals
                    let totalAmount = 0;
                    let totalCount = 0;
                    let totalCountDone = 0;
                    let totalCountSent = 0;

                    data.forEach(item => {
                        if (item.services) {
                            totalCount += item.services.length;
                        }
                        totalCountDone += item.count_done || 0;
                        totalCountSent += item.count_sent || 0;
                        totalAmount += item.total || 0;
                    });

                    setRecords(data);
                    setReport({
                        total: totalAmount,
                        count: totalCount,
                        count_done: totalCountDone,
                        count_sent: totalCountSent
                    });

                    // Handle pagination
                    const displayLimit = Math.min(totalDisplayed, data.length);
                    setTotalPages(Math.ceil(data.length / limit));
                    setCurrentPage(page);

                    if (showAlert) {
                        showAlert(
                            'success',
                            'Tải dữ liệu thành công',
                            `Tìm thấy ${data.length} bản ghi`,
                            4000
                        );
                    }

                    await createNotification(
                        {
                            title: 'Tải dữ liệu báo cáo khám thành công',
                            message: `Đã tải ${data.length} bản ghi`,
                            type: 'success'
                        }
                    );
                } else {
                    setRecords([]);

                    if (showAlert) {
                        showAlert(
                            'success',
                            'Tải dữ liệu thành công',
                            `Tìm thấy ${data.length} bản ghi`,
                            4000
                        );
                    }
                }
            } else {
                console.error('❌ Request failed:', response);
                setRecords([]);
                setError(response?.message || 'Không thể tải dữ liệu báo cáo khám');

                console.log('🚨 Showing error alert...');
                if (showAlert) {
                    showAlert(
                        'error',
                        'Lỗi tải dữ liệu',
                        response?.message || 'Không thể tải dữ liệu báo cáo gói khám. Vui lòng thử lại.',
                        5000
                    );
                }
            }
        } catch (error) {
            console.error('💥 Error fetching examination data:', error);
            setRecords([]);
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

    // Event handlers
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        setTotalDisplayed(20);
        fetchExaminationData(1, '', {});
    };

    const handleExport = (type) => {
        // Validation
        if (!dateFrom || !dateTo) {
            if (showAlert) {
                showAlert(
                    'warning',
                    'Thiếu thông tin',
                    'Bạn phải chọn ngày bắt đầu và kết thúc để xuất báo cáo.',
                    4000
                );
            }
            return;
        }

        if (type === 'excel') {
            // Show template selection modal or use default
            fetchExaminationData(currentPage, type, {});
        } else {
            fetchExaminationData(currentPage, type, {});
        }
    };

    const handleLoadMore = () => {
        setTotalDisplayed(prev => Math.min(prev + 20, records.length));
    };

    const handleViewDetail = (record: ExaminationTypes.ExaminationRecord) => {
        setSelectedRecord(record);
        setShowDetailModal(true);
    };

    const handleCloseDetail = () => {
        setShowDetailModal(false);
        setSelectedRecord(null);
    };

    const resetFilters = () => {
        console.log('🚨 Showing reset filters alert...');
        if (showAlert) {
            showAlert(
                'warning',
                'Đặt lại bộ lọc',
                'Đang tải lại dữ liệu với bộ lọc mặc định...',
                2000
            );
        }

        setDateFrom('');
        setDateTo('');
        setSearchText('');
        setSelectedCategory('all');
        setSelectedPaymentType('');
        setSelectedSource('');
        setSelectedSourceApp('');
        setSearchOption('patient_code');
        setSelectedHealthService(null);
        setCurrentPage(1);
        setTotalDisplayed(20);

        fetchExaminationData(1, '', {
            dateFrom: '',
            dateTo: '',
            searchText: '',
            selectedCategory: 'all',
            selectedPaymentType: '',
            selectedSource: '',
            selectedSourceApp: '',
            selectedHealthService: null,
            searchOption: 'patient_code'
        });
    };

    // Helper functions for display
    // Helper functions for display
    const getGenderText = (sex) => {
        return sex === 'male' ? 'Nam' : sex === 'female' ? 'Nữ' : '';
    };

    const getPaymentText = (payment) => {
        return payment === 'postpaid' ? 'Tiền mặt' : payment === 'prepay' ? 'Credit DrOH' : '';
    };

    const getSourceAppText = (source) => {
        if (source === 'mb_bank') return 'Mini App MB Bank';
        if (source === 'momo') return 'Mini App Momo';
        return 'Website + App';
    };

    // Get currently displayed records
    const displayedRecords = records.slice(0, totalDisplayed);

    // Initial load
    useEffect(() => {
        fetchExaminationData(1, '', {});
    }, []);

    return (
        <div className="macos-liquid-glass">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="liquid-glass-header mb-6">
                    <div className="sm:flex sm:items-center">
                        <div className="sm:flex-auto">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Báo cáo gói khám
                            </h1>
                            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                Quản lý và báo cáo các gói khám bệnh, dịch vụ cận lâm sàn
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="liquid-glass-card mb-6">
                    <Filter
                        fields={filterFields}
                        onSubmit={handleSubmit}
                        onReset={resetFilters}
                        loading={loading}
                        title="Bộ lọc"
                        submitLabel="Tìm kiếm"
                        showExport={true}
                        onExport={handleExport}
                        exportOptions={exportOptions}

                    />
                </div>

                {/* Report Summary */}
                <div className="invoice-summary-grid mb-8">
                    {/* Total Services Card */}
                    <div className="macos26-info-card macos26-info-card-primary">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="macos26-info-label">
                                    Số lượng ĐK
                                </p>
                                <p className="macos26-info-value macos26-info-value-accent text-2xl">
                                    {report.count} dịch vụ
                                </p>
                            </div>
                            <div className="invoice-card-icon invoice-card-icon-blue w-12 h-12 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Results Available Card */}
                    <div className="macos26-info-card macos26-info-card-success">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="macos26-info-label">
                                    Đã có kết quả
                                </p>
                                <p className="macos26-info-value macos26-info-value-accent text-2xl">
                                    {report.count_done} dịch vụ
                                </p>
                            </div>
                            <div className="invoice-card-icon invoice-card-icon-green w-12 h-12 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Sent Results Card */}
                    <div className="macos26-info-card">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="macos26-info-label">
                                    Đã gửi
                                </p>
                                <p className="macos26-info-value macos26-info-value-accent text-2xl">
                                    {report.count_sent} dịch vụ
                                </p>
                            </div>
                            <div className="invoice-card-icon invoice-card-icon-yellow w-12 h-12 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Total Amount Card */}
                    <div className="macos26-info-card">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="macos26-info-label">
                                    Tổng tiền
                                </p>
                                <p className="macos26-info-value macos26-info-value-accent text-2xl">
                                    {formatCurrency(report.total)}
                                </p>
                            </div>
                            <div className="invoice-card-icon invoice-card-icon-red w-12 h-12 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="liquid-glass-card">
                    <div className="p-6 border-b border-white/10">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Danh sách báo cáo khám
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <span>Hiển thị: {Math.min(totalDisplayed, records.length)} / {records.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
                                <span className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                                    Đang tải dữ liệu báo cáo khám...
                                </span>
                            </div>
                        ) : (
                            <div className="macos26-table-wrapper">
                                <Table className="macos26-table" showScrollHint={true}
                                    scrollHintText="Kéo ngang để xem thêm dữ liệu">
                                    <TableHead className="macos26-table-head">
                                        <TableRow>
                                            <TableHead className="macos26-table-header-cell w-16">#</TableHead>
                                            <TableHead className="macos26-table-header-cell min-w-[120px]">Mã đơn hàng</TableHead>
                                            <TableHead className="macos26-table-header-cell min-w-[150px]">Tên</TableHead>
                                            <TableHead className="macos26-table-header-cell min-w-[100px]">Giới tính</TableHead>
                                            <TableHead className="macos26-table-header-cell min-w-[120px]">Tài khoản</TableHead>
                                            <TableHead className="macos26-table-header-cell min-w-[120px]">Ngày sinh</TableHead>
                                            <TableHead className="macos26-table-header-cell min-w-[120px]">Mã bệnh nhân</TableHead>
                                            <TableHead className="macos26-table-header-cell min-w-[120px]">Xác nhận</TableHead>
                                            <TableHead className="macos26-table-header-cell min-w-[150px]">Công ty</TableHead>
                                            <TableHead className="macos26-table-header-cell min-w-[130px]">Tổng tiền</TableHead>
                                            <TableHead className="macos26-table-header-cell min-w-[150px]">Ngày xác nhận</TableHead>
                                            <TableHead className="macos26-table-header-cell min-w-[120px]">Nơi đặt khám</TableHead>
                                            <TableHead className="macos26-table-header-cell min-w-[140px]">Trạng thái</TableHead>
                                            <TableHead className="macos26-table-header-cell min-w-[140px]">Mã HĐ bệnh viện</TableHead>
                                            <TableHead className="macos26-table-header-cell min-w-[120px]">Telemedicine</TableHead>
                                            <TableHead className="macos26-table-header-cell min-w-[150px]">Bác sĩ</TableHead>
                                            <TableHead className="macos26-table-header-cell min-w-[120px]">Ứng dụng</TableHead>
                                            <TableHead className="macos26-table-header-cell w-32">Thao tác</TableHead>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {displayedRecords.length > 0 ? (
                                            displayedRecords.map((record, index) => (
                                                <TableRow key={record._id || index} className="macos26-table-row">
                                                    <TableCell className="macos26-table-cell font-medium text-center">
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell className="macos26-table-cell">
                                                        <span className="font-medium text-[var(--accent)]">
                                                            {record.code}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="macos26-table-cell">
                                                        <div className="font-medium">{record.name}</div>
                                                    </TableCell>
                                                    <TableCell className="macos26-table-cell">
                                                        <span>{getGenderText(record.sex)}</span>
                                                    </TableCell>
                                                    <TableCell className="macos26-table-cell">
                                                        <div className="font-medium">{record.username}</div>
                                                    </TableCell>
                                                    <TableCell className="macos26-table-cell">
                                                        <div>{formatDate(record.birthday)}</div>
                                                    </TableCell>
                                                    <TableCell className="macos26-table-cell">
                                                        <span className="font-medium">{record.patient_code}</span>
                                                    </TableCell>
                                                    <TableCell className="macos26-table-cell">
                                                        <div className="text-sm">{record.user_confirm}</div>
                                                    </TableCell>
                                                    <TableCell className="macos26-table-cell">
                                                        <div className="space-y-1">
                                                            <div className="font-medium">{record.series_exam_name}</div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                {record.series_exam_code}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="macos26-table-cell">
                                                        <span className="macos26-table-cell-number font-medium text-green-600 dark:text-green-400">
                                                            {formatCurrency(record.total)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="macos26-table-cell">
                                                        <div>
                                                            {record.confirm_time ? formatDate(record.confirm_time) : ''}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="macos26-table-cell">
                                                        <div className="text-sm">{record.source}</div>
                                                    </TableCell>
                                                    <TableCell className="macos26-table-cell">
                                                        <div className="text-sm">{record.order_status}</div>
                                                    </TableCell>
                                                    <TableCell className="macos26-table-cell">
                                                        <div className="text-sm">{record.his_invoice_code}</div>
                                                    </TableCell>
                                                    <TableCell className="macos26-table-cell text-center">
                                                        <strong>{record.order_meta?.doctor ? 'X' : ''}</strong>
                                                    </TableCell>
                                                    <TableCell className="macos26-table-cell">
                                                        {record.doctor_info && (
                                                            <div className="space-y-1">
                                                                <div className="font-medium">{record.doctor_info.username}</div>
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {record.doctor_info.last_name} {record.doctor_info.first_name}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="macos26-table-cell">
                                                        <div className="text-sm">
                                                            {getSourceAppText(record.mini_app_source)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="macos26-table-cell">
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={() => handleViewDetail(record)}
                                                            className="macos26-btn macos26-btn-primary macos26-btn-sm"
                                                        >
                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            Chi tiết
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow className="macos26-table-row">
                                                <TableCell colSpan={18} className="macos26-table-cell text-center py-12">
                                                    <div className="macos26-table-empty">
                                                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        <div>Chưa có dữ liệu báo cáo khám nào</div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
               
                    {/* Load More Button */}
                    {totalDisplayed < records.length && (
                        <div className="px-6 pb-6">
                            <div className="flex justify-center">
                                <Button
                                    onClick={handleLoadMore}
                                    className="macos26-btn macos26-btn-secondary macos26-btn-md"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                    Tải thêm ({records.length - totalDisplayed} còn lại)
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Detail Modal */}
                <ExaminationDetailModal
                    isOpen={showDetailModal}
                    onClose={handleCloseDetail}
                    record={selectedRecord}
                    getPaymentText={getPaymentText}
                />
            </div>
        </div>
    );
};

export default ExaminationReportPage;
