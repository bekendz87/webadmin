import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/utils/cn';

export interface TableColumn {
  key: string;
  title: string;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  className?: string;
  fixed?: 'left' | 'right';
  render?: (value: any, record: any, index: number) => React.ReactNode;
}

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  columns?: TableColumn[];
  data?: any[];
  loading?: boolean;
  emptyText?: string;
  rowKey?: string | ((record: any) => string);
  onRowClick?: (record: any, index: number) => void;
  scroll?: {
    x?: number | string;
    y?: number | string;
  };
}

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> { }
export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  data?: any[];
  loading?: boolean;
  emptyText?: string;
  columns?: any[];
  renderRow?: (item: any, index: number) => React.ReactNode;
}
export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> { }
export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> { }
export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> { }

// Hook for scroll detection
const useScrollDetection = (containerRef: React.RefObject<HTMLDivElement>) => {
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
    isScrolling: false
  });

  const checkScrollability = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    const canScrollLeft = scrollLeft > 0;
    const canScrollRight = scrollLeft < scrollWidth - clientWidth - 1;

    setScrollState(prev => ({
      ...prev,
      canScrollLeft,
      canScrollRight
    }));
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      setScrollState(prev => ({ ...prev, isScrolling: true }));
      checkScrollability();

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setScrollState(prev => ({ ...prev, isScrolling: false }));
      }, 150);
    };

    const handleResize = () => {
      checkScrollability();
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    // Initial check
    checkScrollability();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      clearTimeout(scrollTimeout);
    };
  }, [containerRef, checkScrollability]);

  return scrollState;
};

// Enhanced Table Wrapper component with debug mode
const TableWrapper = React.forwardRef < HTMLDivElement, {
  children: React.ReactNode;
className ?: string;
showScrollHint ?: boolean;
scrollHintText ?: string;
debug ?: boolean; // Add debug prop
}> (({ children, className, showScrollHint = true, scrollHintText = "Scroll horizontally to view more", debug = false }, ref) => {
  const containerRef = useRef < HTMLDivElement > (null);
  const [showHint, setShowHint] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const { canScrollLeft, canScrollRight, isScrolling } = useScrollDetection(containerRef);

  // Debug: Log scroll state
  useEffect(() => {
    if (debug) {
      console.log('Scroll state:', { canScrollLeft, canScrollRight, isScrolling });
    }
  }, [canScrollLeft, canScrollRight, isScrolling, debug]);

  // Show hint initially if table is scrollable and user hasn't interacted
  useEffect(() => {
    if (!showScrollHint || hasInteracted || !canScrollRight || isScrolling) {
      setShowHint(false);
      return;
    }

    // Show hint after delay
    const showTimer = setTimeout(() => {
      if (!hasInteracted && canScrollRight) {
        setShowHint(true);
      }
    }, 1500);

    // Hide hint after showing for 4 seconds
    const hideTimer = setTimeout(() => {
      setShowHint(false);
    }, 5500); // 1.5s delay + 4s show time

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [canScrollRight, showScrollHint, hasInteracted, isScrolling]);

  // Hide hint on user interaction
  const handleUserInteraction = useCallback(() => {
    setShowHint(false);
    setHasInteracted(true);
  }, []);

  // Reset interaction state when table content changes significantly
  useEffect(() => {
    const resetTimer = setTimeout(() => {
      if (!canScrollRight) {
        setHasInteracted(false);
      }
    }, 2000);

    return () => clearTimeout(resetTimer);
  }, [canScrollRight]);

  return (
    <div
      ref={ref}
      className={cn(
        "table-wrapper-with-scroll",
        debug && "debug-scroll-wrapper", // Add debug class
        className
      )}
      onMouseEnter={handleUserInteraction}
      onTouchStart={handleUserInteraction}
    >
      <div
        ref={containerRef}
        className="macos26-table-wrapper"
        onScroll={handleUserInteraction}
        onWheel={handleUserInteraction}
        style={{
          minWidth: '100%',
          // Force minimum content width for testing
          ...(debug ? { border: '2px solid blue' } : {})
        }}
      >
        {children}
      </div>

      {/* Left scroll indicator */}
      <div className={cn(
        "table-scroll-indicator-left",
        canScrollLeft && "visible",
        debug && "debug-scroll-indicator"
      )} />

      {/* Right scroll indicator */}
      <div className={cn(
        "table-scroll-indicator-right",
        canScrollRight && "visible",
        debug && "debug-scroll-indicator"
      )} />

      {/* Scroll hint - only show when conditions are met */}
      {showScrollHint && canScrollRight && !hasInteracted && (
        <div className={cn(
          "table-scroll-hint",
          showHint && "visible",
          showHint && "table-scroll-hint-animated"
        )}>
          <span className="scroll-hint-icon">
            ←→ {scrollHintText}
          </span>
        </div>
      )}

      {/* Debug info */}
      {debug && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 1000,
          pointerEvents: 'none'
        }}>
          L: {canScrollLeft ? '✓' : '✗'} | R: {canScrollRight ? '✓' : '✗'} | Scroll: {isScrolling ? '✓' : '✗'}
        </div>
      )}
    </div>
  );
});
TableWrapper.displayName = "TableWrapper";

// Main Table component with debug prop
const Table = React.forwardRef < HTMLTableElement, TableProps & {
  showScrollHint?: boolean;
  scrollHintText?: string;
  debug?: boolean; // Add debug prop
} > (({
  className,
  showScrollHint = true,
  scrollHintText = "Kéo ngang để xem thêm",
  debug = false, // Default debug to false
  ...props
}, ref) => (
  <TableWrapper
    showScrollHint={showScrollHint}
    scrollHintText={scrollHintText}
    debug={debug}
  >
    <table
      ref={ref}
      className={cn("macos26-table w-full caption-bottom text-sm", className)}
      style={{
        minWidth: debug ? '150%' : 'auto' // Force overflow in debug mode
      }}
      {...props}
    />
  </TableWrapper>
));
Table.displayName = "Table";

// TableHeader component
const TableHeader = React.forwardRef < HTMLTableSectionElement, TableHeaderProps> (
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("macos26-table-head [&_tr]:border-b", className)} {...props} />
  )
);
TableHeader.displayName = "TableHeader";

// TableBody component with enhanced functionality
const TableBody = React.forwardRef < HTMLTableSectionElement, TableBodyProps> (
  ({ className, data = [], loading = false, emptyText = "No data available", columns = [], renderRow, children, ...props }, ref) => {
    // If children are provided, render them directly (for custom table structure)
    if (children) {
      return (
        <tbody
          ref={ref}
          className={cn("[&_tr:last-child]:border-0", className)}
          {...props}
        >
          {children}
        </tbody>
      );
    }

    // Auto-render mode with data prop
    return (
      <tbody
        ref={ref}
        className={cn("[&_tr:last-child]:border-0", className)}
        {...props}
      >
        {loading ? (
          <TableRow>
            <TableCell colSpan={columns.length || 1} className="macos26-table-loading">
              <div className="flex items-center justify-center gap-2 py-8">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                <span>Loading...</span>
              </div>
            </TableCell>
          </TableRow>
        ) : !data || data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length || 1} className="macos26-table-empty">
              <div className="text-center py-8 text-gray-500">
                {emptyText}
              </div>
            </TableCell>
          </TableRow>
        ) : (
          data.map((item, index) => (
            renderRow ? renderRow(item, index) : (
              <TableRow key={index}>
                <TableCell colSpan={columns.length || 1}>
                  {JSON.stringify(item)}
                </TableCell>
              </TableRow>
            )
          ))
        )}
      </tbody>
    );
  }
);
TableBody.displayName = "TableBody";

// TableRow component
const TableRow = React.forwardRef < HTMLTableRowElement, TableRowProps> (
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "macos26-table-row border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

// TableHead component
const TableHead = React.forwardRef < HTMLTableCellElement, TableHeadProps> (
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "macos26-table-header-cell h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = "TableHead";

// TableCell component
const TableCell = React.forwardRef < HTMLTableCellElement, TableCellProps> (
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn("macos26-table-cell p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  )
);
TableCell.displayName = "TableCell";

// TableCaption component
const TableCaption = React.forwardRef <
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({className, ...props }, ref) => (
    <caption
      ref={ref}
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
    ));
    TableCaption.displayName = "TableCaption";

    export {
      Table,
      TableHeader,
      TableBody,
      TableRow,
      TableHead,
      TableCell,
      TableCaption,
      TableWrapper,
};

    export type {
      TableProps,
      TableHeaderProps,
      TableBodyProps,
      TableRowProps,
      TableHeadProps,
      TableCellProps,
};
