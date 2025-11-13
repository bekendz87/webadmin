// Base interfaces for Cashier Report
export interface CashierUser {
    _id: string;
    username: string;
    name?: string;
    first_name?: string;
    last_name?: string;
}

export interface CashierGroup {
    _id: string;
    name: string;
}

// Cashier report data structure
export interface CashierReportData {
    cash: number;
    atm?: number;
    visa: number;
    transfer: number;
    cash_more?: number;
}

export interface CashierReportItem {
    _id: string;
    cashier_name: string;
    cashier_username: string;
    topup: CashierReportData;
    withdraw: CashierReportData;
    total: CashierReportData;
}

export interface TransactionDetail {
    _id: string;
    code: string;
    total: number;
    payment_type: string;
    user: {
        username: string;
        first_name?: string;
        last_name?: string;
    };
    created_time: string;
    transaction_type: 'topup' | 'withdraw';
}

export interface CashierDetailData {
    cashier: string;
    topup: TransactionDetail[];
    withdraw: TransactionDetail[];
}

export interface CashierReportSummary {
    total_topup_cash: number;
    total_topup_visa: number;
    total_topup_transfer: number;
    total_withdraw_cash: number;
    total_cash_more: number;
    net_total: number;
}

// Request interfaces
export interface CashierReportRequest {
    from?: string;
    to?: string;
    cashier?: string;
    cashier_group?: string[];
    page?: number;
    limit?: number;
}

export interface CashierDetailRequest {
    cashier_username: string;
    from?: string;
    to?: string;
}

// Add new interfaces for invoice type change
export interface ChangeInvoiceTypeRequest {
    one_health_msg: {
        newTypeChange: string;
        invoiceId: string;
        codeFT?: string;
    };
}

export interface ChangeInvoiceTypeResponse {
    result: string;
    data?: any;
    message?: string;
    error?: {
        message: string;
    };
}

// Response interfaces
export interface CashierReportResponse {
    result: string;
    data?: {
        list: CashierReportItem[];
        summary: CashierReportSummary;
        count: number;
    };
    one_health_msg: any;
    message?: string;
    error?: {
        message: string;
    };
}

export interface CashierDetailResponse {
    result: string;
    data?: CashierDetailData;
    message?: string;
    error?: {
        message: string;
    };
}

// Option interface for dropdowns
export interface CashierOption {
    key: string;
    label: string;
}

// Constants - moved from component
export const CASHIER_TYPES: CashierOption[] = [
    { label: "Tất cả", key: "all_recharge" },
    { label: "Napas", key: "napas" },
    { label: "Nạp card điện thoại", key: "one_pay" },
    { label: "Nạp topup", key: "top-up" },
    { label: "Nạp card OH", key: "oh_card" },
    { label: "Nạp ATM", key: "epay_bank" },
    { label: "Visa/Master", key: "nganluong" },
    { label: "OnePay ATM", key: "onepay_atm" },
    { label: "OnePayVisa", key: "onepay_visa" },
    { label: "Trừ tiền", key: "debit" }
];

export const CASHIER_SOURCES: CashierOption[] = [
    { label: "Tất cả", key: "" },
    { label: "Chuyển khoản", key: "transfer" },
    { label: "Tiền mặt (New)", key: "cash" },
    { label: "Chuyển khoản ATM", key: "atm" },
    { label: "Chuyển khoản Visa/Master", key: "visa/master" },
    { label: "Tiền mặt và chuyển khoản Visa/Master", key: "cash_transfer_visa" },
    { label: "Tiền mặt và chuyển khoản ATM", key: "cash_transfer_atm" }
];

// Add sources for change functionality
export const CASHIER_CHANGE_SOURCES: CashierOption[] = [
    { label: "Chuyển khoản", key: "transfer" },
    { label: "Tiền mặt", key: "cash" },
    { label: "Visa/Master", key: "visa/master" }
];

export const CASHIER_ACCOUNTING_OPTIONS: CashierOption[] = [
    { label: "Tất cả", key: "all" },
    { label: "Đã hạch toán", key: "true" },
    { label: "Chưa hạch toán", key: "false" }
];

export const CASHIER_LIMIT_OPTIONS: number[] = [10, 25, 200, 250, 300];

// Payment types constants
export const PAYMENT_TYPES = [
    { value: 'CASH', label: 'Tiền mặt' },
    { value: 'ATM', label: 'ATM' },
    { value: 'VISA', label: 'VISA/MASTER' },
    { value: 'TRANSFER', label: 'Chuyển khoản' }
];

// Invoice type constants
export const INVOICE_TYPES = {
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
    [INVOICE_TYPES.TOP_UP]: 'Top up',
    [INVOICE_TYPES.ONE_PAY]: 'Nạp thẻ cào',
    [INVOICE_TYPES.OH_CARD]: 'Nạp OH Card',
    [INVOICE_TYPES.EPAY_BANK]: 'Nạp thẻ ATM - Epay',
    [INVOICE_TYPES.NGANLUONG]: 'Nạp thẻ (Visa/Master)-NL',
    [INVOICE_TYPES.OH_FOUNDATION]: 'Nạp thẻ DR.OH',
    [INVOICE_TYPES.ONEPAY_ATM]: 'OnePay ATM',
    [INVOICE_TYPES.ONEPAY_VISA]: 'OnePay VISA',
    [INVOICE_TYPES.DEBIT]: 'Trừ tiền',
    [INVOICE_TYPES.NAPAS]: 'Napas'
};

// Cash in source constants
export const CASH_IN_SOURCES = {
    IN_CASH: 'in_cash',
    TRANSFER: 'transfer',
    CASH: 'cash',
    ATM: 'atm',
    VISA_MASTER: 'visa/master',
    CASH_TRANSFER_ATM: 'cash_transfer_atm',
    CASH_TRANSFER_VISA: 'cash_transfer_visa'
} as const;

export const CASH_IN_SOURCE_LABELS: Record<string, string> = {
    [CASH_IN_SOURCES.IN_CASH]: 'Tiền mặt',
    [CASH_IN_SOURCES.TRANSFER]: 'Chuyển khoản',
    [CASH_IN_SOURCES.CASH]: 'Tiền mặt (New)',
    [CASH_IN_SOURCES.ATM]: 'ATM',
    [CASH_IN_SOURCES.VISA_MASTER]: 'Visa/Master',
    [CASH_IN_SOURCES.CASH_TRANSFER_ATM]: 'Tiền mặt/ Chuyển khoản (ATM)',
    [CASH_IN_SOURCES.CASH_TRANSFER_VISA]: 'Tiền mặt/ Chuyển khoản (Visa/Master)'
};

// Helper function to get cash in source label
export const getCashInSourceLabel = (cashInSource: string): string => {
    if (!cashInSource || cashInSource === '') {
        return 'Không';
    }
    return CASH_IN_SOURCE_LABELS[cashInSource] || cashInSource;
};

// Helper function to get invoice type label
export const getInvoiceTypeLabel = (invoiceType: string, ohSerial?: string): string => {
    const baseLabel = INVOICE_TYPE_LABELS[invoiceType] || invoiceType;
    
    if (invoiceType === INVOICE_TYPES.OH_CARD && ohSerial) {
        return `${baseLabel}(${ohSerial})`;
    }
    
    return baseLabel;
};

export type CashierAction = 'list' | 'detail' | 'groups' | 'users' | 'offset' | 'change-type';
