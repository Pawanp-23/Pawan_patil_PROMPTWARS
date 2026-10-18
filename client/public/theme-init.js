/* global document, localStorage */
// Applies the saved theme before first paint so the page never flashes the wrong colours.
// Loaded as a tiny external file because the Content-Security-Policy forbids inline scripts.
(function () {
  try {
    var saved = localStorage.getItem('blindspot-theme');
    if (saved === 'light' || saved === 'dark') document.documentElement.dataset.theme = saved;
  } catch {
    // Storage blocked: fall back to the system theme.
  }
})();
