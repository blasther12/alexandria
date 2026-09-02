(() => {
  const key = 'alexandria-theme-v1';
  const saved = localStorage.getItem(key);
  const preferred = saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  document.documentElement.dataset.theme = preferred;

  addEventListener('DOMContentLoaded', () => {
    document.documentElement.dataset.theme = preferred;
    localStorage.setItem(key, preferred);
    const button = document.getElementById('themeToggle');
    if (button) button.textContent = preferred === 'dark' ? '☀ Claro' : '☾ Escuro';
  });
})();
