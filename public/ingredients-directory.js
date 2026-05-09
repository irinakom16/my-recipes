const baseIngredientsDirectory = [
  ['греческий йогурт', 59, 10, 0.4, 3.6, 0, 0.1, 110, 141, 11, 0, 2, 7],
  ['куриная грудка', 165, 31, 3.6, 0, 0, 1, 15, 256, 29, 0, 6, 4],
  ['творог', 121, 17, 5, 3, 0, 0.3, 120, 112, 23, 0, 50, 12],
  ['яйцо', 143, 12.6, 9.5, 0.7, 0, 1.8, 56, 138, 12, 0, 160, 47],
  ['гречка', 343, 13.3, 3.4, 71.5, 10, 2.2, 18, 460, 231, 0, 0, 30],
  ['овсянка', 389, 16.9, 6.9, 66.3, 10.6, 4.7, 54, 429, 177, 0, 0, 56],
  ['нут', 364, 19.3, 6, 60.7, 17.4, 6.2, 105, 875, 115, 4, 3, 557],
  ['чечевица', 352, 24.6, 1.1, 63.4, 10.7, 6.5, 35, 677, 47, 4.5, 2, 479],
  ['фасоль', 333, 23.4, 0.8, 60.3, 15.2, 8.2, 143, 1406, 140, 4.5, 0, 394],
  ['шпинат', 23, 2.9, 0.4, 3.6, 2.2, 2.7, 99, 558, 79, 28.1, 469, 194],
  ['тофу', 76, 8.1, 4.8, 1.9, 0.3, 5.4, 350, 121, 30, 0.1, 0, 15],
  ['брокколи', 34, 2.8, 0.4, 6.6, 2.6, 0.7, 47, 316, 21, 89.2, 31, 63],
  ['авокадо', 160, 2, 14.7, 8.5, 6.7, 0.6, 12, 485, 29, 10, 7, 81],
  ['миндаль', 579, 21.2, 49.9, 21.6, 12.5, 3.7, 269, 733, 270, 0, 0, 44],
  ['семена чиа', 486, 16.5, 30.7, 42.1, 34.4, 7.7, 631, 407, 335, 1.6, 3, 49],
  ['кунжут', 573, 17.7, 49.7, 23.4, 11.8, 14.6, 975, 468, 351, 0, 0, 97],
  ['лосось', 208, 20.4, 13.4, 0, 0, 0.3, 9, 363, 27, 3.9, 58, 25],
  ['тунец', 132, 28, 1.3, 0, 0, 1.3, 37, 522, 50, 0, 20, 2],
  ['индейка', 135, 29, 1.7, 0, 0, 1.2, 11, 239, 30, 0, 0, 7],
  ['говядина', 217, 26.1, 11.8, 0, 0, 2.6, 18, 318, 21, 0, 0, 9],
  ['рис', 365, 7.1, 0.7, 80, 1.3, 0.8, 28, 115, 25, 0, 0, 8],
  ['картофель', 77, 2, 0.1, 17.5, 2.2, 0.8, 12, 425, 23, 19.7, 0, 15],
  ['морковь', 41, 0.9, 0.2, 9.6, 2.8, 0.3, 33, 320, 12, 5.9, 835, 19],
  ['свекла', 43, 1.6, 0.2, 9.6, 2.8, 0.8, 16, 325, 23, 4.9, 2, 109],
  ['огурец', 15, 0.7, 0.1, 3.6, 0.5, 0.3, 16, 147, 13, 2.8, 5, 7],
  ['томаты', 18, 0.9, 0.2, 3.9, 1.2, 0.3, 10, 237, 11, 13.7, 42, 15]
].map(([name, calories, protein, fat, carbs, fiber, iron, calcium, potassium, magnesium, vitaminC, vitaminA, folate]) => ({ name, calories, protein, fat, carbs, fiber, iron, calcium, potassium, magnesium, vitaminC, vitaminA, folate }));

const ingredientsStorageKey = 'custom-ingredients-directory-v1';

const ingredientFields = [
  ['calories', 'ккал'],
  ['protein', 'Б'],
  ['fat', 'Ж'],
  ['carbs', 'У'],
  ['fiber', 'Клетч.'],
  ['iron', 'Fe'],
  ['calcium', 'Ca'],
  ['potassium', 'K'],
  ['magnesium', 'Mg'],
  ['vitaminC', 'C'],
  ['vitaminA', 'A'],
  ['folate', 'B9']
];

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
  style.textContent = '.ingredients-directory-panel{background:rgba(255,253,248,.94);border:1px solid var(--line,#ddd7cd);border-radius:28px;padding:18px;box-shadow:0 12px 28px rgba(38,56,43,.08)}.ingredients-directory-panel h2{text-align:center;margin:0 0 8px;color:var(--primary-dark,#26382b)}.ingredients-directory-panel p{text-align:center;color:var(--muted-ink,#6f7068);margin:0 0 14px}.ingredients-form{display:grid;grid-template-columns:1.5fr repeat(4,.7fr);gap:8px;margin:12px 0}.ingredients-form input{min-width:0;background:#f2eee6;border:0;border-radius:12px;padding:10px}.ingredients-actions{display:flex;gap:8px;grid-column:1/-1}.ingredients-actions button{border:0;border-radius:12px;background:var(--primary,#8d9983);color:white;font-weight:800;padding:10px 12px;cursor:pointer}.ingredients-actions button.secondary{background:#eef2ea;color:#26382b}.ingredients-status{text-align:left!important;grid-column:1/-1;margin:0!important;font-size:12px}.ingredients-table{display:grid;gap:6px;overflow:auto}.ingredients-row{display:grid;grid-template-columns:1.4fr repeat(12,.62fr);gap:6px;align-items:center;background:#fffdf8;border:1px solid var(--line,#ddd7cd);border-radius:14px;padding:8px 10px;font-size:12px;min-width:1050px}.ingredients-row.header{font-weight:900;background:#eef2ea}.ingredients-row strong{color:#26382b}.ingredients-row span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}@media(max-width:760px){.ingredients-form{grid-template-columns:1fr 1fr}.ingredients-form input:first-child{grid-column:1/-1}.ingredients-table{overflow:auto}}';
  document.head.appendChild(style);
}

function createInput(placeholder, type = 'number') {
  const input = document.createElement('input');
  input.placeholder = placeholder;
  input.type = type;
  if (type === 'number') input.step = '0.1';
  return input;
}

function getNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Number(number.toFixed(2)) : 0;
}

function mapOpenFoodFactsProduct(product, fallbackName) {
  const n = product?.nutriments || {};
  return {
    name: product?.product_name || product?.generic_name || fallbackName,
    calories: getNumber(n['energy-kcal_100g'] ?? n['energy-kcal'] ?? 0),
    protein: getNumber(n['proteins_100g'] ?? 0),
    fat: getNumber(n['fat_100g'] ?? 0),
    carbs: getNumber(n['carbohydrates_100g'] ?? 0),
    fiber: getNumber(n['fiber_100g'] ?? 0),
    iron: getNumber((n['iron_100g'] ?? 0) * 1000),
    calcium: getNumber((n['calcium_100g'] ?? 0) * 1000),
    potassium: getNumber((n['potassium_100g'] ?? 0) * 1000),
    magnesium: getNumber((n['magnesium_100g'] ?? 0) * 1000),
    vitaminC: getNumber((n['vitamin-c_100g'] ?? 0) * 1000),
    vitaminA: getNumber((n['vitamin-a_100g'] ?? 0) * 1000000),
    folate: getNumber((n['folates_100g'] ?? n['folate_100g'] ?? 0) * 1000000)
  };
}

async function findIngredientNutrition(name) {
  const url = 'https://world.openfoodfacts.org/cgi/search.pl?search_terms=' + encodeURIComponent(name) + '&search_simple=1&action=process&json=1&page_size=8&fields=product_name,generic_name,nutriments';
  const response = await fetch(url);
  const data = await response.json();
  const product = (data.products || []).find((item) => {
    const n = item.nutriments || {};
    return item.product_name && (n['energy-kcal_100g'] || n['proteins_100g'] || n['fat_100g'] || n['carbohydrates_100g']);
  });
  return product ? mapOpenFoodFactsProduct(product, name) : null;
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
  subtitle.textContent = 'Справочник на 100 г. Введи название, нажми «Найти КБЖУ», затем проверь и сохрани.';
  panel.append(title, subtitle);

  const form = document.createElement('form');
  form.className = 'ingredients-form';
  const nameInput = createInput('Название', 'text');
  const inputs = {};
  ingredientFields.forEach(([key, label]) => {
    inputs[key] = createInput(label);
  });

  const status = document.createElement('p');
  status.className = 'ingredients-status';
  status.textContent = '';

  const actions = document.createElement('div');
  actions.className = 'ingredients-actions';
  const searchButton = document.createElement('button');
  searchButton.type = 'button';
  searchButton.className = 'secondary';
  searchButton.textContent = 'Найти КБЖУ';
  const saveButton = document.createElement('button');
  saveButton.type = 'submit';
  saveButton.textContent = 'Добавить ингредиент';
  actions.append(searchButton, saveButton);

  form.append(nameInput, ...Object.values(inputs).slice(0, 4), ...Object.values(inputs).slice(4), status, actions);

  searchButton.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    if (!name) {
      status.textContent = 'Сначала введи название ингредиента.';
      return;
    }
    status.textContent = 'Ищу данные в открытой базе...';
    searchButton.disabled = true;
    try {
      const found = await findIngredientNutrition(name);
      if (!found) {
        status.textContent = 'Не нашла данные. Можно заполнить вручную.';
        return;
      }
      nameInput.value = found.name || name;
      ingredientFields.forEach(([key]) => {
        inputs[key].value = found[key] ?? 0;
      });
      status.textContent = 'Данные найдены. Проверь значения и нажми «Добавить ингредиент».';
    } catch {
      status.textContent = 'Не удалось получить данные. Проверь интернет или заполни вручную.';
    } finally {
      searchButton.disabled = false;
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    if (!name) return;
    const next = loadCustomIngredients().filter((item) => item.name.toLowerCase() !== name.toLowerCase());
    const item = { name };
    ingredientFields.forEach(([key]) => {
      item[key] = Number(inputs[key].value) || 0;
    });
    next.push(item);
    saveCustomIngredients(next);
    renderIngredientsDirectory();
  });

  panel.appendChild(form);

  const table = document.createElement('div');
  table.className = 'ingredients-table';
  const header = document.createElement('div');
  header.className = 'ingredients-row header';
  ['Ингредиент', ...ingredientFields.map(([, label]) => label)].forEach((text) => {
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
    ingredientFields.forEach(([key]) => {
      const cell = document.createElement('span');
      cell.textContent = String(item[key] ?? 0);
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
