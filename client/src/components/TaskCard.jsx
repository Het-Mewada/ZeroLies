import { TASKS } from '../utils/taskConfig';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

  .tc-card {
    background: #111;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    padding: 0.875rem 1rem;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    transition: border-color 0.15s;
    font-family: 'DM Sans', sans-serif;
  }
  .tc-card.actionable {
    cursor: pointer;
  }
  .tc-card.actionable:hover {
    border-color: rgba(255,255,255,0.13);
  }
  .tc-card.failed {
    opacity: 0.45;
  }

  .tc-icon {
    width: 2rem;
    height: 2rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .tc-body {
    flex: 1;
    min-width: 0;
  }

  .tc-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.2rem;
  }

  .tc-name {
    font-size: 0.8125rem;
    font-weight: 500;
    color: #f0f0f0;
    letter-spacing: 0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tc-badge {
    font-size: 0.5rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 0.2rem 0.45rem;
    border-radius: 4px;
    flex-shrink: 0;
  }
  .tc-badge.done    { background: rgba(74,255,160,0.1);  color: #4affa0; border: 1px solid rgba(74,255,160,0.2); }
  .tc-badge.failed  { background: rgba(255,90,90,0.1);   color: #ff5a5a; border: 1px solid rgba(255,90,90,0.2);  }
  .tc-badge.pending { background: rgba(255,255,255,0.05); color: rgba(240,240,240,0.3); border: 1px solid rgba(255,255,255,0.08); }

  .tc-desc {
    font-size: 0.6875rem;
    font-weight: 300;
    color: rgba(240,240,240,0.35);
    line-height: 1.5;
    letter-spacing: 0.01em;
  }

  .tc-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.625rem;
  }

  .tc-meta {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .tc-time {
    font-family: 'DM Mono', monospace;
    font-size: 0.5625rem;
    color: rgba(240,240,240,0.25);
    padding: 0.175rem 0.45rem;
    border-radius: 4px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.06);
    letter-spacing: 0.04em;
  }

  .tc-pts {
    font-family: 'DM Mono', monospace;
    font-size: 0.5625rem;
    font-weight: 500;
    padding: 0.175rem 0.4rem;
    border-radius: 4px;
    letter-spacing: 0.04em;
  }

  .tc-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.6875rem;
    font-weight: 500;
    padding: 0.35rem 0.75rem;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    background: rgba(232,255,74,0.1);
    color: #e8ff4a;
    border: 1px solid rgba(232,255,74,0.2);
    transition: opacity 0.15s, transform 0.1s;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }
  .tc-btn:hover  { opacity: 0.8; }
  .tc-btn:active { transform: scale(0.97); }
`;

export default function TaskCard({ taskId, taskData, onAction, disabled }) {
  const config = TASKS[taskId];
  if (!config) return null;

  const Icon = config.icon;
  const status = taskData?.status || 'pending';

  const badge = {
    completed: { cls: 'done', label: 'Done' },
    failed: { cls: 'failed', label: 'Failed' },
    pending: { cls: 'pending', label: 'Pending' },
  }[status];

  const isActionable = status === 'pending' && !config.isDerived && !disabled;

  const btnLabel = config.isStudy ? 'Open Timer'
    : taskId === 'wake' ? 'Check In'
      : 'Submit';

  return (
    <>
      <style>{styles}</style>
      <div className={`tc-card ${isActionable ? 'actionable' : ''} ${status === 'failed' ? 'failed' : ''}`}>

        {/* Icon */}
        <div className="tc-icon" style={{
          background: `${config.color}12`,
          border: `1px solid ${config.color}22`,
        }}>
          <Icon size={15} color={config.color} strokeWidth={2} />
        </div>

        {/* Body */}
        <div className="tc-body">
          <div className="tc-top">
            <span className="tc-name">{config.name}</span>
            <span className={`tc-badge ${badge.cls}`}>{badge.label}</span>
          </div>

          <p className="tc-desc">{config.description}</p>

          <div className="tc-footer">
            <div className="tc-meta">
              {config.timeWindow && (
                <span className="tc-time">
                  {config.timeWindow.start}–{config.timeWindow.end}
                </span>
              )}
              <span className="tc-pts" style={{
                background: `${config.color}10`,
                color: config.color,
              }}>
                +{config.points}pt{config.points > 1 ? 's' : ''}
              </span>
            </div>

            {isActionable && (
              <button className="tc-btn" onClick={() => onAction(taskId)}>
                {btnLabel}
              </button>
            )}
          </div>
        </div>

      </div>
    </>
  );
}