export default function Loader() {
  return (
    <div className="macos-liquid-glass min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* macOS26 Enhanced Background Gradients */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-var(--accent)/20 via-var(--accent-secondary)/15 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-var(--macos-blue)/15 via-var(--macos-cyan)/10 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-br from-var(--macos-purple)/15 to-transparent rounded-full blur-2xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* macOS26 Main Loader Card */}
      <div className="liquid-glass-card max-w-sm w-full mx-6 text-center relative overflow-hidden">
        {/* Enhanced glass shine effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
        
        {/* macOS26 Sophisticated Spinner */}
        <div className="relative mb-8">
          <div className="relative w-24 h-24 mx-auto">
            {/* Primary rotating ring with liquid glass effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-var(--accent) via-var(--accent-secondary) to-var(--macos-blue) p-0.5 animate-spin" style={{animationDuration: '2s'}}>
              <div className="w-full h-full rounded-full bg-[var(--card-bg)] backdrop-filter backdrop-blur-xl border border-white/10"></div>
            </div>
            
            {/* Secondary counter-rotating ring */}
            <div className="absolute inset-1 rounded-full bg-gradient-to-l from-var(--macos-cyan)/60 via-var(--macos-purple)/40 to-var(--macos-pink)/60 p-0.5 animate-spin" style={{animationDirection: 'reverse', animationDuration: '3s'}}>
              <div className="w-full h-full rounded-full bg-[var(--glass-bg)] backdrop-filter backdrop-blur-2xl"></div>
            </div>
            
            {/* Inner glowing orb */}
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-var(--accent)/40 via-var(--accent-secondary)/30 to-var(--macos-blue)/40 backdrop-filter backdrop-blur-3xl animate-pulse border border-white/20">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-white/30 via-white/10 to-transparent"></div>
            </div>
            
            {/* Central pulsing core */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-var(--accent) to-var(--accent-secondary) animate-ping shadow-lg shadow-var(--accent)/50"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white"></div>
          </div>

          {/* Floating orbital rings */}
          <div className="absolute inset-0 w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border border-transparent border-t-var(--accent)/60 border-r-var(--accent-secondary)/40 animate-spin" style={{animationDuration: '4s'}}></div>
            <div className="absolute inset-2 rounded-full border border-transparent border-b-var(--macos-purple)/50 border-l-var(--macos-cyan)/30 animate-spin" style={{animationDirection: 'reverse', animationDuration: '5s'}}></div>
          </div>

          {/* Liquid wave effect */}
          <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform animate-spin opacity-60" style={{animationDuration: '6s'}}></div>
        </div>
        
        {/* macOS26 Content with enhanced typography */}
        <div className="space-y-6 relative z-10">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-[var(--primary-text)] via-[var(--accent)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
              Đang tải...
            </h3>
            <p className="text-sm text-[var(--primary-text-secondary)] leading-relaxed font-medium">
              Vui lòng đợi trong khi chúng tôi chuẩn bị trang của bạn
            </p>
          </div>
          
          {/* macOS26 Progress indicator */}
          <div className="w-full bg-[var(--card-border)] rounded-full h-1.5 overflow-hidden backdrop-filter backdrop-blur-sm">
            <div className="h-full bg-gradient-to-r from-var(--accent) via-var(--accent-secondary) to-var(--macos-blue) rounded-full animate-pulse relative shadow-lg shadow-var(--accent)/30">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* macOS26 Floating particles */}
        <div className="absolute -top-6 -left-6 w-2 h-2 bg-var(--accent)/70 rounded-full animate-bounce shadow-lg shadow-var(--accent)/40" style={{animationDelay: '1s'}}></div>
        <div className="absolute -bottom-4 -right-8 w-1.5 h-1.5 bg-var(--accent-secondary)/70 rounded-full animate-bounce shadow-lg shadow-var(--accent-secondary)/40" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/3 -left-8 w-1 h-1 bg-var(--macos-purple)/70 rounded-full animate-bounce shadow-lg shadow-var(--macos-purple)/40" style={{animationDelay: '3s'}}></div>
        <div className="absolute bottom-1/3 -right-4 w-2.5 h-2.5 bg-var(--macos-cyan)/60 rounded-full animate-bounce shadow-lg shadow-var(--macos-cyan)/30" style={{animationDelay: '1.5s'}}></div>

        {/* Enhanced corner highlights */}
        <div className="absolute top-0 left-0 w-8 h-8 bg-gradient-to-br from-white/30 to-transparent rounded-tl-3xl"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 bg-gradient-to-tl from-var(--accent)/20 to-transparent rounded-br-3xl"></div>
      </div>

      {/* macOS26 Ambient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-var(--accent)/3 via-transparent to-var(--accent-secondary)/3 pointer-events-none"></div>
    </div>
  );
}