"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import DarkVeil from "./components/DarkVeil";
import HeroWordmark from "./components/HeroWordmark";
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

const cultureCards = [
  {
    title: "PLAY HARD",
    body: "試合はちゃんと本気。守備も打席も、勝ちにいく空気を大事にしています。",
  },
  {
    title: "FEEL WELCOME",
    body: "初心者も経験者も混ざって楽しめるように、入りやすい距離感をつくっています。",
  },
  {
    title: "MAKE MEMORIES",
    body: "野球だけで終わらない。イベントも含めて大学生活の濃さをつくるチームです。",
  },
];

const aboutTags = ["初心者歓迎", "インカレ歓迎", "男女問わず", "週2回活動"];
const joinTags = ["見学OK", "LINEで相談可", "早稲田中心", "春新歓歓迎"];

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

function getFutureScheduleEntries(items, limit = 6) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const seen = new Set();
  const entries = [];

  items.forEach((item) => {
    [today.getFullYear(), today.getFullYear() + 1].forEach((year) => {
      parseEventDates(item.date, year).forEach(({ month, day }) => {
        const date = new Date(year, month, day);
        date.setHours(0, 0, 0, 0);
        if (date < today) return;

        const key = `${item.id}-${year}-${month}-${day}`;
        if (seen.has(key)) return;
        seen.add(key);

        entries.push({
          ...item,
          dateObject: date,
          shortDate: `${month + 1}.${String(day).padStart(2, "0")}`,
          monthLabel: `${month + 1}月${day}日`,
          fullLabel: formatResultDate(date),
        });
      });
    });
  });

  entries.sort((left, right) => left.dateObject - right.dateObject);
  return entries.slice(0, limit);
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

  const sortedResults = useMemo(
    () => [...results].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [results]
  );

  const latestResult = sortedResults[0] || null;
  const latestResultTone = latestResult
    ? getResultTone(latestResult.myScore, latestResult.opScore)
    : "draw";
  const otherResults = sortedResults.slice(1, 5);
  const displayFaqs = faqs.length > 0 ? faqs : defaultFaqs;
  const galleryItems = useMemo(
    () => (activities.length > 0 ? activities : fallbackActivities).slice(0, 6),
    [activities]
  );
  const featuredGallery = galleryItems[0] || fallbackActivities[0];
  const mosaicItems = galleryItems.slice(1, 6);
  const futureScheduleEntries = useMemo(() => getFutureScheduleEntries(schedules, 6), [schedules]);
  const upcomingEvent = futureScheduleEntries[0] || null;

  const heroRailItems = useMemo(() => {
    const items = [
      "SPRING 2026",
      "TRYOUT FREE",
      "WASEDA / INTERCOLLEGE",
      "PLAY HARD / HANG HARD",
      "LINE OPEN",
      "INSTAGRAM OPEN",
    ];

    if (upcomingEvent) {
      items.splice(3, 0, `NEXT ${upcomingEvent.shortDate} ${upcomingEvent.badge || "練習"}`);
    }

    if (latestResult) {
      items.splice(4, 0, `LATEST ${latestResult.myScore}-${latestResult.opScore} ${getResultLabel(latestResultTone)}`);
    }

    return items;
  }, [latestResult, latestResultTone, upcomingEvent]);

  const scheduleMap = useMemo(() => {
    const map = {};

    schedules.forEach((item) => {
      parseEventDates(item.date, calYear).forEach(({ month, day }) => {
        const key = `${calYear}-${month}-${day}`;
        if (!map[key]) map[key] = [];
        if (!map[key].some((event) => event.id === item.id)) {
          map[key].push(item);
        }
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
  const selectedPanelItems = selectedDay !== null ? selectedEvents : futureScheduleEntries;
  const selectedPanelTitle =
    selectedDay !== null ? `${calMonth + 1}月${selectedDay}日の予定` : "NEXT EVENTS";
  const selectedPanelEmpty =
    selectedDay !== null
      ? `${calMonth + 1}月${selectedDay}日の予定はありません`
      : "公開中の次回予定はまだありません";

  const moveMonth = (amount) => {
    setSelectedDay(null);
    const next = new Date(calYear, calMonth + amount, 1);
    setCalYear(next.getFullYear());
    setCalMonth(next.getMonth());
  };

  const focusScheduleEntry = (entry) => {
    if (!entry?.dateObject) return;
    setCalYear(entry.dateObject.getFullYear());
    setCalMonth(entry.dateObject.getMonth());
    setSelectedDay(entry.dateObject.getDate());
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
              animate={{ opacity: [0.38, 1, 0.38] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="loader-logo"
            >
              W.DEWEYS
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isLoading && (
        <motion.div
          className="page-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45 }}
        >
          <header className="site-header">
            <nav className="nav-bar" aria-label="サイト内ナビゲーション">
              <a className="brand-mark" href="#">
                <span className="brand-main">W.DEWEYS</span>
                <span className="brand-sub">Waseda Baseball Circle</span>
              </a>

              <div className="nav-links">
                {navItems.map((item) => (
                  <a key={item.href} href={item.href}>
                    {item.label}
                  </a>
                ))}
              </div>

              <div className="nav-actions">
                <span className="nav-season">SPRING 2026</span>
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
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  {navItems.map((item) => (
                    <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                      {item.label}
                    </a>
                  ))}
                  <a
                    href="https://www.instagram.com/waseda_deweys"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    INSTAGRAM
                  </a>
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
              <DarkVeil speed={0.82} noiseIntensity={0.03} warpAmount={0.92} resolutionScale={0.75} />
              <div className="hero-shade" />
            </div>

            <div className="section-inner hero-inner">
              <div className="hero-topline">
                <motion.p
                  className="eyebrow"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  WASEDA BASEBALL CIRCLE
                </motion.p>
                <motion.div
                  className="hero-status-pill"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.06 }}
                >
                  RECRUIT OPEN
                </motion.div>
              </div>

              <div className="hero-grid">
                <div className="hero-content">
                  <HeroWordmark />
                  <motion.p
                    className="hero-copy"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.18 }}
                  >
                    野球にちゃんと熱くなれて、大学生活もちゃんと濃くなる。早稲田大学を中心に活動する創立38年の軟式野球サークルです。
                  </motion.p>
                  <motion.div
                    className="hero-action-row"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.28 }}
                  >
                    <a className="button button-primary" href="#schedule">
                      <i className="fas fa-calendar-days" aria-hidden="true" />
                      <span>活動予定を見る</span>
                    </a>
                    <a className="button button-secondary" href="https://lin.ee/srY0QB3">
                      <i className="fab fa-line" aria-hidden="true" />
                      <span>LINEで連絡する</span>
                    </a>
                  </motion.div>

                  <motion.div
                    className="hero-rail"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.42 }}
                  >
                    <div className="hero-rail-track" aria-hidden="true">
                      {[...heroRailItems, ...heroRailItems].map((item, index) => (
                        <span className="hero-rail-item" key={`${item}-${index}`}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </div>

                <motion.aside
                  className="hero-stage-card"
                  initial={{ opacity: 0, x: 24, y: 16 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.72, delay: 0.24 }}
                >
                  <div className="hero-stage-header">
                    <span className="panel-label">SEASON BOARD</span>
                    <span className="live-pill">
                      <span className="live-dot" aria-hidden="true" />
                      LIVE
                    </span>
                  </div>

                  <div className="hero-stage-stats">
                    {[
                      { label: "MEMBERS", value: `${info.memberCount}名` },
                      { label: "BEGINNERS", value: `${info.beginnerRatio}%` },
                      { label: "UNIVERSITIES", value: `${info.universityCount}校+` },
                    ].map((item) => (
                      <div className="hero-mini-stat" key={item.label}>
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="hero-stage-stack">
                    <article className={`hero-stage-block tone-${latestResultTone}`}>
                      <span className="panel-label">LATEST RESULT</span>
                      {latestResult ? (
                        <>
                          <div className="hero-stage-score">
                            <span>{latestResult.myScore}</span>
                            <em>-</em>
                            <span>{latestResult.opScore}</span>
                          </div>
                          <p>vs {latestResult.opponent}</p>
                          <b>{formatResultDate(latestResult.date)}</b>
                        </>
                      ) : (
                        <>
                          <strong className="hero-stage-value">UPDATE SOON</strong>
                          <p>試合結果は順次更新します。</p>
                        </>
                      )}
                    </article>

                    <article className={`hero-stage-block tone-${getBadgeTone(upcomingEvent?.badge)}`}>
                      <span className="panel-label">NEXT SESSION</span>
                      {upcomingEvent ? (
                        <>
                          <strong className="hero-stage-value">{upcomingEvent.monthLabel}</strong>
                          <p>{upcomingEvent.badge || "練習"}</p>
                          <b>{upcomingEvent.place || "場所は追って案内します"}</b>
                        </>
                      ) : (
                        <>
                          <strong className="hero-stage-value">COMING SOON</strong>
                          <p>次回予定を調整中です。</p>
                        </>
                      )}
                    </article>

                    <article className="hero-stage-block tone-neutral">
                      <span className="panel-label">CLUB DNA</span>
                      <ul className="dna-list">
                        {cultureCards.map((item) => (
                          <li key={item.title}>{item.title}</li>
                        ))}
                      </ul>
                    </article>
                  </div>
                </motion.aside>
              </div>
            </div>
          </section>

          <section id="about" className="section story-section">
            <div className="section-inner">
              <motion.div
                className="section-head split-head"
                initial="hidden"
                whileInView="visible"
                variants={fadeInUp}
                viewport={{ once: true }}
              >
                <div>
                  <p className="section-kicker">ABOUT</p>
                  <h2>どんなサークルか。</h2>
                </div>
                <p className="section-side-copy">
                  経験者も初心者も入りやすく、試合にはしっかり向き合うサークルです。
                </p>
              </motion.div>

              <div className="story-grid">
                <motion.div
                  className="story-photo-frame"
                  initial="hidden"
                  whileInView="visible"
                  variants={fadeInUp}
                  viewport={{ once: true }}
                >
                  <Image
                    src="/activity1.jpg"
                    alt="W.DEWEYSの活動写真"
                    fill
                    sizes="(max-width: 960px) 100vw, 48vw"
                    style={{ objectFit: "cover" }}
                    unoptimized
                  />
                  <div className="story-photo-caption">
                    <span className="panel-label">ATMOSPHERE</span>
                    <strong>練習もイベントも大事にしています。</strong>
                  </div>
                </motion.div>

                <motion.div
                  className="story-copy-panel"
                  initial="hidden"
                  whileInView="visible"
                  variants={fadeInUp}
                  viewport={{ once: true }}
                >
                  <div className="story-columns">
                    <p>
                      高校球児から大学で初めてグローブを触る人まで、参加の入り口はさまざまです。だからこそ、実力差よりも雰囲気の良さを大切にしています。
                    </p>
                    <p>
                      練習・試合・イベントを通して、大学生活の中にひとつ強い居場所ができる。そんなサークルでありたいと考えています。
                    </p>
                  </div>

                  <div className="tag-row">
                    {aboutTags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>

                  <div className="manifesto-grid">
                    {cultureCards.map((item) => (
                      <article className="manifesto-card" key={item.title}>
                        <span className="panel-label">{item.title}</span>
                        <p>{item.body}</p>
                      </article>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          <section id="results" className="section arena-section">
            <div className="section-inner">
              <motion.div
                className="section-head split-head"
                initial="hidden"
                whileInView="visible"
                variants={fadeInUp}
                viewport={{ once: true }}
              >
                <div>
                  <p className="section-kicker">RESULTS</p>
                  <h2>試合結果</h2>
                </div>
                <div className="section-side-stack">
                  <span>{sortedResults.length > 0 ? `${sortedResults.length} MATCHES LOGGED` : "MATCHES UPDATING"}</span>
                  <p>最近の試合結果をまとめています。</p>
                </div>
              </motion.div>

              <div className="results-grid">
                {latestResult ? (
                  <motion.article
                    className={`scoreboard-card tone-${latestResultTone}`}
                    initial="hidden"
                    whileInView="visible"
                    variants={fadeInUp}
                    viewport={{ once: true }}
                  >
                    <div className="scoreboard-header">
                      <span className="panel-label">FEATURED MATCH</span>
                      <b>{getResultLabel(latestResultTone)}</b>
                    </div>
                    <div className="scoreboard-date">{formatResultDate(latestResult.date)}</div>
                    <div className="scoreboard-score">
                      <span>{latestResult.myScore}</span>
                      <em>-</em>
                      <span>{latestResult.opScore}</span>
                    </div>
                    <div className="scoreboard-opponent">vs {latestResult.opponent}</div>
                    <p className="scoreboard-caption">最新の試合結果を最前面に表示しています。</p>
                  </motion.article>
                ) : (
                  <div className="empty-card">試合結果はまだありません。</div>
                )}

                <div className="results-column">
                  <motion.article
                    className="results-note-card"
                    initial="hidden"
                    whileInView="visible"
                    variants={fadeInUp}
                    viewport={{ once: true }}
                  >
                    <span className="panel-label">TEAM MOOD</span>
                    <strong>試合には本気です。</strong>
                    <p>
                      楽しさも大事にしながら、試合ではしっかり勝ちを目指しています。
                    </p>
                  </motion.article>

                  <div className="results-feed">
                    {otherResults.length > 0 ? (
                      otherResults.map((game) => {
                        const tone = getResultTone(game.myScore, game.opScore);
                        return (
                          <motion.article
                            className={`result-feed-item tone-${tone}`}
                            key={game.id}
                            initial="hidden"
                            whileInView="visible"
                            variants={fadeInUp}
                            viewport={{ once: true }}
                          >
                            <div className="result-feed-top">
                              <time>{formatResultDate(game.date)}</time>
                              <b>{getResultLabel(tone)}</b>
                            </div>
                            <strong>vs {game.opponent}</strong>
                            <span>
                              {game.myScore} - {game.opScore}
                            </span>
                          </motion.article>
                        );
                      })
                    ) : (
                      <div className="empty-card">ほかの試合結果はまだありません。</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="schedule" className="section cadence-section">
            <div className="section-inner">
              <motion.div
                className="section-head split-head"
                initial="hidden"
                whileInView="visible"
                variants={fadeInUp}
                viewport={{ once: true }}
              >
                <div>
                  <p className="section-kicker">SCHEDULE</p>
                  <h2>活動予定</h2>
                </div>
                <p className="section-side-copy">
                  近日の予定と月ごとの予定を見られます。日付を押すと詳細が切り替わります。
                </p>
              </motion.div>

              <div className="schedule-grid">
                <motion.aside
                  className="schedule-sidebar"
                  initial="hidden"
                  whileInView="visible"
                  variants={fadeInUp}
                  viewport={{ once: true }}
                >
                  <div className="sidebar-card">
                    <span className="panel-label">UPCOMING</span>
                    <div className="upcoming-list">
                      {futureScheduleEntries.length > 0 ? (
                        futureScheduleEntries.map((event) => (
                          <button
                            type="button"
                            className={`upcoming-card tone-${getBadgeTone(event.badge)}`}
                            key={`${event.id}-${event.shortDate}`}
                            onClick={() => focusScheduleEntry(event)}
                          >
                            <strong>{event.monthLabel}</strong>
                            <span>{event.badge || "練習"}</span>
                            <b>{event.place || "場所は追って案内します"}</b>
                          </button>
                        ))
                      ) : (
                        <div className="empty-card">近日予定はまだありません。</div>
                      )}
                    </div>
                  </div>

                  <div className="sidebar-card sidebar-note">
                    <span className="panel-label">HOW TO READ</span>
                    <p>練習、試合、新歓イベントを色分けしています。詳細を見たい日はカレンダーをクリックしてください。</p>
                  </div>
                </motion.aside>

                <div className="schedule-main">
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
                              <span className={`calendar-event tone-${getBadgeTone(firstEvent.badge)}`}>
                                {firstEvent.badge || "練習"}
                              </span>
                            )}
                            {events.length > 1 && <span className="calendar-count">+{events.length - 1}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      className="event-panel"
                      key={selectedPanelTitle}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <div className="event-panel-header">
                        <span className="panel-label">{selectedPanelTitle}</span>
                        <span className="event-panel-badge">{selectedPanelItems.length} ITEMS</span>
                      </div>

                      {selectedPanelItems.length > 0 ? (
                        <div className="event-list">
                          {selectedPanelItems.map((event, index) => (
                            <article
                              className={`event-card tone-${getBadgeTone(event.badge)}`}
                              key={`${event.id}-${event.monthLabel || event.date || index}`}
                            >
                              <div className="event-card-main">
                                <strong>{event.monthLabel || event.date}</strong>
                                <span>{event.place || "場所は追って案内します"}</span>
                              </div>
                              <b>{event.badge || "練習"}</b>
                              {event.description && <p>{event.description}</p>}
                            </article>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-card">{selectedPanelEmpty}</div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </section>

          <section id="gallery" className="section gallery-section">
            <div className="section-inner">
              <motion.div
                className="section-head split-head"
                initial="hidden"
                whileInView="visible"
                variants={fadeInUp}
                viewport={{ once: true }}
              >
                <div>
                  <p className="section-kicker">GALLERY</p>
                  <h2>活動の様子</h2>
                </div>
                <p className="section-side-copy">
                  練習や試合、イベントの写真をまとめています。気になる写真はそのまま拡大できます。
                </p>
              </motion.div>

              <div className="gallery-mosaic">
                <motion.button
                  type="button"
                  className="gallery-tile gallery-featured"
                  initial="hidden"
                  whileInView="visible"
                  variants={fadeInUp}
                  viewport={{ once: true }}
                  onClick={() => setSelectedActivity(featuredGallery)}
                >
                  <Image
                    src={getActivityImage(featuredGallery)}
                    alt={featuredGallery.name}
                    fill
                    sizes="(max-width: 960px) 100vw, 58vw"
                    style={{ objectFit: "cover" }}
                    unoptimized
                  />
                  <div className="gallery-overlay">
                    <span className="panel-label">FEATURED SCENE</span>
                    <strong>{featuredGallery.name}</strong>
                    <p>
                      {featuredGallery.introduction ||
                        "練習もイベントも含めて、DEWEYSの日常が見える写真をまとめています。"}
                    </p>
                  </div>
                </motion.button>

                {mosaicItems.map((item, index) => (
                  <motion.button
                    type="button"
                    className={`gallery-tile gallery-secondary gallery-secondary-${index + 1}`}
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
                      sizes="(max-width: 960px) 100vw, 28vw"
                      style={{ objectFit: "cover" }}
                      unoptimized
                    />
                    <div className="gallery-overlay gallery-overlay-compact">
                      <strong>{item.name}</strong>
                    </div>
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
                      <div className="cms-body" dangerouslySetInnerHTML={{ __html: selectedActivity.body }} />
                    )}
                  </div>
                </motion.article>
              </motion.div>
            )}
          </AnimatePresence>

          <section id="faq" className="section faq-section">
            <div className="section-inner faq-shell">
              <motion.div
                className="faq-intro"
                initial="hidden"
                whileInView="visible"
                variants={fadeInUp}
                viewport={{ once: true }}
              >
                <p className="section-kicker">FAQ</p>
                <h2>最初に気になりやすいこと。</h2>
                <p>
                  入会前によく聞かれることをまとめています。見学だけでもまったく問題ないので、気になることがあれば気軽に連絡してください。
                </p>

                <div className="faq-prompt-card">
                  <span className="panel-label">FIRST CONTACT</span>
                  <strong>見学からで大丈夫。</strong>
                  <p>練習の空気感を見てから考えたい、という相談も歓迎しています。</p>
                </div>
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
                      className="faq-trigger"
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
                          transition={{ duration: 0.24 }}
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

          <section id="contact" className="section contact-section">
            <div className="section-inner contact-band">
              <motion.div
                className="contact-copy"
                initial="hidden"
                whileInView="visible"
                variants={fadeInUp}
                viewport={{ once: true }}
              >
                <p className="section-kicker">JOIN US</p>
                <h2>気になったら、まずはひとこと。</h2>
                <p>
                  見学だけでも、初心者だけでも大丈夫。サークルの雰囲気や予定は、LINEかInstagramから気軽に聞いてください。
                </p>
                <div className="join-chip-row">
                  {joinTags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="contact-card"
                initial="hidden"
                whileInView="visible"
                variants={fadeInUp}
                viewport={{ once: true }}
              >
                <div className="contact-card-top">
                  <span className="panel-label">JOIN THE CIRCLE</span>
                  <strong>まずは連絡だけでも歓迎です。</strong>
                </div>

                <div className="contact-actions">
                  <a className="button button-primary" href="https://lin.ee/srY0QB3">
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
                    <span>Instagramを見る</span>
                  </a>
                </div>

                <div className="contact-meta-grid">
                  <div>
                    <span>CONTACT</span>
                    <strong>DM / LINE中心</strong>
                  </div>
                  <div>
                    <span>ACTIVITY</span>
                    <strong>水曜・土曜</strong>
                  </div>
                  <div>
                    <span>STYLE</span>
                    <strong>初心者歓迎</strong>
                  </div>
                  <div>
                    <span>AREA</span>
                    <strong>早稲田周辺</strong>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <footer className="site-footer">
            <div className="footer-brand">
              <strong>W.DEWEYS</strong>
              <span>Waseda Baseball Circle</span>
            </div>
            <div className="footer-socials">
              <a
                href="https://www.instagram.com/waseda_deweys"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram" aria-hidden="true" />
              </a>
              <a
                href="http://twitter.com/baseball_deweys"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
              >
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
