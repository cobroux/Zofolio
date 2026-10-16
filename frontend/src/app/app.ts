import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { SeoService } from './core/seo/seo.service';
import { Footer } from './core/layout/footer';
import { Header } from './core/layout/header';

@Component({
  imports: [RouterOutlet, Header, Footer],
  selector: 'app-root',
  templateUrl: './app.html',
  styles: `
    main {
      min-height: 60svh;
    }
    main:focus {
      outline: none;
    }
  `,
})
export class App {
  /** L'admin a son propre cadre : ni en-tête, ni pied de page du site. */
  protected readonly admin = toSignal(
    inject(Router).events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd), map((e) => e.urlAfterRedirects.startsWith('/admin'))),
    { initialValue: inject(Location).path().startsWith('/admin') },
  );

  constructor() {
    inject(SeoService); // instancié pour écouter les navigations
  }
}
