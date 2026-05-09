create table profiles (
  id uuid primary key,
  name text,
  created_at timestamp default now()
);

create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  entry_type text not null,
  title text,
  duration_minutes integer,
  intensity integer,
  energy integer,
  mood integer,
  notes text,
  created_at timestamp default now()
);

create table training_details (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid references journal_entries(id) on delete cascade,
  serve integer,
  forehand integer,
  backhand integer,
  movement integer,
  tactics integer,
  mental_focus integer,
  comments text
);

create table match_details (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid references journal_entries(id) on delete cascade,
  opponent text,
  surface text,
  score text,
  result text,
  strengths text,
  weaknesses text,
  lessons text
);

create table ai_insights (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid references journal_entries(id) on delete cascade,
  summary text,
  recommendations text,
  next_focus text,
  created_at timestamp default now()
);

create table weekly_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  week_start date,
  week_end date,
  report text,
  created_at timestamp default now()
);
