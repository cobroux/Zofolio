import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ShotsSection } from './shots.section';

describe('ShotsSection', () => {
  function render() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const f = TestBed.createComponent(ShotsSection);
    f.detectChanges();
    return f;
  }

  it('chaque capture a un texte alternatif ; lien seulement vers une étude existante', () => {
    const el = render().nativeElement as HTMLElement;
    const imgs = [...el.querySelectorAll('li img')];
    expect(imgs.length).toBe(6);
    for (const i of imgs) expect(i.getAttribute('alt')!.length).toBeGreaterThan(10);
    expect([...el.querySelectorAll('li a')].map((a) => a.getAttribute('href'))).toEqual(['/projets/oltre', '/projets/zotracker', '/projets/gfaim']);
  });

  it('clic : agrandissement dans le dialog', () => {
    const f = render();
    const el = f.nativeElement as HTMLElement;
    const dlg = el.querySelector('dialog') as HTMLDialogElement;
    dlg.showModal = vi.fn();
    (el.querySelector('li button') as HTMLButtonElement).click();
    f.detectChanges();
    expect(dlg.showModal).toHaveBeenCalled();
    expect(dlg.querySelector('img')!.getAttribute('src')).toBe('media/histoquiz-shot.webp');
  });
});
