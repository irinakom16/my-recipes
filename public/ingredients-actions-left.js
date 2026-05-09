function moveIngredientActionsLeft() {
  document.querySelectorAll('.ingredients-row').forEach((row) => {
    const actions = row.querySelector('.ingredients-row-actions');

    if (actions) {
      const name = row.querySelector('strong');
      if (name && name.nextElementSibling !== actions) {
        name.insertAdjacentElement('afterend', actions);
      }
      return;
    }

    if (row.classList.contains('header')) {
      const cells = Array.from(row.children);
      const actionsHeader = cells.find((cell) => cell.textContent.trim().toLowerCase() === 'действия');
      const firstCell = cells[0];

      if (actionsHeader && firstCell && firstCell.nextElementSibling !== actionsHeader) {
        firstCell.insertAdjacentElement('afterend', actionsHeader);
      }
    }
  });
}

function addIngredientActionsLeftStyle() {
  if (document.getElementById('ingredients-actions-left-style')) return;

  const style = document.createElement('style');
  style.id = 'ingredients-actions-left-style';
  style.textContent = `
    .ingredients-row {
      grid-template-columns: 1.3fr 76px .9fr repeat(12, .58fr) !important;
      min-width: 1280px !important;
    }

    .ingredients-row-actions {
      display: flex !important;
      gap: 6px !important;
      justify-content: flex-start !important;
      align-items: center !important;
    }

    .ingredients-row-actions button {
      min-width: 30px !important;
      height: 30px !important;
      padding: 0 !important;
      border-radius: 10px !important;
      font-size: 15px !important;
    }

    @media (max-width: 760px) {
      .ingredients-row {
        grid-template-columns: 170px 74px 130px repeat(12, 72px) !important;
        min-width: 1250px !important;
      }
    }
  `;

  document.head.appendChild(style);
}

window.addEventListener('load', () => {
  addIngredientActionsLeftStyle();
  moveIngredientActionsLeft();

  document.addEventListener('click', () => {
    setTimeout(moveIngredientActionsLeft, 120);
  });

  const observer = new MutationObserver(() => {
    window.requestAnimationFrame(moveIngredientActionsLeft);
  });

  observer.observe(document.body, { childList: true, subtree: true });
});
