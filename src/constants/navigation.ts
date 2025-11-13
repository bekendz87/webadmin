import {
  Settings,
  Users,
  FileText,
  Home,
  ClipboardList,
  CalendarCheck,
  CreditCard,
  Search,
  MessageCircleIcon,
  Wallet,
  CalendarCheck2,
  Syringe,
  Banknote,
  Ticket,
  History,
  Check,
  CheckCheck,
  FolderArchive,
  Menu,
  Scroll,
  Building2,
  FileSpreadsheet,
  Scan,
  Tablets,
  Phone,
  TestTube,
  Receipt,
  CircleDollarSign,
  Bell,
  ShieldCheck,
  Users2,
  MapPin,
  PencilRuler,
  TerminalSquare,
  Send,
  Percent,
  Scale,
  Lock,
  FileCode2,
  Gauge,
  FileLineChart,
  Stethoscope,
  Droplet,
} from 'lucide-react';
import { PATHS } from './paths';

// Thêm interface Permission để check quyền
interface Permission {
  name: string;
  items?: Permission[];
}

// Add SubNavItem interface
export interface SubNavItem {
  title: string;
  url?: string;
  permission?: string;
  items?: SubNavItem[];
}

// Thêm permission vào NavItem
export interface NavItem {
  title: string;
  url?: string;
  icon: any;
  permission?: string; // Thêm permission check
  items: SubNavItem[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

// Thêm helper function để check permissions
function hasValidPermissions(items: (NavItem | SubNavItem)[], permissions: string[]): boolean {
  // If permissions include '*', show all items
  if (permissions.includes('*')) {
    return true;
  }

  return items.some(item => {
    // Nếu không có permission thì coi như valid
    if (!item.permission) {
      return true;
    }
    // Kiểm tra permission của item hiện tại
    const hasPermission = permissions.includes(item.permission);

    // Nếu có sub-items thì kiểm tra đệ quy
    if (item.items && item.items.length > 0) {
      return hasPermission || hasValidPermissions(item.items, permissions);
    }

    return hasPermission;
  });
}

// Định nghĩa raw navigation data
const RAW_NAV_DATA: NavSection[] = [
  {
    label: 'Chính',
    items: [
      {
        title: 'Trang chủ',
        url: PATHS.DASHBOARD,
        icon: Home,
        // permission: 'show_home',
        items: [],
      },
    ],
  },
  {
    label: 'Báo cáo',
    items: [
      {
        title: 'Tổng hợp báo cáo',
        url: '#!/report-overall',
        icon: ClipboardList,
        permission: 'report_overall',
        items: [
          { title: 'Báo cáo doanh thu nhà cung cấp', url: PATHS.REPORT_MERCHAN, permission: 'report_merchan', items: [] },
          { title: 'Người dùng', url: PATHS.REPORT_USER, permission: 'report_user_managerment', items: [] },
          { title: 'Lịch sử giao dịch người dùng', url: PATHS.REPORT_BALANCE, permission: 'report_user_managerment', items: [] },
          { title: 'Doanh thu', url: PATHS.REPORT_INVOICE, permission: 'invoice_revenue', items: [] },
          { title: 'Đặt khám bệnh viện', url: PATHS.REPORT_HOSPITAL_APPOINTMENT, permission: 'schedule_appointment_report', items: [] },
          { title: 'Đặt khám bệnh viện mới', url: PATHS.REPORT_HOSPITAL_APPOINTMENT_NEW, permission: 'schedule-appointment-report-new', items: [] },
          { title: 'Gói khám', url: PATHS.REPORT_EXAMINATION, permission: 'report_user_managerment', items: [] },
          { title: 'Gói khám mới', url: PATHS.REPORT_NEW_EXAMINATION, permission: 'report_new_examination', items: [] },
          { title: 'Gói khám ngoại viện', url: PATHS.REPORT_OUT_HOSPITAL, permission: 'report_out_hospital_total', items: [] },
          { title: 'Nạp tài khoản', url: PATHS.REPORT_CARD, permission: 'invoice_card', items: [] },
          { title: 'Thu hồi điểm', url: PATHS.REPORT_DEBIT, permission: 'invoice_debit', items: [] },
          { title: 'Yêu cầu rút tiền', url: PATHS.REPORT_DEBIT_WITHDRAW, permission: 'invoice_debit', items: [] },
          { title: 'Chuyển/Trả tiền cho khách', url: PATHS.REPORT_RETURN_MONEY, permission: 'invoice_debit', items: [] },
          { title: 'Báo cáo thu ngân (New)', url: PATHS.REPORT_CASHIER, permission: 'report_user_managerment', items: [] },
          { title: 'SMS', url: PATHS.REPORT_SMS, permission: 'report_sms', items: [] },
          { title: 'Dịch vụ', url: PATHS.REPORT_SERVICE, permission: 'report_service', items: [] },
          { title: 'Đơn hàng', url: PATHS.REPORT_ORDER_STATUS, permission: 'order_status_report', items: [] },
          { title: 'Khuyến mãi', url: PATHS.REPORT_PROMOTION, permission: 'promotion_report', items: [] },
          { title: 'Thu hộ chi hộ', url: PATHS.REPORT_COD, permission: 'cod_report', items: [] },
          { title: 'Thanh toán xuất viện', url: PATHS.REPORT_OUT_HOSPITAL_PAYMENT, permission: 'report_user_managerment', items: [] },
          { title: 'Hạch toán', url: PATHS.REPORT_ACCOUNTING, permission: 'accounting-report', items: [] },
          { title: 'Urbox', url: PATHS.REPORT_URBOX, permission: 'urbox-report', items: [] },
          { title: 'Bán thuốc qua toa', url: PATHS.REPORT_PRESCRIPTION, permission: 'prescription-report', items: [] },
          { title: 'Thu hộ toa thuốc', url: PATHS.REPORT_COD_PRESCRIPTION, permission: 'cod-presciption-report', items: [] },
          { title: 'Lấy máu tại nhà', url: PATHS.REPORT_TAKEBLOOD, permission: 'report_takeblood', items: [] },
          { title: 'Thu ngân', url: PATHS.REPORT_CASHIER_TOPUP, permission: 'cashier-topup-report', items: [] },
          { title: 'Tổng hợp thu chi bệnh viện', url: PATHS.REPORT_COD_GENERAL, permission: 'cod-general-report', items: [] },
          { title: 'Tổng hợp thu chi DrOh', url: PATHS.REPORT_COD_GENERAL_DROH, permission: 'cod-general-droh-report', items: [] },
          { title: 'Export Excel', url: PATHS.REPORT_EXPORT_EXCEL, permission: 'export-excel', items: [] },
          { title: 'Lịch sử giao dịch thanh toán MOMO', url: PATHS.REPORT_MOMO, permission: 'report_momo', items: [] },
        ],
      },
    ],
  },
  {
    label: 'Quản lý người dùng',
    items: [
      {
        title: 'Người dùng',
        icon: Users,
        permission: 'user_managerment',
        items: [
          { title: 'Nhóm người dùng', url: PATHS.USER_GROUPS, permission: 'admin_managerment' },
          { title: 'Quản trị viên', url: PATHS.ADMIN_LIST, permission: 'admin_managerment' },
          { title: 'Đối tác', url: PATHS.LIST_MERCHAN, permission: 'admin_managerment' },
          { title: 'Bác sĩ', url: PATHS.DOCTOR_LIST, permission: 'doctor_managerment' },
          { title: 'Khách hàng', url: PATHS.PATIENT_LIST, permission: 'patient_managerment' },
          { title: 'Nhân viên', url: PATHS.STAFF_LIST, permission: 'staff_managerment' },
          { title: 'Nhân viên lấy máu', url: PATHS.SHIPPER_LIST, permission: 'shipper_managerment' },
          { title: 'Đăng ký tài khoản', url: PATHS.SIGN_UP, permission: 'patient_managerment' },
          { title: 'Yêu cầu bệnh án điện tử', url: PATHS.LIST_REQUEST_BADT, permission: 'badt_managerment' },
        ],
      },
    ],
  },
  {
    label: 'Lịch hẹn',
    items: [
      {
        title: 'Đặt khám video call',
        url: PATHS.VIDEO_CALL_SCHEDULE,
        icon: CalendarCheck,
        permission: 'video_call_schedule',
        items: [],
      },
      {
        title: 'Đặt khám bệnh viện',
        icon: CalendarCheck2,
        permission: 'list_schedule_appointments',
        items: [
          { title: 'Lịch khám', url: PATHS.SCHEDULE_APPOINTMENTS, permission: 'list_schedule_appointments', items: [] },
          { title: 'Tìm kiếm bệnh nhân ung bướu', url: PATHS.SEARCH_PATIENT_UNGBUOU, permission: 'patient_info', items: [] },
          { title: 'Cài đặt lịch chuyên khoa', url: PATHS.SPECIALITY_TIMETABLE, permission: 'list_schedule_appointments', items: [] },
        ],
      },
    ],
  },
  {
    label: 'Hỗ trợ',
    items: [
      {
        title: 'Hỏi đáp',
        icon: MessageCircleIcon,
        permission: 'question_managerment',
        items: [
          { title: 'Danh sách', url: PATHS.QUESTION_LIST, permission: 'question_managerment', items: [] },
        ],
      },
      {
        title: 'Quỹ từ thiện',
        permission: 'foundation_managerment',
        icon: Wallet,
        items: [
          { title: 'Sự kiện', url: PATHS.EVENTS, permission: 'foundation_event_managerment', items: [] },
          { title: 'Lịch sử quyên góp', url: PATHS.FOUNDATION_HIS, permission: 'foundation_his_managerment', items: [] },
          { title: 'Quản lý quỹ', url: PATHS.FOUNDATION_ACCOUNTS, permission: 'foundation_managerment', items: [] },
          { title: 'Quyên góp định kỳ', url: PATHS.SCHEDULES_DONATE, permission: 'schedule_donate_managerment', items: [] },
        ],
      },
    ],
  },
  {
    label: 'Dịch vụ',
    items: [
      {
        title: 'Dịch vụ',
        icon: Syringe,
        permission: 'service_managerment',
        items: [
          { title: 'Dịch vụ', url: PATHS.HEALTH_SERVICE, permission: 'service_managerment' },
          { title: 'Dịch vụ cận lâm sàng', url: PATHS.MYSQL_SERVICES, permission: 'service_managerment' },
          { title: 'Thống kê đăng ký', url: PATHS.ORDER, permission: 'order_service_managerment' },
          { title: 'Đợt khám', url: PATHS.SERIES_EXAM },
          { title: 'Kết luận khám', url: PATHS.ACCESS_CONCLUSION },
          { title: 'Đăng ký hồ sơ bằng Excel', url: PATHS.IMPORT_PROFILE, permission: 'import_profile_service' },
          { title: 'Đăng ký dịch vụ bằng Excel', url: PATHS.IMPORT_SERVICE, permission: 'import_profile_service' },
        ],
      },
    ],
  },
  {
    label: 'Tài chính',
    items: [
      {
        title: 'Nạp tài khoản OH',
        icon: Banknote,
        items: [
          { title: 'Nạp trực tiếp', url: PATHS.ADD_CREDIT_V2, permission: 'topup_web' },
          { title: 'Mua thẻ nạp', url: PATHS.OH_CARD, permission: 'buy_oh_card' },
          { title: 'Trừ điểm', url: PATHS.DEBIT_CREDIT, permission: 'debit-credit' },
          { title: 'Yêu cầu rút tiền', url: PATHS.WITHDRAW, permission: 'withdraw' },
        ],
      },
      {
        title: 'Hoàn tiền',
        icon: CreditCard,
        items: [
          { title: 'Hoàn tiền Topup', url: PATHS.REFUND_TOPUP, permission: 'debit-credit' },
          { title: 'Yêu cầu rút tiền', url: PATHS.WITHDRAW, permission: 'withdraw' },
        ],
      },
    ],
  },
  {
    label: 'Khuyến mãi',
    items: [
      {
        title: 'Khuyến mãi',
        permission: 'promotion_managerment',
        icon: Ticket,
        items: [
          { title: 'Mã khuyến mãi', url: PATHS.PROMOTION_CODE, items: [], permission: 'promotion_coce_managerment' },
          { title: 'Khuyến mãi mới', url: PATHS.MODULE_PROMOTION, items: [], permission: 'promotion_code_new_manager' },
          { title: 'Voucher', url: PATHS.VOUCHER, items: [], permission: 'promotion_coce_managerment' },
          { title: 'Voucher Type', url: PATHS.VOUCHER_TYPE, items: [], permission: 'promotion_coce_managerment' },
          { title: 'Khuyến mãi gói khám', url: PATHS.EXAMINATION_DISCOUNT, items: [], permission: 'examination_discount' },
        ],
      },
    ],
  },
  {
    label: 'Báo cáo Carepay',
    items: [
      {
        title: 'Lịch sử giao dịch người dùng',
        url: PATHS.MBBANK_HISTORY_USER,
        icon: History,
        permission: 'report_user_managerment',
        items: []
      },
      {
        title: 'Xác nhận chuyển tiền bước 1',
        url: PATHS.MBBANK_CASHOUT_CONFIRM_LEVEL1,
        icon: Check,
        permission: 'cashout-care-pay-level1',
        items: []
      },
      {
        title: 'Xác nhận chuyển tiền bước 2',
        url: PATHS.MBBANK_CASHOUT_CONFIRM_LEVEL2,
        permission: 'cashout-care-pay-level2',
        icon: CheckCheck,
        items: []
      },
      {
        title: 'Rút tiền BHYT',
        url: PATHS.REFUND_BHYT,
        permission: 'refund-bhyt',
        icon: Banknote,
        items: []
      },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      {
        title: 'Cài đặt',
        url: PATHS.SETTINGS,
        icon: Settings,
        permission: 'takeblood_menu.setting',
        items: [],
      },
      {
        title: 'Thư viện ảnh',
        url: PATHS.GALLERY,
        icon: FolderArchive,
        permission: 'gallery',
        items: [],
      },
      {
        title: 'Quản lý danh mục',
        icon: Menu,
        items: [
          { title: 'Chuyên khoa', url: PATHS.SPECIALITIES_LIST, permission: 'speciality_managerment' },
          { title: 'Chức danh bác sĩ', url: PATHS.DOCTOR_TITLE_LIST, permission: 'doctor_title_managerment' },
          { title: 'Tin tức ứng dụng', url: PATHS.NEWS, permission: 'news_app_managerment' },
        ],
      },
      {
        title: 'Thanh toán dịch vụ tự động',
        icon: Scroll,
        items: [
          { title: 'Cài đặt tài khoản', url: PATHS.AUTO_PAY_SERVICE_CONFIG_SETUP, items: [], permission: 'auto_pay_service_config' },
          { title: 'Lịch sử thanh toán', url: PATHS.AUTO_PAY_SERVICE_CONFIG_SCHEDULE, items: [], permission: 'auto_pay_service_config' },
        ],
      },
      {
        title: 'Thông tin công ty',
        url: PATHS.COMPANY_INFO,
        permission: 'company_info',
        icon: Building2,
        items: [],
      },
      {
        title: 'Quảng cáo',
        url: PATHS.ADVERTISEMENT_LIST,
        icon: FileSpreadsheet,
        permission: 'advertisement',
        items: [],
      },
      {
        title: 'Giao dịch điện tử',
        url: PATHS.CHECKOUT_PAYMENT,
        permission: 'checkout_payment',
        icon: Scan,
        items: [],
      },
      {
        title: 'Nhóm người dùng',
        url: PATHS.USER_GROUP,
        permission: 'group_usermanagerment',
        icon: Users2,
        items: [],
      },
      {
        title: 'Thông tin địa chỉ',
        url: PATHS.USER_ADDRESS,
        permission: 'group_usermanagerment',
        icon: MapPin,
        items: [],
      },
      {
        title: 'Chỉnh sửa giá dịch vụ',
        url: PATHS.EDIT_SERVICES,
        permission: 'group_usermanagerment',
        icon: PencilRuler,
        items: [],
      },
      {
        title: 'Batch Job',
        url: PATHS.BATCH_JOB,
        icon: TerminalSquare,
        permission: 'batch_job',
        items: [],
      },
      {
        title: 'Gửi SMS',
        url: PATHS.SEND_SMS,
        permission: 'send_sms',
        icon: Send,
        items: [],
      },
      {
        title: 'PT thanh toán',
        url: PATHS.PAYMENT_METHOD,
        permission: 'rate_managerment',
        icon: CreditCard,
        items: [],
      },
      {
        title: 'Tỉ lệ quy đổi',
        url: PATHS.RATE,
        permission: 'rate_managerment',
        icon: Percent,
        items: [],
      },
      {
        title: 'Tỉ lệ giá dịch vụ',
        url: PATHS.RATE_SERVICE,
        permission: 'rate_managerment',
        icon: Scale,
        items: [],
      },
      {
        title: 'Thông báo',
        url: PATHS.NOTIFICATION,
        permission: 'notification_managerment',
        icon: Bell,
        items: [],
      },
      {
        title: 'Phân quyền',
        url: PATHS.ACL,
        icon: ShieldCheck,
        permission: 'permission_access',
        items: [],
      },
      {
        title: 'Nhóm quyền',
        url: PATHS.ROLES,
        permission: 'group_permission_managerment',
        icon: Settings,
        items: [],
      },
      {
        title: 'Quản lý mã lỗi',
        url: PATHS.ERRORCODE,
        icon: FileCode2,
        permission: 'error_code_managerment',
        items: [],
      },
      {
        title: 'Versions',
        url: PATHS.VERSION,
        permission: 'version_managerment',
        icon: Gauge,
        items: [],
      },
      {
        title: 'Quyền truy cập',
        url: PATHS.PERMISSIONS,
        permission: 'permission_managerment',
        icon: Lock,
        items: [],
      },
      {
        title: 'Log',
        url: PATHS.LOG,
        icon: FileLineChart,
        permission: 'permission_managerment',
        items: [],
      },
      {
        title: 'Hỗ trợ y tế',
        icon: Settings,
        permission: 'support_medical',
        items: [
          { title: 'Bảng mã ICD', url: PATHS.ICD, permission: 'icd_managerment', items: [] },
          { title: 'DS triệu chứng', url: PATHS.SYMPTOM, permission: 'sympton_managerment', items: [] },
        ],
      },
    ],
  },
  {
    label: 'Bác sĩ khám từ xa',
    items: [
      {
        title: 'Đặt khám video call',
        url: PATHS.VIDEO_CALL_SCHEDULE,
        permission: 'video_call_schedule',
        icon: Phone,
        items: [],
      },
      {
        title: 'Bác sĩ kê toa',
        url: PATHS.DOCTOR_PRESCRIPTION_LIST,
        permission: 'permission_managerment',
        icon: Stethoscope,
        items: [],
      },
      {
        title: 'Gọi thoại',
        icon: Phone,
        items: [
          { title: 'Lịch sử gọi thoại', url: PATHS.CALL_HISTORY_LIST, items: [], permission: 'call_history_managerment' },
          { title: 'Chat', url: PATHS.CHAT_LIST, items: [], permission: 'call_history_managerment' },
          { title: 'Báo cáo chat', url: PATHS.CHAT_REPORT, items: [], permission: 'permission_managerment' },
          { title: 'Lịch bác sĩ', url: PATHS.DOCTOR_CALL_SCHEDULE, items: [], permission: 'call_history_managerment' },
        ],
      },
    ],
  },
  {
    label: 'Lấy máu tại nhà',
    items: [
      {
        title: 'Lấy máu tại nhà',
        icon: Droplet,
        items: [
          { title: 'Thống kê đăng ký', url: PATHS.TAKEBLOOD_ORDER, permission: 'takeblood_menu.order', items: [] },
          { title: 'Thống kê plan', url: PATHS.TAKEBLOOD_BATCH, permission: 'takeblood_menu.plan', items: [] },
          { title: 'Thống kê đánh giá', url: PATHS.TAKEBLOOD_FEEDBACK, permission: 'takeblood_menu.feedback', items: [] },
          { title: 'Thông tin dịch vụ', url: PATHS.TAKEBLOOD_SERVICE, permission: 'takeblood_menu.services', items: [] },
          { title: 'Cài đặt', url: PATHS.TAKEBLOOD_SETTING, permission: 'takeblood_menu.setting', items: [] },
          { title: 'Địa điểm tập kết (Homebase)', url: PATHS.HOMEBASE, permission: 'takeblood_menu.homebase', items: [] },
          { title: 'Nhóm nhân viên lấy máu (Team)', url: PATHS.TEAM, permission: 'takeblood_menu.team', items: [] },
          { title: 'Phương tiện (Vehicle Model)', url: PATHS.VEHICLE, permission: 'takeblood_menu.vehicle', items: [] },
        ],
      },
    ],
  },
  {
    label: 'Nhà thuốc',
    items: [
      {
        title: 'Nhà thuốc',
        url: PATHS.DRUGSTORE_LIST,
        icon: Tablets,
        permission: 'permission_managerment',
        items: [],
      },
    ],
  },
  {
    label: 'Cận lâm sàng',
    items: [
      {
        title: 'Cận lâm sàng',
        url: PATHS.PARACLINICAL,
        permission: 'paraclinical_managerment',
        icon: TestTube,
        items: [],
      },
    ],
  },
  {
    label: 'Bệnh viện',
    items: [
      {
        title: 'Quản lý bệnh viện',
        icon: Building2,
        permission: 'hospital_management',
        items: [
          { title: 'Danh sách bệnh viện', url: PATHS.HOSPITAL_LIST, permission: 'hospital_view' },
          { title: 'Khoa phòng', url: PATHS.HOSPITAL_DEPARTMENT, permission: 'department_view' },
          { title: 'Phòng bệnh', url: PATHS.HOSPITAL_ROOM, permission: 'room_view' },
        ],
      }
    ]
  },
  {
    label: 'Bảo hiểm',
    items: [
      {
        title: 'Quản lý bảo hiểm',
        icon: ShieldCheck,
        permission: 'insurance_management',
        items: [
          { title: 'Danh sách bảo hiểm', url: PATHS.INSURANCE_LIST, permission: 'insurance_view' },
          { title: 'Gói bảo hiểm', url: PATHS.INSURANCE_PACKAGE, permission: 'insurance_package_view' },
          { title: 'Yêu cầu bồi thường', url: PATHS.INSURANCE_CLAIM, permission: 'insurance_claim_view' },
        ],
      }
    ]
  },
  {
    label: 'Khác',
    items: [
      // {
      //   title: 'Hóa đơn',
      //   url: '#!/invoice',
      //   icon: Receipt,
      //   items: [],
      // },
      // {
      //   title: 'Thanh toán',
      //   url: '#!/payment',
      //   icon: CircleDollarSign,
      //   items: [],
      // },
      {
        title: 'Lịch sử điểm',
        url: PATHS.HIS_POINT,
        icon: History,
        permission: 'his-point',
        items: [],
      },
      {
        title: 'Tra cứu voucher',
        url: PATHS.SEARCH_VOUCHER,
        icon: Search,
        permission: 'search-voucher',
        items: [],
      },
      // {
      //   title: 'Thu hồi nội 4',
      //   url: '#!/debit_noi_4',
      //   icon: FileText,
      //   items: [],
      // },
      {
        title: 'OTP',
        url: PATHS.OTP,
        permission: '/verify',
        icon: FileText,
        items: [],
      },
      {
        title: 'Tự động đối soát',
        url: PATHS.AUTO_RECONCILIATION,
        icon: FileText,
        permission: 'permission_managerment',
        items: [],
      },
    ],
  },

];

// Export function để lấy navigation data đã được filter theo permissions
export function getNavigationData(permissions: string[]): NavSection[] {
  return RAW_NAV_DATA.filter(section => {
    return hasValidPermissions(section.items, permissions);
  });
}

// Export const cho trường hợp không cần check permission
export const NAV_DATA = RAW_NAV_DATA;