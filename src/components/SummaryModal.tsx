import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  RotateCcw,
  Check,
  X,
  Medal,
  Crown,
  Users,
  Sparkles,
  Clock,
  Home,
  Zap,
  Flame
} from 'lucide-react';
import { TeamStats, RoundResult } from '../types';

interface SummaryModalProps {
  teamA: TeamStats;
  teamB: TeamStats;
  results: RoundResult[];
  onRestart: () => void;
  onBackToMenu: () => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  teamA,
  teamB,
  results,
  onRestart,
  onBackToMenu,
}) => {
  // Evaluasi Pemenang:
  // 1. Poin tertinggi
  // 2. Tie-Breaker: Jika poin sama, waktu lebih sedikit (lebih cepat) yang menang
  let winnerTeam: TeamStats | null = null;
  let loserTeam: TeamStats | null = null;
  let isDraw = false;
  let tieBreakerUsed = false;
  let timeDifference = 0;

  if (teamA.score > teamB.score) {
    winnerTeam = teamA;
    loserTeam = teamB;
  } else if (teamB.score > teamA.score) {
    winnerTeam = teamB;
    loserTeam = teamA;
  } else {
    // Poin sama persis! Evaluasi tie-breaker waktu
    timeDifference = Math.abs(teamA.totalTimeSeconds - teamB.totalTimeSeconds);
    if (teamA.totalTimeSeconds < teamB.totalTimeSeconds) {
      winnerTeam = teamA;
      loserTeam = teamB;
      tieBreakerUsed = true;
    } else if (teamB.totalTimeSeconds < teamA.totalTimeSeconds) {
      winnerTeam = teamB;
      loserTeam = teamA;
      tieBreakerUsed = true;
    } else {
      isDraw = true;
    }
  }

  useEffect(() => {
    // Confetti tembakan ganda untuk perayaan kejuaraan
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const interval: NodeJS.Timeout = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }

      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#FBBF24', '#38BDF8', '#10B981', '#F43F5E', '#FFFFFF'],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto my-auto p-4 sm:p-6 bg-slate-900/95 border-4 border-amber-400 rounded-3xl shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200 select-none">
      {/* Title Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 border border-amber-400/40 rounded-full text-amber-300 text-xs font-black uppercase tracking-wider">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>LAYAR KEJUARAAN ESTAFET 2 TIM • BANGUN DATAR</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          PERTANDINGAN SELESAI! 🎉
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 font-medium">
          Total 20 soal unik telah dijawab secara bergantian oleh perwakilan TIM A dan TIM B!
        </p>
      </div>

      {/* HIGHLIGHT PEMENANG / JUARA */}
      {isDraw ? (
        <div className="max-w-xl mx-auto p-5 rounded-3xl bg-slate-800/90 border-2 border-slate-600 shadow-xl flex items-center justify-center gap-3">
          <span className="text-3xl">🤝</span>
          <div className="text-left">
            <h3 className="text-xl font-black text-white">HASIL SERI / DRAW!</h3>
            <p className="text-xs text-slate-300">Kedua tim memiliki poin ({teamA.score} Poin) dan waktu yang sama persis!</p>
          </div>
        </div>
      ) : winnerTeam && (
        <div
          className={`max-w-2xl mx-auto p-5 rounded-3xl border-4 shadow-2xl flex flex-col items-center gap-3 ${
            winnerTeam.id === 'TIM_A'
              ? 'bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-500/20 border-amber-400 shadow-amber-400/30 ring-4 ring-amber-400/20'
              : 'bg-gradient-to-r from-sky-500/20 via-cyan-400/30 to-sky-500/20 border-sky-400 shadow-sky-400/30 ring-4 ring-sky-400/20'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-3xl font-black shadow-lg">
              👑
            </div>
            <div className="text-left">
              <span className="text-[11px] font-black text-amber-300 uppercase tracking-widest block">
                SELAMAT KEPADA SANG JUARA:
              </span>
              <h3 className="text-2xl sm:text-4xl font-black text-white tracking-wide uppercase drop-shadow">
                {winnerTeam.name} MEMENANGKAN ESTAFET! 🏆
              </h3>
            </div>
          </div>

          {/* Badge Tie-Breaker jika menang karena waktu lebih cepat */}
          {tieBreakerUsed ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 text-xs sm:text-sm font-black shadow-lg">
              <Zap className="w-4 h-4 text-emerald-400 animate-bounce" />
              <span>
                MENANG TIE-BREAKER WAKTU! Poin sama ({winnerTeam.score} Poin), namun {winnerTeam.name} lebih cepat{' '}
                {timeDifference.toFixed(1)} detik!
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-slate-900/80 border border-slate-700 text-xs font-bold text-slate-200">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Unggul dengan perolehan {winnerTeam.score} Poin berbanding {loserTeam?.score} Poin!</span>
            </div>
          )}
        </div>
      )}

      {/* HEAD TO HEAD COMPARISON TIM A VS TIM B */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {/* KARTU TIM A */}
        <div
          className={`p-5 rounded-3xl border-2 text-left relative overflow-hidden transition shadow-xl ${
            winnerTeam?.id === 'TIM_A'
              ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/40'
              : 'bg-slate-950/80 border-slate-800'
          }`}
        >
          {winnerTeam?.id === 'TIM_A' && (
            <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black tracking-wider uppercase">
              JUARA 1 🏆
            </div>
          )}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm">
              A
            </div>
            <div>
              <h4 className="text-base font-black text-amber-300 uppercase">TIM A</h4>
              <span className="text-[10px] text-slate-400 font-bold">10 Soal Terjawab</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-800">
              <span className="text-slate-400 font-bold">Total Poin:</span>
              <span className="text-lg font-black text-white">{teamA.score} Poin</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800">
              <span className="text-slate-400 font-bold">Jawaban Benar:</span>
              <span className="font-extrabold text-emerald-400">{teamA.correctCount} / 10 Soal</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800">
              <span className="text-slate-400 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Total Waktu Menjawab:</span>
              </span>
              <span className="font-mono font-black text-amber-300 text-sm">{teamA.totalTimeSeconds.toFixed(1)} detik</span>
            </div>
            <div className="flex justify-between items-center pt-1 text-[11px]">
              <span className="text-slate-500">Rata-rata per soal:</span>
              <span className="text-slate-300 font-mono font-bold">{(teamA.totalTimeSeconds / 10).toFixed(1)}s</span>
            </div>
          </div>
        </div>

        {/* KARTU TIM B */}
        <div
          className={`p-5 rounded-3xl border-2 text-left relative overflow-hidden transition shadow-xl ${
            winnerTeam?.id === 'TIM_B'
              ? 'bg-sky-500/15 border-sky-400 ring-2 ring-sky-400/40'
              : 'bg-slate-950/80 border-slate-800'
          }`}
        >
          {winnerTeam?.id === 'TIM_B' && (
            <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-sky-400 text-slate-950 text-[10px] font-black tracking-wider uppercase">
              JUARA 1 🏆
            </div>
          )}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-sky-400 text-slate-950 font-black flex items-center justify-center text-sm">
              B
            </div>
            <div>
              <h4 className="text-base font-black text-sky-300 uppercase">TIM B</h4>
              <span className="text-[10px] text-slate-400 font-bold">10 Soal Terjawab</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-800">
              <span className="text-slate-400 font-bold">Total Poin:</span>
              <span className="text-lg font-black text-white">{teamB.score} Poin</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800">
              <span className="text-slate-400 font-bold">Jawaban Benar:</span>
              <span className="font-extrabold text-emerald-400">{teamB.correctCount} / 10 Soal</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800">
              <span className="text-slate-400 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Total Waktu Menjawab:</span>
              </span>
              <span className="font-mono font-black text-sky-300 text-sm">{teamB.totalTimeSeconds.toFixed(1)} detik</span>
            </div>
            <div className="flex justify-between items-center pt-1 text-[11px]">
              <span className="text-slate-500">Rata-rata per soal:</span>
              <span className="text-slate-300 font-mono font-bold">{(teamB.totalTimeSeconds / 10).toFixed(1)}s</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIWAYAT 20 SOAL BERGILIRAN */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-left space-y-2 max-h-52 overflow-y-auto">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
          <span className="text-xs font-black text-slate-300 uppercase">
            Riwayat 20 Soal Estafet Bergantian ({results.length} Soal Selesai):
          </span>
          <span className="text-[11px] text-slate-400 font-bold">Hasil & Waktu</span>
        </div>

        <div className="space-y-1.5">
          {results.map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-mono text-slate-500 w-5 text-center">#{i + 1}</span>
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                    r.isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                  }`}
                >
                  {r.isCorrect ? '✔' : '✖'}
                </span>
                <span
                  className={`font-black shrink-0 px-2 py-0.5 rounded text-[10px] ${
                    r.teamId === 'TIM_A'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                      : 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                  }`}
                >
                  {r.teamName} (Soal {r.questionNumberForTeam}/10)
                </span>
                <span className="text-slate-200 truncate">{r.question.questionText}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 font-bold">
                <span className="text-slate-400 text-[10px] font-mono">{r.timeSpentSeconds.toFixed(1)}s</span>
                <span
                  className={`text-[11px] font-black ${
                    r.isCorrect ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {r.isCorrect ? '+10 Poin' : '+0'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onRestart}
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 text-slate-950 font-black rounded-2xl text-sm uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 transition transform active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>MAIN ESTAFET LAGI (20 SOAL BARU)</span>
        </button>

        <button
          type="button"
          onClick={onBackToMenu}
          className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl text-sm uppercase tracking-wider border border-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>KEMBALI KE MENU UTAMA</span>
        </button>
      </div>
    </div>
  );
};

