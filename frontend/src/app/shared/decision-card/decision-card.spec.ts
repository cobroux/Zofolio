import { TestBed } from '@angular/core/testing';
import { Decision, WORLDLINE_GATEWAY } from '../../features/home-course/content/decision';
import { DecisionCard } from './decision-card';

function render(decision: Decision): HTMLElement {
  const f = TestBed.createComponent(DecisionCard);
  f.componentRef.setInput('decision', decision);
  f.detectChanges();
  return f.nativeElement;
}

describe('DecisionCard', () => {
  it('decision-card : quatre rubriques dans l’ordre', () => {
    const dts = [...render(WORLDLINE_GATEWAY).querySelectorAll('dt')].map((d) =>
      d.textContent!.trim(),
    );
    expect(dts).toEqual(['Problème', 'Options', 'Choix', 'Résultat']);
  });
  it('decision-card : une rubrique vide est retirée', () => {
    expect(render({ ...WORLDLINE_GATEWAY, result: '' }).querySelectorAll('dt')).toHaveLength(3);
    expect(render({ ...WORLDLINE_GATEWAY, options: [] }).querySelectorAll('dt')).toHaveLength(3);
  });
  it('section titrée « Décision », options listées', () => {
    const el = render(WORLDLINE_GATEWAY);
    expect(el.querySelector('section h3')?.textContent?.trim()).toBe('Décision');
    expect(el.textContent).toContain('ActiveMQ, RabbitMQ');
    expect(el.textContent).not.toMatch(/JMS|Kafka/);
  });
});
