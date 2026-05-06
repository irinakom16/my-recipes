import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  ChefHat,
  CalendarDays,
  ShoppingBasket,
  Search,
  Carrot,
  Save,
  Sparkles,
  Upload,
  FileText,
  Wand2,
  Loader2,
  ChevronDown,
  Pencil,
  X,
  Download,
  UploadCloud,
} from "lucide-react";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import "./App.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const STORAGE_KEY = "my-recipes-stable-data-v1";

const LEGACY_STORAGE_KEYS = [
  "recipe-menu-nutrition-app-v4",
  "recipe-menu-nutrition-app-v3",
  "simple-recipe-menu-app-v1",
  "recipe-weekly-menu-app-v2",
  "recipe-weekly-menu-app-v1",
];

const weekDays = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];

const mealTypes = ["Завтрак", "Обед", "Ужин"];

const MEAL_CATEGORY_OPTIONS = [
  { value: "any", label: "Любое время" },
  { value: "breakfast", label: "Завтрак" },
  { value: "lunch", label: "Обед" },
  { value: "dinner", label: "Ужин" },
];

const MEAL_TYPE_TO_CATEGORY = {
  Завтрак: "breakfast",
  Обед: "lunch",
  Ужин: "dinner",
};

const DISH_TYPE_OPTIONS = [
  { value: "any", label: "Без категории" },
  { value: "salad", label: "Салат" },
  { value: "soup", label: "Первое" },
  { value: "main", label: "Второе" },
  { value: "protein", label: "Белок" },
  { value: "carbs", label: "Углеводы" },
  { value: "breakfast", label: "Завтрак" },
  { value: "snack", label: "Закуска" },
  { value: "dessert", label: "Десерт" },
  { value: "drink", label: "Напиток" },
  { value: "sauce", label: "Соус" },
  { value: "side", label: "Гарнир" },
  { value: "other", label: "Другое" },
];

const MEAL_BUILDER_PARTS = [
  { key: "salad", label: "Салат", dishTypes: ["salad"] },
  { key: "protein", label: "Белок", dishTypes: ["protein", "main"] },
  { key: "carbs", label: "Углеводы / гарнир", dishTypes: ["carbs", "side"] },
  { key: "extra", label: "Дополнительно", dishTypes: ["sauce", "snack", "other"] },
];

const UNIT_OPTIONS = ["г", "кг", "мл", "л", "шт", "ст.л", "ч.л"];

const UNIT_ALIASES = {
  г: "г",
  гр: "г",
  грамм: "г",
  грамма: "г",
  граммов: "г",
  кг: "кг",
  мл: "мл",
  л: "л",
  шт: "шт",
  штука: "шт",
  штуки: "шт",
  штук: "шт",
  зубчик: "шт",
  зубчика: "шт",
  зубчиков: "шт",
  "ст.л": "ст.л",
  "ст. л": "ст.л",
  "столовая ложка": "ст.л",
  "столовые ложки": "ст.л",
  "ч.л": "ч.л",
  "ч. л": "ч.л",
  "чайная ложка": "ч.л",
  "чайные ложки": "ч.л",
};

const UNIT_CONVERSIONS = {
  г: { baseUnit: "г", factor: 1, label: "граммы", example: "1 г = 1 г" },
  кг: { baseUnit: "г", factor: 1000, label: "килограммы", example: "1 кг = 1000 г" },
  мл: { baseUnit: "мл", factor: 1, label: "миллилитры", example: "1 мл = 1 мл" },
  л: { baseUnit: "мл", factor: 1000, label: "литры", example: "1 л = 1000 мл" },
  шт: { baseUnit: "шт", factor: 1, label: "штуки", example: "1 шт = 1 шт" },
  "ст.л": { baseUnit: "мл", factor: 15, label: "столовая ложка", example: "1 ст. л. ≈ 15 мл" },
  "ч.л": { baseUnit: "мл", factor: 5, label: "чайная ложка", example: "1 ч. л. ≈ 5 мл" },
};

const PIECE_GRAMS = {
  яйцо: 55,
  яйца: 55,
  томат: 120,
  томаты: 120,
  помидор: 120,
  помидоры: 120,
  огурец: 120,
  огурцы: 120,
  апельсин: 130,
  апельсины: 130,
  свекла: 150,
  лук: 80,
  морковь: 70,
  яблоко: 180,
  банан: 120,
  чеснок: 5,
  картофель: 150,
};

const SPOON_GRAMS = {
  масло: { "ст.л": 14, "ч.л": 5 },
  "оливковое масло": { "ст.л": 14, "ч.л": 5 },
  сахар: { "ст.л": 25, "ч.л": 8 },
  мука: { "ст.л": 25, "ч.л": 8 },
  соль: { "ст.л": 30, "ч.л": 10 },
  сметана: { "ст.л": 25, "ч.л": 8 },
  йогурт: { "ст.л": 25, "ч.л": 8 },
};

const NUTRITION_DB = {
  брокколи: { displayName: "Брокколи", calories: 34, protein: 2.8, fat: 0.4, carbs: 6.6, fiber: 2.6, sugar: 1.7, sodium: 33, potassium: 316, calcium: 47, iron: 0.7, magnesium: 21, vitaminC: 89.2, vitaminA: 31, folate: 63 },
  рукола: { displayName: "Рукола", calories: 25, protein: 2.6, fat: 0.7, carbs: 3.7, fiber: 1.6, sugar: 2.1, sodium: 27, potassium: 369, calcium: 160, iron: 1.5, magnesium: 47, vitaminC: 15, vitaminA: 119, folate: 97 },
  свекла: { displayName: "Свекла", calories: 43, protein: 1.6, fat: 0.2, carbs: 9.6, fiber: 2.8, sugar: 6.8, sodium: 78, potassium: 325, calcium: 16, iron: 0.8, magnesium: 23, vitaminC: 4.9, vitaminA: 2, folate: 109 },
  огурец: { displayName: "Огурец", calories: 15, protein: 0.7, fat: 0.1, carbs: 3.6, fiber: 0.5, sugar: 1.7, sodium: 2, potassium: 147, calcium: 16, iron: 0.3, magnesium: 13, vitaminC: 2.8, vitaminA: 5, folate: 7 },
  апельсин: { displayName: "Апельсин", calories: 47, protein: 0.9, fat: 0.1, carbs: 11.8, fiber: 2.4, sugar: 9.4, sodium: 0, potassium: 181, calcium: 40, iron: 0.1, magnesium: 10, vitaminC: 53.2, vitaminA: 11, folate: 30 },
  яйцо: { displayName: "Яйцо", calories: 143, protein: 12.6, fat: 9.5, carbs: 0.7, fiber: 0, sugar: 0.4, sodium: 142, potassium: 138, calcium: 56, iron: 1.8, magnesium: 12, vitaminC: 0, vitaminA: 160, folate: 47 },
  сыр: { displayName: "Сыр", calories: 402, protein: 25, fat: 33, carbs: 1.3, fiber: 0, sugar: 0.5, sodium: 621, potassium: 98, calcium: 721, iron: 0.7, magnesium: 28, vitaminC: 0, vitaminA: 265, folate: 18 },
  томаты: { displayName: "Томаты", calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9, fiber: 1.2, sugar: 2.6, sodium: 5, potassium: 237, calcium: 10, iron: 0.3, magnesium: 11, vitaminC: 13.7, vitaminA: 42, folate: 15 },
  молоко: { displayName: "Молоко", calories: 61, protein: 3.2, fat: 3.3, carbs: 4.8, fiber: 0, sugar: 5.1, sodium: 43, potassium: 150, calcium: 113, iron: 0, magnesium: 10, vitaminC: 0, vitaminA: 46, folate: 5 },
  курица: { displayName: "Курица", calories: 165, protein: 31, fat: 3.6, carbs: 0, fiber: 0, sugar: 0, sodium: 74, potassium: 256, calcium: 15, iron: 1, magnesium: 29, vitaminC: 0, vitaminA: 6, folate: 4 },
  рис: { displayName: "Рис", calories: 365, protein: 7.1, fat: 0.7, carbs: 80, fiber: 1.3, sugar: 0.1, sodium: 5, potassium: 115, calcium: 28, iron: 0.8, magnesium: 25, vitaminC: 0, vitaminA: 0, folate: 8 },
  лук: { displayName: "Лук", calories: 40, protein: 1.1, fat: 0.1, carbs: 9.3, fiber: 1.7, sugar: 4.2, sodium: 4, potassium: 146, calcium: 23, iron: 0.2, magnesium: 10, vitaminC: 7.4, vitaminA: 0, folate: 19 },
  морковь: { displayName: "Морковь", calories: 41, protein: 0.9, fat: 0.2, carbs: 9.6, fiber: 2.8, sugar: 4.7, sodium: 69, potassium: 320, calcium: 33, iron: 0.3, magnesium: 12, vitaminC: 5.9, vitaminA: 835, folate: 19 },
  паста: { displayName: "Паста", calories: 371, protein: 13, fat: 1.5, carbs: 75, fiber: 3.2, sugar: 2.7, sodium: 6, potassium: 223, calcium: 21, iron: 1.3, magnesium: 53, vitaminC: 0, vitaminA: 0, folate: 18 },
  чеснок: { displayName: "Чеснок", calories: 149, protein: 6.4, fat: 0.5, carbs: 33.1, fiber: 2.1, sugar: 1, sodium: 17, potassium: 401, calcium: 181, iron: 1.7, magnesium: 25, vitaminC: 31.2, vitaminA: 0, folate: 3 },
  масло: { displayName: "Масло", calories: 884, protein: 0, fat: 100, carbs: 0, fiber: 0, sugar: 0, sodium: 0, potassium: 1, calcium: 1, iron: 0.6, magnesium: 0, vitaminC: 0, vitaminA: 0, folate: 0 },
  "оливковое масло": { displayName: "Оливковое масло", calories: 884, protein: 0, fat: 100, carbs: 0, fiber: 0, sugar: 0, sodium: 2, potassium: 1, calcium: 1, iron: 0.6, magnesium: 0, vitaminC: 0, vitaminA: 0, folate: 0 },
};

const NUTRIENT_LABELS = {
  calories: "ккал",
  protein: "белки, г",
  fat: "жиры, г",
  carbs: "углеводы, г",
  fiber: "клетчатка, г",
  sugar: "сахар, г",
  sodium: "натрий, мг",
  potassium: "калий, мг",
  calcium: "кальций, мг",
  iron: "железо, мг",
  magnesium: "магний, мг",
  vitaminC: "витамин C, мг",
  vitaminA: "витамин A, мкг",
  folate: "фолаты, мкг",
};

const starterRecipes = [
  {
    id: crypto.randomUUID(),
    title: "Омлет с сыром и томатами",
    description: "Быстрый завтрак из простых продуктов.",
    image: "",
    imageCrop: { zoom: 1, x: 50, y: 50 },
    time: "15 мин",
    mealCategory: "breakfast",
    dishType: "breakfast",
    servings: 2,
    ingredients: [
      { name: "яйцо", amount: 3, unit: "шт" },
      { name: "сыр", amount: 50, unit: "г" },
      { name: "томаты", amount: 2, unit: "шт" },
      { name: "молоко", amount: 50, unit: "мл" },
    ],
    steps: "Взбей яйца с молоком.\nДобавь томаты и сыр.\nГотовь на сковороде под крышкой 7–10 минут.",
  },
  {
    id: crypto.randomUUID(),
    title: "Курица с рисом",
    description: "Сытный обед на каждый день.",
    image: "",
    imageCrop: { zoom: 1, x: 50, y: 50 },
    time: "35 мин",
    mealCategory: "lunch",
    dishType: "main",
    servings: 3,
    ingredients: [
      { name: "курица", amount: 300, unit: "г" },
      { name: "рис", amount: 200, unit: "г" },
      { name: "лук", amount: 1, unit: "шт" },
      { name: "морковь", amount: 1, unit: "шт" },
    ],
    steps: "Обжарь курицу с луком и морковью.\nДобавь рис и воду.\nТуши до готовности риса.",
  },
  {
    id: crypto.randomUUID(),
    title: "Паста с томатами",
    description: "Простой ужин за полчаса.",
    image: "",
    imageCrop: { zoom: 1, x: 50, y: 50 },
    time: "25 мин",
    mealCategory: "dinner",
    dishType: "main",
    servings: 2,
    ingredients: [
      { name: "паста", amount: 200, unit: "г" },
      { name: "томаты", amount: 2, unit: "шт" },
      { name: "чеснок", amount: 2, unit: "шт" },
      { name: "сыр", amount: 50, unit: "г" },
      { name: "оливковое масло", amount: 1, unit: "ст.л" },
    ],
    steps: "Отвари пасту.\nОбжарь чеснок и томаты на масле.\nСмешай с пастой и посыпь сыром.",
  },
];

function normalizeIngredient(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^[-•*]\s*/, "")
    .replace(/\s+/g, " ");
}

function normalizeUnit(unit) {
  const clean = normalizeIngredient(unit).replace(/\.$/, "");
  return UNIT_ALIASES[clean] || clean || "г";
}

function findNutritionKey(name) {
  const cleanName = normalizeIngredient(name);
  if (NUTRITION_DB[cleanName]) return cleanName;
  return Object.keys(NUTRITION_DB).find((key) => cleanName.includes(key) || key.includes(cleanName));
}

function parseAmount(value) {
  if (!value) return null;

  const text = String(value).trim().replace(",", ".");

  if (/^\d+\s*\/\s*\d+$/.test(text)) {
    const [a, b] = text.split("/").map(Number);
    return b ? a / b : null;
  }

  return Number(text);
}

function parseIngredientLine(line) {
  const original = String(line || "")
    .replace(/^[-•*]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!original) return null;

  const unitsPattern =
    "(кг|г|гр|грамм|грамма|граммов|мл|л|шт|штук|штука|штуки|ст\\.?\\s*л|ч\\.?\\s*л|зубчика?|зубчиков)";

  const patterns = [
    // брокколи 100 г
    new RegExp(`^(.+?)\\s+(\\d+(?:[.,]\\d+)?|\\d+\\s*\\/\\s*\\d+)\\s*${unitsPattern}\\.?$`, "i"),
    // 100 г брокколи
    new RegExp(`^(\\d+(?:[.,]\\d+)?|\\d+\\s*\\/\\s*\\d+)\\s*${unitsPattern}\\.?\\s+(.+)$`, "i"),
    // г 100 брокколи / шт 2 яйца
    new RegExp(`^${unitsPattern}\\.?\\s+(\\d+(?:[.,]\\d+)?|\\d+\\s*\\/\\s*\\d+)\\s+(.+)$`, "i"),
    // брокколи г 100
    new RegExp(`^(.+?)\\s+${unitsPattern}\\.?\\s+(\\d+(?:[.,]\\d+)?|\\d+\\s*\\/\\s*\\d+)$`, "i"),
  ];

  let name = "";
  let amount = 1;
  let unit = "шт";

  const match1 = original.match(patterns[0]);
  const match2 = original.match(patterns[1]);
  const match3 = original.match(patterns[2]);
  const match4 = original.match(patterns[3]);

  if (match1) {
    name = match1[1];
    amount = parseAmount(match1[2]) || 1;
    unit = normalizeUnit(match1[3]);
  } else if (match2) {
    amount = parseAmount(match2[1]) || 1;
    unit = normalizeUnit(match2[2]);
    name = match2[3];
  } else if (match3) {
    unit = normalizeUnit(match3[1]);
    amount = parseAmount(match3[2]) || 1;
    name = match3[3];
  } else if (match4) {
    name = match4[1];
    unit = normalizeUnit(match4[2]);
    amount = parseAmount(match4[3]) || 1;
  } else {
    const amountMatch = original.match(
      /(\d+(?:[.,]\d+)?|\d+\s*\/\s*\d+)\s*(кг|г|гр|мл|л|шт|штук|ст\.?\s*л|ч\.?\s*л|зубчика?|зубчиков)?/i
    );

    amount = amountMatch ? parseAmount(amountMatch[1]) || 1 : 1;
    unit = amountMatch?.[2] ? normalizeUnit(amountMatch[2]) : "шт";

    name = original.replace(amountMatch?.[0] || "", "");
  }

  name = String(name || "")
    .replace(/\bпо вкусу\b/gi, "")
    .replace(/[—–-].*$/, "")
    .replace(/[:：]+$/, "")
    .trim();

  if (!name) name = original;

  return {
    name: normalizeIngredient(name),
    amount,
    unit,
    original,
  };
}

function makeIngredient(name, amount, unit) {
  const cleanName = normalizeIngredient(name);
  if (!cleanName) return null;
  return {
    name: cleanName,
    amount: Number(String(amount).replace(",", ".")) || 0,
    unit: normalizeUnit(unit),
  };
}

function splitIngredients(value) {
  return String(value || "")
    .split(/\n|[,;]/)
    .map(parseIngredientLine)
    .filter(Boolean);
}

function getIngredientName(value) {
  if (typeof value === "object" && value?.name) return normalizeIngredient(value.name);
  const parsed = parseIngredientLine(value);
  return parsed?.name || normalizeIngredient(value);
}

function formatIngredient(ingredient) {
  const item = typeof ingredient === "string" ? parseIngredientLine(ingredient) : ingredient;
  if (!item) return "";
  return `${item.name} — ${Number(item.amount.toFixed?.(2) ?? item.amount)} ${item.unit}`;
}

function getIngredientGrams(ingredient) {
  const item = typeof ingredient === "string" ? parseIngredientLine(ingredient) : ingredient;
  if (!item) return 0;

  const name = normalizeIngredient(item.name);
  const amount = Number(item.amount) || 0;
  const unit = normalizeUnit(item.unit);

  if (unit === "г" || unit === "кг") return amount * (UNIT_CONVERSIONS[unit]?.factor || 1);
  if (unit === "мл" || unit === "л") return amount * (UNIT_CONVERSIONS[unit]?.factor || 1);
  if (unit === "шт") return amount * (PIECE_GRAMS[name] || 100);

  if (unit === "ст.л" || unit === "ч.л") {
    const spoonData = SPOON_GRAMS[name];
    if (spoonData?.[unit]) return amount * spoonData[unit];
    return amount * (unit === "ст.л" ? 15 : 5);
  }

  return amount;
}

function getShoppingBase(ingredient) {
  const item = typeof ingredient === "string" ? parseIngredientLine(ingredient) : ingredient;
  if (!item) return { name: "", amount: 0, unit: "г" };

  const name = normalizeIngredient(item.name);
  const amount = Number(item.amount) || 0;
  const unit = normalizeUnit(item.unit);

  if (unit === "г" || unit === "кг") return { name, amount: amount * (UNIT_CONVERSIONS[unit]?.factor || 1), unit: "г" };
  if (unit === "мл" || unit === "л") return { name, amount: amount * (UNIT_CONVERSIONS[unit]?.factor || 1), unit: "мл" };
  if (unit === "ст.л" || unit === "ч.л") return { name, amount: getIngredientGrams(item), unit: "г" };

  return { name, amount, unit: "шт" };
}

function calculateIngredientNutrition(ingredient) {
  const item = typeof ingredient === "string" ? parseIngredientLine(ingredient) : ingredient;
  if (!item) return null;

  const key = findNutritionKey(item.name);
  const nutrition = key ? NUTRITION_DB[key] : null;

  if (!nutrition) {
    return {
      known: false,
      name: item.name,
      amount: item.amount,
      unit: item.unit,
      grams: getIngredientGrams(item),
    };
  }

  const grams = getIngredientGrams(item);
  const multiplier = grams / 100;
  const calculated = {};

  Object.keys(NUTRIENT_LABELS).forEach((nutrientKey) => {
    calculated[nutrientKey] = Number(((nutrition[nutrientKey] || 0) * multiplier).toFixed(2));
  });

  return {
    known: true,
    name: item.name,
    amount: item.amount,
    unit: item.unit,
    grams,
    sourceName: nutrition.displayName,
    nutrients: calculated,
  };
}

function calculateRecipeNutrition(recipe) {
  const total = {};
  Object.keys(NUTRIENT_LABELS).forEach((key) => {
    total[key] = 0;
  });

  recipe.ingredients.forEach((ingredient) => {
    const itemNutrition = calculateIngredientNutrition(ingredient);
    if (!itemNutrition?.known) return;

    Object.keys(NUTRIENT_LABELS).forEach((key) => {
      total[key] += itemNutrition.nutrients[key] || 0;
    });
  });

  Object.keys(total).forEach((key) => {
    total[key] = Number(total[key].toFixed(2));
  });

  return total;
}

function divideNutrition(nutrition, servings) {
  const result = {};
  const divisor = Number(servings) || 1;

  Object.keys(NUTRIENT_LABELS).forEach((key) => {
    result[key] = Number(((nutrition[key] || 0) / divisor).toFixed(2));
  });

  return result;
}

function createEmptyMenu() {
  return weekDays.reduce((acc, day) => {
    acc[day] = mealTypes.reduce((meals, meal) => {
      meals[meal] = {
        mode: "recipe",
        recipeId: "",
        builder: {
          salad: "",
          protein: "",
          carbs: "",
          extra: "",
        },
      };
      return meals;
    }, {});
    return acc;
  }, {});
}

function normalizeMenu(menu) {
  const emptyMenu = createEmptyMenu();

  weekDays.forEach((day) => {
    mealTypes.forEach((meal) => {
      const value = menu?.[day]?.[meal];

      if (typeof value === "string") {
        emptyMenu[day][meal] = {
          ...emptyMenu[day][meal],
          recipeId: value,
        };
      } else if (value && typeof value === "object") {
        emptyMenu[day][meal] = {
          mode: value.mode || "recipe",
          recipeId: value.recipeId || "",
          builder: {
            salad: value.builder?.salad || "",
            protein: value.builder?.protein || "",
            carbs: value.builder?.carbs || "",
            extra: value.builder?.extra || "",
          },
        };
      }
    });
  });

  return emptyMenu;
}

function getMenuMealRecipeIds(mealPlan) {
  if (!mealPlan) return [];

  if (typeof mealPlan === "string") {
    return mealPlan ? [mealPlan] : [];
  }

  if (mealPlan.mode === "builder") {
    return Object.values(mealPlan.builder || {}).filter(Boolean);
  }

  return mealPlan.recipeId ? [mealPlan.recipeId] : [];
}

function getMealCategoryLabel(value) {
  return MEAL_CATEGORY_OPTIONS.find((option) => option.value === value)?.label || "Любое время";
}

function getDishTypeLabel(value) {
  return DISH_TYPE_OPTIONS.find((option) => option.value === value)?.label || "Без категории";
}

function Button({ children, onClick, type = "button", disabled = false, variant = "primary" }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`button ${variant}`}>
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function NutritionNumber({ title, value, unit, accent }) {
  return (
    <div className={`nutrition-tile ${accent || ""}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{unit}</small>
    </div>
  );
}

function RecipeCard({ recipe, onDelete, onEdit }) {
  const [selectedIngredientIndex, setSelectedIngredientIndex] = useState(null);

  const steps = recipe.steps
    ? recipe.steps.split(/\n|(?=\d+\.)/).map((step) => step.trim()).filter(Boolean)
    : [];

  const totalNutrition = calculateRecipeNutrition(recipe);
  const portionNutrition = divideNutrition(totalNutrition, recipe.servings);

  const selectedIngredient =
    selectedIngredientIndex !== null ? recipe.ingredients[selectedIngredientIndex] : null;

  const selectedIngredientNutrition = selectedIngredient
    ? calculateIngredientNutrition(selectedIngredient)
    : null;

  return (
    <article className="recipe-paper-card">
      <div className="recipe-paper-header">
        <div>
          <h3>{recipe.title}</h3>
          {recipe.description && <p className="recipe-paper-description">{recipe.description}</p>}
        </div>

        <div className="recipe-actions">
          <button onClick={onEdit} className="icon-button edit-button" title="Редактировать рецепт">
            <Pencil size={19} />
          </button>

          <button onClick={onDelete} className="icon-button" title="Удалить рецепт">
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="recipe-paper-meta">
        <span>{getMealCategoryLabel(recipe.mealCategory || "any")}</span>
        <span>{getDishTypeLabel(recipe.dishType || "any")}</span>
        {recipe.servings && <span>На {recipe.servings} порции</span>}
        {recipe.time && <span>{recipe.time}</span>}
        <span>Совпадение {recipe.score}%</span>
      </div>

      {recipe.image && (
        <div className="recipe-photo">
          <img
            src={recipe.image}
            alt={recipe.title}
            style={{
              transform: `scale(${recipe.imageCrop?.zoom || 1})`,
              transformOrigin: `${recipe.imageCrop?.x ?? 50}% ${recipe.imageCrop?.y ?? 50}%`,
            }}
          />
        </div>
      )}

      <div className="nutrition-summary prominent">
        <div className="nutrition-heading">
          <h4>Пищевая ценность на порцию</h4>
          <span>Расчёт по ингредиентам и граммовкам</span>
        </div>

        <div className="macro-grid macro-grid-big">
          <NutritionNumber title="Калории" value={portionNutrition.calories} unit="ккал" accent="calories" />
          <NutritionNumber title="Белки" value={portionNutrition.protein} unit="г" />
          <NutritionNumber title="Жиры" value={portionNutrition.fat} unit="г" />
          <NutritionNumber title="Углеводы" value={portionNutrition.carbs} unit="г" />
        </div>

        <details className="micronutrients">
          <summary>
            <span>Витамины, минералы и прочие нутриенты на порцию</span>
            <ChevronDown size={18} />
          </summary>

          <div className="micro-grid">
            {Object.entries(portionNutrition)
              .filter(([key]) => !["calories", "protein", "fat", "carbs"].includes(key))
              .map(([key, value]) => (
                <div key={key}>
                  <span>{NUTRIENT_LABELS[key]}</span>
                  <strong>{value}</strong>
                </div>
              ))}
          </div>
        </details>
      </div>

      <div className="recipe-paper-section">
        <h4>Ингредиенты:</h4>

        <ul className="simple-ingredient-list">
          {recipe.ingredients.map((item, index) => {
            const ingredientName = getIngredientName(item);
            const isAvailable = recipe.availableKeys?.includes(ingredientName);
            const isSelected = selectedIngredientIndex === index;

            return (
              <li key={`${ingredientName}-${index}`}>
                <button
                  type="button"
                  className={`simple-ingredient-button ${isSelected ? "active" : ""}`}
                  onClick={() =>
                    setSelectedIngredientIndex(isSelected ? null : index)
                  }
                >
                  <span>
                    <span className="ingredient-name-text">{item.name}</span>
                    {!isAvailable && <em>нужно купить</em>}
                  </span>
                  <b>{Number(item.amount.toFixed?.(2) ?? item.amount)} {item.unit}</b>
                </button>
              </li>
            );
          })}
        </ul>

        {selectedIngredient && (
          <div className="ingredient-detail-card">
            <div className="ingredient-detail-header">
              <div>
                <h4>{selectedIngredient.name}</h4>
                <p>{Number(selectedIngredient.amount.toFixed?.(2) ?? selectedIngredient.amount)} {selectedIngredient.unit}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedIngredientIndex(null)}
                title="Закрыть карточку ингредиента"
              >
                ×
              </button>
            </div>

            {selectedIngredientNutrition?.known ? (
              <>
                <div className="ingredient-detail-macros">
                  <div>
                    <strong>{selectedIngredientNutrition.nutrients.calories}</strong>
                    <span>ккал</span>
                  </div>
                  <div>
                    <strong>{selectedIngredientNutrition.nutrients.protein}</strong>
                    <span>белки, г</span>
                  </div>
                  <div>
                    <strong>{selectedIngredientNutrition.nutrients.fat}</strong>
                    <span>жиры, г</span>
                  </div>
                  <div>
                    <strong>{selectedIngredientNutrition.nutrients.carbs}</strong>
                    <span>углеводы, г</span>
                  </div>
                </div>

                <details className="ingredient-detail-nutrients">
                  <summary>
                    <span>Витамины, минералы и прочие нутриенты</span>
                    <ChevronDown size={17} />
                  </summary>

                  <div className="micro-grid">
                    {Object.entries(selectedIngredientNutrition.nutrients)
                      .filter(([key]) => !["calories", "protein", "fat", "carbs"].includes(key))
                      .map(([key, value]) => (
                        <div key={key}>
                          <span>{NUTRIENT_LABELS[key]}</span>
                          <strong>{value}</strong>
                        </div>
                      ))}
                  </div>
                </details>
              </>
            ) : (
              <p className="unknown-nutrition">
                Для этого продукта пока нет данных по нутриентам в справочнике.
              </p>
            )}
          </div>
        )}
      </div>

      {recipe.missing?.length > 0 && (
        <div className="recipe-paper-note">
          Не хватает: <strong>{recipe.missing.map((item) => formatIngredient(item)).join(", ")}</strong>
        </div>
      )}

      {steps.length > 0 && (
        <div className="recipe-paper-section">
          <h4>Как готовить:</h4>

          <ol className="recipe-paper-steps">
            {steps.map((step, index) => (
              <li key={index}>{step.replace(/^\d+\.\s*/, "")}</li>
            ))}
          </ol>
        </div>
      )}
    </article>
  );
}

export default function App() {
  const [recipes, setRecipes] = useState(starterRecipes);

  const [pantry, setPantry] = useState([
    { name: "яйцо", amount: 6, unit: "шт" },
    { name: "сыр", amount: 100, unit: "г" },
    { name: "томаты", amount: 3, unit: "шт" },
    { name: "рис", amount: 300, unit: "г" },
    { name: "курица", amount: 300, unit: "г" },
  ]);

  const [menu, setMenu] = useState(createEmptyMenu);
  const [query, setQuery] = useState("");
  const [ingredientInput, setIngredientInput] = useState("");
  const [activeTab, setActiveTab] = useState("recipes");
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);

  const [recognitionText, setRecognitionText] = useState("");
  const [recognitionStatus, setRecognitionStatus] = useState("");
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [detectedRecipes, setDetectedRecipes] = useState([]);

  const [pantryForm, setPantryForm] = useState({
    name: "",
    amount: "",
    unit: "г",
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    imageCrop: { zoom: 1, x: 50, y: 50 },
    time: "",
    mealCategory: "any",
    dishType: "any",
    servings: 2,
    ingredients: "",
    steps: "",
  });

  const [editingRecipeId, setEditingRecipeId] = useState(null);

  useEffect(() => {
    try {
      const keysToTry = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS];
      let loadedKey = null;
      let parsed = null;

      for (const key of keysToTry) {
        const saved = localStorage.getItem(key);
        if (!saved) continue;

        const candidate = JSON.parse(saved);

        if (candidate?.recipes || candidate?.pantry || candidate?.menu) {
          parsed = candidate;
          loadedKey = key;
          break;
        }
      }

      if (!parsed) return;

      if (parsed.recipes) setRecipes(parsed.recipes);
      if (parsed.pantry) setPantry(parsed.pantry);
      if (parsed.menu) setMenu(normalizeMenu(parsed.menu));

      if (loadedKey !== STORAGE_KEY) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
    } catch {
      console.log("Не удалось загрузить сохранённые данные");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ recipes, pantry, menu }));
  }, [recipes, pantry, menu]);

  function exportAppData() {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      recipes,
      pantry,
      menu,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `my-recipes-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importAppData(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed.recipes && !parsed.pantry && !parsed.menu) {
        alert("В файле не найдены данные приложения.");
        return;
      }

      if (parsed.recipes) setRecipes(parsed.recipes);
      if (parsed.pantry) setPantry(parsed.pantry);
      if (parsed.menu) setMenu(normalizeMenu(parsed.menu));

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          recipes: parsed.recipes || recipes,
          pantry: parsed.pantry || pantry,
          menu: parsed.menu || menu,
        })
      );

      alert("Данные импортированы.");
    } catch {
      alert("Не удалось импортировать файл. Проверь, что это backup приложения.");
    } finally {
      event.target.value = "";
    }
  }

  const pantryTotals = useMemo(() => {
    const totals = {};

    pantry.forEach((item) => {
      const base = getShoppingBase(item);
      if (!base.name) return;

      const key = `${base.name}|${base.unit}`;

      if (!totals[key]) {
        totals[key] = { name: base.name, amount: 0, unit: base.unit };
      }

      totals[key].amount += base.amount;
    });

    return totals;
  }, [pantry]);

  function hasEnoughPantry(ingredient) {
    const base = getShoppingBase(ingredient);
    const key = `${base.name}|${base.unit}`;
    const available = pantryTotals[key]?.amount || 0;
    return available >= base.amount;
  }

  const recipeMatches = useMemo(() => {
    return recipes
      .map((recipe) => {
        const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];

        const available = ingredients.filter((item) => hasEnoughPantry(item));
        const missing = ingredients.filter((item) => !hasEnoughPantry(item));
        const availableKeys = available.map((item) => getIngredientName(item));

        const score = ingredients.length ? Math.round((available.length / ingredients.length) * 100) : 0;

        return { ...recipe, ingredients, available, missing, availableKeys, score };
      })
      .filter((recipe) => {
        const text = `${recipe.title} ${recipe.description} ${getMealCategoryLabel(recipe.mealCategory || "any")} ${getDishTypeLabel(recipe.dishType || "any")} ${recipe.ingredients
          .map((item) => getIngredientName(item))
          .join(" ")}`.toLowerCase();

        return text.includes(query.toLowerCase());
      })
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  }, [recipes, query, pantryTotals]);

  const selectedRecipe =
    recipeMatches.find((recipe) => recipe.id === selectedRecipeId) || recipeMatches[0] || null;

  const shoppingList = useMemo(() => {
    const required = {};

    const selectedRecipeIds = Object.values(menu).flatMap((day) =>
      Object.values(day).flatMap((mealPlan) => getMenuMealRecipeIds(mealPlan))
    );
    const selectedRecipes = recipes.filter((recipe) => selectedRecipeIds.includes(recipe.id));

    selectedRecipes.forEach((recipe) => {
      recipe.ingredients.forEach((ingredient) => {
        const base = getShoppingBase(ingredient);
        const key = `${base.name}|${base.unit}`;

        if (!required[key]) {
          required[key] = { name: base.name, amount: 0, unit: base.unit };
        }

        required[key].amount += base.amount;
      });
    });

    return Object.entries(required)
      .map(([key, needed]) => {
        const available = pantryTotals[key]?.amount || 0;
        const buyAmount = Math.max(needed.amount - available, 0);
        return { ...needed, available, buyAmount };
      })
      .filter((item) => item.buyAmount > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [menu, recipes, pantryTotals]);

  function stripPageMarkers(text) {
    return String(text || "").replace(/\n?--- СТРАНИЦА \d+ ---\n?/g, "\n").trim();
  }

  function getPageNumberNearIndex(text, index) {
    const before = text.slice(0, index);
    const matches = [...before.matchAll(/--- СТРАНИЦА (\d+) ---/g)];
    const last = matches[matches.length - 1];
    return last ? Number(last[1]) : 1;
  }

  function findTitleBefore(text, index) {
    const before = text.slice(0, index);
    const lines = before
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => !/^--- СТРАНИЦА \d+ ---$/i.test(line));

    const candidates = lines
      .slice(-6)
      .filter((line) => {
        const lower = line.toLowerCase();
        if (/ингредиенты|состав|продукты|приготовление|шаги|описание|способ/i.test(lower)) return false;
        if (line.length < 3 || line.length > 90) return false;
        return true;
      });

    return candidates[candidates.length - 1] || "";
  }

  function findRecipeStart(text, ingredientMatchIndex) {
    const before = text.slice(0, ingredientMatchIndex);
    const lastPageMarker = before.lastIndexOf("--- СТРАНИЦА");
    const lastDoubleBreak = before.lastIndexOf("\n\n");
    const titleLine = findTitleBefore(text, ingredientMatchIndex);

    if (titleLine) {
      const titleIndex = text.lastIndexOf(titleLine, ingredientMatchIndex);
      if (titleIndex >= 0) return titleIndex;
    }

    return Math.max(lastPageMarker, lastDoubleBreak, 0);
  }

  function splitDetectedRecipes(text, pageImages = []) {
    const cleanText = String(text || "").replace(/\r/g, "").trim();

    if (!cleanText) return [];

    const ingredientMatches = [
      ...cleanText.matchAll(/(?:^|\n)\s*(ингредиенты|состав|продукты)\s*[:：]?\s*(?:\n|$)/gi),
    ];

    if (ingredientMatches.length === 0) {
      const pageNumber = getPageNumberNearIndex(cleanText, 0);
      return [
        {
          id: crypto.randomUUID(),
          title: stripPageMarkers(cleanText).split("\n").find(Boolean)?.trim() || "Рецепт из файла",
          text: cleanText,
          pageNumber,
          image: pageImages[pageNumber - 1] || "",
        },
      ];
    }

    return ingredientMatches.map((match, index) => {
      const recipeStart = findRecipeStart(cleanText, match.index || 0);
      const nextMatch = ingredientMatches[index + 1];
      const recipeEnd = nextMatch ? findRecipeStart(cleanText, nextMatch.index || cleanText.length) : cleanText.length;

      const block = cleanText.slice(recipeStart, recipeEnd).trim();
      const pageNumber = getPageNumberNearIndex(cleanText, recipeStart);

      const title =
        findTitleBefore(cleanText, match.index || recipeStart) ||
        stripPageMarkers(block).split("\n").find(Boolean)?.trim() ||
        `Рецепт ${index + 1}`;

      return {
        id: crypto.randomUUID(),
        title,
        text: block,
        pageNumber,
        image: pageImages[pageNumber - 1] || "",
      };
    });
  }

  function extractRecipeDraft(text, recipeImage = "") {
    const cleanText = stripPageMarkers(text).replace(/\r/g, "").trim();

    if (!cleanText) return null;

    const lines = cleanText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const lowerLines = lines.map((line) => line.toLowerCase());

    const ingredientsStart = lowerLines.findIndex((line) =>
      /^(ингредиенты|состав|продукты)\s*[:：]?\s*$/.test(line)
    );

    const stepsStart = lowerLines.findIndex((line) =>
      /^(приготовление|способ приготовления|шаги|инструкция|пошаговое приготовление|как готовить|описание)\s*[:：]?\s*$/.test(line)
    );

    let title = "Новый рецепт";

    if (ingredientsStart > 0) {
      title = lines[ingredientsStart - 1]
        ?.replace(/^название[:\-]?\s*/i, "")
        .trim();
    } else {
      title = lines[0]?.replace(/^название[:\-]?\s*/i, "").trim() || "Новый рецепт";
    }

    const timeMatch = cleanText.match(/(\d+\s*(?:мин|минут|ч|час|часа|часов))/i);
    const servingsMatch = cleanText.match(/(\d+)\s*(?:порц|порции|порций|человека|человек)/i);

    let ingredientLines = [];

    if (ingredientsStart >= 0) {
      const end =
        stepsStart > ingredientsStart
          ? stepsStart
          : lowerLines.findIndex((line, index) =>
              index > ingredientsStart &&
              /^(приготовление|способ|шаги|инструкция|описание|как готовить)/i.test(line)
            );

      const ingredientEnd = end > ingredientsStart ? end : lines.length;

      ingredientLines = lines
        .slice(ingredientsStart + 1, ingredientEnd)
        .filter((line) => {
          const lower = line.toLowerCase();
          if (/^(приготовление|способ|шаги|инструкция|описание|как готовить)/i.test(lower)) return false;
          if (/^\d+\.\s+[а-яa-z]/i.test(line) && line.length > 40) return false;
          return true;
        });
    } else {
      ingredientLines = lines
        .filter((line) =>
          /^[-•*]|\d+\s*(г|кг|мл|л|шт|ст\.?\s*л|ч\.?\s*л)|^(г|кг|мл|л|шт)\s+\d+/i.test(line)
        )
        .slice(0, 30);
    }

    const parsedIngredientsText = ingredientLines
      .map((line) => {
        const parsed = parseIngredientLine(line);
        return parsed ? `${parsed.name} ${parsed.amount} ${parsed.unit}` : line.replace(/^[-•*]\s*/, "").trim();
      })
      .filter(Boolean)
      .join("\n");

    let steps = "";

    if (stepsStart >= 0) {
      steps = lines.slice(stepsStart + 1).join("\n");
    } else if (ingredientsStart >= 0) {
      const afterIngredients = lines.slice(ingredientsStart + 1 + ingredientLines.length);
      steps = afterIngredients
        .filter((line) => !/^(приготовление|способ|шаги|инструкция|описание|как готовить)/i.test(line.toLowerCase()))
        .join("\n");
    } else {
      steps = lines.slice(1).join("\n");
    }

    return {
      title,
      description: "Рецепт добавлен из распознанного текста.",
      image: recipeImage || "",
      imageCrop: { zoom: 1, x: 50, y: 50 },
      time: timeMatch?.[1] || "",
      mealCategory: "any",
      dishType: "any",
      servings: servingsMatch?.[1] ? Number(servingsMatch[1]) : 2,
      ingredientsText: parsedIngredientsText,
      ingredients: splitIngredients(parsedIngredientsText),
      steps,
    };
  }

  function parseRecipeText(text, recipeImage = "") {
    const draft = extractRecipeDraft(text, recipeImage);

    if (!draft) return;

    setForm({
      title: draft.title,
      description: draft.description,
      image: draft.image,
      imageCrop: draft.imageCrop,
      time: draft.time,
      mealCategory: draft.mealCategory,
      dishType: draft.dishType,
      servings: draft.servings,
      ingredients: draft.ingredientsText,
      steps: draft.steps,
    });

    setActiveTab("add");
  }

  function createAllDetectedRecipes() {
    if (!detectedRecipes.length) return;

    const drafts = detectedRecipes
      .map((recipe) => extractRecipeDraft(recipe.text, recipe.image))
      .filter(Boolean)
      .filter((draft) => draft.title && draft.ingredients.length > 0);

    if (!drafts.length) {
      alert("Не удалось создать рецепты. Проверь распознанный текст.");
      return;
    }

    const newRecipes = drafts.map((draft) => ({
      id: crypto.randomUUID(),
      title: draft.title,
      description: draft.description,
      image: draft.image,
      imageCrop: draft.imageCrop,
      time: draft.time,
      mealCategory: draft.mealCategory,
      dishType: draft.dishType,
      servings: draft.servings,
      ingredients: draft.ingredients,
      steps: draft.steps,
    }));

    setRecipes((current) => [...newRecipes, ...current]);
    setSelectedRecipeId(newRecipes[0].id);
    setActiveTab("recipes");
    alert(`Создано рецептов: ${newRecipes.length}`);
  }

  function getPdfPageTextFromItems(items) {
    const positioned = items
      .map((item) => ({
        text: item.str,
        x: item.transform?.[4] || 0,
        y: Math.round(item.transform?.[5] || 0),
      }))
      .filter((item) => item.text && item.text.trim());

    positioned.sort((a, b) => {
      if (Math.abs(b.y - a.y) > 3) return b.y - a.y;
      return a.x - b.x;
    });

    const lines = [];

    positioned.forEach((item) => {
      const lastLine = lines[lines.length - 1];

      if (!lastLine || Math.abs(lastLine.y - item.y) > 3) {
        lines.push({
          y: item.y,
          parts: [item],
        });
      } else {
        lastLine.parts.push(item);
      }
    });

    return lines
      .map((line) =>
        line.parts
          .sort((a, b) => a.x - b.x)
          .map((part) => part.text)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim()
      )
      .filter(Boolean)
      .join("\n");
  }

  async function renderPdfPageToImage(page, scale = 1.2) {
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    return canvas.toDataURL("image/jpeg", 0.82);
  }

  async function extractTextFromPdf(file) {
    const arrayBuffer = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
    }).promise;

    let textFromPdf = "";
    const pageImages = [];
    const pageTexts = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      setRecognitionStatus(`Читаю PDF: страница ${pageNumber} из ${pdf.numPages}`);

      const page = await pdf.getPage(pageNumber);
      const pageImage = await renderPdfPageToImage(page, 1.15);
      pageImages.push(pageImage);

      const textContent = await page.getTextContent();
      const pageText = getPdfPageTextFromItems(textContent.items);

      pageTexts.push(pageText);
      textFromPdf += `\n\n--- СТРАНИЦА ${pageNumber} ---\n${pageText}`;
    }

    if (textFromPdf.replace(/--- СТРАНИЦА \d+ ---/g, "").trim().length > 30) {
      return {
        text: textFromPdf.trim(),
        pageImages,
        pageTexts,
      };
    }

    let recognizedText = "";

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      setRecognitionStatus(
        `PDF похож на скан. Распознаю страницу ${pageNumber} из ${pdf.numPages}...`
      );

      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({
        scale: 2,
      });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;

      const result = await Tesseract.recognize(canvas, "rus+eng");

      const pageText = result?.data?.text || "";
      pageTexts[pageNumber - 1] = pageText;
      recognizedText += `\n\n--- СТРАНИЦА ${pageNumber} ---\n${pageText}`;
    }

    return {
      text: recognizedText.trim(),
      pageImages,
      pageTexts,
    };
  }

  async function handleRecipeUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setRecognitionStatus("Загружаю файл...");
    setRecognitionText("");
    setDetectedRecipes([]);

    if (file.type.startsWith("text/") || file.name.endsWith(".md") || file.name.endsWith(".txt")) {
      const text = await file.text();
      setRecognitionText(text);
      setDetectedRecipes(splitDetectedRecipes(text, []));
      setRecognitionStatus("Текст загружен. Можно выбрать рецепт или создать черновик.");
      return;
    }

    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      try {
        setIsRecognizing(true);
        setRecognitionStatus("Читаю PDF...");

        const pdfData = await extractTextFromPdf(file);
        const text = pdfData.text || "";
        const foundRecipes = splitDetectedRecipes(text, pdfData.pageImages || []);

        setRecognitionText(text);
        setDetectedRecipes(foundRecipes);

        setRecognitionStatus(
          foundRecipes.length > 1
            ? `PDF распознан. Найдено рецептов: ${foundRecipes.length}. Выбери нужный.`
            : text
            ? "PDF распознан. Проверь текст, выбери рецепт или создай черновик."
            : "Не удалось найти текст в PDF."
        );
      } catch {
        setRecognitionStatus("Не удалось распознать PDF. Попробуй другой файл или вставь текст рецепта вручную.");
      } finally {
        setIsRecognizing(false);
      }

      return;
    }

    if (file.type.startsWith("image/")) {
      try {
        setIsRecognizing(true);
        setRecognitionStatus("Распознаю текст на изображении...");

        const result = await Tesseract.recognize(file, "rus+eng", {
          logger: (message) => {
            if (message.status === "recognizing text") {
              setRecognitionStatus(`Распознаю текст: ${Math.round((message.progress || 0) * 100)}%`);
            }
          },
        });

        const text = result?.data?.text || "";
        const foundRecipes = splitDetectedRecipes(text, []);

        setRecognitionText(text);
        setDetectedRecipes(foundRecipes);

        setRecognitionStatus(
          foundRecipes.length > 1
            ? `Текст распознан. Найдено рецептов: ${foundRecipes.length}.`
            : text
            ? "Текст распознан. Проверь его и создай рецепт."
            : "Не удалось найти текст на изображении."
        );
      } catch {
        setRecognitionStatus("Не удалось распознать изображение. Можно вставить текст рецепта вручную ниже.");
      } finally {
        setIsRecognizing(false);
      }

      return;
    }

    setRecognitionStatus("Этот формат пока не поддерживается. Загрузи фото, PDF, .txt или .md файл.");
  }

  function handleRecipeImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Выбери файл изображения.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setForm((current) => ({
        ...current,
        image: reader.result,
        imageCrop: { zoom: 1, x: 50, y: 50 },
      }));
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function removeRecipeImage() {
    setForm((current) => ({
      ...current,
      image: "",
      imageCrop: { zoom: 1, x: 50, y: 50 },
    }));
  }

  function updateRecipeImageCrop(field, value) {
    setForm((current) => ({
      ...current,
      imageCrop: {
        ...(current.imageCrop || { zoom: 1, x: 50, y: 50 }),
        [field]: Number(value),
      },
    }));
  }

  function startEditingRecipe(recipe) {
    setEditingRecipeId(recipe.id);
    setForm({
      title: recipe.title || "",
      description: recipe.description || "",
      image: recipe.image || "",
      imageCrop: recipe.imageCrop || { zoom: 1, x: 50, y: 50 },
      time: recipe.time || "",
      mealCategory: recipe.mealCategory || "any",
      dishType: recipe.dishType || "any",
      servings: recipe.servings || 1,
      ingredients: recipe.ingredients
        .map((item) => formatIngredient(item).replace(" — ", " "))
        .join("\n"),
      steps: recipe.steps || "",
    });
    setActiveTab("add");
  }

  function cancelEditingRecipe() {
    setEditingRecipeId(null);
    setForm({ title: "", description: "", image: "", imageCrop: { zoom: 1, x: 50, y: 50 }, time: "", mealCategory: "any", dishType: "any", servings: 2, ingredients: "", steps: "" });
  }

  function addRecipe(event) {
    event.preventDefault();

    const ingredients = splitIngredients(form.ingredients);
    if (!form.title.trim() || ingredients.length === 0) return;

    const recipeData = {
      title: form.title.trim(),
      description: form.description.trim(),
      image: form.image || "",
      imageCrop: form.imageCrop || { zoom: 1, x: 50, y: 50 },
      time: form.time.trim(),
      mealCategory: form.mealCategory || "any",
      dishType: form.dishType || "any",
      servings: Number(form.servings) || 1,
      ingredients,
      steps: form.steps.trim(),
    };

    if (editingRecipeId) {
      setRecipes((current) =>
        current.map((recipe) =>
          recipe.id === editingRecipeId
            ? {
                ...recipe,
                ...recipeData,
              }
            : recipe
        )
      );
      setSelectedRecipeId(editingRecipeId);
      setEditingRecipeId(null);
    } else {
      const newRecipe = {
        id: crypto.randomUUID(),
        ...recipeData,
      };

      setRecipes((current) => [newRecipe, ...current]);
      setSelectedRecipeId(newRecipe.id);
    }

    setForm({ title: "", description: "", image: "", imageCrop: { zoom: 1, x: 50, y: 50 }, time: "", mealCategory: "any", dishType: "any", servings: 2, ingredients: "", steps: "" });
    setActiveTab("recipes");
  }

  function deleteRecipe(id) {
    setRecipes((current) => current.filter((recipe) => recipe.id !== id));

    setMenu((current) => {
      const next = normalizeMenu(structuredClone(current));

      weekDays.forEach((day) => {
        mealTypes.forEach((meal) => {
          if (next[day][meal].recipeId === id) {
            next[day][meal].recipeId = "";
          }

          Object.keys(next[day][meal].builder).forEach((partKey) => {
            if (next[day][meal].builder[partKey] === id) {
              next[day][meal].builder[partKey] = "";
            }
          });
        });
      });

      return next;
    });
  }

  function addPantryFromForm(event) {
    event.preventDefault();

    const item = makeIngredient(pantryForm.name, pantryForm.amount, pantryForm.unit);
    if (!item || item.amount <= 0) return;

    setPantry((current) => [...current, item]);
    setPantryForm({ name: "", amount: "", unit: pantryForm.unit });
  }

  function addIngredientsQuick() {
    const nextItems = splitIngredients(ingredientInput);
    if (!nextItems.length) return;
    setPantry((current) => [...current, ...nextItems]);
    setIngredientInput("");
  }

  function removePantryItem(indexToRemove) {
    setPantry((current) => current.filter((_, index) => index !== indexToRemove));
  }

  function updateMenuMealMode(day, meal, mode) {
    setMenu((current) => {
      const normalized = normalizeMenu(current);
      return {
        ...normalized,
        [day]: {
          ...normalized[day],
          [meal]: {
            ...normalized[day][meal],
            mode,
          },
        },
      };
    });
  }

  function updateMenuRecipe(day, meal, recipeId) {
    setMenu((current) => {
      const normalized = normalizeMenu(current);
      return {
        ...normalized,
        [day]: {
          ...normalized[day],
          [meal]: {
            ...normalized[day][meal],
            mode: "recipe",
            recipeId,
          },
        },
      };
    });
  }

  function updateMenuBuilderPart(day, meal, partKey, recipeId) {
    setMenu((current) => {
      const normalized = normalizeMenu(current);
      return {
        ...normalized,
        [day]: {
          ...normalized[day],
          [meal]: {
            ...normalized[day][meal],
            mode: "builder",
            builder: {
              ...normalized[day][meal].builder,
              [partKey]: recipeId,
            },
          },
        },
      };
    });
  }

  function autoFillMenu() {
    const sortedRecipes = [...recipeMatches].sort((a, b) => b.score - a.score);
    if (!sortedRecipes.length) return;

    const next = createEmptyMenu();
    const counters = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      any: 0,
    };

    function pickRecipeForMeal(meal) {
      const category = MEAL_TYPE_TO_CATEGORY[meal] || "any";
      const categoryRecipes = sortedRecipes.filter(
        (recipe) => (recipe.mealCategory || "any") === category
      );
      const anyRecipes = sortedRecipes.filter(
        (recipe) => !recipe.mealCategory || recipe.mealCategory === "any"
      );

      const pool = categoryRecipes.length ? categoryRecipes : anyRecipes.length ? anyRecipes : sortedRecipes;
      const counterKey = categoryRecipes.length ? category : "any";
      const picked = pool[counters[counterKey] % pool.length];
      counters[counterKey] += 1;

      return picked?.id || "";
    }

    weekDays.forEach((day) => {
      mealTypes.forEach((meal) => {
        next[day][meal] = {
          mode: "recipe",
          recipeId: pickRecipeForMeal(meal),
          builder: {
            salad: "",
            protein: "",
            carbs: "",
            extra: "",
          },
        };
      });
    });

    setMenu(next);
    setActiveTab("menu");
  }

  function getRecipeTitle(id) {
    return recipes.find((recipe) => recipe.id === id)?.title || "";
  }

  function getRecipesForBuilderPart(part) {
    return recipeMatches.filter((recipe) =>
      part.dishTypes.includes(recipe.dishType || "any")
    );
  }

  function formatMenuMealSummary(mealPlan) {
    const ids = getMenuMealRecipeIds(mealPlan);
    if (!ids.length) return "";

    return ids
      .map((id) => getRecipeTitle(id))
      .filter(Boolean)
      .join(" + ");
  }

  return (
    <div className="app">
      <div className="container">
        <header className="hero">
          <div>
            <div className="label">
              <ChefHat size={18} />
              Планировщик рецептов
            </div>

            <h1>Меню на неделю из твоих продуктов</h1>

            <p>
              Добавляй рецепты, загружай фото и PDF, учитывай граммовки, считай
              КБЖУ, витамины, минералы и список покупок.
            </p>
          </div>

          <div className="hero-actions">
            <Button onClick={autoFillMenu}>
              <Sparkles size={20} />
              Заполнить меню
            </Button>

            <button type="button" className="backup-button" onClick={exportAppData}>
              <Download size={18} />
              Скачать backup
            </button>

            <label className="backup-button import-backup">
              <UploadCloud size={18} />
              Импорт backup
              <input type="file" accept="application/json,.json" onChange={importAppData} />
            </label>
          </div>
        </header>

        <section className="stats-grid">
          <StatCard icon={<ChefHat />} label="Рецептов" value={recipes.length} />
          <StatCard icon={<Carrot />} label="Продуктов дома" value={pantry.length} />
          <StatCard icon={<CalendarDays />} label="Блюд в меню" value={Object.values(menu).flatMap((day) => Object.values(day)).filter(Boolean).length} />
          <StatCard icon={<ShoppingBasket />} label="Нужно купить" value={shoppingList.length} />
        </section>

        <nav className="tabs">
          {[
            ["recipes", "Рецепты"],
            ["add", "Добавить рецепт"],
            ["recognize", "Распознать"],
            ["pantry", "Продукты дома"],
            ["menu", "Меню"],
            ["shopping", "Покупки"],
            ["units", "Единицы"],
          ].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} className={activeTab === id ? "active" : ""}>
              {label}
            </button>
          ))}
        </nav>

        {activeTab === "recipes" && (
          <section className="section">
            <div className="search-box">
              <Search size={20} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Найти рецепт или ингредиент..."
              />
            </div>

            <div className="recipes-layout">
              <aside className="recipes-list-panel">
                <div className="recipes-list-heading">
                  <h2>Все рецепты</h2>
                  <span>{recipeMatches.length}</span>
                </div>

                <div className="recipes-list">
                  {recipeMatches.map((recipe) => {
                    const portionNutrition = divideNutrition(
                      calculateRecipeNutrition(recipe),
                      recipe.servings
                    );

                    return (
                      <button
                        key={recipe.id}
                        className={`recipe-list-item ${
                          selectedRecipe?.id === recipe.id ? "active" : ""
                        }`}
                        onClick={() => setSelectedRecipeId(recipe.id)}
                      >
                        <div>
                          <strong>{recipe.title}</strong>
                          <span>
                            {getMealCategoryLabel(recipe.mealCategory || "any")} · {getDishTypeLabel(recipe.dishType || "any")} · {recipe.time || "Без времени"} · {recipe.servings || 1} порц. · {recipe.score}%
                          </span>
                        </div>
                        <b>{portionNutrition.calories} ккал</b>
                      </button>
                    );
                  })}
                </div>
              </aside>

              <main className="recipe-detail-panel">
                {selectedRecipe ? (
                  <RecipeCard
                    recipe={selectedRecipe}
                    onEdit={() => startEditingRecipe(selectedRecipe)}
                    onDelete={() => {
                      deleteRecipe(selectedRecipe.id);
                      setSelectedRecipeId(null);
                    }}
                  />
                ) : (
                  <div className="empty-recipe-state">
                    <ChefHat size={42} />
                    <h3>Рецепт не выбран</h3>
                    <p>Выбери рецепт из списка слева, чтобы открыть подробную карточку.</p>
                  </div>
                )}
              </main>
            </div>
          </section>
        )}

        {activeTab === "add" && (
          <section className="card section">
            <form onSubmit={addRecipe} className="form">
              <div className="form-heading">
                <div>
                  <h2>{editingRecipeId ? "Редактировать рецепт" : "Добавить рецепт"}</h2>
                  <p className="muted">
                    {editingRecipeId
                      ? "Измени данные и нажми «Сохранить изменения»."
                      : "Добавь новый рецепт вручную."}
                  </p>
                </div>

                {editingRecipeId && (
                  <button type="button" className="cancel-edit-button" onClick={cancelEditingRecipe}>
                    <X size={18} />
                    Отменить
                  </button>
                )}
              </div>

              <div className="recipe-main-fields dish-type-fields">
                <Field label="Название">
                  <input className="input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Например, салат с брокколи" />
                </Field>

                <Field label="Подходит для">
                  <select className="input" value={form.mealCategory} onChange={(event) => setForm({ ...form, mealCategory: event.target.value })}>
                    {MEAL_CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Тип блюда">
                  <select className="input" value={form.dishType} onChange={(event) => setForm({ ...form, dishType: event.target.value })}>
                    {DISH_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Время готовки">
                  <input className="input" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} placeholder="30 мин" />
                </Field>
              </div>

              <Field label="Краткое описание">
                <input className="input" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Полезный салат на обед" />
              </Field>

              <div className="recipe-image-field">
                <div>
                  <span className="recipe-image-label">Фото рецепта</span>
                  <p className="muted">Можно добавить фото готового блюда или страницы рецепта.</p>
                </div>

                <div className="recipe-image-controls">
                  <label className="image-upload-button">
                    <Upload size={18} />
                    Выбрать фото
                    <input type="file" accept="image/*" onChange={handleRecipeImageUpload} />
                  </label>

                  {form.image && (
                    <button type="button" className="remove-image-button" onClick={removeRecipeImage}>
                      Удалить фото
                    </button>
                  )}
                </div>

                {form.image && (
                  <div className="recipe-image-editor">
                    <div className="recipe-image-preview crop-preview">
                      <img
                        src={form.image}
                        alt="Предпросмотр рецепта"
                        style={{
                          transform: `scale(${form.imageCrop?.zoom || 1})`,
                          transformOrigin: `${form.imageCrop?.x ?? 50}% ${form.imageCrop?.y ?? 50}%`,
                        }}
                      />
                    </div>

                    <div className="crop-controls">
                      <label>
                        Масштаб
                        <input
                          type="range"
                          min="1"
                          max="2.5"
                          step="0.05"
                          value={form.imageCrop?.zoom || 1}
                          onChange={(event) => updateRecipeImageCrop("zoom", event.target.value)}
                        />
                      </label>

                      <label>
                        Положение по горизонтали
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={form.imageCrop?.x ?? 50}
                          onChange={(event) => updateRecipeImageCrop("x", event.target.value)}
                        />
                      </label>

                      <label>
                        Положение по вертикали
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={form.imageCrop?.y ?? 50}
                          onChange={(event) => updateRecipeImageCrop("y", event.target.value)}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="ingredients-form-grid">
                <Field label="Ингредиенты построчно с количеством">
                  <textarea className="input textarea-small" value={form.ingredients} onChange={(event) => setForm({ ...form, ingredients: event.target.value })} placeholder={`Свекла 1 шт\nОгурец 1 шт\nАпельсин 1 шт\nРукола 50 г\nБрокколи 100 г\nОливковое масло 1 ст.л`} />
                </Field>

                <Field label="Порции">
                  <input className="input" type="number" min="1" value={form.servings} onChange={(event) => setForm({ ...form, servings: event.target.value })} />
                </Field>
              </div>

              <Field label="Шаги приготовления">
                <textarea className="input textarea-medium" value={form.steps} onChange={(event) => setForm({ ...form, steps: event.target.value })} placeholder="Опиши процесс приготовления..." />
              </Field>

              <Button type="submit">
                <Save size={20} />
                {editingRecipeId ? "Сохранить изменения" : "Сохранить рецепт"}
              </Button>
            </form>
          </section>
        )}

        {activeTab === "recognize" && (
          <section className="card section">
            <h2>Загрузка и распознавание рецепта</h2>

            <p className="muted">
              Загрузи фото рецепта, PDF, .txt или .md файл. Если в PDF несколько рецептов,
              сайт попробует показать их отдельным списком.
            </p>

            <label className="upload-box">
              <Upload size={42} />
              <strong>Выбрать файл с рецептом</strong>
              <span>Фото, PDF, .txt или .md</span>
              <input type="file" accept="image/*,.pdf,.txt,.md,application/pdf,text/plain,text/markdown" onChange={handleRecipeUpload} />
            </label>

            {detectedRecipes.length > 1 && (
              <div className="detected-recipes">
                <div className="detected-recipes-header">
                  <h3>Найденные рецепты</h3>

                  <button type="button" onClick={createAllDetectedRecipes}>
                    Создать все рецепты
                  </button>
                </div>

                <div className="detected-recipes-grid">
                  {detectedRecipes.map((recipe, index) => (
                    <button key={recipe.id} className="detected-recipe-card" onClick={() => { setRecognitionText(recipe.text); parseRecipeText(recipe.text, recipe.image); }}>
                      {recipe.image && <img src={recipe.image} alt={recipe.title || `Рецепт ${index + 1}`} />}
                      <strong>{recipe.title || `Рецепт ${index + 1}`}</strong>
                      <small>Страница {recipe.pageNumber || index + 1}</small>
                      <span>{stripPageMarkers(recipe.text).slice(0, 160)}...</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="recognition-grid">
              <Field label="Распознанный или вставленный текст">
                <textarea
                  className="input textarea-large"
                  value={recognitionText}
                  onChange={(event) => {
                    const text = event.target.value;
                    setRecognitionText(text);
                    setDetectedRecipes(splitDetectedRecipes(text, []));
                  }}
                  placeholder={`Можно вставить текст вручную, например:\n\nОмлет с сыром\nИнгредиенты:\n- яйца 3 шт\n- сыр 50 г\n- молоко 50 мл\nПриготовление:\nВзбей яйца, добавь сыр и молоко, готовь 8 минут.`}
                />
              </Field>

              <aside className="status-box">
                <div className="status-title">
                  {isRecognizing ? <Loader2 className="spin" size={20} /> : <FileText size={20} />}
                  <strong>Статус</strong>
                </div>

                <p>{recognitionStatus || "Файл ещё не выбран."}</p>

                <Button onClick={() => parseRecipeText(recognitionText, detectedRecipes[0]?.image || "")} disabled={!recognitionText.trim() || isRecognizing}>
                  <Wand2 size={20} />
                  Создать черновик
                </Button>

                <small>Если сайт нашёл несколько рецептов, выбери нужный рецепт из списка выше.</small>
              </aside>
            </div>
          </section>
        )}

        {activeTab === "pantry" && (
          <section className="card section">
            <h2>Продукты дома</h2>
            <p className="muted">
              Теперь можно добавлять продукт удобнее: отдельно название, количество и единицу.
            </p>

            <form className="pantry-form" onSubmit={addPantryFromForm}>
              <Field label="Продукт">
                <input
                  className="input"
                  value={pantryForm.name}
                  onChange={(event) => setPantryForm({ ...pantryForm, name: event.target.value })}
                  placeholder="Например, брокколи"
                />
              </Field>

              <Field label="Количество">
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.1"
                  value={pantryForm.amount}
                  onChange={(event) => setPantryForm({ ...pantryForm, amount: event.target.value })}
                  placeholder="100"
                />
              </Field>

              <Field label="Единица">
                <select className="input" value={pantryForm.unit} onChange={(event) => setPantryForm({ ...pantryForm, unit: event.target.value })}>
                  {UNIT_OPTIONS.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </Field>

              <Button type="submit">
                <Plus size={20} />
                Добавить
              </Button>
            </form>

            <details className="quick-add">
              <summary>Быстро добавить списком</summary>
              <div className="add-row">
                <input className="input" value={ingredientInput} onChange={(event) => setIngredientInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addIngredientsQuick(); }} placeholder="Например: брокколи 50 г, яйцо 6 шт, молоко 1 л" />
                <Button onClick={addIngredientsQuick}>
                  <Plus size={20} />
                  Добавить
                </Button>
              </div>
            </details>

            <div className="pantry-list">
              {pantry.map((item, index) => (
                <div key={`${getIngredientName(item)}-${index}`} className="pantry-item">
                  <div>
                    <strong>{item.name}</strong>
                    <span>{Number(item.amount.toFixed?.(2) ?? item.amount)} {item.unit}</span>
                  </div>
                  <button onClick={() => removePantryItem(index)} title="Удалить продукт">×</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "menu" && (
          <section className="section">
            <div className="section-heading">
              <h2>Меню на неделю</h2>
              <Button onClick={() => setMenu(createEmptyMenu())} variant="secondary">Очистить меню</Button>
            </div>

            <div className="menu-list">
              {weekDays.map((day) => (
                <div key={day} className="card day-card">
                  <h3>{day}</h3>

                  <div className="meal-grid meal-builder-grid">
                    {mealTypes.map((meal) => {
                      const mealPlan = normalizeMenu(menu)[day][meal];

                      return (
                        <div key={meal} className="meal-box meal-builder-box">
                          <div className="meal-box-header">
                            <label>{meal}</label>
                            <span>{formatMenuMealSummary(mealPlan) || "Не выбрано"}</span>
                          </div>

                          <div className="meal-mode-switch">
                            <button
                              type="button"
                              className={mealPlan.mode === "recipe" ? "active" : ""}
                              onClick={() => updateMenuMealMode(day, meal, "recipe")}
                            >
                              Рецепт
                            </button>

                            <button
                              type="button"
                              className={mealPlan.mode === "builder" ? "active" : ""}
                              onClick={() => updateMenuMealMode(day, meal, "builder")}
                            >
                              Конструктор
                            </button>
                          </div>

                          {mealPlan.mode === "recipe" ? (
                            <select
                              className="input"
                              value={mealPlan.recipeId || ""}
                              onChange={(event) =>
                                updateMenuRecipe(day, meal, event.target.value)
                              }
                            >
                              <option value="">Выбрать конкретный рецепт</option>
                              {recipeMatches.map((recipe) => (
                                <option key={recipe.id} value={recipe.id}>
                                  {recipe.title} — {getMealCategoryLabel(recipe.mealCategory || "any")} — {getDishTypeLabel(recipe.dishType || "any")} — {recipe.score}%
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="builder-parts">
                              {MEAL_BUILDER_PARTS.map((part) => {
                                const options = getRecipesForBuilderPart(part);

                                return (
                                  <div key={part.key} className="builder-part">
                                    <label>{part.label}</label>

                                    <select
                                      className="input"
                                      value={mealPlan.builder?.[part.key] || ""}
                                      onChange={(event) =>
                                        updateMenuBuilderPart(day, meal, part.key, event.target.value)
                                      }
                                    >
                                      <option value="">Не выбрано</option>
                                      {options.length > 0 ? (
                                        options.map((recipe) => (
                                          <option key={recipe.id} value={recipe.id}>
                                            {recipe.title} — {recipe.score}%
                                          </option>
                                        ))
                                      ) : (
                                        <option disabled value="">
                                          Нет рецептов этой категории
                                        </option>
                                      )}
                                    </select>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "shopping" && (
          <section className="card section">
            <h2>Список покупок</h2>

            {shoppingList.length === 0 ? (
              <p className="muted">Пока ничего докупать не нужно или меню ещё не заполнено.</p>
            ) : (
              <div className="shopping-grid">
                {shoppingList.map((item) => (
                  <label key={`${item.name}-${item.unit}`} className="shopping-item">
                    <input type="checkbox" />
                    <span>
                      <strong>{item.name}</strong> — купить <strong>{Number(item.buyAmount.toFixed(2))} {item.unit}</strong>
                      <br />
                      <small>Нужно: {Number(item.amount.toFixed(2))} {item.unit}, есть: {Number(item.available.toFixed(2))} {item.unit}</small>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "units" && (
          <section className="card section">
            <h2>Таблица соответствия единиц измерения</h2>

            <p className="muted">
              Эта таблица используется для пересчёта ингредиентов, списка покупок и пищевой ценности.
              Для штук и ложек значения примерные, потому что вес зависит от конкретного продукта.
            </p>

            <div className="units-table">
              {Object.entries(UNIT_CONVERSIONS).map(([unit, data]) => (
                <div key={unit} className="unit-row">
                  <strong>{unit}</strong>
                  <span>{data.label}</span>
                  <span>{data.example}</span>
                </div>
              ))}
            </div>

            <h3>Примерный вес 1 штуки продукта</h3>

            <div className="units-table">
              {Object.entries(PIECE_GRAMS).map(([name, grams]) => (
                <div key={name} className="unit-row">
                  <strong>{name}</strong>
                  <span>1 шт</span>
                  <span>≈ {grams} г</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
