import React, { ReactNode, useState } from 'react';
import { Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from './Button';
import { Sidebar } from './Sidebar';

export function Layout({ children }: { children: ReactNode }) {
  const { settings } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4 lg:hidden shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(true)} className="-ml-2">
              <Menu size={20} />
            </Button>
            <span className="font-serif font-bold text-gray-900 text-lg">{settings.brandName}</span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto bg-gray-50">
          <div className="max-w-6xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
