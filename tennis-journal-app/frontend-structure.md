# Frontend Structure — React Native + Expo

## Stack

- Expo
- React Native
- TypeScript
- Supabase
- React Navigation
- Zustand
- React Query

---

# Screens

## Auth

- LoginScreen
- RegisterScreen

## Main

- HomeScreen
- CreateEntryScreen
- EntryDetailsScreen
- StatisticsScreen
- WeeklyReviewScreen
- ProfileScreen

---

# Components

## Shared

- AppButton
- AppInput
- MoodSlider
- IntensityPicker
- StatCard
- InsightCard
- SectionTitle

## Journal

- EntryCard
- MatchCard
- TrainingCard
- AIInsightBlock

---

# Navigation

```text
RootNavigator
 ├── AuthStack
 └── AppTabs
      ├── Home
      ├── Add Entry
      ├── Statistics
      ├── Weekly Review
      └── Profile
```

---

# State

## UserStore

- user
- session
- logout

## JournalStore

- entries
- createEntry
- updateEntry
- deleteEntry

## AIStore

- latestInsights
- weeklyReport

---

# AI Flow

1. User creates entry.
2. Entry saved in Supabase.
3. Edge function sends entry to OpenAI.
4. AI returns JSON.
5. Insight saved to database.
6. UI displays insight card.

---

# Future Features

- Voice notes
- Apple Watch sync
- Tennis statistics dashboard
- Coach mode
- Video analysis
- AI tactical suggestions
