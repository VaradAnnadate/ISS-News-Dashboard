import React, { useState } from 'react';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function NewsDashboard({ newsData, selectedCategory, onClearFilter }) {
  const { news, loading, error, fetchNews } = newsData;
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [expandedId, setExpandedId] = useState(null);

  const filteredNews = news
    .filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            article.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            article.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? article.category.toLowerCase() === selectedCategory.toLowerCase() : true;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date) - new Date(a.date);
      }
      return a.source.localeCompare(b.source);
    });

  return (
    <div className="bg-white dark:bg-[#252525] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col h-[500px]">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold dark:text-white">Breaking News</h2>
          {selectedCategory && (
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              {selectedCategory.toUpperCase()}
              <button onClick={onClearFilter} className="hover:text-red-500 ml-1">&times;</button>
            </span>
          )}
        </div>
        <button 
          onClick={() => fetchNews(true)}
          className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition dark:text-white"
        >
          Refresh
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          placeholder="Search title, source, author..." 
          className="flex-grow p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-[#1f1f1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-[#1f1f1f] dark:text-white focus:outline-none"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="date">Sort by Date</option>
          <option value="source">Sort by Source</option>
        </select>
      </div>

      <div className="overflow-y-auto flex-grow pr-2">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            Error: {error}. Please ensure VITE_NEWS_API_KEY is set correctly.
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-gray-500 text-center py-4">No news found.</div>
        ) : (
          <div className="space-y-3">
            {filteredNews.map((article, i) => (
              <div key={article.id} className={`border ${expandedId === article.id ? 'border-red-300 dark:border-red-800' : 'border-gray-100 dark:border-gray-800'} rounded-lg p-3 transition-colors`}>
                <div 
                  className="flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
                >
                  <div className="relative shrink-0">
                    {article.image ? (
                       <img src={article.image} alt={article.title} className="w-16 h-12 object-cover rounded-md" />
                    ) : (
                       <div className="w-16 h-12 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center text-xs text-gray-500">No Img</div>
                    )}
                    <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {i + 1}
                    </div>
                  </div>
                  <div className="flex-grow overflow-hidden">
                     <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 truncate uppercase">{article.source} <span className="text-gray-400 font-normal ml-2">{format(article.date, 'dd/MM/yyyy, hh:mm:ss')}</span></p>
                     <p className="text-sm font-medium dark:text-white truncate">{article.title}</p>
                  </div>
                  <button className="text-gray-400 hover:text-red-500 shrink-0">
                    {expandedId === article.id ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                  </button>
                </div>
                
                {expandedId === article.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-300">
                    <p className="mb-2 line-clamp-3">{article.description}</p>
                    <div className="flex justify-between items-center mt-2">
                       <span className="text-xs text-gray-400">Author: {article.author}</span>
                       <a href={article.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline font-medium">Read More</a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
