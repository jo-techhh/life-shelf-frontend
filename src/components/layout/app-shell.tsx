import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { TopBar } from './top-bar';
import { Sidebar } from './sidebar';
import { MobileNavigation } from './mobile-navigation';
import { CommandPalette } from './command-palette';
import { QuickAddModal } from './quick-add-modal';

export function AppShell() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const navigate = useNavigate();

  // Listen for Ctrl+K / Cmd+K global shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleQuickAddSelect = (type: 'MOVIE' | 'SERIES' | 'READING' | 'STUDY' | 'TRAVEL' | 'PLAN') => {
    switch (type) {
      case 'MOVIE':
        navigate('/watch/movies?add=true');
        break;
      case 'SERIES':
        navigate('/watch/series?add=true');
        break;
      case 'READING':
        navigate('/read?add=true');
        break;
      case 'STUDY':
        navigate('/study?add=true');
        break;
      case 'TRAVEL':
        navigate('/travel?add=true');
        break;
      case 'PLAN':
        navigate('/plans?add=true');
        break;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Top Header */}
      <TopBar
        onOpenSearch={() => setSearchOpen(true)}
        onOpenQuickAdd={() => setQuickAddOpen(true)}
      />

      {/* Main Container */}
      <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
        {/* Desktop Left Sidebar */}
        <Sidebar />

        {/* Dynamic Routed Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation onOpenQuickAdd={() => setQuickAddOpen(true)} />

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onOpenQuickAdd={(type) => {
          if (type) {
            handleQuickAddSelect(type as 'MOVIE' | 'SERIES' | 'READING' | 'STUDY' | 'TRAVEL' | 'PLAN');
          } else {
            setQuickAddOpen(true);
          }
        }}
      />

      {/* Global Quick Add Modal */}
      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onSelectType={handleQuickAddSelect}
      />
    </div>
  );
}
