-- Run this in Supabase SQL Editor

create table if not exists registrations (
  id         bigserial primary key,
  reg_id     text unique not null,
  name       text not null,
  email      text unique not null,
  phone      text,
  dept       text,
  year       text,
  interests  text[],
  level      text,
  slot       text,
  msg        text,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table registrations enable row level security;

-- Allow anyone (anon) to INSERT (submit the form)
create policy "Allow public insert"
  on registrations for insert
  to anon
  with check (true);

-- Allow anyone to SELECT count (for member counter)
create policy "Allow public count"
  on registrations for select
  to anon
  using (true);
