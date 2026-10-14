import React, { useEffect, useRef } from 'react';
import { Play, Trophy, Clock, Users, ArrowRight } from 'lucide-react';
import { TeamStats } from '../types';
import { soundManager } from '../utils/audio';

interface TurnTransitionScreenProps {
  currentTeam: TeamStats;
  previousTeamName?: string;
  previousTeamScore?: number;
  previousTeamCorrect?: number;
  overallQuestionNumber: number; // 1..20
  totalQuestions: number; // 20
  teamQuestionNumber: number; // 1..10
  teamTotalQuestions: number; // 10
  teamA: TeamStats;
  teamB: TeamStats;
  onStartTurn: () => void;
}

export const TurnTransitionScreen: React.FC<TurnTransitionScreenProps> = ({
  currentTeam,
  previousTeamName,
  previousTeamScore,
  previousTeamCorrect,
  overallQuestionNumber,
  totalQuestions,
  teamQuestionNumber,
  teamTotalQuestions,
  teamA,
  teamB,
  onStartTurn,
}) => {
  const onStartTurnRef = useRef(onStartTurn);
  onStartTurnRef.current = onStartTurn;
  const hasTriggeredRef = useRef<boolean>(false);

  const isTeamA = currentTeam.id === 'TIM_A';

  // Play audio announcement on mount
  useEffect(() => {
    soundManager.playCorrect();
    soundManager.speakText(
      `Giliran selanjutnya, perwakilan ${currentTeam.name} silakan maju ke depan kamera! Bersiap di garis tengah!`
    );
  }, [currentTeam.name]);

  // Keyboard shortcut: Space or Enter to immediately start
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          onStartTurnRef.current();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStart = () => {
    if (!hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      onStartTurnRef.current();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-300">
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center items-center">
        <div
          className={`w-96 h-96 rounded-full blur-3xl animate-pulse ${
            isTeamA ? 'bg-amber-500/20' : 'bg-sky-500/20'
          }`}
        />
      </div>

      <div className="max-w-2xl w-full flex flex-col items-center text-center space-y-6 relative z-10">
        {/* Giliran Badge */}
        <div
          className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border-2 text-xs sm:text-sm font-black uppercase tracking-widest shadow-2xl ring-4 ${
            isTeamA
              ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-amber-400/20'
              : 'bg-sky-500/20 border-sky-400 text-sky-300 ring-sky-400/20'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>ESTAFET 2 TIM • SOAL #{overallQuestionNumber} DARI {totalQuestions}</span>
        </div>

        {/* TULISAN UTAMA BESAR: GILIRAN ESTAFET: TIM A / TIM B */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-300 uppercase tracking-widest drop-shadow">
            GILIRAN SELANJUTNYA:
          </h2>
          <h1
            className={`text-5xl sm:text-7xl font-black tracking-wide uppercase drop-shadow-2xl ${
              isTeamA ? 'text-amber-400' : 'text-sky-400'
            }`}
          >
            ⭐ {currentTeam.name} ⭐
          </h1>
          <p className="text-sm sm:text-base text-slate-200 max-w-md mx-auto font-medium">
            Perwakilan <strong className={isTeamA ? 'text-amber-300' : 'text-sky-300'}>{currentTeam.name}</strong> silakan maju ke tengah layar kamera.
            Ini adalah <strong className="text-white font-black">Soal ke-{teamQuestionNumber} dari {teamTotalQuestions}</strong> untuk timmu!
          </p>
        </div>

        {/* HEAD TO HEAD SKOR SEMENTARA */}
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl">
          <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 text-center">
            Skor & Waktu Sementara:
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            {/* TIM A */}
            <div
              className={`p-3 rounded-2xl border ${
                isTeamA
                  ? 'bg-amber-500/20 border-amber-400 shadow-md ring-2 ring-amber-400/30'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="text-xs font-black text-amber-300 uppercase">TIM A</div>
              <div className="text-2xl font-black text-white">{teamA.score} <span className="text-xs font-normal text-slate-400">pt</span></div>
              <div className="text-[11px] text-slate-300 font-bold flex items-center justify-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{teamA.totalTimeSeconds.toFixed(1)}s</span>
              </div>
            </div>

            {/* TIM B */}
            <div
              className={`p-3 rounded-2xl border ${
                !isTeamA
                  ? 'bg-sky-500/20 border-sky-400 shadow-md ring-2 ring-sky-400/30'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="text-xs font-black text-sky-300 uppercase">TIM B</div>
              <div className="text-2xl font-black text-white">{teamB.score} <span className="text-xs font-normal text-slate-400">pt</span></div>
              <div className="text-[11px] text-slate-300 font-bold flex items-center justify-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-sky-400" />
                <span>{teamB.totalTimeSeconds.toFixed(1)}s</span>
              </div>
            </div>
          </div>
        </div>

        {/* PANDUAN SINGKAT MELOMPAT */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-md text-xs font-black">
          <div className="p-3 rounded-2xl bg-emerald-950/60 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center gap-1.5 shadow">
            <span>👈 LOMPAT KIRI = BENAR</span>
          </div>
          <div className="p-3 rounded-2xl bg-rose-950/60 border-2 border-rose-400 text-rose-300 flex items-center justify-center gap-1.5 shadow">
            <span>LOMPAT KANAN = SALAH 👉</span>
          </div>
        </div>

        {/* TOMBOL BESAR MULAI GILIRAN */}
        <div className="pt-2 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleStart}
            className={`w-full sm:w-auto px-10 py-4 font-black rounded-3xl shadow-2xl text-xl sm:text-2xl flex items-center justify-center gap-3 transition transform active:scale-95 cursor-pointer border-4 border-white ${
              isTeamA
                ? 'bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 text-slate-950 shadow-amber-400/50'
                : 'bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-300 text-slate-950 shadow-sky-400/50'
            }`}
          >
            <Play className="w-6 h-6 fill-slate-950" />
            <span>SAYA SIAP (MULAI KALIBRASI)</span>
          </button>
          <span className="text-xs text-slate-400 font-bold">
            Atau tekan tombol <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-amber-300">Spasi</kbd> / <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-amber-300">Enter</kbd> di keyboard
          </span>
        </div>
      </div>
    </div>
  );
};

