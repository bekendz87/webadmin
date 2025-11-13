'use client';

import { useMobile } from '@/hooks/use-mobile';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type SidebarState = 'expanded' | 'collapsed';

type SidebarContextType = {
    state: SidebarState;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    isMobile: boolean;
    toggleSidebar: () => void;
};

const SidebarContext = createContext < SidebarContextType | null > (null);

export function useSidebarContext() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebarContext must be used within a SidebarProvider');
    }
    return context;
}

export function SidebarProvider({
    children,
    defaultOpen = true,
}: {
    children: ReactNode;
    defaultOpen?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const isMobile = useMobile();

    useEffect(() => {
        if (isMobile) {
            setIsOpen(false);
        } else {
            setIsOpen(true);
        }
    }, [isMobile]);

    function toggleSidebar() {
        setIsOpen((prev) => !prev);
    }

    return (
        <SidebarContext.Provider
            value={{
                state: isOpen ? 'expanded' : 'collapsed',
                isOpen,
                setIsOpen,
                isMobile,
                toggleSidebar,
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
}