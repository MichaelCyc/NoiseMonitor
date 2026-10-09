import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { App as NativeApp } from "@capacitor/app";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Download,
  Headphones,
  History,
  Info,
  Leaf,
  Languages,
  Menu,
  Mic,
  Pause,
  Play,
  Radio,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Square,
  Sun,
  Trash2,
  Volume2,
  Waves,
  Wind,
  X,
} from "lucide-react";
import Meter from "./components/Meter";
import TrendChart from "./components/TrendChart";
import { useSoundMeter } from "./hooks/useSoundMeter";
import { useLanguage } from "./hooks/useLanguage";
import { formatDuration, getSoundLevel } from "./lib/audio";
import {
  defaultSettings,
  exportRecords,
  readHistory,
  readSettings,
  saveLocal,
} from "./lib/storage";
import type { SessionRecord, Settings } from "./lib/storage";

type Page = "monitor" | "history" | "guide";
const pages = { monitor: "实时监测", history: "测量记录", guide: "使用指南" };
const references = [
  {
    icon: Leaf,
    name: "轻声的自然",
    example: "树叶沙沙、安静卧室",
    range: "0–35",
    className: "ref-quiet",
  },
  {
    icon: BookOpen,
    name: "专注的空间",
    example: "图书馆、安静办公室",
    range: "35–55",
    className: "ref-comfortable",
  },
  {
    icon: Volume2,
    name: "日常的热闹",
    example: "正常交谈、背景音乐",
    range: "55–70",
    className: "ref-moderate",
  },
  {
    icon: Waves,
    name: "繁忙的城市",
    example: "繁忙街道、吸尘器",
    range: "70–85",
    className: "ref-loud",
  },
  {
    icon: Headphones,
    name: "强烈的声音",
    example: "施工现场、大音量音乐",
    range: "85+",
    className: "ref-very-loud",
  },
];

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      className="modal"
      ref={ref}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-labelledby="modal-title"
    >
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <span className="eyebrow">MAKE IT YOURS</span>
            <h2 id="modal-title">{title}</h2>
          </div>
          <button
            className="icon-button"
            aria-label={t("关闭设置")}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

function SoundReference({ expanded = false }: { expanded?: boolean }) {
  const { t } = useLanguage();
  return (
    <section className={`card reference-card ${expanded ? "expanded" : ""}`}>
      <div className="section-heading">
        <div>
          <h2>
            {t("声音的刻度")}{" "}
            <span className="heading-note">{t("找到此刻声量的位置")}</span>
          </h2>
        </div>
        <span className="muted text-small">{t("环境声量参考")}</span>
      </div>
      <div className="reference-grid">
        {references.map(({ icon: Icon, name, example, range, className }) => (
          <div className={`reference-item ${className}`} key={name}>
            <div className="reference-top">
              <span className="reference-icon">
                <Icon size={20} strokeWidth={1.6} />
              </span>
              <span className="reference-range">
                {range}
                <small> dB</small>
              </span>
            </div>
            <h3>{t(name)}</h3>
            <p>{t(example)}</p>
            <div className="reference-color" />
          </div>
        ))}
      </div>
      {expanded && (
        <p className="reference-disclaimer">
          <Info size={15} />
          {t(
            "范围仅供感知参考；实际声量受距离、设备与环境影响，不能用于职业噪声或听力安全判定。",
          )}{" "}
        </p>
      )}
    </section>
  );
}

function RecordTable({
  records,
  onDelete,
}: {
  records: SessionRecord[];
  onDelete?: (record: SessionRecord) => void;
}) {
  const { t, locale } = useLanguage();
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>{t("测量时间")}</th>
            <th>{t("来源")}</th>
            <th>{t("时长")}</th>
            <th>{t("平均声量")}</th>
            <th>{t("最低 / 最高")}</th>
            <th>{t("环境状态")}</th>
            {onDelete && (
              <th>
                <span className="sr-only">{t("操作")}</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td>
                <span className="record-date">
                  {new Date(record.startedAt).toLocaleDateString(locale, {
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </span>
                <span className="record-time">
                  {new Date(record.startedAt).toLocaleTimeString(locale, {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </td>
              <td>
                <span
                  className={`source-tag ${record.source === "demo" ? "demo" : ""}`}
                >
                  {record.source === "demo" ? t("模拟演示") : t("麦克风")}
                </span>
              </td>
              <td className="numeric">{formatDuration(record.duration)}</td>
              <td className="record-average numeric">
                {record.average.toFixed(1)} <small>dB</small>
              </td>
              <td className="numeric muted">
                {record.min.toFixed(1)} / {record.max.toFixed(1)}{" "}
                <small>dB</small>
              </td>
              <td>
                <span
                  className={`level-label ${getSoundLevel(record.average).className}`}
                >
                  <i />
                  {t(getSoundLevel(record.average).label)}
                </span>
              </td>
              {onDelete && (
                <td>
                  <button
                    className="icon-button delete-button"
                    aria-label={t("删除 {time} 的记录", {
                      time: new Date(record.startedAt).toLocaleString(locale),
                    })}
                    onClick={() => onDelete(record)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const { t, language, locale, setLanguage } = useLanguage();
  const [page, setPage] = useState<Page>("monitor");
  const [settings, setSettings] = useState(readSettings);
  const [draft, setDraft] = useState<Settings>(settings);
  const [history, setHistory] = useState(readHistory);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [range, setRange] = useState(60);
  const [filter, setFilter] = useState<"all" | "mic" | "demo">("all");
  const [toast, setToast] = useState("");
  const [undoRecord, setUndoRecord] = useState<SessionRecord | null>(null);
  const [exporting, setExporting] = useState(false);
  const android = Capacitor.getPlatform() === "android";
  const meter = useSoundMeter(settings);
  const running = meter.status === "running";
  const paused = meter.status === "paused";
  const busy = meter.status !== "idle";
  const demo = meter.source === "demo";
  const overThreshold =
    meter.db !== null && meter.db >= settings.threshold && running;
  const filtered = history.filter(
    (record) => filter === "all" || record.source === filter,
  );

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast("");
      setUndoRecord(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!android) return;
    const listener = NativeApp.addListener("backButton", () => {
      if (settingsOpen) setSettingsOpen(false);
      else if (mobileNav) setMobileNav(false);
      else if (page !== "monitor") {
        setPage("monitor");
        window.scrollTo({ top: 0 });
      } else {
        meter.pause();
        void NativeApp.minimizeApp();
      }
    });
    return () => {
      void listener.then((handle) => handle.remove());
    };
  }, [android, settingsOpen, mobileNav, page, meter.pause]);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    setUndoRecord(null);
    try {
      const result = await exportRecords(filtered, language);
      if (result === "downloaded") setToast("CSV 文件已生成");
      if (result === "shared") setToast("已交给所选应用，请在该应用中完成保存");
    } catch {
      setToast("导出失败，请检查可用存储空间后重试");
    } finally {
      setExporting(false);
    }
  };

  const navigate = (next: Page) => {
    setPage(next);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const openSettings = () => {
    setDraft({ ...settings });
    setSettingsOpen(true);
  };
  const updateHistory = (records: SessionRecord[]) => {
    setHistory(records);
    return saveLocal("sonora-history", records);
  };
  const finish = () => {
    const record = meter.stop();
    if (record) {
      const saved = updateHistory([record, ...history].slice(0, 100));
      setUndoRecord(null);
      setToast(
        saved
          ? "本次测量已保存到记录"
          : "记录暂存在本页面，本地存储不可用，请及时导出",
      );
    }
  };
  const removeRecord = (record: SessionRecord) => {
    const saved = updateHistory(
      history.filter((item) => item.id !== record.id),
    );
    setUndoRecord(record);
    setToast(saved ? "测量记录已删除" : "页面记录已删除，但无法更新本地存储");
  };
  const date = new Date().toLocaleDateString(locale, {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div className="app-shell">
      {mobileNav && (
        <button
          className="nav-backdrop"
          onClick={() => setMobileNav(false)}
          aria-label={t("关闭导航")}
        />
      )}
      <aside className={`sidebar ${mobileNav ? "mobile-open" : ""}`}>
        <button
          className="brand"
          onClick={() => navigate("monitor")}
          aria-label={t("声境首页")}
        >
          <span className="brand-mark">
            <AudioLines size={26} strokeWidth={1.8} />
          </span>
          <span className="brand-name">
            {t("声境")}
            <small>{language === "en" ? "SOUND & CALM" : "SONORA"}</small>
          </span>
        </button>
        <div className="nav-label">{t("你的声音空间")}</div>
        <nav aria-label={t("主导航")}>
          {(
            [
              { id: "monitor", icon: Activity },
              { id: "history", icon: History },
              { id: "guide", icon: BookOpen },
            ] as const
          ).map(({ id, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${page === id ? "active" : ""}`}
              onClick={() => navigate(id)}
              aria-current={page === id ? "page" : undefined}
            >
              <Icon size={18} />
              <span>{t(pages[id])}</span>
              {id === "monitor" && (
                <span className={`nav-dot ${running ? "live" : ""}`} />
              )}
              {id === "history" && history.length > 0 && (
                <span className="nav-count">{history.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="quiet-note">
            <span className="note-leaf">
              <Leaf size={19} />
            </span>
            <h3>
              {t("留一点安静，")} <br />
              {t("给自己。")}{" "}
            </h3>
            <p>{t("感知声音，也关照生活。")}</p>
            <svg viewBox="0 0 180 70" fill="none" aria-hidden="true">
              <path d="M-20 65Q30 5 100 50T220 20" stroke="#afc38e" />
              <path d="M-20 75Q30 15 100 60T220 30" stroke="#c4d4a8" />
              <path d="M-20 85Q30 25 100 70T220 40" stroke="#d1ddbd" />
            </svg>
          </div>
          <button className="sidebar-settings" onClick={openSettings}>
            <Settings2 size={17} />
            <span>{t("偏好设置")}</span>
            <ChevronRight size={14} />
          </button>
          <div className="local-status">
            <span />
            <span>{t("声音留在本机，隐私始终在线")}</span>
          </div>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label={t("打开导航")}
              onClick={() => setMobileNav(true)}
            >
              <Menu size={21} />
            </button>
            <span>{t("工作空间")}</span>
            <ChevronRight size={13} />
            <strong>{t(pages[page])}</strong>
          </div>
          <div className="topbar-right">
            <button
              className="language-toggle"
              aria-label={
                language === "en" ? "切换为中文" : "Switch to English"
              }
              onClick={() => {
                const saved = setLanguage(language === "en" ? "zh-CN" : "en");
                if (!saved) {
                  setUndoRecord(null);
                  setToast(
                    "语言已切换，但本地存储不可用，下次启动可能需要重新选择。",
                  );
                }
              }}
            >
              <Languages size={16} />
              <span>{language === "en" ? t("中文") : "EN"}</span>
            </button>
            <span className="today">
              <Sun size={16} />
              {date}
            </span>
            <span className="topbar-divider" />
            <button
              className="icon-button"
              aria-label={t("打开使用指南")}
              onClick={() => navigate("guide")}
            >
              <CircleHelp size={19} />
            </button>
            <span className="avatar">
              S<span />
            </span>
          </div>
        </header>

        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span />
                {page === "monitor"
                  ? "A LITTLE QUIETER, A LITTLE BETTER"
                  : page === "history"
                    ? "EVERY MOMENT, REMEMBERED"
                    : "A BETTER WAY TO LISTEN"}
              </div>
              <h1>
                {page === "monitor"
                  ? t("感知声音，寻回宁静。")
                  : page === "history"
                    ? t("每一次聆听，都有记录。")
                    : t("从聆听开始，了解你的环境。")}
              </h1>
              <p>
                {page === "monitor"
                  ? t("实时了解身边的声量，为专注与生活找到舒适的空间。")
                  : page === "history"
                    ? t("回看环境声量的变化，发现属于你的安静时刻。")
                    : t("几个简单步骤，让看不见的声音清晰可见。")}
              </p>
            </div>
            {page === "monitor" ? (
              <button
                className="button button-outline heading-action"
                onClick={() => navigate("history")}
              >
                <History size={16} />
                {t("查看记录")} <ArrowUpRight size={15} />
              </button>
            ) : page === "history" ? (
              <button
                className="button button-outline heading-action"
                disabled={!filtered.length || exporting}
                onClick={() => void handleExport()}
              >
                <Download size={16} />
                {t("导出 CSV")}{" "}
              </button>
            ) : (
              <button
                className="button button-outline heading-action"
                onClick={() => navigate("monitor")}
              >
                {t("开始体验")} <ArrowUpRight size={16} />
              </button>
            )}
          </div>

          {page === "monitor" && (
            <>
              {meter.error && (
                <div className="notice error-notice" role="alert">
                  <Info size={18} />
                  <span>{t(meter.error)}</span>
                  <button
                    className="icon-button"
                    aria-label={t("关闭提示")}
                    onClick={meter.clearError}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              {demo && busy && (
                <div className="notice demo-notice">
                  <Radio size={17} />
                  <span>
                    {t(
                      "正在体验演示模式 · 所有数值均为模拟数据，未使用麦克风。",
                    )}{" "}
                  </span>
                  <button className="text-button" onClick={finish}>
                    {t("结束演示")} <ArrowRight size={14} />
                  </button>
                </div>
              )}
              <div className="monitor-grid">
                <section
                  className={`card meter-card ${overThreshold ? "threshold-exceeded" : ""}`}
                >
                  <div className="section-heading">
                    <h2>
                      <AudioLines size={18} />
                      {t("实时声量")}{" "}
                    </h2>
                    <span
                      className={`connection-badge ${running ? "connected" : ""} ${paused ? "paused" : ""}`}
                    >
                      <i />
                      {meter.status === "requesting"
                        ? t("连接中")
                        : paused
                          ? t("已暂停")
                          : running
                            ? demo
                              ? t("模拟演示")
                              : t("监测中")
                            : t("待机")}
                    </span>
                  </div>
                  <Meter
                    db={meter.db}
                    running={running}
                    paused={paused}
                    demo={demo}
                  />
                  <div className="meter-controls">
                    {running || paused ? (
                      <>
                        <button
                          className="button button-primary"
                          onClick={
                            paused ? () => void meter.resume() : meter.pause
                          }
                        >
                          {paused ? (
                            <Play size={17} fill="currentColor" />
                          ) : (
                            <Pause size={17} fill="currentColor" />
                          )}
                          {paused ? t("继续监测") : t("暂停监测")}
                        </button>
                        <button
                          className="button stop-button"
                          aria-label={t("结束并保存测量")}
                          title={t("结束并保存")}
                          onClick={finish}
                        >
                          <Square size={15} fill="currentColor" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="button button-primary"
                          onClick={() => void meter.start("mic")}
                          disabled={meter.status === "requesting"}
                        >
                          <Mic size={18} />
                          {meter.status === "requesting"
                            ? t("等待麦克风授权…")
                            : t("开始监测")}
                        </button>
                        <button
                          className="button settings-button"
                          aria-label={
                            meter.status === "requesting"
                              ? t("取消连接麦克风")
                              : t("测量设置")
                          }
                          onClick={
                            meter.status === "requesting"
                              ? finish
                              : openSettings
                          }
                        >
                          {meter.status === "requesting" ? (
                            <X size={18} />
                          ) : (
                            <SlidersHorizontal size={18} />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                  <div className="meter-footnote">
                    {busy ? (
                      <>
                        <Clock3 size={13} />
                        <span>{t("本次测量")}</span>
                        <strong className="numeric">
                          {formatDuration(meter.duration)}
                        </strong>
                        <span className="tiny-dot" />
                        <span>
                          {paused
                            ? t("声音采集已暂停")
                            : meter.status === "requesting"
                              ? t("等待授权")
                              : demo
                                ? t("模拟信号")
                                : t("实时采集中")}
                        </span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={13} />
                        <span>{t("音频仅在本机处理")}</span>
                        <span className="tiny-dot" />
                        <button onClick={() => void meter.start("demo")}>
                          {t("试用演示")} <ArrowUpRight size={11} />
                        </button>
                      </>
                    )}
                  </div>
                </section>

                <div className="monitor-right">
                  <section className="card trend-card">
                    <div className="section-heading">
                      <div>
                        <h2>
                          {t("声量趋势")}
                          <span className="live-label">LIVE</span>
                        </h2>
                        <p>{t("捕捉声音的每一次起伏")}</p>
                      </div>
                      <div className="segmented" aria-label={t("趋势时间范围")}>
                        {[30, 60].map((value) => (
                          <button
                            key={value}
                            onClick={() => setRange(value)}
                            className={range === value ? "selected" : ""}
                            aria-pressed={range === value}
                          >
                            {t("{seconds} 秒", { seconds: value })}
                          </button>
                        ))}
                      </div>
                    </div>
                    <TrendChart
                      points={meter.points}
                      duration={meter.duration}
                      threshold={settings.threshold}
                      range={range}
                      demo={demo}
                    />
                    <div className="chart-footer">
                      <span>
                        <i className="chart-legend" />
                        {demo && meter.db !== null
                          ? t("模拟声量")
                          : t("环境声量")}
                      </span>
                      <span>
                        {t("最近 {seconds} 秒", { seconds: range })}{" "}
                        <span className="tiny-dot" /> {t("单位 dB")}
                      </span>
                    </div>
                  </section>
                  <div className="stats-grid">
                    {[
                      {
                        title: t("平均声量"),
                        value: meter.average,
                        icon: AudioLines,
                        kind: "average",
                        foot: t("本次能量平均"),
                      },
                      {
                        title: t("最低声量"),
                        value: meter.min,
                        icon: ArrowDownLeft,
                        kind: "minimum",
                        foot: t("捕捉安静时刻"),
                      },
                      {
                        title: t("最高声量"),
                        value: meter.max,
                        icon: ArrowUpRight,
                        kind: "maximum",
                        foot: t("关注声量高点"),
                      },
                    ].map(({ title, value, icon: Icon, kind, foot }) => (
                      <section className={`card stat-card ${kind}`} key={title}>
                        <div className="stat-title">
                          {title}
                          <Icon size={17} />
                        </div>
                        <div className="stat-value numeric">
                          {value === null ? "—" : value.toFixed(1)}
                          <span>dB</span>
                        </div>
                        <p>{foot}</p>
                      </section>
                    ))}
                  </div>
                </div>
              </div>

              <section
                className={`environment-strip ${overThreshold ? "is-loud" : ""}`}
              >
                <div className="environment-icon">
                  {overThreshold ? (
                    <Bell size={22} />
                  ) : (
                    <Wind size={24} strokeWidth={1.5} />
                  )}
                </div>
                <div>
                  <h3>
                    {overThreshold
                      ? t("当前声量已超过 {threshold} dB 提醒值", {
                          threshold: settings.threshold,
                        })
                      : running
                        ? t("给生活调低一点音量。")
                        : t("好的环境，从听见开始。")}
                  </h3>
                  <p>
                    {overThreshold
                      ? t(
                          "可以尝试远离声源，或降低设备音量。此提醒依据估算值。",
                        )
                      : t(
                          "安静的空间，让思绪更清晰。开启监测，感受你与环境的距离。",
                        )}
                  </p>
                </div>
                <button className="text-button" onClick={openSettings}>
                  {t("提醒设置")} <ArrowRight size={15} />
                </button>
              </section>

              <SoundReference />

              <section className="card recent-card">
                <div className="section-heading">
                  <h2>
                    {t("最近的聆听")}{" "}
                    <span className="heading-note">
                      {t("你的环境声量足迹")}
                    </span>
                  </h2>
                  <button
                    className="text-button"
                    onClick={() => navigate("history")}
                  >
                    {t("全部记录")} <ArrowRight size={14} />
                  </button>
                </div>
                {history.length ? (
                  <RecordTable records={history.slice(0, 3)} />
                ) : (
                  <div className="empty-recent">
                    <span className="empty-icon">
                      <History size={22} strokeWidth={1.5} />
                    </span>
                    <div>
                      <h3>{t("安静的故事，等待开始")}</h3>
                      <p>{t("结束一次测量后，记录会自动保存在这里。")}</p>
                    </div>
                    <span className="empty-decor">YOUR NEXT QUIET MOMENT</span>
                  </div>
                )}
              </section>
            </>
          )}

          {page === "history" && (
            <>
              <div className="history-overview">
                <div className="card history-summary">
                  <History size={22} />
                  <div>
                    <span>{t("已保存测量")}</span>
                    <strong>
                      {history.length}
                      <small>{t(" 次")}</small>
                    </strong>
                  </div>
                </div>
                <div className="card history-summary">
                  <Mic size={22} />
                  <div>
                    <span>{t("麦克风测量")}</span>
                    <strong>
                      {
                        history.filter((record) => record.source === "mic")
                          .length
                      }
                      <small>{t(" 次")}</small>
                    </strong>
                  </div>
                </div>
                <div className="card history-summary">
                  <Clock3 size={22} />
                  <div>
                    <span>{t("累计测量时长")}</span>
                    <strong className="numeric">
                      {formatDuration(
                        history.reduce(
                          (sum, record) => sum + record.duration,
                          0,
                        ),
                      )}
                    </strong>
                  </div>
                </div>
              </div>
              <section className="card history-card">
                <div className="section-heading">
                  <h2>
                    {t("测量记录")}{" "}
                    <span className="count-badge">{filtered.length}</span>
                  </h2>
                  <div className="segmented">
                    {(
                      [
                        { id: "all", title: t("全部") },
                        { id: "mic", title: t("麦克风") },
                        { id: "demo", title: t("演示") },
                      ] as const
                    ).map(({ id, title }) => (
                      <button
                        key={id}
                        className={filter === id ? "selected" : ""}
                        onClick={() => setFilter(id)}
                        aria-pressed={filter === id}
                      >
                        {title}
                      </button>
                    ))}
                  </div>
                </div>
                {filtered.length ? (
                  <RecordTable records={filtered} onDelete={removeRecord} />
                ) : (
                  <div className="large-empty">
                    <span className="large-empty-icon">
                      <History size={35} strokeWidth={1.2} />
                    </span>
                    <h2>
                      {history.length
                        ? t("这里还没有这类记录")
                        : t("留住每一个安静时刻")}
                    </h2>
                    <p>
                      {t("完成并结束一次测量，环境声量记录就会出现在这里。")}
                    </p>
                    <button
                      className="button button-primary"
                      onClick={() => navigate("monitor")}
                    >
                      <Mic size={17} />
                      {t("去监测声音")}{" "}
                    </button>
                  </div>
                )}
                <div className="history-note">
                  <ShieldCheck size={15} />
                  {android
                    ? t(
                        "仅在此设备保存最近 100 条摘要记录，不保存原始音频。清除应用数据或卸载应用会移除记录。",
                      )
                    : t(
                        "仅在当前浏览器保存最近 100 条摘要记录，不保存原始音频。清除浏览器数据会移除记录。",
                      )}
                </div>
              </section>
            </>
          )}

          {page === "guide" && (
            <>
              <div className="guide-steps">
                {[
                  {
                    number: "01",
                    icon: Mic,
                    title: t("开启你的麦克风"),
                    description: android
                      ? t(
                          "点击「开始监测」，在系统提示中允许录制音频权限。麦克风只用于计算声量，不会保存录音。让麦克风远离遮挡和摩擦。",
                        )
                      : t(
                          "点击「开始监测」，在浏览器提示中允许麦克风权限。让麦克风远离衣物遮挡和手部摩擦。",
                        ),
                  },
                  {
                    number: "02",
                    icon: Activity,
                    title: t("观察环境的声量"),
                    description: t(
                      "大号读数显示当前估算分贝，趋势图保留最近 60 秒。暂停后可以继续，切换到后台会自动暂停。",
                    ),
                  },
                  {
                    number: "03",
                    icon: History,
                    title: t("记录你的声音空间"),
                    description: t(
                      "点击方形结束按钮保存测量摘要。在「测量记录」查看最低、最高与平均声量，也可导出 CSV。",
                    ),
                  },
                ].map(({ number, icon: Icon, title, description }) => (
                  <section className="card guide-step" key={number}>
                    <div>
                      <span className="guide-step-icon">
                        <Icon size={23} />
                      </span>
                      <span className="step-number">{number}</span>
                    </div>
                    <h2>{title}</h2>
                    <p>{description}</p>
                  </section>
                ))}
              </div>
              <SoundReference expanded />
              <section className="card guide-details">
                <div className="section-heading">
                  <h2>
                    <SlidersHorizontal size={19} />
                    {t("关于读数与校准")}{" "}
                  </h2>
                  <button className="text-button" onClick={openSettings}>
                    {t("打开设置")} <ArrowUpRight size={15} />
                  </button>
                </div>
                <div className="guide-detail-grid">
                  <div>
                    <h3>{t("这里的分贝数代表什么？")}</h3>
                    <p>
                      {t(
                        "应用读取麦克风的数字幅度（dBFS），加上设备参考偏移后得到估算分贝。默认偏移为 94 dB，未经设备校准，不能视为准确的声压级，也不是 A 计权 dB(A)。",
                      )}{" "}
                    </p>
                  </div>
                  <div>
                    <h3>{t("如何让数值更接近实际？")}</h3>
                    <p>
                      {t(
                        "在稳定的声音环境下，把专业声级计与麦克风放在同一位置。新参考偏移 = 当前偏移 + 声级计读数 − 本应用读数。在设置中输入新值，再重新测量。",
                      )}{" "}
                    </p>
                  </div>
                  <div>
                    <h3>{t("为什么不同设备的读数不同？")}</h3>
                    <p>
                      {t(
                        "麦克风灵敏度、系统增益和驱动音频处理都会影响结果。应用会请求关闭自动增益、降噪与回声消除，但部分设备仍可能自行处理音频。更换设备后需要重新校准。",
                      )}{" "}
                    </p>
                  </div>
                  <div>
                    <h3>{t("音频会被保存或上传吗？")}</h3>
                    <p>
                      {android
                        ? t(
                            "不会。音频在设备本地实时计算，不录音、不上传。测量摘要和偏好设置保存在此设备，应用无需联网即可运行。切换到后台或锁屏会自动暂停。",
                          )
                        : t(
                            "不会。音频在设备本地实时计算，不录音、不上传。仅测量摘要和偏好设置保存在当前浏览器。请在 localhost 或 HTTPS 下使用；后台运行会自动暂停。",
                          )}
                    </p>
                  </div>
                </div>
              </section>
            </>
          )}

          <footer className="footer">
            <span>
              <ShieldCheck size={14} />
              {t("本地处理，安心聆听")}{" "}
            </span>
            <p>
              {t("测量结果为估算值，仅供环境声量参考，不能替代专业声级计。")}
            </p>
            <span className="footer-brand">
              SONORA <i>·</i> {language === "en" ? "SOUND & CALM" : t("声境")}
            </span>
          </footer>
        </main>
      </div>

      {settingsOpen && (
        <Modal
          title={t("让测量更适合你")}
          onClose={() => setSettingsOpen(false)}
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (busy) return;
              setSettings(draft);
              const saved = saveLocal("sonora-settings", draft);
              setSettingsOpen(false);
              setUndoRecord(null);
              setToast(
                saved ? "测量设置已保存" : "设置已应用，但本地存储不可用",
              );
            }}
          >
            <div className="setting-field language-field">
              <label htmlFor="language">
                <span>
                  <Languages size={17} />
                  {t("界面语言")}
                </span>
                <select
                  id="language"
                  value={language}
                  onChange={(event) => {
                    const saved = setLanguage(
                      event.target.value === "en" ? "en" : "zh-CN",
                    );
                    if (!saved) {
                      setUndoRecord(null);
                      setToast(
                        "语言已切换，但本地存储不可用，下次启动可能需要重新选择。",
                      );
                    }
                  }}
                >
                  <option value="zh-CN" lang="zh-CN">
                    简体中文
                  </option>
                  <option value="en" lang="en">
                    English
                  </option>
                </select>
              </label>
              <p>{t("语言切换立即生效，不影响正在进行的测量。")}</p>
            </div>
            {busy && (
              <div className="notice settings-notice">
                <Info size={17} />
                {t(
                  "请先结束本次测量，再修改设置，保证同一次测量使用一致的参数。",
                )}{" "}
              </div>
            )}
            <fieldset disabled={busy}>
              <div className="setting-field">
                <label htmlFor="threshold">
                  <span>
                    <Bell size={17} />
                    {t("声量提醒")}{" "}
                  </span>
                  <strong>
                    {draft.threshold} <small>dB</small>
                  </strong>
                </label>
                <input
                  id="threshold"
                  type="range"
                  min="40"
                  max="100"
                  step="5"
                  value={draft.threshold}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      threshold: Number(event.target.value),
                    })
                  }
                />
                <div className="range-labels">
                  <span>{t("40 dB · 较安静")}</span>
                  <span>{t("100 dB · 较响亮")}</span>
                </div>
                <p>{t("超过此估算值时，在页面中显示提醒；不会播放提示音。")}</p>
              </div>
              <div className="setting-field">
                <label htmlFor="offset">
                  <span>
                    <SlidersHorizontal size={17} />
                    {t("校准参考偏移")}{" "}
                  </span>
                  <span className="number-input">
                    <input
                      id="offset"
                      type="number"
                      required
                      min="40"
                      max="140"
                      step="0.1"
                      value={Number.isNaN(draft.offset) ? "" : draft.offset}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          offset: event.target.valueAsNumber,
                        })
                      }
                    />
                    <small>dB</small>
                  </span>
                </label>
                <p>
                  {t(
                    "估算分贝 = 麦克风 dBFS + 参考偏移。默认 94 dB，需要与专业声级计对照校准。",
                  )}{" "}
                </p>
                {meter.dbfs !== null && (
                  <div className="raw-reading">
                    {t("最近数字电平")}{" "}
                    <strong>{meter.dbfs.toFixed(1)} dBFS</strong>
                    <span>{demo ? t("模拟数据") : t("麦克风数据")}</span>
                  </div>
                )}
              </div>
              <div className="setting-field">
                <label>
                  <span>
                    <Activity size={17} />
                    {t("读数响应速度")}{" "}
                  </span>
                </label>
                <div className="response-options">
                  <button
                    type="button"
                    className={draft.response === "slow" ? "selected" : ""}
                    onClick={() => setDraft({ ...draft, response: "slow" })}
                    aria-pressed={draft.response === "slow"}
                  >
                    <span>
                      {t("平稳")} <small>Slow · 1 s</small>
                    </span>
                    <p>{t("适合观察环境声量")}</p>
                    {draft.response === "slow" && <Check size={15} />}
                  </button>
                  <button
                    type="button"
                    className={draft.response === "fast" ? "selected" : ""}
                    onClick={() => setDraft({ ...draft, response: "fast" })}
                    aria-pressed={draft.response === "fast"}
                  >
                    <span>
                      {t("灵敏")} <small>Fast · 125 ms</small>
                    </span>
                    <p>{t("适合捕捉短时变化")}</p>
                    {draft.response === "fast" && <Check size={15} />}
                  </button>
                </div>
              </div>
            </fieldset>
            <div className="device-info">
              <Mic size={17} />
              <div>
                <span>{t("输入设备")}</span>
                <strong>{t(meter.device)}</strong>
              </div>
              <span className="device-local">{t("本机处理")}</span>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="text-button"
                disabled={busy}
                onClick={() => setDraft({ ...defaultSettings })}
              >
                {t("恢复默认")}{" "}
              </button>
              <button
                className="button button-primary"
                type="submit"
                disabled={busy}
              >
                <Check size={17} />
                {t("保存设置")}{" "}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {toast && (
        <div className="toast" role="status">
          <span className="toast-icon">
            <Check size={16} />
          </span>
          <span>{t(toast)}</span>
          {undoRecord && (
            <button
              onClick={() => {
                const saved = updateHistory(
                  [...history, undoRecord]
                    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
                    .slice(0, 100),
                );
                setUndoRecord(null);
                setToast(
                  saved ? "记录已恢复" : "记录已恢复到页面，但无法更新本地存储",
                );
              }}
            >
              {t("撤销")}{" "}
            </button>
          )}
          <button
            aria-label={t("关闭通知")}
            onClick={() => {
              setToast("");
              setUndoRecord(null);
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
