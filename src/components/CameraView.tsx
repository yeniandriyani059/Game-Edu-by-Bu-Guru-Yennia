import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  Camera,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  ArrowLeftRight,
  User,
  Sparkles,
  Play
} from 'lucide-react';
import { Zone } from '../types';
import { poseTracker, SinglePoseResult } from '../utils/poseTracker';
import { soundManager } from '../utils/audio';

interface CameraViewProps {
  studentName?: string;
  teamName?: string;
  isGameActive: boolean;
  onLockAnswer: (answer: 'LEFT' | 'RIGHT') => void;
  dwellTargetSec?: number; // Default 2.0 detik agar stabil
  isCalibrating?: boolean;
  onCalibrationComplete?: () => void;
  questionNumberInTurn?: number;
  totalQuestionsInTurn?: number;
  isPaused?: boolean;
}

export const CameraView: React.FC<CameraViewProps> = ({
  studentName,
  teamName,
  isGameActive,
  onLockAnswer,
  dwellTargetSec = 2.0, // 2.0 detik standar aman agar anak tidak terkunci tidak sengaja
  isCalibrating = false,
  onCalibrationComplete,
  questionNumberInTurn = 1,
  totalQuestionsInTurn = 10,
  isPaused = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [engineType, setEngineType] = useState<'mediapipe' | 'motion'>('motion');

  // Pengaturan batas zona layar
  // Kiri: 0 s/d leftBoundary (38%), Tengah: 38% - 62%, Kanan: 62% - 100%
  const [leftBoundary, setLeftBoundary] = useState<number>(0.38);
  const [rightBoundary, setRightBoundary] = useState<number>(0.62);
  const [invertMirror, setInvertMirror] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Status deteksi real-time 1 pemain
  const [poseResult, setPoseResult] = useState<SinglePoseResult>({
    screenX: 0.5,
    screenY: 0.4,
    rawCameraX: 0.5,
    zone: 'CENTER',
    isDetected: false,
    confidence: 0,
    engine: 'motion',
    debugStatus: 'MENUNGGU PEMAIN',
  });

  const [dwellProgress, setDwellProgress] = useState<number>(0);

  // Refs untuk tracking loop dan pencegahan infinite re-render
  const activeZoneRef = useRef<Zone>('CENTER');
  const dwellStartTimeRef = useRef<number | null>(null);
  const isLockedRef = useRef<boolean>(false);
  const dwellProgressRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);
  const lastProcessTimeRef = useRef<number>(0);

  const onLockAnswerRef = useRef(onLockAnswer);
  onLockAnswerRef.current = onLockAnswer;

  const onCalibrationCompleteRef = useRef(onCalibrationComplete);
  onCalibrationCompleteRef.current = onCalibrationComplete;

  // Fase kalibrasi: 'stand_center' (tengah garis) atau 'countdown' (3..2..1..MULAI)
  const [calibPhase, setCalibPhase] = useState<'stand_center' | 'countdown'>('stand_center');
  const [countdownNum, setCountdownNum] = useState<number>(3);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const isCountingDownRef = useRef<boolean>(false);
  isCountingDownRef.current = isCountingDown;

  const steadyCenterStartRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize camera (Ringankan Beban: Resolusi 640x480, frameRate 15-30 fps untuk Smart TV)
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (videoRef.current && videoRef.current.srcObject) {
        const oldStream = videoRef.current.srcObject as MediaStream;
        oldStream.getTracks().forEach(track => track.stop());
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 640, max: 640 },
            height: { ideal: 480, max: 480 },
            frameRate: { ideal: 24, min: 15, max: 30 },
          },
          audio: false,
        });
      } catch (errConstraint) {
        console.warn('Fallback basic 640x480 camera constraints for Smart TV:', errConstraint);
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setStreamActive(true);
        };
      }

      poseTracker.initMediaPipe().then(loaded => {
        if (loaded) setEngineType('mediapipe');
      });
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      const message = err instanceof Error ? err.message : 'Kamera tidak dapat diakses';
      setCameraError(message);
      setStreamActive(false);
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [startCamera]);

  // Hitungan mundur kalibrasi 3... 2... 1... MULAI!
  const triggerCountdown = useCallback(() => {
    if (isCountingDownRef.current) return;
    setIsCountingDown(true);
    setCalibPhase('countdown');
    setCountdownNum(3);
    soundManager.playCountdownBeep(false);

    let count = 3;
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    countdownTimerRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownNum(count);
        soundManager.playCountdownBeep(false);
      } else if (count === 0) {
        setCountdownNum(0); // Menampilkan "MULAI! 🚀"
        soundManager.playCountdownBeep(true);
      } else {
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        setIsCountingDown(false);
        // Selesai kalibrasi: Buka kunci sensor untuk mulai menjawab
        isLockedRef.current = false;
        activeZoneRef.current = 'CENTER';
        dwellStartTimeRef.current = null;
        dwellProgressRef.current = 0;
        setDwellProgress(0);
        onCalibrationCompleteRef.current?.();
      }
    }, 1000);
  }, []);

  const triggerCountdownRef = useRef(triggerCountdown);
  triggerCountdownRef.current = triggerCountdown;

  // Reset status saat memasuki kalibrasi atau soal baru
  useEffect(() => {
    if (isCalibrating) {
      setCalibPhase('stand_center');
      setCountdownNum(3);
      setIsCountingDown(false);
      steadyCenterStartRef.current = null;
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

      activeZoneRef.current = 'CENTER';
      dwellStartTimeRef.current = null;
      isLockedRef.current = true; // Kunci sensor selama kalibrasi
      dwellProgressRef.current = 0;
      setDwellProgress(0);
    } else if (isGameActive) {
      activeZoneRef.current = 'CENTER';
      dwellStartTimeRef.current = null;
      isLockedRef.current = false;
      dwellProgressRef.current = 0;
      setDwellProgress(0);
    }
  }, [isCalibrating, isGameActive]);

  // Shortcut tombol Spasi / Enter untuk mulai jika tidak ingin menunggu auto-deteksi
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCalibrating && calibPhase === 'stand_center' && !isCountingDown) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          triggerCountdownRef.current();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCalibrating, calibPhase, isCountingDown]);

  // Main Tracking Loop 1 Pemain
  useEffect(() => {
    if ((!isGameActive && !isCalibrating) || isPaused) {
      activeZoneRef.current = 'CENTER';
      dwellStartTimeRef.current = null;
      isLockedRef.current = true;
      dwellProgressRef.current = 0;
      setDwellProgress(0);
      return;
    }

    const loop = (now: number) => {
      if (videoRef.current && streamActive && (isGameActive || isCalibrating)) {
        // Optimasi Anti-Delay Layar Sentuh IFP / Smart TV:
        // Hentikan AI kamera menganalisis setiap frame!
        // Throttle: batasi prediksi pose HANYA berjalan setiap 150 milidetik saja
        // agar CPU IFP bisa bernapas dan merespons seketika terhadap sentuhan jari layar.
        if (now - lastProcessTimeRef.current >= 150) {
          lastProcessTimeRef.current = now;
          const res = poseTracker.processSinglePlayerFrame(
            videoRef.current,
            invertMirror,
            leftBoundary,
            rightBoundary
          );

          setPoseResult(res);
          setEngineType(res.engine);

          // A. FASE KALIBRASI: MENUNGGU BERDIRI DI TENGAH
          if (isCalibrating && calibPhase === 'stand_center' && !isCountingDown) {
            // Hanya mulai jika tubuh manusia sungguhan terdeteksi di tengah (keyakinan >= 0.85)
            if (res.isDetected && res.zone === 'CENTER') {
              if (steadyCenterStartRef.current === null) {
                steadyCenterStartRef.current = now;
              } else if (now - steadyCenterStartRef.current >= 800) {
                triggerCountdownRef.current();
              }
            } else {
              steadyCenterStartRef.current = null;
            }
            dwellProgressRef.current = 0;
            setDwellProgress(0);
            animFrameIdRef.current = requestAnimationFrame(loop);
            return;
          }

          // B. FASE KALIBRASI: HITUNGAN MUNDUR (SENSOR DIKUNCI)
          if (isCalibrating && isCountingDown) {
            dwellProgressRef.current = 0;
            setDwellProgress(0);
            animFrameIdRef.current = requestAnimationFrame(loop);
            return;
          }

          // C. FASE GAMEPLAY: EVALUASI LOMPATAN KIRI (BENAR) ATAU KANAN (SALAH)
          if (isGameActive && !isCalibrating) {
            if (isLockedRef.current) {
              animFrameIdRef.current = requestAnimationFrame(loop);
              return;
            }

            // PERLINDUNGAN TERHADAP BENDA MATI:
            // Jika res.isDetected === false (benda mati/kursi/topi dengan confidence < 0.85),
            // JANGAN pernah mengunci jawaban atau memulai dwell timer!
            if (!res.isDetected) {
              activeZoneRef.current = 'CENTER';
              dwellStartTimeRef.current = null;
              if (dwellProgressRef.current !== 0) {
                dwellProgressRef.current = 0;
                setDwellProgress(0);
              }
            } else {
              const currentZone = res.zone;
              const prevZone = activeZoneRef.current;

              if (currentZone !== prevZone) {
                activeZoneRef.current = currentZone;
                dwellStartTimeRef.current = currentZone !== 'CENTER' ? now : null;
                dwellProgressRef.current = 0;
                setDwellProgress(0);
              } else if (currentZone !== 'CENTER' && dwellStartTimeRef.current !== null) {
                const elapsed = (now - dwellStartTimeRef.current) / 1000;
                const ratio = Math.min(elapsed / dwellTargetSec, 1.0);

                // Update progress state hanya jika ada perubahan signifikan untuk efisiensi
                if (Math.abs(ratio - dwellProgressRef.current) >= 0.03 || ratio === 1.0) {
                  dwellProgressRef.current = ratio;
                  setDwellProgress(ratio);
                }

                // Kunci jawaban jika sudah ditahan selama 2 detik penuh
                if (elapsed >= dwellTargetSec && !isLockedRef.current) {
                  isLockedRef.current = true;
                  dwellProgressRef.current = 1.0;
                  setDwellProgress(1.0);
                  soundManager.playLock();
                  onLockAnswerRef.current(currentZone as 'LEFT' | 'RIGHT');
                }
              } else {
                if (dwellProgressRef.current !== 0) {
                  dwellProgressRef.current = 0;
                  setDwellProgress(0);
                }
              }
            }
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [
    isGameActive,
    isCalibrating,
    calibPhase,
    isCountingDown,
    streamActive,
    dwellTargetSec,
    isPaused,
    invertMirror,
    leftBoundary,
    rightBoundary,
  ]);

  const toggleFacingMode = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  const isLeftZoneActive = poseResult.isDetected && poseResult.zone === 'LEFT' && isGameActive && !isCalibrating && !isPaused;
  const isRightZoneActive = poseResult.isDetected && poseResult.zone === 'RIGHT' && isGameActive && !isCalibrating && !isPaused;
  const isCenterZoneActive = !poseResult.isDetected || poseResult.zone === 'CENTER';

  return (
    <div className="relative w-full h-full overflow-hidden rounded-3xl bg-slate-950 shadow-2xl border-4 border-amber-400/60 select-none">
      {/* Video Webcam: mirrored menggunakan CSS transform -scale-x-100 */}
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted
        className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
      />

      {/* Paused Overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 space-y-3 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border-2 border-amber-400 text-amber-300 flex items-center justify-center text-3xl font-black shadow-lg animate-pulse">
            ⏸️
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-amber-300 uppercase tracking-wider">
            SENSOR KAMERA DIJEDA
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm font-medium">
            Deteksi gerakan dan timer sementara dihentikan.
          </p>
        </div>
      )}

      {/* Camera Loading or Error State */}
      {!streamActive && (
        <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center z-20 space-y-4">
          {cameraError ? (
            <div className="space-y-3 max-w-md">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center mx-auto text-rose-400">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-rose-300">Gagal Membuka Kamera</h3>
              <p className="text-xs text-slate-300">{cameraError}</p>
              <button
                onClick={startCamera}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 mx-auto cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Coba Hubungkan Ulang</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-extrabold text-amber-300">Menyiapkan Kamera & AI Sensor...</p>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          OVERLAY 3 ZONA DI LAYAR PENUH:
          - KIRI (0% - 38%): HIJAU (BENAR)
          - TENGAH (38% - 62%): NETRAL (BERSIAP)
          - KANAN (62% - 100%): MERAH (SALAH)
      ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none flex z-10">
        {/* 1. ZONA KIRI: BENAR */}
        <div
          className={`h-full border-r-2 border-dashed border-emerald-400/50 flex flex-col justify-between p-3 sm:p-5 transition-all duration-200 relative ${
            isLeftZoneActive
              ? 'bg-emerald-500/35 border-r-4 border-emerald-400 shadow-[inset_0_0_60px_rgba(16,185,129,0.5)]'
              : 'bg-emerald-500/10'
          }`}
          style={{ width: `${leftBoundary * 100}%` }}
        >
          {/* Header Zona Kiri */}
          <div className="space-y-1">
            <div
              className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase transition-transform shadow-lg ${
                isLeftZoneActive
                  ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-300 scale-105'
                  : 'bg-emerald-500/80 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span>👈 KIRI: BENAR</span>
            </div>
            <p className="text-[10px] sm:text-xs text-emerald-200 font-bold drop-shadow">
              Lompat ke sini jika pernyataan BENAR
            </p>
          </div>

          {/* Dwell Progress Indicator Zona Kiri (Lingkaran / Bar 2 Detik) */}
          {isLeftZoneActive && (
            <div className="my-auto self-center flex flex-col items-center gap-2 bg-slate-950/80 backdrop-blur-md p-4 rounded-3xl border-2 border-emerald-400 animate-in zoom-in-95 duration-150">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    className="stroke-emerald-950/80 fill-none"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    className="stroke-emerald-400 fill-none transition-all duration-75"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 32}
                    strokeDashoffset={2 * Math.PI * 32 * (1 - dwellProgress)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute font-black text-white text-xs sm:text-sm">
                  {Math.round(dwellProgress * 100)}%
                </span>
              </div>
              <span className="text-xs font-black text-emerald-300 uppercase tracking-wider animate-pulse">
                TAHAN POSISI... ({((1 - dwellProgress) * dwellTargetSec).toFixed(1)}s)
              </span>
            </div>
          )}

          <div className="text-[11px] font-extrabold text-emerald-300/80">
            Zona Kiri (Jawaban Benar)
          </div>
        </div>

        {/* 2. ZONA TENGAH: NETRAL / BERSIAP */}
        <div
          className={`h-full flex flex-col justify-between items-center p-3 sm:p-5 transition-all duration-200 relative ${
            isCenterZoneActive && isGameActive && !isCalibrating
              ? 'bg-amber-400/10'
              : 'bg-transparent'
          }`}
          style={{ width: `${(rightBoundary - leftBoundary) * 100}%` }}
        >
          {/* Header Zona Tengah */}
          <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow">
            <span>⚪ GARIS TENGAH (NETRAL)</span>
          </div>

          {/* Panduan visual saat game aktif dan anak berada di tengah */}
          {isGameActive && !isCalibrating && isCenterZoneActive && (
            <div className="my-auto text-center space-y-1 bg-slate-950/75 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/20">
              <p className="text-xs sm:text-sm font-black text-white">
                Siap! Melompatlah sekarang:
              </p>
              <div className="flex items-center justify-center gap-3 text-xs font-extrabold">
                <span className="text-emerald-400">👈 KIRI (BENAR)</span>
                <span className="text-slate-400">•</span>
                <span className="text-rose-400">KANAN (SALAH) 👉</span>
              </div>
            </div>
          )}

          {/* Garis bantu berdiri vertikal di tengah */}
          <div className="w-0.5 h-12 bg-amber-400/40 rounded-full animate-pulse" />
        </div>

        {/* 3. ZONA KANAN: SALAH */}
        <div
          className={`h-full border-l-2 border-dashed border-rose-400/50 flex flex-col justify-between items-end p-3 sm:p-5 transition-all duration-200 relative ${
            isRightZoneActive
              ? 'bg-rose-500/35 border-l-4 border-rose-400 shadow-[inset_0_0_60px_rgba(244,63,94,0.5)]'
              : 'bg-rose-500/10'
          }`}
          style={{ width: `${(1 - rightBoundary) * 100}%` }}
        >
          {/* Header Zona Kanan */}
          <div className="space-y-1 text-right">
            <div
              className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase transition-transform shadow-lg ${
                isRightZoneActive
                  ? 'bg-rose-500 text-white ring-4 ring-rose-300 scale-105'
                  : 'bg-rose-500/80 text-white'
              }`}
            >
              <span>KANAN: SALAH 👉</span>
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            </div>
            <p className="text-[10px] sm:text-xs text-rose-200 font-bold drop-shadow">
              Lompat ke sini jika pernyataan SALAH
            </p>
          </div>

          {/* Dwell Progress Indicator Zona Kanan (Lingkaran / Bar 2 Detik) */}
          {isRightZoneActive && (
            <div className="my-auto self-center flex flex-col items-center gap-2 bg-slate-950/80 backdrop-blur-md p-4 rounded-3xl border-2 border-rose-400 animate-in zoom-in-95 duration-150">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    className="stroke-rose-950/80 fill-none"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    className="stroke-rose-400 fill-none transition-all duration-75"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 32}
                    strokeDashoffset={2 * Math.PI * 32 * (1 - dwellProgress)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="font-black text-white text-xs sm:text-sm absolute">
                  {Math.round(dwellProgress * 100)}%
                </span>
              </div>
              <span className="text-xs font-black text-rose-300 uppercase tracking-wider animate-pulse">
                TAHAN POSISI... ({((1 - dwellProgress) * dwellTargetSec).toFixed(1)}s)
              </span>
            </div>
          )}

          <div className="text-[11px] font-extrabold text-rose-300/80">
            Zona Kanan (Jawaban Salah)
          </div>
        </div>
      </div>

      {/* =========================================================================
          INDIKATOR MELAYANG DI ATAS KEPALA PEMAIN (REAL-TIME TRACKING DEBUGGER)
      ========================================================================= */}
      {poseResult.isDetected && (
        <div
          className="absolute z-30 pointer-events-none transition-all duration-75 transform -translate-x-1/2 -translate-y-full flex flex-col items-center gap-1.5"
          style={{
            left: `${Math.max(12, Math.min(88, poseResult.screenX * 100))}%`,
            top: `${Math.max(16, Math.min(85, poseResult.screenY * 100))}%`,
          }}
        >
          {/* Badge Status Real-Time */}
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-2xl border-2 flex items-center gap-1.5 transition-all ${
              poseResult.zone === 'LEFT'
                ? 'bg-emerald-500 border-white text-slate-950 scale-110 shadow-emerald-500/50'
                : poseResult.zone === 'RIGHT'
                ? 'bg-rose-500 border-white text-white scale-110 shadow-rose-500/50'
                : 'bg-slate-900/90 border-amber-400 text-amber-300'
            }`}
          >
            {poseResult.zone === 'LEFT' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>KAMU MEMILIH: BENAR (KIRI)</span>
              </>
            ) : poseResult.zone === 'RIGHT' ? (
              <>
                <span>KAMU MEMILIH: SALAH (KANAN)</span>
                <XCircle className="w-4 h-4 text-white" />
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>POSISI: TENGAH (BERSIAP)</span>
              </>
            )}
          </div>

          {/* Dot Penanda Kepala */}
          <div
            className={`w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[10px] ${
              poseResult.zone === 'LEFT'
                ? 'bg-emerald-400'
                : poseResult.zone === 'RIGHT'
                ? 'bg-rose-500'
                : 'bg-amber-400'
            }`}
          >
            🎯
          </div>
        </div>
      )}

      {/* =========================================================================
          FASE KALIBRASI LAPANGAN (BERDIRI DI TENGAH & HITUNGAN MUNDUR 3..2..1)
      ========================================================================= */}
      {isCalibrating && (
        <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none">
          {calibPhase === 'stand_center' && (
            <div className="max-w-md w-full bg-slate-900/95 border-4 border-amber-400 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-3xl mx-auto text-amber-300">
                🧍
              </div>
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider">
                  FASE BERSIAP • GILIRAN {studentName}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  Berdiri di Garis Tengah!
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  Masuklah ke depan kamera dan posisikan tubuhmu di area tengah (Netral). Sensor akan mulai hitungan mundur otomatis.
                </p>
              </div>

              {/* Status Pendeteksian Tengah */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center gap-2 text-xs font-extrabold">
                {poseResult.isDetected && poseResult.zone === 'CENTER' ? (
                  <span className="text-emerald-400 flex items-center gap-1.5 animate-pulse">
                    <ShieldCheck className="w-4 h-4" />
                    <span>POSISI PAS DI TENGAH! MEMULAI...</span>
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Silakan bergeser ke area tengah garis</span>
                  </span>
                )}
              </div>

              {/* Tombol Manual Mulai Langsung */}
              <button
                type="button"
                onClick={triggerCountdown}
                onTouchStart={(e) => {
                  e.preventDefault();
                  triggerCountdown();
                }}
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 text-slate-950 font-black rounded-2xl text-sm uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-95 touch-manipulation"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>SIAP! MULAI SOAL (SPASI / ENTER)</span>
              </button>
            </div>
          )}

          {/* HITUNGAN MUNDUR BESAR (3... 2... 1... MULAI!) */}
          {calibPhase === 'countdown' && (
            <div className="flex flex-col items-center justify-center space-y-4 animate-in zoom-in-95 duration-150">
              <div className="text-8xl sm:text-9xl font-black text-amber-300 drop-shadow-[0_10px_35px_rgba(251,191,36,0.6)] animate-bounce">
                {countdownNum === 0 ? 'MULAI! 🚀' : countdownNum}
              </div>
              <p className="text-lg sm:text-xl font-black text-white uppercase tracking-widest bg-slate-900/90 px-6 py-2 rounded-full border-2 border-amber-400 shadow-xl">
                {countdownNum === 0 ? 'Sensor Aktif! Bersiap Melompat!' : 'Bersiap di Tengah Garis!'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          BAR PENGATURAN KAMERA & TOGGLE ARAH CERMIN (POJOK ATAS)
      ========================================================================= */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
        {/* Tombol 1-Click: Balik Arah Sensor Cermin (Anti-Terbalik) */}
        <button
          type="button"
          onClick={() => setInvertMirror(prev => !prev)}
          onTouchStart={(e) => {
            e.preventDefault();
            setInvertMirror(prev => !prev);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-black border transition cursor-pointer flex items-center gap-1.5 shadow-lg touch-manipulation ${
            invertMirror
              ? 'bg-rose-500 text-white border-rose-400'
              : 'bg-slate-900/90 hover:bg-slate-800 text-amber-300 border-amber-400/50'
          }`}
          title="Klik jika arah gerakan kiri/kanan terbalik"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>{invertMirror ? 'Arah: Dibalik' : 'Arah: Normal'}</span>
        </button>

        {/* Toggle Ganti Kamera Depan/Belakang */}
        <button
          type="button"
          onClick={toggleFacingMode}
          onTouchStart={(e) => {
            e.preventDefault();
            toggleFacingMode();
          }}
          className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer shadow touch-manipulation"
          title="Ganti Kamera Depan/Belakang"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {/* Info Murid yang Sedang Maju (Pojok Kiri Bawah) */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
        <div className="px-3.5 py-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-amber-400/60 shadow-lg flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
            👤
          </div>
          <div className="text-left">
            <span className="text-[10px] text-amber-300 font-extrabold uppercase block leading-tight">
              Giliran Estafet:
            </span>
            <span className="text-xs font-black text-white">
              {teamName || studentName || 'TIM'} (Soal {questionNumberInTurn}/{totalQuestionsInTurn})
            </span>
          </div>
        </div>
      </div>

      {/* Badge Status Optimasi Smart TV / IFP (Pojok Kanan Bawah) */}
      <div className="absolute bottom-3 right-3 z-20 pointer-events-none hidden sm:block">
        <div className="px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1.5 shadow">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>IFP Mode • 640x480 • Throttle 150ms • Lite 0.85</span>
        </div>
      </div>
    </div>
  );
};
