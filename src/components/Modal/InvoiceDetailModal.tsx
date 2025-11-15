import React from 'react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import * as InvoiceTypes from '@/types/invoice';
import Modal from './Modal';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { getInvoiceTypeLabel } from "@/types/invoice"
interface InvoiceDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: InvoiceTypes.InvoiceItem | null;
    invoiceDetail: any;
    loading: boolean;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
    isOpen,
    onClose,
    invoice,
    invoiceDetail,
    loading,

}) => {

    if (!invoice) return null;

    // Table columns for invoice items
    const itemColumns = [
        {
            key: 'name',
            title: 'Tên',
            render: (value: any, record: any) => record.name || record.title
        },
        {
            key: 'quantity',
            title: 'Số lượng',
            className: 'text-center',
            render: (value: any, record: any) => record.quantity || 1
        },
        {
            key: 'price',
            title: 'Đơn giá',
            className: 'text-right',
            render: (value: any, record: any) => (
                <span className="macos26-info-value-mono">
                    {formatCurrency(record.price || record.cost)}
                </span>
            )
        },
        {
            key: 'total',
            title: 'Thành tiền',
            className: 'text-right',
            render: (value: any, record: any) => (
                <span className="font-semibold macos26-info-value-mono">
                    {formatCurrency((record.quantity || 1) * (record.price || record.cost))}
                </span>
            )
        }
    ];

    const footerContent = (
        <Button
            onClick={onClose}
            variant="primary"
            size="lg"
        >
            Đóng
        </Button>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Chi tiết hóa đơn: ${invoice.code}`}
            maxWidth="5xl"
            footerContent={footerContent}
            icon={
                <div className="macos26-modal-header-icon w-12 h-12 !p-3 flex items-center justify-center">
                    <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
            }
        >
            {loading ? (
                <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
                    <span className="ml-3 text-sm text-[var(--primary-text-secondary)]">Đang tải chi tiết...</span>
                </div>
            ) : (
                <div className="space-y-6 macos-fade-in">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="macos26-info-card macos26-info-card-primary">
                            <h4 className="macos26-section-header">Thông tin cơ bản</h4>
                            <div className="space-y-0">
                                <div className="macos26-info-row">
                                    <span className="macos26-info-label">Mã hóa đơn:</span>
                                    <span className="macos26-info-value macos26-info-value-mono">{invoice.code}</span>
                                </div>
                                <div className="macos26-info-row">
                                    <span className="macos26-info-label">Loại hóa đơn:</span>
                                    <span className="macos26-info-value">{getInvoiceTypeLabel(invoice.invoiceType)}</span>
                                </div>
                                <div className="macos26-info-row">
                                    <span className="macos26-info-label">Ngày tạo:</span>
                                    <span className="macos26-info-value">{formatDate(invoice.created_time)}</span>
                                </div>
                                <div className="macos26-info-row">
                                    <span className="macos26-info-label">Tổng tiền:</span>
                                    <span className="macos26-info-value macos26-info-value-accent">{formatCurrency(invoice.totalCredit)}</span>
                                </div>
                                <div className="macos26-info-row">
                                    <span className="macos26-info-label">Giảm giá:</span>
                                    <span className="macos26-info-value">{formatCurrency(invoice.discountCredit || 0)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="macos26-info-card macos26-info-card-success">
                            <h4 className="macos26-section-header">Thông tin người dùng</h4>
                            <div className="space-y-4">
                                <div>
                                    <span className="macos26-info-label block mb-2">Người tạo:</span>
                                    <div className="macos26-info-card !bg-white/50 dark:!bg-black/20 !p-3">
                                        <div className="macos26-info-value font-semibold">{invoice.creator.username}</div>
                                        <div className="text-sm text-[var(--primary-text-secondary)] mt-1">
                                            {invoice.creator.last_name} {invoice.creator.first_name}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <span className="macos26-info-label block mb-2">Người sử dụng:</span>
                                    <div className="macos26-info-card !bg-white/50 dark:!bg-black/20 !p-3">
                                        <div className="macos26-info-value font-semibold">{invoice.user.username}</div>
                                        <div className="text-sm text-[var(--primary-text-secondary)] mt-1">
                                            {invoice.user.last_name} {invoice.user.first_name}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Details */}
                    {invoiceDetail?.items && invoiceDetail.items.length > 0 && (
                        <div className="macos26-info-card !p-0">
                            <div className="px-6 py-4 bg-[var(--glass-bg)] border-b border-[var(--card-border)]">
                                <h4 className="macos26-section-header !mb-0 !pb-0 !border-b-0">Chi tiết sản phẩm/dịch vụ</h4>
                            </div>
                            <div className="overflow-hidden">
                                <Table
                                    columns={itemColumns}
                                    data={invoiceDetail.items}
                                    loading={false}
                                    emptyText="Không có sản phẩm nào"
                                    className="!border-0 !shadow-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Refund Information */}
                    {invoice.invoice_refund && invoice.invoice_refund.length > 0 && (
                        <div className="macos26-alert macos26-alert-error">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-3">Thông tin hoàn tiền</h4>
                                    <div className="space-y-2">
                                        {invoice.invoice_refund.map((refund, index) => (
                                            <div key={index} className="macos26-info-card !bg-red-100/80 dark:!bg-red-800/40 !border-red-300 dark:!border-red-700">
                                                <div className="macos26-info-row !border-b-0">
                                                    <span className="macos26-info-label text-red-700 dark:text-red-300">Mã hoàn tiền:</span>
                                                    <span className="macos26-info-value macos26-info-value-mono text-red-800 dark:text-red-200">{refund.code}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};

export default InvoiceDetailModal;
