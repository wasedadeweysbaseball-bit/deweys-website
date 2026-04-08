"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { client } from "../libs/client";
import "@fortawesome/fontawesome-free/css/all.min.css";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export default function Home() {
  const [activities, setActivities] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [results, setResults] = useState([]);
  const [info, setInfo] = useState({ memberCount: "---", beginnerRatio: "---", universityCount: "---" });
  const [openFaq, setOpenFaq] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setSelectedActivity(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [act, sch, faq, inf, res] = await Promise.all([
          client.get({ endpoint: "activities" }).catch(() => ({ contents: [] })),
          client.get({ endpoint: "schedules" }).catch(() => ({ contents: [] })),
          client.get({ endpoint: "faq" }).catch(() => ({ contents: [] })),
          client.get({ endpoint: "info" }).catch(() => ({ contents: [] })),
          client.get({ endpoint: "results" }).catch(() => ({ contents: [] })),
        ]);
        setActivities(act.contents || []);
        setSchedules(sch.contents || []);
        setFaqs(faq.contents || []);
        setResults(res.contents || []);
        if (inf && inf.contents && inf.contents.length > 0) {
          const d = inf.contents[0];
          setInfo({
            memberCount: d.memberCount || "---",
            beginnerRatio: d.beginnerRatio || "---",
            universityCount: d.universityCount || "---",
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const theme = {
    bg: "#0d1117",
    card: "#161b22",
    blue: "#3B82F6",
    blueHover: "#60A5FA",
    white: "#ffffff",
    muted: "#7d8590",
    border: "#21262d",
  };

  const SectionLabel = ({ children }) => (
    <span style={{
      display: "inline-block",
      padding: "4px 14px",
      background: theme.card,
      border: `1px solid ${theme.border}`,
      borderRadius: "999px",
      fontSize: "0.72rem",
      color: theme.muted,
      marginBottom: "1rem",
      letterSpacing: "0.05em",
    }}>{children}</span>
  );

  const BlueButton = ({ href, children, style }) => (
    <a href={href} style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "10px",
      background: theme.blue,
      color: theme.white,
      padding: "0.75rem 1.8rem",
      borderRadius: "999px",
      fontWeight: "700",
      fontSize: "0.9rem",
      textDecoration: "none",
      transition: "background 0.2s",
      cursor: "pointer",
      ...(style || {}),
    }}
    onMouseEnter={e => e.currentTarget.style.background = theme.blueHover}
    onMouseLeave={e => e.currentTarget.style.background = theme.blue}
    >
      {children}
      <span style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem" }}>○</span>
    </a>
  );

  const DarkButton = ({ href, children, style }) => (
    <a href={href} style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "10px",
      background: "#2a2a2a",
      color: theme.white,
      padding: "0.75rem 1.8rem",
      borderRadius: "999px",
      fontWeight: "700",
      fontSize: "0.9rem",
      textDecoration: "none",
      border: `1px solid ${theme.border}`,
      ...(style || {}),
    }}>
      {children}
      <span style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem" }}>○</span>
    </a>
  );

  const getBadgeColor = (badge) => {
    if (!badge) return { bg: "#1a2f1a", color: "#4ade80" };
    if (badge.includes("中止")) return { bg: "#2f1a1a", color: "#f87171" };
    if (badge.includes("試合")) return { bg: "#1a2040", color: theme.blue };
    if (badge.includes("合宿") || badge.includes("大会") || badge.includes("イベント")) return { bg: "#2a1a3a", color: "#a78bfa" };
    return { bg: "#1a2f1a", color: "#4ade80" };
  };

  return (
    <main style={{ color: theme.white, background: theme.bg, fontFamily: "'Inter', 'Noto Sans JP', sans-serif", overflowX: "hidden" }}>

      <AnimatePresence>
        {isLoading && (
          <motion.div key="loader" exit={{ opacity: 0 }} transition={{ duration: 0.4 }} style={{ position: "fixed", inset: 0, zIndex: 9999, background: theme.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.4, repeat: Infinity }} style={{ fontSize: "1.6rem", fontWeight: "900", color: theme.white, letterSpacing: "0.25em" }}>DEWEYS</motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>

          {/* NAV */}
          <nav style={{
            position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
            zIndex: 1000, width: "calc(100% - 40px)", maxWidth: "1100px",
            background: "rgba(13,17,23,0.92)",
            borderRadius: "999px",
            padding: "0.6rem 1.2rem",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            border: `1px solid ${theme.border}`,
            backdropFilter: "blur(12px)",
          }}>
            <div style={{ fontWeight: "900", fontSize: "1rem", color: theme.white, letterSpacing: "0.1em" }}>DEWEYS</div>
            <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
              <BlueButton href="https://www.instagram.com/waseda_deweys" style={{ padding: "0.5rem 1.2rem", fontSize: "0.8rem" }}>
                Instagram
              </BlueButton>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ width: 38, height: 38, borderRadius: "50%", background: theme.blue, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: theme.white, fontSize: "1rem" }}>
                <i className={menuOpen ? "fas fa-times" : "fas fa-bars"}></i>
              </button>
            </div>
          </nav>

          {/* Mobile Menu */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)", zIndex: 999, width: "calc(100% - 40px)", maxWidth: "1100px", background: "rgba(13,17,23,0.97)", borderRadius: "20px", border: `1px solid ${theme.border}`, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.8rem", backdropFilter: "blur(12px)" }}>
                {["#about", "#results", "#schedule", "#gallery", "#faq", "#contact"].map((href, i) => (
                  <a key={i} href={href} onClick={() => setMenuOpen(false)} style={{ color: theme.white, textDecoration: "none", fontSize: "1.1rem", fontWeight: "700", padding: "0.5rem 0", borderBottom: `1px solid ${theme.border}` }}>
                    {["ABOUT", "試合結果", "スケジュール", "ギャラリー", "FAQ", "CONTACT"][i]}
                  </a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* HERO */}
          <section style={{ minHeight: "100vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
              <Image
                src="/top.jpg" alt="Hero" fill priority
                style={{ objectFit: "cover", filter: "brightness(0.4) grayscale(80%) blur(12px)", transform: "scale(1.1)" }}
                unoptimized
              />
              <div style={{
                position: "absolute", inset: 0,
                background: `repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 6px),
                             repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 6px)`,
              }} />
            </div>
            <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "6rem 2rem 4rem", width: "100%", maxWidth: "680px", margin: "0 auto" }}>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                style={{ fontSize: "clamp(3rem, 10vw, 6rem)", fontWeight: "900", lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 0.3rem", whiteSpace: "nowrap" }}>
                野球やろうぜ！<br />
                <span style={{ color: theme.blue }}>W.DEWEYS</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                style={{ fontSize: "0.85rem", lineHeight: 1.85, color: "rgba(255,255,255,0.72)", margin: "1.4rem auto 2rem", maxWidth: "400px" }}>
                創立38年目を迎える早稲田大学軟式野球サークルDeweys（デューイズ）です！<br />
                毎週水曜（土曜）活動中。野球も遊びも全力で！<br />
                高校野球経験者から未経験者まで男女幅広く所属しています（インカレ歓迎）。
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{ display: "flex", justifyContent: "center", borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: "1.5rem", maxWidth: "420px", margin: "0 auto" }}>
                {[
                  { label: "部員数", value: `${info.memberCount}名`, color: theme.white },
                  { label: "初心者割合", value: `${info.beginnerRatio}%`, color: theme.blue },
                  { label: "所属大学数", value: `${info.universityCount}校以上`, color: theme.white },
                ].map((s, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center", borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.12)" : "none", padding: "0 1rem" }}>
                    <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", marginBottom: "0.3rem" }}>{s.label}</div>
                    <div style={{ fontSize: "clamp(1rem, 3vw, 1.25rem)", fontWeight: "900", color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* ABOUT */}
          <section id="about" style={{ padding: "6rem 5%", background: theme.bg }}>
            <motion.div initial="hidden" whileInView="visible" variants={fadeInUp} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: "3rem" }}>
              <SectionLabel>38年の歴史とコミュニティ</SectionLabel>
              <h2 style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", fontWeight: "900", margin: "0.5rem 0 1rem", lineHeight: 1.2 }}>DEWEYSってどんなサークル？</h2>
              <p style={{ color: theme.muted, maxWidth: "560px", margin: "0 auto", lineHeight: 1.8, fontSize: "0.95rem" }}>
                創立38年。早大を中心にインカレ歓迎の軟式野球サークルです。高校球児から人生初グローブまで、全力で楽しんでいます。初心者大歓迎。男女問わず。週2回の活動で、野球の技術も人間関係も全力で成長できます。
              </p>
            </motion.div>
            <motion.div
              initial="hidden" whileInView="visible" variants={fadeInUp} viewport={{ once: true }}
              style={{ background: theme.card, borderRadius: "24px", padding: "2.5rem", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", maxWidth: "700px", margin: "0 auto 2.5rem", border: `1px solid ${theme.border}` }}>
              {[
                { label: "部員数", value: `${info.memberCount}名`, color: theme.white },
                { label: "初心者割合", value: `${info.beginnerRatio}%`, color: theme.blue },
                { label: "所属大学数", value: `${info.universityCount}校以上`, color: theme.white },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: "900", color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "0.7rem", color: theme.muted, marginTop: "0.3rem" }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
            <div style={{ textAlign: "center" }}>
              <BlueButton href="https://lin.ee/srY0QB3">メンバーになる</BlueButton>
            </div>
          </section>

          {/* RESULTS */}
          <section id="results" style={{ padding: "6rem 5%", background: "#0a0f1a" }}>
            <motion.div initial="hidden" whileInView="visible" variants={fadeInUp} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: "3rem" }}>
              <SectionLabel>試合結果</SectionLabel>
              <h2 style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", fontWeight: "900", margin: "0.5rem 0 1rem" }}>直近の試合結果</h2>
              <p style={{ color: theme.muted, fontSize: "0.9rem" }}>DEWEYSの最近の活動を紹介します。毎週新しい試合に挑戦中！</p>
            </motion.div>
            <div style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "1rem", scrollSnapType: "x mandatory" }}>
              {results.length > 0 ? results.map((game) => {
                const isWin = Number(game.myScore) > Number(game.opScore);
                const isDraw = Number(game.myScore) === Number(game.opScore);
                return (
                  <motion.div
                    key={game.id}
                    initial="hidden" whileInView="visible" variants={fadeInUp} viewport={{ once: true }}
                    style={{
                      minWidth: "clamp(260px, 80vw, 380px)",
                      scrollSnapAlign: "center",
                      background: theme.card,
                      borderRadius: "20px",
                      border: `1px solid ${theme.border}`,
                      borderLeft: `4px solid ${isWin ? theme.blue : isDraw ? "#555" : "#ef4444"}`,
                      padding: "2rem",
                      flexShrink: 0,
                    }}>
                    <div style={{ fontSize: "0.72rem", color: theme.muted, marginBottom: "0.5rem" }}>
                      {new Date(game.date).toLocaleDateString("ja-JP").replace(/\//g, ".")}
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1rem" }}>vs {game.opponent}</div>
                    <div style={{ fontSize: "3rem", fontWeight: "900", fontStyle: "italic", lineHeight: 1, color: isWin ? theme.blue : theme.white }}>
                      {game.myScore} - {game.opScore}
                    </div>
                    <div style={{ marginTop: "0.8rem" }}>
                      <span style={{
                        display: "inline-block", padding: "3px 14px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: "900",
                        background: isWin ? `${theme.blue}22` : isDraw ? "#55555522" : "#ef444422",
                        color: isWin ? theme.blue : isDraw ? "#888" : "#ef4444",
                        border: `1px solid ${isWin ? theme.blue : isDraw ? "#555" : "#ef4444"}44`,
                      }}>
                        {isWin ? "WIN" : isDraw ? "DRAW" : "LOSE"}
                      </span>
                    </div>
                  </motion.div>
                );
              }) : (
                <div style={{ color: theme.muted, padding: "2rem", textAlign: "center", width: "100%" }}>試合結果はまだありません。</div>
              )}
            </div>
          </section>

          {/* SCHEDULE CALENDAR */}
          <section id="schedule" style={{ padding: "6rem 5%", background: theme.bg }}>
            <motion.div initial="hidden" whileInView="visible" variants={fadeInUp} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: "3rem" }}>
              <SectionLabel>スケジュール</SectionLabel>
              <h2 style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", fontWeight: "900", margin: "0.5rem 0 1rem" }}>活動予定</h2>
              <p style={{ color: theme.muted, fontSize: "0.9rem" }}>次の活動と試合スケジュール。見学大歓迎！</p>
            </motion.div>

            {(() => {
              const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
              const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
              const weeks = ["日", "月", "火", "水", "木", "金", "土"];

              const scheduleMap = {};

              // "M/D" 形式の日付文字列をパースして {month(0-indexed), day} の配列を返す
              const parseDateTokens = (dateStr) => {
                const results = [];
                if (!dateStr) return results;

                // 範囲（〜）を含む場合は開始日と終了日を両方登録
                // 例: "3/11〜3/12", "3/18 17:00〜19:00"
                const parts = dateStr.split(/[〜～]/);

                parts.forEach((part, idx) => {
                  // "3/4 (水)" や "3/18 17:00" など → 最初の M/D だけ取る
                  const match = part.trim().match(/^(\d{1,2})\/(\d{1,2})/);
                  if (match) {
                    const m = parseInt(match[1]) - 1;
                    const d = parseInt(match[2]);
                    results.push({ m, d });
                  } else if (idx > 0) {
                    // "〜19:00" のように日付がない末尾は無視
                  }
                });

                return results;
              };

              schedules.forEach(item => {
                const tokens = parseDateTokens(item.date);
                tokens.forEach(({ m, d }) => {
                  // 開始〜終了の範囲はすべての日にマップ
                  const key = `${calYear}-${m}-${d}`;
                  if (!scheduleMap[key]) scheduleMap[key] = [];
                  // 重複登録を防ぐ
                  if (!scheduleMap[key].find(e => e.id === item.id)) {
                    scheduleMap[key].push(item);
                  }
                });
              });

              const now = new Date();
              const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
              const selectedKey = selectedDay ? `${calYear}-${calMonth}-${selectedDay}` : null;
              const selectedEvents = selectedKey ? (scheduleMap[selectedKey] || []) : [];

              return (
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                    <button
                      onClick={() => {
                        setSelectedDay(null);
                        if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
                        else setCalMonth(m => m - 1);
                      }}
                      style={{ width: 36, height: 36, borderRadius: "50%", background: theme.card, border: `1px solid ${theme.border}`, color: theme.white, cursor: "pointer", fontSize: "1rem" }}>‹</button>
                    <div style={{ fontWeight: "900", fontSize: "1.2rem" }}>{calYear}年 {calMonth + 1}月</div>
                    <button
                      onClick={() => {
                        setSelectedDay(null);
                        if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
                        else setCalMonth(m => m + 1);
                      }}
                      style={{ width: 36, height: 36, borderRadius: "50%", background: theme.card, border: `1px solid ${theme.border}`, color: theme.white, cursor: "pointer", fontSize: "1rem" }}>›</button>
                  </div>

                  <div style={{ background: theme.card, borderRadius: "20px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                      {weeks.map((w, i) => (
                        <div key={w} style={{
                          textAlign: "center", padding: "0.7rem 0", fontSize: "0.72rem", fontWeight: "700",
                          color: i === 0 ? "#f87171" : i === 6 ? theme.blue : theme.muted,
                          borderBottom: `1px solid ${theme.border}`,
                        }}>{w}</div>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                      {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} style={{ padding: "0.6rem", borderRight: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}`, minHeight: "60px" }} />
                      ))}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const key = `${calYear}-${calMonth}-${day}`;
                        const events = scheduleMap[key] || [];
                        const hasEvent = events.length > 0;
                        const isToday = key === todayKey;
                        const isSelected = selectedDay === day;
                        const colIndex = (firstDayOfWeek + i) % 7;
                        return (
                          <div
                            key={day}
                            onClick={() => setSelectedDay(isSelected ? null : day)}
                            style={{
                              padding: "0.4rem",
                              borderRight: `1px solid ${theme.border}`,
                              borderBottom: `1px solid ${theme.border}`,
                              minHeight: "60px",
                              cursor: hasEvent ? "pointer" : "default",
                              background: isSelected ? `${theme.blue}18` : "transparent",
                              transition: "background 0.15s",
                            }}>
                            <div style={{
                              width: 26, height: 26, borderRadius: "50%",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "0.78rem", fontWeight: isToday ? "900" : "500",
                              background: isToday ? theme.blue : "transparent",
                              color: isToday ? "#fff" : colIndex === 0 ? "#f87171" : colIndex === 6 ? theme.blue : theme.white,
                              marginBottom: "0.2rem",
                            }}>{day}</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              {events.slice(0, 2).map((ev, ei) => {
                                const bc = getBadgeColor(ev.badge);
                                return (
                                  <div key={ei} style={{
                                    fontSize: "0.58rem", fontWeight: "700",
                                    color: bc.color, background: bc.bg,
                                    borderRadius: "3px", padding: "1px 4px",
                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                  }}>{ev.badge || "練習"}</div>
                                );
                              })}
                              {events.length > 2 && <div style={{ fontSize: "0.55rem", color: theme.muted }}>+{events.length - 2}</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <AnimatePresence>
                    {selectedDay && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        style={{ marginTop: "1.2rem", display: "flex", flexDirection: "column", gap: "0.7rem" }}>
                        {selectedEvents.length > 0 ? selectedEvents.map((ev) => {
                          const bc = getBadgeColor(ev.badge);
                          return (
                            <div key={ev.id} style={{ background: theme.card, borderRadius: "14px", border: `1px solid ${theme.border}`, borderLeft: `3px solid ${bc.color}`, padding: "1.2rem 1.4rem" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                                <span style={{ fontWeight: "900", fontSize: "1rem" }}>{ev.date}</span>
                                <span style={{ padding: "2px 10px", borderRadius: "999px", fontSize: "0.65rem", fontWeight: "700", background: bc.bg, color: bc.color }}>{ev.badge || "練習"}</span>
                              </div>
                              <div style={{ fontSize: "0.85rem", color: theme.muted }}>{ev.place}</div>
                              {ev.description && <div style={{ marginTop: "0.5rem", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{ev.description}</div>}
                            </div>
                          );
                        }) : (
                          <div style={{ background: theme.card, borderRadius: "14px", border: `1px solid ${theme.border}`, padding: "1.2rem", color: theme.muted, fontSize: "0.9rem", textAlign: "center" }}>
                            {calMonth + 1}月{selectedDay}日の予定はありません
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })()}
          </section>

          {/* GALLERY */}
          <section id="gallery" style={{ padding: "6rem 5%", background: "#0a0f1a" }}>
            <motion.div initial="hidden" whileInView="visible" variants={fadeInUp} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: "3rem" }}>
              <SectionLabel>ギャラリー</SectionLabel>
              <h2 style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", fontWeight: "900", margin: "0.5rem 0 1rem" }}>活動の様子</h2>
              <p style={{ color: theme.muted, fontSize: "0.9rem" }}>DEWEYSの日常。練習から試合、イベントまで。あなたもこのコミュニティの一員に。</p>
            </motion.div>
            <div style={{ columns: "2", columnGap: "1rem", maxWidth: "1100px", margin: "0 auto" }}>
              {activities.map((item, i) => {
                const imageUrl = (item.icon && item.icon.url) || (item.image && item.image.url) || "/no-image.jpg";
                return (
                  <motion.div
                    key={item.id}
                    initial="hidden" whileInView="visible" variants={fadeInUp} viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedActivity(item)}
                    style={{ breakInside: "avoid", marginBottom: "1rem", borderRadius: "16px", overflow: "hidden", background: theme.card, cursor: "pointer" }}>
                    <div style={{ position: "relative", width: "100%", paddingBottom: "70%", overflow: "hidden" }}>
                      <Image src={imageUrl} alt={item.name} fill style={{ objectFit: "cover", transition: "transform 0.4s ease" }} unoptimized
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                      />
                      <div style={{ position: "absolute", top: 10, right: 10, width: 30, height: 30, borderRadius: "50%", background: theme.blue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: theme.white }}>↗</div>
                    </div>
                    <div style={{ padding: "0.9rem 1rem 1rem" }}>
                      <div style={{ fontWeight: "900", fontSize: "0.9rem", lineHeight: 1.4, marginBottom: "0.4rem" }}>{item.name}</div>
                      <div style={{ fontSize: "0.68rem", color: theme.blue, fontWeight: "700" }}>タップして詳細を見る →</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* ACTIVITY MODAL */}
          <AnimatePresence>
            {selectedActivity && (
              <motion.div
                key="modal-bg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedActivity(null)}
                style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backdropFilter: "blur(6px)" }}>
                <motion.div
                  key="modal-body"
                  initial={{ opacity: 0, y: 30, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.97 }}
                  transition={{ duration: 0.3 }}
                  onClick={e => e.stopPropagation()}
                  style={{ background: theme.card, borderRadius: "20px", border: `1px solid ${theme.border}`, maxWidth: "640px", width: "100%", maxHeight: "85vh", overflowY: "auto", position: "relative" }}>
                  {(selectedActivity.icon && selectedActivity.icon.url || selectedActivity.image && selectedActivity.image.url) && (
                    <div style={{ position: "relative", width: "100%", paddingBottom: "50%", borderRadius: "20px 20px 0 0", overflow: "hidden" }}>
                      <Image
                        src={(selectedActivity.icon && selectedActivity.icon.url) || (selectedActivity.image && selectedActivity.image.url)}
                        alt={selectedActivity.name}
                        fill
                        style={{ objectFit: "cover" }}
                        unoptimized
                      />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(22,27,34,1) 0%, transparent 60%)" }} />
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedActivity(null)}
                    style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: `1px solid ${theme.border}`, color: theme.white, cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    ✕
                  </button>
                  <div style={{ padding: "1.5rem 2rem 2rem" }}>
                    <div style={{ fontSize: "0.7rem", color: theme.blue, fontWeight: "700", marginBottom: "0.4rem", letterSpacing: "0.08em" }}>ACTIVITY</div>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: "900", marginBottom: "0.8rem", lineHeight: 1.3 }}>{selectedActivity.name}</h3>
                    {selectedActivity.introduction && (
                      <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: "1.2rem" }}>{selectedActivity.introduction}</p>
                    )}
                    {selectedActivity.body && (
                      <div
                        style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.8, borderTop: `1px solid ${theme.border}`, paddingTop: "1.2rem" }}
                        dangerouslySetInnerHTML={{ __html: selectedActivity.body }}
                      />
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FAQ */}
          <section id="faq" style={{ padding: "6rem 5%", background: theme.bg }}>
            <motion.div initial="hidden" whileInView="visible" variants={fadeInUp} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: "3rem" }}>
              <SectionLabel>Q&A</SectionLabel>
              <h2 style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", fontWeight: "900", margin: "0.5rem 0 1rem" }}>よくある質問</h2>
              <p style={{ color: theme.muted, fontSize: "0.9rem" }}>新入生からよく聞かれる質問にお答えします。質問があればLINEで直接聞いてください！</p>
            </motion.div>
            <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "0.7rem" }}>
              {(faqs.length > 0 ? faqs : [
                { id: "1", question: "未経験でも入れますか？", answer: "もちろんです！部員の約半数が野球未経験者からスタートしています。" },
                { id: "2", question: "他大学でも大丈夫ですか？", answer: "インカレ大歓迎です！早大以外の大学からも多数参加しています。" },
                { id: "3", question: "活動日は週何回ですか？", answer: "基本は週2回（水曜・土曜）です。都合に合わせて参加できます。" },
                { id: "4", question: "費用はかかりますか？", answer: "月々の会費は数千円程度です。詳細はLINEでお気軽にお問い合わせください。" },
                { id: "5", question: "男女問わずですか？", answer: "はい、男女ともに大歓迎です！現在も多くの女性部員が活躍しています。" },
              ]).map((item) => (
                <motion.div
                  key={item.id}
                  initial="hidden" whileInView="visible" variants={fadeInUp} viewport={{ once: true }}
                  style={{ background: theme.card, borderRadius: "14px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === item.id ? null : item.id)}
                    style={{ width: "100%", background: "none", border: "none", padding: "1.2rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", color: theme.white, textAlign: "left" }}>
                    <span style={{ fontWeight: "700", fontSize: "0.95rem" }}>{item.question}</span>
                    <span style={{
                      width: 30, height: 30, borderRadius: "50%", background: theme.blue,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.1rem", fontWeight: "300", color: theme.white,
                      flexShrink: 0, marginLeft: "1rem", transition: "transform 0.2s",
                      transform: openFaq === item.id ? "rotate(45deg)" : "rotate(0deg)",
                    }}>+</span>
                  </button>
                  <AnimatePresence>
                    {openFaq === item.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: "hidden" }}>
                        <div style={{ padding: "0 1.5rem 1.2rem", fontSize: "0.9rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </section>

          {/* CONTACT */}
          <section id="contact" style={{ padding: "8rem 5%", background: theme.white, textAlign: "center" }}>
            <motion.div initial="hidden" whileInView="visible" variants={fadeInUp} viewport={{ once: true }}>
              <h2 style={{ fontSize: "clamp(1.8rem, 6vw, 3.2rem)", fontWeight: "900", color: "#111", marginBottom: "2rem", lineHeight: 1.2 }}>
                気軽に、<span style={{ color: theme.blue }}>遊びにきてね。</span>
              </h2>
              <a
                href="https://lin.ee/srY0QB3"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.8rem",
                  background: "#06c755", color: "#fff",
                  padding: "1rem 2.5rem", borderRadius: "50px",
                  textDecoration: "none", fontWeight: "900", fontSize: "1rem",
                  boxShadow: "0 8px 24px rgba(6,199,85,0.25)",
                }}>
                <i className="fab fa-line" style={{ fontSize: "1.6rem" }}></i>
                LINEでサクッと聞く
              </a>
            </motion.div>
          </section>

          {/* FOOTER */}
          <footer style={{ padding: "2.5rem 5%", background: "#f0f7ff", borderTop: "1px solid rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            <div style={{ display: "flex", gap: "2rem" }}>
              <a href="https://www.instagram.com/waseda_deweys" target="_blank" rel="noopener noreferrer" style={{ color: "#333", fontSize: "1.4rem" }}><i className="fab fa-instagram"></i></a>
              <a href="http://twitter.com/baseball_deweys" target="_blank" rel="noopener noreferrer" style={{ color: "#333", fontSize: "1.4rem" }}><i className="fab fa-x-twitter"></i></a>
            </div>
            <div style={{ fontSize: "0.65rem", color: "#999", letterSpacing: "0.15em" }}>© 2026 WASEDA DEWEYS</div>
          </footer>

        </motion.div>
      )}
    </main>
  );
}