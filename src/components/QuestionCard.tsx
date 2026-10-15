import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Trophy, Clock, Swords } from 'lucide-react';
import { Question, TeamId } from '../types';
import { ItemIllustration } from './ItemIllustration';
import { soundManager } from '../utils/audio';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  teamName: string;
  teamScore: number;
  questionNumberInTurn: number;
  totalQuestionsInTurn: number;
  elapsedSeconds?: number;
  autoSpeak?: boolean;
  isCalibrating?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  teamName,
  teamScore,
  questionNumberInTurn,
  totalQuestionsInTurn,
  elapsedSeconds = 0,
  autoSpeak = true,
  isCalibrating = false,
}) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getSpeechMuted());

  const isTeamA = teamName.toUpperCase().includes('TIM A');

  // Auto-speak question in Indonesian whenever question changes and not calibrating
  useEffect(() => {
    if (autoSpeak && !isMuted && !isCalibrating) {
      soundManager.speakText(
        `Giliran ${teamName}. ${question.questionText}. Lompat ke kiri untuk Benar, atau ke kanan untuk Salah!`
      );
      setIsSpeaking(true);
      const timer = setTimeout(() => setIsSpeaking(false), 3800);
      return () => clearTimeout(timer);
    }
  }, [question, autoSpeak, isMuted, isCalibrating, teamName]);

  const handleSpeakToggle = () => {
    if (isSpeaking) {
      soundManager.stopSpeaking();
      setIsSpeaking(false);
    } else {
      soundManager.speakText(
        `Giliran ${teamName}. ${question.questionText}. Lompat ke kiri untuk Benar, atau ke kanan untuk Salah!`
      );
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 3800);
    }
  };

  const handleMuteToggle = () => {
    const muted = soundManager.toggleSpeechMute();
    setIsMuted(muted);
    if (muted) setIsSpeaking(false);
  };

  return (
    <div className="w-full bg-slate-900/95 backdrop-blur-md border-2 border-amber-400/60 rounded-3xl p-3 sm:p-4 shadow-2xl text-white relative space-y-2.5">
      {/* Top Bar: Team Badge, Score, Timer & Audio */}
      <div className="flex items-center justify-between gap-2 flex-wrap pb-1 border-b border-slate-800">
        {/* Current Team Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={`px-3 py-1 rounded-xl border flex items-center gap-1.5 shadow ${
              isTeamA
                ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                : 'bg-sky-500/25 border-sky-400 text-sky-200'
            }`}
          >
            <span className="text-xs font-black uppercase">
              Giliran: <strong className="text-white font-black">{teamName}</strong>
            </span>
            <span className="text-[10px] font-bold opacity-80">(Soal {questionNumberInTurn}/{totalQuestionsInTurn})</span>
          </div>

          <div className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-1 text-xs font-black text-amber-300">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{teamScore} Poin</span>
          </div>

          {/* Stopwatch Waktu Soal Ini */}
          <div className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-1 text-xs font-mono font-bold text-emerald-300">
            <Clock className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span>{elapsedSeconds.toFixed(1)}s</span>
          </div>

          <div className="px-2 py-1 rounded-xl bg-slate-800/80 text-slate-400 text-[11px] font-extrabold border border-slate-700">
            Total #{questionNumber}/{totalQuestions}
          </div>
        </div>

        {/* Audio read-aloud buttons */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={handleSpeakToggle}
            onTouchStart={(e) => {
              e.preventDefault();
              handleSpeakToggle();
            }}
            className={`px-3 py-1 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer touch-manipulation ${
              isSpeaking
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/40 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title="Dengarkan soal dibacakan"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isSpeaking ? 'Membaca...' : 'Dengar Soal'}</span>
          </button>

          <button
            onClick={handleMuteToggle}
            onTouchStart={(e) => {
              e.preventDefault();
              handleMuteToggle();
            }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition border border-slate-700 cursor-pointer touch-manipulation"
            title={isMuted ? 'Nyalakan Suara Narator' : 'Matikan Suara Narator'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content: Illustration + Question Prompt */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 bg-slate-800/80 p-3 sm:p-4 rounded-2xl border border-slate-700/80">
        {/* Item Illustration */}
        <div className="relative group shrink-0 p-1.5 bg-gradient-to-br from-slate-700/50 to-slate-900/80 rounded-2xl border border-slate-600/50 shadow-inner">
          <ItemIllustration
            illustrationId={question.illustrationId}
            className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-lg"
          />
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full shadow whitespace-nowrap">
            {question.itemName}
          </div>
        </div>

        {/* Question Prompt */}
        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="text-[11px] uppercase tracking-wider font-extrabold text-amber-400 flex items-center justify-center sm:justify-start gap-2">
            <span>Tantangan Bangun Datar:</span>
            <span className="text-[10px] text-slate-400">
              (Lompat Kiri = Benar | Kanan = Salah)
            </span>
          </div>
          <h2 className="text-base sm:text-xl font-black text-white leading-snug drop-shadow-sm">
            {question.questionText}
          </h2>
        </div>
      </div>
    </div>
  );
};
