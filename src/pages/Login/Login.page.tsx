import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';
import { request } from '@/utils/request';
import routerPath from '@/routerPath';
import { LoginResponse, UserSession } from '@/types/auth';
import { Input, Button } from '@/components/ui';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showAlert } = useAlert();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response: LoginResponse = await request({
        method: 'POST',
        url: routerPath.auth.login,
        body: { username, password },
        params: { webAdmin: 'true' }
      });

      if (response.success && response.user && response.token) {
        // Create session data
        const sessionData: UserSession = {
          user: response.user,
          token: response.token,
          permissions: response.permissions || [],
          hospitalList: response.hospitalList,
          isRoot: response.user.root,
          doctor: response.user.doctor,
          conclusion_permission: response.user.conclusion_permission,
          loginTime: response.loginTime || new Date().toISOString(),
          expiresAt: new Date(Date.now() + (response.expiresIn || 24 * 60 * 60 * 1000)).toISOString()
        };

        // Login through context
        login(sessionData);

        // Send login notification to API
        try {
          await request({
            method: 'POST',
            url: '/api/notification/create',
            headers: {
              'X-User-ID': response.user._id || response.user.id,
              'X-Username': response.user.username
            },
            body: {
              userId: response.user._id || response.user.id,
              username: response.user.username,
              title: 'Đăng nhập thành công',
              message: `Bạn đã đăng nhập vào hệ thống DROH lúc ${new Date().toLocaleString('vi-VN')}`,
              type: 'success'
            }
          });
        } catch (notificationError) {
          console.error('Failed to send login notification:', notificationError);
          // Don't block login flow if notification fails
        }

        // Show success notification
        showAlert('success', 'Đăng nhập thành công', `Chào mừng ${response.user.username || username} quay trở lại!`);

        // Redirect to dashboard
        navigate('/main');
      } else {
        showAlert('error', 'Đăng nhập thất bại', response.message || 'Tên đăng nhập hoặc mật khẩu không đúng.');
      }
    } catch (error: any) {
      showAlert('error', 'Đăng nhập thất bại', error.message || 'Không thể kết nối đến máy chủ. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen macos-liquid-glass">
      {/* Login Container */}
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md animate-slide-in-up">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="liquid-glass-card mb-6 text-center">
              <img
                src="/assets/img/logo-full.png"
                alt="DROH Logo"
                className="h-16 mx-auto mb-4 gpu-accelerated"
              />
              <h1 className="text-2xl font-semibold mb-2 text-[var(--primary-text)]">
                Chào mừng bạn đến với DROH
              </h1>
              <p className="text-[var(--primary-text-secondary)] text-sm">
                Trang quản trị hệ thống
              </p>
            </div>
          </div>

          {/* Login Form */}
          <div className="liquid-glass-card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Input
                  id="username"
                  type="text"
                  label="Tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Số điện thoại hoặc tên đăng nhập"
                  required
                  disabled={isLoading}
                  maxLength={30}
                  className="w-full"
                />

                <Input
                  id="password"
                  type="password"
                  label="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu của bạn"
                  required
                  disabled={isLoading}
                  maxLength={30}
                  className="w-full"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                disabled={!username.trim() || !password.trim()}
                fullWidth={true}
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  className="text-[var(--primary-text-secondary)] text-sm hover:text-[var(--accent)] transition-colors duration-200"
                  onClick={() => showAlert('warning', 'Tính năng đang phát triển', 'Vui lòng liên hệ quản trị viên để được hỗ trợ khôi phục mật khẩu.')}
                >
                  Quên mật khẩu?
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 liquid-glass-card py-4">
            <div className="text-[var(--primary-text-secondary)] text-xs space-y-1">
              <p>DoctorOH is one of product of OneHealth Co., Ltd</p>
              <p>&copy; 2025 - Phiên bản 1.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}