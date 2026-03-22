import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, X, CheckCircle, RotateCcw } from 'lucide-react';

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [captured, setCaptured] = useState(null);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');

  const startCamera = useCallback(async (facing) => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera requires HTTPS or localhost. Please check your URL.');
      }
      if (stream) stream.getTracks().forEach(t => t.stop());
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setError(null);
    } catch (err) {
      setError(err.message || 'Camera access denied. Please allow camera permissions.');
    }
  }, [stream]);

  useEffect(() => {
    startCamera(facingMode);
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, []); // eslint-disable-line

  const flipCamera = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    startCamera(next);
  };

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob((blob) => setCaptured({ blob, url: URL.createObjectURL(blob) }), 'image/jpeg', 0.85);
  };

  const confirm = () => { if (captured) { onCapture(captured.blob); cleanup(); } };
  const retake = () => { if (captured) { URL.revokeObjectURL(captured.url); setCaptured(null); } };
  const cleanup = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    if (captured) URL.revokeObjectURL(captured.url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: '#fafbff' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ background: 'white', borderBottom: '1px solid var(--border)' }}>
        <button onClick={cleanup} className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ color: 'var(--text-secondary)' }}><X size={18} /></button>
        <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Capture Proof</span>
        <button onClick={flipCamera}
          className="flex items-center gap-1 text-[11px] font-medium px-3 py-1.5 rounded-lg"
          style={{ background: 'var(--bg-inset)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
          <RotateCcw size={12} /> Flip
        </button>
      </div>

      {/* Viewfinder */}
      <div className="flex-1 flex items-center justify-center overflow-hidden" style={{ background: '#111' }}>
        {error ? (
          <div className="text-center px-8">
            <Camera size={40} className="mx-auto mb-3" style={{ color: '#666' }} />
            <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
          </div>
        ) : captured ? (
          <img src={captured.url} alt="Captured" className="max-w-full max-h-full object-contain" />
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="max-w-full max-h-full object-contain" />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-5 py-5 px-4"
        style={{ background: 'white', borderTop: '1px solid var(--border)' }}>
        {captured ? (
          <>
            <button onClick={retake} className="btn-danger flex items-center gap-2 !text-[12px]">
              <X size={14} /> Retake
            </button>
            <button onClick={confirm} className="btn-primary flex items-center gap-2 !text-[12px]">
              <CheckCircle size={14} /> Use Photo
            </button>
          </>
        ) : (
          <button onClick={capture}
            className="w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-105"
            style={{ background: 'var(--accent)', boxShadow: '0 4px 16px var(--accent-glow)' }}>
            <Camera size={22} color="white" />
          </button>
        )}
      </div>
    </div>
  );
}
