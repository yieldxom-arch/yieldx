# Level Reorder Migration Guide

## What changed

The 8-level journey was reordered on 2026-05-19 to match proper feasibility study methodology.

| Old levelId | Old title | New levelId | New title |
|------------|-----------|------------|-----------|
| 0 | Project Type Selection | 0 | Project Type Selection (unchanged) |
| 1 | Identity & Ownership | **7** | Shareholder Info & Ownership |
| 2 | Legal Framework | 2 | Legal Requirements (unchanged) |
| 3 | Physical Resources | **4** | Asset Management |
| 4 | Human Resources | **5** | Staff Planning |
| 5 | Market Strategy | **1** | Market Analysis |
| 6 | Financial KPIs | 6 | Financial Planning (unchanged) |
| 7 | BMC Implementation | *(removed from main flow)* | |
| *(new)* | — | **3** | Operational Requirements |

## Impact on existing Supabase user data

Module form data is stored in `localStorage` under `yieldx_module_data` keyed by `level0`–`level7`, and mirrored to Supabase in the `user_module_data` (or equivalent) table.

**The keys changed:**

| Old key | New key | Content |
|---------|---------|---------|
| `level1` | `level7` | Shareholder/ownership data |
| `level3` | `level4` | Fixed assets / raw materials |
| `level4` | `level5` | HR / staff planning |
| `level5` | `level1` | Market analysis / SWOT |

## Supabase migration SQL

If you store module data in a table called `user_progress` with columns `user_id`, `level_key`, `data`, run this:

```sql
-- Back up first!
CREATE TABLE user_progress_backup AS SELECT * FROM user_progress;

-- Rename keys for existing rows
UPDATE user_progress SET level_key = 'level7' WHERE level_key = 'level1';
UPDATE user_progress SET level_key = 'level4_new' WHERE level_key = 'level3';
UPDATE user_progress SET level_key = 'level5_new' WHERE level_key = 'level4';
UPDATE user_progress SET level_key = 'level1_new' WHERE level_key = 'level5';

-- Remove temporary suffixes
UPDATE user_progress SET level_key = 'level4' WHERE level_key = 'level4_new';
UPDATE user_progress SET level_key = 'level5' WHERE level_key = 'level5_new';
UPDATE user_progress SET level_key = 'level1' WHERE level_key = 'level1_new';
```

If XP/completion is stored in a `level_progress` table with a `level_id` integer column:

```sql
CREATE TABLE level_progress_backup AS SELECT * FROM level_progress;

-- Remap level IDs (use negative intermediates to avoid unique constraint conflicts)
UPDATE level_progress SET level_id = -1  WHERE level_id = 1;
UPDATE level_progress SET level_id = -3  WHERE level_id = 3;
UPDATE level_progress SET level_id = -4  WHERE level_id = 4;
UPDATE level_progress SET level_id = -5  WHERE level_id = 5;

UPDATE level_progress SET level_id = 7   WHERE level_id = -1;
UPDATE level_progress SET level_id = 4   WHERE level_id = -3;
UPDATE level_progress SET level_id = 5   WHERE level_id = -4;
UPDATE level_progress SET level_id = 1   WHERE level_id = -5;
```

Adapt table/column names to match your actual Supabase schema.
