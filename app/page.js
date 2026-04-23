"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import DarkVeil from "./components/DarkVeil";
import { client } from "../libs/client";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

const navItems = [
  { href: "#about", label: "ABOUT" },
  { href: "#results", label: "RESULTS" },
  { href: "#schedule", label: "SCHEDULE" },
  { href: "#gallery", label: "GALLERY" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "CONTACT" },
];

const defaultFaqs = [
  {
    id: "faq-1",
    question: "未経験でも入れますか？",
    answer: "もちろんです。初心者からスタートしたメンバーも多く、経験に合わせて楽しく参加できます。",
  },
  {
    id: "faq-2",
    question: "他大学でも大丈夫ですか？",
    answer: "インカレ大歓迎です。早稲田以外の大学から参加しているメンバーもいます。",
  },
  {
    id: "faq-3",
    question: "活動日は週何回ですか？",
    answer: "基本は週2回（水曜・土曜）です。予定が合う日に参加できる雰囲気なので安心してください。",
  },
  {
    id: "faq-4",
    question: "費用はかかりますか？",
    answer: "会費やイベント費は時期によって変動します。詳細はLINEから気軽に聞いてください。",
  },
  {
    id: "faq-5",
    question: "見学だけでも大丈夫ですか？",
    answer: "もちろん大歓迎です。まずは雰囲気を見てみたい、という人も気軽に連絡してください。",
  },
];

const fallbackActivities = [
  {
    id: "fallback-activity",
    name: "練習と試合の風景",
    introduction: "活動写真は順次更新予定です。まずは練習の雰囲気を見にきてください。",
    image: { url: "/activity1.jpg" },
  },
];

function formatResultDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replaceAll("/", ".");
}

function parseEventDates(dateStr, year) {
  if (!dateStr) return [];
  const normalized = String(dateStr).replace(/[〜～]/g, "~");
  const matches = [...normalized.matchAll(/(\d{1,2})\/(\d{1,2})/g)].map((match) => ({
    month: Number.parseInt(match[1], 10) - 1,
    day: Number.parseInt(match[2], 10),
  }));

  if (matches.length < 2) return matches;

  const start = new Date(year, matches[0].month, matches[0].day);
  const end = new Date(year, matches[1].month, matches[1].day);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return matches;
  }

  const dates = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    dates.push({ month: cursor.getMonth(), day: cursor.getDate() });
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function getBadgeTone(badge = "") {
  if (badge.includes("中止")) return "cancel";
  if (badge.includes("試合")) return "match";
  if (
    badge.includes("合宿") ||
    badge.includes("大会") ||
    badge.includes("イベント") ||
    badge.includes("新歓")
  ) {
    return "event";
  }
  return "practice";
}

function getResultTone(myScore, opScore) {
  const my = Number(myScore);
  const op = Number(opScore);
  if (my > op) return "win";
  if (my < op) return "lose";
  return "draw";
}

function getResultLabel(tone) {
  if (tone === "win") return "WIN";
  if (tone === "lose") return "LOSE";
  return "DRAW";
}

function getActivityImage(item) {
  return item?.icon?.url || item?.image?.url || "/activity1.jpg";
}

export default function Home() {
  const [activities, setActivities] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [results, setResults] = useState([]);
  const [info, setInfo] = useState({
    memberCount: "---",
    beginnerRatio: "---",
    universityCount: "---",
  });
  const [openFaq, setOpenFaq] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedActivity(null);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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

        if (inf?.contents?.length > 0) {
          const details = inf.contents[0];
          setInfo({
            memberCount: details.memberCount || "---",
            beginnerRatio: details.beginnerRatio || "---",
            universityCount: details.universityCount || "---",
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [results]);

  const latestResult = sortedResults[0] || null;
  const otherResults = sortedResults.slice(1, 5);
  const displayFaqs = faqs.length > 0 ? faqs : defaultFaqs;
  const galleryItems = activities.length > 0 ? activities : fallbackActivities;

  const scheduleMap = useMemo(() => {
    const map = {};
    schedules.forEach((item) => {
      parseEventDates(item.date, calYear).forEach(({ month, day }) => {
        const key = `${calYear}-${month}-${day}`;
        if (!map[key]) map[key] = [];
        if (!map[key].some((event) => event.id === item.id)) map[key].push(item);
      });
    });
    return map;
  }, [schedules, calYear]);

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
  const weekLabels = ["日", "月", "火", "水", "木", "金", "土"];
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const selectedKey = selectedDay !== null ? `${calYear}-${calMonth}-${selectedDay}` : null;
  const selectedEvents = selectedKey ? scheduleMap[selectedKey] || [] : [];

  const moveMonth = (amount) => {
    setSelectedDay(null);
    const next = new Date(calYear, calMonth + amount, 1);
    setCalYear(next.getFullYear());
    setCalMonth(next.getMonth());
  };

  return (
    <main className="site-shell">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loader"
            className="loader"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="loader-logo"
            >
              W.DEWEYS
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <header className="site-header">
            <nav className="nav-bar" aria-label="サイト内ナビゲーション">
              <a className="brand-mark" href="#">
                W.DEWEYS
              </a>

              <div className="nav-links">
                {navItems.map((item) => (
                  <a key={item.href} href={item.href}>
                    {item.label}
                  </a>
                ))}
              </div>

              <div className="nav-actions">
                <a
                  className="social-button"
                  href="https://www.instagram.com/waseda_deweys"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-instagram" aria-hidden="true" />
                  <span>Instagram</span>
                </a>
                <button
                  className="menu-toggle"
                  type="button"
                  aria-label="メニュー"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((value) => !value)}
                >
                  <i className={menuOpen ? "fas fa-times" : "fas fa-bars"} aria-hidden="true" />
                </button>
              </div>
            </nav>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  className="mobile-menu"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {navItems.map((item) => (
                    <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                      {item.label}
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </header>

          <section className="hero-section">
            <div className="hero-media" aria-hidden="true">
              <Image
                src="/top.jpg"
                alt=""
                fill
                priority
                sizes="100vw"
                style={{ objectFit: "cover" }}
                unoptimized
              />
              <DarkVeil />
              <div className="hero-shade" />
            </div>

            <div className="section-inner hero-inner">
              <motion.p
                className="eyebrow"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                WASEDA BASEBALL CIRCLE
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.08 }}
              >
                W.DEWEYS
              </motion.h1>
              <motion.p
                className="hero-copy"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.18 }}
              >
                野球も、遊びも、本気で。早稲田大学を中心に活動する創立38年の軟式野球サークルです。
              </motion.p>
              <motion.div
                className="hero-actions"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.28 }}
              >
                <a className="button button-primary" href="#schedule">
                  <i className="fas fa-calendar-days" aria-hidden="true" />
                  <span>活動予定</span>
                </a>
                <a className="button button-secondary" href="https://lin.ee/srY0QB3">
                  <i className="fab fa-line" aria-hidden="true" />
                  <span>LINEで問い合わせ</span>
                </a>
              </motion.div>

              <motion.div
                className="hero-stats"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.38 }}
              >
                {[
                  { label: "部員数", value: `${info.memberCount}名` },
                  { label: "初心者割合", value: `${info.beginnerRatio}%` },
                  { label: "所属大学数", value: `${info.universityCount}校+` },
                ].map((item) => (
                  <div className="stat-card" key={item.label}>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </section>

          <section id="about" className="section section-surface">
            <div className="section-inner about-grid">
              <motion.div initial="hidden" whileInView="visible" variants={fadeInUp} viewport={{ once: true }}>
                <p className="section-kicker">ABOUT</p>
                <h2>ちゃんと熱くて、ちゃんと楽しい。</h2>
                <p className="section-lead">
                  高校球児から人生初グローブまで、経験を問わず参加できるインカレ歓迎のサークルです。試合に向き合う真剣さと、大学生活を楽しむ空気感のどちらも大切にしています。
                </p>
                <div className="tag-row">
                  {["初心者歓迎", "インカレ歓迎", "男女問わず", "週2回活動"].map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="about-photo"
                initial="hidden"
                whileInView="visible"
                variants={fadeInUp}
                viewport={{ once: true }}
              >
                <Image
                  src="/activity1.jpg"
                  alt="W.DEWEYSの活動写真"
                  fill
                  sizes="(max-width: 900px) 100vw, 44vw"
                  style={{ objectFit: "cover" }}
                  unoptimized
                />
              </motion.div>
            </div>
          </section>

          <section id="results" className="section">
            <div className="section-inner">
              <motion.div
                className="section-heading"
                initial="hidden"
                whileInView="visible"
                variants={fadeInUp}
                viewport={{ once: true }}
              >
                <p className="section-kicker">RESULTS</p>
                <h2>直近の試合結果</h2>
                <p>DEWEYSの最近の試合をスコアボード風にまとめています。</p>
              </motion.div>

              {latestResult ? (
                <div className="results-grid">
                  <motion.article
                    className={`latest-result result-${getResultTone(latestResult.myScore, latestResult.opScore)}`}
                    initial="hidden"
                    whileInView="visible"
                    variants={fadeInUp}
                    viewport={{ once: true }}
                  >
                    <div className="result-topline">
                      <span>LATEST MATCH</span>
                      <b>{getResultLabel(getResultTone(latestResult.myScore, latestResult.opScore))}</b>
                    </div>
                    <div className="result-date">{formatResultDate(latestResult.date)}</div>
                    <div className="score-line">
                      <span>{latestResult.myScore}</span>
                      <em>-</em>
                      <span>{latestResult.opScore}</span>
                    </div>
                    <div className="opponent">vs {latestResult.opponent}</div>
                  </motion.article>

                  <div className="match-list">
                    {otherResults.length > 0 ? (
                      otherResults.map((game) => {
                        const tone = getResultTone(game.myScore, game.opScore);
                        return (
                          <motion.article
                            className={`match-row result-${tone}`}
                            key={game.id}
                            initial="hidden"
                            whileInView="visible"
                            variants={fadeInUp}
                            viewport={{ once: true }}
                          >
                            <time>{formatResultDate(game.date)}</time>
                            <strong>vs {game.opponent}</strong>
                            <span>
                              {game.myScore} - {game.opScore}
                            </span>
                            <b>{getResultLabel(tone)}</b>
                          </motion.article>
                        );
                      })
                    ) : (
                      <div className="empty-card">ほかの試合結果はまだありません。</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="empty-card">試合結果はまだありません。</div>
              )}
            </div>
          </section>

          <section id="schedule" className="section section-surface">
            <div className="section-inner">
              <motion.div
                className="section-heading"
                initial="hidden"
                whileInView="visible"
                variants={fadeInUp}
                viewport={{ once: true }}
              >
                <p className="section-kicker">SCHEDULE</p>
                <h2>活動予定</h2>
                <p>練習、試合、新歓イベントの予定をまとめています。</p>
              </motion.div>

              <div className="calendar-shell">
                <div className="calendar-toolbar">
                  <button type="button" aria-label="前の月" onClick={() => moveMonth(-1)}>
                    <i className="fas fa-chevron-left" aria-hidden="true" />
                  </button>
                  <strong>
                    {calYear}年 {calMonth + 1}月
                  </strong>
                  <button type="button" aria-label="次の月" onClick={() => moveMonth(1)}>
                    <i className="fas fa-chevron-right" aria-hidden="true" />
                  </button>
                </div>

                <div className="calendar-board">
                  {weekLabels.map((label, index) => (
                    <div className={`weekday weekday-${index}`} key={label}>
                      {label}
                    </div>
                  ))}

                  {Array.from({ length: firstDayOfWeek }).map((_, index) => (
                    <div className="calendar-cell calendar-cell-empty" key={`empty-${index}`} />
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, index) => {
                    const day = index + 1;
                    const key = `${calYear}-${calMonth}-${day}`;
                    const events = scheduleMap[key] || [];
                    const isToday = key === todayKey;
                    const isSelected = selectedDay === day;
                    const firstEvent = events[0];
                    return (
                      <button
                        type="button"
                        className={`calendar-cell ${isToday ? "is-today" : ""} ${isSelected ? "is-selected" : ""}`}
                        key={day}
                        onClick={() => setSelectedDay(isSelected ? null : day)}
                      >
                        <span className="calendar-day">{day}</span>
                        {firstEvent && (
                          <span className={`calendar-event event-${getBadgeTone(firstEvent.badge)}`}>
                            {firstEvent.badge || "練習"}
                          </span>
                        )}
                        {events.length > 1 && <span className="calendar-count">+{events.length - 1}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <AnimatePresence>
                {selectedDay !== null && (
                  <motion.div
                    className="selected-events"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                  >
                    {selectedEvents.length > 0 ? (
                      selectedEvents.map((event) => (
                        <article className={`event-card event-${getBadgeTone(event.badge)}`} key={event.id}>
                          <div>
                            <strong>{event.date}</strong>
                            <span>{event.place}</span>
                          </div>
                          <b>{event.badge || "練習"}</b>
                          {event.description && <p>{event.description}</p>}
                        </article>
                      ))
                    ) : (
                      <div className="empty-card">
                        {calMonth + 1}月{selectedDay}日の予定はありません
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          <section id="gallery" className="section">
            <div className="section-inner">
              <motion.div
                className="section-heading"
                initial="hidden"
                whileInView="visible"
                variants={fadeInUp}
                viewport={{ once: true }}
              >
                <p className="section-kicker">GALLERY</p>
                <h2>活動の様子</h2>
                <p>練習、試合、イベントまで。DEWEYSの日常を写真で見られます。</p>
              </motion.div>

              <div className="gallery-grid">
                {galleryItems.map((item, index) => (
                  <motion.button
                    type="button"
                    className={`gallery-card ${index % 5 === 0 ? "gallery-card-wide" : ""}`}
                    key={item.id}
                    initial="hidden"
                    whileInView="visible"
                    variants={fadeInUp}
                    viewport={{ once: true }}
                    onClick={() => setSelectedActivity(item)}
                  >
                    <Image
                      src={getActivityImage(item)}
                      alt={item.name}
                      fill
                      sizes="(max-width: 900px) 100vw, 33vw"
                      style={{ objectFit: "cover" }}
                      unoptimized
                    />
                    <span>{item.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </section>

          <AnimatePresence>
            {selectedActivity && (
              <motion.div
                className="modal-backdrop"
                key="modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedActivity(null)}
              >
                <motion.article
                  className="activity-modal"
                  key="activity-modal"
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 18, scale: 0.98 }}
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    className="modal-close"
                    type="button"
                    aria-label="閉じる"
                    onClick={() => setSelectedActivity(null)}
                  >
                    <i className="fas fa-times" aria-hidden="true" />
                  </button>
                  <div className="modal-image">
                    <Image
                      src={getActivityImage(selectedActivity)}
                      alt={selectedActivity.name}
                      fill
                      sizes="100vw"
                      style={{ objectFit: "cover" }}
                      unoptimized
                    />
                  </div>
                  <div className="modal-body">
                    <p className="section-kicker">ACTIVITY</p>
                    <h3>{selectedActivity.name}</h3>
                    {selectedActivity.introduction && <p>{selectedActivity.introduction}</p>}
                    {selectedActivity.body && (
                      <div
                        className="cms-body"
                        dangerouslySetInnerHTML={{ __html: selectedActivity.body }}
                      />
                    )}
                  </div>
                </motion.article>
              </motion.div>
            )}
          </AnimatePresence>

          <section id="faq" className="section section-surface">
            <div className="section-inner compact-inner">
              <motion.div
                className="section-heading"
                initial="hidden"
                whileInView="visible"
                variants={fadeInUp}
                viewport={{ once: true }}
              >
                <p className="section-kicker">FAQ</p>
                <h2>よくある質問</h2>
                <p>入会前に気になりやすいことをまとめました。</p>
              </motion.div>

              <div className="faq-list">
                {displayFaqs.map((item) => (
                  <motion.article
                    className="faq-item"
                    key={item.id}
                    initial="hidden"
                    whileInView="visible"
                    variants={fadeInUp}
                    viewport={{ once: true }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === item.id ? null : item.id)}
                    >
                      <span>{item.question}</span>
                      <i
                        className={openFaq === item.id ? "fas fa-minus" : "fas fa-plus"}
                        aria-hidden="true"
                      />
                    </button>
                    <AnimatePresence>
                      {openFaq === item.id && (
                        <motion.div
                          className="faq-answer"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                        >
                          <p>{item.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>

          <section id="contact" className="contact-section">
            <div className="section-inner contact-inner">
              <p className="section-kicker">JOIN US</p>
              <h2>気軽に、遊びにきてね。</h2>
              <p>見学だけでもOK。未経験でも大丈夫。まずはLINEやInstagramから連絡してください。</p>
              <div className="contact-actions">
                <a className="button line-button" href="https://lin.ee/srY0QB3">
                  <i className="fab fa-line" aria-hidden="true" />
                  <span>LINEで聞く</span>
                </a>
                <a
                  className="button button-secondary"
                  href="https://www.instagram.com/waseda_deweys"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-instagram" aria-hidden="true" />
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </section>

          <footer className="site-footer">
            <div className="footer-socials">
              <a href="https://www.instagram.com/waseda_deweys" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <i className="fab fa-instagram" aria-hidden="true" />
              </a>
              <a href="http://twitter.com/baseball_deweys" target="_blank" rel="noopener noreferrer" aria-label="X">
                <i className="fab fa-x-twitter" aria-hidden="true" />
              </a>
            </div>
            <small>© 2026 WASEDA DEWEYS</small>
          </footer>
        </motion.div>
      )}
    </main>
  );
}
