
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Task, TaskStatus, BusinessUnit, TaskWeek, TaskSubView, Note, NoteType, Holiday, DesignAsset } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'smarthub_tasks_v2_2026';
const NOTES_STORAGE_KEY = 'smarthub_notes_v2_2026';
const HOLIDAYS_STORAGE_KEY = 'smarthub_holidays_v2_2026';
const ASSETS_STORAGE_KEY = 'smarthub_assets_v2_2026';
const LINKS_STORAGE_KEY = 'smarthub_unit_links_v2_2026';

const STATUS_OPTIONS: TaskStatus[] = ['Shoot', 'Editing', 'Finish Editing', 'Post'];
const UNIT_OPTIONS: BusinessUnit[] = ['Capital Properties', 'Ngubahrumah', 'Platinum'];
const WEEK_OPTIONS: TaskWeek[] = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
const PLATFORM_OPTIONS = ['Canva', 'Corel', 'Figma'] as const;

const DEFAULT_LINKS: Record<BusinessUnit, string> = {
  'Capital Properties': '',
  'Ngubahrumah': '',
  'Platinum': ''
};

type WeekFilter = 'All' | TaskWeek;

const TaskManagerView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TaskSubView>('task');
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<WeekFilter>('All');
  const [showLinksInHistory, setShowLinksInHistory] = useState(false);
  
  // Data States
  const [tasks, setTasks] = useState<Task[]>(() => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  const [notes, setNotes] = useState<Note[]>(() => JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY) || '[]'));
  const [holidays, setHolidays] = useState<Holiday[]>(() => JSON.parse(localStorage.getItem(HOLIDAYS_STORAGE_KEY) || '[]'));
  const [assets, setAssets] = useState<DesignAsset[]>(() => JSON.parse(localStorage.getItem(ASSETS_STORAGE_KEY) || '[]'));
  const [unitLinks, setUnitLinks] = useState<Record<BusinessUnit, string>>(() => 
    JSON.parse(localStorage.getItem(LINKS_STORAGE_KEY) || JSON.stringify(DEFAULT_LINKS))
  );

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes)), [notes]);
  useEffect(() => localStorage.setItem(HOLIDAYS_STORAGE_KEY, JSON.stringify(holidays)), [holidays]);
  useEffect(() => localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets)), [assets]);
  useEffect(() => localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(unitLinks)), [unitLinks]);

  // Refs for drag constraints
  const navTabsRef = useRef<HTMLDivElement>(null);

  // Task Form States
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<TaskStatus>('Shoot');
  const [unit, setUnit] = useState<BusinessUnit>('Capital Properties');
  const [week, setWeek] = useState<TaskWeek>('Week 1');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Note Form State
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState<NoteType>('Body');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  // Holiday Form State
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');

  // Asset Form State
  const [assetName, setAssetName] = useState('');
  const [assetUnit, setAssetUnit] = useState<BusinessUnit>('Capital Properties');
  const [assetPlatform, setAssetPlatform] = useState<'Canva' | 'Corel' | 'Figma'>('Canva');
  const [assetLink, setAssetLink] = useState('');

  const resetTaskForm = () => {
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setStatus('Shoot');
    setUnit('Capital Properties');
    setWeek('Week 1');
    setEditingTaskId(null);
  };

  const handleSaveTask = () => {
    if (!title) return;
    if (editingTaskId) {
      setTasks(tasks.map(t => t.id === editingTaskId ? { ...t, title, date, status, businessUnit: unit, week } : t));
    } else {
      const newTask: Task = { id: Math.random().toString(36).substr(2, 9), title, description: '', completed: false, priority: 'medium', createdAt: new Date().toISOString(), date, status, businessUnit: unit, week };
      setTasks([newTask, ...tasks]);
    }
    resetTaskForm();
  };

  const handleSaveNote = () => {
    if (!noteContent.trim()) return;
    const newNote: Note = { id: Math.random().toString(36).substr(2, 9), content: noteContent, type: noteType, bold: isBold, italic: isItalic, underline: isUnderline, createdAt: new Date().toISOString() };
    setNotes([newNote, ...notes]);
    setNoteContent('');
    setIsBold(false); setIsItalic(false); setIsUnderline(false);
  };

  const handleSaveHoliday = () => {
    if (!holidayName || !holidayDate) return;
    const newHoliday: Holiday = { id: Math.random().toString(36).substr(2, 9), name: holidayName, date: holidayDate };
    setHolidays([...holidays, newHoliday]);
    setHolidayName(''); setHolidayDate('');
  };

  const handleSaveAsset = () => {
    if (!assetName || !assetLink) return;
    const newAsset: DesignAsset = { id: Math.random().toString(36).substr(2, 9), name: assetName, unit: assetUnit, platform: assetPlatform, link: assetLink, createdAt: new Date().toISOString().split('T')[0] };
    setAssets([newAsset, ...assets]);
    setAssetName(''); setAssetLink('');
  };

  const updateUnitLink = (unit: BusinessUnit, url: string) => {
    setUnitLinks(prev => ({ ...prev, [unit]: url }));
  };

  const startEdit = (task: Task) => {
    setEditingTaskId(task.id); setTitle(task.title); setDate(task.date); setStatus(task.status); setUnit(task.businessUnit); setWeek(task.week);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const groupedTasks = useMemo(() => {
    const groups: Record<TaskWeek, Task[]> = { 'Week 1': [], 'Week 2': [], 'Week 3': [], 'Week 4': [] };
    tasks.forEach(task => groups[task.week].push(task));
    return groups;
  }, [tasks]);

  const allRelevantDates = useMemo(() => {
    const dates = new Set<string>();
    tasks.forEach(t => dates.add(t.date));
    holidays.forEach(h => dates.add(h.date));
    return Array.from(dates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [tasks, holidays]);

  const displayWeeks = selectedWeekFilter === 'All' ? WEEK_OPTIONS : [selectedWeekFilter];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 page-enter pb-32">
      {/* Tab Navigation - Draggable Indicator Box */}
      <div className="flex justify-center mb-12">
        <div ref={navTabsRef} className="bg-gray-100/50 dark:bg-white/5 p-1 rounded-full flex gap-1 relative overflow-hidden min-w-[360px] md:min-w-[480px]">
          <motion.div 
            drag="x"
            dragConstraints={navTabsRef}
            dragElastic={0.05}
            dragMomentum={false}
            onDragEnd={(e, info) => {
               const containerWidth = navTabsRef.current?.offsetWidth || 0;
               const x = info.point.x - (navTabsRef.current?.getBoundingClientRect().left || 0);
               const tabWidth = containerWidth / 4;
               
               const tabs: TaskSubView[] = ['task', 'notes', 'date', 'list-print'];
               const idx = Math.min(3, Math.max(0, Math.floor(x / tabWidth)));
               setActiveTab(tabs[idx]);
            }}
            whileDrag={{ scale: 0.98, cursor: 'grabbing' }}
            className="absolute top-1 bottom-1 bg-white dark:bg-dark-card rounded-full shadow-sm z-0 cursor-grab"
            animate={{ x: activeTab === 'task' ? 0 : activeTab === 'notes' ? '100%' : activeTab === 'date' ? '200%' : '300%', width: '24.5%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            style={{ left: '0.25%' }}
          />
          <button onClick={() => setActiveTab('task')} className={`relative z-10 flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-colors duration-300 ${activeTab === 'task' ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>Task</button>
          <button onClick={() => setActiveTab('notes')} className={`relative z-10 flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-colors duration-300 ${activeTab === 'notes' ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>Notes</button>
          <button onClick={() => setActiveTab('date')} className={`relative z-10 flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-colors duration-300 ${activeTab === 'date' ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>Date</button>
          <button onClick={() => setActiveTab('list-print')} className={`relative z-10 flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-colors duration-300 ${activeTab === 'list-print' ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>List Print</button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'task' && (
          <motion.div key="task-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-6 sticky top-24">
              <div className="bg-white dark:bg-dark-card p-8 rounded-[32px] border border-gray-100 dark:border-white/5 minimal-shadow space-y-6 text-left">
                <div className="flex justify-between items-center border-b border-gray-50 dark:border-white/5 pb-4 mb-4">
                  <h2 className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-300 dark:text-gray-600">{editingTaskId ? 'Edit Task' : 'Task Deployment'}</h2>
                  {editingTaskId && <button onClick={resetTaskForm} className="text-[7px] font-black uppercase tracking-widest text-rose-500 hover:underline">Cancel</button>}
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5"><label className="text-[7px] font-black text-gray-300 dark:text-gray-600 uppercase px-1 tracking-widest">Description</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task Name" className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg text-black dark:text-white rounded-xl font-bold text-[11px] outline-none border border-transparent focus:border-black dark:focus:border-white transition-all" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><label className="text-[7px] font-black text-gray-300 dark:text-gray-600 uppercase px-1 tracking-widest">Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg text-black dark:text-white rounded-xl text-[10px] font-bold outline-none" /></div>
                    <div className="space-y-1.5"><label className="text-[7px] font-black text-gray-300 dark:text-gray-600 uppercase px-1 tracking-widest">Timing</label><select value={week} onChange={(e) => setWeek(e.target.value as TaskWeek)} className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg text-black dark:text-white rounded-xl text-[10px] font-bold outline-none appearance-none">{WEEK_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}</select></div>
                  </div>
                  <div className="space-y-1.5"><label className="text-[7px] font-black text-gray-300 dark:text-gray-600 uppercase px-1 tracking-widest">Unit</label><select value={unit} onChange={(e) => setUnit(e.target.value as BusinessUnit)} className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg text-black dark:text-white rounded-xl text-[10px] font-bold outline-none appearance-none">{UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}</select></div>
                  <div className="space-y-1.5"><label className="text-[7px] font-black text-gray-300 dark:text-gray-600 uppercase px-1 tracking-widest">Status</label><div className="grid grid-cols-2 gap-2">{STATUS_OPTIONS.map(s => (<button key={s} onClick={() => setStatus(s)} className={`py-2 px-3 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${status === s ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-100 dark:bg-white/5 text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'}`}>{s}</button>))}</div></div>
                  <button onClick={handleSaveTask} className={`w-full mt-4 py-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.4em] shadow-lg active:scale-95 transition-all ${editingTaskId ? 'bg-emerald-600 text-white' : 'bg-black dark:bg-white text-white dark:text-black'}`}>{editingTaskId ? 'Update Task' : 'Deploy Task'}</button>
                </div>
              </div>
            </div>
            <div className="lg:col-span-8 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
                <div className="flex items-center gap-3"><h2 className="tracking-[0.4em] text-[9px] font-black text-gray-300 dark:text-gray-600 uppercase">Live Pipeline</h2></div>
                <div className="bg-gray-100/50 dark:bg-white/5 p-1 rounded-full flex gap-1 relative overflow-hidden self-end">{['All', ...WEEK_OPTIONS].map((w) => (<button key={w} onClick={() => setSelectedWeekFilter(w as WeekFilter)} className={`px-4 py-1.5 rounded-full text-[7px] font-black uppercase tracking-widest transition-all ${selectedWeekFilter === w ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm' : 'text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white'}`}>{w === 'All' ? 'All' : w.replace('Week ', 'W')}</button>))}</div>
              </div>
              <div className="space-y-12">
                {displayWeeks.map(weekKey => (
                  <div key={weekKey} className="space-y-4">
                    {groupedTasks[weekKey].length > 0 && <div className="flex items-center gap-4 px-4"><span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300 dark:text-gray-600">{weekKey}</span><div className="flex-1 h-px bg-gray-50 dark:bg-white/5"></div></div>}
                    <div className="space-y-2">{groupedTasks[weekKey].map(task => (
                        <div key={task.id} className={`group flex items-center gap-3 px-5 py-3.5 bg-white dark:bg-dark-card rounded-xl border border-gray-50 dark:border-white/5 minimal-shadow transition-all hover:border-black/10 dark:hover:border-white/20 text-left ${task.completed ? 'opacity-40 grayscale' : ''}`}>
                          <button onClick={() => setTasks(tasks.map(t => t.id === task.id ? {...t, completed: !t.completed} : t))} className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all shrink-0 ${task.completed ? 'bg-black dark:bg-white border-black dark:border-white text-white dark:text-black' : 'border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-black dark:hover:border-white'}`}>{task.completed && <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}</button>
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 items-center gap-3">
                            <div className="md:col-span-7"><h3 className={`font-bold text-[11px] transition-all ${task.completed ? 'line-through text-gray-400' : 'text-black dark:text-white'}`}>{task.title}</h3><div className="flex items-center gap-2 mt-0.5"><span className="text-[6px] font-black uppercase tracking-widest text-gray-300 dark:text-gray-600">{task.businessUnit}</span><span className={`text-[6px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${task.status === 'Post' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-gray-50 dark:bg-white/5 text-gray-400'}`}>{task.status}</span></div></div>
                            <div className="md:col-span-3 text-right md:text-left"><span className="text-[6px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest tabular-nums">{task.date}</span></div>
                            <div className="md:col-span-2 flex justify-end gap-1"><button onClick={() => startEdit(task)} className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-black dark:hover:text-white transition-all"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button><button onClick={() => setTasks(tasks.filter(t => t.id !== task.id))} className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-rose-500 transition-all"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3"/></svg></button></div>
                          </div>
                        </div>
                      ))}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'notes' && (
          <motion.div key="notes-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-3xl mx-auto space-y-8 text-left">
            <div className="bg-white dark:bg-dark-card p-8 rounded-[32px] border border-gray-100 dark:border-white/5 minimal-shadow space-y-6">
              <h2 className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-300 dark:text-gray-600 border-b border-gray-50 dark:border-white/5 pb-4 mb-4">Internal Notes</h2>
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                <select value={noteType} onChange={(e) => setNoteType(e.target.value as NoteType)} className="px-3 py-1.5 bg-gray-50 dark:bg-dark-bg dark:text-white rounded-lg text-[9px] font-black uppercase tracking-widest border border-gray-100 dark:border-white/5">
                  <option value="Heading">Heading</option><option value="Subheading">Subheading</option><option value="Body">Isi</option>
                </select>
                <div className="flex bg-gray-50 dark:bg-dark-bg rounded-lg p-0.5 border border-gray-100 dark:border-white/5">
                  <button onClick={() => setIsBold(!isBold)} className={`w-8 h-8 flex items-center justify-center rounded font-black transition-all ${isBold ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-gray-400 dark:text-gray-600'}`}>B</button>
                  <button onClick={() => setIsItalic(!isItalic)} className={`w-8 h-8 flex items-center justify-center rounded italic transition-all ${isItalic ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-gray-400 dark:text-gray-600'}`}>I</button>
                  <button onClick={() => setIsUnderline(!isUnderline)} className={`w-8 h-8 flex items-center justify-center rounded underline transition-all ${isUnderline ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-gray-400 dark:text-gray-600'}`}>U</button>
                </div>
              </div>
              <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} placeholder="Write something..." className={`w-full min-h-[120px] px-6 py-5 bg-gray-50 dark:bg-dark-bg text-black dark:text-white rounded-2xl outline-none resize-none focus:ring-1 focus:ring-black/5 dark:focus:ring-white/5 transition-all ${isBold ? 'font-bold' : 'font-medium'} ${isItalic ? 'italic' : ''} ${isUnderline ? 'underline' : ''}`} />
              <div className="flex justify-end"><button onClick={handleSaveNote} className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Save Note</button></div>
            </div>
            <div className="space-y-4">
              {notes.map(note => (
                <div key={note.id} className="group p-6 bg-white dark:bg-dark-card rounded-[24px] border border-gray-100 dark:border-white/5 minimal-shadow">
                  <div className={`
                    ${note.type === 'Heading' ? 'text-xl font-black text-black dark:text-white' : note.type === 'Subheading' ? 'text-base font-bold text-gray-700 dark:text-gray-300' : 'text-sm font-medium text-gray-600 dark:text-gray-400'}
                    ${note.bold ? 'font-black' : ''} ${note.italic ? 'italic' : ''} ${note.underline ? 'underline' : ''}
                  `}>{note.content}</div>
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-50 dark:border-white/5">
                    <span className="text-[7px] font-black uppercase tracking-widest text-gray-300 dark:text-gray-600">{note.type} &bull; {new Date(note.createdAt).toLocaleDateString()}</span>
                    <button onClick={() => setNotes(notes.filter(n => n.id !== note.id))} className="opacity-0 group-hover:opacity-100 text-rose-500"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3"/></svg></button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'date' && (
          <motion.div key="date-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl mx-auto space-y-12 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-dark-card p-8 rounded-[32px] border border-gray-100 dark:border-white/5 minimal-shadow space-y-6">
                <h2 className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-300 dark:text-gray-600">Holiday Registration</h2>
                <div className="space-y-4">
                  <div className="space-y-1.5"><label className="text-[7px] font-black text-gray-300 dark:text-gray-600 uppercase px-1 tracking-widest">Holiday Name</label><input type="text" value={holidayName} onChange={(e) => setHolidayName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg text-black dark:text-white rounded-xl font-bold text-[11px] outline-none border border-transparent focus:border-black dark:focus:border-white transition-all" /></div>
                  <div className="space-y-1.5"><label className="text-[7px] font-black text-gray-300 dark:text-gray-600 uppercase px-1 tracking-widest">Date</label><input type="date" value={holidayDate} onChange={(e) => setHolidayDate(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg text-black dark:text-white rounded-xl text-[10px] font-bold outline-none border border-transparent focus:border-black dark:focus:border-white transition-all" /></div>
                  <button onClick={handleSaveHoliday} className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95">Add Holiday</button>
                </div>
              </div>

              {/* Business Ecosystem configuration area */}
              <div className="bg-white dark:bg-dark-card p-8 rounded-[32px] border border-gray-100 dark:border-white/5 minimal-shadow space-y-6">
                <h2 className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-300 dark:text-gray-600">Ecosystem Links</h2>
                <div className="space-y-4">
                  {UNIT_OPTIONS.map(u => (
                    <div key={u} className="space-y-1.5">
                      <label className="text-[7px] font-black text-gray-300 dark:text-gray-600 uppercase px-1 tracking-widest">{u} URL</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={unitLinks[u]} 
                          onChange={(e) => updateUnitLink(u, e.target.value)} 
                          placeholder="https://..." 
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg text-black dark:text-white rounded-xl text-[10px] font-bold outline-none border border-transparent focus:border-black dark:focus:border-white transition-all" 
                        />
                        {unitLinks[u] && (
                           <a href={unitLinks[u]} target="_blank" rel="noopener noreferrer" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-black dark:hover:text-white transition-colors">
                             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="2"/></svg>
                           </a>
                        )}
                      </div>
                    </div>
                  ))}
                  <p className="text-[7px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest italic pt-2">* Links are saved automatically to local system.</p>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-300 dark:text-gray-600">Archive / History</h2>
                <button 
                  onClick={() => setShowLinksInHistory(!showLinksInHistory)} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${showLinksInHistory ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showLinksInHistory ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/>
                    )}
                  </svg>
                  {showLinksInHistory ? 'Hide Ecosystem' : 'Show Ecosystem'}
                </button>
              </div>

              {allRelevantDates.map((dateStr) => {
                const dateHolidays = holidays.filter(h => h.date === dateStr);
                const dateTasks = tasks.filter(t => t.date === dateStr);
                
                return (
                  <div key={dateStr} className="space-y-4">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 dark:text-gray-600">{new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' })}</span>
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-black text-black dark:text-white">{dateStr}</h3>
                          {dateHolidays.map(h => (
                            <div key={h.id} className="group relative flex items-center">
                              <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 text-[8px] font-black uppercase rounded tracking-widest border border-rose-100 dark:border-rose-500/20">
                                Holiday: {h.name}
                              </span>
                              <button 
                                onClick={() => setHolidays(holidays.filter(item => item.id !== h.id))}
                                className="ml-1 opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-all"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex-1 h-px bg-gray-100 dark:bg-white/5"></div>
                    </div>

                    <AnimatePresence>
                      {showLinksInHistory && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }} 
                          animate={{ opacity: 1, height: 'auto' }} 
                          exit={{ opacity: 0, height: 0 }}
                          className="flex gap-2 overflow-hidden px-1"
                        >
                          {UNIT_OPTIONS.map(name => (
                            <a key={name} href={unitLinks[name] || '#'} target="_blank" rel="noopener noreferrer" className={`px-3 py-1.5 bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-lg text-[7px] font-black uppercase tracking-widest transition-all ${unitLinks[name] ? 'text-gray-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white shadow-sm' : 'opacity-20 cursor-not-allowed'}`}>
                              {name}
                            </a>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {dateTasks.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {dateTasks.map(t => (
                          <div key={t.id} className="p-4 bg-white dark:bg-dark-card rounded-2xl border border-gray-50 dark:border-white/5 minimal-shadow flex items-center gap-4 group hover:border-black dark:hover:border-white transition-all">
                            <div className={`w-1.5 h-10 rounded-full ${t.completed ? 'bg-gray-200 dark:bg-gray-800' : 'bg-black dark:bg-white'}`}></div>
                            <div className="flex-1">
                              <h4 className={`text-xs font-bold ${t.completed ? 'line-through text-gray-300 dark:text-gray-600' : 'text-black dark:text-white'}`}>{t.title}</h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[7px] font-black uppercase text-gray-300 dark:text-gray-600 tracking-widest">{t.businessUnit}</span>
                                <span className="w-1 h-1 bg-gray-100 dark:bg-white/10 rounded-full"></span>
                                <span className="text-[7px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest">{t.status}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      dateHolidays.length > 0 && (
                        <div className="p-8 border border-dashed border-gray-100 dark:border-white/5 rounded-3xl flex flex-col items-center justify-center text-center bg-gray-50/30 dark:bg-white/[0.02]">
                          <svg className="w-6 h-6 text-gray-200 dark:text-gray-800 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 dark:text-gray-600">No scheduled tasks for this date</p>
                        </div>
                      )
                    )}
                  </div>
                );
              })}
              
              {allRelevantDates.length === 0 && (
                <div className="py-24 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-200 dark:text-gray-800">No history found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'list-print' && (
          <motion.div key="print-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-6xl mx-auto space-y-12 text-left">
            <div className="bg-white dark:bg-dark-card p-8 rounded-[32px] border border-gray-100 dark:border-white/5 minimal-shadow space-y-6">
              <h2 className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-300 dark:text-gray-600">Design Asset Manifest</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5"><label className="text-[7px] font-black text-gray-300 dark:text-gray-600 uppercase px-1">Design Name</label><input type="text" value={assetName} onChange={(e) => setAssetName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg text-black dark:text-white rounded-xl font-bold text-[11px] outline-none border border-transparent focus:border-black dark:focus:border-white transition-all" /></div>
                <div className="space-y-1.5"><label className="text-[7px] font-black text-gray-300 dark:text-gray-600 uppercase px-1">Unit</label><select value={assetUnit} onChange={(e) => setAssetUnit(e.target.value as BusinessUnit)} className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg text-black dark:text-white rounded-xl text-[10px] font-bold outline-none">{UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}</select></div>
                <div className="space-y-1.5"><label className="text-[7px] font-black text-gray-300 dark:text-gray-600 uppercase px-1">Platform</label><select value={assetPlatform} onChange={(e) => setAssetPlatform(e.target.value as any)} className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg text-black dark:text-white rounded-xl text-[10px] font-bold outline-none">{PLATFORM_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                <div className="space-y-1.5"><label className="text-[7px] font-black text-gray-300 dark:text-gray-600 uppercase px-1">Link</label><input type="text" value={assetLink} onChange={(e) => setAssetLink(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg text-black dark:text-white rounded-xl font-bold text-[11px] outline-none border border-transparent focus:border-black dark:focus:border-white transition-all" /></div>
              </div>
              <div className="flex justify-end"><button onClick={handleSaveAsset} className="px-10 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95">Register Asset</button></div>
            </div>

            <div className="bg-white dark:bg-dark-card p-12 rounded-[40px] border border-gray-100 dark:border-white/5 minimal-shadow">
              <div className="flex justify-between items-start mb-12 border-b border-gray-50 dark:border-white/5 pb-8">
                <div><h1 className="text-3xl font-black aesthetic-tracking mb-2 uppercase text-black dark:text-white">PRODUCTION MANIFEST</h1><p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-300 dark:text-gray-600">Productivity Hub &copy; 2026</p></div>
                <button onClick={() => window.print()} className="px-6 py-2 bg-gray-50 dark:bg-white/5 dark:text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all print:hidden active:scale-90">Print PDF</button>
              </div>

              <table className="w-full text-[10px] font-bold text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/5 uppercase tracking-widest text-gray-400 dark:text-gray-600">
                    <th className="py-4 px-2">Date</th>
                    <th className="py-4 px-2">Asset Name</th>
                    <th className="py-4 px-2">Unit</th>
                    <th className="py-4 px-2">Platform</th>
                    <th className="py-4 px-2">Link</th>
                    <th className="py-4 px-2 text-center">Check</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map(asset => (
                    <tr key={asset.id} className="group border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-black dark:text-white">
                      <td className="py-4 px-2 tabular-nums text-gray-400">{asset.createdAt}</td>
                      <td className="py-4 px-2 font-black">{asset.name}</td>
                      <td className="py-4 px-2 uppercase text-gray-400">{asset.unit}</td>
                      <td className="py-4 px-2">
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 rounded text-[8px] uppercase">{asset.platform}</span>
                      </td>
                      <td className="py-4 px-2">
                        <a href={asset.link} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline truncate max-w-[150px] block">
                          {asset.link}
                        </a>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center justify-center gap-4">
                          <div className="w-4 h-4 rounded border border-gray-300 dark:border-white/20"></div>
                          <button onClick={() => setAssets(assets.filter(a => a.id !== asset.id))} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-all print:hidden">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {assets.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-gray-300 dark:text-gray-700 uppercase tracking-widest text-[8px]">No assets registered yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskManagerView;
