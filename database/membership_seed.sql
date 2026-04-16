-- Seed data for membership master tables
-- PostgreSQL upsert script (safe to re-run)

-- -----------------------------------------------------
-- membership_types
-- -----------------------------------------------------
INSERT INTO membership_types
  (id, name, status, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at)
VALUES
  (1, 'Founding Membership', 1, NULL, '2021-06-15 09:41:53', NULL, NULL, NULL, NULL),
  (2, 'Annual Membership', 1, NULL, '2021-06-15 09:41:53', NULL, NULL, NULL, NULL),
  (3, 'Individual Membership', 1, NULL, '2021-06-15 09:42:24', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  created_by = EXCLUDED.created_by,
  created_at = EXCLUDED.created_at,
  updated_by = EXCLUDED.updated_by,
  updated_at = EXCLUDED.updated_at,
  deleted_by = EXCLUDED.deleted_by,
  deleted_at = EXCLUDED.deleted_at;

-- -----------------------------------------------------
-- membership_plans
-- -----------------------------------------------------
INSERT INTO membership_plans
  (id, name, fees, fee_type, status, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at)
VALUES
  (1, 'Annual Individual membership', 1500, '/ year', 1, NULL, '2023-02-28 12:36:01', NULL, NULL, NULL, NULL),
  (2, 'Individual Membership for 5 Years', 6000, '/ year', 1, NULL, '2023-02-28 12:36:01', NULL, NULL, NULL, NULL),
  (3, 'Individual Membership for 10 Years', 10000, '/ year', 1, NULL, '2023-02-28 12:36:01', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  fees = EXCLUDED.fees,
  fee_type = EXCLUDED.fee_type,
  status = EXCLUDED.status,
  created_by = EXCLUDED.created_by,
  created_at = EXCLUDED.created_at,
  updated_by = EXCLUDED.updated_by,
  updated_at = EXCLUDED.updated_at,
  deleted_by = EXCLUDED.deleted_by,
  deleted_at = EXCLUDED.deleted_at;

-- -----------------------------------------------------
-- membership_categories
-- -----------------------------------------------------
INSERT INTO membership_categories
  (id, membership_type_id, name, short_name, fee, fee_type, founding_member, status, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at)
VALUES
  (2, 2, 'Corporate', 'COR', 20000, '/ year', 0, 1, NULL, '2021-06-15 09:46:24', NULL, NULL, NULL, NULL),
  (3, 2, 'Materials and equipment manufacturers', 'MM', 20000, '/ year', 0, 1, NULL, '2021-06-15 09:46:24', NULL, NULL, NULL, NULL),
  (4, 2, 'Materials and equipment suppliers', 'MS', 20000, '/ year', 0, 1, NULL, '2021-06-15 09:46:24', NULL, NULL, NULL, NULL),
  (5, 2, 'Builders & Developers', 'BD', 10000, '/ year', 0, 1, NULL, '2021-06-15 09:46:24', NULL, NULL, NULL, NULL),
  (6, 2, 'Architects/ Planners', 'CS', 10000, '/ year', 0, 1, NULL, '2021-06-15 09:46:24', NULL, NULL, NULL, NULL),
  (7, 2, 'Interior Designers', 'CS', 10000, '/ year', 0, 1, NULL, '2021-06-15 09:46:24', NULL, NULL, NULL, NULL),
  (8, 2, 'Service Consultants', 'CS', 10000, '/ year', 0, 1, NULL, '2021-06-15 09:46:24', NULL, NULL, NULL, NULL),
  (9, 2, 'Architects/ Planners (Less than 10 Professionals)', 'CS', 5000, '/ year', 0, 1, NULL, '2021-06-15 09:46:24', NULL, NULL, NULL, NULL),
  (10, 2, 'Interior Designers (Less than 10 Professionals)', 'CS', 5000, '/ year', 0, 1, NULL, '2021-06-15 09:46:24', NULL, NULL, NULL, NULL),
  (11, 2, 'Service Consultants (Less than 10 Professionals)', 'CS', 5000, '/ year', 0, 1, NULL, '2021-06-15 09:46:24', NULL, NULL, NULL, NULL),
  (12, 2, 'Institutions', 'IST', 2500, '/ year', 0, 1, NULL, '2021-06-15 09:46:24', NULL, NULL, NULL, NULL),
  (13, 2, 'Government Bodies/ Nodal Agencies', 'GB', 2500, '/ year', 0, 1, NULL, '2021-06-15 09:46:24', NULL, NULL, NULL, NULL),
  (14, 2, 'Not-for-profit organisations', 'NP', 2500, '/ year', 0, 1, NULL, '2021-06-15 09:46:24', NULL, NULL, NULL, NULL),
  (16, 3, 'Architects', 'IM', NULL, '/ year', 0, 1, NULL, '2023-02-20 12:27:37', NULL, NULL, NULL, NULL),
  (18, 3, 'Academicians', 'IM', NULL, '/ year', 0, 1, NULL, '2021-06-15 11:58:55', NULL, NULL, NULL, NULL),
  (20, 3, 'Energy Auditors', 'IM', NULL, '/ year', 0, 1, NULL, '2023-01-11 14:39:20', NULL, NULL, NULL, NULL),
  (21, 3, 'Engineers', 'IM', NULL, '/ year', 0, 1, NULL, '2023-01-11 14:39:31', NULL, NULL, NULL, NULL),
  (22, 3, 'Govt. representatives', 'IM', NULL, '/ year', 0, 1, NULL, '2023-01-11 14:39:31', NULL, NULL, NULL, NULL),
  (23, 3, 'MEP Consultants', 'IM', NULL, '/ year', 0, 1, NULL, '2023-01-11 14:39:31', NULL, NULL, NULL, NULL),
  (24, 3, 'Students', 'IM', NULL, '/ year', 0, 1, NULL, '2023-01-11 14:39:31', NULL, NULL, NULL, NULL),
  (25, 1, 'Founding members', 'FM', 500000, '/ year', 0, 1, NULL, '2023-01-11 14:39:31', NULL, NULL, NULL, NULL),
  (31, 3, 'Other Individuals', 'IM', NULL, '/ year', 0, 1, NULL, '2023-01-11 14:39:31', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  membership_type_id = EXCLUDED.membership_type_id,
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  fee = EXCLUDED.fee,
  fee_type = EXCLUDED.fee_type,
  founding_member = EXCLUDED.founding_member,
  status = EXCLUDED.status,
  created_by = EXCLUDED.created_by,
  created_at = EXCLUDED.created_at,
  updated_by = EXCLUDED.updated_by,
  updated_at = EXCLUDED.updated_at,
  deleted_by = EXCLUDED.deleted_by,
  deleted_at = EXCLUDED.deleted_at;
