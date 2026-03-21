'use client'

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface DashboardChartsProps {
  weeklyData: { date: string; ventas: number }[]
  profitData: { name: string; margen: number; ganancia: number }[]
}

export default function DashboardCharts({ weeklyData, profitData }: DashboardChartsProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Weekly sales chart */}
      <div className="admin-card">
        <h3 className="font-black text-gray-900 text-lg mb-6">Ventas últimos 7 días</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fontWeight: 600, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fontWeight: 600, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Ventas']}
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 700,
              }}
            />
            <Line
              type="monotone"
              dataKey="ventas"
              stroke="#FF6B9D"
              strokeWidth={3}
              dot={{ fill: '#FF6B9D', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: '#FF6B9D' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Profit margin chart */}
      <div className="admin-card">
        <h3 className="font-black text-gray-900 text-lg mb-6">Margen por producto (%)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={profitData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fontWeight: 600, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 9, fontWeight: 600, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              width={100}
            />
            <Tooltip
              formatter={(value: number) => [`${value}%`, 'Margen']}
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 700,
              }}
            />
            <Bar dataKey="margen" fill="#FF8C42" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
