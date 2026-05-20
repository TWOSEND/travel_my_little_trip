CREATE TABLE trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  destination text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trips_select_own" ON trips
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "trips_insert_own" ON trips
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "trips_update_own" ON trips
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "trips_delete_own" ON trips
  FOR DELETE USING (user_id = auth.uid());
