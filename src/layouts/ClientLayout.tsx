import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import Sidebar from '@/components/sidebar';
import TopNav from '@/components/top-nav';
import { useSettingsStore } from '@/store/settingsStore';
import { useThemeStore, type ThemeStoreState } from '@/store/themeStore';
import { useShallow } from '@/store/createBoundStore';
import { useTradingEventBridge } from '@/hooks/useTradingEventBridge';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Mount trading event bridge once at app root
  useTradingEventBridge();

  const themeSelector = useCallback(
    (state: ThemeStoreState) => ({
      activeThemeId: state.activeThemeId,
      setActiveTheme: state.setActiveTheme,
    }),
    []
  );

  const { activeThemeId, setActiveTheme } = useThemeStore(themeSelector, useShallow);
  const settingsTheme = useSettingsStore(state => state.theme);

  useEffect(() => {
    setActiveTheme(settingsTheme);
  }, [settingsTheme, setActiveTheme]);

  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('data-theme', activeThemeId);
    htmlElement.classList.add('dark');
  }, [activeThemeId]);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav onToggleSidebar={() => setSidebarOpen(prev => !prev)} sidebarOpen={sidebarOpen} />
        <main className="flex-1 overflow-auto fade-in">{children}</main>
      </div>
    </div>
  );
}
