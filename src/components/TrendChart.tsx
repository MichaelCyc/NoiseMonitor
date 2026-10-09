import { AudioLines } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatDuration } from "../lib/audio";
import type { ChartPoint } from "../hooks/useSoundMeter";
import { useLanguage } from "../hooks/useLanguage";

export default function TrendChart({
  points,
  duration,
  threshold,
  range,
  demo,
}: {
  points: ChartPoint[];
  duration: number;
  threshold: number;
  range: number;
  demo: boolean;
}) {
  const { t } = useLanguage();
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(660);
  useEffect(() => {
    const node = container.current!;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(260, entry.contentRect.width));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const height = 210,
    left = 36,
    top = 14,
    bottom = 177,
    right = width - 10;
  const end = Math.max(range, duration),
    start = end - range;
  const tickCount = width < 420 ? 4 : 7;
  const x = (t: number) => left + ((t - start) / range) * (right - left);
  const y = (db: number) =>
    bottom - (Math.min(120, Math.max(0, db)) / 120) * (bottom - top);
  const visible = points.filter((point) => point.time >= start);
  const line = visible
    .map(
      (point, i) =>
        `${i ? "L" : "M"} ${x(point.time).toFixed(2)} ${y(point.db).toFixed(2)}`,
    )
    .join(" ");
  const area = visible.length
    ? `${line} L ${x(visible.at(-1)!.time)} ${bottom} L ${x(visible[0].time)} ${bottom} Z`
    : "";
  return (
    <div className="chart-wrap" ref={container}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={
          points.length
            ? t("最近 {seconds} 秒声量趋势，{source}", {
                seconds: range,
                source: t(demo ? "模拟数据" : "麦克风估算数据"),
              })
            : t("声量趋势图，等待开始测量")
        }
      >
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bcd89a" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#bcd89a" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 30, 60, 90, 120].map((db) => (
          <g key={db}>
            <text x="0" y={y(db) + 4} fill="#9ba095" fontSize="10">
              {db}
            </text>
            <line
              x1={left}
              y1={y(db)}
              x2={right}
              y2={y(db)}
              stroke="#edf0e9"
              strokeDasharray="3 5"
            />
          </g>
        ))}
        <line
          x1={left}
          y1={y(threshold)}
          x2={right}
          y2={y(threshold)}
          stroke="#d3b18b"
          strokeDasharray="5 5"
        />
        <rect
          x={right - 74}
          y={y(threshold) - 17}
          width="74"
          height="16"
          rx="4"
          fill="#fffdf8"
        />
        <text
          x={right - 3}
          y={y(threshold) - 6}
          textAnchor="end"
          fill="#b29672"
          fontSize="9"
        >
          {t("提醒值 {threshold} dB", { threshold })}
        </text>
        {area && <path d={area} fill="url(#chartFill)" />}
        {line && (
          <path
            d={line}
            fill="none"
            stroke="#719653"
            strokeWidth="2.3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {visible.length > 0 && (
          <circle
            cx={x(visible.at(-1)!.time)}
            cy={y(visible.at(-1)!.db)}
            r="4"
            fill="#6e9352"
            stroke="white"
            strokeWidth="2"
          />
        )}
        {Array.from({ length: tickCount }, (_, i) => (
          <text
            key={i}
            x={left + (i / (tickCount - 1)) * (right - left)}
            y={height - 10}
            textAnchor={
              i === tickCount - 1 ? "end" : i === 0 ? "start" : "middle"
            }
            fill="#93998c"
            fontSize="10"
          >
            {formatDuration(start + (i / (tickCount - 1)) * range)}
          </text>
        ))}
      </svg>
      {!points.length && (
        <div className="chart-empty">
          <AudioLines size={22} strokeWidth={1.4} />
          <span>{t("每一刻的声音，都有迹可循")}</span>
          <small>{t("开始监测后，实时趋势将在这里呈现")}</small>
        </div>
      )}
    </div>
  );
}
