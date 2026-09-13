'use client';

import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

export default function ConfidenceGauge({ value, size = 84 }: { value: number; size?: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 70 ? '#34D399' : pct >= 50 ? '#FBBF24' : '#FB7185';
  const data = [{ value: pct }];

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <RadialBarChart
        width={size}
        height={size}
        cx="50%"
        cy="50%"
        innerRadius="72%"
        outerRadius="100%"
        barSize={8}
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} angleAxisId={0} />
        <RadialBar background={{ fill: 'rgba(255,255,255,0.08)' }} dataKey="value" cornerRadius={8} fill={color} />
      </RadialBarChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-semibold" style={{ color }}>
          {pct}%
        </span>
      </div>
    </div>
  );
}
