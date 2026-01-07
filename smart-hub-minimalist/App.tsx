
import React, { useState } from 'react';
import { ViewState } from './types';
import Home from './views/Home';
import FinancialView from './views/FinancialView';
import TaskManagerView from './views/TaskManagerView';
import { Layout } from './components/Layout';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home onSelectView={setCurrentView} />;
      case 'financial':
        return <FinancialView onBack={() => setCurrentView('home')} />;
      case 'task-manager':
        return <TaskManagerView onBack={() => setCurrentView('home')} />;
      default:
        return <Home onSelectView={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;
