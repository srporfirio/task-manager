-- Task Manager: profiles, themes, notes, week plans

CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  display_name TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.themes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  jira_key     TEXT,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE TABLE public.notes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id     UUID NOT NULL REFERENCES public.themes(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status       TEXT NOT NULL CHECK (status IN ('To do', 'In Progress', 'Done')),
  content      TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX notes_theme_updated_idx ON public.notes(theme_id, updated_at DESC);
CREATE INDEX notes_user_id_idx ON public.notes(user_id);

CREATE TABLE public.week_plans (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_key     DATE NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_key)
);

CREATE TABLE public.week_plan_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_plan_id   UUID NOT NULL REFERENCES public.week_plans(id) ON DELETE CASCADE,
  theme_id       UUID NOT NULL REFERENCES public.themes(id) ON DELETE CASCADE,
  sort_order     INT NOT NULL DEFAULT 0,
  UNIQUE (week_plan_id, theme_id)
);

CREATE INDEX week_plan_items_plan_order_idx ON public.week_plan_items(week_plan_id, sort_order);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_note_user_id_from_theme()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT t.user_id INTO NEW.user_id
  FROM public.themes t
  WHERE t.id = NEW.theme_id;

  IF NEW.user_id IS NULL THEN
    RAISE EXCEPTION 'theme not found for note';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER notes_set_user_id
  BEFORE INSERT OR UPDATE OF theme_id ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_note_user_id_from_theme();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.week_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.week_plan_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY themes_select_own ON public.themes
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY themes_insert_own ON public.themes
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY themes_update_own ON public.themes
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY themes_delete_own ON public.themes
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY notes_select_own ON public.notes
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY notes_insert_own ON public.notes
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND EXISTS (
      SELECT 1 FROM public.themes t
      WHERE t.id = theme_id AND t.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY notes_update_own ON public.notes
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY notes_delete_own ON public.notes
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY week_plans_select_own ON public.week_plans
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY week_plans_insert_own ON public.week_plans
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY week_plans_update_own ON public.week_plans
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY week_plans_delete_own ON public.week_plans
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY week_plan_items_select_own ON public.week_plan_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.week_plans wp
      WHERE wp.id = week_plan_id AND wp.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY week_plan_items_insert_own ON public.week_plan_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.week_plans wp
      WHERE wp.id = week_plan_id AND wp.user_id = (SELECT auth.uid())
    )
    AND EXISTS (
      SELECT 1 FROM public.themes t
      WHERE t.id = theme_id AND t.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY week_plan_items_update_own ON public.week_plan_items
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.week_plans wp
      WHERE wp.id = week_plan_id AND wp.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.week_plans wp
      WHERE wp.id = week_plan_id AND wp.user_id = (SELECT auth.uid())
    )
    AND EXISTS (
      SELECT 1 FROM public.themes t
      WHERE t.id = theme_id AND t.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY week_plan_items_delete_own ON public.week_plan_items
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.week_plans wp
      WHERE wp.id = week_plan_id AND wp.user_id = (SELECT auth.uid())
    )
  );

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.themes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.week_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.week_plan_items TO authenticated;
