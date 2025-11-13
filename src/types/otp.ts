// Base interfaces
export interface OtpItem {
    phone: string;
    pin_code: string;
    expire:string;
    status: string;
}

// Request interfaces
export interface OtpListRequest {
    limit?: number;
    search?: string;
}

// Response interfaces
export interface OtpListResponse {
    result: string;
    one_health_msg: OtpItem[];
}

export interface OtpApiResponse {
    success: boolean;
    result: string;
    data: OtpItem[];
    one_health_msg: OtpItem[];
    message?: string;
}

// API action types
export type OtpAction = 'list';

export interface OtpActionMap {
    list: OtpListRequest;
}

// Error types
export interface OtpError {
    code: string;
    message: string;
    details?: any;
}
