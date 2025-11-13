import React from 'react';
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

// Main Table component
const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = "Table";

// TableHeader component
const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("macos26-table-head [&_tr]:border-b", className)} {...props} />
  )
);
TableHeader.displayName = "TableHeader";

// TableBody component with enhanced functionality
const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
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
const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
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
const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
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
const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
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
const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
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
};

export type {
  TableProps,
  TableHeaderProps,
  TableBodyProps,
  TableRowProps,
  TableHeadProps,
  TableCellProps,
};
