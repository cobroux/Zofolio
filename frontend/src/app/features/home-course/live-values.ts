import { SPLITS } from './profile.data';
import { CheckpointId, altitudeAt, formatKm, gainAt, lastCheckpoint } from './course-progress';

export const LABELS = {
  depart: { short: $localize`0`, full: $localize`Départ`, name: $localize`Départ` },
  p1: { short: $localize`P1`, full: $localize`Fondations`, name: $localize`P1 · Fondations` },
  p2: { short: $localize`P2`, full: $localize`Worldline`, name: $localize`P2 · Worldline` },
  p3: { short: $localize`P3`, full: $localize`Projets perso`, name: $localize`P3 · Projets perso` },
  arrivee: { short: $localize`Arr.`, full: $localize`Arrivée`, name: $localize`Arrivée` },
};
/** Heure du départ officiel (GTA 2025, spec §3) : seul « passage » avant P1. */
const START_CLOCK = '06:30:00';

export const clockAt = (id: CheckpointId) => (id === 'depart' ? START_CLOCK : SPLITS[id].clock);
/** Nom court affiché devant un temps de passage : « P2 », « Départ », « Arrivée ». */
export const passName = (id: CheckpointId) =>
  id === 'depart' || id === 'arrivee' ? LABELS[id].full : LABELS[id].short;
const group = (n: number) => Math.round(n).toLocaleString($localize`:@@numberLocale:fr-FR`);

/** Valeurs en direct au km donné, même formatage pour le bandeau et le road book : km au dixième, altitude, D+, dernier passage officiel (jamais interpolé). */
export function liveValues(km: number) {
  const at = lastCheckpoint(km);
  return { km: formatKm(km, 1), alt: group(altitudeAt(km)), gain: group(gainAt(km)), pass: passName(at), clock: clockAt(at) };
}
