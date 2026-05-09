const baseIngredientsDirectory = [
  ['греческий йогурт', 59, 10, 0.4, 3.6, 0, 0.1],
  ['куриная грудка', 165, 31, 3.6, 0, 0, 1],
  ['творог', 121, 17, 5, 3, 0, 0.3],
  ['яйцо', 143, 12.6, 9.5, 0.7, 0, 1.8],
  ['гречка', 343, 13.3, 3.4, 71.5, 10, 2.2],
  ['овсянка', 389, 16.9, 6.9, 66.3, 10.6, 4.7],
  ['нут', 364, 19.3, 6, 60.7, 17.4, 6.2],
  ['чечевица', 352, 24.6, 1.1, 63.4, 10.7, 6.5],
  ['фасоль', 333, 23.4, 0.8, 60.3, 15.2, 8.2],
  ['шпинат', 23, 2.9, 0.4, 3.6, 2.2, 2.7],
  ['тофу', 76, 8.1, 4.8, 1.9, 0.3, 5.4],
  ['брокколи', 34, 2.8, 0.4, 6.6, 2.6, 0.7],
  ['авокадо', 160, 2, 14.7, 8.5, 6.7, 0.6],
  ['миндаль', 579, 21.2, 49.9, 21.6, 12.5, 3.7],
  ['семена чиа', 486, 16.5, 30.7, 42.1, 34.4, 7.7],
  ['кунжут', 573, 17.7, 49.7, 23.4, 11.8, 14.6],
  ['лосось', 208, 20.4, 13.4, 0, 0, 0.3],
  ['тунец', 132, 28, 1.3, 0, 0, 1.3],
  ['индейка', 135, 29, 1.7, 0, 0, 1.2],
  ['говядина', 217, 26.1, 11.8, 0, 0, 2.6],
  ['рис', 365, 7.1, 0.7, 80, 1.3, 0.8],
  ['картофель', 77, 2, 0.1, 17.5, 2.2, 0.8],
  ['морковь', 41, 0.9, 0.2, 9.6, 2.8, 0.3],
  ['свекла', 43, 1.6, 0.2, 9.6, 2.8, 0.8],
  ['огурец', 15, 0.7, 0.1, 3.6, 0.5, 0.3],
  ['томаты', 18, 0.9, 0.2, 3.9, 1.2, 0.3]
].map(([name, calories, protein, fat, carbs, fiber, iron]) => ({ name, calories, protein, fat, carbs, fiber, iron }));

const ingredientsStorageKey = 'custom-ingredients-directory-v1';

function loadCustomIngredients() {
  try {
    return JSON.parse(localStorage.getItem(ingredientsStorageKey) || '[]');
  } catch {
    return [];
  }
}

function saveCustomIngredients(items) {
  localStorage.setItem(ingredientsStorageKey, JSON.stringify(items));
}

function getAllIngredients() {
  const byName = new Map();
  [...baseIngredientsDirectory, ...loadCustomIngredients()].forEach((item) => {
    byName.set(String(item.name || '').toLowerCase(), item);
  });
  return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}

function isIngredientsTabActive() {
  return Array.from(document.querySelectorAll('.tabs button, .home-tile-menu button')).some((button) => {
    const label = (button.getAttribute('aria-label') || button.textContent || '').trim().toLowerCase();
    return button.classList.contains('active') && (label === 'продукты' || label === 'ингредиенты' || label === 'ингридиенты');
  });
}

function renameProductsTab() {
  document.querySelectorAll('.tabs button, .home-tile-menu button').forEach((button) => {
    const label = (button.getAttribute('aria-label') || button.textContent || '').trim().toLowerCase();
    if (label === 'продукты') {
      button.setAttribute('aria-label', 'Ингредиенты');
      button.setAttribute('title', 'Ингредиенты');
      const span = button.querySelector('span');
      if (span) span.textContent = 'Ингредиенты';
    }
  });
}

function addIngredientsStyle() {
  if (document.getElementById('ingredients-directory-style')) return;
  const style = document.createElement('style');
  style.id = 'ingredients-directory-style';
  style.textContent = '.ingredients-directory-panel{background:rgba(255,253,248,.94);border:1px solid var(--line,#ddd7cd);border-radius:28px;padding:18px;box-shadow:0 12px 28px rgba(38,56,43,.08)}.ingredients-directory-panel h2{text-align:center;margin:0 0 8px;color:var(--primary-dark,#26382b)}.ingredients-directory-panel p{text-align:center;color:var(--muted-ink,#6f7068);margin:0 0 14px}.ingredients-form{display:grid;grid-template-columns:1.4fr repeat(6,.7fr) auto;gap:8px;margin:12px 0}.ingredients-form input{min-width:0;background:#f2eee6;border:0;border-radius:12px;padding:10px}.ingredients-form button{border:0;border-radius:12px;background:var(--primary,#8d9983);color:white;font-weight:800;padding:10px 12px}.ingredients-table{display:grid;gap:6px}.ingredients-row{display:grid;grid-template-columns:1.4fr repeat(6,.7fr);gap:6px;align-items:center;background:#fffdf8;border:1px solid var(--line,#ddd7cd);border-radius:14px;padding:8px 10px;font-size:12px}.ingredients-row.header{font-weight:900;background:#eef2ea}.ingredients-row strong{color:#26382b}.ingredients-row span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}@media(max-width:760px){.ingredients-form{grid-template-columns:1fr 1fr}.ingredients-form input:first-child{grid-column:1/-1}.ingredients-form button{grid-column:1/-1}.ingredients-table{overflow:auto}.ingredients-row{min-width:720px}}';
  document.head.appendChild(style);
}

function createInput(placeholder, type = 'number') {
  const input = document.createElement('input');
  input.placeholder = placeholder;
  input.type = type;
  if (type === 'number') input.step = '0.1';
  return input;
}

function renderIngredientsDirectory() {
  renameProductsTab();
  addIngredientsStyle();

  let panel = document.getElementById('ingredients-directory-panel');
  if (!isIngredientsTabActive()) {
    if (panel) panel.style.display = 'none';
    return;
  }

  const container = document.querySelector('.container');
  if (!container) return;

  if (!panel) {
    panel = document.createElement('section');
    panel.id = 'ingredients-directory-panel';
    panel.className = 'ingredients-directory-panel section';
    container.appendChild(panel);
  }

  panel.style.display = 'block';
  panel.textContent = '';

  const title = document.createElement('h2');
  title.textContent = 'Ингредиенты';
  const subtitle = document.createElement('p');
  subtitle.textContent = 'Справочник продуктов на 100 г: КБЖУ, клетчатка и железо. Можно добавить новый ингредиент вручную.';
  panel.append(title, subtitle);

  const form = document.createElement('form');
  form.className = 'ingredients-form';
  const nameInput = createInput('Название', 'text');
  const caloriesInput = createInput('ккал');
  const proteinInput = createInput('белки');
  const fatInput = createInput('жиры');
  const carbsInput = createInput('углеводы');
  const fiberInput = createInput('клетчатка');
  const ironInput = createInput('железо');
  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = 'Добавить';
  form.append(nameInput, caloriesInput, proteinInput, fatInput, carbsInput, fiberInput, ironInput, button);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    if (!name) return;
    const next = loadCustomIngredients().filter((item) => item.name.toLowerCase() !== name.toLowerCase());
    next.push({ name, calories: Number(caloriesInput.value) || 0, protein: Number(proteinInput.value) || 0, fat: Number(fatInput.value) || 0, carbs: Number(carbsInput.value) || 0, fiber: Number(fiberInput.value) || 0, iron: Number(ironInput.value) || 0 });
    saveCustomIngredients(next);
    renderIngredientsDirectory();
  });

  panel.appendChild(form);

  const table = document.createElement('div');
  table.className = 'ingredients-table';
  const header = document.createElement('div');
  header.className = 'ingredients-row header';
  ['Ингредиент', 'ккал', 'Б', 'Ж', 'У', 'Клетч.', 'Fe'].forEach((text) => {
    const item = document.createElement('span');
    item.textContent = text;
    header.appendChild(item);
  });
  table.appendChild(header);

  getAllIngredients().forEach((item) => {
    const row = document.createElement('div');
    row.className = 'ingredients-row';
    const name = document.createElement('strong');
    name.textContent = item.name;
    row.appendChild(name);
    [item.calories, item.protein, item.fat, item.carbs, item.fiber, item.iron].forEach((value) => {
      const cell = document.createElement('span');
      cell.textContent = String(value ?? 0);
      row.appendChild(cell);
    });
    table.appendChild(row);
  });

  panel.appendChild(table);
}

window.addEventListener('load', () => {
  renderIngredientsDirectory();
  document.addEventListener('click', () => setTimeout(renderIngredientsDirectory, 80));
  setInterval(renderIngredientsDirectory, 1200);
});
