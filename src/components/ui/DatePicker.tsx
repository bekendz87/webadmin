import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { DatePickerProps } from '@/types/global';
import { Input } from './Input';

const DatePicker: React.FC<DatePickerProps> = ({
    value = '',
    onChange,
    label,
    placeholder = 'Chọn ngày',
    disabled = false,
    required = false,
    error,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [inputValue, setInputValue] = useState(value);
    const [showMonthSelector, setShowMonthSelector] = useState(false);
    const [showYearSelector, setShowYearSelector] = useState(false);
    const containerRef = useRef < HTMLDivElement > (null);

    // Initialize current date when value changes
    useEffect(() => {
        setInputValue(value);
        if (value) {
            const parts = value.split('-');
            if (parts.length === 3) {
                const year = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1;
                const day = parseInt(parts[2]);
                setCurrentDate(new Date(year, month, day));
            }
        }
    }, [value]);

    // Memoize format date function to prevent recreation
    const formatDate = useCallback((date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, []);

    // Handle calendar open/close with useCallback
    const toggleCalendar = useCallback(() => {
        if (disabled) return;
        setIsOpen(prev => !prev);
        setShowMonthSelector(false);
        setShowYearSelector(false);
    }, [disabled]);

    // Close calendar with useCallback
    const closeCalendar = useCallback(() => {
        setIsOpen(false);
        setShowMonthSelector(false);
        setShowYearSelector(false);
    }, []);

    // Close calendar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                closeCalendar();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, closeCalendar]);

    // Handle date selection with useCallback and prevent unnecessary operations
    const handleDateSelect = useCallback((day: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const formattedDate = formatDate(newDate);

        // Only update if the date actually changed
        if (formattedDate !== value) {
            setInputValue(formattedDate);
            onChange(formattedDate);
        }
        setCurrentDate(newDate);
        closeCalendar();
    }, [currentDate, formatDate, value, onChange, closeCalendar]);

    // Navigation functions with useCallback
    const navigateMonth = useCallback((direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(newDate.getMonth() - 1);
            } else {
                newDate.setMonth(newDate.getMonth() + 1);
            }
            return newDate;
        });
    }, []);

    // Handle month selection with useCallback
    const handleMonthSelect = useCallback((monthIndex: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(monthIndex);
            return newDate;
        });
        setShowMonthSelector(false);
    }, []);

    // Handle year selection with useCallback
    const handleYearSelect = useCallback((year: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setFullYear(year);
            return newDate;
        });
        setShowYearSelector(false);
    }, []);

    // Handle today selection with useCallback
    const handleTodaySelect = useCallback(() => {
        const today = new Date();
        const formattedDate = formatDate(today);

        // Only update if the date actually changed
        if (formattedDate !== value) {
            setInputValue(formattedDate);
            onChange(formattedDate);
        }
        setCurrentDate(today);
        closeCalendar();
    }, [formatDate, value, onChange, closeCalendar]);

    // Handle clear selection with useCallback
    const handleClearSelection = useCallback(() => {
        if (value) { // Only clear if there's actually a value
            setInputValue('');
            onChange('');
        }
        closeCalendar();
    }, [value, onChange, closeCalendar]);

    // Toggle month selector with useCallback
    const toggleMonthSelector = useCallback(() => {
        setShowMonthSelector(prev => !prev);
        setShowYearSelector(false);
    }, []);

    // Toggle year selector with useCallback
    const toggleYearSelector = useCallback(() => {
        setShowYearSelector(prev => !prev);
        setShowMonthSelector(false);
    }, []);

    // Memoize calendar days calculation
    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        const today = new Date();
        const selectedDate = inputValue ? new Date(inputValue) : null;

        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            const isCurrentMonth = date.getMonth() === month;
            const isToday = date.toDateString() === today.toDateString();
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

            days.push({
                date,
                day: date.getDate(),
                isCurrentMonth,
                isToday,
                isSelected
            });
        }

        return days;
    }, [currentDate, inputValue]);

    // Memoize static arrays
    const monthNames = useMemo(() => [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ], []);

    const shortMonthNames = useMemo(() => [
        'T1', 'T2', 'T3', 'T4', 'T5', 'T6',
        'T7', 'T8', 'T9', 'T10', 'T11', 'T12'
    ], []);

    const weekDays = useMemo(() => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'], []);

    // Memoize year options
    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);
    }, []);

    return (
        <div className={cn('relative', className)} ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-[var(--primary-text)] mb-2 font-['SF_Pro_Display']">
                    {label}
                    {required && <span className="text-[var(--macos-red)] ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <div onClick={toggleCalendar} className="cursor-pointer">
                    <Input
                        value={inputValue}
                        onChange={() => { }}
                        placeholder={placeholder}
                        disabled={disabled}
                        error={error}
                        readOnly={true}
                        className={cn(
                            'cursor-pointer',
                            isOpen && 'border-[var(--accent)] ring-2 ring-[var(--accent)]/20'
                        )}
                        rightIcon={
                            <div onClick={(e) => {
                                e.stopPropagation();
                                toggleCalendar();
                            }}>
                                <svg
                                    className={cn(
                                        "h-4 w-4 transition-all duration-200 cursor-pointer",
                                        disabled
                                            ? "text-[var(--primary-text-secondary)] opacity-50"
                                            : "text-[var(--primary-text-secondary)] hover:text-[var(--accent)]",
                                        isOpen && "text-[var(--accent)] rotate-180"
                                    )}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                        }
                    />
                </div>

                {/* Compact Modal Calendar */}
                {isOpen && (
                    <>
                        {/* Minimal Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[9998] flex items-center justify-center p-4"
                            onClick={closeCalendar}
                        >
                            {/* Calendar Modal - Compact Size */}
                            <div
                                className="relative animate-slideDown"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    width: '320px',
                                    maxHeight: '85vh'
                                }}
                            >
                                <div style={{
                                    backgroundColor: 'var(--card-bg)',
                                    backdropFilter: 'var(--backdrop-blur)',
                                    WebkitBackdropFilter: 'var(--backdrop-blur)',
                                    border: '1px solid var(--card-border)',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.2)',
                                    fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
                                    position: 'relative'
                                }}>
                                    {/* Close Button */}
                                    <button
                                        onClick={closeCalendar}
                                        style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            border: 'none',
                                            backgroundColor: 'var(--card-bg)',
                                            color: 'var(--primary-text-secondary)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s',
                                            zIndex: 10
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = 'var(--macos-red)';
                                            e.currentTarget.style.color = 'white';
                                            e.currentTarget.style.transform = 'scale(1.1)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                                            e.currentTarget.style.color = 'var(--primary-text-secondary)';
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>

                                    {/* Calendar Header */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: '16px',
                                        paddingTop: '4px'
                                    }}>
                                        <button
                                            onClick={() => navigateMonth('prev')}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid var(--card-border)',
                                                borderRadius: '6px',
                                                padding: '6px',
                                                cursor: 'pointer',
                                                color: 'var(--primary-text)',
                                                fontSize: '14px',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            ←
                                        </button>

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={toggleMonthSelector}
                                                style={{
                                                    background: showMonthSelector ? 'var(--accent)' : 'transparent',
                                                    color: showMonthSelector ? 'white' : 'var(--primary-text)',
                                                    border: '1px solid var(--card-border)',
                                                    borderRadius: '6px',
                                                    padding: '4px 8px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {monthNames[currentDate.getMonth()]}
                                            </button>

                                            <button
                                                onClick={toggleYearSelector}
                                                style={{
                                                    background: showYearSelector ? 'var(--accent)' : 'transparent',
                                                    color: showYearSelector ? 'white' : 'var(--primary-text)',
                                                    border: '1px solid var(--card-border)',
                                                    borderRadius: '6px',
                                                    padding: '4px 8px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {currentDate.getFullYear()}
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => navigateMonth('next')}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid var(--card-border)',
                                                borderRadius: '6px',
                                                padding: '6px',
                                                cursor: 'pointer',
                                                color: 'var(--primary-text)',
                                                fontSize: '14px',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            →
                                        </button>
                                    </div>

                                    {/* Month Selector */}
                                    {showMonthSelector && (
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(4, 1fr)',
                                            gap: '4px',
                                            marginBottom: '16px',
                                            padding: '8px',
                                            backgroundColor: 'var(--glass-bg)',
                                            borderRadius: '8px',
                                            border: '1px solid var(--card-border)'
                                        }}>
                                            {shortMonthNames.map((monthName, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleMonthSelect(index)}
                                                    style={{
                                                        padding: '8px 4px',
                                                        fontSize: '11px',
                                                        fontWeight: '500',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        backgroundColor: currentDate.getMonth() === index ? 'var(--accent)' : 'var(--card-bg)',
                                                        color: currentDate.getMonth() === index ? 'white' : 'var(--primary-text)',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        if (currentDate.getMonth() !== index) {
                                                            e.currentTarget.style.backgroundColor = 'var(--glass-bg)';
                                                            e.currentTarget.style.color = 'var(--primary-text)';
                                                        }
                                                    }}
                                                    onMouseOut={(e) => {
                                                        if (currentDate.getMonth() !== index) {
                                                            e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                                                            e.currentTarget.style.color = 'var(--primary-text)';
                                                        }
                                                    }}
                                                >
                                                    {monthName}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Year Selector */}
                                    {showYearSelector && (
                                        <div style={{
                                            maxHeight: '120px',
                                            overflowY: 'auto',
                                            marginBottom: '16px',
                                            padding: '8px',
                                            backgroundColor: 'var(--glass-bg)',
                                            borderRadius: '8px',
                                            border: '1px solid var(--card-border)'
                                        }}>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(4, 1fr)',
                                                gap: '4px'
                                            }}>
                                                {yearOptions.map((year) => (
                                                    <button
                                                        key={year}
                                                        onClick={() => handleYearSelect(year)}
                                                        style={{
                                                            padding: '6px',
                                                            fontSize: '11px',
                                                            fontWeight: '500',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            backgroundColor: currentDate.getFullYear() === year ? 'var(--accent)' : 'var(--card-bg)',
                                                            color: currentDate.getFullYear() === year ? 'white' : 'var(--primary-text)',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            if (currentDate.getFullYear() !== year) {
                                                                e.currentTarget.style.backgroundColor = 'var(--glass-bg)';
                                                                e.currentTarget.style.color = 'var(--primary-text)';
                                                            }
                                                        }}
                                                        onMouseOut={(e) => {
                                                            if (currentDate.getFullYear() !== year) {
                                                                e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                                                                e.currentTarget.style.color = 'var(--primary-text)';
                                                            }
                                                        }}
                                                    >
                                                        {year}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Calendar Grid */}
                                    {!showMonthSelector && !showYearSelector && (
                                        <div>
                                            {/* Week Headers */}
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(7, 1fr)',
                                                gap: '2px',
                                                marginBottom: '8px'
                                            }}>
                                                {weekDays.map(day => (
                                                    <div key={day} style={{
                                                        padding: '8px 4px',
                                                        textAlign: 'center',
                                                        fontSize: '10px',
                                                        fontWeight: '600',
                                                        color: 'var(--primary-text-secondary)'
                                                    }}>
                                                        {day}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Calendar Days */}
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(7, 1fr)',
                                                gap: '2px'
                                            }}>
                                                {calendarDays.map((calendarDay, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => calendarDay.isCurrentMonth ? handleDateSelect(calendarDay.day) : undefined}
                                                        disabled={!calendarDay.isCurrentMonth}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            width: '32px',
                                                            height: '32px',
                                                            fontSize: '12px',
                                                            fontWeight: '500',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: calendarDay.isCurrentMonth ? 'pointer' : 'not-allowed',
                                                            color: calendarDay.isSelected
                                                                ? 'white'
                                                                : calendarDay.isCurrentMonth
                                                                    ? 'var(--primary-text)'
                                                                    : 'var(--primary-text-secondary)',
                                                            opacity: calendarDay.isCurrentMonth ? 1 : 0.4,
                                                            backgroundColor: calendarDay.isSelected
                                                                ? 'var(--accent)'
                                                                : calendarDay.isToday
                                                                    ? 'rgba(52, 199, 89, 0.2)'
                                                                    : 'transparent',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            if (calendarDay.isCurrentMonth && !calendarDay.isSelected) {
                                                                e.currentTarget.style.backgroundColor = 'var(--glass-bg)';
                                                                e.currentTarget.style.color = 'var(--primary-text)';
                                                            }
                                                        }}
                                                        onMouseOut={(e) => {
                                                            if (calendarDay.isCurrentMonth && !calendarDay.isSelected) {
                                                                if (calendarDay.isToday) {
                                                                    e.currentTarget.style.backgroundColor = 'rgba(52, 199, 89, 0.2)';
                                                                } else {
                                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                                }
                                                                e.currentTarget.style.color = 'var(--primary-text)';
                                                            }
                                                        }}
                                                    >
                                                        {calendarDay.day}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Compact Actions */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '8px',
                                        marginTop: '16px',
                                        paddingTop: '12px',
                                        borderTop: '1px solid var(--card-border)'
                                    }}>
                                        <button
                                            onClick={handleTodaySelect}
                                            style={{
                                                flex: 1,
                                                background: 'var(--accent)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '8px 12px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            Hôm nay
                                        </button>

                                        <button
                                            onClick={handleClearSelection}
                                            style={{
                                                flex: 1,
                                                background: 'transparent',
                                                color: 'var(--macos-red)',
                                                border: '1px solid var(--macos-red)',
                                                borderRadius: '8px',
                                                padding: '8px 12px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {error && (
                <p className="mt-2 text-sm text-[var(--macos-red)] flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
};

export default DatePicker;
