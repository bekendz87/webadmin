import React, { useState, useEffect, useMemo } from 'react';
import { request } from '@/utils/request';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { API_ENDPOINTS } from '@/routerPath';
import { storage } from '@/utils/auth';
import { APP_CONFIG } from '@/constants/config';
import * as InvoiceTypes from '@/types/invoice';
import Filter, { FilterField, ExportOption } from '@/components/Filter/Filter';
import InvoiceDetailModal from '@/components/Modal/InvoiceDetailModal';
import RefundModal from '@/components/Modal/RefundModal';
import Pagination from '@/components/Pagination/Pagination';
import { TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
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
const CASH_TYPES_FALLBACK = [
    { value: "Tất cả", key: "all" as const },
    { value: 'Thanh toán', key: 'payment' as const },
    { value: 'Hoàn tiền', key: 'refund' as const }
];

const PAYMENT_TYPES_FALLBACK = [
    { value: 'Tất cả', key: 'all' as const },
    { value: 'Trả bằng credit', key: 'prepay' as const },
    { value: 'Trả bằng tiền mặt', key: 'postpaid' as const }
];

const INVOICE_TYPES_FALLBACK = [
    { value: "Tất cả", key: "all" },
    { value: "Toa thuốc", key: "prescription" },
    { value: "Cận lâm sàn", key: "paraclinical" },
    { value: "Dịch vụ", key: "service" }
];

// Refund fallback constants
const REFUND_TYPE_OPTIONS_FALLBACK = [
    { key: 'all_bill' as const, value: 'Hoàn toàn bộ hóa đơn' },
    { key: 'partial' as const, value: 'Hoàn một phần' }
];

const PAYMENT_UNITS_FALLBACK = [
    { value: 'prepay', name: 'Credit' },
    { value: 'postpaid', name: 'Tiền mặt' }
];

const DATE_OPTIONS_FALLBACK = [
    { key: 'current_date' as const, value: 'Ngày hiện tại' },
    { key: 'same_invoice_date' as const, value: 'Ngày tạo hoá đơn thanh toán' },
    { key: 'custom_date' as const, value: 'Tùy chọn ngày' }
];

const InvoicePage: React.FC = () => {
    const [list, setList] = useState < InvoiceTypes.InvoiceItem[] > ([]);
    const [report, setReport] = useState < InvoiceTypes.InvoiceReport > ({
        totalCashIn: 0,
        totalPayCredit: 0,
        totalPayMoney: 0,
        totalRefund: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState < string | null > (null);

    // Filter states
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [invoiceCode, setInvoiceCode] = useState('');
    const [phoneCreator, setPhoneCreator] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedCate, setSelectedCate] = useState('all');
    const [selectedPayment, setSelectedPayment] = useState('all');
    const [selectedType, setSelectedType] = useState('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 25;

    // Detail modal states
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState < InvoiceTypes.InvoiceItem | null > (null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [invoiceDetail, setInvoiceDetail] = useState < any > (null);

    // Refund modal states
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [selectedRefundInvoice, setSelectedRefundInvoice] = useState < InvoiceTypes.InvoiceItem | null > (null);
    const [refundLoading, setRefundLoading] = useState(false);
    const [selectedTypeRefund, setSelectedTypeRefund] = useState('all_bill');
    const [refundAmount, setRefundAmount] = useState('');
    const [selectedUnit, setSelectedUnit] = useState('credit');
    const [selectedDateOpt, setSelectedDateOpt] = useState('current_date');
    const [dateRefund, setDateRefund] = useState('');
    const [refundNote, setRefundNote] = useState('');
    const [errorHandle, setErrorHandle] = useState < { type: 'error' | 'success', message: string } | null > (null);

    // Use fallbacks if imports are undefined
    const cashTypes = InvoiceTypes.CASH_TYPES || CASH_TYPES_FALLBACK;
    const paymentTypes = InvoiceTypes.PAYMENT_TYPES || PAYMENT_TYPES_FALLBACK;
    const invoiceTypes = InvoiceTypes.INVOICE_TYPES || INVOICE_TYPES_FALLBACK;
    const invoicePaymentTypes = InvoiceTypes.INVOICE_PAYMENT_TYPES || [];
    const invoiceRefundTypes = InvoiceTypes.INVOICE_REFUND_TYPES || [];
    const invoiceCashInTypes = InvoiceTypes.INVOICE_CASH_IN_TYPES || [];

    // Refund related constants with fallbacks
    const refundTypeOptions = InvoiceTypes.REFUND_TYPE_OPTIONS || REFUND_TYPE_OPTIONS_FALLBACK;
    const paymentUnits = InvoiceTypes.PAYMENT_UNITS || PAYMENT_UNITS_FALLBACK;
    const dateOptions = InvoiceTypes.DATE_OPTIONS || DATE_OPTIONS_FALLBACK;

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
            label: 'Số điện thoại',
            placeholder: 'Nhập số điện thoại',
            value: phone,
            onChange: setPhone
        },
        {
            type: 'select',
            name: 'selectedCate',
            label: 'Loại',
            value: selectedCate,
            onChange: setSelectedCate,
            options: cashTypes
        },
        {
            type: 'select',
            name: 'selectedPayment',
            label: 'Thanh toán',
            value: selectedPayment,
            onChange: setSelectedPayment,
            options: paymentTypes
        },
        {
            type: 'select',
            name: 'selectedType',
            label: 'Dịch vụ',
            value: selectedType,
            onChange: setSelectedType,
            options: invoiceTypes
        }
    ], [
        dateFrom, dateTo, invoiceCode, phoneCreator, phone, selectedCate, selectedPayment, selectedType,
        cashTypes, paymentTypes, invoiceTypes
    ]);

    // Define export options for this page (both Excel and PDF)
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

    ];

    const { showAlert } = useAlert();
    const { refreshNotifications } = useNotification();

    // Add debug logging
    useEffect(() => {
        console.log('🔍 Invoice Page - Alert Context:', { showAlert });
        console.log('🔍 Invoice Page - Notification Context:', { refreshNotifications });
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



    const fetchInvoiceList = async (page = 1, exportType?: 'excel' | 'pdf', overrideFilters?: {
        dateFrom?: string;
        dateTo?: string;
        invoiceCode?: string;
        phoneCreator?: string;
        phone?: string;
        selectedCate?: string;
        selectedPayment?: string;
        selectedType?: string;
    }) => {
        try {
            setLoading(true);
            setError(null);

            // Show loading alert with debug
            console.log('🚨 Showing loading alert...');
            if (showAlert) {
                showAlert(
                    'warning',
                    'Đang tải dữ liệu',
                    exportType ? 'Đang xuất báo cáo...' : 'Đang tải danh sách hóa đơn...',
                    3000
                );
            } else {
                console.error('❌ showAlert is not available');
            }

            const params: any = {
                cache: 'true',
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
                selectedCate,
                selectedPayment,
                selectedType
            };

            // Date filters - format to match working request
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

            // Cash type filter
            if (filters.selectedCate !== 'all') {
                params.report_type = filters.selectedCate;
            } else {
                params.report_type = 'all';
            }

            // Always send invoiceType and payment parameters
            params.invoiceType = filters.selectedType || 'all';
            params.payment = filters.selectedPayment || 'all';

            if (filters.invoiceCode) {
                params.code = filters.invoiceCode;
            }

            if (filters.phoneCreator) {
                params.username_creator = filters.phoneCreator;
            }

            if (filters.phone) {
                params.username_user = filters.phone;
            }

            // Get token using auth utility
            const token = storage.getItem < string > ('webadmin_auth_token') || storage.getItem < string > (APP_CONFIG.TOKEN_KEY);

            console.log('🚀 Making request with params:', params);

            // Export handling
            if (exportType) {
                params.export = exportType;
                params.show_all = 'true';

                // Build export URL manually to avoid encoding issues
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
                await createNotification(
                    {
                        title: 'Bạn vừa xuất báo cáo hóa đơn thành công',
                        message: `Đang tải xuống file ${exportType.toUpperCase()}...`,
                        type: 'success'
                    }
                );

                return;
            }

            const response = await request < InvoiceTypes.InvoiceApiResponse > ({
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
                    // Process money types
                    const processedList = (data.list || []).map(item => {
                        if (invoicePaymentTypes.includes(item.invoiceType)) {
                            item.moneyType = 'payment';
                        } else if (invoiceRefundTypes.includes(item.invoiceType)) {
                            item.moneyType = 'refund';
                        } else if (invoiceCashInTypes.includes(item.invoiceType)) {
                            item.moneyType = 'cash-in';
                        }
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
                            `Tìm thấy ${processedList.length} hóa đơn`,
                            4000
                        );
                    }
                    if(processedList.length > 0){
                        await createNotification(
                            {
                                title: 'Bạn vừa tải danh sách hóa đơn thành công',
                                message: `Tìm thấy ${processedList.length} hóa đơn`,
                                type: 'success'
                            }
                        );
                    }
                  
                   
                } else {
                    setList([]);
                    setError('Không có dữ liệu trả về');

                    console.log('🚨 Showing no data alert...');
                    if (showAlert) {
                        showAlert(
                            'error',
                            'Không có dữ liệu',
                            'Không có dữ liệu hóa đơn nào được tìm thấy',
                            4000
                        );
                    }
                }
            } else {
                console.error('❌ Request failed:', response);
                setList([]);
                setError(response?.message || 'Không thể tải dữ liệu hóa đơn - có thể do lỗi xác thực');

                console.log('🚨 Showing error alert...');
                if (showAlert) {
                    showAlert(
                        'error',
                        'Lỗi tải dữ liệu',
                        response?.message || 'Không thể tải dữ liệu hóa đơn. Vui lòng thử lại.',
                        5000
                    );
                }
            }
        } catch (error: any) {
            console.error('💥 Error fetching invoice list:', error);
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

    const handleRefund = async (invoice: InvoiceTypes.InvoiceItem) => {
        // Validation
        if (!refundNote.trim()) {
            setErrorHandle({ type: 'error', message: 'Vui lòng nhập ghi chú hoàn tiền' });
            return;
        }

        if (selectedTypeRefund === 'partial' && (!refundAmount || parseFloat(refundAmount) <= 0)) {
            setErrorHandle({ type: 'error', message: 'Vui lòng nhập số tiền hoàn hợp lệ' });
            return;
        }

        if (selectedTypeRefund === 'partial' && parseFloat(refundAmount) > invoice.totalCredit) {
            setErrorHandle({ type: 'error', message: 'Số tiền hoàn không được lớn hơn tổng tiền hóa đơn' });
            return;
        }

        if (selectedDateOpt === 'custom_date' && !dateRefund) {
            setErrorHandle({ type: 'error', message: 'Vui lòng chọn ngày hoàn tiền' });
            return;
        }

        try {
            setRefundLoading(true);
            setErrorHandle(null);
            const token = storage.getItem < string > ('webadmin_auth_token') || storage.getItem < string > (APP_CONFIG.TOKEN_KEY);

            const refundData: any = {
                type: selectedTypeRefund,
                amount: selectedTypeRefund === 'all_bill' ? invoice.totalCredit : parseFloat(refundAmount),
                amount_type: selectedUnit,
                date_opt: selectedDateOpt,
                note: refundNote
            };

            if (selectedDateOpt === 'custom_date') {
                refundData['date'] = dateRefund
            }


            const response = await request < any > ({
                method: 'POST',
                url: `${API_ENDPOINTS.INVOICE.refund}`,
                params: {
                    id: invoice._id
                },
                body: {
                    one_health_msg: refundData
                },
                headers: {
                    'oh_token': token ? token.replace(/^["']|["']$/g, '').replace(/\\"/g, '"') : ''
                }
            });

            if (response?.success) {
                setErrorHandle({ type: 'success', message: 'Hoàn tiền thành công!' });

                const refundAmountFormatted = formatCurrency(selectedTypeRefund === 'all_bill' ? invoice.totalCredit : parseFloat(refundAmount));

                // Show success alert
                console.log('🚨 Showing refund success alert...');
                if (showAlert) {
                    showAlert(
                        'success',
                        'Hoàn tiền thành công',
                        `Đã hoàn ${refundAmountFormatted} cho hóa đơn ${invoice.code}`,
                        4000
                    );
                }

                // Create notification
                await createNotification(
                    {
                        title: 'Hoàn tiền hóa đơn thành công',
                        message: `Đã hoàn ${refundAmountFormatted} cho hóa đơn ${invoice.code}`,
                        type: 'success'
                    }
                );

                setTimeout(() => {
                    setShowRefundModal(false);
                    resetRefundForm();
                    fetchInvoiceList(currentPage);
                }, 2000);
            } else {
                const errorMsg = response?.message || 'Không thể hoàn tiền. Vui lòng thử lại.';
                setErrorHandle({ type: 'error', message: errorMsg });

                console.log('🚨 Showing refund error alert...');
                if (showAlert) {
                    showAlert(
                        'error',
                        'Lỗi hoàn tiền',
                        errorMsg,
                        5000
                    );
                }
            }
        } catch (error: any) {
            console.error('Error processing refund:', error);
            const errorMsg = error.message || 'Có lỗi xảy ra khi hoàn tiền';
            setErrorHandle({ type: 'error', message: errorMsg });

            console.log('🚨 Showing refund catch error alert...');
            if (showAlert) {
                showAlert(
                    'error',
                    'Lỗi hoàn tiền',
                    errorMsg,
                    5000
                );
            }
        } finally {
            setRefundLoading(false);
        }
    };

    const handleShowRefund = (invoice: InvoiceTypes.InvoiceItem) => {
        setSelectedRefundInvoice(invoice);
        resetRefundForm();
        // Set initial refund amount AFTER resetting the form
        setRefundAmount(invoice.totalCredit.toString());
        setShowRefundModal(true);
    };

    const resetRefundForm = () => {
        setSelectedTypeRefund('all_bill');
        setRefundAmount('');
        setSelectedUnit('credit');
        setSelectedDateOpt('current_date');
        setDateRefund('');
        setRefundNote('');
        setErrorHandle(null);
    };

    const handleCloseRefund = () => {
        setShowRefundModal(false);
        setSelectedRefundInvoice(null);
        resetRefundForm();
    };

    const handleTypeRefundChange = (type: string) => {
        setSelectedTypeRefund(type);
        if (type === 'all_bill' && selectedRefundInvoice) {
            setRefundAmount(selectedRefundInvoice.totalCredit.toString());
        } else {
            setRefundAmount('');
        }
    };

    const formatRefundAmount = (amount: string) => {
        // Remove non-numeric characters except decimal point
        const numericValue = amount.replace(/[^0-9.]/g, '');
        setRefundAmount(numericValue);
    };

    const canRefund = (invoice: InvoiceTypes.InvoiceItem) => {
        // Only allow refund for payment invoices
        if (invoice.moneyType !== 'payment') {
            return false;
        }

        // Check if there's still amount that can be refunded
        const totalRefunded = invoice.amount_refund || 0;
        const remainingAmount = invoice.totalCredit - totalRefunded;

        return remainingAmount > 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchInvoiceList(1);
    };

    const handlePageChange = (page: number) => {
        fetchInvoiceList(page);
    };

    const handleExport = (type: any) => {
        fetchInvoiceList(currentPage, type);
    };

    const handleViewDetail = (invoice: InvoiceTypes.InvoiceItem) => {
        setSelectedInvoice(invoice);
        setShowDetailModal(true);


        fetchInvoiceDetail(invoice._id);
    };

    const handleCloseDetail = () => {
        setShowDetailModal(false);
        setSelectedInvoice(null);
        setInvoiceDetail(null);
    };

    const getInvoiceTypeLabel = (type: string) => {
        const invoiceType = invoiceTypes.find(t => t.key === type);
        return invoiceType ? invoiceType.value : type;
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
        setSelectedCate('all');
        setSelectedPayment('all');
        setSelectedType('all');
        setCurrentPage(1);

        // Fetch data with default filter values
        fetchInvoiceList(1, undefined, {
            dateFrom: '',
            dateTo: '',
            invoiceCode: '',
            phoneCreator: '',
            phone: '',
            selectedCate: 'all',
            selectedPayment: 'all',
            selectedType: 'all'
        });
    };

    useEffect(() => {
        fetchInvoiceList();
    }, []);

    return (
        <div className="macos-liquid-glass min-h-screen">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header Section - macOS 26 Liquid Glass */}
                <Card className="macos26-header mb-8">
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex-1">
                                <h1 className="macos-heading-1 mb-2">
                                    Báo cáo doanh thu
                                </h1>
                                <p className="macos-body-secondary">
                                    Quản lý và báo cáo các hóa đơn thanh toán, nạp tiền và hoàn tiền
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Error Alert - macOS 26 Style */}
                {error && (
                    <Alert variant="error" className="mb-6">
                        <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Filter Section - macOS 26 Card */}
                <Card className="liquid-glass-card mb-8">
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

                {/* Report Summary - macOS 26 Liquid Glass Cards */}
                <Card className="liquid-glass-card mb-8">
                    <CardHeader>
                        <h3 className="macos-heading-3">Chi tiết báo cáo</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Cash In Card */}
                            <Card className="macos26-info-card macos26-info-card-primary">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <Badge variant="outline" className="mb-3 text-blue-600 border-blue-200">
                                                NẠP TIỀN
                                            </Badge>
                                            <p className="macos-heading-2 text-blue-900 dark:text-blue-100">
                                                {formatCurrency(report.totalCashIn)}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Credit Card */}
                            <Card className="macos26-info-card macos26-info-card-success">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <Badge variant="outline" className="mb-3 text-green-600 border-green-200">
                                                THANH TOÁN CREDIT
                                            </Badge>
                                            <p className="macos-heading-2 text-green-900 dark:text-green-100">
                                                {formatCurrency(report.totalPayCredit)}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8l4-2 4 2 4-2 4 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Cash Card */}
                            <Card className="macos26-info-card">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <Badge variant="outline" className="mb-3 text-yellow-600 border-yellow-200">
                                                THANH TOÁN TIỀN MẶT
                                            </Badge>
                                            <p className="macos-heading-2 text-yellow-900 dark:text-yellow-100">
                                                {formatCurrency(report.totalPayMoney)}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-2" />
                                            </svg>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Refund Card */}
                            <Card className="macos26-info-card">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <Badge variant="destructive" className="mb-3">
                                                HOÀN TIỀN
                                            </Badge>
                                            <p className="macos-heading-2 text-red-900 dark:text-red-100">
                                                {formatCurrency(report.totalRefund)}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>

                {/* Table Section - macOS 26 Liquid Glass with Horizontal Scrolling */}
                <Card className="liquid-glass-card">
                    <CardHeader>
                        <h3 className="macos-heading-3">Danh sách hóa đơn</h3>
                        <p className="macos-body-secondary text-sm mt-1">
                            Cuộn ngang để xem thêm thông tin chi tiết
                        </p>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <LoadingSpinner size="lg" />
                                <p className="macos-body-secondary">Đang tải dữ liệu hóa đơn...</p>
                            </div>
                        ) : (
                            <div className="table-container">
                                <div className="macos26-table-wrapper">
                                    <table className="macos26-table">
                                        <TableHeader className="macos26-table-head">
                                            <TableRow>
                                                <TableHead className="macos26-table-header-cell w-16 sticky-column">#</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[120px]">Mã Hóa đơn</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[150px]">Người tạo</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[150px]">Người sử dụng</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[120px]">Ngày tạo</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[100px]">Giảm giá</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[130px]">Số tiền thanh toán</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[100px]">Nạp tiền</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[100px]">Hoàn tiền</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[120px]">Mã hoàn tiền</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[120px]">Loại</TableHead>
                                                <TableHead className="macos26-table-header-cell w-48">Thao tác</TableHead>
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
                                                            <Badge variant="outline" className="macos26-table-cell-number text-orange-600 border-orange-200">
                                                                {formatCurrency(invoice.discountCredit || 0)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="macos26-table-cell">
                                                            <Badge variant="outline" className="macos26-table-cell-number text-green-600 border-green-200">
                                                                {invoice.moneyType === 'payment' ? formatCurrency(invoice.totalCredit) : '0'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="macos26-table-cell">
                                                            <Badge variant="outline" className="macos26-table-cell-number text-blue-600 border-blue-200">
                                                                {invoice.moneyType === 'cash-in' ? formatCurrency(invoice.totalCredit) : '0'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="macos26-table-cell">
                                                            <Badge variant="outline" className="macos26-table-cell-number text-red-600 border-red-200">
                                                                {invoice.moneyType === 'refund' ? formatCurrency(invoice.totalCredit) : '0'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="macos26-table-cell">
                                                            <p className="macos-body-secondary font-mono text-xs">
                                                                {invoice.invoice_refund?.map(item => item.code).join(', ')}
                                                            </p>
                                                        </TableCell>
                                                        <TableCell className="macos26-table-cell">
                                                            <Badge variant="secondary">
                                                                {getInvoiceTypeLabel(invoice.invoiceType)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="macos26-table-cell">
                                                            <div className="flex gap-2">
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
                                                                {canRefund(invoice) && (
                                                                    <Button
                                                                        variant="danger"
                                                                        size="sm"
                                                                        className="macos26-btn macos26-btn-danger macos26-btn-sm"
                                                                        onClick={() => handleShowRefund(invoice)}
                                                                        leftIcon={
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                                                                            </svg>
                                                                        }
                                                                    >
                                                                        Hoàn tiền
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={12} className="text-center py-12">
                                                        <EmptyState
                                                            icon={
                                                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                            }
                                                            title="Chưa có dữ liệu hóa đơn nào"
                                                            description="Hãy thử thay đổi bộ lọc để tìm kiếm hóa đơn"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination - macOS 26 Style */}
                <div className="mt-8">
                    <Card className="liquid-glass-card">
                        <CardContent className="p-4">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                                loading={loading}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Modals - Already using proper components */}
                <InvoiceDetailModal
                    isOpen={showDetailModal}
                    onClose={handleCloseDetail}
                    invoice={selectedInvoice}
                    invoiceDetail={invoiceDetail}
                    loading={detailLoading}
                    getInvoiceTypeLabel={getInvoiceTypeLabel}
                />

                <RefundModal
                    isOpen={showRefundModal}
                    onClose={handleCloseRefund}
                    invoice={selectedRefundInvoice}
                    loading={refundLoading}
                    selectedTypeRefund={selectedTypeRefund}
                    refundAmount={refundAmount}
                    selectedUnit={selectedUnit}
                    selectedDateOpt={selectedDateOpt}
                    dateRefund={dateRefund}
                    refundNote={refundNote}
                    errorHandle={errorHandle}
                    refundTypeOptions={refundTypeOptions}
                    paymentUnits={paymentUnits}
                    dateOptions={dateOptions}
                    onTypeRefundChange={handleTypeRefundChange}
                    onRefundAmountChange={formatRefundAmount}
                    onUnitChange={setSelectedUnit}
                    onDateOptChange={setSelectedDateOpt}
                    onDateRefundChange={setDateRefund}
                    onRefundNoteChange={setRefundNote}
                    onConfirm={() => selectedRefundInvoice && handleRefund(selectedRefundInvoice)}
                />
            </div>
        </div>
    );
};

export default InvoicePage;


