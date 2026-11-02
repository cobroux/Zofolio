import { TestBed } from '@angular/core/testing';
import { CourseProgress, gainAt } from '../course-progress';
import { RoadBook } from './road-book';

// jsdom n'implémente pas showModal : on simule open/close + l'évènement close.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
});

describe('RoadBook', () => {
  async function setup() {
    const f = TestBed.createComponent(RoadBook);
    document.body.append(f.nativeElement);
    await f.whenStable();
    const el: HTMLElement = f.nativeElement;
    // Le déclencheur vit dans le bandeau de suivi : le road book reçoit le bouton qui l'ouvre.
    const opener = document.createElement('button');
    document.body.append(opener);
    return { f, el, dialog: el.querySelector('dialog')!, opener };
  }

  it('en-tête : valeurs en direct du bandeau ; pied : « Comment c\'est calculé »', async () => {
    const { f, el } = await setup();
    TestBed.inject(CourseProgress).scrollKm.set(30);
    await f.whenStable();
    const live = el.querySelector('.live')!.textContent!;
    for (const v of ['30,0', 'alt.', 'D+', 'P1', '09:23:44']) expect(live).toContain(v);
    expect(live).toContain(Math.round(gainAt(30)).toLocaleString('fr-FR'));
    expect(el.querySelector('dialog a.how')!.getAttribute('href')).toBe(
      'https://github.com/cobroux/Zofolio/blob/main/frontend/src/app/features/home-course/course-progress.ts',
    );
    document.body.replaceChildren();
  });

  it('ouvre le dialog avec 5 étapes ancres dont une courante', async () => {
    const { f, el, dialog, opener } = await setup();
    f.componentInstance.open(opener);
    expect(dialog.hasAttribute('open')).toBe(true);
    const links = [...el.querySelectorAll('ol a')];
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['#depart', '#p1', '#p2', '#p3', '#arrivee']);
    expect(links.filter((a) => a.getAttribute('aria-current') === 'location').length).toBe(1);
    document.body.replaceChildren();
  });

  it("ferme sur close (Esc) et rend le focus au déclencheur ; le tap sur une étape ferme aussi", async () => {
    const { f, el, dialog, opener } = await setup();
    f.componentInstance.open(opener);
    dialog.dispatchEvent(new Event('close')); // Esc natif émet `close`
    expect(document.activeElement).toBe(opener);

    f.componentInstance.open(opener);
    const section = document.createElement('section');
    section.id = 'depart';
    document.body.append(section);
    el.querySelector<HTMLAnchorElement>('ol a')!.addEventListener('click', (e) => e.preventDefault());
    el.querySelector<HTMLAnchorElement>('ol a')!.click();
    expect(dialog.hasAttribute('open')).toBe(false);
    expect(document.activeElement).toBe(section); // le focus suit le lien, pas le déclencheur
    document.body.replaceChildren();
  });
});
