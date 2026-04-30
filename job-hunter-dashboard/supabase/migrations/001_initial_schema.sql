-- ============================================
-- Job Hunter Dashboard — Initial Schema
-- ============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

create type pipeline_stage as enum (
  'discovered', 'saved', 'applied', 'phone_screen',
  'technical', 'final_round', 'offer', 'accepted', 'rejected'
);

create type remote_policy as enum ('fully_remote', 'hybrid', 'onsite');
create type contact_tag as enum ('warm', 'cold', 'referral', 'internal');
create type resume_type as enum ('master', 'tailored');
create type activity_type as enum ('applied', 'response', 'interview', 'offer', 'rejected', 'follow_up', 'note');

-- ============================================
-- TABLES
-- ============================================

-- Companies (referenced by jobs)
create table companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  glassdoor_rating numeric(2,1) default 0,
  funding text default '',
  headcount text default '',
  remote_policy remote_policy default 'fully_remote',
  open_positions integer default 0,
  red_flags text[] default '{}',
  notes text,
  website text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Jobs pipeline
create table jobs (
  id uuid primary key default uuid_generate_v4(),
  company text not null,
  role text not null,
  salary text default '',
  stage pipeline_stage default 'discovered',
  source text default '',
  url text,
  match_score integer default 0 check (match_score >= 0 and match_score <= 100),
  days_in_stage integer default 0,
  dual_contract_compatible boolean default false,
  tags text[] default '{}',
  red_flags text[] default '{}',
  notes text,
  applied_date date,
  company_id uuid references companies(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Resumes
create table resumes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type resume_type default 'tailored',
  version text default '1.0',
  ats_score integer default 0 check (ats_score >= 0 and ats_score <= 100),
  keywords text[] default '{}',
  last_modified date default current_date,
  linked_job_id uuid references jobs(id) on delete set null,
  linked_job_title text,
  file_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Contacts
create table contacts (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text default '',
  company text default '',
  email text default '',
  linkedin_url text,
  tag contact_tag default 'cold',
  last_contact date,
  next_follow_up date,
  notes text,
  company_id uuid references companies(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Activity log
create table activity_log (
  id uuid primary key default uuid_generate_v4(),
  type activity_type not null,
  title text not null,
  description text,
  job_id uuid references jobs(id) on delete set null,
  contact_id uuid references contacts(id) on delete set null,
  created_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================

create index idx_jobs_stage on jobs(stage);
create index idx_jobs_match_score on jobs(match_score desc);
create index idx_jobs_company on jobs(company);
create index idx_jobs_created_at on jobs(created_at desc);
create index idx_resumes_type on resumes(type);
create index idx_contacts_tag on contacts(tag);
create index idx_contacts_company on contacts(company);
create index idx_activity_log_type on activity_log(type);
create index idx_activity_log_created_at on activity_log(created_at desc);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger jobs_updated_at before update on jobs
  for each row execute function update_updated_at();

create trigger resumes_updated_at before update on resumes
  for each row execute function update_updated_at();

create trigger contacts_updated_at before update on contacts
  for each row execute function update_updated_at();

create trigger companies_updated_at before update on companies
  for each row execute function update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
alter table jobs enable row level security;
alter table resumes enable row level security;
alter table contacts enable row level security;
alter table companies enable row level security;
alter table activity_log enable row level security;

-- For now, allow all access via anon key (single-user app)
-- When auth is added later, these policies will be scoped to auth.uid()
create policy "Allow all access to jobs" on jobs for all using (true) with check (true);
create policy "Allow all access to resumes" on resumes for all using (true) with check (true);
create policy "Allow all access to contacts" on contacts for all using (true) with check (true);
create policy "Allow all access to companies" on companies for all using (true) with check (true);
create policy "Allow all access to activity_log" on activity_log for all using (true) with check (true);

-- ============================================
-- SEED DATA
-- ============================================

-- Companies
insert into companies (name, glassdoor_rating, funding, headcount, remote_policy, open_positions, red_flags, notes) values
  ('Vercel', 4.2, 'Series D ($250M)', '500-1000', 'fully_remote', 12, '{}', 'Next.js creators. Strong engineering culture, fast-paced.'),
  ('Stripe', 4.3, 'Series I ($6.5B)', '5000+', 'hybrid', 45, '{}', 'Payments giant. High bar for engineering, excellent comp.'),
  ('Linear', 4.8, 'Series B ($52M)', '50-100', 'fully_remote', 5, '{}', 'Best-in-class product. Small team, high impact per engineer.'),
  ('Notion', 4.1, 'Series C ($275M)', '500-1000', 'hybrid', 18, ARRAY['Recent layoffs (Q3 2024)'], 'Productivity tool. Large user base but recent restructuring.'),
  ('Webflow', 3.8, 'Series C ($120M)', '500-1000', 'fully_remote', 8, ARRAY['High turnover in engineering', 'Glassdoor declining'], 'No-code website builder. Remote-first but some culture concerns.'),
  ('Supabase', 4.5, 'Series C ($116M)', '100-200', 'fully_remote', 7, '{}', 'Open source Firebase alternative. Great devex culture.');

-- Jobs
insert into jobs (company, role, salary, stage, source, match_score, days_in_stage, dual_contract_compatible, tags, red_flags) values
  ('Vercel', 'Senior Frontend Engineer', '$180-200K', 'applied', 'LinkedIn', 92, 3, true, ARRAY['Next.js', 'React', 'TypeScript', 'Edge'], '{}'),
  ('Stripe', 'Frontend Engineer, Dashboard', '$170-190K', 'phone_screen', 'Referral', 88, 5, false, ARRAY['React', 'TypeScript', 'Design Systems'], '{}'),
  ('Linear', 'Senior Frontend Engineer', '$160-180K', 'technical', 'Direct', 95, 2, true, ARRAY['React', 'TypeScript', 'Performance'], '{}'),
  ('Notion', 'Staff Frontend Engineer', '$190-220K', 'discovered', 'LinkedIn', 78, 1, false, ARRAY['React', 'TypeScript', 'Collaboration'], ARRAY['Recent layoffs']),
  ('Webflow', 'Senior UI Engineer', '$150-170K', 'saved', 'Job Board', 72, 4, true, ARRAY['React', 'CSS', 'Design Systems', 'A11y'], ARRAY['High turnover']),
  ('Supabase', 'Frontend Engineer', '$140-160K', 'applied', 'Twitter/X', 85, 6, true, ARRAY['React', 'Next.js', 'TypeScript', 'Open Source'], '{}'),
  ('Hashicorp', 'Senior Frontend Engineer', '$165-185K', 'discovered', 'LinkedIn', 80, 1, true, ARRAY['React', 'TypeScript', 'Go', 'DevTools'], '{}'),
  ('Figma', 'Frontend Engineer, Editor', '$175-200K', 'saved', 'Referral', 90, 2, false, ARRAY['React', 'Canvas', 'WebGL', 'Performance'], '{}'),
  ('Coinbase', 'Senior Frontend Engineer', '$180-210K', 'phone_screen', 'LinkedIn', 76, 3, false, ARRAY['React', 'TypeScript', 'Web3'], ARRAY['Crypto market volatility']),
  ('Planetscale', 'Frontend Engineer', '$150-170K', 'applied', 'Twitter/X', 83, 7, true, ARRAY['React', 'Next.js', 'TypeScript', 'MySQL'], '{}');

-- Resumes
insert into resumes (name, type, version, ats_score, keywords, last_modified, linked_job_title) values
  ('Master Resume — Full Stack Focus', 'master', '3.2', 92, ARRAY['React', 'TypeScript', 'Next.js', 'Node.js', 'GraphQL', 'AWS', 'CI/CD', 'Design Systems'], current_date - interval '2 days', null),
  ('Vercel — Edge & Performance', 'tailored', '1.1', 95, ARRAY['Next.js', 'Edge Functions', 'React Server Components', 'Vercel', 'Performance'], current_date - interval '3 days', 'Senior Frontend Engineer — Vercel'),
  ('Stripe — Design Systems', 'tailored', '1.0', 88, ARRAY['React', 'TypeScript', 'Design Systems', 'Component Libraries', 'A11y'], current_date - interval '5 days', 'Frontend Engineer, Dashboard — Stripe'),
  ('Linear — Performance Focus', 'tailored', '1.0', 91, ARRAY['React', 'Performance', 'TypeScript', 'Real-time', 'Collaboration'], current_date - interval '2 days', 'Senior Frontend Engineer — Linear');

-- Contacts
insert into contacts (name, role, company, email, tag, last_contact, next_follow_up, notes) values
  ('Sarah Chen', 'Engineering Manager', 'Vercel', 'sarah.chen@vercel.com', 'warm', current_date - interval '2 days', current_date + interval '5 days', 'Met at React Conf. Referred me to the senior FE role. Very responsive.'),
  ('Marcus Johnson', 'Senior Recruiter', 'Stripe', 'marcus.j@stripe.com', 'warm', current_date - interval '5 days', current_date + interval '2 days', 'Initial screen went well. Waiting on hiring manager availability.'),
  ('Emily Park', 'CTO', 'Linear', 'emily@linear.app', 'referral', current_date - interval '1 day', null, 'Connected through mutual friend. Technical interview scheduled.'),
  ('James Wright', 'Tech Lead', 'Notion', 'j.wright@notion.so', 'cold', current_date - interval '14 days', current_date + interval '1 day', 'Reached out on LinkedIn. No response yet.'),
  ('Aisha Patel', 'Recruiter', 'Webflow', 'aisha@webflow.com', 'internal', current_date - interval '7 days', current_date + interval '3 days', 'Former colleague now at Webflow. Can provide internal referral.');

-- Activity Log
insert into activity_log (type, title, description, created_at) values
  ('applied', 'Applied to Vercel', 'Submitted tailored resume for Senior Frontend Engineer role', now() - interval '3 days'),
  ('response', 'Stripe responded', 'Marcus scheduled phone screen for next Tuesday', now() - interval '2 days'),
  ('interview', 'Linear technical interview', 'Completed 90-min technical with Emily — went well', now() - interval '1 day'),
  ('follow_up', 'Followed up with Notion', 'Sent LinkedIn message to James Wright', now() - interval '14 days'),
  ('applied', 'Applied to Supabase', 'Submitted application via Twitter/X DM', now() - interval '6 days'),
  ('note', 'Updated master resume', 'Added recent contract work and Edge computing skills', now() - interval '2 days');
