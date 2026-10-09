import { Leaf, Radio } from "lucide-react";
import { getSoundLevel } from "../lib/audio";
import { useLanguage } from "../hooks/useLanguage";

function polar(radius: number, angle: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: 200 + radius * Math.cos(radians),
    y: 188 + radius * Math.sin(radians),
  };
}
function arc(radius: number, start: number, end: number) {
  const a = polar(radius, start),
    b = polar(radius, end);
  return `M ${a.x} ${a.y} A ${radius} ${radius} 0 ${end - start > 180 ? 1 : 0} 1 ${b.x} ${b.y}`;
}

export default function Meter({
  db,
  running,
  paused,
  demo,
}: {
  db: number | null;
  running: boolean;
  paused: boolean;
  demo: boolean;
}) {
  const { t } = useLanguage();
  const level = db === null ? null : getSoundLevel(db);
  const angle = 145 + (Math.min(120, Math.max(0, db ?? 0)) / 120) * 250;
  const needle = polar(151, angle);
  return (
    <div className={`meter ${running ? "is-running" : ""}`}>
      <svg className="meter-svg" viewBox="0 0 400 340" aria-hidden="true">
        <defs>
          <linearGradient id="meterGradient" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#b5cbaa" />
            <stop offset="45%" stopColor="#b6cf78" />
            <stop offset="73%" stopColor="#dac78c" />
            <stop offset="100%" stopColor="#d5a194" />
          </linearGradient>
        </defs>
        <path
          d={arc(151, 145, 395)}
          fill="none"
          stroke="#f0f1eb"
          strokeWidth="17"
          strokeLinecap="round"
        />
        <path
          d={arc(151, 145, 395)}
          fill="none"
          stroke="url(#meterGradient)"
          strokeWidth="17"
          strokeLinecap="round"
          opacity={db === null ? 0.6 : 1}
        />
        {Array.from({ length: 61 }, (_, i) => {
          const a = 145 + (i / 60) * 250;
          const major = i % 10 === 0;
          const from = polar(major ? 122 : 127, a),
            to = polar(134, a);
          return (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={major ? "#99a094" : "#d8ddd3"}
              strokeWidth={major ? 1.5 : 1}
            />
          );
        })}
        {[0, 20, 40, 60, 80, 100, 120].map((value) => {
          const point = polar(181, 145 + (value / 120) * 250);
          return (
            <text
              key={value}
              x={point.x}
              y={point.y + 4}
              textAnchor="middle"
              fill="#92988c"
              fontSize="11"
              fontFamily="Arial, sans-serif"
            >
              {value}
            </text>
          );
        })}
        {db !== null && (
          <g className="meter-needle">
            <circle cx={needle.x} cy={needle.y} r="12" fill="#fff" />
            <circle cx={needle.x} cy={needle.y} r="7" fill="#365443" />
          </g>
        )}
      </svg>
      <div className="meter-reading">
        <span className="meter-caption">
          {paused
            ? t("测量已暂停")
            : !running && db !== null
              ? t("本次最终读数")
              : t("当前环境声量")}
        </span>
        <div className="db-value">
          {db === null ? (
            <span className="idle-value">—</span>
          ) : (
            <>
              {Math.floor(db)}
              <span className="decimal">.{Math.floor(db * 10) % 10}</span>
            </>
          )}
        </div>
        <span className="db-unit">
          {demo && db !== null ? t("dB · 模拟数值") : t("dB · 估算分贝")}
        </span>
        <div className={`sound-status ${level?.className || ""}`}>
          {db === null ? <Radio size={14} /> : <Leaf size={14} />}
          {t(level?.label || "准备聆听")}
        </div>
      </div>
      <p className="meter-description">
        {t(level?.description || "开启麦克风，感知此刻的环境")}
      </p>
    </div>
  );
}
