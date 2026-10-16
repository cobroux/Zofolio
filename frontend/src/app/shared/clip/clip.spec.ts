import { PLATFORM_ID } from '@angular/core';
import { DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import oltre from '../../../testing/project-oltre.fixture.json';
import { Clip } from './clip';

let observe: IntersectionObserverCallback | undefined;
let play: ReturnType<typeof vi.spyOn>;
let pause: ReturnType<typeof vi.spyOn>;

async function render(opts: { reduced?: boolean; saveData?: boolean; platform?: string; video?: unknown } = {}) {
  vi.stubGlobal('matchMedia', () => ({ matches: !!opts.reduced }));
  vi.stubGlobal('navigator', { connection: { saveData: !!opts.saveData } });
  observe = undefined;
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(cb: IntersectionObserverCallback) {
        observe = cb;
      }
      observe = vi.fn();
      disconnect = vi.fn();
    },
  );
  TestBed.configureTestingModule({
    deferBlockBehavior: DeferBlockBehavior.Manual,
    providers: opts.platform ? [{ provide: PLATFORM_ID, useValue: opts.platform }] : [],
  });
  const f = TestBed.createComponent(Clip);
  f.componentRef.setInput('video', opts.video === undefined ? oltre.video : opts.video);
  f.detectChanges();
  const [block] = await f.getDeferBlocks();
  if (block) await block.render(DeferBlockState.Complete);
  f.detectChanges();
  await f.whenStable();
  return f.nativeElement as HTMLElement;
}

const seen = (isIntersecting: boolean) => observe!([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver);

describe('Clip', () => {
  beforeEach(() => {
    play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
    pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('ne rend rien si video est null', async () => {
    const el = await render({ video: null });
    expect(el.querySelector('figure, video, p')).toBeNull();
  });

  it('rend une vidéo muette, preload none, avec affiche, dimensions et légende comme nom', async () => {
    const el = await render();
    const v = el.querySelector('video')!;
    expect(v.hasAttribute('muted')).toBe(true);
    expect(v.getAttribute('preload')).toBe('none');
    expect(v.getAttribute('poster')).toBe(oltre.video.poster);
    expect(v.getAttribute('width')).toBe('1280');
    const fig = el.querySelector('figure')!;
    expect(el.querySelector(`#${fig.getAttribute('aria-labelledby')}`)?.textContent).toBe(oltre.video.caption);
    expect(el.querySelector('button')?.textContent?.trim()).toBe('Lecture');
  });

  it('lit dans le viewport et met en pause en dehors', async () => {
    await render();
    seen(true);
    expect(play).toHaveBeenCalledTimes(1);
    seen(false);
    expect(pause).toHaveBeenCalledTimes(1);
  });

  it('un clic avant la vidéo fige le mode manuel : l\'observateur ne met plus en pause', async () => {
    const el = await render();
    el.querySelector('button')!.click();
    seen(true);
    seen(false);
    expect(pause).not.toHaveBeenCalled();
  });

  it('sans webm, aucune source webm', async () => {
    const el = await render({ video: { ...oltre.video, webm: null } });
    expect(el.querySelector('source[type="video/webm"]')).toBeNull();
    expect(el.querySelector('source[type="video/mp4"]')).not.toBeNull();
  });

  it('reduced-motion : pas de play(), bouton Lecture', async () => {
    const el = await render({ reduced: true });
    expect(observe).toBeUndefined();
    expect(play).not.toHaveBeenCalled();
    expect(el.querySelector('button')?.textContent?.trim()).toBe('Lecture');
  });

  it('saveData : pas de lecture automatique, le bouton lance la vidéo', async () => {
    const el = await render({ saveData: true });
    expect(observe).toBeUndefined();
    el.querySelector('button')!.click();
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('rendu serveur : aucun accès au navigateur', async () => {
    await render({ platform: 'server' });
    expect(observe).toBeUndefined();
    expect(play).not.toHaveBeenCalled();
  });

  it('fichier absent : affiche « Démo vidéo à venir »', async () => {
    const el = await render();
    el.querySelector('source:last-of-type')!.dispatchEvent(new Event('error'));
    const f = TestBed.createComponent(Clip);
    f.componentRef.setInput('video', oltre.video);
    f.detectChanges();
    f.nativeElement.querySelector('img').dispatchEvent(new Event('error'));
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Démo vidéo à venir');
    expect(f.nativeElement.querySelector('button')).toBeNull();
  });

  it('affiche lazy pas encore chargée (complete sans pixels) : revérifiée, clip gardé si elle charge', async () => {
    const probes: { onerror?: () => void; src?: string }[] = [];
    vi.stubGlobal('Image', class { constructor() { probes.push(this as never); } });
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true);
    const f = TestBed.createComponent(Clip);
    f.componentRef.setInput('video', oltre.video);
    f.detectChanges();
    await f.whenStable();
    expect(probes).toHaveLength(1);
    expect(f.nativeElement.textContent).not.toContain('Démo vidéo à venir');
    probes[0].onerror!();
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Démo vidéo à venir');
  });
});
