import React from 'react';
import * as ExaminationTypes from '@/types/examination';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import Modal from './Modal';
interface ExaminationDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    record: ExaminationTypes.ExaminationRecord | null;
    getPaymentText: (payment: string) => string;
}

const ExaminationDetailModal: React.FC<ExaminationDetailModalProps> = ({
    isOpen,
    onClose,
    record,
    getPaymentText
}) => {
    if (!isOpen || !record) return null;

    const getGenderText = (sex: string) => {
        return sex === 'male' ? 'Nam' : sex === 'female' ? 'Nữ' : '';
    };

    const getSourceAppText = (source: string | null) => {
        if (source === 'mb_bank') return 'Mini App MB Bank';
        if (source === 'momo') return 'Mini App Momo';
        return 'Website + App';
    };

    return (
        <Modal children={<div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div
                        className="flex items-center justify-between p-6 border-b"
                        style={{ borderColor: 'var(--primary-border)' }}
                    >
                        <div>
                            <h3 className="text-lg font-medium" style={{ color: 'var(--primary-text)' }}>
                                Chi tiết báo cáo khám
                            </h3>
                            <p className="text-sm mt-1" style={{ color: 'var(--primary-text)', opacity: 0.7 }}>
                                Mã đơn hàng: {record.code}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            leftIcon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            }
                        >
                            Đóng
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Patient Information */}
                            <div className="space-y-4">
                                <h4 className="text-md font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                                    Thông tin bệnh nhân
                                </h4>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Họ tên:</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{record.name}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Giới tính:</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{getGenderText(record.sex)}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Ngày sinh:</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(record.birthday)}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Mã bệnh nhân:</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{record.patient_code}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Tài khoản:</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{record.username}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-4">
                                <h4 className="text-md font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                                    Thông tin liên hệ
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Số điện thoại:</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{record.phone || 'Không có'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Email:</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{record.email || 'Không có'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Information */}
                            <div className="space-y-4">
                                <h4 className="text-md font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                                    Thông tin đơn hàng
                                </h4>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Mã đơn hàng:</span>
                                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{record.code}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Tổng tiền:</span>
                                        <span className="text-sm font-medium text-green-600 dark:text-green-400">{formatCurrency(record.total)}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Trạng thái:</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{record.order_status}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Ngày xác nhận:</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {record.confirm_time ? formatDate(record.confirm_time) : 'Chưa xác nhận'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Nơi đặt khám:</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{record.source}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Nguồn thanh toán:</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{getSourceAppText(record.mini_app_source)}</span>
                                    </div>

                                    {record.his_invoice_code && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Mã HĐ bệnh viện:</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{record.his_invoice_code}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Company Information */}
                        {record.series_exam_name && (
                            <div className="mt-6 space-y-4">
                                <h4 className="text-md font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                                    Thông tin công ty
                                </h4>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Tên công ty:</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{record.series_exam_name}</span>
                                    </div>

                                    {record.series_exam_code && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Mã công ty:</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{record.series_exam_code}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Doctor Information */}
                        {record.doctor_info && (
                            <div className="mt-6 space-y-4">
                                <h4 className="text-md font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                                    Thông tin bác sĩ
                                </h4>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Tên bác sĩ:</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {record.doctor_info.last_name} {record.doctor_info.first_name}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Username:</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{record.doctor_info.username}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Services Information */}
                        {record.services && record.services.length > 0 && (
                            <div className="mt-6 space-y-4">
                                <h4 className="text-md font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                                    Dịch vụ khám ({record.services.length})
                                </h4>

                                <div className="space-y-3">
                                    {record.services.map((service, index) => (
                                        <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {service.name}
                                                    </h5>
                                                    {service.code && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            Mã: {service.code}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right ml-4">
                                                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                                        {formatCurrency(service.price)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Additional Information */}
                        <div className="mt-6 space-y-4">
                            <h4 className="text-md font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                                Thông tin bổ sung
                            </h4>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Telemedicine:</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {record.order_meta?.doctor ? 'Có' : 'Không'}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Người xác nhận:</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {record.user_confirm || 'Chưa xác nhận'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>} />
    );
};

export default ExaminationDetailModal;
