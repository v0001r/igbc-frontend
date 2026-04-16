-- PostgreSQL migration for membership_applications
-- Goal:
-- 1) Track owner user and current step
-- 2) Enforce one active/in-progress application per user
-- 3) Optimize resume lookup

DO $$
BEGIN
  IF to_regclass('public.membership_applications') IS NULL THEN
    RAISE EXCEPTION 'Table public.membership_applications does not exist. Run backend schema/migrations first.';
  END IF;
END $$;

-- 1) Add columns (safe for re-run)
ALTER TABLE membership_applications
  ADD COLUMN IF NOT EXISTS user_id text,
  ADD COLUMN IF NOT EXISTS current_step smallint NOT NULL DEFAULT 1;

-- Optional guardrail for valid step range
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_membership_applications_current_step_range'
  ) THEN
    ALTER TABLE membership_applications
      ADD CONSTRAINT chk_membership_applications_current_step_range
      CHECK (current_step BETWEEN 1 AND 5);
  END IF;
END $$;

-- 2) Indexes for fast "resume latest app for user"
CREATE INDEX IF NOT EXISTS idx_membership_applications_user_id
  ON membership_applications (user_id);

CREATE INDEX IF NOT EXISTS idx_membership_applications_user_step
  ON membership_applications (user_id, current_step);

CREATE INDEX IF NOT EXISTS idx_membership_applications_user_created_at
  ON membership_applications (user_id, created_at DESC);

-- 3) Single active/in-progress application per user
-- Adjust status values to match your backend enum as needed.
-- This enforces uniqueness for non-finalized rows.
CREATE UNIQUE INDEX IF NOT EXISTS ux_membership_applications_one_active_per_user
  ON membership_applications (user_id)
  WHERE user_id IS NOT NULL
    AND deleted_at IS NULL
    AND (
      status IS NULL
      OR status IN (
        'draft',
        'in_progress',
        'started',
        'details_saved',
        'contact_saved',
        'review_pending',
        'invoice_generated',
        'payment_pending'
      )
    );

-- Optional foreign key (enable only if types match exactly):
-- ALTER TABLE membership_applications
--   ADD CONSTRAINT fk_membership_applications_user
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
