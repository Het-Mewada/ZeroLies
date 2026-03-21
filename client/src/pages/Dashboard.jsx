import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, TrendingUp, Trophy, Zap } from 'lucide-react';
import CalendarGrid from '../components/CalendarGrid';
import { getDashboard } from '../utils/api';
import { getTodayMessage, TASK_ORDER } from '../utils/taskConfig';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');

  .db-root {
    font-family: 'DM Sans', sans-serif;
    background: #0a0a0a;
    color: #f0f0f0;
    min-height: 100vh;
    padding: 1.5rem 1rem 5rem;
  }

  .db-inner {
    max-width: 90%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  /* ── Streak ── */
  .db-streak {
    border-radius: 16px;
    padding: 1.5rem 1.5rem 1.25rem;
    background: #111;
    border: 1px solid rgba(255,255,255,0.07);
    position: relative;
    overflow: hidden;
  }
  .db-streak.active {
    border-color: rgba(232,255,74,0.2);
  }
  .db-streak.active::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 160px 100px at 100% 0%, rgba(232,255,74,0.07), transparent 70%);
    pointer-events: none;
  }

  .db-streak-top {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    line-height: 1;
  }

  .db-streak-num {
    font-family: 'DM Mono', monospace;
    font-size: clamp(2.75rem, 11vw, 3.5rem);
    font-weight: 300;
    letter-spacing: -0.04em;
    color: #f0f0f0;
    line-height: 1;
  }
  .db-streak.active .db-streak-num { color: #e8ff4a; }

  .db-streak-unit {
    font-size: 0.75rem;
    font-weight: 400;
    color: rgba(240,240,240,0.35);
    letter-spacing: 0.06em;
    padding-bottom: 0.35rem;
  }

  .db-streak-msg {
    margin-top: 0.625rem;
    font-size: 0.6875rem;
    color: rgba(240,240,240,0.3);
    font-weight: 300;
    letter-spacing: 0.01em;
    font-style: italic;
  }

  /* ── Stats row ── */
  .db-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .db-stat {
    border-radius: 12px;
    padding: 0.875rem 0.75rem;
    background: #111;
    border: 1px solid rgba(255,255,255,0.07);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .db-stat-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .db-stat-label {
    font-size: 0.5625rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-weight: 500;
    color: rgba(240,240,240,0.3);
  }

  .db-stat-val {
    font-family: 'DM Mono', monospace;
    font-size: 1.375rem;
    font-weight: 400;
    color: #f0f0f0;
    line-height: 1;
  }
  .db-stat-val.pass { color: #4affa0; }
  .db-stat-val.risk { color: #ff5a5a; }

  .db-stat-sub {
    font-size: 0.5625rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(240,240,240,0.2);
    font-weight: 500;
  }

  /* ── Score bar ── */
  .db-score {
    border-radius: 12px;
    padding: 1rem 1.125rem;
    background: #111;
    border: 1px solid rgba(255,255,255,0.07);
  }

  .db-score-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.875rem;
  }

  .db-score-label {
    font-size: 0.5625rem;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-weight: 500;
    color: rgba(240,240,240,0.3);
  }

  .db-score-val {
    font-family: 'DM Mono', monospace;
    font-size: 0.6875rem;
    font-weight: 400;
    color: rgba(240,240,240,0.4);
  }
  .db-score-val em {
    font-style: normal;
    font-size: 0.8125rem;
    color: #f0f0f0;
  }

  .db-track {
    height: 2px;
    border-radius: 99px;
    background: rgba(255,255,255,0.06);
    position: relative;
  }

  .db-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.8s cubic-bezier(0.16,1,0.3,1);
    position: relative;
  }
  .db-fill::after {
    content: '';
    position: absolute;
    right: -3px; top: -3px;
    width: 7px; height: 7px;
    border-radius: 50%;
    background: inherit;
  }

  .db-threshold {
    position: absolute;
    top: -5px;
    left: 70%;
    width: 1px;
    height: 12px;
    background: rgba(240,240,240,0.2);
  }
  .db-threshold-lbl {
    position: absolute;
    top: -20px;
    left: 70%;
    transform: translateX(-50%);
    font-family: 'DM Mono', monospace;
    font-size: 0.5rem;
    color: rgba(240,240,240,0.25);
    letter-spacing: 0.05em;
  }

  /* ── Spinner / Error ── */
  .db-center {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    min-height: 100vh; gap: 0.75rem;
    background: #0a0a0a;
  }
  .db-spinner {
    width: 22px; height: 22px; border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,0.07);
    border-top-color: #e8ff4a;
    animation: dbspin 0.7s linear infinite;
  }
  @keyframes dbspin { to { transform: rotate(360deg); } }
  .db-err {
    font-size: 0.75rem;
    color: #ff5a5a;
    font-family: 'DM Sans', sans-serif;
  }
  .db-retry {
    font-size: 0.75rem; font-weight: 500;
    padding: 0.45rem 1rem; border-radius: 7px;
    background: rgba(232,255,74,0.1);
    border: 1px solid rgba(232,255,74,0.2);
    color: #e8ff4a; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
  }

  @media (max-width: 360px) {
    .db-root { padding: 1.25rem 0.875rem 4rem; }
    .db-stat-val { font-size: 1.2rem; }
  }
  @media (min-width: 640px) {
    .db-root { padding: 2rem 1.5rem 5rem; }
    .db-inner { gap: 0.875rem; }
  }
`;

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadDashboard(); }, []);

  async function loadDashboard() {
    try {
      setLoading(true); setError(null);
      const res = await getDashboard();
      setData(res.data);
    } catch (err) {
      setError('Failed to load dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <><style>{styles}</style>
      <div className="db-center"><div className="db-spinner" /></div></>
  );

  if (error) return (
    <><style>{styles}</style>
      <div className="db-center">
        <p className="db-err">{error}</p>
        <button className="db-retry" onClick={loadDashboard}>Retry</button>
      </div></>
  );

  const streak = data?.streak || 0;
  const todayScore = data?.today?.score || 0;
  const todayTasks = data?.today?.tasks || {};

  let completedCount = 0;
  TASK_ORDER.forEach(id => { if (todayTasks[id]?.status === 'completed') completedCount++; });

  const isPassing = todayScore >= 17.5;
  const progressPct = Math.min(100, (todayScore / 25) * 100);
  const fillColor = isPassing ? '#4affa0' : todayScore >= 10 ? '#f59e0b' : '#ff5a5a';

  return (
    <><style>{styles}</style>
      <div className="db-root">
        <div className="db-inner">

          {/* Streak */}
          <div className={`db-streak ${streak > 0 ? 'active' : ''}`}>
            <div className="db-streak-top">
              <span className="db-streak-num">{streak}</span>
              <span className="db-streak-unit">day{streak !== 1 ? 's' : ''}</span>
            </div>
            <p className="db-streak-msg">"{getTodayMessage()}"</p>
          </div>

          {/* Stats */}
          <div className="db-stats">
            <div className="db-stat">
              <div className="db-stat-top">
                <span className="db-stat-label">Score</span>
                <Trophy size={12} color="rgba(245,158,11,0.6)" />
              </div>
              <span className="db-stat-val">{todayScore}</span>
              <span className="db-stat-sub">/ 25 pts</span>
            </div>

            <div className="db-stat">
              <div className="db-stat-top">
                <span className="db-stat-label">Tasks</span>
                <Zap size={12} color="rgba(232,255,74,0.5)" />
              </div>
              <span className="db-stat-val">{completedCount}</span>
              <span className="db-stat-sub">/ 9 done</span>
            </div>

            <div className="db-stat">
              <div className="db-stat-top">
                <span className="db-stat-label">Status</span>
                <TrendingUp size={12} color={isPassing ? 'rgba(74,255,160,0.5)' : 'rgba(255,90,90,0.5)'} />
              </div>
              <span className={`db-stat-val ${isPassing ? 'pass' : 'risk'}`}>
                {isPassing ? 'PASS' : 'RISK'}
              </span>
              <span className="db-stat-sub">today</span>
            </div>
          </div>

          {/* Score bar */}
          <div className="db-score">
            <div className="db-score-header">
              <span className="db-score-label">Daily score</span>
              <span className="db-score-val"><em>{todayScore}</em> / 25.0</span>
            </div>
            <div className="db-track">
              <div className="db-fill" style={{ width: `${progressPct}%`, background: fillColor }} />
              <div className="db-threshold" />
              <span className="db-threshold-lbl">17.5</span>
            </div>
          </div>

          {/* Calendar */}
          <CalendarGrid
            calendar={data?.calendar || []}
            onDayClick={(date) => navigate(`/day/${date}`)}
          />

        </div>
      </div></>
  );
}