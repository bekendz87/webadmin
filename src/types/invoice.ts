// Base interfaces
export interface InvoiceUser {
    _id: string;
    username: string;
    first_name?: string;
    last_name?: string;
}

// Remove duplicate DebitInfo - use from debit.ts instead
// export interface DebitInfo { ... } // REMOVED

export interface InvoiceItem {
    _id: string;
    seq: number;
    code: string;
    creator: InvoiceUser;
    user: InvoiceUser;
    cashType: string;
    invoiceRefund?: string;
    invoiceType: string;
    paymentSystem: string;
    modified_time: string;
    created_time: string;
    totalMoney: number;
    originMoney: number;
    totalCredit: number;
    originCredit: number;
    discountCredit?: number;
    moneyType?: 'payment' | 'refund' | 'cash-in';
    invoice_refund?: Array<{ code: string }>;
    amount_refund?: number; // Add this field for tracking total refunded amount
    // Import DebitInfo from debit.ts instead
    debit_info?: any; // Will be typed properly when importing from debit
    note?: string; // Add note field
}

export interface InvoiceReport {
    totalCashIn: number;
    totalPayCredit: number;
    totalPayMoney: number;
    totalRefund: number;
}

// Request interfaces
export interface InvoiceListRequest {
    limit?: number;
    page?: number;
    from?: string;
    to?: string;
    report_type?: 'all' | 'payment' | 'refund';
    invoiceType?: string;
    payment?: string;
    code?: string;
    username_creator?: string;
    username_user?: string;
    export?: 'excel' | 'pdf';
    show_all?: boolean;
    cache?: boolean; // Add this line
    // Remove debit-specific filters - these belong in debit.ts
    // group?: string;
}

// Response interfaces
export interface InvoiceListResponse {
    result: string;
    one_health_msg?: {
        list: InvoiceItem[];
        report: InvoiceReport;
        count: number;
    };
    message?: string;
    error?: {
        message: string;
    };
}

export interface InvoiceApiResponse {
    success: boolean;
    data?: {
        list: InvoiceItem[];
        report: InvoiceReport;
        count: number;
    };
    list?: InvoiceItem[];
    report?: InvoiceReport;
    count?: number;
    one_health_msg?: {
        list: InvoiceItem[];
        report: InvoiceReport;
        count: number;
    };
    message?: string;
}

// Filter types
export interface InvoiceType {
    value: string;
    key: string;
}

export interface CashType {
    value: string;
    key: 'all' | 'payment' | 'refund';
}

export interface PaymentType {
    value: string;
    key: 'all' | 'prepay' | 'postpaid';
}

// Refund related types
export interface RefundTypeOption {
    key: 'all_bill' | 'partial';
    value: string;
}

export interface PaymentUnit {
    value: string;
    name: string;
}

export interface DateOption {
    key: 'current_date' | 'custom_date' |'same_invoice_date';
    value: string;
}

// Debit types
export interface DebitType {
    value: string;
    key: string;
}

// Constants
export const INVOICE_TYPES: InvoiceType[] = [
    { value: "Tất cả", key: "all" },
    { value: "Toa thuốc", key: "prescription" },
    { value: "Cận lâm sàn", key: "paraclinical" },
    { value: "Dịch vụ", key: "service" },
    { value: "Gói khám", key: "examination" },
    { value: "Cuộc gọi", key: "call_his" },
    { value: "Chat", key: "chat" },
    { value: "Đặt khám tại nhà", key: "appointment" },
    { value: "Napas", key: "napas" },
    { value: "Nạp card điện thoại", key: "one_pay" },
    { value: "Nạp topup", key: "topup" },
    { value: "Nạp card OH", key: "oh_card" },
    { value: "Nạp ATM", key: "epay_bank" },
    { value: "Visa/Master", key: "nganluong" },
    { value: "Quỷ từ thiện", key: "oh_foundation" },
    { value: "Li xì", key: "lixi" },
    { value: "Đăt khám bệnh viện", key: "schedule_appointment" },
    { value: "Thu hồi điểm", key: "debit" },
    { value: "OnePay ATM", key: "onepay_atm" },
    { value: "OnePayVisa", key: "onepay_visa" },
    { value: "Thu hộ ngoại trú", key: "his_thuho_ngoaitru" },
    { value: "Tạm ứng nội trú", key: "his_tamung_noitru" },
    { value: "Hoàn tiền từ his", key: "refund_from_his" },
    { value: "Thanh toán xuất viện", key: "his_thanhtoan_xuatvien" },
    { value: "Trả tiền xuất viện", key: "cashback_his_thanhtoan_xuatvien" },
    { value: "Hoàn tiền thanh toán xuất viện", key: "refund_his_thanhtoan_xuatvien" },
    { value: "Hoàn tiền đặt lịch khám bệnh viện", key: "refund_schedule_appointment" },
    { value: "Hoàn tiền khác", key: "refund_other" }
];

export const CASH_TYPES: CashType[] = [
    { value: "Tất cả", key: "all" },
    { value: 'Thanh toán', key: 'payment' },
    { value: 'Hoàn tiền', key: 'refund' }
];

export const PAYMENT_TYPES: PaymentType[] = [
    { value: 'Tất cả', key: 'all' },
    { value: 'Trả bằng credit', key: 'prepay' },
    { value: 'Trả bằng tiền mặt', key: 'postpaid' }
];

// Refund related constants
export const REFUND_TYPE_OPTIONS: RefundTypeOption[] = [
    { key: 'all_bill', value: 'Hoàn toàn bộ hóa đơn' },
    { key: 'partial', value: 'Hoàn một phần' }
];

export const PAYMENT_UNITS: PaymentUnit[] = [
    { value: 'prepay', name: 'Credit' },
    { value: 'postpaid', name: 'Tiền mặt' }
];

export const DATE_OPTIONS: DateOption[] = [
    { key: 'current_date', value: 'Ngày hiện tại' },
    { key: 'same_invoice_date', value: 'Ngày tạo hoá đơn thanh toán' },
    { key: 'custom_date', value: 'Tùy chọn ngày' }
];

// Remove duplicate DEBIT_TYPES - use from debit.ts instead
// export const DEBIT_TYPES: DebitType[] = [ ... ] // REMOVED

export const INVOICE_PAYMENT_TYPES = [
    "prescription", "paraclinical", "service", "promotion", "call_his", "chat",
    "appointment", "napas", "oh_foundation", "schedule_appointment", "debit",
    "onepay_visa", "onepay_atm", "his_thuho_ngoaitru", "his_tamung_noitru",
    "his_thuho_toathuoc", "his_thanhtoan_xuatvien"
];

export const INVOICE_REFUND_TYPES = [
    "refund_prescription", "refund_appointment", "refund_paraclinical", "refund_service",
    "refund_other", "refund_schedule_appointment", "refund_from_his", "refund_his_thuho_toathuoc",
    "refund_his_thanhtoan_xuatvien", "cashback_his_thanhtoan_xuatvien"
];

export const INVOICE_CASH_IN_TYPES = [
    "one_pay", "top-up", "oh_card", "epay_bank", "nganluong", "onepay_visa", "onepay_atm"
];
export const INVOICE_TYPES_LABEL = {
    TOP_UP: 'top-up',
    ONE_PAY: 'one_pay',
    OH_CARD: 'oh_card',
    EPAY_BANK: 'epay_bank',
    NGANLUONG: 'nganluong',
    OH_FOUNDATION: 'oh_foundation',
    ONEPAY_ATM: 'onepay_atm',
    ONEPAY_VISA: 'onepay_visa',
    DEBIT: 'debit',
    NAPAS: 'napas'
} as const;

export const INVOICE_TYPE_LABELS: Record<string, string> = {
    [INVOICE_TYPES_LABEL.TOP_UP]: 'Top up',
    [INVOICE_TYPES_LABEL.ONE_PAY]: 'Nạp thẻ cào',
    [INVOICE_TYPES_LABEL.OH_CARD]: 'Nạp OH Card',
    [INVOICE_TYPES_LABEL.EPAY_BANK]: 'Nạp thẻ ATM - Epay',
    [INVOICE_TYPES_LABEL.NGANLUONG]: 'Nạp thẻ (Visa/Master)-NL',
    [INVOICE_TYPES_LABEL.OH_FOUNDATION]: 'Nạp thẻ DR.OH',
    [INVOICE_TYPES_LABEL.ONEPAY_ATM]: 'OnePay ATM',
    [INVOICE_TYPES_LABEL.ONEPAY_VISA]: 'OnePay VISA',
    [INVOICE_TYPES_LABEL.DEBIT]: 'Trừ tiền',
    [INVOICE_TYPES_LABEL.NAPAS]: 'Napas'
};

export const getInvoiceTypeLabel = (invoiceType: string, ohSerial?: string): string => {
    const baseLabel = INVOICE_TYPE_LABELS[invoiceType] || invoiceType;
    
    if (invoiceType === INVOICE_TYPES_LABEL.OH_CARD && ohSerial) {
        return `${baseLabel}(${ohSerial})`;
    }
    
    return baseLabel;
};

export type InvoiceAction = 'list' | 'detail' | 'refund';
// Remove DebitAction - use from debit.ts instead
// export type DebitAction = 'list' | 'detail'; // REMOVED
