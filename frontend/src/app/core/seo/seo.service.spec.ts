import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { SeoService, SITE_URL } from './seo.service';

describe('SeoService', () => {
  it('pose description, og, canonical et hreflang fr, en + x-default', () => {
    TestBed.inject(Title).setTitle('Test');
    TestBed.inject(SeoService).update('/fr/mentions-legales?x=1#a', 'Desc');
    const q = (s: string) => document.head.querySelector(s);
    expect(q('meta[name="description"]')?.getAttribute('content')).toBe('Desc');
    expect(q('meta[property="og:title"]')?.getAttribute('content')).toBe('Test');
    expect(q('meta[property="og:image"]')).toBeTruthy();
    expect(q('link[rel="canonical"]')?.getAttribute('href')).toBe(`${SITE_URL}/fr/mentions-legales`);
    expect(q('link[hreflang="fr"]')?.getAttribute('href')).toBe(`${SITE_URL}/fr/mentions-legales`);
    expect(q('link[hreflang="en"]')?.getAttribute('href')).toBe(`${SITE_URL}/en/mentions-legales`);
    expect(q('link[hreflang="x-default"]')?.getAttribute('href')).toBe(`${SITE_URL}/fr/mentions-legales`);
  });

  it('une seconde mise à jour remplace sans dupliquer', () => {
    const seo = TestBed.inject(SeoService);
    seo.update('/', 'A');
    seo.update('/', 'B', true);
    expect(document.head.querySelectorAll('meta[name="description"]').length).toBe(1);
    expect(document.head.querySelectorAll('link[rel="canonical"]').length).toBe(1);
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex');
  });
});
