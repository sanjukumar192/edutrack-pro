import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DataPoint {
  name: string;
  attendance: number;
  coins: number;
}

interface StatsChartProps {
  data: DataPoint[];
}

export const StatsChart: React.FC<StatsChartProps> = ({ data }) => {
  return (
    <div className="h-80 w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">Section Performance</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{fontSize: 12}} />
          <YAxis tick={{fontSize: 12}} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Bar dataKey="attendance" name="Attendance" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="coins" name="Total Coins" fill="#fbbf24" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
