import { Component, inject, signal } from '@angular/core';
import { ContactApi, ContactResult } from './contact.api';

type Field = 'name' | 'email' | 'company' | 'message';
export type Values = Record<Field, string>;
export type FieldErrors = Partial<Record<Field, string>>;

/** Règles plan §4.3 ; les codes sont ceux des contraintes serveur. */
export function validate(v: Values): FieldErrors {
  const e: FieldErrors = {};
  const name = v.name.trim();
  if (!name) e.name = 'NotBlank';
  else if (name.length > 100) e.name = 'Size';
  else if ([...v.name].some((c) => c < ' ' || c === '\u007f')) e.name = 'Pattern';
  const email = v.email.trim();
  if (!email) e.email = 'NotBlank';
  else if (email.length > 254) e.email = 'Size';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email';
  if (v.company.trim().length > 100) e.company = 'Size';
  if (!v.message.trim()) e.message = 'NotBlank';
  else if (v.message.length > 5000) e.message = 'Size';
  return e;
}

const MAIL = 'enzo.lvq12@gmail.com';

const FIELD_MESSAGES: Record<string, string> = {
  'name.NotBlank': $localize`Indiquez votre nom.`,
  'name.Size': $localize`Le nom est limité à 100 caractères.`,
  'name.Pattern': $localize`Le nom ne peut pas contenir de saut de ligne ni de caractère de contrôle.`,
  'email.NotBlank': $localize`Indiquez votre adresse e-mail.`,
  'email.Email': $localize`Cette adresse e-mail n'a pas l'air valide.`,
  'email.Size': $localize`L'adresse e-mail est limitée à 254 caractères.`,
  'company.Size': $localize`La société est limitée à 100 caractères.`,
  'message.NotBlank': $localize`Écrivez un message : une page blanche ne porte pas bien loin.`,
  'message.Size': $localize`Le message est limité à 5 000 caractères.`,
};

/** Message global par `code` de ProblemDetail (le `detail` du back est en anglais, jamais affiché). */
export function globalMessage(r: Extract<ContactResult, { ok: false }>): string {
  switch (r.code) {
    case 'VALIDATION_FAILED':
      return $localize`Quelques champs sont à corriger avant l'envoi.`;
    case 'MALFORMED_REQUEST':
      return $localize`Le message n'a pas pu être lu. Rechargez la page et réessayez.`;
    case 'RATE_LIMITED': {
      const minutes = Math.max(1, Math.ceil((r.retryAfterS ?? 3600) / 60));
      return $localize`Trop de messages envoyés depuis cette connexion. Réessayez dans ${minutes} min, ou écrivez directement à ${MAIL}.`;
    }
    case 'MAIL_DELIVERY_FAILED':
      return $localize`Votre message est enregistré, mais la notification n'est pas partie. Pour être certain qu'il soit lu, écrivez à ${MAIL}.`;
    case 'NETWORK':
      return $localize`Le serveur ne répond pas. Vérifiez votre connexion et réessayez.`;
    default:
      return $localize`Une erreur inattendue s'est produite. Réessayez dans un instant.`;
  }
}

@Component({
  selector: 'app-contact-form',
  template: `
    <form method="post" novalidate (submit)="submit($event)" aria-labelledby="form-title">
      <h3 id="form-title" i18n>Écrire un message</h3>

      <div class="field">
        <label for="c-name" i18n>Nom</label>
        <input id="c-name" name="name" type="text" autocomplete="name" required [value]="v().name" (input)="set('name', $event)"
          [attr.aria-invalid]="errors().name ? true : null" [attr.aria-describedby]="errors().name ? 'c-name-err' : null" />
        @if (msg('name'); as m) { <p class="err" id="c-name-err">{{ m }}</p> }
      </div>

      <div class="field">
        <label for="c-email" i18n>E-mail</label>
        <input id="c-email" name="email" type="email" autocomplete="email" required [value]="v().email" (input)="set('email', $event)"
          [attr.aria-invalid]="errors().email ? true : null" [attr.aria-describedby]="errors().email ? 'c-email-err' : null" />
        @if (msg('email'); as m) { <p class="err" id="c-email-err">{{ m }}</p> }
      </div>

      <div class="field">
        <label for="c-company" i18n>Société (facultatif)</label>
        <input id="c-company" name="company" type="text" autocomplete="organization" [value]="v().company" (input)="set('company', $event)"
          [attr.aria-invalid]="errors().company ? true : null" [attr.aria-describedby]="errors().company ? 'c-company-err' : null" />
        @if (msg('company'); as m) { <p class="err" id="c-company-err">{{ m }}</p> }
      </div>

      <div class="field">
        <label for="c-message" i18n>Message</label>
        <textarea id="c-message" name="message" rows="5" required [value]="v().message" (input)="set('message', $event)"
          [attr.aria-invalid]="errors().message ? true : null" [attr.aria-describedby]="errors().message ? 'c-message-err' : null"></textarea>
        @if (msg('message'); as m) { <p class="err" id="c-message-err">{{ m }}</p> }
      </div>

      <!-- Honeypot : hors écran, hors arbre d'accessibilité, hors tabulation. -->
      <div class="hp" aria-hidden="true">
        <label for="c-website" i18n>Site web (ne pas remplir)</label>
        <input id="c-website" name="website" type="text" tabindex="-1" autocomplete="off" [value]="website()" (input)="website.set($any($event.target).value)" />
      </div>

      <button type="submit" [disabled]="sending()">
        @if (sending()) { <ng-container i18n>Envoi en cours…</ng-container> } @else { <ng-container i18n>Envoyer le message</ng-container> }
      </button>

      <div class="status" role="status" aria-live="polite">
        @if (done()) { <p class="note" i18n>Message envoyé. Merci, je réponds dès que possible.</p> }
        @if (global(); as g) { <p class="note">{{ g }}</p> }
      </div>
      <noscript><p i18n>Sans JavaScript, écrivez directement par e-mail ou téléchargez le CV : les liens ci-dessus fonctionnent.</p></noscript>
    </form>
  `,
  styles: `
    form { display: flex; flex-direction: column; gap: var(--s-5); }
    h3 { margin: 0; font-family: var(--font-display); font-size: var(--t-lead); }
    .field { display: flex; flex-direction: column; gap: 6px; }
    label { font-weight: 600; }
    input, textarea {
      font: inherit;
      padding: var(--s-3);
      border: 0;
      min-height: var(--target);
      box-sizing: border-box;
      color: var(--ink);
      background: var(--bg);
    }
    textarea { resize: vertical; }
    input:focus-visible, textarea:focus-visible, button:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }
    [aria-invalid='true'] { outline: 2px solid var(--ink); }
    button {
      align-self: flex-start;
      font: inherit;
      font-weight: 600;
      min-height: var(--target);
      padding: 0 var(--s-5);
      border: 0;
      cursor: pointer;
      color: var(--bg);
      background: var(--ink);
    }
    button:disabled { opacity: 0.6; cursor: progress; }
    .err, .note { margin: 0; font-size: var(--t-small); }
    .err { align-self: flex-start; padding: 2px var(--s-2); background: var(--ink); color: var(--bg); }
    .note { max-width: 52ch; }
    .hp { position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden; }
  `,
})
export class ContactForm {
  private readonly api = inject(ContactApi);
  readonly v = signal<Values>({ name: '', email: '', company: '', message: '' });
  readonly website = signal('');
  readonly errors = signal<FieldErrors>({});
  readonly sending = signal(false);
  readonly done = signal(false);
  readonly global = signal('');

  set(f: Field, e: Event) {
    this.v.update((v) => ({ ...v, [f]: (e.target as HTMLInputElement).value }));
  }

  msg(f: Field): string | null {
    const c = this.errors()[f];
    return c ? (FIELD_MESSAGES[`${f}.${c}`] ?? $localize`Ce champ est à corriger.`) : null;
  }

  submit(e: Event) {
    e.preventDefault();
    if (this.sending()) return;
    this.done.set(false);
    this.global.set('');
    const errors = validate(this.v());
    this.errors.set(errors);
    if (Object.keys(errors).length) {
      this.global.set($localize`Quelques champs sont à corriger avant l'envoi.`);
      const first = (['name', 'email', 'company', 'message'] as Field[]).find((f) => errors[f]);
      (e.target as HTMLFormElement).querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    this.sending.set(true);
    const { name, email, company, message } = this.v();
    this.api.send({ name: name.trim(), email: email.trim(), company: company.trim() || null, message, website: this.website() }).subscribe((r) => {
      this.sending.set(false);
      if (r.ok) {
        this.done.set(true);
        this.v.set({ name: '', email: '', company: '', message: '' });
        return;
      }
      const fe: FieldErrors = {};
      for (const x of r.errors) if (['name', 'email', 'company', 'message'].includes(x.field)) fe[x.field as Field] = x.code;
      this.errors.set(fe);
      this.global.set(globalMessage(r));
    });
  }
}
