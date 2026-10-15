import { SoalGlobalItem, Question, MapelSummary, MuridPemain, ModeEstafet } from '../types';

export const APP_TITLE = 'Game Edu by Bu Guru Yennia';
export const APP_SUBTITLE = 'Game Edukasi Sensor Gerak Kamera by Bu Guru Yennia';
export const STORAGE_KEY_BANK_SOAL = 'bankSoalBangunDatar_v3';

// ============================================================================
// 📚 30 SOAL DEFAULT RESMI BANGUN DATAR (HARDCODED)
// Aturan: KIRI = BENAR, KANAN = SALAH
// ============================================================================
export const DEFAULT_BANK_SOAL_GLOBAL: SoalGlobalItem[] = [
  {
    id: 'bd-1',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah roda sepeda berbentuk lingkaran?',
    gambar: '🚲',
    jawabanBenar: 'KIRI',
    penjelasan: 'Benar! Roda sepeda berbentuk lingkaran agar bisa menggelinding lancar di jalan.',
    faktaMenarik: 'Lingkaran memiliki garis lengkung penuh tanpa sudut sama sekali.'
  },
  {
    id: 'bd-2',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah buku tulis berbentuk segitiga?',
    gambar: '📖',
    jawabanBenar: 'KANAN',
    penjelasan: 'Salah! Buku tulis berbentuk persegi panjang, bukan segitiga.',
    faktaMenarik: 'Buku tulis memiliki empat sudut siku-siku sembilan puluh derajat.'
  },
  {
    id: 'bd-3',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah uang koin berbentuk persegi?',
    gambar: '🪙',
    jawabanBenar: 'KANAN',
    penjelasan: 'Salah! Uang koin logam berbentuk lingkaran bulat tanpa sudut, bukan persegi.',
    faktaMenarik: 'Permukaan lingkaran hanya memiliki satu sisi lengkung.'
  },
  {
    id: 'bd-4',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah permukaan meja berbentuk persegi panjang?',
    gambar: '🪑',
    jawabanBenar: 'KIRI',
    penjelasan: 'Benar! Permukaan meja memiliki dua pasang sisi sejajar berbentuk persegi panjang.',
    faktaMenarik: 'Persegi panjang memiliki dua pasang sisi yang berhadapan sama panjang.'
  },
  {
    id: 'bd-5',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah potongan pizza berbentuk segitiga?',
    gambar: '🍕',
    jawabanBenar: 'KIRI',
    penjelasan: 'Benar! Seiris potongan pizza memiliki tiga sisi meruncing membentuk segitiga.',
    faktaMenarik: 'Segitiga memiliki tepat tiga sisi dan tiga titik sudut.'
  },
  {
    id: 'bd-6',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah jam dinding bundar berbentuk lingkaran?',
    gambar: '⏰',
    jawabanBenar: 'KIRI',
    penjelasan: 'Benar! Jam dinding bundar berbentuk lingkaran penuh tanpa memiliki sudut.',
    faktaMenarik: 'Jarum jam berputar melingkar mengikuti sudut 360 derajat.'
  },
  {
    id: 'bd-7',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah papan tulis berbentuk lingkaran?',
    gambar: '📋',
    jawabanBenar: 'KANAN',
    penjelasan: 'Salah! Papan tulis di ruang kelas berbentuk persegi panjang, bukan lingkaran.',
    faktaMenarik: 'Papan tulis membentang lebar untuk memudahkan guru menulis.'
  },
  {
    id: 'bd-8',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah ubin lantai kelas berbentuk persegi?',
    gambar: '🧱',
    jawabanBenar: 'KIRI',
    penjelasan: 'Benar! Ubin lantai kelas memiliki empat sisi yang sama panjang membentuk bangun persegi.',
    faktaMenarik: 'Semua sudut pada bangun persegi bernilai sembilan puluh derajat.'
  },
  {
    id: 'bd-9',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah kue donat berbentuk segitiga?',
    gambar: '🍩',
    jawabanBenar: 'KANAN',
    penjelasan: 'Salah! Kue donat memiliki bentuk lingkaran bundar dengan lubang di tengahnya.',
    faktaMenarik: 'Bentuk donat bundar dengan lubang disebut juga torus dalam matematika.'
  },
  {
    id: 'bd-10',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah layar TV berbentuk persegi panjang?',
    gambar: '📺',
    jawabanBenar: 'KIRI',
    penjelasan: 'Benar! Layar televisi membentang horizontal membentuk bangun persegi panjang.',
    faktaMenarik: 'Perbandingan layar TV masa kini biasanya adalah enam belas banding sembilan.'
  },
  {
    id: 'bd-11',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah penggaris segitiga berbentuk persegi panjang?',
    gambar: '📐',
    jawabanBenar: 'KANAN',
    penjelasan: 'Salah! Penggaris segitiga memiliki tiga sudut dan tiga sisi, bukan persegi panjang.',
    faktaMenarik: 'Penggaris segitiga sering digunakan untuk membuat garis siku-siku rapi.'
  },
  {
    id: 'bd-12',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah bendera upacara berbentuk persegi panjang?',
    gambar: '🇮🇩',
    jawabanBenar: 'KIRI',
    penjelasan: 'Benar! Bendera upacara Merah Putih berkibar dengan bentuk resmi persegi panjang.',
    faktaMenarik: 'Ukuran bendera nasional memiliki rasio panjang dan lebar dua banding tiga.'
  },
  {
    id: 'bd-13',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah piring makan berbentuk lingkaran?',
    gambar: '🍽️',
    jawabanBenar: 'KIRI',
    penjelasan: 'Benar! Piring makan sehari-hari didesain bulat melingkar tanpa sudut.',
    faktaMenarik: 'Bentuk piring lingkaran memudahkan makanan diletakkan di tengah rata.'
  },
  {
    id: 'bd-14',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah kertas HVS berbentuk persegi?',
    gambar: '📄',
    jawabanBenar: 'KANAN',
    penjelasan: 'Salah! Selembar kertas HVS memiliki panjang dan lebar yang berbeda yaitu persegi panjang.',
    faktaMenarik: 'Ukuran standar kertas HVS seperti A4 memiliki sisi panjang 29,7 cm dan lebar 21 cm.'
  },
  {
    id: 'bd-15',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah pintu kelas berbentuk persegi panjang?',
    gambar: '🚪',
    jawabanBenar: 'KIRI',
    penjelasan: 'Benar! Daun pintu ruang kelas berdiri tegak lurus membentuk persegi panjang.',
    faktaMenarik: 'Bentuk persegi panjang vertikal pas dengan postur tubuh manusia saat lewat.'
  },
  {
    id: 'bd-16',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah rambu lalu lintas peringatan berbentuk segitiga?',
    gambar: '⚠️',
    jawabanBenar: 'KIRI',
    penjelasan: 'Benar! Rambu peringatan di jalan raya dibuat berbentuk segitiga kuning mencolok.',
    faktaMenarik: 'Bentuk segitiga kuning mudah menarik perhatian pengendara dari kejauhan.'
  },
  {
    id: 'bd-17',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah cincin berbentuk persegi?',
    gambar: '💍',
    jawabanBenar: 'KANAN',
    penjelasan: 'Salah! Cincin jari tangan berbentuk lingkaran bulat agar pas melingkari jari.',
    faktaMenarik: 'Lingkaran cincin melambangkan keabadian karena tidak berujung.'
  },
  {
    id: 'bd-18',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah jendela kelas berbentuk lingkaran?',
    gambar: '🪟',
    jawabanBenar: 'KANAN',
    penjelasan: 'Salah! Jendela kelas umumnya berbingkai persegi atau persegi panjang, bukan lingkaran.',
    faktaMenarik: 'Bingkai jendela bersudut siku-siku memudahkan kaca dipasang kokoh di dinding.'
  },
  {
    id: 'bd-19',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah kancing baju berbentuk lingkaran?',
    gambar: '🔘',
    jawabanBenar: 'KIRI',
    penjelasan: 'Benar! Kebanyakan kancing baju berbentuk lingkaran pipih agar mudah dikancingkan.',
    faktaMenarik: 'Kancing baju lingkaran biasanya memiliki 2 atau 4 lubang benang.'
  },
  {
    id: 'bd-20',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah atap rumah berbentuk lingkaran?',
    gambar: '🏠',
    jawabanBenar: 'KANAN',
    penjelasan: 'Salah! Tampak depan atap rumah biasanya berbentuk segitiga untuk mengalirkan air hujan.',
    faktaMenarik: 'Kemiringan segitiga pada atap membuat air hujan segera meluncur turun.'
  },
  {
    id: 'bd-21',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah papan catur berbentuk persegi?',
    gambar: '♟️',
    jawabanBenar: 'KIRI',
    penjelasan: 'Benar! Papan permainan catur memiliki sisi-sisi yang sama panjang membentuk persegi.',
    faktaMenarik: 'Papan catur terdiri dari 64 kotak persegi kecil berwarna hitam dan putih.'
  },
  {
    id: 'bd-22',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah tutup botol air minum berbentuk lingkaran?',
    gambar: '🧴',
    jawabanBenar: 'KIRI',
    penjelasan: 'Benar! Tutup botol air minum berbentuk lingkaran bundar agar dapat diputar rapat.',
    faktaMenarik: 'Bentuk ulir melingkar menahan cairan di dalam botol agar tidak bocor.'
  },
  {
    id: 'bd-23',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah kartu ATM berbentuk segitiga?',
    gambar: '💳',
    jawabanBenar: 'KANAN',
    penjelasan: 'Salah! Kartu ATM atau kartu pintar berbentuk persegi panjang dengan sudut melengkung.',
    faktaMenarik: 'Ukuran standar kartu plastik di seluruh dunia dirancang sesuai rasio persegi panjang.'
  },
  {
    id: 'bd-24',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah kotak pensil berbentuk persegi panjang?',
    gambar: '✏️',
    jawabanBenar: 'KIRI',
    penjelasan: 'Benar! Kotak pensil memanjang dengan bentuk persegi panjang agar muat menyimpan pulpen.',
    faktaMenarik: 'Bentuk memanjang ini sangat ideal ditaruh di dalam tas sekolah.'
  },
  {
    id: 'bd-25',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah permukaan CD/kaset berbentuk lingkaran?',
    gambar: '💿',
    jawabanBenar: 'KIRI',
    penjelasan: 'Benar! Kepingan CD atau kaset cakram berbentuk lingkaran pipih yang berputar.',
    faktaMenarik: 'CD dibaca menggunakan sinar laser dari bagian dalam ke luar lingkaran.'
  },
  {
    id: 'bd-26',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah bingkai foto berbentuk persegi?',
    gambar: '🖼️',
    jawabanBenar: 'KIRI',
    penjelasan: 'Benar! Bingkai foto bujur sangkar memiliki empat sisi sama panjang membentuk persegi.',
    faktaMenarik: 'Persegi sering disebut juga bujur sangkar dalam istilah matematika dasar.'
  },
  {
    id: 'bd-27',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah permukaan kasur berbentuk lingkaran?',
    gambar: '🛏️',
    jawabanBenar: 'KANAN',
    penjelasan: 'Salah! Permukaan kasur tempat tidur umumnya berbentuk persegi panjang, bukan lingkaran.',
    faktaMenarik: 'Kasur persegi panjang menyesuaikan panjang dan lebar rentang tubuh manusia.'
  },
  {
    id: 'bd-28',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah bola berbentuk persegi?',
    gambar: '⚽',
    jawabanBenar: 'KANAN',
    penjelasan: 'Salah! Bola berbentuk bulat melengkung tanpa sudut sama sekali, bukan persegi.',
    faktaMenarik: 'Bentuk bulat membuat bola bisa memantul dan menggelinding ke segala arah.'
  },
  {
    id: 'bd-29',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah layar HP berbentuk persegi panjang?',
    gambar: '📱',
    jawabanBenar: 'KIRI',
    penjelasan: 'Benar! Layar smartphone memanjang ke bawah membentuk bangun datar persegi panjang.',
    faktaMenarik: 'Ukuran layar smartphone yang memanjang memudahkan digenggam dengan satu tangan.'
  },
  {
    id: 'bd-30',
    mapelId: 'bangunDatar',
    mapelJudul: 'Bangun Datar',
    mapelIkon: '🔷',
    pertanyaan: 'Apakah ujung panah berbentuk segitiga?',
    gambar: '🏹',
    jawabanBenar: 'KIRI',
    penjelasan: 'Benar! Ujung mata anak panah meruncing lancip membentuk bangun segitiga.',
    faktaMenarik: 'Bentuk segitiga aerodinamis mengurangi hambatan angin saat melesat cepat.'
  }
];

// ============================================================================
// HELPER STORAGE & RANDOMIZER BANK SOAL
// ============================================================================

/**
 * Mengambil semua bank soal global dari localStorage.
 * Otomatis menggunakan 30 SOAL RESMI BANGUN DATAR sebagai sumber utama.
 */
export function getBankSoalGlobal(): SoalGlobalItem[] {
  if (typeof window === 'undefined') return DEFAULT_BANK_SOAL_GLOBAL;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BANK_SOAL);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_BANK_SOAL, JSON.stringify(DEFAULT_BANK_SOAL_GLOBAL));
      return DEFAULT_BANK_SOAL_GLOBAL;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_BANK_SOAL_GLOBAL;
  } catch (err) {
    console.error('Error reading bankSoal from localStorage:', err);
    return DEFAULT_BANK_SOAL_GLOBAL;
  }
}

/**
 * Menyimpan seluruh array bank soal ke localStorage
 */
export function saveBankSoalGlobal(items: SoalGlobalItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_BANK_SOAL, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving bankSoal to localStorage:', err);
  }
}

/**
 * Menambah satu soal baru ke dalam bankSoal di localStorage
 */
export function addSoalToGlobal(soalBaru: Omit<SoalGlobalItem, 'id'>): SoalGlobalItem {
  const current = getBankSoalGlobal();
  const newItem: SoalGlobalItem = {
    ...soalBaru,
    id: `soal-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
  };
  const updated = [newItem, ...current];
  saveBankSoalGlobal(updated);
  return newItem;
}

/**
 * Menghapus soal berdasarkan ID dari localStorage
 */
export function deleteSoalFromGlobal(id: string): void {
  const current = getBankSoalGlobal();
  const updated = current.filter(item => item.id !== id);
  saveBankSoalGlobal(updated);
}

/**
 * Reset bank soal kembali ke 30 Soal Bawaan Bangun Datar
 */
export function resetBankSoalGlobal(): SoalGlobalItem[] {
  saveBankSoalGlobal(DEFAULT_BANK_SOAL_GLOBAL);
  return DEFAULT_BANK_SOAL_GLOBAL;
}

/**
 * Mengambil ringkasan mata pelajaran (khusus Bangun Datar)
 */
export function getDaftarMapelDinams(soalList?: SoalGlobalItem[]): MapelSummary[] {
  const list = soalList || getBankSoalGlobal();
  const total = list.length;
  return [
    {
      id: 'bangunDatar',
      judul: 'Tantangan Bangun Datar',
      ikon: '🔷',
      deskripsi: '30 Soal Tantangan Bangun Datar Acak (Lingkaran, Persegi, Segitiga, Persegi Panjang)',
      totalSoal: total
    }
  ];
}

/**
 * WAJIB RANDOMIZER (Fisher-Yates Shuffle):
 * Setiap kali dipanggil, soal SELALU DIACAK secara matematis
 * sehingga anak-anak tidak dapat menghafal urutan nomor soal.
 */
export function getQuestionsForMapel(mapelId: string = 'bangunDatar', limit: number = 30): Question[] {
  const pool = getBankSoalGlobal();

  // Acak urutan soal (Fisher-Yates shuffle murni)
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Ambil hingga limit (default 30 pertanyaan lengkap)
  const safeLimit = Math.min(Math.max(limit, 5), shuffled.length);
  const selected = shuffled.slice(0, safeLimit);
  return selected.map(item => normalizeGlobalSoal(item));
}

/**
 * Mengambil tepat 10 soal unik tanpa pengulangan untuk Estafet 2 Tim (5 Soal Tim A, 5 Soal Tim B).
 */
export function prepare10UniqueQuestions(): Question[] {
  return getQuestionsForMapel('bangunDatar', 10);
}

/**
 * Mengambil soal unik tanpa pengulangan untuk Estafet 2 Tim
 */
export function prepare20UniqueQuestions(): Question[] {
  return getQuestionsForMapel('bangunDatar', 10);
}

/**
 * Konversi SoalGlobalItem ke Question untuk game loop
 */
export function normalizeGlobalSoal(item: SoalGlobalItem): Question {
  const isLeft = item.jawabanBenar === 'KIRI';
  return {
    id: item.id,
    itemName: 'Bangun Datar',
    questionText: item.pertanyaan,
    isTrue: isLeft, // true = ZONA KIRI (BENAR), false = ZONA KANAN (SALAH)
    jawabanBenarZona: isLeft ? 'KIRI' : 'KANAN',
    explanation:
      item.penjelasan ||
      (isLeft ? 'Jawaban yang tepat adalah BENAR (Zona Kiri)!' : 'Jawaban yang tepat adalah SALAH (Zona Kanan)!'),
    funFact: item.faktaMenarik || 'Tetap semangat belajar bangun datar bersama Bu Guru Yennia!',
    category: 'Bangun Datar',
    illustrationId: item.gambar || 'wheel',
    imageSrc: item.gambar,
    rawItem: item
  };
}

// ============================================================================
// PENGATURAN JUMLAH SOAL & MODE KELAS
// ============================================================================

export const STORAGE_KEY_SOAL_COUNT = 'gameSettings_soalCount';
export const STORAGE_KEY_MURID_LIST = 'gameSettings_muridPemain';
export const STORAGE_KEY_ESTAFET_MODE = 'gameSettings_modeEstafet';

/**
 * Mengambil jumlah soal yang dimainkan per ronde (default 30 soal lengkap)
 */
export function getPengaturanJumlahSoal(): number {
  if (typeof window === 'undefined') return 30;
  try {
    const val = localStorage.getItem(STORAGE_KEY_SOAL_COUNT);
    const parsed = val ? parseInt(val, 10) : 30;
    return isNaN(parsed) || parsed < 5 ? 30 : Math.min(Math.max(parsed, 5), 30);
  } catch {
    return 30;
  }
}

export function savePengaturanJumlahSoal(count: number): void {
  if (typeof window === 'undefined') return;
  try {
    const safeCount = Math.min(Math.max(count, 5), 30);
    localStorage.setItem(STORAGE_KEY_SOAL_COUNT, String(safeCount));
  } catch (err) {
    console.error('Error saving soal count:', err);
  }
}

export function getDaftarMurid(): MuridPemain[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MURID_LIST);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDaftarMurid(list: MuridPemain[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_MURID_LIST, JSON.stringify(list));
  } catch (err) {
    console.error('Error saving murid list:', err);
  }
}

export function getModeEstafet(): ModeEstafet {
  if (typeof window === 'undefined') return 'perSoal';
  try {
    return (localStorage.getItem(STORAGE_KEY_ESTAFET_MODE) as ModeEstafet) || 'perSoal';
  } catch {
    return 'perSoal';
  }
}

export function saveModeEstafet(mode: ModeEstafet): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ESTAFET_MODE, mode);
  } catch (err) {
    console.error('Error saving estafet mode:', err);
  }
}
