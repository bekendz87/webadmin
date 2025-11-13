import { useState, useMemo } from 'react';
import { NavSection, NavItem, SubNavItem } from '@/constants/navigation';

interface SearchResult {
  title: string;
  url?: string;
  section: string;
  breadcrumb: string[];
}

export function useNavigationSearch(navData: NavSection[]) {
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    if (!navData || navData.length === 0) {
      return [];
    }

    const results: SearchResult[] = [];
    const query = searchQuery.toLowerCase();

    const searchInItems = (
      items: (NavItem | SubNavItem)[],
      sectionLabel: string,
      parentTitles: string[] = []
    ) => {
      if (!items || !Array.isArray(items)) {
        return;
      }

      items.forEach((item) => {
        if (!item || !item.title) {
          return;
        }

        const titleMatches = item.title.toLowerCase().includes(query);
        
        if (titleMatches && item.url) {
          const result = {
            title: item.title,
            url: item.url,
            section: sectionLabel,
            breadcrumb: [...parentTitles, item.title]
          };
          results.push(result);
        }

        if (item.items && Array.isArray(item.items) && item.items.length > 0) {
          searchInItems(
            item.items,
            sectionLabel,
            [...parentTitles, item.title]
          );
        }
      });
    };

    navData.forEach((section) => {
      if (section && section.items) {
        searchInItems(section.items, section.label);
      }
    });

    return results.slice(0, 10);
  }, [searchQuery, navData]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    hasResults: searchResults.length > 0
  };
}
