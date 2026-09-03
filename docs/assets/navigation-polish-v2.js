(() => {
  const nav = document.getElementById('topNav');
  const menu = document.getElementById('menuButton');
  const themeToggle = document.getElementById('themeToggle');
  const switcher = document.querySelector('.space-switcher');
  if (!nav || !menu) return;

  const syncThemeLabel = () => {
    if (!themeToggle) return;
    const dark = document.documentElement.dataset.theme === 'dark';
    themeToggle.textContent = dark ? 'Usar tema claro' : 'Usar tema escuro';
    themeToggle.setAttribute('aria-label', themeToggle.textContent);
  };

  const closeMenu = () => {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    if (switcher) switcher.open = false;
  };

  menu.setAttribute('aria-expanded', 'false');
  menu.addEventListener('click', () => {
    requestAnimationFrame(() => {
      menu.setAttribute('aria-expanded', String(nav.classList.contains('open')));
    });
  });

  nav.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', event => {
    if (!event.target.closest('.topbar')) closeMenu();
  });

  addEventListener('resize', () => {
    if (innerWidth > 1400) closeMenu();
  });

  new MutationObserver(syncThemeLabel).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  syncThemeLabel();
})();
