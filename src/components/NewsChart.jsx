import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];

export default function NewsChart({ news, onCategoryClick }) {
  const data = useMemo(() => {
    const categoryCount = {};
    news.forEach(article => {
      const cat = article.category.toUpperCase();
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    return Object.keys(categoryCount).map(key => ({
      name: key,
      value: categoryCount[key]
    })).sort((a, b) => b.value - a.value);
  }, [news]);

  if (!news || news.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#252525] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col h-full">
      <h2 className="text-xl font-bold dark:text-white mb-6">News Distribution</h2>
      <div className="flex-grow min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              onClick={(entry) => onCategoryClick(entry.name.toLowerCase())}
              className="cursor-pointer"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '8px', color: '#1f2937' }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-gray-500 text-center mt-2">Click a slice to filter news</p>
    </div>
  );
}
