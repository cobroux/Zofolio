import { Component } from '@angular/core';
import { Reveal } from '../../../shared/reveal/reveal';

interface Tool {
  name: string;
  /** Où la techno a servi : seulement des projets réels du portfolio. */
  where: string;
}

/** Équipement : les stacks maîtrisées, chacune prouvée par les projets où elle a tourné. Texte seul : pas de logos de marque (un seul accent, DESIGN §1). */
@Component({
  selector: 'app-kit-section',
  imports: [Reveal],
  template: `
    <section id="equipement" aria-labelledby="kit-title">
      <header appReveal>
        <h2 id="kit-title" i18n>Contrôle du matériel</h2>
        <p class="small" i18n>Avant le départ : ce que j'emporte, et où ça a déjà tourné.</p>
      </header>
      <div class="groups">
        @for (g of groups; track g.title) {
          <div class="group" appReveal>
            <h3>{{ g.title }}</h3>
            <ul>
              @for (t of g.tools; track t.name) {
                <li>
                  <span class="name">{{ t.name }}</span>
                  <span class="where small">{{ t.where }}</span>
                </li>
              }
            </ul>
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    section {
      display: flex;
      flex-direction: column;
      gap: var(--s-7);
      padding: var(--s-9) var(--margin);
    }
    header {
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
    }
    .groups {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--s-7) var(--gutter);
    }
    /* Intitulés en texte, sans capitales espacées (charte). */
    h3 {
      margin: 0 0 var(--s-4);
      font-size: var(--t-lead);
      color: var(--accent);
    }
    /* Un cran sous les titres de chapitre : le matériel n'est pas un pointage. */
    h2 {
      font-size: clamp(2.25rem, 5.5vw, 4.5rem);
    }
    ul {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li {
      display: flex;
      flex-direction: column;
    }
    .name {
      font-weight: 600;
    }
    .where {
      color: var(--ink-2);
    }
    @media (min-width: 768px) {
      .groups {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    @media (min-width: 1100px) {
      .groups {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }
  `,
})
export class KitSection {
  protected readonly groups: { title: string; tools: Tool[] }[] = [
    {
      title: $localize`Back end`,
      tools: [
        { name: 'Java', where: 'Worldline, Oltre, Histoquiz, GFaim' },
        { name: 'Spring Boot', where: 'Worldline, Oltre, Histoquiz, Zofolio' },
        { name: 'Quarkus', where: 'GFaim' },
        { name: 'Hibernate / JPA', where: 'Worldline' },
      ],
    },
    {
      title: $localize`Front end`,
      tools: [
        { name: 'Angular', where: 'Oltre, Histoquiz, Zofolio' },
        { name: 'TypeScript', where: 'Oltre, Histoquiz, Zofolio' },
        { name: 'JavaScript', where: 'Worldline, Zotracker' },
      ],
    },
    {
      title: $localize`Données`,
      tools: [
        {
          name: 'SQL (PostgreSQL, MySQL)',
          where: 'Worldline, Oltre, GFaim, Zofolio',
        },
      ],
    },
    {
      title: $localize`Outillage et déploiement`,
      tools: [
        { name: 'Docker', where: 'Worldline, Oltre, GFaim, Histoquiz, Zotracker' },
        { name: 'Git', where: $localize`Tous les projets` },
        {
          name: 'CI/CD',
          where: 'GitLab CI (Worldline), GitHub Actions (Zofolio)',
        },
        { name: 'Linux', where: $localize`VM Oracle : Oltre, Zotracker, Zofolio` },
      ],
    },
  ];
}
