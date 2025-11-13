import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { formatCurrency } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';

interface OffsetModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: any;
    onConfirm: (amount: number) => void;
    loading?: boolean;
}

const OffsetModal: React.FC<OffsetModalProps> = ({
    isOpen,
    onClose,
    invoice,
    onConfirm,
    loading = false
}) => {
    const [offsetAmount, setOffsetAmount] = useState('');
    const [error, setError] = useState('');

    const totalLimit = invoice?.totalCredit || 0;

    useEffect(() => {
        if (isOpen) {
            setOffsetAmount('');
            setError('');
        }
    }, [isOpen]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const numericValue = value.replace(/[^0-9.]/g, '');
        setOffsetAmount(numericValue);

        if (error) {
            setError('');
        }

        const amount: number = parseFloat(numericValue);
        if (amount > totalLimit) {
            setError('Số tiền cấn trừ không được vượt quá số tiền hoá đơn nạp!');
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        const amount: number = parseFloat(offsetAmount);

        if (!offsetAmount || isNaN(amount) || amount <= 0) {
            setError('Vui lòng nhập số tiền cấn trừ hợp lệ');
            return;
        }

        if (amount > totalLimit) {
            setError('Số tiền cấn trừ không được vượt quá số tiền hoá đơn nạp!');
            return;
        }

        onConfirm(amount);
    };

    const handleClose = (): void => {
        if (!loading) {
            onClose();
        }
    };

    const footerContent = (
        <>
            <Button
                variant="ghost"
                onClick={handleClose}
                disabled={loading}
            >
                Hủy
            </Button>
            <Button
                variant="primary"
                onClick={() => handleSubmit(new Event('submit') as unknown as React.FormEvent<HTMLFormElement>)}
                disabled={!offsetAmount || !!error || loading}
                loading={loading}
            >
                {loading ? 'Đang xử lý...' : 'Cấn trừ'}
            </Button>
        </>
    );

    const modalIcon = (
        <Card className="w-12 h-12 !p-3 bg-orange-100/80 dark:bg-orange-900/50 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
        </Card>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Cấn trừ hóa đơn"
            maxWidth="md"
            footerContent={footerContent}
            icon={modalIcon}
            closeOnBackdropClick={!loading}
        >
            <form onSubmit={handleSubmit} className="space-y-6 macos-fade-in">
                {/* Invoice Information */}
                <Card className="bg-gradient-to-br from-orange-50/80 to-orange-100/60 dark:from-orange-900/30 dark:to-orange-800/20">
                    <CardContent className="space-y-4">
                        <h4 className="text-lg font-semibold text-[var(--primary-text)] mb-4">Thông tin hóa đơn</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-[var(--primary-text-secondary)]">Mã hóa đơn:</span>
                                <span className="text-sm font-semibold text-orange-600 dark:text-orange-400 font-mono">
                                    {invoice?.code || 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-[var(--primary-text-secondary)]">Tổng tiền hóa đơn:</span>
                                <span className="text-lg font-semibold text-[var(--primary-text)]">
                                    {formatCurrency(totalLimit)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-[var(--primary-text-secondary)]">Người tạo:</span>
                                <span className="text-sm font-medium text-[var(--primary-text)]">
                                    {invoice?.creator?.username || 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-[var(--primary-text-secondary)]">Người sử dụng:</span>
                                <span className="text-sm font-medium text-[var(--primary-text)]">
                                    {invoice?.user?.username || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Amount Input */}
                <Card>
                    <CardContent className="space-y-4">
                        <Input
                            label="Số tiền cấn trừ"
                            value={offsetAmount}
                            onChange={handleAmountChange}
                            placeholder="Nhập số tiền cần cấn trừ"
                            error={error}
                            disabled={loading}
                            helperText={offsetAmount && !error ? `Số tiền: ${formatCurrency(parseFloat(offsetAmount) || 0)}` : undefined}
                        />

                        {/* Progress Indicator */}
                        {offsetAmount && !error && (
                            <div className="space-y-3 macos-fade-in">
                                <Progress
                                    value={(parseFloat(offsetAmount) || 0)}
                                    max={totalLimit}
                                    label="Tiến trình cấn trừ"
                                    showValue={true}
                                    variant="warning"
                                    size="md"
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Warning Notice */}
                <Card className="macos26-alert macos26-alert-warning">
                    <CardContent>
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 mt-1">
                                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                                    Lưu ý quan trọng
                                </h4>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    Việc cấn trừ hóa đơn sẽ không thể hoàn tác. Vui lòng kiểm tra kỹ số tiền trước khi xác nhận.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </Modal>
    );
};

export default OffsetModal;