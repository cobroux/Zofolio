import { Problem } from './admin.api';

interface Meta { label: string; max?: number; range?: string; hint?: string }
/** Libellés et limites alignés sur le back (plan-v3 §3.3-3.4, `ProjectAdminService`, `RaceAdminController`). */
export const META: Record<string, Meta> = {
  slug: { label: 'Slug', hint: 'minuscules, chiffres et tirets, 64 caractères maximum' },
  tier: { label: 'Niveau' }, stage: { label: 'Étape' }, aiTag: { label: 'Part de l’IA' },
  sortOrder: { label: 'Ordre', range: 'de 0 à 100 000' },
  title: { label: 'Titre', max: 120 }, pitch: { label: 'Accroche', max: 300 }, duration: { label: 'Durée', max: 120 },
  note: { label: 'Note', max: 300 }, role: { label: 'Rôle', max: 200 }, problem: { label: 'Problème', max: 3000 },
  wall: { label: 'Le mur', max: 3000 }, takeaway: { label: 'Ce que j’en retire', max: 3000 }, aiNote: { label: 'Note sur l’IA', max: 3000 },
  metaTitle: { label: 'Titre de la page', max: 70 }, metaDescription: { label: 'Description de la page', max: 160 },
  stack: { label: 'Stack', max: 12, hint: '12 éléments maximum, 40 caractères chacun' },
  githubRepos: { label: 'Dépôts', max: 5, hint: '5 dépôts maximum' },
  demoUrl: { label: 'Démo', hint: 'adresse en https:// uniquement' },
  decisions: { label: 'Décisions', max: 3 },
  'video.name': { label: 'Clip, nom', hint: 'minuscules, chiffres et tirets' },
  'video.width': { label: 'Clip, largeur', range: 'de 1 à 4096' }, 'video.height': { label: 'Clip, hauteur', range: 'de 1 à 4096' },
  'video.mp4': { label: 'Clip, MP4' }, 'video.poster': { label: 'Clip, affiche' }, 'video.caption': { label: 'Clip, légende', max: 200 },
  kind: { label: 'Type' }, date: { label: 'Date' }, name: { label: 'Nom', max: 120 },
  distanceKm: { label: 'Distance', range: 'de 0 à 1000 km' }, elevationGainM: { label: 'D+', range: 'de 0 à 20 000 m' },
  durationS: { label: 'Durée (secondes)', range: 'de 0 à 604 800' },
  year: { label: 'Année' }, hours: { label: 'Heures', range: 'entier positif' }, activities: { label: 'Activités', range: 'entier positif' },
};
const LANG: Record<string, string> = { fr: 'français', en: 'anglais' };

/** `title.fr` -> « Titre (français) » ; `decisions.en[1].title` -> « Décision 2 (anglais), titre » ; `stack[2]` -> « Stack, élément 3 ». */
export function fieldLabel(field: string): string {
  const d = /^decisions\.(\w+)\[(\d+)\]\.(\w+)$/.exec(field);
  if (d) return `Décision ${+d[2] + 1} (${LANG[d[1]] ?? d[1]}), ${d[3] === 'title' ? 'titre' : 'compromis'}`;
  const i = /^(\w+)\[(\d+)\]$/.exec(field);
  if (i) return `${META[i[1]]?.label ?? i[1]}, élément ${+i[2] + 1}`;
  const l = /^(\w+)\.(fr|en)$/.exec(field);
  if (l) return `${META[l[1]]?.label ?? l[1]} (${LANG[l[2]]})`;
  const v = /^(video\.\w+)\.(fr|en)$/.exec(field);
  if (v) return `${META[v[1]]?.label ?? v[1]} (${LANG[v[2]]})`;
  return META[field]?.label ?? field;
}

/** Identifiant DOM du champ pointé : `title.fr` -> `f-title-fr` ; `stack[2]` -> `f-stack` (un seul champ pour la liste). */
export function fieldId(field: string): string {
  return 'f-' + field.replace(/\[\d+\]$/, '').replace(/\[(\d+)\]/g, '-$1').replace(/\./g, '-');
}

/** Message sous le champ, sans le libellé (« 120 caractères maximum. »). */
export function fieldMessage(field: string, code: string): string {
  const m = META[field.replace(/\[\d+\]$/, '').replace(/\.(fr|en)$/, '')];
  const dec = /^decisions\.\w+\[\d+\]\.(title|tradeoff)$/.exec(field);
  switch (code) {
    case 'Size':
      if (dec) return dec[1] === 'title' ? 'obligatoire, 120 caractères maximum.' : 'obligatoire, 1 000 caractères maximum.';
      if (/\[\d+\]$/.test(field)) return 'vide ou trop long.';
      return m?.max ? `${m.max === 12 ? '12 éléments' : m.max === 5 ? '5 dépôts' : m.max === 3 ? '3 décisions' : `${m.max.toLocaleString('fr-FR')} caractères`} maximum.` : 'valeur trop longue.';
    case 'NotBlank':
    case 'NotNull':
      return 'obligatoire.';
    case 'Pattern':
      return m?.hint ? `format invalide (${m.hint}).` : 'valeur invalide.';
    case 'Range':
      return m?.range ? `valeur hors limites (${m.range}).` : 'valeur hors limites.';
    case 'Future':
      return 'date trop lointaine (un an maximum).';
    case 'Conflict':
      return 'ce slug existe déjà.';
    case 'NotFound':
      return 'fichier introuvable dans les médias.';
    case 'InvalidKey':
      return 'langue non prise en charge.';
    default:
      return 'valeur invalide.';
  }
}

/** « Titre (français) : 120 caractères maximum. » */
export const fieldError = (field: string, code: string) => `${fieldLabel(field)} : ${fieldMessage(field, code)}`.replace(/^(.)/, (c) => c.toUpperCase());

/** Texte FR d'un `Problem` hors validation par champ (DESIGN §11.1) ; `null` si les erreurs sont portées par les champs. */
export function bannerMessage(p: Problem): string | null {
  switch (p.code) {
    case 'VALIDATION_FAILED': return null;
    case 'UNAUTHENTICATED': return 'Session expirée. Reconnectez-vous.';
    case 'LOGIN_LOCKED': return `Trop d’essais. Réessayez dans ${lockMinutes(p.retryAfter)} min.`;
    case 'CONFLICT': return 'Ce slug existe déjà.';
    case 'NOT_FOUND': return 'Introuvable. Retour à la liste.';
    case 'MEDIA_REJECTED': return mediaReason(p.reason);
    case 'FORBIDDEN': return 'Requête refusée (jeton de sécurité périmé). Rechargez la page.';
    default: return 'Erreur du serveur. Rien n’est perdu : réessayez.';
  }
}

export const lockMinutes = (s: number | null) => Math.max(1, Math.ceil((s ?? 60) / 60));

/** Raison d'un refus d'upload, en clair (back : TYPE, SIZE, DIMENSIONS, METADATA, DECODE). */
export function mediaReason(reason: string | null): string {
  switch (reason) {
    case 'TYPE': return 'Type refusé : JPEG, PNG ou MP4 uniquement (le contenu du fichier doit correspondre à son extension).';
    case 'SIZE': return 'Fichier trop lourd : 5 Mo maximum pour une image, 2,5 Mo pour un MP4.';
    case 'DIMENSIONS': return 'Image trop grande : 4096 px maximum sur chaque côté.';
    case 'METADATA': return 'Métadonnées interdites dans la vidéo (position, titre, auteur…) : exportez-la sans métadonnées.';
    case 'DECODE': return 'Fichier illisible ou corrompu.';
    default: return 'Fichier refusé.';
  }
}

export const TIER_LABELS: Record<string, string> = { CASE_STUDY: 'Étude de cas', SHORT: 'Fiche', HIDDEN: 'Masqué' };
export const fileSize = (b: number) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} Ko` : `${(b / 1024 / 1024).toFixed(1).replace('.', ',')} Mo`);

/** `[{ field: 'title.fr', code: 'Size' }]` -> `{ 'title.fr': 'Size' }` (une erreur par champ ; `stack[2]` et `stack[3]` restent distincts). */
export const errorMap = (errors: { field: string; code: string }[]): Record<string, string> => Object.fromEntries(errors.map((e) => [e.field, e.code]));
