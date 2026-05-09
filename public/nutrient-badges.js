const nutrientBadgeTypes = [
  { key: 'protein', label: 'богат белком', icon: '💪' },
  { key: 'fiber', label: 'богат клетчаткой', icon: '🌿' },
  { key: 'iron', label: 'богат железом', icon: 'Fe' }
];

const nutrientProductDb = {
  'брокколи': { protein: 2.8, fiber: 2.6, iron: 0.7, calories: 34 },
  'рукола': { protein: 2.6, fiber: 1.6, iron: 1.5, calories: 25 },
  'свекла': { protein: 1.6, fiber: 2.8, iron: 0.8, calories: 43 },
  'огурец': { protein: 0.7, fiber: 0.5, iron: 0.3, calories: 15 },
  'апельсин': { protein: 0.9, fiber: 2.4, iron: 0.1, calories: 47 },
  'яйцо': { protein: 12.6, fiber: 0, iron: 1.8, calories: 143 },
  'яйца': { protein: 12.6, fiber: 0, iron: 1.8, calories: 143 },
  'сыр': { protein: 25, fiber: 0, iron: 0.7, calories: 402 },
  'томаты': { protein: 0.9, fiber: 1.2, iron: 0.3, calories: 18 },
  'молоко': { protein: 3.2, fiber: 0, iron: 0, calories: 61 },
  'курица': { protein: 31, fiber: 0, iron: 1, calories: 165 },
  'куриная грудка': { protein: 31, fiber: 0, iron: 1, calories: 165 },
  'филе курицы': { protein: 31, fiber: 0, iron: 1, calories: 165 },
  'рис': { protein: 7.1, fiber: 1.3, iron: 0.8, calories: 365 },
  'бурый рис': { protein: 7.9, fiber: 3.5, iron: 1.5, calories: 370 },
  'рис бурый': { protein: 7.9, fiber: 3.5, iron: 1.5, calories: 370 },
  'лук': { protein: 1.1, fiber: 1.7, iron: 0.2, calories: 40 },
  'морковь': { protein: 0.9, fiber: 2.8, iron: 0.3, calories: 41 },
  'паста': { protein: 13, fiber: 3.2, iron: 1.3, calories: 371 },
  'чеснок': { protein: 6.4, fiber: 2.1, iron: 1.7, calories: 149 },
  'овсянка': { protein: 16.9, fiber: 10.6, iron: 4.7, calories: 389 },
  'овсяные хлопья': { protein: 16.9, fiber: 10.6, iron: 4.7, calories: 389 },
  'гречка': { protein: 13.3, fiber: 10, iron: 2.2, calories: 343 },
  'гречневая крупа': { protein: 13.3, fiber: 10, iron: 2.2, calories: 343 },
  'киноа': { protein: 14.1, fiber: 7, iron: 4.6, calories: 368 },
  'булгур': { protein: 12.3, fiber: 12.5, iron: 2.5, calories: 342 },
  'перловка': { protein: 9.9, fiber: 15.6, iron: 2.5, calories: 352 },
  'картофель': { protein: 2, fiber: 2.2, iron: 0.8, calories: 77 },
  'батат': { protein: 1.6, fiber: 3, iron: 0.6, calories: 86 },
  'хлеб цельнозерновой': { protein: 13, fiber: 7, iron: 2.5, calories: 247 },
  'лаваш': { protein: 9.1, fiber: 2.2, iron: 2.6, calories: 275 },
  'индейка': { protein: 29, fiber: 0, iron: 1.2, calories: 135 },
  'говядина': { protein: 26.1, fiber: 0, iron: 2.6, calories: 217 },
  'тунец': { protein: 28, fiber: 0, iron: 1.3, calories: 132 },
  'лосось': { protein: 20.4, fiber: 0, iron: 0.3, calories: 208 },
  'семга': { protein: 20.4, fiber: 0, iron: 0.3, calories: 208 },
  'сёмга': { protein: 20.4, fiber: 0, iron: 0.3, calories: 208 },
  'треска': { protein: 17.8, fiber: 0, iron: 0.4, calories: 82 },
  'креветки': { protein: 24, fiber: 0, iron: 0.5, calories: 99 },
  'яичный белок': { protein: 10.9, fiber: 0, iron: 0.1, calories: 52 },
  'творог': { protein: 17, fiber: 0, iron: 0.3, calories: 121 },
  'творог обезжиренный': { protein: 16.5, fiber: 0, iron: 0.2, calories: 80 },
  'греческий йогурт': { protein: 10, fiber: 0, iron: 0.1, calories: 59 },
  'йогурт': { protein: 10, fiber: 0, iron: 0.1, calories: 59 },
  'кефир': { protein: 3.3, fiber: 0, iron: 0.1, calories: 52 },
  'тофу': { protein: 8.1, fiber: 0.3, iron: 5.4, calories: 76 },
  'шпинат': { protein: 2.9, fiber: 2.2, iron: 2.7, calories: 23 },
  'салат': { protein: 1.4, fiber: 1.3, iron: 0.9, calories: 15 },
  'капуста': { protein: 1.3, fiber: 2.5, iron: 0.5, calories: 25 },
  'цветная капуста': { protein: 1.9, fiber: 2, iron: 0.4, calories: 25 },
  'кабачок': { protein: 1.2, fiber: 1, iron: 0.4, calories: 17 },
  'баклажан': { protein: 1, fiber: 3, iron: 0.2, calories: 25 },
  'перец болгарский': { protein: 1, fiber: 2.1, iron: 0.4, calories: 31 },
  'шампиньоны': { protein: 3.1, fiber: 1, iron: 0.5, calories: 22 },
  'банан': { protein: 1.1, fiber: 2.6, iron: 0.3, calories: 89 },
  'яблоко': { protein: 0.3, fiber: 2.4, iron: 0.1, calories: 52 },
  'груша': { protein: 0.4, fiber: 3.1, iron: 0.2, calories: 57 },
  'клубника': { protein: 0.7, fiber: 2, iron: 0.4, calories: 32 },
  'черника': { protein: 0.7, fiber: 2.4, iron: 0.3, calories: 57 },
  'нут': { protein: 19.3, fiber: 17.4, iron: 6.2, calories: 364 },
  'чечевица': { protein: 24.6, fiber: 10.7, iron: 6.5, calories: 352 },
  'фасоль': { protein: 23.4, fiber: 15.2, iron: 8.2, calories: 333 },
  'авокадо': { protein: 2, fiber: 6.7, iron: 0.6, calories: 160 },
  'миндаль': { protein: 21.2, fiber: 12.5, iron: 3.7, calories: 579 },
  'грецкий орех': { protein: 15.2, fiber: 6.7, iron: 2.9, calories: 654 },
  'арахис': { protein: 25.8, fiber: 8.5, iron: 4.6, calories: 567 },
  'семена чиа': { protein: 16.5, fiber: 34.4, iron: 7.7, calories: 486 },
  'лен': { protein: 18.3, fiber: 27.3, iron: 5.7, calories: 534 },
  'лён': { protein: 18.3, fiber: 27.3, iron: 5.7, calories: 534 },
  'семена льна': { protein: 18.3, fiber: 27.3, iron: 5.7, calories: 534 },
  'кунжут': { protein: 17.7, fiber: 11.8, iron: 14.6, calories: 573 },
  'арахисовая паста': { protein: 25.1, fiber: 6, iron: 1.9, calories: 588 },
  'мед': { protein: 0.3, fiber: 0.2, iron: 0.4, calories: 304 },
  'мёд': { protein: 0.3, fiber: 0.2, iron: 0.4, calories: 304 }
};

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
}

function findNutritionForText(text) {
  const value = normalizeText(text);
  const entries = Object.entries(nutrientProductDb).sort((a, b) => b[0].length - a[0].length);
  return entries.find(([name]) => value.includes(normalizeText(name)))?.[1] || null;
}

function nutrientBadgesForNutrition(nutrition) {
  if (!nutrition) return [];

  const badges = [];
  const proteinCaloriesShare = nutrition.calories > 0 ? (nutrition.protein * 4) / nutrition.calories : 0;

  if (nutrition.protein >= 10 || (nutrition.protein >= 5 && proteinCaloriesShare >= 0.3)) {
    badges.push(nutrientBadgeTypes.find((item) => item.key === 'protein'));
  }

  if (nutrition.fiber >= 3) {
    badges.push(nutrientBadgeTypes.find((item) => item.key === 'fiber'));
  }

  if (nutrition.iron >= 2.1) {
    badges.push(nutrientBadgeTypes.find((item) => item.key === 'iron'));
  }

  return badges.filter(Boolean);
}

function nutrientBadgesForText(text) {
  return nutrientBadgesForNutrition(findNutritionForText(text));
}

function makeNutrientBadge(rule) {
  const badge = document.createElement('span');
  badge.className = 'runtime-nutrient-badge ' + rule.key;
  badge.title = rule.label;
  badge.setAttribute('aria-label', rule.label);

  const icon = document.createElement('b');
  icon.textContent = rule.icon;

  badge.appendChild(icon);
  return badge;
}

function makeNutrientBadgeList(rules, extraClass) {
  const box = document.createElement('span');
  box.className = 'runtime-nutrient-badges' + (extraClass ? ' ' + extraClass : '');
  rules.forEach((rule) => box.appendChild(makeNutrientBadge(rule)));
  return box;
}

function addNutrientBadgeStyle() {
  if (document.getElementById('nutrient-badges-style')) return;
  const style = document.createElement('style');
  style.id = 'nutrient-badges-style';
  style.textContent = '.runtime-nutrient-badges{display:inline-flex;flex-wrap:wrap;gap:4px;align-items:center;margin:4px 0 0}.runtime-nutrient-badges.recipe{justify-content:center;margin:8px 0 2px}.runtime-nutrient-badge{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;width:24px;height:24px;font-size:11px;font-weight:900;line-height:1;white-space:nowrap;border:1px solid rgba(38,56,43,.08)}.runtime-nutrient-badge b{display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:900}.runtime-nutrient-badge.protein{background:#EEF2EA;color:#26382B}.runtime-nutrient-badge.fiber{background:#E7F1DF;color:#52604F}.runtime-nutrient-badge.iron{background:#F1E6D6;color:#8B6A50}.recipe-ingredient-line .runtime-nutrient-badges{grid-column:1/-1}.tabs button[data-hidden-products-tab="1"]{display:none!important}';
  document.head.appendChild(style);
}

function hideProductsTab() {
  document.querySelectorAll('.tabs button, .home-tile-menu button').forEach((button) => {
    const text = button.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
    const aria = String(button.getAttribute('aria-label') || '').trim().toLowerCase();
    const title = String(button.getAttribute('title') || '').trim().toLowerCase();

    if (text === 'продукты' || aria === 'продукты' || title === 'продукты') {
      button.dataset.hiddenProductsTab = '1';
      button.hidden = true;
      button.style.setProperty('display', 'none', 'important');
    }
  });
}

function resetRuntimeBadges(scope) {
  scope.querySelectorAll('.runtime-nutrient-badges').forEach((item) => item.remove());
  scope.querySelectorAll('[data-nutrient-badges-ready]').forEach((item) => delete item.dataset.nutrientBadgesReady);
}

function enhanceNutrientBadges() {
  addNutrientBadgeStyle();
  hideProductsTab();

  document.querySelectorAll('.recipe-ingredient-line').forEach((button) => {
    if (button.dataset.nutrientBadgesReady === '1') return;
    const clone = button.cloneNode(true);
    clone.querySelectorAll('.runtime-nutrient-badges').forEach((item) => item.remove());
    const badges = nutrientBadgesForText(clone.textContent);
    if (badges.length) button.appendChild(makeNutrientBadgeList(badges, 'ingredient'));
    button.dataset.nutrientBadgesReady = '1';
  });

  document.querySelectorAll('.recipe-compact-page').forEach((card) => {
    const meta = card.querySelector('.recipe-compact-meta');
    if (!meta) return;
    const old = card.querySelector('.runtime-nutrient-badges.recipe');
    if (old) old.remove();
    const found = new Map();
    card.querySelectorAll('.recipe-ingredient-line').forEach((line) => {
      const clone = line.cloneNode(true);
      clone.querySelectorAll('.runtime-nutrient-badges').forEach((item) => item.remove());
      nutrientBadgesForText(clone.textContent).forEach((badge) => found.set(badge.key, badge));
    });
    const badges = Array.from(found.values());
    if (badges.length) meta.insertAdjacentElement('afterend', makeNutrientBadgeList(badges, 'recipe'));
  });
}

window.addEventListener('load', () => {
  resetRuntimeBadges(document);
  enhanceNutrientBadges();
  setInterval(enhanceNutrientBadges, 700);
});
