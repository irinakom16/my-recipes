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
  Database,
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

const PP_NUTRITION_DB = {
  "овсяные хлопья": {
    "displayName": "Овсяные хлопья",
    "calories": 389,
    "protein": 16.9,
    "fat": 6.9,
    "carbs": 66.3,
    "fiber": 10.6,
    "sugar": 1.0,
    "sodium": 2,
    "potassium": 429,
    "calcium": 54,
    "iron": 4.7,
    "magnesium": 177,
    "vitaminC": 0,
    "vitaminA": 0,
    "folate": 56
  },
  "овсянка": {
    "displayName": "Овсянка",
    "calories": 389,
    "protein": 16.9,
    "fat": 6.9,
    "carbs": 66.3,
    "fiber": 10.6,
    "sugar": 1.0,
    "sodium": 2,
    "potassium": 429,
    "calcium": 54,
    "iron": 4.7,
    "magnesium": 177,
    "vitaminC": 0,
    "vitaminA": 0,
    "folate": 56
  },
  "гречка": {
    "displayName": "Гречка",
    "calories": 343,
    "protein": 13.3,
    "fat": 3.4,
    "carbs": 71.5,
    "fiber": 10.0,
    "sugar": 0,
    "sodium": 1,
    "potassium": 460,
    "calcium": 18,
    "iron": 2.2,
    "magnesium": 231,
    "vitaminC": 0,
    "vitaminA": 0,
    "folate": 30
  },
  "киноа": {
    "displayName": "Киноа",
    "calories": 368,
    "protein": 14.1,
    "fat": 6.1,
    "carbs": 64.2,
    "fiber": 7.0,
    "sugar": 0,
    "sodium": 5,
    "potassium": 563,
    "calcium": 47,
    "iron": 4.6,
    "magnesium": 197,
    "vitaminC": 0,
    "vitaminA": 1,
    "folate": 184
  },
  "булгур": {
    "displayName": "Булгур",
    "calories": 342,
    "protein": 12.3,
    "fat": 1.3,
    "carbs": 75.9,
    "fiber": 12.5,
    "sugar": 0.4,
    "sodium": 17,
    "potassium": 410,
    "calcium": 35,
    "iron": 2.5,
    "magnesium": 164,
    "vitaminC": 0,
    "vitaminA": 0,
    "folate": 27
  },
  "перловка": {
    "displayName": "Перловка",
    "calories": 352,
    "protein": 9.9,
    "fat": 1.2,
    "carbs": 77.7,
    "fiber": 15.6,
    "sugar": 0.8,
    "sodium": 9,
    "potassium": 280,
    "calcium": 29,
    "iron": 2.5,
    "magnesium": 79,
    "vitaminC": 0,
    "vitaminA": 0,
    "folate": 23
  },
  "рис бурый": {
    "displayName": "Рис бурый",
    "calories": 370,
    "protein": 7.9,
    "fat": 2.9,
    "carbs": 77.2,
    "fiber": 3.5,
    "sugar": 0.9,
    "sodium": 7,
    "potassium": 223,
    "calcium": 23,
    "iron": 1.5,
    "magnesium": 143,
    "vitaminC": 0,
    "vitaminA": 0,
    "folate": 20
  },
  "бурый рис": {
    "displayName": "Бурый рис",
    "calories": 370,
    "protein": 7.9,
    "fat": 2.9,
    "carbs": 77.2,
    "fiber": 3.5,
    "sugar": 0.9,
    "sodium": 7,
    "potassium": 223,
    "calcium": 23,
    "iron": 1.5,
    "magnesium": 143,
    "vitaminC": 0,
    "vitaminA": 0,
    "folate": 20
  },
  "картофель": {
    "displayName": "Картофель",
    "calories": 77,
    "protein": 2.0,
    "fat": 0.1,
    "carbs": 17.5,
    "fiber": 2.2,
    "sugar": 0.8,
    "sodium": 6,
    "potassium": 425,
    "calcium": 12,
    "iron": 0.8,
    "magnesium": 23,
    "vitaminC": 19.7,
    "vitaminA": 0,
    "folate": 15
  },
  "батат": {
    "displayName": "Батат",
    "calories": 86,
    "protein": 1.6,
    "fat": 0.1,
    "carbs": 20.1,
    "fiber": 3.0,
    "sugar": 4.2,
    "sodium": 55,
    "potassium": 337,
    "calcium": 30,
    "iron": 0.6,
    "magnesium": 25,
    "vitaminC": 2.4,
    "vitaminA": 709,
    "folate": 11
  },
  "хлеб цельнозерновой": {
    "displayName": "Хлеб цельнозерновой",
    "calories": 247,
    "protein": 13.0,
    "fat": 4.2,
    "carbs": 41.0,
    "fiber": 7.0,
    "sugar": 6.0,
    "sodium": 400,
    "potassium": 250,
    "calcium": 107,
    "iron": 2.5,
    "magnesium": 76,
    "vitaminC": 0,
    "vitaminA": 0,
    "folate": 44
  },
  "лаваш": {
    "displayName": "Лаваш",
    "calories": 275,
    "protein": 9.1,
    "fat": 1.2,
    "carbs": 56.0,
    "fiber": 2.2,
    "sugar": 1.0,
    "sodium": 530,
    "potassium": 120,
    "calcium": 20,
    "iron": 2.6,
    "magnesium": 25,
    "vitaminC": 0,
    "vitaminA": 0,
    "folate": 35
  },
  "куриная грудка": {
    "displayName": "Куриная грудка",
    "calories": 165,
    "protein": 31.0,
    "fat": 3.6,
    "carbs": 0,
    "fiber": 0,
    "sugar": 0,
    "sodium": 74,
    "potassium": 256,
    "calcium": 15,
    "iron": 1.0,
    "magnesium": 29,
    "vitaminC": 0,
    "vitaminA": 6,
    "folate": 4
  },
  "филе курицы": {
    "displayName": "Филе курицы",
    "calories": 165,
    "protein": 31.0,
    "fat": 3.6,
    "carbs": 0,
    "fiber": 0,
    "sugar": 0,
    "sodium": 74,
    "potassium": 256,
    "calcium": 15,
    "iron": 1.0,
    "magnesium": 29,
    "vitaminC": 0,
    "vitaminA": 6,
    "folate": 4
  },
  "индейка": {
    "displayName": "Индейка",
    "calories": 135,
    "protein": 29.0,
    "fat": 1.7,
    "carbs": 0,
    "fiber": 0,
    "sugar": 0,
    "sodium": 65,
    "potassium": 239,
    "calcium": 11,
    "iron": 1.2,
    "magnesium": 30,
    "vitaminC": 0,
    "vitaminA": 0,
    "folate": 7
  },
  "говядина": {
    "displayName": "Говядина постная",
    "calories": 217,
    "protein": 26.1,
    "fat": 11.8,
    "carbs": 0,
    "fiber": 0,
    "sugar": 0,
    "sodium": 60,
    "potassium": 318,
    "calcium": 18,
    "iron": 2.6,
    "magnesium": 21,
    "vitaminC": 0,
    "vitaminA": 0,
    "folate": 9
  },
  "тунец": {
    "displayName": "Тунец",
    "calories": 132,
    "protein": 28.0,
    "fat": 1.3,
    "carbs": 0,
    "fiber": 0,
    "sugar": 0,
    "sodium": 47,
    "potassium": 522,
    "calcium": 37,
    "iron": 1.3,
    "magnesium": 50,
    "vitaminC": 0,
    "vitaminA": 20,
    "folate": 2
  },
  "лосось": {
    "displayName": "Лосось",
    "calories": 208,
    "protein": 20.4,
    "fat": 13.4,
    "carbs": 0,
    "fiber": 0,
    "sugar": 0,
    "sodium": 59,
    "potassium": 363,
    "calcium": 9,
    "iron": 0.3,
    "magnesium": 27,
    "vitaminC": 3.9,
    "vitaminA": 58,
    "folate": 25
  },
  "семга": {
    "displayName": "Сёмга",
    "calories": 208,
    "protein": 20.4,
    "fat": 13.4,
    "carbs": 0,
    "fiber": 0,
    "sugar": 0,
    "sodium": 59,
    "potassium": 363,
    "calcium": 9,
    "iron": 0.3,
    "magnesium": 27,
    "vitaminC": 3.9,
    "vitaminA": 58,
    "folate": 25
  },
  "треска": {
    "displayName": "Треска",
    "calories": 82,
    "protein": 17.8,
    "fat": 0.7,
    "carbs": 0,
    "fiber": 0,
    "sugar": 0,
    "sodium": 54,
    "potassium": 413,
    "calcium": 16,
    "iron": 0.4,
    "magnesium": 32,
    "vitaminC": 1.0,
    "vitaminA": 12,
    "folate": 7
  },
  "креветки": {
    "displayName": "Креветки",
    "calories": 99,
    "protein": 24.0,
    "fat": 0.3,
    "carbs": 0.2,
    "fiber": 0,
    "sugar": 0,
    "sodium": 111,
    "potassium": 259,
    "calcium": 70,
    "iron": 0.5,
    "magnesium": 39,
    "vitaminC": 0,
    "vitaminA": 54,
    "folate": 4
  },
  "яичный белок": {
    "displayName": "Яичный белок",
    "calories": 52,
    "protein": 10.9,
    "fat": 0.2,
    "carbs": 0.7,
    "fiber": 0,
    "sugar": 0.7,
    "sodium": 166,
    "potassium": 163,
    "calcium": 7,
    "iron": 0.1,
    "magnesium": 11,
    "vitaminC": 0,
    "vitaminA": 0,
    "folate": 4
  },
  "творог": {
    "displayName": "Творог 5%",
    "calories": 121,
    "protein": 17.0,
    "fat": 5.0,
    "carbs": 3.0,
    "fiber": 0,
    "sugar": 2.7,
    "sodium": 40,
    "potassium": 112,
    "calcium": 120,
    "iron": 0.3,
    "magnesium": 23,
    "vitaminC": 0,
    "vitaminA": 50,
    "folate": 12
  },
  "творог обезжиренный": {
    "displayName": "Творог обезжиренный",
    "calories": 80,
    "protein": 16.5,
    "fat": 0.5,
    "carbs": 3.3,
    "fiber": 0,
    "sugar": 3.3,
    "sodium": 42,
    "potassium": 104,
    "calcium": 120,
    "iron": 0.2,
    "magnesium": 11,
    "vitaminC": 0,
    "vitaminA": 5,
    "folate": 12
  },
  "греческий йогурт": {
    "displayName": "Греческий йогурт",
    "calories": 59,
    "protein": 10.0,
    "fat": 0.4,
    "carbs": 3.6,
    "fiber": 0,
    "sugar": 3.2,
    "sodium": 36,
    "potassium": 141,
    "calcium": 110,
    "iron": 0.1,
    "magnesium": 11,
    "vitaminC": 0,
    "vitaminA": 2,
    "folate": 7
  },
  "кефир": {
    "displayName": "Кефир",
    "calories": 52,
    "protein": 3.3,
    "fat": 2.5,
    "carbs": 4.0,
    "fiber": 0,
    "sugar": 4.0,
    "sodium": 40,
    "potassium": 150,
    "calcium": 120,
    "iron": 0.1,
    "magnesium": 12,
    "vitaminC": 0.8,
    "vitaminA": 30,
    "folate": 5
  },
  "тофу": {
    "displayName": "Тофу",
    "calories": 76,
    "protein": 8.1,
    "fat": 4.8,
    "carbs": 1.9,
    "fiber": 0.3,
    "sugar": 0.6,
    "sodium": 7,
    "potassium": 121,
    "calcium": 350,
    "iron": 5.4,
    "magnesium": 30,
    "vitaminC": 0.1,
    "vitaminA": 0,
    "folate": 15
  },
  "шпинат": {
    "displayName": "Шпинат",
    "calories": 23,
    "protein": 2.9,
    "fat": 0.4,
    "carbs": 3.6,
    "fiber": 2.2,
    "sugar": 0.4,
    "sodium": 79,
    "potassium": 558,
    "calcium": 99,
    "iron": 2.7,
    "magnesium": 79,
    "vitaminC": 28.1,
    "vitaminA": 469,
    "folate": 194
  },
  "салат": {
    "displayName": "Листовой салат",
    "calories": 15,
    "protein": 1.4,
    "fat": 0.2,
    "carbs": 2.9,
    "fiber": 1.3,
    "sugar": 0.8,
    "sodium": 28,
    "potassium": 194,
    "calcium": 36,
    "iron": 0.9,
    "magnesium": 13,
    "vitaminC": 9.2,
    "vitaminA": 370,
    "folate": 38
  },
  "капуста": {
    "displayName": "Капуста белокочанная",
    "calories": 25,
    "protein": 1.3,
    "fat": 0.1,
    "carbs": 5.8,
    "fiber": 2.5,
    "sugar": 3.2,
    "sodium": 18,
    "potassium": 170,
    "calcium": 40,
    "iron": 0.5,
    "magnesium": 12,
    "vitaminC": 36.6,
    "vitaminA": 5,
    "folate": 43
  },
  "цветная капуста": {
    "displayName": "Цветная капуста",
    "calories": 25,
    "protein": 1.9,
    "fat": 0.3,
    "carbs": 5.0,
    "fiber": 2.0,
    "sugar": 1.9,
    "sodium": 30,
    "potassium": 299,
    "calcium": 22,
    "iron": 0.4,
    "magnesium": 15,
    "vitaminC": 48.2,
    "vitaminA": 0,
    "folate": 57
  },
  "кабачок": {
    "displayName": "Кабачок",
    "calories": 17,
    "protein": 1.2,
    "fat": 0.3,
    "carbs": 3.1,
    "fiber": 1.0,
    "sugar": 2.5,
    "sodium": 8,
    "potassium": 261,
    "calcium": 16,
    "iron": 0.4,
    "magnesium": 18,
    "vitaminC": 17.9,
    "vitaminA": 10,
    "folate": 24
  },
  "баклажан": {
    "displayName": "Баклажан",
    "calories": 25,
    "protein": 1.0,
    "fat": 0.2,
    "carbs": 5.9,
    "fiber": 3.0,
    "sugar": 3.5,
    "sodium": 2,
    "potassium": 229,
    "calcium": 9,
    "iron": 0.2,
    "magnesium": 14,
    "vitaminC": 2.2,
    "vitaminA": 1,
    "folate": 22
  },
  "перец болгарский": {
    "displayName": "Перец болгарский",
    "calories": 31,
    "protein": 1.0,
    "fat": 0.3,
    "carbs": 6.0,
    "fiber": 2.1,
    "sugar": 4.2,
    "sodium": 4,
    "potassium": 211,
    "calcium": 7,
    "iron": 0.4,
    "magnesium": 12,
    "vitaminC": 127.7,
    "vitaminA": 157,
    "folate": 46
  },
  "перец": {
    "displayName": "Перец болгарский",
    "calories": 31,
    "protein": 1.0,
    "fat": 0.3,
    "carbs": 6.0,
    "fiber": 2.1,
    "sugar": 4.2,
    "sodium": 4,
    "potassium": 211,
    "calcium": 7,
    "iron": 0.4,
    "magnesium": 12,
    "vitaminC": 127.7,
    "vitaminA": 157,
    "folate": 46
  },
  "шампиньоны": {
    "displayName": "Шампиньоны",
    "calories": 22,
    "protein": 3.1,
    "fat": 0.3,
    "carbs": 3.3,
    "fiber": 1.0,
    "sugar": 2.0,
    "sodium": 5,
    "potassium": 318,
    "calcium": 3,
    "iron": 0.5,
    "magnesium": 9,
    "vitaminC": 2.1,
    "vitaminA": 0,
    "folate": 17
  },
  "банан": {
    "displayName": "Банан",
    "calories": 89,
    "protein": 1.1,
    "fat": 0.3,
    "carbs": 22.8,
    "fiber": 2.6,
    "sugar": 12.2,
    "sodium": 1,
    "potassium": 358,
    "calcium": 5,
    "iron": 0.3,
    "magnesium": 27,
    "vitaminC": 8.7,
    "vitaminA": 3,
    "folate": 20
  },
  "яблоко": {
    "displayName": "Яблоко",
    "calories": 52,
    "protein": 0.3,
    "fat": 0.2,
    "carbs": 13.8,
    "fiber": 2.4,
    "sugar": 10.4,
    "sodium": 1,
    "potassium": 107,
    "calcium": 6,
    "iron": 0.1,
    "magnesium": 5,
    "vitaminC": 4.6,
    "vitaminA": 3,
    "folate": 3
  },
  "груша": {
    "displayName": "Груша",
    "calories": 57,
    "protein": 0.4,
    "fat": 0.1,
    "carbs": 15.2,
    "fiber": 3.1,
    "sugar": 9.8,
    "sodium": 1,
    "potassium": 116,
    "calcium": 9,
    "iron": 0.2,
    "magnesium": 7,
    "vitaminC": 4.3,
    "vitaminA": 1,
    "folate": 7
  },
  "клубника": {
    "displayName": "Клубника",
    "calories": 32,
    "protein": 0.7,
    "fat": 0.3,
    "carbs": 7.7,
    "fiber": 2.0,
    "sugar": 4.9,
    "sodium": 1,
    "potassium": 153,
    "calcium": 16,
    "iron": 0.4,
    "magnesium": 13,
    "vitaminC": 58.8,
    "vitaminA": 1,
    "folate": 24
  },
  "черника": {
    "displayName": "Черника",
    "calories": 57,
    "protein": 0.7,
    "fat": 0.3,
    "carbs": 14.5,
    "fiber": 2.4,
    "sugar": 10.0,
    "sodium": 1,
    "potassium": 77,
    "calcium": 6,
    "iron": 0.3,
    "magnesium": 6,
    "vitaminC": 9.7,
    "vitaminA": 3,
    "folate": 6
  },
  "нут": {
    "displayName": "Нут",
    "calories": 364,
    "protein": 19.3,
    "fat": 6.0,
    "carbs": 60.7,
    "fiber": 17.4,
    "sugar": 10.7,
    "sodium": 24,
    "potassium": 875,
    "calcium": 105,
    "iron": 6.2,
    "magnesium": 115,
    "vitaminC": 4.0,
    "vitaminA": 3,
    "folate": 557
  },
  "чечевица": {
    "displayName": "Чечевица",
    "calories": 352,
    "protein": 24.6,
    "fat": 1.1,
    "carbs": 63.4,
    "fiber": 10.7,
    "sugar": 2.0,
    "sodium": 6,
    "potassium": 677,
    "calcium": 35,
    "iron": 6.5,
    "magnesium": 47,
    "vitaminC": 4.5,
    "vitaminA": 2,
    "folate": 479
  },
  "фасоль": {
    "displayName": "Фасоль",
    "calories": 333,
    "protein": 23.4,
    "fat": 0.8,
    "carbs": 60.3,
    "fiber": 15.2,
    "sugar": 2.1,
    "sodium": 24,
    "potassium": 1406,
    "calcium": 143,
    "iron": 8.2,
    "magnesium": 140,
    "vitaminC": 4.5,
    "vitaminA": 0,
    "folate": 394
  },
  "авокадо": {
    "displayName": "Авокадо",
    "calories": 160,
    "protein": 2.0,
    "fat": 14.7,
    "carbs": 8.5,
    "fiber": 6.7,
    "sugar": 0.7,
    "sodium": 7,
    "potassium": 485,
    "calcium": 12,
    "iron": 0.6,
    "magnesium": 29,
    "vitaminC": 10,
    "vitaminA": 7,
    "folate": 81
  },
  "миндаль": {
    "displayName": "Миндаль",
    "calories": 579,
    "protein": 21.2,
    "fat": 49.9,
    "carbs": 21.6,
    "fiber": 12.5,
    "sugar": 4.4,
    "sodium": 1,
    "potassium": 733,
    "calcium": 269,
    "iron": 3.7,
    "magnesium": 270,
    "vitaminC": 0,
    "vitaminA": 0,
    "folate": 44
  },
  "грецкий орех": {
    "displayName": "Грецкий орех",
    "calories": 654,
    "protein": 15.2,
    "fat": 65.2,
    "carbs": 13.7,
    "fiber": 6.7,
    "sugar": 2.6,
    "sodium": 2,
    "potassium": 441,
    "calcium": 98,
    "iron": 2.9,
    "magnesium": 158,
    "vitaminC": 1.3,
    "vitaminA": 1,
    "folate": 98
  },
  "арахис": {
    "displayName": "Арахис",
    "calories": 567,
    "protein": 25.8,
    "fat": 49.2,
    "carbs": 16.1,
    "fiber": 8.5,
    "sugar": 4.7,
    "sodium": 18,
    "potassium": 705,
    "calcium": 92,
    "iron": 4.6,
    "magnesium": 168,
    "vitaminC": 0,
    "vitaminA": 0,
    "folate": 240
  },
  "семена чиа": {
    "displayName": "Семена чиа",
    "calories": 486,
    "protein": 16.5,
    "fat": 30.7,
    "carbs": 42.1,
    "fiber": 34.4,
    "sugar": 0,
    "sodium": 16,
    "potassium": 407,
    "calcium": 631,
    "iron": 7.7,
    "magnesium": 335,
    "vitaminC": 1.6,
    "vitaminA": 3,
    "folate": 49
  },
  "лен": {
    "displayName": "Семена льна",
    "calories": 534,
    "protein": 18.3,
    "fat": 42.2,
    "carbs": 28.9,
    "fiber": 27.3,
    "sugar": 1.6,
    "sodium": 30,
    "potassium": 813,
    "calcium": 255,
    "iron": 5.7,
    "magnesium": 392,
    "vitaminC": 0.6,
    "vitaminA": 0,
    "folate": 87
  },
  "семена льна": {
    "displayName": "Семена льна",
    "calories": 534,
    "protein": 18.3,
    "fat": 42.2,
    "carbs": 28.9,
    "fiber": 27.3,
    "sugar": 1.6,
    "sodium": 30,
    "potassium": 813,
    "calcium": 255,
    "iron": 5.7,
    "magnesium": 392,
    "vitaminC": 0.6,
    "vitaminA": 0,
    "folate": 87
  },
  "кунжут": {
    "displayName": "Кунжут",
    "calories": 573,
    "protein": 17.7,
    "fat": 49.7,
    "carbs": 23.4,
    "fiber": 11.8,
    "sugar": 0.3,
    "sodium": 11,
    "potassium": 468,
    "calcium": 975,
    "iron": 14.6,
    "magnesium": 351,
    "vitaminC": 0,
    "vitaminA": 0,
    "folate": 97
  },
  "арахисовая паста": {
    "displayName": "Арахисовая паста",
    "calories": 588,
    "protein": 25.1,
    "fat": 50.4,
    "carbs": 20.0,
    "fiber": 6.0,
    "sugar": 9.2,
    "sodium": 17,
    "potassium": 649,
    "calcium": 43,
    "iron": 1.9,
    "magnesium": 154,
    "vitaminC": 0,
    "vitaminA": 0,
    "folate": 87
  },
  "мед": {
    "displayName": "Мёд",
    "calories": 304,
    "protein": 0.3,
    "fat": 0,
    "carbs": 82.4,
    "fiber": 0.2,
    "sugar": 82.1,
    "sodium": 4,
    "potassium": 52,
    "calcium": 6,
    "iron": 0.4,
    "magnesium": 2,
    "vitaminC": 0.5,
    "vitaminA": 0,
    "folate": 2
  },
  "мёд": {
    "displayName": "Мёд",
    "calories": 304,
    "protein": 0.3,
    "fat": 0,
    "carbs": 82.4,
    "fiber": 0.2,
    "sugar": 82.1,
    "sodium": 4,
    "potassium": 52,
    "calcium": 6,
    "iron": 0.4,
    "magnesium": 2,
    "vitaminC": 0.5,
    "vitaminA": 0,
    "folate": 2
  }
};

Object.assign(NUTRITION_DB, PP_NUTRITION_DB);

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

function mapOpenFoodFactsProductToNutrition(product) {
  const n = product?.nutriments || {};

  const nutrition = {
    displayName: product?.product_name || product?.generic_name || "Продукт",
    calories: Number(n["energy-kcal_100g"] ?? n["energy-kcal"] ?? 0) || 0,
    protein: Number(n["proteins_100g"] ?? 0) || 0,
    fat: Number(n["fat_100g"] ?? 0) || 0,
    carbs: Number(n["carbohydrates_100g"] ?? 0) || 0,
    fiber: Number(n["fiber_100g"] ?? 0) || 0,
    sugar: Number(n["sugars_100g"] ?? 0) || 0,
    sodium: Number(n["sodium_100g"] ? n["sodium_100g"] * 1000 : 0) || 0,
    potassium: Number(n["potassium_100g"] ? n["potassium_100g"] * 1000 : 0) || 0,
    calcium: Number(n["calcium_100g"] ? n["calcium_100g"] * 1000 : 0) || 0,
    iron: Number(n["iron_100g"] ? n["iron_100g"] * 1000 : 0) || 0,
    magnesium: Number(n["magnesium_100g"] ? n["magnesium_100g"] * 1000 : 0) || 0,
    vitaminC: Number(n["vitamin-c_100g"] ? n["vitamin-c_100g"] * 1000 : 0) || 0,
    vitaminA: Number(n["vitamin-a_100g"] ? n["vitamin-a_100g"] * 1000000 : 0) || 0,
    folate: Number(n["folates_100g"] ? n["folates_100g"] * 1000000 : 0) || 0,
  };

  Object.keys(nutrition).forEach((key) => {
    if (typeof nutrition[key] === "number") {
      nutrition[key] = Number(nutrition[key].toFixed(2));
    }
  });

  return nutrition;
}

function getKnownProductNames() {
  return Object.keys(NUTRITION_DB).sort((a, b) => a.localeCompare(b));
}


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

  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function cleanIngredientName(name) {
  return normalizeIngredient(name)
    .replace(/\bпо вкусу\b/gi, "")
    .replace(/[—–-].*$/, "")
    .replace(/[:：]+$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseIngredientLine(line) {
  const original = String(line || "")
    .replace(/^[-•*]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!original) return null;

  const unitWords =
    "(кг|г|гр|грамм|грамма|граммов|мл|л|шт|штук|штука|штуки|ст\\.?\\s*л|ч\\.?\\s*л|зубчика?|зубчиков)";

  const amountPattern = "(\\d+(?:[.,]\\d+)?|\\d+\\s*\\/\\s*\\d+)";

  const patterns = [
    // Как мы вводим руками: "брокколи 100 г"
    {
      regex: new RegExp(`^(.+?)\\s+${amountPattern}\\s*${unitWords}\\.?$`, "i"),
      pick: (m) => ({ name: m[1], amount: m[2], unit: m[3] }),
    },

    // Встречается в рецептах: "100 г брокколи"
    {
      regex: new RegExp(`^${amountPattern}\\s*${unitWords}\\.?\\s+(.+)$`, "i"),
      pick: (m) => ({ name: m[3], amount: m[1], unit: m[2] }),
    },

    // Ошибка распознавания: "г 100 брокколи"
    {
      regex: new RegExp(`^${unitWords}\\.?\\s+${amountPattern}\\s+(.+)$`, "i"),
      pick: (m) => ({ name: m[3], amount: m[2], unit: m[1] }),
    },

    // Ошибка распознавания: "брокколи г 100"
    {
      regex: new RegExp(`^(.+?)\\s+${unitWords}\\.?\\s+${amountPattern}$`, "i"),
      pick: (m) => ({ name: m[1], amount: m[3], unit: m[2] }),
    },
  ];

  for (const pattern of patterns) {
    const match = original.match(pattern.regex);

    if (match) {
      const picked = pattern.pick(match);
      const amount = parseAmount(picked.amount) || 1;
      const unit = normalizeUnit(picked.unit || "шт");
      const name = cleanIngredientName(picked.name);

      if (name) {
        return {
          name,
          amount,
          unit,
          original,
        };
      }
    }
  }

  // Если количество не найдено, оставляем продукт как 1 шт.
  // Это лучше, чем ломать рецепт: потом можно отредактировать вручную.
  return {
    name: cleanIngredientName(original),
    amount: 1,
    unit: "шт",
    original,
    isGuessedAmount: true,
  };
}

function ingredientToInputLine(ingredient) {
  const item = typeof ingredient === "string" ? parseIngredientLine(ingredient) : ingredient;
  if (!item) return "";

  const amount = Number(item.amount || 1);
  const formattedAmount = Number.isInteger(amount) ? String(amount) : String(Number(amount.toFixed(2)));

  return `${item.name} ${formattedAmount} ${item.unit}`;
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

function hasRecognizedQuantity(ingredient) {
  const item = typeof ingredient === "string" ? parseIngredientLine(ingredient) : ingredient;
  if (!item) return false;

  const amount = Number(item.amount);
  if (!Number.isFinite(amount) || amount <= 0) return false;

  if (item.isGuessedAmount) return false;

  // Старые рецепты и вручную созданные объекты не всегда имеют original,
  // поэтому считаем их корректными, если количество уже хранится числом.
  if (!item.original) return true;

  return /\d/.test(String(item.original));
}

function getIngredientStatus(ingredient) {
  const item = typeof ingredient === "string" ? parseIngredientLine(ingredient) : ingredient;

  if (!item) {
    return {
      ok: false,
      reason: "Не удалось разобрать ингредиент",
    };
  }

  const name = getIngredientName(item);
  const nutritionKey = findNutritionKey(name);
  const amountOk = hasRecognizedQuantity(item);
  const unitOk = Boolean(UNIT_CONVERSIONS[normalizeUnit(item.unit)] || ["г", "кг", "мл", "л", "шт", "ст.л", "ч.л"].includes(normalizeUnit(item.unit)));

  if (!name || name.length < 2) {
    return {
      ok: false,
      reason: "Непонятное название продукта",
    };
  }

  if (!amountOk || !unitOk) {
    return {
      ok: false,
      reason: "Проверь количество или единицу измерения",
    };
  }

  if (!nutritionKey) {
    return {
      ok: false,
      reason: "Нет совпадения в справочнике продуктов",
    };
  }

  return {
    ok: true,
    reason: "Найдено в справочнике",
  };
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

function getMondayDate(date = new Date()) {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return formatDateInput(date);
}

function formatRuDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
  });
}

function getWeekLabel(weekStart) {
  return `${formatRuDate(weekStart)} — ${formatRuDate(addDays(weekStart, 6))}`;
}

function getMealCategoryLabel(value) {
  return MEAL_CATEGORY_OPTIONS.find((option) => option.value === value)?.label || "Любое время";
}

function getDishTypeLabel(value) {
  return DISH_TYPE_OPTIONS.find((option) => option.value === value)?.label || "Без категории";
}

function generateRecipeImage(recipe) {
  const title = recipe?.title || "Рецепт";
  const dishType = getDishTypeLabel(recipe?.dishType || "any");
  const mealType = getMealCategoryLabel(recipe?.mealCategory || "any");
  const ingredients = (recipe?.ingredients || [])
    .slice(0, 5)
    .map((item) => getIngredientName(item))
    .filter(Boolean)
    .join(" · ");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#F4F0EA"/>
          <stop offset="42%" stop-color="#C8BDAF"/>
          <stop offset="100%" stop-color="#223E2D"/>
        </linearGradient>
        <linearGradient id="card" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#FFFDF8"/>
          <stop offset="100%" stop-color="#E9E1D7"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="22" stdDeviation="28" flood-color="#1B2D22" flood-opacity="0.28"/>
        </filter>
      </defs>

      <rect width="900" height="900" fill="url(#bg)"/>
      <rect x="0" y="0" width="900" height="260" fill="#8B6A50" opacity="0.72"/>
      <rect x="0" y="260" width="900" height="230" fill="#F4F0EA"/>
      <rect x="0" y="490" width="900" height="190" fill="#7E8769"/>
      <rect x="0" y="680" width="900" height="220" fill="#223E2D"/>

      <circle cx="705" cy="178" r="98" fill="#B59A61" opacity="0.86"/>
      <circle cx="708" cy="178" r="64" fill="#F6F0E7" opacity="0.96"/>
      <path d="M690 120 C760 160 760 250 690 290 C620 250 620 160 690 120Z" fill="#7E8769" opacity="0.9"/>

      <g filter="url(#shadow)">
        <rect x="86" y="156" width="728" height="588" rx="54" fill="url(#card)"/>
      </g>

      <rect x="128" y="198" width="644" height="94" rx="28" fill="#7E8769"/>
      <text x="450" y="258" text-anchor="middle" font-family="Georgia, serif" font-size="42" fill="#FFFDF8" font-weight="700">${escapeSvg(title).slice(0, 34)}</text>

      <text x="450" y="350" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#8B6A50">${escapeSvg(mealType)} · ${escapeSvg(dishType)}</text>

      <circle cx="450" cy="480" r="112" fill="#B59A61" opacity="0.32"/>
      <circle cx="450" cy="480" r="86" fill="#FFFDF8"/>
      <circle cx="450" cy="480" r="58" fill="#7E8769" opacity="0.88"/>
      <path d="M410 470 C435 425 485 425 510 470 C493 520 427 520 410 470Z" fill="#F4F0EA"/>
      <path d="M438 435 C470 395 515 405 530 450 C495 455 465 450 438 435Z" fill="#223E2D" opacity="0.82"/>

      <text x="450" y="638" text-anchor="middle" font-family="Arial, sans-serif" font-size="23" fill="#223E2D">${escapeSvg(ingredients).slice(0, 54)}</text>
      <text x="450" y="688" text-anchor="middle" font-family="Georgia, serif" font-size="30" fill="#8B6A50">Меню на неделю</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeSvg(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getRecipeImage(recipe) {
  return recipe?.image || generateRecipeImage(recipe);
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

function StatCard({ icon, label, value, onClick }) {
  return (
    <button type="button" className="stat-card" onClick={onClick}>
      <div className="stat-icon">{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </button>
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
    <article className="recipe-compact-page">
      <div className="recipe-compact-header">
        <div>
          <h3>{recipe.title}</h3>
          {recipe.description && <p>{recipe.description}</p>}
        </div>

        <div className="recipe-actions">
          <button onClick={onEdit} className="icon-button edit-button" title="Редактировать рецепт">
            <Pencil size={17} />
          </button>

          <button onClick={onDelete} className="icon-button" title="Удалить рецепт">
            <Trash2 size={17} />
          </button>
        </div>
      </div>

      <div className="recipe-compact-meta">
        <span>{getMealCategoryLabel(recipe.mealCategory || "any")}</span>
        <span>{getDishTypeLabel(recipe.dishType || "any")}</span>
        {recipe.servings && <span>{recipe.servings} порц.</span>}
        {recipe.time && <span>{recipe.time}</span>}
      </div>

      <div className="recipe-compact-main">
        <div
          className="recipe-compact-photo"
          style={{
            height: `${Math.max(120, Math.min(360, recipe.ingredients.length * 38))}px`,
          }}
        >
          {<img src={getRecipeImage(recipe)} alt={recipe.title} />}
        </div>

        <div className="recipe-compact-ingredients">
          <h4>Ингредиенты</h4>

          <ul>
            {recipe.ingredients.map((item, index) => {
              const ingredientName = getIngredientName(item);
              const isAvailable = recipe.availableKeys?.includes(ingredientName);
              const status = getIngredientStatus(item);
              const isSelected = selectedIngredientIndex === index;

              return (
                <li key={`${ingredientName}-${index}`}>
                  <button
                    type="button"
                    className={`recipe-ingredient-line ${isSelected ? "active" : ""} ${status.ok ? "recognized" : "needs-attention"}`}
                    title={status.reason}
                    onClick={() => setSelectedIngredientIndex(isSelected ? null : index)}
                  >
                    <span>{item.name}</span>
                    <b>{Number(item.amount?.toFixed?.(2) ?? item.amount)} {item.unit}</b>
                    {!status.ok && <em>!</em>}
                    {status.ok && !isAvailable && <small>купить</small>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {selectedIngredient && (
        <div className="ingredient-detail-card compact">
          <div className="ingredient-detail-header">
            <div>
              <h4>{selectedIngredient.name}</h4>
              <p>{Number(selectedIngredient.amount?.toFixed?.(2) ?? selectedIngredient.amount)} {selectedIngredient.unit}</p>
            </div>

            <button type="button" onClick={() => setSelectedIngredientIndex(null)}>×</button>
          </div>

          {selectedIngredientNutrition?.known ? (
            <>
              <div className="ingredient-detail-macros">
                <div><strong>{selectedIngredientNutrition.nutrients.calories}</strong><span>ккал</span></div>
                <div><strong>{selectedIngredientNutrition.nutrients.protein}</strong><span>белки</span></div>
                <div><strong>{selectedIngredientNutrition.nutrients.fat}</strong><span>жиры</span></div>
                <div><strong>{selectedIngredientNutrition.nutrients.carbs}</strong><span>углеводы</span></div>
              </div>

              <details className="ingredient-detail-nutrients">
                <summary>
                  <span>Нутриенты</span>
                  <ChevronDown size={16} />
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
            <p className="unknown-nutrition">Нет данных по нутриентам.</p>
          )}
        </div>
      )}

      <details className="recipe-compact-nutrition">
        <summary>КБЖУ и нутриенты на порцию</summary>

        <div className="macro-grid macro-grid-big">
          <NutritionNumber title="Калории" value={portionNutrition.calories} unit="ккал" accent="calories" />
          <NutritionNumber title="Белки" value={portionNutrition.protein} unit="г" />
          <NutritionNumber title="Жиры" value={portionNutrition.fat} unit="г" />
          <NutritionNumber title="Углеводы" value={portionNutrition.carbs} unit="г" />
        </div>

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

      {steps.length > 0 && (
        <div className="recipe-compact-steps">
          <h4>Приготовление</h4>
          <ol>
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

  const [selectedWeekStart, setSelectedWeekStart] = useState(formatDateInput(getMondayDate()));
  const [menusByWeek, setMenusByWeek] = useState({});
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

  const [recipeIngredientForm, setRecipeIngredientForm] = useState({
    name: "",
    amount: "",
    unit: "г",
  });

  const [customNutritionDb, setCustomNutritionDb] = useState({});
  const [nutritionSearchStatus, setNutritionSearchStatus] = useState("");
  const [nutritionSuggestions, setNutritionSuggestions] = useState([]);
  const [directoryQuery, setDirectoryQuery] = useState("");
  const [directoryForm, setDirectoryForm] = useState({
    name: "",
    calories: "",
    protein: "",
    fat: "",
    carbs: "",
    fiber: "",
    sugar: "",
    sodium: "",
    potassium: "",
    calcium: "",
    iron: "",
    magnesium: "",
    vitaminC: "",
    vitaminA: "",
    folate: "",
  });

  const [checkedShoppingItems, setCheckedShoppingItems] = useState({});

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

      if (parsed.customNutritionDb) {
        Object.assign(NUTRITION_DB, parsed.customNutritionDb);
        setCustomNutritionDb(parsed.customNutritionDb);
      }

      if (parsed.customNutritionDb) {
        Object.assign(NUTRITION_DB, parsed.customNutritionDb);
        setCustomNutritionDb(parsed.customNutritionDb);
      }

      if (parsed.recipes) setRecipes(parsed.recipes);
      if (parsed.pantry) setPantry(parsed.pantry);

      if (parsed.menusByWeek) {
        const normalizedWeeks = {};
        Object.entries(parsed.menusByWeek).forEach(([week, weekMenu]) => {
          normalizedWeeks[week] = normalizeMenu(weekMenu);
        });
        setMenusByWeek(normalizedWeeks);
      }

      if (parsed.selectedWeekStart) {
        setSelectedWeekStart(parsed.selectedWeekStart);
        const weekMenu = parsed.menusByWeek?.[parsed.selectedWeekStart] || parsed.menu;
        if (weekMenu) setMenu(normalizeMenu(weekMenu));
      } else if (parsed.menu) {
        setMenu(normalizeMenu(parsed.menu));
      }

      if (loadedKey !== STORAGE_KEY) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
    } catch {
      console.log("Не удалось загрузить сохранённые данные");
    }
  }, []);

  useEffect(() => {
    setMenusByWeek((current) => ({
      ...current,
      [selectedWeekStart]: normalizeMenu(menu),
    }));
  }, [menu, selectedWeekStart]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        recipes,
        pantry,
        menu,
        selectedWeekStart,
        menusByWeek: {
          ...menusByWeek,
          [selectedWeekStart]: normalizeMenu(menu),
        },
        customNutritionDb,
      })
    );
  }, [recipes, pantry, menu, selectedWeekStart, menusByWeek, customNutritionDb]);

  function exportAppData() {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      recipes,
      pantry,
      menu,
      selectedWeekStart,
      menusByWeek: {
        ...menusByWeek,
        [selectedWeekStart]: normalizeMenu(menu),
      },
      customNutritionDb,
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

      if (parsed.customNutritionDb) {
        Object.assign(NUTRITION_DB, parsed.customNutritionDb);
        setCustomNutritionDb(parsed.customNutritionDb);
      }

      if (parsed.recipes) setRecipes(parsed.recipes);
      if (parsed.pantry) setPantry(parsed.pantry);

      if (parsed.menusByWeek) {
        const normalizedWeeks = {};
        Object.entries(parsed.menusByWeek).forEach(([week, weekMenu]) => {
          normalizedWeeks[week] = normalizeMenu(weekMenu);
        });
        setMenusByWeek(normalizedWeeks);
      }

      if (parsed.selectedWeekStart) {
        setSelectedWeekStart(parsed.selectedWeekStart);
        const weekMenu = parsed.menusByWeek?.[parsed.selectedWeekStart] || parsed.menu;
        if (weekMenu) setMenu(normalizeMenu(weekMenu));
      } else if (parsed.menu) {
        setMenu(normalizeMenu(parsed.menu));
      }

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          recipes: parsed.recipes || recipes,
          pantry: parsed.pantry || pantry,
          menu: parsed.menu || menu,
          selectedWeekStart: parsed.selectedWeekStart || selectedWeekStart,
          menusByWeek: parsed.menusByWeek || menusByWeek,
          customNutritionDb: parsed.customNutritionDb || customNutritionDb,
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
    selectedRecipeId ? recipeMatches.find((recipe) => recipe.id === selectedRecipeId) || null : null;

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
        return parsed ? ingredientToInputLine(parsed) : line.replace(/^[-•*]\s*/, "").trim();
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
        .map((item) => ingredientToInputLine(item))
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

  const directoryProducts = useMemo(() => {
    const query = normalizeIngredient(directoryQuery);

    return getKnownProductNames()
      .filter((name) => {
        const item = NUTRITION_DB[name];
        const text = `${name} ${item?.displayName || ""}`.toLowerCase();
        return !query || text.includes(query);
      })
      .map((name) => ({
        key: name,
        ...NUTRITION_DB[name],
        isCustom: Boolean(customNutritionDb[name]),
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [directoryQuery, customNutritionDb]);

  function resetDirectoryForm() {
    setDirectoryForm({
      name: "",
      calories: "",
      protein: "",
      fat: "",
      carbs: "",
      fiber: "",
      sugar: "",
      sodium: "",
      potassium: "",
      calcium: "",
      iron: "",
      magnesium: "",
      vitaminC: "",
      vitaminA: "",
      folate: "",
    });
  }

  function fillDirectoryFormFromProduct(key) {
    const item = NUTRITION_DB[key];
    if (!item) return;

    setDirectoryForm({
      name: key,
      calories: item.calories ?? "",
      protein: item.protein ?? "",
      fat: item.fat ?? "",
      carbs: item.carbs ?? "",
      fiber: item.fiber ?? "",
      sugar: item.sugar ?? "",
      sodium: item.sodium ?? "",
      potassium: item.potassium ?? "",
      calcium: item.calcium ?? "",
      iron: item.iron ?? "",
      magnesium: item.magnesium ?? "",
      vitaminC: item.vitaminC ?? "",
      vitaminA: item.vitaminA ?? "",
      folate: item.folate ?? "",
    });
  }

  function saveDirectoryProduct(event) {
    event.preventDefault();

    const key = normalizeIngredient(directoryForm.name);

    if (!key) {
      alert("Введи название продукта.");
      return;
    }

    const item = {
      displayName: directoryForm.name.trim(),
      calories: Number(directoryForm.calories) || 0,
      protein: Number(directoryForm.protein) || 0,
      fat: Number(directoryForm.fat) || 0,
      carbs: Number(directoryForm.carbs) || 0,
      fiber: Number(directoryForm.fiber) || 0,
      sugar: Number(directoryForm.sugar) || 0,
      sodium: Number(directoryForm.sodium) || 0,
      potassium: Number(directoryForm.potassium) || 0,
      calcium: Number(directoryForm.calcium) || 0,
      iron: Number(directoryForm.iron) || 0,
      magnesium: Number(directoryForm.magnesium) || 0,
      vitaminC: Number(directoryForm.vitaminC) || 0,
      vitaminA: Number(directoryForm.vitaminA) || 0,
      folate: Number(directoryForm.folate) || 0,
    };

    NUTRITION_DB[key] = item;

    setCustomNutritionDb((current) => ({
      ...current,
      [key]: item,
    }));

    setNutritionSearchStatus(`Сохранено в справочник: ${item.displayName}.`);
    setDirectoryQuery(key);
  }

  function deleteCustomDirectoryProduct(key) {
    if (!customNutritionDb[key]) return;

    const next = { ...customNutritionDb };
    delete next[key];

    delete NUTRITION_DB[key];

    setCustomNutritionDb(next);
  }

  function applyProductNameSuggestion(name, target = "pantry") {
    if (target === "recipe") {
      setRecipeIngredientForm((current) => ({
        ...current,
        name,
      }));
      return;
    }

    setPantryForm((current) => ({
      ...current,
      name,
    }));
  }

  function getLocalNameSuggestions(value) {
    const query = normalizeIngredient(value);
    if (!query) return getKnownProductNames().slice(0, 12);

    return getKnownProductNames()
      .filter((name) => name.includes(query) || query.includes(name))
      .slice(0, 12);
  }

  async function searchNutritionByName(name) {
    const query = normalizeIngredient(name);

    if (!query) {
      setNutritionSearchStatus("Сначала введи название продукта.");
      return;
    }

    const localKey = findNutritionKey(query);

    if (localKey) {
      setNutritionSearchStatus(`Уже есть в справочнике: ${NUTRITION_DB[localKey].displayName || localKey}.`);
      setNutritionSuggestions([]);
      return;
    }

    try {
      setNutritionSearchStatus("Ищу продукт в открытом справочнике...");
      setNutritionSuggestions([]);

      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        query
      )}&search_simple=1&action=process&json=1&page_size=8&fields=product_name,generic_name,nutriments`;

      const response = await fetch(url);
      const data = await response.json();

      const products = (data.products || [])
        .filter((product) => {
          const n = product.nutriments || {};
          return (
            product.product_name &&
            (n["energy-kcal_100g"] || n["proteins_100g"] || n["fat_100g"] || n["carbohydrates_100g"])
          );
        })
        .slice(0, 5);

      if (!products.length) {
        setNutritionSearchStatus("Не нашла подходящий продукт. Можно оставить без справочника или добавить данные вручную позже.");
        return;
      }

      setNutritionSuggestions(
        products.map((product) => ({
          id: crypto.randomUUID(),
          name: product.product_name || product.generic_name || query,
          nutrition: mapOpenFoodFactsProductToNutrition(product),
        }))
      );

      setNutritionSearchStatus("Нашла варианты. Выбери подходящий продукт.");
    } catch {
      setNutritionSearchStatus("Не удалось подключиться к справочнику. Проверь интернет или попробуй позже.");
    }
  }

  function saveNutritionSuggestion(productName, nutrition) {
    const key = normalizeIngredient(productName);

    if (!key) return;

    const newItem = {
      ...nutrition,
      displayName: nutrition.displayName || productName,
    };

    NUTRITION_DB[key] = newItem;

    setCustomNutritionDb((current) => ({
      ...current,
      [key]: newItem,
    }));

    setNutritionSuggestions([]);
    setNutritionSearchStatus(`Добавлено в справочник: ${newItem.displayName}.`);
  }

  function addIngredientToRecipeForm(event) {
    event.preventDefault();

    const item = makeIngredient(
      recipeIngredientForm.name,
      recipeIngredientForm.amount,
      recipeIngredientForm.unit
    );

    if (!item || item.amount <= 0) return;

    const line = ingredientToInputLine(item);

    setForm((current) => ({
      ...current,
      ingredients: current.ingredients ? `${current.ingredients}\n${line}` : line,
    }));

    setRecipeIngredientForm({
      name: "",
      amount: "",
      unit: recipeIngredientForm.unit,
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

  function updatePantryItem(indexToUpdate, field, value) {
    setPantry((current) =>
      current.map((item, index) => {
        if (index !== indexToUpdate) return item;

        if (field === "amount") {
          return {
            ...item,
            amount: Number(value) || 0,
          };
        }

        if (field === "unit") {
          return {
            ...item,
            unit: normalizeUnit(value),
          };
        }

        return {
          ...item,
          [field]: value,
        };
      })
    );
  }

  function getShoppingItemKey(item) {
    return `${item.name}|${item.unit}`;
  }

  function toggleShoppingItem(item) {
    const key = getShoppingItemKey(item);

    setCheckedShoppingItems((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function areAllShoppingItemsChecked() {
    return shoppingList.length > 0 && shoppingList.every((item) => checkedShoppingItems[getShoppingItemKey(item)]);
  }

  function toggleAllShoppingItems() {
    const shouldSelectAll = !areAllShoppingItemsChecked();

    if (!shouldSelectAll) {
      setCheckedShoppingItems({});
      return;
    }

    const next = {};
    shoppingList.forEach((item) => {
      next[getShoppingItemKey(item)] = true;
    });

    setCheckedShoppingItems(next);
  }

  function addBoughtItemsToPantry() {
    const selected = shoppingList.filter((item) => checkedShoppingItems[getShoppingItemKey(item)]);

    if (!selected.length) {
      alert("Отметь продукты, которые куплены.");
      return;
    }

    setPantry((current) => [
      ...current,
      ...selected.map((item) => ({
        name: item.name,
        amount: Number(item.buyAmount.toFixed(2)),
        unit: item.unit,
      })),
    ]);

    setCheckedShoppingItems({});
    setActiveTab("pantry");
  }

  function removePantryItem(indexToRemove) {
    setPantry((current) => current.filter((_, index) => index !== indexToRemove));
  }

  function changeSelectedWeek(weekStart) {
    const normalizedDate = formatDateInput(getMondayDate(new Date(`${weekStart}T00:00:00`)));

    setMenusByWeek((current) => ({
      ...current,
      [selectedWeekStart]: normalizeMenu(menu),
    }));

    setSelectedWeekStart(normalizedDate);
    setMenu(normalizeMenu(menusByWeek[normalizedDate] || createEmptyMenu()));
  }

  function shiftWeek(direction) {
    changeSelectedWeek(addDays(selectedWeekStart, direction * 7));
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
    setMenusByWeek((current) => ({
      ...current,
      [selectedWeekStart]: next,
    }));
  }

  function getRecipeTitle(id) {
    return recipes.find((recipe) => recipe.id === id)?.title || "";
  }

  function getRecipeById(id) {
    return recipes.find((recipe) => recipe.id === id) || null;
  }

  function openRecipeFromMenu(recipeId) {
    if (!recipeId) return;
    setSelectedRecipeId(recipeId);
    setActiveTab("recipes");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function getWeekHistoryList() {
    const allWeeks = new Set([...Object.keys(menusByWeek), selectedWeekStart]);
    return [...allWeeks].sort((a, b) => b.localeCompare(a));
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

            <h1>Меню на неделю и база рецептов</h1>

            <p>
              Добавляй рецепты, загружай фото и PDF, учитывай граммовки, считай
              КБЖУ, витамины, минералы и список покупок.
            </p>
          </div>

          <div className="hero-actions">
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

        <section className="stats-grid quick-menu-grid">
          <StatCard icon={<ChefHat />} label="Рецептов" value={recipes.length} onClick={() => setActiveTab("recipes")} />
          <StatCard icon={<Carrot />} label="Продуктов дома" value={pantry.length} onClick={() => setActiveTab("pantry")} />
          <StatCard icon={<CalendarDays />} label="Блюд в меню" value={Object.values(menu).flatMap((day) => Object.values(day)).filter(Boolean).length} onClick={() => setActiveTab("menu")} />
          <StatCard icon={<ShoppingBasket />} label="Нужно купить" value={shoppingList.length} onClick={() => setActiveTab("pantry")} />
        </section>

                <nav className="tabs home-tile-menu" aria-label="Разделы приложения">
          {[
            ["recipes", "Рецепты", <ChefHat size={26} />],
            ["add", "Добавить рецепт", <Plus size={26} />],
            ["recognize", "Распознать", <Upload size={26} />],
            ["pantry", "Дом и покупки", <ShoppingBasket size={26} />],
            ["menu", "Меню недели", <CalendarDays size={26} />],
            ["directory", "Продукты", <Carrot size={26} />],
            ["units", "Единицы", <FileText size={26} />],
          ].map(([id, label, icon]) => (
            <button
              key={id}
              title={label}
              aria-label={label}
              onClick={() => setActiveTab(id)}
              className={activeTab === id || (id === "pantry" && activeTab === "shopping") ? "active" : ""}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <datalist id="known-products-list">
          {getKnownProductNames().map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>

        {activeTab === "recipes" && (
          <section className="section">
            <div className="search-box">
              <Search size={20} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Найти рецепт, ингредиент или тип блюда..."
              />
            </div>

            {!selectedRecipe ? (
              <div className="recipe-gallery">
                {recipeMatches.map((recipe) => {
                  const portionNutrition = divideNutrition(
                    calculateRecipeNutrition(recipe),
                    recipe.servings
                  );

                  return (
                    <button
                      key={recipe.id}
                      className="recipe-gallery-card"
                      onClick={() => setSelectedRecipeId(recipe.id)}
                    >
                      <div className="recipe-gallery-image">
                        {<img src={getRecipeImage(recipe)} alt={recipe.title} />}
                      </div>

                      <div className="recipe-gallery-body">
                        <strong>{recipe.title}</strong>
                        <span>
                          {getMealCategoryLabel(recipe.mealCategory || "any")} · {getDishTypeLabel(recipe.dishType || "any")}
                        </span>
                        <small>{portionNutrition.calories} ккал на порцию · {recipe.score}%</small>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="recipe-page-view">
                <button
                  type="button"
                  className="back-to-recipes-button"
                  onClick={() => setSelectedRecipeId(null)}
                >
                  ← Все рецепты
                </button>

                <RecipeCard
                  recipe={selectedRecipe}
                  onEdit={() => startEditingRecipe(selectedRecipe)}
                  onDelete={() => {
                    deleteRecipe(selectedRecipe.id);
                    setSelectedRecipeId(null);
                  }}
                />
              </div>
            )}
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
                  <div className="recipe-image-preview">
                    <img src={form.image} alt="Предпросмотр рецепта" />
                  </div>
                )}
              </div>

              <div className="ingredient-helper-card">
                <div>
                  <h3>Быстро добавить ингредиент</h3>
                  <p className="muted">Начни вводить название — появятся подсказки из справочника. При необходимости можно подтянуть КБЖУ из открытой базы.</p>
                </div>

                <form className="ingredient-helper-form" onSubmit={addIngredientToRecipeForm}>
                  <Field label="Ингредиент">
                    <input
                      className="input"
                      list="known-products-list"
                      value={recipeIngredientForm.name}
                      onChange={(event) => setRecipeIngredientForm({ ...recipeIngredientForm, name: event.target.value })}
                      placeholder="Например, брокколи"
                    />
                  </Field>

                  <Field label="Количество">
                    <input
                      className="input"
                      type="number"
                      min="0"
                      step="0.1"
                      value={recipeIngredientForm.amount}
                      onChange={(event) => setRecipeIngredientForm({ ...recipeIngredientForm, amount: event.target.value })}
                      placeholder="100"
                    />
                  </Field>

                  <Field label="Единица">
                    <select
                      className="input"
                      value={recipeIngredientForm.unit}
                      onChange={(event) => setRecipeIngredientForm({ ...recipeIngredientForm, unit: event.target.value })}
                    >
                      {UNIT_OPTIONS.map((unit) => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </Field>

                  <Button type="submit">
                    <Plus size={20} />
                    Вставить
                  </Button>
                </form>
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
          <section className="section home-products-section">
            <div className="section-heading">
              <div>
                <h2>Продукты дома и покупки</h2>
                <p className="muted">
                  Слева — что есть дома, справа — что нужно купить по выбранному меню.
                </p>
              </div>
            </div>

            <div className="home-shopping-layout">
              <div className="card compact-column">
                <h3>Продукты дома</h3>

                <form className="pantry-form compact-add-form" onSubmit={addPantryFromForm}>
                  <Field label="Продукт">
                    <input
                      className="input"
                      list="known-products-list"
                      value={pantryForm.name}
                      onChange={(event) => setPantryForm({ ...pantryForm, name: event.target.value })}
                      placeholder="Например, брокколи"
                    />
                  </Field>

                  <Field label="Кол-во">
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

                  <Field label="Ед.">
                    <select className="input" value={pantryForm.unit} onChange={(event) => setPantryForm({ ...pantryForm, unit: event.target.value })}>
                      {UNIT_OPTIONS.map((unit) => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </Field>

                  <Button type="submit">
                    <Plus size={18} />
                    Добавить
                  </Button>
                </form>

                <details className="quick-add compact-quick-add">
                  <summary>Быстро добавить списком</summary>
                  <div className="add-row">
                    <input className="input" value={ingredientInput} onChange={(event) => setIngredientInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addIngredientsQuick(); }} placeholder="Например: брокколи 50 г, яйцо 6 шт" />
                    <Button onClick={addIngredientsQuick}>
                      <Plus size={18} />
                      Добавить
                    </Button>
                  </div>
                </details>

                <div className="pantry-list compact-pantry-list">
                  {pantry.map((item, index) => {
                    const status = getIngredientStatus(item);

                    return (
                      <div key={`${getIngredientName(item)}-${index}`} className={`pantry-item compact ${status.ok ? "recognized" : "needs-attention"}`}>
                        <input
                          className="input"
                          value={item.name}
                          onChange={(event) => updatePantryItem(index, "name", event.target.value)}
                        />

                        <input
                          className="input"
                          type="number"
                          step="0.1"
                          value={item.amount}
                          onChange={(event) => updatePantryItem(index, "amount", event.target.value)}
                        />

                        <select
                          className="input"
                          value={item.unit}
                          onChange={(event) => updatePantryItem(index, "unit", event.target.value)}
                        >
                          {UNIT_OPTIONS.map((unit) => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </select>

                        {!status.ok && <small>{status.reason}</small>}

                        <button onClick={() => removePantryItem(index)} title="Удалить продукт">×</button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card compact-column">
                <div className="compact-column-heading shopping-heading">
                  <h3>Список покупок</h3>

                  {shoppingList.length > 0 && (
                    <div className="shopping-heading-actions">
                      <label className="select-all-shopping">
                        <input
                          type="checkbox"
                          checked={areAllShoppingItemsChecked()}
                          onChange={toggleAllShoppingItems}
                        />
                        <span>Выделить все</span>
                      </label>

                      <button type="button" className="bought-button" onClick={addBoughtItemsToPantry}>
                        Куплено
                      </button>
                    </div>
                  )}
                </div>

                {shoppingList.length === 0 ? (
                  <p className="muted">
                    Пока ничего докупать не нужно или меню ещё не заполнено.
                  </p>
                ) : (
                  <div className="shopping-list-compact">
                    {shoppingList.map((item) => {
                      const key = getShoppingItemKey(item);

                      return (
                        <label key={key} className="shopping-item compact">
                          <input
                            type="checkbox"
                            checked={Boolean(checkedShoppingItems[key])}
                            onChange={() => toggleShoppingItem(item)}
                          />

                          <span>{item.name}</span>

                          <strong>
                            {Number(item.buyAmount.toFixed(2))} {item.unit}
                          </strong>

                          <small>
                            нужно {Number(item.amount.toFixed(2))}, есть {Number(item.available.toFixed(2))}
                          </small>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "menu" && (
          <section className="section">
            <div className="section-heading menu-heading">
              <div>
                <h2>Меню на неделю</h2>
                <p className="muted">Планируй меню на конкретную неделю и возвращайся к прошлым неделям.</p>
              </div>

              <Button onClick={() => setMenu(createEmptyMenu())} variant="secondary">Очистить неделю</Button>
            </div>

            <div className="week-planner-card">
              <button type="button" onClick={() => shiftWeek(-1)}>← Предыдущая</button>

              <label>
                Неделя
                <input
                  className="input"
                  type="date"
                  value={selectedWeekStart}
                  onChange={(event) => changeSelectedWeek(event.target.value)}
                />
              </label>

              <strong>{getWeekLabel(selectedWeekStart)}</strong>

              <button type="button" onClick={() => shiftWeek(1)}>Следующая →</button>

              <button type="button" className="fill-week-button" onClick={autoFillMenu}>
                <Sparkles size={17} />
                Заполнить
              </button>
            </div>

            <details className="week-history">
              <summary>История недель</summary>

              <div className="week-history-list">
                {getWeekHistoryList().map((week) => (
                  <button
                    key={week}
                    type="button"
                    className={week === selectedWeekStart ? "active" : ""}
                    onClick={() => changeSelectedWeek(week)}
                  >
                    {getWeekLabel(week)}
                  </button>
                ))}
              </div>
            </details>

            <div className="menu-list">
              {weekDays.map((day, dayIndex) => (
                <div key={day} className="card day-card">
                  <h3>{day} <span>{formatRuDate(addDays(selectedWeekStart, dayIndex))}</span></h3>

                  <div className="meal-grid">
                    {mealTypes.map((meal) => {
                      const mealPlan = normalizeMenu(menu)[day][meal];
                      const targetCategory = MEAL_TYPE_TO_CATEGORY[meal];
                      const mealRecipes = recipeMatches.filter((recipe) => {
                        const category = recipe.mealCategory || "any";
                        return category === targetCategory || category === "any";
                      });

                      return (
                        <div key={meal} className="meal-box">
                          <label>{meal}</label>

                          <div className="menu-recipe-row">
                            <select
                              className="input"
                              value={mealPlan.recipeId || ""}
                              onChange={(event) =>
                                updateMenuRecipe(day, meal, event.target.value)
                              }
                            >
                              <option value="">Не выбрано</option>

                              {mealRecipes.map((recipe) => (
                                <option key={recipe.id} value={recipe.id}>
                                  {recipe.title} — {getDishTypeLabel(recipe.dishType || "any")} — {recipe.score}%
                                </option>
                              ))}
                            </select>

                            {mealPlan.recipeId && (
                              <button
                                type="button"
                                className="open-menu-recipe-icon"
                                title={`Открыть рецепт: ${getRecipeTitle(mealPlan.recipeId)}`}
                                onClick={() => openRecipeFromMenu(mealPlan.recipeId)}
                              >
                                ↗
                              </button>
                            )}
                          </div>
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
          <section className="section">
            {setActiveTab("pantry")}
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
