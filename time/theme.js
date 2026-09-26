// Apply the preference before first paint. Storage may be unavailable in private contexts.
(() => {
  let saved;
  try { saved = localStorage.getItem('soheil-time-theme'); } catch {}
  const dark = saved === 'dark' || (saved !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
})();
