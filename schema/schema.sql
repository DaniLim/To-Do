create table task_lists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int default 0
);

create type repeat_rule as enum ('daily','weekly','monthly','yearly','custom');

create table tasks (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references task_lists(id),
  title text not null,
  due_at timestamptz,
  repeat repeat_rule,
  important boolean default false,
  completed boolean default false,
  created_at timestamptz default now()
);

create table device_tokens (
  id serial primary key,
  user_id text,
  expo_token text,
  platform text,
  created_at timestamptz default now()
);
