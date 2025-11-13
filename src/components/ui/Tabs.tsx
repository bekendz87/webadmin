import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from './Card';
import { Button } from './Button';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

export interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ defaultValue, children, className }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('w-full', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
  return (
    <Card
      variant="outlined"
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-lg bg-macos-bg-tertiary p-1',
        className
      )}
    >
      {children}
    </Card>
  );
};

const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');
  
  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;

  return (
    <Button
      variant={isActive ? 'primary' : 'ghost'}
      size="sm"
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all',
        isActive
          ? 'bg-macos-bg-elevated text-macos-text-primary shadow-sm'
          : 'text-macos-text-secondary hover:text-macos-text-primary',
        className
      )}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </Button>
  );
};

const TabsContent: React.FC<TabsContentProps> = ({ value, children, className }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');
  
  const { activeTab } = context;
  
  if (activeTab !== value) return null;

  return (
    <Card className={cn('mt-2 macos-fade-in', className)}>
      {children}
    </Card>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
