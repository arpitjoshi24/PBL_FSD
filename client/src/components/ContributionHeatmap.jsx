import React from 'react';

export default function ContributionHeatmap({ dates = [] }) {
  // Normalize dates to YYYY-MM-DD
  const activityMap = dates.reduce((acc, date) => {
    const d = new Date(date).toISOString().split('T')[0];
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});

  const weeks = 52;
  const daysPerWeek = 7;
  const totalDays = weeks * daysPerWeek;
  
  const today = new Date();
  const cells = [];

  for (let i = totalDays - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const count = activityMap[dateStr] || 0;

    cells.push({
      date: dateStr,
      count: count,
      color: count > 0 ? 'bg-indigo-500' : 'bg-gray-100'
    });
  }

  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-gray-900">Project Velocity</h2>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last 365 Days</p>
      </div>
      
      <div className="flex gap-[3px] overflow-x-auto pb-2 custom-scrollbar">
        {Array.from({ length: weeks }).map((_, wIdx) => (
          <div key={wIdx} className="flex flex-col gap-[3px] shrink-0">
            {cells.slice(wIdx * 7, (wIdx + 1) * 7).map((cell, dIdx) => (
              <div
                key={dIdx}
                title={`${cell.count} Projects on ${cell.date}`}
                className={`w-[12px] h-[12px] rounded-[2px] transition-all hover:ring-2 hover:ring-indigo-300 ${cell.color}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
        <span>Less</span>
        <div className="w-3 h-3 bg-gray-100 rounded-[2px]" />
        <div className="w-3 h-3 bg-indigo-500 rounded-[2px]" />
        <span>More</span>
      </div>
    </div>
  );
}