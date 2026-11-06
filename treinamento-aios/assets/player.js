"use strict";
(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const stage = document.getElementById('stage');
  const panel = document.getElementById('presenter');
  const data = document.getElementById('notes-data');
  const viewport = document.getElementById('viewport');
  const prev = document.getElementById('slide-prev'), next = document.getElementById('slide-next');
  if (document.documentElement.lang.toLowerCase().startsWith('pt')) {
    document.getElementById('slide-nav').setAttribute('aria-label', 'Navegação dos slides');
    prev.setAttribute('aria-label', 'Slide anterior');
    next.setAttribute('aria-label', 'Próximo slide');
  }
  const notes = data ? JSON.parse(data.textContent) : [];
  let index = 0, start = Date.now();
  function fit() { stage.style.transform = `scale(${Math.min(innerWidth / 1920, innerHeight / 1080)})`; }
  function show(targetIndex) {
    index = Math.max(0, Math.min(slides.length - 1, targetIndex));
    slides.forEach((slide, n) => { slide.classList.toggle('active', n === index); slide.setAttribute('aria-hidden', String(n !== index)); });
    prev.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    if (document.activeElement === prev && prev.disabled) next.focus();
    if (document.activeElement === next && next.disabled) prev.focus();
    if (panel) document.getElementById('notes').textContent = notes[index] || '';
  }
  window.addEventListener('resize', fit);
  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  let wheelLocked = false, wheelTimer;
  document.addEventListener('wheel', event => {
    if (event.ctrlKey || event.target.closest('#presenter, #help, video, audio') || !event.deltaY || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
    event.preventDefault();
    if (!wheelLocked) { show(index + (event.deltaY > 0 ? 1 : -1)); wheelLocked = true; }
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { wheelLocked = false; }, 300);
  }, { passive: false });
  let touchStart = null;
  viewport.addEventListener('touchstart', event => {
    if (event.touches.length !== 1 || event.target.closest('a, button, input, textarea, select, video, audio, [contenteditable]')) { touchStart = null; return; }
    touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });
  viewport.addEventListener('touchend', event => {
    if (!touchStart || event.changedTouches.length !== 1) { touchStart = null; return; }
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.3) show(index + (dx < 0 ? 1 : -1));
  }, { passive: true });
  viewport.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
  document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.target.isContentEditable) return;
    const key = event.key.toLowerCase();
    if (key === ' ' && event.target.closest('button, a, video, audio')) return;
    if (['arrowright','arrowdown','pagedown',' '].includes(key)) show(index + 1);
    else if (['arrowleft','arrowup','pageup'].includes(key)) show(index - 1);
    else if (key === 'home') show(0);
    else if (key === 'end') show(slides.length - 1);
    else if (key === 's' && panel) panel.hidden = !panel.hidden;
    else if (key === 't') start = Date.now();
    else if (key === '?') { const help = document.getElementById('help'); help.hidden = !help.hidden; }
    else if (key === 'f') {
      const action = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
      action.catch(() => { document.getElementById('help').hidden = false; });
    } else if (key === 'p') window.print();
    else return;
    event.preventDefault();
  });
  setInterval(() => {
    if (!panel) return;
    const seconds = Math.floor((Date.now() - start) / 1000);
    document.getElementById('timer').textContent = `${String(Math.floor(seconds / 60)).padStart(2,'0')}:${String(seconds % 60).padStart(2,'0')}`;
  }, 250);
  fit(); show(0);
})();
