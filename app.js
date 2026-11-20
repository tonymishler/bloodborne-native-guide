const header = document.querySelector('[data-header]');
const navLinks = [...document.querySelectorAll('.site-nav a')];
const tabButtons = [...document.querySelectorAll('[data-tab]')];
const tabPanels = [...document.querySelectorAll('[data-panel]')];
const toast = document.querySelector('[data-toast]');

function setTab(name, moveFocus = false) {
  tabButtons.forEach((button) => {
    const active = button.dataset.tab === name;
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
    if (active && moveFocus) button.focus();
  });

  tabPanels.forEach((panel) => {
    panel.hidden = panel.dataset.panel !== name;
  });
}

tabButtons.forEach((button, index) => {
  button.addEventListener('click', () => setTab(button.dataset.tab));
  button.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % tabButtons.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabButtons.length) % tabButtons.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabButtons.length - 1;
    setTab(tabButtons[next].dataset.tab, true);
  });
});

document.querySelectorAll('[data-tab-jump]').forEach((link) => {
  link.addEventListener('click', () => setTab(link.dataset.tabJump));
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 1800);
}

document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    const code = button.parentElement.querySelector('code')?.innerText ?? '';
    try {
      await navigator.clipboard.writeText(code);
      showToast('Command copied');
    } catch {
      showToast('Select the command and copy it');
    }
  });
});

function updateHeader() {
  header?.classList.toggle('scrolled', window.scrollY > 32);
}

const observedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${visible.target.id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-18% 0px -65%', threshold: [0, .2, .6] });
  observedSections.forEach((section) => sectionObserver.observe(section));
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

const hash = window.location.hash.slice(1);
if (['windows', 'macos', 'linux'].includes(hash)) setTab(hash);
