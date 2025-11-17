'use client';

import '@/styles/liquid-glass.css';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Activity, TrendingUp, Users, Phone, FileText, DollarSign, Award, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { DashboardChart } from '@/components/charts/DashboardChart';
import { dashboardApi } from '@/apis/dashboard.api';
import { Button } from '@/components/ui';

interface DashboardStats {
  prescriptionCount: number;
  questionCount: number;
  userCount: number;
  callCount: number;
  totalCashIn: number;
  totalParaclinical: number;
  totalRevenueByDrug: number;
}

interface SystemStatus {
  status: 'good' | 'warning' | 'error' | 'checking';
  message: string;
  lastCheck: Date;
  isOnline: boolean;
}

interface TopDoctor {
  _id: string;
  first_name: string;
  last_name: string;
  avatar?: { url: string };
  count: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState < DashboardStats > ({
    prescriptionCount: 0,
    questionCount: 0,
    userCount: 0,
    callCount: 0,
    totalCashIn: 0,
    totalParaclinical: 0,
    totalRevenueByDrug: 0,
  });

  const [chartData, setChartData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    series: [{
      name: 'Nạp tài khoản',
      data: Array(12).fill(0),
    }],
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  });

  const [systemStatus, setSystemStatus] = useState < SystemStatus > ({
    status: 'checking',
    message: 'Đang kiểm tra...',
    lastCheck: new Date(),
    isOnline: navigator.onLine
  });

  const [topDoctors, setTopDoctors] = useState < TopDoctor[] > ([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState < string | null > (null);

  const statsCards = useMemo(() => [
    {
      title: 'Câu hỏi mới',
      value: stats.questionCount,
      icon: FileText,
      gradient: 'from-blue-500 via-blue-400 to-cyan-400',
      iconBg: 'bg-gradient-to-br from-blue-500/20 to-cyan-400/20',
      iconColor: 'text-blue-500 dark:text-blue-400',
      accentColor: 'var(--macos-blue)'
    },
    {
      title: 'Cuộc gọi khám',
      value: stats.callCount,
      icon: Phone,
      gradient: 'from-green-500 via-green-400 to-emerald-400',
      iconBg: 'bg-gradient-to-br from-green-500/20 to-emerald-400/20',
      iconColor: 'text-green-500 dark:text-green-400',
      accentColor: 'var(--macos-green)'
    },
    {
      title: 'Kê toa',
      value: stats.prescriptionCount,
      icon: Activity,
      gradient: 'from-purple-500 via-purple-400 to-pink-400',
      iconBg: 'bg-gradient-to-br from-purple-500/20 to-pink-400/20',
      iconColor: 'text-purple-500 dark:text-purple-400',
      accentColor: 'var(--macos-purple)'
    },
    {
      title: 'Đăng ký mới',
      value: stats.userCount,
      icon: Users,
      gradient: 'from-orange-500 via-orange-400 to-red-400',
      iconBg: 'bg-gradient-to-br from-orange-500/20 to-red-400/20',
      iconColor: 'text-orange-500 dark:text-orange-400',
      accentColor: 'var(--macos-orange)'
    }
  ], [stats]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSystemStatus(prev => ({ ...prev, status: 'checking', message: 'Đang tải dữ liệu...' }));

      const today = new Date();
      const options = {
        type: "day",
        day: today.getDate(),
        month: today.getMonth() + 1,
        year: today.getFullYear()
      };

      const [
        questionResult,
        prescriptionResult,
        userResult,
        callResult,
        cashInResult,
        paraclinicalResult,
        drugRevenueResult,
        topDoctorsResult,
        monthlyStatsResult
      ] = await Promise.allSettled([
        dashboardApi.statQuestion(options),
        dashboardApi.statPrescription(options),
        dashboardApi.statUser(options),
        dashboardApi.statCallHistory(options),
        dashboardApi.totalCashIn('napas', { cashIn: 1 }),
        dashboardApi.statParaclinicalRevenue(),
        dashboardApi.statPrescriptionRevenue(),
        dashboardApi.getTopDoctors(),
        dashboardApi.cashInStatMonths(options.year)
      ]);

      const newStats: DashboardStats = {
        questionCount: questionResult.status === 'fulfilled' ? questionResult.value.one_health_msg?.count || 0 : 0,
        prescriptionCount: prescriptionResult.status === 'fulfilled' ? prescriptionResult.value.one_health_msg?.count || 0 : 0,
        userCount: userResult.status === 'fulfilled' ? userResult.value.one_health_msg?.count || 0 : 0,
        callCount: callResult.status === 'fulfilled' ? callResult.value.one_health_msg?.count || 0 : 0,
        totalCashIn: cashInResult.status === 'fulfilled' ? cashInResult.value.one_health_msg?.[0]?.total_cash || 0 : 0,
        totalParaclinical: paraclinicalResult.status === 'fulfilled' ? paraclinicalResult.value.one_health_msg?.count?.[0]?.total_day || 0 : 0,
        totalRevenueByDrug: drugRevenueResult.status === 'fulfilled' ? drugRevenueResult.value.one_health_msg?.count?.[0]?.total_day || 0 : 0,
      };

      setStats(newStats);

      if (topDoctorsResult.status === 'fulfilled') {
        setTopDoctors(topDoctorsResult.value.one_health_msg?.slice(0, 5) || []);
      }

      if (monthlyStatsResult.status === 'fulfilled') {
        const months = monthlyStatsResult.value.one_health_msg || [];
        const statMonth = Array(12).fill(0);

        months.forEach((month: any) => {
          if (month._id >= 1 && month._id <= 12) {
            statMonth[month._id - 1] = month.total_in_month || 0;
          }
        });

        setChartData(prev => ({
          ...prev,
          series: [{
            name: 'Nạp tài khoản',
            data: statMonth,
          }]
        }));
      }

      setSystemStatus({
        status: 'good',
        message: 'Hệ thống hoạt động tốt',
        lastCheck: new Date(),
        isOnline: navigator.onLine
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Không thể tải dữ liệu dashboard');
      setSystemStatus({
        status: 'error',
        message: 'Lỗi kết nối',
        lastCheck: new Date(),
        isOnline: navigator.onLine
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="macos-liquid-glass min-h-screen flex items-center justify-center">
        <div className="liquid-glass-card max-w-md mx-auto text-center animate-slide-in-up">
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-4 rounded-2xl mb-6 inline-block">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold mb-3">Đang tải dữ liệu</h3>
          <p className="text-sm opacity-70">Vui lòng đợi trong giây lát...</p>
          <div className="mt-6 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-gentle-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="macos-liquid-glass min-h-screen flex items-center justify-center">
        <div className="liquid-glass-card max-w-md mx-auto text-center animate-slide-in-up">
          <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 p-4 rounded-2xl mb-6 inline-block">
            <AlertCircle className="h-16 w-16 text-red-500 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-semibold mb-3">Có lỗi xảy ra</h3>
          <p className="text-sm opacity-70 mb-8">{error}</p>
          <button onClick={fetchDashboardData} className="macos-button flex items-center justify-center gap-2 mx-auto">
            <RefreshCw className="h-4 w-4" />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="macos-liquid-glass min-h-screen">
      {/* Header */}
      <header className="liquid-glass-header animate-slide-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
              Dashboard DROH
            </h1>
            <p className="text-sm opacity-70 mt-1">
              Chào mừng bạn trở lại! Theo dõi các hoạt động hệ thống realtime.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/10 border border-white/20">
              <div className={`h-3 w-3 rounded-full animate-gentle-pulse ${systemStatus.status === 'good' ? 'bg-green-400 shadow-lg shadow-green-400/50' :
                systemStatus.status === 'warning' ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50' :
                  systemStatus.status === 'error' ? 'bg-red-500 shadow-lg shadow-red-500/50' :
                    'bg-gray-400'
                }`} />
              <div className="text-sm">
                <button onClick={fetchDashboardData}>
                  <div className="font-medium">{systemStatus.message}</div>
                  <div className="opacity-60 text-xs">
                    {systemStatus.lastCheck.toLocaleTimeString()}

                  </div>
                </button>
              </div>
            </div>
            {/* <Button
              onClick={fetchDashboardData}
              className="theme-toggle-btn"
              disabled={loading}
              type="button"
              variant="secondary"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </Button> */}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="p-6 space-y-8">
        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card, index) => (
            <div
              key={card.title}
              className="liquid-glass-card group animate-slide-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${card.iconBg} p-3 rounded-2xl border border-white/20 group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className={`h-7 w-7 ${card.iconColor}`} />
                </div>
              </div>
              <div>
                <div className="text-sm font-medium opacity-80 mb-1">{card.title}</div>
                <div className="text-3xl font-bold tracking-tight">{card.value.toLocaleString()}</div>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r opacity-30 rounded-b-2xl" style={{ background: `linear-gradient(90deg, ${card.accentColor}, transparent)` }}></div>
            </div>
          ))}
        </section>

        {/* Chart & Revenue */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            {/* Revenue Today */}
            <div className="liquid-glass-card animate-slide-in-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-3 rounded-2xl border border-white/20">
                  <DollarSign className="h-7 w-7 text-emerald-500 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Doanh thu hôm nay</h3>
                  <p className="text-sm opacity-70">Tổng quan các nguồn thu</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Thuốc', value: stats.totalRevenueByDrug, color: 'from-blue-500 to-cyan-400' },
                  { label: 'Dịch vụ', value: stats.totalParaclinical, color: 'from-purple-500 to-pink-400' },
                  { label: 'Nạp tài khoản', value: stats.totalCashIn, color: 'from-emerald-500 to-teal-400' }
                ].map((item, index) => (
                  <div key={item.label} className="relative p-4 rounded-2xl bg-white/10 border border-white/20 overflow-hidden group hover:bg-white/20 transition-all duration-300">
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                    <div className="relative">
                      <div className="text-sm font-medium opacity-80 mb-2">{item.label}</div>
                      <div className="text-2xl font-bold">{item.value.toLocaleString()}đ</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="liquid-glass-card animate-slide-in-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-3 rounded-2xl border border-white/20">
                  <TrendingUp className="h-7 w-7 text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Biểu đồ doanh thu năm</h3>
                  <p className="text-sm opacity-70">Theo dõi xu hướng tăng trưởng</p>
                </div>
              </div>
              <div className="h-96">
                <DashboardChart {...chartData} />
              </div>
            </div>
          </div>

          {/* Top Doctors */}
          <div className="liquid-glass-card animate-slide-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-3 rounded-2xl border border-white/20">
                <Award className="h-7 w-7 text-yellow-500 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Bác sĩ hàng đầu</h3>
                <p className="text-sm opacity-70">Top bác sĩ xuất sắc</p>
              </div>
            </div>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {topDoctors.length > 0 ? (
                topDoctors.map((doctor, index) => (
                  <div key={doctor._id} className="relative p-4 rounded-2xl bg-white/10 border border-white/20 flex items-center gap-4 hover:bg-white/20 transition-all duration-300 group">
                    <div className="relative">
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg">
                        {index + 1}
                      </div>
                      <img
                        src={doctor.avatar?.url || '/assets/img/userdefault.png'}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-white/30 group-hover:border-white/50 transition-colors"
                        alt={`${doctor.first_name} ${doctor.last_name}`}
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-lg truncate">BS. {doctor.first_name} {doctor.last_name}</p>
                      <div className="text-sm opacity-70 flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        {doctor.count} lượt khám
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 opacity-70">
                  <div className="bg-gradient-to-br from-gray-500/20 to-slate-500/20 p-4 rounded-2xl mb-4 inline-block">
                    <Users className="h-12 w-12" />
                  </div>
                  <p className="text-lg">Chưa có dữ liệu</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
