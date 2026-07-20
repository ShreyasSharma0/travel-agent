-- Run this in your Supabase SQL editor to set up the leads table.

create table if not exists leads (
  id                   uuid primary key default gen_random_uuid(),
  conversation_id      text unique not null,

  -- customer
  name                 text,
  phone                text,
  email                text,

  -- travel
  destination          text,
  departure_city       text,
  travel_date          text,
  duration             text,
  travellers           text,
  budget               text,
  trip_type            text,
  special_requirements text,

  -- qualification
  lead_score           integer not null default 0,
  confidence           text check (confidence in ('Low', 'Medium', 'High')),
  qualification_reason text,
  summary              text,

  created_at           timestamptz not null default now()
);

-- Index for quick lookup by conversation
create index if not exists leads_conversation_id_idx on leads (conversation_id);
