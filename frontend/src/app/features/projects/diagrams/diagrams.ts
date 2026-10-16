import { Type } from '@angular/core';
import { GfaimDiagram } from './gfaim.diagram';
import { OltreDiagram } from './oltre.diagram';
import { ZotrackerDiagram } from './zotracker.diagram';

const DIAGRAMS = new Map<string, Type<unknown>>([
  ['oltre', OltreDiagram],
  ['zotracker', ZotrackerDiagram],
  ['gfaim', GfaimDiagram],
]);

/** Schéma d'architecture du projet, ou `undefined` (Worldline n'en a pas). */
export const diagramFor = (slug: string) => DIAGRAMS.get(slug);
