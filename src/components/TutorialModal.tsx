import React from 'react';
import { X, User, MoveHorizontal, Trophy, Play, ShieldCheck } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame?: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose, onStartGame }) => {
  if (!isOpen) return null;

  return (
    <div
      onKeyDown={e => e.stopPropagation()}
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-white my-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏃</span>
            <h2 className="text-xl sm:text-2xl font-black text-amber-300">
              Panduan Main Estafet Kelas
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 text-sm text-left">
          {/* Step 1 */}
          <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0">
              1
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-400" /> Maju Satu per Satu (1 Pemain di Layar)
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Murid maju satu orang ke tengah area kamera saat namanya dipanggil pada layar.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0">
              2
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-400" /> Berdiri di Tengah Garis Netral
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Posisikan tubuh di tengah garis netral untuk memicu hitungan mundur 3... 2... 1... Sensor jawaban dikunci selama fase ini agar adil.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0">
              3
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <MoveHorizontal className="w-4 h-4 text-emerald-400" /> Lompat & Tahan 2 Detik
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Lompat ke <strong className="text-emerald-400">KIRI (BENAR)</strong> atau ke <strong className="text-rose-400">KANAN (SALAH)</strong>. Tahan posisi 2 detik hingga lingkaran progress penuh dan jawaban terkunci!
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0">
              4
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-yellow-400" /> Estafet Bergantian
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Setelah jatah 3 soal selesai, giliran otomatis beralih memanggil teman berikutnya hingga seluruh siswa selesai bertanding.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex gap-3">
          {onStartGame ? (
            <button
              onClick={() => {
                onClose();
                onStartGame();
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black rounded-2xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>Mulai Estafet Sekarang!</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition cursor-pointer"
            >
              Tutup Panduan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
