const nutrientBadgeRules = [
  { key: 'protein', label: 'богат белком', icon: '💪', words: ['курица', 'индейка', 'говядина', 'тунец', 'лосось', 'семга', 'сёмга', 'треска', 'креветки', 'яйцо', 'творог', 'йогурт', 'тофу', 'чечевица', 'фасоль', 'нут', 'сыр'] },
  { key: 'fiber', label: 'богат клетчаткой', icon: '🌿', words: ['овсян', 'греч', 'киноа', 'булгур', 'перлов', 'чечевица', 'фасоль', 'нут', 'брокколи', 'капуста', 'свекла', 'шпинат', 'авокадо', 'миндаль', 'семена', 'чиа', 'лен', 'лён', 'яблоко', 'груша', 'черника'] },
  { key: 'iron', label: 'богат железом', icon: 'Fe', words: ['говядина', 'печень', 'чечевица', 'фасоль', 'нут', 'тофу', 'шпинат', 'кунжут', 'чиа', 'лен', 'лён', 'греч', 'киноа', 'овсян', 'яйцо'] }
];

function nutrientBadgesForText(text) {
  const value = String(text || '').toLowerCase();
  return nutrientBadgeRules.filter((rule) => rule.words.some((word) => value.includes(word)));
}

function makeNutrientBadge(rule) {
  const badge = document.createElement('span');
  badge.className = 'runtime-nutrient-badge ' + rule.key;
  badge.title = rule.label;

  const icon = document.createElement('b');
  icon.textContent = rule.icon;

  const label = document.createElement('span');
  label.textContent = rule.label;

  badge.append(icon, label);
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
  style.textContent = '.runtime-nutrient-badges{display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin:5px 0 0}.runtime-nutrient-badges.recipe{justify-content:center;margin:10px 0 4px}.runtime-nutrient-badge{display:inline-flex;align-items:center;gap:5px;border-radius:999px;padding:4px 8px;font-size:10.5px;font-weight:800;line-height:1;white-space:nowrap;border:1px solid rgba(38,56,43,.08)}.runtime-nutrient-badge b{display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;border-radius:999px;background:rgba(255,253,248,.84);font-size:10px;font-weight:900}.runtime-nutrient-badge.protein{background:#EEF2EA;color:#26382B}.runtime-nutrient-badge.fiber{background:#E7F1DF;color:#52604F}.runtime-nutrient-badge.iron{background:#F1E6D6;color:#8B6A50}.recipe-ingredient-line .runtime-nutrient-badges{grid-column:1/-1}';
  document.head.appendChild(style);
}

function hideProductsTab() {
  document.querySelectorAll('.tabs button').forEach((button) => {
    if (button.textContent.trim().toLowerCase() === 'продукты') button.style.display = 'none';
  });
}

function enhanceNutrientBadges() {
  addNutrientBadgeStyle();
  hideProductsTab();

  document.querySelectorAll('.recipe-ingredient-line').forEach((button) => {
    if (button.dataset.nutrientBadgesReady === '1') return;
    const badges = nutrientBadgesForText(button.textContent);
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
      nutrientBadgesForText(line.textContent).forEach((badge) => found.set(badge.key, badge));
    });
    const badges = Array.from(found.values());
    if (badges.length) meta.insertAdjacentElement('afterend', makeNutrientBadgeList(badges, 'recipe'));
  });
}

window.addEventListener('load', () => {
  enhanceNutrientBadges();
  setInterval(enhanceNutrientBadges, 1000);
});
