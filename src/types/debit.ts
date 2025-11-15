// Import shared types from invoice
import type { InvoiceUser } from './invoice';

// Base interfaces
export interface DebitUser {
    _id: string;
    username: string;
    first_name?: string;
    last_name?: string;
}

export interface DebitInfo {
    type: 'top_up' | 'oh_card' | 'withdraw' | 'noi_4' | string;
    serial?: string;
    note?: string;
    payment_method?: string;
    bank_info?: {
        customerName?: string;
        cardNumber?: string;
        accountNumber?: string;
        bankName?: string;
    };
}

export interface KeepDrawMoney {
    return_amount?: number;
    keep_amount?: number;
    rate?: {
        draw_type?: string;
        draw_value?: number;
    };
}

export interface DebitItem {
    _id: string;
    seq: number;
    code: string;
    creator: InvoiceUser;
    user: InvoiceUser;
    cashType: string;
    invoiceType: string;
    paymentSystem: string;
    modified_time: string;
    created_time: string;
    totalMoney: number;
    originMoney: number;
    totalCredit: number;
    originCredit: number;
    discountCredit?: number;
    moneyType?: 'payment';
    debit_info?: DebitInfo;
    note?: string;
    totalInvoice?: number;
    keep_draw_money?: KeepDrawMoney;
    countRF?: number;
    details?: DebitItem[];
    totalPageChild?: number;
    limit?: number;
    page?: number;
    idHtml?: string;
}

export interface DebitReport {
    totalPayCredit: number;
}

// Request interfaces
export interface DebitListRequest {
    limit?: number;
    page?: number;
    from?: string;
    to?: string;
    invoiceType?: string;
    debit_type?: string;
    debit_serial?: string;
    code?: string;
    username_creator?: string;
    username_user?: string;
    group?: string;
    export?: 'excel' | 'pdf';
    title?: string;
    cache?: boolean;
    withdraw_gr_by_creator?: boolean;
    report_type?: string;
    expanded?: boolean;
}

// Response interfaces
export interface DebitListResponse {
    result: string;
    one_health_msg?: {
        list: DebitItem[];
        report: DebitReport;
        count: number;
    };
    message?: string;
    error?: {
        message: string;
    };
}

export interface DebitApiResponse {
    success: boolean;
    data?: {
        list: DebitItem[];
        report: DebitReport;
        count: number;
    };
    list?: DebitItem[];
    report?: DebitReport;
    count?: number;
    one_health_msg?: {
        list: DebitItem[];
        report: DebitReport;
        count: number;
    };
    message?: string;
}

// Filter types
export interface DebitType {
    value: string;
    key: string;
}

// Constants specific to debit functionality
export const DEBIT_TYPES: DebitType[] = [
    { value: "Tất cả", key: "" },
    { value: "Top up", key: "top_up" },
    { value: "oh_card", key: "oh_card" },
    { value: "Yêu cầu rút tiền", key: "withdraw" },
    { value: "Nội 4", key: "noi_4" }
];

export const PAYMENT_METHODS = {
    'bank_transfer': 'Chuyển khoản ngân hàng',
    'cash': 'Tiền mặt',
    'credit': 'Credit',
    'other': 'Khác'
};

export const DRAW_TYPES = {
    'percentage': '%',
    'amount': 'VND',
    'fixed': 'Cố định'
};
