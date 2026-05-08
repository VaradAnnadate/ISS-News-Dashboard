import React, { useState, useEffect } from 'react';
import ISSTracker from './components/ISSTracker';
import ISSChart from './components/ISSChart';
import NewsDashboard from './components/NewsDashboard';
import NewsChart from './components/NewsChart';
import Chatbot from './components/Chatbot';
import { useISSData } from './hooks/useISSData';
import { useNewsData } from './hooks/useNewsData';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  const issData = useISSData();
  const newsData = useNewsData();
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-xs font-bold text-blue-500 tracking-wider uppercase mb-1">MISSION CONTROL DASHBOARD</h2>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 dark:text-white">Real-Time ISS and News Intelligence</h1>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-5 py-2.5 bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-full font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm flex items-center gap-2 shrink-0"
        >
          {darkMode ? 'Switch to Light' : 'Switch to Dark'}
        </button>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Wider on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <ISSTracker data={issData} />
          <NewsDashboard 
            newsData={newsData} 
            selectedCategory={selectedCategory} 
            onClearFilter={() => setSelectedCategory(null)} 
          />
        </div>
        
        {/* Right Column */}
        <div className="space-y-6 h-full flex flex-col">
          <ISSChart speedHistory={issData.speedHistory} />
          <NewsChart news={newsData.news} onCategoryClick={setSelectedCategory} />
        </div>
      </main>

      <Chatbot issData={issData} />
    </div>
  );
}

export default App;
