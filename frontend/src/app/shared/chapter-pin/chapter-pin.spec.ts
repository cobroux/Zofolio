import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ChapterPin } from './chapter-pin';

@Component({
  imports: [ChapterPin],
  template: `<app-chapter-pin mark="P2" title="Worldline" meta="km 44" [sticky]="sticky" />`,
})
class Host {
  sticky = true;
}

describe('ChapterPin', () => {
  it('affiche repère, titre et méta, sticky par défaut', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const el: HTMLElement = f.nativeElement;
    expect(el.textContent).toContain('P2');
    expect(el.textContent).toContain('Worldline');
    expect(el.textContent).toContain('km 44');
    expect(el.querySelector('.sticky')).toBeTruthy();
  });
  it('sticky=false : pas de classe sticky', async () => {
    const f = TestBed.createComponent(Host);
    f.componentInstance.sticky = false;
    await f.whenStable();
    expect(f.nativeElement.querySelector('.sticky')).toBeNull();
  });
});
