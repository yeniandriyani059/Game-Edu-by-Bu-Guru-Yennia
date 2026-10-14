import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sparkles,
  HelpCircle,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sliders,
  GraduationCap,
  Users,
  Trophy,
  User,
  ArrowRight,
  Clock,
  Home,
  Pause,
  Zap,
  Flame,
  Swords
} from 'lucide-react';
import {
  GameStatus,
  Question,
  RoundResult,
  MapelSummary,
  TeamStats,
  TeamId
} from './types';
import {
  APP_TITLE,
  getDaftarMapelDinams,
  prepare20UniqueQuestions
} from './data/questions';
import { CameraView } from './components/CameraView';
import { QuestionCard } from './components/QuestionCard';
import { FeedbackOverlay } from './components/FeedbackOverlay';
import { SummaryModal } from './components/SummaryModal';
import { TutorialModal } from './components/TutorialModal';
import { TeacherModeModal } from './components/TeacherModeModal';
import { ScoreHeader } from './components/ScoreHeader';
import { TurnTransitionScreen } from './components/TurnTransitionScreen';
import { soundManager } from './utils/audio';

const INITIAL_TEAM_A: TeamStats = {
  id: 'TIM_A',
  name: 'TIM A',
  color: 'amber',
  score: 0,
  correctCount: 0,
  totalAnswered: 0,
  totalTimeSeconds: 0,
};

const INITIAL_TEAM_B: TeamStats = {
  id: 'TIM_B',
  name: 'TIM B',
  color: 'sky',
  score: 0,
  correctCount: 0,
  totalAnswered: 0,
  totalTimeSeconds: 0,
};

export default function App() {
  const [mapelList, setMapelList] = useState<MapelSummary[]>(() => getDaftarMapelDinams());
  const [gameStatus, setGameStatus] = useState<GameStatus>('welcome');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [overallQuestionIndex, setOverallQuestionIndex] = useState<number>(0);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);

  // State Kedua Tim: TIM A dan TIM B
  const [teamA, setTeamA] = useState<TeamStats>(INITIAL_TEAM_A);
  const [teamB, setTeamB] = useState<TeamStats>(INITIAL_TEAM_B);

  // Status Jeda (Pause) & Konfirmasi Kembali ke Beranda (Home)
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showHomeConfirmModal, setShowHomeConfirmModal] = useState<boolean>(false);

  // Status waktu soal berjalan live (stopwatch detik aktual)
  const [elapsedLive, setElapsedLive] = useState<number>(0);
  const questionStartTimeRef = useRef<number | null>(null);
  const pauseStartMsRef = useRef<number | null>(null);
  const accumulatedPausedMsRef = useRef<number>(0);

  // Status hasil jawaban terakhir untuk feedback overlay
  const [lastAnswerResult, setLastAnswerResult] = useState<{
    answer: 'LEFT' | 'RIGHT';
    isCorrect: boolean;
    points: number;
    timeSpent: number;
  }>({
    answer: 'LEFT',
    isCorrect: false,
    points: 0,
    timeSpent: 0,
  });

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [isTeacherModeOpen, setIsTeacherModeOpen] = useState<boolean>(false);

  // Guard penguncian ronde
  const roundLockedRef = useRef<boolean>(false);

  // Penentuan Tim Aktif: Bergantian per soal (0=A, 1=B, 2=A, 3=B, dst.)
  const activeTeamId: TeamId = overallQuestionIndex % 2 === 0 ? 'TIM_A' : 'TIM_B';
  const activeTeam: TeamStats = activeTeamId === 'TIM_A' ? teamA : teamB;
  const otherTeam: TeamStats = activeTeamId === 'TIM_A' ? teamB : teamA;
  const teamQuestionNumber = Math.floor(overallQuestionIndex / 2) + 1; // 1 s/d 10

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        const elem = document.documentElement as HTMLElement & {
          webkitRequestFullscreen?: () => Promise<void>;
        };
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
        }
      } else {
        const doc = document as Document & {
          webkitExitFullscreen?: () => Promise<void>;
        };
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen request blocked or not supported:', err);
    }
  }, []);

  const handleDataChanged = useCallback(() => {
    const updated = getDaftarMapelDinams();
    setMapelList(updated);
  }, []);

  // Timer live stopwatch saat gameStatus === 'playing' dan tidak dijeda
  useEffect(() => {
    if (gameStatus !== 'playing' || isPaused) return;

    const interval = setInterval(() => {
      if (questionStartTimeRef.current !== null) {
        const now = performance.now();
        const diff = (now - questionStartTimeRef.current - accumulatedPausedMsRef.current) / 1000;
        setElapsedLive(Math.max(0, diff));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameStatus, isPaused]);

  // Handler Toggle Pause
  const handleTogglePause = useCallback(() => {
    setIsPaused(prev => {
      const next = !prev;
      if (next) {
        // Mulai jeda
        pauseStartMsRef.current = performance.now();
      } else {
        // Lanjutkan dari jeda: akumulasikan waktu paused
        if (pauseStartMsRef.current !== null) {
          accumulatedPausedMsRef.current += performance.now() - pauseStartMsRef.current;
          pauseStartMsRef.current = null;
        }
      }
      return next;
    });
  }, []);

  // Handler Tombol Home (Kembali ke Lobi)
  const handleGoHome = useCallback(() => {
    if (gameStatus === 'welcome' || gameStatus === 'summary') {
      setGameStatus('welcome');
      setIsPaused(false);
      return;
    }
    // Jika game sedang aktif, tampilkan dialog konfirmasi
    setShowHomeConfirmModal(true);
  }, [gameStatus]);

  // Memulai turnamen Estafet 2 Tim (20 Soal Unik)
  const startNewTournament = useCallback(() => {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {
      // ignore
    }

    // Ambil tepat 20 Soal Unik Bangun Datar yang telah diacak (shuffle)
    const fresh20 = prepare20UniqueQuestions();
    setQuestions(fresh20);
    setOverallQuestionIndex(0);
    setRoundResults([]);
    setTeamA({ ...INITIAL_TEAM_A });
    setTeamB({ ...INITIAL_TEAM_B });
    setIsPaused(false);
    setShowHomeConfirmModal(false);
    roundLockedRef.current = false;

    // Tampilkan Layar Transisi Giliran Pertama: "GILIRAN SELANJUTNYA: TIM A"
    setGameStatus('turn_transition');
  }, []);

  // Mulai giliran tim (dari layar transisi -> kalibrasi berdiri di tengah)
  const handleStartTurn = useCallback(() => {
    roundLockedRef.current = false;
    setIsPaused(false);
    setGameStatus('calibrating');
  }, []);

  // Selesai kalibrasi (hitungan mundur 3..2..1..MULAI tuntas) -> aktifkan menjawab & catat waktu mulai
  const handleCalibrationComplete = useCallback(() => {
    roundLockedRef.current = false;
    questionStartTimeRef.current = performance.now();
    pauseStartMsRef.current = null;
    accumulatedPausedMsRef.current = 0;
    setElapsedLive(0);
    setGameStatus('playing');
  }, []);

  // Kunci jawaban dari lompatan anak (KIRI = Benar, KANAN = Salah)
  const handleLockAnswer = useCallback(
    (choice: 'LEFT' | 'RIGHT') => {
      if (gameStatus !== 'playing') return;
      if (isPaused) return;
      if (roundLockedRef.current) return;
      roundLockedRef.current = true;

      const currentQ = questions[overallQuestionIndex];
      if (!currentQ) return;

      // Hitung waktu aktual yang dihabiskan
      const now = performance.now();
      const start = questionStartTimeRef.current || now;
      const pausedDuration = accumulatedPausedMsRef.current;
      const actualTimeSpentSeconds = Math.max(0.1, (now - start - pausedDuration) / 1000);

      // Hitung ketepatan jawaban
      const isCorrect =
        (choice === 'LEFT' && currentQ.jawabanBenarZona === 'KIRI') ||
        (choice === 'RIGHT' && currentQ.jawabanBenarZona === 'KANAN');
      const pointsAwarded = isCorrect ? 10 : 0; // Aturan: Benar = +10 Poin, Salah = 0 Poin (Maks 100 Poin)

      setLastAnswerResult({
        answer: choice,
        isCorrect,
        points: pointsAwarded,
        timeSpent: actualTimeSpentSeconds,
      });

      // Update skor dan waktu kumulatif tim aktif
      if (activeTeamId === 'TIM_A') {
        setTeamA(prev => ({
          ...prev,
          score: prev.score + pointsAwarded,
          correctCount: prev.correctCount + (isCorrect ? 1 : 0),
          totalAnswered: prev.totalAnswered + 1,
          totalTimeSeconds: prev.totalTimeSeconds + actualTimeSpentSeconds,
        }));
      } else {
        setTeamB(prev => ({
          ...prev,
          score: prev.score + pointsAwarded,
          correctCount: prev.correctCount + (isCorrect ? 1 : 0),
          totalAnswered: prev.totalAnswered + 1,
          totalTimeSeconds: prev.totalTimeSeconds + actualTimeSpentSeconds,
        }));
      }

      // Simpan riwayat ronde
      const roundResult: RoundResult = {
        question: currentQ,
        teamId: activeTeamId,
        teamName: activeTeam.name,
        studentAnswer: choice,
        isCorrect,
        pointsEarned: pointsAwarded,
        timeSpentSeconds: actualTimeSpentSeconds,
        questionNumberForTeam: teamQuestionNumber,
        overallQuestionNumber: overallQuestionIndex + 1,
      };

      setRoundResults(prev => [...prev, roundResult]);

      // Jeda singkat 600ms lalu tampilkan feedback
      setTimeout(() => {
        setGameStatus('round_feedback');
      }, 600);
    },
    [
      gameStatus,
      isPaused,
      questions,
      overallQuestionIndex,
      activeTeamId,
      activeTeam.name,
      teamQuestionNumber,
    ]
  );

  // Lanjut ke soal berikutnya atau giliran tim berikutnya
  const handleNextQuestion = useCallback(() => {
    roundLockedRef.current = false;
    setIsPaused(false);

    // Cek apakah masih ada soal tersisa dari total 20 soal
    if (overallQuestionIndex + 1 < questions.length && overallQuestionIndex + 1 < 20) {
      // Masuk ke giliran tim berikutnya (bergantian TIM A <-> TIM B)
      setOverallQuestionIndex(prev => prev + 1);
      setGameStatus('turn_transition');
    } else {
      // Seluruh 20 soal telah habis selesai -> Layar Kejuaraan & Penentuan Pemenang
      setGameStatus('summary');
    }
  }, [overallQuestionIndex, questions.length]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (isTeacherModeOpen || isTutorialOpen || showHomeConfirmModal) return;

      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (gameStatus === 'playing' || gameStatus === 'calibrating') {
          e.preventDefault();
          handleTogglePause();
        }
      } else if (e.key === ' ' || e.key === 'Enter') {
        if (isPaused) {
          e.preventDefault();
          handleTogglePause();
        } else if (gameStatus === 'round_feedback') {
          e.preventDefault();
          handleNextQuestion();
        }
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    gameStatus,
    isPaused,
    handleTogglePause,
    handleNextQuestion,
    toggleFullscreen,
    isTeacherModeOpen,
    isTutorialOpen,
    showHomeConfirmModal
  ]);

  const toggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const currentQ = questions[overallQuestionIndex] || {
    id: 'placeholder',
    itemName: 'Bangun Datar',
    questionText: 'Apakah roda sepeda berbentuk lingkaran?',
    isTrue: true,
    jawabanBenarZona: 'KIRI',
    explanation: 'Roda sepeda berbentuk bundar sempurna tanpa sudut, yaitu lingkaran.',
    funFact: 'Lingkaran memiliki jarak dari pusat ke tepi yang selalu sama.',
    category: 'Bangun Datar',
    illustrationId: 'wheel',
  };

  const nextTeamId: TeamId = (overallQuestionIndex + 1) % 2 === 0 ? 'TIM_A' : 'TIM_B';
  const isLastQuestionOverall = overallQuestionIndex + 1 >= 20 || overallQuestionIndex + 1 >= questions.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950 font-['Nunito',sans-serif] smooth-transition">
      {/* 1. HEADER ATAS RESMI (DENGAN PAPAN SKOR 2 TIM, TOMBOL HOME & PAUSE) */}
      <ScoreHeader
        activeTeamId={activeTeamId}
        teamA={teamA}
        teamB={teamB}
        overallQuestionNumber={overallQuestionIndex + 1}
        totalQuestions={questions.length > 0 ? questions.length : 20}
        isGameActive={gameStatus === 'playing' || gameStatus === 'calibrating'}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
        onGoHome={handleGoHome}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* 2. MAIN CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-5 flex flex-col justify-center relative">
        {/* LAYAR UTAMA / LOBI ESTAFET 2 TIM */}
        {gameStatus === 'welcome' && (
          <div className="max-w-3xl mx-auto w-full bg-slate-900/95 border-4 border-amber-400 rounded-3xl p-5 sm:p-8 shadow-2xl text-center space-y-6 my-auto smooth-transition animate-in fade-in duration-300">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400 text-amber-300 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>KOMPETISI ESTAFET 2 TIM • BANGUN DATAR</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
                Selamat Datang di Game Edukasi Interaktif
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto font-medium">
                Sistem kompetisi estafet cerdas antara <strong className="text-amber-300">TIM A</strong> dan{' '}
                <strong className="text-sky-300">TIM B</strong>. Anak maju satu per satu ke depan kamera untuk menjawab{' '}
                <strong className="text-white font-bold">20 soal unik tanpa pengulangan</strong>!
              </p>
            </div>

            {/* PREVIEW KARTU 2 TIM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left">
              {/* TIM A */}
              <div className="p-4 rounded-3xl bg-amber-500/10 border-2 border-amber-400/80 shadow-lg space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm shadow">
                    A
                  </div>
                  <div>
                    <h3 className="text-base font-black text-amber-300 uppercase">TIM A</h3>
                    <span className="text-[10px] text-amber-200/80 font-bold">10 Soal Bergantian</span>
                  </div>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span>Target Skor:</span>
                    <strong className="text-amber-300 font-bold">Maks 100 Poin</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Giliran:</span>
                    <strong className="text-white">Soal 1, 3, 5, 7, ...</strong>
                  </div>
                </div>
              </div>

              {/* TIM B */}
              <div className="p-4 rounded-3xl bg-sky-500/10 border-2 border-sky-400/80 shadow-lg space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-sky-400 text-slate-950 font-black flex items-center justify-center text-sm shadow">
                    B
                  </div>
                  <div>
                    <h3 className="text-base font-black text-sky-300 uppercase">TIM B</h3>
                    <span className="text-[10px] text-sky-200/80 font-bold">10 Soal Bergantian</span>
                  </div>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span>Target Skor:</span>
                    <strong className="text-sky-300 font-bold">Maks 100 Poin</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Giliran:</span>
                    <strong className="text-white">Soal 2, 4, 6, 8, ...</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* ATURAN SKOR & TIE-BREAKER BOX */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-300 max-w-xl mx-auto space-y-1.5 text-left">
              <div className="flex items-center gap-1.5 font-black text-amber-300 text-xs uppercase">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Aturan Penentuan Juara & Tie-Breaker:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                <li>Setiap jawaban <strong className="text-emerald-400">BENAR = +10 Poin</strong>. SALAH = 0 Poin.</li>
                <li>Sistem mencatat <strong className="text-white font-bold">Waktu Aktual (detik)</strong> yang dihabiskan tiap tim.</li>
                <li>Juara ditentukan oleh <strong className="text-amber-300">Poin Tertinggi</strong>. Jika poin seri, pemenang adalah tim dengan <strong className="text-sky-300">Total Waktu Lebih Cepat (Tie-Breaker)</strong>!</li>
              </ul>
            </div>

            {/* TOMBOL BESAR MULAI ESTAFET */}
            <div className="pt-2 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={startNewTournament}
                className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 text-slate-950 font-black rounded-3xl shadow-2xl shadow-amber-500/50 text-xl sm:text-2xl flex items-center justify-center gap-3 transition transform active:scale-95 cursor-pointer border-4 border-white animate-bounce hover:animate-none"
              >
                <Play className="w-7 h-7 fill-slate-950" />
                <span>MULAI ESTAFET 2 TIM (20 SOAL)</span>
              </button>
              <span className="text-xs text-slate-400 font-bold">
                Sistem akan memanggil perwakilan TIM A untuk soal pertama
              </span>
            </div>
          </div>
        )}

        {/* 3. LAYAR TRANSISI PANGGILAN GILIRAN ESTAFET TIM */}
        {gameStatus === 'turn_transition' && (
          <TurnTransitionScreen
            currentTeam={activeTeam}
            previousTeamName={overallQuestionIndex > 0 ? otherTeam.name : undefined}
            previousTeamScore={overallQuestionIndex > 0 ? otherTeam.score : undefined}
            previousTeamCorrect={overallQuestionIndex > 0 ? otherTeam.correctCount : undefined}
            overallQuestionNumber={overallQuestionIndex + 1}
            totalQuestions={questions.length > 0 ? questions.length : 20}
            teamQuestionNumber={teamQuestionNumber}
            teamTotalQuestions={10}
            teamA={teamA}
            teamB={teamB}
            onStartTurn={handleStartTurn}
          />
        )}

        {/* 4. ARENA TANDING KAMERA 1 PEMAIN: KALIBRASI & BERMAIN */}
        <div
          className={`w-full flex flex-col gap-3 my-auto smooth-transition ${
            gameStatus === 'playing' || gameStatus === 'calibrating' || gameStatus === 'round_feedback'
              ? 'block'
              : 'hidden'
          }`}
        >
          {/* Card Soal Aktif dengan Stopwatch */}
          <QuestionCard
            question={currentQ}
            questionNumber={overallQuestionIndex + 1}
            totalQuestions={questions.length > 0 ? questions.length : 20}
            teamName={activeTeam.name}
            teamScore={activeTeam.score}
            questionNumberInTurn={teamQuestionNumber}
            totalQuestionsInTurn={10}
            elapsedSeconds={elapsedLive}
            autoSpeak={gameStatus === 'playing'}
            isCalibrating={gameStatus === 'calibrating'}
          />

          {/* Kamera Layar Penuh 1 Pemain (3 Zona Kiri/Tengah/Kanan) */}
          <div className="w-full h-[58vh] sm:h-[62vh] min-h-[380px] max-h-[640px] relative">
            <CameraView
              teamName={activeTeam.name}
              isGameActive={gameStatus === 'playing'}
              onLockAnswer={handleLockAnswer}
              dwellTargetSec={2.0} // 2.0 detik stabil
              isCalibrating={gameStatus === 'calibrating'}
              onCalibrationComplete={handleCalibrationComplete}
              questionNumberInTurn={teamQuestionNumber}
              totalQuestionsInTurn={10}
              isPaused={isPaused}
            />

            {/* Umpan Balik Jawaban Ronde */}
            {gameStatus === 'round_feedback' && (
              <FeedbackOverlay
                question={currentQ}
                teamName={activeTeam.name}
                studentAnswer={lastAnswerResult.answer}
                isCorrect={lastAnswerResult.isCorrect}
                pointsEarned={lastAnswerResult.points}
                timeSpentSeconds={lastAnswerResult.timeSpent}
                questionNumberInTurn={teamQuestionNumber}
                totalQuestionsInTurn={10}
                nextTeamName={isLastQuestionOverall ? undefined : (nextTeamId === 'TIM_A' ? 'TIM A' : 'TIM B')}
                isLastQuestionOfTurn={true}
                isGameFinished={isLastQuestionOverall}
                onNextQuestion={handleNextQuestion}
                autoAdvanceSec={5.0}
              />
            )}
          </div>
        </div>

        {/* 5. LAYAR HASIL AKHIR (SETELAH 20 SOAL SELESAI DENGAN TIE-BREAKER WAKTU) */}
        {gameStatus === 'summary' && (
          <SummaryModal
            teamA={teamA}
            teamB={teamB}
            results={roundResults}
            onRestart={startNewTournament}
            onBackToMenu={() => setGameStatus('welcome')}
          />
        )}
      </main>

      {/* MODAL DIJEDA (PAUSE MODAL) */}
      {isPaused && (gameStatus === 'playing' || gameStatus === 'calibrating') && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-slate-900 border-4 border-amber-400 rounded-3xl p-6 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border-2 border-amber-400 text-amber-300 flex items-center justify-center text-3xl mx-auto shadow-lg animate-pulse">
              ⏸️
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white uppercase tracking-wider">
                PERMAINAN DIJEDA
              </h3>
              <p className="text-xs text-slate-300">
                Timer dan deteksi kamera dihentikan sementara.
              </p>
            </div>

            {/* Skor Sementara & Giliran Aktif */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-2">
              <div className="text-slate-400 font-bold">Status Skor Sementara:</div>
              <div className="flex justify-between items-center px-3 py-1.5 bg-amber-500/10 rounded-xl text-amber-300 font-black">
                <span>TIM A:</span>
                <span>{teamA.score} Poin • {teamA.totalTimeSeconds.toFixed(1)}s</span>
              </div>
              <div className="flex justify-between items-center px-3 py-1.5 bg-sky-500/10 rounded-xl text-sky-300 font-black">
                <span>TIM B:</span>
                <span>{teamB.score} Poin • {teamB.totalTimeSeconds.toFixed(1)}s</span>
              </div>
              <div className="text-[11px] text-slate-400 pt-1">
                Giliran Aktif Saat Ini: <strong className="text-white">{activeTeam.name}</strong> (Soal #{overallQuestionIndex + 1}/20)
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleTogglePause}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black rounded-2xl text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-95"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>LANJUTKAN (RESUME)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowHomeConfirmModal(true);
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-2xl text-xs uppercase tracking-wider border border-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Home className="w-4 h-4" />
                <span>Kembali ke Menu Utama</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI KEMBALI KE BERANDA (HOME CONFIRMATION) */}
      {showHomeConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-slate-900 border-4 border-rose-500 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border-2 border-rose-500 text-rose-400 flex items-center justify-center text-2xl mx-auto shadow-lg">
              ⚠️
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white uppercase tracking-wider">
                Kembali ke Menu Utama?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pertandingan Estafet 2 Tim yang sedang berlangsung akan dihentikan dan progres soal akan direset.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowHomeConfirmModal(false);
                  setIsPaused(false);
                  setGameStatus('welcome');
                }}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow transition cursor-pointer"
              >
                Ya, Kembali ke Menu
              </button>
              <button
                type="button"
                onClick={() => setShowHomeConfirmModal(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider border border-slate-700 transition cursor-pointer"
              >
                Lanjutkan Permainan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="w-full bg-slate-950/80 border-t border-slate-800/60 py-2 px-4 text-center text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Mode 1 Pemain: Kiri = Benar (Hijau) • Kanan = Salah (Merah)</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTeacherModeOpen(true)}
            className="hover:text-amber-300 font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Bank Soal (30 Soal Bangun Datar)</span>
          </button>
          <span>•</span>
          <button
            onClick={() => setIsTutorialOpen(true)}
            className="hover:text-amber-300 font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Panduan Bermain</span>
          </button>
        </div>
      </footer>

      {/* MODAL TUTORIAL */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      {/* MODAL MODE GURU (BANK SOAL) */}
      <TeacherModeModal
        isOpen={isTeacherModeOpen}
        onClose={() => setIsTeacherModeOpen(false)}
        onDataChanged={handleDataChanged}
      />
    </div>
  );
}
