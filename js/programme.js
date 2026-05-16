/* ============================================================
   FitTracker Pro — Programme
   Bibliothèque exercices + Séances + Cycles infinis
   ============================================================ */

// ─── BIBLIOTHÈQUE EXERCICES (50+) ────────────────────────────
const EXERCICES = {

  // ══ PECTORAUX ══
  bench_press: {
    nom: 'Développé couché',
    muscle: 'Pectoraux',
    muscles_sec: ['Triceps', 'Épaules'],
    equipement: 'Barre olympique + Banc plat',
    emoji: '💪',
    difficulte: 2,
    gif: './assets/exercices/bench_press.gif',
    description: 'Allongé sur le banc, prise légèrement + large que les épaules. Descente contrôlée jusqu\'à effleurer les pectoraux, poussée explosive.',
    conseils: ['Omoplates serrées', 'Pieds bien à plat', 'Ne pas rebondir sur la poitrine'],
    muscles_svg: ['pec_gauche', 'pec_droit']
  },

  incline_halteres: {
    nom: 'Développé incliné haltères',
    muscle: 'Pectoraux Hauts',
    muscles_sec: ['Épaules', 'Triceps'],
    equipement: 'Haltères + Banc incliné (30-45°)',
    emoji: '💪',
    difficulte: 2,
    gif: './assets/exercices/incline_db.gif',
    description: 'Banc incliné à 30-45°, haltères tenus en pronation. Descente lente, coudes à 75° du corps.',
    conseils: ['Angle 30-45° max', 'Amplitude complète', 'Contrôle en descente'],
    muscles_svg: ['pec_gauche', 'pec_droit', 'epaule_ant']
  },

  chest_press_machine: {
    nom: 'Chest Press Machine',
    muscle: 'Pectoraux',
    muscles_sec: ['Triceps'],
    equipement: 'Machine Chest Press Basic-Fit',
    emoji: '🤖',
    difficulte: 1,
    gif: './assets/exercices/chest_machine.gif',
    description: 'Machine guidée, réglage siège pour que les poignées soient à hauteur de poitrine. Poussée en expirant.',
    conseils: ['Régler le siège correctement', 'Ne pas verrouiller les coudes', 'Pression constante'],
    muscles_svg: ['pec_gauche', 'pec_droit']
  },

  ecarte_poulie: {
    nom: 'Écarté poulie haute',
    muscle: 'Pectoraux',
    muscles_sec: [],
    equipement: 'Câble crossover Basic-Fit',
    emoji: '🔄',
    difficulte: 2,
    gif: './assets/exercices/cable_fly.gif',
    description: 'Câbles en position haute, se pencher légèrement en avant. Ramener les mains en arc de cercle devant soi.',
    conseils: ['Légère flexion coude', 'Squeeze fort en fin de mouvement', 'Contrôle en ouverture'],
    muscles_svg: ['pec_gauche', 'pec_droit']
  },

  dips: {
    nom: 'Dips',
    muscle: 'Pectoraux / Triceps',
    muscles_sec: ['Épaules'],
    equipement: 'Barres parallèles',
    emoji: '⬇️',
    difficulte: 3,
    gif: './assets/exercices/dips.gif',
    description: 'Se pencher légèrement en avant pour cibler les pectoraux. Descendre jusqu\'à 90° de flexion du coude.',
    conseils: ['Pencher pour pec, droit pour triceps', 'Contrôle en descente', 'Pas d\'à-coup'],
    muscles_svg: ['pec_gauche', 'pec_droit', 'triceps_gauche', 'triceps_droit']
  },

  pompes: {
    nom: 'Pompes',
    muscle: 'Pectoraux',
    muscles_sec: ['Triceps', 'Épaules', 'Core'],
    equipement: 'Poids du corps',
    emoji: '⬆️',
    difficulte: 1,
    gif: './assets/exercices/pushups.gif',
    description: 'Mains légèrement + larges que les épaules. Corps gainé en planche. Descente jusqu\'au sol.',
    conseils: ['Corps rigide', 'Coudes à 45°', 'Amplitude complète'],
    muscles_svg: ['pec_gauche', 'pec_droit']
  },

  // ══ DOS ══
  tractions: {
    nom: 'Tractions',
    muscle: 'Grand Dorsal',
    muscles_sec: ['Biceps', 'Rhomboïdes'],
    equipement: 'Barre de traction',
    emoji: '🔗',
    difficulte: 3,
    gif: './assets/exercices/pullups.gif',
    description: 'Prise pronation légèrement + large que les épaules. Monter jusqu\'au menton au-dessus de la barre.',
    conseils: ['Scapulas déprimées au départ', 'Pas d\'à-coup', 'Descente contrôlée'],
    muscles_svg: ['dorsal_gauche', 'dorsal_droit', 'biceps_gauche', 'biceps_droit']
  },

  rowing_barre: {
    nom: 'Rowing barre',
    muscle: 'Dos Moyen',
    muscles_sec: ['Biceps', 'Trapèzes'],
    equipement: 'Barre olympique',
    emoji: '🔗',
    difficulte: 3,
    gif: './assets/exercices/barbell_row.gif',
    description: 'Dos parallèle au sol, prise pronation. Tirer la barre vers le nombril en serrant les omoplates.',
    conseils: ['Dos plat obligatoire', 'Tirage vers nombril', 'Coudes proches du corps'],
    muscles_svg: ['dorsal_gauche', 'dorsal_droit', 'trapeze']
  },

  lat_pulldown: {
    nom: 'Tirage poulie haute',
    muscle: 'Grand Dorsal',
    muscles_sec: ['Biceps'],
    equipement: 'Lat Pulldown Basic-Fit',
    emoji: '⬇️',
    difficulte: 1,
    gif: './assets/exercices/lat_pulldown.gif',
    description: 'Prise large, tirer la barre vers le haut de la poitrine en écartant les coudes vers le bas.',
    conseils: ['Ne pas pencher trop en arrière', 'Penser à serrer le dos', 'Amplitude complète'],
    muscles_svg: ['dorsal_gauche', 'dorsal_droit']
  },

  rowing_machine: {
    nom: 'Rowing machine assise',
    muscle: 'Dos Moyen',
    muscles_sec: ['Biceps', 'Rhomboïdes'],
    equipement: 'Machine Rowing Basic-Fit',
    emoji: '🤖',
    difficulte: 1,
    gif: './assets/exercices/seated_row.gif',
    description: 'Dos droit, tirer les poignées vers le ventre. Serrer les omoplates en fin de mouvement.',
    conseils: ['Dos droit', 'Pas de balancement', 'Serrer omoplates'],
    muscles_svg: ['dorsal_gauche', 'dorsal_droit']
  },

  soulevé_terre: {
    nom: 'Soulevé de terre',
    muscle: 'Chaîne postérieure',
    muscles_sec: ['Fessiers', 'Ischio', 'Dos', 'Trapèzes'],
    equipement: 'Barre olympique / Trap bar',
    emoji: '🏋️',
    difficulte: 4,
    gif: './assets/exercices/deadlift.gif',
    description: 'Pieds largeur hanches, barre contre les tibias. Monter en poussant le sol, hanche et épaules en même temps.',
    conseils: ['Dos NEUTRE toujours', 'Barre proche du corps', 'Pousser le sol pas tirer la barre'],
    muscles_svg: ['dorsal_gauche', 'dorsal_droit', 'fessier_gauche', 'fessier_droit', 'ischio_gauche', 'ischio_droit']
  },

  pullover: {
    nom: 'Pull-over haltère',
    muscle: 'Grand Dorsal',
    muscles_sec: ['Pectoraux'],
    equipement: 'Haltère + Banc plat',
    emoji: '🔄',
    difficulte: 2,
    gif: './assets/exercices/pullover.gif',
    description: 'Allongé sur le banc, haltère tenu à deux mains au-dessus de la poitrine. Descente en arc derrière la tête.',
    conseils: ['Légère flexion du coude', 'Ne pas descendre trop bas', 'Amplitude progressive'],
    muscles_svg: ['dorsal_gauche', 'dorsal_droit']
  },

  // ══ ÉPAULES ══
  dev_militaire: {
    nom: 'Développé militaire',
    muscle: 'Épaules',
    muscles_sec: ['Triceps', 'Trapèzes'],
    equipement: 'Haltères ou Barre',
    emoji: '💪',
    difficulte: 3,
    gif: './assets/exercices/ohp.gif',
    description: 'Debout ou assis, pousser au-dessus de la tête. Maintenir le core gainé tout au long du mouvement.',
    conseils: ['Core gainé', 'Ne pas cambrer le dos', 'Lockout complet en haut'],
    muscles_svg: ['epaule_gauche', 'epaule_droite', 'triceps_gauche', 'triceps_droit']
  },

  elev_laterales: {
    nom: 'Élévations latérales',
    muscle: 'Deltoïdes Latéraux',
    muscles_sec: [],
    equipement: 'Haltères',
    emoji: '🦅',
    difficulte: 1,
    gif: './assets/exercices/lateral_raises.gif',
    description: 'Bras légèrement fléchis, lever les haltères à hauteur d\'épaule comme des ailes.',
    conseils: ['Ne pas hausser les épaules', 'Coudes légèrement fléchis', 'Contrôle en descente'],
    muscles_svg: ['epaule_gauche', 'epaule_droite']
  },

  shoulder_press_machine: {
    nom: 'Shoulder Press Machine',
    muscle: 'Épaules',
    muscles_sec: ['Triceps'],
    equipement: 'Machine Épaules Basic-Fit',
    emoji: '🤖',
    difficulte: 1,
    gif: './assets/exercices/shoulder_machine.gif',
    description: 'Machine guidée. Régler le siège pour que les poignées soient à hauteur d\'épaule.',
    conseils: ['Régler siège', 'Pas de verrouillage complet', 'Expirer en poussant'],
    muscles_svg: ['epaule_gauche', 'epaule_droite']
  },

  face_pull: {
    nom: 'Face Pull',
    muscle: 'Deltoïdes Postérieurs',
    muscles_sec: ['Trapèzes', 'Rhomboïdes'],
    equipement: 'Câble poulie haute + corde',
    emoji: '🔄',
    difficulte: 2,
    gif: './assets/exercices/face_pull.gif',
    description: 'Câble à hauteur du visage, tirer la corde vers le visage en écartant les mains.',
    conseils: ['Coudes à hauteur des épaules', 'Rotation externe en fin', 'Léger poids, bonne amplitude'],
    muscles_svg: ['epaule_post_gauche', 'epaule_post_droite']
  },

  oiseau: {
    nom: 'Oiseau',
    muscle: 'Deltoïdes Postérieurs',
    muscles_sec: ['Rhomboïdes'],
    equipement: 'Haltères',
    emoji: '🦢',
    difficulte: 2,
    gif: './assets/exercices/reverse_fly.gif',
    description: 'Penché en avant dos plat, lever les haltères vers les côtés en pinçant les omoplates.',
    conseils: ['Dos plat', 'Mouvement lent', 'Coudes légèrement fléchis'],
    muscles_svg: ['epaule_post_gauche', 'epaule_post_droite']
  },

  // ══ BICEPS ══
  curl_halteres: {
    nom: 'Curl haltères',
    muscle: 'Biceps',
    muscles_sec: ['Avant-bras'],
    equipement: 'Haltères',
    emoji: '💪',
    difficulte: 1,
    gif: './assets/exercices/db_curl.gif',
    description: 'Coudes fixés contre le corps. Lever alternativement ou ensemble en supination.',
    conseils: ['Coudes fixes', 'Supination en montant', 'Descente contrôlée'],
    muscles_svg: ['biceps_gauche', 'biceps_droit']
  },

  curl_barre: {
    nom: 'Curl barre EZ',
    muscle: 'Biceps',
    muscles_sec: ['Avant-bras'],
    equipement: 'Barre EZ',
    emoji: '💪',
    difficulte: 1,
    gif: './assets/exercices/barbell_curl.gif',
    description: 'Barre EZ pour protéger les poignets. Mouvement strict, coudes contre le corps.',
    conseils: ['Pas de balancement', 'Coudes fixes', 'Prise confortable EZ'],
    muscles_svg: ['biceps_gauche', 'biceps_droit']
  },

  curl_marteau: {
    nom: 'Curl marteau',
    muscle: 'Brachial',
    muscles_sec: ['Biceps', 'Avant-bras'],
    equipement: 'Haltères',
    emoji: '🔨',
    difficulte: 1,
    gif: './assets/exercices/hammer_curl.gif',
    description: 'Prise neutre (pouces vers le haut). Cibler le brachial et brachio-radial.',
    conseils: ['Prise neutre', 'Coudes fixes', 'Mouvement lent'],
    muscles_svg: ['biceps_gauche', 'biceps_droit']
  },

  curl_machine: {
    nom: 'Curl machine',
    muscle: 'Biceps',
    muscles_sec: [],
    equipement: 'Machine Curl Basic-Fit',
    emoji: '🤖',
    difficulte: 1,
    gif: './assets/exercices/machine_curl.gif',
    description: 'Machine guidée, bras posés sur le pupitre. Isolation parfaite du biceps.',
    conseils: ['Bras bien posés', 'Amplitude complète', 'Squeeze en haut'],
    muscles_svg: ['biceps_gauche', 'biceps_droit']
  },

  // ══ TRICEPS ══
  ext_triceps_poulie: {
    nom: 'Extension triceps poulie',
    muscle: 'Triceps',
    muscles_sec: [],
    equipement: 'Câble poulie haute + corde',
    emoji: '⬇️',
    difficulte: 1,
    gif: './assets/exercices/tricep_pushdown.gif',
    description: 'Coudes fixes contre le corps. Pousser la corde vers le bas jusqu\'à extension complète.',
    conseils: ['Coudes fixes', 'Extension complète', 'Écarter la corde en bas'],
    muscles_svg: ['triceps_gauche', 'triceps_droit']
  },

  barre_front: {
    nom: 'Barre au front',
    muscle: 'Triceps',
    muscles_sec: [],
    equipement: 'Barre EZ + Banc plat',
    emoji: '💥',
    difficulte: 2,
    gif: './assets/exercices/skull_crusher.gif',
    description: 'Allongé, barre descend vers le front. Coudes pointent vers le plafond.',
    conseils: ['Coudes fixes', 'Contrôle en descente', 'Ne pas toucher le front !'],
    muscles_svg: ['triceps_gauche', 'triceps_droit']
  },

  dips_triceps: {
    nom: 'Dips triceps (banc)',
    muscle: 'Triceps',
    muscles_sec: ['Épaules'],
    equipement: 'Banc',
    emoji: '⬇️',
    difficulte: 1,
    gif: './assets/exercices/bench_dips.gif',
    description: 'Mains sur le banc, corps droit. Descente par flexion des coudes.',
    conseils: ['Corps proche du banc', 'Coudes vers l\'arrière', 'Amplitude complète'],
    muscles_svg: ['triceps_gauche', 'triceps_droit']
  },

  // ══ JAMBES ══
  squat: {
    nom: 'Squat',
    muscle: 'Quadriceps',
    muscles_sec: ['Fessiers', 'Ischio', 'Core'],
    equipement: 'Rack à squat + Barre',
    emoji: '🦵',
    difficulte: 3,
    gif: './assets/exercices/squat.gif',
    description: 'Pieds largeur épaules, orteils légèrement ouverts. Descendre jusqu\'à ce que les cuisses soient parallèles au sol.',
    conseils: ['Genoux dans l\'axe des orteils', 'Talons au sol', 'Dos droit'],
    muscles_svg: ['quad_gauche', 'quad_droit', 'fessier_gauche', 'fessier_droit']
  },

  presse_cuisses: {
    nom: 'Presse à cuisses',
    muscle: 'Quadriceps',
    muscles_sec: ['Fessiers', 'Ischio'],
    equipement: 'Machine Presse inclinée Basic-Fit',
    emoji: '🤖',
    difficulte: 1,
    gif: './assets/exercices/leg_press.gif',
    description: 'Pieds à plat sur la plateforme, largeur d\'épaules. Descente jusqu\'à 90° de flexion.',
    conseils: ['Ne pas décoller les fesses', 'Pieds à plat', 'Ne pas verrouiller les genoux'],
    muscles_svg: ['quad_gauche', 'quad_droit', 'fessier_gauche', 'fessier_droit']
  },

  fentes: {
    nom: 'Fentes marchées',
    muscle: 'Quadriceps',
    muscles_sec: ['Fessiers', 'Ischio'],
    equipement: 'Haltères',
    emoji: '🚶',
    difficulte: 2,
    gif: './assets/exercices/lunges.gif',
    description: 'Grand pas en avant, descendre le genou arrière vers le sol. Alterner les jambes.',
    conseils: ['Genou avant dans l\'axe du pied', 'Torse droit', 'Contrôle de l\'équilibre'],
    muscles_svg: ['quad_gauche', 'quad_droit', 'fessier_gauche', 'fessier_droit']
  },

  leg_curl: {
    nom: 'Leg Curl couché',
    muscle: 'Ischio-jambiers',
    muscles_sec: [],
    equipement: 'Machine Leg Curl Basic-Fit',
    emoji: '🦵',
    difficulte: 1,
    gif: './assets/exercices/leg_curl.gif',
    description: 'Allongé face contre la machine. Fléchir les genoux en amenant les talons vers les fessiers.',
    conseils: ['Hanche collée à la machine', 'Amplitude complète', 'Pas d\'à-coup'],
    muscles_svg: ['ischio_gauche', 'ischio_droit']
  },

  leg_extension: {
    nom: 'Leg Extension',
    muscle: 'Quadriceps',
    muscles_sec: [],
    equipement: 'Machine Leg Extension Basic-Fit',
    emoji: '🦵',
    difficulte: 1,
    gif: './assets/exercices/leg_extension.gif',
    description: 'Assis sur la machine, étendre les jambes. Isolation parfaite des quadriceps.',
    conseils: ['Pas de verrouillage brutal', 'Contrôle en descente', 'Squeeze en haut'],
    muscles_svg: ['quad_gauche', 'quad_droit']
  },

  mollets: {
    nom: 'Mollets debout',
    muscle: 'Mollets',
    muscles_sec: [],
    equipement: 'Machine Mollets / Smith Machine',
    emoji: '⬆️',
    difficulte: 1,
    gif: './assets/exercices/calf_raises.gif',
    description: 'Monter sur la pointe des pieds, maintenir 1 seconde en haut, descendre lentement.',
    conseils: ['Amplitude complète', 'Tenir en haut', 'Descente lente'],
    muscles_svg: ['mollet_gauche', 'mollet_droit']
  },

  hip_thrust: {
    nom: 'Hip Thrust',
    muscle: 'Fessiers',
    muscles_sec: ['Ischio'],
    equipement: 'Barre + Banc',
    emoji: '🍑',
    difficulte: 2,
    gif: './assets/exercices/hip_thrust.gif',
    description: 'Dos sur le banc, barre sur les hanches. Pousser les hanches vers le haut en contractant les fessiers.',
    conseils: ['Squeeze fessiers en haut', 'Menton rentré', 'Pieds à plat'],
    muscles_svg: ['fessier_gauche', 'fessier_droit']
  },

  // ══ GAINAGE / ABDOS ══
  planche: {
    nom: 'Planche',
    muscle: 'Core',
    muscles_sec: ['Épaules', 'Fessiers'],
    equipement: 'Tapis / Sol',
    emoji: '━',
    difficulte: 1,
    gif: './assets/exercices/plank.gif',
    description: 'Corps en ligne droite, appui sur les avant-bras et les orteils. Maintenir sans cambrer.',
    conseils: ['Dos plat', 'Ne pas lever les fesses', 'Respirer normalement'],
    muscles_svg: ['core']
  },

  crunch_machine: {
    nom: 'Crunch machine',
    muscle: 'Abdominaux',
    muscles_sec: [],
    equipement: 'Machine Abdos Basic-Fit',
    emoji: '🤖',
    difficulte: 1,
    gif: './assets/exercices/ab_machine.gif',
    description: 'Machine guidée. Flex du tronc en expirant, retour contrôlé.',
    conseils: ['Expirer en fléchissant', 'Pas d\'élan', 'Amplitude contrôlée'],
    muscles_svg: ['abdo']
  },

  releve_jambes: {
    nom: 'Relevé de jambes suspendu',
    muscle: 'Abdominaux Bas',
    muscles_sec: ['Hip Flexors'],
    equipement: 'Barre de traction',
    emoji: '⬆️',
    difficulte: 3,
    gif: './assets/exercices/hanging_leg_raise.gif',
    description: 'Suspendu à la barre, lever les jambes tendues ou fléchies jusqu\'à la horizontale.',
    conseils: ['Pas de balancement', 'Contrôle en descente', 'Comprimer les abdos'],
    muscles_svg: ['abdo']
  },

  russian_twist: {
    nom: 'Russian Twist',
    muscle: 'Obliques',
    muscles_sec: ['Abdominaux'],
    equipement: 'Haltère / Médecine ball',
    emoji: '🔄',
    difficulte: 2,
    gif: './assets/exercices/russian_twist.gif',
    description: 'Assis, jambes légèrement fléchies, tourner le tronc de côté à côté.',
    conseils: ['Maintenir les talons au sol ou levés', 'Rotation depuis le tronc', 'Pas du cou'],
    muscles_svg: ['oblique_gauche', 'oblique_droit']
  },

  // ══ CARDIO ══
  rameur: {
    nom: 'Rameur',
    muscle: 'Full Body Cardio',
    muscles_sec: ['Dos', 'Jambes', 'Bras'],
    equipement: 'Rameur Basic-Fit',
    emoji: '🚣',
    difficulte: 2,
    gif: './assets/exercices/rowing_machine.gif',
    description: '60% jambes / 30% dos / 10% bras. Pousser avec les jambes, pas tirer avec le dos.',
    conseils: ['Jambes d\'abord', 'Dos ensuite', 'Bras en dernier'],
    muscles_svg: ['full_body']
  },

  velo: {
    nom: 'Vélo stationnaire',
    muscle: 'Cardio / Jambes',
    muscles_sec: ['Quadriceps', 'Mollets'],
    equipement: 'Vélo Basic-Fit',
    emoji: '🚴',
    difficulte: 1,
    gif: './assets/exercices/bike.gif',
    description: 'Cardio low-impact idéal pour le warm-up ou la récupération active.',
    conseils: ['Selle à hauteur de hanche', 'Résistance progressive', 'Cadence régulière'],
    muscles_svg: ['quad_gauche', 'quad_droit']
  }
};

// ─── SÉANCES DE BASE ─────────────────────────────────────────
const SEANCES_BASE = {
  pec_tri: {
    id: 'pec_tri',
    nom: 'Pectoraux + Triceps',
    emoji: '💪',
    muscles: ['Pectoraux', 'Triceps'],
    duree_estimee: 65,
    exercices: [
      { ref: 'bench_press',       series: 4, reps: '8-10', repos: 90  },
      { ref: 'incline_halteres',  series: 4, reps: '10',   repos: 90  },
      { ref: 'chest_press_machine', series: 3, reps: '12', repos: 75  },
      { ref: 'ecarte_poulie',     series: 3, reps: '12-15',repos: 60  },
      { ref: 'ext_triceps_poulie',series: 3, reps: '12',   repos: 60  },
      { ref: 'dips_triceps',      series: 3, reps: 'échec',repos: 60  }
    ]
  },

  dos_bi: {
    id: 'dos_bi',
    nom: 'Dos + Biceps',
    emoji: '🔗',
    muscles: ['Dos', 'Biceps'],
    duree_estimee: 65,
    exercices: [
      { ref: 'tractions',         series: 4, reps: 'max',  repos: 90  },
      { ref: 'rowing_barre',      series: 4, reps: '8-10', repos: 90  },
      { ref: 'lat_pulldown',      series: 3, reps: '10-12',repos: 75  },
      { ref: 'rowing_machine',    series: 3, reps: '12',   repos: 75  },
      { ref: 'curl_halteres',     series: 3, reps: '12',   repos: 60  },
      { ref: 'curl_marteau',      series: 3, reps: '12',   repos: 60  }
    ]
  },

  epaules_bras: {
    id: 'epaules_bras',
    nom: 'Épaules + Bras',
    emoji: '💪',
    muscles: ['Épaules', 'Biceps', 'Triceps'],
    duree_estimee: 65,
    exercices: [
      { ref: 'dev_militaire',     series: 4, reps: '8-10', repos: 90  },
      { ref: 'elev_laterales',    series: 4, reps: '12-15',repos: 60  },
      { ref: 'shoulder_press_machine', series: 3, reps: '12', repos: 75 },
      { ref: 'face_pull',         series: 3, reps: '15',   repos: 60  },
      { ref: 'curl_barre',        series: 3, reps: '10',   repos: 60  },
      { ref: 'barre_front',       series: 3, reps: '10',   repos: 60  }
    ]
  },

  jambes: {
    id: 'jambes',
    nom: 'Jambes + Fessiers',
    emoji: '🦵',
    muscles: ['Quadriceps', 'Ischio', 'Fessiers', 'Mollets'],
    duree_estimee: 70,
    exercices: [
      { ref: 'squat',             series: 4, reps: '8-10', repos: 120 },
      { ref: 'presse_cuisses',    series: 4, reps: '10-12',repos: 90  },
      { ref: 'fentes',            series: 3, reps: '12/j', repos: 75  },
      { ref: 'leg_curl',          series: 3, reps: '12',   repos: 75  },
      { ref: 'leg_extension',     series: 3, reps: '15',   repos: 60  },
      { ref: 'mollets',           series: 4, reps: '15-20',repos: 45  }
    ]
  },

  full_body: {
    id: 'full_body',
    nom: 'Full Body + Gainage',
    emoji: '🔄',
    muscles: ['Full Body', 'Core'],
    duree_estimee: 60,
    exercices: [
      { ref: 'soulevé_terre',     series: 4, reps: '6-8',  repos: 120 },
      { ref: 'rowing_machine',    series: 3, reps: '12',   repos: 75  },
      { ref: 'planche',           series: 3, reps: '45-60s',repos: 60 },
      { ref: 'releve_jambes',     series: 3, reps: '12-15',repos: 60  },
      { ref: 'russian_twist',     series: 3, reps: '20',   repos: 45  },
      { ref: 'crunch_machine',    series: 3, reps: '15',   repos: 45  }
    ]
  }
};

// ─── PLANNING HEBDOMADAIRE ────────────────────────────────────
// 0=LUN, 1=MAR, 2=MER, 3=JEU, 4=VEN, 5=SAM, 6=DIM
const PLANNING_SEMAINE = [
  { jour: 0, label: 'LUN', seanceId: 'pec_tri'     },
  { jour: 1, label: 'MAR', seanceId: 'dos_bi'      },
  { jour: 2, label: 'MER', seanceId: 'epaules_bras'},
  { jour: 3, label: 'JEU', seanceId: null           }, // Repos
  { jour: 4, label: 'VEN', seanceId: 'jambes'      },
  { jour: 5, label: 'SAM', seanceId: 'full_body'   },
  { jour: 6, label: 'DIM', seanceId: null           }  // Repos
];

// ─── EXERCICES WARM-UP ────────────────────────────────────────
const WARMUP = {
  general: [
    { nom: 'Vélo stationnaire',    duree: 300, description: '5 min cadence modérée'  },
    { nom: 'Rotations épaules',    duree: 30,  description: '10 reps chaque sens'    },
    { nom: 'Rotations hanches',    duree: 30,  description: '10 reps chaque sens'    },
    { nom: 'Squats poids du corps',duree: 60,  description: '15 reps lentes'         },
    { nom: 'Pompes légères',       duree: 60,  description: '10 reps sans effort'    }
  ],
  pec_tri: [
    { nom: 'Vélo / Elliptique',    duree: 300, description: '5 min'                  },
    { nom: 'Rotations bras',       duree: 30,  description: '10 reps chaque sens'    },
    { nom: 'Pompes légères',       duree: 60,  description: '15 reps faciles'        },
    { nom: 'Bench bar vide',       duree: 60,  description: '20 reps, technique'     }
  ],
  dos_bi: [
    { nom: 'Rameur',               duree: 300, description: '5 min léger'            },
    { nom: 'Rotations épaules',    duree: 30,  description: '10 reps'                },
    { nom: 'Tractions assistées',  duree: 60,  description: '5 reps faciles'         },
    { nom: 'Rowing barre vide',    duree: 60,  description: '15 reps, technique'     }
  ],
  jambes: [
    { nom: 'Vélo stationnaire',    duree: 300, description: '5 min'                  },
    { nom: 'Leg swing',            duree: 30,  description: '10 reps chaque jambe'   },
    { nom: 'Squats goblet légers', duree: 60,  description: '10 reps'                },
    { nom: 'Fentes sur place',     duree: 60,  description: '8 reps chaque jambe'    }
  ]
};

// ─── ÉTIREMENTS POST-SÉANCE ───────────────────────────────────
const ETIREMENTS = {
  pec_tri: [
    { nom: 'Étirement pectoraux au mur',   duree: 30, gif: '🧘' },
    { nom: 'Étirement triceps',             duree: 30, gif: '🧘' },
    { nom: 'Étirement épaule croisée',      duree: 30, gif: '🧘' }
  ],
  dos_bi: [
    { nom: 'Child pose',                   duree: 45, gif: '🧘' },
    { nom: 'Étirement biceps au mur',       duree: 30, gif: '🧘' },
    { nom: 'Torsion assis',                duree: 30, gif: '🧘' }
  ],
  jambes: [
    { nom: 'Étirement quadriceps debout',   duree: 30, gif: '🧘' },
    { nom: 'Étirement ischio au sol',       duree: 45, gif: '🧘' },
    { nom: 'Pigeon pose (fessiers)',        duree: 45, gif: '🧘' },
    { nom: 'Étirement mollets',             duree: 30, gif: '🧘' }
  ],
  full_body: [
    { nom: 'Étirement dos complet',        duree: 45, gif: '🧘' },
    { nom: 'Cat-Cow stretch',              duree: 30, gif: '🧘' },
    { nom: 'Étirement hip flexors',         duree: 45, gif: '🧘' }
  ]
};

// ─── SYSTÈME DE CYCLES INFINIS ────────────────────────────────
const Programme = {

  // Date de début du programme
  getDateDebut() {
    return Utils.storage.get('ft_date_debut') || Utils.aujourd_hui();
  },

  setDateDebut(date) {
    Utils.storage.set('ft_date_debut', date);
  },

  // Semaine actuelle depuis le début
  getSemaineActuelle() {
    const debut   = this.getDateDebut();
    const semaines = Utils.semainesDepuis(debut);
    return Math.max(1, semaines);
  },

  // Cycle actuel (1 cycle = 16 semaines)
  getCycleActuel() {
    const semaine = this.getSemaineActuelle();
    return Math.floor((semaine - 1) / 16) + 1;
  },

  // Semaine dans le cycle (1-16)
  getSemaineDansCycle() {
    const semaine = this.getSemaineActuelle();
    return ((semaine - 1) % 16) + 1;
  },

  // Phase actuelle
  getPhaseActuelle() {
    const s = this.getSemaineDansCycle();
    const cycle = this.getCycleActuel();
    const mult  = 1 + (cycle - 1) * 0.12; // +12% d'intensité par cycle

    if (s <= 4)  return {
      nom: 'Reprise', numero: 1,
      description: 'Technique & Adaptation',
      intensite: Math.min(0.65 * mult, 0.95),
      couleur: '#8bf0bb',
      emoji: '🌱'
    };
    if (s <= 8)  return {
      nom: 'Construction', numero: 2,
      description: 'Volume & Hypertrophie',
      intensite: Math.min(0.75 * mult, 0.95),
      couleur: '#4b4bf9',
      emoji: '🏗️'
    };
    if (s <= 12) return {
      nom: 'Intensité', numero: 3,
      description: 'Force & PRs',
      intensite: Math.min(0.85 * mult, 0.97),
      couleur: '#bfa1ff',
      emoji: '💥'
    };
    return {
      nom: 'Peak', numero: 4,
      description: 'Records & Décharge',
      intensite: s < 16 ? Math.min(0.95 * mult, 1.0) : 0.60,
      couleur: '#f9ef77',
      emoji: '🏆'
    };
  },

  // Séance du jour selon le planning
  getSeanceduJour(dateStr = null) {
    const date     = dateStr || Utils.aujourd_hui();
    const indexJour = Utils.indexJourSemaine(date);
    const planning  = PLANNING_SEMAINE[indexJour];

    if (!planning || !planning.seanceId) return null;

    const seance = SEANCES_BASE[planning.seanceId];
    if (!seance) return null;

    return {
      ...Utils.clone(seance),
      dateStr,
      phase: this.getPhaseActuelle(),
      semaine: this.getSemaineActuelle(),
      cycle: this.getCycleActuel()
    };
  },

  // Prochaine séance (aujourd'hui ou prochain jour d'entraînement)
  getProchaineSeance() {
    for (let i = 0; i < 7; i++) {
      const date   = Utils.ajouterJours(Utils.aujourd_hui(), i);
      const seance = this.getSeanceduJour(date);
      if (seance) return { ...seance, dateStr: date, dansJours: i };
    }
    return null;
  },

  // Séances de la semaine courante
  getSeancesSemaine(offset = 0) {
    const debut = Utils.ajouterJours(
      Utils.debutSemaine(Utils.aujourd_hui()),
      offset * 7
    );

    return PLANNING_SEMAINE.map(p => {
      const date = Utils.ajouterJours(debut, p.jour);
      return {
        ...p,
        date,
        seance: p.seanceId ? SEANCES_BASE[p.seanceId] : null,
        estRepos: !p.seanceId,
        estAujourdhui: date === Utils.aujourd_hui(),
        estPasse: date < Utils.aujourd_hui()
      };
    });
  },

  // Exercice par référence
  getExercice(ref) {
    return EXERCICES[ref] || null;
  },

  // Séance complète avec détails exercices
  getSeanceComplete(seanceId) {
    const seance = SEANCES_BASE[seanceId];
    if (!seance) return null;

    return {
      ...Utils.clone(seance),
      exercicesDetails: seance.exercices.map(ex => ({
        ...ex,
        details: EXERCICES[ex.ref] || {}
      })),
      warmup: WARMUP[seanceId] || WARMUP.general,
      etirements: ETIREMENTS[seanceId] || []
    };
  },

  // Charges recommandées selon phase et cycle
  getChargesRecommandees(exerciceRef, cycleNum, phaseIntensité) {
    const key = `ft_charges_${exerciceRef}`;
    const base = Utils.storage.get(key, {});
    const maxConnu = base.max1RM || 0;

    if (!maxConnu) return null;

    return {
      charge: Math.round(maxConnu * phaseIntensité / 2.5) * 2.5,
      pourcentage: Math.round(phaseIntensité * 100)
    };
  },

  // Séances disponibles (liste)
  getAllSeances() {
    return Object.values(SEANCES_BASE);
  },

  // Infos programme complet
  getInfosProgramme() {
    const semaine     = this.getSemaineActuelle();
    const cycle       = this.getCycleActuel();
    const semaineC    = this.getSemaineDansCycle();
    const phase       = this.getPhaseActuelle();
    const progression = Math.round((semaineC / 16) * 100);

    return {
      semaine,
      cycle,
      semaineInCycle: semaineC,
      phase,
      progression,
      label: `Semaine ${semaine} · ${phase.nom}`
    };
  }
};

// Exposer globalement
window.EXERCICES         = EXERCICES;
window.SEANCES_BASE      = SEANCES_BASE;
window.PLANNING_SEMAINE  = PLANNING_SEMAINE;
window.WARMUP            = WARMUP;
window.ETIREMENTS        = ETIREMENTS;
window.Programme         = Programme;

console.log(`✅ Programme chargé — ${Object.keys(EXERCICES).length} exercices, ${Object.keys(SEANCES_BASE).length} séances`);
