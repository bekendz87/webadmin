import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { PATHS } from '@/constants/paths';

export default function NotFoundPage() {
  return (
    <div className="macos-interface">
      <div className="macos-app min-h-screen flex items-center justify-center macos-login-bg">
        
        {/* macOS26 Liquid Glass Container */}
        <div className="relative max-w-lg w-full mx-6">
          <div className="macos-card-elevated macos-slide-up">
            
            {/* Icon & 404 Section */}
            <header className="text-center mb-8">
              
              {/* Enhanced Icon Container */}
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-accent/15 to-accent/5 rounded-2xl mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <Search className="h-12 w-12 text-accent/70 relative z-10" />
              </div>

              {/* 404 Title */}
              <h1 className="text-7xl font-bold macos-text-gradient mb-4 select-none tracking-tight">
                404
              </h1>

              {/* Error Heading */}
              <h2 className="macos-heading-2 macos-text-primary mb-4">
                Không tìm thấy trang
              </h2>

              {/* Description */}
              <p className="macos-body-secondary mb-8 max-w-sm mx-auto leading-relaxed">
                Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
                Vui lòng kiểm tra lại URL hoặc quay về trang chủ.
              </p>
              
            </header>

            {/* Action Buttons */}
            <section className="space-y-4">
              
              {/* Primary Action - Home */}
              <Link to={PATHS.HOME} className="w-full block">
                <Button
                  variant="primary"
                  className="macos26-btn macos26-btn-primary macos26-btn-lg macos26-btn-full group"
                >
                  <Home className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                  <span>Về Trang Chủ</span>
                </Button>
              </Link>

              {/* Secondary Action - Back */}
              <Button
                variant="secondary"
                onClick={() => window.history.back()}
                className="macos26-btn macos26-btn-secondary macos26-btn-lg macos26-btn-full group"
              >
                <ArrowLeft className="h-5 w-5 mr-3 group-hover:-translate-x-1 transition-transform duration-200" />
                <span>Quay lại</span>
              </Button>
              
            </section>

            {/* Footer Info */}
            <footer className="mt-8 pt-6 border-t border-glass-border">
              <div className="text-center">
                <p className="text-xs macos-text-secondary opacity-70 font-mono">
                  Mã lỗi: 404 | Trang không tồn tại
                </p>
              </div>
            </footer>
            
          </div>
        </div>
        
      </div>
    </div>
  );
}