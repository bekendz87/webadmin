import React from 'react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center py-12 px-6',
      'empty-state-enter',
      className
    )}>
      {/* Icon */}
      {icon && (
        <div className="mb-6 text-[var(--primary-text-secondary)] opacity-60">
          {typeof icon === 'string' ? (
            <div className="text-6xl">{icon}</div>
          ) : (
            <div className="w-16 h-16 flex items-center justify-center">
              {icon}
            </div>
          )}
        </div>
      )}

      {/* Title */}
      <h3 className="macos-heading-3 mb-3 text-[var(--primary-text)]">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="macos-body-secondary max-w-md mx-auto mb-6">
          {description}
        </p>
      )}

      {/* Action Button */}
      {action && (
        <Button
          variant={action.variant || 'primary'}
          onClick={action.onClick}
          className="macos26-btn"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

// Pre-built empty state variants
const NoDataEmptyState: React.FC<{ title?: string; description?: string; className?: string }> = ({
  title = "Không có dữ liệu",
  description = "Hiện tại chưa có dữ liệu nào để hiển thị",
  className
}) => (
  <EmptyState
    icon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    }
    title={title}
    description={description}
    className={className}
  />
);

const NoSearchResultsEmptyState: React.FC<{ searchTerm?: string; className?: string }> = ({ 
  searchTerm, 
  className 
}) => (
  <EmptyState
    icon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    }
    title="Không tìm thấy kết quả"
    description={searchTerm ? `Không tìm thấy kết quả cho "${searchTerm}"` : "Hãy thử thay đổi từ khóa tìm kiếm"}
    className={className}
  />
);

const ErrorEmptyState: React.FC<{ 
  title?: string; 
  description?: string; 
  onRetry?: () => void;
  className?: string;
}> = ({
  title = "Có lỗi xảy ra",
  description = "Không thể tải dữ liệu. Vui lòng thử lại.",
  onRetry,
  className
}) => (
  <EmptyState
    icon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    }
    title={title}
    description={description}
    action={onRetry ? {
      label: "Thử lại",
      onClick: onRetry,
      variant: "primary"
    } : undefined}
    className={className}
  />
);

export { 
  EmptyState, 
  NoDataEmptyState, 
  NoSearchResultsEmptyState, 
  ErrorEmptyState 
};
export type { EmptyStateProps };
