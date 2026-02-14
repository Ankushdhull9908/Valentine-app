import React, { useEffect, useMemo, useRef, useState } from "react";

export default function App() {
  // ✅ 50 PUBG memories: /public/memories/01.jpg ... 50.jpg
  const memories = useMemo(() => {
    const maps = ["Erangel", "Livik", "Miramar", "Sanhok", "Vikendi", "Nusa"];
    const moments = [
      "Our first match together 🎧",
      "First Chicken Dinner with you 🍗",
      "Late night talks in the lobby 🌙",
      "When you saved me (best teammate!) 🥺",
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
        title: `Match Highlight #${num} ⭐`,
        text: moments[(i - 1) % moments.length],
        map: maps[(i - 1) % maps.length],
        tag: i % 5 === 0 ? "CHICKEN DINNER 🍗" : "BEST DUO 💞",
        img: `/memories/${num}.jpg`,
      });
    }
    return list;
  }, []);

  // Screens:
  // 0 = Tap Surprise
  // 1 = Memories
  // 2 = Proposal
  // 3 = Success
  const [screen, setScreen] = useState(0);
  const [index, setIndex] = useState(0);

  const [accepted, setAccepted] = useState(false);
  const [showKiss, setShowKiss] = useState(false);

  // Music
  const audioRef = useRef(null);
  const [musicOn, setMusicOn] = useState(true);
  const [volume, setVolume] = useState(0.5);

  // Runaway "No" button
  const stageRef = useRef(null);
  const noBtnRef = useRef(null);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [noReady, setNoReady] = useState(false);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  async function startSurprise() {
    setScreen(1);

    // Start music AFTER user tap
    try {
      if (audioRef.current && musicOn) {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      }
    } catch (e) {
      console.log("Music play blocked:", e);
    }
  }

  function next() {
    if (index < memories.length - 1) setIndex((i) => i + 1);
    else setScreen(2);
  }
  function prev() {
    if (index > 0) setIndex((i) => i - 1);
  }

  // Place NO button initially inside proposal stage
  useEffect(() => {
    if (screen !== 2 || accepted) return;

    const stage = stageRef.current;
    const noBtn = noBtnRef.current;
    if (!stage || !noBtn) return;

    // Wait a tick so button has size
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

    // If stuck on edge, random jump
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
    setMusicOn((v) => !v);

    if (!musicOn) {
      // turning ON
      try {
        await audioRef.current?.play();
      } catch (e) {
        console.log("Music play blocked:", e);
      }
    } else {
      // turning OFF
      audioRef.current?.pause();
    }
  }

  function sayYes() {
    setAccepted(true);

    // Kiss overlay first
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

    // stop music on replay (optional)
    try {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
    } catch {}
  }

  return (
    <div className="page">
      <FloatingHearts />

      {/* Background music file: public/music/song.mp3 */}
      <audio ref={audioRef} src="/music/song.mp3" loop preload="auto" />

      <div className="shell">
        <header className="topbar">
          <div className="brand">💖 For my bubuudii</div>

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
              item={memories[index]}
              index={index}
              total={memories.length}
              onNext={next}
              onPrev={prev}
              onSkip={() => setScreen(2)}
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

        <footer className="footer">
          <span>
            Put photos in <b>public/memories</b> (01.jpg..50.jpg) and song in{" "}
            <b>public/music/song.mp3</b>
          </span>
        </footer>
      </div>

      {/* ✅ Kiss overlay is rendered here */}
      {showKiss && <KissOverlay name="bubuudii" />}

      <style>{css}</style>
    </div>
  );
}

/* ---------------- Components ---------------- */

function TapSurprise({ onTap }) {
  return (
    <div className="content tap">
      <div className="gift">🎁</div>
      <h1 className="title">Tap to reveal a surprise for bubuudii 💖</h1>
      <p className="text">A small memory journey… made just for you.</p>

      <button className="btn big" onClick={onTap}>
        Tap to Start Match 🎮✨
      </button>

      <p className="smallNote">Music will start after tap.</p>
    </div>
  );
}

function MemorySlide({ item, index, total, onNext, onPrev, onSkip }) {
  const [imgOk, setImgOk] = useState(true);

  useEffect(() => {
    setImgOk(true); // reset when slide changes
  }, [item.img]);

  return (
    <div className="content">
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
      </div>

      {/* ✅ chips OUTSIDE hero */}
      <div className="pubgRow">
        <span className="chip">🗺 {item.map}</span>
        <span className="chip hot">{item.tag}</span>
      </div>

      <h2 className="title">{item.title}</h2>
      <p className="text">{item.text}</p>

      <div className="actions">
        <button className="btn ghost" onClick={onPrev} disabled={index === 0}>
          ← Back
        </button>
        <button className="btn" onClick={onNext}>
          {index === total - 1 ? "Go to Surprise 💘" : "Next →"}
        </button>
      </div>

      <button className="linkBtn" onClick={onSkip}>
        Skip to Proposal →
      </button>
    </div>
  );
}

function Proposal({ onYes, noBtnRef, noPos, noReady, onNoPointerDown }) {
  return (
    <div className="content proposal">
      <div className="bigHeart">💘</div>

      <h1 className="title">Bubu… will you be my Valentine? 💘</h1>

      <p className="text type">Bubu, you are my favorite person 💖</p>

      <p className="text">
        You’re not just my duo partner… you’re my comfort, my smile, my home.
      </p>

      <p className="text">
        Winner Winner… <b>Happy Couple Dinner</b> 🍗💞
      </p>

      <div className="proposalStage">
        <button className="btn yes" onClick={onYes}>
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
    <div className="content success">
      <h1 className="title">Yayyyy bubuudii! 🥰</h1>
      <p className="text">Happy Couple Forever 💖</p>

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
  const hearts = Array.from({ length: 14 }).map((_, i) => ({
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
          <div className="body" />
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
          <div className="body" />
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
.shell{width:min(900px, 100%); position:relative; z-index:2;}
.topbar{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:10px 6px 16px;
  gap:10px;
  flex-wrap:wrap;
}
.brand{font-weight:1000; letter-spacing:.3px;}
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
  min-height:560px;
  justify-content:center;
}
.tap .gift{font-size:56px; animation: pop 1.4s ease-in-out infinite;}

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
.photo{
  width:min(640px, 100%);
  height:320px;
  object-fit:cover;
  border-radius:22px;
  box-shadow: 0 14px 35px rgba(0,0,0,.12);
  border:1px solid rgba(255,255,255,.7);
  background: rgba(255,255,255,.6);
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
  font-size: clamp(26px, 3.2vw, 42px);
  line-height:1.1;
}
.text{
  margin:0;
  color:var(--muted);
  font-size: clamp(14px, 1.6vw, 18px);
  max-width: 56ch;
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

.linkBtn{
  margin-top:6px;
  background: transparent;
  border: none;
  color: #ff2d7d;
  font-weight: 800;
  cursor: pointer;
  text-decoration: underline;
}

.proposal .bigHeart{font-size:52px; animation: pop 1.6s ease-in-out infinite;}
@keyframes pop{0%,100%{transform:scale(1)} 50%{transform:scale(1.12)}}

.proposalStage{
  width: min(620px, 100%);
  height: 190px;
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
.between{width:120px;height:140px; position:relative; display:flex; align-items:center; justify-content:center;}
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
  .content{min-height:600px}
  .proposalStage{height:220px}
  .vol{width:90px}
}
`;
