import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ISSChart({ speedHistory }) {
  return (
    <div className="bg-white dark:bg-[#252525] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col h-full">
      <h2 className="text-xl font-bold dark:text-white mb-6">ISS Speed Trend</h2>
      <div className="flex-grow min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={speedHistory} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="time" stroke="#9ca3af" fontSize={11} tickMargin={10} angle={-45} textAnchor="end" height={60} />
            <YAxis stroke="#9ca3af" fontSize={11} domain={['dataMin - 100', 'dataMax + 100']} tickFormatter={(value) => value.toLocaleString()} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '8px', color: '#1f2937' }}
              itemStyle={{ color: '#ef4444' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Line type="monotone" dataKey="speed" name="ISS Speed (km/h)" stroke="#ef4444" strokeWidth={2} dot={{ r: 2, fill: '#ef4444' }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
