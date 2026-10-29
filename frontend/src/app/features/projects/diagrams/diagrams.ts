import { Type } from '@angular/core';
import { GfaimDiagram } from './gfaim.diagram';
import { OltreDiagram } from './oltre.diagram';
import { TradingAppDiagram } from './trading-app.diagram';
import { ZotrackerDiagram } from './zotracker.diagram';

const DIAGRAMS = new Map<string, Type<unknown>>([
  ['oltre', OltreDiagram],
  ['zotracker', ZotrackerDiagram],
  ['gfaim', GfaimDiagram],
  ['trading-app', TradingAppDiagram],
]);

/** Schéma du projet, ou `undefined`. */
export const diagramFor = (slug: string) => DIAGRAMS.get(slug);

/** Worldline : un parcours d'ordre, pas une architecture (SPEC, confidentialité). */
export const diagramTitle = (slug: string) => (slug === 'trading-app' ? $localize`Le parcours d'un ordre` : $localize`L'architecture`);
