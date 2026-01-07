
import React from 'react';
import { ViewState } from '../types';
import { motion } from 'framer-motion';

interface HomeProps {
  onSelectView: (view: ViewState) => void;
}

const Home: React.FC<HomeProps> = ({ onSelectView }) => {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-6 page-enter">
      <div className="max-w-3xl w-full text-center mb-16 space-y-3">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
          className="flex flex-col items-center gap-1"
        >
          <span className="tracking-[0.4em] text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 stagger-1">
            Productivity Systems
          </span>
          <h1 className="font-poppins hero-title text-5xl md:text-7xl font-black aesthetic-tracking leading-tight stagger-2">
            PRODUCTIVITY <span className="font-light italic text-gray-300 dark:text-gray-700 pr-4">2026</span>
          </h1>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-gray-500 dark:text-gray-400 text-base font-medium max-w-md mx-auto leading-relaxed stagger-2"
        >
          A minimalist command center for seamless financial tracking and daily task management.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
        <motion.button 
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
          onClick={() => onSelectView('financial')}
          className="hover-card group relative bg-white dark:bg-dark-card p-10 rounded-[40px] minimal-shadow border border-gray-100 dark:border-white/5 flex flex-col items-center text-center stagger-1"
        >
          <div className="w-14 h-14 bg-black dark:bg-white rounded-2xl flex items-center justify-center mb-8 text-white dark:text-black shadow-lg transition-all duration-700 group-hover:rotate-[360deg]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="font-poppins text-2xl font-bold text-black dark:text-white mb-3 aesthetic-tracking">Finansial</h2>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-medium leading-relaxed max-w-[220px]">
            Log your daily expenses and track your net balance with absolute precision.
          </p>
          <div className="mt-10 overflow-hidden h-5">
            <div className="flex flex-col items-center transition-transform duration-500 group-hover:-translate-y-5">
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-300 dark:text-gray-600 h-5">Access System</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-black dark:text-white h-5">Enter Dashboard</span>
            </div>
          </div>
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1], delay: 0.1 }}
          onClick={() => onSelectView('task-manager')}
          className="hover-card group relative bg-white dark:bg-dark-card p-10 rounded-[40px] minimal-shadow border border-gray-100 dark:border-white/5 flex flex-col items-center text-center stagger-2"
        >
          <div className="w-14 h-14 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-8 text-black dark:text-white border border-gray-100 dark:border-white/5 transition-all duration-700 group-hover:scale-110">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h2 className="font-poppins text-2xl font-bold text-black dark:text-white mb-3 aesthetic-tracking">Task Manager</h2>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-medium leading-relaxed max-w-[220px]">
            Organize complex projects and drive daily progress with actionable tasks.
          </p>
          <div className="mt-10 overflow-hidden h-5">
            <div className="flex flex-col items-center transition-transform duration-500 group-hover:-translate-y-5">
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-300 dark:text-gray-600 h-5">Access System</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-black dark:text-white h-5">Open Board</span>
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default Home;
