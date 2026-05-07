-- ==============================================
-- ASCENT RUN CLUB — Supabase SQL Setup v2
-- Ejecutá esto en el SQL Editor de Supabase
-- Columnas en camelCase para que coincidan con el código
-- ==============================================

-- 1. DROP existing tables if they exist (clean slate)
DROP TABLE IF EXISTS feedbacks CASCADE;
DROP TABLE IF EXISTS training_days CASCADE;
DROP TABLE IF EXISTS training_weeks CASCADE;
DROP TABLE IF EXISTS athletes CASCADE;

-- 2. Crear tabla de atletas (camelCase column names)
CREATE TABLE athletes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  accessCode TEXT NOT NULL UNIQUE,
  level TEXT NOT NULL DEFAULT 'INTERMEDIO',
  targetRace TEXT,
  raceDate TIMESTAMPTZ,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Crear tabla de semanas de entrenamiento
CREATE TABLE training_weeks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  athleteId TEXT NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  weekNumber INTEGER NOT NULL,
  weekType TEXT NOT NULL,
  startDate TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Crear tabla de días de entrenamiento
CREATE TABLE training_days (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  weekId TEXT NOT NULL REFERENCES training_weeks(id) ON DELETE CASCADE,
  dayNumber INTEGER NOT NULL,
  dayLabel TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  distance TEXT,
  terrain TEXT,
  pace TEXT,
  heartRateMin INTEGER,
  heartRateMax INTEGER,
  isKeySession BOOLEAN NOT NULL DEFAULT false,
  isLongRun BOOLEAN NOT NULL DEFAULT false,
  warmup TEXT,
  mainBlock TEXT,
  cooldown TEXT,
  coachTip TEXT,
  elevation TEXT,
  intensity TEXT,
  hydration TEXT,
  recommendations TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  completedAt TIMESTAMPTZ,
  "order" INTEGER NOT NULL DEFAULT 0
);

-- 5. Crear tabla de feedback
CREATE TABLE feedbacks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  trainingDayId TEXT NOT NULL UNIQUE REFERENCES training_days(id) ON DELETE CASCADE,
  feeling TEXT NOT NULL,
  comment TEXT,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Índices para performance
CREATE INDEX idx_training_weeks_athleteId ON training_weeks(athleteId);
CREATE INDEX idx_training_days_weekId ON training_days(weekId);
CREATE INDEX idx_feedbacks_trainingDayId ON feedbacks(trainingDayId);

-- 7. Habilitar RLS con políticas permisivas
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on athletes" ON athletes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on training_weeks" ON training_weeks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on training_days" ON training_days FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on feedbacks" ON feedbacks FOR ALL USING (true) WITH CHECK (true);

-- 8. Trigger para updatedAt
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON athletes;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON athletes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 9. Insertar atletas de prueba
INSERT INTO athletes (id, name, email, accessCode, level) VALUES
  ('athlete-mateo', 'Mateo Ruiz', 'mateo@email.com', 'ASCENT01', 'INTERMEDIO'),
  ('athlete-valentina', 'Valentina Torres', 'valentina@email.com', 'ASCENT02', 'ELITE')
ON CONFLICT (email) DO NOTHING;

-- 10. Insertar semana de ejemplo para Mateo
INSERT INTO training_weeks (id, athleteId, weekNumber, weekType, startDate)
VALUES ('week-mateo-1', 'athlete-mateo', 1, 'BASE', now())
ON CONFLICT DO NOTHING;

-- 11. Insertar días de ejemplo para Mateo
INSERT INTO training_days (id, weekId, dayNumber, dayLabel, type, title, description, distance, terrain, pace, intensity, heartRateMin, heartRateMax, isKeySession, isLongRun, warmup, mainBlock, cooldown, coachTip, hydration, recommendations, "order")
VALUES
  ('day-m-1', 'week-mateo-1', 1, 'Lunes', 'running', 'Rodaje Suave Z1', 'Trote regenerativo para arrancar la semana', '5-6 km', 'plano', 'muy fácil', 'Z1', 120, 135, false, false, NULL, NULL, NULL, NULL, NULL, NULL, 1),
  ('day-m-2', 'week-mateo-1', 2, 'Martes', 'fuerza', 'Fuerza General', 'Circuito de fuerza: piernas, core y upper', NULL, 'gimnasio', NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, 2),
  ('day-m-3', 'week-mateo-1', 3, 'Miércoles', 'running', 'Rodaje Z2', 'Rodaje aeróbico en zona 2', '8 km', 'mixto', 'conversacional', 'Z2', 140, 155, false, false, NULL, NULL, NULL, NULL, NULL, NULL, 3),
  ('day-m-4', 'week-mateo-1', 4, 'Jueves', 'descanso', 'Descanso Activo', 'Recuperación: caminata suave o estiramientos', NULL, NULL, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, 4),
  ('day-m-5', 'week-mateo-1', 5, 'Viernes', 'running', 'Técnica de Carrera', 'Drills de técnica + rectas cortas', '7 km', 'pista', 'progresivo', 'Z3', 130, 160, true, false, '10 min trote suave + drills', '6 × 200m a ritmo 5K', '10 min trote suave', 'La técnica es la base de todo.', NULL, NULL, 5),
  ('day-m-6', 'week-mateo-1', 6, 'Sábado', 'trail', 'Fondo Largo', 'Fondo progresivo en trail', '14-16 km', 'trail', 'progresivo', 'Z2-Z3', 135, 155, false, true, NULL, NULL, NULL, 'Empezá suave, terminá fuerte.', '1L mínimo. Geles cada 45 min.', 'Elegí un trail que disfrutes. Empezá suave.', 6),
  ('day-m-7', 'week-mateo-1', 7, 'Domingo', 'descanso', 'Descanso Total', 'El cuerpo crece cuando descansa', NULL, NULL, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, 7)
ON CONFLICT DO NOTHING;

-- 12. Insertar semana de ejemplo para Valentina (nivel ELITE)
INSERT INTO training_weeks (id, athleteId, weekNumber, weekType, startDate)
VALUES ('week-val-1', 'athlete-valentina', 1, 'CARGA', now())
ON CONFLICT DO NOTHING;

INSERT INTO training_days (id, weekId, dayNumber, dayLabel, type, title, description, distance, terrain, pace, intensity, heartRateMin, heartRateMax, isKeySession, isLongRun, warmup, mainBlock, cooldown, coachTip, hydration, recommendations, "order")
VALUES
  ('day-v-1', 'week-val-1', 1, 'Lunes', 'running', 'Rodaje Regenerativo Z1', 'Trote muy suave de recuperación', '6 km', 'plano', 'muy fácil', 'Z1', 115, 130, false, false, NULL, NULL, NULL, NULL, NULL, NULL, 1),
  ('day-v-2', 'week-val-1', 2, 'Martes', 'running', 'Intervalos Z4-Z5', 'Sesión de calidad: intervalos largos', '10 km total', 'pista', 'fuerte', 'Z4-Z5', 160, 180, true, false, '15 min trote suave + drills', '5 × 1000m a ritmo 5K con 2 min rec', '10 min trote suave', 'Confiá en tu entrenamiento. Cada intervalo te hace más fuerte.', NULL, NULL, 2),
  ('day-v-3', 'week-val-1', 3, 'Miércoles', 'trail', 'Rodaje Trail Z2', 'Rodaje aeróbico en senderos', '10 km', 'trail', 'conversacional', 'Z2', 140, 155, false, false, NULL, NULL, NULL, NULL, NULL, NULL, 3),
  ('day-v-4', 'week-val-1', 4, 'Jueves', 'fuerza', 'Fuerza Específica', 'Fuerza orientada a running y trail', NULL, 'gimnasio', NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, 4),
  ('day-v-5', 'week-val-1', 5, 'Viernes', 'running', 'Tempo Run Z3', 'Rodaje a ritmo moderado sostenido', '8 km', 'mixto', 'moderado', 'Z3', 150, 165, true, false, '10 min trote suave', '20 min a ritmo tempo (Z3)', '10 min trote suave', 'Controlá el ritmo, no te pases. La consistencia gana carreras.', NULL, NULL, 5),
  ('day-v-6', 'week-val-1', 6, 'Sábado', 'trail', 'Fondo Largo Trail', 'Fondo largo en trail con desnivel', '18-20 km', 'trail montaña', 'progresivo', 'Z2-Z3', 135, 155, false, true, NULL, NULL, NULL, 'Somos de montaña. Disfrutá cada subida.', '1.5L mínimo. Geles cada 40 min.', 'Prestá atención al terreno técnico en las bajadas.', 6),
  ('day-v-7', 'week-val-1', 7, 'Domingo', 'descanso', 'Descanso Total', 'Recuperación completa', NULL, NULL, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, 7)
ON CONFLICT DO NOTHING;
