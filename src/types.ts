export type ShapeType = string;

/**
 * Item soal di dalam Bank Soal Global
 */
export interface SoalGlobalItem {
  id: string;
  mapelId: string;
  mapelJudul: string;
  mapelIkon: string;
  pertanyaan: string;
  gambar?: string;
  jawabanBenar: 'KIRI' | 'KANAN';
  penjelasan?: string;
  faktaMenarik?: string;
}

export interface MapelSummary {
  id: string;
  judul: string;
  ikon: string;
  deskripsi?: string;
  totalSoal: number;
}

export type TeamId = 'TIM_A' | 'TIM_B';

export interface TeamStats {
  id: TeamId;
  name: string; // 'TIM A' | 'TIM B'
  color: 'amber' | 'sky';
  score: number; // 0..100 (10 poin per soal benar)
  correctCount: number; // 0..10
  totalAnswered: number; // 0..10
  totalTimeSeconds: number; // Waktu kumulatif menjawab dalam detik
}

export interface StudentProfile {
  id: string;
  name: string;
  score: number;
  correctCount: number;
  totalAnswered: number;
}

// Alias untuk kompatibilitas
export type MuridPemain = StudentProfile;
export type ModeEstafet = 'perSoal' | 'perRonde';

export interface Question {
  id: string;
  itemName: string;
  shapeClaim?: string;
  shapeTrue?: string;
  isTrue: boolean; // true = KIRI (BENAR), false = KANAN (SALAH)
  jawabanBenarZona: 'KIRI' | 'KANAN';
  questionText: string;
  explanation: string;
  funFact: string;
  category: string;
  illustrationId: string;
  imageSrc?: string;
  rawItem?: SoalGlobalItem;
  targetPlayerName?: string;
}

export type Zone = 'LEFT' | 'CENTER' | 'RIGHT';

export type GameStatus =
  | 'welcome'
  | 'turn_transition'
  | 'calibrating'
  | 'playing'
  | 'round_feedback'
  | 'summary';

export interface RoundResult {
  question: Question;
  teamId: TeamId;
  teamName: string;
  studentAnswer: 'LEFT' | 'RIGHT';
  isCorrect: boolean;
  pointsEarned: number; // 10 atau 0
  timeSpentSeconds: number; // Waktu aktual yang dihabiskan untuk menjawab soal ini
  questionNumberForTeam: number; // 1..10
  overallQuestionNumber: number; // 1..20
}

export type TrackingEngine = 'mediapipe' | 'motion' | 'manual';

