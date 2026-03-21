import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, Clock } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import CameraCapture from '../components/CameraCapture';
import { TASK_ORDER, TASKS } from '../utils/taskConfig';
import { getDashboard, submitTask, wakeCheckin, sleepCheck, sleepSuccess, uploadImage } from '../utils/api';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');

  .tp-root {
    font-family: 'DM Sans', sans-serif;
    background: #0a0a0a;
    color: #f0f0f0;
    min-height: 100vh;
    padding: 1.5rem 1rem 5rem;
  }

  .tp-inner {
    max-width: 90%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  /* ── Header ── */
  .tp-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.25rem;
  }

  .tp-title {
    font-size: 0.9375rem;
    font-weight: 500;
    color: #f0f0f0;
    letter-spacing: 0.01em;
    line-height: 1.2;
  }

  .tp-subtitle {
    margin-top: 0.25rem;
    font-size: 0.625rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(240,240,240,0.3);
    font-family: 'DM Mono', monospace;
  }

  .tp-subtitle em {
    font-style: normal;
    color: rgba(240,240,240,0.6);
  }

  .tp-badge {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.3rem 0.625rem;
    border-radius: 6px;
    background: rgba(232,255,74,0.07);
    border: 1px solid rgba(232,255,74,0.18);
    flex-shrink: 0;
  }

  .tp-badge-text {
    font-size: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-weight: 600;
    color: #e8ff4a;
  }

  /* ── Sleep warning (hard fail) ── */
  .tp-warning {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.75rem 0.875rem;
    border-radius: 10px;
    background: rgba(255,90,90,0.07);
    border: 1px solid rgba(255,90,90,0.2);
  }

  .tp-warning-text {
    font-size: 0.6875rem;
    font-weight: 400;
    color: #ff5a5a;
    letter-spacing: 0.01em;
  }

  /* ── Sleep soft warning ── */
  .tp-soft-warning {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.75rem 0.875rem;
    border-radius: 10px;
    background: rgba(251,191,36,0.07);
    border: 1px solid rgba(251,191,36,0.2);
  }

  .tp-soft-warning-text {
    font-size: 0.6875rem;
    font-weight: 400;
    color: #fbbf24;
    letter-spacing: 0.01em;
  }

  /* ── Task list ── */
  .tp-tasks {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  /* ── Spinner / Error ── */
  .tp-center {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    min-height: 60vh; gap: 0.75rem;
    background: #0a0a0a;
    font-family: 'DM Sans', sans-serif;
  }
  .tp-spinner {
    width: 22px; height: 22px; border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,0.07);
    border-top-color: #e8ff4a;
    animation: tpspin 0.7s linear infinite;
  }
  @keyframes tpspin { to { transform: rotate(360deg); } }
  .tp-err {
    font-size: 0.75rem;
    color: #ff5a5a;
  }
  .tp-retry {
    font-size: 0.75rem; font-weight: 500;
    padding: 0.45rem 1rem; border-radius: 7px;
    background: rgba(232,255,74,0.1);
    border: 1px solid rgba(232,255,74,0.2);
    color: #e8ff4a; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Toast ── */
  .tp-toast-wrap {
    position: fixed;
    bottom: 5rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 90;
    animation: tp-up 0.2s ease;
  }
  @media (min-width: 640px) {
    .tp-toast-wrap { bottom: 2rem; }
    .tp-root { padding: 2rem 1.5rem 5rem; }
  }
  .tp-toast {
    padding: 0.6rem 1.1rem;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
    letter-spacing: 0.01em;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  }
  .tp-toast.success { background: rgba(74,255,160,0.12); color: #4affa0; border: 1px solid rgba(74,255,160,0.25); }
  .tp-toast.error   { background: rgba(255,90,90,0.12);  color: #ff5a5a; border: 1px solid rgba(255,90,90,0.25); }
  @keyframes tp-up {
    from { opacity: 0; transform: translateX(-50%) translateY(6px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  @media (max-width: 360px) {
    .tp-root { padding: 1.25rem 0.875rem 4rem; }
  }
`;

export default function Today() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState({});
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(null);
  const [showCamera, setShowCamera] = useState(null);
  const [toast, setToast] = useState(null);
  const [sleepWarning, setSleepWarning] = useState(false);
  const [sleepSoftWarning, setSleepSoftWarning] = useState(false);

  // Hidden file input ref for gallery uploads (night_walk, prayer)
  const fileInputRef = useRef(null);
  const pendingGalleryTaskRef = useRef(null);

  useEffect(() => { loadTasks(); checkSleep(); }, []);

  async function loadTasks() {
    try {
      setLoading(true);
      const res = await getDashboard();
      setTasks(res.data.today?.tasks || {});
      setScore(res.data.today?.score || 0);
    } catch { setError('Failed to load tasks'); }
    finally { setLoading(false); }
  }

  async function checkSleep() {
    try {
      const res = await sleepCheck();
      if (res.data.sleepFailed) setSleepWarning(true);
      else if (res.data.sleepWarning) setSleepSoftWarning(true);
    } catch { }
  }

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function getGpsPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error('GPS not supported')); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  // — Gallery upload handler for night_walk / prayer —
  async function handleGalleryFile(e) {
    const file = e.target.files?.[0];
    const taskId = pendingGalleryTaskRef.current;
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
    pendingGalleryTaskRef.current = null;
    if (!file || !taskId) return;

    try {
      setSubmitting(taskId);
      const formData = new FormData();
      formData.append('image', file, `${taskId}_${Date.now()}.jpg`);
      const uploadRes = await uploadImage(formData);
      const imageUrl = uploadRes.data.url;
      const proof = { imageUrl };
      const res = await submitTask({ taskId, proof });
      showToast(res.data.message);
      await loadTasks();
    } catch (err) {
      showToast(err.response?.data?.error || 'Submission failed', 'error');
    } finally { setSubmitting(null); }
  }

  // — Camera upload handler for gym / skincare —
  async function handleUploadAndSubmit(taskId, blob) {
    try {
      setSubmitting(taskId);
      const formData = new FormData();
      formData.append('image', blob, `${taskId}_${Date.now()}.jpg`);
      const uploadRes = await uploadImage(formData);
      const imageUrl = uploadRes.data.url;
      const config = TASKS[taskId];
      let gps = null;
      if (config.needsGps) {
        try { gps = await getGpsPosition(); }
        catch { showToast('GPS access denied', 'error'); setSubmitting(null); return; }
      }
      const proof = { imageUrl, gps, exifTimestamp: new Date().toISOString() };
      const res = await submitTask({ taskId, proof });
      showToast(res.data.message);
      await loadTasks();
    } catch (err) {
      showToast(err.response?.data?.error || 'Submission failed', 'error');
    } finally { setSubmitting(null); }
  }

  const handleAction = useCallback(async (taskId) => {
    const config = TASKS[taskId];
    if (config.isStudy) { navigate('/study'); return; }
    if (taskId === 'wake') {
      try { setSubmitting(taskId); const res = await wakeCheckin(); showToast(res.data.message, res.data.status === 'completed' ? 'success' : 'error'); await loadTasks(); }
      catch (err) { showToast(err.response?.data?.error || 'Check-in failed', 'error'); }
      finally { setSubmitting(null); } return;
    }
    if (taskId === 'sleep') {
      try { setSubmitting(taskId); const res = await sleepSuccess(); showToast(res.data.message); await loadTasks(); }
      catch (err) { showToast(err.response?.data?.error || 'Failed', 'error'); }
      finally { setSubmitting(null); } return;
    }
    // Gallery upload tasks (night_walk, prayer)
    if (config.needsGallery) {
      pendingGalleryTaskRef.current = taskId;
      fileInputRef.current?.click();
      return;
    }
    // Camera tasks (gym, skincare)
    if (config.needsCamera) { setShowCamera(taskId); return; }
    try { setSubmitting(taskId); const res = await submitTask({ taskId, proof: {} }); showToast(res.data.message); await loadTasks(); }
    catch (err) { showToast(err.response?.data?.error || 'Failed', 'error'); }
    finally { setSubmitting(null); }
  }, [navigate]);

  const handleCameraCapture = async (blob) => {
    const taskId = showCamera;
    setShowCamera(null);
    if (!taskId) return;
    await handleUploadAndSubmit(taskId, blob);
  };

  if (loading) return (
    <><style>{styles}</style>
      <div className="tp-center"><div className="tp-spinner" /></div></>
  );

  if (error) return (
    <><style>{styles}</style>
      <div className="tp-center">
        <p className="tp-err">{error}</p>
        <button className="tp-retry" onClick={loadTasks}>Retry</button>
      </div></>
  );

  return (
    <><style>{styles}</style>
      <div className="tp-root">
        <div className="tp-inner">

          {/* Header */}
          <div className="tp-header">
            <div>
              <div className="tp-title">Today's Tasks</div>
              <div className="tp-subtitle">
                Score <em>{score}</em> / 25 · threshold 17.5
              </div>
            </div>
            <div className="tp-badge">
              <Shield size={11} color="#e8ff4a" />
              <span className="tp-badge-text">Strict</span>
            </div>
          </div>

          {/* Sleep hard fail warning */}
          {sleepWarning && (
            <div className="tp-warning">
              <AlertTriangle size={13} color="#ff5a5a" style={{ flexShrink: 0 }} />
              <span className="tp-warning-text">Sleep failed — app opened after 3 AM</span>
            </div>
          )}

          {/* Sleep soft warning (12:01 AM – 2:59 AM) */}
          {sleepSoftWarning && !sleepWarning && (
            <div className="tp-soft-warning">
              <Clock size={13} color="#fbbf24" style={{ flexShrink: 0 }} />
              <span className="tp-soft-warning-text">Time left to sleep is running low — get to bed soon!</span>
            </div>
          )}

          {/* Tasks */}
          <div className="tp-tasks">
            {TASK_ORDER.map((taskId) => (
              <TaskCard
                key={taskId}
                taskId={taskId}
                taskData={tasks[taskId]}
                onAction={handleAction}
                disabled={submitting === taskId}
              />
            ))}
          </div>

        </div>
      </div>

      {/* Hidden file input for gallery uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleGalleryFile}
      />

      {showCamera && (
        <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(null)} />
      )}

      {toast && (
        <div className="tp-toast-wrap">
          <div className={`tp-toast ${toast.type}`}>{toast.message}</div>
        </div>
      )}
    </>
  );
}