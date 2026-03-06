"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { client } from "../libs/client";
import "@fortawesome/fontawesome-free/css/all.min.css";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

export default function Home() {
  const [activities, setActivities] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [info, setInfo] = useState({ memberCount: "---", beginnerRatio: "---", universityCount: "---" });
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [act, sch, faq, inf] = await Promise.all([
          client.get({ endpoint: "activities" }).catch(() => ({ contents: [] })),
          client.get({ endpoint: "schedules" }).catch(() => ({ contents: [] })),
          client.get({ endpoint: "faq" }).catch(() => ({ contents: [] })),
          client.get({ endpoint: "info" }).catch(() => ({ contents: [] }))
        ]);

        setActivities(act.contents || []);
        setSchedules(sch.contents || []);
        setFaqs(faq.contents || []);

        if (inf && inf.contents && inf.contents.length > 0) {
          const latestInfo = inf.contents[0];
          setInfo({
            memberCount: latestInfo.memberCount || "---",
            beginnerRatio: latestInfo.beginnerRatio || "---",
            universityCount: latestInfo.universityCount || "---"
          });
        }
        
        setTimeout(() => setIsLoading(false), 1200);
      } catch (error) {
        console.error("Fetch error:", error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const theme = {
    deep: '#000b1d',
    pale: '#f0f7ff',
    neon: '#00d2ff',
    gold: '#fbbf24',
    red: '#ff4d4f',
    white: '#ffffff',
  };

  const getBadgeStyle = (badge) => {
    if (!badge) return { color: theme.neon, border: `1px solid ${theme.neon}`, bg: `${theme.neon}11` };
    if (badge.includes("中止")) return { color: theme.red, border: `1px solid ${theme.red}`, bg: `${theme.red}22` };
    if (badge.includes("合宿") || badge.includes("大会")) return { color: theme.gold, border: `1px solid ${theme.gold}`, bg: `${theme.gold}22` };
    return { color: theme.neon, border: `1px solid ${theme.neon}`, bg: `${theme.neon}11` };
  };

  return (
    <main style={{ color: theme.white, background: theme.deep, fontFamily: "'Inter', 'Noto Sans JP', sans-serif", overflowX: 'hidden' }}>
      
      <AnimatePresence>
        {isLoading && (
          <motion.div key="loader" exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: theme.deep, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div animate={{ opacity: [0.3, 1, 0.3], textShadow: [`0 0 5px ${theme.neon}`, `0 0 20px ${theme.neon}`] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ fontSize: '2.5rem', fontWeight: '900', color: theme.neon, letterSpacing: '0.2em' }}>DEWEYS</motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
          
          <nav style={{ padding: '1rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'fixed', top: 0, width: '100%', zIndex: 1000, background: 'rgba(0, 11, 29, 0.9)', backdropFilter: 'blur(15px)', borderBottom: `1px solid ${theme.neon}33` }}>
            <div style={{ fontWeight: "900", fontSize: "1.1rem", color: theme.neon }}>W.DEWEYS</div>
            <div style={{ display: 'flex', gap: '1.2rem' }}>
              <a href="https://www.instagram.com/waseda_deweys" target="_blank" rel="noopener noreferrer" style={{ color: theme.neon }}><i className="fab fa-instagram"></i></a>
              <a href="http://twitter.com/baseball_deweys" target="_blank" rel="noopener noreferrer" style={{ color: theme.neon }}><i className="fab fa-x-twitter"></i></a>
            </div>
          </nav>

          <header style={{ height: '85vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <Image src="/top.jpg" alt="Hero" fill priority style={{ objectFit: 'cover', filter: 'grayscale(100%) blur(6px) brightness(0.4)', zIndex: 0 }} unoptimized />
            <div style={{ position: 'relative', zIndex: 1, padding: '2rem', background: 'rgba(0,11,29,0.3)', borderRadius: '20px', backdropFilter: 'blur(5px)', width: '90%', maxWidth: '600px' }}>
              <motion.h1 initial="hidden" animate="visible" variants={fadeInUp} style={{ fontSize: 'clamp(2.2rem, 10vw, 4.5rem)', fontWeight: "900", lineHeight: "1.2", letterSpacing: "-0.02em", marginBottom: '1.5rem' }}>
                野球やろうぜ！<br /><span style={{ color: theme.neon }}>W.DEWEYS</span>
              </motion.h1>

              <motion.div initial="hidden" animate="visible" transition={{ delay: 0.3 }} variants={fadeInUp} style={{ display: 'flex', justifyContent: 'space-around', borderTop: `1px solid ${theme.white}33`, paddingTop: '1.5rem', marginTop: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.6, marginBottom: '0.3rem' }}>部員数</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '900', color: theme.pale }}>{info.memberCount}名</div>
                </div>
                <div style={{ borderLeft: `1px solid ${theme.white}22` }}></div>
                <div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.6, marginBottom: '0.3rem' }}>初心者割合</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '900', color: theme.neon }}>{info.beginnerRatio}%</div>
                </div>
                <div style={{ borderLeft: `1px solid ${theme.white}22` }}></div>
                <div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.6, marginBottom: '0.3rem' }}>所属大学数</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '900', color: theme.pale }}>{info.universityCount}校以上</div>
                </div>
              </motion.div>
            </div>
          </header>

          <section id="schedule" style={{ padding: '5rem 5%' }}>
            <h2 style={{ fontSize: '0.7rem', fontWeight: '900', letterSpacing: '0.3em', color: theme.neon, marginBottom: '2.5rem' }}>SCHEDULE</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {schedules.map((item) => {
                const style = getBadgeStyle(item.badge);
                return (
                  <div key={item.id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', border: `1px solid ${theme.neon}22`, borderRadius: '12px' }}>
                    <div style={{ fontWeight: "900", fontSize: "1.2rem", color: theme.pale, marginBottom: '0.5rem' }}>{item.date}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div style={{ fontSize: "0.9rem", opacity: 0.7 }}>{item.place}</div>
                      <div style={{ border: style.border, color: style.color, background: style.bg, padding: '4px 10px', fontSize: '0.65rem', fontWeight: '900', borderRadius: '4px' }}>{item.badge || "ACTIVE"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section id="gallery" style={{ padding: '5rem 5%', background: theme.pale }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: theme.deep, marginBottom: '4rem' }}>LOGS.</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
              {activities.map((item) => {
                const isOpen = selectedId === item.id;
                const imageUrl = item.icon?.url || item.image?.url || "/no-image.jpg";
                return (
                  <motion.div key={item.id} layout onClick={() => setSelectedId(isOpen ? null : item.id)} style={{ color: theme.deep, cursor: 'pointer' }}>
                    <div style={{ position: "relative", width: "100%", height: "320px", borderRadius: '15px', overflow: "hidden", border: `1px solid ${theme.deep}`, background: '#000' }}>
                      <Image 
                        src={imageUrl} 
                        alt={item.name} 
                        fill 
                        style={{ objectFit: 'contain', filter: 'grayscale(100%) blur(5px)', transition: '0.5s ease' }} 
                        onMouseEnter={(e) => { e.target.style.filter = 'grayscale(0%) blur(0px)'; }}
                        onMouseLeave={(e) => { e.target.style.filter = 'grayscale(100%) blur(5px)'; }}
                        unoptimized 
                      />
                    </div>
                    <div style={{ marginTop: '1.2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: "1.4rem", fontWeight: "900" }}>{item.name}</h3>
                        <span style={{ fontSize: "0.6rem", fontWeight: "900", border: `1px solid ${theme.deep}`, padding: '2px 8px' }}>{isOpen ? "CLOSE" : "READ"}</span>
                      </div>
                      <p style={{ marginTop: '0.8rem', fontSize: '0.85rem', lineHeight: '1.6', opacity: 0.7 }}>{item.introduction}</p>
                    </div>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginTop: "1rem", padding: "1.5rem", background: theme.deep, color: theme.white, fontSize: "0.85rem", lineHeight: "1.7", borderRadius: '10px', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: item.body }} />
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </section>

          <section id="contact" style={{ padding: '8rem 5%', textAlign: 'center', background: theme.white, color: theme.deep, borderTop: `1px solid ${theme.deep}` }}>
            <motion.h2 initial="hidden" whileInView="visible" variants={fadeInUp} style={{ fontSize: "2.8rem", fontWeight: "900", marginBottom: "1rem" }}>
              気軽に、<span style={{ color: theme.neon }}>遊びにきてね。</span>
            </motion.h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
              <a href="https://lin.ee/srY0QB3" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#06c755', color: '#fff', padding: '1rem 2.5rem', borderRadius: '50px', textDecoration: 'none', fontWeight: '900', boxShadow: '0 10px 20px rgba(6,199,85,0.2)' }}>
                <i className="fab fa-line" style={{ fontSize: '1.8rem' }}></i><span>LINEでサクッと聞く</span>
              </a>
            </div>
          </section>

          {/* ★修正ポイント：フッターにSNSアイコンを追加 */}
          <footer style={{ 
            padding: '4rem 5%', 
            textAlign: 'center', 
            background: theme.pale, 
            borderTop: '1px solid rgba(0,0,0,0.05)', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '1.5rem' 
          }}>
            {/* SNSアイコンエリア */}
            <div style={{ display: 'flex', gap: '2rem' }}>
              <a href="https://www.instagram.com/waseda_deweys" target="_blank" rel="noopener noreferrer" style={{ color: theme.deep, fontSize: '1.5rem' }}>
                <i className="fab fa-instagram"></i>
              </a>
              <a href="http://twitter.com/baseball_deweys" target="_blank" rel="noopener noreferrer" style={{ color: theme.deep, fontSize: '1.5rem' }}>
                <i className="fab fa-x-twitter"></i>
              </a>
            </div>
            
            {/* コピーライト */}
            <div style={{ fontSize: '0.65rem', color: '#999', letterSpacing: '0.2em' }}>
              © 2026 WASEDA DEWEYS
            </div>
          </footer>

        </motion.div>
      )}
    </main>
  );
}