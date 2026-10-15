// Miroir du contrat plan.md §4 : seule source de types API côté front.
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
  stage: 'P1' | 'P3' | null;
  title: string;
  pitch: string;
  aiTag: 'HAND' | 'HAND_THEN_AI' | 'AI';
  stack: string[];
  duration: string | null;
  commits: number | null;
  note: string | null;
  repoUrl: string | null;
  demoUrl: string | null;
}

export interface Race {
  kind: 'RACE' | 'INDEX' | 'CLUB';
  date: string;
  name: string;
  distanceKm: number | null;
  elevationGainM: number | null;
  durationS: number | null;
  note: string | null;
  personalRecord: boolean;
}

export interface HomeResponse {
  experiences: Experience[];
  projects: ProjectSummary[];
  races: Race[];
}

export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
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
