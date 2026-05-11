function smartNormalizeIngredientName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[.,;:!?()\[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function smartIngredientTokens(value) {
  const stopWords = new Set([
    'и', 'или', 'для', 'со', 'с', 'без', 'по', 'на', 'в', 'из', 'от',
    'г', 'гр', 'кг', 'мл', 'л', 'шт', 'ст', 'л', 'ч', 'ложка', 'ложки',
    'примерно', 'около', 'по вкусу', 'нарезанный', 'нарезанная', 'очищенный',
    'очищенная', 'свежий', 'свежая', 'свежие'
  ]);

  return smartNormalizeIngredientName(value)
    .split(' ')
    .map((word) => word.trim())
    .filter((word) => word && !stopWords.has(word) && !/^\d+[.,]?\d*$/.test(word));
}

function smartCanonicalIngredientKey(value) {
  const tokens = smartIngredientTokens(value);

  const replacements = {
    'пшеничная': 'пшеничн',
    'пшеничной': 'пшеничн',
    'пшеничную': 'пшеничн',
    'пшеничный': 'пшеничн',
    'цельнозерновая': 'цельнозерн',
    'цельнозерновой': 'цельнозерн',
    'цельнозерновую': 'цельнозерн',
    'греческий': 'греческ',
    'греческого': 'греческ',
    'куриная': 'курин',
    'куриное': 'курин',
    'куриный': 'курин',
    'грудка': 'грудка',
    'грудки': 'грудка',
    'филе': 'филе',
    'овсяные': 'овсян',
    'овсяная': 'овсян',
    'овсянка': 'овсян',
    'гречневая': 'гречк',
    'гречка': 'гречк',
    'рисовая': 'рис',
    'рисовый': 'рис',
    'миндальная': 'миндаль',
    'миндальный': 'миндаль',
    'кокосовая': 'кокос',
    'кокосовый': 'кокос'
  };

  return tokens
    .map((word) => replacements[word] || word)
    .sort()
    .join(' ');
}

function smartIngredientSame(a, b) {
  const aNorm = smartNormalizeIngredientName(a);
  const bNorm = smartNormalizeIngredientName(b);
  if (!aNorm || !bNorm) return false;
  if (aNorm === bNorm) return true;
  if (aNorm.includes(bNorm) || bNorm.includes(aNorm)) return true;
  return smartCanonicalIngredientKey(aNorm) === smartCanonicalIngredientKey(bNorm);
}

const SMART_INGREDIENT_ALIASES = {
  'мука пшеничная': ['пшеничная мука', 'мука пшеничн', 'пшеничн мука'],
  'пшеничная мука': ['мука пшеничная', 'мука пшеничн', 'пшеничн мука'],
  'мука цельнозерновая': ['цельнозерновая мука', 'мука цельнозерн'],
  'греческий йогурт': ['йогурт греческий'],
  'куриная грудка': ['грудка куриная', 'филе курицы', 'куриное филе'],
  'овсяные хлопья': ['хлопья овсяные', 'овсянка'],
  'гречневая крупа': ['крупа гречневая', 'гречка']
};

function addSmartIngredientAliasesToStorage() {
  const storageKeys = [
    'my-recipes-stable-data-v1',
    'custom-ingredients-directory-v3',
    'custom-ingredients-directory-v2',
    'custom-ingredients-directory-v1'
  ];

  storageKeys.forEach((key) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const data = JSON.parse(raw);

      if (Array.isArray(data)) {
        const next = [...data];
        data.forEach((item) => {
          if (!item || !item.name) return;
          Object.entries(SMART_INGREDIENT_ALIASES).forEach(([main, aliases]) => {
            if (smartIngredientSame(item.name, main) || aliases.some((alias) => smartIngredientSame(item.name, alias))) {
              [main, ...aliases].forEach((alias) => {
                if (!next.some((existing) => smartIngredientSame(existing.name, alias))) {
                  next.push({ ...item, name: alias, aliasOf: item.name });
                }
              });
            }
          });
        });
        localStorage.setItem(key, JSON.stringify(next));
      }
    } catch {
      // ignore malformed storage
    }
  });
}

function markSmartMatchedIngredients() {
  document.querySelectorAll('.recipe-ingredient-line, .simple-ingredient-button').forEach((el) => {
    const text = el.textContent || '';
    const canonical = smartCanonicalIngredientKey(text);
    el.dataset.smartIngredientKey = canonical;
  });
}

window.smartIngredientSame = smartIngredientSame;
window.smartCanonicalIngredientKey = smartCanonicalIngredientKey;

window.addEventListener('load', () => {
  addSmartIngredientAliasesToStorage();
  markSmartMatchedIngredients();

  document.addEventListener('click', () => {
    setTimeout(markSmartMatchedIngredients, 100);
    setTimeout(addSmartIngredientAliasesToStorage, 300);
  });

  const observer = new MutationObserver(() => {
    window.requestAnimationFrame(markSmartMatchedIngredients);
  });

  observer.observe(document.body, { childList: true, subtree: true });
});
