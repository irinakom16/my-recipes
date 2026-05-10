function lockIngredientsTitle() {
  document.querySelectorAll('.tabs button, .home-tile-menu button').forEach((button) => {
    const raw = (button.getAttribute('aria-label') || button.textContent || '').trim().toLowerCase();
    const normalized = raw.replace(/\s+/g, ' ');

    if (normalized === 'продукты' || normalized === 'ингредиенты' || normalized === 'ингридиенты') {
      button.setAttribute('aria-label', 'Ингредиенты');
      button.setAttribute('title', 'Ингредиенты');
      button.dataset.ingredientsTab = '1';

      const span = button.querySelector('span');
      if (span && span.textContent.trim() !== 'Ингредиенты') {
        span.textContent = 'Ингредиенты';
      }

      const textNodes = Array.from(button.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE);
      textNodes.forEach((node) => {
        if (node.textContent.trim()) node.textContent = '';
      });
    }
  });
}

window.addEventListener('load', () => {
  lockIngredientsTitle();

  document.addEventListener('click', () => {
    setTimeout(lockIngredientsTitle, 0);
    setTimeout(lockIngredientsTitle, 80);
    setTimeout(lockIngredientsTitle, 250);
  });

  const observer = new MutationObserver(() => {
    window.requestAnimationFrame(lockIngredientsTitle);
  });

  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
});
