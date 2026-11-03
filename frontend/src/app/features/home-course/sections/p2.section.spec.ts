import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { P2Section } from './p2.section';

describe('P2Section', () => {
  function render() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const f = TestBed.createComponent(P2Section);
    f.detectChanges();
    return f.nativeElement as HTMLElement;
  }

  it('allégée : ni schéma ni frise, la Décision reste', () => {
    const el = render();
    expect(el.querySelector('#p2 app-photo-plates')).toBeNull();
    expect(el.querySelector('#p2 app-decision-card')).toBeTruthy();
  });

  it("le lien mène à l'étude Worldline", () => {
    const a = render().querySelector('a.study') as HTMLAnchorElement;
    expect(a.getAttribute('href')).toBe('/projets/trading-app');
    expect(a.textContent!.replace(/\s+/g, ' ').trim()).toBe("Voir la frise et l'architecture de Worldline");
  });
});
