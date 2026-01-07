
import React, { useState, useEffect, useRef } from 'react';
import { ViewState, SyncConfig } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncConfig, setSyncConfig] = useState<SyncConfig>(() => {
    const saved = localStorage.getItem('smart_hub_sync_config');
    return saved ? JSON.parse(saved) : { scriptUrl: '' };
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only follow system if user hasn't explicitly set a preference in this session
      // or if they want to stick to system. For simplicity, we prioritize system if no manual toggle happened recently.
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('smart_hub_sync_config', JSON.stringify(syncConfig));
  }, [syncConfig]);

  const getAllLocalData = () => {
    return {
      transactions: JSON.parse(localStorage.getItem('productivity_2026_finance_simple') || '[]'),
      loans: JSON.parse(localStorage.getItem('productivity_2026_loans_simple') || '[]'),
      tasks: JSON.parse(localStorage.getItem('smarthub_tasks_v2_2026') || '[]'),
      notes: JSON.parse(localStorage.getItem('smarthub_notes_v2_2026') || '[]'),
      holidays: JSON.parse(localStorage.getItem('smarthub_holidays_v2_2026') || '[]'),
      assets: JSON.parse(localStorage.getItem('smarthub_assets_v2_2026') || '[]'),
      unitLinks: JSON.parse(localStorage.getItem('smarthub_unit_links_v2_2026') || '{}'),
      goals: JSON.parse(localStorage.getItem('productivity_2026_goals') || '[]'),
      budgets: JSON.parse(localStorage.getItem('productivity_2026_budgets') || '[]'),
    };
  };

  const applyDataToLocal = (data: any) => {
    if (data.transactions) localStorage.setItem('productivity_2026_finance_simple', JSON.stringify(data.transactions));
    if (data.loans) localStorage.setItem('productivity_2026_loans_simple', JSON.stringify(data.loans));
    if (data.tasks) localStorage.setItem('smarthub_tasks_v2_2026', JSON.stringify(data.tasks));
    if (data.notes) localStorage.setItem('smarthub_notes_v2_2026', JSON.stringify(data.notes));
    if (data.holidays) localStorage.setItem('smarthub_holidays_v2_2026', JSON.stringify(data.holidays));
    if (data.assets) localStorage.setItem('smarthub_assets_v2_2026', JSON.stringify(data.assets));
    if (data.unitLinks) localStorage.setItem('smarthub_unit_links_v2_2026', JSON.stringify(data.unitLinks));
    if (data.goals) localStorage.setItem('productivity_2026_goals', JSON.stringify(data.goals));
    if (data.budgets) localStorage.setItem('productivity_2026_budgets', JSON.stringify(data.budgets));
    window.location.reload(); 
  };

  const handlePush = async () => {
    if (!syncConfig.scriptUrl) {
      alert('Silakan masukkan URL Apps Script terlebih dahulu.');
      return;
    }

    setIsSyncing(true);
    try {
      const data = getAllLocalData();
      await fetch(syncConfig.scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      setSyncConfig(prev => ({ ...prev, lastSync: new Date().toLocaleString() }));
      alert('Push Berhasil!');
    } catch (error) {
      console.error('Sync error:', error);
      alert('Gagal Push.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePull = async () => {
    if (!syncConfig.scriptUrl) {
      alert('Silakan masukkan URL Apps Script terlebih dahulu.');
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch(syncConfig.scriptUrl);
      const data = await response.json();
      
      if (confirm('Data lokal akan ditimpa. Lanjutkan?')) {
        applyDataToLocal(data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Gagal mengambil data.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportJSON = () => {
    const data = getAllLocalData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Productivity_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (confirm('Impor file JSON akan menimpa data saat ini. Lanjutkan?')) {
          applyDataToLocal(data);
        }
      } catch (err) {
        alert('Format file JSON tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-dark-bg text-black dark:text-white flex flex-col selection:bg-black dark:selection:bg-white selection:text-white dark:selection:text-black transition-colors duration-500">
      <header className="bg-white/95 dark:bg-dark-card/95 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 px-6 md:px-10 py-6 flex justify-between items-center sticky top-0 z-50">
        <div 
          className="font-poppins aesthetic-tracking text-xl md:text-2xl font-black cursor-pointer group flex items-center gap-1.5"
          onClick={() => onNavigate('home')}
        >
          <span className="dark:text-white">PRODUCTIVITY</span>
          <span className="font-light italic text-gray-300 group-hover:text-black dark:group-hover:text-white transition-all duration-500 pr-2">2026</span>
        </div>
        
        <nav className="flex items-center gap-4 md:gap-10">
          <div className="hidden md:flex items-center gap-10">
            <button 
              onClick={() => onNavigate('financial')}
              className={`tracking-[0.3em] text-[9px] font-bold uppercase transition-all ${currentView === 'financial' ? 'text-black dark:text-white' : 'text-gray-300 hover:text-black dark:hover:text-gray-100'}`}
            >
              Transactions & Loan
            </button>
            <button 
              onClick={() => onNavigate('task-manager')}
              className={`tracking-[0.3em] text-[9px] font-bold uppercase transition-all ${currentView === 'task-manager' ? 'text-black dark:text-white' : 'text-gray-300 hover:text-black dark:hover:text-gray-100'}`}
            >
              Task Manager
            </button>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setShowSyncModal(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-all"
              title="Sync & Backup"
            >
              <svg className={`w-5 h-5 ${isSyncing ? 'animate-bounce' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v8" />
              </svg>
            </button>
            <button 
              onClick={() => setIsDark(!isDark)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-all"
              title="Toggle Dark Mode"
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m12.728 12.728L5.121 14.121M19.071 4.929l-14.142 14.142"/></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
              )}
            </button>
            <div className="w-px h-4 bg-gray-200 dark:bg-white/10 mx-1"></div>
            <button 
               onClick={() => onNavigate('home')}
               className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-black dark:hover:text-white transition-all hover:scale-110"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            </button>
          </div>
        </nav>
      </header>
      <main className="flex-1">
        {children}
      </main>

      <AnimatePresence>
        {showSyncModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-card w-full max-w-lg p-8 rounded-[40px] shadow-2xl space-y-8 text-left"
            >
              <div className="flex justify-between items-center border-b border-gray-50 dark:border-white/5 pb-5">
                <div>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Sync & Backup Center</h2>
                </div>
                <button onClick={() => setShowSyncModal(false)} className="text-gray-300 hover:text-rose-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-[8px] font-black uppercase tracking-[0.3em] text-black dark:text-white px-1">Cloud Synchronization</h3>
                  <div className="space-y-2">
                    <label className="text-[7px] font-black text-gray-300 dark:text-gray-600 uppercase px-1 tracking-widest">Google Apps Script URL</label>
                    <input 
                      type="text" 
                      value={syncConfig.scriptUrl} 
                      onChange={(e) => setSyncConfig({ ...syncConfig, scriptUrl: e.target.value })} 
                      placeholder="https://script.google.com/macros/s/.../exec" 
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-dark-bg text-black dark:text-white rounded-2xl text-[10px] font-bold outline-none border border-transparent focus:border-black dark:focus:border-white transition-all shadow-inner"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={handlePush}
                      disabled={isSyncing}
                      className={`py-5 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] transition-all active:scale-95 flex items-center justify-center gap-2 ${isSyncing ? 'bg-gray-100 text-gray-400' : 'bg-black text-white hover:bg-gray-900 shadow-lg'}`}
                    >
                      Push to Cloud
                    </button>
                    <button 
                      onClick={handlePull}
                      disabled={isSyncing}
                      className={`py-5 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] border border-gray-100 dark:border-white/10 transition-all active:scale-95 flex items-center justify-center gap-2 ${isSyncing ? 'bg-gray-100 text-gray-400' : 'bg-gray-50 dark:bg-white/5 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/10'}`}
                    >
                      Pull from Cloud
                    </button>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-white/5">
                  <h3 className="text-[8px] font-black uppercase tracking-[0.3em] text-black dark:text-white px-1">Local JSON Operations</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={handleExportJSON}
                      className="py-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] bg-blue-50 dark:bg-blue-500/10 text-blue-600 border border-blue-100 dark:border-blue-500/20 hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      Export JSON
                    </button>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="py-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-100 dark:border-emerald-500/20 hover:bg-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      Import JSON
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept=".json" 
                      onChange={handleImportJSON} 
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="py-16 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-px h-10 bg-gray-200 dark:bg-white/10"></div>
          <p className="text-gray-300 dark:text-gray-600 text-[8px] font-bold uppercase tracking-[0.5em]">
            MMXXVI &mdash; Aesthetic Systems
          </p>
        </div>
      </footer>
    </div>
  );
};
