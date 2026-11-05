import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ContentApi } from '../../core/api/content.api';
import { TrackingBand } from './tracking-band/tracking-band';
import { P1Section } from './sections/p1.section';
import { P2Section } from './sections/p2.section';
import { FinishSection } from './sections/finish.section';
import { JournalSection } from './sections/journal.section';
import { P3Section } from './sections/p3.section';
import { KitSection } from './sections/kit.section';
import { StartSection } from './sections/start.section';

/** Accueil : sections dans l'ordre #depart #p1 #p2 #p3 #journal #arrivee. Le contenu vient de /api/{lang}/home. */
@Component({
  selector: 'app-home',
  imports: [TrackingBand, StartSection, P1Section, P2Section, P3Section, KitSection, JournalSection, FinishSection],
  template: `
    <app-tracking-band />
    <app-start />
    <app-p1 [home]="home.value()" />
    <app-p2 [home]="home.value()" />
    <app-p3-section [projects]="home.value()?.projects ?? null" />
    <app-kit-section />
    <app-journal-section [races]="home.value()?.races ?? null" [contributions]="home.value()?.contributions ?? null" [sportYears]="home.value()?.sportYears ?? []" [contributionYears]="home.value()?.contributionYears ?? []" />
    <app-finish-section />
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class HomePage {
  private readonly api = inject(ContentApi);
  // Une erreur d'API devient null (ContentApi) ; undefined = chargement.
  protected readonly home = rxResource({ stream: () => this.api.home() });
}
