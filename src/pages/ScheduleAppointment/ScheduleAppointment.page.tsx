import React, { useState, useEffect, useMemo } from 'react';
import { request } from '@/utils/request';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { API_ENDPOINTS } from '@/routerPath';
import { storage } from '@/utils/auth';
import { APP_CONFIG } from '@/constants/config';
import * as ScheduleAppointmentTypes from '@/types/scheduleAppointment';
import Filter, { FilterField, ExportOption } from '@/components/Filter/Filter';
import Pagination from '@/components/Pagination/Pagination';
import { Table, TableColumn } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { useAlert } from '@/contexts/AlertContext';
import { useNotification } from '@/contexts/NotificationContext';
import { NotificationApiResponse } from '@/types/notification';
import { createNotification } from '@/utils/notification';

// Fallback constants in case imports fail
const APPOINTMENT_SOURCES_FALLBACK = [
    { text: "Tất cả", key: "all" },
    { text: "Ung Bướu", key: "ung_buou" },
    { text: "Hồng Đức", key: "hong_duc" },
    { text: "Nhi Đồng", key: "nhi_dong" }
];

const APPOINTMENT_TYPES_FALLBACK = [
    { text: "Tất cả", key: "all" },
    { text: "Thanh toán", key: "payment" },
    { text: "Hoàn tiền", key: "refund" }
];

const FILTER_TYPE_DATES_FALLBACK = [
    { text: "Ngày tạo hoá đơn đặt khám", key: "created_time" },
    { text: "Ngày đặt khám", key: "exam_date" }
];

const FILTER_TYPE_APPOINTMENTS_FALLBACK = [
    { text: "Tất cả", key: "all" },
    { text: "Đã thanh toán", key: "paid" },
    { text: "Đã hoàn thành", key: "done" },
    { text: "Đã đăng ký", key: "registed" },
    { text: "Hoàn tiền", key: "refund" },
    { text: "Hết hạn", key: "expire" }
];

const ScheduleAppointmentPage: React.FC = () => {
    const [list, setList] = useState < ScheduleAppointmentTypes.ScheduleAppointmentItem[] > ([]);
    const [report, setReport] = useState < ScheduleAppointmentTypes.ScheduleAppointmentReport > ({
        total_paid: 0,
        total_refund: 0,
        count: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState < string | null > (null);

    // Filter states
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedTypeDate, setSelectedTypeDate] = useState('created_time');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedTypeAppointment, setSelectedTypeAppointment] = useState('all');
    const [selectedSource, setSelectedSource] = useState('all');
    const [filterPatientCode, setFilterPatientCode] = useState('');
    const [filterOrderCode, setFilterOrderCode] = useState('');
    const [filterInvoiceCode, setFilterInvoiceCode] = useState('');
    const [filterUsername, setFilterUsername] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 25;

    // Use AlertContext and NotificationContext
    const { showAlert } = useAlert();
    const { refreshNotifications } = useNotification();

    // Use fallbacks if imports are undefined
    const appointmentSources = ScheduleAppointmentTypes.APPOINTMENT_SOURCES || APPOINTMENT_SOURCES_FALLBACK;
    const appointmentTypes = ScheduleAppointmentTypes.APPOINTMENT_TYPES || APPOINTMENT_TYPES_FALLBACK;
    const filterTypeDates = ScheduleAppointmentTypes.FILTER_TYPE_DATES || FILTER_TYPE_DATES_FALLBACK;
    const filterTypeAppointments = ScheduleAppointmentTypes.FILTER_TYPE_APPOINTMENTS || FILTER_TYPE_APPOINTMENTS_FALLBACK;

    // Define filter fields configuration
    const filterFields: FilterField[] = useMemo(() => {
        const baseFields: FilterField[] = [
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
                name: 'selectedTypeDate',
                label: 'Loại ngày',
                value: selectedTypeDate,
                onChange: setSelectedTypeDate,
                options: filterTypeDates
            }
        ];

        // Conditional field based on selectedTypeDate
        if (selectedTypeDate === 'created_time') {
            baseFields.push({
                type: 'select',
                name: 'selectedType',
                label: 'Loại hoá đơn',
                value: selectedType,
                onChange: setSelectedType,
                options: appointmentTypes
            });
        } else {
            baseFields.push({
                type: 'select',
                name: 'selectedTypeAppointment',
                label: 'Loại đặt khám',
                value: selectedTypeAppointment,
                onChange: setSelectedTypeAppointment,
                options: filterTypeAppointments
            });
        }

        // Additional filter fields
        baseFields.push(
            {
                type: 'select',
                name: 'selectedSource',
                label: 'Bệnh viện',
                value: selectedSource,
                onChange: setSelectedSource,
                options: appointmentSources
            },
            {
                type: 'text',
                name: 'filterPatientCode',
                label: 'Mã bệnh nhân',
                placeholder: 'Mã bệnh nhân',
                value: filterPatientCode,
                onChange: setFilterPatientCode
            },
            {
                type: 'text',
                name: 'filterOrderCode',
                label: 'Mã đặt khám',
                placeholder: 'Mã đặt khám',
                value: filterOrderCode,
                onChange: setFilterOrderCode
            },
            {
                type: 'text',
                name: 'filterInvoiceCode',
                label: 'Mã hoá đơn',
                placeholder: 'Mã hoá đơn',
                value: filterInvoiceCode,
                onChange: setFilterInvoiceCode
            },
            {
                type: 'text',
                name: 'filterUsername',
                label: 'Tài khoản đặt khám',
                placeholder: 'Tài khoản',
                value: filterUsername,
                onChange: setFilterUsername
            }
        );

        return baseFields;
    }, [
        dateFrom, dateTo, selectedTypeDate, selectedType, selectedTypeAppointment,
        selectedSource, filterPatientCode, filterOrderCode, filterInvoiceCode, filterUsername,
        appointmentSources, appointmentTypes, filterTypeDates, filterTypeAppointments
    ]);

    // Define export options for this page
    const exportOptions: ExportOption[] = [
        {
            type: 'excel',
            label: 'Excel',
            icon: (
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
            )
        }
    ];

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
        const token = storage.getItem < string > ('webadmin_auth_token') || storage.getItem < string > (APP_CONFIG.TOKEN_KEY);
        return {
            'Content-Type': 'application/json',
            'X-User-ID': userId,
            'X-Username': username,
            'oh_token': token ? token.replace(/^["']|["']$/g, '').replace(/\\"/g, '"') : ''
        };
    };

    const fetchScheduleAppointmentList = async (
        page = 1,
        exportType?: 'excel' | 'pdf',
        exportTemplate?: 'accountant' | 'operate',
        overrideFilters?: {
            dateFrom?: string;
            dateTo?: string;
            selectedTypeDate?: string;
            selectedType?: string;
            selectedTypeAppointment?: string;
            selectedSource?: string;
            filterPatientCode?: string;
            filterOrderCode?: string;
            filterInvoiceCode?: string;
            filterUsername?: string;
        }
    ) => {
        try {
            setLoading(true);
            setError(null);

            // Show loading alert
            if (exportType) {
                showAlert(
                    'warning',
                    'Đang xuất báo cáo',
                    `Đang chuẩn bị file ${exportType === 'excel' ? 'Excel' : 'PDF'} báo cáo đặt khám...`,
                    3000
                );
            } else {
                showAlert(
                    'warning',
                    'Đang tải dữ liệu',
                    'Đang tải báo cáo đặt khám bệnh viện...',
                    2000
                );
            }

            const params: any = {
                page: page.toString(),
                limit: limit.toString()
            };

            // Use override filters if provided, otherwise use current state
            const filters = overrideFilters || {
                dateFrom,
                dateTo,
                selectedTypeDate,
                selectedType,
                selectedTypeAppointment,
                selectedSource,
                filterPatientCode,
                filterOrderCode,
                filterInvoiceCode,
                filterUsername
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

            // Filter parameters
            if (filters.selectedSource !== 'all') {
                params.source = filters.selectedSource;
            }

            if (filters.selectedTypeDate === 'created_time') {
                params.selectedTypeDate = filters.selectedTypeDate;
                if (filters.selectedType !== 'all') {
                    params.type = filters.selectedType;
                }
            } else {
                if (filters.selectedTypeAppointment !== 'all') {
                    params.selectedTypeAppointment = filters.selectedTypeAppointment;
                }
            }

            if (filters.filterPatientCode) {
                params.patient_code = filters.filterPatientCode;
            }

            if (filters.filterOrderCode) {
                params.order_code = filters.filterOrderCode;
            }

            if (filters.filterInvoiceCode) {
                params.invoice_code = filters.filterInvoiceCode;
            }

            if (filters.filterUsername) {
                params.username = filters.filterUsername;
            }

            // Export handling
            if (exportType && exportTemplate) {
                params.export = exportType;
                params.export_template = exportTemplate;

                const queryParts = [];
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        queryParts.push(`${key}=${value}`);
                    }
                });

                const token = storage.getItem < string > ('webadmin_auth_token') || storage.getItem < string > (APP_CONFIG.TOKEN_KEY);
                queryParts.push(`oh_token=${token?.replace(/^["']|["']$/g, '').replace(/\\"/g, '"')}`);

                const exportUrl = exportTemplate === 'accountant' ?
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/report/schedule-appointment/list/accountant?${queryParts.join('&')}` :
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/other_hos/schedule_appointments/report?${queryParts.join('&')}`;

                window.open(exportUrl, '_blank');

                // Show export success alert
                showAlert(
                    'success',
                    'Xuất báo cáo thành công',
                    `File ${exportType === 'excel' ? 'Excel' : 'PDF'} đã được tạo và tải xuống`,
                    4000
                );

                // Create notification for export
                await createNotification(
                    {
                        title: 'Xuất báo cáo đặt khám thành công',
                        message: `Báo cáo định dạng ${exportType === 'excel' ? 'Excel' : 'PDF'} đã được tạo thành công và tải xuống.`,
                        type: 'success'
                    }
                );

                return;
            }

            const token = storage.getItem < string > ('webadmin_auth_token') || storage.getItem < string > (APP_CONFIG.TOKEN_KEY);

            const response = await request < ScheduleAppointmentTypes.ScheduleAppointmentApiResponse > ({
                method: 'GET',
                url: `${API_ENDPOINTS.SCHEDULE_APPOINTMENT}/list`,
                params,
                headers: getRequestHeaders()
            });

            if (response?.success) {
                // Process the list data similar to AngularJS controller
                const processedList = (response.list || []).map(item => {
                    const amount_origin = item.item?.amount_origin || 0;
                    return {
                        ...item,
                        appoint_code: item.schedule_appointment?.code && item.invoiceType === "schedule_appointment" ? item.schedule_appointment.code : "",
                        patient_code: item.schedule_appointment?.patient_code || "",
                        source: item.schedule_appointment?.source || "",
                        book_price: item.originCredit ? item.originCredit - amount_origin : 0,
                        exam_price: amount_origin,
                        discountCredit: item.discountCredit || 0,
                        user: selectedTypeDate !== "created_time" ? item.schedule_appointment?.user || item.user : item.user
                    };
                });

                setList(processedList);
                setReport(response.report);
                setTotalPages(Math.ceil((response.total || 0) / limit));
                setCurrentPage(page);

                // Show success alert
                showAlert(
                    'success',
                    'Tải dữ liệu thành công',
                    `Tìm thấy ${processedList.length} bản ghi đặt khám. Tổng thu: ${formatCurrency(response.report.total_paid)}`,
                    4000
                );

                // Create notification for successful data load
                const hasFilters = Object.values(overrideFilters || {
                    dateFrom, dateTo, selectedSource, filterPatientCode, filterOrderCode, filterInvoiceCode, filterUsername
                }).some(filter => filter && filter !== 'all' && filter !== 'created_time');

            } else {
                setList([]);
                const errorMsg = 'Không thể tải dữ liệu báo cáo đặt khám';
                setError(errorMsg);

                showAlert(
                    'error',
                    'Lỗi tải dữ liệu',
                    errorMsg,
                    5000
                );

                await createNotification(
                    {
                        title: 'Lỗi tải dữ liệu báo cáo đặt khám',
                        message: errorMsg,
                        type: 'error'
                    }
                );
            }
        } catch (error: any) {
            console.error('Error fetching schedule appointment list:', error);
            setList([]);
            const errorMessage = error.message || 'Có lỗi xảy ra khi tải dữ liệu';
            setError(errorMessage);

            showAlert(
                'error',
                'Lỗi hệ thống',
                errorMessage,
                5000
            );

            await createNotification(
                {
                    title: 'Lỗi hệ thống khi tải báo cáo đặt khám',
                    message: errorMessage,
                    type: 'error'
                }
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);

        // Create notification for search action
        const filterSummary = [];
        if (dateFrom) filterSummary.push(`từ ${formatDate(dateFrom)}`);
        if (dateTo) filterSummary.push(`đến ${formatDate(dateTo)}`);
        if (selectedSource !== 'all') filterSummary.push(`bệnh viện ${getSourceLabel(selectedSource)}`);
        if (filterPatientCode) filterSummary.push(`mã BN: ${filterPatientCode}`);
        if (filterOrderCode) filterSummary.push(`mã đặt khám: ${filterOrderCode}`);

        if (filterSummary.length > 0) {
            await createNotification(
                {
                    title: 'Thực hiện tìm kiếm báo cáo đặt khám',
                    message: `Tìm kiếm với bộ lọc: ${filterSummary.join(', ')}`,
                    type: 'info'
                }
            );
        }

        fetchScheduleAppointmentList(1);
    };

    const handlePageChange = (page: number) => {
        fetchScheduleAppointmentList(page);
    };

    const handleExport = async (type: 'excel' | 'pdf') => {
        if (type === 'excel') {
            const template = window.confirm('Chọn template:\nOK = Kế toán\nCancel = Vận hành') ? 'accountant' : 'operate';

            // Create notification for export action
            await createNotification(
                {
                    title: 'Bắt đầu xuất báo cáo Excel',
                    message: `Đang chuẩn bị báo cáo đặt khám định dạng Excel với template ${template === 'accountant' ? 'Kế toán' : 'Vận hành'}`,
                    type: 'info'
                }
            );

            fetchScheduleAppointmentList(currentPage, type, template);
        } else {
            await createNotification(
                {
                    title: 'Bắt đầu xuất báo cáo PDF',
                    message: 'Đang chuẩn bị báo cáo Vận hành định dạng PDF',
                    type: 'info'
                }
            );

            fetchScheduleAppointmentList(currentPage, type, 'operate');
        }
    };

    const resetFilters = async () => {
        // Reset all filter states
        setDateFrom('');
        setDateTo('');
        setSelectedTypeDate('created_time');
        setSelectedType('all');
        setSelectedTypeAppointment('all');
        setSelectedSource('all');
        setFilterPatientCode('');
        setFilterOrderCode('');
        setFilterInvoiceCode('');
        setFilterUsername('');
        setCurrentPage(1);

        // Show reset alert
        showAlert(
            'info',
            'Đã reset bộ lọc',
            'Tất cả bộ lọc đã được đặt lại về mặc định',
            3000
        );

        // Fetch data with default filter values passed directly
        fetchScheduleAppointmentList(1, undefined, undefined, {
            dateFrom: '',
            dateTo: '',
            selectedTypeDate: 'created_time',
            selectedType: 'all',
            selectedTypeAppointment: 'all',
            selectedSource: 'all',
            filterPatientCode: '',
            filterOrderCode: '',
            filterInvoiceCode: '',
            filterUsername: ''
        });
    };

    const getSourceLabel = (source: string) => {
        const sourceMap: { [key: string]: string } = {
            'ung_buou': 'Ung Bướu',
            'hong_duc': 'Hồng Đức',
            'nhi_dong': 'Nhi Đồng'
        };
        return sourceMap[source] || source;
    };

    const getInvoiceTypeLabel = (type: string) => {
        const typeMap: { [key: string]: string } = {
            'schedule_appointment': 'Đặt khám',
            'refund_schedule_appointment': 'Hoàn tiền đặt khám'
        };
        return typeMap[type] || type;
    };

    useEffect(() => {
        fetchScheduleAppointmentList();
    }, []);

    // Define table columns
    const columns: TableColumn[] = useMemo(() => [
        {
            key: 'index',
            title: '#',
            width: '60px',
            className: 'text-center',
            render: (_, __, index) => (currentPage - 1) * limit + index + 1
        },
        {
            key: 'appoint_code',
            title: 'Mã Đặt Khám',
            width: '120px',
            className: 'font-medium',
            render: (value) => value || ''
        },
        {
            key: 'patient_code',
            title: 'Mã Bệnh Nhân',
            width: '120px',
            render: (value) => value || ''
        },
        {
            key: 'source',
            title: 'Bệnh viện',
            width: '120px',
            render: (value) => (
                <Badge variant="default">
                    {getSourceLabel(value || '')}
                </Badge>
            )
        },
        {
            key: 'code',
            title: 'Mã Hóa đơn',
            width: '140px',
            className: 'font-medium'
        },
        {
            key: 'username',
            title: 'Tài khoản sử dụng',
            width: '140px',
            render: (_, record) => record.user?.username || ''
        },
        {
            key: 'fullName',
            title: 'Người sử dụng',
            width: '160px',
            render: (_, record) =>
                `${record.user?.last_name || ''} ${record.user?.first_name || ''}`.trim()
        },
        {
            key: 'created_time',
            title: 'Ngày tạo',
            width: '120px',
            render: (value) => formatDate(value)
        },
        {
            key: 'book_price',
            title: 'Phí đặt khám',
            width: '120px',
            render: (value) => formatCurrency(value || 0)
        },
        {
            key: 'exam_price',
            title: 'Phí khám',
            width: '120px',
            render: (value) => formatCurrency(value || 0)
        },
        {
            key: 'discountCredit',
            title: 'Khuyến mãi',
            width: '120px',
            render: (value) => formatCurrency(value || 0)
        },
        {
            key: 'payment',
            title: 'Số tiền thanh toán',
            width: '140px',
            render: (_, record) =>
                record.invoiceType === 'schedule_appointment' ?
                    formatCurrency(record.totalCredit) :
                    '0'
        },
        {
            key: 'refund',
            title: 'Hoàn tiền',
            width: '120px',
            render: (_, record) =>
                record.invoiceType === 'refund_schedule_appointment' ?
                    formatCurrency(record.totalCredit) :
                    '0'
        },
        {
            key: 'note',
            title: 'Mã hoàn tiền',
            width: '120px',
            render: (value) => value || ''
        },
        {
            key: 'invoiceType',
            title: 'Loại',
            width: '140px',
            render: (value) => (
                <Badge variant="primary">
                    {getInvoiceTypeLabel(value)}
                </Badge>
            )
        }
    ], [currentPage, limit]);

    return (
        <div className="macos-liquid-glass">
            <div className="flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* macOS26 Header */}
                    <header className="mb-8 macos-fade-in">
                        <div className="macos26-header">
                            <div className="flex items-center justify-between">
                                <div className="flex-auto">
                                    <h1 className="macos-heading-1">Báo cáo đặt khám bệnh viện</h1>
                                    <p className="macos-body-secondary mt-2">
                                        Quản lý và báo cáo các hóa đơn đặt khám bệnh viện
                                    </p>
                                </div>
                                <div className="macos26-logo-container">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 macos-fade-in">
                            <div className="macos26-alert macos26-alert-error">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <div className="w-5 h-5 text-red-400">
                                            <svg fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="macos-body text-red-600">{error}</p>
                                    </div>
                                    <div className="ml-auto pl-3">
                                        <button
                                            className="alert-close-btn"
                                            onClick={() => setError(null)}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filter Section */}
                    <section className="mb-8 macos-slide-up">
                        <div className="macos-card">
                            <div className="macos-card-header">
                                <h3 className="macos-heading-3">Bộ lọc tìm kiếm</h3>
                            </div>
                            <div className="macos-card-body">
                                <Filter
                                    fields={filterFields}
                                    onSubmit={handleSubmit}
                                    onReset={resetFilters}
                                    loading={loading}
                                    showExport={true}
                                    onExport={handleExport}
                                    exportOptions={exportOptions}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Report Summary */}
                    <section className="mb-8 macos-slide-up">
                        <div className="macos-card">
                            <div className="macos-card-header">
                                <h3 className="macos-heading-3">Tổng quan báo cáo</h3>
                            </div>
                            <div className="macos-card-body">
                                <div className="invoice-summary-grid">
                                    <div className="macos26-info-card macos26-info-card-success">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="invoice-card-icon invoice-card-icon-green w-12 h-12 rounded-xl flex items-center justify-center">
                                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                </svg>
                                            </div>
                                            <div className="invoice-card-badge invoice-card-badge-green">
                                                Thu nhập
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="macos-body-secondary">Tổng thu</p>
                                            <p className="text-2xl font-bold text-green-800 invoice-table-cell-amount">
                                                {formatCurrency(report.total_paid)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="macos26-info-card macos26-info-card-primary">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="invoice-card-icon invoice-card-icon-red w-12 h-12 rounded-xl flex items-center justify-center">
                                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m5 14-5-2a4 4 0 01-4-4v-4a2 2 0 012-2h7a2 2 0 012 2v8z" />
                                                </svg>
                                            </div>
                                            <div className="invoice-card-badge invoice-card-badge-red">
                                                Hoàn tiền
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="macos-body-secondary">Tổng hoàn tiền</p>
                                            <p className="text-2xl font-bold text-red-800 invoice-table-cell-amount">
                                                {formatCurrency(report.total_refund)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="macos26-info-card macos26-info-card-primary">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="invoice-card-icon invoice-card-icon-blue w-12 h-12 rounded-xl flex items-center justify-center">
                                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                            </div>
                                            <div className="invoice-card-badge invoice-card-badge-blue">
                                                Thực thu
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="macos-body-secondary">Doanh thu thực</p>
                                            <p className="text-2xl font-bold text-blue-800 invoice-table-cell-amount">
                                                {formatCurrency(report.total_paid - report.total_refund)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Data Table Section */}
                    <section className="macos-slide-up">
                        <div className="macos-card">
                            <div className="macos-card-header">
                                <div className="flex items-center justify-between">
                                    <h3 className="macos-heading-3">Danh sách hóa đơn đặt khám</h3>
                                    <div className="flex items-center gap-3">
                                        {loading && (
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <div className="w-4 h-4 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
                                                <span>Đang tải...</span>
                                            </div>
                                        )}
                                        <div className="macos26-info-card bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-lg">
                                            <span className="text-sm font-medium">
                                                Tìm thấy {list.length} bản ghi
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="macos-card-body">
                                <div className="macos26-table-wrapper">
                                    <Table
                                        columns={columns}
                                        data={list}
                                        loading={loading}
                                        emptyText="Chưa có dữ liệu đặt khám nào"
                                        rowKey="_id"
                                        className="macos26-table"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Pagination Section */}
                    <section className="mt-8">
                        <div className="macos26-info-card">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                                loading={loading}
                            />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ScheduleAppointmentPage;
