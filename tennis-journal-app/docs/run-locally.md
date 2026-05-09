# Run AI Tennis Journal Locally

## 1. Clone repository

```bash
git clone https://github.com/irinakom16/my-recipes.git
cd my-recipes/tennis-journal-app
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

Copy `.env.example` into `.env`.

Add:

- Supabase URL
- Supabase anon key
- OpenAI API key

## 4. Start Expo

```bash
npm start
```

## 5. Open app

### On iPhone / Android

Install Expo Go.

Scan the QR code from terminal.

### On browser

```bash
npm run web
```

---

# Recommended next setup

## Supabase

Create:

- project
- database
- auth
- tables from schema.sql

## OpenAI

Generate API key and add to `.env`.

---

# MVP Features

- AI coach insights
- Daily journal
- Match tracking
- Weekly review
- Statistics
- Training notes
