import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  PlusCircle,
  Brain,
  ListFilter,
  Trash2,
  RotateCcw,
  CheckCircle2,
  BookOpen,
  Upload,
  Image as ImageIcon,
  Smile,
  Globe,
  Camera,
  Palette
} from 'lucide-react';
import { SoalGlobalItem } from '../types';
import {
  getBankSoalGlobal,
  addSoalToGlobal,
  deleteSoalFromGlobal,
  resetBankSoalGlobal,
  getPengaturanJumlahSoal,
  savePengaturanJumlahSoal
} from '../data/questions';

interface TeacherModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const TeacherModeModal: React.FC<TeacherModeModalProps> = ({
  isOpen,
  onClose,
  onDataChanged
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'ai' | 'list'>('manual');
  const [jumlahSoalMain, setJumlahSoalMain] = useState<number>(() => getPengaturanJumlahSoal());

  // Form State Bikin Soal Manual
  const [mapelPilihan, setMapelPilihan] = useState<string>('matematika');
  const [mapelCustomJudul, setMapelCustomJudul] = useState<string>('');
  const [mapelCustomIkon, setMapelCustomIkon] = useState<string>('📚');
  const [pertanyaan, setPertanyaan] = useState<string>('');
  
  // State Gambar: Pilihan Mode (Upload File vs Emoji vs URL)
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'emoji' | 'url'>('upload');
  const [gambar, setGambar] = useState<string>('➕');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [jawabanBenar, setJawabanBenar] = useState<'KIRI' | 'KANAN'>('KIRI');
  const [penjelasan, setPenjelasan] = useState<string>('');
  const [faktaMenarik, setFaktaMenarik] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State Generate Soal AI
  const [topikAI, setTopikAI] = useState<string>('Siklus Air dan Hujan untuk Kelas 4 SD');
  const [targetMapelAI, setTargetMapelAI] = useState<string>('ipa');
  const [jumlahSoalAI, setJumlahSoalAI] = useState<number>(3);
  // Opsi Gaya Gambar pada AI (1. Gambar Nyata / Foto, 2. Animasi / Kartun, 3. Cukup Emoji)
  const [gayaVisualAI, setGayaVisualAI] = useState<'real' | 'cartoon' | 'emoji'>('real');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiResultMsg, setAiResultMsg] = useState<string | null>(null);

  // Daftar Soal State
  const [filterMapelList, setFilterMapelList] = useState<string>('all');
  const [soalList, setSoalList] = useState<SoalGlobalItem[]>(() => getBankSoalGlobal());

  if (!isOpen) return null;

  const refreshList = () => {
    const data = getBankSoalGlobal();
    setSoalList(data);
    onDataChanged();
  };

  // Mapel preset choices
  const presetMapel = [
    { id: 'bangunDatar', judul: 'Bangun Datar (2D)', ikon: '🔷' },
    { id: 'bangunRuang', judul: 'Bangun Ruang (3D)', ikon: '📦' },
    { id: 'matematika', judul: 'Matematika Dasar', ikon: '🔢' },
    { id: 'ipa', judul: 'IPA / Sains Alam', ikon: '🔬' },
    { id: 'bahasa', judul: 'Bahasa Indonesia', ikon: '📚' },
    { id: 'custom', judul: '+ Buat Mapel Baru', ikon: '✨' }
  ];

  // Kompresi ringan gambar asli menjadi Base64 string (~30-50KB)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Skala gambar maksimal 320x320 agar sangat ringan dan ramah memori
        const canvas = document.createElement('canvas');
        const maxDim = 320;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Kompresi JPEG kualitas 0.8
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          setGambar(compressedBase64);
          setImagePreview(compressedBase64);
        }
        setIsCompressing(false);
      };

      img.onerror = () => {
        alert('Gagal memproses file gambar. Silakan coba file gambar lain.');
        setIsCompressing(false);
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  const handleResetImage = () => {
    setGambar('');
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // A. SIMPAN SOAL MANUAL KE LOCALSTORAGE
  const handleSimpanManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pertanyaan.trim()) return;

    let finalId = mapelPilihan;
    let finalJudul = '';
    let finalIkon = '📚';

    if (mapelPilihan === 'custom') {
      const cleanName = mapelCustomJudul.trim() || 'Materi Tambahan';
      finalId = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '');
      finalJudul = cleanName;
      finalIkon = mapelCustomIkon || '📚';
    } else {
      const match = presetMapel.find(p => p.id === mapelPilihan);
      finalJudul = match?.judul || mapelPilihan;
      finalIkon = match?.ikon || '📚';
    }

    addSoalToGlobal({
      mapelId: finalId,
      mapelJudul: finalJudul,
      mapelIkon: finalIkon,
      pertanyaan: pertanyaan.trim(),
      gambar: gambar.trim() || finalIkon,
      jawabanBenar: jawabanBenar,
      penjelasan:
        penjelasan.trim() ||
        (jawabanBenar === 'KIRI'
          ? 'Tepat sekali! Pernyataan tersebut BENAR.'
          : 'Salah! Pernyataan tersebut SALAH.'),
      faktaMenarik: faktaMenarik.trim() || 'Belajar dengan bergerak membuat ingatan semakin kuat!'
    });

    setSuccessMsg('✅ Soal berhasil disimpan ke bank soal!');
    setPertanyaan('');
    setPenjelasan('');
    setFaktaMenarik('');
    handleResetImage();
    refreshList();

    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // B. GENERATE SOAL AI (UI DENGAN PARAMETER GAYA VISUAL)
  const handleGenerateAI = async () => {
    if (!topikAI.trim()) return;
    setIsAiLoading(true);
    setAiResultMsg(null);

    // ========================================================================
    // // TODO: Integrasikan API AI di sini
    //
    // Parameter yang tersedia:
    // - topikAI: string (misal: "Siklus Air dan Hujan untuk Kelas 4 SD")
    // - targetMapelAI: string (misal: "ipa", "matematika", dll)
    // - jumlahSoalAI: number (misal: 3)
    // - gayaVisualAI: 'real' | 'cartoon' | 'emoji'
    //   -> 'real': Minta AI mencari/menghasilkan foto asli/nyata (URL gambar foto asli)
    //   -> 'cartoon': Minta AI menghasilkan grafis ilustrasi kartun anak
    //   -> 'emoji': Cukup gunakan karakter emoji representatif
    //
    // Contoh template prompt AI:
    // const prompt = `Buatkan ${jumlahSoalAI} soal Benar/Salah untuk siswa SD topik: ${topikAI}.
    // Target gaya visual gambar: ${gayaVisualAI === 'real' ? 'Gambar/Foto Nyata' : gayaVisualAI === 'cartoon' ? 'Ilustrasi Kartun' : 'Karakter Emoji'}.
    // Format keluaran harus berupa JSON array object: [{ pertanyaan, gambar, jawabanBenar: 'KIRI'|'KANAN', penjelasan, faktaMenarik }]`;
    //
    // const aiResponse = await fetch('/api/generate-soal', { method: 'POST', body: JSON.stringify({ prompt, gayaVisual: gayaVisualAI }) });
    // const newQuestions = await aiResponse.json();
    // ========================================================================

    // Simulasi generator AI cerdas yang menyesuaikan gaya visual:
    setTimeout(() => {
      const targetMatch = presetMapel.find(p => p.id === targetMapelAI);
      const mapelJudul = targetMatch?.judul || 'IPA / Sains Alam';
      const mapelIkon = targetMatch?.ikon || '🤖';

      // Gambar preview sesuai gaya visual yang dipilih guru:
      let ilustrasi1 = '💧';
      let ilustrasi2 = '🌧️';

      if (gayaVisualAI === 'real') {
        // Contoh foto nyata beresolusi optimal:
        ilustrasi1 = 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=320&auto=format&fit=crop&q=80'; // Foto tetesan air nyata
        ilustrasi2 = 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=320&auto=format&fit=crop&q=80'; // Foto hujan nyata
      } else if (gayaVisualAI === 'cartoon') {
        // Contoh kartun ilustrasi:
        ilustrasi1 = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=320&auto=format&fit=crop&q=80';
        ilustrasi2 = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=320&auto=format&fit=crop&q=80';
      }

      const generatedMock: SoalGlobalItem[] = [
        {
          id: `ai-${Date.now()}-1`,
          mapelId: targetMapelAI,
          mapelJudul: mapelJudul,
          mapelIkon: mapelIkon,
          pertanyaan: `Apakah ${topikAI.toLowerCase()} merupakan fenomena alam yang melibatkan penguapan air?`,
          gambar: ilustrasi1,
          jawabanBenar: 'KIRI',
          penjelasan: `Benar sekali! Air di bumi menguap karena panas matahari, lalu membentuk awan dan turun menjadi hujan.`,
          faktaMenarik: 'Siklus air di bumi terus berputar tanpa pernah habis sejak jutaan tahun lalu!'
        },
        {
          id: `ai-${Date.now()}-2`,
          mapelId: targetMapelAI,
          mapelJudul: mapelJudul,
          mapelIkon: mapelIkon,
          pertanyaan: `Apakah air hujan terasa asin seperti air laut di pantai?`,
          gambar: ilustrasi2,
          jawabanBenar: 'KANAN',
          penjelasan: 'Salah! Saat air laut menguap ke angkasa, garamnya tertinggal di laut sehingga air hujan berasa tawar.',
          faktaMenarik: 'Air hujan adalah salah satu sumber air tawar paling bersih di bumi.'
        }
      ];

      // Simpan soal hasil AI ke bank soal
      generatedMock.forEach(item => addSoalToGlobal(item));

      setIsAiLoading(false);
      setAiResultMsg(
        `🎉 Berhasil membuat 2 soal baru topik "${topikAI}" dengan gaya visual: ${
          gayaVisualAI === 'real'
            ? '📸 Gambar Nyata (Foto)'
            : gayaVisualAI === 'cartoon'
            ? '🎨 Animasi / Kartun'
            : '😃 Cukup Emoji'
        }!`
      );
      refreshList();
    }, 1500);
  };

  // Hapus satu soal
  const handleDeleteSoal = (id: string) => {
    if (window.confirm('Yakin ingin menghapus soal ini dari Bank Soal?')) {
      deleteSoalFromGlobal(id);
      refreshList();
    }
  };

  // Reset semua soal ke default
  const handleResetDefault = () => {
    if (window.confirm('Kembalikan semua soal ke pengaturan awal Bu Guru Yennia?')) {
      resetBankSoalGlobal();
      refreshList();
    }
  };

  const filteredList =
    filterMapelList === 'all'
      ? soalList
      : soalList.filter(item => item.mapelId === filterMapelList);

  return (
    <div
      onKeyDown={e => e.stopPropagation()}
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      <div className="w-full max-w-4xl bg-slate-900 border-2 border-amber-400 rounded-3xl shadow-2xl text-white my-auto overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header (Label 'localStorage Aktif' telah dihapus) */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/20 via-slate-900 to-indigo-950/50 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-400/20">
              👩‍🏫
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-amber-300">
                Mode Guru: Pembuat Soal & Bank Soal
              </h2>
              <p className="text-xs text-slate-400">
                Buat dan kelola soal interaktif untuk semua mata pelajaran anak SD
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-3 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2.5 rounded-t-xl font-black text-xs sm:text-sm flex items-center gap-2 transition ${
              activeTab === 'manual'
                ? 'bg-slate-900 text-amber-300 border-t-2 border-x-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>A. Bikin Soal Manual</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2.5 rounded-t-xl font-black text-xs sm:text-sm flex items-center gap-2 transition ${
              activeTab === 'ai'
                ? 'bg-slate-900 text-indigo-300 border-t-2 border-x-2 border-indigo-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-4 h-4 text-indigo-400" />
            <span>B. Generate Soal AI</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2.5 rounded-t-xl font-black text-xs sm:text-sm flex items-center gap-2 transition ml-auto ${
              activeTab === 'list'
                ? 'bg-slate-900 text-emerald-300 border-t-2 border-x-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>Daftar Soal ({soalList.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Pengaturan Jumlah Soal yang Dimainkan (Opsi 10 - 20) */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🎯</span>
              <div>
                <span className="text-xs font-black text-amber-300 block">
                  Pengaturan Jumlah Soal yang Dimainkan:
                </span>
                <span className="text-[11px] text-slate-400">
                  Game akan membatasi ronde permainan sesuai jumlah yang dipilih ini
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={jumlahSoalMain}
                onChange={e => {
                  const val = Number(e.target.value);
                  setJumlahSoalMain(val);
                  savePengaturanJumlahSoal(val);
                  onDataChanged();
                }}
                className="px-3 py-2 bg-slate-900 border-2 border-amber-400/60 rounded-xl text-xs font-black text-amber-300 focus:outline-none focus:border-amber-400 shadow cursor-pointer"
              >
                {[10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(num => (
                  <option key={num} value={num}>
                    {num} Soal per Ronde
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* TAB 1: FORMULIR INPUT SOAL MANUAL (DENGAN UNGGAH GAMBAR ASLI) */}
          {activeTab === 'manual' && (
            <form onSubmit={handleSimpanManual} className="space-y-4 max-w-2xl mx-auto">
              {successMsg && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/60 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* 1. Pilih Mapel */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  1. Pilih Mata Pelajaran
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {presetMapel.map(p => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setMapelPilihan(p.id)}
                      className={`p-2.5 rounded-xl text-xs font-extrabold text-left border flex items-center gap-2 transition ${
                        mapelPilihan === p.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/30'
                          : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      <span className="text-lg">{p.ikon}</span>
                      <span className="truncate">{p.judul}</span>
                    </button>
                  ))}
                </div>

                {/* Input nama mapel baru jika memilih custom */}
                {mapelPilihan === 'custom' && (
                  <div className="grid grid-cols-3 gap-2 pt-1 animate-in fade-in">
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Nama Mapel Baru (contoh: Bahasa Inggris, Seni)"
                        value={mapelCustomJudul}
                        onChange={e => setMapelCustomJudul(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Ikon Emoji (contoh: 🎨, 🇬🇧)"
                        value={mapelCustomIkon}
                        onChange={e => setMapelCustomIkon(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-center"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Teks Pertanyaan */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-amber-300 tracking-wider">
                  2. Teks Pertanyaan Benar / Salah
                </label>
                <textarea
                  rows={2}
                  placeholder='Contoh: "Apakah 7 + 8 = 15?" atau "Apakah Harimau memakan rumput?"'
                  value={pertanyaan}
                  onChange={e => setPertanyaan(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 leading-relaxed"
                  required
                />
              </div>

              {/* 3. FITUR UNGGAH GAMBAR ASLI / EMOJI (DIROMBAK TOTAL) */}
              <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    3. Ilustrasi / Unggah Gambar Asli
                  </label>

                  {/* Mode Selector Gambar */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                        imageInputMode === 'upload'
                          ? 'bg-amber-400 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('emoji')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                        imageInputMode === 'emoji'
                          ? 'bg-amber-400 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Smile className="w-3.5 h-3.5" />
                      <span>Emoji</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                        imageInputMode === 'url'
                          ? 'bg-amber-400 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>URL Web</span>
                    </button>
                  </div>
                </div>

                {/* Sub-fitur 3A: Unggah File Gambar Asli dari HP/Laptop */}
                {imageInputMode === 'upload' && (
                  <div className="space-y-3 pt-1 animate-in fade-in">
                    <div className="flex items-center gap-3">
                      <label className="flex-1 cursor-pointer flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-700 hover:border-amber-400 rounded-2xl bg-slate-900/60 hover:bg-slate-900 transition text-center group">
                        <Upload className="w-7 h-7 text-amber-400 group-hover:scale-110 transition mb-1.5" />
                        <span className="text-xs font-bold text-white">
                          Pilih Foto / Gambar dari Galeri atau Laptop
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5">
                          PNG, JPG, JPEG, WEBP (Otomatis dikompresi ringan & ramah penyimpanan)
                        </span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>

                      {/* Live Preview Box */}
                      {imagePreview && (
                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-400 bg-slate-900 shrink-0 group shadow-md">
                          <img
                            src={imagePreview}
                            alt="Preview Unggahan"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={handleResetImage}
                            className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-500 rounded-full text-white shadow transition"
                            title="Hapus Gambar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {isCompressing && (
                      <div className="flex items-center gap-2 text-xs text-amber-300 font-bold">
                        <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                        <span>Sedang mengompresi gambar untuk game...</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-fitur 3B: Masukkan Karakter Emoji */}
                {imageInputMode === 'emoji' && (
                  <div className="space-y-2 pt-1 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Ketik satu atau dua emoji (contoh: 🦁, 🍕, 📐, ⚽)"
                        value={gambar}
                        onChange={e => {
                          setGambar(e.target.value);
                          setImagePreview(null);
                        }}
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-center font-bold text-base"
                      />
                      {gambar && (
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shrink-0">
                          {gambar}
                        </div>
                      )}
                    </div>
                    {/* Preset Emoji Cepat */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-slate-400">Pilihan Cepat:</span>
                      {['➕', '➖', '✖️', '🍕', '📐', '📦', '🦁', '🐱', '🐘', '🍎', '🚗', '⭐'].map(em => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => {
                            setGambar(em);
                            setImagePreview(null);
                          }}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-fitur 3C: Masukkan Link URL Gambar */}
                {imageInputMode === 'url' && (
                  <div className="space-y-2 pt-1 animate-in fade-in">
                    <input
                      type="url"
                      placeholder="Masukkan alamat URL gambar (https://...)"
                      value={gambar}
                      onChange={e => {
                        setGambar(e.target.value);
                        setImagePreview(e.target.value);
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    {gambar.startsWith('http') && (
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <img
                          src={gambar}
                          alt="Preview URL"
                          className="w-10 h-10 object-contain rounded-lg border border-slate-700 bg-slate-900"
                          onError={() => setImagePreview(null)}
                        />
                        <span>Preview Gambar dari Tautan</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 4. Jawaban Benar (KIRI vs KANAN) */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-amber-300 tracking-wider">
                  4. Kunci Jawaban Benar
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setJawabanBenar('KIRI')}
                    className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 border transition ${
                      jawabanBenar === 'KIRI'
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg ring-2 ring-emerald-400/40'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>KIRI (BENAR ✔)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setJawabanBenar('KANAN')}
                    className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 border transition ${
                      jawabanBenar === 'KANAN'
                        ? 'bg-rose-600 border-rose-400 text-white shadow-lg ring-2 ring-rose-400/40'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <X className="w-4 h-4" />
                    <span>KANAN (SALAH ✖)</span>
                  </button>
                </div>
              </div>

              {/* 5. Penjelasan & Fakta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-300 tracking-wider">
                    5. Penjelasan Edukasi (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Penjelasan saat jawaban terkunci"
                    value={penjelasan}
                    onChange={e => setPenjelasan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-300 tracking-wider">
                    6. Fakta Menarik (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Tahukah kamu fakta seru?"
                    value={faktaMenarik}
                    onChange={e => setFaktaMenarik(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-400/20 flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <PlusCircle className="w-5 h-5 fill-slate-950" />
                  <span>Simpan Soal ke Bank Soal</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: GENERATE SOAL AI (DENGAN OPSI GAYA VISUAL BARU) */}
          {activeTab === 'ai' && (
            <div className="space-y-4 max-w-xl mx-auto py-2">
              <div className="bg-indigo-950/40 p-4 rounded-2xl border border-indigo-500/40 space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-black text-sm">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <span>Generator Soal Otomatis Berbasis AI</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ketik topik materi pelajaran yang diajarkan hari ini, pilih gaya visual gambar, dan AI akan meracik soal Benar/Salah interaktif lengkap dengan penjelasan edukatif.
                </p>
              </div>

              {aiResultMsg && (
                <div className="p-3 bg-indigo-950/70 border border-indigo-400 rounded-xl text-indigo-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{aiResultMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-indigo-300 tracking-wider">
                  Topik Materi Pelajaran
                </label>
                <input
                  type="text"
                  placeholder="Misal: Bagian-bagian bunga, Pecahan sederhana, Rukun Iman, Pahlawan Nasional"
                  value={topikAI}
                  onChange={e => setTopikAI(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-indigo-300 tracking-wider">
                    Target Mata Pelajaran
                  </label>
                  <select
                    value={targetMapelAI}
                    onChange={e => setTargetMapelAI(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
                  >
                    <option value="matematika">🔢 Matematika Dasar</option>
                    <option value="ipa">🔬 IPA / Sains Alam</option>
                    <option value="bangunDatar">🔷 Bangun Datar (2D)</option>
                    <option value="bangunRuang">📦 Bangun Ruang (3D)</option>
                    <option value="bahasa">📚 Bahasa Indonesia</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-indigo-300 tracking-wider">
                    Jumlah Soal
                  </label>
                  <select
                    value={jumlahSoalAI}
                    onChange={e => setJumlahSoalAI(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
                  >
                    <option value={2}>2 Soal Kilat</option>
                    <option value={3}>3 Soal Standar</option>
                    <option value={5}>5 Soal Lengkap</option>
                  </select>
                </div>
              </div>

              {/* FITUR BARU: OPSI PILIHAN GAYA VISUAL GAMBAR */}
              <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                <label className="text-xs font-black uppercase text-indigo-300 tracking-wider flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-indigo-400" />
                  Pilihan Gaya Visual Ilustrasi Soal
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setGayaVisualAI('real')}
                    className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition ${
                      gayaVisualAI === 'real'
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg ring-2 ring-indigo-400/40'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Camera className="w-4 h-4 text-amber-300" />
                    <span>1. Gambar Nyata</span>
                    <span className="text-[10px] text-slate-300/80 font-normal">(Foto Asli)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGayaVisualAI('cartoon')}
                    className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition ${
                      gayaVisualAI === 'cartoon'
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg ring-2 ring-indigo-400/40'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-pink-300" />
                    <span>2. Kartun / Animasi</span>
                    <span className="text-[10px] text-slate-300/80 font-normal">(Ilustrasi Lucu)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGayaVisualAI('emoji')}
                    className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition ${
                      gayaVisualAI === 'emoji'
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg ring-2 ring-indigo-400/40'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Smile className="w-4 h-4 text-yellow-300" />
                    <span>3. Cukup Emoji</span>
                    <span className="text-[10px] text-slate-300/80 font-normal">(Simbol Ringan)</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={isAiLoading || !topikAI.trim()}
                  className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 shadow-xl transition active:scale-95 ${
                    isAiLoading
                      ? 'bg-indigo-900/60 text-indigo-300 cursor-wait'
                      : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-400 hover:to-purple-400 text-white shadow-indigo-500/30'
                  }`}
                >
                  {isAiLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sedang Meracik Soal AI...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      <span>Buat Soal Otomatis Sekarang ✨</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-[11px] text-slate-400 font-mono space-y-1">
                <code>// TODO: Integrasikan API AI di sini</code>
                <div className="text-[10px] text-indigo-300">
                  Parameter aktif: topik="{topikAI}", mapel="{targetMapelAI}", gayaVisual="{gayaVisualAI}"
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DAFTAR SOAL TERPANTAU */}
          {activeTab === 'list' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold uppercase">Saring Mapel:</span>
                  <select
                    value={filterMapelList}
                    onChange={e => setFilterMapelList(e.target.value)}
                    className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="all">Semua Mapel ({soalList.length})</option>
                    <option value="bangunDatar">🔷 Bangun Datar</option>
                    <option value="bangunRuang">📦 Bangun Ruang</option>
                    <option value="matematika">🔢 Matematika</option>
                    <option value="ipa">🔬 IPA / Sains</option>
                    <option value="bahasa">📚 Bahasa Indonesia</option>
                  </select>
                </div>

                <button
                  onClick={handleResetDefault}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition self-start sm:self-auto"
                  title="Kembalikan semua soal bawaan"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset ke Soal Default</span>
                </button>
              </div>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {filteredList.map((soal, idx) => (
                  <div
                    key={soal.id || idx}
                    className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg shrink-0 mt-0.5 overflow-hidden border border-slate-700">
                        {soal.gambar && (soal.gambar.startsWith('data:') || soal.gambar.startsWith('http')) ? (
                          <img src={soal.gambar} alt="Soal" className="w-full h-full object-cover" />
                        ) : (
                          <span>{soal.gambar || soal.mapelIkon || '📚'}</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-amber-300 border border-slate-700">
                            {soal.mapelJudul}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              soal.jawabanBenar === 'KIRI'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                            }`}
                          >
                            Kunci: {soal.jawabanBenar === 'KIRI' ? 'KIRI (BENAR ✔)' : 'KANAN (SALAH ✖)'}
                          </span>
                        </div>
                        <p className="font-bold text-white text-sm leading-snug">
                          {soal.pertanyaan}
                        </p>
                        {soal.penjelasan && (
                          <p className="text-slate-400 text-[11px]">
                            {soal.penjelasan}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteSoal(soal.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition shrink-0"
                      title="Hapus Soal Ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer (Teks teknis localStorage telah dihapus) */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="text-slate-400 text-xs">Pusat Kelola & Pembuatan Soal Interaktif</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition"
          >
            Tutup Dashboard Guru
          </button>
        </div>
      </div>
    </div>
  );
};
