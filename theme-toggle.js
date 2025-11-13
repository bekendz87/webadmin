
// Simple theme toggle for vanilla JS or React useEffect
(function() {
  const root = document.documentElement;
  const THEME_KEY = 'liquid-glass-theme';

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  function getTheme() {
    return localStorage.getItem(THEME_KEY) || 'light';
  }

  // On load
  setTheme(getTheme());

  // Attach to toggle button (add class 'theme-toggle-btn' to your button)
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.querySelector('.theme-toggle-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const current = getTheme();
      setTheme(current === 'light' ? 'dark' : 'light');
      btn.innerHTML = current === 'light' ? '☀️' : '🌙';
    });
    // Set icon on load
    btn.innerHTML = getTheme() === 'light' ? '🌙' : '☀️';
  });
})();
