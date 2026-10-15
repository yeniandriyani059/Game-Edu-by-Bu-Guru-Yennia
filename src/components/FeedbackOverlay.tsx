import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, ArrowRight, Lightbulb, Trophy, Clock, Sparkles } from 'lucide-react';
import { Question } from '../types';
import { soundManager } from '../utils/audio';

interface FeedbackOverlayProps {
  question: Question;
  studentName?: string; // or teamName
  teamName?: string;
  studentAnswer: 'LEFT' | 'RIGHT';
  isCorrect: boolean;
  pointsEarned: number;
  timeSpentSeconds?: number;
  questionNumberInTurn?: number;
  totalQuestionsInTurn?: number;
  nextTeamName?: string;
  nextStudentName?: string;
  isLastQuestionOfTurn?: boolean;
  isGameFinished?: boolean;
  onNextQuestion: () => void;
  autoAdvanceSec?: number;
}

export const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({
  question,
  studentName,
  teamName,
  studentAnswer,
  isCorrect,
  pointsEarned,
  timeSpentSeconds = 0,
  questionNumberInTurn = 1,
  totalQuestionsInTurn = 5,
  nextTeamName,
  nextStudentName,
  isLastQuestionOfTurn = false,
  isGameFinished = false,
  onNextQuestion,
  autoAdvanceSec = 5.0,
}) => {
  const [countdown, setCountdown] = useState<number>(Math.ceil(autoAdvanceSec));
  const onNextQuestionRef = useRef(onNextQuestion);
  onNextQuestionRef.current = onNextQuestion;

  const displayName = teamName || studentName || 'TIM';
  const displayNext = nextTeamName || nextStudentName;
  const hasAdvancedRef = useRef<boolean>(false);

  // Sound and confetti effect on mount
  useEffect(() => {
    if (isCorrect) {
      soundManager.playCorrect();
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#FBBF24', '#60A5FA'],
      });

      soundManager.speakText(
        `Jawaban ${displayName} Benar! Mendapat sepuluh poin! ${question.explanation}`
      );
    } else {
      soundManager.playWrong();
      soundManager.speakText(
        `Jawaban ${displayName} belum tepat. Jawaban yang benar adalah ${
          question.isTrue ? 'Benar' : 'Salah'
        }. ${question.explanation}`
      );
    }
  }, [isCorrect, displayName, question]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown <= 0 && !hasAdvancedRef.current) {
      hasAdvancedRef.current = true;
      onNextQuestionRef.current();
    }
  }, [countdown]);

  const handleNextClick = () => {
    if (!hasAdvancedRef.current) {
      hasAdvancedRef.current = true;
      onNextQuestionRef.current();
    }
  };

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in zoom-in-95 duration-200 select-none">
      <div
        className={`w-full max-w-xl p-5 sm:p-6 rounded-3xl shadow-2xl text-center space-y-4 border-4 bg-slate-900/95 ${
          isCorrect ? 'border-emerald-400' : 'border-rose-400'
        }`}
      >
        {/* Banner Hasil Jawaban */}
        <div className="flex flex-col items-center gap-2">
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-3xl flex items-center justify-center text-3xl shadow-xl ring-4 ${
              isCorrect
                ? 'bg-emerald-500 text-slate-950 ring-emerald-300'
                : 'bg-rose-500 text-white ring-rose-300'
            }`}
          >
            {isCorrect ? '🎉' : '❌'}
          </div>

          <div className="space-y-0.5">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {displayName} memilih: {studentAnswer === 'LEFT' ? '👈 KIRI (BENAR)' : 'KANAN (SALAH) 👉'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              {isCorrect ? 'HEBAT, JAWABAN BENAR!' : 'YAH, BELUM TEPAT!'}
            </h2>
          </div>
        </div>

        {/* Skor & Waktu Soal Ini */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm font-black">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-white">Poin Soal:</span>
            <span className={isCorrect ? 'text-emerald-400' : 'text-slate-400'}>
              {isCorrect ? `+${pointsEarned} Poin` : '+0 Poin'}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm font-mono font-bold text-sky-300">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Waktu: {timeSpentSeconds.toFixed(1)}s</span>
          </div>

          <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-amber-300 font-bold">
            Soal {questionNumberInTurn}/{totalQuestionsInTurn}
          </div>
        </div>

        {/* Penjelasan Edukatif Resmi */}
        <div className="bg-slate-950/80 p-3.5 sm:p-4 rounded-2xl border border-slate-800 text-left space-y-2">
          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded-lg bg-amber-400/20 text-amber-400 shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider block">
                Penjelasan Bu Guru Yennia:
              </span>
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                {question.explanation}
              </p>
            </div>
          </div>

          {question.funFact && (
            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-amber-200/90 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{question.funFact}</span>
            </div>
          )}
        </div>

        {/* Tombol Lanjut Soal / Giliran Berikutnya */}
        <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-400 font-medium">
            Lanjut otomatis dalam <strong className="text-amber-400">{countdown}s</strong>
          </span>

          <button
            type="button"
            onClick={handleNextClick}
            onTouchStart={(e) => {
              e.preventDefault();
              handleNextClick();
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl cursor-pointer transition transform active:scale-95 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 hover:from-amber-300 touch-manipulation"
          >
            {isGameFinished ? (
              <>
                <span>LIHAT HASIL JUARA 🏆</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : displayNext ? (
              <>
                <span>GILIRAN BERIKUTNYA: {displayNext}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>SOAL BERIKUTNYA</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

