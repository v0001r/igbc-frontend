-- Membership master tables ALTER script (for existing PostgreSQL DBs)

-- -----------------------------------------------------
-- membership_types
-- -----------------------------------------------------
ALTER TABLE membership_types
  ALTER COLUMN name TYPE varchar(100),
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN status TYPE smallint,
  ALTER COLUMN status SET DEFAULT 1,
  ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_membership_types_status ON membership_types (status);
CREATE INDEX IF NOT EXISTS idx_membership_types_deleted_at ON membership_types (deleted_at);

-- -----------------------------------------------------
-- membership_plans
-- -----------------------------------------------------
ALTER TABLE membership_plans
  ALTER COLUMN name TYPE varchar(150),
  ALTER COLUMN fees TYPE real USING fees::real,
  ALTER COLUMN fee_type TYPE varchar(50),
  ALTER COLUMN fee_type SET DEFAULT '/ year',
  ALTER COLUMN status TYPE integer USING status::integer,
  ALTER COLUMN status SET DEFAULT 1,
  ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_membership_plans_status ON membership_plans (status);
CREATE INDEX IF NOT EXISTS idx_membership_plans_deleted_at ON membership_plans (deleted_at);

-- -----------------------------------------------------
-- membership_categories
-- -----------------------------------------------------
ALTER TABLE membership_categories
  ALTER COLUMN membership_type_id TYPE integer USING membership_type_id::integer,
  ALTER COLUMN name TYPE varchar(100),
  ALTER COLUMN short_name TYPE varchar(50),
  ALTER COLUMN fee TYPE double precision USING fee::double precision,
  ALTER COLUMN fee_type TYPE varchar(50),
  ALTER COLUMN fee_type SET DEFAULT '/ year',
  ALTER COLUMN founding_member TYPE smallint USING founding_member::smallint,
  ALTER COLUMN founding_member SET DEFAULT 0,
  ALTER COLUMN status TYPE smallint USING status::smallint,
  ALTER COLUMN status SET DEFAULT 1,
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_membership_categories_membership_type_id ON membership_categories (membership_type_id);
CREATE INDEX IF NOT EXISTS idx_membership_categories_status ON membership_categories (status);
CREATE INDEX IF NOT EXISTS idx_membership_categories_deleted_at ON membership_categories (deleted_at);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_membership_categories_membership_type'
  ) THEN
    ALTER TABLE membership_categories
      ADD CONSTRAINT fk_membership_categories_membership_type
      FOREIGN KEY (membership_type_id) REFERENCES membership_types (id)
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;
