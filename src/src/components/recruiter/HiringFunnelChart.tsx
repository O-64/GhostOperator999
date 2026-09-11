'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PipelineStage } from '../../types';

interface FunnelData {
  stage: string;
  count: number;
}

interface Props {
  stageCounts: Record<PipelineStage, number>;
}

const STAGE_COLORS: Record<string, string> = {
  'Discovered': '#94a3b8',
  'Shortlisted': '#6366f1',
  'Contacted': '#3b82f6',
  'Interview Scheduled': '#f59e0b',
  'Offered': '#a855f7',
  'Hired': '#10b981',
};

export default function HiringFunnelChart({ stageCounts }: Props) {
  const data: FunnelData[] = Object.entries(stageCounts)
    .filter(([stage]) => stage !== 'Rejected')
    .map(([stage, count]) => ({ stage, count }));

  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
        No pipeline data yet. Start shortlisting candidates!
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2">
          <p className="text-xs font-bold text-slate-800">{payload[0].payload.stage}</p>
          <p className="text-lg font-black" style={{ color: STAGE_COLORS[payload[0].payload.stage] }}>{payload[0].value}</p>
          <p className="text-[10px] text-slate-500">{total > 0 ? Math.round((payload[0].value / total) * 100) : 0}% of pipeline</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="stage"
              tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
              tickFormatter={s => s.split(' ')[0]}
            />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage] || '#6366f1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Stage pills */}
      <div className="flex flex-wrap gap-2 mt-3">
        {data.filter(d => d.count > 0).map(d => (
          <div key={d.stage} className="flex items-center gap-1.5 text-[11px]">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: STAGE_COLORS[d.stage] }} />
            <span className="text-slate-600 font-semibold">{d.stage}: <strong>{d.count}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
}
