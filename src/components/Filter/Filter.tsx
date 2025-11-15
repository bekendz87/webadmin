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
    colSpan?: 1 | 2 | 3 | 4;
    disabled?: boolean;
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
    exportOptions = []
}) => {
    // Memoize default export options
    // const defaultExportOptions: ExportOption[] = useMemo(() => [
    //     {
    //         type: 'excel',
    //         label: 'Xuất Excel',
    //         icon: (
    //             <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
    //                 <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
    //                 <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
    //             </svg>
    //         )
    //     }
    // ], []);

    const finalExportOptions = useMemo(() => 
        exportOptions.length > 0 ? exportOptions : [],
        [exportOptions, []]
    );

    // Memoize field rendering to avoid re-creation
    const renderField = useCallback((field: FilterField) => {
        const baseProps = {
            disabled: field.disabled,
            placeholder: field.placeholder,
            label: field.label,
            required: false
        };

        switch (field.type) {
            case 'date':
                return (
                    <DatePicker
                        value={field.value as string}
                        onChange={field.onChange}
                        {...baseProps}
                    />
                );
            case 'text':
                return (
                    <Input
                        value={field.value as string}
                        onChange={(e) => field.onChange(e.target.value)}
                        {...baseProps}
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
                    />
                );
            default:
                return null;
        }
    }, []);

    // Memoize field grouping
    const fieldRows = useMemo(() => {
        const rows: FilterField[][] = [];
        let currentRow: FilterField[] = [];
        let currentRowSpan = 0;

        fields.forEach(field => {
            const fieldSpan = field.colSpan || 1;

            if (currentRowSpan + fieldSpan > 4) {
                if (currentRow.length > 0) {
                    rows.push(currentRow);
                }
                currentRow = [field];
                currentRowSpan = fieldSpan;
            } else {
                currentRow.push(field);
                currentRowSpan += fieldSpan;
            }
        });

        if (currentRow.length > 0) {
            rows.push(currentRow);
        }

        return rows;
    }, [fields]);

    // Memoize handlers
    const handleExport = useCallback((type: 'excel' | 'pdf') => {
        onExport?.(type);
    }, [onExport]);

    return (
        <div className="filter-container">
            <Card variant="default" className="filter-card">
                <CardContent className="filter-content">
                    {/* Header */}
                    <div className="filter-header">
                        <div className="filter-header-content">
                            <div className="filter-icon">
                                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                </svg>
                            </div>
                            <h3 className="filter-title">
                                {title}
                            </h3>
                        </div>
                        
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onReset}
                            disabled={loading}
                            className="filter-reset-btn"
                            leftIcon={
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            }
                        >
                            Đặt lại
                        </Button>
                    </div>

                    {/* Form Content */}
                    <form onSubmit={onSubmit} className="filter-form">
                        <div className="filter-fields">
                            {fieldRows.map((row, rowIndex) => (
                                <div key={rowIndex} className="filter-row">
                                    {row.map((field) => (
                                        <div
                                            key={field.name}
                                            className={`filter-field ${field.colSpan && field.colSpan > 1 ? 
                                                `filter-field-span-${field.colSpan}` : 
                                                'filter-field-span-1'
                                            }`}
                                        >
                                            {renderField(field)}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="filter-actions">
                            <div className="filter-buttons">
                                {showExport && onExport && finalExportOptions.map((exportOption) => (
                                    <Button
                                        key={exportOption.type}
                                        type="button"
                                        variant="secondary"
                                        size="md"
                                        onClick={() => handleExport(exportOption.type)}
                                        disabled={loading}
                                        leftIcon={exportOption.icon}
                                        className="filter-export-btn"
                                    >
                                        {exportOption.label}
                                    </Button>
                                ))}
                                
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="md"
                                    disabled={loading}
                                    loading={loading}
                                    className="filter-submit-btn"
                                    leftIcon={
                                        !loading ? (
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        ) : undefined
                                    }
                                >
                                    {loading ? 'Đang xử lý...' : submitLabel}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <style jsx>{`
                .filter-container {
                    margin-bottom: 2rem;
                    will-change: transform;
                    backface-visibility: hidden;
                    transform: translateZ(0);
                }

                .filter-card {
                    border: 2px solid var(--card-border);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    backdrop-filter: blur(16px);
                    background: rgba(255, 255, 255, 0.95);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .filter-content {
                    padding: 1.5rem;
                }

                .filter-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid var(--accent);
                    border-bottom-opacity: 0.2;
                }

                .filter-header-content {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .filter-icon {
                    width: 2rem;
                    height: 2rem;
                    border-radius: 0.5rem;
                    background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .filter-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--primary-text);
                    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
                }

                .filter-reset-btn {
                    transition: all 0.2s ease;
                }

                .filter-reset-btn:hover {
                    background-color: rgba(239, 68, 68, 0.1);
                    color: var(--macos-red);
                }

                .filter-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .filter-fields {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .filter-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                }

                @media (min-width: 768px) {
                    .filter-row {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (min-width: 1024px) {
                    .filter-row {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                @media (min-width: 1280px) {
                    .filter-row {
                        grid-template-columns: repeat(4, 1fr);
                    }
                }

                .filter-field {
                    min-width: 0;
                }

                .filter-field-span-2 {
                    grid-column: span 2;
                }

                .filter-field-span-3 {
                    grid-column: span 3;
                }

                .filter-field-span-4 {
                    grid-column: span 4;
                }

                .filter-actions {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    padding-top: 2rem;
                    margin-top: 2rem;
                    border-top: 2px solid var(--card-border);
                    border-top-opacity: 0.3;
                }

                .filter-buttons {
                    display: flex;
                    gap: 0.75rem;
                    flex-wrap: wrap;
                }

                .filter-export-btn {
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .filter-export-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.15);
                }

                .filter-submit-btn {
                    min-width: 140px;
                    background: linear-gradient(to right, var(--accent), var(--accent-secondary));
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .filter-submit-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
                }

                @media (prefers-reduced-motion: reduce) {
                    * {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }
            `}</style>
        </div>
    );
});

Filter.displayName = 'Filter';

export default Filter;
