-- Tables
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT, email TEXT, photo_url TEXT, language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, description TEXT, start_date DATE, end_date DATE,
  cover_image TEXT, planned_budget NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  city TEXT NOT NULL, country TEXT, start_date DATE, end_date DATE,
  stop_order INT DEFAULT 0, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_id UUID NOT NULL REFERENCES public.stops(id) ON DELETE CASCADE,
  title TEXT NOT NULL, description TEXT, category TEXT,
  start_time TEXT, duration TEXT, cost NUMERIC DEFAULT 0, image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL, title TEXT NOT NULL, amount NUMERIC NOT NULL DEFAULT 0,
  note TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL, category TEXT, is_packed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  stop_id UUID REFERENCES public.stops(id) ON DELETE SET NULL,
  title TEXT NOT NULL, content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.shared_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL UNIQUE REFERENCES public.trips(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE, is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, country TEXT NOT NULL, region TEXT,
  cost_index INT DEFAULT 50, popularity INT DEFAULT 50, image_url TEXT
);
CREATE TABLE public.activity_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, description TEXT, category TEXT,
  city TEXT, country TEXT, cost NUMERIC DEFAULT 0, duration TEXT, image_url TEXT
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_templates ENABLE ROW LEVEL SECURITY;

-- Helpers (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_trip_owner(_trip_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.trips t WHERE t.id = _trip_id AND t.user_id = auth.uid());
$$;
CREATE OR REPLACE FUNCTION public.trip_is_public(_trip_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.shared_trips st WHERE st.trip_id = _trip_id AND st.is_public = true);
$$;
CREATE OR REPLACE FUNCTION public.is_activity_owner(_stop_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.stops s JOIN public.trips t ON t.id = s.trip_id WHERE s.id = _stop_id AND t.user_id = auth.uid());
$$;
CREATE OR REPLACE FUNCTION public.activity_is_public(_stop_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.stops s JOIN public.shared_trips st ON st.trip_id = s.trip_id WHERE s.id = _stop_id AND st.is_public = true);
$$;

-- Policies
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY trips_owner_all ON public.trips FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY trips_public_shared ON public.trips FOR SELECT USING (public.trip_is_public(id));

CREATE POLICY stops_owner_all ON public.stops FOR ALL USING (public.is_trip_owner(trip_id)) WITH CHECK (public.is_trip_owner(trip_id));
CREATE POLICY stops_public_shared ON public.stops FOR SELECT USING (public.trip_is_public(trip_id));

CREATE POLICY activities_owner_all ON public.activities FOR ALL USING (public.is_activity_owner(stop_id)) WITH CHECK (public.is_activity_owner(stop_id));
CREATE POLICY activities_public_shared ON public.activities FOR SELECT USING (public.activity_is_public(stop_id));

CREATE POLICY budget_owner_all ON public.budget_items FOR ALL USING (public.is_trip_owner(trip_id)) WITH CHECK (public.is_trip_owner(trip_id));
CREATE POLICY budget_public_shared ON public.budget_items FOR SELECT USING (public.trip_is_public(trip_id));

CREATE POLICY checklist_owner_all ON public.checklist_items FOR ALL USING (public.is_trip_owner(trip_id)) WITH CHECK (public.is_trip_owner(trip_id));

CREATE POLICY notes_owner_all ON public.notes FOR ALL USING (public.is_trip_owner(trip_id)) WITH CHECK (public.is_trip_owner(trip_id));
CREATE POLICY notes_public_shared ON public.notes FOR SELECT USING (public.trip_is_public(trip_id));

CREATE POLICY shared_owner_all ON public.shared_trips FOR ALL USING (public.is_trip_owner(trip_id)) WITH CHECK (public.is_trip_owner(trip_id));
CREATE POLICY shared_public_read ON public.shared_trips FOR SELECT USING (is_public = true);

CREATE POLICY cities_public_read ON public.cities FOR SELECT USING (true);
CREATE POLICY activity_templates_public_read ON public.activity_templates FOR SELECT USING (true);

-- Profile auto-create on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)));
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;