const siteHeader = document.querySelector('.top');
const menuToggle = siteHeader?.querySelector('.menu-toggle');
const siteNav = siteHeader?.querySelector('#site-nav');

if (siteHeader && menuToggle && siteNav) {
  const mobileLayout = window.matchMedia('(max-width: 700px)');

  function setMenuOpen(open) {
    siteHeader.dataset.menuOpen = String(open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute(
      'aria-label',
      open ? 'Close navigation menu' : 'Open navigation menu'
    );
    siteNav.inert = mobileLayout.matches && !open;
  }

  setMenuOpen(false);

  menuToggle.addEventListener('click', () => {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  siteNav.addEventListener('click', event => {
    if (event.target.closest('a')) setMenuOpen(false);
  });

  document.addEventListener('click', event => {
    if (!siteHeader.contains(event.target)) setMenuOpen(false);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  mobileLayout.addEventListener('change', () => setMenuOpen(false));
}
