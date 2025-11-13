// Base interfaces
export interface User {
    _id: string;
    username: string;
    email?: string;
    fullName?: string;
    role?: string;
    root?: boolean;
    doctor?: boolean;
    group?: UserGroup;
    token?: string;
    conclusion_permission?: boolean;
    createdAt?: string;
    updatedAt?: string;
    type?: Number | 0;
    avatar?: string;
    loginTime: string;
    expiresAt: string;
}

export interface UserGroup {
    _id: string;
    name: string;
    description?: string;
    permissions?: string[];
}

export interface Permission {
    _id: string;
    name: string;
    code: string;
    module: string;
    action: string;
    resource: string;
}

export interface HospitalItem {
    key: string;
    value: string;
}

// Request interfaces
export interface LoginRequest {
    username: string;
    password: string; // Will be hashed with MD5
}

export interface LogoutRequest {
    token: string;
    userId?: string;
}

export interface RegisterRequest {
    username: string;
    password: string;
    email: string;
    fullName?: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

// Response interfaces
export interface AuthResponse {
    result: string; // "true" | "false"
    one_health_msg?: User;
    message?: string;
    error?: string;
}

export interface LoginResponse {
    success: boolean;
    data?: AuthResponse;
    user?: User;
    token?: string;
    permissions?: Permission[];
    message?: string;
    loginTime?: string;
    expiresIn?: number;
    hospitalList?: any
}

export interface PermissionResponse {
    result: boolean;
    one_health_msg?: Permission[];
    message?: string;
}

// Storage interfaces
export interface UserSession {
    user: User;
    token: string;
    permissions: Permission[];
    hospitalList?: HospitalItem[];
    isRoot?: boolean;
    doctor?: boolean;
    conclusion_permission?: boolean;
    loginTime: string;
    expiresAt: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    permissions: Permission[];
    loading: boolean;
    error: string | null;
}

// Cookie and Storage types
export interface CookieOptions {
    expires?: Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
}

export interface StorageKeys {
    USER_INFO: 'userInfo';
    TOKEN: 'token';
    PERMISSIONS: 'permission_by_user';
    HOSPITAL_LIST: 'hospitalList';
    IS_ROOT: 'isRoot';
    DOCTOR: 'doctor';
    CONCLUSION_PERMISSION: 'conclusion_permission';
}

// Validation types
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export interface SecurityConfig {
    tokenExpiry: number; // milliseconds
    maxLoginAttempts: number;
    lockoutDuration: number; // milliseconds
    passwordMinLength: number;
    requireSpecialChars: boolean;
}

// Error types
export interface AuthError {
    code: string;
    message: string;
    details?: any;
}

// Hospital data mapping (from original controller)
export interface HospitalMapping {
    [key: string]: HospitalItem[];
}

export const HOSPITAL_DATA: HospitalMapping = {
    "ungbuou,": [{
        key: "Ung Bướu",
        value: "ung_buou"
    }]
};

// Auth action types for API
export type AuthAction = 'login' | 'logout' | 'register' | 'forgot-password' | 'reset-password';

export interface AuthActionMap {
    login: LoginRequest;
    logout: LogoutRequest;
    register: RegisterRequest;
    'forgot-password': ForgotPasswordRequest;
    'reset-password': ResetPasswordRequest;
}

// Rate limiting types
export interface RateLimitConfig {
    maxAttempts: number;
    windowMs: number;
}

export interface RateLimitInfo {
    remaining: number;
    resetTime: Date;
    total: number;
}