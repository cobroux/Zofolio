import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Shot, Shots } from './shots';

const shots: Shot[] = [
  { name: 'A', src: 'media/a.webp', width: 10, height: 10, alt: 'Capture A de test', slug: 'a' },
  { name: 'B', src: 'media/b.webp', width: 10, height: 10, alt: 'Capture B de test' },
];

@Component({ imports: [Shots], template: `<app-shots [shots]="shots" />` })
class Host {
  protected readonly shots = shots;
}

describe('Shots', () => {
  function render() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    return f;
  }

  it('lien seulement vers une étude existante', () => {
    const el = render().nativeElement as HTMLElement;
    expect(el.querySelectorAll('li img').length).toBe(2);
    expect([...el.querySelectorAll('li a')].map((a) => a.getAttribute('href'))).toEqual(['/projets/a']);
  });

  it('clic : agrandissement dans le dialog', () => {
    const f = render();
    const el = f.nativeElement as HTMLElement;
    const dlg = el.querySelector('dialog') as HTMLDialogElement;
    dlg.showModal = vi.fn();
    (el.querySelector('li button') as HTMLButtonElement).click();
    f.detectChanges();
    expect(dlg.showModal).toHaveBeenCalled();
    expect(dlg.querySelector('img')!.getAttribute('src')).toBe('media/a.webp');
  });
});
