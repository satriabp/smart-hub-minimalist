
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

export interface Loan {
  id: string;
  platform: string;
  borrowerName: string;
  startMonth: string;
  startYear: number;
  tenorMonths: number;
  dueDay: number;
  totalAmount: number;
  monthlyPayment: number;
  paidMonths: number;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string;
}

export interface Budget {
  category: string;
  limit: number;
}

export type TaskStatus = 'Shoot' | 'Editing' | 'Finish Editing' | 'Post';
export type BusinessUnit = 'Capital Properties' | 'Ngubahrumah' | 'Platinum';
export type TaskWeek = 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4';
export type NoteType = 'Heading' | 'Subheading' | 'Body';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  date: string;
  status: TaskStatus;
  businessUnit: BusinessUnit;
  week: TaskWeek;
}

export interface Note {
  id: string;
  content: string;
  type: NoteType;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  createdAt: string;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
}

export interface DesignAsset {
  id: string;
  name: string;
  unit: BusinessUnit;
  platform: 'Canva' | 'Corel' | 'Figma';
  link: string;
  createdAt: string;
}

export interface SyncConfig {
  scriptUrl: string;
  lastSync?: string;
}

export type ViewState = 'home' | 'financial' | 'task-manager';
export type TaskSubView = 'task' | 'notes' | 'date' | 'list-print';
