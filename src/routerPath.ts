import { Route } from "react-router-dom";

const routerPath = {
    // Client routes
    login: '/login',
    register: '/register',
    dashboard: '/main',
    otp: '/otp',
    invoice: '/invoice', // Add invoice route
    cashier: '/cashier', // Add cashier route
    scheduleAppointment: '/schedule-appointment-report',
    examinationReport: '/examination-report',

    // Next.js API routes (internal) - via proxy
    auth: {
        login: '/api/auth/login',
        logout: '/api/auth/logout',
        register: '/api/auth/register',
        forgotPassword: '/api/auth/forgot-password',
        resetPassword: '/api/auth/reset-password',
    },

    // OTP API routes (internal) - via proxy


    // Invoice API routes (internal) - via proxy
    invoice_client: {
        list: '/api/invoice/list',
        detail: '/api/invoice/detail/:id',
        refund: '/api/invoice/refund',
    },

    // Cashier API routes (internal) - via proxy
    cashier_client: {
        list: '/api/cashier/list',
        detail: '/api/cashier/detail',
        groups: '/api/cashier/groups',
        users: '/api/cashier/users',
        offset: '/api/cashier/offset',
    },

    // Schedule Appointment API routes (internal) - via proxy
    schedule_appointment_client: {
        list: '/api/schedule-appointment/list',
    },

    // Examination Report API routes (internal) - via proxy
    examination_report_client: {
        list: '/api/examination-report/list',
        searchHealthService: '/api/examination-report/search-health-service',
    },

    // Dashboard API routes (internal) - via proxy
    dashboard_client: {
        base: '/api/dashboard',
        statQuestion: '/api/dashboard/stat-question',
        statPrescription: '/api/dashboard/stat-prescription',
        statUser: '/api/dashboard/stat-user',
        statCallHistory: '/api/dashboard/stat-call-history',
        totalCashIn: '/api/dashboard/total-cash-in',
        statParaclinicalRevenue: '/api/dashboard/stat-paraclinical-revenue',
        statPrescriptionRevenue: '/api/dashboard/stat-prescription-revenue',
        cashInStat: '/api/dashboard/cash-in-stat',
        topDoctors: '/api/dashboard/top-doctors',
        cashInStatMonths: '/api/dashboard/cash-in-stat-months',
    },

    // Backend API endpoints
    backend: {
        login: '/users/login',
        logout: '/logout',
        register: '/auth/register',
        'forgot-password': '/auth/forgot-password',
        'reset-password': '/auth/reset-password',
    },

    // Backend OTP endpoints
    BACKEND_OTP: {
        LIST: '/verify',
    },

    // Backend invoice endpoints
    BACKEND_INVOICE: {
        LIST: '/invoices/list',
        DETAIL: '/invoices',
        REFUND: '/invoices/refund/:id',
    },

    // Backend cashier endpoints
    BACKEND_CASHIER: {
        LIST: '/invoices/list',
        DETAIL: '/report/cashier-detail',
        GROUPS: '/groups',
        USERS: '/users',
        OFFSET: '/invoices/off-set/:id',
        CHANGE_TYPE: '/invoices/change-invoice-type',
    },

    // Backend schedule appointment endpoints
    BACKEND_SCHEDULE_APPOINTMENT: {
        LIST_ACCOUNTANT: '/report/schedule-appointment/list/accountant',
        LIST_OPERATOR: '/other_hos/schedule_appointments/report',
    },

    // Backend examination report endpoints
    BACKEND_EXAMINATION_REPORT: {
        LIST: '/order/examination/report',
        SEARCH_HEALTH_SERVICE: '/healthService/search-text',
    },

    // Backend dashboard endpoints
    BACKEND_DASHBOARD: {
        STAT_QUESTION: '/question-answer/stat',
        STAT_PRESCRIPTION: '/prescriptions/stat',
        STAT_USER: '/users/stat',
        STAT_CALL_HISTORY: '/call-history/stat',
        TOTAL_CASH_IN: '/payment-his/cash-in/total',
        STAT_PARACLINICAL_REVENUE: '/paraclinical/stat/revenue',
        STAT_PRESCRIPTION_REVENUE: '/prescriptions/stat/revenue',
        CASH_IN_STAT: '/payment-his/cash-in/stat',
        TOP_DOCTORS: '/call-history/doctor/top',
        CASH_IN_STAT_MONTHS: '/payment-his/cash-in/stat/inYear',
    },


};

// API Endpoints structure for new pattern
export const API_ENDPOINTS = {
    // Auth endpoints
    AUTH: '/api/auth',

    // OTP endpoints
    OTP: '/api/otp',

    // Invoice endpoints
    INVOICE: routerPath.invoice_client,

    // Cashier endpoints
    CASHIER: {
        list: '/api/cashier/list',
        detail: '/api/cashier/detail',
        groups: '/api/cashier/groups',
        users: '/api/cashier/users',
        offset: '/api/cashier/offset',
        changeType: '/api/cashier/change-type',
    },

    // Schedule Appointment endpoints
    SCHEDULE_APPOINTMENT: '/api/schedule-appointment',

    // Examination Report endpoints
    EXAMINATION_REPORT: '/api/examination-report',

    // Dashboard endpoints
    DASHBOARD: '/api/dashboard',

    // Backend dashboard endpoints
    BACKEND_DASHBOARD: routerPath.BACKEND_DASHBOARD,

    // Backend examination report endpoints

    BACKEND_EXAMINATION_REPORT: routerPath.BACKEND_EXAMINATION_REPORT,

    // Backend cashier endpoints
    BACKEND_CASHIER: routerPath.BACKEND_CASHIER,
};

export default routerPath;