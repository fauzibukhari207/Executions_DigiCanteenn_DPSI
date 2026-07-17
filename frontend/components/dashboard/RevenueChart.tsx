'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface RevenuePoint {
  label: string;
  revenue: number;
}

function formatRupiahShort(amount: number) {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}jt`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}rb`;
  return `${amount}`;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="border-2 border-outline bg-surface-container-lowest shadow-md px-3 py-2">
      <p className="font-mono text-label-sm uppercase font-bold">{label}</p>
      <p className="font-mono text-label-sm text-primary font-bold">Rp {payload[0].value.toLocaleString('id-ID')}</p>
    </div>
  );
}

/**
 * Bar chart pemasukan (dipakai untuk grafik harian & bulanan di
 * Dasbor). Style disederhanakan mengikuti warna Design System, tapi
 * tetap "flat" (recharts tidak mendukung hard-shadow neo-brutalist
 * secara native) -- dibungkus panel bordered di halaman pemanggil.
 */
export default function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tick={{ fontFamily: 'monospace', fontSize: 11, fill: '#1b1b1b' }}
          axisLine={{ stroke: '#1b1b1b', strokeWidth: 2 }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatRupiahShort}
          tick={{ fontFamily: 'monospace', fontSize: 11, fill: '#1b1b1b' }}
          axisLine={{ stroke: '#1b1b1b', strokeWidth: 2 }}
          tickLine={false}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,95,31,0.1)' }} />
        <Bar dataKey="revenue" fill="#ff5f1f" stroke="#1b1b1b" strokeWidth={2} radius={[0, 0, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
