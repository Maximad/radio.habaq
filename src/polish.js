import './polish.css';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setupPolish() {
  const header = document.querySelector('.site-header');
  const title = document.querySelector('[data-title]');
  const artist = document.querySelector('[data-artist]');
  const cover = document.querySelector('[data-cover]');
  const dock = document.querySelector('[data-player-dock]');
  const play = document.querySelector('[data-play]');
  const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];

  if (!header || !title || !play) {
    window.setTimeout(setupPolish, 0);
    return;
  }

  document.body.classList.add('ui-polished');
  title.setAttribute('aria-live', 'polite');
  artist?.setAttribute('aria-live', 'polite');
  dock?.setAttribute('role', 'region');
  dock?.setAttribute('aria-label', 'مشغل راديو حبق');

  const updateHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute('href')?.slice(1);
      const section = id ? document.getElementById(id) : null;
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        navLinks.forEach((link) => link.classList.remove('is-active'));
        const current = sections.find(({ section }) => section === visible.target);
        current?.link.classList.add('is-active');
      },
      {
        rootMargin: '-28% 0px -54% 0px',
        threshold: [0, 0.1, 0.3, 0.6],
      },
    );

    sections.forEach(({ section }) => observer.observe(section));
  }

  if (!prefersReducedMotion) {
    let previousTitle = title.textContent;
    const titleObserver = new MutationObserver(() => {
      const nextTitle = title.textContent;
      if (!nextTitle || nextTitle === previousTitle) return;
      previousTitle = nextTitle;
      title.animate(
        [
          { opacity: 0.35, transform: 'translateY(10px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 420, easing: 'cubic-bezier(.2,.75,.2,1)' },
      );
      artist?.animate(
        [
          { opacity: 0.35, transform: 'translateY(6px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 480, easing: 'cubic-bezier(.2,.75,.2,1)' },
      );
    });
    titleObserver.observe(title, { childList: true, characterData: true, subtree: true });

    let previousArtwork = cover?.style.backgroundImage || '';
    if (cover) {
      const coverObserver = new MutationObserver(() => {
        const nextArtwork = cover.style.backgroundImage || '';
        if (nextArtwork === previousArtwork) return;
        previousArtwork = nextArtwork;
        cover.animate(
          [
            { opacity: 0.62, transform: 'scale(.985)' },
            { opacity: 1, transform: 'scale(1)' },
          ],
          { duration: 520, easing: 'cubic-bezier(.2,.75,.2,1)' },
        );
      });
      coverObserver.observe(cover, { attributes: true, attributeFilter: ['style'] });
    }
  }

  document.addEventListener('keydown', (event) => {
    if (event.code !== 'Space' || event.altKey || event.ctrlKey || event.metaKey) return;

    const target = event.target;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLButtonElement ||
      target instanceof HTMLAnchorElement ||
      target?.isContentEditable
    ) {
      return;
    }

    if (play.disabled) return;
    event.preventDefault();
    play.click();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupPolish, { once: true });
} else {
  setupPolish();
}
