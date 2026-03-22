import { useState, useEffect, useCallback, useRef } from 'react';
import { BookOpen, CheckCircle, XCircle, Clock } from 'lucide-react';
import StudyTimer from '../components/StudyTimer';
import { getStudyToday, startStudy, stopStudy, addSnapshot, uploadImage } from '../utils/api';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');

  .sp-root {
    --bg: #0a0a0a;
    --surface: #111;
    --border: rgba(255,255,255,0.07);
    --text: #f0f0f0;
    --muted: rgba(240,240,240,0.35);
    --accent: #e8ff4a;
    --success: #4affa0;
    --danger: #ff5a5a;
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100dvh;
    min-height: 100vh;
    /* No horizontal padding here — StudyTimer hero needs full width */
    padding: 0;
  }

  /* Sessions section sits below the timer hero */
  .sp-sessions-wrap {
    width: 68%;
    margin: 0 auto;
    padding-bottom: 5rem;
  }

  /* ── Sessions card ── */
  .sp-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.25rem 1.25rem 1rem;
    margin-top: 0.5rem;
  }

  .sp-section-label {
    font-size: 0.5625rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted);
    font-weight: 500;
    margin-bottom: 0.75rem;
  }

  .sp-sessions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .sp-session {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.7rem 0.875rem;
    border-radius: 10px;
    background: rgba(255,255,255,0.025);
    border: 1px solid var(--border);
  }

  .sp-session-body {
    flex: 1;
    min-width: 0;
  }

  .sp-session-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .sp-duration {
    font-family: 'DM Mono', monospace;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text);
  }

  .sp-badge {
    font-size: 0.5rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    flex-shrink: 0;
  }
  .sp-badge.valid   { background: rgba(74,255,160,0.1); color: var(--success); border: 1px solid rgba(74,255,160,0.2); }
  .sp-badge.invalid { background: rgba(255,90,90,0.1);  color: var(--danger);  border: 1px solid rgba(255,90,90,0.2);  }

  .sp-session-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.25rem;
    flex-wrap: wrap;
  }

  .sp-time {
    font-family: 'DM Mono', monospace;
    font-size: 0.625rem;
    color: var(--muted);
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .sp-snaps {
    font-size: 0.625rem;
    color: var(--muted);
  }

  /* ── Spinner ── */
  .sp-spinner-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100dvh;
    min-height: 100vh;
    background: var(--bg);
  }

  .sp-spinner {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,0.08);
    border-top-color: #e8ff4a;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Toast ── */
  .sp-toast-wrap {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 90;
    animation: sp-up 0.2s ease;
    /* prevent toast from stretching on wide screens */
    max-width: calc(100vw - 2rem);
  }

  .sp-toast {
    padding: 0.6rem 1.1rem;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
    letter-spacing: 0.01em;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  }
  .sp-toast.success { background: rgba(74,255,160,0.12); color: var(--success); border: 1px solid rgba(74,255,160,0.25); }
  .sp-toast.error   { background: rgba(255,90,90,0.12);  color: var(--danger);  border: 1px solid rgba(255,90,90,0.25);  }

  @keyframes sp-up {
    from { opacity: 0; transform: translateX(-50%) translateY(6px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0);   }
  }

  @media (max-width: 360px) {
    .sp-session { padding: 0.6rem 0.625rem; }
    .sp-duration { font-size: 0.8125rem; }
  }
`;

export default function Study() {
  const [studyData, setStudyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const capturingRef = useRef(false);

  useEffect(() => { loadStudy(); }, []);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Automatically restore camera if a session is currently active (e.g., after page refresh)
  useEffect(() => {
    if (studyData?.activeSession && (!streamRef.current || !streamRef.current.active)) {
      requestCameraPermission().catch(err => console.error('[CAMERA] Auto-restore failed:', err));
    }
  }, [studyData?.activeSession]);

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }

  async function loadStudy(isRefresh = false) {
    try {
      if (!isRefresh) setLoading(true);
      const res = await getStudyToday();
      setStudyData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function showToastMsg(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function requestCameraPermission() {
    if (streamRef.current && streamRef.current.active) {
      const video = videoRef.current;
      if (video && video.readyState >= 2) return true;
    }

    try {
      stopCamera();
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = mediaStream;

      const video = videoRef.current;
      if (video) {
        video.srcObject = mediaStream;
        try { await video.play(); } catch (e) { console.warn('[CAMERA] play() warning:', e); }

        await new Promise((resolve) => {
          const check = () => {
            if (video.readyState >= 2 && video.videoWidth > 0) resolve();
            else setTimeout(check, 200);
          };
          check();
          setTimeout(resolve, 5000);
        });

        console.log(`[CAMERA] Ready — ${video.videoWidth}x${video.videoHeight}`);
      }

      return true;
    } catch (err) {
      console.error('[CAMERA] Permission denied:', err);
      showToastMsg('Camera access denied. Snapshots won\'t auto-capture.', 'error');
      return false;
    }
  }

  async function handleStart() {
    try {
      const granted = await requestCameraPermission();
      if (!granted) {
        showToastMsg('Camera required for snapshots. Please allow access.', 'error');
      }
      await startStudy();
      showToastMsg('Session started');
      await loadStudy(true);
    } catch (err) {
      showToastMsg(err.response?.data?.error || 'Failed to start', 'error');
    }
  }

  async function handleStop() {
    try {
      const res = await stopStudy();
      showToastMsg(res.data.message, res.data.isValid ? 'success' : 'error');
      await loadStudy(true);
    } catch (err) {
      showToastMsg(err.response?.data?.error || 'Failed to stop', 'error');
    } finally {
      stopCamera();
    }
  }

  const handleAutoSnapshot = useCallback(async () => {
    if (capturingRef.current) return false;
    capturingRef.current = true;

    try {
      if (!streamRef.current || !streamRef.current.active || !videoRef.current || videoRef.current.readyState < 2) {
        const granted = await requestCameraPermission();
        if (!granted) return false;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return false;

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (video.videoWidth === 0 || video.videoHeight === 0) return false;
      }

      const w = video.videoWidth;
      const h = video.videoHeight;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, w, h);

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) => b ? resolve(b) : reject(new Error('toBlob returned null')),
          'image/jpeg',
          0.7
        );
      });

      const formData = new FormData();
      formData.append('image', blob, `snapshot_${Date.now()}.jpg`);
      const uploadRes = await uploadImage(formData);
      const imageUrl = uploadRes.data.url;

      await addSnapshot({ imageUrl });
      showToastMsg('📸 Auto-snapshot saved');
      await loadStudy(true);
      return true;
    } catch (err) {
      console.error('[AUTO-SNAPSHOT] Failed:', err);
      showToastMsg('Auto-snapshot failed', 'error');
      return false;
    } finally {
      capturingRef.current = false;
    }
  }, []);

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="sp-spinner-wrap"><div className="sp-spinner" /></div>
        <video ref={videoRef} autoPlay playsInline muted
          style={{ position: 'fixed', top: 0, left: 0, width: '640px', height: '480px', pointerEvents: 'none', zIndex: -1, clipPath: 'inset(100%)' }} />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </>
    );
  }

  const completedSessions = (studyData?.sessions || []).filter(s => !s.isActive);

  return (
    <>
      <style>{styles}</style>
      <div className="sp-root">

        {/* Timer — renders its own full-viewport hero + scrollable content */}
        <StudyTimer
          studyData={studyData}
          onStart={handleStart}
          onStop={handleStop}
          onAutoSnapshot={handleAutoSnapshot}
        />

        {/* Today's sessions — appear after scrolling past timer content */}
        {completedSessions.length > 0 && (
          <div className="sp-sessions-wrap">
            <div className="sp-card">
              <div className="sp-section-label">Today's sessions</div>
              <div className="sp-sessions">
                {completedSessions.map((session, i) => (
                  <div className="sp-session" key={session._id || i}>
                    {session.isValid
                      ? <CheckCircle size={13} color="var(--success)" style={{ flexShrink: 0 }} />
                      : <XCircle size={13} color="var(--danger)" style={{ flexShrink: 0 }} />}
                    <div className="sp-session-body">
                      <div className="sp-session-top">
                        <span className="sp-duration">{session.duration} min</span>
                        <span className={`sp-badge ${session.isValid ? 'valid' : 'invalid'}`}>
                          {session.isValid ? 'Valid' : 'Invalid'}
                        </span>
                      </div>
                      <div className="sp-session-meta">
                        <span className="sp-time">
                          <Clock size={9} />
                          {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {' → '}
                          {session.endTime && new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="sp-snaps">📸 {session.snapshots?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Hidden camera elements */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '640px', height: '480px',
          pointerEvents: 'none',
          zIndex: -1,
          clipPath: 'inset(100%)',
        }}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {toast && (
        <div className="sp-toast-wrap">
          <div className={`sp-toast ${toast.type}`}>{toast.message}</div>
        </div>
      )}
    </>
  );
}