// lib/tuvi/profile-extractor.ts
// Deterministic profile extraction from chart palaces
// Output is synthesized prose — NEVER raw star names (per RESEARCH.md anti-patterns)

import { RISK_STARS } from './constants';
import type { Palace, PsychProfile, StarName, PalaceName } from './types';

// Relational pattern lookup: keyed by Mệnh palace's primary star
const RELATIONAL_PATTERNS: Readonly<Partial<Record<StarName, string>>> = {
  'Tử Vi': 'Naturally assumes leadership in relationships — draws loyalty but may struggle to share control. Deep need to be seen as capable and decisive.',
  'Thiên Phủ': 'Brings stability and resource to relationships. Protective instincts run deep; vulnerability is expressed through acts of provision rather than words.',
  'Thái Dương': 'Expressive and outward-facing in love — gives freely, craves recognition in return. Energized by large circles but lonely in crowds without a true witness.',
  'Thái Âm': 'Emotionally attuned and internally rich. Relationships deepen slowly; once trust is established, loyalty is absolute and almost absorbing.',
  'Tham Lang': 'Seeks intensity — drawn to complex, transformative connections that test the self. Can confuse desire with love; growth comes through learning to want without possessing.',
  'Cự Môn': 'Communication is both gift and wound — words cut deep, in both directions. Often misunderstood; profound clarity possible once the tendency toward verbal armor is noticed.',
  'Thiên Tướng': 'Plays the role of fair witness in relationships — mediates, protects, holds space. May suppress own needs in service of others\' equilibrium.',
  'Thiên Đồng': 'Easy warmth and flexibility; adapts to partners\' needs with genuine care. Risk of losing self in the shape of another\'s expectations over time.',
  'Liêm Trinh': 'Holds strict internal codes about loyalty and honor in relationships. Uncompromising when lines are crossed; the wound from betrayal runs unusually deep.',
  'Vũ Khúc': 'Practical love language — shows up through action, problem-solving, material security. May struggle to meet partners in emotional register without explicit practice.',
  'Thiên Cơ': 'Intellectually engaged in relationships — needs a partner who can keep up with a restless mind. Reads people with unusual accuracy; vulnerability requires safety first.',
  'Thiên Lương': 'The natural caretaker — gives counsel, protection, and wisdom. Risk of positioning self as the responsible one while quietly yearning to be cared for in return.',
  'Thất Sát': 'Independent to the point of solitude — intimacy challenges the core drive for self-determination. Capable of deep loyalty once sovereignty within the relationship is secured.',
  'Phá Quân': 'Breaks patterns — including relational ones. Drawn to transformation in connections; may unconsciously destabilize what they most desire to hold.',
};

// Ambition structure lookup: keyed by Quan Lộc palace (index 4) primary star
const AMBITION_STRUCTURES: Readonly<Partial<Record<StarName, string>>> = {
  'Tử Vi': 'Driven toward authority and institutional recognition. Career path bends toward leadership roles, often against the grain of initial expectations.',
  'Thiên Phủ': 'Builds slowly and securely — accumulates resources, influence, and competence over a long arc. Suspicious of shortcuts; trusted with long-term stewardship.',
  'Thái Dương': 'Ambition is social and visible — career success requires a public stage. Thrives in roles with broad impact and recognized contribution.',
  'Thái Âm': 'Works best in depth rather than breadth. Career fulfillment comes from mastery and emotional resonance with the work, not from title or external recognition alone.',
  'Tham Lang': 'Multi-talented, restless, and drawn to fields that reward reinvention. Risk of scattered energy; needs a single anchoring purpose to consolidate gifts.',
  'Cự Môn': 'The investigator or communicator — career that involves uncovering, articulating, or transmitting complex truths. Forensic intelligence applied to craft or inquiry.',
  'Thiên Tướng': 'Thrives in roles with clear authority structures — can work within systems or stand above them, but needs legitimacy clearly defined.',
  'Thiên Đồng': 'Career fulfillment comes from harmony and contribution rather than conquest. Sustained effort is possible when the work serves something larger than personal gain.',
  'Liêm Trinh': 'High internal standards drive career choices — would rather do important work correctly than successful work carelessly. Integrity is non-negotiable in professional identity.',
  'Vũ Khúc': 'Financial intelligence and material strategy are native strengths. Career path through accumulation, management, or fields that reward disciplined resource stewardship.',
  'Thiên Cơ': 'The strategist — sees the long game, adapts tactics, and excels in roles requiring pattern recognition across complex systems.',
  'Thiên Lương': 'Called toward service, education, or healing — work that carries inherent moral weight. Motivated by impact on individuals, not scale alone.',
  'Thất Sát': 'Competitive and driven toward mastery through conquest. Career marked by bold moves, high-risk bets, and the willingness to fight for what is claimed.',
  'Phá Quân': 'Revolutionary impulse in career — drawn to disruption, innovation, and the dismantling of outdated structures. Needs creative freedom; chafes under rigid hierarchy.',
};

function getPrimaryStarName(palace: Palace): StarName | null {
  if (palace.stars.length === 0) return null;
  // Use non-null assertion is unsafe with noUncheckedIndexedAccess — use reduce safely
  let maxStar: StarName | null = null;
  let maxWeight = -1;
  for (const star of palace.stars) {
    if (star.weight > maxWeight) {
      maxWeight = star.weight;
      maxStar = star.name;
    }
  }
  return maxStar;
}

export function extractProfile(palaces: Palace[]): { palaces: Palace[]; profile: PsychProfile } {
  // PROF-01: Find dominant palace — palace with highest total star weight
  let maxWeight = -1;
  let dominantIdx = 0;
  for (const palace of palaces) {
    const totalWeight = palace.stars.reduce((sum, s) => sum + s.weight, 0);
    if (totalWeight > maxWeight) {
      maxWeight = totalWeight;
      dominantIdx = palace.index;
    }
  }

  // Mark dominant palace
  const updatedPalaces = palaces.map((p) => ({
    ...p,
    isDominant: p.index === dominantIdx,
  }));

  const dominantPalace = updatedPalaces[dominantIdx];
  if (!dominantPalace) {
    throw new Error(`No palace found at index ${dominantIdx}`);
  }

  // PROF-02: Find risk star — highest-weight risk star across all palaces
  let riskStarName: StarName | null = null;
  let riskStarPalace: PalaceName | null = null;
  let riskStarWeight = -1;
  for (const palace of updatedPalaces) {
    for (const star of palace.stars) {
      if (RISK_STARS.includes(star.name) && star.weight > riskStarWeight) {
        riskStarWeight = star.weight;
        riskStarName = star.name;
        riskStarPalace = palace.name;
      }
    }
  }

  // PROF-03: Relational pattern from Mệnh palace (index 0) primary star
  const menhPalace = updatedPalaces[0];
  const menhPrimaryStar = menhPalace ? getPrimaryStarName(menhPalace) : null;
  const relationalPattern =
    (menhPrimaryStar !== null && RELATIONAL_PATTERNS[menhPrimaryStar]) ||
    'A complex interior life shapes how connections are formed — loyalty runs deep once trust is established.';

  // PROF-04: Ambition structure from Quan Lộc palace (index 4) primary star
  const quanLocPalace = updatedPalaces[4];
  const quanLocPrimaryStar = quanLocPalace ? getPrimaryStarName(quanLocPalace) : null;
  const ambitionStructure =
    (quanLocPrimaryStar !== null && AMBITION_STRUCTURES[quanLocPrimaryStar]) ||
    'Career unfolds through consistent effort and accumulated competence rather than sudden leaps.';

  // Dominant theme for Claude system prompt (2-sentence synthesis)
  const firstSentenceRelational = relationalPattern.split('.')[0] ?? relationalPattern;
  const firstSentenceAmbition = ambitionStructure.split('.')[0] ?? ambitionStructure;
  const dominantTheme = `${firstSentenceRelational}. ${firstSentenceAmbition}.`;

  const profile: PsychProfile = {
    dominantPalaceIndex: dominantIdx,
    dominantPalaceName: dominantPalace.name,
    riskStarName,
    riskStarPalace,
    relationalPattern,
    ambitionStructure,
    dominantTheme,
  };

  return { palaces: updatedPalaces, profile };
}
