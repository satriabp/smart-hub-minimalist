
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Transaction, Loan, SavingsGoal, Budget } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'productivity_2026_finance_simple';
const LOAN_STORAGE_KEY = 'productivity_2026_loans_simple';
const GOALS_STORAGE_KEY = 'productivity_2026_goals';
const BUDGET_STORAGE_KEY = 'productivity_2026_budgets';

const CATEGORIES = [
  'Food', 'Transport', 'Work', 'Entertainment', 
  'Health', 'Shopping', 'Bills', 'Debt', 'Other'
];

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

type ActiveTab = 'transactions' | 'loans' | 'stats';

const FinancialView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('transactions');
  const [isDark, setIsDark] = useState(false);
  const [selectedLoanForNota, setSelectedLoanForNota] = useState<Loan | null>(null);

  useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Persistence
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem(LOAN_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem(GOALS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem(BUDGET_STORAGE_KEY);
    return saved ? JSON.parse(saved) : CATEGORIES.map(c => ({ category: c, limit: 0 }));
  });

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem(LOAN_STORAGE_KEY, JSON.stringify(loans)), [loans]);
  useEffect(() => localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals)), [goals]);
  useEffect(() => localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgets)), [budgets]);

  // Ledger Form
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('Other');
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTxId, setEditingTxId] = useState<string | null>(null);

  // Loan Form State
  const [platform, setPlatform] = useState('');
  const [borrowerName, setBorrowerName] = useState('');
  const [startMonth, setStartMonth] = useState('Januari');
  const [startYear, setStartYear] = useState('2026');
  const [tenor, setTenor] = useState('1');
  const [dueDay, setDueDay] = useState('1');
  const [loanTotal, setLoanTotal] = useState('');
  const [loanMonthly, setLoanMonthly] = useState('');
  const [loanPaid, setLoanPaid] = useState('0');
  const [editingLoanId, setEditingLoanId] = useState<string | null>(null);

  // Goal Form State
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');

  const navTabsRef = useRef<HTMLDivElement>(null);

  const getLoanRange = (l: Loan | { startMonth: string, startYear: number, tenorMonths: number }) => {
    const sIdx = MONTHS.indexOf(l.startMonth);
    const sYear = l.startYear;
    const tCount = l.tenorMonths;
    const startDisplay = `${l.startMonth} ${sYear}`;
    const totalMonths = sIdx + (tCount - 1);
    const eIdx = totalMonths % 12;
    const eYear = sYear + Math.floor(totalMonths / 12);
    const endDisplay = `${MONTHS[eIdx]} ${eYear}`;
    return { start: startDisplay, end: endDisplay };
  };

  const loanPeriodRange = useMemo(() => {
    return getLoanRange({ 
      startMonth, 
      startYear: parseInt(startYear) || 2026, 
      tenorMonths: parseInt(tenor) || 1 
    });
  }, [startMonth, startYear, tenor]);

  const handlePayLoan = (id: string) => {
    setLoans(prev => prev.map(l => {
      if (l.id === id && l.paidMonths < l.tenorMonths) {
        return { ...l, paidMonths: l.paidMonths + 1 };
      }
      return l;
    }));
  };

  const resetTxForm = () => {
    setDesc(''); setAmount(''); setDate(new Date().toISOString().split('T')[0]);
    setType('expense'); setCategory('Other'); setEditingTxId(null);
  };

  const resetLoanForm = () => {
    setPlatform(''); setBorrowerName(''); setLoanTotal(''); setLoanMonthly('');
    setTenor('1'); setDueDay('1'); setLoanPaid('0'); setEditingLoanId(null);
    setStartMonth('Januari'); setStartYear('2026');
  };

  const saveTransaction = () => {
    if (!desc || !amount) return;
    if (editingTxId) {
      setTransactions(transactions.map(t => t.id === editingTxId ? { ...t, description: desc, amount: parseFloat(amount), type, category, date } : t));
    } else {
      setTransactions([{ id: Math.random().toString(36).substr(2, 9), description: desc, amount: parseFloat(amount), type, category, date }, ...transactions]);
    }
    resetTxForm();
  };

  const saveLoan = () => {
    if (!platform || !loanTotal || !loanMonthly) return;
    const payload: Omit<Loan, 'id' | 'createdAt'> = { 
      platform, borrowerName, startMonth, startYear: parseInt(startYear) || 2026, 
      tenorMonths: parseInt(tenor) || 1, dueDay: parseInt(dueDay) || 1, 
      totalAmount: parseFloat(loanTotal), monthlyPayment: parseFloat(loanMonthly), paidMonths: parseInt(loanPaid) || 0 
    };
    if (editingLoanId) {
      setLoans(loans.map(l => l.id === editingLoanId ? { ...l, ...payload } : l));
    } else {
      setLoans([{ id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString(), ...payload }, ...loans]);
    }
    resetLoanForm();
  };

  const saveGoal = () => {
    if (!goalName || !goalTarget) return;
    const newGoal: SavingsGoal = { id: Math.random().toString(36).substr(2, 9), name: goalName, targetAmount: parseFloat(goalTarget), currentAmount: 0, color: '#000' };
    setGoals([...goals, newGoal]);
    setGoalName('');
    setGoalTarget('');
  };

  const updateBudget = (category: string, limit: number) => {
    setBudgets(budgets.map(b => b.category === category ? { ...b, limit } : b));
  };

  const startEditLoan = (l: Loan) => {
    setPlatform(l.platform); setBorrowerName(l.borrowerName); 
    setStartMonth(l.startMonth); setStartYear(l.startYear.toString()); 
    setTenor(l.tenorMonths.toString()); setDueDay(l.dueDay.toString()); 
    setLoanTotal(l.totalAmount.toString()); setLoanMonthly(l.monthlyPayment.toString()); 
    setLoanPaid(l.paidMonths.toString()); setEditingLoanId(l.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totals = useMemo(() => {
    const filtered = transactions.filter(t => t.date.startsWith(monthFilter));
    const income = filtered.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expenses = filtered.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [transactions, monthFilter]);

  const smartAlerts = useMemo(() => {
    const alerts: string[] = [];
    const today = new Date().getDate();
    loans.forEach(l => {
      if (l.paidMonths < l.tenorMonths) {
        const daysDiff = l.dueDay - today;
        if (daysDiff >= 0 && daysDiff <= 2) alerts.push(`Pinjaman ${l.platform} jatuh tempo dalam ${daysDiff} hari.`);
      }
    });
    return alerts;
  }, [loans]);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 page-enter relative pb-24">
      
      {/* ALERTS */}
      <AnimatePresence>
        {smartAlerts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
            {smartAlerts.map((alert, i) => (
              <div key={i} className="bg-rose-500/10 border border-rose-500/20 px-6 py-3 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">{alert}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAVIGATION TABS */}
      <div className="flex flex-col items-center gap-4">
        <div ref={navTabsRef} className="bg-gray-100/50 dark:bg-white/5 p-1.5 rounded-[22px] flex gap-1 relative overflow-hidden min-w-[320px]">
          <motion.div 
            className="absolute top-1.5 bottom-1.5 bg-black dark:bg-white rounded-[18px] shadow-sm z-0"
            animate={{ x: activeTab === 'transactions' ? 0 : activeTab === 'loans' ? 104 : 208, width: 104 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
          <button onClick={() => setActiveTab('transactions')} className={`relative z-10 w-[104px] py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${activeTab === 'transactions' ? 'text-white dark:text-black' : 'text-gray-400 dark:text-gray-500'}`}>Ledger</button>
          <button onClick={() => setActiveTab('loans')} className={`relative z-10 w-[104px] py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${activeTab === 'loans' ? 'text-white dark:text-black' : 'text-gray-400 dark:text-gray-500'}`}>Loans</button>
          <button onClick={() => setActiveTab('stats')} className={`relative z-10 w-[104px] py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${activeTab === 'stats' ? 'text-white dark:text-black' : 'text-gray-400 dark:text-gray-500'}`}>Stats</button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'transactions' && (
          <motion.div key="ledger" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="bg-white dark:bg-dark-card p-6 rounded-[30px] border border-gray-100 dark:border-white/5 minimal-shadow flex flex-col transition-colors duration-500"><span className="text-[8px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">Net Balance</span><span className="text-xl font-black">Rp {totals.balance.toLocaleString()}</span></div>
              <div className="bg-white dark:bg-dark-card p-6 rounded-[30px] border border-gray-100 dark:border-white/5 minimal-shadow flex flex-col transition-colors duration-500"><span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1">Inflow</span><span className="text-xl font-black text-emerald-600">+{totals.income.toLocaleString()}</span></div>
              <div className="bg-white dark:bg-dark-card p-6 rounded-[30px] border border-gray-100 dark:border-white/5 minimal-shadow flex flex-col transition-colors duration-500"><span className="text-[8px] font-black text-rose-400 uppercase tracking-widest mb-1">Outflow</span><span className="text-xl font-black text-rose-600">-{totals.expenses.toLocaleString()}</span></div>
            </div>
            
            <div className="bg-white dark:bg-dark-card p-8 md:p-12 rounded-[40px] border border-gray-100 dark:border-white/5 minimal-shadow space-y-10 text-left transition-colors duration-500">
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-gray-50 dark:border-white/5 pb-4">
                   <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 dark:text-gray-600">Log Entry</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" className="w-full px-6 py-4 bg-gray-50 dark:bg-dark-bg text-black dark:text-white rounded-2xl font-bold text-xs outline-none border border-transparent focus:border-black/10 transition-all" />
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" className="w-full px-6 py-4 bg-gray-50 dark:bg-dark-bg text-black dark:text-white rounded-2xl font-black text-xs outline-none border border-transparent focus:border-black/10 transition-all" />
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-6 py-4 bg-gray-50 dark:bg-dark-bg text-black dark:text-white rounded-2xl text-[10px] font-bold outline-none border border-transparent focus:border-black/10 transition-all" />
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-6 py-4 bg-gray-50 dark:bg-dark-bg text-black dark:text-white rounded-2xl text-[10px] font-bold outline-none border border-transparent focus:border-black/10 transition-all">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button onClick={saveTransaction} className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-[24px] text-[10px] font-black uppercase tracking-[0.4em] shadow-xl hover:opacity-90 transition-all">Commit Entry</button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'loans' && (
          <motion.div key="loans" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
             {/* LOAN CONFIGURATION FORM */}
             <div className="bg-white dark:bg-dark-card p-10 md:p-14 rounded-[40px] border border-gray-100 dark:border-white/5 minimal-shadow space-y-12 text-left transition-colors duration-500">
                <div className="flex justify-between items-center border-b border-gray-50 dark:border-white/5 pb-6">
                  <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/50">{editingLoanId ? 'Update Loan Profile' : 'Configure New Loan'}</h2>
                  {editingLoanId && <button onClick={resetLoanForm} className="text-[10px] font-black uppercase text-rose-500 hover:underline tracking-widest">Cancel Edit</button>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-300 dark:text-white/30 uppercase tracking-[0.2em] px-1">Platform</label>
                    <input type="text" value={platform} onChange={(e) => setPlatform(e.target.value)} placeholder="e.g. Bank XYZ" className="w-full px-8 py-5 bg-gray-50 dark:bg-dark-bg text-black dark:text-white rounded-[24px] font-bold text-base outline-none border border-transparent focus:border-black/10 dark:focus:border-white/10 transition-all shadow-inner" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-300 dark:text-white/30 uppercase tracking-[0.2em] px-1">Nama Peminjam</label>
                    <input type="text" value={borrowerName} onChange={(e) => setBorrowerName(e.target.value)} placeholder="Peminjam" className="w-full px-8 py-5 bg-gray-50 dark:bg-dark-bg text-black dark:text-white rounded-[24px] font-bold text-base outline-none border border-transparent focus:border-black/10 dark:focus:border-white/10 transition-all shadow-inner" />
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-[#141414] p-8 md:p-10 rounded-[36px] border border-gray-100 dark:border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="space-y-3">
                    <label className="text-[8px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] px-1">START</label>
                    <select value={startMonth} onChange={(e) => setStartMonth(e.target.value)} className="w-full px-6 py-4 bg-white dark:bg-[#0a0a0a] text-black dark:text-white rounded-2xl text-[12px] font-black outline-none appearance-none cursor-pointer border border-transparent hover:border-black/5 dark:hover:border-white/10 transition-all">
                      {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[8px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] px-1">YEAR</label>
                    <input type="number" value={startYear} onChange={(e) => setStartYear(e.target.value)} className="w-full px-6 py-4 bg-white dark:bg-[#0a0a0a] text-black dark:text-white rounded-2xl text-[12px] font-black outline-none border border-transparent hover:border-black/5 dark:hover:border-white/10 transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[8px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] px-1">TENOR (MO)</label>
                    <input type="number" value={tenor} onChange={(e) => setTenor(e.target.value)} className="w-full px-6 py-4 bg-white dark:bg-[#0a0a0a] text-black dark:text-white rounded-2xl text-[12px] font-black outline-none border border-transparent hover:border-black/5 dark:hover:border-white/10 transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[8px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] px-1">TGL TEMPO</label>
                    <input type="number" value={dueDay} onChange={(e) => setDueDay(e.target.value)} className="w-full px-6 py-4 bg-white dark:bg-[#0a0a0a] text-black dark:text-white rounded-2xl text-[12px] font-black outline-none border border-transparent hover:border-black/5 dark:hover:border-white/10 transition-all" />
                  </div>
                </div>

                <div className="flex items-center gap-6 px-4">
                  <div className="bg-gray-50 dark:bg-[#141414] border border-gray-100 dark:border-white/5 px-6 py-4 rounded-2xl text-[12px] font-black text-gray-600 dark:text-white/60 tracking-tight flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {loanPeriodRange.start}
                  </div>
                  <div className="flex-1 h-px bg-gray-100 dark:bg-white/5 relative">
                    <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-200 dark:text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                    </svg>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#141414] border border-gray-100 dark:border-white/5 px-6 py-4 rounded-2xl text-[12px] font-black text-gray-600 dark:text-white/60 tracking-tight flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    {loanPeriodRange.end}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                   <div className="lg:col-span-4 space-y-3">
                      <label className="text-[10px] font-black text-gray-300 dark:text-white/30 uppercase tracking-[0.2em] px-1">Total Pinjaman (Rp)</label>
                      <input type="number" value={loanTotal} onChange={(e) => setLoanTotal(e.target.value)} placeholder="0" className="w-full px-8 py-6 bg-gray-50 dark:bg-[#141414] text-black dark:text-white rounded-[24px] font-black text-lg outline-none border border-transparent focus:border-black/5 dark:focus:border-white/10 transition-all" />
                   </div>
                   <div className="lg:col-span-4 space-y-3">
                      <label className="text-[10px] font-black text-gray-300 dark:text-white/30 uppercase tracking-[0.2em] px-1">Cicilan Bulanan (Rp)</label>
                      <input type="number" value={loanMonthly} onChange={(e) => setLoanMonthly(e.target.value)} placeholder="0" className="w-full px-8 py-6 bg-gray-50 dark:bg-[#141414] text-black dark:text-white rounded-[24px] font-black text-lg outline-none border border-transparent focus:border-black/5 dark:focus:border-white/10 transition-all" />
                   </div>
                   <div className="lg:col-span-4">
                      <button onClick={saveLoan} className="w-full py-6 bg-black dark:bg-white text-white dark:text-black rounded-[24px] text-[12px] font-black uppercase tracking-[0.4em] shadow-2xl hover:opacity-90 active:scale-95 transition-all">
                        {editingLoanId ? 'Update Loan' : 'Save Loan'}
                      </button>
                   </div>
                </div>
             </div>

             {/* REGISTERED LOANS HISTORY */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loans.map(l => {
                  const currentRemaining = Math.max(0, l.totalAmount - (l.monthlyPayment * l.paidMonths));
                  const isBeingEdited = editingLoanId === l.id;
                  const isPaidOff = l.paidMonths >= l.tenorMonths;

                  return (
                    <div key={l.id} className={`p-8 bg-white dark:bg-dark-card border rounded-[36px] transition-all group relative overflow-hidden text-left ${isBeingEdited ? 'border-black ring-4 ring-black/5 dark:border-white' : 'border-gray-50 dark:border-white/5 hover:border-black/20 minimal-shadow'}`}>
                       <div className="flex justify-between items-start mb-6">
                          <div>
                            <h4 className="font-black text-sm uppercase text-black dark:text-white tracking-tight">{l.platform}</h4>
                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{l.borrowerName}</p>
                          </div>
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEditLoan(l)} className="w-8 h-8 flex items-center justify-center bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-black dark:hover:text-white rounded-xl transition-all">
                               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2.5"/></svg>
                            </button>
                            <button onClick={() => { if(confirm('Hapus pinjaman ini?')) setLoans(loans.filter(loan => loan.id !== l.id)) }} className="w-8 h-8 flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 text-rose-400 hover:text-rose-600 rounded-xl transition-all">
                               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3"/></svg>
                            </button>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-6 mb-6">
                          <div>
                            <span className="text-[7px] font-black uppercase text-gray-400 tracking-widest block mb-1">Remaining</span>
                            <span className={`text-sm font-black ${isPaidOff ? 'text-emerald-500' : 'text-rose-600'}`}>
                              {isPaidOff ? 'PAID OFF' : `Rp ${currentRemaining.toLocaleString()}`}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[7px] font-black uppercase text-gray-400 tracking-widest block mb-1">Due Date</span>
                            <span className="text-sm font-black text-black dark:text-white">Day {l.dueDay}</span>
                          </div>
                       </div>

                       <div className="space-y-2 mb-8">
                         <div className="w-full h-1.5 bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden">
                           <motion.div initial={false} animate={{ width: `${(l.paidMonths / (l.tenorMonths || 1)) * 100}%` }} className="h-full bg-black dark:bg-white" />
                         </div>
                         <div className="flex justify-between text-[7px] font-black text-gray-400 uppercase tracking-widest">
                           <span>{l.paidMonths} / {l.tenorMonths} Paid</span>
                           <span>{Math.round((l.paidMonths / l.tenorMonths) * 100)}%</span>
                         </div>
                       </div>

                       <div className="grid grid-cols-2 gap-3">
                          <button 
                            disabled={isPaidOff}
                            onClick={() => handlePayLoan(l.id)}
                            className={`py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${isPaidOff ? 'bg-gray-50 dark:bg-white/5 text-gray-300' : 'bg-black dark:bg-white text-white dark:text-black shadow-md'}`}
                          >
                            {isPaidOff ? 'Selesai' : 'Bayar'}
                          </button>
                          <button 
                            onClick={() => setSelectedLoanForNota(l)}
                            className="py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] bg-gray-50 dark:bg-white/5 text-black dark:text-white border border-gray-100 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95"
                          >
                            Nota
                          </button>
                       </div>
                    </div>
                  );
                })}
             </div>
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
              <div className="bg-white dark:bg-dark-card p-8 rounded-[40px] border border-gray-100 dark:border-white/5 minimal-shadow space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 dark:text-gray-600 mb-1">Savings Milestones</h3>
                <div className="space-y-4">
                  {goals.map(g => (
                    <div key={g.id} className="p-4 bg-gray-50 dark:bg-dark-bg text-black dark:text-white rounded-2xl flex items-center justify-between border border-transparent">
                      <span className="text-xs font-bold">{g.name}</span>
                      <span className="text-xs font-black">Target: Rp {g.targetAmount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="pt-4 grid grid-cols-1 gap-4">
                    <input type="text" value={goalName} onChange={e => setGoalName(e.target.value)} placeholder="New Goal" className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg text-black dark:text-white rounded-xl text-xs font-bold outline-none border border-transparent focus:border-black/10" />
                    <input type="number" value={goalTarget} onChange={e => setGoalTarget(e.target.value)} placeholder="Target (Rp)" className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg text-black dark:text-white rounded-xl text-xs font-black outline-none border border-transparent focus:border-black/10" />
                    <button onClick={saveGoal} className="py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[9px] font-black uppercase shadow-lg">Add Goal</button>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-dark-card p-8 rounded-[40px] border border-gray-100 dark:border-white/5 minimal-shadow space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 dark:text-gray-600 mb-1">Budget Allocation</h3>
                <div className="space-y-4">
                  {budgets.map(b => (
                    <div key={b.category} className="space-y-1">
                      <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-black dark:text-white"><span>{b.category}</span><span>{b.limit.toLocaleString()}</span></div>
                      <input type="number" value={b.limit || ''} onChange={e => updateBudget(b.category, parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg text-black dark:text-white rounded-lg text-[9px] font-black outline-none border border-transparent focus:border-black/10" placeholder="Set limit" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NOTA MODAL - TIDIED UP AND REFINED */}
      <AnimatePresence>
        {selectedLoanForNota && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedLoanForNota(null)}
              className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#111] rounded-[48px] shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10"
            >
               {/* Aesthetic Top Notch */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-gray-100 dark:bg-white/5 rounded-b-3xl"></div>

               <div className="p-10 space-y-10">
                  {/* Header: Title & Reference */}
                  <div className="flex justify-between items-start">
                     <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                           <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center">
                              <svg className="w-4 h-4 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4"/></svg>
                           </div>
                           <span className="text-[8px] font-black uppercase tracking-[0.5em] text-gray-400">Repayment Nota</span>
                        </div>
                        <h3 className="text-3xl font-black text-black dark:text-white tracking-tighter uppercase leading-none">{selectedLoanForNota.platform}</h3>
                        <span className="text-[8px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest block">Ref: {selectedLoanForNota.id.toUpperCase()}</span>
                     </div>
                     <button onClick={() => setSelectedLoanForNota(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl transition-all">
                        <svg className="w-5 h-5 text-gray-300 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                     </button>
                  </div>

                  {/* Summary Section: Refined Grid */}
                  <div className="grid grid-cols-2 gap-8 py-8 border-y border-dashed border-gray-100 dark:border-white/5">
                     <div className="space-y-1.5">
                        <span className="text-[7px] font-black uppercase tracking-[0.2em] text-gray-400">Peminjam</span>
                        <p className="text-sm font-bold text-black dark:text-white">{selectedLoanForNota.borrowerName}</p>
                     </div>
                     <div className="space-y-1.5 text-right">
                        <span className="text-[7px] font-black uppercase tracking-[0.2em] text-gray-400">Cicilan Bulanan</span>
                        <p className="text-sm font-black text-rose-500 tabular-nums">Rp {selectedLoanForNota.monthlyPayment.toLocaleString()}</p>
                     </div>
                     <div className="space-y-1.5">
                        <span className="text-[7px] font-black uppercase tracking-[0.2em] text-gray-400">Total Pinjaman</span>
                        <p className="text-sm font-black text-black dark:text-white tabular-nums">Rp {selectedLoanForNota.totalAmount.toLocaleString()}</p>
                     </div>
                     <div className="space-y-1.5 text-right">
                        <span className="text-[7px] font-black uppercase tracking-[0.2em] text-gray-400">Tanggal Tempo</span>
                        <p className="text-sm font-bold text-black dark:text-white">Setiap Tanggal {selectedLoanForNota.dueDay}</p>
                     </div>
                  </div>

                  {/* Schedule Details */}
                  <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-300 dark:text-gray-600">Timeline Manifest</span>
                        <span className="text-[8px] font-black px-2 py-0.5 bg-gray-50 dark:bg-white/5 text-gray-400 rounded-md border border-gray-100 dark:border-white/5 uppercase">{selectedLoanForNota.tenorMonths} Bulan Tenor</span>
                     </div>
                     <div className="grid grid-cols-3 items-center gap-4 bg-gray-50/50 dark:bg-white/[0.02] p-6 rounded-3xl border border-gray-50 dark:border-white/5">
                        <div className="text-center">
                           <span className="text-[6px] font-black text-gray-400 uppercase tracking-widest block mb-1">Mulai</span>
                           <span className="text-[10px] font-black text-black dark:text-white uppercase">{getLoanRange(selectedLoanForNota).start}</span>
                        </div>
                        <div className="flex justify-center">
                           <div className="w-full h-px bg-gray-200 dark:bg-white/10 relative">
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-black dark:bg-white rounded-full"></div>
                           </div>
                        </div>
                        <div className="text-center">
                           <span className="text-[6px] font-black text-gray-400 uppercase tracking-widest block mb-1">Selesai</span>
                           <span className="text-[10px] font-black text-black dark:text-white uppercase">{getLoanRange(selectedLoanForNota).end}</span>
                        </div>
                     </div>
                  </div>

                  {/* Progress & Stats: High Contrast Area */}
                  <div className="bg-black dark:bg-white p-8 rounded-[40px] text-white dark:text-black space-y-6 shadow-xl">
                     <div className="flex justify-between items-end">
                        <div className="space-y-1">
                           <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Sisa Hutang</span>
                           <p className="text-2xl font-black tabular-nums tracking-tight">
                              Rp {(Math.max(0, selectedLoanForNota.totalAmount - (selectedLoanForNota.monthlyPayment * selectedLoanForNota.paidMonths))).toLocaleString()}
                           </p>
                        </div>
                        <div className="text-right">
                           <span className="text-[18px] font-black leading-none">{Math.round((selectedLoanForNota.paidMonths / selectedLoanForNota.tenorMonths) * 100)}%</span>
                           <span className="text-[8px] font-bold uppercase block opacity-40">Lunas</span>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <div className="w-full h-1.5 bg-white/10 dark:bg-black/10 rounded-full overflow-hidden">
                           <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: `${(selectedLoanForNota.paidMonths / selectedLoanForNota.tenorMonths) * 100}%` }} 
                              className="h-full bg-white dark:bg-black" 
                           />
                        </div>
                        <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-[0.3em] opacity-40">
                           <span>Sudah Terbayar {selectedLoanForNota.paidMonths}x</span>
                           <span>Sisa {selectedLoanForNota.tenorMonths - selectedLoanForNota.paidMonths}x Lagi</span>
                        </div>
                     </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2 space-y-4">
                     <button 
                        onClick={() => window.print()}
                        className="w-full py-5 bg-gray-50 dark:bg-white/5 text-black dark:text-white border border-gray-100 dark:border-white/10 rounded-[28px] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-3"
                     >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" strokeWidth="2"/></svg>
                        Export PDF Nota
                     </button>
                     <div className="text-center">
                        <p className="text-[6px] font-bold text-gray-300 dark:text-gray-700 uppercase tracking-[0.6em]">Aesthetic Financial Management System &copy; 2026</p>
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FinancialView;
