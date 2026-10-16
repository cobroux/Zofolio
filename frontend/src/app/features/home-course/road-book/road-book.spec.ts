import { TestBed } from '@angular/core/testing';
import { CourseProgress } from '../course-progress';
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
    return { el, dialog: el.querySelector('dialog')!, trigger: el.querySelector<HTMLButtonElement>('.bar')! };
  }

  it('libellé de la barre et marqueur lisent le km du scroll', async () => {
    const f = TestBed.createComponent(RoadBook);
    TestBed.inject(CourseProgress).scrollKm.set(12.4);
    await f.whenStable();
    const el: HTMLElement = f.nativeElement;
    expect(el.querySelector('.bar .km')!.textContent).toContain('km 12,4');
    expect(el.querySelector('.bar')!.getAttribute('aria-label')).toContain('km 12,4 sur');
    expect(el.querySelector<HTMLElement>('.mini')!.style.getPropertyValue('--p')).toBe(String(12.4 / 79.41));
  });

  it('ouvre le dialog avec 5 étapes ancres dont une courante', async () => {
    const { el, dialog, trigger } = await setup();
    expect(trigger.getAttribute('aria-label')).toBe('Ouvrir le road book : km 0 sur 79,4');
    trigger.click();
    expect(dialog.hasAttribute('open')).toBe(true);
    const links = [...el.querySelectorAll('ol a')];
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['#depart', '#p1', '#p2', '#p3', '#arrivee']);
    expect(links.filter((a) => a.getAttribute('aria-current') === 'location').length).toBe(1);
    el.remove();
  });

  it("ferme sur close (Esc) et rend le focus au déclencheur ; le tap sur une étape ferme aussi", async () => {
    const { el, dialog, trigger } = await setup();
    trigger.click();
    dialog.dispatchEvent(new Event('close')); // Esc natif émet `close`
    expect(document.activeElement).toBe(trigger);

    trigger.click();
    const section = document.createElement('section');
    section.id = 'depart';
    document.body.append(section);
    el.querySelector<HTMLAnchorElement>('ol a')!.addEventListener('click', (e) => e.preventDefault());
    el.querySelector<HTMLAnchorElement>('ol a')!.click();
    expect(dialog.hasAttribute('open')).toBe(false);
    expect(document.activeElement).toBe(section); // le focus suit le lien, pas le déclencheur
    section.remove();
    el.remove();
  });
});
