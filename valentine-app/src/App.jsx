import React, { useEffect, useMemo, useRef, useState } from "react";

export default function App() {
  // ✅ 50 memories: /public/memories/01.jpeg ... 50.jpeg
  const memories = useMemo(() => {
    const maps = ["My cutu Bubuuudii"];
    const moments = [
      "First time humne INSTA IDs share kri😘",
      "First time Numbers share kre ❤️❤️",
      "New Wow modes try krte the😂💕💕",
      "First Time tumne mera App try kiya💕💕",
      "That one clutch fight 😳🔥",
      "Landing together like always 🪂",
      "Dancing after win 💃🕺",
      "Matching outfits moment 😄",
      "When we laughed nonstop 😂",
      "Most peaceful ride together 🚗💨",
    ];

    const list = [];
    for (let i = 1; i <= 50; i++) {
      const num = String(i).padStart(2, "0");
      list.push({
        title: `Our Memories #${num} ⭐`,
        text: moments[(i - 1) % moments.length],
        map: maps[(i - 1) % maps.length],
        tag: "BEST DUO 💞",
        img: `/memories/${num}.jpeg`,
      });
    }
    return list;
  }, []);

  // Screens: 0 Tap -> 1 Memories -> 2 Proposal -> 3 Success
  const [screen, setScreen] = useState(0);
  const [index, setIndex] = useState(0);

  // Music autoplay muted then unmute on tap
  const [muted, setMuted] = useState(true);
  const audioRef = useRef(null);
  const [musicOn, setMusicOn] = useState(true);
  const [volume, setVolume] = useState(0.5);

  // Kiss + accepted
  const [accepted, setAccepted] = useState(false);
  const [showKiss, setShowKiss] = useState(false);

  // Autoplay slideshow
  const [autoPlay, setAutoPlay] = useState(true);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef(null);

  // Runaway "No"
  const stageRef = useRef(null);
  const noBtnRef = useRef(null);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [noReady, setNoReady] = useState(false);

  // For slide transitions
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Try autoplay muted on first load (may or may not work, but safe)
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = true;
    a.volume = volume;
    a.play().catch(() => {});
  }, []);

  async function startSurprise() {
    setScreen(1);

    // Unmute & play after user tap (reliable)
    try {
      const a = audioRef.current;
      if (a && musicOn) {
        setMuted(false);
        a.muted = false;
        a.volume = volume;
        await a.play();
      }
    } catch (e) {
      console.log("Music blocked:", e);
    }
  }

  function next() {
    setAnimKey((k) => k + 1);
    if (index < memories.length - 1) setIndex((i) => i + 1);
    else setScreen(2);
  }

  function prev() {
    setAnimKey((k) => k + 1);
    if (index > 0) setIndex((i) => i - 1);
  }

  // ✅ Auto slideshow: every 5s when on Memories screen
  useEffect(() => {
    if (screen !== 1) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }
    if (!autoPlay || paused) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setAnimKey((k) => k + 1);
      setIndex((i) => {
        if (i >= memories.length - 1) {
          // go to proposal when finished
          setScreen(2);
          return i;
        }
        return i + 1;
      });
    }, 5000);

    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [screen, autoPlay, paused, memories.length]);

  // Pause autoplay if user goes to proposal/success
  useEffect(() => {
    if (screen !== 1) {
      setPaused(false);
    }
  }, [screen]);

  // Place NO button initially inside proposal stage
  useEffect(() => {
    if (screen !== 2 || accepted) return;

    const stage = stageRef.current;
    const noBtn = noBtnRef.current;
    if (!stage || !noBtn) return;

    requestAnimationFrame(() => {
      const s = stage.getBoundingClientRect();
      const b = noBtn.getBoundingClientRect();
      const initX = Math.max(0, s.width - b.width - 16);
      const initY = Math.max(0, s.height - b.height - 16);
      setNoPos({ x: initX, y: initY });
      setNoReady(true);
    });
  }, [screen, accepted]);

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function moveNoAway(pointerClientX, pointerClientY) {
    const stage = stageRef.current;
    const noBtn = noBtnRef.current;
    if (!stage || !noBtn) return;

    const s = stage.getBoundingClientRect();
    const b = noBtn.getBoundingClientRect();

    const px = pointerClientX - s.left;
    const py = pointerClientY - s.top;

    const cx = noPos.x + b.width / 2;
    const cy = noPos.y + b.height / 2;

    let dx = cx - px;
    let dy = cy - py;

    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
      dx = Math.random() - 0.5;
      dy = Math.random() - 0.5;
    }

    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    dx /= len;
    dy /= len;

    const jump = window.innerWidth < 640 ? 120 : 180;

    let nx = noPos.x + dx * jump;
    let ny = noPos.y + dy * jump;

    const maxX = s.width - b.width;
    const maxY = s.height - b.height;

    nx = clamp(nx, 0, maxX);
    ny = clamp(ny, 0, maxY);

    if (Math.abs(nx - noPos.x) < 5 && Math.abs(ny - noPos.y) < 5) {
      nx = Math.random() * maxX;
      ny = Math.random() * maxY;
    }

    setNoPos({ x: nx, y: ny });
  }

  function onStageMouseMove(e) {
    if (screen !== 2 || accepted) return;
    const noBtn = noBtnRef.current;
    if (!noBtn || !noReady) return;

    const b = noBtn.getBoundingClientRect();
    const mx = e.clientX;
    const my = e.clientY;

    const cx = b.left + b.width / 2;
    const cy = b.top + b.height / 2;
    const dist = Math.hypot(mx - cx, my - cy);

    if (dist < 140) moveNoAway(mx, my);
  }

  function onNoPointerDown(e) {
    if (screen !== 2 || accepted) return;
    e.preventDefault();
    const t = e.touches?.[0];
    moveNoAway(t ? t.clientX : e.clientX, t ? t.clientY : e.clientY);
  }

  async function toggleMusic() {
    const a = audioRef.current;
    setMusicOn((v) => !v);
    if (!a) return;

    if (musicOn) {
      a.pause();
    } else {
      try {
        setMuted(false);
        a.muted = false;
        a.volume = volume;
        await a.play();
      } catch (e) {
        console.log("Music blocked:", e);
      }
    }
  }

  function sayYes() {
    setAccepted(true);
    setShowKiss(true);

    setTimeout(() => {
      setShowKiss(false);
      setScreen(3);
    }, 2000);
  }

  function restart() {
    setAccepted(false);
    setShowKiss(false);
    setIndex(0);
    setScreen(0);
    setAnimKey((k) => k + 1);
    setPaused(false);

    try {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
      setMuted(true);
    } catch {}
  }

  return (
    <div className="page">
      <FloatingHearts />
      <SparkleLayer />

      <audio
        ref={audioRef}
        src="/music/song.mp3"
        loop
        preload="auto"
        autoPlay
        muted={muted}
      />

      <div className="shell">
        <header className="topbar">
          <div className="brand glowText">💖 For my bubuudii</div>

          <div className="music">
            <button className="btn ghost small" onClick={toggleMusic}>
              {musicOn ? "🔊 Music On" : "🔇 Music Off"}
            </button>

            <input
              className="vol"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="volume"
            />
          </div>
        </header>

        <main className="card" ref={stageRef} onMouseMove={onStageMouseMove}>
          {screen === 0 && <TapSurprise onTap={startSurprise} />}

          {screen === 1 && (
            <MemorySlide
              key={animKey} // force re-trigger entrance animation
              item={memories[index]}
              index={index}
              total={memories.length}
              onNext={next}
              onPrev={prev}
              onSkip={() => setScreen(2)}
              autoPlay={autoPlay}
              setAutoPlay={setAutoPlay}
              paused={paused}
              setPaused={setPaused}
            />
          )}

          {screen === 2 && (
            <Proposal
              onYes={sayYes}
              noBtnRef={noBtnRef}
              noPos={noPos}
              noReady={noReady}
              onNoPointerDown={onNoPointerDown}
            />
          )}

          {screen === 3 && <SuccessScreen onRestart={restart} />}
        </main>

        
      </div>

      {showKiss && <KissOverlay name="bubuudii" />}

      <style>{css}</style>
    </div>
  );
}

/* ---------------- Components ---------------- */

function TapSurprise({ onTap }) {
  return (
    <div className="content tap">
      <div className="gift wobble">🎁</div>
      <h1 className="title">Tap to reveal a surprise for bubuudii 💖</h1>
      <p className="text">A small memory journey… made just for you.</p>

      <button className="btn big shine" onClick={onTap}>
        Tap to Start Match 🎮✨
      </button>

      <div className="tinyRow">
        <span className="tinyChip">✨ Cute slideshow starts automatically</span>
        <span className="tinyChip hot">💞 Love vibes ON</span>
      </div>

      <p className="smallNote">Music will be audible after tap.</p>
    </div>
  );
}

function MemorySlide({
  item,
  index,
  total,
  onNext,
  onPrev,
  onSkip,
  autoPlay,
  setAutoPlay,
  paused,
  setPaused,
}) {
  const [imgOk, setImgOk] = useState(true);

  useEffect(() => {
    setImgOk(true);
  }, [item.img]);

  return (
    <div className="content slideIn">
      <div className="progress">
        <div className="dots">
          {Array.from({ length: Math.min(total, 8) }).map((_, i) => (
            <span
              key={i}
              className={`dot ${
                Math.floor((index / total) * 8) === i ? "active" : ""
              }`}
            />
          ))}
        </div>
        <div className="count">
          {index + 1}/{total}
        </div>
      </div>

      <div className="hero">
        <div className="photoFrame floaty">
          {imgOk ? (
            <img
              className="photo"
              src={item.img}
              alt={item.title}
              onError={() => setImgOk(false)}
            />
          ) : (
            <div className="photo placeholder">
              <div className="phIcon">📷</div>
              <div className="phText">Missing: {item.img}</div>
            </div>
          )}
          <div className="frameGlow" />
        </div>
      </div>

      <div className="pubgRow">
        <span className="chip">💌 {item.map}</span>
        <span className="chip hot">{item.tag}</span>
      </div>

      <h2 className="title">{item.title}</h2>
      <p className="text">{item.text}</p>

      <div className="miniControls">
        <button
          className={`pill ${autoPlay ? "on" : ""}`}
          onClick={() => setAutoPlay((v) => !v)}
        >
          {autoPlay ? "▶ Auto ON" : "⏸ Auto OFF"}
        </button>

        <button
          className={`pill ${paused ? "on" : ""}`}
          onClick={() => setPaused((v) => !v)}
          disabled={!autoPlay}
          title={!autoPlay ? "Turn Auto ON first" : ""}
        >
          {paused ? "▶ Resume" : "⏸ Pause"}
        </button>

        <button className="pill" onClick={onSkip}>
          Skip →
        </button>
      </div>

      <div className="actions">
        <button className="btn ghost" onClick={onPrev} disabled={index === 0}>
          ← Back
        </button>
        <button className="btn" onClick={onNext}>
          {index === total - 1 ? "Go to Surprise 💘" : "Next →"}
        </button>
      </div>

      <button className="linkBtn" onClick={onSkip}>
        Go to Proposal →
      </button>
    </div>
  );
}

function Proposal({ onYes, noBtnRef, noPos, noReady, onNoPointerDown }) {
  return (
    <div className="content proposal popIn">
      <div className="bigHeart">💘</div>

      <h1 className="title">Bubudiii… will you be my Valentine? 💘</h1>

      <p className="text type">Bubudiii, you are my favorite person 💖</p>

      <p className="text">
        bubuuuu apkoooo bhottt bhott jaada pyaar krta hu......i lovee you sooo muchhhhhh 🥺💞
      </p>

      <p className="text">
        Winner Winner… <b>Happy Couple Dinner</b> 🍗💞
      </p>

      <div className="proposalStage">
        <button className="btn yes shine" onClick={onYes}>
          Yes 😍
        </button>

        <button
          ref={noBtnRef}
          className="btn no"
          style={{
            transform: noReady
              ? `translate(${noPos.x}px, ${noPos.y}px)`
              : "translate(0,0)",
            position: "absolute",
          }}
          onPointerDown={onNoPointerDown}
          onTouchStart={onNoPointerDown}
          onMouseEnter={(e) => onNoPointerDown(e)}
        >
          No 🙈
        </button>
      </div>

      <div className="smallNote">Try pressing “No” 😄</div>
    </div>
  );
}

function KissOverlay({ name = "bubuudii" }) {
  return (
    <div className="kissOverlay" aria-hidden="true">
      <div className="kissCard">
        <div className="kissTitle">A kiss for {name} 💋</div>

        <div className="kissScene">
          <div className="face left">
            <div className="eye" />
            <div className="eye" />
            <div className="blush" />
          </div>

          <div className="heartPop">💖</div>

          <div className="face right">
            <div className="eye" />
            <div className="eye" />
            <div className="blush" />
          </div>

          <div className="kissMark">💋</div>

          <div className="burst h1">💗</div>
          <div className="burst h2">💞</div>
          <div className="burst h3">💕</div>
          <div className="burst h4">💓</div>
        </div>

        <div className="kissSub">Happy Valentine’s, my favorite person ✨</div>
      </div>
    </div>
  );
}

function SuccessScreen({ onRestart }) {
  return (
    <div className="content success popIn">
      <h1 className="title">Yayyyy bubuudii! 🥰</h1>
      <p className="text">Happy Couple Forever 💖</p>

      <div className="finalBadge bounce">🍗 Winner Winner: Happy Couple Dinner 💞</div>

      <div className="cartoonWrap">
        <CoupleCartoon />
      </div>

      <button className="btn ghost" onClick={onRestart}>
        Replay ↻
      </button>
    </div>
  );
}

function FloatingHearts() {
  const hearts = Array.from({ length: 16 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 6,
    dur: 6 + Math.random() * 5,
    size: 14 + Math.random() * 22,
  }));

  return (
    <div className="hearts" aria-hidden="true">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="heart"
          style={{
            left: `${h.left}%`,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.dur}s`,
            fontSize: `${h.size}px`,
          }}
        >
          ❤
        </span>
      ))}
    </div>
  );
}

// extra sparkle layer
function SparkleLayer() {
  const dots = Array.from({ length: 18 }).map((_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random() * 4,
    dur: 3 + Math.random() * 3,
  }));

  return (
    <div className="sparkles" aria-hidden="true">
      {dots.map((d) => (
        <span
          key={d.id}
          className="sparkDot"
          style={{
            top: `${d.top}%`,
            left: `${d.left}%`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

function CoupleCartoon() {
  return (
    <div className="couple">
      <div className="bubble">Happy Couple 💕</div>

      <div className="row">
        <div className="person">
          <div className="head">
            <div className="eye e1" />
            <div className="eye e2" />
            <div className="smile" />
          </div>
          <div className="body" id="coupleimg">
              <img src={`/memories/coupleimg1.jpeg`}/>
          </div>
        </div>

        <div className="between">
          <div className="pulseHeart">💗</div>
          <div className="spark s1" />
          <div className="spark s2" />
          <div className="spark s3" />
        </div>

        <div className="person">
          <div className="head">
            <div className="eye e1" />
            <div className="eye e2" />
            <div className="smile" />
          </div>
          <div className="body" id="coupleimg">
            <img src={`/memories/coupleimg2.jpeg`}/>

          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- CSS ---------------- */

const css = `
:root{
  --bg1:#ffeff6;
  --bg2:#fff6ea;
  --card:#ffffffcc;
  --text:#2b2b2b;
  --muted:#6b6b6b;
  --shadow: 0 18px 45px rgba(0,0,0,.12);
  --radius: 26px;
}
*{box-sizing:border-box}
body{margin:0;font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;}
.page{
  min-height:100vh;
  background: radial-gradient(1200px 700px at 20% 10%, var(--bg2), transparent),
              radial-gradient(1200px 700px at 80% 20%, var(--bg1), transparent),
              linear-gradient(135deg, #fff, #ffe7f1);
  color:var(--text);
  display:flex;
  align-items:center;
  justify-content:center;
  padding:20px;
  overflow:hidden;
  position:relative;
}
.shell{width:min(920px, 100%); position:relative; z-index:2;}
.topbar{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:10px 6px 16px;
  gap:10px;
  flex-wrap:wrap;
}
.brand{font-weight:1000; letter-spacing:.3px;}
.glowText{animation: glow 2.2s ease-in-out infinite;}
@keyframes glow{
  0%,100%{filter: drop-shadow(0 0 0 rgba(255,45,125,0))}
  50%{filter: drop-shadow(0 10px 18px rgba(255,45,125,.25))}
}
.music{display:flex; align-items:center; gap:10px;}
.vol{width:120px}

.card{
  background:var(--card);
  backdrop-filter: blur(10px);
  border:1px solid rgba(255,255,255,.8);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding:24px;
  position:relative;
  overflow:hidden;
}
.footer{
  padding:10px 6px 0;
  color:var(--muted);
  font-size:13px;
  text-align:center;
}

.content{
  display:flex;
  flex-direction:column;
  align-items:center;
  text-align:center;
  gap:14px;
  min-height:580px;
  justify-content:center;
  position:relative;
}
.tap .gift{font-size:56px;}
.wobble{animation: wobble 1.6s ease-in-out infinite;}
@keyframes wobble{
  0%,100%{transform:rotate(0deg) scale(1)}
  25%{transform:rotate(-6deg) scale(1.02)}
  50%{transform:rotate(6deg) scale(1.05)}
  75%{transform:rotate(-3deg) scale(1.02)}
}

.progress{
  width:100%;
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
}
.dots{display:flex; gap:8px; align-items:center;}
.dot{width:10px;height:10px;border-radius:999px;background: rgba(0,0,0,.12);}
.dot.active{background: rgba(255,64,129,.75); transform: scale(1.08);}
.count{color:var(--muted); font-size:14px;}

.hero{width:100%; display:flex; justify-content:center;}
.photoFrame{
  width:min(680px, 100%);
  border-radius:24px;
  position:relative;
  overflow:hidden;
  box-shadow: 0 16px 40px rgba(0,0,0,.12);
  border:1px solid rgba(255,255,255,.7);
  background: rgba(255,255,255,.6);
}
.floaty{animation: floaty 3.6s ease-in-out infinite;}
@keyframes floaty{
  0%,100%{transform: translateY(0)}
  50%{transform: translateY(-6px)}
}
.photo{
  width:100%;
  height:340px;
  object-fit:contain;
  display:block;
  background: rgba(255,255,255,.6);
}
.frameGlow{
  position:absolute; inset:-40px;
  background: radial-gradient(circle at 30% 20%, rgba(255,45,125,.25), transparent 55%),
              radial-gradient(circle at 80% 60%, rgba(255,122,89,.22), transparent 55%);
  filter: blur(14px);
  opacity:.8;
  pointer-events:none;
  animation: glowMove 4.5s ease-in-out infinite;
}
@keyframes glowMove{
  0%,100%{transform: translate(0,0) scale(1)}
  50%{transform: translate(12px,-10px) scale(1.02)}
}
.placeholder{
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
}
.phIcon{font-size:36px}
.phText{color:var(--muted); font-size:14px; margin-top:6px}

.title{
  margin:0;
  font-size: clamp(26px, 3.2vw, 44px);
  line-height:1.1;
}
.text{
  margin:0;
  color:var(--muted);
  font-size: clamp(14px, 1.6vw, 18px);
  max-width: 60ch;
}

.actions{
  margin-top:6px;
  display:flex;
  gap:12px;
  flex-wrap:wrap;
  justify-content:center;
}
.btn{
  border:none;
  padding:12px 18px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff2d7d, #ff7a59);
  color:white;
  font-weight:900;
  cursor:pointer;
  box-shadow: 0 12px 25px rgba(255,45,125,.25);
  transition: transform .15s ease, opacity .15s ease;
  user-select:none;
  position:relative;
  overflow:hidden;
}
.btn:hover{transform: translateY(-1px) scale(1.01)}
.btn:active{transform: translateY(0px) scale(.99)}
.btn:disabled{opacity:.45; cursor:not-allowed;}
.btn.ghost{
  background: rgba(255,255,255,.85);
  color: #ff2d7d;
  border: 1px solid rgba(255,45,125,.22);
  box-shadow:none;
}
.btn.small{padding:10px 14px; font-weight:800;}
.btn.big{padding:14px 22px; font-size:18px;}
.btn.yes{font-size:18px; padding:14px 22px;}
.btn.no{
  background: rgba(255,255,255,.85);
  color:#333;
  border:1px solid rgba(0,0,0,.12);
  box-shadow: 0 10px 22px rgba(0,0,0,.10);
  will-change: transform;
  transition: transform .18s ease;
  touch-action: none;
}

/* shiny button animation */
.shine::after{
  content:"";
  position:absolute;
  top:-40%;
  left:-60%;
  width:60%;
  height:180%;
  transform: rotate(22deg);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent);
  animation: shineMove 2.4s ease-in-out infinite;
}
@keyframes shineMove{
  0%{left:-70%}
  50%{left:120%}
  100%{left:120%}
}

.linkBtn{
  margin-top:6px;
  background: transparent;
  border: none;
  color: #ff2d7d;
  font-weight: 900;
  cursor: pointer;
  text-decoration: underline;
}

.proposal .bigHeart{font-size:54px; animation: pop 1.6s ease-in-out infinite;}
@keyframes pop{0%,100%{transform:scale(1)} 50%{transform:scale(1.12)}}

.proposalStage{
  width: min(640px, 100%);
  height: 200px;
  position: relative;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(255,255,255,.9), rgba(255,255,255,.55));
  border:1px solid rgba(0,0,0,.06);
  overflow:hidden;
  display:flex;
  align-items:flex-end;
  justify-content:center;
  padding:18px;
  gap:14px;
}
.smallNote{color:var(--muted); font-size:14px}

.hearts{
  position:absolute;
  inset:0;
  overflow:hidden;
  pointer-events:none;
  z-index:1;
}

#coupleimg{
object-fit:cover}
.heart{
  position:absolute;
  bottom:-40px;
  opacity:.35;
  animation: floatUp linear infinite;
}
@keyframes floatUp{
  0%{transform: translateY(0) translateX(0) rotate(0deg); opacity:.0}
  10%{opacity:.35}
  100%{transform: translateY(-120vh) translateX(30px) rotate(25deg); opacity:0}
}

/* Sparkles */
.sparkles{
  position:absolute;
  inset:0;
  pointer-events:none;
  z-index:1;
}
.sparkDot{
  position:absolute;
  width:8px;height:8px;border-radius:999px;
  background: rgba(255,255,255,.9);
  box-shadow: 0 10px 22px rgba(255,45,125,.16);
  animation: sparkleDot ease-in-out infinite;
}
@keyframes sparkleDot{
  0%,100%{transform: scale(.6); opacity:.25}
  50%{transform: scale(1.2); opacity:.8}
}

/* PUBG chips */
.pubgRow{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  justify-content:center;
  margin-top:-4px;
}
.chip{
  padding:8px 12px;
  border-radius:999px;
  font-weight:900;
  font-size:13px;
  background: rgba(255,255,255,.9);
  border:1px solid rgba(0,0,0,.08);
  color:#333;
}
.chip.hot{
  color:#ff2d7d;
  border-color: rgba(255,45,125,.22);
  background: rgba(255,45,125,.10);
}
.tinyRow{display:flex; gap:10px; flex-wrap:wrap; justify-content:center;}
.tinyChip{
  padding:7px 10px; border-radius:999px;
  font-weight:900; font-size:12px;
  background: rgba(255,255,255,.85);
  border:1px solid rgba(0,0,0,.06);
}
.tinyChip.hot{color:#ff2d7d; border-color: rgba(255,45,125,.2); background: rgba(255,45,125,.08);}

/* mini controls */
.miniControls{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  justify-content:center;
  margin-top:2px;
}
.pill{
  border:1px solid rgba(0,0,0,.08);
  background: rgba(255,255,255,.88);
  padding:10px 12px;
  border-radius:999px;
  font-weight:900;
  cursor:pointer;
}
.pill.on{
  color:#ff2d7d;
  border-color: rgba(255,45,125,.22);
  background: rgba(255,45,125,.10);
}

#coupleimg img{
height:120px;
width:120px;
border-radius:5px;
}

/* entrance transitions */
.slideIn{animation: slideIn .55s ease both;}
@keyframes slideIn{
  from{opacity:0; transform: translateY(10px) scale(.98)}
  to{opacity:1; transform: translateY(0) scale(1)}
}
.popIn{animation: popIn .55s ease both;}
@keyframes popIn{
  from{opacity:0; transform: scale(.96)}
  to{opacity:1; transform: scale(1)}
}

/* type highlight line */
.type{
  position:relative;
  font-weight:900;
  color:#ff2d7d;
  display:inline-block;
  padding:6px 12px;
  border-radius:999px;
  background: rgba(255,45,125,.10);
  border: 1px solid rgba(255,45,125,.16);
  animation: softGlow 1.4s ease-in-out infinite;
}
@keyframes softGlow{
  0%,100%{transform:scale(1); box-shadow:none}
  50%{transform:scale(1.02); box-shadow: 0 12px 24px rgba(255,45,125,.12)}
}

/* Kiss overlay */
.kissOverlay{
  position:fixed;
  inset:0;
  background: rgba(0,0,0,.25);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:9999;
  backdrop-filter: blur(4px);
}
.kissCard{
  width:min(520px, 92vw);
  border-radius:26px;
  padding:18px 18px 16px;
  background: rgba(255,255,255,.92);
  border:1px solid rgba(255,255,255,.8);
  box-shadow: 0 20px 55px rgba(0,0,0,.22);
  text-align:center;
}
.kissTitle{font-weight:1000; letter-spacing:.2px; color:#ff2d7d;}
.kissSub{margin-top:8px; color:rgba(0,0,0,.65); font-weight:800;}
.kissScene{
  margin-top:14px;
  position:relative;
  height:160px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 22px;
  overflow:hidden;
  border-radius:22px;
  background: linear-gradient(135deg, rgba(255,255,255,.85), rgba(255,231,241,.55));
  border:1px solid rgba(0,0,0,.05);
}
.face{
  width:92px; height:92px;
  border-radius:999px;
  background: rgba(255,220,200,.95);
  border:1px solid rgba(0,0,0,.06);
  display:flex;
  align-items:center;
  justify-content:center;
  gap:12px;
  position:relative;
  box-shadow: 0 12px 26px rgba(0,0,0,.12);
}
.face .eye{
  width:10px;height:10px;border-radius:999px;background:#222;
  animation: blink2 1.8s infinite;
}
@keyframes blink2{
  0%, 85%, 100%{transform:scaleY(1)}
  90%{transform:scaleY(.15)}
}
.blush{
  position:absolute; left:50%; bottom:16px; transform:translateX(-50%);
  width:44px;height:18px;border-radius:999px;
  background: rgba(255,45,125,.16);
}
.heartPop{
  font-size:38px;
  animation: heartPulse .7s ease-in-out infinite;
}
@keyframes heartPulse{0%,100%{transform:scale(1)} 50%{transform:scale(1.18)}}
.face.left{animation: moveInL 2s ease forwards;}
.face.right{animation: moveInR 2s ease forwards;}
@keyframes moveInL{0%{transform:translateX(0)} 55%{transform:translateX(78px)} 100%{transform:translateX(64px)}}
@keyframes moveInR{0%{transform:translateX(0)} 55%{transform:translateX(-78px)} 100%{transform:translateX(-64px)}}
.kissMark{
  position:absolute; left:50%; top:58px;
  transform:translateX(-50%) scale(.2);
  opacity:0;
  font-size:30px;
  animation: kissPop 2s ease forwards;
}
@keyframes kissPop{
  0%{opacity:0; transform:translateX(-50%) scale(.2)}
  45%{opacity:0; transform:translateX(-50%) scale(.2)}
  60%{opacity:1; transform:translateX(-50%) scale(1.15)}
  100%{opacity:0; transform:translateX(-50%) scale(.9)}
}
.burst{
  position:absolute; left:50%; top:54px;
  transform:translate(-50%,-50%) scale(.2);
  opacity:0; animation: burst 2s ease forwards;
  font-size:22px;
}
.h1{animation-delay:.65s}
.h2{animation-delay:.72s}
.h3{animation-delay:.80s}
.h4{animation-delay:.88s}
@keyframes burst{
  0%{opacity:0; transform:translate(-50%,-50%) scale(.2)}
  55%{opacity:0; transform:translate(-50%,-50%) scale(.2)}
  70%{opacity:1; transform:translate(-50%,-50%) scale(1)}
  100%{opacity:0; transform:translate(calc(-50% + 90px), calc(-50% - 70px)) scale(1.1)}
}

/* success cartoon */
.cartoonWrap{width:min(700px, 100%); margin-top:8px;}
.finalBadge{
  padding:10px 14px;
  border-radius:999px;
  font-weight:1000;
  color:#ff2d7d;
  background: rgba(255,45,125,.10);
  border:1px solid rgba(255,45,125,.16);
}
.bounce{animation: bounce 1.6s ease-in-out infinite;}
@keyframes bounce{
  0%,100%{transform: translateY(0)}
  50%{transform: translateY(-6px)}
}

.couple{
  width:100%;
  border-radius: 24px;
  padding:18px;
  background: linear-gradient(135deg, rgba(255,255,255,.95), rgba(255,255,255,.65));
  border:1px solid rgba(0,0,0,.06);
  box-shadow: 0 18px 40px rgba(0,0,0,.10);
}
.bubble{
  display:inline-block;
  padding:8px 14px;
  border-radius:999px;
  background: rgba(255,45,125,.12);
  color:#ff2d7d;
  font-weight:900;
  border:1px solid rgba(255,45,125,.18);
  margin-bottom:12px;
}
.row{
  display:flex;
  align-items:flex-end;
  justify-content:center;
  gap:22px;
  padding:10px 0 16px;
}
.person{width:130px; display:flex; flex-direction:column; align-items:center; gap:10px;}
.head{
  width:92px;height:92px;border-radius:999px;
  background: rgba(255,220,200,.9);
  border:1px solid rgba(0,0,0,.06);
  position:relative;
  box-shadow: 0 10px 22px rgba(0,0,0,.08);
}
.eye{
  width:10px;height:10px;border-radius:999px;
  background:#2b2b2b;
  position:absolute; top:35px;
  animation: blink 4s infinite;
}
.e1{left:28px} .e2{right:28px}
@keyframes blink{0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.1); }}
.smile{
  width:34px;height:18px;
  border-bottom: 5px solid rgba(255,45,125,.8);
  border-radius: 0 0 50px 50px;
  position:absolute; left:50%; top:52px;
  transform: translateX(-50%);
}
.body{
  width:100px;height:92px;border-radius: 26px;
  background: rgba(255,45,125,.18);
  border:1px solid rgba(255,45,125,.18);
}
.between{width:70px;height:140px; position:relative; display:flex; align-items:center; justify-content:center;}
.pulseHeart{font-size:44px; animation: pulse 1.2s ease-in-out infinite;}
@keyframes pulse{0%,100%{transform:scale(1)} 50%{transform:scale(1.18)}}
.spark{
  width:10px;height:10px;border-radius:999px;
  background: rgba(255,122,89,.8);
  position:absolute;
  animation: sparkle 1.4s ease-in-out infinite;
}
.s1{left:18px; top:22px; animation-delay:.1s}
.s2{right:22px; top:40px; animation-delay:.35s}
.s3{left:48px; bottom:22px; animation-delay:.6s}
@keyframes sparkle{0%,100%{transform:scale(.7); opacity:.35} 50%{transform:scale(1.2); opacity:.9}}

@media (max-width: 520px){
  .content{min-height:620px}
  .proposalStage{height:230px}
  .vol{width:90px}
}
`;
