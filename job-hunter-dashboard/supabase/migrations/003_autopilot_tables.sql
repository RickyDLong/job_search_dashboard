-- ============================================
-- Autopilot Pipeline Tables
-- ============================================

-- Pipeline run history
create table if not exists autopilot_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'running' check (status in ('running', 'completed', 'failed', 'paused')),
  stage text not null default 'scout' check (stage in ('scout', 'analyst', 'author', 'applicant', 'hunter', 'outreach')),
  jobs_discovered int default 0,
  jobs_scored int default 0,
  resumes_tailored int default 0,
  applications_sent int default 0,
  emails_drafted int default 0,
  emails_sent int default 0,
  errors jsonb default '[]'::jsonb,
  config jsonb default '{}'::jsonb,
  started_at timestamptz default now(),
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Discovered jobs from all sources (pre-scoring)
create table if not exists discovered_jobs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references autopilot_runs(id) on delete cascade,
  source text not null, -- linkedin, indeed, weworkremotely, remoteok, otta, wellfound
  external_id text, -- job ID from the source platform
  title text not null,
  company text not null,
  location text default 'Remote',
  salary_range text,
  url text,
  description text,
  requirements text[],
  posted_date timestamptz,
  -- Scoring
  match_score int default 0, -- 0-100
  keyword_matches text[],
  missing_keywords text[],
  score_reasoning text,
  -- Pipeline status
  status text not null default 'discovered' check (status in (
    'discovered', 'scored', 'approved', 'resume_tailored', 'applied',
    'recruiter_found', 'emailed', 'responded', 'rejected', 'skipped'
  )),
  skip_reason text,
  -- Link to main pipeline
  pipeline_job_id uuid references jobs(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Dedupe index: same job from same source
create unique index if not exists idx_discovered_jobs_source_ext
  on discovered_jobs(source, external_id) where external_id is not null;

-- Index for pipeline queries
create index if not exists idx_discovered_jobs_status on discovered_jobs(status);
create index if not exists idx_discovered_jobs_run on discovered_jobs(run_id);

-- Tailored resumes per discovered job
create table if not exists tailored_resumes (
  id uuid primary key default gen_random_uuid(),
  discovered_job_id uuid references discovered_jobs(id) on delete cascade,
  base_resume_id uuid references resumes(id) on delete set null,
  summary_rewrite text,
  skills_reorder text[], -- reordered skills list
  keyword_additions text[], -- keywords injected
  full_text text, -- the complete tailored resume text
  ats_score_estimate int,
  file_url text, -- S3/Supabase storage URL for generated PDF
  created_at timestamptz default now()
);

create index if not exists idx_tailored_resumes_job on tailored_resumes(discovered_job_id);

-- Recruiter/hiring manager contacts found
create table if not exists recruiter_contacts (
  id uuid primary key default gen_random_uuid(),
  discovered_job_id uuid references discovered_jobs(id) on delete cascade,
  name text not null,
  title text,
  email text,
  phone text,
  linkedin_url text,
  source text, -- how we found them (linkedin, company page, apollo, etc)
  confidence text default 'medium' check (confidence in ('high', 'medium', 'low')),
  -- Link to main contacts table if promoted
  contact_id uuid references contacts(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists idx_recruiter_contacts_job on recruiter_contacts(discovered_job_id);

-- Outreach email queue
create table if not exists outreach_queue (
  id uuid primary key default gen_random_uuid(),
  discovered_job_id uuid references discovered_jobs(id) on delete cascade,
  recruiter_contact_id uuid references recruiter_contacts(id) on delete cascade,
  subject text not null,
  body text not null,
  status text not null default 'drafted' check (status in ('drafted', 'queued', 'sent', 'failed', 'responded', 'bounced')),
  send_via text default 'gmail' check (send_via in ('gmail', 'proton')),
  sent_at timestamptz,
  opened_at timestamptz,
  response_received_at timestamptz,
  error_message text,
  created_at timestamptz default now()
);

create index if not exists idx_outreach_queue_status on outreach_queue(status);

-- Learning engine: tracks what works
create table if not exists learning_log (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in (
    'keyword_hit', 'keyword_miss', 'email_response', 'email_no_response',
    'application_callback', 'score_calibration', 'source_quality', 'error_pattern'
  )),
  signal text not null, -- what happened
  data jsonb default '{}'::jsonb, -- structured details
  adjustment text, -- what the system changed as a result
  created_at timestamptz default now()
);

create index if not exists idx_learning_log_category on learning_log(category);

-- Autopilot settings (singleton row)
create table if not exists autopilot_config (
  id int primary key default 1 check (id = 1), -- singleton
  enabled boolean default false,
  run_interval_hours int default 12,
  target_roles text[] default '{"Frontend Engineer", "Software Engineer", "React Developer", "Frontend Developer", "UI Engineer"}',
  target_keywords text[] default '{"React", "TypeScript", "JavaScript", "Next.js", "Redux", "GraphQL", "REST API", "CSS", "HTML", "Tailwind"}',
  excluded_companies text[] default '{}',
  min_match_score int default 60, -- only process jobs scoring above this
  max_applications_per_run int default 10,
  max_emails_per_run int default 5,
  salary_min text,
  email_send_via text default 'gmail',
  master_resume_id uuid references resumes(id) on delete set null,
  updated_at timestamptz default now()
);

-- Insert default config
insert into autopilot_config (id) values (1) on conflict do nothing;
