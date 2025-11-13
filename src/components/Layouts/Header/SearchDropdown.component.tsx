'use client';

import { Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useNavigationSearch } from '@/hooks/useNavigationSearch';
import { NavSection } from '@/constants/navigation';
import { useEffect, useRef, useState } from 'react';

interface SearchDropdownProps {
  navData: NavSection[];
}

export function SearchDropdown({ navData }: SearchDropdownProps) {
  const { searchQuery, setSearchQuery, searchResults, hasResults } = useNavigationSearch(navData);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsOpen(value.length > 0);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (searchQuery.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
      if (!searchQuery.length) {
        setIsOpen(false);
      }
    }, 200);
  };

  const handleResultClick = () => {
    setSearchQuery('');
    setIsOpen(false);
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchQuery('');
      setIsOpen(false);
      setIsFocused(false);
    }
  };

  const shouldShowDropdown = isOpen && searchQuery.length > 0;

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <input
          type="search"
          placeholder="Tìm kiếm..."
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="macos26-search-input"
        />
        <Search className="macos26-search-icon" />
      </div>

      {shouldShowDropdown && (
        <div className="macos26-search-dropdown">
          {hasResults ? (
            <div>
              <div className="macos26-search-header">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Kết quả tìm kiếm ({searchResults.length})
                </p>
              </div>
              <div className="macos26-search-results">
                {searchResults.map((result, index) => (
                  <Link
                    key={`${result.url}-${index}`}
                    href={result.url || '#'}
                    onClick={handleResultClick}
                    className="macos26-search-result-item"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {result.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {result.section} › {result.breadcrumb.slice(0, -1).join(' › ')}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 ml-3 flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="macos26-search-empty">
              <Search className="h-8 w-8 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Không tìm thấy kết quả
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Thử tìm kiếm với từ khóa khác
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
