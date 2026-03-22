import { useState, useEffect, useRef } from 'react';
import { Play, Square, Camera, Clock, Target, Zap } from 'lucide-react';

export default function StudyTimer({ studyData, onStart, onStop, onSnapshot }) {
  const [elapsed, setElapsed] = useState(0);
  const [ms, setMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [lastSnapshotAt, setLastSnapshotAt] = useState(0);
  const secRef = useRef(null);
  const msRef = useRef(null);
  const snapshotIntervalRef = useRef(null);

  const activeSession = studyData?.activeSession;

  useEffect(() => {
    if (activeSession) {
      const startTime = new Date(activeSession.startTime).getTime();
      const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
      setElapsed(elapsedSec);
      setIsRunning(true);
      setLastSnapshotAt(activeSession.snapshots?.length || 0);
    } else {
      setIsRunning(false);
      setElapsed(0);
      setMs(0);
    }
  }, [activeSession]);

  useEffect(() => {
    if (isRunning) {
      secRef.current = setInterval(() => setElapsed(prev => prev + 1), 1000);
    } else { clearInterval(secRef.current); }
    return () => clearInterval(secRef.current);
  }, [isRunning]);

  useEffect(() => {
    if (isRunning) {
      msRef.current = setInterval(() => setMs(Date.now() % 1000), 33);
    } else { clearInterval(msRef.current); setMs(0); }
    return () => clearInterval(msRef.current);
  }, [isRunning]);

  useEffect(() => {
    if (isRunning && elapsed > 0) {
      const elapsedMin = Math.floor(elapsed / 60);
      const expectedSnapshots = Math.floor(elapsedMin / 5);
      if (expectedSnapshots > lastSnapshotAt) {
        onSnapshot?.();
        setLastSnapshotAt(expectedSnapshots);
      }
    }
  }, [isRunning, elapsed, lastSnapshotAt, onSnapshot]);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const msDisplay = ms.toString().padStart(3, '0').slice(0, 3);
  const totalMinutes = studyData?.totalMinutes || 0;
  const goal = 180;
  const progress = Math.min(100, (totalMinutes / goal) * 100);
  const remaining = Math.max(0, goal - totalMinutes);
  const currentMin = Math.floor(elapsed / 60);
  const nextSnapshotIn = 5 - (currentMin % 5);

  const stats = [
    { icon: Clock, value: totalMinutes, label: 'today' },
    { icon: Target, value: remaining, label: 'left' },
    { icon: Camera, value: activeSession?.snapshots?.length || 0, label: 'snaps' },
    { icon: Zap, value: isRunning ? `${nextSnapshotIn}m` : '—', label: 'next' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');

        /* ── Full-viewport timer hero ── */
        .st-hero {
          height: 100dvh;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          position: relative;
        }


        .st-time-row {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          line-height: 1;
          padding: 0 1rem;
        }
        .st-time {
          font-family: 'DM Mono', monospace;
          font-size: clamp(3rem, 17vw, 9rem);
          font-weight: 200;
          line-height: 1;
          transition: color 0.4s;
          white-space: nowrap;
        }
        .st-time.running { color: #e8ff4a; }
        .st-time.idle    { color: #f0f0f0; }

        .st-ms {
          font-family: 'DM Mono', monospace;
          font-size: clamp(1rem, 4vw, 3rem);
          font-weight: 300;
          padding-bottom: 0.3em;
          transition: color 0.4s;
        }
        .st-ms.running { color: rgba(221, 255, 0, 0.5); }
        .st-ms.idle    { color: rgba(240,240,240,0.25); }

        .st-status {
          margin-top: 0.75rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.5625rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(240,240,240,0.3);
          font-weight: 500;
        }

        .st-content {
          width: 68%;
          margin: 0 auto;
          padding: 2rem 0 3rem;
        }

        .st-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.8rem 1.5rem;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8125rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          border: none;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.1s;
          margin-bottom: 1.75rem;
        }
        .st-btn:active { transform: scale(0.98); }
        .st-btn:hover  { opacity: 0.88; }
        .st-btn.start  { background: #e8ff4a; color: #0a0a0a; }
        .st-btn.stop   { background: transparent; color: #ff5a5a; border: 1px solid rgba(255,90,90,0.3); }

        .st-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .st-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          padding: 0.65rem 0.25rem;
          border-radius: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
        }
        .st-stat-val {
          font-family: 'DM Mono', monospace;
          font-size: 0.9375rem;
          font-weight: 500;
          color: #f0f0f0;
          line-height: 1;
        }
        .st-stat-lbl {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.5625rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(240,240,240,0.35);
          font-weight: 500;
        }

        .st-progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .st-progress-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.5625rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(240,240,240,0.3);
          font-weight: 500;
        }
        .st-progress-pct {
          font-family: 'DM Mono', monospace;
          font-size: 0.6875rem;
          font-weight: 500;
          color: #e8ff4a;
        }
        .st-track {
          height: 2px;
          border-radius: 99px;
          background: rgba(255,255,255,0.06);
          overflow: hidden;
        }
        .st-fill {
          height: 100%;
          border-radius: 99px;
          background: #e8ff4a;
          transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
        }

        /* Mobile */

        @media (max-width: 360px) {
          .st-stats { gap: 0.3rem; }
          .st-stat-val { font-size: 0.8125rem; }
        }
      `}</style>

      {/* Hero: full-viewport timer */}
      <div className="st-hero">
        <div className="st-time-row">
          <span className={`st-time ${isRunning ? 'running' : 'idle'}`}>{formatTime(elapsed)}</span>
          <span className={`st-ms  ${isRunning ? 'running' : 'idle'}`}>.{msDisplay}</span>
        </div>
        <p className="st-status">{isRunning ? 'session active' : 'ready to focus'}</p>
      </div>

      <div className="st-content">
        {!isRunning ? (
          <button className="st-btn start" onClick={onStart}><Play size={15} /> Start Session</button>
        ) : (
          <button className="st-btn stop" onClick={onStop}><Square size={15} /> Stop Session</button>
        )}

        <div className="st-stats">
          {stats.map(({ icon: Icon, value, label }) => (
            <div className="st-stat" key={label}>
              <Icon size={12} color="rgba(240,240,240,0.25)" />
              <span className="st-stat-val">{value}</span>
              <span className="st-stat-lbl">{label}</span>
            </div>
          ))}
        </div>

        <div>
          <div className="st-progress-header">
            <span className="st-progress-label">Daily goal</span>
            <span className="st-progress-pct">{Math.round(progress)}%</span>
          </div>
          <div className="st-track">
            <div className="st-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </>
  );
}