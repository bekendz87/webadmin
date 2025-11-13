export interface ScheduleAppointmentUser {
    _id: string;
    username: string;
    first_name?: string;
    last_name?: string;
}

export interface ScheduleAppointmentItem {
    _id: string;
    code: string;
    user: ScheduleAppointmentUser;
    created_time: string;
    modified_time: string;
    totalCredit: number;
    originCredit: number;
    discountCredit?: number;
    invoiceType: string;
    note?: string;
    // Schedule appointment specific fields
    appoint_code?: string;
    patient_code?: string;
    source?: string;
    book_price?: number;
    exam_price?: number;
    schedule_appointment?: {
        code: string;
        patient_code: string;
        source: string;
        user: ScheduleAppointmentUser;
    };
    item?: {
        amount_origin: number;
    };
}

export interface ScheduleAppointmentReport {
    total_paid: number;
    total_refund: number;
    total_amount?: number;
    discount?: number;
    count: number;
}

export interface ScheduleAppointmentListRequest {
    page?: number;
    limit?: number;
    from?: string;
    to?: string;
    source?: string;
    type?: string;
    patient_code?: string;
    order_code?: string;
    invoice_code?: string;
    username?: string;
    export_template?: 'accountant' | 'operate';
    selectedTypeDate?: string;
    selectedTypeAppointment?: string;
    export?: 'excel' | 'pdf';
}

export interface ScheduleAppointmentApiResponse {
    success: boolean;
    list: ScheduleAppointmentItem[];
    report: ScheduleAppointmentReport;
    total: number;
    byPage?: {
        totalPaid: number;
        totalRefund: number;
    };
}

// Constants
export const APPOINTMENT_SOURCES = [
    { text: "Tất cả", key: "all" },
    { text: "Hồng Đức 3", key: "hong_duc" },
    { text: "Hồng Đức 2", key: "hong_duc2" },
    { text: "Nhi Đồng 2", key: "nhi_dong" }
];

export const APPOINTMENT_TYPES = [
    { text: "Tất cả", key: "all" },
    { text: "Thanh toán", key: "payment" },
    { text: "Hoàn tiền", key: "refund" }
];

export const FILTER_TYPE_DATES = [
    { text: "Ngày tạo hoá đơn đặt khám", key: "created_time" },
    { text: "Ngày đặt khám", key: "exam_date" }
];

export const FILTER_TYPE_APPOINTMENTS = [
    { text: "Tất cả", key: "all" },
    { text: "Đã thanh toán", key: "paid" },
    { text: "Đã hoàn thành", key: "done" },
    { text: "Đã đăng ký", key: "registed" },
    { text: "Hoàn tiền", key: "refund" },
    { text: "Hết hạn", key: "expire" }
];
