const nutrientBadgeTypes = [
  { key: 'protein', label: 'богат белком', icon: '💪' },
  { key: 'fiber', label: 'богат клетчаткой', icon: '🌿' },
  { key: 'iron', label: 'богат железом', icon: 'Fe' }
];

// nutrition db unchanged above in real file

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
  style.textContent = '.runtime-nutrient-badges{display:inline-flex;flex-wrap:wrap;gap:4px;align-items:center;margin:4px 0 0}.runtime-nutrient-badge{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;width:24px;height:24px;font-size:11px;font-weight:900;border:1px solid rgba(38,56,43,.08)}.runtime-nutrient-badge.protein{background:#EEF2EA;color:#26382B}.runtime-nutrient-badge.fiber{background:#E7F1DF;color:#52604F}.runtime-nutrient-badge.iron{background:#F1E6D6;color:#8B6A50}';
  document.head.appendChild(style);
}

function resetRuntimeBadges(scope) {
  scope.querySelectorAll('.runtime-nutrient-badges').forEach((item) => item.remove());
  scope.querySelectorAll('[data-nutrient-badges-ready]').forEach((item) => delete item.dataset.nutrientBadgesReady);
}

function enhanceNutrientBadges() {
  addNutrientBadgeStyle();

  document.querySelectorAll('.recipe-ingredient-line').forEach((button) => {
    if (button.dataset.nutrientBadgesReady === '1') return;

    const clone = button.cloneNode(true);
    clone.querySelectorAll('.runtime-nutrient-badges').forEach((item) => item.remove());

    const badges = nutrientBadgesForText(clone.textContent);

    if (badges.length) {
      button.appendChild(makeNutrientBadgeList(badges, 'ingredient'));
    }

    button.dataset.nutrientBadgesReady = '1';
  });
}

window.addEventListener('load', () => {
  resetRuntimeBadges(document);
  enhanceNutrientBadges();
  setInterval(enhanceNutrientBadges, 1000);
});
