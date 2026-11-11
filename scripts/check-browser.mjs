import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const baseURL = process.env.PORTFOLIO_URL || 'http://127.0.0.1:5173';
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', permissions: ['clipboard-read', 'clipboard-write'] });
const page = await context.newPage();
const errors = [];
const failures = [];
const results = [];
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => { if (response.url().startsWith(baseURL) && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
await mkdir('test-results', { recursive: true });

async function check(name, callback) {
  try { await callback(); results.push({ name, status: 'pass' }); }
  catch (error) { failures.push({ name, error: error.message }); results.push({ name, status: 'fail', error: error.message }); }
}

async function a11y(name) {
  await check(name, async () => {
    const report = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    assert.deepEqual(report.violations.map(violation => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.slice(0, 6).map(node => ({ target: node.target, summary: node.failureSummary })) })), []);
  });
}

try {
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await check('Homepage content and local fonts', async () => {
    assert.match(await page.title(), /Dhanush Amsanathan/);
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('.project-card').count(), 5);
    assert.equal(await page.evaluate(() => document.fonts.check('500 20px Manrope')), true);
    assert.equal(await page.getByRole('button', { name: 'Play animation', exact: true }).count(), 1);
  });
  await page.screenshot({ path: 'test-results/desktop-dark.png', fullPage: true });
  await page.screenshot({ path: 'test-results/desktop-hero.png' });
  const neuralImage = await page.locator('#neural-canvas').evaluate(canvas => canvas.toDataURL());
  await a11y('Dark theme WCAG A/AA scan');

  await check('All five case studies open, close, and restore focus', async () => {
    for (const name of ['AI Mentor', 'AI Tutor', 'AI Analysis', 'Voice Call Bot', 'Tamil STT']) {
      const trigger = page.getByRole('button', { name: `Explore ${name}`, exact: true });
      await trigger.click();
      assert.equal(await page.locator('#project-dialog').evaluate(dialog => dialog.open), true);
      assert.equal(await page.locator('#project-dialog-title').innerText(), name);
      assert.equal(await page.locator('#project-dialog .case-section').count(), 3);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#project-dialog').evaluate(dialog => dialog.open), false);
      assert.equal(await trigger.evaluate(element => element === document.activeElement), true);
    }
  });
  await page.getByRole('button', { name: 'Explore AI Mentor', exact: true }).click();
  await page.screenshot({ path: 'test-results/project-dialog.png' });
  await a11y('Project dialog WCAG A/AA scan');
  await page.keyboard.press('Escape');

  await check('Project filters show the right projects', async () => {
    await page.getByRole('button', { name: 'Voice & language', exact: true }).click();
    assert.equal(await page.locator('.project-card').count(), 4);
    assert.equal(await page.locator('#work-count').innerText(), '4 MATCHING PROJECTS');
    await page.getByRole('button', { name: 'Applied AI', exact: true }).click();
    assert.equal(await page.locator('.project-card').count(), 3);
    assert.equal(await page.getByRole('button', { name: 'Applied AI', exact: true }).getAttribute('aria-pressed'), 'true');
    await page.getByRole('button', { name: /All work/ }).click();
    assert.equal(await page.locator('.project-card').count(), 5);
  });

  await check('Service accordion exposes the matching details', async () => {
    await page.locator('.service').nth(1).locator('summary').click();
    assert.equal(await page.locator('.service').nth(1).evaluate(el => el.open), true);
    assert.equal(await page.locator('.service').nth(0).evaluate(el => el.open), false);
  });
  await check('Theme preference survives reload', async () => {
    await page.getByRole('button', { name: 'Switch to light theme', exact: true }).click();
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: 'test-results/desktop-light.png', fullPage: true });
  });
  await a11y('Light theme WCAG A/AA scan');
  await page.getByRole('button', { name: 'Switch to dark theme', exact: true }).click();

  await check('Email copy writes the correct address', async () => {
    await page.getByRole('button', { name: 'Copy email address', exact: true }).click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'dhanushamsanathan@gmail.com');
    assert.match(await page.locator('.toast').innerText(), /copied/);
  });
  await check('Project brief validates and constructs an email draft', async () => {
    await page.getByRole('button', { name: 'Have a project? Put a brief together' }).click();
    assert.equal(await page.locator('#brief-dialog').evaluate(dialog => dialog.open), true);
    assert.equal(await page.locator('#brief-form').evaluate(form => form.checkValidity()), false);
    await page.getByLabel('Your name', { exact: true }).fill('Portfolio Test');
    await page.getByLabel('Email address', { exact: true }).fill('test@example.com');
    await page.getByLabel('A little about your project').fill('I would like to build a voice application.');
    // Capture the email URL without launching a mail client or sending anything.
    await page.evaluate(() => {
      const original = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function () {
        if (this.protocol === 'mailto:') { window.__emailDraft = this.href; return; }
        return original.call(this);
      };
    });
    await page.getByRole('button', { name: 'Continue in email' }).click();
    const draft = await page.evaluate(() => window.__emailDraft);
    assert.ok(draft.startsWith('mailto:dhanushamsanathan@gmail.com?'));
    assert.match(decodeURIComponent(draft), /I would like to build a voice application/);
    assert.match(decodeURIComponent(draft), /test@example.com/);
  });
  await a11y('Project brief WCAG A/AA scan');
  await page.keyboard.press('Escape');

  await check('Resume download returns a real PDF', async () => {
    const response = await context.request.get(`${baseURL}/Dhanush-Resume.pdf`);
    assert.equal(response.status(), 200);
    assert.equal((await response.body()).subarray(0, 4).toString(), '%PDF');
  });
  await check('All navigation anchors resolve', async () => {
    const missing = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].map(link => link.hash).filter(hash => hash.length < 2 || !document.getElementById(hash.slice(1))));
    assert.deepEqual(missing, []);
  });

  for (const width of [360, 390, 768, 1024, 1440, 1920]) {
    await check(`No horizontal overflow at ${width}px`, async () => {
      await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(120);
      const layout = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth, overflow: [...document.querySelectorAll('main *,header,footer')].filter(el => getComputedStyle(el).position !== 'absolute' && el.getBoundingClientRect().right > innerWidth + 1).slice(0, 10).map(el => el.className) }));
      assert.ok(layout.document <= width, JSON.stringify(layout));
      if ([390, 768].includes(width)) await page.screenshot({ path: `test-results/${width === 390 ? 'mobile' : 'tablet'}.png`, fullPage: true });
    });
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await check('Mobile navigation opens, selects a section, and closes', async () => {
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    assert.equal(await page.locator('#mobile-nav').evaluate(nav => nav.inert), false);
    await page.locator('#mobile-nav').getByRole('link', { name: /Selected work/ }).click();
    assert.equal(await page.getByRole('button', { name: 'Open navigation', exact: true }).getAttribute('aria-expanded'), 'false');
    assert.equal(await page.locator('#mobile-nav').evaluate(nav => nav.inert), true);
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('button', { name: 'Open navigation', exact: true }).getAttribute('aria-expanded'), 'false');
  });
  await a11y('Mobile WCAG A/AA scan');
  await check('Reduced motion stays paused; animation toggle works', async () => {
    const button = page.getByRole('button', { name: 'Play animation', exact: true });
    await button.click();
    assert.equal(await page.getByRole('button', { name: 'Pause animation', exact: true }).count(), 1);
    await page.getByRole('button', { name: 'Pause animation', exact: true }).click();
    assert.equal(await page.getByRole('button', { name: 'Play animation', exact: true }).count(), 1);
  });

  const noJsPage = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await check('Core content and contact work without JavaScript', async () => {
    await noJsPage.goto(baseURL);
    assert.equal(await noJsPage.locator('h1').isVisible(), true);
    assert.equal(await noJsPage.locator('.noscript-projects').isVisible(), true);
    assert.equal(await noJsPage.locator('.email-row a').getAttribute('href'), 'mailto:dhanushamsanathan@gmail.com');
    assert.ok(await noJsPage.locator('a[download]').count() > 0);
  });
  await noJsPage.close();

  await check('No browser errors or failed local resources', async () => assert.deepEqual(errors, []));

  // Export an original social image from the site's own type and canvas artwork.
  const social = await context.newPage();
  await social.setViewportSize({ width: 1200, height: 630 });
  await social.goto(baseURL, { waitUntil: 'networkidle' });
  await social.setContent(`<html><head><style>@font-face{font-family:Manrope;src:url('${baseURL}/fonts/manrope-latin.woff2')}@font-face{font-family:Instrument;src:url('${baseURL}/fonts/instrument-serif-italic-latin.woff2');font-style:italic}*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#151713;color:#eeeee6;font-family:Manrope,sans-serif;padding:48px 60px;position:relative;overflow:hidden}.top{display:flex;justify-content:space-between;border-bottom:1px solid #33372d;padding-bottom:25px}.brand{font-size:28px;font-weight:800;letter-spacing:-1px}.brand span{color:#d5f48a}.label{font-size:11px;letter-spacing:2px;color:#a4a89b;margin-top:12px}h1{font-size:83px;font-weight:500;letter-spacing:-5px;line-height:1.07;margin:46px 0 23px;position:relative;z-index:2}em{font-family:Instrument,serif;font-weight:400;color:#d5f48a;font-size:1.17em}p{font-size:13px;color:#a4a89b;letter-spacing:.3px}img{position:absolute;width:495px;right:15px;top:130px}.bottom{position:absolute;bottom:35px;left:60px;right:60px;border-top:1px solid #33372d;padding-top:16px;display:flex;justify-content:space-between;font-size:9px;color:#a4a89b;letter-spacing:1.3px}</style></head><body><div class="top"><div class="brand">dhanush<span>.</span></div><div class="label">AI / ML ENGINEER & FREELANCE DEVELOPER</div></div><h1>Intelligence,<br>built for the<br><em>real world.</em></h1><p>Voice. Vision. Language. Thoughtful engineering.</p><img src="${neuralImage}" alt=""/><div class="bottom"><span>DHANUSH AMSANATHAN</span><span>CHENNAI, INDIA · BUILDING FOR EVERYWHERE</span></div></body></html>`);
  await social.evaluate(() => document.fonts.ready);
  await social.screenshot({ path: 'test-results/social-preview.png' });
  await social.close();

  console.log(JSON.stringify({ baseURL, checks: results, passed: results.length - failures.length, failed: failures.length }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await browser.close();
}
