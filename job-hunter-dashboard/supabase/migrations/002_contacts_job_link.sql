-- ============================================
-- Add phone field and job linking to contacts
-- ============================================

-- Add phone number field
alter table contacts add column if not exists phone text default '';

-- Add job_id FK to link contacts to specific positions
alter table contacts add column if not exists job_id uuid references jobs(id) on delete set null;

-- Index for fast lookup of contacts by job
create index if not exists idx_contacts_job_id on contacts(job_id);
