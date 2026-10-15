import { DOCUMENT } from '@angular/common';
import { inject, Injectable, LOCALE_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

// Domaine pressenti, à confirmer à l'achat (SPEC §11) ; sitemap.xml et robots.txt le répètent.
export const SITE_URL = 'https://enzoleveque.dev';
export const DEFAULT_DESCRIPTION = $localize`Portfolio d'Enzo Leveque : 2,5 ans sur une application de trading chez Worldline, des projets perso nés de la course, et un Grand Trail d'Auvergne en 13 h 35 min 53 s.`;

/** Pose title, description, Open Graph, canonical et hreflang à chaque navigation (rendu SSR inclus). */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly doc = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly lang = inject(LOCALE_ID).slice(0, 2);

  constructor() {
    const router = inject(Router);
    router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        let leaf = router.routerState.snapshot.root;
        while (leaf.firstChild) leaf = leaf.firstChild;
        this.update(router.url, leaf.data['description'] ?? DEFAULT_DESCRIPTION, !!leaf.data['noindex'], leaf.title);
      });
  }

  update(url: string, description: string, noindex = false, pageTitle?: string) {
    const path = url.split(/[?#]/)[0].replace(/^\/((fr|en)\/?)?/, '');
    const at = (l: string) => `${SITE_URL}/${l}/${path}`;
    const href = at(this.lang);
    const title = pageTitle ?? this.title.getTitle();
    const tags: Record<string, string> = {
      description,
      'og:type': 'website',
      'og:locale': this.lang === 'en' ? 'en_US' : 'fr_FR',
      'og:title': title,
      'og:description': description,
      'og:url': href,
      'og:image': `${SITE_URL}/${this.lang}/og/og-${this.lang}.jpg`,
      'twitter:card': 'summary_large_image',
      robots: noindex ? 'noindex' : 'index, follow',
    };
    for (const [name, content] of Object.entries(tags)) {
      const key = name.startsWith('og:') ? 'property' : 'name';
      this.meta.updateTag({ [key]: name, content }, `${key}="${name}"`);
    }
    this.link('canonical', href);
    this.link('alternate', at('fr'), 'fr');
    this.link('alternate', at('en'), 'en');
    this.link('alternate', at('fr'), 'x-default');
  }

  private link(rel: string, href: string, hreflang?: string) {
    const sel = `link[rel="${rel}"]${hreflang ? `[hreflang="${hreflang}"]` : ''}`;
    let el = this.doc.head.querySelector<HTMLLinkElement>(sel);
    if (!el) {
      el = this.doc.createElement('link');
      el.rel = rel;
      if (hreflang) el.hreflang = hreflang;
      this.doc.head.appendChild(el);
    }
    el.href = href;
  }
}
