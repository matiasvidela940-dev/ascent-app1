import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create demo athlete 1 - ELITE level
  const athlete = await prisma.athlete.upsert({
    where: { email: 'mateo@ascent.com' },
    update: {},
    create: {
      name: 'Mateo Ruiz',
      email: 'mateo@ascent.com',
      accessCode: 'ASCENT01',
      level: 'ELITE',
      targetRace: 'Ultra Trail Cerro Catedral 80K',
      raceDate: new Date('2025-06-15'),
    },
  })

  // Create training week - Semana 8 CARGA
  const week = await prisma.trainingWeek.upsert({
    where: { id: 'week-8-carga' },
    update: {},
    create: {
      id: 'week-8-carga',
      athleteId: athlete.id,
      weekNumber: 8,
      weekType: 'CARGA',
      startDate: new Date('2025-03-10'),
    },
  })

  const days = [
    {
      id: 'day-8-1', weekId: week.id, dayNumber: 1, dayLabel: 'Día 1', type: 'running',
      title: 'Rodaje Suave Z1', description: 'Trote regenerativo para iniciar la semana. Mantén el ritmo muy fácil.',
      distance: '8 km', terrain: 'plano', pace: 'muy fácil', heartRateMin: 120, heartRateMax: 135, order: 1,
    },
    {
      id: 'day-8-2', weekId: week.id, dayNumber: 2, dayLabel: 'Día 2', type: 'fuerza',
      title: 'Fuerza Funcional', description: 'Circuito de fuerza enfocado en piernas y core. 3 series de cada ejercicio.',
      distance: null, terrain: 'gimnasio', pace: null, order: 2,
    },
    {
      id: 'day-8-3', weekId: week.id, dayNumber: 3, dayLabel: 'Día 3', type: 'running',
      title: 'Rodaje Z2', description: 'Rodaje en zona 2 para construir base aeróbica. Terreno mixto con algunas subidas suaves.',
      distance: '12 km', terrain: 'mixto', pace: 'conversacional', heartRateMin: 140, heartRateMax: 155, order: 3,
    },
    {
      id: 'day-8-4', weekId: week.id, dayNumber: 4, dayLabel: 'Día 4', type: 'descanso',
      title: 'Descanso Activo', description: 'Día de recuperación. Opcional: caminata suave o estiramientos.',
      distance: null, terrain: null, pace: null, order: 4,
    },
    {
      id: 'day-8-5', weekId: week.id, dayNumber: 5, dayLabel: 'Día 5', type: 'trail',
      title: 'Series en Cuesta 🔥', description: 'Sesión clave de la semana. Trabajo de fuerza y potencia en subida.',
      distance: '10 km', terrain: 'trail con desnivel', pace: 'variable', heartRateMin: 155, heartRateMax: 175,
      isKeySession: true, warmup: '15 min de trote suave en plano + movilidad articular',
      mainBlock: '8 × 2 min en subida a ritmo fuerte (Z4-Z5)\nBajada trotando como recuperación\nÚltimas 2 repeticiones al máximo esfuerzo',
      cooldown: '10 min de trote suave + estiramientos dinámicos',
      coachTip: 'Esta sesión es la que te va a hacer más fuerte en las subidas. Las últimas dos van con todo. 💪', order: 5,
    },
    {
      id: 'day-8-6', weekId: week.id, dayNumber: 6, dayLabel: 'Día 6', type: 'trail',
      title: 'Fondo Largo ⛰️', description: 'Fondo largo en trail para resistencia mental y física. Ritmo cómodo y constante.',
      distance: '28 km', terrain: 'trail montañoso', pace: 'conversacional', heartRateMin: 135, heartRateMax: 150,
      isLongRun: true, elevation: '900m+', intensity: 'Z2',
      hydration: 'Llevá al menos 2L de agua o hidratante. Tomá cada 20-25 minutos incluso si no tenés sed. Si hace calor, sumá electrolitos.',
      recommendations: '• Elegí un recorrido que conozcas o que tengas bien mapeado\n• Empezá suave, los últimos 8 km van a ser los más exigentes\n• Prestá atención al terreno técnico en bajadas\n• Llevá 2 geles para después del km 15 y km 22',
      coachTip: 'El fondo largo es donde se construye la resistencia real. No es carrera, es entrenamiento. 🏔️', order: 6,
    },
    {
      id: 'day-8-7', weekId: week.id, dayNumber: 7, dayLabel: 'Día 7', type: 'descanso',
      title: 'Descanso Total', description: 'Recuperación completa. Hidratá bien y comé tranquilo. El cuerpo crece cuando descansa.',
      distance: null, terrain: null, pace: null, order: 7,
    },
  ]

  for (const day of days) {
    await prisma.trainingDay.upsert({ where: { id: day.id }, update: {}, create: day })
  }

  // Create demo athlete 2 - AMATEUR level
  const athlete2 = await prisma.athlete.upsert({
    where: { email: 'valentina@ascent.com' },
    update: {},
    create: {
      name: 'Valentina Torres',
      email: 'valentina@ascent.com',
      accessCode: 'ASCENT02',
      level: 'AMATEUR',
      targetRace: '5K Primavera',
      raceDate: new Date('2025-05-10'),
    },
  })

  const week2 = await prisma.trainingWeek.upsert({
    where: { id: 'week-4-base' },
    update: {},
    create: {
      id: 'week-4-base',
      athleteId: athlete2.id,
      weekNumber: 4,
      weekType: 'BASE',
      startDate: new Date('2025-03-10'),
    },
  })

  const days2 = [
    {
      id: 'day-4-1', weekId: week2.id, dayNumber: 1, dayLabel: 'Lunes', type: 'running',
      title: 'Rodaje Regenerativo', description: 'Trote muy suave para arrancar la semana. Sin presión.',
      distance: '4 km', terrain: 'plano', pace: 'muy fácil', heartRateMin: 115, heartRateMax: 130, order: 1,
    },
    {
      id: 'day-4-2', weekId: week2.id, dayNumber: 2, dayLabel: 'Martes', type: 'running',
      title: 'Técnica de Carrera', description: 'Drills de técnica + rectas para trabajar la eficiencia.',
      distance: '5 km', terrain: 'pista', pace: 'progresivo', heartRateMin: 130, heartRateMax: 160,
      isKeySession: true, warmup: '10 min de trote suave + drills de técnica',
      mainBlock: '4 × 200m a ritmo 5K con 200m de trote recovery\nEnfocate en la técnica: postura, cadencia, aterrizaje',
      cooldown: '10 min de trote suave + estiramientos',
      coachTip: 'La técnica es la base de todo. Mejor correr lento pero bien, que rápido y mal. 🎯', order: 2,
    },
    {
      id: 'day-4-3', weekId: week2.id, dayNumber: 3, dayLabel: 'Miércoles', type: 'descanso',
      title: 'Descanso Activo', description: 'Yoga suave o caminata. Movilidad y estiramientos.',
      distance: null, terrain: null, pace: null, order: 3,
    },
    {
      id: 'day-4-4', weekId: week2.id, dayNumber: 4, dayLabel: 'Jueves', type: 'running',
      title: 'Rodaje Z2', description: 'Rodaje aeróbico para construir base. Ritmo conversacional.',
      distance: '6 km', terrain: 'mixto', pace: 'conversacional', heartRateMin: 140, heartRateMax: 155, order: 4,
    },
    {
      id: 'day-4-5', weekId: week2.id, dayNumber: 5, dayLabel: 'Viernes', type: 'fuerza',
      title: 'Fuerza General', description: 'Sesión de fuerza completa. Piernas, core y upper body.',
      distance: null, terrain: 'gimnasio', pace: null, order: 5,
    },
    {
      id: 'day-4-6', weekId: week2.id, dayNumber: 6, dayLabel: 'Sábado', type: 'trail',
      title: 'Fondo Largo ⛰️', description: 'Fondo progresivo en trail. Empezar suave e ir subiendo la intensidad.',
      distance: '10 km', terrain: 'trail', pace: 'progresivo', heartRateMin: 135, heartRateMax: 155,
      isLongRun: true, elevation: '200m+', intensity: 'Z2-Z3',
      hydration: '500ml mínimo. Geles cada 45 min.',
      recommendations: '• Primera mitad fácil, segunda mitad podés apretar un poco\n• Elegí un trail que disfrutes\n• No te olvides del protector solar',
      coachTip: 'Este fondo es cortito pero con progresión. La idea es que termines fuerte, no que arranques rápido. 🌿', order: 6,
    },
    {
      id: 'day-4-7', weekId: week2.id, dayNumber: 7, dayLabel: 'Domingo', type: 'descanso',
      title: 'Descanso Total', description: 'Recuperación completa. El cuerpo se adapta cuando descansa.',
      distance: null, terrain: null, pace: null, order: 7,
    },
  ]

  for (const day of days2) {
    await prisma.trainingDay.upsert({ where: { id: day.id }, update: {}, create: day })
  }

  // Create demo athlete 3 - INTERMEDIO level
  const athlete3 = await prisma.athlete.upsert({
    where: { email: 'lucas@ascent.com' },
    update: {},
    create: {
      name: 'Lucas Fernández',
      email: 'lucas@ascent.com',
      accessCode: 'ASCENT03',
      level: 'INTERMEDIO',
      targetRace: 'Half Marathon Trail Patagonia 21K',
      raceDate: new Date('2025-07-20'),
    },
  })

  console.log('✅ Seed data created successfully')
  console.log('👤 Athletes:')
  console.log('   - mateo@ascent.com / ASCENT01 (ELITE - 100km+ sem)')
  console.log('   - valentina@ascent.com / ASCENT02 (AMATEUR - 20km sem)')
  console.log('   - lucas@ascent.com / ASCENT03 (INTERMEDIO - 50km sem)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
