import { TestBed } from '@angular/core/testing';
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
    el.querySelector<HTMLAnchorElement>('ol a')!.addEventListener('click', (e) => e.preventDefault());
    el.querySelector<HTMLAnchorElement>('ol a')!.click();
    expect(dialog.hasAttribute('open')).toBe(false);
    expect(document.activeElement).toBe(trigger);
    el.remove();
  });
});
