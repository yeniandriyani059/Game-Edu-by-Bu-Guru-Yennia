import React, { useState } from 'react';
import { X, Users, CheckCircle2, Plus, Trash2, Sliders } from 'lucide-react';
import { StudentProfile } from '../types';

interface StudentRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentProfile[];
  onSaveStudents: (students: StudentProfile[]) => void;
  questionsPerStudent: number;
  onSaveQuestionsPerStudent: (count: number) => void;
}

export const StudentRosterModal: React.FC<StudentRosterModalProps> = ({
  isOpen,
  onClose,
  students: initialStudents,
  onSaveStudents,
  questionsPerStudent: initialQCount,
  onSaveQuestionsPerStudent,
}) => {
  const [names, setNames] = useState<string[]>(() =>
    initialStudents.length > 0 ? initialStudents.map(s => s.name) : ['Andi', 'Siti', 'Budi', 'Rian', 'Dina']
  );
  const [qCount, setQCount] = useState<number>(initialQCount || 3);
  const [savedNotif, setSavedNotif] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleAddStudent = () => {
    setNames(prev => [...prev, `Murid ${prev.length + 1}`]);
  };

  const handleRemoveStudent = (index: number) => {
    if (names.length <= 1) return;
    setNames(prev => prev.filter((_, i) => i !== index));
  };

  const handleNameChange = (index: number, val: string) => {
    setNames(prev => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleSave = () => {
    const validNames = names.map(n => n.trim()).filter(n => n.length > 0);
    const finalNames = validNames.length > 0 ? validNames : ['Murid 1'];

    const newStudents: StudentProfile[] = finalNames.map((name, idx) => ({
      id: `student-${idx}-${Date.now()}`,
      name,
      score: 0,
      correctCount: 0,
      totalAnswered: 0,
    }));

    onSaveStudents(newStudents);
    onSaveQuestionsPerStudent(qCount);
    setSavedNotif(true);
    setTimeout(() => {
      setSavedNotif(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200">
      <div className="max-w-lg w-full bg-slate-900 border-4 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                Pengaturan Estafet Kelas
              </h3>
              <p className="text-[11px] text-slate-400">Atur urutan giliran murid dan jatah soal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pengaturan Jatah Soal Per Murid */}
        <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
          <label className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            <span>Jatah Soal Per Murid:</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[3, 4, 5].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => setQCount(num)}
                className={`py-2 rounded-xl text-xs font-black border transition cursor-pointer ${
                  qCount === num
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {num} Soal
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400">
            Setiap murid akan menjawab {qCount} soal secara berurutan sebelum berganti ke murid berikutnya.
          </p>
        </div>

        {/* Daftar Nama Murid Berurutan */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-300">
            <span>Daftar Giliran Murid ({names.length} Siswa):</span>
            <button
              type="button"
              onClick={handleAddStudent}
              className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-[11px] font-black flex items-center gap-1 cursor-pointer transition"
            >
              <Plus className="w-3 h-3" />
              <span>Tambah Murid</span>
            </button>
          </div>

          <div className="space-y-2">
            {names.map((name, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 bg-slate-950/80 rounded-2xl border border-slate-800"
              >
                <span className="w-7 h-7 rounded-xl bg-slate-800 text-amber-400 font-black text-xs flex items-center justify-center shrink-0">
                  #{idx + 1}
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={e => handleNameChange(idx, e.target.value)}
                  placeholder={`Nama Murid #${idx + 1}`}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                />
                {names.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveStudent(idx)}
                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                    title="Hapus Murid"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Tombol Simpan */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
          {savedNotif && (
            <span className="text-xs text-emerald-400 font-black flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Tersimpan!</span>
            </span>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg hover:from-amber-300 transition cursor-pointer"
            >
              Simpan & Terapkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
