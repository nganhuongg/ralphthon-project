// lib/tuvi/types.ts
// THE type contract for Verse. All phases import from here.
// Do not import from any other project file — no circular deps.

// ── Input types ──────────────────────────────────────────────────────────────

export interface SolarDate {
  year: number;   // 1967–2025
  month: number;  // 1–12
  day: number;    // 1–31
}

export interface BirthInput {
  solarDate: SolarDate;
  hour: number | null;          // 0–23 local time; null → default Giờ Ngọ (index 6)
  gender: 'M' | 'F';
  birthplace: string;           // Used for timezone offset derivation only (D-12)
  timezoneOffset: number;       // UTC+N, derived from birthplace. Vietnam = +7
  decision: string;             // The life question (free text, 10–500 chars)
}

// ── Lunar calendar types ──────────────────────────────────────────────────────

export interface LunarDate {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;         // Tháng Nhuận — affects palace assignment
  yearCanChi: string;           // e.g. "Giáp Tý"
  monthCanChi: string;          // e.g. "Kỷ Mão"
  dayCanChi: string;            // e.g. "Mậu Tuất"
  hourCanChi: string;           // e.g. "Giáp Tý" — derived from day stem + giờ index
  gioIndex: number;             // 0–11 (12 giờ blocks); 6 = Giờ Ngọ (default)
  gioName: string;              // e.g. "Ngọ"
}

// ── Chart structure types ─────────────────────────────────────────────────────

export type StarName =
  | 'Tử Vi'
  | 'Thiên Phủ'
  | 'Thái Dương'
  | 'Thái Âm'
  | 'Tham Lang'
  | 'Cự Môn'
  | 'Thiên Tướng'
  | 'Thiên Đồng'
  | 'Liêm Trinh'
  | 'Vũ Khúc'
  | 'Thiên Cơ'
  | 'Thiên Lương'
  | 'Thất Sát'
  | 'Phá Quân';

export interface Star {
  name: StarName;
  weight: number;               // Calculated star weight for this palace; used in profile extraction
  brightness: 'vuong' | 'mieu' | 'dac' | 'binh' | 'ham' | null;  // Star strength in palace
}

export type PalaceName =
  | 'Mệnh'          // Life/Destiny (index 0)
  | 'Phụ Mẫu'       // Parents
  | 'Phúc Đức'      // Fortune
  | 'Điền Trạch'    // Property
  | 'Quan Lộc'      // Career
  | 'Nô Bộc'        // Servants/Subordinates
  | 'Thiên Di'      // Travel/Movement
  | 'Tật Ách'       // Health
  | 'Tài Bạch'      // Wealth
  | 'Tử Tức'        // Children
  | 'Phu Thê'       // Spouse
  | 'Huynh Đệ';     // Siblings

export interface Palace {
  index: number;                // 0–11; 0 = Mệnh palace
  name: PalaceName;
  earthlyBranch: string;        // One of 12 earthly branches
  heavenlyStem: string;         // One of 10 heavenly stems
  stars: Star[];
  isMenh: boolean;              // True if this is the life palace (Mệnh)
  isDominant: boolean;          // True if this is the dominant palace per profile extraction
}

// ── Full chart output ─────────────────────────────────────────────────────────

export interface TuViChart {
  input: BirthInput;
  lunarDate: LunarDate;
  palaces: Palace[];            // Always 12 palaces, indices 0–11
  profile: PsychProfile;
}

// ── Psychological profile ─────────────────────────────────────────────────────

export interface PsychProfile {
  dominantPalaceIndex: number;  // 0–11; palace with highest weighted star cluster
  dominantPalaceName: PalaceName;
  riskStarName: StarName | null; // Primary challenging star (Thất Sát, Phá Quân, Tham Lang, Liêm Trinh)
  riskStarPalace: PalaceName | null;
  relationalPattern: string;    // Synthesized prose — NOT raw star names (per research anti-patterns)
  ambitionStructure: string;    // Synthesized prose — NOT raw star names
  dominantTheme: string;        // 1–2 sentence summary for Claude's system prompt
}

// ── Zustand store types (Phase 2–3 shape defined here per D-10) ───────────────

export type PathId = 'duty' | 'desire' | 'transformation';

export interface PathNode {
  id: string;                   // nanoid
  depth: number;                // 1–5
  content: string;              // Streamed prediction text
  isStreaming: boolean;
}

export interface PathState {
  id: PathId;
  nodes: PathNode[];
  isAbandoned: boolean;
  abandonedAt: number | null;   // timestamp
}

export interface GriefEntry {
  id: string;                   // nanoid
  pathId: PathId;
  abandonedAt: number;          // Unix timestamp
  abandonedAtDepth: number;     // Node depth when abandoned
  answers: {
    lettingGo: string;          // Q1: what are you letting go of
    cost: string;               // Q2: what does that cost you
    nowKnow: string;            // Q3: what do you now know
  };
  pathSummary: string;          // First node content (for archive display)
}
