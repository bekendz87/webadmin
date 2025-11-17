import React, { memo, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { DatePicker, Input, MultiSelect, Select } from '@/components/ui';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export interface FilterOption {
    key: string;
    value: string;
    text?: string;
    label?: string;
}

export interface FilterField {
    type: 'date' | 'text' | 'select' | 'multiselect';
    name: string;
    label: string;
    placeholder?: string;
    options?: FilterOption[];
    value: string | string[];
    onChange: (value: any) => void;
    colSpan?: 1 | 2 | 3 | 4 | 'full';
    disabled?: boolean;
    priority?: 'high' | 'medium' | 'low'; // For mobile ordering
}

export interface ExportOption {
    type: 'excel' | 'pdf';
    label: string;
    icon?: React.ReactNode;
}

export interface FilterProps {
    fields: FilterField[];
    onSubmit: (e: React.FormEvent) => void;
    onReset: () => void;
    loading?: boolean;
    title?: string;
    submitLabel?: string;
    showExport?: boolean;
    onExport?: (type: 'excel' | 'pdf') => void;
    exportOptions?: ExportOption[];
    responsive?: boolean;
    mobileCollapsible?: boolean;
}

const Filter: React.FC<FilterProps> = memo(({
    fields,
    onSubmit,
    onReset,
    loading = false,
    title = "Bộ lọc",
    submitLabel = "Báo cáo",
    showExport = false,
    onExport,
    exportOptions = [],
    responsive = true,
    mobileCollapsible = true
}) => {
    // Responsive field sorting for mobile
    const sortedFields = useMemo(() => {
        if (!responsive) return fields;

        return [...fields].sort((a, b) => {
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            const aPriority = priorityOrder[a.priority || 'medium'];
            const bPriority = priorityOrder[b.priority || 'medium'];
            return aPriority - bPriority;
        });
    }, [fields, responsive]);

    const finalExportOptions = useMemo(() =>
        exportOptions.length > 0 ? exportOptions : [],
        [exportOptions]
    );

    // Enhanced responsive field rendering
    const renderField = useCallback((field: FilterField) => {
        const baseProps = {
            disabled: field.disabled,
            placeholder: field.placeholder,
            label: field.label,
            required: false
        };

        // Add responsive props for mobile optimization
        const responsiveProps = responsive ? {
            className: 'filter-field-input-responsive',
            size: 'md' as const
        } : {};

        switch (field.type) {
            case 'date':
                return (
                    <DatePicker
                        value={field.value as string}
                        onChange={field.onChange}
                        {...baseProps}
                        {...responsiveProps}
                    />
                );
            case 'text':
                return (
                    <Input
                        value={field.value as string}
                        onChange={(e) => field.onChange(e.target.value)}
                        {...baseProps}
                        {...responsiveProps}
                    />
                );
            case 'select':
                const selectOptions = useMemo(() =>
                    (field.options || []).map(option => ({
                        key: option.key || '',
                        value: option.value || option.text || option.label || option.key || '',
                        label: option.value || option.text || option.label || option.key || ''
                    })).filter(option => option.key && option.value),
                    [field.options]
                );

                return (
                    <Select
                        value={field.value as string}
                        onChange={field.onChange}
                        options={selectOptions}
                        {...baseProps}
                        {...responsiveProps}
                    />
                );
            case 'multiselect':
                const multiSelectOptions = useMemo(() =>
                    (field.options || []).map(option => ({
                        key: option.key || '',
                        value: option.value || option.text || option.label || option.key || ''
                    })).filter(option => option.key && option.value),
                    [field.options]
                );

                return (
                    <MultiSelect
                        options={multiSelectOptions}
                        value={field.value as string[]}
                        onChange={field.onChange}
                        placeholder={field.placeholder || 'Chọn các tùy chọn...'}
                        disabled={field.disabled}
                        searchable={true}
                        label={field.label}
                        {...responsiveProps}
                    />
                );
            default:
                return null;
        }
    }, [responsive]);

    // Responsive field grouping
    const getFieldSpanClass = useCallback((field: FilterField) => {
        if (!responsive) {
            return typeof field.colSpan === 'number' && field.colSpan > 1 ?
                `filter-field-span-${field.colSpan}` :
                'filter-field-span-1';
        }

        const span = field.colSpan || 1;
        if (span === 'full') return 'filter-field-responsive span-full';
        if (span > 2) return 'filter-field-responsive span-full'; // Force full width on mobile for large spans
        return `filter-field-responsive ${span > 1 ? 'span-2' : ''}`;
    }, [responsive]);

    // Memoize handlers
    const handleExport = useCallback((type: 'excel' | 'pdf') => {
        onExport?.(type);
    }, [onExport]);

    const containerClass = responsive ? 'filter-responsive-container' : 'filter-container';
    const cardClass = responsive ? 'filter-card-responsive' : 'filter-card';
    const contentClass = responsive ? 'filter-content-responsive' : 'filter-content';
    const headerClass = responsive ? 'filter-header-responsive' : 'filter-header';
    const gridClass = responsive ? 'filter-responsive-grid' : 'filter-row';
    const actionsClass = responsive ? 'filter-actions-responsive' : 'filter-actions';
    const buttonsClass = responsive ? 'filter-buttons-responsive' : 'filter-buttons';

    return (
        <div className={containerClass}>
            <Card variant="default" className={cardClass}>
                <CardContent className={contentClass}>
                    {/* Responsive Header */}
                    <div className={headerClass}>
                        <div className="filter-header-content">
                            <div className={responsive ? "filter-icon-responsive filter-icon" : "filter-icon"}>
                                <svg className="h-full w-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                </svg>
                            </div>
                            <h3 className={responsive ? "filter-title-responsive" : "filter-title"}>
                                {title}
                            </h3>
                        </div>

                        <Button
                            type="button"
                            variant="ghost"
                            size={responsive ? "md" : "sm"}
                            onClick={onReset}
                            disabled={loading}
                            className={responsive ? "filter-button-responsive filter-reset-btn" : "filter-reset-btn"}
                            leftIcon={
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            }
                        >
                            Đặt lại
                        </Button>
                    </div>

                    {/* Responsive Form Content */}
                    <form onSubmit={onSubmit} className="filter-form">
                        <div className={gridClass}>
                            {sortedFields.map((field) => (
                                <div
                                    key={field.name}
                                    className={getFieldSpanClass(field)}
                                >
                                    {renderField(field)}
                                </div>
                            ))}
                        </div>

                        {/* Responsive Action Buttons */}
                        <div className={actionsClass}>
                            <div className={buttonsClass}>
                                {showExport && onExport && finalExportOptions.map((exportOption) => (
                                    <Button
                                        key={exportOption.type}
                                        type="button"
                                        variant="secondary"
                                        size="md"
                                        onClick={() => handleExport(exportOption.type)}
                                        disabled={loading}
                                        leftIcon={exportOption.icon}
                                        className={responsive ? "filter-button-responsive filter-export-btn" : "filter-export-btn"}
                                    >
                                        <span className={responsive ? "hidden sm:inline" : ""}>
                                            {exportOption.label}
                                        </span>
                                        <span className={responsive ? "sm:hidden" : "hidden"}>
                                            {exportOption.type === 'excel' ? 'Excel' : 'PDF'}
                                        </span>
                                    </Button>
                                ))}

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="md"
                                    disabled={loading}
                                    loading={loading}
                                    className={responsive ? "filter-button-responsive filter-submit-btn" : "filter-submit-btn"}
                                    leftIcon={
                                        !loading ? (
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        ) : undefined
                                    }
                                >
                                    <span className={responsive ? "hidden sm:inline" : ""}>
                                        {loading ? 'Đang xử lý...' : submitLabel}
                                    </span>
                                    <span className={responsive ? "sm:hidden" : "hidden"}>
                                        {loading ? 'Xử lý...' : 'Báo cáo'}
                                    </span>
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
});

Filter.displayName = 'Filter';

export default Filter;
