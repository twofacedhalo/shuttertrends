(() => {
  'use strict';
  const presets = window.shutterTrendThemes || [];
  if (!presets.length) return;
  const settings = window.shutterTrendConfig?.themes || {};
  const storageKey = 'shuttertrend-visual-theme';
  const find = id => presets.find(theme => theme.id === id);
  let saved;
  try { saved = localStorage.getItem(storageKey); } catch {}
  const initial = find(saved) || (settings.randomizeThemeOnLoad ? presets[Math.floor(Math.random() * presets.length)] : find(settings.defaultTheme)) || presets[0];
  const body = document.body;
  function apply(theme, persist = false) {
    if (!theme) return;
    window.shutterTrendActiveTheme = theme;
    body.dataset.stTheme = theme.id;
    const values = {
      '--wp--preset--color--accent':theme.accent, '--st-gold':theme.accent,
      '--st-viewfinder-color':theme.accent, '--st-film-mark-color':theme.accent,
      '--st-background-photo-opacity':theme.photo.opacity,
      '--hero-theme-photo-strength':theme.photo.opacity / .33,
      '--st-photo-solid-core':theme.photo.solidCore + '%', '--st-photo-feather-end':theme.photo.featherEnd + '%',
      '--st-photo-saturation':theme.photo.saturation, '--st-photo-sepia':theme.photo.sepia,
      '--st-spotlight-color':theme.spotlight.tint, '--st-spotlight-intensity':theme.spotlight.intensity,
      '--st-decor-leaf-inactive':theme.decorativeLeaves.inactive, '--st-decor-leaf-active':theme.decorativeLeaves.active,
      '--st-decor-leaf-glow':theme.decorativeLeaves.glow, '--st-decor-leaf-opacity':theme.decorativeLeaves.opacity,
      '--st-theme-grain':theme.grain, '--st-theme-leak':theme.lightLeak, '--st-theme-leak-color':theme.leakColor,
      '--st-atmosphere-shade':theme.shade,
      '--st-dust-color':theme.particles.color, '--st-dust-glow':theme.particles.glow, '--st-dust-strength':theme.particles.opacity
    };
    theme.gradient.forEach((stop,i) => { values['--st-theme-color-' + i] = stop.color; values['--st-theme-stop-' + i] = stop.at + '%'; });
    values['--st-theme-gradient'] = 'linear-gradient(to bottom, ' + theme.gradient.map((stop,i) => 'var(--st-theme-color-' + i + ') var(--st-theme-stop-' + i + ')').join(', ') + ')';
    Object.entries(values).forEach(([key,value]) => body.style.setProperty(key,value));
    if (persist) { try { localStorage.setItem(storageKey,theme.id); } catch {} }
    document.dispatchEvent(new CustomEvent('st-theme-change', { detail:theme }));
  }
  apply(initial);
  if (body.classList.contains('home')) {
    const atmosphere = document.createElement('div'); atmosphere.className = 'st-theme-atmosphere';
    atmosphere.setAttribute('aria-hidden','true'); atmosphere.inert = true; body.append(atmosphere);
  }
  if (settings.allowVisitorThemeSelection === false) return;
  const control = document.createElement('div'); control.className = 'st-theme-selector';
  const toggle = document.createElement('button'); toggle.type = 'button'; toggle.className = 'st-theme-toggle';
  toggle.textContent = '◐'; toggle.setAttribute('aria-label','Choose visual theme'); toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-controls','st-theme-panel');
  const panel = document.createElement('div'); panel.id = 'st-theme-panel'; panel.className = 'st-theme-panel'; panel.hidden = true;
  panel.setAttribute('role','group'); panel.setAttribute('aria-labelledby','st-theme-title');
  const title = document.createElement('h2'); title.id = 'st-theme-title'; title.textContent = 'Choose an atmosphere'; panel.append(title);
  const status = document.createElement('p'); status.className = 'st-theme-status'; status.setAttribute('role','status'); status.setAttribute('aria-live','polite');
  const buttons = presets.map(theme => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'st-theme-option';
    button.dataset.theme = theme.id;
    const preview = document.createElement('span'); preview.className = 'st-theme-swatch'; preview.setAttribute('aria-hidden','true');
    preview.style.background = 'linear-gradient(135deg,' + theme.gradient.map(stop => stop.color).join(',') + ')';
    const label = document.createElement('span'); label.textContent = theme.name; button.append(preview,label);
    button.addEventListener('click', () => { apply(theme,true); update(); status.textContent = theme.name + ' applied'; close(true); });
    panel.append(button); return button;
  });
  function update() {
    buttons.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.theme === body.dataset.stTheme)));
    toggle.title = 'Theme: ' + window.shutterTrendActiveTheme.name;
  }
  function close(returnFocus = false) {
    panel.hidden = true; toggle.setAttribute('aria-expanded','false'); if (returnFocus) toggle.focus();
  }
  toggle.addEventListener('click', () => {
    if (!panel.hidden) { close(); return; }
    panel.hidden = false; toggle.setAttribute('aria-expanded','true');
    buttons.find(button => button.dataset.theme === body.dataset.stTheme)?.focus();
  });
  control.addEventListener('keydown',event => { if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); close(true); } });
  document.addEventListener('pointerdown',event => { if (!control.contains(event.target)) close(); });
  control.append(panel,toggle,status); body.append(control); update();
})();
