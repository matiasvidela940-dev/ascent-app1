import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

const COACH_CODE = 'ENTRENADOR'

type DayTemplate = {
  type: string
  title: string
  description?: string
  distance?: string
  terrain?: string
  pace?: string
  intensity?: string
  heartRateMin?: string
  heartRateMax?: string
  isKeySession?: boolean
  isLongRun?: boolean
  elevation?: string
  warmup?: string
  mainBlock?: string
  cooldown?: string
  coachTip?: string
  hydration?: string
  recommendations?: string
}

type WeekTemplate = DayTemplate[]

type LevelTemplates = Record<string, WeekTemplate>

function getTemplatesForLevel(level: string): LevelTemplates {
  const ELITE: LevelTemplates = {
    BASE: [
      { type: 'running', title: 'Rodado suave 10km', description: 'Rodado regenerativo en zona 1, ritmo muy cómodo. Enfocate en técnica y relajación.', distance: '10km', terrain: 'pista/calle', pace: 'regenerativo', intensity: 'Z1', heartRateMin: '120', heartRateMax: '135', isKeySession: false, isLongRun: false, warmup: '5min trote suave + movilidad articular', mainBlock: '10km rodado Z1 continuo', cooldown: '5min caminata + estiramientos', coachTip: 'No mires el reloj, corre por sensación. Este día es para recuperar.', hydration: '500ml durante + 250ml post', recommendations: 'Usar calzado de entrenamiento, no competición' },
      { type: 'fuerza', title: 'Fuerza general', description: 'Sesión de fuerza enfocada en piernas y core. Sentadillas, peso muerto, step-ups, plancha.', terrain: 'gimnasio', isKeySession: false, isLongRun: false, warmup: '10min cardio suave + movilidad', mainBlock: '4x10 sentadillas, 3x10 peso muerto, 3x12 step-ups, 3x45s plancha', cooldown: '10min estiramientos + foam roller', coachTip: 'La fuerza es la base de la prevención de lesiones. No la saltes.', recommendations: 'Descanso 60-90s entre series' },
      { type: 'running', title: 'Rodado medio 14km', description: 'Rodado en zona 2, ritmo conversacional pero sostenido. Tramo final progresivo.', distance: '14km', terrain: 'mixto', pace: 'conversacional', intensity: 'Z2', heartRateMin: '135', heartRateMax: '150', isKeySession: false, isLongRun: false, warmup: '10min trote suave + movilidad', mainBlock: '12km Z2 + 2km progresivo Z2-Z3', cooldown: '5min caminata + estiramientos', coachTip: 'Mantén la conversación durante la mayor parte. Los últimos 2km subí gradualmente.', hydration: '750ml durante + 500ml post', recommendations: 'Ruta con algún desnivel suave' },
      { type: 'descanso', title: 'Descanso completo', description: 'Día de descanso total. Hidratate bien y realizá estiramientos suaves si lo sentís necesario.', isKeySession: false, isLongRun: false, coachTip: 'El descanso es parte del entrenamiento. Tu cuerpo se fortalece cuando descansa.' },
      { type: 'running', title: 'Técnica de carrera 12km', description: 'Sesión de técnica con progresión a Z3. Incluye drills de técnica y tramos a ritmo.', distance: '12km', terrain: 'pista/terreno firme', pace: 'progresivo', intensity: 'Z3', heartRateMin: '150', heartRateMax: '165', isKeySession: true, isLongRun: false, warmup: '10min trote suave + 6x drills de técnica (skip, A-skip, bounding)', mainBlock: '6x1000m a ritmo Z3 con 90s recuperación + 4km rodado Z2', cooldown: '10min caminata + estiramientos dinámicos', coachTip: 'Sesión clave de la semana. Enfocate en la técnica durante los drills y mantené el ritmo en las series.', hydration: '500ml durante + 500ml post', recommendations: 'Usar calzado ligero para las series' },
      { type: 'trail', title: 'Fondo trail 22-25km', description: 'Fondo largo en trail con desnivel. Ritmo cómodo, enfocate en ritmo en subida y técnica en bajada.', distance: '22-25km', terrain: 'trail', pace: 'fondo trail', intensity: 'Z1-Z2', heartRateMin: '130', heartRateMax: '155', isKeySession: false, isLongRun: true, elevation: '700m+', warmup: '10min trote suave en plano', mainBlock: '20-23km trail con desnivel 700m+, ritmo Z1-Z2 en subida, suelto en bajada', cooldown: '10min caminata + estiramientos + foam roller', coachTip: 'El fondo largo es la sesión más importante para ultras. No saltes este día. Probá nutrición e hidratación de carrera.', hydration: '1.5L durante + 500ml post + electrolitos', recommendations: 'Probar geles/snacks de carrera. Llevar bastones si los usás en carrera.' },
      { type: 'descanso', title: 'Descanso completo', description: 'Día de descanso total. Podés hacer estiramientos suaves o caminata liviana si lo necesitás.', isKeySession: false, isLongRun: false, coachTip: 'Después del fondo largo, el descanso es fundamental. No intentes compensar.' },
    ],
    CARGA: [
      { type: 'running', title: 'Rodado suave 10km', description: 'Rodado regenerativo en zona 1. Mantené ritmo muy cómodo para empezar la semana de carga.', distance: '10km', terrain: 'pista/calle', pace: 'regenerativo', intensity: 'Z1', heartRateMin: '120', heartRateMax: '135', isKeySession: false, isLongRun: false, warmup: '5min trote suave + movilidad', mainBlock: '10km rodado Z1 continuo', cooldown: '5min caminata + estiramientos', coachTip: 'Semana de carga: este rodado es más importante que nunca. Empezá con energía almacenada.', hydration: '500ml durante + 250ml post' },
      { type: 'fuerza', title: 'Fuerza general', description: 'Sesión de fuerza con algo más de intensidad. Sentadillas, peso muerto, step-ups, plancha, peso ruso.', terrain: 'gimnasio', isKeySession: false, isLongRun: false, warmup: '10min cardio suave + movilidad', mainBlock: '4x12 sentadillas, 4x10 peso muerto, 3x15 step-ups, 3x60s plancha, 3x15 peso ruso', cooldown: '10min estiramientos + foam roller', coachTip: 'En semana de carga, la fuerza te mantiene estable. No la saltes.', recommendations: 'Descanso 60s entre series' },
      { type: 'running', title: 'Rodado medio 16km', description: 'Rodado sostenido en Z2 con tramos de Z3. Volumen superior a semana BASE.', distance: '16km', terrain: 'mixto', pace: 'conversacional a sostenido', intensity: 'Z2-Z3', heartRateMin: '135', heartRateMax: '160', isKeySession: false, isLongRun: false, warmup: '10min trote suave + movilidad', mainBlock: '10km Z2 + 4km Z2-Z3 + 2km enfriamiento', cooldown: '5min caminata + estiramientos', coachTip: 'En semana de carga, este rodado tiene más volumen y algo de intensidad. Concentrate en mantener la forma.', hydration: '750ml durante + 500ml post' },
      { type: 'descanso', title: 'Descanso completo', description: 'Día de descanso total antes de las sesiones clave de la semana.', isKeySession: false, isLongRun: false, coachTip: 'Descansá bien: mañana tenés sesión intensa.' },
      { type: 'trail', title: 'Series en cuesta 12km', description: 'Sesión clave de series en cuesta para ganar potencia y fuerza específica. Z4-Z5 en las subidas.', distance: '12km', terrain: 'trail/cuesta', pace: 'series cuesta', intensity: 'Z4-Z5', heartRateMin: '165', heartRateMax: '185', isKeySession: true, isLongRun: false, elevation: '400m+', warmup: '15min trote suave + drills de técnica + 2 subidas cortas progresivas', mainBlock: '8x2min subida fuerte Z4-Z5 + bajada trote Z1 (recuperación)', cooldown: '10min trote suave + estiramientos', coachTip: 'Sesión CLAVE de la semana. Las cuestas te hacen más fuerte para las subidas de carrera. No te guardes nada en las subidas.', hydration: '750ml durante + 500ml post', recommendations: 'Elegir una cuesta de 8-12% de inclinación. Llevar bastones si los usás.' },
      { type: 'trail', title: 'Fondo trail 28-32km', description: 'Fondo largo en trail con gran desnivel. Simulá condiciones de carrera.', distance: '28-32km', terrain: 'trail', pace: 'fondo trail', intensity: 'Z1-Z2', heartRateMin: '130', heartRateMax: '155', isKeySession: false, isLongRun: true, elevation: '900m+', warmup: '10min trote suave', mainBlock: '26-30km trail con desnivel 900m+, ritmo Z1-Z2 en subida, técnico en bajada', cooldown: '10min caminata + estiramientos + foam roller', coachTip: 'El fondo largo de semana de carga es el más importante. Simulá la carrera: nutrición, hidratación, bastones, todo como si fuera carrera.', hydration: '2L durante + 750ml post + electrolitos', recommendations: 'Probar todo el equipo de carrera. Simular horarios de alimentación.' },
      { type: 'descanso', title: 'Descanso completo', description: 'Descanso total después del gran fondo. Estiramientos suaves si lo necesitás.', isKeySession: false, isLongRun: false, coachTip: 'Después de un fondo de 30km+, el cuerpo necesita descanso completo. No hagas actividad.' },
    ],
    PICO: [
      { type: 'running', title: 'Rodado suave 8km', description: 'Rodado regenerativo muy suave en Z1. Semana pico: empezá conservando energía.', distance: '8km', terrain: 'pista/calle', pace: 'regenerativo', intensity: 'Z1', heartRateMin: '120', heartRateMax: '135', isKeySession: false, isLongRun: false, warmup: '5min trote suave + movilidad', mainBlock: '8km rodado Z1 continuo', cooldown: '5min caminata + estiramientos', coachTip: 'Semana PICO: el volumen baja pero la intensidad sube. Guardá energía para las sesiones clave.' },
      { type: 'running', title: 'Intervalos 12km', description: 'Sesión clave de intervalos largos en Z4-Z5. Potencia máxima.', distance: '12km', terrain: 'pista/terreno firme', pace: 'intervalos', intensity: 'Z4-Z5', heartRateMin: '165', heartRateMax: '190', isKeySession: true, isLongRun: false, warmup: '15min trote suave + drills + 2x100m strides', mainBlock: '5x3min Z4-Z5 con 2min recuperación Z1 + 3x1min Z5 con 1min recuperación', cooldown: '10min trote suave + estiramientos', coachTip: 'Sesión CLAVE. Los intervalos a Z4-Z5 te preparan para los cambios de ritmo en carrera. Dá todo en cada repetición.', hydration: '750ml durante + 500ml post' },
      { type: 'descanso', title: 'Descanso completo', description: 'Descanso total. Recuperá de los intervalos.', isKeySession: false, isLongRun: false, coachTip: 'Después de intervalos intensos, el descanso es obligatorio.' },
      { type: 'running', title: 'Rodado medio 10km', description: 'Rodado en Z2, ritmo cómodo. Activo recuperación pero sin acumular fatiga.', distance: '10km', terrain: 'mixto', pace: 'conversacional', intensity: 'Z2', heartRateMin: '135', heartRateMax: '150', isKeySession: false, isLongRun: false, warmup: '5min trote suave', mainBlock: '10km Z2 continuo', cooldown: '5min caminata + estiramientos', coachTip: 'Rodado de transición. No te pases de intensidad, solo activá las piernas.' },
      { type: 'fuerza', title: 'Fuerza mantenimiento', description: 'Sesión de fuerza reducida, solo mantenimiento. Volumen bajo, sin llegar al fallo.', terrain: 'gimnasio', isKeySession: false, isLongRun: false, warmup: '10min cardio suave + movilidad', mainBlock: '2x10 sentadillas, 2x10 peso muerto, 2x12 step-ups, 2x45s plancha', cooldown: '10min estiramientos', coachTip: 'Fuerza de mantenimiento: menos series, misma técnica. No busques mejorar, solo mantener.', recommendations: 'Carga moderada, sin llegar al fallo muscular' },
      { type: 'trail', title: 'Fondo trail 25-28km', description: 'Fondo largo en trail con buen desnivel. Último fondo largo antes de la descarga.', distance: '25-28km', terrain: 'trail', pace: 'fondo trail', intensity: 'Z1-Z2', heartRateMin: '130', heartRateMax: '155', isKeySession: false, isLongRun: true, elevation: '800m+', warmup: '10min trote suave', mainBlock: '23-26km trail con desnivel 800m+, ritmo Z1-Z2', cooldown: '10min caminata + estiramientos + foam roller', coachTip: 'Último gran fondo antes del taper. Hacelo como simulacro de carrera pero sin apretar demasiado.', hydration: '1.5L durante + 500ml post + electrolitos', recommendations: 'Simular condiciones de carrera' },
      { type: 'descanso', title: 'Descanso completo', description: 'Descanso total después del fondo largo.', isKeySession: false, isLongRun: false, coachTip: 'El cuerpo necesita recuperarse del esfuerzo. Mañana ya entrás en semana de descarga.' },
    ],
    DESCARGA: [
      { type: 'running', title: 'Rodado suave 6km', description: 'Rodado regenerativo muy suave. Taper: reducí volumen significativamente.', distance: '6km', terrain: 'pista/calle', pace: 'regenerativo', intensity: 'Z1', heartRateMin: '120', heartRateMax: '135', isKeySession: false, isLongRun: false, warmup: '5min trote suave + movilidad', mainBlock: '6km rodado Z1 continuo', cooldown: '5min caminata + estiramientos', coachTip: 'TAPER: Menos es más. Reducí volumen pero mantené algo de intensidad en los días clave. Este rodado es solo para mover las piernas.' },
      { type: 'running', title: 'Progresivo 8km', description: 'Rodado progresivo de Z1 a Z3. Activá las piernas sin acumular fatiga.', distance: '8km', terrain: 'pista/calle', pace: 'progresivo', intensity: 'Z1-Z3', heartRateMin: '120', heartRateMax: '165', isKeySession: false, isLongRun: false, warmup: '5min trote suave', mainBlock: '3km Z1 + 3km Z2 + 2km Z3', cooldown: '5min caminata + estiramientos', coachTip: 'El progresivo mantiene las piernas activas sin fatiga. Sentí el ritmo pero no lo fuerzas.' },
      { type: 'descanso', title: 'Descanso completo', description: 'Descanso total en semana de descarga. Tu cuerpo se prepara para la carrera.', isKeySession: false, isLongRun: false, coachTip: 'El taper es difícil mentalmente pero esencial. Confiá en el entrenamiento hecho.' },
      { type: 'running', title: 'Técnica 7km', description: 'Sesión de técnica con algo de Z2-Z3. Muy controlada, sin acumular fatiga.', distance: '7km', terrain: 'pista/terreno firme', pace: 'técnica', intensity: 'Z2-Z3', heartRateMin: '135', heartRateMax: '165', isKeySession: false, isLongRun: false, warmup: '5min trote suave + drills de técnica', mainBlock: '4x200m a ritmo Z3 con 200m trote Z1 + 4km rodado Z2', cooldown: '5min caminata + estiramientos', coachTip: 'Sesión para mantener las piernas despiertas. Sin acumular fatiga, sin apretar de más.' },
      { type: 'descanso', title: 'Descanso activo', description: 'Caminata suave o yoga. Mové el cuerpo sin estrés.', isKeySession: false, isLongRun: false, coachTip: 'Descanso activo: caminá, hacé yoga, estirá. Pero sin intensidad.' },
      { type: 'trail', title: 'Fondo trail suave 14-16km', description: 'Fondo corto y suave en trail. Solo para mantener la sensación, sin fatiga.', distance: '14-16km', terrain: 'trail', pace: 'fondo suave', intensity: 'Z1-Z2', heartRateMin: '120', heartRateMax: '145', isKeySession: false, isLongRun: true, elevation: '300m+', warmup: '5min trote suave', mainBlock: '12-14km trail suave con 300m+ de desnivel, ritmo Z1-Z2', cooldown: '10min caminata + estiramientos', coachTip: 'Último fondo antes de la carrera. Corto y suave. No te tentes a apretar.', hydration: '750ml durante + 500ml post' },
      { type: 'descanso', title: 'Descanso completo', description: 'Descanso total. Preparación mental para la carrera.', isKeySession: false, isLongRun: false, coachTip: 'Visualizá la carrera. Repasá la estrategia. Confiá en tu preparación.' },
    ],
  }

  const INTERMEDIO: LevelTemplates = {
    BASE: [
      { type: 'running', title: 'Rodado suave 6km', description: 'Rodado regenerativo en zona 1. Ritmo muy cómodo, enfocate en técnica de carrera.', distance: '6km', terrain: 'pista/calle', pace: 'regenerativo', intensity: 'Z1', heartRateMin: '125', heartRateMax: '140', isKeySession: false, isLongRun: false, warmup: '5min trote suave + movilidad articular', mainBlock: '6km rodado Z1 continuo', cooldown: '5min caminata + estiramientos', coachTip: 'Este rodado es para recuperar. No mires el reloj, corre por sensación.', hydration: '400ml durante + 250ml post' },
      { type: 'fuerza', title: 'Fuerza general', description: 'Sesión de fuerza para piernas y core. Sentadillas, peso muerto, step-ups, plancha.', terrain: 'gimnasio', isKeySession: false, isLongRun: false, warmup: '10min cardio suave + movilidad', mainBlock: '3x10 sentadillas, 3x10 peso muerto, 3x12 step-ups, 3x30s plancha', cooldown: '10min estiramientos + foam roller', coachTip: 'La fuerza previene lesiones y mejora tu rendimiento en trail. No la saltes.', recommendations: 'Descanso 60s entre series' },
      { type: 'running', title: 'Rodado medio 8km', description: 'Rodado en zona 2, ritmo conversacional. Tramo final opcional de progresión.', distance: '8km', terrain: 'mixto', pace: 'conversacional', intensity: 'Z2', heartRateMin: '140', heartRateMax: '155', isKeySession: false, isLongRun: false, warmup: '5min trote suave + movilidad', mainBlock: '6km Z2 + 2km progresivo Z2-Z3', cooldown: '5min caminata + estiramientos', coachTip: 'Mantén la conversación durante el rodado. Los últimos 2km subí un poco si te sentís bien.', hydration: '500ml durante + 250ml post' },
      { type: 'descanso', title: 'Descanso completo', description: 'Día de descanso total. Hidratate bien y realizá estiramientos suaves.', isKeySession: false, isLongRun: false, coachTip: 'El descanso es parte del entrenamiento. Tu cuerpo crece cuando descansa.' },
      { type: 'running', title: 'Técnica de carrera 7km', description: 'Sesión de técnica con progresión a Z3. Incluye drills y tramos a ritmo.', distance: '7km', terrain: 'pista/terreno firme', pace: 'progresivo', intensity: 'Z3', heartRateMin: '155', heartRateMax: '170', isKeySession: true, isLongRun: false, warmup: '10min trote suave + 6x drills de técnica', mainBlock: '4x800m a ritmo Z3 con 90s recuperación + 3km rodado Z2', cooldown: '10min caminata + estiramientos', coachTip: 'Sesión clave de la semana. Enfocate en la técnica durante los drills y mantené el ritmo en las series.', hydration: '500ml durante + 250ml post', recommendations: 'Usar calzado ligero para las series' },
      { type: 'trail', title: 'Fondo trail 14-16km', description: 'Fondo largo en trail con desnivel. Ritmo cómodo, disfrutá del sendero.', distance: '14-16km', terrain: 'trail', pace: 'fondo trail', intensity: 'Z1-Z2', heartRateMin: '130', heartRateMax: '155', isKeySession: false, isLongRun: true, elevation: '350m+', warmup: '10min trote suave en plano', mainBlock: '12-14km trail con 350m+ de desnivel, ritmo Z1-Z2 en subida, suelto en bajada', cooldown: '10min caminata + estiramientos + foam roller', coachTip: 'El fondo largo es la sesión más importante. No la saltes. Probá nutrición e hidratación de carrera.', hydration: '1L durante + 500ml post + electrolitos', recommendations: 'Probar geles/snacks de carrera' },
      { type: 'descanso', title: 'Descanso completo', description: 'Descanso total después del fondo. Estiramientos suaves si lo necesitás.', isKeySession: false, isLongRun: false, coachTip: 'Después del fondo largo, descansá completo. No intentes compensar.' },
    ],
    CARGA: [
      { type: 'running', title: 'Rodado suave 6km', description: 'Rodado regenerativo en Z1. Empezá la semana de carga con energía.', distance: '6km', terrain: 'pista/calle', pace: 'regenerativo', intensity: 'Z1', heartRateMin: '125', heartRateMax: '140', isKeySession: false, isLongRun: false, warmup: '5min trote suave + movilidad', mainBlock: '6km rodado Z1 continuo', cooldown: '5min caminata + estiramientos', coachTip: 'Semana de carga: este rodado es clave para empezar con energía almacenada.', hydration: '400ml durante + 250ml post' },
      { type: 'fuerza', title: 'Fuerza general', description: 'Sesión de fuerza con algo más de volumen. Sentadillas, peso muerto, step-ups, plancha.', terrain: 'gimnasio', isKeySession: false, isLongRun: false, warmup: '10min cardio suave + movilidad', mainBlock: '4x10 sentadillas, 3x10 peso muerto, 3x12 step-ups, 3x45s plancha', cooldown: '10min estiramientos + foam roller', coachTip: 'En semana de carga, la fuerza te mantiene estable.', recommendations: 'Descanso 60s entre series' },
      { type: 'running', title: 'Rodado medio 10km', description: 'Rodado sostenido en Z2 con tramos de Z3. Más volumen que semana BASE.', distance: '10km', terrain: 'mixto', pace: 'conversacional a sostenido', intensity: 'Z2-Z3', heartRateMin: '140', heartRateMax: '165', isKeySession: false, isLongRun: false, warmup: '10min trote suave + movilidad', mainBlock: '6km Z2 + 3km Z2-Z3 + 1km enfriamiento', cooldown: '5min caminata + estiramientos', coachTip: 'En semana de carga, este rodado tiene más volumen y algo de intensidad.', hydration: '500ml durante + 500ml post' },
      { type: 'descanso', title: 'Descanso completo', description: 'Descanso antes de las sesiones clave.', isKeySession: false, isLongRun: false, coachTip: 'Descansá bien: mañana tenés sesión intensa.' },
      { type: 'trail', title: 'Series en cuesta 8km', description: 'Sesión clave de series en cuesta para ganar potencia. Z4-Z5 en las subidas.', distance: '8km', terrain: 'trail/cuesta', pace: 'series cuesta', intensity: 'Z4-Z5', heartRateMin: '165', heartRateMax: '180', isKeySession: true, isLongRun: false, elevation: '300m+', warmup: '15min trote suave + drills + 2 subidas cortas progresivas', mainBlock: '6x2min subida fuerte Z4-Z5 + bajada trote Z1 (recuperación)', cooldown: '10min trote suave + estiramientos', coachTip: 'Sesión CLAVE. Las cuestas te hacen más fuerte para las subidas de carrera. Dá todo en cada subida.', hydration: '500ml durante + 500ml post', recommendations: 'Elegir cuesta de 8-12% de inclinación' },
      { type: 'trail', title: 'Fondo trail 20-22km', description: 'Fondo largo en trail con buen desnivel. Simulá condiciones de carrera.', distance: '20-22km', terrain: 'trail', pace: 'fondo trail', intensity: 'Z1-Z2', heartRateMin: '130', heartRateMax: '155', isKeySession: false, isLongRun: true, elevation: '600m+', warmup: '10min trote suave', mainBlock: '18-20km trail con 600m+ de desnivel, ritmo Z1-Z2 en subida', cooldown: '10min caminata + estiramientos + foam roller', coachTip: 'Fondo largo de carga: simulá la carrera con nutrición e hidratación.', hydration: '1.5L durante + 500ml post + electrolitos', recommendations: 'Probar equipo y nutrición de carrera' },
      { type: 'descanso', title: 'Descanso completo', description: 'Descanso total después del fondo largo.', isKeySession: false, isLongRun: false, coachTip: 'El cuerpo necesita recuperarse. No hagas actividad.' },
    ],
    PICO: [
      { type: 'running', title: 'Rodado suave 5km', description: 'Rodado regenerativo en Z1. Semana pico: conservá energía.', distance: '5km', terrain: 'pista/calle', pace: 'regenerativo', intensity: 'Z1', heartRateMin: '125', heartRateMax: '140', isKeySession: false, isLongRun: false, warmup: '5min trote suave + movilidad', mainBlock: '5km rodado Z1 continuo', cooldown: '5min caminata + estiramientos', coachTip: 'Semana PICO: volumen baja, intensidad sube. Guardá energía para las sesiones clave.' },
      { type: 'running', title: 'Intervalos 9km', description: 'Sesión clave de intervalos en Z4-Z5. Potencia máxima.', distance: '9km', terrain: 'pista/terreno firme', pace: 'intervalos', intensity: 'Z4-Z5', heartRateMin: '165', heartRateMax: '185', isKeySession: true, isLongRun: false, warmup: '15min trote suave + drills + 2x100m strides', mainBlock: '4x3min Z4-Z5 con 2min recuperación Z1 + 2x1min Z5 con 1min recuperación', cooldown: '10min trote suave + estiramientos', coachTip: 'Sesión CLAVE. Los intervalos te preparan para cambios de ritmo en carrera. Dá todo.', hydration: '500ml durante + 500ml post' },
      { type: 'descanso', title: 'Descanso completo', description: 'Descanso total. Recuperá de los intervalos.', isKeySession: false, isLongRun: false, coachTip: 'Después de intervalos intensos, descanso obligatorio.' },
      { type: 'running', title: 'Rodado medio 7km', description: 'Rodado en Z2, ritmo cómodo. Activá las piernas sin fatiga.', distance: '7km', terrain: 'mixto', pace: 'conversacional', intensity: 'Z2', heartRateMin: '140', heartRateMax: '155', isKeySession: false, isLongRun: false, warmup: '5min trote suave', mainBlock: '7km Z2 continuo', cooldown: '5min caminata + estiramientos', coachTip: 'Rodado de transición. Solo activá las piernas, sin apretar.' },
      { type: 'fuerza', title: 'Fuerza mantenimiento', description: 'Sesión de fuerza reducida. Solo mantenimiento, sin llegar al fallo.', terrain: 'gimnasio', isKeySession: false, isLongRun: false, warmup: '10min cardio suave + movilidad', mainBlock: '2x8 sentadillas, 2x8 peso muerto, 2x10 step-ups, 2x30s plancha', cooldown: '10min estiramientos', coachTip: 'Fuerza de mantenimiento: menos series, misma técnica.', recommendations: 'Carga moderada, sin fallo muscular' },
      { type: 'trail', title: 'Fondo trail 18-20km', description: 'Fondo largo en trail. Último gran fondo antes del taper.', distance: '18-20km', terrain: 'trail', pace: 'fondo trail', intensity: 'Z1-Z2', heartRateMin: '130', heartRateMax: '155', isKeySession: false, isLongRun: true, elevation: '500m+', warmup: '10min trote suave', mainBlock: '16-18km trail con 500m+ de desnivel, ritmo Z1-Z2', cooldown: '10min caminata + estiramientos + foam roller', coachTip: 'Último gran fondo. Hacelo como simulacro de carrera sin apretar de más.', hydration: '1L durante + 500ml post + electrolitos', recommendations: 'Simular condiciones de carrera' },
      { type: 'descanso', title: 'Descanso completo', description: 'Descanso total después del fondo.', isKeySession: false, isLongRun: false, coachTip: 'Recuperate bien. La semana que viene entrás en taper.' },
    ],
    DESCARGA: [
      { type: 'running', title: 'Rodado suave 4km', description: 'Rodado regenerativo muy suave. Taper: reducí volumen.', distance: '4km', terrain: 'pista/calle', pace: 'regenerativo', intensity: 'Z1', heartRateMin: '125', heartRateMax: '140', isKeySession: false, isLongRun: false, warmup: '5min trote suave + movilidad', mainBlock: '4km rodado Z1 continuo', cooldown: '5min caminata + estiramientos', coachTip: 'TAPER: Menos es más. Este rodado es solo para mover las piernas.' },
      { type: 'running', title: 'Progresivo 6km', description: 'Rodado progresivo de Z1 a Z3. Activá piernas sin fatiga.', distance: '6km', terrain: 'pista/calle', pace: 'progresivo', intensity: 'Z1-Z3', heartRateMin: '125', heartRateMax: '165', isKeySession: false, isLongRun: false, warmup: '5min trote suave', mainBlock: '2km Z1 + 2km Z2 + 2km Z3', cooldown: '5min caminata + estiramientos', coachTip: 'El progresivo mantiene las piernas activas. Sentí el ritmo sin forzar.' },
      { type: 'descanso', title: 'Descanso completo', description: 'Descanso total. Tu cuerpo se prepara para la carrera.', isKeySession: false, isLongRun: false, coachTip: 'El taper es difícil mentalmente pero esencial. Confiá en tu entrenamiento.' },
      { type: 'running', title: 'Técnica 5km', description: 'Sesión de técnica con algo de Z2-Z3. Controlada, sin fatiga.', distance: '5km', terrain: 'pista/terreno firme', pace: 'técnica', intensity: 'Z2-Z3', heartRateMin: '140', heartRateMax: '165', isKeySession: false, isLongRun: false, warmup: '5min trote suave + drills', mainBlock: '3x200m a ritmo Z3 con 200m trote Z1 + 3km rodado Z2', cooldown: '5min caminata + estiramientos', coachTip: 'Sesión para mantener piernas despiertas. Sin acumular fatiga.' },
      { type: 'descanso', title: 'Descanso activo', description: 'Caminata suave o yoga. Mové el cuerpo sin estrés.', isKeySession: false, isLongRun: false, coachTip: 'Descanso activo: caminá, hacé yoga, estirá. Sin intensidad.' },
      { type: 'trail', title: 'Fondo trail suave 10-12km', description: 'Fondo corto y suave en trail. Solo para mantener la sensación.', distance: '10-12km', terrain: 'trail', pace: 'fondo suave', intensity: 'Z1-Z2', heartRateMin: '125', heartRateMax: '150', isKeySession: false, isLongRun: true, elevation: '200m+', warmup: '5min trote suave', mainBlock: '8-10km trail suave con 200m+ de desnivel, ritmo Z1-Z2', cooldown: '10min caminata + estiramientos', coachTip: 'Último fondo antes de la carrera. Corto y suave. No aprietes.', hydration: '750ml durante + 500ml post' },
      { type: 'descanso', title: 'Descanso completo', description: 'Descanso total. Preparación mental para la carrera.', isKeySession: false, isLongRun: false, coachTip: 'Visualizá la carrera. Repasá la estrategia. Confiá en tu preparación.' },
    ],
  }

  const AMATEUR: LevelTemplates = {
    BASE: [
      { type: 'running', title: 'Rodado suave 4km', description: 'Rodado regenerativo en zona 1. Ritmo muy cómodo, enfocate en disfrutar el movimiento.', distance: '4km', terrain: 'pista/calle', pace: 'regenerativo', intensity: 'Z1', heartRateMin: '130', heartRateMax: '145', isKeySession: false, isLongRun: false, warmup: '5min trote suave + movilidad articular', mainBlock: '4km rodado Z1 continuo', cooldown: '5min caminata + estiramientos', coachTip: 'Este rodado es para recuperar y disfrutar. Corré a un ritmo donde puedas hablar tranquilamente.', hydration: '300ml durante + 250ml post' },
      { type: 'fuerza', title: 'Fuerza general', description: 'Sesión de fuerza básica para piernas y core. Sentadillas, step-ups, plancha.', terrain: 'gimnasio', isKeySession: false, isLongRun: false, warmup: '10min cardio suave + movilidad', mainBlock: '3x8 sentadillas, 3x8 peso muerto rumano, 3x10 step-ups, 3x20s plancha', cooldown: '10min estiramientos', coachTip: 'La fuerza básica es fundamental para prevenir lesiones. Empezá con poco peso y buena técnica.', recommendations: 'Descanso 60s entre series' },
      { type: 'running', title: 'Rodado medio 5km', description: 'Rodado en zona 2, ritmo conversacional. Mantené un paso sostenido pero cómodo.', distance: '5km', terrain: 'mixto', pace: 'conversacional', intensity: 'Z2', heartRateMin: '140', heartRateMax: '155', isKeySession: false, isLongRun: false, warmup: '5min trote suave + movilidad', mainBlock: '5km Z2 continuo', cooldown: '5min caminata + estiramientos', coachTip: 'Mantén un ritmo donde puedas hablar. Si te cuesta, bajá el paso.', hydration: '300ml durante + 250ml post' },
      { type: 'descanso', title: 'Descanso completo', description: 'Día de descanso total. Aprovechá a hidratarte y estirar un poco.', isKeySession: false, isLongRun: false, coachTip: 'El descanso es tan importante como el entrenamiento. Tu cuerpo se adapta cuando descansa.' },
      { type: 'running', title: 'Técnica de carrera 4km', description: 'Sesión de técnica con algo de Z2-Z3. Incluye drills básicos y tramos cortos a ritmo.', distance: '4km', terrain: 'pista/terreno firme', pace: 'progresivo', intensity: 'Z2-Z3', heartRateMin: '145', heartRateMax: '165', isKeySession: true, isLongRun: false, warmup: '10min trote suave + 4x drills básicos (skip, talón-glúteo)', mainBlock: '4x400m a ritmo Z3 con 90s recuperación + 2km rodado Z2', cooldown: '5min caminata + estiramientos', coachTip: 'Sesión clave de la semana. Los drills mejoran tu técnica y las series te hacen más rápido. Hacé cada repetición con buena forma.', hydration: '300ml durante + 250ml post' },
      { type: 'trail', title: 'Fondo trail 8-10km', description: 'Fondo largo en trail con algo de desnivel. Ritmo cómodo, disfrutá del sendero.', distance: '8-10km', terrain: 'trail', pace: 'fondo trail', intensity: 'Z1-Z2', heartRateMin: '130', heartRateMax: '150', isKeySession: false, isLongRun: true, elevation: '150m+', warmup: '5min trote suave', mainBlock: '7-9km trail con 150m+ de desnivel, ritmo cómodo Z1-Z2', cooldown: '5min caminata + estiramientos', coachTip: 'El fondo largo es la sesión más importante para tu progresión. Empezá suave y mantené un ritmo que puedas sostener. Caminá en las subidas si es necesario.', hydration: '500ml durante + 250ml post', recommendations: 'Probar algún snack o gel durante el fondo' },
      { type: 'descanso', title: 'Descanso completo', description: 'Descanso total. Estiramientos suaves si lo necesitás.', isKeySession: false, isLongRun: false, coachTip: 'Después del fondo, descansá. Es normal sentir cansancio, tu cuerpo se adapta.' },
    ],
    CARGA: [
      { type: 'running', title: 'Rodado suave 4km', description: 'Rodado regenerativo en Z1. Empezá la semana de carga con energía.', distance: '4km', terrain: 'pista/calle', pace: 'regenerativo', intensity: 'Z1', heartRateMin: '130', heartRateMax: '145', isKeySession: false, isLongRun: false, warmup: '5min trote suave + movilidad', mainBlock: '4km rodado Z1 continuo', cooldown: '5min caminata + estiramientos', coachTip: 'Semana de carga: este rodado suave es para guardar energía para los días intensos.', hydration: '300ml durante + 250ml post' },
      { type: 'fuerza', title: 'Fuerza general', description: 'Sesión de fuerza con un poco más de volumen. Sentadillas, step-ups, plancha.', terrain: 'gimnasio', isKeySession: false, isLongRun: false, warmup: '10min cardio suave + movilidad', mainBlock: '3x10 sentadillas, 3x8 peso muerto rumano, 3x12 step-ups, 3x30s plancha', cooldown: '10min estiramientos', coachTip: 'En semana de carga, la fuerza es importante para mantenerse sin lesiones.', recommendations: 'Descanso 60s entre series' },
      { type: 'running', title: 'Rodado medio 7km', description: 'Rodado sostenido en Z2 con algo más de distancia. Progresión suave.', distance: '7km', terrain: 'mixto', pace: 'conversacional', intensity: 'Z2', heartRateMin: '140', heartRateMax: '155', isKeySession: false, isLongRun: false, warmup: '5min trote suave + movilidad', mainBlock: '5km Z2 + 2km progresivo Z2-Z3', cooldown: '5min caminata + estiramientos', coachTip: 'Más distancia que en semana BASE, pero sin cambiar el ritmo base. Mantené la conversación.', hydration: '400ml durante + 250ml post' },
      { type: 'descanso', title: 'Descanso completo', description: 'Descanso antes de las sesiones más exigentes.', isKeySession: false, isLongRun: false, coachTip: 'Descansá: mañana tenés sesión clave.' },
      { type: 'trail', title: 'Series suaves en cuesta 6km', description: 'Sesión clave de series suaves en cuesta para ganar potencia gradual. Z3-Z4 en subidas.', distance: '6km', terrain: 'trail/cuesta', pace: 'series suaves', intensity: 'Z3-Z4', heartRateMin: '155', heartRateMax: '175', isKeySession: true, isLongRun: false, elevation: '200m+', warmup: '10min trote suave + drills + 2 subidas cortas a ritmo moderado', mainBlock: '5x1.5min subida Z3-Z4 + bajada trote Z1 (recuperación)', cooldown: '10min trote suave + estiramientos', coachTip: 'Sesión CLAVE. Las cuestas te fortalecen para las subidas de trail. No vayas al máximo, trabajá en Z3-Z4 sostenible.', hydration: '500ml durante + 250ml post', recommendations: 'Elegir una cuesta suave de 6-10%' },
      { type: 'trail', title: 'Fondo trail 12-14km', description: 'Fondo largo en trail con más distancia y desnivel. Simulá la carrera a tu ritmo.', distance: '12-14km', terrain: 'trail', pace: 'fondo trail', intensity: 'Z1-Z2', heartRateMin: '130', heartRateMax: '150', isKeySession: false, isLongRun: true, elevation: '300m+', warmup: '5min trote suave', mainBlock: '10-12km trail con 300m+ de desnivel, ritmo Z1-Z2 en subida', cooldown: '5min caminata + estiramientos', coachTip: 'Fondo largo de carga: más distancia que en BASE. Probá nutrición e hidratación como si fuera carrera.', hydration: '750ml durante + 500ml post + electrolitos', recommendations: 'Llevar algún snack o gel' },
      { type: 'descanso', title: 'Descanso completo', description: 'Descanso total. El cuerpo necesita recuperarse.', isKeySession: false, isLongRun: false, coachTip: 'Descansá sin culpa. El cuerpo se fortalece en el descanso.' },
    ],
    PICO: [
      { type: 'running', title: 'Rodado suave 3km', description: 'Rodado regenerativo muy suave en Z1. Semana pico: conservá toda la energía.', distance: '3km', terrain: 'pista/calle', pace: 'regenerativo', intensity: 'Z1', heartRateMin: '130', heartRateMax: '145', isKeySession: false, isLongRun: false, warmup: '5min trote suave + movilidad', mainBlock: '3km rodado Z1 continuo', cooldown: '5min caminata + estiramientos', coachTip: 'Semana PICO: menos volumen, más intensidad en los días clave. Guardá energía.' },
      { type: 'running', title: 'Intervalos 6km', description: 'Sesión clave de intervalos en Z3-Z4. Introducción a la velocidad.', distance: '6km', terrain: 'pista/terreno firme', pace: 'intervalos', intensity: 'Z3-Z4', heartRateMin: '155', heartRateMax: '175', isKeySession: true, isLongRun: false, warmup: '10min trote suave + drills + 2x100m strides', mainBlock: '4x2min Z3-Z4 con 2min recuperación Z1 + 1km enfriamiento', cooldown: '5min trote suave + estiramientos', coachTip: 'Sesión CLAVE. Los intervalos mejoran tu velocidad y capacidad aeróbica. Dá lo mejor de vos en cada repetición, pero sin pasarte.', hydration: '500ml durante + 250ml post' },
      { type: 'descanso', title: 'Descanso completo', description: 'Descanso total. Recuperá de los intervalos.', isKeySession: false, isLongRun: false, coachTip: 'Los intervalos generan mucha fatiga. Descansá completo.' },
      { type: 'running', title: 'Rodado suave 5km', description: 'Rodado en Z2, muy cómodo. Solo activá las piernas.', distance: '5km', terrain: 'mixto', pace: 'conversacional', intensity: 'Z2', heartRateMin: '140', heartRateMax: '155', isKeySession: false, isLongRun: false, warmup: '5min trote suave', mainBlock: '5km Z2 continuo', cooldown: '5min caminata + estiramientos', coachTip: 'Rodado de transición. Solo mové las piernas, sin intensidad.' },
      { type: 'fuerza', title: 'Fuerza mantenimiento', description: 'Sesión de fuerza reducida, solo mantenimiento. Volumen bajo.', terrain: 'gimnasio', isKeySession: false, isLongRun: false, warmup: '10min cardio suave + movilidad', mainBlock: '2x8 sentadillas, 2x8 peso muerto rumano, 2x8 step-ups, 2x20s plancha', cooldown: '10min estiramientos', coachTip: 'Fuerza de mantenimiento: pocas series, buena técnica.', recommendations: 'Sin llegar al fallo muscular' },
      { type: 'trail', title: 'Fondo trail 10-12km', description: 'Fondo largo en trail. Último fondo importante antes del taper.', distance: '10-12km', terrain: 'trail', pace: 'fondo trail', intensity: 'Z1-Z2', heartRateMin: '130', heartRateMax: '150', isKeySession: false, isLongRun: true, elevation: '250m+', warmup: '5min trote suave', mainBlock: '8-10km trail con 250m+ de desnivel, ritmo Z1-Z2', cooldown: '5min caminata + estiramientos', coachTip: 'Último gran fondo. Disfrutalo sin apretar. Simulá condiciones de carrera.', hydration: '750ml durante + 250ml post', recommendations: 'Probar nutrición de carrera' },
      { type: 'descanso', title: 'Descanso completo', description: 'Descanso total después del fondo.', isKeySession: false, isLongRun: false, coachTip: 'Buen trabajo esta semana. La semana que viene empezás el taper.' },
    ],
    DESCARGA: [
      { type: 'running', title: 'Rodado suave 3km', description: 'Rodado regenerativo muy suave. Taper: redují el volumen.', distance: '3km', terrain: 'pista/calle', pace: 'regenerativo', intensity: 'Z1', heartRateMin: '130', heartRateMax: '145', isKeySession: false, isLongRun: false, warmup: '5min trote suave + movilidad', mainBlock: '3km rodado Z1 continuo', cooldown: '5min caminata + estiramientos', coachTip: 'TAPER: Menos es más. Solo mové las piernas un poco. La carrera está cerca.' },
      { type: 'running', title: 'Progresivo 4km', description: 'Rodado progresivo suave de Z1 a Z2. Activá las piernas sin fatiga.', distance: '4km', terrain: 'pista/calle', pace: 'progresivo', intensity: 'Z1-Z2', heartRateMin: '130', heartRateMax: '155', isKeySession: false, isLongRun: false, warmup: '5min trote suave', mainBlock: '2km Z1 + 2km Z2', cooldown: '5min caminata + estiramientos', coachTip: 'El progresivo suave mantiene las piernas activas. No subas más allá de Z2.' },
      { type: 'descanso', title: 'Descanso completo', description: 'Descanso total. Tu cuerpo se prepara para la carrera.', isKeySession: false, isLongRun: false, coachTip: 'El taper es importante. Confiá en el entrenamiento que hiciste.' },
      { type: 'running', title: 'Rodado suave 4km', description: 'Rodado muy suave en Z2. Solo para mantener la sensación.', distance: '4km', terrain: 'pista/calle', pace: 'suave', intensity: 'Z2', heartRateMin: '140', heartRateMax: '155', isKeySession: false, isLongRun: false, warmup: '5min trote suave', mainBlock: '4km Z2 continuo', cooldown: '5min caminata + estiramientos', coachTip: 'Solo activá las piernas. Sin fatiga, sin esfuerzo extra.' },
      { type: 'descanso', title: 'Descanso activo', description: 'Caminata suave o yoga. Mové el cuerpo sin estrés.', isKeySession: false, isLongRun: false, coachTip: 'Descanso activo: caminá, estirá, hacé yoga. Sin intensidad.' },
      { type: 'trail', title: 'Fondo trail suave 6-8km', description: 'Fondo muy corto y suave en trail. Solo mantener la sensación.', distance: '6-8km', terrain: 'trail', pace: 'fondo suave', intensity: 'Z1-Z2', heartRateMin: '125', heartRateMax: '145', isKeySession: false, isLongRun: true, elevation: '100m+', warmup: '5min trote suave', mainBlock: '5-7km trail muy suave con 100m+ de desnivel, ritmo Z1-Z2', cooldown: '5min caminata + estiramientos', coachTip: 'Último fondo antes de la carrera. Muy corto y suave. Solo para sentir las piernas.', hydration: '500ml durante + 250ml post' },
      { type: 'descanso', title: 'Descanso completo', description: 'Descanso total. Preparación mental para la carrera.', isKeySession: false, isLongRun: false, coachTip: 'Visualizá la carrera. Repasá tu estrategia. Confiá en tu preparación. ¡Vas a estar genial!' },
    ],
  }

  switch (level) {
    case 'ELITE':
      return ELITE
    case 'AMATEUR':
      return AMATEUR
    default:
      return INTERMEDIO
  }
}

// GET - List all athletes with their weeks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (code !== COACH_CODE) {
      return NextResponse.json({ error: 'Código de entrenador inválido' }, { status: 403 })
    }

    const athletes = await db.athlete.findMany({
      include: {
        weeks: {
          include: {
            days: {
              include: { feedback: true },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { weekNumber: 'desc' },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ athletes })
  } catch (error) {
    console.error('Coach GET error:', error)
    return NextResponse.json({ error: 'Error al cargar datos' }, { status: 500 })
  }
}

// POST - Create athlete, week, or day
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'createAthlete': {
        const { name, email, accessCode, level } = body
        if (!name || !email || !accessCode) {
          return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
        }
        const athlete = await db.athlete.create({
          data: { name, email: email.toLowerCase(), accessCode: accessCode.toUpperCase(), level: level || 'INTERMEDIO' },
        })
        return NextResponse.json({ athlete })
      }

      case 'updateAthlete': {
        const { id, name, email, level, targetRace, raceDate } = body
        if (!id) return NextResponse.json({ error: 'Se requiere id' }, { status: 400 })
        const athlete = await db.athlete.update({
          where: { id },
          data: {
            ...(name && { name }),
            ...(email && { email: email.toLowerCase() }),
            ...(level && { level }),
            targetRace: targetRace || null,
            raceDate: raceDate ? new Date(raceDate) : null,
          },
        })
        return NextResponse.json({ athlete })
      }

      case 'generateRacePlan': {
        const { athleteId, raceName, raceDate, totalWeeks, level } = body
        if (!athleteId || !raceDate || !totalWeeks) {
          return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
        }

        // Update athlete with race info
        await db.athlete.update({
          where: { id: athleteId },
          data: { targetRace: raceName || null, raceDate: new Date(raceDate) },
        })

        const raceDay = new Date(raceDate)
        const numWeeks = parseInt(totalWeeks)

        // Determine periodization pattern based on number of weeks
        const getWeekType = (weekIndex: number, totalWeeks: number): string => {
          const weeksFromRace = totalWeeks - weekIndex
          if (weeksFromRace <= 2) return 'DESCARGA'
          if (weeksFromRace === 3) return 'PICO'
          return weekIndex % 2 === 0 ? 'BASE' : 'CARGA'
        }

        const templates = getTemplatesForLevel(level || 'INTERMEDIO')

        const createdWeeks = []
        for (let i = 0; i < numWeeks; i++) {
          const weekType = getWeekType(i, numWeeks)
          const raceDayOfWeek = raceDay.getDay()
          const mondayOfRaceWeek = new Date(raceDay)
          mondayOfRaceWeek.setDate(raceDay.getDate() - (raceDayOfWeek === 0 ? 6 : raceDayOfWeek - 1))

          const weekStart = new Date(mondayOfRaceWeek)
          weekStart.setDate(weekStart.getDate() - (numWeeks - 1 - i) * 7)

          const week = await db.trainingWeek.create({
            data: {
              athleteId,
              weekNumber: i + 1,
              weekType,
              startDate: weekStart,
            },
          })

          const dayTemplate = templates[weekType] || templates.BASE
          for (const [dayIdx, dt] of dayTemplate.entries()) {
            if (!dt.title) continue
            await db.trainingDay.create({
              data: {
                weekId: week.id,
                dayNumber: dayIdx + 1,
                dayLabel: `Día ${dayIdx + 1}`,
                type: dt.type,
                title: dt.title,
                description: dt.description || '',
                distance: dt.distance || null,
                terrain: dt.terrain || null,
                pace: dt.pace || null,
                heartRateMin: dt.heartRateMin ? parseInt(dt.heartRateMin) : null,
                heartRateMax: dt.heartRateMax ? parseInt(dt.heartRateMax) : null,
                isKeySession: dt.isKeySession || false,
                isLongRun: dt.isLongRun || false,
                warmup: dt.warmup || null,
                mainBlock: dt.mainBlock || null,
                cooldown: dt.cooldown || null,
                coachTip: dt.coachTip || null,
                elevation: dt.elevation || null,
                intensity: dt.intensity || null,
                hydration: dt.hydration || null,
                recommendations: dt.recommendations || null,
                order: dayIdx + 1,
              },
            })
          }

          createdWeeks.push(week)
        }

        return NextResponse.json({ weeks: createdWeeks, count: createdWeeks.length })
      }

      case 'createWeek': {
        const { athleteId, weekNumber, weekType, startDate } = body
        if (!athleteId || !weekNumber || !weekType) {
          return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
        }
        const week = await db.trainingWeek.create({
          data: {
            athleteId,
            weekNumber: parseInt(weekNumber),
            weekType,
            startDate: startDate ? new Date(startDate) : new Date(),
          },
        })
        return NextResponse.json({ week })
      }

      case 'createDay': {
        const { weekId, dayNumber, dayLabel, type, title, description, distance, terrain, pace,
                heartRateMin, heartRateMax, isKeySession, isLongRun, warmup, mainBlock, cooldown,
                coachTip, elevation, intensity, hydration, recommendations, order } = body

        if (!weekId || !dayNumber || !dayLabel || !type || !title || !description) {
          return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
        }

        const day = await db.trainingDay.create({
          data: {
            weekId,
            dayNumber: parseInt(dayNumber),
            dayLabel,
            type,
            title,
            description,
            distance: distance || null,
            terrain: terrain || null,
            pace: pace || null,
            heartRateMin: heartRateMin ? parseInt(heartRateMin) : null,
            heartRateMax: heartRateMax ? parseInt(heartRateMax) : null,
            isKeySession: isKeySession || false,
            isLongRun: isLongRun || false,
            warmup: warmup || null,
            mainBlock: mainBlock || null,
            cooldown: cooldown || null,
            coachTip: coachTip || null,
            elevation: elevation || null,
            intensity: intensity || null,
            hydration: hydration || null,
            recommendations: recommendations || null,
            order: order ? parseInt(order) : parseInt(dayNumber),
          },
        })
        return NextResponse.json({ day })
      }

      case 'createWeekWithDays': {
        const { athleteId, weekNumber, weekType, startDate, days } = body
        if (!athleteId || !weekNumber || !weekType || !days || !Array.isArray(days)) {
          return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
        }

        const week = await db.trainingWeek.create({
          data: {
            athleteId,
            weekNumber: parseInt(weekNumber),
            weekType,
            startDate: startDate ? new Date(startDate) : new Date(),
          },
        })

        const createdDays = []
        for (const d of days) {
          if (!d.title || !d.type) continue
          const day = await db.trainingDay.create({
            data: {
              weekId: week.id,
              dayNumber: parseInt(d.dayNumber) || 1,
              dayLabel: d.dayLabel || `Día ${d.dayNumber}`,
              type: d.type,
              title: d.title,
              description: d.description || '',
              distance: d.distance || null,
              terrain: d.terrain || null,
              pace: d.pace || null,
              heartRateMin: d.heartRateMin ? parseInt(d.heartRateMin) : null,
              heartRateMax: d.heartRateMax ? parseInt(d.heartRateMax) : null,
              isKeySession: d.isKeySession || false,
              isLongRun: d.isLongRun || false,
              warmup: d.warmup || null,
              mainBlock: d.mainBlock || null,
              cooldown: d.cooldown || null,
              coachTip: d.coachTip || null,
              elevation: d.elevation || null,
              intensity: d.intensity || null,
              hydration: d.hydration || null,
              recommendations: d.recommendations || null,
              order: d.order ? parseInt(d.order) : parseInt(d.dayNumber) || 1,
            },
          })
          createdDays.push(day)
        }

        return NextResponse.json({ week, days: createdDays })
      }

      case 'duplicateWeek': {
        const { sourceWeekId, targetAthleteId, newWeekNumber, newWeekType } = body
        if (!sourceWeekId || !targetAthleteId) {
          return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
        }

        const sourceWeek = await db.trainingWeek.findUnique({
          where: { id: sourceWeekId },
          include: { days: { orderBy: { order: 'asc' } } },
        })

        if (!sourceWeek) {
          return NextResponse.json({ error: 'Semana origen no encontrada' }, { status: 404 })
        }

        const newWeek = await db.trainingWeek.create({
          data: {
            athleteId: targetAthleteId,
            weekNumber: parseInt(newWeekNumber) || sourceWeek.weekNumber,
            weekType: newWeekType || sourceWeek.weekType,
            startDate: new Date(),
          },
        })

        const createdDays = []
        for (const d of sourceWeek.days) {
          const day = await db.trainingDay.create({
            data: {
              weekId: newWeek.id,
              dayNumber: d.dayNumber,
              dayLabel: d.dayLabel,
              type: d.type,
              title: d.title,
              description: d.description,
              distance: d.distance,
              terrain: d.terrain,
              pace: d.pace,
              heartRateMin: d.heartRateMin,
              heartRateMax: d.heartRateMax,
              isKeySession: d.isKeySession,
              isLongRun: d.isLongRun,
              warmup: d.warmup,
              mainBlock: d.mainBlock,
              cooldown: d.cooldown,
              coachTip: d.coachTip,
              elevation: d.elevation,
              intensity: d.intensity,
              hydration: d.hydration,
              recommendations: d.recommendations,
              order: d.order,
            },
          })
          createdDays.push(day)
        }

        return NextResponse.json({ week: newWeek, days: createdDays })
      }

      default:
        return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 })
    }
  } catch (error: unknown) {
    console.error('Coach POST error:', error)
    const message = error instanceof Error && error.message.includes('Unique')
      ? 'Ya existe un registro con esos datos'
      : 'Error al crear'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE - Remove athlete, week, or day
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Se requiere id' }, { status: 400 })
    }

    switch (action) {
      case 'deleteAthlete': {
        await db.athlete.delete({ where: { id } })
        return NextResponse.json({ success: true })
      }
      case 'deleteWeek': {
        await db.trainingWeek.delete({ where: { id } })
        return NextResponse.json({ success: true })
      }
      case 'deleteDay': {
        await db.trainingDay.delete({ where: { id } })
        return NextResponse.json({ success: true })
      }
      default:
        return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 })
    }
  } catch (error) {
    console.error('Coach DELETE error:', error)
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}
