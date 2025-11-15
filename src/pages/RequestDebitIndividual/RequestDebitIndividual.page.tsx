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

const RequestDebitIndividualPage: React.FC = () => {
    const [invoiceList, setInvoiceList] = useState < DebitTypes.DebitItem[] > ([]);
    const [report, setReport] = useState < DebitTypes.DebitReport > ({
        totalInvoice: 0,
        totalCredit: 0,
        totalKeepMoney: 0,
        totalReturnMoney: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState < string | null > (null);

    // Filter states
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [invoiceCode, setInvoiceCode] = useState('');
    const [phoneCreator, setPhoneCreator] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [userGroups, setUserGroups] = useState < any[] > ([]);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [selectedAccounting, setSelectedAccounting] = useState('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(200);

    // Selection states for confirmation
    const [selectedInvoices, setSelectedInvoices] = useState < Set < string >> (new Set());
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [receiveMethod, setReceiveMethod] = useState('cash');
    const [confirmLoading, setConfirmLoading] = useState(false);

    const { showAlert } = useAlert();

    // Page size options
    const pageNumberSettings = [
        { value: 10, name: '10' },
        { value: 25, name: '25' },
        { value: 200, name: '200' },
        { value: 250, name: '250' },
        { value: 300, name: '300' }
    ];

    // Payment method options
    const paymentMethods = [
        { key: '', name: 'Tất cả' },
        { key: 'cash', name: 'Tiền mặt' },
        { key: 'atm', name: 'ATM' },
        { key: 'visa/master', name: 'Visa/Master' }
    ];

    // Accounting status options
    const accountingOptions = [
        { key: 'all', name: 'Tất cả' },
        { key: 'true', name: 'Đã chuyển/trả' },
        { key: 'false', name: 'Chưa chuyển/trả' }
    ];

    // Receive method options
    const receiveMethods = [
        { value: 'cash', name: 'Tiền mặt' },
        { value: 'atm', name: 'ATM' },
        { value: 'visa/master', name: 'Visa/Master' }
    ];

    // Define filter fields
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
            label: 'Số điện thoại',
            placeholder: 'Nhập số điện thoại',
            value: phone,
            onChange: setPhone
        },
        {
            type: 'select',
            name: 'paymentMethod',
            label: 'Phương thức',
            value: paymentMethod,
            onChange: setPaymentMethod,
            options: paymentMethods.map(method => ({
                key: method.key,
                value: method.name
            }))
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
            name: 'selectedAccounting',
            label: 'Chuyển/trả',
            value: selectedAccounting,
            onChange: setSelectedAccounting,
            options: accountingOptions.map(option => ({
                key: option.key,
                value: option.name
            }))
        },
        {
            type: 'select',
            name: 'limit',
            label: 'Hiển thị',
            value: limit.toString(),
            onChange: (value) => setLimit(parseInt(value)),
            options: pageNumberSettings.map(item => ({
                key: item.value.toString(),
                value: item.name
            }))
        }
    ], [dateFrom, dateTo, invoiceCode, phoneCreator, phone, paymentMethod, selectedGroupId, selectedAccounting, limit, userGroups]);

    // Export options
    const exportOptions = [
        {
            value: 'excel',
            label: 'Excel', icon: (
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
            )
        },
        { value: 'pdf', label: 'PDF' }
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

    // Fetch individual debit list
    const fetchDebitList = async (page = 1, exportType?, overrideFilters?) => {
        try {
            setLoading(true);
            setError(null);

            if (showAlert && !exportType) {
                showAlert('warning', 'Đang tải dữ liệu', 'Đang tải danh sách trừ tiền...', 3000);
            }

            const params = {
                invoiceType: 'debit',
                limit: limit.toString(),
                page: page.toString(),
                report_type: 'all',
                debit_type: 'withdraw'
                // Note: không có withdraw_gr_by_creator để lấy individual invoices
            };

            const filters = overrideFilters || {
                dateFrom, dateTo, invoiceCode, phoneCreator, phone, selectedGroupId, paymentMethod, selectedAccounting
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

            // Set default dates
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
            if (filters.paymentMethod) params.payment_method = filters.paymentMethod;

            if (filters.selectedGroupId && filters.selectedGroupId !== '') {
                const selectedGroup = userGroups.find(group => group._id === filters.selectedGroupId);
                if (selectedGroup && selectedGroup.name && selectedGroup.name !== 'Tất cả nhóm') {
                    params.group = selectedGroup.name;
                }
            }

            if (filters.selectedAccounting !== 'all') {
                params.debit_returned = filters.selectedAccounting;
            }

            const token = storage.getItem < string > ('webadmin_auth_token') || storage.getItem < string > (APP_CONFIG.TOKEN_KEY);

            // Export handling
            if (exportType) {
                params.export = exportType;
                params.title = 'Báo cáo trừ tiền cá nhân';

                const queryParts = [];
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        queryParts.push(`${key}=${value}`);
                    }
                });

                const exportUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/invoices/list?${queryParts.join('&')}`;
                window.open(exportUrl, '_blank');

                if (showAlert) {
                    showAlert('success', 'Xuất báo cáo thành công', `Đang tải xuống file ${exportType.toUpperCase()}...`, 4000);
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
                    setInvoiceList(data.list || []);
                    setReport({
                        totalInvoice: data.report?.totalInvoice || 0,
                        totalCredit: data.report?.totalCredit || 0,
                        totalKeepMoney: data.report?.totalKeepMoney || 0,
                        totalReturnMoney: data.report?.totalReturnMoney || 0
                    });
                    setTotalPages(Math.ceil((data.count || 0) / limit));
                    setCurrentPage(page);

                    if (showAlert) {
                        showAlert('success', 'Tải dữ liệu thành công', `Tìm thấy ${data.list?.length || 0} hóa đơn trừ tiền`, 4000);
                    }
                } else {
                    setInvoiceList([]);
                    setError('Không có dữ liệu trả về');
                }
            } else {
                setInvoiceList([]);
                setError(response?.message || 'Không thể tải dữ liệu trừ tiền');
            }
        } catch (error) {
            console.error('Error fetching debit list:', error);
            setInvoiceList([]);
            setError(error.message || 'Có lỗi xảy ra khi tải dữ liệu');

            if (showAlert) {
                showAlert('error', 'Lỗi tải dữ liệu', error.message || 'Có lỗi xảy ra khi tải dữ liệu', 5000);
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle invoice selection
    const handleInvoiceSelect = (invoiceId: string, selectAll = false) => {
        if (selectAll) {
            // Select all non-returned invoices
            const newSelection = new Set < string > ();
            invoiceList.forEach(invoice => {
                if (!invoice.debit_info?.transfer?.isReturned) {
                    newSelection.add(invoice._id);
                }
            });
            setSelectedInvoices(newSelection);
        } else {
            const newSelection = new Set(selectedInvoices);
            if (newSelection.has(invoiceId)) {
                newSelection.delete(invoiceId);
            } else {
                newSelection.add(invoiceId);
            }
            setSelectedInvoices(newSelection);
        }
    };

    // Check if invoice is selected
    const isInvoiceSelected = (invoiceId: string) => {
        return selectedInvoices.has(invoiceId);
    };

    // Handle confirm transfer/return
    const handleConfirmTransfer = async (cashOnly = false) => {
        const selectedInvoicesList = invoiceList.filter(invoice =>
            selectedInvoices.has(invoice._id)
        );

        if (cashOnly) {
            const nonCashInvoices = selectedInvoicesList.filter(
                invoice => invoice.debit_info?.payment_method !== 'cash'
            );
            if (nonCashInvoices.length > 0) {
                const codes = nonCashInvoices.map(inv => inv.code).join(', ');
                if (showAlert) {
                    showAlert('error', 'Lỗi xác nhận', `Các hóa đơn: ${codes} không phải là hóa đơn tiền mặt`, 5000);
                }
                return;
            }
        }

        setShowConfirmModal(true);
    };

    // Submit confirmation
    const submitConfirmation = async () => {
        try {
            setConfirmLoading(true);
            const selectedInvoiceIds = Array.from(selectedInvoices);

            const token = storage.getItem < string > ('webadmin_auth_token') || storage.getItem < string > (APP_CONFIG.TOKEN_KEY);

            const response = await request < any > ({
                method: 'POST',
                url: '/api/debit/update-returned',
                body: {
                    invoices: selectedInvoiceIds,
                    receive_method: receiveMethod
                },
                headers: {
                    'oh_token': token ? token.replace(/^["']|["']$/g, '').replace(/\\"/g, '"') : ''
                }
            });

            if (response?.success) {
                if (showAlert) {
                    showAlert('success', 'Thành công', 'Cập nhật chuyển/trả hóa đơn thành công', 4000);
                }
                setShowConfirmModal(false);
                setSelectedInvoices(new Set());
                fetchDebitList(currentPage);
            } else {
                if (showAlert) {
                    showAlert('error', 'Lỗi cập nhật', response?.message || 'Lỗi cập nhật hóa đơn', 5000);
                }
            }
        } catch (error) {
            console.error('Error confirming transfer:', error);
            if (showAlert) {
                showAlert('error', 'Lỗi cập nhật', error.message || 'Có lỗi xảy ra khi cập nhật', 5000);
            }
        } finally {
            setConfirmLoading(false);
        }
    };

    // Export individual PDF
    const exportIndividualPdf = (invoice: DebitTypes.DebitItem) => {
        const exportData = {
            title: 'Phiếu yêu cầu rút tiền',
            birthday: invoice.user?.birthday || '',
            sex: invoice.user?.sex === 1 ? 'Nam' : (invoice.user?.sex === 0 ? 'Nữ' : 'Không xác định'),
            code: invoice.code,
            ammount: invoice.totalCredit || 0,
            ammount_text: '', // Would need utility function
            username: invoice.user?.username || '',
            date: new Date(),
            type: 'Yêu cầu rút tiền',
            paymentMethod: getPaymentMethodLabel(invoice.debit_info?.payment_method),
            payment_method_vi: getPaymentMethodLabel(invoice.debit_info?.payment_method),
            bank_info_customer_name: invoice.debit_info?.bank_info?.customerName || '',
            bank_info_card_number: invoice.debit_info?.bank_info?.cardNumber || '',
            bank_info_account_number: invoice.debit_info?.bank_info?.accountNumber || '',
            bank_info_bank_name: invoice.debit_info?.bank_info?.bankName || '',
            isWithdraw: true
        };

        if (invoice.meta?.patient_code) {
            exportData.render_qr = true;
            exportData.name = invoice.meta.name;
            exportData.patient_code = invoice.meta.patient_code;
        }

        if (invoice.creator?.username) {
            exportData.creator = invoice.creator.username;
        }

        const token = storage.getItem < string > ('webadmin_auth_token') || storage.getItem < string > (APP_CONFIG.TOKEN_KEY);

        const queryParts = [];
        Object.entries(exportData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParts.push(`${key}=${value}`);
            }
        });

        const exportUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/accounting/pdf/top-up?${queryParts.join('&')}&oh_token=${token}`;
        window.open(exportUrl, '_blank');
    };

    // Format payment method
    const getPaymentMethodLabel = (method: string) => {
        return DebitTypes.PAYMENT_METHODS[method] || method || 'Không';
    };

    // Form handlers
    const handleSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        setSelectedInvoices(new Set());
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
        setPaymentMethod('');
        setSelectedAccounting('all');
        setCurrentPage(1);
        setSelectedInvoices(new Set());

        fetchDebitList(1, undefined, {
            dateFrom: '', dateTo: '', invoiceCode: '', phoneCreator: '', phone: '',
            selectedGroupId: '', paymentMethod: '', selectedAccounting: 'all'
        });
    };

    const resetSelection = () => {
        setSelectedInvoices(new Set());
    };

    // Calculate totals for selected invoices
    const selectedInvoicesTotals = useMemo(() => {
        const selectedList = invoiceList.filter(invoice => selectedInvoices.has(invoice._id));
        return {
            totalMoney: selectedList.reduce((sum, invoice) => sum + (invoice.totalCredit || 0), 0),
            totalKeepMoney: selectedList.reduce((sum, invoice) => sum + (invoice.keep_draw_money?.keep_amount || 0), 0),
            totalReturnMoney: selectedList.reduce((sum, invoice) => sum + (invoice.keep_draw_money?.return_amount || 0), 0),
            count: selectedList.length
        };
    }, [invoiceList, selectedInvoices]);

    // Initialize
    useEffect(() => {
        fetchUserGroups();
        fetchDebitList();
    }, []);

    return (
        <div className="macos-liquid-glass min-h-screen">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <Card className="macos26-header mb-8">
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex-1">
                                <h1 className="macos-heading-1 mb-2">Báo cáo Chuyển/Trả tiền cho khách</h1>
                                <p className="macos-body-secondary">Quản lý và báo cáo các giao dịch trừ tiền chi tiết từng hóa đơn</p>
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

                {/* Action Buttons */}
                <Card className="macos26-header mb-8">
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-3 justify-end">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleInvoiceSelect('', true)}
                            >
                                Chọn tất cả hóa đơn
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={resetSelection}
                            >
                                Huỷ xác nhận chuyển/trả
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleConfirmTransfer(false)}
                                disabled={selectedInvoices.size === 0}
                            >
                                Xác nhận chuyển/trả ({selectedInvoices.size})
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleConfirmTransfer(true)}
                                disabled={selectedInvoices.size === 0}
                            >
                                Xác nhận chuyển/trả tiền mặt
                            </Button>
                        </div>
                        {selectedInvoices.size > 0 && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                <div className="text-sm text-blue-800">
                                    <strong>Đã chọn:</strong> {selectedInvoicesTotals.count} hóa đơn |
                                    <strong> Tổng tiền:</strong> {formatCurrency(selectedInvoicesTotals.totalMoney)} |
                                    <strong> Tổng chuyển/trả:</strong> {formatCurrency(selectedInvoicesTotals.totalReturnMoney)}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Report Summary */}
                <Card className="macos26-header mb-8">
                    <CardHeader>
                        <h3 className="macos-heading-3">
                            Tổng báo cáo nạp trừ tiền từ ngày {dateFrom || 'hôm nay'} đến ngày {dateTo || 'hôm nay'}
                        </h3>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table className="macos26-table">
                                <TableHeader className="macos26-table-head">
                                    <TableRow>
                                        <TableHead className="macos26-table-header-cell text-center">Tổng số hóa đơn</TableHead>
                                        <TableHead className="macos26-table-header-cell text-center">Tiền rút</TableHead>
                                        <TableHead className="macos26-table-header-cell text-center">Chiết khấu</TableHead>
                                        <TableHead className="macos26-table-header-cell text-center">Tiền KH nhận (chuyển/trả)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="macos26-table-cell text-center">
                                            <Badge variant="secondary">{report.totalInvoice}</Badge>
                                        </TableCell>
                                        <TableCell className="macos26-table-cell text-center">
                                            <Badge variant="outline" className="text-red-600 border-red-200">
                                                {formatCurrency(report.totalCredit)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="macos26-table-cell text-center">
                                            <Badge variant="outline" className="text-orange-600 border-orange-200">
                                                {formatCurrency(report.totalKeepMoney)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="macos26-table-cell text-center">
                                            <Badge variant="outline" className="text-green-600 border-green-200">
                                                {formatCurrency(report.totalReturnMoney)}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Table */}
                <Card className="macos26-header mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <h3 className="macos-heading-3">Chi tiết báo cáo</h3>
                            <div className="flex gap-2">
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
                            </div>
                        </div>
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
                                                <TableHead className="macos26-table-header-cell w-20">Hạch toán</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[120px]">Mã Hóa đơn</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[150px]">Khách hàng</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[150px]">Người tạo</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[100px]">Phương thức</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[120px]">Ngày tạo</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[120px]">Tiền Rút</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[120px]">Chiết khấu</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[120px]">Tiền khách nhận</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[200px]">Thông tin ngân hàng</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[100px]">Hình thức nhận</TableHead>
                                                <TableHead className="macos26-table-header-cell min-w-[150px]">Ghi chú</TableHead>
                                                <TableHead className="macos26-table-header-cell w-32">In biên lai</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {invoiceList.length > 0 ? (
                                                invoiceList.map((invoice, index) => (
                                                    <TableRow key={invoice._id} className="macos26-table-row">
                                                        <TableCell className="macos26-table-cell text-center">
                                                            <Badge variant="secondary" className="font-mono">
                                                                {(currentPage - 1) * limit + index + 1}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="macos26-table-cell text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={isInvoiceSelected(invoice._id)}
                                                                onChange={() => handleInvoiceSelect(invoice._id)}
                                                                disabled={invoice.debit_info?.transfer?.isReturned}
                                                                className="w-5 h-5"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="macos26-table-cell">
                                                            <Badge variant="outline" className="font-mono">
                                                                {invoice.code}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="macos26-table-cell">
                                                            <div className="text-sm">
                                                                <div className="font-medium">{invoice.user?.username}</div>
                                                                <div className="macos-body-secondary">
                                                                    {invoice.user?.last_name} {invoice.user?.first_name}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="macos26-table-cell">
                                                            <div className="text-sm">
                                                                <div className="font-medium">{invoice.creator?.username}</div>
                                                                <div className="macos-body-secondary">
                                                                    {invoice.creator?.last_name} {invoice.creator?.first_name}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="macos26-table-cell">
                                                            <Badge variant="secondary" className="text-xs">
                                                                {getPaymentMethodLabel(invoice.debit_info?.payment_method)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="macos26-table-cell">
                                                            <Badge variant="outline" className="font-mono text-xs">
                                                                {formatDate(invoice.created_time)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="macos26-table-cell">
                                                            <Badge variant="outline" className="macos26-table-cell-number text-red-600 border-red-200">
                                                                {formatCurrency(invoice.totalCredit)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="macos26-table-cell">
                                                            <Badge variant="outline" className="macos26-table-cell-number text-orange-600 border-orange-200">
                                                                {formatCurrency(invoice.keep_draw_money?.keep_amount || 0)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="macos26-table-cell">
                                                            <Badge variant="outline" className="macos26-table-cell-number text-green-600 border-green-200">
                                                                {formatCurrency(invoice.keep_draw_money?.return_amount || 0)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="macos26-table-cell">
                                                            <div className="text-xs space-y-1">
                                                                {invoice.debit_info?.bank_info?.customerName && (
                                                                    <div><strong>Tên:</strong> {invoice.debit_info.bank_info.customerName}</div>
                                                                )}
                                                                {invoice.debit_info?.bank_info?.cardNumber && (
                                                                    <div><strong>Số thẻ:</strong> {invoice.debit_info.bank_info.cardNumber}</div>
                                                                )}
                                                                {invoice.debit_info?.bank_info?.accountNumber && (
                                                                    <div><strong>STK:</strong> {invoice.debit_info.bank_info.accountNumber}</div>
                                                                )}
                                                                {invoice.debit_info?.bank_info?.bankName && (
                                                                    <div><strong>Ngân hàng:</strong> {invoice.debit_info.bank_info.bankName}</div>
                                                                )}
                                                                {invoice.debit_info?.bank_info?.branchName && (
                                                                    <div><strong>Chi nhánh:</strong> {invoice.debit_info.bank_info.branchName}</div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="macos26-table-cell">
                                                            <Badge variant="secondary" className="text-xs">
                                                                {getPaymentMethodLabel(invoice.debit_info?.receive_method)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="macos26-table-cell">
                                                            <div className="text-xs max-w-[120px] break-words">
                                                                {invoice.debit_info?.reason || '-'}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="macos26-table-cell text-center">
                                                            <Button
                                                                variant="primary"
                                                                size="sm"
                                                                onClick={() => exportIndividualPdf(invoice)}
                                                            >
                                                                In
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={14} className="text-center py-12">
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

                {/* Confirm Modal */}
                <Modal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    title="Xác nhận chuyển trả"
                    maxWidth="4xl"
                >
                    <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold">
                                    Tổng tiền: {formatCurrency(selectedInvoicesTotals.totalMoney)},
                                    Tổng chuyển/trả: {formatCurrency(selectedInvoicesTotals.totalReturnMoney)},
                                    Tổng hóa đơn: {selectedInvoicesTotals.count}
                                </h4>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium">Hình thức nhận:</label>
                                    <select
                                        value={receiveMethod}
                                        onChange={(e) => setReceiveMethod(e.target.value)}
                                        className="macos26-input macos26-input-sm"
                                    >
                                        {receiveMethods.map(method => (
                                            <option key={method.value} value={method.value}>
                                                {method.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="macos26-table-wrapper max-h-96 overflow-y-auto">
                            <Table className="macos26-table">
                                <TableHeader className="macos26-table-head">
                                    <TableRow>
                                        <TableHead className="macos26-table-header-cell">#</TableHead>
                                        <TableHead className="macos26-table-header-cell">Mã phiếu yêu cầu rút tiền</TableHead>
                                        <TableHead className="macos26-table-header-cell">Khách hàng</TableHead>
                                        <TableHead className="macos26-table-header-cell">Hình thức yêu cầu</TableHead>
                                        <TableHead className="macos26-table-header-cell">Tiền Rút</TableHead>
                                        <TableHead className="macos26-table-header-cell">Chiết khấu</TableHead>
                                        <TableHead className="macos26-table-header-cell">Tiền khách nhận</TableHead>
                                        <TableHead className="macos26-table-header-cell">Thông tin ngân hàng</TableHead>
                                        <TableHead className="macos26-table-header-cell">Lý do</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoiceList
                                        .filter(invoice => selectedInvoices.has(invoice._id))
                                        .map((invoice, index) => (
                                            <TableRow key={invoice._id} className="macos26-table-row">
                                                <TableCell className="macos26-table-cell text-center">
                                                    <Badge variant="secondary" className="font-mono text-xs">
                                                        {index + 1}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="macos26-table-cell">
                                                    <Badge variant="outline" className="font-mono text-xs">
                                                        {invoice.code}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="macos26-table-cell">
                                                    <div className="text-xs">
                                                        <div className="font-medium">{invoice.user?.username}</div>
                                                        <div>{invoice.user?.last_name} {invoice.user?.first_name}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="macos26-table-cell">
                                                    <Badge variant="secondary" className="text-xs">
                                                        {getPaymentMethodLabel(invoice.debit_info?.payment_method)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="macos26-table-cell">
                                                    <Badge variant="outline" className="text-red-600 border-red-200 text-xs">
                                                        {formatCurrency(invoice.totalCredit)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="macos26-table-cell">
                                                    <Badge variant="outline" className="text-orange-600 border-orange-200 text-xs">
                                                        {formatCurrency(invoice.keep_draw_money?.keep_amount || 0)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="macos26-table-cell">
                                                    <Badge variant="outline" className="text-green-600 border-green-200 text-xs">
                                                        {formatCurrency(invoice.keep_draw_money?.return_amount || 0)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="macos26-table-cell">
                                                    <div className="text-xs">
                                                        {invoice.debit_info?.bank_info?.customerName && (
                                                            <div>{invoice.debit_info.bank_info.customerName}</div>
                                                        )}
                                                        {invoice.debit_info?.bank_info?.bankName && (
                                                            <div>Ngân hàng: {invoice.debit_info.bank_info.bankName}</div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="macos26-table-cell">
                                                    <div className="text-xs max-w-[100px] break-words">
                                                        {invoice.debit_info?.reason || '-'}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                variant="secondary"
                                onClick={() => setShowConfirmModal(false)}
                            >
                                Hủy
                            </Button>
                            <Button
                                variant="primary"
                                onClick={submitConfirmation}
                                disabled={confirmLoading}
                                leftIcon={confirmLoading ? <LoadingSpinner size="sm" /> : null}
                            >
                                {confirmLoading ? 'Đang xử lý...' : 'Chuyển/Trả'}
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default RequestDebitIndividualPage;
