/*
 * Line chart of WPM (and accuracy as a second series) over recent sessions.
 * Uses Recharts.
 */
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { SessionResult } from '../../types';

interface Props {
  history: SessionResult[];
  /** Show this many most-recent sessions. */
  limit?: number;
}

export function WpmHistoryChart({ history, limit = 30 }: Props) {
  const data = history
    .slice(-limit)
    .map((s, i) => ({
      idx: i + 1,
      wpm: Math.round(s.wpm),
      accuracy: Math.round(s.accuracy * 100),
    }));

  if (data.length === 0) {
    return (
      <div className="grid h-64 place-items-center rounded-lg border border-dashed border-border text-sm text-muted">
        No sessions yet. Complete one to start your chart.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 12, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D8" />
        <XAxis dataKey="idx" stroke="#78716c" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis stroke="#78716c" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            background: '#FFFFFF',
            border: '1px solid #F0E5D8',
            borderRadius: 12,
            fontSize: 12,
          }}
          labelFormatter={(l) => `Session #${l}`}
        />
        <Line
          type="monotone"
          dataKey="wpm"
          name="WPM"
          stroke="#F25C16"
          strokeWidth={2.5}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="accuracy"
          name="Accuracy"
          stroke="#14B8A6"
          strokeWidth={2}
          dot={false}
          strokeDasharray="4 4"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
