import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
  constructor() {
    inject(SeoService); // instancié pour écouter les navigations
  }
}
