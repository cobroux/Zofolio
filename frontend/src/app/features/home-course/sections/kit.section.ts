import { Component } from '@angular/core';
import { Reveal } from '../../../shared/reveal/reveal';

interface Tool {
  name: string;
  icon: string;
  /** Où la techno a servi : seulement des projets réels du portfolio. */
  where: string;
}

/** Équipement : les stacks maîtrisées, chacune prouvée par les projets où elle a tourné. */
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
                  <img [src]="'img/stack/' + t.icon + '.svg'" alt="" width="32" height="32" loading="lazy" />
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
    h3 {
      margin: 0 0 var(--s-4);
      font-size: var(--t-small);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--ink-2);
    }
    ul {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li {
      display: grid;
      grid-template-columns: 32px minmax(0, 1fr);
      column-gap: var(--s-3);
      align-items: center;
    }
    img {
      grid-row: span 2;
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
        { name: 'Java', icon: 'java', where: 'Worldline, Oltre, Histoquiz, GFaim' },
        { name: 'Spring Boot', icon: 'spring', where: 'Worldline, Oltre, Histoquiz, Zofolio' },
        { name: 'Quarkus', icon: 'quarkus', where: 'GFaim' },
        { name: 'Hibernate / JPA', icon: 'hibernate', where: 'Worldline' },
      ],
    },
    {
      title: $localize`Front end`,
      tools: [
        { name: 'Angular', icon: 'angular', where: 'Oltre, Histoquiz, Zofolio' },
        { name: 'TypeScript', icon: 'typescript', where: 'Oltre, Histoquiz, Zofolio' },
        { name: 'JavaScript', icon: 'javascript', where: 'Worldline, Zotracker' },
      ],
    },
    {
      title: $localize`Données`,
      tools: [
        {
          name: 'SQL (PostgreSQL, MySQL)',
          icon: 'postgresql',
          where: 'Worldline, Oltre, GFaim, Zofolio',
        },
      ],
    },
    {
      title: $localize`Outillage et déploiement`,
      tools: [
        { name: 'Docker', icon: 'docker', where: 'Worldline, Oltre, GFaim, Histoquiz, Zotracker' },
        { name: 'Git', icon: 'git', where: $localize`Tous les projets` },
        {
          name: 'CI/CD',
          icon: 'githubactions',
          where: 'GitLab CI (Worldline), GitHub Actions (Zofolio)',
        },
        { name: 'Linux', icon: 'linux', where: $localize`VM Oracle : Oltre, Zotracker, Zofolio` },
      ],
    },
  ];
}
