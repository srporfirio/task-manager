-- Smoke test: run in Supabase SQL Editor (rolls back all data)
-- Validates triggers, constraints, and week plan relations.

BEGIN;

INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'test@example.com',
  '{"full_name":"Test User"}'::jsonb,
  now(),
  now()
);

SELECT id, email, display_name FROM public.profiles
WHERE id = '11111111-1111-1111-1111-111111111111';

INSERT INTO public.themes (user_id, name, jira_key, description)
VALUES ('11111111-1111-1111-1111-111111111111', 'Test Theme', 'BEESOT-1', 'desc');

INSERT INTO public.notes (theme_id, user_id, status, content)
SELECT id, '11111111-1111-1111-1111-111111111111', 'To do', 'Note 1'
FROM public.themes WHERE name = 'Test Theme' LIMIT 1;

INSERT INTO public.week_plans (user_id, week_key)
VALUES ('11111111-1111-1111-1111-111111111111', date_trunc('week', current_date)::date);

INSERT INTO public.week_plan_items (week_plan_id, theme_id, sort_order)
SELECT wp.id, th.id, 0
FROM public.week_plans wp, public.themes th
WHERE th.name = 'Test Theme'
LIMIT 1;

DO $$
BEGIN
  INSERT INTO public.themes (user_id, name)
  VALUES ('11111111-1111-1111-1111-111111111111', 'Test Theme');
  RAISE EXCEPTION 'expected unique violation';
EXCEPTION WHEN unique_violation THEN
  NULL;
END $$;

DO $$
BEGIN
  INSERT INTO public.notes (theme_id, user_id, status, content)
  SELECT id, '11111111-1111-1111-1111-111111111111', 'Invalid', 'x'
  FROM public.themes LIMIT 1;
  RAISE EXCEPTION 'expected check violation';
EXCEPTION WHEN check_violation THEN
  NULL;
END $$;

ROLLBACK;

SELECT 'schema_tests_passed' AS result;
