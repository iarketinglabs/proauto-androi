"use strict";
(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const stage = document.getElementById('stage');
  const panel = document.getElementById('presenter');
  const data = document.getElementById('notes-data');
  const notes = data ? JSON.parse(data.textContent) : [];
  let index = 0, start = Date.now();
  function fit() { stage.style.transform = `scale(${Math.min(innerWidth / 1920, innerHeight / 1080)})`; }
  function show(next) {
    index = Math.max(0, Math.min(slides.length - 1, next));
    slides.forEach((slide, n) => { slide.classList.toggle('active', n === index); slide.setAttribute('aria-hidden', String(n !== index)); });
    if (panel) document.getElementById('notes').textContent = notes[index] || '';
  }
  window.addEventListener('resize', fit);
  document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.target.isContentEditable) return;
    const key = event.key.toLowerCase();
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
