import { useState, useEffect } from 'react';

export default function CalendarGrid({ calendar = [], onDayClick }) {
  const [hovered, setHovered] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const weeks = [];
  for (let i = 0; i < calendar.length; i += 7) {
    weeks.push(calendar.slice(i, i + 7));
  }

  const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const cellColor = (color) => {
    if (color === 'green') return 'rgba(74,255,160,0.75)';
    if (color === 'red') return 'rgba(255,90,90,0.6)';
    return 'rgba(255,255,255,0.06)';
  };

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // Get current date to disable clicking future days without scores
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');

        .cg-card {
          border-radius: 12px;
          padding: 1rem 1.125rem 0.875rem;
          background: #111;
          border: 1px solid rgba(255,255,255,0.07);
          font-family: 'DM Sans', sans-serif;
          position: relative;
        }

        .cg-heading {
        padding-left:15px;
          font-size: 0.5625rem;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-weight: 500;
          color: rgba(240,240,240,0.3);
          margin-bottom: 0.875rem;
        }
.cg-scroll {
  padding: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  cursor: pointer;

  display: flex;
  justify-content: center;   /* horizontal center */
  align-items: center;       /* vertical center */
}
        .cg-scroll::-webkit-scrollbar { display: none; }

        .cg-inner {
          display: flex;
          gap: 12px;
          min-width: fit-content;
        }

        .cg-day-labels {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-right: 3px;
        }

        .cg-day-label {
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Mono', monospace;
          font-size: 0.4375rem;
          color: rgba(240,240,240,0.2);
          width: 11px;
          height: 11px;
          flex-shrink: 0;
        }

        .cg-week {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .cg-cell {
          width: 11px;
          height: 11px;
          border-radius: 2px;
          flex-shrink: 0;
          transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), border 0.1s;
        }
        
        .cg-cell.clickable {
          cursor: pointer;
        }
        .cg-cell.clickable:hover {
          transform: scale(1.6);
          z-index: 10;
          position: relative;
          border: 1px solid rgba(255,255,255,0.5);
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        }

        .cg-legend {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 0.875rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .cg-legend-item {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .cg-legend-dot {
          width: 7px;
          height: 7px;
          border-radius: 2px;
          flex-shrink: 0;
        }

        .cg-legend-label {
          font-size: 0.5625rem;
          letter-spacing: 0.08em;
          color: rgba(240,240,240,0.25);
          font-weight: 400;
        }

        /* ── Floating Tooltip ── */
        .cg-tooltip {
          position: fixed;
          pointer-events: none;
          z-index: 100;
          background: rgba(10,10,10,0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 0.75rem 0.875rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-width: 140px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.05);
          color: #fff;
          
          /* Smooth transform animation */
          transition: transform 0.15s cubic-bezier(0.2, 0, 0, 1), opacity 0.15s ease;
          opacity: 0;
          transform: translate(15px, 15px) scale(0.95);
        }
        
        .cg-tooltip.visible {
          opacity: 1;
          transform: translate(15px, 15px) scale(1);
        }

        .cg-tt-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding-bottom: 0.5rem;
        }

        .cg-tt-date {
          font-family: 'DM Mono', monospace;
          font-size: 0.625rem;
          letter-spacing: 0.05em;
          color: rgba(240,240,240,0.5);
          text-transform: uppercase;
        }

        .cg-tt-status {
          font-size: 0.5rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
        }
        .cg-tt-status.pass { background: rgba(74,255,160,0.1); color: #4affa0; }
        .cg-tt-status.fail { background: rgba(255,90,90,0.1); color: #ff5a5a; }
        .cg-tt-status.pending { background: rgba(255,255,255,0.05); color: rgba(240,240,240,0.4); }

        .cg-tt-row {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .cg-tt-score-label {
          font-size: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: rgba(240,240,240,0.35);
        }

        .cg-tt-score {
          font-family: 'DM Mono', monospace;
          font-size: 1.125rem;
          font-weight: 400;
          color: #f0f0f0;
          line-height: 1;
        }
      `}</style>

      <div className="cg-card" onMouseLeave={() => setHovered(null)}>
        <p className="cg-heading">Year overview</p>

        <div className="cg-scroll" onMouseMove={handleMouseMove}>
          <div className="cg-inner">
            <div className="cg-day-labels">
              {DAY_LABELS.map((d, i) => (
                <div key={i} className="cg-day-label">{i % 2 === 0 ? d : ''}</div>
              ))}
            </div>

            {weeks.map((week, wi) => (
              <div key={wi} className="cg-week">
                {week.map((day) => {
                  return (
                    <div
                      key={day.date}
                      className="cg-cell clickable"
                      style={{ background: cellColor(day.color) }}
                      onMouseEnter={() => setHovered(day)}
                      onClick={() => onDayClick && onDayClick(day.date)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="cg-legend">
          {[
            { color: 'rgba(255,255,255,0.06)', label: 'Upcoming' },
            { color: 'rgba(255,90,90,0.6)', label: 'Missed' },
            { color: 'rgba(74,255,160,0.75)', label: 'Passed' },
          ].map(({ color, label }) => (
            <div key={label} className="cg-legend-item">
              <div className="cg-legend-dot" style={{ background: color }} />
              <span className="cg-legend-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Smooth Tooltip */}
      <div
        className={`cg-tooltip ${hovered ? 'visible' : ''}`}
        style={{ left: mousePos.x, top: mousePos.y }}
      >
        {hovered && (
          <>
            <div className="cg-tt-top">
              <span className="cg-tt-date">
                {new Date(hovered.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className={`cg-tt-status ${hovered.color === 'green' ? 'pass' : hovered.color === 'red' ? 'fail' : 'pending'}`}>
                {hovered.color === 'green' ? 'PASS' : hovered.color === 'red' ? 'FAIL' : 'PENDING'}
              </span>
            </div>
            <div className="cg-tt-row">
              <span className="cg-tt-score-label">Total Score</span>
              <span className="cg-tt-score">
                {hovered.score.toFixed(1)}{' '}
                <span style={{ fontSize: '0.625rem', color: 'rgba(240,240,240,0.3)' }}>/ 25.0</span>
              </span>
            </div>
          </>
        )}
      </div>
    </>
  );
}