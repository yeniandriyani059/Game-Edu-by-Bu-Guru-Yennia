import React, { useState } from 'react';
import { X, Code2, BookOpen, Terminal, Check, Copy } from 'lucide-react';

interface DeveloperGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperGuideModal: React.FC<DeveloperGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const codeSnippets = [
    {
      title: '1. Instalasi Pustaka Kamera & Pelacak Tubuh',
      description: 'Langkah instalasi package MediaPipe Tasks Vision di project React / Vite:',
      code: `# Menggunakan npm
npm install @mediapipe/tasks-vision lucide-react canvas-confetti

# Atau jika menggunakan Yarn
yarn add @mediapipe/tasks-vision lucide-react canvas-confetti

# Pilihan Alternatif (ml5.js via CDN di index.html jika tanpa bundler):
# <script src="https://unpkg.com/ml5@latest/dist/ml5.min.js"></script>`,
    },
    {
      title: '2. Inisialisasi MediaPipe PoseLandmarker (TypeScript)',
      description: 'Memuat model pose landmarker ringan (Lite float16 ~5MB) untuk mendeteksi posisi kepala / bahu secara real-time:',
      code: `import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

// 1. Muat WASM binary
const vision = await FilesetResolver.forVisionTasks(
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
);

// 2. Buat PoseLandmarker
const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
  baseOptions: {
    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
    delegate: 'GPU',
  },
  runningMode: 'VIDEO',
  numPoses: 1,
});

// 3. Deteksi tiap frame video:
const result = poseLandmarker.detectForVideo(videoElement, performance.now());
if (result.landmarks?.[0]) {
  const nose = result.landmarks[0][0]; // Titik hidung
  // Karena video cermin (scaleX(-1)), koordinat layar cermin:
  const mirroredX = 1 - nose.x; 
}`,
    },
    {
      title: '3. Logika Dwell Timer 2 Detik (Lock Answer)',
      description: 'Mekanisme penguncian jawaban saat pemain bertahan di zona kiri atau kanan:',
      code: `// Zona Deteksi:
// Kiri: x < 0.38 (BENAR)
// Kanan: x > 0.62 (SALAH)
// Tengah: 0.38 <= x <= 0.62 (NETRAL)

if (mirroredX < 0.38) {
  // Masuk Zona KIRI (BENAR)
  if (!dwellStartTime) dwellStartTime = performance.now();
  const elapsedSeconds = (performance.now() - dwellStartTime) / 1000;
  
  if (elapsedSeconds >= 2.0) {
    lockAnswer('BENAR'); // Kunci jawaban setelah 2 detik
  }
} else if (mirroredX > 0.62) {
  // Masuk Zona KANAN (SALAH)
  // ...hitung 2 detik lalu kunci jawaban 'SALAH'
} else {
  // Kembali ke tengah -> Reset dwell timer
  dwellStartTime = null;
}`,
    },
    {
      title: '4. Struktur Bank Soal (Bangun Datar vs Bangun Ruang)',
      description: 'Data soal dipisahkan dengan jelas di file src/data/questions.ts:',
      code: `// File: src/data/questions.ts
export const bankSoal = {
  // 1. KATEGORI BANGUN DATAR (2D)
  bangunDatar: {
    id: "bangunDatar",
    judul: "Misi Bangun Datar",
    daftarSoal: [
      {
        pertanyaan: "Apakah uang koin berbentuk Lingkaran?",
        gambar: "coin", // URL / emoji / nama ilustrasi
        jawabanBenar: "KIRI", // "KIRI" = BENAR
        penjelasan: "Tepat sekali! Koin berbentuk lingkaran bulat."
      },
      {
        pertanyaan: "Apakah papan tulis berbentuk Segitiga?",
        gambar: "blackboard",
        jawabanBenar: "KANAN", // "KANAN" = SALAH
        penjelasan: "Salah! Papan tulis berbentuk Persegi Panjang."
      }
    ]
  },

  // 2. KATEGORI BANGUN RUANG (3D / BERVOLUME)
  bangunRuang: {
    id: "bangunRuang",
    judul: "Misi Bangun Ruang",
    daftarSoal: [
      {
        pertanyaan: "Apakah dadu berbentuk Kubus?",
        gambar: "dice",
        jawabanBenar: "KIRI", // "KIRI" = BENAR
        penjelasan: "Hebat! Dadu memiliki 6 sisi persegi datar."
      },
      {
        pertanyaan: "Apakah kaleng susu berbentuk Bola?",
        gambar: "can",
        jawabanBenar: "KANAN", // "KANAN" = SALAH
        penjelasan: "Salah! Kaleng susu berbentuk Tabung."
      }
    ]
  }
};`,
    },
    {
      title: '5. Struktur Arsitektur Kode Aplikasi',
      description: 'Struktur modular siap deploy di Vercel, Netlify, Cloud Run, atau GitHub Pages:',
      code: `src/
├── components/
│   ├── CameraView.tsx        # Video mirror, pembagian zona Kiri/Kanan, & pose tracker
│   ├── QuestionCard.tsx      # Tampilan soal benda, pembaca suara TTS, & ilustrasi
│   ├── ItemIllustration.tsx  # Vektor grafis interaktif benda nyata (2D & 3D)
│   ├── FeedbackOverlay.tsx   # Efek perayaan konfeti & penjelasan geometri
│   ├── SummaryModal.tsx      # Rapor bintang akhir & evaluasi pemahaman siswa
│   ├── TutorialModal.tsx     # Panduan visual posisi berdiri & aturan main
│   └── DeveloperGuideModal.tsx # Dokumentasi kode & langkah instalasi
├── data/
│   └── questions.ts          # Bank soal kurikulum bentuk matematika SD (bankSoal)
├── utils/
│   ├── poseTracker.ts        # Engine MediaPipe + Hybrid Optical Motion Fallback
│   └── audio.ts              # Web Audio Synthesizer & SpeechSynthesis ID
├── types.ts                  # TypeScript types & interface
├── App.tsx                   # Main state machine controller
└── main.tsx                  # React 19 bootstrap`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-slate-900 border-2 border-indigo-400 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6 my-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 border border-indigo-400/40 rounded-xl text-indigo-300">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-indigo-300">
                Panduan Developer & Struktur Kode
              </h2>
              <p className="text-xs text-slate-400">
                Langkah instalasi pustaka kamera dan arsitektur pelacakan tubuh
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-2">
          {codeSnippets.map((item, idx) => (
            <div key={idx} className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-3 sm:p-4 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-amber-300 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(item.code, idx)}
                  className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition shrink-0"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Kode</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 sm:p-4 font-mono text-xs text-emerald-300 bg-slate-950 overflow-x-auto leading-relaxed">
                <pre>{item.code}</pre>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition"
          >
            Tutup Panduan Developer
          </button>
        </div>
      </div>
    </div>
  );
};
