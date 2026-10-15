import type { Page } from '@playwright/test';

/** Curseur visible et onde au clic (la vidéo Playwright n'enregistre pas le pointeur). */
export async function showCursor(page: Page) {
  await page.addInitScript(() => {
    const add = () => {
      const s = document.createElement('style');
      s.textContent = `#__cur{position:fixed;z-index:2147483647;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;
        background:rgba(234,88,12,.55);border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.35);pointer-events:none;left:-50px;top:-50px}
        .__rip{position:fixed;z-index:2147483646;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;border:3px solid #ea580c;
        pointer-events:none;animation:__rip .5s ease-out forwards}@keyframes __rip{to{transform:scale(4);opacity:0}}`;
      const c = document.createElement('div');
      c.id = '__cur';
      document.head.append(s);
      document.body.append(c);
      addEventListener('mousemove', (e) => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; }, true);
      addEventListener('mousedown', (e) => {
        const r = document.createElement('div');
        r.className = '__rip';
        r.style.left = e.clientX + 'px';
        r.style.top = e.clientY + 'px';
        document.body.append(r);
        setTimeout(() => r.remove(), 600);
      }, true);
    };
    document.body ? add() : addEventListener('DOMContentLoaded', add);
  });
}

/** Déplace le pointeur en douceur jusqu'à l'élément puis clique. */
export async function glideClick(page: Page, selector: string) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) throw new Error(`introuvable : ${selector}`);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 25 });
  await page.waitForTimeout(250);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}
