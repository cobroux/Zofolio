// Miroir du contrat plan-v2.md §4 : seule source de types API côté front.
export type Stage = 'P1' | 'R1' | 'P2' | 'R2' | 'P3';

export interface Experience {
  stage: Stage;
  kind: 'EDUCATION' | 'MISSION' | 'AID';
  title: string;
  body: string;
  period: string | null;
  stack: string[] | null;
  note: string | null;
}

export interface ProjectSummary {
  slug: string;
  tier: 'CASE_STUDY' | 'SHORT';
  stage: 'P1' | 'P2' | 'P3' | null;
  title: string;
  pitch: string;
  metaTitle: string | null;
  metaDescription: string | null;
  aiTag: 'HAND' | 'HAND_THEN_AI' | 'AI';
  stack: string[];
  duration: string | null;
  commits: number | null;
  note: string | null;
  repoUrl: string | null;
  demoUrl: string | null;
  languages: string[];
  lastPushAt: string | null;
  video: Video | null;
  /** Toujours `null` dans les listes ; renseigné par `project(slug)` pour une étude de cas. */
  caseStudy: CaseStudy | null;
}

/** URL relatives à `<base href>` (ADR 0003). */
export interface Video {
  mp4: string;
  /** `null` : seul le MP4 est servi (D44). */
  webm: string | null;
  poster: string;
  width: number;
  height: number;
  caption: string;
}

export interface CaseStudy {
  role: string;
  problem: string;
  decisions: { title: string; tradeoff: string }[];
  wall: string;
  takeaway: string;
  aiNote: string | null;
  repos: { name: string; url: string }[];
}

export interface Contributions {
  /** Premier jour (dimanche) du calendrier GitHub, `YYYY-MM-DD`. */
  start: string;
  counts: number[];
  total: number;
  syncedAt: string;
}

export interface Race {
  kind: 'RACE' | 'INDEX' | 'CLUB';
  date: string | null;
  name: string;
  distanceKm: number | null;
  elevationGainM: number | null;
  durationS: number | null;
  note: string | null;
  personalRecord: boolean;
}

export interface SportYear {
  year: number;
  distanceKm: number | null;
  elevationGainM: number | null;
  hours: number | null;
  activities: number | null;
}

export interface HomeResponse {
  experiences: Experience[];
  projects: ProjectSummary[];
  races: Race[];
  /** Année décroissante ; `[]` si aucune. */
  sportYears: SportYear[];
  /** `null` tant qu'aucune synchro GitHub n'a réussi. */
  contributions: Contributions | null;
}

export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  /** Texte générique en anglais, non localisé : le front traduit par `code`. */
  detail: string;
  instance: string;
  code: 'VALIDATION_FAILED' | 'MALFORMED_REQUEST' | 'NOT_FOUND' | 'RATE_LIMITED' | 'MAIL_DELIVERY_FAILED' | 'INTERNAL_ERROR';
  errors?: { field: string; code: string }[];
}

export interface ContactRequest {
  name: string;
  email: string;
  company: string | null;
  message: string;
  website: string;
}
