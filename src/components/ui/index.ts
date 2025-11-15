export { Input } from './Input';
export type { InputProps } from './Input';

export { Button } from './Button';
export type { ButtonProps } from './Button';
import { Button } from './Button';
import { Badge } from './Badge';
import { Table } from './Table';

export {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    MacOSCard,
    MacOSCardContent
} from './Card';

export { Badge } from './Badge';
export type { BadgeProps } from './Badge';

export {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from './Table';
export type {
    TableProps,
    TableHeaderProps,
    TableBodyProps,
    TableRowProps,
    TableHeadProps,
    TableCellProps,
} from './Table';

export {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
} from './Tabs';
export type {
    TabsProps,
    TabsListProps,
    TabsTriggerProps,
    TabsContentProps
} from './Tabs';

export { default as Select } from './Select';
export type { SelectProps, SelectOption } from './Select';

export { default as DatePicker } from './DatePicker';
export type { DatePickerProps } from '@/types/global';

export { default as MultiSelect } from './MultiSelect';
export { MultiSelect as MultiSelectComponent } from './MultiSelect';
export type { MultiSelectOption, MultiSelectProps } from './MultiSelect';

export { Progress } from './Progress';
export type { ProgressProps } from './Progress';

// Additional exports for macOS26 styling - these use existing components with enhanced styles
export const MacOSButton = Button;
export const MacOSBadge = Badge;
export const MacOSTable = Table;

// Type definitions for enhanced components
export interface MacOSTableColumn {
    key: string;
    title: string;
    width?: string;
    className?: string;
    cellClassName?: string;
    render?: (value: any, record: any, index?: number) => React.ReactNode;
}

export interface MacOSTableProps {
    columns: MacOSTableColumn[];
    data: any[];
    loading?: boolean;
    emptyText?: string;
    rowKey: string;
    className?: string;
}

