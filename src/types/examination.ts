import { text } from "stream/consumers";

export interface ExaminationReportItem {
    _id: string;
    code: string;
    name: string;
    sex: 'male' | 'female';
    username: string;
    birthday: string;
    patient_code: number;
    user_confirm: string;
    series_exam_name: string;
    series_exam_code: string;
    total: number;
    confirm_time: string;
    source: string;
    order_status: string;
    his_invoice_code?: string;
    order_meta?: {
        doctor?: any;
    };
    doctor_info?: {
        username: string;
        last_name: string;
        first_name: string;
    };
    mini_app_source?: 'mb_bank' | 'momo' | null;
    services: ExaminationService[];
    count_done: number;
    count_sent: number;
}

export interface ExaminationService {
    service_code: string;
    user_confirm: string;
    amount: number;
    order_code: string;
    payment: 'postpaid' | 'prepay';
}

export interface HealthService {
    _id: string;
    title: string;
}

export interface ExaminationReportApiResponse {
    success: boolean;
    result: string;
    data?: ExaminationReportItem[];
    one_health_msg?: ExaminationReportItem[];
    error?: {
        message: string;
    };
}

export interface ExaminationReportSummary {
    count: number;
    count_done: number;
    count_sent: number;
    total: number;
}

// Filter options
export const EXAMINATION_TEMPLATES = [
    { key: 'all', text: 'Tất cả'},
    { key: 'examination', text: 'Báo cáo gói khám'},
    { key: 'request_paraclinical', text: 'Chỉ định dịch vụ' }
] as const;

export const PAYMENT_TYPES = [
    { key: '', text: 'Tất cả' },
    { key: 'postpaid', text: 'Tiền mặt' },
    { key: 'prepay', text: 'Credit DrOH' }
] as const;

export const SOURCES = [
    { key: '', text: 'Tất cả' },
    { key: 'hong_duc', text: 'Hồng Đức' },
    { key: 'drkhoa', text: 'Dr Khoa' }
] as const;



export const SEARCH_OPTIONS = [
    { key: 'patient_code' as const, text: 'Mã bệnh nhân' },
    { key: 'order_code' as const, text: 'Mã đơn hàng (Order)' },
    { key: 'serial_code' as const, text: 'Mã đợt khám' },
    { key: 'username_confirm' as const, text: 'Tài khoản xác nhận' }
] as const;

export type SearchOptionKey = typeof SEARCH_OPTIONS[number]['key'];
export type ExaminationAction = 'list' | 'search-health-service';
