import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Clock, Image as ImageIcon } from 'lucide-react';
import { getDayDetail } from '../utils/api';
import { TASKS, TASK_ORDER } from '../utils/taskConfig';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');

  .dd-root {
    font-family: 'DM Sans', sans-serif;
    background: #0a0a0a;
    color: #f0f0f0;
    min-height: 100vh;
    padding: 1.5rem 1rem 5rem;
  }

  .dd-inner {
    max-width: 500px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  /* ── Header ── */
  .dd-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }

  .dd-back {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    color: #f0f0f0;
    cursor: pointer;
    transition: all 0.2s;
  }
  .dd-back:hover {
    background: rgba(255,255,255,0.1);
    transform: translateX(-2px);
  }

  .dd-title-wrap {
    display: flex;
    flex-direction: column;
  }
  
  .dd-title {
    font-family: 'DM Mono', monospace;
    font-size: 1.25rem;
    font-weight: 500;
    line-height: 1.2;
  }
  
  .dd-subtitle {
    font-size: 0.625rem;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: rgba(240,240,240,0.4);
    margin-top: 0.1rem;
  }

  .dd-status-badge {
    margin-left: auto;
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0.35rem 0.65rem;
    border-radius: 6px;
  }
  .dd-status-badge.pass { background: rgba(74,255,160,0.1); color: #4affa0; border: 1px solid rgba(74,255,160,0.2); }
  .dd-status-badge.fail { background: rgba(255,90,90,0.1); color: #ff5a5a; border: 1px solid rgba(255,90,90,0.2); }
  .dd-status-badge.pending { background: rgba(255,255,255,0.05); color: rgba(240,240,240,0.5); border: 1px solid rgba(255,255,255,0.1); }

  /* ── Summary Card ── */
  .dd-summary {
    background: #111;
    border-radius: 12px;
    padding: 1.25rem;
    border: 1px solid rgba(255,255,255,0.07);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .dd-score-blk {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .dd-score-val {
    font-family: 'DM Mono', monospace;
    font-size: 2rem;
    font-weight: 400;
    line-height: 1;
  }
  .dd-score-lbl {
    font-size: 0.5625rem;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: rgba(240,240,240,0.35);
  }

  /* ── Section ── */
  .dd-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .dd-section-title {
    font-size: 0.625rem;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-weight: 600;
    color: rgba(240,240,240,0.3);
    padding-left: 0.25rem;
  }

  /* ── Task Item ── */
  .dd-task {
    background: #111;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .dd-task-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
  
  .dd-task-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .dd-task-icon {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 8px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(240,240,240,0.5);
  }
  
  .dd-task-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #f0f0f0;
  }
  
  .dd-task-meta {
    font-family: 'DM Mono', monospace;
    font-size: 0.625rem;
    color: rgba(240,240,240,0.3);
    margin-top: 0.15rem;
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }
  
  .dd-task-status {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .dd-task-status.done { color: #4affa0; }
  .dd-task-status.missed { color: #ff5a5a; }
  .dd-task-status.pending { color: rgba(240,240,240,0.3); }

  .dd-proof-img {
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(0,0,0,0.2);
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .dd-proof-img:hover { opacity: 0.85; }

  /* ── Study Sessions ── */
  .dd-session {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 10px;
    padding: 0.875rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .dd-session-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .dd-session-dur {
    font-family: 'DM Mono', monospace;
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .dd-session-time {
    font-family: 'DM Mono', monospace;
    font-size: 0.625rem;
    color: rgba(240,240,240,0.4);
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }
  
  .dd-session-badge {
    font-size: 0.5rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
  }
  .dd-session-badge.valid { background: rgba(74,255,160,0.1); color: #4affa0; }
  .dd-session-badge.invalid { background: rgba(255,90,90,0.1); color: #ff5a5a; }

  .dd-snaps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 0.5rem;
  }

  .dd-snap-item {
    aspect-ratio: 4/3;
    border-radius: 6px;
    object-fit: cover;
    border: 1px solid rgba(255,255,255,0.1);
    background: #000;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .dd-snap-item:hover { opacity: 0.8; }

  /* ── Modal ── */
  .dd-modal {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.9);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    backdrop-filter: blur(5px);
  }
  .dd-modal-img {
    max-width: 100%;
    max-height: 90vh;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  }
  .dd-modal-close {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    background: rgba(255,255,255,0.1);
    border: none;
    color: #fff;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .dd-modal-close:hover { background: rgba(255,255,255,0.2); }

  /* ── Loader & Empty ── */
  .dd-center {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    min-height: 60vh;
    background: #0a0a0a;
  }
  .dd-spinner {
    width: 24px; height: 24px; border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,0.08);
    border-top-color: #e8ff4a;
    animation: ddspin 0.7s linear infinite;
  }
  @keyframes ddspin { to { transform: rotate(360deg); } }
  
  .dd-empty {
    font-size: 0.8125rem;
    color: rgba(240,240,240,0.3);
    text-align: center;
    padding: 2rem 0;
    font-style: italic;
  }
`;

export default function DayDetail() {
  const { date } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalImg, setModalImg] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await getDayDetail(date);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [date]);

  if (loading) {
    return (
      <><style>{styles}</style><div className="dd-center"><div className="dd-spinner" /></div></>
    );
  }

  if (!data) {
    return (
      <><style>{styles}</style><div className="dd-center"><p className="dd-empty">Failed to load data.</p></div></>
    );
  }

  const { score, isSuccess, tasks = {}, studySessions = [] } = data;

  // Status logic based on date
  const todayStr = new Date().toISOString().split('T')[0];
  const isFuture = date > todayStr;
  const isToday = date === todayStr;
  const isPassing = score >= 17.5;

  let statusText = 'FAILED';
  let badgeClass = 'fail';

  if (isFuture) {
    statusText = 'UPCOMING';
    badgeClass = 'pending';
  } else if (isToday) {
    statusText = isPassing ? 'PASSING' : 'IN PROGRESS';
    badgeClass = isPassing ? 'pass' : 'pending';
  } else {
    statusText = isPassing ? 'PASSED' : 'FAILED';
    badgeClass = isPassing ? 'pass' : 'fail';
  }

  // Format date nicely
  const d = new Date(date);
  const dateStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <>
      <style>{styles}</style>
      <div className="dd-root">
        <div className="dd-inner">

          {/* Header */}
          <div className="dd-header">
            <button className="dd-back" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} />
            </button>
            <div className="dd-title-wrap">
              <h1 className="dd-title">{date}</h1>
              <span className="dd-subtitle">{dateStr}</span>
            </div>
            <div className={`dd-status-badge ${badgeClass}`}>
              {statusText}
            </div>
          </div>

          {/* Summary */}
          <div className="dd-summary">
            <div className="dd-score-blk">
              <span className="dd-score-val" style={{ color: isPassing ? '#4affa0' : '#ff5a5a' }}>
                {score.toFixed(1)}
              </span>
              <span className="dd-score-lbl">Total Score</span>
            </div>
            <div className="dd-score-blk" style={{ alignItems: 'flex-end' }}>
              <span className="dd-score-val" style={{ fontSize: '1.25rem' }}>
                {studySessions.length}
              </span>
              <span className="dd-score-lbl">Study Sessions</span>
            </div>
          </div>

          {/* Tasks List */}
          <div className="dd-section">
            <h2 className="dd-section-title">Tasks Breakdown</h2>

            {TASK_ORDER.map(id => {
              const taskConfig = TASKS[id];
              const taskLog = tasks ? tasks[id] : null;
              
              let status = taskLog?.status || 'pending';
              // If the day is in the past and task isn't completed, it's failed/missed
              if (!isFuture && !isToday && status !== 'completed') {
                status = 'failed';
              }
              
              const isDone = status === 'completed';
              const isMissed = status === 'failed';
              const ProofIcon = taskConfig.icon;

              return (
                <div key={id} className="dd-task" style={{ opacity: isDone ? 1 : 0.6 }}>
                  <div className="dd-task-top">
                    <div className="dd-task-info">
                      <div className="dd-task-icon">
                        <ProofIcon size={16} />
                      </div>
                      <div>
                        <div className="dd-task-name">{taskConfig.name}</div>
                        <div className="dd-task-meta">
                          {taskConfig.points} pts
                          {taskLog?.completedAt && (
                            <>
                              <span style={{ opacity: 0.3 }}>•</span>
                              <Clock size={9} />
                              {new Date(taskLog.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={`dd-task-status ${isDone ? 'done' : isMissed ? 'missed' : 'pending'}`}>
                      {isDone && <CheckCircle size={14} />}
                      {isMissed && <XCircle size={14} />}
                      {!isDone && !isMissed && '-'}
                      <span>{status}</span>
                    </div>
                  </div>

                  {/* Proof Image if available */}
                  {taskLog?.proof?.imageUrl && (
                    <img
                      src={taskLog.proof.imageUrl}
                      alt={`${taskConfig.name} proof`}
                      className="dd-proof-img"
                      onClick={() => setModalImg(taskLog.proof.imageUrl)}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Study Sessions */}
          <div className="dd-section" style={{ marginTop: '0.5rem' }}>
            <h2 className="dd-section-title">Study Sessions</h2>

            {studySessions.length === 0 ? (
              <p className="dd-empty">No study sessions recorded on this day.</p>
            ) : (
              studySessions.map((session, i) => (
                <div key={session._id || i} className="dd-session">
                  <div className="dd-session-header">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span className="dd-session-dur">{session.duration} min focus</span>
                      <span className="dd-session-time">
                        {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {session.endTime ? ` → ${new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ' (active)'}
                      </span>
                    </div>
                    <span className={`dd-session-badge ${session.isValid ? 'valid' : 'invalid'}`}>
                      {session.isValid ? 'Valid' : 'Invalid'}
                    </span>
                  </div>

                  {session.snapshots && session.snapshots.length > 0 && (
                    <div className="dd-snaps-grid">
                      {session.snapshots.map((snap, j) => (
                        <img
                          key={j}
                          src={snap.url}
                          alt="Focus snapshot"
                          className="dd-snap-item"
                          onClick={() => setModalImg(snap.url)}
                          title={new Date(snap.takenAt).toLocaleTimeString()}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

        </div>
      </div>

      {/* Image Modal */}
      {modalImg && (
        <div className="dd-modal" onClick={() => setModalImg(null)}>
          <button className="dd-modal-close" onClick={() => setModalImg(null)}><XCircle size={24} /></button>
          <img src={modalImg} alt="Expanded proof" className="dd-modal-img" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
