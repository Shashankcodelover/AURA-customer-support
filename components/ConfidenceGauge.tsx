'use client';

export default function ConfidenceGauge({
  value,
  size = 96,
  strokeWidth: customStrokeWidth,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
}) {
  const pct = Math.round(value * 100);
  const isHigh = pct >= 70;
  const isMed = pct >= 50 && pct < 70;

  const strokeColor = isHigh ? '#34d399' : isMed ? '#fbbf24' : '#f43f5e';
  const glowColor = isHigh ? 'rgba(52, 211, 153, 0.4)' : isMed ? 'rgba(251, 191, 36, 0.4)' : 'rgba(244, 63, 94, 0.4)';

  const strokeWidth = customStrokeWidth ?? (size < 60 ? 5 : 8);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const isSmall = size < 60;

  return (
    <div className="flex flex-col items-center justify-center shrink-0">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(109, 74, 235, 0.1)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated fill track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              filter: `drop-shadow(0 0 8px ${glowColor})`,
              transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            className={`font-bold font-mono tracking-tight leading-none ${isSmall ? 'text-xs' : 'text-xl'}`}
            style={{ color: strokeColor }}
          >
            {pct}%
          </span>
          {!isSmall && (
            <span className="text-[9px] uppercase tracking-wider text-[#6B6E85] dark:text-gray-400 font-semibold mt-0.5">
              {isHigh ? 'High' : isMed ? 'Review' : 'Risk'}
            </span>
          )}
        </div>
      </div>
      {!isSmall && <span className="text-[10px] text-[#6B6E85] dark:text-gray-400 font-medium mt-1">Confidence</span>}
    </div>
  );
}
