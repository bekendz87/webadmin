import { Link } from 'react-router-dom';
import { PATHS } from '@/constants/paths';
import { useSidebarContext } from '@/contexts/SidebarContext';

export function Logo() {
  const { setIsOpen, isOpen, isMobile, toggleSidebar } = useSidebarContext();
  
  return (
    <>
      {!isMobile && (
        <Link to={PATHS.DASHBOARD} className="flex items-center gap-3 group relative">
          {/* macOS26 Logo Container */}
          <div className="relative w-10 h-10 flex items-center justify-center group-hover:scale-105 transition-all duration-300 ease-out">
            {/* Enhanced liquid glass background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-xl backdrop-filter backdrop-blur-xl border border-white/20 group-hover:border-white/30 transition-all duration-300">
              {/* Subtle inner glow */}
              <div className="absolute inset-0.5 bg-gradient-to-br from-var(--accent)/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            
            {/* Logo Image */}
            <div className="relative z-10 flex items-center justify-center">
              <img
                src="/assets/img/logo.png"
                alt="DROH"
                className="w-full h-full object-contain transition-all duration-300 group-hover:brightness-110 group-hover:drop-shadow-sm"
              />
            </div>
            
            {/* Shine effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-all duration-700 ease-out rounded-xl"></div>
          </div>

          {/* macOS26 Text Container */}
          <div className="hidden sm:block relative space-y-0">
            <h1 className="text-lg font-semibold tracking-tight text-[var(--primary-text)] mb-0 group-hover:text-[var(--accent)] transition-colors duration-300">
              DROH
            </h1>
            <p className="text-xs text-[var(--primary-text-secondary)] -mt-0.5 opacity-75 group-hover:opacity-100 transition-all duration-300 font-medium">
              Trang quản trị
            </p>
          </div>
          
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-var(--accent)/0 via-var(--accent)/5 to-var(--accent)/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl blur-xl -z-10"></div>
        </Link>
      )}
    </>
  );
}