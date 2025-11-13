import React from 'react';
import { formatCurrency } from '@/utils/formatters';
import * as InvoiceTypes from '@/types/invoice';
import Modal from './Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface RefundModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: InvoiceTypes.InvoiceItem | null;
    loading: boolean;
    selectedTypeRefund: string;
    refundAmount: string;
    selectedUnit: string;
    selectedDateOpt: string;
    dateRefund: string;
    refundNote: string;
    errorHandle: { type: 'error' | 'success', message: string } | null;
    refundTypeOptions: InvoiceTypes.RefundTypeOption[];
    paymentUnits: InvoiceTypes.PaymentUnit[];
    dateOptions: InvoiceTypes.DateOption[];
    onTypeRefundChange: (type: string) => void;
    onRefundAmountChange: (amount: string) => void;
    onUnitChange: (unit: string) => void;
    onDateOptChange: (opt: string) => void;
    onDateRefundChange: (date: string) => void;
    onRefundNoteChange: (note: string) => void;
    onConfirm: () => void;
}

export const RefundModal: React.FC<RefundModalProps> = ({
    isOpen,
    onClose,
    invoice,
    loading,
    selectedTypeRefund,
    refundAmount,
    selectedUnit,
    selectedDateOpt,
    dateRefund,
    refundNote,
    errorHandle,
    refundTypeOptions,
    paymentUnits,
    dateOptions,
    onTypeRefundChange,
    onRefundAmountChange,
    onUnitChange,
    onDateOptChange,
    onDateRefundChange,
    onRefundNoteChange,
    onConfirm
}) => {
    if (!invoice) return null;

    const footerContent = (
        <>
            <Button
                variant="ghost"
                onClick={onClose}
                disabled={loading}
            >
                Hủy
            </Button>
            <Button
                variant="danger"
                disabled={loading || !refundNote.trim()}
                onClick={onConfirm}
                loading={loading}
            >
                Xác nhận hoàn tiền
            </Button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hoàn tiền hóa đơn"
            maxWidth="4xl"
            footerContent={footerContent}
            icon={
                <div className="w-12 h-12 rounded-xl liquid-glass-card !p-3 bg-red-100/80 dark:bg-red-900/50 flex items-center justify-center">
                    <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                    </svg>
                </div>
            }
        >
            <div className="space-y-6 macos-fade-in">
                {/* Invoice Info */}
                <Card className="bg-gradient-to-br from-red-50/80 to-red-100/60 dark:from-red-900/30 dark:to-red-800/20">
                    <CardContent>
                        <h4 className="text-lg font-semibold text-[var(--primary-text)] mb-4">Thông tin hóa đơn</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-[var(--primary-text-secondary)] mb-2">
                                    Hoàn tiền cho HĐ:
                                </label>
                                <p className="text-lg font-semibold text-[var(--primary-text)]">{invoice.code}</p>
                            </div>
                            <div>
                                <label className="block text-sm text-[var(--primary-text-secondary)] mb-2">
                                    Tổng tiền đã hoàn:
                                </label>
                                <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                                    {formatCurrency(invoice.amount_refund || 0)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <Card>
                        <CardContent className="space-y-6">
                            {/* Refund Type */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--primary-text)] mb-2">
                                    Hình thức hoàn tiền
                                </label>
                                <select
                                    value={selectedTypeRefund}
                                    onChange={(e) => onTypeRefundChange(e.target.value)}
                                    className="macos-input w-full"
                                >
                                    {refundTypeOptions.map(option => (
                                        <option key={option.key} value={option.key}>
                                            {option.value}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Refund Amount */}
                            <Input
                                label="Số tiền hoàn"
                                value={refundAmount}
                                onChange={(e) => onRefundAmountChange(e.target.value)}
                                disabled={selectedTypeRefund === 'all_bill'}
                                placeholder="Nhập số tiền"
                            />
                        </CardContent>
                    </Card>

                    {/* Right Column */}
                    <Card>
                        <CardContent className="space-y-6">
                            {/* Payment Unit */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--primary-text)] mb-2">
                                    Đơn vị thanh toán
                                </label>
                                <select
                                    value={selectedUnit}
                                    onChange={(e) => onUnitChange(e.target.value)}
                                    className="macos-input w-full"
                                >
                                    {paymentUnits.map(unit => (
                                        <option key={unit.value} value={unit.value}>
                                            {unit.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date Options */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--primary-text)] mb-2">
                                    Tùy chọn ngày
                                </label>
                                <select
                                    value={selectedDateOpt}
                                    onChange={(e) => onDateOptChange(e.target.value)}
                                    className="macos-input w-full"
                                >
                                    {dateOptions.map(option => (
                                        <option key={option.key} value={option.key}>
                                            {option.value}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Custom Date */}
                            {selectedDateOpt === 'custom_date' && (
                                <div className="macos-fade-in">
                                    <Input
                                        type="date"
                                        label="Ngày hoàn tiền"
                                        value={dateRefund}
                                        onChange={(e) => onDateRefundChange(e.target.value)}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Note */}
                <Card>
                    <CardContent>
                        <label className="block text-sm font-medium text-[var(--primary-text)] mb-2">
                            Ghi chú <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={4}
                            value={refundNote}
                            onChange={(e) => onRefundNoteChange(e.target.value)}
                            placeholder="Nhập nội dung ghi chú"
                            className="macos-input resize-none w-full"
                        />
                    </CardContent>
                </Card>

                {/* Error/Success Message */}
                {errorHandle && (
                    <div className={`macos26-alert macos-fade-in ${
                        errorHandle.type === 'error' ? 'macos26-alert-error' : 'macos26-alert-success'
                    }`}>
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                {errorHandle.type === 'error' ? (
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                ) : (
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                )}
                            </svg>
                            <span className="text-sm">{errorHandle.message}</span>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default RefundModal;
