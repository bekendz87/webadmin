import React from 'react';
import { Button } from '@/components/ui/Button';
import { DatePicker, Input, MultiSelect, Select } from '@/components/ui';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export interface FilterOption {
    key: string;
    text?: string;
    value?: string;
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

const Filter: React.FC<FilterProps> = ({
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
    // Default export options
    const defaultExportOptions: ExportOption[] = [
        {
            type: 'excel',
            label: 'Xuất Excel',
            icon: (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                </svg>
            )
        }
    ];

    const finalExportOptions = exportOptions.length > 0 ? exportOptions : defaultExportOptions;

    const renderField = (field: FilterField) => {
        const baseProps = {
            disabled: field.disabled,
            placeholder: field.placeholder,
            label: field.label,
            required: false
        };

        console.log('Rendering field:', field.name, field.type, field.value); // Debug log

        switch (field.type) {
            case 'date':
                return (
                    <DatePicker
                        value={field.value as string}
                        onChange={(newValue: string) => {
                            console.log('DatePicker onChange:', newValue); // Debug
                            field.onChange(newValue);
                        }}
                        {...baseProps}
                    />
                );
            case 'text':
                return (
                    <Input
                        value={field.value as string}
                        onChange={(e) => {
                            console.log('Input onChange:', e.target.value); // Debug
                            field.onChange(e.target.value);
                        }}
                        {...baseProps}
                    />
                );
            case 'select':
                return (
                    <Select
                        value={field.value as string}
                        onChange={(newValue: string) => {
                            console.log('Select onChange:', newValue); // Debug
                            field.onChange(newValue);
                        }}
                        options={field.options?.map(option => ({
                            key: option.key,
                            value: option.value || option.text || option.key,
                            label: option.text || option.value || option.key
                        })) || []}
                        {...baseProps}
                    />
                );
            case 'multiselect':
                return (
                    <MultiSelect
                        options={field.options?.map(option => ({
                            key: option.key,
                            value: option.value || option.text || option.key
                        })) || []}
                        value={field.value as string[]}
                        onChange={(newValue: string[]) => {
                            console.log('MultiSelect onChange:', newValue); // Debug
                            field.onChange(newValue);
                        }}
                        placeholder={field.placeholder || 'Chọn các tùy chọn...'}
                        disabled={field.disabled}
                        searchable={true}
                        label={field.label}
                    />
                );
            default:
                console.warn('Unknown field type:', field.type);
                return null;
        }
    };

    // Group fields into rows
    const groupFieldsIntoRows = (fields: FilterField[]) => {
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
    };

    const fieldRows = groupFieldsIntoRows(fields);

    console.log('Filter render:', { fields: fields.length, fieldRows: fieldRows.length }); // Debug

    return (
        <div className="mb-8 animate-slide-in-up">
            <Card variant="default" className="liquid-glass-card border-2 border-[var(--card-border)] shadow-xl">
                <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-[var(--accent)]/20">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-secondary)] flex items-center justify-center">
                                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-[var(--primary-text)] font-['SF_Pro_Display']">
                                {title}
                            </h3>
                        </div>
                        
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onReset}
                            disabled={loading}
                            className="hover:bg-[var(--macos-red)]/10 hover:text-[var(--macos-red)] transition-all duration-200"
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
                    <form onSubmit={onSubmit} className="space-y-6">
                        {fieldRows.map((row, rowIndex) => (
                            <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {row.map((field) => (
                                    <div
                                        key={field.name}
                                        className={field.colSpan && field.colSpan > 1 ? 
                                            `col-span-1 md:col-span-${Math.min(field.colSpan, 2)} lg:col-span-${Math.min(field.colSpan, 3)} xl:col-span-${field.colSpan}` : 
                                            'col-span-1'
                                        }
                                    >
                                        {renderField(field)}
                                    </div>
                                ))}
                            </div>
                        ))}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center justify-end gap-4 pt-8 mt-8 border-t-2 border-[var(--card-border)]/30">
                            <div className="flex gap-3">
                                {showExport && onExport && finalExportOptions.map((exportOption) => (
                                    <Button
                                        key={exportOption.type}
                                        type="button"
                                        variant="secondary"
                                        size="md"
                                        onClick={() => onExport(exportOption.type)}
                                        disabled={loading}
                                        leftIcon={exportOption.icon}
                                        className="hover:scale-105 transition-transform duration-200 shadow-lg"
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
                                    className="min-w-[140px] hover:scale-105 transition-transform duration-200 shadow-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] hover:shadow-xl"
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
        </div>
    );
};

export default Filter;
