import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, ArrowRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    loading?: boolean;
    className?: string;
    showQuickJump?: boolean;
    itemsPerPage?: number;
    totalItems?: number;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    loading = false,
    className = "",
    showQuickJump = true,
    itemsPerPage,
    totalItems
}) => {
    const [jumpPage, setJumpPage] = useState('');

    if (totalPages <= 1) {
        return null;
    }

    const handleJumpToPage = () => {
        const page = parseInt(jumpPage);
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
            setJumpPage('');
        }
    };

    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++
        ) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    const startItem = (currentPage - 1) * (itemsPerPage || 0) + 1;
    const endItem = Math.min(currentPage * (itemsPerPage || 0), totalItems || 0);

    return (
        <div className={`pagination-container ${className}`}>
          
          {/* macOS26 Liquid Glass Pagination Card */}
          <div className="liquid-glass-card pagination-card relative overflow-hidden">
            
            {/* Statistics & Quick Jump Header */}
            <header className="pagination-info flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              
              {/* Item Statistics */}
              <div className="pagination-stats">
                {totalItems && itemsPerPage ? (
                  <span className="font-medium">
                    Hiển thị{' '}
                    <span className="macos-text-accent font-semibold">{startItem}-{endItem}</span>
                    {' '}của{' '}
                    <span className="macos-text-accent font-semibold">{totalItems}</span>
                    {' '}kết quả
                  </span>
                ) : (
                  <span className="font-medium">
                    Trang{' '}
                    <span className="macos-text-accent font-semibold">{currentPage}</span>
                    {' '}trên{' '}
                    <span className="macos-text-accent font-semibold">{totalPages}</span>
                  </span>
                )}
              </div>

              {/* Quick Jump - Desktop */}
              {showQuickJump && totalPages > 5 && (
                <div className="quick-jump-container hidden md:flex items-center gap-3">
                  <label className="text-sm macos-text-secondary font-medium">
                    Chuyển đến:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={jumpPage}
                      onChange={(e) => setJumpPage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleJumpToPage()}
                      placeholder="Trang"
                      min="1"
                      max={totalPages}
                      className="quick-jump-input w-20"
                      disabled={loading}
                    />
                    <Button
                      onClick={handleJumpToPage}
                      disabled={loading || !jumpPage}
                      className="quick-jump-btn"
                      aria-label="Chuyển đến trang"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
              
            </header>

            {/* Navigation Controls */}
            <nav className="pagination-controls flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              
              {/* Previous Navigation - Desktop */}
              <div className="hidden md:flex items-center gap-2">
                <Button
                  onClick={() => onPageChange(1)}
                  disabled={currentPage === 1 || loading}
                  className="pagination-btn-nav"
                  aria-label="Trang đầu"
                >
                  <ChevronsLeft className="w-4 h-4 mr-1" />
                  <span>Đầu</span>
                </Button>
                <Button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="pagination-btn-nav"
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  <span>Trước</span>
                </Button>
              </div>

              {/* Page Numbers - Desktop */}
              <div className="hidden md:flex items-center gap-1 page-numbers">
                {getVisiblePages().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === '...' ? (
                      <div className="pagination-dots px-3 py-2 flex items-center justify-center">
                        <MoreHorizontal className="w-4 h-4 macos-text-secondary" />
                      </div>
                    ) : (
                      <Button
                        onClick={() => onPageChange(page as number)}
                        disabled={loading}
                        className={`pagination-btn ${
                          currentPage === page
                            ? 'pagination-btn-active'
                            : 'pagination-btn-number'
                        }`}
                        aria-label={`Trang ${page}`}
                        aria-current={currentPage === page ? 'page' : undefined}
                      >
                        <span>{page}</span>
                      </Button>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Mobile Navigation */}
              <div className="flex md:hidden items-center gap-3 justify-center">
                <Button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="pagination-btn-mobile"
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                
                <div className="mobile-page-indicator px-4 py-2 rounded-lg">
                  <span className="current-page">{currentPage}</span>
                  <span className="page-separator">/</span>
                  <span className="total-pages">{totalPages}</span>
                </div>
                
                <Button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="pagination-btn-mobile"
                  aria-label="Trang sau"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Next Navigation - Desktop */}
              <div className="hidden md:flex items-center gap-2">
                <Button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="pagination-btn-nav"
                  aria-label="Trang sau"
                >
                  <span>Sau</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
                <Button
                  onClick={() => onPageChange(totalPages)}
                  disabled={currentPage === totalPages || loading}
                  className="pagination-btn-nav"
                  aria-label="Trang cuối"
                >
                  <span>Cuối</span>
                  <ChevronsRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
            </nav>

            {/* Loading Overlay */}
            {loading && (
              <div className="pagination-loading absolute inset-0 flex items-center justify-center bg-glass-bg backdrop-blur-sm z-10 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="loading-spinner w-6 h-6"></div>
                  <span className="text-sm macos-text-secondary font-medium">
                    Đang tải...
                  </span>
                </div>
              </div>
            )}
            
          </div>
          
        </div>
    );
};

export default Pagination;