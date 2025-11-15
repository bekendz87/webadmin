import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { formatCurrency } from '@/utils/formatters';
import { CASHIER_CHANGE_SOURCES, getCashInSourceLabel } from '@/types/cashier';
import { Button, Input, Select } from '@/components/ui';

interface ChangeInvoiceTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: any;
    onConfirm: (newType: string, ftCode?: string) => void;
    loading?: boolean;
}

const ChangeInvoiceTypeModal: React.FC<ChangeInvoiceTypeModalProps> = ({
    isOpen,
    onClose,
    invoice,
    onConfirm,
    loading = false
}) => {
    const [selectedSource, setSelectedSource] = useState('');
    const [ftCode, setFtCode] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && invoice) {
            setSelectedSource('');
            setFtCode('');
            setError('');
        }
    }, [isOpen, invoice]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedSource) {
            setError('Vui lòng chọn nguồn tiền.');
            return;
        }

        if (selectedSource === invoice?.cash_in_source) {
            setError('Nguồn tiền không thay đổi.');
            return;
        }

        if (selectedSource === 'transfer') {
            console.log('selectedSource', selectedSource);

            if (!ftCode.trim()) {
                setError('Vui lòng nhập mã FT cho chuyển khoản.');
                return;
            }

        }

        onConfirm(selectedSource, ftCode);
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    const onChangeSource = (value: string) => {
        console.log('Selected source value:', value);
        setSelectedSource(value);
        setError(''); // Clear any existing errors when source changes
    }

    // Filter available sources to exclude current source
    const availableSources = CASHIER_CHANGE_SOURCES.filter(source =>
        source.key !== invoice?.cash_in_source
    );

    const footerContent = (
        <>
            <Button
                variant="ghost"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 macos26-btn macos26-btn-ghost"
            >
                Hủy
            </Button>
            <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={!selectedSource || loading}
                className="flex-1 macos26-btn macos26-btn-primary"
            >
                {loading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                Xác nhận thay đổi
            </Button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Chuyển hình thức hóa đơn"
            maxWidth="md"
            closeOnBackdropClick={!loading}
            footerContent={footerContent}
            icon={
                <div className="w-12 h-12 liquid-glass-card !p-3 bg-orange-100/80 dark:bg-orange-900/50 flex items-center justify-center">
                    <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6 macos-fade-in">
                {/* Invoice Information Card */}
                <div className="liquid-glass-card bg-gradient-to-br from-orange-50/80 to-orange-100/60 dark:from-orange-900/30 dark:to-orange-800/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 liquid-glass-card !p-2 bg-orange-100/50 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-orange-900 dark:text-orange-100">Thông tin hóa đơn</h4>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--primary-text-secondary)]">Mã hóa đơn:</span>
                            <span className="text-sm font-semibold font-mono">{invoice?.code}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--primary-text-secondary)]">Nguồn hiện tại:</span>
                            <span className="px-3 py-1 text-xs bg-orange-100/70 dark:bg-orange-800/50 text-orange-800 dark:text-orange-200 rounded-full border border-orange-200/50 dark:border-orange-700/50">
                                {getCashInSourceLabel(invoice?.cash_in_source)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--primary-text-secondary)]">Số tiền:</span>
                            <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                                {formatCurrency(invoice?.totalCredit || 0)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="liquid-glass-card space-y-6">
                    {/* Source Selection */}
                    <div className="space-y-20">
                        <label className="macos26-input-label" htmlFor="source-select">
                            Nguồn tiền mới <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Select
                                value={selectedSource}
                                onChange={onChangeSource}
                                disabled={loading}
                                placeholder="Chọn nguồn tiền mới"
                                options={availableSources.map(item => ({
                                    key: item.key,
                                    value: item.key,
                                    label: item.label
                                }))}
                            />

                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l-4-4 4 4m0 6l-4 4-4-4" />
                                </svg>
                            </div>
                        </div>
                        {!selectedSource && (
                            <p className="text-xs text-[var(--primary-text-secondary)] mt-1">
                                Chọn nguồn tiền mới để thay đổi hình thức thanh toán
                            </p>
                        )}
                    </div>

                    {/* FT Code for Transfer */}
                    {selectedSource === 'transfer' && (
                        <div className="macos-fade-in space-y-2">
                            <label className="macos26-input-label" htmlFor="ft-code">
                                Mã FT <span className="text-red-500">*</span>
                            </label>
                            <Input
                                id="ft-code"
                                value={ftCode}
                                onChange={(e) => setFtCode(e.target.value)}
                                placeholder="Nhập mã FT chuyển khoản"
                                disabled={loading}
                                className="font-mono macos26-input"
                            />
                            <p className="text-xs text-[var(--primary-text-secondary)] mt-1">
                                Mã FT (Fund Transfer) là mã tham chiếu của giao dịch chuyển khoản
                            </p>
                        </div>
                    )}
                    <div className="macos-fade-in space-y-20"></div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="macos26-alert macos26-alert-error macos-fade-in">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm">{error}</span>
                        </div>
                    </div>
                )}
            </form>
        </Modal>
    );
};

export default ChangeInvoiceTypeModal;
