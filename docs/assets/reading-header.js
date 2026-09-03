(() => {
  const app = document.getElementById('app');
  if (!app) return;

  const route = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const normalize = value => String(value || '').replace(/\s+/g, ' ').trim().toLocaleLowerCase('pt-BR');

  function restore() {
    document.querySelectorAll('[data-reading-header-hidden="true"]').forEach(node => {
      node.hidden = false;
      delete node.dataset.readingHeaderHidden;
    });
  }

  function dedupe() {
    const parts = route();
    if (parts[0] !== 'chapter') {
      restore();
      return;
    }

    const hero = document.querySelector('.chapter-hero');
    const main = document.querySelector('.chapter-layout main');
    const lead = hero?.querySelector('.lead');
    if (!hero || !main || !lead) return;

    const teachingLead = main.querySelector('.clarity-intro, .source-lead, .source-reading-text p');
    const heroText = normalize(lead.textContent);
    const teachingText = normalize(teachingLead?.textContent);
    const sameOpening = heroText && teachingText && (
      heroText === teachingText ||
      teachingText.startsWith(heroText) ||
      heroText.startsWith(teachingText)
    );

    if (sameOpening || main.dataset.clarityLesson) {
      lead.hidden = true;
      lead.dataset.readingHeaderHidden = 'true';
      hero.classList.add('chapter-hero-clean');
    }
  }

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      dedupe();
    });
  };

  addEventListener('hashchange', schedule);
  addEventListener('load', schedule);
  new MutationObserver(schedule).observe(app, { childList: true, subtree: true });
  schedule();
})();
