import { profile, projects } from './content.js';

document.documentElement.classList.add('js');

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}" /></svg>`;
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]);
const wave = (count, scale = 1) => Array.from({ length: count }, (_, index) => {
  const envelope = Math.sin((index / (count - 1)) * Math.PI);
  const height = (5 + Math.abs(Math.sin(index * 1.8) * Math.cos(index * 0.37)) * 48 * envelope) * scale;
  return `<i style="--bar:${height.toFixed(1)}px"></i>`;
}).join('');

const artwork = {
  'ai-mentor': `<div class="mentor-sheet"><div class="mini-header"><span class="mini-brand">${icon('star')} AI Mentor</span><span>THE PRACTICE ROOM</span></div><div class="mentor-title">Practice makes<br />progress.</div><p class="mentor-subtitle">A space to try, reflect, and improve.</p><div class="mentor-wave">${wave(39)}</div><div class="mentor-bottom"><span>VOICE ROLEPLAY</span><span class="mini-mic">${icon('mic')}</span><span>GUIDED FEEDBACK</span></div></div><div class="mentor-float">${icon('check')} EVERY CONVERSATION COUNTS</div>`,
  'ai-tutor': `<div class="tutor-scene"><svg class="rotocopter" viewBox="0 0 140 180" fill="none" aria-hidden="true"><path d="M70 80 32 28 9 43l47 56Z" fill="#b4c78c" stroke="#73835e"/><path d="m70 80 38-52 23 15-47 56Z" fill="#e0ce95" stroke="#a3915f"/><path d="m56 84 28 0-2 65H58Z" fill="#e5ddc7" stroke="#a39173"/><path d="M70 87v59M58 143h24" stroke="#a39173" stroke-dasharray="3 3"/><path d="M64 151v12h12v-12" stroke="#61717c" stroke-width="3"/><ellipse cx="70" cy="173" rx="25" ry="3" fill="#a9b2b4" opacity=".3"/><path d="M15 110C-1 78 21 16 68 13m-6-5 6 5-7 6M126 65c15 32-7 62-25 66m3-7-3 7 8 2" stroke="#8a9aa4" stroke-dasharray="3 3"/></svg><div class="tutor-steps"><span><b>01</b> Observe</span><span class="active"><b>02</b> Explore</span><span><b>03</b> Understand</span></div><span class="vision-tag">CAMERA-AWARE LEARNING</span></div>`,
  'ai-analysis': `<div class="analysis-sheet"><div class="mini-header"><span class="mini-brand">${icon('code')} AI Analysis</span><span>FROM SIGNAL TO INSIGHT</span></div><div class="analysis-chart">${[25, 42, 30, 52, 39, 58, 44, 66, 53, 61].map(height => `<i style="--bar:${height}px"></i>`).join('')}</div><div class="analysis-row"><span>CONVERSATIONS</span><span>Transcribed ↗</span></div><div class="analysis-row"><span>EVALUATION</span><span>Structured ↗</span></div><div class="analysis-row"><span>INSIGHTS</span><span>Consolidated ↗</span></div></div><div class="analysis-float">A CLEARER PICTURE.</div>`,
  'voice-call-bot': `<svg class="voice-path" viewBox="0 0 500 280" fill="none" preserveAspectRatio="none" aria-hidden="true"><path d="M80 90H160L250 140l90 65h85M110 245l140-105L380 35" stroke="#617c58" stroke-dasharray="3 5"/></svg><div class="call-orbit"></div><div class="call-core">${icon('phone')}</div><span class="voice-node node-left">01 / CONNECT</span><span class="voice-node node-right">02 / CONVERSE</span><span class="voice-node node-bottom">NATURAL CONVERSATIONS. REAL PHONE LINES.</span>`,
  'stt-tamil': `<div class="tamil-panel"><div class="mini-header"><span class="mini-brand">Tamil STT</span><span>LANGUAGE, AS IT IS SPOKEN.</span></div><div class="tamil-type"><span lang="ta">வணக்கம்</span> / hello.</div><div class="tamil-wave">${wave(65, .48)}</div><div class="tamil-caption"><span>TAMIL + ENGLISH</span><span>AUDIO → TEXT</span></div></div><div class="tamil-float">chitti-whisper-1</div>`,
};

const visualClasses = { 'ai-mentor': 'mentor', 'ai-tutor': 'tutor', 'ai-analysis': 'analysis', 'voice-call-bot': 'voice', 'stt-tamil': 'tamil' };
const grid = $('#projects-grid');

function renderProjects(filter = 'all') {
  const visibleProjects = projects.filter(project => filter === 'all' || project.filters.includes(filter));
  grid.innerHTML = visibleProjects.map((project, index) => `
    <article class="project-card ${project.id === 'ai-mentor' && filter === 'all' ? 'featured' : ''}" style="animation-delay:${index * 35}ms">
      <div class="project-visual visual-${visualClasses[project.id]}" aria-hidden="true">
        <div class="visual-label"><span>PROJECT ${project.number} / ${escapeHtml(project.name.toUpperCase())}</span><span>SYSTEM SKETCH</span></div>
        ${artwork[project.id]}
      </div>
      <div class="project-body">
        <div class="project-category"><span>${project.number}</span>${escapeHtml(project.category)}</div>
        <h3>${escapeHtml(project.headline).replace('\n', '<br />')}</h3>
        <p>${escapeHtml(project.description)}</p>
        <div class="project-stack">${project.stack.slice(0, 4).map(tech => `<span>${escapeHtml(tech)}</span>`).join('')}</div>
        <div class="project-bottom"><span class="project-name">${escapeHtml(project.name)}</span><button class="project-open" data-project="${project.id}" aria-label="Explore ${escapeHtml(project.name)}">Explore project ${icon('up-right')}</button></div>
      </div>
    </article>
  `).join('');
  $('#work-count').textContent = `${visibleProjects.length} ${filter === 'all' ? 'SELECTED' : 'MATCHING'} PROJECT${visibleProjects.length === 1 ? '' : 'S'}`;
}

renderProjects();

$$('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    $$('[data-filter]').forEach(item => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    renderProjects(button.dataset.filter);
  });
});

// Native dialogs retain keyboard focus and restore it to their opener on close.
const projectDialog = $('#project-dialog');
const briefDialog = $('#brief-dialog');
let lastDialogTrigger = null;

function openDialog(dialog, trigger) {
  lastDialogTrigger = trigger || document.activeElement;
  dialog.showModal();
  document.body.classList.add('modal-open');
  dialog.scrollTop = 0;
  $('.dialog-close', dialog).focus({ preventScroll: true });
}

$$('dialog').forEach(dialog => {
  $('.dialog-close', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    if (lastDialogTrigger?.isConnected) lastDialogTrigger.focus({ preventScroll: true });
  });
});

function projectUrlLink(url, label) {
  if (!url) return '';
  try {
    const validated = new URL(url);
    if (validated.protocol !== 'https:') return '';
    return `<a class="button button-secondary" href="${escapeHtml(validated.href)}" target="_blank" rel="noopener noreferrer">${label} ${icon('up-right')}</a>`;
  } catch { return ''; }
}

grid.addEventListener('click', event => {
  const trigger = event.target.closest('[data-project]');
  if (!trigger) return;
  const project = projects.find(item => item.id === trigger.dataset.project);
  if (!project) return;
  $('#project-dialog-content').innerHTML = `
    <div class="dialog-hero"><p class="eyebrow">PROJECT ${project.number} / ${escapeHtml(project.category)}</p><h2 id="project-dialog-title">${escapeHtml(project.name)}</h2><p class="dialog-description">${escapeHtml(project.description)}</p><dl class="dialog-meta"><div><dt>CONTEXT</dt><dd>${escapeHtml(project.context)}</dd></div><div><dt>MY FOCUS</dt><dd>${escapeHtml(project.role)}</dd></div></dl></div>
    <div class="dialog-main"><section class="case-section"><h3>The problem</h3><p>${escapeHtml(project.challenge)}</p></section><section class="case-section"><h3>The approach</h3><p>${escapeHtml(project.approach)}</p></section><div class="case-pipeline" aria-label="System stages">${project.pipeline.map((step, index) => `<span><b>0${index + 1}</b>${escapeHtml(step)}</span>`).join('')}</div><section class="case-section"><h3>What went into it</h3><ul>${project.highlights.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section><div class="project-stack">${project.stack.map(tech => `<span>${escapeHtml(tech)}</span>`).join('')}</div><div class="case-takeaway"><p class="eyebrow">THE ENGINEERING DETAIL</p><p>${escapeHtml(project.takeaway)}</p></div><div class="dialog-actions"><a class="button button-primary" href="mailto:${profile.email}?subject=${encodeURIComponent(`Let's build something like ${project.name}`)}">Discuss a similar project ${icon('up-right')}</a>${projectUrlLink(project.liveUrl, 'Visit project')}${projectUrlLink(project.sourceUrl, 'View source')}</div></div>`;
  openDialog(projectDialog, trigger);
});

$('#open-brief').addEventListener('click', event => openDialog(briefDialog, event.currentTarget));
$('#brief-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const name = String(data.get('name')).trim();
  const message = String(data.get('message')).trim();
  if (!name || !message) {
    $('.form-status', form).textContent = 'Please add your name and a short description of the project.';
    return;
  }
  const subject = `${data.get('service')} — project enquiry from ${name}`;
  const body = `Hi Dhanush,\n\n${message}\n\nProject type: ${data.get('service')}\n\n${name}\n${data.get('email')}`;
  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const link = document.createElement('a');
  link.href = mailto;
  document.body.append(link);
  link.click();
  link.remove();
  $('.form-status', form).textContent = `Your email draft is ready to open. If your email app doesn’t launch, email ${profile.email} directly. Your brief remains here.`;
});

// Mobile navigation remains a normal set of links; Escape closes the disclosure.
const menuToggle = $('.menu-toggle');
const mobileNav = $('#mobile-nav');
function setMenu(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  mobileNav.classList.toggle('is-open', open);
  mobileNav.inert = !open;
}
menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
$$('a', mobileNav).forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuToggle.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) setMenu(false);
});
window.matchMedia('(min-width: 681px)').addEventListener('change', event => {
  if (event.matches) setMenu(false);
});

// Explicit theme choice persists; storage restrictions never prevent navigation.
const themeButton = $('.theme-toggle');
function syncThemeButton() {
  const dark = document.documentElement.dataset.theme === 'dark';
  themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
  themeButton.innerHTML = icon(dark ? 'sun' : 'moon');
  $('meta[name="theme-color"]').content = dark ? '#151713' : '#f4f3ed';
}
syncThemeButton();
themeButton.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('dhanush-theme', theme); } catch { /* Browsing with storage disabled is supported. */ }
  syncThemeButton();
});

let toastTimeout;
function showToast(message) {
  const toast = $('.toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('is-visible'), 3000);
}
$('.copy-email').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(profile.email);
    showToast('Email address copied. Let’s make something good.');
  } catch {
    // Keep the visible address selectable when clipboard access is unavailable.
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents($('.email-row > a'));
    selection?.removeAllRanges();
    selection?.addRange(range);
    showToast('Email selected. Use your device’s copy action.');
  }
});

function updateTime() {
  $('[data-local-time]').textContent = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()) + ' IST';
}
updateTime();
setInterval(updateTime, 60000);
$('#copyright-year').textContent = new Date().getFullYear();

const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    $$('.desktop-nav a').forEach(link => {
      if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
$$('main section[id]').forEach(section => navObserver.observe(section));

// A small Canvas 2D point-cloud study. No network, AI inference, or WebGL.
// Stop rendering offscreen / in hidden tabs, respect reduced motion, and provide
// a pause button. DPR and frame rate are capped to keep mobile work bounded.
function createNeuralField() {
  const canvas = $('#neural-canvas');
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return;
  const stage = canvas.parentElement;
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const button = $('.animation-toggle');
  const points = [];
  const count = 1800;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let index = 0; index < count; index++) {
    const y = 1 - (index / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = goldenAngle * index;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    const distortion = 1 + .105 * Math.sin(y * 6 + theta * .09);
    points.push({ x: x * distortion, y, z: z * distortion, size: index % 11 === 0 ? 1.6 : .9 });
  }
  let width = 0;
  let height = 0;
  let animationId = 0;
  let paused = motionPreference.matches;
  let visible = true;
  let angle = .7;
  let pointer = { x: 0, y: 0 };
  let smoothPointer = { x: 0, y: 0 };
  let lastFrame = 0;

  function syncButton() {
    button.setAttribute('aria-label', paused ? 'Play animation' : 'Pause animation');
    button.setAttribute('aria-pressed', String(paused));
    button.innerHTML = icon(paused ? 'play' : 'pause');
  }

  function render(timestamp = 0, force = false) {
    if (!force && timestamp - lastFrame < 32) return;
    lastFrame = timestamp;
    context.clearRect(0, 0, width, height);
    const light = document.documentElement.dataset.theme === 'light';
    const radius = Math.min(width * .365, height * .405);
    smoothPointer.x += (pointer.x - smoothPointer.x) * .045;
    smoothPointer.y += (pointer.y - smoothPointer.y) * .045;
    const a = angle + smoothPointer.x * .28;
    const tilt = -.22 + smoothPointer.y * .2;
    const cosA = Math.cos(a), sinA = Math.sin(a), cosTilt = Math.cos(tilt), sinTilt = Math.sin(tilt);
    const projected = points.map(point => {
      const rx = point.x * cosA - point.z * sinA;
      const rz = point.x * sinA + point.z * cosA;
      const ry = point.y * cosTilt - rz * sinTilt;
      const z = point.y * sinTilt + rz * cosTilt;
      const perspective = 3.8 / (3.8 - z * .33);
      return { x: width / 2 + rx * radius * perspective, y: height / 2 + ry * radius * perspective, z, size: point.size * perspective };
    }).sort((left, right) => left.z - right.z);

    projected.forEach(point => {
      const depth = (point.z + 1.15) / 2.3;
      const alpha = .14 + depth * .7;
      context.fillStyle = light ? `rgba(66, 95, 37, ${alpha})` : `rgba(${Math.round(150 + depth * 65)}, ${Math.round(172 + depth * 65)}, ${Math.round(107 + depth * 37)}, ${alpha})`;
      context.beginPath();
      context.arc(point.x, point.y, point.size * (.6 + depth * .55), 0, Math.PI * 2);
      context.fill();
    });

    // Sparse connections at the front add structure without an expensive mesh.
    const foreground = projected.filter(point => point.z > .55);
    context.strokeStyle = light ? 'rgba(66,95,37,.11)' : 'rgba(209,238,156,.13)';
    context.lineWidth = .6;
    for (let index = 0; index < foreground.length - 1; index += 8) {
      const point = foreground[index];
      const next = foreground[index + 1];
      if (Math.hypot(point.x - next.x, point.y - next.y) < radius * .32) {
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(next.x, next.y);
        context.stroke();
      }
    }
    if (!paused) angle += .004;
  }

  function tick(timestamp) {
    render(timestamp);
    animationId = requestAnimationFrame(tick);
  }
  function updateAnimation() {
    cancelAnimationFrame(animationId);
    render(0, true);
    if (!paused && visible && !document.hidden) animationId = requestAnimationFrame(tick);
  }
  function resize() {
    width = stage.clientWidth;
    height = stage.clientHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    render(0, true);
  }

  new ResizeObserver(resize).observe(stage);
  new MutationObserver(() => render(0, true)).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    updateAnimation();
  }, { threshold: .05 }).observe(canvas);
  stage.addEventListener('pointermove', event => {
    if (paused || event.pointerType === 'touch') return;
    const rect = stage.getBoundingClientRect();
    pointer = { x: (event.clientX - rect.left) / rect.width - .5, y: (event.clientY - rect.top) / rect.height - .5 };
  });
  stage.addEventListener('pointerleave', () => { pointer = { x: 0, y: 0 }; });
  button.addEventListener('click', () => { paused = !paused; syncButton(); updateAnimation(); });
  motionPreference.addEventListener('change', event => { paused = event.matches; syncButton(); updateAnimation(); });
  document.addEventListener('visibilitychange', updateAnimation);
  syncButton();
  resize();
  updateAnimation();
}

createNeuralField();
