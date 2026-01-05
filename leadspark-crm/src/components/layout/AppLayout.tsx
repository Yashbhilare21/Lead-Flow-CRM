import { ReactNode, createContext, useContext, useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { GlobalSearch } from './GlobalSearch';

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
});

export const useSidebarContext = () => useContext(SidebarContext);

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div 
          className="flex-1 flex flex-col overflow-auto transition-all duration-300"
          style={{ marginLeft: collapsed ? '4rem' : '16rem' }}
        >
          {/* Header with Global Search */}
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            <div className="flex-1 flex items-center justify-center">
              <GlobalSearch />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
