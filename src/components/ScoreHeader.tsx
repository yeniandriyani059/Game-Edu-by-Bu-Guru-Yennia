import React from 'react';
import {
  Trophy,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Home,
  Pause,
  Play,
  Clock,
  Swords
} from 'lucide-react';
import { TeamStats, TeamId } from '../types';

interface ScoreHeaderProps {
  activeTeamId: TeamId;
  teamA: TeamStats;
  teamB: TeamStats;
  overallQuestionNumber: number; // 1..20
  totalQuestions: number; // 20
  isGameActive: boolean;
  isPaused: boolean;
  onTogglePause: () => void;
  onGoHome: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const ScoreHeader: React.FC<ScoreHeaderProps> = ({
  activeTeamId,
  teamA,
  teamB,
  overallQuestionNumber,
  totalQuestions,
  isGameActive,
  isPaused,
  onTogglePause,
  onGoHome,
  isMuted,
  onToggleMute,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <header className="w-full bg-slate-900/95 border-b-4 border-amber-400/80 shadow-2xl backdrop-blur-md z-30 select-none py-2 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
        {/* SISI KIRI: BRANDING & HOME BUTTON */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onGoHome}
            onTouchStart={(e) => {
              e.preventDefault();
              onGoHome();
            }}
            className="p-2 sm:p-2.5 rounded-2xl bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-200 border-2 border-slate-700 transition cursor-pointer flex items-center gap-1.5 shadow touch-manipulation"
            title="Kembali ke Menu Utama (Home)"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs font-black hidden lg:inline">Menu Utama</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-xl sm:text-2xl shadow-md shrink-0">
              ⭐
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wide truncate">
                Game Edu by Bu Guru Yennia
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-400 font-bold truncate">
                Estafet 2 Tim • 10 Soal Unik Bangun Datar
              </p>
            </div>
          </div>
        </div>

        {/* TENGAH: PAPAN SKOR KEDUA TIM & WAKTU KUMULATIF */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* TIM A */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl transition-all ${
              activeTeamId === 'TIM_A' && isGameActive
                ? 'bg-amber-500/25 border-2 border-amber-400 shadow-md shadow-amber-400/20 ring-2 ring-amber-400/40 scale-105'
                : 'bg-slate-950/70 border border-slate-800 opacity-85'
            }`}
          >
            <div className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center text-xs font-black shrink-0">
              A
            </div>
            <div className="text-left min-w-[70px]">
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-amber-300">TIM A</span>
                {activeTeamId === 'TIM_A' && isGameActive && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black text-white">
                <span className="text-amber-200">{teamA.score} Poin</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5 text-amber-400" />
                  {teamA.totalTimeSeconds.toFixed(1)}s
                </span>
              </div>
            </div>
          </div>

          <div className="text-slate-500 font-black text-xs sm:text-sm flex flex-col items-center">
            <span>VS</span>
            {isGameActive && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-800 text-sky-300 border border-slate-700">
                #{overallQuestionNumber}/{totalQuestions}
              </span>
            )}
          </div>

          {/* TIM B */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl transition-all ${
              activeTeamId === 'TIM_B' && isGameActive
                ? 'bg-sky-500/25 border-2 border-sky-400 shadow-md shadow-sky-400/20 ring-2 ring-sky-400/40 scale-105'
                : 'bg-slate-950/70 border border-slate-800 opacity-85'
            }`}
          >
            <div className="w-7 h-7 rounded-xl bg-sky-400 text-slate-950 flex items-center justify-center text-xs font-black shrink-0">
              B
            </div>
            <div className="text-left min-w-[70px]">
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-sky-300">TIM B</span>
                {activeTeamId === 'TIM_B' && isGameActive && (
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black text-white">
                <span className="text-sky-200">{teamB.score} Poin</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5 text-sky-400" />
                  {teamB.totalTimeSeconds.toFixed(1)}s
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SISI KANAN: TOMBOL NAVIGASI & KONTROL */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Tombol Pause/Jeda */}
          {isGameActive && (
            <button
              onClick={onTogglePause}
              onTouchStart={(e) => {
                e.preventDefault();
                onTogglePause();
              }}
              className={`px-3 py-2 rounded-xl border transition cursor-pointer flex items-center gap-1.5 text-xs font-black shadow touch-manipulation ${
                isPaused
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 border-emerald-400 animate-pulse'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-300'
              }`}
              title={isPaused ? 'Lanjutkan Permainan (Resume)' : 'Jeda Permainan (Pause)'}
            >
              {isPaused ? <Play className="w-4 h-4 fill-slate-950" /> : <Pause className="w-4 h-4 fill-slate-950" />}
              <span className="font-black">{isPaused ? 'Lanjut' : 'Jeda'}</span>
            </button>
          )}

          {/* Tombol Mute */}
          <button
            onClick={onToggleMute}
            onTouchStart={(e) => {
              e.preventDefault();
              onToggleMute();
            }}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer touch-manipulation"
            title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Tombol Fullscreen */}
          <button
            onClick={onToggleFullscreen}
            onTouchStart={(e) => {
              e.preventDefault();
              onToggleFullscreen();
            }}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer touch-manipulation"
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};

