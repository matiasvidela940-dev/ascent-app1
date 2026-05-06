-- ==============================================
-- ASCENT RUN CLUB — Supabase SQL Setup
-- Ejecutá esto en el SQL Editor de Supabase
-- ==============================================

-- 1. Crear tabla de atletas
CREATE TABLE IF NOT EXISTS athletes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  access_code TEXT NOT NULL UNIQUE,
  level TEXT NOT NULL DEFAULT 'INTERMEDIO',
  target_race TEXT,
  race_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Crear tabla de semanas de entrenamiento
CREATE TABLE IF NOT EXISTS training_weeks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  athlete_id TEXT NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  week_type TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Crear tabla de días de entrenamiento
CREATE TABLE IF NOT EXISTS training_days (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  week_id TEXT NOT NULL REFERENCES training_weeks(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  day_label TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  distance TEXT,
  terrain TEXT,
  pace TEXT,
  heart_rate_min INTEGER,
  heart_rate_max INTEGER,
  is_key_session BOOLEAN NOT NULL DEFAULT false,
  is_long_run BOOLEAN NOT NULL DEFAULT false,
  warmup TEXT,
  main_block TEXT,
  cooldown TEXT,
  coach_tip TEXT,
  elevation TEXT,
  intensity TEXT,
  hydration TEXT,
  recommendations TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  "order" INTEGER NOT NULL DEFAULT 0
);

-- 4. Crear tabla de feedback
CREATE TABLE IF NOT EXISTS feedbacks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  training_day_id TEXT NOT NULL UNIQUE REFERENCES training_days(id) ON DELETE CASCADE,
  feeling TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_training_weeks_athlete_id ON training_weeks(athlete_id);
CREATE INDEX IF NOT EXISTS idx_training_days_week_id ON training_days(week_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_training_day_id ON feedbacks(training_day_id);

-- 6. Deshabilitar RLS (usamos nuestro propio sistema de auth con JWT)
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- 7. Políticas permissivas (permitir todo con anon key)
-- Esto es seguro porque manejamos autenticación a nivel de app (JWT)
CREATE POLICY "Allow all operations on athletes" ON athletes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on training_weeks" ON training_weeks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on training_days" ON training_days FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on feedbacks" ON feedbacks FOR ALL USING (true) WITH CHECK (true);

-- 8. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON athletes;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON athletes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 9. Insertar atleta de prueba
INSERT INTO athletes (name, email, access_code, level) VALUES
  ('Mateo Ruiz', 'mateo@email.com', 'ASCENT01', 'INTERMEDIO')
ON CONFLICT (email) DO NOTHING;

-- 10. Insertar semana de ejemplo para Mateo
INSERT INTO training_weeks (id, athlete_id, week_number, week_type, start_date)
SELECT 'week-demo-1', a.id, 1, 'BASE', now()
FROM athletes a WHERE a.access_code = 'ASCENT01'
AND NOT EXISTS (SELECT 1 FROM training_weeks WHERE id = 'week-demo-1');

-- 11. Insertar días de ejemplo
INSERT INTO training_days (id, week_id, day_number, day_label, type, title, description, distance, terrain, pace, intensity, heart_rate_min, heart_rate_max, is_key_session, is_long_run, warmup, main_block, cooldown, coach_tip, hydration, recommendations, "order")
VALUES
  ('day-1-1', 'week-demo-1', 1, 'Lunes', 'running', 'Rodaje Suave Z1', 'Trote regenerativo para arrancar la semana', '5-6 km', 'plano', 'muy fácil', 'Z1', 120, 135, false, false, NULL, NULL, NULL, NULL, NULL, NULL, 1),
  ('day-1-2', 'week-demo-1', 2, 'Martes', 'fuerza', 'Fuerza General', 'Circuito de fuerza: piernas, core y upper', NULL, 'gimnasio', NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, 2),
  ('day-1-3', 'week-demo-1', 3, 'Miércoles', 'running', 'Rodaje Z2', 'Rodaje aeróbico en zona 2', '8 km', 'mixto', 'conversacional', 'Z2', 140, 155, false, false, NULL, NULL, NULL, NULL, NULL, NULL, 3),
  ('day-1-4', 'week-demo-1', 4, 'Jueves', 'descanso', 'Descanso Activo', 'Recuperación: caminata suave o estiramientos', NULL, NULL, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, 4),
  ('day-1-5', 'week-demo-1', 5, 'Viernes', 'running', 'Técnica de Carrera', 'Drills de técnica + rectas cortas', '7 km', 'pista', 'progresivo', 'Z3', 130, 160, true, false, '10 min trote suave + drills', '6 × 200m a ritmo 5K', '10 min trote suave', 'La técnica es la base de todo. 💪', NULL, NULL, 5),
  ('day-1-6', 'week-demo-1', 6, 'Sábado', 'trail', 'Fondo Largo ⛰️', 'Fondo progresivo en trail', '14-16 km', 'trail', 'progresivo', 'Z2-Z3', 135, 155, false, true, NULL, NULL, NULL, 'Empezá suave, terminá fuerte. 🌿', '1L mínimo. Geles cada 45 min.', '• Elegí un trail que disfrutes\n• Empezá suave\n• Prestá atención al terreno técnico', 6),
  ('day-1-7', 'week-demo-1', 7, 'Domingo', 'descanso', 'Descanso Total', 'El cuerpo crece cuando descansa', NULL, NULL, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, 7)
ON CONFLICT DO NOTHING;
